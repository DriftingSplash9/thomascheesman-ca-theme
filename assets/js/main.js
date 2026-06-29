/**
 * TC 'ventures Main JavaScript
 *
 * Two responsibilities right now:
 *   1. Animate the hero on load — split the H1 into characters and stagger
 *      them in, then fade up the subtitle.
 *   2. Reveal sections marked .scroll-animate as they enter the viewport.
 *
 * GSAP and ScrollTrigger are loaded as separate <script> tags via
 * functions.php (wp_enqueue_script). They're guaranteed to be available
 * because main.js declares them as dependencies — see the third arg of
 * wp_enqueue_script('tc-ventures-main', ...).
 */

// Run one init in isolation. Before this guard, the whole chain was a
// single unguarded sequence — one CDN blip (gsap failing to load) threw
// inside an early init and killed everything after it: lightbox, the
// rot13 email reveal, deferred galleries, heritage reveals (review-2
// fragility F1). A failed toy must never take the utilities down.
function tcInit(fn) {
    try {
        fn();
    } catch (e) {
        if (window.console && console.warn) {
            console.warn('[tc] init failed:', fn && fn.name, e);
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // WebGL background is decorative and GPU-heavy on cold start.
    // Defer it until the browser is idle (or 1.5 s max) so the hero +
    // first content paint don't compete with three.js for the main
    // thread. requestIdleCallback isn't in older Safari yet, so fall
    // back to a 400 ms setTimeout — still post-paint, still works.
    // WebGL background (G3): three.js is the single biggest dependency and the
    // background is purely decorative, so we don't download it unless we'll
    // actually paint it. Skip entirely under reduced-motion; otherwise inject
    // the vendored three.js on idle, then init. Fails gracefully if missing.
    function tcLoadWebGLBackground() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        if (typeof THREE !== 'undefined') { tcInit(initWebGLBackground); return; }
        var url = (window.tcVentures && window.tcVentures.threeUrl) || '';
        if (!url) return;
        var s = document.createElement('script');
        s.src = url;
        s.onload = function () { tcInit(initWebGLBackground); };
        s.onerror = function () { console.warn('[TC] three.js failed to load - WebGL bg skipped'); };
        document.head.appendChild(s);
    }
    if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(tcLoadWebGLBackground, { timeout: 1500 });
    } else {
        setTimeout(tcLoadWebGLBackground, 400);
    }
    // Make the skip-link target focusable so activating "Skip to content"
    // moves keyboard focus INTO the main region, not just scrolls to it.
    var tcMain = document.getElementById('primary');
    if (tcMain && !tcMain.hasAttribute('tabindex')) tcMain.setAttribute('tabindex', '-1');
    tcInit(initSiteChrome);
    tcInit(initHeaderNav);
    tcInit(initKineticHero);
    tcInit(initHeroScrollOut);
    // Home-page reveal animations (pillar tumble + blog-card random
    // tumble) intentionally disabled — the user asked for "simple
    // images with none of that". The function bodies remain in this
    // file in case we want to bring them back later.
    // initPillarReveal();
    tcInit(initFamilyTreeReveal);
    tcInit(initFamilyTreeLeaves);
    tcInit(initTreeChipFoil);
    tcInit(initFigureKenBurns);
    tcInit(initLightbox);
    tcInit(initGallerySlideshow);
    tcInit(initDeferredGalleries);
    tcInit(initContactEmail);
    tcInit(initRot13Email);
    tcInit(initPostCarousel);
    tcInit(initEssaySections);
    // initBlogReveal();
    tcInit(initScrollReveals);
    tcInit(initHeritagePage);
    tcInit(initLongreadChapterRail);
    tcInit(initReadingProgress);
    tcInit(initHeritageTreeTilt);
    tcInit(initHeritageTreeFacts);
    tcInit(initFilmReels);
    tcInit(initThomasTOC);
    tcInit(initPersonSpokeTOC);
    tcInit(initFlipbook);
    tcInit(initThomasGalleryHover);
    tcInit(initHeritageNotes);
    tcInit(initInkTrail);
    tcInit(initParticleField);
    tcInit(initMagneticElements);
});

/**
 * Animate the hero title (per-character) and subtitle on page load.
 *
 * Implementation notes:
 * - We split into chars at runtime rather than in PHP, so the source HTML
 *   stays clean and copy-paste-able. Splitting in JS also means we can
 *   gracefully no-op if JS fails to load — text is still readable.
 * - aria-label on the H1 (set in PHP) means screen readers read the full
 *   phrase normally; aria-hidden on each char span keeps them from being
 *   announced one letter at a time.
 * - The animation TARGETS opacity:1 / y:0. The "from" state is set in CSS
 *   (.kinetic-text .char { opacity: 0; transform: translateY(60px); }).
 *   This avoids a flash of un-styled content if JS is slow or blocked.
 */
function initKineticHero() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Generalized selectors — match either the homepage's hero
    // (.hero-title / .hero-subtitle) or any inner page's hero
    // (.page-hero__title / .page-hero__subtitle). The class hooks
    // .kinetic-text and .kinetic-fade are what carry the actual
    // animation contract; the wrapper class names are cosmetic.
    const heroTitle = document.querySelector('.kinetic-text');
    // ALL .kinetic-fade elements, not just the first — the Chef's Pass hero
    // has several (name, deck, menu, CTA, the clipped ticket). The old
    // single-querySelector revealed only the eyebrow and left everything
    // else stuck at opacity:0 (the empty-right-column bug).
    const heroFades = document.querySelectorAll('.kinetic-fade');

    if (!heroTitle) return;

    if (reduceMotion) {
        // CSS @media block already revealed the content. Nothing to do.
        return;
    }

    // Bail BEFORE splitting if gsap never arrived (CDN blip, blocked
    // network): the split hides every char behind opacity:0 waiting for
    // a timeline that would never run — an invisible H1 (review-2 F1).
    if (typeof gsap === 'undefined') return;

    const chars = splitIntoCharSpans(heroTitle);

    const tl = gsap.timeline({ delay: 0.2 });

    tl.to(chars, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.035,
        ease: 'power3.out',
    });

    if (heroFades.length) {
        tl.to(heroFades, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.12, // each fade element trails the last
            ease: 'power2.out',
        }, '-=0.5'); // start 0.5s before the title finishes
    }
}

/**
 * Replace an element's text content with <span class="word"> > <span class="char">
 * structures, one inner span per character. Whitespace is preserved as
 * plain text nodes so words wrap cleanly on small screens.
 *
 * Returns the flat list of char spans for the caller to animate.
 */
function splitIntoCharSpans(element) {
    const text = element.textContent.trim();
    // A11Y-3: the char spans created below are each aria-hidden, so once we
    // empty the element the heading would have NO accessible name. The home
    // hero sets aria-label in PHP; inner-page heroes (page-hero__title) don't
    // — so self-heal here to guarantee every kinetic heading keeps its full
    // phrase for screen readers (axe empty-heading fix). Won't clobber a
    // label already set in PHP.
    if (!element.hasAttribute('aria-label')) {
        element.setAttribute('aria-label', text);
    }
    element.textContent = '';
    const chars = [];

    // Split on runs of whitespace, keeping the whitespace tokens so we can
    // re-emit them as text nodes between word containers.
    const tokens = text.split(/(\s+)/);

    for (const token of tokens) {
        if (token === '') continue;

        if (/^\s+$/.test(token)) {
            element.appendChild(document.createTextNode(token));
            continue;
        }

        const wordSpan = document.createElement('span');
        wordSpan.className = 'word';

        for (const char of token) {
            const charSpan = document.createElement('span');
            charSpan.className = 'char';
            charSpan.textContent = char;
            charSpan.setAttribute('aria-hidden', 'true');
            wordSpan.appendChild(charSpan);
            chars.push(charSpan);
        }

        element.appendChild(wordSpan);
    }

    return chars;
}

/**
 * Hero scroll-out — as the user scrolls past the hero, the whole section
 * scales up to 1.2 and fades to opacity 0. Scrub-tied to scroll position
 * so the effect is interactive (reverses if you scroll back up).
 *
 * Visual intent: feels like you're zooming through the hero into the
 * world below. Because the WebGL background and particle field are
 * fixed at z-index:-1, they persist during the fade — what disappears
 * is the hero's gradient + kinetic title, while the living backdrop
 * stays put. The cursor and ink trail (z-index:9999+) also persist on
 * top throughout.
 *
 * Range: 'top top' (hero's top reaches viewport top) to 'bottom top'
 * (hero's bottom reaches viewport top) — i.e., the duration of one
 * full hero height of scrolling. ease: 'power2.in' makes the fade
 * slow at first then accelerate, so the "punching through" moment
 * feels decisive at the end.
 *
 * scrub: 1 = 1-second smoothing buffer between scroll input and
 * animation output, so fast scrolls don't snap.
 *
 * Sit-out condition: prefers-reduced-motion or no .hero-section.
 */
function initHeroScrollOut() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const hero = document.querySelector('.hero-section');
    if (!hero) return;

    gsap.to(hero, {
        scale: 1.2,
        opacity: 0,
        ease: 'power2.in',
        scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
        },
    });
}

/**
 * Choreographed reveal for the pillars section.
 *
 * Three overlapping waves trigger when the section enters the viewport:
 *   1. The H2 splits per-character and cascades in (same helper as the
 *      hero, but driven by ScrollTrigger instead of on load).
 *   2. The three pillar cards slide up + scale in, each tilted at a
 *      slightly different angle (-6° / 0° / +6°) so they read as
 *      choreographed instead of synchronous. Stagger of 150ms.
 *   3. The circular gradient icons pop last with a back-out overshoot
 *      from scale(0) + rotate(-120°). Stagger of 120ms.
 *
 * Timeline overlap is set with negative position offsets ('-=0.3', '-=0.5')
 * so each wave starts before the previous finishes. Total reveal ~1.6s.
 *
 * Pre-set initial states are applied via gsap.set() outside the timeline
 * so they're in place at script execution. The ScrollTrigger then plays
 * the timeline once when the section's top crosses 75% of viewport height.
 */
function initPillarReveal() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const section = document.querySelector('.pillars-section');
    if (!section) return;

    const heading = section.querySelector('.kinetic-text-scroll');
    const cards = section.querySelectorAll('.pillar-card');
    const icons = section.querySelectorAll('.pillar-icon');

    if (cards.length === 0) return;

    // Pre-split the heading so chars exist before the trigger fires.
    let headingChars = [];
    if (heading) {
        headingChars = splitIntoCharSpans(heading);
    }

    // Per-card initial rotation. Asymmetric so they don't arrive in formation.
    const cardRotations = [-9, 3, 12];

    cards.forEach((card, i) => {
        gsap.set(card, {
            opacity: 0,
            y: 80,
            scale: 0.9,
            rotation: cardRotations[i] !== undefined ? cardRotations[i] : 0,
        });
    });

    gsap.set(icons, { scale: 0, rotation: -120 });

    // Build the timeline as paused so we can decide WHEN to play it
    // (immediate if section is already in view on load, or via scroll trigger).
    //
    // onComplete clears the inline transform GSAP leaves on each card/icon
    // after animating. Without this, CSS :hover { transform: translateY(-12px) }
    // can't override the inline `transform: translate(0,0) scale(1) rotate(0)`
    // and the lift-on-hover effect doesn't fire.
    const tl = gsap.timeline({
        paused: true,
        onComplete: () => {
            gsap.set(cards, { clearProps: 'transform' });
            gsap.set(icons, { clearProps: 'transform' });
        },
    });

    if (headingChars.length) {
        tl.to(headingChars, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.025,
            ease: 'power3.out',
        });
    }

    tl.to(cards, {
        opacity: 1,
        y: 0,
        scale: 1,
        rotation: 0,
        duration: 0.95,
        stagger: 0.25,
        ease: 'back.out(1.4)',
    }, '-=0.3');

    // Icon "wobble" — three back-easing phases overlapped into one continuous
    // motion. Phase 1 springs in past target, phase 2 pulls back slightly,
    // phase 3 settles. Position '+=0.15' on the first phase makes icons wait
    // a clear beat AFTER the last card finishes settling, so the two
    // movements read as sequential rather than concurrent.
    tl.to(icons, {
        scale: 1,
        rotation: 0,
        duration: 0.55,
        stagger: 0.12,
        ease: 'back.out(2.25)',
    }, '+=0.15');

    tl.to(icons, {
        scale: 0.94,
        rotation: 8,
        duration: 0.22,
        stagger: 0.12,
        ease: 'back.in(1.75)',
    }, '-=0.15');

    tl.to(icons, {
        scale: 1,
        rotation: 0,
        duration: 0.28,
        stagger: 0.12,
        ease: 'back.out(1.25)',
    }, '-=0.08');

    // Trigger logic.
    //   - On page load: if the section's top is already within 75% of viewport
    //     (visible enough to be worth animating right away), fire now.
    //   - Otherwise: wait for the user to scroll until the section's top
    //     passes 40% of viewport. The previous 60% threshold fired before
    //     the user had time to look at the section.
    const rect = section.getBoundingClientRect();
    const visibleOnLoad = rect.top < window.innerHeight * 0.75;

    if (visibleOnLoad) {
        tl.play();
    } else {
        ScrollTrigger.create({
            trigger: section,
            start: 'top 40%',
            once: true,
            onEnter: () => tl.play(),
        });
    }
}

/**
 * Decelerated tumble reveal for the blog section's post cards.
 *
 * Each card rises 100px from below + rotates back to 0° from a random
 * starting angle in [-18°, +18°]. Per-card random angles mean no two
 * tumbles look identical — every load has a different shape.
 *
 * Sequence is also randomized per load (Fisher-Yates shuffle) so the
 * reveal order surprises on every visit.
 *
 * Easing: power3.out — fast at first, gentle settle. Less dramatic than
 * power4.out so the tumble has more time to read.
 *
 * Same trigger logic as the pillar reveal (immediate on load if visible,
 * otherwise scroll-triggered). onComplete clears inline transforms so
 * the CSS hover lift on .post-card works after the reveal finishes.
 */
