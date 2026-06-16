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
 * THE LOOSE HANDLE (Phase 1 of the nested-drawer build): the brass
 * pull is secretly a loose handle. Hover it for the "the handle is
 * loose" bubble; click it for a choice; tighten it and the
 * junk-drawer overlay slides open. secret-drawer.{css,js} drive it;
 * the junk-drawer artwork is lazy-loaded on first hover.
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
         BRASS PULL — the "drawer pull" on the wooden lip. It is the
         loose handle: hovering surfaces a bubble, clicking offers a
         choice, tightening it opens the junk-drawer overlay below.
         secret-drawer.js binds [data-tc-loose-handle]. -->
    <div class="tc-drawer__lip">
        <button type="button"
                class="tc-drawer__pull"
                data-tc-loose-handle
                aria-haspopup="dialog"
                aria-expanded="false"
                aria-label="<?php esc_attr_e( 'The drawer handle — it feels loose', 'tc-ventures-child' ); ?>">
            <span class="tc-drawer__handle-bubble" data-tc-handle-bubble aria-hidden="true">the handle is loose</span>
        </button>
        <div class="tc-drawer__handle-choice" data-tc-handle-choice hidden>
            <button type="button" data-tc-handle-tighten>try tightening it</button>
            <button type="button" data-tc-handle-nevermind>never mind</button>
        </div>
    </div>

    <div class="tc-drawer__body">
        <div class="tc-drawer__interior">

            <!-- ====================================================
                 ROW 1 — directory compartments + today's quote. -->
            <div class="tc-drawer__row tc-drawer__row--top">

                <nav class="tc-drawer__compartment tc-drawer__compartment--nav"
                     aria-label="<?php esc_attr_e( 'Family pages', 'tc-ventures-child' ); ?>">
                    <p class="tc-drawer__heading">Family</p>
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
                    <p class="tc-drawer__heading">Hajdu-Cheney</p>
                    <ul>
                        <li><a href="<?php echo esc_url( home_url( '/hcs' ) ); ?>">HCS</a></li>
                        <li><a href="<?php echo esc_url( home_url( '/hcs/case-studies' ) ); ?>">Case Studies &amp; Research</a></li>
                    </ul>
                </nav>

                <nav class="tc-drawer__compartment tc-drawer__compartment--nav"
                     aria-label="<?php esc_attr_e( 'The site', 'tc-ventures-child' ); ?>">
                    <p class="tc-drawer__heading">The site</p>
                    <ul>
                        <li><a href="<?php echo esc_url( home_url( '/' ) ); ?>">Home</a></li>
                        <li><a href="<?php echo esc_url( home_url( '/about' ) ); ?>">About</a></li>
                        <li><a href="<?php echo esc_url( home_url( '/contact' ) ); ?>">Contact</a></li>
                        <li><a href="<?php echo esc_url( home_url( '/privacy' ) ); ?>">Privacy</a></li>
                    </ul>
                </nav>

                <nav class="tc-drawer__compartment tc-drawer__compartment--nav"
                     aria-label="<?php esc_attr_e( 'Elsewhere', 'tc-ventures-child' ); ?>">
                    <p class="tc-drawer__heading">Elsewhere</p>
                    <ul>
                        <li><a href="https://bareyourrare.org" target="_blank" rel="noopener noreferrer">Bare Your Rare &#8599;</a></li>
                        <li><a href="https://gpresidentialsociety.com" target="_blank" rel="noopener noreferrer">GP Residential Society &#8599;</a></li>
                        <li><a href="https://www.youtube.com/@DriftingSplash9" target="_blank" rel="noopener noreferrer">YouTube documentaries &#8599;</a></li>
                    </ul>
                </nav>

                <?php if ( $tc_footer_quote ) :
                    $tc_is_riddle = ( isset( $tc_footer_quote['type'] ) && $tc_footer_quote['type'] === 'riddle' );
                ?>
                <aside class="tc-drawer__compartment tc-drawer__compartment--quote<?php echo $tc_is_riddle ? ' is-riddle' : ''; ?>"
                       aria-label="<?php echo $tc_is_riddle
                            ? esc_attr__( "Today's riddle", 'tc-ventures-child' )
                            : esc_attr__( "Today's quote", 'tc-ventures-child' ); ?>">
                    <span class="tc-drawer__stamp" aria-hidden="true">
                        <?php
                        // wp_date (site timezone), not gmdate — UTC flipped
                        // the stamp to tomorrow every evening local time.
                        echo esc_html( wp_date( 'M j' ) );
                        ?>
                    </span>

                    <?php if ( $tc_is_riddle ) : ?>
                        <p class="tc-drawer__quote-kicker">today's riddle</p>
                        <p class="tc-drawer__quote-text"><?php echo esc_html( $tc_footer_quote['question'] ); ?></p>
                        <button type="button"
                                class="tc-drawer__riddle-reveal"
                                data-tc-riddle-reveal
                                data-tc-riddle-answer="<?php echo esc_attr( $tc_footer_quote['answer'] ); ?>"
                                aria-label="<?php esc_attr_e( 'Show the riddle answer', 'tc-ventures-child' ); ?>">
                            click for answer →
                        </button>
                    <?php else : ?>
                        <blockquote>
                            <p class="tc-drawer__quote-text"><?php echo esc_html( $tc_footer_quote['text'] ); ?></p>
                            <cite class="tc-drawer__quote-cite">— <?php echo esc_html( $tc_footer_quote['author'] ); ?></cite>
                        </blockquote>
                    <?php endif; ?>
                </aside>
                <?php endif; ?>
            </div>

            <!-- ====================================================
                 ROW 2 — connect band: email, socials, plaque. -->
            <div class="tc-drawer__row tc-drawer__row--bottom">

                <div class="tc-drawer__compartment tc-drawer__compartment--connect">
                    <p class="tc-drawer__connect-label">Write to me</p>
                    <?php /* No aria-label: the visible (JS-decoded) address
                             must be part of the accessible name (WCAG 2.5.3),
                             so the name is the button's own text — address +
                             the "click to copy" hint. */ ?>
                    <button class="tc-drawer__email"
                            type="button"
                            data-tc-email-rot13="<?php echo esc_attr( $tc_footer_email_rot13 ); ?>">
                        <span class="tc-drawer__email-text"><?php echo esc_html( $tc_footer_email_rot13 ); ?></span>
                        <span class="tc-drawer__email-hint">click to copy</span>
                    </button>
                    <ul class="tc-drawer__socials" aria-label="<?php esc_attr_e( 'Find me elsewhere', 'tc-ventures-child' ); ?>">
                        <li><a href="https://x.com/TCheesy_" target="_blank" rel="noopener noreferrer">X</a></li>
                        <li><a href="https://www.facebook.com/thomas.cheesman.9/" target="_blank" rel="noopener noreferrer">Facebook</a></li>
                        <li><a href="https://www.youtube.com/@DriftingSplash9" target="_blank" rel="noopener noreferrer">YouTube</a></li>
                    </ul>
                </div>

                <div class="tc-drawer__compartment tc-drawer__compartment--plaque" aria-hidden="true">
                    <?php
                    // Signature SVG replaces the typed name — drawn in brass
                    // via currentColor on the strokes (the SVG's stroke is
                    // set to currentColor in the source so CSS color wins).
                    $tc_sig_path = get_stylesheet_directory() . '/assets/svg/signature.svg';
                    if ( is_readable( $tc_sig_path ) ) {
                        echo '<div class="tc-drawer__signature" aria-label="Thomas Cheesman">';
                        echo file_get_contents( $tc_sig_path );
                        echo '</div>';
                    }
                    ?>
                    <p class="tc-drawer__plaque-line tc-drawer__plaque-line--meta">
                        <span data-tc-clock>--:-- MDT</span>
                        <span class="tc-drawer__plaque-sep">·</span>
                        <span>Grande Prairie</span>
                    </p>
                    <p class="tc-drawer__plaque-line tc-drawer__plaque-line--copy">
                        &copy; <?php echo esc_html( wp_date( 'Y' ) ); ?>
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
                    <img class="tc-drawer__marble-img"
                         src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/05/img_4454.png' ) ); ?>"
                         alt=""
                         aria-hidden="true"
                         loading="lazy"
                         decoding="async">
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

    <!-- ============================================================
         THE SECRET DRAWER — the junk-drawer overlay. Hidden until the
         loose handle is tightened (secret-drawer.js). Phase 1 ships
         the stage + artwork + close affordances; the empty
         [data-tc-secret-objects] layer is the mount point the Phase 2
         interaction engine drops puzzle objects into. The background
         <img> has no src — secret-drawer.js lazy-sets it from
         tcSecretDrawer.assets so non-curious visitors download nothing. -->
    <div class="tc-secret-drawer" data-tc-secret-drawer hidden
         role="dialog" aria-modal="true"
         aria-label="<?php esc_attr_e( 'The junk drawer', 'tc-ventures-child' ); ?>">
        <div class="tc-secret-drawer__scrim" data-tc-secret-close></div>
        <div class="tc-secret-drawer__stage">
            <img class="tc-secret-drawer__bg"
                 data-tc-secret-bg
                 alt="<?php esc_attr_e( 'A junk drawer, its floor papered with stickers and memes', 'tc-ventures-child' ); ?>">
            <div class="tc-secret-drawer__objects" data-tc-secret-objects>
                <!-- Phase 2: the interaction engine mounts objects here. -->
            </div>
            <button type="button"
                    class="tc-secret-drawer__reset"
                    data-tc-secret-reset
                    aria-label="<?php esc_attr_e( 'Start the puzzle over', 'tc-ventures-child' ); ?>">
                <svg class="tc-secret-drawer__reset-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M12 5V2L7 7l5 5V8c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6H4c0 4.4 3.6 8 8 8s8-3.6 8-8-3.6-8-8-8z"
                          fill="currentColor"/>
                </svg>
                <span class="tc-secret-drawer__reset-tip" aria-hidden="true">start over</span>
            </button>
            <button type="button"
                    class="tc-secret-drawer__close"
                    data-tc-secret-close
                    aria-label="<?php esc_attr_e( 'Close the drawer', 'tc-ventures-child' ); ?>">&times;</button>
        </div>
    </div>

</footer>

<?php wp_footer(); ?>
</body>
</html>
