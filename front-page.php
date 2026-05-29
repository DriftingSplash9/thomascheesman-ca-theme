<?php
/**
 * Front Page / Homepage Template
 * TC 'ventures Child Theme
 */

get_header(); ?>

<main id="primary" class="site-main">
    
    <!-- HERO SECTION -->
    <section class="hero-section">
        <div class="container">
            <h1 class="hero-title kinetic-text" aria-label="Welcome to TC 'ventures">
                Welcome to TC 'ventures
            </h1>
            <p class="hero-subtitle kinetic-fade">
                Exploring life, family, and what matters most to me
            </p>
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
                        Life's greatest joy comes from the people we love. Discover the stories of Patience, Daniel, Faith, and the extended family that makes me whole.
                    </p>
                    <a href="<?php echo home_url('/family'); ?>">Explore My Family Stories &rarr;</a>
                </div>

                <!-- PILLAR 2: RARE DISEASE & BYR -->
                <div class="pillar-card">
                    <div class="pillar-icon" aria-hidden="true">
                        <span>🔬</span>
                    </div>
                    <h3>Rare Disease &amp; BYR</h3>
                    <p>
                        Hajdu-Cheney Syndrome shaped how I think about rare conditions. I built Bare Your Rare so patients with ultra-rare diseases could tell their stories together — that's where the deeper writing lives.
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
                        Giving back matters. I volunteer with Grande Prairie Residential Society to provide accessible housing in our community.
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