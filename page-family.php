<?php
/**
 * Page Template: Family
 *
 * Auto-applied by WordPress to any page whose slug is `family` (template
 * hierarchy resolves `page-{slug}.php` before the generic `page.php`).
 *
 * To activate:
 *   1. WP admin → Pages → Add New
 *   2. Title: "Family" (slug becomes "family" automatically)
 *   3. Publish. Visiting /family will now use this template.
 *   4. (Optional) Create a category named "family" — posts tagged with
 *      that category appear in the Stories feed at the bottom.
 *
 * This is the **template page** for the rebuild. The structure here —
 * page-hero / page-intro / people-grid / post-feed — is what About,
 * Community, and Journal will all reuse with different content.
 */

get_header(); ?>

<main id="primary" class="site-main">

    <!-- ==============================================================
         PAGE HERO
         A simpler, transparent band — kinetic title + subtitle only.
         No big gradient, no horizon glow. Those are reserved for the
         homepage so the "book cover" framing stays meaningful (only
         the front cover gets the lit edges).
         ============================================================== -->
    <section class="page-hero">
        <div class="container">
            <span class="page-hero__eyebrow">Pillar one</span>
            <h1 class="page-hero__title kinetic-text">Family</h1>
            <p class="page-hero__subtitle kinetic-fade">
                The people I love and the stories we share
            </p>
        </div>
    </section>

    <!-- ==============================================================
         PAGE INTRO
         A single lead paragraph. Sets the voice for the page.
         ============================================================== -->
    <section class="page-intro">
        <div class="container">
            <p class="page-intro__lead">
                This is where I keep the stories of the people who matter most — my children Patience, Daniel, and Faith, the extended family that holds us up, and the family lines that stretch back generations behind us. Some entries are small moments. Some are the long ones I keep coming back to.
            </p>
        </div>
    </section>

    <!-- ==============================================================
         PEOPLE GRID
         Reuses the homepage's .pillar-card pattern — same rotating
         conic-gradient border, same hover lift, same reveal choreography
         driven by initPillarReveal() in main.js (which targets any
         .pillars-section). Per-card colors come from --card-color-a/b
         on the nth-child rules; the 4th slot ("Heritage") is added
         in style.css for this page.
         ============================================================== -->
    <section class="pillars-section people-grid-section">
        <div class="container">
            <h2 class="pillars-heading kinetic-text-scroll" aria-label="The People">The People</h2>

            <div class="pillars-grid">

                <!-- Patience -->
                <div class="pillar-card person-card">
                    <div class="pillar-icon person-card__monogram">
                        <span aria-hidden="true">P</span>
                    </div>
                    <h3>Patience</h3>
                    <p class="person-card__role">Daughter</p>
                    <p>
                        Notes, photos, and the quiet moments that fill out who she is.
                    </p>
                    <a href="<?php echo esc_url( home_url( '/family/patience' ) ); ?>">Read her stories &rarr;</a>
                </div>

                <!-- Daniel -->
                <div class="pillar-card person-card">
                    <div class="pillar-icon person-card__monogram">
                        <span aria-hidden="true">D</span>
                    </div>
                    <h3>Daniel</h3>
                    <p class="person-card__role">Son</p>
                    <p>
                        The chapters of his story so far — and the ones still being written.
                    </p>
                    <a href="<?php echo esc_url( home_url( '/family/daniel' ) ); ?>">Read his stories &rarr;</a>
                </div>

                <!-- Faith -->
                <div class="pillar-card person-card">
                    <div class="pillar-icon person-card__monogram">
                        <span aria-hidden="true">F</span>
                    </div>
                    <h3>Faith</h3>
                    <p class="person-card__role">Daughter</p>
                    <p>
                        Memories large and small, and the things I want her to know.
                    </p>
                    <a href="<?php echo esc_url( home_url( '/family/faith' ) ); ?>">Read her stories &rarr;</a>
                </div>

                <!-- Heritage — the family lines -->
                <div class="pillar-card person-card">
                    <div class="pillar-icon person-card__monogram">
                        <span aria-hidden="true">H</span>
                    </div>
                    <h3>Heritage</h3>
                    <p class="person-card__role">Family lines</p>
                    <p>
                        The Cheesmans, Dochertys, Rycrofts, Haistes, and Lakemans — where we came from.
                    </p>
                    <a href="<?php echo esc_url( home_url( '/family/heritage' ) ); ?>">Trace the lines &rarr;</a>
                </div>

            </div>
        </div>
    </section>

    <!-- ==============================================================
         FAMILY-TAGGED POST FEED
         Reuses the homepage's .blog-section markup so the existing
         decelerated-tumble reveal in initBlogReveal() picks it up.
         Filters posts to the "family" category. Falls back to a
         placeholder message if no posts are categorized that way yet.
         ============================================================== -->
    <section class="blog-section scroll-animate">
        <div class="container">
            <h2>Stories</h2>

            <div class="posts-grid">
                <?php
                $args = array(
                    'post_type'      => 'post',
                    'posts_per_page' => 6,
                    'orderby'        => 'date',
                    'order'          => 'DESC',
                    'category_name'  => 'family',
                );

                $family_query = new WP_Query( $args );

                if ( $family_query->have_posts() ) :
                    while ( $family_query->have_posts() ) : $family_query->the_post();
                        ?>
                        <article class="post-card">

                            <?php if ( has_post_thumbnail() ) : ?>
                                <div class="post-card-thumb">
                                    <?php the_post_thumbnail( 'medium' ); ?>
                                </div>
                            <?php endif; ?>

                            <div class="post-card-body">
                                <div class="post-card-meta">
                                    <?php echo esc_html( get_the_date( 'F j, Y' ) ); ?>
                                </div>

                                <h3>
                                    <a href="<?php the_permalink(); ?>">
                                        <?php the_title(); ?>
                                    </a>
                                </h3>

                                <p>
                                    <?php echo esc_html( wp_trim_words( get_the_excerpt(), 20 ) ); ?>
                                </p>

                                <a href="<?php the_permalink(); ?>" class="post-card-readmore">
                                    Read More &rarr;
                                </a>
                            </div>
                        </article>
                        <?php
                    endwhile;
                    wp_reset_postdata();
                else :
                    ?>
                    <p class="page-feed__empty">
                        No family stories yet — they're on their way. Posts categorized <code>family</code> will appear here.
                    </p>
                    <?php
                endif;
                ?>
            </div>
        </div>
    </section>

</main>

<?php get_footer(); ?>
