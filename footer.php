<?php
/**
 * Custom Footer Template — TC 'ventures Child Theme
 *
 * Sitemap-style footer: grouped navigation columns, social links, a
 * copyright line, and a "back to the desk" button that carries
 * [data-menu-trigger] so desk-menu.js still binds to it and opens the
 * desk overlay.
 *
 * Replaces the earlier minimal floating "back to the desk" pill
 * (.tc-footer-desk) — that pill's CSS in assets/css/desk-menu.css was
 * removed when this footer landed. The header capsule remains the
 * always-visible way into the desk menu.
 */
?>

<footer class="tc-site-footer" role="contentinfo">
    <div class="container">

        <div class="tc-site-footer__columns">

            <nav class="tc-site-footer__col" aria-label="<?php esc_attr_e( 'Family pages', 'tc-ventures-child' ); ?>">
                <h2 class="tc-site-footer__heading">Family</h2>
                <ul>
                    <li><a href="<?php echo esc_url( home_url( '/family' ) ); ?>">Family</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/family/patience' ) ); ?>">Patience</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/family/daniel' ) ); ?>">Daniel</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/family/faith' ) ); ?>">Faith</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/family/heritage' ) ); ?>">The Families</a></li>
                </ul>
            </nav>

            <nav class="tc-site-footer__col" aria-label="<?php esc_attr_e( 'Hajdu-Cheney pages', 'tc-ventures-child' ); ?>">
                <h2 class="tc-site-footer__heading">Hajdu-Cheney</h2>
                <ul>
                    <li><a href="<?php echo esc_url( home_url( '/hcs' ) ); ?>">Hajdu-Cheney Syndrome</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/hcs/case-studies' ) ); ?>">Case Studies &amp; Research</a></li>
                </ul>
            </nav>

            <nav class="tc-site-footer__col" aria-label="<?php esc_attr_e( 'The site', 'tc-ventures-child' ); ?>">
                <h2 class="tc-site-footer__heading">The site</h2>
                <ul>
                    <li><a href="<?php echo esc_url( home_url( '/' ) ); ?>">Home</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/about' ) ); ?>">About</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/journal' ) ); ?>">Journal</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/contact' ) ); ?>">Contact</a></li>
                </ul>
            </nav>

            <nav class="tc-site-footer__col" aria-label="<?php esc_attr_e( 'Elsewhere', 'tc-ventures-child' ); ?>">
                <h2 class="tc-site-footer__heading">Elsewhere</h2>
                <ul>
                    <li><a href="https://bareyourrare.org" target="_blank" rel="noopener noreferrer">Bare Your Rare &#8599;</a></li>
                    <li><a href="https://gpresidentialsociety.com" target="_blank" rel="noopener noreferrer">GP Residential Society &#8599;</a></li>
                    <li><a href="https://www.youtube.com/@DriftingSplash9" target="_blank" rel="noopener noreferrer">YouTube documentaries &#8599;</a></li>
                </ul>
            </nav>

        </div>

        <div class="tc-site-footer__bar">
            <p class="tc-site-footer__copyright">&copy; <?php echo esc_html( gmdate( 'Y' ) ); ?> Thomas Cheesman</p>

            <ul class="tc-site-footer__social" aria-label="<?php esc_attr_e( 'Social links', 'tc-ventures-child' ); ?>">
                <li><a href="https://x.com/TCheesy_" target="_blank" rel="noopener noreferrer">X</a></li>
                <li><a href="https://www.facebook.com/thomas.cheesman.9/" target="_blank" rel="noopener noreferrer">Facebook</a></li>
                <li><a href="https://www.youtube.com/@DriftingSplash9" target="_blank" rel="noopener noreferrer">YouTube</a></li>
            </ul>

            <button
                type="button"
                class="tc-site-footer__back"
                data-menu-trigger
                aria-label="<?php esc_attr_e( 'Open the desk menu', 'tc-ventures-child' ); ?>"
            >
                &larr; back to the desk
            </button>
        </div>

    </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