function initBlogReveal() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const section = document.querySelector('.blog-section');
    if (!section) return;

    const cards = section.querySelectorAll('.post-card');
    if (cards.length === 0) return;

    // Each card gets its own random starting angle in [-18°, +18°].
    cards.forEach((card) => {
        const rotation = (Math.random() - 0.5) * 36;
        gsap.set(card, {
            opacity: 0,
            y: 100,
            rotation,
        });
    });

    // Fisher-Yates shuffle for a uniformly random reveal order. Sort with
    // a random comparator works visually for small N but is biased; this
    // is the same number of lines and unbiased.
    const ordered = Array.from(cards);
    for (let i = ordered.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
    }

    const tl = gsap.timeline({
        paused: true,
        onComplete: () => {
            gsap.set(cards, { clearProps: 'transform' });
        },
    });

    tl.to(ordered, {
        opacity: 1,
        y: 0,
        rotation: 0,
        duration: 0.95,
        stagger: 0.15,
        ease: 'power3.out',
    });

    const rect = section.getBoundingClientRect();
    const visibleOnLoad = rect.top < window.innerHeight * 0.75;

    if (visibleOnLoad) {
        tl.play();
    } else {
        ScrollTrigger.create({
            trigger: section,
            start: 'top 60%',
            once: true,
            onEnter: () => tl.play(),
        });
    }
}

/**
 * Family Tree reveal — animate the eight chips on /family into place.
 *
 * Two overlapping phases per chip:
 *   1. Fade in (opacity 0 → 1) over 1.2s with 'power1.out' easing
 *   2. Settle (translate Y + rotation to 0) over 1.1s with 'power2.out'
 * The settle starts 0.5s into the fade so the chip is still arriving
 * visually as the position locks in — reads as "fade in as they rotate
 * into place" rather than two discrete movements.
 *
 * Each chip starts at a random rotation in [-10°, +10°] so no two
 * reveals look identical. xPercent/yPercent baseline preserves the
 * CSS centering (transform: translate(-50%, -50%)) through the
 * GSAP-composed transform string. onComplete clears the inline
 * transform so the CSS hover lift composes cleanly afterward.
 *
 * Trigger logic mirrors the pillar/blog reveals — fire immediately
 * if visible on load, otherwise wait for ScrollTrigger.
 */
function initFamilyTreeReveal() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const section = document.querySelector('.family-tree-section');
    if (!section) return;

    const chips = section.querySelectorAll('.tree-chip');
    if (chips.length === 0) return;

    chips.forEach((chip) => {
        const rotation = (Math.random() - 0.5) * 20;
        gsap.set(chip, {
            xPercent: -50,
            yPercent: -50,
            opacity: 0,
            y: 30,
            rotation,
        });
    });

    const tl = gsap.timeline({
        paused: true,
        onComplete: () => {
            gsap.set(chips, { clearProps: 'transform' });
        },
    });

    tl.to(chips, {
        opacity: 1,
        duration: 1.2,
        stagger: 0.15,
        ease: 'power1.out',
    }, 0);

    // Slide-into-position runs SIMULTANEOUSLY with the fade (both
    // anchored at t=0) — fade and settle are concurrent per chip.
    tl.to(chips, {
        xPercent: -50,
        yPercent: -50,
        y: 0,
        rotation: 0,
        duration: 1.1,
        stagger: 0.15,
        ease: 'power2.out',
    }, 0);

    const rect = section.getBoundingClientRect();
    const visibleOnLoad = rect.top < window.innerHeight * 0.75;

    if (visibleOnLoad) {
        tl.play();
    } else {
        ScrollTrigger.create({
            trigger: section,
            start: 'top 70%',
            once: true,
            onEnter: () => tl.play(),
        });
    }
}

/**
 * Holographic foil-tilt hover for the family-tree flag chips.
 *
 * As the cursor moves over a chip, the chip tilts in 3D toward the cursor
 * (rotateX/rotateY) and a specular glare + faint rainbow sheen tracks the
 * pointer — like a premium holographic trading card. This is layered ON TOP
 * of the existing rustle + falling-leaves interactions, not a replacement.
 *
 * Implementation:
 *   - We write only CSS custom properties (--rx/--ry for the tilt angles,
 *     --mx/--my for the glare position). We never touch the chip's inline
 *     `transform`, so this composes cleanly with the GSAP entrance reveal
 *     (which animates and then clears the inline transform) and with the
 *     CSS hover lift/scale that read the same vars.
 *   - Sits out for reduced-motion and coarse/no-hover pointers (touch),
 *     where a cursor-tracked tilt has nothing to track.
 */
function initTreeChipFoil() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Needs a fine pointer that can hover (mouse/trackpad). Touch sits out.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const chips = document.querySelectorAll('.family-tree-section .tree-chip');
    if (!chips.length) return;

    // Max tilt in degrees at the chip edges.
    const MAX_TILT = 14;

    chips.forEach((chip) => {
        chip.addEventListener('mousemove', (e) => {
            // Drop the slow-return mode while actively tracking so the tilt
            // follows the cursor crisply.
            chip.classList.remove('is-foil-resetting');
            const rect = chip.getBoundingClientRect();
            // px/py: cursor position within the chip, 0..1.
            const px = (e.clientX - rect.left) / rect.width;
            const py = (e.clientY - rect.top) / rect.height;
            // Tilt toward the cursor: right edge tips right, top edge tips back.
            const ry = (px - 0.5) * 2 * MAX_TILT;
            const rx = (0.5 - py) * 2 * MAX_TILT;
            chip.style.setProperty('--ry', ry.toFixed(2) + 'deg');
            chip.style.setProperty('--rx', rx.toFixed(2) + 'deg');
            chip.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
            chip.style.setProperty('--my', (py * 100).toFixed(1) + '%');
        });
        chip.addEventListener('mouseleave', () => {
            // Switch to the slower transition so the chip eases gently back
            // to its resting (flat) state instead of snapping.
            chip.classList.add('is-foil-resetting');
            chip.style.setProperty('--rx', '0deg');
            chip.style.setProperty('--ry', '0deg');
            chip.style.setProperty('--mx', '50%');
            chip.style.setProperty('--my', '50%');
        });
    });
}

/**
 * Falling-leaves system for the family tree.
 *
 * Two interactions:
 *   - Hover a chip: 3-5 leaves drift down from the canopy area
 *     (cooled down 800ms between consecutive hovers on the same chip
 *     so frantic mouse movement doesn't spam the system).
 *   - Click a chip: 10 leaves cascade in quick succession, the page
 *     dims via a fixed-position overlay, and after 700ms the browser
 *     navigates to the chip's destination. Reads as one continuous
 *     "you plucked a branch and the tree is settling" motion.
 *
 * Implementation notes:
 *   - 24-leaf pool created on init and reused. Each leaf carries a
 *     compact teardrop SVG with a center vein, colored via inline
 *     style so we can vary greens and a hint of autumn-yellow.
 *   - Pool container is fixed-position covering the viewport so
 *     leaves fall past the family-tree section's boundaries.
 *   - GSAP timeline per leaf: fade in over 0.3s, drift down + rotate
 *     over 2.6-4s with random X drift and rotation, fade out at the
 *     end. force3D keeps it on the GPU.
 *   - reduced-motion preference disables the whole system; chips
 *     fall back to default click behaviour (instant navigation).
 */
function initFamilyTreeLeaves() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const section = document.querySelector('.family-tree-section');
    if (!section) return;

    const tree = section.querySelector('.family-tree');
    const chips = section.querySelectorAll('.tree-chip');
    if (!tree || chips.length === 0) return;

    const POOL_SIZE = 24;
    const LEAF_COLORS = ['#5a8c3e', '#6b9d3e', '#7ba74a', '#8fb850', '#9bc564', '#b58642'];

    // Compact teardrop leaf with a center vein. Uses fill="currentColor"
    // so each leaf instance can be tinted via inline style.color.
    const LEAF_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" fill="currentColor">'
        + '<path d="M12 2 C 6 6 3 14 5 24 C 6 27 8 29 11 28 L 12 27 L 13 28 C 16 29 18 27 19 24 C 21 14 18 6 12 2 Z"/>'
        + '<line x1="12" y1="4" x2="12" y2="29" stroke="rgba(0,0,0,0.3)" stroke-width="0.7" stroke-linecap="round"/>'
        + '</svg>';

    const pool = document.createElement('div');
    pool.className = 'tree-leaf-pool';
    document.body.appendChild(pool);

    const leaves = [];
    for (let i = 0; i < POOL_SIZE; i++) {
        const leaf = document.createElement('span');
        leaf.className = 'tree-leaf';
        leaf.innerHTML = LEAF_SVG;
        leaf.style.display = 'none';
        pool.appendChild(leaf);
        leaves.push({ el: leaf, busy: false });
    }

    const overlay = document.createElement('div');
    overlay.className = 'tree-click-overlay';
    document.body.appendChild(overlay);

    // Clear the dim overlay when the page is restored from the
    // browser's back-forward cache. Without this, the overlay class
    // added on a chip click stays "active" through bfcache, so
    // navigating back to /family from a sub-page shows the family
    // page underneath the dim wash. pageshow fires both on initial
    // load and on bfcache restore, so a single listener handles both.
    window.addEventListener('pageshow', () => {
        overlay.classList.remove('tree-click-overlay--active');
    });

    // The inner <img> has no base transform (its centering lives on
    // .family-tree__core), so GSAP can rotate it freely for the rustle.
    const treeImg = section.querySelector('.family-tree__image');

    function dropLeaf(startX, startY) {
        const slot = leaves.find((l) => !l.busy);
        if (!slot) return;
        slot.busy = true;
        const leaf = slot.el;

        const driftX = (Math.random() - 0.5) * 240;
        const fallY = window.innerHeight - startY + 120;
        const rotEnd = (Math.random() - 0.5) * 720;
        const duration = 1.5 + Math.random() * 1.0;
        const color = LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)];
        const size = 8 + Math.floor(Math.random() * 7);

        leaf.style.color = color;
        leaf.style.fontSize = size + 'px';
        leaf.style.left = startX + 'px';
        leaf.style.top = startY + 'px';
        leaf.style.display = 'block';

        gsap.set(leaf, {
            xPercent: -50,
            yPercent: -50,
            opacity: 0,
            x: 0,
            y: 0,
            rotation: Math.random() * 360,
            scale: 0.7,
            force3D: true,
        });

        const tl = gsap.timeline({
            onComplete: () => {
                slot.busy = false;
                leaf.style.display = 'none';
            },
        });

        tl.to(leaf, {
            opacity: 1,
            scale: 1,
            duration: 0.3,
            ease: 'power1.out',
        });

        tl.to(leaf, {
            xPercent: -50,
            yPercent: -50,
            x: driftX,
            y: fallY,
            rotation: rotEnd,
            duration: duration,
            ease: 'none',
        }, 0);

        tl.to(leaf, {
            opacity: 0,
            duration: 0.4,
            ease: 'power1.in',
        }, duration * 0.6);
    }

    function dropLeavesFromCanopy(count, intervalMs) {
        const treeRect = tree.getBoundingClientRect();
        // Canopy zone: upper 10-55% of the tree container, with the
        // horizontal spread roughly matching where the painted canopy
        // sits in the tree image.
        const canopyTop = treeRect.top + treeRect.height * 0.10;
        const canopyHeight = treeRect.height * 0.45;
        const canopyLeft = treeRect.left + treeRect.width * 0.20;
        const canopyWidth = treeRect.width * 0.60;

        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const sx = canopyLeft + Math.random() * canopyWidth;
                const sy = canopyTop + Math.random() * canopyHeight;
                dropLeaf(sx, sy);
            }, i * intervalMs);
        }
    }

    chips.forEach((chip) => {
        let hoverCooldown = 0;

        chip.addEventListener('mouseenter', () => {
            const now = Date.now();
            if (now - hoverCooldown < 800) return;
            hoverCooldown = now;
            const count = 1 + Math.floor(Math.random() * 2);
            dropLeavesFromCanopy(count, 180);
        });

        chip.addEventListener('click', (e) => {
            e.preventDefault();
            const href = chip.getAttribute('href');
            if (!href) return;

            const clickCount = 5 + Math.floor(Math.random() * 3);
            dropLeavesFromCanopy(clickCount, 60);
            overlay.classList.add('tree-click-overlay--active');

            // One-beat trunk sway: ~2.5° out, settle back. Reads as
            // "the branch you plucked is settling."
            if (treeImg) {
                gsap.timeline()
                    .to(treeImg, { rotation: -2.5, duration: 0.18, ease: 'sine.out' })
                    .to(treeImg, { rotation: 0, duration: 0.42, ease: 'sine.inOut' });
            }

            setTimeout(() => {
                window.location.href = href;
            }, 500);
        });
    });
}

/**
 * Per-page lightbox using PhotoSwipe v5.
 *
 * Wraps every editorial <img> inside <main> in an <a> with
 * data-pswp-width / -height so PhotoSwipe can pick it up. Skipped:
 *   - images already inside an <a> (heritage hub cards link to spokes —
 *     clicking should navigate, not open a lightbox)
 *   - .family-tree__image (UI element, not editorial)
 *   - anything tagged .no-lightbox (escape hatch)
 *
 * The gallery is scoped to #primary, so prev/next cycles only through
 * the photos on the current page — not site-wide.
 *
 * Editorial customization (custom UI elements registered post-init):
 *   - tc-counter: zero-padded "01 / 08" in the editorial serif
 *   - tc-caption: image alt text shown as a subtle italic caption
 *
 * PhotoSwipe core JS is dynamically imported (only fetched at init).
 * If it fails to load (network blip, CDN issue), the wrapped anchors
 * fall back to opening the image URL in a new tab.
 */
