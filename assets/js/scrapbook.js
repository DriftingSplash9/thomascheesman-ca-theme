/**
 * scrapbook.js — page-flip controller + intro keyframe crossfade
 *
 * Loaded only on /scrapbook (page-scrapbook.php), conditionally
 * enqueued by tc_ventures_enqueue_scripts() in functions.php.
 *
 * BUILD STATUS — C1.1:
 *   - Scroll-driven crossfade across the 5 intro keyframes.
 *   - Page-flip mechanic, decade-tab nav, and easter-egg JS for
 *     the page-number variants land in C2..C6.
 *
 * Keeps its own scope via IIFE; no globals beyond what the harness
 * gives us (window, document).
 */

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', initScrapbook);

    function initScrapbook() {
        initIntroCrossfade();
        // Future inits (C2+):
        //   initPageFlip();
        //   initDecadeTabs();
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
})();
