<?php
/**
 * Custom Footer Template — TC 'ventures Child Theme
 *
 * Overrides Astra's footer.php. Renders:
 *   1. A massive scrolling wordmark marquee (CSS-driven, infinite).
 *      Two duplicate sets of items inside the track make a -50%
 *      translateX loop seamless.
 *   2. A minimal colophon row: brand + tag, links, email, year.
 *   3. wp_footer() so plugins, GSAP, Three.js, and main.js can finish
 *      booting from the footer (their <script> tags are emitted here).
 *   4. Body and html closing tags.
 *
 * The footer background is transparent so the WebGL noise gradient
 * + particle field continue to show through, matching the rest of
 * the page.
 */
?>

<footer class="tc-footer" role="contentinfo">

    <!-- Wordmark marquee. aria-hidden because it's purely decorative —
         screen readers shouldn't read the tagline phrase repeatedly.
         Content is one continuous prose phrase repeated with a decorative
         glyph between repetitions. Single-phrase prose reads as ambient
         banner text, not a list of clickable nav items (which the previous
         "TC 'ventures · Life · Family · …" structure was getting confused
         for). -->
    <div class="tc-footer__marquee" aria-hidden="true">
        <div class="tc-footer__marquee-track">
            <!-- Set 1 -->
            <span class="tc-footer__marquee-item">Exploring life, family, and what matters most</span>
            <span class="tc-footer__marquee-item tc-footer__marquee-glyph">✦</span>
            <span class="tc-footer__marquee-item">Exploring life, family, and what matters most</span>
            <span class="tc-footer__marquee-item tc-footer__marquee-glyph">✦</span>
            <!-- Set 2 (duplicate, makes the -50% turnaround position
                 identical to the 0% start position — sway loops cleanly) -->
            <span class="tc-footer__marquee-item">Exploring life, family, and what matters most</span>
            <span class="tc-footer__marquee-item tc-footer__marquee-glyph">✦</span>
            <span class="tc-footer__marquee-item">Exploring life, family, and what matters most</span>
            <span class="tc-footer__marquee-item tc-footer__marquee-glyph">✦</span>
        </div>
    </div>

    <!-- Colophon row -->
    <div class="tc-footer__colophon">
        <div class="tc-footer__col tc-footer__col--brand">
            <span class="tc-footer__brand">TC 'ventures</span>
            <span class="tc-footer__tag">Life · Family · Things that matter</span>
        </div>

        <nav class="tc-footer__col tc-footer__col--links" aria-label="<?php esc_attr_e( 'Footer', 'tc-ventures-child' ); ?>">
            <a href="<?php echo esc_url( home_url( '/' ) ); ?>">Home</a>
            <a href="<?php echo esc_url( home_url( '/blog' ) ); ?>">Blog</a>
            <a href="<?php echo esc_url( home_url( '/about' ) ); ?>">About</a>
            <a href="<?php echo esc_url( home_url( '/contact' ) ); ?>">Contact</a>
        </nav>

        <div class="tc-footer__col tc-footer__col--meta">
            <a href="mailto:thomasmcheesman@gmail.com" class="tc-footer__email">thomasmcheesman@gmail.com</a>
            <span class="tc-footer__year">© <?php echo esc_html( gmdate( 'Y' ) ); ?> Thomas Cheesman</span>
        </div>
    </div>

</footer>

<?php wp_footer(); ?>
</body>
</html>
