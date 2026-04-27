<?php
/**
 * Page Template: Heritage Spoke — The Cheesmans
 *
 * Auto-applied to the WP page with slug `cheesmans`. Page should be
 * created in admin with:
 *   - Title: "The Cheesmans" (or "Cheesmans" — slug stays "cheesmans")
 *   - Slug: cheesmans
 *   - Parent: Heritage  →  URL becomes /family/heritage/cheesmans/
 *
 * Shares chrome with the other four heritage spokes (dochertys,
 * lakemans, rycrofts, haistes). Reuses the existing .heritage-line
 * CSS shell from page-heritage.php so the frosted-glass plate, the
 * accent wash, and the typographic treatment carry over — content
 * is just zoomed in to a single line per page.
 */

get_header(); ?>

<main id="primary" class="site-main heritage-page heritage-spoke heritage-spoke--cheesmans">

    <!-- ==============================================================
         PAGE HERO
         Eyebrow shows position in the five-line set; breadcrumb above
         the eyebrow returns to the hub.
         ============================================================== -->
    <section class="page-hero">
        <div class="container">
            <a class="heritage-page__back" href="<?php echo esc_url( home_url( '/family/heritage' ) ); ?>">&larr; The Families</a>
            <span class="page-hero__eyebrow">Family line 01 of 05</span>
            <h1 class="page-hero__title kinetic-text">The Cheesmans</h1>
            <p class="page-hero__subtitle kinetic-fade">
                The Cheesiest Clan
            </p>
        </div>
    </section>

    <!-- ==============================================================
         SPOKE BODY
         One .heritage-line wrapper containing all the line's prose,
         images, quotes, and callouts. The wrapper supplies the frosted
         plate; the spoke modifier removes the giant ghost numeral and
         duplicate H2 (those would conflict with the page-hero above).
         ============================================================== -->
    <article class="heritage-lines">
        <div class="container container--narrow">

            <section class="heritage-line heritage-line--spoke scroll-animate" id="cheesmans">
                <div class="heritage-line__body">

                    <p>No, I don't know any actual cheese makers. No, you're not original with whatever joke just popped into your head. Yes, I love cheese &mdash; the real stuff, not the processed plastic.</p>

                    <figure class="heritage-line__figure">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2024/08/img_9372.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Thomas with his brothers — the Cheesman / Lakeman boys', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                        <figcaption>The brothers &mdash; Cheesman by name, Lakeman by half.</figcaption>
                    </figure>

                    <p>We became Cheesmans on July 20, 1991, when my mom Maryanne (Elizabeth) Docherty married Brian Cheesman. It was a double wedding &mdash; same day, same ceremony as Brian's older brother Dave (born July 1967) and his bride Kelly. Brian was 20 at the time. The two couples stood up together and walked out as two new families in one afternoon.</p>

                    <figure class="heritage-line__figure">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/04/Brian-cheesman.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Brian Cheesman', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                        <figcaption>Brian Cheesman &mdash; the name we took on.</figcaption>
                    </figure>

                    <p>Amber, Dave and Kelly's oldest, had already been born earlier that January. Their other two daughters, Marla and Clarisa, came later. Marla went on to marry Ryan Linson.</p>

                    <p>The grandparents on this side were John and Sandra Cheesman. John passed away from cancer. Sandy is still with us, though pain and limited mobility keep her close to home. The Cheesmans tend to keep a tight circle &mdash; for years it was really just John, Sandy, the two boys, and Sandy's mother. It must be a Cheesman thing.</p>

                    <figure class="heritage-line__figure">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2024/09/mel_s-camera-120510-128-2-1-scaled.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Gramma Cheesman — Sandy', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                        <figcaption>Gramma Cheesman &mdash; Sandy.</figcaption>
                    </figure>

                    <aside class="heritage-line__quote" aria-hidden="true">
                        <p>The Cheesman name is the one I carry, and the one my kids carry now.</p>
                    </aside>

                    <p>Brian is my stepfather. My biological father is Martin Lakeman, which is its own family line further down the hub. Both men are part of how I got here. The Cheesman name is the one I carry, and the one my kids carry now.</p>

                    <figure class="heritage-line__figure">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/04/brian-and-his-mom-sandy.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Brian Cheesman with his mother Sandy', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                        <figcaption>Brian and his mom &mdash; Gramma Sandy.</figcaption>
                    </figure>

                    <figure class="heritage-line__figure">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2024/08/img_9292-1-1.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Christopher and Bonnie Cheesman with their sons Sebastian and Logan', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                        <figcaption>My brother Christopher with Bonnie and their boys, Sebastian and Logan &mdash; the next generation carrying the name.</figcaption>
                    </figure>

                    <figure class="heritage-line__figure">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/04/chris-sandy.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Christopher Cheesman with Gramma Sandy', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                        <figcaption>Christopher with Gramma Sandy.</figcaption>
                    </figure>

                    <p>For a long stretch &mdash; roughly 1990 to 2013 &mdash; the Cheesman side stayed small and close. Mostly just my immediate family and a handful of relatives. I'd love more group photos of the cousins and their families now. If you have them, send them. It's been long enough. Time to put everyone in the same frame again.</p>

                    <figure class="heritage-line__figure heritage-line__figure--bw">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/04/cousins-2.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Sebastian and Logan Cheesman lying on the grass on their elbows', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                        <figcaption>Sebastian and Logan, in the grass.</figcaption>
                    </figure>

                    <figure class="heritage-line__figure">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/04/logan.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Logan Cheesman portrait', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                        <figcaption>Logan.</figcaption>
                    </figure>

                    <figure class="heritage-line__figure">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/04/sebastian-in-sun.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Sebastian Cheesman portrait in sunlight', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                        <figcaption>Sebastian.</figcaption>
                    </figure>

                </div>
            </section>

        </div>
    </article>

</main>

<?php get_footer(); ?>
