<?php
/**
 * Page Template: About — "The Long Version"
 *
 * Auto-applied by WordPress to any page whose slug is `about`.
 *
 * Layout (top to bottom):
 *   1. Page hero — title + eyebrow + subtitle
 *   2. Headshot figure + lead paragraph
 *   3. The kitchen years (career arc + teaching + leaving the line)
 *   4. The constraint (HCS in one paragraph, links to /hcs)
 *   5. Family + heritage (Mel, kids, the genealogy project + YouTube)
 *   6. Three sites I built (BYR, GPRS, this one)
 *   7. What I'm chewing on (goal-setting, Bitcoin, AISH, slow craft)
 *   8. Closing line + contact CTA
 *
 * Body class `about-page` keeps WebGL background + chrome on, but the
 * particle field is already gated to home + person-spoke pages in
 * main.js so this page reads clean — no particles, just the dark
 * editorial bg. Same color theme as the homepage, no per-page accent.
 */

get_header(); ?>

<main id="primary" class="site-main about-page">

    <!-- ==============================================================
         PAGE HERO
         Title is the kicker; subtitle calls the page what it is.
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

    <!-- ==============================================================
         BODY
         Single narrow reading column carries every section. Same
         container width as the heritage spokes so the typography
         scale matches across the site.
         ============================================================== -->
    <article class="about-body">
        <div class="container container--narrow">

            <!-- ======================================================
                 LEAD — headshot + opening paragraph
                 ====================================================== -->
            <section class="about-section about-section--lead scroll-animate">
                <figure class="heritage-line__figure">
                    <img
                        src="<?php echo esc_url( home_url( '/wp-content/uploads/2024/10/20180809_142120-scaled.jpg' ) ); ?>"
                        alt="<?php esc_attr_e( 'Thomas Cheesman portrait', 'tc-ventures-child' ); ?>"
                        loading="eager"
                    />
                </figure>

                <p class="about-lead">
                    I'm Thomas Cheesman. I cooked for a living for the better part of two decades, taught it for a stretch of that, and stopped when Hajdu-Cheney Syndrome made the line untenable. I live in Grande Prairie, Alberta, with Melanie and our three kids &mdash; Patience, Daniel, and Faith. The rest of this page is where the threads come from.
                </p>
            </section>

            <!-- ======================================================
                 THE KITCHEN YEARS
                 The piece of the bio that isn't elsewhere on the site.
                 Gets the most space.
                 ====================================================== -->
            <section class="about-section scroll-animate">
                <h2 class="about-section__heading">The kitchen years</h2>

                <p>I went to SAIT in Calgary for the Professional Cooking program, then transferred north to GPRC &mdash; the Grande Prairie Regional College, now Northwestern Polytechnic &mdash; to finish my apprenticeship. I cooked through the rest of my twenties and into my thirties, climbed every station the industry has, and ended up running kitchens.</p>

                <p>For a stretch I taught the trade. ACKP &mdash; the Apprenticeship Cook Program &mdash; Year 2 and Year 3 modules: cold foods, hot foods, meat cutting, kitchen management. I wrote curriculum. I built lesson plans. I stood in front of cooks who knew more than me on day one and I had to be the one with the answer by day five. That was the hardest job I ever had and the best one.</p>

                <p>The last full kitchen I ran was Majors Homestyle. Before that, Tractor Jack's. Before that, Ric's Grill &mdash; I started there as Head Chef on the same day Patience was born, ten days late. There's a story in that.</p>

                <p>What stopped me wasn't a single moment. Hajdu-Cheney takes hands and feet apart slowly. There comes a point where you can't sustain twelve hours on the line with a thirty-pound stockpot and a saute pan you have to grip white-knuckled. I knew it before everyone around me did. I'm grateful I got to leave on my own terms.</p>
            </section>

            <!-- ======================================================
                 THE CONSTRAINT
                 Brief HCS paragraph. Real depth lives at /hcs.
                 ====================================================== -->
            <section class="about-section scroll-animate">
                <h2 class="about-section__heading">The constraint</h2>

                <p>Hajdu-Cheney Syndrome &mdash; "hay-do chay-knee" &mdash; is a rare connective-tissue disorder. The skeletal system reabsorbs faster than it should; the bones in the hands and feet get smaller over time. There are roughly a hundred and fifty documented cases in the world, give or take. It's the reason I built <a href="https://bareyourrare.org">Bare Your Rare</a>. The full version of that story lives at <a href="<?php echo esc_url( home_url( '/hcs' ) ); ?>">/hcs</a>.</p>
            </section>

            <!-- ======================================================
                 FAMILY + HERITAGE
                 Bridges to /family and the YouTube heritage videos.
                 ====================================================== -->
            <section class="about-section scroll-animate">
                <h2 class="about-section__heading">Family &amp; heritage</h2>

                <p>Melanie and I were apart for a decade before we got back together, and then had three kids in five years. The kids' stories, and the five family lines that meet in them, live at <a href="<?php echo esc_url( home_url( '/family' ) ); ?>">/family</a>.</p>

                <p>Since I left the kitchen I've used a lot of that returned time putting our family history together &mdash; back to the 1600s on a couple of branches. The long-form research turns into video documentaries on YouTube at <a href="https://www.youtube.com/@DriftingSplash9">@DriftingSplash9</a>. <em>The Lakeman Branch of Our Family</em> and <em>Haiste Family Line From Daniel On</em> are the two longest, ninety minutes each. The condensed versions live in the heritage section of this site.</p>
            </section>

            <!-- ======================================================
                 THREE SITES
                 Inline mentions only — pillar cards on the homepage
                 already cover the "go visit" CTA.
                 ====================================================== -->
            <section class="about-section scroll-animate">
                <h2 class="about-section__heading">Three sites I built</h2>

                <p>I run three websites now, which is funny to type given that I'm not a programmer.</p>

                <p>This one &mdash; <strong>thomascheesman.ca</strong> &mdash; is the personal hub. <a href="https://bareyourrare.org">bareyourrare.org</a> is a writing project about Hajdu-Cheney specifically and rare disease in general, built for the small group of people who go looking for it and don't find much. <a href="https://gpresidentialsociety.com">gpresidentialsociety.com</a> is the volunteer hub for the Grande Prairie Residential Society; I sit on its board and the website work is one of the ways I contribute.</p>

                <p>I work with Claude, Anthropic's coding assistant, to build them. I don't write the code; I spec the design, the voice, the editorial moves, and Claude writes them out. Three sites in eighteen months says something about how that collaboration goes.</p>
            </section>

            <!-- ======================================================
                 WHAT I'M CHEWING ON
                 Catch-all for civic life, curiosities, the goal-setting
                 thread. Bridges to /journal eventually.
                 ====================================================== -->
            <section class="about-section scroll-animate">
                <h2 class="about-section__heading">What I'm chewing on</h2>

                <p>I've kept structured goals &mdash; BHAGs, PDPs, annual reviews &mdash; for almost twenty years, since the corporate-kitchen days when somebody handed me a Jim Collins book. The frameworks stayed even when the kitchen left.</p>

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