// Wraps one <img> in an <a class="lightbox-link"> so PhotoSwipe picks
// it up. Shared by initLightbox (page load) and initDeferredGalleries
// (images that go live only when a collapsed photo wall is opened).
// Returns true if the img was wrapped.
function tcWrapImgForLightbox(img) {
    if (img.classList.contains('no-lightbox')) return false;
    if (img.classList.contains('family-tree__image')) return false;
    // Skip if the img is anywhere inside an <a> — covers heritage hub
    // cards (<a><div><img></div></a>) where the immediate parent is
    // a div, not the anchor itself.
    if (img.closest('a')) return false;

    const a = document.createElement('a');
    a.className = 'lightbox-link';
    // Gallery imgs with srcset carry data-tc-full (the full-size URL):
    // currentSrc would be whichever SMALL candidate the browser picked
    // for the grid cell, and the lightbox should open the real photo.
    a.href = img.dataset.tcFull || img.currentSrc || img.src;
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    img.parentNode.insertBefore(a, img);
    a.appendChild(img);

    if (img.dataset.tcFullw && img.dataset.tcFullh) {
        // Renderer-supplied true dimensions — with srcset, naturalWidth
        // reports the loaded candidate's size, which would open soft.
        a.setAttribute('data-pswp-width', img.dataset.tcFullw);
        a.setAttribute('data-pswp-height', img.dataset.tcFullh);
    } else {
        const updateDims = () => {
            if (img.naturalWidth > 0) {
                a.setAttribute('data-pswp-width', img.naturalWidth);
                a.setAttribute('data-pswp-height', img.naturalHeight);
            }
        };
        if (img.complete && img.naturalWidth > 0) {
            updateDims();
        } else {
            img.addEventListener('load', updateDims, { once: true });
        }
    }

    return true;
}

function initLightbox() {
    const candidates = document.querySelectorAll('main img');
    if (candidates.length === 0) return;

    let wrappedCount = 0;
    candidates.forEach((img) => {
        if (tcWrapImgForLightbox(img)) wrappedCount += 1;
    });

    if (wrappedCount === 0) return;

    tcEnsurePhotoSwipe();
}

// Idempotent loader for the PhotoSwipe lightbox instance. Called by
// initLightbox at page load, and again by initDeferredGalleries in
// the (rare) case a page's only images live inside a collapsed wall.
let tcPhotoSwipeRequested = false;
function tcEnsurePhotoSwipe() {
    if (tcPhotoSwipeRequested) return;
    tcPhotoSwipeRequested = true;

    // PhotoSwipe v5 ESM, self-hosted from the theme (PERF-1) — URLs come
    // from window.tcVentures (localised in functions.php), same as threeUrl.
    const pswpLightboxUrl = (window.tcVentures && window.tcVentures.pswpLightboxUrl) || '';
    const pswpUrl = (window.tcVentures && window.tcVentures.pswpUrl) || '';

    import(pswpLightboxUrl)
        .then(({ default: PhotoSwipeLightbox }) => {
            const lightbox = new PhotoSwipeLightbox({
                gallery: '#primary',
                children: 'a.lightbox-link[data-pswp-width]',
                pswpModule: () => import(pswpUrl),
                // bgOpacity 1.0 leaves the .pswp__bg element fully opaque
                // so its backdrop-filter (blur 8px) renders cleanly. The
                // visible transparency comes from the rgba() bg color
                // in CSS instead.
                bgOpacity: 1,
                showHideAnimationType: 'fade',
                // Mouse wheel / trackpad scroll zooms toward cursor
                // instead of panning. Native PhotoSwipe option.
                wheelToZoom: true,
            });

            lightbox.on('uiRegister', () => {
                // Editorial counter: "01 / 08" in the site's serif.
                // Default counter is hidden via CSS.
                lightbox.pswp.ui.registerElement({
                    name: 'tc-counter',
                    order: 5,
                    isButton: false,
                    appendTo: 'bar',
                    onInit: (el, pswp) => {
                        const update = () => {
                            const idx = String(pswp.currIndex + 1).padStart(2, '0');
                            const total = String(pswp.getNumItems()).padStart(2, '0');
                            el.innerText = `${idx} / ${total}`;
                        };
                        pswp.on('change', update);
                        update();
                    },
                });

                // Caption from img alt text. Empty alt = no caption shown.
                lightbox.pswp.ui.registerElement({
                    name: 'tc-caption',
                    order: 9,
                    isButton: false,
                    appendTo: 'root',
                    onInit: (el, pswp) => {
                        const update = () => {
                            const slide = pswp.currSlide;
                            const link = slide && slide.data && slide.data.element;
                            const img = link && link.querySelector ? link.querySelector('img') : null;
                            const text = ((img && img.alt) || '').trim();
                            el.innerText = text;
                            el.style.opacity = text ? '1' : '0';
                        };
                        pswp.on('change', update);
                        update();
                    },
                });

                // Download button — anchor element with the download
                // attribute so the browser saves the file instead of
                // navigating. Uses isCustomSVG so PhotoSwipe wraps it
                // in its standard .pswp__icn structure and the icon
                // sits at the same size/baseline as the close button.
                lightbox.pswp.ui.registerElement({
                    name: 'tc-download',
                    order: 8,
                    isButton: true,
                    tagName: 'a',
                    html: {
                        isCustomSVG: true,
                        inner: '<path d="M16 5 V21 M10 15 L16 21 L22 15 M8 27 H24" id="pswp__icn-download" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
                        outlineID: 'pswp__icn-download',
                    },
                    onInit: (el, pswp) => {
                        el.setAttribute('download', '');
                        el.setAttribute('target', '_blank');
                        el.setAttribute('rel', 'noopener');
                        el.setAttribute('aria-label', 'Download image');
                        el.setAttribute('title', 'Download image');
                        const update = () => {
                            const src = pswp.currSlide && pswp.currSlide.data && pswp.currSlide.data.src;
                            if (src) el.href = src;
                        };
                        pswp.on('change', update);
                        update();
                    },
                });
            });

            lightbox.init();
            // Stash the instance so the gallery slideshow handler
            // (initGallerySlideshow below) can drive it programmatically.
            tcLightboxInstance = lightbox;
            // Whenever the lightbox closes by any means (Esc, click X,
            // pinch-out, etc.), make sure any active autoplay timer is
            // cleared too — otherwise the next time the user opens the
            // lightbox manually it would start auto-advancing.
            lightbox.on('close', tcStopGallerySlideshow);
        })
        .catch((err) => {
            console.warn('PhotoSwipe failed to load — image clicks fall back to direct image URLs.', err);
        });
}

/* =====================================================================
   Contact page — email address decode + click-to-copy.
   The /contact page renders the email as a rot13'd string in source
   so harvester bots that scrape `mailto:` patterns or @-bearing
   strings get gibberish. On DOMContentLoaded we decode it for real
   visitors. Clicking the address copies it to the clipboard and
   flashes a "Copied!" confirmation.
   ===================================================================== */
function initContactEmail() {
    const button = document.querySelector('button.tc-contact-card__address[data-tc-email-rot13]');
    if (!button) return;

    function rot13(s) {
        return s.replace(/[A-Za-z]/g, (c) => {
            const base = c <= 'Z' ? 65 : 97;
            return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
        });
    }

    const address = rot13(button.dataset.tcEmailRot13 || '');
    if (!address) return;

    const addressSpan = button.querySelector('.tc-contact-card__address-text');
    const actionSpan  = button.querySelector('.tc-contact-card__action');

    // Reveal the real address in place of the rot13'd source text.
    if (addressSpan) addressSpan.textContent = address;

    let resetTimer = 0;

    button.addEventListener('click', async () => {
        let copied = false;
        try {
            // navigator.clipboard requires a secure context (https) and
            // a user gesture, both of which we have. Falls back to the
            // execCommand path for older browsers.
            await navigator.clipboard.writeText(address);
            copied = true;
        } catch (e) {
            try {
                const ta = document.createElement('textarea');
                ta.value = address;
                ta.style.position = 'fixed';
                ta.style.top = '-1000px';
                document.body.appendChild(ta);
                ta.select();
                copied = document.execCommand('copy');
                document.body.removeChild(ta);
            } catch (e2) {
                copied = false;
            }
        }

        if (actionSpan) {
            actionSpan.textContent = copied ? 'Copied!' : 'Press Ctrl+C to copy';
            button.setAttribute('data-copied', copied ? 'true' : 'false');
        }

        // Reset the action label after a moment so the button is ready
        // for another copy without a stale "Copied!" lingering.
        if (resetTimer) clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
            if (actionSpan) actionSpan.textContent = 'Click to copy';
            button.removeAttribute('data-copied');
        }, 2200);
    });
}

/* =====================================================================
   Generic rot13 email reveal — used where the address is shown inline
   in editorial prose (the /about and /hcs sign-offs) rather than in the
   full contact card. Any element with data-tc-rot13 carries the address
   rot13'd in source so harvester bots see gibberish; on load we decode
   it in place for real visitors.
   ===================================================================== */
function initRot13Email() {
    function rot13(s) {
        return s.replace(/[A-Za-z]/g, (c) => {
            const base = c <= 'Z' ? 65 : 97;
            return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
        });
    }
    document.querySelectorAll('[data-tc-rot13]').forEach((el) => {
        const decoded = rot13(el.getAttribute('data-tc-rot13') || '');
        if (decoded) el.textContent = decoded;
    });
}

/* =====================================================================
   Read-next carousel — horizontal scroll-snapped strip of post cards
   at the foot of every single post (single.php / .post-carousel). The
   prev/next arrows scroll the track; each arrow hides at its end.
   ===================================================================== */
function initPostCarousel() {
    document.querySelectorAll('.post-carousel').forEach((carousel) => {
        const track = carousel.querySelector('.post-carousel__track');
        const prev  = carousel.querySelector('.post-carousel__arrow--prev');
        const next  = carousel.querySelector('.post-carousel__arrow--next');
        if (!track || !prev || !next) return;

        function step() {
            const card  = track.querySelector('.post-carousel__item');
            const cardW = card ? card.getBoundingClientRect().width : 260;
            return Math.min(track.clientWidth * 0.85, (cardW + 18) * 2);
        }
        function maxScroll() {
            return Math.max(0, track.scrollWidth - track.clientWidth);
        }
        function update() {
            prev.hidden = track.scrollLeft <= 2;
            next.hidden = track.scrollLeft >= maxScroll() - 2;
        }
        // Manual rAF glide — native scrollBy({behavior:'smooth'}) does
        // not move this flex/overflow track reliably, so animate
        // scrollLeft ourselves with an ease-out curve.
        let raf = 0;
        function glideTo(target) {
            target = Math.max(0, Math.min(target, maxScroll()));
            const start = track.scrollLeft;
            const dist  = target - start;
            if (Math.abs(dist) < 1) return;
            const dur = 380;
            let t0 = 0;
            cancelAnimationFrame(raf);
            function frame(ts) {
                if (!t0) t0 = ts;
                const p = Math.min(1, (ts - t0) / dur);
                track.scrollLeft = start + dist * (1 - Math.pow(1 - p, 3));
                if (p < 1) raf = requestAnimationFrame(frame);
            }
            raf = requestAnimationFrame(frame);
        }
        prev.addEventListener('click', () => glideTo(track.scrollLeft - step()));
        next.addEventListener('click', () => glideTo(track.scrollLeft + step()));
        track.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        update();
    });
}

/* =====================================================================
   Essay collapsibles — the "Proud Of Canada" essay (.mc-essay) breaks
   into <details> sections. Clicking a contents card opens its target
   section before the browser's native #anchor jump scrolls to it; a
   deep link (/#sec-…) opens that section on load.
   ===================================================================== */
function initEssaySections() {
    if (!document.querySelector('.mc-section')) return;

    document.querySelectorAll('.mc-card[href^="#sec-"]').forEach((link) => {
        link.addEventListener('click', () => {
            const target = document.getElementById(link.getAttribute('href').slice(1));
            if (target && target.tagName === 'DETAILS') target.open = true;
        });
    });

    if (location.hash.indexOf('#sec-') === 0) {
        const target = document.getElementById(location.hash.slice(1));
        if (target && target.tagName === 'DETAILS') {
            target.open = true;
            target.scrollIntoView();
        }
    }
}

/* =====================================================================
   Gallery slideshow — drives the sitewide PhotoSwipe lightbox in
   autoplay mode from a "▶ Play as slideshow" button rendered at the
   top of long photo galleries (per-kid spoke pages, currently).
   ===================================================================== */

// Module-scope holders. tcLightboxInstance is set inside initLightbox's
// async PhotoSwipe import callback above; tcAutoplayTimerId is the
// setInterval handle for whichever slideshow is currently running.
let tcLightboxInstance = null;
let tcAutoplayTimerId = null;

function tcStopGallerySlideshow() {
    if (tcAutoplayTimerId) {
        clearInterval(tcAutoplayTimerId);
        tcAutoplayTimerId = null;
    }
    document.querySelectorAll('.tc-photo-gallery__slideshow-btn[data-active="true"]')
        .forEach((b) => b.removeAttribute('data-active'));
}

function tcStartGallerySlideshowAutoplay(holdMs, btn) {
    tcStopGallerySlideshow();
    if (btn) btn.setAttribute('data-active', 'true');
    tcAutoplayTimerId = setInterval(() => {
        if (tcLightboxInstance && tcLightboxInstance.pswp) {
            tcLightboxInstance.pswp.next();
        } else {
            tcStopGallerySlideshow();
        }
    }, holdMs);
}

function initGallerySlideshow() {
    const buttons = document.querySelectorAll('.tc-photo-gallery__slideshow-btn');
    if (buttons.length === 0) return;

    buttons.forEach(tcBindSlideshowBtn);
}

// Per-button slideshow wiring — split out of initGallerySlideshow so
// initDeferredGalleries can bind buttons that only enter the DOM when
// a collapsed photo wall is opened (template content is invisible to
// the page-load querySelectorAll above).
function tcBindSlideshowBtn(btn) {
    {
        btn.addEventListener('click', (event) => {
            event.preventDefault();
            const holdMs = parseInt(btn.dataset.tcAutoplayMs || '4500', 10);

            // If autoplay is already running, treat this click as "stop".
            if (tcAutoplayTimerId) {
                tcStopGallerySlideshow();
                if (tcLightboxInstance && tcLightboxInstance.pswp) {
                    tcLightboxInstance.pswp.close();
                }
                return;
            }

            // Find the first lightbox-eligible photo inside this button's
            // gallery. PhotoSwipe wraps imgs in an <a class="lightbox-link">
            // — that's our trigger.
            const gallery = btn.closest('.tc-photo-gallery');
            if (!gallery) return;
            const firstLink = gallery.querySelector('a.lightbox-link');
            if (!firstLink) return;

            // PhotoSwipe is dynamically imported and won't exist yet on
            // first interaction. Clicking the first thumbnail bootstraps
            // the import; we then poll for the instance to appear and
            // start the autoplay timer.
            firstLink.click();

            const startWhenReady = setInterval(() => {
                if (tcLightboxInstance && tcLightboxInstance.pswp) {
                    clearInterval(startWhenReady);
                    tcStartGallerySlideshowAutoplay(holdMs, btn);
                }
            }, 80);
            // Safety: stop polling after 6 seconds (PhotoSwipe should
            // have loaded long before this).
            setTimeout(() => clearInterval(startWhenReady), 6000);
        });
    }
}

