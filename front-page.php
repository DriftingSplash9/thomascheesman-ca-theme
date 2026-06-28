<?php
/**
 * Front Page / Homepage Template
 * TC 'ventures Child Theme
 */

get_header(); ?>

<main id="primary" class="site-main">
    
    <!-- HERO SECTION -->
    <?php
    // Rotating hero portraits. Selection + crossfade are done client-side
    // (assets/js/main.js → initHeroPortrait) so an exact-date swap fires
    // regardless of the LiteSpeed page cache. Each image carries an optional
    // from/until window (YYYY-MM-DD); JS shows the ones whose window covers
    // "today" and crossfades between them.
    //
    // To add the December shot: drop it in with 'from' => '2026-12-01', and
    // (if you want a clean swap rather than both rotating) set the solo
    // photo's 'until' => '2026-12-01'.
    $tc_hero_imgs = array(
        // Solo selfie — current, until the December swap.
        array(
            'src'   => 'https://thomascheesman.ca/wp-content/uploads/2026/06/nEzwm.jpg',
            'alt'   => 'Thomas Cheesman',
            'from'  => '',
            'until' => '2026-12-01',
        ),
        // Cozy reading shot — auto-swaps in for December. Thomas okayed this
        // one for the public hero (2026-06-27), a deliberate OD-1 exception.
        array(
            'src'   => 'https://thomascheesman.ca/wp-content/uploads/2026/06/SCbHS.jpg',
            'alt'   => 'Thomas Cheesman reading with his son',
            'from'  => '2026-12-01',
            'until' => '',
        ),
    );
    ?>
    <section class="hero-section hero-section--pass">
        <div class="container hero-pass">

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
                                 data-from="<?php echo esc_attr( $img['from'] ); ?>"
                                 data-until="<?php echo esc_attr( $img['until'] ); ?>"
                                 loading="<?php echo $i === 0 ? 'eager' : 'lazy'; ?>" decoding="async" />
                        <?php endforeach; ?>
                    </div>
                    <figcaption class="hero-ticket__cap">table one &mdash; the family</figcaption>
                </figure>
            </div>

        </div>
    </section>

    <!-- THREE PILLARS SECTION -->
    <section class="pillars-section">
        <div class="container">
            <h2 class="pillars-heading kinetic-text-scroll" aria-label="What Defines TC 'ventures">What Defines TC 'ventures</h2>

            <div class="pillars-grid">

                <!-- PILLAR 1: FAMILY -->
                <div class="pillar-card">
                    <div class="pillar-icon" aria-hidden="true">
                        <span>👨‍👩‍👧‍👦</span>
                    </div>
                    <h3>Family &amp; Stories</h3>
                    <p>
                        Patience, Daniel, and Faith — and the eight family lines that took four hundred years and five countries to arrive in one Alberta house. If you're new here, start with them.
                    </p>
                    <a href="<?php echo home_url('/family'); ?>">Meet the family &rarr;</a>
                </div>

                <!-- PILLAR 2: RARE DISEASE & BYR -->
                <div class="pillar-card">
                    <div class="pillar-icon" aria-hidden="true">
                        <span>🔬</span>
                    </div>
                    <h3>Rare Disease &amp; BYR</h3>
                    <p>
                        I'm one of fewer than fifty people alive with Hajdu-Cheney syndrome. It taught me what 'rare' actually costs — so I built Bare Your Rare, where people with ultra-rare diseases tell their own stories. The deeper writing lives there.
                    </p>
                    <a href="https://bareyourrare.org" target="_blank" rel="noopener noreferrer">Visit Bare Your Rare &rarr;</a>
                </div>

                <!-- PILLAR 3: COMMUNITY -->
                <div class="pillar-card">
                    <div class="pillar-icon" aria-hidden="true">
                        <span>🤝</span>
                    </div>
                    <h3>Community &amp; Service</h3>
                    <p>
                        When your own body teaches you what an accessible home is worth, you don't forget it. I volunteer with the Grande Prairie Residential Society to help build them — and yes, I made their website too.
                    </p>
                    <a href="https://www.gpresidentialsociety.com" target="_blank" rel="noopener noreferrer">Visit GPRS (I created this website too!) &rarr;</a>
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