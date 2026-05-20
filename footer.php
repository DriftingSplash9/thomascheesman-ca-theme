<?php
/**
 * Footer template — "The Drawer".
 *
 * Site footer styled as the bottom drawer of the desk metaphor. A
 * brass pull sits at the top; the drawer's interior holds the
 * sitemap compartments (Family / Hajdu-Cheney / Site / Elsewhere),
 * a hand-written "today" quote card, a giant click-to-copy email,
 * and a brass plaque with the live local time.
 *
 * A single marble rests in the bottom-right corner of the drawer.
 * Idle bobbing physics, hover tooltip "tap to play". Click it and
 * desk-drawer.js lazy-loads Matter.js + boots desk-pinball.js,
 * which converts the drawer's contents into a pinball table.
 *
 * No "back-to-the-desk" pill: the existing menu trigger in the
 * header capsule is the always-visible way in. The footer instead
 * carries the connect surface that the front-page CTA section
 * used to duplicate; the cta-section was retired with this footer.
 */
?>

<?php $tc_footer_quote = function_exists( 'tc_get_daily_quote' ) ? tc_get_daily_quote() : null; ?>
<?php $tc_footer_email_rot13 = str_rot13( 'thomasmcheesman@gmail.com' ); ?>

<footer class="tc-drawer" role="contentinfo" data-tc-drawer>

    <!-- ============================================================
         BRASS PULL — the visible "drawer pull" sitting above the
         drawer body. Aria-hidden because clicking it is decorative;
         the drawer opens on scroll-into-view automatically. -->
    <div class="tc-drawer__lip" aria-hidden="true">
        <span class="tc-drawer__pull"></span>
    </div>

    <div class="tc-drawer__body">
        <div class="tc-drawer__interior">

            <!-- ====================================================
                 ROW 1 — directory compartments + today's quote. -->
            <div class="tc-drawer__row tc-drawer__row--top">

                <nav class="tc-drawer__compartment tc-drawer__compartment--nav"
                     aria-label="<?php esc_attr_e( 'Family pages', 'tc-ventures-child' ); ?>">
                    <h2 class="tc-drawer__heading">Family</h2>
                    <ul>
                        <li><a href="<?php echo esc_url( home_url( '/family' ) ); ?>">Family</a></li>
                        <li><a href="<?php echo esc_url( home_url( '/family/patience' ) ); ?>">Patience</a></li>
                        <li><a href="<?php echo esc_url( home_url( '/family/daniel' ) ); ?>">Daniel</a></li>
                        <li><a href="<?php echo esc_url( home_url( '/family/faith' ) ); ?>">Faith</a></li>
                        <li><a href="<?php echo esc_url( home_url( '/family/heritage' ) ); ?>">The Families</a></li>
                    </ul>
                </nav>

                <nav class="tc-drawer__compartment tc-drawer__compartment--nav"
                     aria-label="<?php esc_attr_e( 'Hajdu-Cheney pages', 'tc-ventures-child' ); ?>">
                    <h2 class="tc-drawer__heading">Hajdu-Cheney</h2>
                    <ul>
                        <li><a href="<?php echo esc_url( home_url( '/hcs' ) ); ?>">HCS</a></li>
                        <li><a href="<?php echo esc_url( home_url( '/hcs/case-studies' ) ); ?>">Case Studies &amp; Research</a></li>
                    </ul>
                </nav>

                <nav class="tc-drawer__compartment tc-drawer__compartment--nav"
                     aria-label="<?php esc_attr_e( 'The site', 'tc-ventures-child' ); ?>">
                    <h2 class="tc-drawer__heading">The site</h2>
                    <ul>
                        <li><a href="<?php echo esc_url( home_url( '/' ) ); ?>">Home</a></li>
                        <li><a href="<?php echo esc_url( home_url( '/about' ) ); ?>">About</a></li>
                        <li><a href="<?php echo esc_url( home_url( '/contact' ) ); ?>">Contact</a></li>
                    </ul>
                </nav>

                <nav class="tc-drawer__compartment tc-drawer__compartment--nav"
                     aria-label="<?php esc_attr_e( 'Elsewhere', 'tc-ventures-child' ); ?>">
                    <h2 class="tc-drawer__heading">Elsewhere</h2>
                    <ul>
                        <li><a href="https://bareyourrare.org" target="_blank" rel="noopener noreferrer">Bare Your Rare &#8599;</a></li>
                        <li><a href="https://gpresidentialsociety.com" target="_blank" rel="noopener noreferrer">GP Residential Society &#8599;</a></li>
                        <li><a href="https://www.youtube.com/@DriftingSplash9" target="_blank" rel="noopener noreferrer">YouTube documentaries &#8599;</a></li>
                    </ul>
                </nav>

                <?php if ( $tc_footer_quote ) : ?>
                <aside class="tc-drawer__compartment tc-drawer__compartment--quote"
                       aria-label="<?php esc_attr_e( "Today's quote", 'tc-ventures-child' ); ?>">
                    <span class="tc-drawer__stamp" aria-hidden="true">
                        <?php echo esc_html( gmdate( 'M j' ) ); ?>
                    </span>
                    <blockquote>
                        <p class="tc-drawer__quote-text"><?php echo esc_html( $tc_footer_quote['text'] ); ?></p>
                        <cite class="tc-drawer__quote-cite">— <?php echo esc_html( $tc_footer_quote['author'] ); ?></cite>
                    </blockquote>
                </aside>
                <?php endif; ?>
            </div>

            <!-- ====================================================
                 ROW 2 — connect band: email, socials, plaque. -->
            <div class="tc-drawer__row tc-drawer__row--bottom">

                <div class="tc-drawer__compartment tc-drawer__compartment--connect">
                    <p class="tc-drawer__connect-label">Write to me</p>
                    <button class="tc-drawer__email"
                            type="button"
                            data-tc-email-rot13="<?php echo esc_attr( $tc_footer_email_rot13 ); ?>"
                            aria-label="<?php esc_attr_e( 'Copy email address to clipboard', 'tc-ventures-child' ); ?>">
                        <span class="tc-drawer__email-text"><?php echo esc_html( $tc_footer_email_rot13 ); ?></span>
                        <span class="tc-drawer__email-hint" aria-hidden="true">click to copy</span>
                    </button>
                    <ul class="tc-drawer__socials" aria-label="<?php esc_attr_e( 'Find me elsewhere', 'tc-ventures-child' ); ?>">
                        <li><a href="https://x.com/TCheesy_" target="_blank" rel="noopener noreferrer">X</a></li>
                        <li><a href="https://www.facebook.com/thomas.cheesman.9/" target="_blank" rel="noopener noreferrer">Facebook</a></li>
                        <li><a href="https://www.youtube.com/@DriftingSplash9" target="_blank" rel="noopener noreferrer">YouTube</a></li>
                    </ul>
                </div>

                <div class="tc-drawer__compartment tc-drawer__compartment--plaque" aria-hidden="true">
                    <p class="tc-drawer__plaque-line tc-drawer__plaque-line--name">Thomas Cheesman</p>
                    <p class="tc-drawer__plaque-line tc-drawer__plaque-line--meta">
                        <span data-tc-clock>--:-- MDT</span>
                        <span class="tc-drawer__plaque-sep">·</span>
                        <span>Grande Prairie</span>
                    </p>
                    <p class="tc-drawer__plaque-line tc-drawer__plaque-line--copy">
                        &copy; <?php echo esc_html( gmdate( 'Y' ) ); ?>
                    </p>
                </div>
            </div>

            <!-- ====================================================
                 THE MARBLE — nestled in a wooden cup at the corner of
                 the drawer interior. The cup positions everything;
                 the cup's ::before is the animated ground shadow.
                 desk-drawer.js binds the marble click and lazy-loads
                 Matter.js + desk-pinball.js. -->
            <div class="tc-drawer__marble-cup">
                <button type="button"
                        class="tc-drawer__marble"
                        data-tc-pinball-trigger
                        aria-label="<?php esc_attr_e( 'Play pinball', 'tc-ventures-child' ); ?>">
                    <span class="tc-drawer__marble-tip" aria-hidden="true">tap to play</span>
                </button>
            </div>

            <!-- Top-score brass tag — sits above the marble cup, not
                 beside it, so it doesn't crowd the brass plaque. JS
                 updates [data-tc-pinball-top] from the leaderboard. -->
            <p class="tc-drawer__topscore" aria-live="polite">
                <span class="tc-drawer__topscore-label">top score</span>
                <span class="tc-drawer__topscore-value" data-tc-pinball-top>—</span>
            </p>

        </div>
    </div>

    <!-- Back-to-the-desk pill carried over from the previous footer
         (data-menu-trigger still binds to desk-menu.js). Sits below
         the drawer body as a closing flourish. -->
    <div class="tc-drawer__closing">
        <button type="button"
                class="tc-drawer__back"
                data-menu-trigger
                aria-label="<?php esc_attr_e( 'Open the desk menu', 'tc-ventures-child' ); ?>">
            &larr; back to the desk
        </button>
    </div>

</footer>

<?php wp_footer(); ?>
</body>
</html>
