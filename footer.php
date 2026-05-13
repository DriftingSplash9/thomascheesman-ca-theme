<?php
/**
 * Custom Footer Template — TC 'ventures Child Theme
 *
 * The footer was previously a stylised passport (companion piece to the
 * old BHAG "trip" metaphor). C5 of the desk-menu rebuild retired it
 * entirely — the new metaphor is "the site is a thing on Thomas's
 * monitor," so there's no narrative role for a footer.
 *
 * What remains:
 *   1. A minimal floating "back to the desk" button (bottom-left).
 *      It carries [data-menu-trigger], so desk-menu.js binds to it and
 *      opens the desk overlay — same affordance as the capsule trigger
 *      in the top-right, just placed where a reader's eye lands after
 *      finishing a page.
 *   2. wp_footer() so plugins / GSAP / Three.js / main.js boot finishes.
 *   3. Body + html close tags.
 *
 * The legacy passport-related CSS in style.css (.tc-footer__*, .tc-passport__*)
 * is now dead and gets cleaned up in C8 polish.
 */
?>

<footer class="tc-footer-desk" role="contentinfo">
    <button
        type="button"
        class="tc-footer-desk__back"
        data-menu-trigger
        aria-label="<?php esc_attr_e( 'Open the desk menu', 'tc-ventures-child' ); ?>"
    >
        &larr; back to the desk
    </button>
</footer>

<?php wp_footer(); ?>
</body>
</html>
