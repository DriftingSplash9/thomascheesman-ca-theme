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

document.addEventListener('DOMContentLoaded', function () {
    initWebGLBackground();
    initSiteChrome();
    initKineticHero();
    initHeroScrollOut();
    initPillarReveal();
    initFamilyTreeReveal();
    initFamilyTreeLeaves();
    initFigureKenBurns();
    initLightbox();
    initBlogReveal();
    initScrollReveals();
    initHeritagePage();
    initInkTrail();
    initParticleField();
    initCustomCursor();
    initMagneticElements();
    initTimelinePage();
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
    const heroSubtitle = document.querySelector('.kinetic-fade');

    if (!heroTitle) return;

    if (reduceMotion) {
        // CSS @media block already revealed the content. Nothing to do.
        return;
    }

    const chars = splitIntoCharSpans(heroTitle);

    const tl = gsap.timeline({ delay: 0.2 });

    tl.to(chars, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.035,
        ease: 'power3.out',
    });

    if (heroSubtitle) {
        tl.to(heroSubtitle, {
            opacity: 1,
            y: 0,
            duration: 0.8,
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
function initLightbox() {
    const candidates = document.querySelectorAll('main img');
    if (candidates.length === 0) return;

    let wrappedCount = 0;
    candidates.forEach((img) => {
        if (img.classList.contains('no-lightbox')) return;
        if (img.classList.contains('family-tree__image')) return;
        // Skip if the img is anywhere inside an <a> — covers heritage hub
        // cards (<a><div><img></div></a>) where the immediate parent is
        // a div, not the anchor itself.
        if (img.closest('a')) return;

        const a = document.createElement('a');
        a.className = 'lightbox-link';
        a.href = img.currentSrc || img.src;
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
        img.parentNode.insertBefore(a, img);
        a.appendChild(img);

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

        wrappedCount += 1;
    });

    if (wrappedCount === 0) return;

    import('https://unpkg.com/photoswipe@5.4.4/dist/photoswipe-lightbox.esm.js')
        .then(({ default: PhotoSwipeLightbox }) => {
            const lightbox = new PhotoSwipeLightbox({
                gallery: '#primary',
                children: 'a.lightbox-link[data-pswp-width]',
                pswpModule: () => import('https://unpkg.com/photoswipe@5.4.4/dist/photoswipe.esm.js'),
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
        })
        .catch((err) => {
            console.warn('PhotoSwipe failed to load — image clicks fall back to direct image URLs.', err);
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
    // Homepage and per-person pages get particles — atmosphere for the
    // hero on the homepage, and identity layer over the WebGL tint on
    // each kid's page. Heritage spokes and other pages stay clean.
    const isHome = document.body.classList.contains('home');
    const isPersonSpoke = !!document.querySelector('.person-spoke');
    if (!isHome && !isPersonSpoke) return;

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

    // ---- Constants shared across layers ----
    const ATTRACT_RADIUS   = 180;
    const ATTRACT_STRENGTH = 0.025;    // halved per request
    const CONNECT_DISTANCE = 180;
    const DAMPING          = 0.97;
    const MAX_VEL_BASE     = 1.6;      // ~35% reduction
    const DRIFT_FORCE      = 0.006;    // halved so layer wind doesn't dominate
    const NOISE_FORCE      = 0.08;     // per-frame Brownian kick (new)
    const CONN_PHASE_FREQ  = 0.000314; // ~20s period
    const CONN_PHASE_GATE  = 0.7;      // sin > 0.7 → wants 2 connections

    // ---- Per-layer config (count cut 25%, alphas reduced) ----
    const LAYERS = [
        { count: 30, speed: 0.6, scrollFactor: 0.2, size: 0.8, pAlpha: 0.12, lAlpha: 0.05 },
        { count: 30, speed: 1.0, scrollFactor: 0.5, size: 1.0, pAlpha: 0.18, lAlpha: 0.07 },
        { count: 30, speed: 1.5, scrollFactor: 0.8, size: 1.4, pAlpha: 0.25, lAlpha: 0.09 },
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
                    ctx.strokeStyle = 'rgba(200, 220, 255, ' + alpha + ')';
                    ctx.beginPath();
                    ctx.moveTo(p.x, pRenderY);
                    ctx.lineTo(c.x, c.y);
                    ctx.stroke();
                }
            }

            // --- Particles ---
            ctx.fillStyle = 'rgba(220, 230, 255, ' + layer.pAlpha + ')';
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
 * Custom cursor — two layers: a sharp inner dot that follows tightly and
 * a slower outer ring that trails behind. On hover of any interactive
 * element the ring expands and gets a subtle fill.
 *
 * The OS cursor is hidden site-wide via the `cursor-custom` class on the
 * <html> element (toggled here). Inputs/textareas restore their text
 * cursor via a CSS override so typing still feels normal.
 *
 * Both dot and ring are positioned via `transform: translate(x, y)` plus
 * a `translate(-50%, -50%)` to center on the cursor point. Uses one rAF
 * loop for both layers so we're not running multiple loops in parallel.
 *
 * Sit-out conditions: prefers-reduced-motion or coarse pointer (touch).
 */
function initCustomCursor() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    document.documentElement.classList.add('cursor-custom');

    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    dot.setAttribute('aria-hidden', 'true');
    document.body.appendChild(dot);

    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    ring.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ring);

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const dotPos = { x: target.x, y: target.y };
    const ringPos = { x: target.x, y: target.y };

    document.addEventListener('mousemove', function (e) {
        target.x = e.clientX;
        target.y = e.clientY;
    });

    // Hover detection. mouseover/mouseout are used (not mouseenter) so we
    // get a single bubbling listener instead of one per element. The
    // relatedTarget check prevents flicker when the cursor moves between
    // adjacent interactive elements.
    const hoverSelector = 'a, button, .magnetic, [data-magnetic], .btn-primary, .btn-secondary';

    document.addEventListener('mouseover', function (e) {
        if (e.target.closest && e.target.closest(hoverSelector)) {
            ring.classList.add('cursor-ring--hover');
        }
    });

    document.addEventListener('mouseout', function (e) {
        if (!e.target.closest || !e.target.closest(hoverSelector)) return;
        const movingTo = e.relatedTarget && e.relatedTarget.closest
            ? e.relatedTarget.closest(hoverSelector)
            : null;
        if (!movingTo) ring.classList.remove('cursor-ring--hover');
    });

    function update() {
        // Tight lerp on the dot — sharp follow.
        dotPos.x += (target.x - dotPos.x) * 0.5;
        dotPos.y += (target.y - dotPos.y) * 0.5;
        // Slow lerp on the ring — visible lag.
        ringPos.x += (target.x - ringPos.x) * 0.15;
        ringPos.y += (target.y - ringPos.y) * 0.15;

        dot.style.transform = 'translate(' + dotPos.x + 'px, ' + dotPos.y + 'px) translate(-50%, -50%)';
        ring.style.transform = 'translate(' + ringPos.x + 'px, ' + ringPos.y + 'px) translate(-50%, -50%)';

        requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
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
        zIndex: '-1',
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
    };

    // Per-page WebGL tint. The .person-spoke--{name} body class on each
    // kid's page sets --line-color via :has() in style.css; we read it
    // here and pass it to the shader. Multiplied down to ~0.4 brightness
    // so the saturated kid accents (purple/green/pink) don't blow out
    // the wash — the original indigo had effective brightness ~0.34.
    const tintFromCss = getComputedStyle(document.body).getPropertyValue('--line-color').trim();
    if (tintFromCss) {
        try {
            const c = new THREE.Color(tintFromCss);
            c.multiplyScalar(0.4);
            uniforms.uTint.value = c;
        } catch (err) {
            console.warn('[TC] --line-color value not parseable as a color:', tintFromCss);
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
            vec3 cyan = vec3(0.133, 0.827, 0.933);    // #22D3EE
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
    const MAX_AGE = 510; // ms before a sample expires

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

        if (points.length >= 2) {
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = '#ffffff';

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
            const quote = line.querySelector('.heritage-line__quote');

            // Split title into chars (only if not already split — guards
            // against re-runs).
            let chars = [];
            if (title && !title.dataset.split) {
                chars = splitIntoCharSpans(title);
                title.dataset.split = '1';
            }

            // Build a per-section timeline. Title chars first in stagger,
            // then the pull quote slides + fades in slightly behind.
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

            if (quote) {
                tl.to(quote, {
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
        });
    } else {
        // Reduced motion (or ScrollTrigger missing) — un-hide the
        // animated elements immediately so nothing stays invisible.
        lines.forEach(function (line) {
            const quote = line.querySelector('.heritage-line__quote');
            if (quote) {
                quote.style.opacity = '1';
                quote.style.transform = 'none';
            }
        });
    }
}

/**
 * Timeline page — pinned parallax stage with vertical-scroll-driven
 * horizontal pan, side-profile jeep with three content windows, curving
 * road, easter-egg roadside markers that open a projector lightbox, and
 * a capsule swap (year + compass) that activates only on this page.
 *
 * Architecture:
 *   - Bails immediately if [data-timeline-root] isn't on the page.
 *   - Adds body.page-timeline so CSS can morph the capsule for this page.
 *   - Reads embedded JSON event data (server-rendered) to drive beats.
 *   - Single rAF loop owns: lerp-smoothed scroll progress, road-tangent
 *     compass, year odometer, jeep prose/image cross-fade beats, and
 *     marker positioning along the SVG road path.
 *   - Lerp factor 0.10 means even violent mouse-wheel-flicks resolve
 *     into a smooth glide; reading speed is enforced by the easing.
 *
 * The projector lightbox is a separate component from the sitewide
 * PhotoSwipe (initLightbox) — different aesthetic, different chrome,
 * shared nav contract. Markers wire their click → open() here.
 */
function initTimelinePage() {
    const root = document.querySelector('[data-timeline-root]');
    if (!root) return;

    document.body.classList.add('page-timeline');

    // ---- Parse server-rendered event data ----
    const dataEl = root.querySelector('[data-timeline-data]');
    let events = [];
    try {
        events = JSON.parse(dataEl ? dataEl.textContent : '[]');
    } catch (e) {
        return;
    }
    if (!Array.isArray(events) || !events.length) return;

    // ---- Capsule swap — inject year + compass into existing chrome ----
    injectCapsuleTimelineChrome();
    const yearCapsuleEl = document.querySelector('[data-tl-year]');

    // ---- DOM refs (all optional — bail individually) ----
    const roadPath  = root.querySelector('[data-road-path]');
    const passenger = root.querySelector('[data-jeep-passenger]');
    const titleEl   = root.querySelector('[data-jeep-title]');
    const proseEl   = root.querySelector('[data-jeep-prose]');
    const yearJeepEl= root.querySelector('[data-jeep-year]');
    const rearEl    = root.querySelector('[data-jeep-rear]');
    const jeepEl    = root.querySelector('[data-jeep]');
    const polaroidEl       = root.querySelector('[data-polaroid]');
    const polaroidImgEl    = root.querySelector('[data-polaroid-img]');
    const polaroidCaptionEl= root.querySelector('[data-polaroid-caption]');
    const markers   = Array.from(root.querySelectorAll('[data-marker]'));
    const finaleFrames = Array.from(root.querySelectorAll('[data-finale-frame]'))
        .sort(function (a, b) {
            return parseInt(a.dataset.finaleFrame, 10) - parseInt(b.dataset.finaleFrame, 10);
        });
    // Slide centers for the home-photo slideshow, ordered by data-finale-frame
    // index (2012 → 2022 → 2025 → 2026). Year-weighted positions so each
    // image lands roughly where its year shows on the counter. 2009 photo
    // dropped — Thomas didn't live in the house yet.
    const FINALE_SLIDE_POSITIONS = [0.70, 0.86, 0.93, 0.99];
    const FINALE_FIRST_BAND_START = 0.62;

    // ---- Projector lightbox ----
    const projector = root.querySelector('[data-projector]');
    const projectorApi = projector ? createProjectorLightbox(projector) : null;

    // Wire each marker's click to the lightbox. If the event has no
    // easter-egg media (`mark.eg`), open with a placeholder card.
    markers.forEach(function (m) {
        m.addEventListener('click', function () {
            if (!projectorApi) return;
            const pos = parseFloat(m.dataset.markerPos);
            const evt = events.find(function (e) {
                return e.mark && Math.abs(e.pos - pos) < 0.001;
            });
            const items = (evt && evt.mark && Array.isArray(evt.mark.eg) && evt.mark.eg.length)
                ? evt.mark.eg
                : [{
                      type: 'placeholder',
                      caption: (evt && evt.mark && evt.mark.label) || 'Memory in transit',
                  }];
            projectorApi.open(items, 0);
        });
    });

    // ---- Lerp scroll loop state ----
    const html = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let targetProgress = 0;
    let easedProgress  = 0;
    let totalSpin      = 0;
    let currentBeatIndex = -1;
    let beatTimer = null;
    let rafId = 0;
    let isVisible = !document.hidden;

    // Reduced motion: skip lerp, snap to scroll, no idle wheel rotation.
    // 0.06 = ~280ms to settle from a wheel-flick; smooth enough to read,
    // responsive enough not to feel sluggish on slow input.
    const lerpFactor = reduceMotion ? 1 : 0.06;
    const wheelFloorPerFrame = reduceMotion ? 0 : 0.4;

    function tick() {
        if (!isVisible) return;

        // --- Compute target progress from current scroll geometry ---
        const rect = root.getBoundingClientRect();
        const scrollable = root.offsetHeight - window.innerHeight;
        targetProgress = scrollable > 0
            ? Math.max(0, Math.min(1, -rect.top / scrollable))
            : 0;

        // --- Lerp ---
        const prev = easedProgress;
        easedProgress += (targetProgress - easedProgress) * lerpFactor;
        const dProgress = easedProgress - prev;

        // Wheel rotation accumulates. Velocity-driven plus a small idle
        // floor so the jeep never looks parked while the page is open.
        totalSpin += dProgress * 14000 + wheelFloorPerFrame;

        // --- Publish to CSS custom properties ---
        html.style.setProperty('--tl-progress',     targetProgress.toFixed(4));
        html.style.setProperty('--tl-prog-eased',   easedProgress.toFixed(4));
        html.style.setProperty('--tl-wheel-spin',   totalSpin.toFixed(1) + 'deg');

        // --- Compass (road-tangent direction) ---
        // Once the home-era slideshow starts at 0.55, lock the compass
        // to north. The house faces south — the photo POV is looking
        // north, so the needle settles on N as the home era takes over.
        if (easedProgress >= 0.55) {
            html.style.setProperty('--tl-compass-deg', '0deg');
        } else if (roadPath) {
            try {
                const len = roadPath.getTotalLength();
                const t   = easedProgress * len;
                const p1  = roadPath.getPointAtLength(t);
                const p2  = roadPath.getPointAtLength(Math.min(len, t + 1));
                // SVG y-axis is inverted vs. screen up. atan2 returns angle
                // in radians where 0 = pointing right (east). We want
                // needle convention where 0deg = up (north) and rotation
                // increases clockwise. So east => 90deg, road-rising
                // (negative SVG dy) => slightly less than 90 (NE).
                const angRad = Math.atan2(p2.y - p1.y, p2.x - p1.x);
                const compassDeg = (angRad * 180 / Math.PI) + 90;
                html.style.setProperty('--tl-compass-deg', compassDeg.toFixed(1) + 'deg');
            } catch (e) { /* path may not be ready */ }
        }

        // --- Beat update (which event's prose should be shown?) ---
        // Prose for event[i] is active across the *approach* to event[i] —
        // from the moment we leave event[i-1] until event[i]'s marker
        // passes the jeep. Trigger is event[i-1].pos so "Headed to X" is
        // shown the entire time X's sign is approaching from the right,
        // and flips to event[i+1] the instant X's sign passes under the jeep.
        let idx = 0;
        for (let i = 0; i < events.length; i++) {
            const trigger = (i === 0) ? 0 : events[i - 1].pos;
            if (trigger <= easedProgress) idx = i;
            else break;
        }
        if (idx !== currentBeatIndex) {
            crossFadeToBeat(idx);
            currentBeatIndex = idx;
        }

        // --- Year odometer in capsule ---
        // Locked to the named event's year — discrete jumps at every prose
        // flip, no interpolation. Year and prose always align.
        if (yearCapsuleEl) {
            yearCapsuleEl.textContent = String(events[idx].yearStart);
        }

        // --- Position markers along the SVG road ---
        positionMarkers();

        // --- Jeep follows the road when shrunk ---
        // The jeep slides leftward across the viewport as it shrinks
        // (CSS sets left:50% → 10% via --jeep-shrink). Compute the road
        // path's progress at the jeep's CURRENT visual viewport-x:
        //
        //   road translates so the path point at progress P sits at
        //   viewport_x = 75vw. The jeep's visual center sits at:
        //     50vw - (jeepShrink * 40vw)
        //   so the path point at the jeep's x corresponds to:
        //     P_path = easedProgress + (jeep_x_vw - 75) / 300
        //
        // Sample the road at that path-progress and write the screen-y
        // (in vh from bottom) to --jeep-road-y. CSS interpolates the
        // jeep's `bottom` between the fixed 6vh (full size) and this
        // value (small size) using --jeep-shrink as the mix factor.
        if (roadPath && jeepEl) {
            const svg = roadPath.ownerSVGElement;
            if (svg) {
                const rect = svg.getBoundingClientRect();
                if (rect.height > 0) {
                    try {
                        const len = roadPath.getTotalLength();
                        const vbox = svg.viewBox.baseVal;
                        const jeepShrink = Math.max(0, Math.min(1, (easedProgress - 0.65) * 20));
                        const jeepCenterVw = 50 - jeepShrink * 40;
                        const pPath = Math.max(0, Math.min(1,
                            easedProgress + (jeepCenterVw - 75) / 300
                        ));
                        const t  = pPath * len;
                        const pt = roadPath.getPointAtLength(t);
                        const cy = rect.top + (pt.y - vbox.y) * (rect.height / vbox.height);
                        const fromBottomVh = (window.innerHeight - cy) / window.innerHeight * 100;
                        // -2vh empirical wheel offset.
                        jeepEl.style.setProperty('--jeep-road-y', (fromBottomVh - 2).toFixed(1) + 'vh');
                    } catch (e) { /* path not ready */ }
                }
            }
        }

        // --- Home finale slideshow: per-frame opacity using an asymmetric
        // trapezoidal profile. Each slide is fully opaque for the second
        // half of its leftward range and the first half of its rightward
        // range, ramping to 0 at the midpoint with each neighbor — so
        // adjacent slides crossfade through their midpoint with summed
        // opacity ≈ 1. The last slide holds at 1 past its center so the
        // 2026 photo is the resting frame.
        if (finaleFrames.length) {
            const N = FINALE_SLIDE_POSITIONS.length;
            for (let i = 0; i < N; i++) {
                if (!finaleFrames[i]) continue;
                const center = FINALE_SLIDE_POSITIONS[i];
                const leftMid = i === 0
                    ? FINALE_FIRST_BAND_START
                    : (FINALE_SLIDE_POSITIONS[i - 1] + center) / 2;
                const rightMid = i === N - 1
                    ? 1.5  // sentinel; last slide holds at 1 past its center
                    : (center + FINALE_SLIDE_POSITIONS[i + 1]) / 2;

                let op;
                if (i === N - 1 && easedProgress >= center) {
                    op = 1;
                } else if (easedProgress < leftMid || easedProgress > rightMid) {
                    op = 0;
                } else if (easedProgress <= center) {
                    const leftHalf = center - leftMid;
                    const t = (easedProgress - leftMid) / leftHalf;
                    op = Math.min(1, t * 2);
                } else {
                    const rightHalf = rightMid - center;
                    const t = (rightMid - easedProgress) / rightHalf;
                    op = Math.min(1, t * 2);
                }
                finaleFrames[i].style.opacity = op.toFixed(3);
            }
        }

        rafId = requestAnimationFrame(tick);
    }

    /**
     * Cross-fade the jeep windows to the new beat. Time-based, not
     * scroll-based — once the fade-out starts, the swap happens 450ms
     * later regardless of how the user is scrolling. Reading rhythm is
     * preserved.
     */
    function crossFadeToBeat(idx) {
        const evt = events[idx];
        if (!evt) return;

        if (passenger) passenger.style.setProperty('--beat-passenger-opacity', '0');
        if (rearEl)    rearEl.style.setProperty('--beat-rear-opacity', '0');

        // Hide the polaroid first so the next event's image can drop in
        // cleanly. (If the next event has no image, it stays hidden.)
        if (polaroidEl) polaroidEl.classList.remove('timeline-polaroid--visible');

        if (beatTimer) clearTimeout(beatTimer);
        beatTimer = setTimeout(function () {
            if (yearJeepEl) yearJeepEl.textContent = evt.year || '';
            if (titleEl)    titleEl.textContent    = evt.title || '';
            if (proseEl)    proseEl.textContent    = evt.prose || '';

            if (rearEl) {
                if (evt.image) {
                    rearEl.style.backgroundImage = 'url("' + evt.image + '")';
                } else {
                    rearEl.style.backgroundImage = '';
                }
            }

            // Polaroid drop — only when this event has a paired image.
            // Random landing position + rotation so each one feels like a
            // photo tossed onto a craft-album page.
            if (polaroidEl && polaroidImgEl) {
                if (evt.image) {
                    polaroidImgEl.src = evt.image;
                    if (polaroidCaptionEl) {
                        polaroidCaptionEl.textContent = evt.year || '';
                    }
                    const rotDeg = (Math.random() - 0.5) * 16;          // -8° to +8°
                    const xVw    = 28 + Math.random() * 44;             // 28vw – 72vw
                    const yVh    = 26 + Math.random() * 32;             // 26vh – 58vh
                    polaroidEl.style.setProperty('--polaroid-rot', rotDeg.toFixed(1) + 'deg');
                    polaroidEl.style.setProperty('--polaroid-x', xVw.toFixed(1) + 'vw');
                    polaroidEl.style.setProperty('--polaroid-y', yVh.toFixed(1) + 'vh');
                    // Force a frame so the transition picks up the new transform values.
                    requestAnimationFrame(function () {
                        polaroidEl.classList.add('timeline-polaroid--visible');
                    });
                }
            }

            if (passenger) passenger.style.setProperty('--beat-passenger-opacity', '1');
            if (rearEl)    rearEl.style.setProperty('--beat-rear-opacity', '1');
        }, 450);
    }

    /**
     * Compute each marker's screen position from its --pos along the
     * road's SVG path. Runs every frame because the road's getBoundingClientRect
     * shifts as the road element translates.
     */
    function positionMarkers() {
        if (!roadPath || !markers.length) return;
        const svg = roadPath.ownerSVGElement;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const len = roadPath.getTotalLength();
        // Read viewBox dynamically so the math survives template edits to
        // the SVG dimensions (lead-in / lead-out extensions, etc.).
        const vbox = svg.viewBox.baseVal;
        const scaleX = rect.width  / vbox.width;
        const scaleY = rect.height / vbox.height;

        markers.forEach(function (m) {
            const pos = parseFloat(m.dataset.markerPos);
            if (isNaN(pos)) return;
            try {
                const pt = roadPath.getPointAtLength(pos * len);
                const cx = rect.left + (pt.x - vbox.x) * scaleX;
                const cy = rect.top  + (pt.y - vbox.y) * scaleY;
                m.style.setProperty('--m-x', (cx / window.innerWidth  * 100).toFixed(2) + 'vw');
                m.style.setProperty('--m-y', (cy / window.innerHeight * 100).toFixed(2) + 'vh');
                // Hide markers that fall well outside the viewport so we
                // don't trigger their hover styles off-screen.
                const inView = cx > -200 && cx < window.innerWidth + 200;
                m.style.opacity = inView ? '1' : '0';
                m.style.pointerEvents = inView ? 'auto' : 'none';
            } catch (e) { /* path geometry not ready */ }
        });
    }

    // ---- Visibility / focus management (perf) ----
    document.addEventListener('visibilitychange', function () {
        isVisible = !document.hidden;
        if (isVisible) {
            rafId = requestAnimationFrame(tick);
        } else {
            cancelAnimationFrame(rafId);
        }
    });

    // ---- Boot ----
    rafId = requestAnimationFrame(tick);
}

/**
 * Insert the year-odometer and compass-rose elements into the existing
 * .tc-capsule__clock, replacing the time/zone visually (CSS hides the
 * defaults on body.page-timeline). Header.php stays pristine.
 */
function injectCapsuleTimelineChrome() {
    const clock = document.querySelector('.tc-capsule__clock');
    if (!clock) return;
    if (clock.querySelector('[data-tl-year]')) return; // idempotent

    const yearEl = document.createElement('span');
    yearEl.className = 'tc-capsule__year';
    yearEl.setAttribute('data-tl-year', '');
    yearEl.textContent = '1980';
    clock.appendChild(yearEl);

    const compass = document.createElement('span');
    compass.className = 'tc-capsule__compass';
    compass.setAttribute('data-tl-compass', '');
    compass.setAttribute('aria-hidden', 'true');

    const needle = document.createElement('span');
    needle.className = 'tc-capsule__compass-needle';
    compass.appendChild(needle);

    clock.appendChild(compass);
}

/**
 * Projector lightbox — opens with a list of media items, supports prev /
 * next / close and keyboard nav. Items are { type, src, caption, alt }
 * objects; `type === 'placeholder'` renders a subtle "memory in transit"
 * card so a marker still feels clickable before media is wired in.
 *
 * This is intentionally separate from the sitewide PhotoSwipe lightbox.
 * The projector aesthetic (night, beam, screen, flicker) is part of the
 * timeline page's voice, not a generic media-viewer.
 */
function createProjectorLightbox(root) {
    const media   = root.querySelector('[data-projector-media]');
    const caption = root.querySelector('[data-projector-caption]');
    const counter = root.querySelector('[data-projector-counter]');
    const closeBtn= root.querySelector('[data-projector-close]');
    const prevBtn = root.querySelector('[data-projector-prev]');
    const nextBtn = root.querySelector('[data-projector-next]');
    const night   = root.querySelector('.timeline-projector__night');

    let items = [];
    let index = 0;

    function open(itemList, startIndex) {
        items = Array.isArray(itemList) ? itemList : [];
        index = Math.max(0, Math.min(items.length - 1, startIndex || 0));
        root.setAttribute('aria-hidden', 'false');
        document.documentElement.classList.add('tc-projector-open');
        render();
        document.addEventListener('keydown', onKey);
    }

    function close() {
        root.setAttribute('aria-hidden', 'true');
        document.documentElement.classList.remove('tc-projector-open');
        if (media) media.innerHTML = '';
        document.removeEventListener('keydown', onKey);
    }

    function nav(delta) {
        if (!items.length) return;
        index = (index + delta + items.length) % items.length;
        render();
    }

    function render() {
        if (!media) return;
        media.innerHTML = '';
        const item = items[index];

        if (!item) {
            if (caption) caption.textContent = '';
            if (counter) counter.textContent = '0 / 0';
            return;
        }

        if (item.type === 'video' && item.src) {
            const v = document.createElement('video');
            v.src = item.src;
            v.controls = true;
            v.autoplay = true;
            v.loop = !!item.loop;
            v.playsInline = true;
            media.appendChild(v);
        } else if (item.type === 'image' && item.src) {
            const img = document.createElement('img');
            img.src = item.src;
            img.alt = item.alt || '';
            media.appendChild(img);
        } else {
            // Placeholder card — keeps the marker clickable before media
            // is wired in. Reads as deliberate, not broken.
            const ph = document.createElement('div');
            ph.style.cssText = 'width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#c2a76a;font:500 16px/1.4 Italiana, Georgia, serif;letter-spacing:0.12em;text-transform:uppercase;text-align:center;padding:30px;';
            ph.textContent = item.caption || 'Memory in transit';
            media.appendChild(ph);
        }

        if (caption) caption.textContent = item.caption || '';
        if (counter) {
            counter.textContent = String(index + 1).padStart(2, '0') + ' / ' +
                                  String(items.length).padStart(2, '0');
        }
    }

    function onKey(e) {
        if (e.key === 'Escape')      close();
        else if (e.key === 'ArrowLeft')  nav(-1);
        else if (e.key === 'ArrowRight') nav(1);
    }

    if (closeBtn) closeBtn.addEventListener('click', close);
    if (prevBtn)  prevBtn.addEventListener('click', function () { nav(-1); });
    if (nextBtn)  nextBtn.addEventListener('click', function () { nav(1); });

    // Click on the night backdrop or root (outside the screen) closes.
    root.addEventListener('click', function (e) {
        if (e.target === root || e.target === night) close();
    });

    return { open: open, close: close };
}

