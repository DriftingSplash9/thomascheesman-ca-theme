<?php
/**
 * Page Template: About — "The Long Version"
 *
 * Auto-applied by WordPress to any page whose slug is `about`.
 *
 * Layout: editorial reading column with floating figures throughout.
 * Each figure is shrunk to ~38% of column width and floated left or
 * right; prose wraps around it. Mobile drops floats and stacks
 * full-width.
 */

get_header();

// Personal-site link rendered with the dynamic host so this works on
// the staging URL today and on thomascheesman.ca after DNS flip,
// without needing a swap.
$personal_host = preg_replace( '#^https?://#', '', home_url() );
?>

<main id="primary" class="site-main about-page">

    <!-- ==============================================================
         PAGE HERO
         ============================================================== -->
    <section class="page-hero">
        <div class="container">
            <span class="page-hero__eyebrow">About</span>
            <h1 class="page-hero__title kinetic-text">The Long Version</h1>
            <p class="page-hero__subtitle kinetic-fade">
                Chef, dad, rare-disease guy &mdash; the unhurried bio.
            </p>
        </div>
    </section>

    <article class="about-body">
        <div class="container container--narrow">

            <!-- ======================================================
                 LEAD — seated portrait floated right, lead text wraps
                 ====================================================== -->
            <section class="about-section about-section--lead scroll-animate">
                <figure class="about-figure about-figure--right">
                    <img
                        src="<?php echo esc_url( home_url( '/wp-content/uploads/2024/08/img_2534-2-scaled-e1777196709673.jpg' ) ); ?>"
                        alt="<?php esc_attr_e( 'Thomas Cheesman, seated portrait', 'tc-ventures-child' ); ?>"
                        loading="eager"
                    />
                </figure>

                <p class="about-lead">
                    Hi, I'm Thomas Cheesman. I cooked for a living for the better part of two decades, taught it for a small stretch of that, and stopped when Hajdu-Cheney Syndrome made the line unimaginable. I live in Grande Prairie, Alberta, with Melanie and our three kids &mdash; Daniel, Patience, and Faith. The rest of this page is where the threads come from.
                </p>
            </section>

            <!-- ======================================================
                 KITCHEN YEARS — SAIT plate left, spring rolls right
                 ====================================================== -->
            <section class="about-section scroll-animate">
                <h2 class="about-section__heading">The kitchen years</h2>

                <figure class="about-figure about-figure--left">
                    <img
                        src="<?php echo esc_url( home_url( '/wp-content/uploads/2024/09/2023-07-2710.jpg' ) ); ?>"
                        alt="<?php esc_attr_e( 'Plated breakfast from my SAIT apprenticeship', 'tc-ventures-child' ); ?>"
                        loading="lazy"
                    />
                    <figcaption>Apprentice plate, SAIT.</figcaption>
                </figure>

                <p>I went to SAIT in Calgary for the Apprentice Cooking program, then worked as Head Chef at Ric's Grill. While chefing it up at Ric's Grill I was offered the opportunity to teach the cooking part of the Hospitality and Tourism Diploma at GPRC &mdash; the Grande Prairie Regional College, now Northwestern Polytechnic. I was feeling some real pressure at the time. I was still a new dad, I was beginning to really struggle with HCS and the physical requirements of a Chef position. I was shutting down Ric's Grill so that we could renovate and open a new restaurant called Township71. It was the day before opening Melanie and I were surprised to realize she was pregnant with what grew to become our handsome boy Daniel.</p>

                <figure class="about-figure about-figure--right">
                    <img
                        src="<?php echo esc_url( home_url( '/wp-content/uploads/2024/09/2023-07-2720.jpg' ) ); ?>"
                        alt="<?php esc_attr_e( 'Smoked-salmon spring rolls plated for a six-course wine dinner', 'tc-ventures-child' ); ?>"
                        loading="lazy"
                    />
                    <figcaption>Smoked-salmon spring rolls &mdash; six-course wine dinner.</figcaption>
                </figure>

                <p>I wrote curriculum. I built lesson plans. I stood in front of students eager to learn and I had to be the one with the answer by day 2. That was the hardest time I ever had and the best one.</p>

                <p>The last full kitchen I ran was Majors Homestyle &amp; Tractor Jack's. Before that, Ric's Grill &amp; Township 71 &mdash; I started at Ric's Grill as Head Chef on the same day Patience was born, ten days late. There's a story in that.</p>

                <p>What stopped me wasn't a single moment. Hajdu-Cheney takes hands and feet apart slowly. There comes a point where you can't sustain twelve hours on the line with a thirty-pound stockpot and a saute pan you have to grip white-knuckled. Standing and walking 12 miles a day over 8&ndash;16 hours was no joy. I wish I knew it before everyone around me did, still, I'm grateful I got to leave on my own terms. I wish I would have stopped or slowed down my degeneration but the years since I stopped have been the hardest of my life.</p>
            </section>

            <!-- ======================================================
                 CONSTRAINT — halo photo left
                 ====================================================== -->
            <section class="about-section scroll-animate">
                <h2 class="about-section__heading">The constraint</h2>

                <figure class="about-figure about-figure--left">
                    <img
                        src="<?php echo esc_url( home_url( '/wp-content/uploads/2024/09/renderedimage1-scaled.jpg' ) ); ?>"
                        alt="<?php esc_attr_e( 'In a halo brace after cervical spinal fusion', 'tc-ventures-child' ); ?>"
                        loading="lazy"
                    />
                    <figcaption>In the halo, after spinal fusion.</figcaption>
                </figure>

                <p>Hajdu-Cheney Syndrome &mdash; "hay-dew chaye-knee" &mdash; is a rare connective-tissue and bone disorder. The skeletal system reabsorbs faster than it should; the bones in the hands and feet get smaller/shorter over time. There are roughly a hundred documented and not even fifty alive cases in the world, give or take. It's the reason I built <a href="https://bareyourrare.org">Bare Your Rare</a>. The full version of that story lives at <a href="<?php echo esc_url( home_url( '/hcs' ) ); ?>">/hcs</a>.</p>
            </section>

            <!-- ======================================================
                 FAMILY & HERITAGE — age-20 family shot right, Daniel left
                 ====================================================== -->
            <section class="about-section scroll-animate">
                <h2 class="about-section__heading">Family &amp; heritage</h2>

                <figure class="about-figure about-figure--right">
                    <img
                        src="<?php echo esc_url( home_url( '/wp-content/uploads/2024/09/family-photos-me-as-a-kid_20230428134713018-1-scaled-e1777198573783.jpg' ) ); ?>"
                        alt="<?php esc_attr_e( 'Mom, Brian, Chris, Jonathan, and me around 2001', 'tc-ventures-child' ); ?>"
                        loading="lazy"
                    />
                    <figcaption>Mom, Brian, Chris, Jonathan, and me &mdash; about 2001.</figcaption>
                </figure>

                <p>Melanie and I were apart for a decade before we got back together, and then had three kids in five years. The kids' stories, and the five family lines that meet in them, live at <a href="<?php echo esc_url( home_url( '/family' ) ); ?>">/family</a>.</p>

                <figure class="about-figure about-figure--left">
                    <img
                        src="<?php echo esc_url( home_url( '/wp-content/uploads/2025/03/20180904_184232-scaled.jpg' ) ); ?>"
                        alt="<?php esc_attr_e( 'Daniel and me', 'tc-ventures-child' ); ?>"
                        loading="lazy"
                    />
                    <figcaption>Daniel and I.</figcaption>
                </figure>

                <p>Since I left the kitchen I've used a lot of that returned time putting our family history together &mdash; back to the 1600s on a couple of branches. The long-form research turns into video documentaries on YouTube at <a href="https://www.youtube.com/@DriftingSplash9">@DriftingSplash9</a>. <em>The Lakeman Branch of Our Family</em> and <em>Haiste Family Line From Daniel On</em> are the two longest, ninety minutes each. The condensed versions live in the heritage section of this site.</p>
            </section>

            <!-- ======================================================
                 THREE SITES — Patience photo right
                 ====================================================== -->
            <section class="about-section scroll-animate">
                <h2 class="about-section__heading">Three sites I built</h2>

                <figure class="about-figure about-figure--right">
                    <img
                        src="<?php echo esc_url( home_url( '/wp-content/uploads/2025/03/20181209_183100-scaled.jpg' ) ); ?>"
                        alt="<?php esc_attr_e( 'Patience and me', 'tc-ventures-child' ); ?>"
                        loading="lazy"
                    />
                    <figcaption>Patience and I.</figcaption>
                </figure>

                <p>I run three websites now, which is funny to type given that I'm not a programmer.</p>

                <p>This one &mdash; <a href="<?php echo esc_url( home_url() ); ?>"><?php echo esc_html( $personal_host ); ?></a> &mdash; is the personal hub. <a href="https://bareyourrare.org">bareyourrare.org</a> is a writing project about Hajdu-Cheney specifically and rare disease in general, built for the small group of people who go looking for it and don't find much. <a href="https://gpresidentialsociety.com">gpresidentialsociety.com</a> is the volunteer hub for the Grande Prairie Residential Society; I sit on its board and the website work is one of the ways I contribute.</p>

                <p>I work with Claude, Anthropic's coding assistant, to build them. I don't write the code; I spec the design, the voice, the editorial moves, and Claude writes them out. Three sites in eighteen months says something about how that collaboration goes.</p>
            </section>

            <!-- ======================================================
                 CHEWING ON — Faith photo left
                 ====================================================== -->
            <section class="about-section scroll-animate">
                <h2 class="about-section__heading">What I'm chewing on</h2>

                <figure class="about-figure about-figure--left">
                    <img
                        src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/04/me-and-faith.jpg' ) ); ?>"
                        alt="<?php esc_attr_e( 'Faith and me', 'tc-ventures-child' ); ?>"
                        loading="lazy"
                    />
                    <figcaption>Faith and I.</figcaption>
                </figure>

                <p>I've kept structured goals &mdash; BHAGs, PDPs, annual reviews &mdash; for almost twenty years. The frameworks stayed even when the kitchen left.</p>

                <p>Lately the threads are: Bitcoin and decentralized ledgers (curiosity, mostly), AISH advocacy &mdash; Alberta's disability program is in a slow crisis and I've written about it &mdash; and the slow craft of getting the family record onto the page before the people who remember it stop being here to ask.</p>
            </section>

            <!-- ======================================================
                 CLOSING + CONTACT CTA
                 ====================================================== -->
            <section class="about-section about-section--closing scroll-animate">
                <p class="about-closing">
                    The fastest way to reach me is email. <a href="<?php echo esc_url( home_url( '/contact' ) ); ?>">The contact page has it.</a>
                </p>
            </section>

        </div>
    </article>

</main>

<?php get_footer(); ?>
