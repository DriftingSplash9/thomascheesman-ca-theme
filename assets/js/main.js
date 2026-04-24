/**
 * TC 'ventures Main JavaScript
 * Handles animations, interactions, and GSAP effects
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('TC Ventures theme loaded');
    
    // Initialize animations
    initAnimations();
    
    // Initialize scroll effects
    initScrollEffects();
});

/**
 * Initialize GSAP animations
 * (GSAP will be loaded from CDN in the functions.php)
 */
function initAnimations() {
    // Hero fade-in animation
    const hero = document.querySelector('.hero-section');
    if (hero) {
        gsap.from(hero, {
            duration: 1,
            opacity: 0,
            y: 30,
            ease: 'power2.out'
        });
    }
}

/**
 * Initialize scroll-triggered effects
 */
function initScrollEffects() {
    // Will be enhanced with ScrollTrigger
    const sections = document.querySelectorAll('.scroll-animate');
    
    sections.forEach((section) => {
        gsap.from(section, {
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                markers: false
            },
            duration: 0.8,
            opacity: 0,
            y: 40,
            ease: 'power2.out'
        });
    });
}