/* =====================================================================
   Deferred photo walls — the per-kid galleries render their whole wall
   inside an inert <template> behind a "click to open" cover button
   (inc/photo-gallery.php), so the page makes zero image/video requests
   until the reader opts in. On click we move the template content
   live, wrap the new imgs for the PhotoSwipe lightbox, and wire the
   wall's slideshow button.
   ===================================================================== */
function initDeferredGalleries() {
    document.querySelectorAll('.tc-photo-gallery--deferred').forEach((gallery) => {
        const cover = gallery.querySelector('.tc-photo-gallery__cover');
        const tpl = gallery.querySelector('template.tc-photo-gallery__tpl');
        if (!cover || !tpl) return;

        cover.addEventListener('click', () => {
            cover.setAttribute('aria-expanded', 'true');

            // Going live: appendChild moves (not copies) the template's
            // content fragment into the section — images start loading
            // only now, honouring their loading="eager|lazy" attrs.
            gallery.appendChild(tpl.content);
            tpl.remove();
            cover.remove();
            gallery.classList.add('tc-photo-gallery--open');

            let wrapped = 0;
            gallery.querySelectorAll('img').forEach((img) => {
                if (tcWrapImgForLightbox(img)) wrapped += 1;
            });
            if (wrapped > 0) tcEnsurePhotoSwipe();

            gallery.querySelectorAll('.tc-photo-gallery__slideshow-btn')
                .forEach(tcBindSlideshowBtn);
        }, { once: true });
    });
}

/**
 * Slow Ken Burns zoom on each .heritage-line__figure when it enters
 * the viewport. Triggers once per figure via IntersectionObserver:
 * adds the .kb-active class, and CSS handles the rest — the
 * transition on the registered --kb-scale variable runs the
 * 1 → 1.04 zoom over 8s with ease-out easing.
 *
 * Disabled under prefers-reduced-motion.
 */
function initFigureKenBurns() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const figures = document.querySelectorAll('.heritage-line__figure');
    if (figures.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('kb-active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '-50px 0px',
    });

    figures.forEach((figure) => observer.observe(figure));
}

/**
 * Reveal .scroll-animate sections as they enter the viewport.
 *
 * Why gsap.to() and not gsap.from(): the .scroll-animate CSS sets the
 * initial state (opacity: 0; translateY(30px)). gsap.from() would record
 * those CSS values as the target and animate from-hidden to-hidden — a
 * latent bug in the previous version of this file. Using gsap.to() with
 * explicit final values fixes that.
 *
 * toggleActions: 'play none none none' means "play once on enter; do
 * nothing on leave, re-enter, or leave-back." So the animation runs once
 * per session per element and stays in its final state.
 */
function initScrollReveals() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const sections = document.querySelectorAll('.scroll-animate');

    sections.forEach((section) => {
        gsap.to(section, {
            scrollTrigger: {
                trigger: section,
                start: 'top 85%',
                toggleActions: 'play none none none',
            },
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power2.out',
        });
    });
}

/**
 * Layered drifting particle field with cursor magnetism, scroll parallax,
 * and oscillating temporary connections.
 *
 * Architecture: three independent layers, each with 40 particles.
 *   Layer 0 (back):  slow / dim / small / scrolls at 0.2x
 *   Layer 1 (mid):   medium / medium / medium / scrolls at 0.5x
 *   Layer 2 (front): fast / bright / large / scrolls at 0.8x
 *
 * Each layer has:
 *   - its own particle array
 *   - its own global "drift wind" force that picks a new random direction
 *     every 60-90 seconds and smoothly lerps over ~8 seconds. Particles
 *     accumulate this drift in addition to mouse attraction and damping.
 *   - its own velocity cap and parallax scroll factor.
 *
 * Connections are drawn WITHIN each layer (never cross-layer) — so the
 * layered depth illusion is preserved. Each particle picks its 1 nearest
 * neighbor in range, OR its 2 nearest if its phase oscillator says so
 * this frame. Phase: `sin(now * 0.000314 + p.phase) > 0.7`, which gives
 * a ~20s period and means any given particle drifts in and out of "2
 * connections" naturally over time. Sorting candidates by distance and
 * taking N closest means even when 2 are wanted, they're the closest 2.
 *
 * Scroll parallax: each layer applies a render-time Y offset of
 * `scrollY * scrollFactor`, with modulo wrap so particles always remain
 * visible somewhere in the viewport. Magnetism uses render position
 * (not raw p.y) so attraction tracks what the user actually sees.
 *
 * z-index: -1 puts the canvas BEHIND content. The WebGL background
 * canvas is also at z:-1 but appears earlier in DOM (added in
 * initWebGLBackground), so the particle canvas paints over it.
 */
