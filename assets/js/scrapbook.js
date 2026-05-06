/**
 * scrapbook.js — page-flip controller + intro keyframe crossfade
 *
 * Loaded only on /scrapbook (page-scrapbook.php), conditionally
 * enqueued by tc_ventures_enqueue_scripts() in functions.php.
 *
 * BUILD STATUS — C2a.5:
 *   - Scroll-driven crossfade across the 5 intro keyframes.
 *   - Page-flip controller using pageturner.mp4. Forward (Next)
 *     plays t=3..4 with the SFX. Backward (Prev) steps currentTime
 *     from t=4 back to t=3 via rAF at 2x rate (0.5s total); audio
 *     stays silent in reverse since browsers don't play audio when
 *     currentTime is being mutated rather than naturally advancing.
 *     HTML overlay fade-swaps mid-turn so the video covers the
 *     content swap in either direction.
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
     * continues onto the slideshow wrapper that lives in the same
     * sticky stage (see scrapbook.css — .scrapbook-slideshow opacity
     * tracks the KF5 window so it fades in as the zoomed-in book
     * reaches full opacity).
     * ============================================================ */

    function initIntroCrossfade() {
        const intro = document.querySelector('[data-scrapbook-intro]');
        if (!intro) return;

        const kfs = intro.querySelectorAll('.scrapbook-intro__kf');
        if (kfs.length === 0) return;

        // Slideshow wrapper sits inside the same sticky stage and
        // its opacity tracks KF5 — invisible during early intro,
        // fades in as the zoomed-in book reaches full opacity.
        const slideshow = intro.querySelector('[data-scrapbook-slideshow]');

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
            // Slideshow wrapper tracks KF5's window — same fade-in
            // schedule, same hold-past-end behaviour.
            if (slideshow) {
                slideshow.style.opacity = curveOpacity(progress, windows[windows.length - 1]);
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
     * post-turn static.
     *
     * Forward (Next):
     *   1. Set busy, disable nav.
     *   2. Seek video to TURN_START (t=3), play forward at 1x.
     *   3. At SWAP_AT (t=3.5, mid-turn) — swap .is-active class so
     *      the previous spread fades out and the next fades in.
     *   4. At TURN_END (t=4) — pause, reset to TURN_START, release.
     *
     * Backward (Prev):
     *   1. Set busy, disable nav.
     *   2. Seek video to TURN_END, pause.
     *   3. rAF-step currentTime backward at REVERSE_RATE (2x), so
     *      reverse takes ~0.5s. Negative playbackRate isn't
     *      reliably supported across browsers; manual stepping is
     *      the safe path. Audio stays silent because browsers
     *      don't play audio when currentTime is mutated rather
     *      than naturally advancing.
     *   4. Mid-turn (currentTime <= SWAP_AT) — swap spreads.
     *   5. At TURN_START — release busy.
     *
     * Fallback: if video.play() rejects (autoplay block, decode
     * error), we still swap content so navigation works.
     * ============================================================ */

    function initPageFlip() {
        const root = document.querySelector('[data-scrapbook-slideshow]');
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
        const TURN_START   = 3.0;  // seconds — start of physical motion + SFX
        const SWAP_AT      = 3.5;  // seconds — mid-turn content swap
        const TURN_END     = 4.0;  // seconds — page settled
        const REVERSE_RATE = 2.0;  // backward playback multiplier (0.5s reverse)

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

        function playFlipForward(toIndex) {
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

        function playFlipReverse(toIndex) {
            setBusy(true);

            video.pause();
            try {
                video.currentTime = TURN_END;
            } catch (err) { /* metadata may not be ready — ignore */ }

            let lastTs = performance.now();
            let swapped = false;

            function step(ts) {
                const dt = (ts - lastTs) / 1000;
                lastTs = ts;
                const next = video.currentTime - dt * REVERSE_RATE;
                video.currentTime = Math.max(TURN_START, next);

                if (!swapped && video.currentTime <= SWAP_AT) {
                    setActive(toIndex);
                    swapped = true;
                }

                if (video.currentTime > TURN_START) {
                    requestAnimationFrame(step);
                } else {
                    if (!swapped) setActive(toIndex);
                    setBusy(false);
                }
            }

            requestAnimationFrame(step);
        }

        function flipForward() {
            if (busy || currentIndex >= spreads.length - 1) return;
            playFlipForward(currentIndex + 1);
        }

        function flipBackward() {
            if (busy || currentIndex <= 0) return;
            playFlipReverse(currentIndex - 1);
        }

        prevBtn.addEventListener('click', flipBackward);
        nextBtn.addEventListener('click', flipForward);

        // Sync button state once at boot.
        updateButtons();
    }
})();
