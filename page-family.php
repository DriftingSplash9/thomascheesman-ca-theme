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
         HERO FIGURE
         Wide editorial photo that sits under the page-hero band.
         Group photo, summer 2024. Uses home_url() so the image URL
         stays correct after the site moves from staging to production.
         ============================================================== -->
    <figure class="page-figure page-figure--hero">
        <img
            src="<?php echo esc_url( home_url( '/wp-content/uploads/2024/08/img_9320.jpg' ) ); ?>"
            alt="<?php esc_attr_e( 'Extended-family group photo, summer 2024', 'tc-ventures-child' ); ?>"
            loading="eager"
        />
    </figure>

    <!-- ==============================================================
         PAGE INTRO
         A single lead paragraph. Sets the voice for the page.
         ============================================================== -->
    <section class="page-intro">
        <div class="container">
            <p class="page-intro__lead">
                This part of the site is about my kids and the families they came from. Patience, Daniel, and Faith are the reason I'm here &mdash; three kids I never thought I'd have, given the Hajdu-Cheney Syndrome that I figured I would never take that risk on. Around the three of them are the rest of it: Cheesmans, Dochertys, McIvers, Rycrofts, Haistes, Lakemans. Five family lines, a handful of stories, and the things I want my kids to be able to find later if they go looking.
            </p>
        </div>
    </section>

    <!-- ==============================================================
         SECONDARY FIGURE
         The three kids together — sits between the lead and the
         four-card people-grid as a visual transition.
         ============================================================== -->
    <figure class="page-figure page-figure--inline">
        <img
            src="<?php echo esc_url( home_url( '/wp-content/uploads/2024/08/fall-leaves-scaled.jpg' ) ); ?>"
            alt="<?php esc_attr_e( 'The three kids together', 'tc-ventures-child' ); ?>"
            loading="lazy"
        />
    </figure>

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
                        My oldest. Arrived 10 days late on the same day I started as Head Chef at Ric's Grill. Natural leader, big-sister boss, dimples she tries to hide when she grins.
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
                        Born June 30, 2015. Uncle Vance nicknamed him Charlie Brown for the bald head. Never crawled &mdash; just butt-scootched. A silent observer who pays attention more than he says.
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
                        Born March 29, 2017. Her name came to me in a dream at 3 a.m. We weren't sure of it until she choked while still in the hospital and got rushed to the NICU &mdash; then we knew.
                    </p>
                    <a href="<?php echo esc_url( home_url( '/family/faith' ) ); ?>">Read her stories &rarr;</a>
                </div>

                <!-- The Families — five family lines on a single hub page -->
                <div class="pillar-card person-card">
                    <div class="pillar-icon person-card__monogram">
                        <span aria-hidden="true">5</span>
                    </div>
                    <h3>The Families</h3>
                    <p class="person-card__role">Five lines, one household</p>
                    <p>
                        Five family lines: Cheesmans, Dochertys and McIvers, Rycrofts, Haistes, and Lakemans. Some I know well, some I'm still piecing together. This is where I keep what I've found &mdash; and what's still missing.
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

    <!-- ==============================================================
         PHOTO CREDIT
         Small italic colophon line at the bottom of the page,
         crediting the photographer for the recent family photos.
         ============================================================== -->
    <p class="page-credit">
        Most of the recent family photos on these pages were taken by my good friend Dalyn Echo in summer 2024. Thanks Dalyn.
    </p>

</main>

<?php get_footer(); ?>
