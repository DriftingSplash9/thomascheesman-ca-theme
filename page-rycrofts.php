<?php
/**
 * Page Template: Heritage Spoke — The Rycrofts
 *
 * Auto-applied to the WP page with slug `rycrofts`. Page setup:
 *   - Title: "The Rycrofts" (slug stays "rycrofts")
 *   - Slug: rycrofts
 *   - Parent: Heritage  →  /family/heritage/rycrofts/
 *
 * Melanie's mother's side. Centerpiece: Robert Henry Rycroft, after
 * whom the Alberta hamlet of Rycroft is named (1920 hat-draw story).
 */

get_header(); ?>

<main id="primary" class="site-main heritage-page heritage-spoke heritage-spoke--rycrofts">

    <section class="page-hero">
        <div class="container">
            <a class="heritage-page__back" href="<?php echo esc_url( home_url( '/family/heritage' ) ); ?>">&larr; The Families</a>
            <span class="page-hero__eyebrow">Family line 04 of 05</span>
            <h1 class="page-hero__title kinetic-text">The Rycrofts</h1>
            <p class="page-hero__subtitle kinetic-fade">
                Pioneers of the Region
            </p>
        </div>
    </section>

    <article class="heritage-lines">
        <div class="container container--narrow">

            <section class="heritage-line heritage-line--spoke scroll-animate" id="rycrofts">
                <div class="heritage-line__body">

                    <p>The Rycroft side carries a piece of Peace Country history that still surprises me when I tell it. The town of Rycroft, Alberta is named after my wife's great-great-grandfather.</p>

                    <p><strong>Robert Henry Rycroft</strong> was born in 1872 in Honolulu to English parents. He spent years running a sugar and coffee plantation, moving goods between Hawaii, Japan, and the Philippines. In 1906 he met a 21-year-old Norwegian woman, <strong>Helene Lovise Christiane Thommessen</strong>, who was visiting Honolulu. They married five years later, on June 29, 1911, in Honolulu. Their honeymoon took them through British Columbia, where they first heard about the opportunities waiting up in the Peace Country. By 1912 they had registered two parcels of land near Spirit River.</p>

                    <p>In 1920, when the area split off from Spirit River and needed a name, four pioneers &mdash; R.H. Rycroft, W.S.O. &ldquo;Billy&rdquo; English, H.E. &ldquo;Doc&rdquo; Calkin, and George Garnett &mdash; wrote their names on slips of paper, dropped them in a hat, and pulled one out. The slip said Rycroft. (For about fourteen years afterward the local post office got it wrong and called itself &ldquo;Roycroft,&rdquo; until the Board of Trade finally got the spelling fixed in 1934 to match what the railway had used since 1916.)</p>

                    <aside class="heritage-line__quote" aria-hidden="true">
                        <p>The slip said Rycroft.</p>
                    </aside>

                    <p>R.H. and Helene hosted the first meeting of the Spirit River Rural Municipality in their home in January 1917. He served as the municipality's secretary-treasurer, sat on the school board, and was a Justice of the Peace for many years.</p>

                    <p>Their son <strong>Eric Jarmann Rycroft</strong> was born January 30, 1909, in Honolulu and came to Vancouver as a small child in 1912. He married <strong>Laureta Maud Jennie Clark</strong> on November 26, 1933, in Teepee Creek, Alberta. Eric died January 4, 1993, at 83 and is buried in Teepee Creek.</p>

                    <p>Eric and Laureta had a son, <strong>Samuel Eric Rycroft</strong> &mdash; Sam &mdash; born July 14, 1935, in Grande Prairie. Sam married <strong>Bette Steinke</strong> in 1959, and together they had four children: Lana, Lance, Vance, and Clark. They also had Lorne (May 1960), and other Rycroft cousins of that generation include Dennison &ldquo;Dennis&rdquo; (1937), Lona Helen Delores (1938), Thomas Floyd &ldquo;Tommy&rdquo; (1940), and Heather Bernice (1944).</p>

                    <p>Lana Rycroft is my wife's mother. That's where I come into the picture.</p>

                    <!-- Grandparents-with-grandchildren grid. Papa Sam died
                         after Patience was born but before Daniel and Faith,
                         so there is one Papa Sam photo (with Patience) and
                         three with Nana Bette (one per grandchild). The 2x2
                         visual asymmetry carries that story without prose.
                         Each cell reuses .heritage-line__figure so the grain
                         + vignette + hover-scale chrome stays consistent. -->
                    <div class="heritage-line__grid heritage-line__grid--2x2">
                        <figure class="heritage-line__figure">
                            <img
                                src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/05/Papa-Sam-and-Patience.png' ) ); ?>"
                                alt="<?php esc_attr_e( 'Papa Sam Rycroft holding newborn Patience', 'tc-ventures-child' ); ?>"
                                loading="lazy"
                            />
                        </figure>
                        <figure class="heritage-line__figure">
                            <img
                                src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/05/Nana-and-Patience.png' ) ); ?>"
                                alt="<?php esc_attr_e( 'Nana Bette Rycroft with infant Patience', 'tc-ventures-child' ); ?>"
                                loading="lazy"
                            />
                        </figure>
                        <figure class="heritage-line__figure">
                            <img
                                src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/05/Nana-and-Daniel.png' ) ); ?>"
                                alt="<?php esc_attr_e( 'Nana Bette Rycroft with infant Daniel', 'tc-ventures-child' ); ?>"
                                loading="lazy"
                            />
                        </figure>
                        <figure class="heritage-line__figure">
                            <img
                                src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/05/Nana-and-Faith.png' ) ); ?>"
                                alt="<?php esc_attr_e( 'Nana Bette Rycroft with infant Faith', 'tc-ventures-child' ); ?>"
                                loading="lazy"
                            />
                        </figure>
                    </div>

                    <p>I'm still digging through the family tree to fill in dates and connections &mdash; Eric Jarmann had eight or so siblings I haven't fully traced, and there are plenty of Rycroft cousins around the Peace Country I'd like to know better. More to add as I learn it.</p>

                    <figure class="heritage-line__figure">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/04/sam-and-bette-tombstone.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'The shared tombstone of Sam and Bette Rycroft', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                    </figure>

                </div>
            </section>

            <?php tc_render_heritage_siblings( 'rycrofts' ); ?>

        </div>
    </article>

</main>

<?php get_footer(); ?>
