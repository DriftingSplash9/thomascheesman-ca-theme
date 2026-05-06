/**
 * scrapbook.js — page-flip controller + intro keyframe crossfade
 *
 * Loaded only on /scrapbook (page-scrapbook.php), conditionally
 * enqueued by tc_ventures_enqueue_scripts() in functions.php.
 *
 * BUILD STATUS — C2a.2:
 *   - Scroll-driven crossfade across the 5 intro keyframes.
 *   - Page-flip controller using pageturner.mp4. Both forward and
 *     backward clicks play the same t=3..4 turn (the SFX-bearing
 *     1-second turn) — the visual is symmetric enough that
 *     reverse-stepping isn't needed, and forward-only playback
 *     keeps the audio synced. HTML overlay fade-swaps mid-turn so
 *     the video covers the content swap.
 *   - Decade-tab nav, letter modal, and page-number easter-egg JS
 *     land in C2c..C6.
 *
 * Keeps its own scope via IIFE; no globals beyond what the harness
 * gives us (window, document).
 */

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', initScrapbook);

    function initScrapbook() {
        initIntroCrossfade();
        initPageFlip();
        // Future inits (C2c+):
        //   initDecadeTabs();
        //   initLetterModal();
        //   initPageNumberEasterEggs();
    }

    /* ============================================================
     * INTRO KEYFRAME CROSSFADE
     * ============================================================
     *
     * The intro region (.scrapbook-intro, 400vh tall) hosts a sticky
     * stage with 5 stacked <img> keyframes. As the user scrolls
     * through the region, scroll progress 0..1 drives per-keyframe
     * opacity windows.
     *
     * Each window is a 4-tuple [a, b, c, d]:
     *   - opacity 0           when progress <  a
     *   - opacity 0..1 (lerp) when a <= progress < b   (fade-in)
     *   - opacity 1           when b <= progress < c   (flat dwell)
     *   - opacity 1..0 (lerp) when c <= progress < d   (fade-out)
     *   - opacity 0           when progress >= d
     *
     * Special case — when c === d, "no fade-out": the keyframe holds
     * at opacity 1 past c indefinitely. Used for KF5 so the zoomed-in
     * image stays visible past the end of the intro and visually
     * continues into the spreads region (which uses the same image
     * as its background, see scrapbook.css).
     * ============================================================ */

    function initIntroCrossfade() {
        const intro = document.querySelector('[data-scrapbook-intro]');
        if (!intro) return;

        const kfs = intro.querySelectorAll('.scrapbook-intro__kf');
        if (kfs.length === 0) return;

        // Per-keyframe windows. Tuned so KF3 (the letter) gets ~50%
        // of the scroll budget for reading time. Adjust here when
        // we tune the intro pacing — keep the windows monotonic and
        // overlap only during fade transitions.
        const windows = [
            [0.00, 0.00, 0.06, 0.10],  // KF1: cover (closed book + objects)
            [0.06, 0.10, 0.16, 0.20],  // KF2: book half-open
            [0.16, 0.20, 0.66, 0.70],  // KF3: letter (long dwell — 50% of intro)
            [0.66, 0.70, 0.78, 0.82],  // KF4: open book, blank pages, desk visible
            [0.78, 0.82, 1.00, 1.00],  // KF5: zoomed-in (no fade-out — holds past end)
        ];

        function curveOpacity(progress, win) {
            const a = win[0], b = win[1], c = win[2], d = win[3];
            if (progress < a) return 0;
            if (progress < b) return b === a ? 1 : (progress - a) / (b - a);
            if (progress < c) return 1;
            // c === d means "hold past c" (no fade-out).
            if (c === d) return 1;
            if (progress < d) return 1 - (progress - c) / (d - c);
            return 0;
        }

        function update() {
            const rect = intro.getBoundingClientRect();
            const total = rect.height - window.innerHeight;
            const scrolled = -rect.top;
            const progress = total > 0
                ? Math.max(0, Math.min(1, scrolled / total))
                : 0;
            for (let i = 0; i < kfs.length; i++) {
                kfs[i].style.opacity = curveOpacity(progress, windows[i]);
            }
        }

        let ticking = false;
        function onScroll() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(function () {
                update();
                ticking = false;
            });
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);

        // Run once at boot to set initial state (handles scroll
        // restoration on page reload landing the user mid-intro).
        update();
    }

    /* ============================================================
     * PAGE-FLIP CONTROLLER
     * ============================================================
     *
     * pageturner.mp4 is ~6.04s: t=0..3 is a static book pose,
     * t=3..4 is the physical page turn (with the SFX), t=4..6 is
     * post-turn static. On every click (forward or backward) we
     * seek to TURN_START and play forward through t=3..4. The
     * visual turn is symmetric enough that reverse-stepping isn't
     * needed, and forward-only playback keeps the audio in sync.
     *
     * Click sequence (both directions):
     *   1. Set busy, disable nav.
     *   2. Seek video to TURN_START, play forward.
     *   3. At SWAP_AT (mid-turn) — swap .is-active class so the
     *      previous spread fades out and the next fades in. The
     *      video's mid-turn moment covers the swap visually.
     *   4. At TURN_END — pause video, reset to TURN_START so the
     *      idle frame matches the new spread's pose. Release busy.
     *
     * Fallback: if video.play() rejects (autoplay block, decode
     * error), we still swap content so navigation works.
     * ============================================================ */

    function initPageFlip() {
        const root = document.querySelector('[data-scrapbook-spreads]');
        if (!root) return;

        const video   = root.querySelector('[data-scrapbook-flipper]');
        const pages   = root.querySelector('[data-scrapbook-pages]');
        const prevBtn = root.querySelector('[data-scrapbook-prev]');
        const nextBtn = root.querySelector('[data-scrapbook-next]');
        if (!video || !pages || !prevBtn || !nextBtn) return;

        const spreads = pages.querySelectorAll('.scrapbook-spread');
        if (spreads.length === 0) return;

        // Video timing constants. Adjust here if the source video's
        // pause / turn timings change in a future revision.
        const TURN_START = 3.0;  // seconds — start of physical motion + SFX
        const SWAP_AT    = 3.5;  // seconds — mid-turn content swap
        const TURN_END   = 4.0;  // seconds — page settled

        let currentIndex = 0;
        let busy = false;

        function updateButtons() {
            prevBtn.disabled = busy || currentIndex <= 0;
            nextBtn.disabled = busy || currentIndex >= spreads.length - 1;
        }

        function setBusy(on) {
            busy = on;
            updateButtons();
        }

        function setActive(toIndex) {
            spreads[currentIndex].classList.remove('is-active');
            spreads[currentIndex].setAttribute('aria-hidden', 'true');
            currentIndex = toIndex;
            spreads[currentIndex].classList.add('is-active');
            spreads[currentIndex].setAttribute('aria-hidden', 'false');
        }

        // Idle state: pause the video at TURN_START so its visible
        // frame matches the static-book pose the HTML overlays sit
        // on top of. Wait for metadata to be ready before seeking.
        function primeVideo() {
            try {
                video.currentTime = TURN_START;
            } catch (err) {
                // currentTime can throw if metadata isn't ready;
                // the loadedmetadata listener below will retry.
            }
            video.pause();
        }

        if (video.readyState >= 1) {
            primeVideo();
        } else {
            video.addEventListener('loadedmetadata', primeVideo, { once: true });
        }

        function playFlip(toIndex) {
            setBusy(true);

            video.currentTime = TURN_START;
            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    // Video failed to play — fall back to a plain
                    // swap so navigation isn't broken on autoplay-
                    // blocked browsers.
                    setActive(toIndex);
                    setBusy(false);
                });
            }

            // Mid-turn content swap.
            window.setTimeout(function () {
                if (currentIndex !== toIndex) setActive(toIndex);
            }, (SWAP_AT - TURN_START) * 1000);

            // End of turn — reset video to idle frame.
            window.setTimeout(function () {
                video.pause();
                video.currentTime = TURN_START;
                setBusy(false);
            }, (TURN_END - TURN_START) * 1000);
        }

        function flipForward() {
            if (busy || currentIndex >= spreads.length - 1) return;
            playFlip(currentIndex + 1);
        }

        function flipBackward() {
            if (busy || currentIndex <= 0) return;
            playFlip(currentIndex - 1);
        }

        prevBtn.addEventListener('click', flipBackward);
        nextBtn.addEventListener('click', flipForward);

        // Sync button state once at boot.
        updateButtons();
    }
})();
