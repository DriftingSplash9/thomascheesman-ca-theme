<?php
/**
 * Custom Footer Template — TC 'ventures Child Theme
 *
 * The footer is composed as a stylised passport — companion piece to
 * the BHAG menu's "trip" metaphor (see project_tc_bhag_living_document.md).
 * The visitor's journey through the site's places is recorded here as
 * stamps in a passport whose pages have been visibly used.
 *
 * Renders:
 *   1. The passport "cover" — the marquee pill (rotating gold-on-navy
 *      sheen, sweep text inside).
 *   2. The passport "interior page" — aged-paper texture (procedural,
 *      via SVG feTurbulence + radial-gradient stains, no image assets),
 *      with:
 *        - A bearer block ("TC 'ventures" + tagline)
 *        - A row of engraved stamps, one per major site place
 *        - A signature panel where the bearer's name is written in
 *          their own hand. Currently a static placeholder; future
 *          commit replaces the placeholder with an SVG-traced
 *          signature animated by an "ember-pen" reveal.
 *        - A foot row with serial-number-styled metadata.
 *   3. wp_footer() so plugins, GSAP, Three.js, and main.js can finish
 *      booting from the footer.
 *   4. Body and html closing tags.
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
    <!-- Pill wrapper houses the rotating-gradient border + contrasting
         outer glow (CSS pseudo-elements). The inner .tc-footer__marquee
         keeps overflow:hidden + edge mask for the sway, separated so the
         glow can extend outside the marquee's clipping area. -->
    <div class="tc-footer__marquee-pill" aria-hidden="true">
        <div class="tc-footer__marquee">
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
    </div>

    <!-- ============================================================
         PASSPORT INTERIOR
         The aged-paper page that sits below the cover (marquee pill).
         All visual aging is procedural CSS — SVG turbulence for fibre
         grain, radial gradients for corner darkening + sparse stains.
         No image assets are loaded.
         ============================================================ -->
    <section class="tc-passport" aria-label="<?php esc_attr_e( 'Site colophon', 'tc-ventures-child' ); ?>">

        <!-- Document title — every real passport stamps PASSPORT
             across the top of the photo page in stencil-ish display
             type. Bilingual treatment underneath cements the
             official-document feel without literally invoking any
             actual country's passport design. -->
        <div class="tc-passport__title" aria-hidden="true">
            <span class="tc-passport__title-main">Passport</span>
            <span class="tc-passport__title-sub">&mdash; TC&nbsp;'ventures &mdash;</span>
        </div>

        <!-- Photo + bearer block + signature — top of the passport
             page. Three columns mirror a real passport's photo page:
             photo left, bearer details centre, signature right. -->
        <div class="tc-passport__header">

            <!-- Passport photo. Placeholder for now — corner markers
                 show the photo bounds while the centre stays empty,
                 ready for an <img> swap once Thomas provides a cropped
                 portrait. 35:45 aspect matches the real ICAO 9303
                 passport photo standard. -->
            <div class="tc-passport__photo" aria-hidden="true">
                <span class="tc-passport__photo-corner tc-passport__photo-corner--tl"></span>
                <span class="tc-passport__photo-corner tc-passport__photo-corner--tr"></span>
                <span class="tc-passport__photo-corner tc-passport__photo-corner--bl"></span>
                <span class="tc-passport__photo-corner tc-passport__photo-corner--br"></span>
                <span class="tc-passport__photo-placeholder">Photo</span>
            </div>

            <!-- Bearer details with a Place-of-Issue field added below
                 the tagline, mirroring how real passports render
                 secondary metadata. -->
            <div class="tc-passport__bearer">
                <span class="tc-passport__bearer-label">Bearer</span>
                <span class="tc-passport__bearer-name">TC 'ventures</span>
                <span class="tc-passport__bearer-tagline">Life, Family, Things that matter</span>

                <div class="tc-passport__bearer-field">
                    <span class="tc-passport__bearer-field-label">Place of Issue</span>
                    <span class="tc-passport__bearer-field-value">Grande Prairie, Alberta<br>Canada</span>
                </div>
            </div>

            <div class="tc-passport__signature">
                <span class="tc-passport__signature-label">Created By:</span>
                <!-- Inlined SVG of Thomas's actual handwritten signature
                     (vectorizer.ai trace of a phone-photographed signing).
                     file_get_contents inlines the SVG so its paths are in
                     the live DOM, which lets a future commit add a
                     stroke-dasharray reveal animation. PHP opcache + file
                     stat cache means the read is effectively free per
                     page. The wrapping span carries layout + colour. -->
                <span class="tc-passport__signature-mark">
                    <?php
                    $signature_path = get_stylesheet_directory() . '/assets/svg/signature.svg';
                    if ( file_exists( $signature_path ) ) {
                        // The SVG file authors its own attributes (viewBox,
                        // class, aria-hidden); CSS handles size + colour.
                        echo file_get_contents( $signature_path ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
                    }
                    ?>
                </span>
                <span class="screen-reader-text">Thomas Cheesman</span>
            </div>
        </div>

        <!-- Binding artefacts. Three small staples down the spine, plus
             the spine itself (a faint shadow band in CSS background).
             aria-hidden because they're decorative passport-coding. -->
        <span class="tc-passport__staple tc-passport__staple--top" aria-hidden="true"></span>
        <span class="tc-passport__staple tc-passport__staple--mid" aria-hidden="true"></span>
        <span class="tc-passport__staple tc-passport__staple--bot" aria-hidden="true"></span>

        <!-- Stamps row — one engraved stamp per major site place.
             Each stamp is a clickable link to the corresponding page,
             so the passport doubles as a secondary nav surface. The
             icons mirror the BHAG topography places (oak grove, letters,
             house on a hill, mailbox, horizon line). -->
        <ul class="tc-passport__stamps" aria-label="<?php esc_attr_e( 'Pages visited', 'tc-ventures-child' ); ?>">
            <li class="tc-passport__stamp">
                <a class="tc-passport__stamp-link" href="<?php echo esc_url( home_url( '/family' ) ); ?>">
                    <span class="tc-passport__stamp-mark" aria-hidden="true">
                        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <!-- Oak leaf — the family-tree species, lobed silhouette -->
                            <path d="M32 56 L32 14"/>
                            <path d="M32 14 C 27 16 23 14 21 18 C 17 18 17 22 19 24 C 15 24 15 28 18 30 C 14 30 14 34 17 36 C 14 36 15 40 18 41 C 16 44 19 46 22 46 C 24 50 28 49 32 51 C 36 49 40 50 42 46 C 45 46 48 44 46 41 C 49 40 50 36 47 36 C 50 34 50 30 46 30 C 49 28 49 24 45 24 C 47 22 47 18 43 18 C 41 14 37 16 32 14 Z"/>
                            <path d="M32 22 L26 28 M32 28 L26 34 M32 34 L26 40 M32 22 L38 28 M32 28 L38 34 M32 34 L38 40" opacity="0.5"/>
                        </svg>
                        <span class="tc-passport__stamp-date">12&middot;02&middot;25</span>
                    </span>
                    <span class="tc-passport__stamp-label">Family</span>
                </a>
            </li>

            <li class="tc-passport__stamp">
                <a class="tc-passport__stamp-link" href="<?php echo esc_url( home_url( '/journal' ) ); ?>">
                    <span class="tc-passport__stamp-mark" aria-hidden="true">
                        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <!-- Stack of letters tied with twine — Journal -->
                            <rect x="14" y="22" width="36" height="22" rx="1"/>
                            <path d="M14 24 L32 36 L50 24"/>
                            <path d="M22 18 L48 18" opacity="0.5"/>
                            <path d="M26 14 L46 14" opacity="0.4"/>
                            <!-- Twine wrap -->
                            <path d="M32 16 L32 50" stroke-dasharray="2 2"/>
                        </svg>
                        <span class="tc-passport__stamp-date">28&middot;04&middot;26</span>
                    </span>
                    <span class="tc-passport__stamp-label">Ramblings</span>
                </a>
            </li>

            <li class="tc-passport__stamp">
                <a class="tc-passport__stamp-link" href="<?php echo esc_url( home_url( '/about' ) ); ?>">
                    <span class="tc-passport__stamp-mark" aria-hidden="true">
                        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <!-- House on a hill — About -->
                            <path d="M14 50 C 22 46 42 46 50 50"/>
                            <path d="M22 38 L32 26 L42 38"/>
                            <path d="M24 38 L24 50 L40 50 L40 38"/>
                            <rect x="29" y="42" width="6" height="8"/>
                            <path d="M37 30 L37 33 L40 33" />
                        </svg>
                        <span class="tc-passport__stamp-date">03&middot;11&middot;24</span>
                    </span>
                    <span class="tc-passport__stamp-label">About</span>
                </a>
            </li>

            <li class="tc-passport__stamp">
                <a class="tc-passport__stamp-link" href="<?php echo esc_url( home_url( '/contact' ) ); ?>">
                    <span class="tc-passport__stamp-mark" aria-hidden="true">
                        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <!-- Mailbox at the entrance — Contact -->
                            <rect x="16" y="22" width="28" height="18" rx="2"/>
                            <path d="M16 28 L24 28"/>
                            <path d="M44 22 L44 16 L36 16"/>
                            <!-- Flag -->
                            <path d="M32 40 L32 52"/>
                            <path d="M24 52 L40 52"/>
                        </svg>
                        <span class="tc-passport__stamp-date">28&middot;04&middot;26</span>
                    </span>
                    <span class="tc-passport__stamp-label">Contact</span>
                </a>
            </li>

            <li class="tc-passport__stamp">
                <a class="tc-passport__stamp-link" href="<?php echo esc_url( home_url( '/timeline' ) ); ?>">
                    <span class="tc-passport__stamp-mark" aria-hidden="true">
                        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <!-- Horizon line with a low sun — Timeline -->
                            <path d="M8 40 L56 40"/>
                            <circle cx="32" cy="32" r="6"/>
                            <path d="M32 18 L32 22 M18 32 L22 32 M46 32 L42 32 M22 22 L24 24 M42 22 L40 24" opacity="0.6"/>
                            <!-- Subtle marker ticks on horizon -->
                            <path d="M14 38 L14 42 M50 38 L50 42" opacity="0.4"/>
                        </svg>
                        <span class="tc-passport__stamp-date">18&middot;07&middot;25</span>
                    </span>
                    <span class="tc-passport__stamp-label">Timeline</span>
                </a>
            </li>
        </ul>

        <!-- Socials row — sits above the MRZ. -->
        <div class="tc-passport__socials" aria-label="<?php esc_attr_e( 'Social', 'tc-ventures-child' ); ?>">
            <span class="tc-passport__socials-label">Find me on:</span>
            <a href="https://x.com/TCheesy_" target="_blank" rel="noopener noreferrer">X <span aria-hidden="true">↗</span></a>
            <span class="tc-passport__socials-sep" aria-hidden="true">·</span>
            <a href="https://www.facebook.com/thomas.cheesman.9/" target="_blank" rel="noopener noreferrer">Facebook <span aria-hidden="true">↗</span></a>
        </div>

        <!-- Machine-Readable Zone — every real passport's photo page
             ends with two 44-character lines of OCR-B encoding name,
             passport number, dates. The format is purely visual here:
             it LOOKS like an MRZ. The serial / issued / © data is
             folded into the encoding so we don't repeat it elsewhere.
             aria-hidden because screen readers reading "less than less
             than less than" 30 times is just noise. -->
        <?php
        $mrz_year_short = gmdate( 'y' );
        $mrz_today      = gmdate( 'd' ) . '<' . gmdate( 'm' ) . '<' . $mrz_year_short;
        $mrz_line_1     = str_pad( 'P<TCV<<CHEESMAN<<THOMAS', 44, '<' );
        $mrz_line_2     = str_pad( 'TC' . $mrz_year_short . '0001<<TCVENTURESCA', 44 - strlen( $mrz_today ), '<' ) . $mrz_today;
        ?>
        <div class="tc-passport__mrz" aria-hidden="true">
            <span class="tc-passport__mrz-line"><?php echo esc_html( $mrz_line_1 ); ?></span>
            <span class="tc-passport__mrz-line"><?php echo esc_html( $mrz_line_2 ); ?></span>
        </div>

        <!-- Tiny copyright line at the very bottom — passports usually
             carry a small attribution at the bottom of the photo page.
             Visible but unobtrusive. -->
        <p class="tc-passport__copyright">&copy; <?php echo esc_html( gmdate( 'Y' ) ); ?> Thomas Cheesman</p>

    </section>

</footer>

<?php wp_footer(); ?>
</body>
</html>
