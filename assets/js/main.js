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
    initKineticHero();
    initScrollReveals();
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

    const heroTitle = document.querySelector('.hero-title.kinetic-text');
    const heroSubtitle = document.querySelector('.hero-subtitle.kinetic-fade');

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