function initParticleField() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Constellation runs site-wide (re-enabled per request): drifting dots
    // that gravitate to the cursor, link to ~2 nearest neighbours, and shed
    // connections as they wander. Reduced-motion already sat it out above.

    const canvas = document.createElement('canvas');
    canvas.className = 'particle-field-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        zIndex: '-1',
        pointerEvents: 'none',
    });
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    // Tint: the field picks up the page's accent so it reads differently
    // per line / page. Falls back to the original pale blue-white if no
    // accent variable is set (e.g. the homepage).
    function tcReadTint() {
        var els = [
            document.querySelector('.heritage-longread, .heritage-line, .person-spoke, .thomas-page'),
            document.body, document.documentElement
        ];
        var raw = '';
        for (var i = 0; i < els.length && !raw; i++) {
            if (!els[i]) continue;
            var cs = getComputedStyle(els[i]);
            raw = (cs.getPropertyValue('--line-color') || cs.getPropertyValue('--webgl-accent') || '').trim();
        }
        var m = raw.match(/^#([0-9a-fA-F]{6})$/) || raw.match(/^#([0-9a-fA-F]{3})$/);
        if (m) {
            var hx = m[1];
            if (hx.length === 3) hx = hx[0]+hx[0]+hx[1]+hx[1]+hx[2]+hx[2];
            return parseInt(hx.slice(0,2),16)+', '+parseInt(hx.slice(2,4),16)+', '+parseInt(hx.slice(4,6),16);
        }
        var rgb = raw.match(/(\d+)\D+(\d+)\D+(\d+)/);
        if (rgb) return rgb[1]+', '+rgb[2]+', '+rgb[3];
        return '210, 225, 255';
    }
    var tintRGB = tcReadTint();
    // ---- Constants shared across layers ----
    const ATTRACT_RADIUS   = 180;
    const ATTRACT_STRENGTH = 0.045;    // restored for a stronger cursor pull
    const CONNECT_DISTANCE = 180;
    const DAMPING          = 0.97;
    const MAX_VEL_BASE     = 1.6;      // ~35% reduction
    const DRIFT_FORCE      = 0.006;    // halved so layer wind doesn't dominate
    const NOISE_FORCE      = 0.08;     // per-frame Brownian kick (new)
    const CONN_PHASE_FREQ  = 0.000314; // ~20s period
    const CONN_PHASE_GATE  = 0.7;      // sin > 0.7 → wants 2 connections

    // ---- Per-layer config (alphas restored for visibility) ----
    const LAYERS = [
        { count: 30, speed: 0.6, scrollFactor: 0.2, size: 0.8, pAlpha: 0.22, lAlpha: 0.10 },
        { count: 30, speed: 1.0, scrollFactor: 0.5, size: 1.0, pAlpha: 0.34, lAlpha: 0.14 },
        { count: 30, speed: 1.5, scrollFactor: 0.8, size: 1.4, pAlpha: 0.48, lAlpha: 0.18 },
    ];

    LAYERS.forEach(function (layer) {
        layer.particles = [];
        for (let i = 0; i < layer.count; i++) {
            layer.particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 0.3 * layer.speed,
                vy: (Math.random() - 0.5) * 0.3 * layer.speed,
                phase: Math.random() * Math.PI * 2,
                // Per-particle individuality. driftSensitivity controls how
                // much the layer's global wind pushes this particle (0.3
                // = barely affected, 1.5 = strongly blown around). speedFactor
                // multiplies both this particle's max velocity and its
                // Brownian noise amplitude. Together they break up the
                // lockstep "all particles drifting the same way" effect.
                driftSensitivity: 0.3 + Math.random() * 1.2,
                speedFactor:      0.6 + Math.random() * 0.8,
            });
        }
        // Drift state
        layer.drift = { x: 0, y: 0 };
        const angle = Math.random() * Math.PI * 2;
        const mag = (0.4 + Math.random() * 0.6) * layer.speed;
        layer.targetDrift = {
            x: Math.cos(angle) * mag,
            y: Math.sin(angle) * mag,
        };
        layer.driftChangeTime = performance.now() + 60000 + Math.random() * 30000;
    });

    let mouseX = -10000, mouseY = -10000;
    document.addEventListener('mousemove', function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    let scrollY = window.scrollY;
    window.addEventListener('scroll', function () {
        scrollY = window.scrollY;
    }, { passive: true });

    function render() {
        // Clear in CSS-pixel coords so the active setTransform(dpr,...)
        // scales the rect back up to fill the whole pixel grid. Same
        // zoom-out residue bug fixed on the ink-trail canvas.
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        const w = window.innerWidth;
        const h = window.innerHeight;
        const now = performance.now();

        for (let li = 0; li < LAYERS.length; li++) {
            const layer = LAYERS[li];

            // --- Update layer's global drift wind ---
            if (now > layer.driftChangeTime) {
                const angle = Math.random() * Math.PI * 2;
                const mag = (0.4 + Math.random() * 0.6) * layer.speed;
                layer.targetDrift.x = Math.cos(angle) * mag;
                layer.targetDrift.y = Math.sin(angle) * mag;
                layer.driftChangeTime = now + 60000 + Math.random() * 30000;
            }
            layer.drift.x += (layer.targetDrift.x - layer.drift.x) * 0.002;
            layer.drift.y += (layer.targetDrift.y - layer.drift.y) * 0.002;

            const offsetY = scrollY * layer.scrollFactor;
            const layerMaxBase = MAX_VEL_BASE * layer.speed;

            // --- Physics for this layer's particles ---
            for (let i = 0; i < layer.particles.length; i++) {
                const p = layer.particles[i];
                const renderY = ((p.y - offsetY) % h + h) % h;

                const dx = mouseX - p.x;
                const dy = mouseY - renderY;
                const dist = Math.hypot(dx, dy);
                if (dist < ATTRACT_RADIUS && dist > 0.1) {
                    const factor = (1 - dist / ATTRACT_RADIUS) * ATTRACT_STRENGTH;
                    p.vx += (dx / dist) * factor;
                    p.vy += (dy / dist) * factor;
                }

                // Layer-wide drift wind, scaled by this particle's sensitivity.
                p.vx += layer.drift.x * DRIFT_FORCE * p.driftSensitivity;
                p.vy += layer.drift.y * DRIFT_FORCE * p.driftSensitivity;

                // Brownian noise — independent random kick per particle per
                // frame. Makes individual particles meander rather than
                // marching in formation with the layer wind.
                p.vx += (Math.random() - 0.5) * NOISE_FORCE * p.speedFactor;
                p.vy += (Math.random() - 0.5) * NOISE_FORCE * p.speedFactor;

                p.vx *= DAMPING;
                p.vy *= DAMPING;

                // Cap velocity by per-particle speedFactor so some particles
                // can move faster than others under the same forces.
                const layerMaxVel = layerMaxBase * p.speedFactor;
                const speed = Math.hypot(p.vx, p.vy);
                if (speed > layerMaxVel) {
                    p.vx = (p.vx / speed) * layerMaxVel;
                    p.vy = (p.vy / speed) * layerMaxVel;
                }

                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x += w;
                if (p.x > w) p.x -= w;
                if (p.y < 0) p.y += h;
                if (p.y > h) p.y -= h;
            }

            // --- Connections within layer (1 nearest, occasionally 2) ---
            ctx.lineWidth = 0.7;
            for (let i = 0; i < layer.particles.length; i++) {
                const p = layer.particles[i];
                const pRenderY = ((p.y - offsetY) % h + h) % h;

                const wantsTwo = Math.sin(now * CONN_PHASE_FREQ + p.phase) > CONN_PHASE_GATE;
                const maxN = wantsTwo ? 2 : 1;

                // Find candidates within range, sorted by distance.
                const candidates = [];
                for (let j = 0; j < layer.particles.length; j++) {
                    if (j === i) continue;
                    const q = layer.particles[j];
                    const qRenderY = ((q.y - offsetY) % h + h) % h;
                    const cdx = q.x - p.x;
                    const cdy = qRenderY - pRenderY;
                    const cd = Math.hypot(cdx, cdy);
                    if (cd < CONNECT_DISTANCE) {
                        candidates.push({ x: q.x, y: qRenderY, d: cd });
                    }
                }
                candidates.sort(function (a, b) { return a.d - b.d; });

                const lineCount = Math.min(candidates.length, maxN);
                for (let k = 0; k < lineCount; k++) {
                    const c = candidates[k];
                    const alpha = (1 - c.d / CONNECT_DISTANCE) * layer.lAlpha;
                    ctx.strokeStyle = 'rgba(' + tintRGB + ', ' + alpha + ')';
                    ctx.beginPath();
                    ctx.moveTo(p.x, pRenderY);
                    ctx.lineTo(c.x, c.y);
                    ctx.stroke();
                }
            }

            // --- Particles ---
            ctx.fillStyle = 'rgba(' + tintRGB + ', ' + layer.pAlpha + ')';
            for (let i = 0; i < layer.particles.length; i++) {
                const p = layer.particles[i];
                const pRenderY = ((p.y - offsetY) % h + h) % h;
                ctx.beginPath();
                ctx.arc(p.x, pRenderY, layer.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

/**
 * Magnetic elements — buttons and opt-in elements with .magnetic class
 * or data-magnetic attribute drift toward the cursor when it's within
 * MAGNET_RADIUS pixels of their center. Falloff is linear (closer =
 * stronger pull).
 *
 * Implementation note: rather than setting `transform` directly (which
 * would override CSS :hover transforms), we set --magnet-x and --magnet-y
 * custom properties on the element. The button's CSS rule reads these
 * vars inside `transform: translate(...)` and combines them with the
 * hover lift via calc(). This way the magnet AND the hover translate
 * apply at the same time without fighting each other.
 *
 * One global mousemove listener + one rAF loop, not per-element. We
 * call getBoundingClientRect every frame which isn't free, but at this
 * scale (~5 elements) it's a non-issue.
 */
function initMagneticElements() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const selector = '.btn-primary, .btn-secondary, .magnetic, [data-magnetic]';
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) return;

    const MAGNET_RADIUS = 90;       // px
    const MAGNET_STRENGTH = 0.35;   // multiplier on raw displacement
    const LERP = 0.15;              // smoothing per frame

    const states = Array.from(elements).map(function (el) {
        return { el: el, x: 0, y: 0, targetX: 0, targetY: 0 };
    });

    let mouseX = -10000, mouseY = -10000;
    document.addEventListener('mousemove', function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function update() {
        for (let i = 0; i < states.length; i++) {
            const s = states[i];
            const rect = s.el.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = mouseX - cx;
            const dy = mouseY - cy;
            const dist = Math.hypot(dx, dy);

            if (dist < MAGNET_RADIUS) {
                const factor = (1 - dist / MAGNET_RADIUS) * MAGNET_STRENGTH;
                s.targetX = dx * factor;
                s.targetY = dy * factor;
            } else {
                s.targetX = 0;
                s.targetY = 0;
            }

            s.x += (s.targetX - s.x) * LERP;
            s.y += (s.targetY - s.y) * LERP;

            s.el.style.setProperty('--magnet-x', s.x.toFixed(2) + 'px');
            s.el.style.setProperty('--magnet-y', s.y.toFixed(2) + 'px');
        }
        requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

/**
 * WebGL background — drifting noise gradient + cursor-reactive ambient glow.
 *
 * Architecture: one Three.js scene with an orthographic camera and a
 * fullscreen PlaneGeometry (2x2 in NDC space — covers the entire camera
 * view). The plane uses a custom ShaderMaterial:
 *
 *   - Vertex shader: pass-through; just outputs the geometry's NDC coords.
 *   - Fragment shader: per-pixel work. Reads UV coords + uTime + uMouse +
 *     uResolution uniforms. Combines:
 *       * Multi-octave 2D simplex noise that morphs over time → organic
 *         drifting blobs in indigo / cyan against a deep navy base.
 *       * Cursor-reactive radial glow: exponential falloff from uMouse
 *         in cyan, additively blended on top.
 *       * Subtle vignette: edges darken slightly for cinematic depth.
 *
 * Mouse handling uses lerp smoothing (each frame, the rendered uMouse is
 * pulled toward the target mouse position by 6%). Without this, the glow
 * teleports every mouse event; with it, the glow has a slight lag that
 * reads as "physical."
 *
 * The canvas is fixed-position at z-index: -1 so it sits behind every
 * section. Sections that have their own gradient (hero, CTA) cover it
 * locally; sections that are transparent (pillars, blog) let it show
 * through.
 *
 * Sit-out conditions:
 *   - prefers-reduced-motion → skip; static body background remains.
 *   - THREE undefined → skip silently (script load failure).
 *   - WebGL context creation fails → skip silently (very old GPU).
 */
function initWebGLBackground() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        console.info('[TC] WebGL bg skipped — prefers-reduced-motion is set');
        return;
    }
    if (typeof THREE === 'undefined') {
        console.warn('[TC] WebGL bg skipped — Three.js did not load');
        return;
    }

    const canvas = document.createElement('canvas');
    canvas.className = 'webgl-bg-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        // z:-2 keeps the WebGL gradient BEHIND the particle constellation
        // (z:-1). three.js now lazy-loads on idle (G3), so this canvas is
        // appended AFTER the particle canvas; without an explicit z-index
        // the later element would win the tie and paint over the dots.
        zIndex: '-2',
        pointerEvents: 'none',
    });
    document.body.appendChild(canvas);

    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: false,
            alpha: false,
            powerPreference: 'low-power',
        });
    } catch (err) {
        // No WebGL context available; bail silently. The body's solid
        // bg-base color remains the fallback.
        console.warn('[TC] WebGL bg skipped — WebGLRenderer threw:', err);
        canvas.remove();
        return;
    }
    console.info('[TC] WebGL bg initialized — Three.js r' + THREE.REVISION);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2() },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        // Tint color for the dominant noise wash. Defaults to the original
        // hardcoded indigo (#120656) so the homepage and other untinted
        // pages render exactly as before. Kid pages override via the
        // --line-color CSS custom property — see the read below.
        uTint: { value: new THREE.Color(0x120656) },
        // Accent color for the bright blob regions + cursor glow. Defaults to
        // the original cyan; the Thomas page overrides via --webgl-accent.
        uAccent: { value: new THREE.Color(0x22D3EE) },
    };

    // Per-page WebGL tint. The .person-spoke--{name} body class on each
    // kid's page sets --line-color via :has() in style.css; we read it
    // here and pass it to the shader. Multiplied down to ~0.4 brightness
    // so the saturated kid accents (purple/green/pink) don't blow out
    // the wash — the original indigo had effective brightness ~0.34.
    // Prefer a dedicated --webgl-tint (Thomas page); fall back to --line-color
    // (kid pages) so existing behaviour is unchanged.
    const cs = getComputedStyle(document.body);
    const tintFromCss = cs.getPropertyValue('--webgl-tint').trim()
                     || cs.getPropertyValue('--line-color').trim();
    if (tintFromCss) {
        try {
            const c = new THREE.Color(tintFromCss);
            c.multiplyScalar(0.4);
            uniforms.uTint.value = c;
        } catch (err) {
            console.warn('[TC] tint value not parseable as a color:', tintFromCss);
        }
    }

    // Accent override (bright blobs + cursor glow). Used at full saturation.
    const accentFromCss = cs.getPropertyValue('--webgl-accent').trim();
    if (accentFromCss) {
        try {
            uniforms.uAccent.value = new THREE.Color(accentFromCss);
        } catch (err) {
            console.warn('[TC] --webgl-accent value not parseable as a color:', accentFromCss);
        }
    }

    const vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
        }
    `;

    // Stefan Gustavson 2D simplex noise — well-tested public-domain
    // implementation. Returns a value approximately in [-1, 1].
    const fragmentShader = `
        precision highp float;

        uniform float uTime;
        uniform vec2 uResolution;
        uniform vec2 uMouse;
        uniform vec3 uTint;
        uniform vec3 uAccent;
        varying vec2 vUv;

        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

        float snoise(vec2 v) {
            const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                                -0.577350269189626, 0.024390243902439);
            vec2 i  = floor(v + dot(v, C.yy));
            vec2 x0 = v - i + dot(i, C.xx);
            vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod289(i);
            vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                          + i.x + vec3(0.0, i1.x, 1.0));
            vec3 m = max(0.5 - vec3(dot(x0, x0),
                                    dot(x12.xy, x12.xy),
                                    dot(x12.zw, x12.zw)), 0.0);
            m = m * m;
            m = m * m;
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
            vec3 g;
            g.x = a0.x * x0.x + h.x * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
        }

        void main() {
            vec2 uv = vUv;
            float aspect = uResolution.x / max(uResolution.y, 1.0);
            // Aspect-corrected coords so the noise blobs aren't stretched.
            vec2 p = vec2(uv.x * aspect, uv.y);

            float t = uTime * 0.04;

            // Two octaves of noise. Low frequency = big organic blobs;
            // mid frequency = subtle texture on top.
            float n1 = snoise(p * 1.5 + vec2(t, t * 0.7));
            float n2 = snoise(p * 3.0 + vec2(-t * 0.5, t * 0.4)) * 0.5;
            float n  = (n1 + n2) * 0.5;

            // Base near-black navy (matches --bg-base #040619).
            vec3 color = vec3(0.0156, 0.0235, 0.098);

            // Tint wash where noise is positive — drifts organically.
            // Default value of uTint is the original indigo (#120656);
            // kid pages override via the --line-color CSS variable.
            color = mix(color, uTint, smoothstep(-0.2, 0.4, n) * 0.55);

            // Cyan accent in the brighter noise regions.
            vec3 cyan = uAccent;    // cyan by default; --webgl-accent overrides (Thomas page -> ember)
            color = mix(color, cyan, smoothstep(0.15, 0.5, n) * 0.18);

            // Cursor-reactive ambient glow. uMouse is in [0,1] in screen
            // space; convert to aspect-corrected p-space before computing
            // distance so the glow is a circle, not an ellipse.
            vec2 mp = vec2(uMouse.x * aspect, uMouse.y);
            float d = distance(p, mp);
            float glow = exp(-d * 4.5);
            color += cyan * glow * 0.35;

            // Subtle vignette — edges fall off ~15%.
            vec2 vc = uv - 0.5;
            float vignette = 1.0 - smoothstep(0.5, 1.0, length(vc));
            color *= mix(0.85, 1.0, vignette);

            // Per-pixel hash dither — adds +/- half a color step of
            // pseudo-random noise so 8-bit color quantization on the
            // smooth cursor glow falloff doesn't show as visible
            // concentric bands. Imperceptible as noise but kills banding.
            float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
            color += vec3(dither / 255.0);

            gl_FragColor = vec4(color, 1.0);
        }
    `;

    const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = window.innerWidth;
        const h = window.innerHeight;
        renderer.setPixelRatio(dpr);
        renderer.setSize(w, h, false);
        uniforms.uResolution.value.set(w * dpr, h * dpr);
    }
    resize();
    window.addEventListener('resize', resize);

    const targetMouse = new THREE.Vector2(0.5, 0.5);
    document.addEventListener('mousemove', function (e) {
        targetMouse.set(
            e.clientX / window.innerWidth,
            1 - (e.clientY / window.innerHeight)
        );
    });

    function render() {
        // Lerp the rendered mouse toward the target — gives the glow a
        // slight smoothed lag that reads as physical.
        uniforms.uMouse.value.lerp(targetMouse, 0.06);
        uniforms.uTime.value = performance.now() * 0.001;
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

/**
 * Pressure-sensitive ink-trail cursor with flint-style sparks.
 *
 * What you see:
 *   - A soft white trail follows the cursor; slow movements draw thicker
 *     (like pressing harder with a pen), fast flicks draw thin and wispy.
 *     Each stroke fades to transparent over MAX_AGE (~850ms).
 *   - Above a velocity threshold, warm amber sparks spit off the cursor in
 *     random directions, fall slightly under gravity, and burn out within
 *     ~250–450ms. Subtle — meant to evoke flint on stone, not fireworks.
 *
 * How the trail works:
 *   1. We append a transparent <canvas> to <body> sized to the viewport.
 *      It's pointer-events:none so it doesn't intercept clicks.
 *   2. mousemove samples the cursor position with a timestamp and
 *      computed velocity (pixels per millisecond from the previous sample).
 *   3. A requestAnimationFrame loop drops expired samples, then for each
 *      remaining segment draws four stacked strokes (outer wide+faint to
 *      inner thin+bright) — the soft-edged ink look. Width per segment
 *      scales inversely with velocity (slow = thick), and alpha scales
 *      with how fresh the segment is.
 *
 * How the sparks work:
 *   - On every mousemove, if speed > SPARK_THRESHOLD, we roll a probability
 *     that scales with speed. Pass = emit 1–2 spark particles seeded with a
 *     velocity opposite-ish to cursor motion (so they trail behind) plus a
 *     random angular spread. Each particle has its own lifespan and gravity
 *     accumulates on its vertical velocity each frame.
 *
 * Color choice:
 *   - Trail is plain white (we removed mix-blend-mode). Reads great on the
 *     dark hero; will read weak on the current white pillar/posts sections
 *     until those sections get dark-mode treatment.
 *   - Sparks are warm amber (#ffb060) — high contrast against the cool
 *     trail and against any dark background.
 *
 * Sit-out conditions:
 *   - prefers-reduced-motion → skip entirely (the loop never starts).
 *   - touch-only device (no fine pointer) → skip; trail would never trigger.
 */
function initInkTrail() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    // Hide the OS cursor sitewide — the trail is the only cursor indicator.
    document.documentElement.classList.add('cursor-custom');

    const canvas = document.createElement('canvas');
    canvas.className = 'ink-trail-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: '9999',
    });
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    // Runtime-tunable settings (color + age) — exposed via window.__tcInkSet
    // so the desk-menu cursor-trail picker can change them live. Defaults
    // match the original ink-trail look (white, ~510ms fade).
    let inkColor = '#ffffff';
    let MAX_AGE  = 510;
    let inkEnabled = true;
    window.__tcInkSet = function ( s ) {
        if ( s && typeof s.color === 'string' ) inkColor = s.color;
        if ( s && typeof s.age   === 'number' && s.age >= 100 && s.age <= 3000 ) MAX_AGE = s.age;
        if ( s && typeof s.enabled === 'boolean' ) inkEnabled = s.enabled;
        // When disabled, also clear any in-flight strokes so we don't see
        // a half-faded trail freeze on screen until next mousemove.
        if ( ! inkEnabled ) {
            points.length = 0;
            sparks.length = 0;
            ctx.clearRect( 0, 0, canvas.width, canvas.height );
        }
    };

    // Resize handler. We use device-pixel-ratio scaling so strokes stay
    // crisp on retina displays. setTransform resets any prior scale rather
    // than compounding, so this is safe to call repeatedly.
    function resize() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    // ----- Trail state -----
    const points = []; // { x, y, t (ms), v (px/ms) }
    // MAX_AGE is hoisted above as a `let` so it can be live-tuned.

    // Stacked stroke layers, outer-to-inner. Width is the BASE that gets
    // multiplied by velocity-factor and age-factor per segment. Alpha is
    // multiplied by the per-segment age factor.
    const LAYERS = [
        { width: 14, alpha: 0.06 },
        { width: 8,  alpha: 0.18 },
        { width: 3,  alpha: 0.50 },
        { width: 1,  alpha: 0.95 },
    ];

    // ----- Spark state -----
    const sparks = []; // { x, y, vx, vy, t, lifespan }
    const SPARK_THRESHOLD = 0.12;     // px/ms; below this, no sparks
    const SPARK_MAX_PROB  = 0.45;     // ceiling on emit chance per mousemove
    const SPARK_GRAVITY   = 0.00035;  // px/ms² added to vy each frame
    let lastFrameTime = performance.now();

    document.addEventListener('mousemove', function (e) {
        const now = performance.now();
        const last = points[points.length - 1];

        let velocity = 0;
        let dx = 0, dy = 0;
        if (last) {
            const dt = Math.max(1, now - last.t);
            dx = e.clientX - last.x;
            dy = e.clientY - last.y;
            velocity = Math.hypot(dx, dy) / dt; // px/ms
        }
        points.push({ x: e.clientX, y: e.clientY, t: now, v: velocity });

        // Spark emission. Probability ramps from 0 at threshold to
        // SPARK_MAX_PROB by ~speed=0.9. Subtle by design.
        if (velocity > SPARK_THRESHOLD) {
            const emitProb = Math.min(SPARK_MAX_PROB, (velocity - SPARK_THRESHOLD) / 1.6);
            if (Math.random() < emitProb) {
                const cursorAngle = Math.atan2(dy, dx);
                // Single particle per emission — feels gentler than bursts.
                // Fly opposite cursor direction + spread of ±~70°.
                const spread = (Math.random() - 0.5) * (Math.PI * 0.78);
                const sparkAngle = cursorAngle + Math.PI + spread;
                const sparkSpeed = 0.06 + Math.random() * 0.18; // px/ms
                sparks.push({
                    x: e.clientX,
                    y: e.clientY,
                    vx: Math.cos(sparkAngle) * sparkSpeed,
                    vy: Math.sin(sparkAngle) * sparkSpeed,
                    t: now,
                    lifespan: 250 + Math.random() * 200, // ms
                });
            }
        }
    });

    function render() {
        const now = performance.now();
        const dt = Math.max(1, now - lastFrameTime); // ms since last frame
        lastFrameTime = now;

        // Clear in CSS-pixel coords so the active setTransform(dpr,...)
        // scales the rect back up to fill the whole pixel grid. Using
        // canvas.width/height directly under-clears when dpr < 1 (Chrome
        // zoom-out), which left permanent trail residue.
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        // ---- Trail pass ----
        // Drop expired samples from the head of the queue.
        while (points.length && now - points[0].t > MAX_AGE) {
            points.shift();
        }

        // If the user has chosen a variant trail (or explicitly turned the
        // ink trail off), skip drawing — clear the canvas just in case
        // there are leftover strokes from a previous frame.
        if ( ! inkEnabled ) {
            ctx.clearRect( 0, 0, canvas.width, canvas.height );
            requestAnimationFrame( render );
            return;
        }

        if (points.length >= 2) {
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = inkColor;

            for (const layer of LAYERS) {
                for (let i = 1; i < points.length; i++) {
                    const a = points[i - 1];
                    const b = points[i];

                    const age = now - b.t;
                    const ageFactor = 1 - (age / MAX_AGE); // 1 fresh → 0 expired
                    if (ageFactor <= 0) continue;

                    // Slow movement → thick (more "pressure"). Cap at 0.25 so
                    // even very fast flicks leave a visible thread.
                    const velocityFactor = Math.max(0.25, 1 - Math.min(1, b.v / 1.25));

                    ctx.lineWidth = Math.max(0.1, layer.width * velocityFactor * ageFactor);
                    ctx.globalAlpha = layer.alpha * ageFactor;

                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }

            ctx.globalAlpha = 1;
        }

        // ---- Sparks pass ----
        // Iterate backwards so we can splice expired particles in place.
        for (let i = sparks.length - 1; i >= 0; i--) {
            const s = sparks[i];
            const age = now - s.t;

            if (age > s.lifespan) {
                sparks.splice(i, 1);
                continue;
            }

            // Integrate position. dt is in ms, vx/vy are px/ms.
            s.x += s.vx * dt;
            s.y += s.vy * dt;
            s.vy += SPARK_GRAVITY * dt;

            const lifeRatio = age / s.lifespan;
            const alpha = 1 - lifeRatio;
            // Slight shrink as the spark cools.
            const radius = 1.6 * (1 - lifeRatio * 0.6);

            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#ffb060';
            ctx.beginPath();
            ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

/**
 * Site chrome — the floating glass capsule + fullscreen overlay menu.
 *
 * Three concerns are bundled here so a single init owns the chrome state:
 *
 *   1. Live clock — updates HH:MM and the IANA-zone short name once per
 *      minute. Uses Intl.DateTimeFormat so it respects the user's locale
 *      and timezone automatically.
 *
 *   2. Menu open/close — driven by a single class on <html>:
 *      `html.tc-menu-open`. CSS handles the visibility, blur, and the
 *      ☰→✕ trigger morph. JS handles:
 *        - Splitting each menu link's text into per-character spans on
 *          first open (cached after that), so we can stagger them in.
 *        - Running a GSAP timeline that overlaps the panel rise with
 *          the per-link char waterfall.
 *        - Aria state, scroll lock (CSS), focus management.
 *        - Escape key + backdrop click + trigger click all close.
 *
 *   3. Reduced motion — animation is short-circuited; the menu still
 *      opens and closes, but instantly. The capsule clock still runs.
 */
/* ============================================================
 * initHeaderNav — the full-width header navigation (desktop).
 *
 *   1. Measures the compact-pill width and writes it to
 *      --tc-head-min-w, so the bar can TRANSITION its width down to
 *      the pill on scroll (you can't animate width to `auto`).
 *   2. Toggles html.tc-head-min past an 80px scroll threshold
 *      (rAF-throttled), which drives the condense morph in CSS.
 *   3. Wires the dropdown disclosures (click + Esc + click-outside;
 *      hover/focus open is pure CSS) and the per-section "living
 *      border" tint on the gleam.
 *
 * Desktop only (>=1000px): below that the nav is display:none and the
 * scroll class is never set. With JS off, the bar just stays expanded.
 * ============================================================ */
function initHeaderNav() {
    const html = document.documentElement;
    const bar  = document.querySelector('.tc-capsule');
    const nav  = document.querySelector('.tc-headnav');
    if (!bar || !nav) return;

    const desktop = window.matchMedia('(min-width: 1000px)');

    // ---- disclosures (declared first so syncScroll can close them) ----
    const items   = Array.prototype.slice.call(nav.querySelectorAll('.tc-headnav__item'));
    const toggles = Array.prototype.slice.call(nav.querySelectorAll('.tc-headnav__toggle'));

    function closeAll(except) {
        toggles.forEach(function (t) {
            if (t === except) return;
            t.setAttribute('aria-expanded', 'false');
            const d = document.getElementById(t.getAttribute('aria-controls'));
            if (d) d.classList.remove('is-open');
        });
    }

    toggles.forEach(function (t) {
        const d = document.getElementById(t.getAttribute('aria-controls'));
        if (!d) return;
        t.addEventListener('click', function () {
            const open = t.getAttribute('aria-expanded') === 'true';
            closeAll(t);
            t.setAttribute('aria-expanded', open ? 'false' : 'true');
            d.classList.toggle('is-open', !open);
        });
        function escClose(e) {
            if (e.key === 'Escape') {
                t.setAttribute('aria-expanded', 'false');
                d.classList.remove('is-open');
                t.focus();
            }
        }
        t.addEventListener('keydown', escClose);
        d.addEventListener('keydown', escClose);
    });

    // Click anywhere outside the nav closes any open tray.
    document.addEventListener('click', function (e) {
        if (!nav.contains(e.target)) closeAll(null);
    });

    // ---- living border: tint the gleam by hovered/focused section ----
    const SECT = { 'hn-heritage': 'is-sect-heritage', 'hn-hcs': 'is-sect-hcs', 'hn-family': 'is-sect-family' };
    function clearSect() { bar.classList.remove('is-sect-heritage', 'is-sect-hcs', 'is-sect-family'); }
    items.forEach(function (item) {
        const t   = item.querySelector('.tc-headnav__toggle');
        const cls = t ? SECT[t.getAttribute('aria-controls')] : null;
        function on()  { clearSect(); if (cls) bar.classList.add(cls); }
        item.addEventListener('mouseenter', on);
        item.addEventListener('focusin', on);
        item.addEventListener('mouseleave', clearSect);
        item.addEventListener('focusout', function (e) {
            if (!item.contains(e.relatedTarget)) clearSect();
        });
    });

    // ---- 1. measure the condensed pill width ----
    function measureMin() {
        if (!desktop.matches) return;
        bar.classList.add('tc-head-measuring');
        const w = Math.ceil(bar.getBoundingClientRect().width);
        bar.classList.remove('tc-head-measuring');
        if (w > 0) html.style.setProperty('--tc-head-min-w', w + 'px');
    }
    measureMin();
    // The weather temperature changes the pill width when it resolves.
    const temp = document.querySelector('[data-tc-weather-temp]');
    if (temp && 'MutationObserver' in window) {
        new MutationObserver(measureMin).observe(temp, { childList: true, characterData: true, subtree: true });
    }
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(measureMin);
    } else {
        setTimeout(measureMin, 600);
    }

    // ---- 2. scroll-collapse ----
    // The bar clips the nav only WHILE it morphs, so links never spill
    // mid-animation; at rest it's overflow:visible so the dropdown trays
    // can escape. --morphing covers the expand animation (collapse is
    // covered by html.tc-head-min). A timeout clears it in case the
    // transition is interrupted or reduced-motion skips it entirely.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let ticking = false;
    let wasMin  = false;
    let morphT;
    function syncScroll() {
        const min = desktop.matches && window.scrollY > 80;
        html.classList.toggle('tc-head-min', min);
        if (min) {
            closeAll(null);
            clearTimeout(morphT);
            nav.classList.remove('tc-headnav--morphing');
        } else if (wasMin && !reduceMotion.matches) {
            nav.classList.add('tc-headnav--morphing');
            clearTimeout(morphT);
            morphT = setTimeout(function () { nav.classList.remove('tc-headnav--morphing'); }, 650);
        }
        wasMin = min;
    }
    window.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () { syncScroll(); ticking = false; });
    }, { passive: true });

    // Re-measure + re-sync on resize (debounced; crossing the breakpoint).
    let rt;
    window.addEventListener('resize', function () {
        clearTimeout(rt);
        rt = setTimeout(function () {
            html.style.removeProperty('--tc-head-min-w');
            measureMin();
            syncScroll();
        }, 200);
    });
    syncScroll();
}

function initSiteChrome() {
    const html = document.documentElement;
    const trigger = document.querySelector('[data-menu-trigger]');
    const menu = document.getElementById('tc-menu');
    const backdrop = document.querySelector('[data-menu-backdrop]');
    const triggerLabel = document.querySelector('[data-trigger-label]');
    const clockTime = document.querySelector('[data-clock-time]');
    const clockZone = document.querySelector('[data-clock-zone]');

    // ---- Clock ticker ----
    // Update on init and again at the top of every minute. We compute the
    // ms until the next minute boundary so the first tick happens precisely
    // when the displayed minute would change, not on a 60s interval drift.
    if (clockTime) {
        function renderClock() {
            const now = new Date();
            try {
                const time = new Intl.DateTimeFormat([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                }).format(now);
                clockTime.textContent = time;

                if (clockZone) {
                    // timeZoneName: 'short' gives us things like "PDT", "MST", "GMT+1".
                    const parts = new Intl.DateTimeFormat([], {
                        timeZoneName: 'short',
                    }).formatToParts(now);
                    const zone = parts.find(function (p) { return p.type === 'timeZoneName'; });
                    if (zone) clockZone.textContent = zone.value;
                }
            } catch (err) {
                // Some old engines reject empty locale arrays. Fallback:
                clockTime.textContent = now.toTimeString().slice(0, 5);
            }
        }
        renderClock();
        // First scheduled tick: align to the next minute boundary, then
        // every 60s after that.
        const msToNextMinute = (60 - new Date().getSeconds()) * 1000;
        setTimeout(function tick() {
            renderClock();
            setInterval(renderClock, 60000);
        }, msToNextMinute);
    }

    // ---- Weather widget ----
    // The capsule's `[data-tc-weather]` link houses an icon + temp slot.
    // We fetch current conditions from Open-Meteo (free, no API key)
    // and map the WMO weather_code to a glyph. Refreshes every 30
    // minutes — the API has no rate-limit issue at that cadence.
    // Footer brass plaque continues to show the local time; the
    // capsule now carries weather instead.
    const weatherIcon = document.querySelector('[data-tc-weather-icon]');
    const weatherTemp = document.querySelector('[data-tc-weather-temp]');
    if (weatherIcon && weatherTemp) {
        // Grande Prairie, AB: 55.17°N, -118.79°E.
        const WX_URL = 'https://api.open-meteo.com/v1/forecast'
            + '?latitude=55.17&longitude=-118.79'
            + '&current=temperature_2m,weather_code'
            + '&timezone=America%2FEdmonton';

        // WMO weather code → emoji glyph (kept small and readable
        // against the dark capsule). Buckets that share a glyph are
        // intentional — we don't need 27 distinct icons in a 15px slot.
        function glyphForCode(code) {
            if (code === 0)                       return '☀';
            if (code === 1 || code === 2)         return '⛅';
            if (code === 3)                       return '☁';
            if (code === 45 || code === 48)       return '🌫';
            if (code >= 51 && code <= 57)         return '🌦';
            if (code >= 61 && code <= 67)         return '🌧';
            if (code >= 71 && code <= 77)         return '❄';
            if (code >= 80 && code <= 82)         return '🌧';
            if (code >= 85 && code <= 86)         return '🌨';
            if (code >= 95 && code <= 99)         return '⛈';
            return '·';
        }

        function fetchWeather() {
            fetch(WX_URL)
                .then(function (r) { return r.ok ? r.json() : null; })
                .then(function (data) {
                    if (!data || !data.current) return;
                    const t = Math.round(data.current.temperature_2m);
                    const c = data.current.weather_code;
                    weatherTemp.textContent = t + '°';
                    weatherIcon.textContent = glyphForCode(c);
                })
                .catch(function () { /* keep the placeholder. */ });
        }
        fetchWeather();
        setInterval(fetchWeather, 30 * 60 * 1000);
    }

    // ---- Bitcoin ticker ----
    // Sits beside the weather widget in the capsule. Pulls the live USD
    // spot price from CoinGecko's free/no-key endpoint and refreshes
    // every 60 seconds (well within their rate limit per visitor). The
    // 24h change tints the price green/red via is-up / is-down on the
    // link; the ₿ glyph stays bitcoin-orange (CSS).
    const btcPrice = document.querySelector('[data-tc-btc-price]');
    if (btcPrice) {
        const btcLink = btcPrice.closest('[data-tc-btc]');
        const BTC_URL = 'https://api.coingecko.com/api/v3/simple/price'
            + '?ids=bitcoin&vs_currencies=usd&include_24hr_change=true';

        function fetchBTC() {
            fetch(BTC_URL)
                .then(function (r) { return r.ok ? r.json() : null; })
                .then(function (data) {
                    if (!data || !data.bitcoin) return;
                    const p = Math.round(data.bitcoin.usd);
                    btcPrice.textContent = '$' + p.toLocaleString('en-US');
                    if (btcLink) {
                        const ch = data.bitcoin.usd_24h_change;
                        if (typeof ch === 'number') {
                            btcLink.classList.toggle('is-up', ch >= 0);
                            btcLink.classList.toggle('is-down', ch < 0);
                        }
                    }
                })
                .catch(function () { /* keep the $-- placeholder. */ });
        }
        // Review-2: don't poll CoinGecko sitewide for a price that only
        // shows inside the desk menu's Bitcoin-books hover card. Start
        // (and keep) the ticker on the first menu open instead.
        let btcStarted = false;
        function startBTC() {
            if (btcStarted) return;
            btcStarted = true;
            fetchBTC();
            setInterval(fetchBTC, 60 * 1000);
        }
        document.querySelectorAll('[data-menu-trigger]').forEach(function (t) {
            t.addEventListener('click', startBTC, { once: true });
        });
    }

    // If the menu DOM isn't on this page, bail after starting the clock.
    if (!trigger || !menu) return;

    // ---- Menu state + helpers ----
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let isOpen = false;
    let charsSplit = false; // cache: only split links once

    // Split every menu link's text into char spans so we can stagger
    // them in. Reuses the existing splitIntoCharSpans helper.
    function ensureCharsSplit() {
        if (charsSplit) return;
        const links = menu.querySelectorAll('.tc-menu__list a');
        links.forEach(function (link) { splitIntoCharSpans(link); });
        charsSplit = true;
    }

    function openMenu() {
        if (isOpen) return;
        isOpen = true;

        ensureCharsSplit();

        html.classList.add('tc-menu-open');
        menu.setAttribute('aria-hidden', 'false');
        trigger.setAttribute('aria-expanded', 'true');
        trigger.setAttribute('aria-label', 'Close menu');
        if (triggerLabel) triggerLabel.textContent = 'Close';

        if (reduceMotion) {
            // Snap-on. CSS reduced-motion rules already make .char visible.
            return;
        }

        // Animate each char into view. Reset state in case we're reopening.
        const chars = menu.querySelectorAll('.tc-menu__list a .char');
        gsap.set(chars, { opacity: 0, y: '110%' });
        const meta = menu.querySelectorAll('.tc-menu__meta-list a, .tc-menu__meta-label');
        gsap.set(meta, { opacity: 0, y: 12 });

        const tl = gsap.timeline();

        tl.to(chars, {
            opacity: 1,
            y: '0%',
            duration: 0.7,
            stagger: 0.018,
            ease: 'power3.out',
        }, 0.15);

        tl.to(meta, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.05,
            ease: 'power2.out',
        }, '-=0.3');

        // Move keyboard focus to the first menu link so tab order makes
        // sense for keyboard users.
        const firstLink = menu.querySelector('.tc-menu__list a');
        if (firstLink) firstLink.focus({ preventScroll: true });
    }

    function closeMenu() {
        if (!isOpen) return;
        isOpen = false;

        html.classList.remove('tc-menu-open');
        menu.setAttribute('aria-hidden', 'true');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.setAttribute('aria-label', 'Open menu');
        if (triggerLabel) triggerLabel.textContent = 'Menu';

        // Return focus to the trigger so the user keeps their place.
        trigger.focus({ preventScroll: true });
    }

    function toggleMenu() {
        if (isOpen) closeMenu(); else openMenu();
    }

    // ---- Bindings ----
    trigger.addEventListener('click', toggleMenu);

    if (backdrop) {
        backdrop.addEventListener('click', closeMenu);
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isOpen) closeMenu();
    });

    // Clicking any in-menu link should close the menu before navigation.
    // Same-page anchor links (#section) would otherwise leave the menu
    // hanging; off-site links close visually before the page unloads.
    menu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            closeMenu();
        });
    });
}

/**
 * Heritage page — chrome + scroll choreography.
 *
 * Only runs when .heritage-page is present on the document. Builds three
 * persistent UI elements at runtime and wires per-section scroll
 * triggers:
 *
 *   1. Top reading-progress bar — a thin colored stripe across the top of
 *      the viewport that fills as the user scrolls. Color smoothly
 *      transitions through each line's accent palette as the active
 *      section changes.
 *
 *   2. Vertical TOC on the left edge — five labeled dots, one per family
 *      line. The currently-in-view line's dot enlarges, picks up its
 *      accent color, and reveals its label. Click jumps to the section
 *      with smooth scroll.
 *
 *   3. Per-section reveals — each .heritage-line__title is split into
 *      character spans and animated in stagger when the section enters
 *      the viewport. Pull quotes (.heritage-line__quote) fade + slide
 *      into view on the same trigger.
 *
 * The IntersectionObserver picks "current" line as the one with the
 * highest visibility ratio in a 50%-from-top reading band; that drives
 * both the TOC active state and the progress-bar color.
 *
 * Sit-out conditions: no .heritage-page found.
 * Reduced motion: animations are skipped, but the chrome (TOC, progress
 * bar) still renders so reader orientation isn't lost.
 */
/**
 * Long-read chapter rail — a slim sticky nav built from the long-read's
 * chapter headings (uses each <h2>'s eyebrow as the label and its id as the
 * anchor). Highlights the current chapter via IntersectionObserver and
 * smooth-scrolls on click. No-ops on any page that isn't a long-read or that
 * has fewer than two chapters. Hidden under 1180px by CSS.
 */
/**
 * Long-read "Notes" cross-references.
 *
 * The manuscript prose links the phrase "Notes" to the collapsible Notes
 * appendix (#lr-notes) — see _md2heritage.js. Because that appendix is a
 * <details> that starts collapsed, a raw anchor jump would land on a closed
 * box. This opens it first, then glides to it; and it honours a #lr-notes
 * deep-link on arrival. No-ops on every page without the appendix.
 */
function initHeritageNotes() {
    const notes = document.getElementById('lr-notes');
    if (!notes) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.querySelectorAll('a[href$="#lr-notes"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
            e.preventDefault();
            notes.open = true;
            notes.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
            if (history.replaceState) { history.replaceState(null, '', '#lr-notes'); }
        });
    });

    // Someone arriving on a …#lr-notes URL: open it and settle the scroll
    // once layout has resolved (the browser's own jump landed on the closed
    // summary, so re-scroll after expanding).
    if (window.location.hash === '#lr-notes') {
        notes.open = true;
        requestAnimationFrame(function () {
            notes.scrollIntoView({ behavior: 'auto', block: 'start' });
        });
    }
}

/**
 * Heritage-tree chip tilt — pointer-tracked 3D rotation + a specular
 * sheen on the descent-diagram couple chips (.heritage-tree__couple,
 * rendered by treeHTML in _md2heritage.js). Same family as the
 * family-tree foil tilt: rotateX/rotateY follow the cursor around the
 * chip's centre, and --tree-mx/--tree-my drive the radial highlight in
 * CSS. No-ops on touch devices and under prefers-reduced-motion (the
 * CSS :hover fallback covers no-JS).
 */
function initHeritageTreeTilt() {
    const chips = document.querySelectorAll('.heritage-tree__couple');
    if (!chips.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    chips.forEach(function (chip) {
        chip.addEventListener('pointermove', function (e) {
            const r = chip.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width;
            const py = (e.clientY - r.top) / r.height;
            const ry = (px - 0.5) * 12;
            const rx = (0.5 - py) * 9;
            chip.style.transform =
                'perspective(700px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-4px)';
            chip.style.setProperty('--tree-mx', (px * 100).toFixed(1) + '%');
            chip.style.setProperty('--tree-my', (py * 100).toFixed(1) + '%');
        });
        chip.addEventListener('pointerleave', function () {
            chip.style.transform = '';
            chip.style.removeProperty('--tree-mx');
            chip.style.removeProperty('--tree-my');
        });
    });
}

/**
 * Heritage-tree fact dossiers — chips rendered with a "facts" array
 * (.heritage-tree__couple--facts) click-open to reveal a quick list of
 * the branch's important known facts. The 0fr->1fr grid transition in
 * CSS animates the height; aria-expanded tracks state; Enter/Space
 * work because the chip carries role="button" + tabindex from the
 * converter. Multiple chips may be open at once — the reader curates.
 */
function initHeritageTreeFacts() {
    const chips = document.querySelectorAll('.heritage-tree__couple--facts');
    if (!chips.length) return;

    chips.forEach(function (chip) {
        function toggle() {
            const open = chip.classList.toggle('is-open');
            chip.setAttribute('aria-expanded', open ? 'true' : 'false');
        }
        chip.addEventListener('click', toggle);
        chip.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle();
            }
        });
    });
}

// Family film reels — lite YouTube embeds on the heritage long-reads.
// The converter (videoHTML in _md2heritage.js) renders a facade only:
// the video's thumbnail, a play badge, and a CTA pill. Nothing from
// YouTube loads until the visitor clicks; then the facade is swapped
// for the privacy-enhanced youtube-nocookie iframe with autoplay.
// No-op on pages without a reel.
function initFilmReels() {
    const reels = document.querySelectorAll('.heritage-longread__filmreel');
    if (!reels.length) return;

    reels.forEach(function (reel) {
        function play() {
            if (reel.dataset.playing) return;
            reel.dataset.playing = '1';
            const frame = document.createElement('iframe');
            frame.src = 'https://www.youtube-nocookie.com/embed/' + reel.dataset.videoId + '?autoplay=1&rel=0';
            frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
            frame.allowFullscreen = true;
            frame.title = reel.getAttribute('aria-label') || 'Family video';
            reel.replaceChildren(frame);
            reel.classList.add('heritage-longread__filmreel--playing');
            reel.removeAttribute('role');
            reel.removeAttribute('tabindex');
        }
        reel.addEventListener('click', play);
        reel.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                play();
            }
        });
    });
}

function initLongreadChapterRail() {
    const lr = document.querySelector('.heritage-longread');
    if (!lr) return;
    const chapters = Array.from(lr.querySelectorAll('.heritage-longread__chapter')).filter(function (h) { return h.id; });
    if (chapters.length < 2) return;

    const rail = document.createElement('nav');
    rail.className = 'heritage-longread__rail';
    rail.setAttribute('aria-label', 'Chapters');
    const ul = document.createElement('ul');
    const linkById = {};

    chapters.forEach(function (h) {
        const eyebrow = h.querySelector('.heritage-longread__eyebrow');
        // Use the chapter's real title, not its "Chapter N" / "Prologue"
        // eyebrow. The heading is <span.eyebrow>Chapter One</span>Title, so
        // textContent concatenates the two — strip the eyebrow prefix.
        const full = h.textContent.trim();
        const eb = eyebrow ? eyebrow.textContent.trim() : '';
        let label = (eb && full.indexOf(eb) === 0) ? full.slice(eb.length).trim() : full;
        if (!label) label = eb;
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#' + h.id;
        a.textContent = label;
        a.addEventListener('click', function (e) {
            e.preventDefault();
            const t = document.getElementById(h.id);
            if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        li.appendChild(a);
        ul.appendChild(li);
        linkById[h.id] = a;
    });
    rail.appendChild(ul);
    lr.appendChild(rail);

    if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (!en.isIntersecting) return;
                Object.keys(linkById).forEach(function (id) { linkById[id].classList.remove('is-active'); });
                const link = linkById[en.target.id];
                if (link) link.classList.add('is-active');
            });
        }, { rootMargin: '0px 0px -68% 0px', threshold: 0 });
        chapters.forEach(function (h) { obs.observe(h); });
    }
}

/**
 * Left-side chapter TOC for the Thomas long-read (/family/thomas).
 * Builds a fixed nav from the chapter headings, assigns each an id,
 * smooth-scrolls on click, and highlights the active chapter on scroll.
 * Hidden on narrow viewports via CSS (no room beside the reading column).
 */
/**
 * Reading-progress bar (G4) for the long-form pages — heritage long-reads
 * and the Thomas page. A thin fixed bar at the very top fills left-to-right
 * as you scroll through the article body, tinted with the line accent. Pure
 * orientation affordance: no layout/content effect, scaleX transform only.
 */
function initReadingProgress() {
    var article = document.querySelector('.heritage-longread, .thomas-page');
    if (!article) return;
    var bar = document.createElement('div');
    bar.className = 'tc-read-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    var ticking = false;
    function update() {
        ticking = false;
        var top = article.getBoundingClientRect().top + window.scrollY;
        var total = article.offsetHeight - window.innerHeight;
        var pct = total > 0 ? (window.scrollY - top) / total : 0;
        pct = pct < 0 ? 0 : (pct > 1 ? 1 : pct);
        bar.style.transform = 'scaleX(' + pct + ')';
    }
    function onScroll() {
        if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
}

function initThomasTOC() {
    const page = document.querySelector('.thomas-page');
    if (!page) return;
    const headings = Array.from(page.querySelectorAll('.about-section__heading'));
    if (headings.length < 2) return;

    const toc = document.createElement('nav');
    toc.className = 'thomas-toc';
    toc.setAttribute('aria-label', 'Chapters');
    const ul = document.createElement('ul');
    const linkById = {};

    headings.forEach(function (h, i) {
        if (!h.id) {
            const slug = (h.textContent || ('s' + i)).toLowerCase()
                .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            h.id = 'thomas-ch-' + (slug || i);
        }
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#' + h.id;
        a.textContent = h.textContent.trim();
        a.addEventListener('click', function (e) {
            e.preventDefault();
            const t = document.getElementById(h.id);
            if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        li.appendChild(a);
        ul.appendChild(li);
        linkById[h.id] = a;
    });
    toc.appendChild(ul);
    document.body.appendChild(toc);

    if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (!en.isIntersecting) return;
                Object.keys(linkById).forEach(function (id) { linkById[id].classList.remove('is-active'); });
                if (linkById[en.target.id]) linkById[en.target.id].classList.add('is-active');
            });
        }, { rootMargin: '0px 0px -68% 0px', threshold: 0 });
        headings.forEach(function (h) { obs.observe(h); });
    }
}

/**
 * Bulletproof flipbook: ONE always-visible <img> whose src is swapped
 * through preloaded frames on a timer. No stacking, no opacity tricks, no
 * lazy-load — nothing that can render an empty (turquoise) box. Frames +
 * per-frame durations come from data attributes.
 */
function initFlipbook() {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var imgs = document.querySelectorAll('[data-flipbook] img[data-frames]');
    Array.prototype.forEach.call(imgs, function (img) {
        var frames, durs;
        try { frames = JSON.parse(img.getAttribute('data-frames')); } catch (e) { return; }
        try { durs = JSON.parse(img.getAttribute('data-durations')) || []; } catch (e) { durs = []; }
        if (!frames || frames.length < 2) return;
        // Preload every frame so the swaps are instant.
        frames.forEach(function (u) { var p = new Image(); p.src = u; });
        if (reduce) return;
        var i = 0;
        function step() {
            i = (i + 1) % frames.length;
            img.src = frames[i];
            setTimeout(step, durs[i] || 500);
        }
        setTimeout(step, durs[0] || 500);
    });
}

/**
 * Chapter rail (TOC) for the per-kid spoke pages — mirrors the Thomas
 * page's. Built from the section headings in the prose, with scroll-spy.
 * Styled in .person-toc (accent = the kid's --line-color); CSS hides it
 * when there isn't room beside the 1200px column.
 */
function initPersonSpokeTOC() {
    const page = document.querySelector('.person-spoke');
    if (!page) return;
    const headings = Array.from(page.querySelectorAll('.heritage-line__body h3'));
    if (headings.length < 2) return;

    const toc = document.createElement('nav');
    toc.className = 'person-toc';
    toc.setAttribute('aria-label', 'Chapters');
    const title = document.createElement('p');
    title.className = 'person-toc__title';
    title.textContent = 'On this page';
    toc.appendChild(title);
    const ul = document.createElement('ul');
    const linkById = {};

    headings.forEach(function (h, i) {
        if (!h.id) {
            const slug = (h.textContent || ('s' + i)).toLowerCase()
                .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            h.id = 'ch-' + (slug || i);
        }
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#' + h.id;
        a.textContent = h.textContent.trim();
        a.addEventListener('click', function (e) {
            e.preventDefault();
            const t = document.getElementById(h.id);
            if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        li.appendChild(a);
        ul.appendChild(li);
        linkById[h.id] = a;
    });
    toc.appendChild(ul);
    document.body.appendChild(toc);

    if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (!en.isIntersecting) return;
                Object.keys(linkById).forEach(function (id) { linkById[id].classList.remove('is-active'); });
                if (linkById[en.target.id]) linkById[en.target.id].classList.add('is-active');
            });
        }, { rootMargin: '0px 0px -68% 0px', threshold: 0 });
        headings.forEach(function (h) { obs.observe(h); });
    }
}

/**
 * Hover for the Thomas gallery. Tiles expand to 2x2 immediately on hover
 * (no intent delay). The expansion class (.is-expanded) drives the grid
 * span + the eased glow/caption/grow in CSS.
 */
function initThomasGalleryHover() {
    const page = document.querySelector('.thomas-page');
    if (!page) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const items = page.querySelectorAll('.thomas-gallery__item');
    if (!items.length) return;
    let current = null;
    items.forEach(function (it) {
        it.addEventListener('mouseenter', function () {
            if (current && current !== it) current.classList.remove('is-expanded');
            it.classList.add('is-expanded');
            current = it;
        });
        it.addEventListener('mouseleave', function () {
            it.classList.remove('is-expanded');
            if (current === it) current = null;
        });
    });
}

function initHeritagePage() {
    const page = document.querySelector('.heritage-page');
    if (!page) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const lines = Array.from(page.querySelectorAll('.heritage-line'));
    if (lines.length === 0) return;

    // Mark the page as JS-ready so the CSS pre-animation states
    // (.heritage-page--js .char { opacity: 0 } etc) take effect.
    page.classList.add('heritage-page--js');

    // ---- Build the top progress bar ----
    const progress = document.createElement('div');
    progress.className = 'heritage-progress';
    progress.setAttribute('aria-hidden', 'true');
    const progressFill = document.createElement('div');
    progressFill.className = 'heritage-progress__fill';
    progress.appendChild(progressFill);
    document.body.appendChild(progress);

    // ---- Build the vertical TOC ----
    // We read the line title's text content for each TOC item. Hash
    // links use the section's id attribute (already set in PHP).
    const toc = document.createElement('nav');
    toc.className = 'heritage-toc';
    toc.setAttribute('aria-label', 'Family lines');
    const tocList = document.createElement('ul');

    const lineMeta = lines.map(function (line) {
        const titleEl = line.querySelector('.heritage-line__title');
        const titleText = titleEl ? titleEl.textContent.trim() : '';
        const id = line.id || '';
        const accent = getComputedStyle(line).getPropertyValue('--line-color').trim()
                     || 'var(--primary-color)';
        return { line, id, title: titleText, accent };
    });

    lineMeta.forEach(function (meta) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#' + meta.id;
        a.dataset.lineId = meta.id;
        a.style.setProperty('--toc-color', meta.accent);

        const dot = document.createElement('span');
        dot.className = 'heritage-toc__dot';
        dot.setAttribute('aria-hidden', 'true');

        const label = document.createElement('span');
        label.className = 'heritage-toc__label';
        label.textContent = meta.title;

        a.appendChild(dot);
        a.appendChild(label);
        li.appendChild(a);
        tocList.appendChild(li);
    });

    toc.appendChild(tocList);
    document.body.appendChild(toc);

    // Smooth-scroll on TOC click. Default anchor jumps work but feel
    // abrupt; smooth lets the eye track which section is loading.
    toc.addEventListener('click', function (e) {
        const link = e.target.closest('a');
        if (!link) return;
        const targetId = link.dataset.lineId;
        const target = targetId ? document.getElementById(targetId) : null;
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // ---- Reveal the TOC after the user scrolls past the hero ----
    // Hero is .page-hero on this page; when its bottom passes the top
    // of the viewport, the TOC fades in. ScrollTrigger handles the
    // bookkeeping cleanly.
    const hero = page.querySelector('.page-hero');
    if (hero && typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.create({
            trigger: hero,
            start: 'bottom top',
            onEnter: function () { toc.classList.add('heritage-toc--visible'); },
            onLeaveBack: function () { toc.classList.remove('heritage-toc--visible'); },
        });
    } else {
        // Fallback if ScrollTrigger isn't loaded for some reason.
        toc.classList.add('heritage-toc--visible');
    }

    // ---- Progress bar fill + per-section reveals ----
    // Update the progress bar's width on scroll. Range: 0% at the top
    // of the .heritage-page, 100% at the bottom of the last line.
    function updateProgress() {
        const lastLine = lines[lines.length - 1];
        const start = page.getBoundingClientRect().top + window.scrollY;
        const end = lastLine.getBoundingClientRect().bottom + window.scrollY;
        const total = end - start;
        const scrolled = window.scrollY - start;
        const ratio = Math.max(0, Math.min(1, scrolled / total));
        progressFill.style.width = (ratio * 100).toFixed(2) + '%';
    }

    let scrollTicking = false;
    window.addEventListener('scroll', function () {
        if (!scrollTicking) {
            window.requestAnimationFrame(function () {
                updateProgress();
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    }, { passive: true });
    updateProgress();

    // ---- IntersectionObserver — track current line ----
    // Use a 50%-from-top "reading band" so a section becomes "current"
    // only when its content actually fills the reading position, not
    // when its top edge sneaks into view.
    const tocLinks = toc.querySelectorAll('a');

    function setActive(meta) {
        tocLinks.forEach(function (link) {
            link.classList.toggle('is-active', link.dataset.lineId === meta.id);
        });
        progress.style.setProperty('--heritage-progress-color', meta.accent);
    }

    const observer = new IntersectionObserver(function (entries) {
        // Among the entries currently intersecting, pick the one with
        // the highest intersectionRatio. (We can't trust the order
        // entries arrive in.)
        let best = null;
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                if (!best || entry.intersectionRatio > best.intersectionRatio) {
                    best = entry;
                }
            }
        });
        if (best) {
            const meta = lineMeta.find(function (m) { return m.line === best.target; });
            if (meta) setActive(meta);
        }
    }, {
        // Reading-band threshold: top 30% is dead, 30%-70% is the
        // band where intersection counts, bottom 30% is dead.
        rootMargin: '-30% 0px -30% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
    });

    lines.forEach(function (line) { observer.observe(line); });

    // ---- Title char splits + per-section ScrollTrigger reveals ----
    if (typeof ScrollTrigger !== 'undefined' && !reduceMotion) {
        lines.forEach(function (line) {
            const title = line.querySelector('.heritage-line__title');
            // ALL quotes in the section — a heritage spoke has at most one
            // per .heritage-line, but a long-read is a single giant line
            // holding a pull-quote per chapter plus blockquote asides.
            // Only animating the first left every later quote stuck at the
            // CSS pre-animation opacity: 0 (huge invisible voids in the
            // text column — surfaced by the figure-less Steinke page).
            const quotes = Array.from(line.querySelectorAll('.heritage-line__quote'));

            // Split title into chars (only if not already split — guards
            // against re-runs).
            let chars = [];
            if (title && !title.dataset.split) {
                chars = splitIntoCharSpans(title);
                title.dataset.split = '1';
            }

            // Build a per-section timeline. Title chars first in stagger,
            // then the first pull quote slides + fades in slightly behind
            // (preserves the spoke pages' choreography).
            const tl = gsap.timeline({
                paused: true,
                defaults: { ease: 'power3.out' },
            });

            if (chars.length) {
                tl.to(chars, {
                    opacity: 1,
                    y: '0%',
                    duration: 0.7,
                    stagger: 0.025,
                });
            }

            if (quotes.length) {
                tl.to(quotes[0], {
                    opacity: 1,
                    x: 0,
                    duration: 0.8,
                    ease: 'power2.out',
                }, '-=0.4');
            }

            ScrollTrigger.create({
                trigger: line,
                start: 'top 75%',
                once: true,
                onEnter: function () { tl.play(); },
            });

            // Every quote after the first reveals on its own scroll
            // trigger, as the reader reaches it.
            quotes.slice(1).forEach(function (q) {
                gsap.to(q, {
                    opacity: 1,
                    x: 0,
                    duration: 0.8,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: q,
                        start: 'top 88%',
                        once: true,
                    },
                });
            });
        });
    } else {
        // Reduced motion (or ScrollTrigger missing) — un-hide the
        // animated elements immediately so nothing stays invisible.
        lines.forEach(function (line) {
            line.querySelectorAll('.heritage-line__quote').forEach(function (quote) {
                quote.style.opacity = '1';
                quote.style.transform = 'none';
            });
        });
    }
}

/* ============================================================
 * HERO PORTRAIT CAROUSEL — the order ticket cycles through the
 * photos one at a time. Each swap: the current photo gets .is-leaving
 * (drops away), the next gets .is-active (swings in from the clip), and
 * the handwritten caption (data-cap) fades over to match. Rotation
 * dwells ~5.5s and PAUSES on hover/focus so a visitor can linger.
 * Fewer than two photos → nothing to do. Under prefers-reduced-motion
 * the CSS flattens the swing to a plain crossfade (it still rotates).
 * ========================================================== */
document.addEventListener('DOMContentLoaded', function () {
    var box = document.querySelector('.hero-portrait');
    if (!box) return;
    var imgs = Array.prototype.slice.call(box.querySelectorAll('.hero-portrait__img'));
    if (imgs.length < 2) return;

    var cap = document.querySelector('.hero-ticket__cap');
    var i = 0;
    var timer = null;
    var DWELL = 5500;

    function show(next) {
        if (next === i) return;
        var cur = imgs[i];
        var nx = imgs[next];

        cur.classList.remove('is-active');
        cur.classList.add('is-leaving');
        // drop the leaving class after the full turn so it resets edge-on
        (function (el) {
            setTimeout(function () { el.classList.remove('is-leaving'); }, 1000);
        })(cur);

        nx.classList.add('is-active');

        if (cap) {
            var c = nx.getAttribute('data-cap') || '';
            cap.style.opacity = '0';
            // change the caption while the card is edge-on (mid-turn)
            setTimeout(function () {
                cap.textContent = c;
                cap.style.opacity = '';
            }, 420);
        }
        i = next;
    }

    function advance() { show((i + 1) % imgs.length); }
    function start() { if (!timer) timer = setInterval(advance, DWELL); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    var ticket = document.querySelector('.hero-ticket') || box;
    ticket.addEventListener('mouseenter', stop);
    ticket.addEventListener('mouseleave', start);
    ticket.addEventListener('focusin', stop);
    ticket.addEventListener('focusout', start);

    start();
});
