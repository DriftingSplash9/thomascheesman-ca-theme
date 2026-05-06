/**
 * scrapbook.js — page-flip controller + intro keyframe crossfade
 *
 * Loaded only on /scrapbook (page-scrapbook.php), conditionally
 * enqueued by tc_ventures_enqueue_scripts() in functions.php.
 *
 * BUILD STATUS — C3a (flat surface rebuild):
 *   - Scroll-driven crossfade across 4 intro keyframes (cover,
 *     half-open, letter, open).
 *   - Slideshow wrapper opacity fades in over SLIDESHOW_WINDOW
 *     (0.78..1.00) — drives the appearance of the flat parchment
 *     surface and the spread content layered on top.
 *   - Page-flip controller: just a spread crossfade. The video
 *     element + idle/turn state machine are gone — the flat
 *     surface doesn't need them. CSS handles the spread fade and
 *     the per-element entrance animations (photo drop, caption).
 *   - Page-turn audio SFX is deferred (needs a standalone audio
 *     file from Thomas).
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
     * The slideshow surface is flat (two parchment pages). Spread
     * navigation is just a CSS-driven crossfade — no video state,
     * no timing constants for video frames.
     *
     * Click sequence:
     *   1. Set busy, disable nav.
     *   2. Move .is-active from current to target spread. CSS
     *      handles the 500ms spread fade and the per-element
     *      entrance animations (photo drop, caption fade).
     *   3. After the longest entrance completes, release busy.
     *
     * Total entrance time = caption_delay (700ms) + caption_transition
     * (500ms) = 1200ms. We give a little slack and use 1300ms.
     *
     * Audio SFX (page-turn) lands when Thomas provides a standalone
     * audio file.
     * ============================================================ */

    function initPageFlip() {
        const root = document.querySelector('[data-scrapbook-slideshow]');
        if (!root) return;

        const pages   = root.querySelector('[data-scrapbook-pages]');
        const prevBtn = root.querySelector('[data-scrapbook-prev]');
        const nextBtn = root.querySelector('[data-scrapbook-next]');
        if (!pages || !prevBtn || !nextBtn) return;

        const spreads = pages.querySelectorAll('.scrapbook-spread');
        if (spreads.length === 0) return;

        // Total time the nav stays disabled while the new spread
        // arrives. Matches the longest entrance animation in the
        // CSS (caption delay 700ms + transition 500ms = 1200ms),
        // plus a small slack.
        const FLIP_MS = 1300;

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

        function playFlip(toIndex) {
            setBusy(true);
            setActive(toIndex);
            window.setTimeout(function () {
                setBusy(false);
            }, FLIP_MS);
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
