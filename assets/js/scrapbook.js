/**
 * scrapbook.js — page-flip controller + intro keyframe crossfade
 *
 * Loaded only on /scrapbook (page-scrapbook.php), conditionally
 * enqueued by tc_ventures_enqueue_scripts() in functions.php.
 *
 * BUILD STATUS — C2a.9:
 *   - Scroll-driven crossfade across 4 intro keyframes (cover,
 *     half-open, letter, open). The "zoomed-in" beat is the video
 *     element itself, paused at TURN_START — same source pixels
 *     for rest pose and animation, no separate KF5 image.
 *   - Slideshow wrapper opacity fades in over progress 0.78..0.82.
 *     Video stays at opacity 1 whenever the wrapper is visible.
 *   - Forward (Next): plays t=3..6 at 1x with audio (3s).
 *   - Backward (Prev): plays the same forward clip at 1x with the
 *     video horizontally mirrored (scaleX(-1)) — visually reads as
 *     a page turning the other way. Mirror sidesteps the cross-
 *     browser pain of stepping currentTime backward, which doesn't
 *     reliably trigger frame repaints.
 *   - HTML overlay fade-swaps mid-turn so the video covers the
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
     * fades in over the SLIDESHOW_WINDOW range, taking visual
     * ownership of what was KF5's role).
     * ============================================================ */

    function initIntroCrossfade() {
        const intro = document.querySelector('[data-scrapbook-intro]');
        if (!intro) return;

        const kfs = intro.querySelectorAll('.scrapbook-intro__kf');
        if (kfs.length === 0) return;

        // Slideshow wrapper sits inside the same sticky stage. Its
        // opacity follows SLIDESHOW_WINDOW — invisible during the
        // early intro, fades in as KF4 finishes, holds full past
        // end of intro. The video element inside is at opacity 1
        // whenever the wrapper is visible.
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
        ];

        // Slideshow wrapper window — replaces what was KF5's window.
        // The video element (paused at TURN_START) provides the
        // visual content, so no separate KF5 keyframe image needed.
        const SLIDESHOW_WINDOW = [0.78, 0.82, 1.00, 1.00];

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
            if (slideshow) {
                slideshow.style.opacity = curveOpacity(progress, SLIDESHOW_WINDOW);
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
     * pageturner.mp4 is ~6.04s: t=0..3 is a static book pose;
     * t=3..6 is the page turn (audio kicks in over this stretch).
     *
     * The video is the rest pose — paused at TURN_START between
     * flips. Its first/last frames ARE the book at rest, so the
     * static idle and the animation share the exact same source
     * pixels (no fading needed to mask mismatch).
     *
     * Forward (Next):
     *   1. Set busy, disable nav.
     *   2. Seek to TURN_START, play at 1x with audio.
     *   3. At SWAP_AT (mid-turn) — swap .is-active class so the
     *      previous spread fades out and the next fades in.
     *   4. At TURN_END — pause, seek back to TURN_START so the
     *      idle frame is restored; release busy.
     *
     * Backward (Prev): identical to forward, but adds .is-reverse
     *   which applies transform: scaleX(-1) — the page visually
     *   turns the OTHER way. The mirror toggle happens on the
     *   static idle frame which is symmetric (blank book), so it's
     *   imperceptible. Sidesteps the cross-browser pain of stepping
     *   currentTime backward.
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
        //
        // IDLE_FRAME (rest pose) is half a second EARLIER than the
        // playback start so the resting book reads as fully settled
        // — at TURN_START the page is already starting to lift.
        // Playback still begins at TURN_START on click, so the click
        // feels instant; we just seek back to IDLE_FRAME after the
        // animation ends.
        const IDLE_FRAME = 2.5;  // seconds — rest pose (pre-motion static)
        const TURN_START = 3.0;  // seconds — start of physical motion + SFX
        const SWAP_AT    = 4.5;  // seconds — mid-turn content swap (midpoint)
        const TURN_END   = 6.0;  // seconds — page settled (end of clip)

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

        // Idle state: pause the video at IDLE_FRAME (a frame from
        // the truly-static portion before the page begins to lift),
        // so the visible book reads as fully settled. Wait for
        // metadata to be ready before seeking.
        function primeVideo() {
            try {
                video.currentTime = IDLE_FRAME;
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

        // Shared flip routine. Both directions play the same forward
        // clip at 1x with audio. Reverse adds .is-reverse which CSS
        // uses to apply transform: scaleX(-1) — visually mirrors the
        // page-turn so it reads as "going back." The video is at
        // opacity 1 throughout (when the slideshow wrapper is
        // visible), so there's no per-click fade-in/out — just
        // play, swap mid-turn, and reset to idle frame at the end.
        function playFlip(toIndex, direction) {
            setBusy(true);

            const isReverse = direction === 'reverse';
            const turnMs    = (TURN_END - TURN_START) * 1000;
            const swapMs    = (SWAP_AT  - TURN_START) * 1000;

            video.classList.toggle('is-reverse', isReverse);
            video.currentTime = TURN_START;

            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    // Video failed to play — fall back to a plain
                    // swap so navigation isn't broken on autoplay-
                    // blocked browsers.
                    setActive(toIndex);
                    finishFlip();
                });
            }

            // Mid-turn content swap.
            window.setTimeout(function () {
                if (currentIndex !== toIndex) setActive(toIndex);
            }, swapMs);

            // End of turn — pause and seek back to the idle frame.
            window.setTimeout(finishFlip, turnMs);

            function finishFlip() {
                video.pause();
                try {
                    // Seek back to IDLE_FRAME (not TURN_START) so the
                    // rest pose shows the book fully settled, not
                    // mid-lift.
                    video.currentTime = IDLE_FRAME;
                } catch (err) { /* ignore */ }
                video.classList.remove('is-reverse');
                setBusy(false);
            }
        }

        function flipForward() {
            if (busy || currentIndex >= spreads.length - 1) return;
            playFlip(currentIndex + 1, 'forward');
        }

        function flipBackward() {
            if (busy || currentIndex <= 0) return;
            playFlip(currentIndex - 1, 'reverse');
        }

        prevBtn.addEventListener('click', flipBackward);
        nextBtn.addEventListener('click', flipForward);

        // Sync button state once at boot.
        updateButtons();
    }
})();
