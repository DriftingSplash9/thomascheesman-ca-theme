<?php
/**
 * Front Page / Homepage Template
 * TC 'ventures Child Theme
 */

get_header(); ?>

<main id="primary" class="site-main">
    
    <!-- HERO SECTION -->
    <?php
    // The hero "order ticket" cycles through these photos one at a time —
    // each one swaps in on the clip (lift + tilt + settle) via
    // assets/js/main.js → initHeroPortrait. Rotation pauses on hover.
    //
    // To reorder: rearrange this array. To change a caption: edit 'cap'
    // (handwritten line under the photo). 'alt' is the accessible text.
    // Captions are intentionally non-identifying (no kids' names on the
    // public, indexed homepage); reword freely.
    $tc_hero_imgs = array(
        array(
            'src' => 'https://thomascheesman.ca/wp-content/uploads/2026/06/100_0716-nodate.jpg',
            'alt' => 'Thomas Cheesman holding his newborn',
            'cap' => 'day one',
        ),
        array(
            'src' => 'https://thomascheesman.ca/wp-content/uploads/2026/05/20180319_075220-scaled.jpg',
            'alt' => 'Thomas Cheesman with his children',
            'cap' => 'the whole crew',
        ),
        array(
            'src' => 'https://thomascheesman.ca/wp-content/uploads/2026/05/faith-and-daddy.jpg',
            'alt' => 'Thomas Cheesman camping with his child',
            'cap' => 'first campout',
        ),
        array(
            'src' => 'https://thomascheesman.ca/wp-content/uploads/2026/05/DSC_1108-scaled.jpg',
            'alt' => 'Thomas Cheesman with his child by the water',
            'cap' => 'down by the water',
        ),
        array(
            'src' => 'https://thomascheesman.ca/wp-content/uploads/2026/05/IMG_1895-scaled.jpg',
            'alt' => 'Thomas Cheesman with his child in a field',
            'cap' => 'out in the long grass',
        ),
        array(
            'src' => 'https://thomascheesman.ca/wp-content/uploads/2024/08/img_2534-2-scaled.jpg',
            'alt' => 'Thomas Cheesman',
            'cap' => 'table for one',
        ),
    );
    ?>
    <section class="hero-section hero-section--pass">
        <!-- faded B&W ghost photo, watermarked into the steel behind the cards -->
        <span class="hero-ghost" aria-hidden="true"></span>
        <!-- the heat lamp still on over the empty pass -->
        <span class="hero-lamp" aria-hidden="true"></span>
        <div class="container hero-pass">

            <!-- the steel ticket rail, spanning the whole pass -->
            <span class="hero-toprail" aria-hidden="true"></span>

            <!-- LEFT: the menu, chalked on the board -->
            <div class="hero-board">
                <p class="hero-board__name kinetic-fade">Thomas Cheesman</p>
                <h1 class="hero-title kinetic-text" aria-label="Chef until my hands retired me.">
                    Chef until my hands retired me.
                </h1>
                <p class="hero-subtitle kinetic-fade">
                    Dad of three. One of fewer than fifty people alive with Hajdu-Cheney syndrome. This is what I'm leaving behind &mdash; written while I can.
                </p>
                <ul class="hero-menu kinetic-fade" aria-label="About Thomas">
                    <li>Chef</li>
                    <li>Dad of 3</li>
                    <li>1 of &lt;50 with Hajdu-Cheney</li>
                    <li>8 family lines</li>
                    <li>Grande Prairie</li>
                </ul>
                <div class="hero-cta kinetic-fade">
                    <a class="hero-cta__btn" href="<?php echo home_url('/family'); ?>">Meet the family &rarr;</a>
                </div>
            </div>

            <!-- RIGHT: the last order of the night, clipped to the ticket rail -->
            <div class="hero-rail kinetic-fade">
                <figure class="hero-ticket">
                    <span class="hero-ticket__clip" aria-hidden="true"></span>
                    <div class="hero-portrait">
                        <?php foreach ( $tc_hero_imgs as $i => $img ) : ?>
                            <img class="hero-portrait__img<?php echo $i === 0 ? ' is-active' : ''; ?>"
                                 src="<?php echo esc_url( $img['src'] ); ?>"
                                 alt="<?php echo esc_attr( $img['alt'] ); ?>"
                                 data-cap="<?php echo esc_attr( $img['cap'] ); ?>"
                                 loading="<?php echo $i === 0 ? 'eager' : 'lazy'; ?>" decoding="async" />
                        <?php endforeach; ?>
                    </div>
                    <figcaption class="hero-ticket__cap"><?php echo esc_html( $tc_hero_imgs[0]['cap'] ); ?></figcaption>
                </figure>
            </div>

        </div>
    </section>

    <!-- THE BACK QUARTER — drivable-overworld BHAG, P0 walking skeleton.
         Spec: docs/QUARTER-SECTION-SPEC.md. The stage is decorative
         (role=application, canvas aria-hidden); every destination stays
         reachable through the normal nav. Engine: assets/js/back-quarter.js
         (front-page-only enqueue; Matter+Pixi lazy-load on engagement). -->
    <?php
    // The painted world (Grok Imagine → CapCut). One place to swap the art;
    // JS reads it from data-bg, and it doubles as the pre-engagement preview.
    $tc_bq_bg = 'https://thomascheesman.ca/wp-content/uploads/2026/07/6255f323-30c4-4d20-895f-c74230ed3231.jpg';
    ?>
    <section class="bq-section" aria-label="The Back Quarter">
        <div class="container">
            <div class="bq-stage" id="bq-stage" tabindex="0" role="application"
                 data-bg="<?php echo esc_url( $tc_bq_bg ); ?>"
                 style="background-image:url('<?php echo esc_url( $tc_bq_bg ); ?>');"
                 aria-roledescription="driving mini-game"
                 aria-label="The Back Quarter: drive a buggy around a map of this site. Decorative — every destination is also in the site menu.">
                <div class="bq-preview">
                    <p class="bq-preview__eyebrow">out past the yard light</p>
                    <h2 class="bq-preview__title">The Back Quarter</h2>
                    <p class="bq-preview__deck">A quarter section of everything on this site. Hop in the buggy and drive it.</p>
                    <button type="button" class="tc-btn bq-preview__go">Start driving</button>
                    <button type="button" class="tc-btn bq-3d" hidden>Try the 3D build (beta)</button>
                    <p class="bq-preview__hint">W&thinsp;A&thinsp;S&thinsp;D or arrows &middot; Enter steps inside &middot; Esc hops out</p>
                    <p class="bq-preview__note">drive up to any building to visit that corner of the site</p>
                </div>
                <button type="button" class="bq-fs" aria-label="Enter fullscreen">&#9974; Fullscreen</button>
                <div class="bq-chip" hidden></div>
                <div class="bq-hud" hidden>Esc hops out</div>
            </div>
        </div>
    </section>

    <!-- THE FARM LEDGER — spec §5 (2D-P2). Replaced the three-pillars
         section 2026-07-06: "recently added" + a rotating pull-quote from
         the heritage corpus, hand-maintained in inc/data/quarter-section.json
         (update it as part of any content push). The mailbox on BOTH boards
         scrolls here, and its flag is up while the newest entry is under
         21 days old. This strip is also the text-equivalent of the map for
         visitors who never drive. -->
    <?php
    $tc_ledger = function_exists( 'tc_bq_ledger_data' )
        ? tc_bq_ledger_data()
        : array( 'recent' => array(), 'quotes' => array(), 'mailNew' => 0 );
    // Rotate the pull-quote by day-of-year: stable inside a page-cache
    // window, different on the next visit-day.
    $tc_lq = null;
    if ( ! empty( $tc_ledger['quotes'] ) ) {
        $tc_lq = $tc_ledger['quotes'][ (int) date_i18n( 'z' ) % count( $tc_ledger['quotes'] ) ];
    }
    ?>
    <section class="ledger-section" id="bq-ledger" aria-label="The farm ledger — recently added">
        <div class="container">
            <div class="ledger-page">
                <header class="ledger-head">
                    <p class="ledger-eyebrow">
                        the farm ledger
                        <?php if ( ! empty( $tc_ledger['mailNew'] ) ) : ?>
                            <span class="ledger-flag">⚑ fresh mail</span>
                        <?php endif; ?>
                    </p>
                    <h2 class="ledger-title">Recently added</h2>
                </header>
                <div class="ledger-body">
                    <ol class="ledger-rows">
                        <?php foreach ( (array) $tc_ledger['recent'] as $tc_row ) : ?>
                            <li class="ledger-row">
                                <span class="ledger-date"><?php echo esc_html( date_i18n( 'M j', strtotime( $tc_row['date'] ) ) ); ?></span>
                                <a class="ledger-link" href="<?php echo esc_url( home_url( $tc_row['href'] ) ); ?>"><?php echo esc_html( $tc_row['label'] ); ?></a>
                            </li>
                        <?php endforeach; ?>
                    </ol>
                    <?php if ( $tc_lq ) : ?>
                        <figure class="ledger-quote">
                            <blockquote>&ldquo;<?php echo esc_html( $tc_lq['text'] ); ?>&rdquo;</blockquote>
                            <figcaption>
                                &mdash; <?php echo esc_html( $tc_lq['line'] ); ?> &middot;
                                <a href="<?php echo esc_url( home_url( $tc_lq['href'] ) ); ?>">read the whole story &rarr;</a>
                            </figcaption>
                        </figure>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </section>

    <!-- The "Let's Connect" CTA section was retired with the drawer
         footer rebuild: the drawer now carries the connect surface
         (giant click-to-copy email + socials), so the cta-section
         duplicated it and created the dead band of dark space the
         drawer's lip sits flush against the section above. -->

</main>

<?php get_footer(); ?>