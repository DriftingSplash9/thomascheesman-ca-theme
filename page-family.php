<?php
/**
 * Page Template: Family
 *
 * Auto-applied by WordPress to any page whose slug is `family`.
 *
 * Layout (top to bottom):
 *   1. Page hero (kinetic title + subtitle)
 *   2. Side-by-side hero photos (group + three kids)
 *   3. Page intro lead paragraph
 *   4. The family tree — a single illustrated tree with five family-line
 *      chips along the canopy and three kid chips at the roots. Each
 *      chip links to its spoke (heritage line) or per-person page.
 *   5. Heritage banner — a wider call-to-action linking to the
 *      /family/heritage hub for the deeper card-grid view of all 5 lines.
 *   6. Stories feed (posts categorized "family")
 *   7. Photo credit colophon
 */

get_header(); ?>

<main id="primary" class="site-main family-page">

    <!-- ==============================================================
         PAGE HERO
         Kinetic title + eyebrow + subtitle. No big gradient or horizon
         glow — those are reserved for the homepage hero.
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
         HERO PAIR
         Two hero photos side by side instead of stacked: the
         extended-family group on the left, the three kids on the right.
         Both eager-loaded — they're above the fold on desktop.
         ============================================================== -->
    <div class="hero-pair">
        <figure class="hero-pair__item">
            <img
                src="<?php echo esc_url( home_url( '/wp-content/uploads/2024/08/img_9320.jpg' ) ); ?>"
                alt="<?php esc_attr_e( 'Extended-family group photo, summer 2024', 'tc-ventures-child' ); ?>"
                loading="eager"
            />
        </figure>
        <figure class="hero-pair__item">
            <img
                src="<?php echo esc_url( home_url( '/wp-content/uploads/2024/08/fall-leaves-scaled.jpg' ) ); ?>"
                alt="<?php esc_attr_e( 'The three kids together', 'tc-ventures-child' ); ?>"
                loading="eager"
            />
        </figure>
    </div>

    <!-- ==============================================================
         PAGE INTRO
         Single lead paragraph in the narrower reading column.
         ============================================================== -->
    <section class="page-intro">
        <div class="container">
            <p class="page-intro__lead">
                This part of the site is about my kids and the families they came from. Patience, Daniel, and Faith are the reason I'm here &mdash; three kids I never thought I'd have, given the Hajdu-Cheney Syndrome that I figured I would never take that risk on. Around the three of them are the rest of it: Cheesmans, Dochertys, McIvers, Rycrofts, Haistes, Lakemans. Five family lines, a handful of stories, and the things I want my kids to be able to find later if they go looking.
            </p>
        </div>
    </section>

    <!-- ==============================================================
         THE FAMILY TREE
         A transparent-PNG tree image as the visual scaffolding, with
         eight chips positioned absolutely around it: 5 family-line
         chips along the canopy edge (top), 3 kid chips at the roots
         (bottom). Each chip is a link.

         Tree image: assets/img/family-tree.png. Sized to a fixed
         aspect ratio so chip percentages stay anchored to the same
         visual landmarks at every breakpoint.

         Mobile fallback (< 768px, see CSS): the tree disappears and
         the chips become a clean stacked list, separated into a
         "Branches" group and a "Roots" group via CSS.
         ============================================================== -->
    <section class="family-tree-section scroll-animate">
        <div class="container">
            <h2 class="family-tree-section__heading kinetic-text-scroll">The Family Tree</h2>

            <div class="family-tree" role="navigation" aria-label="<?php esc_attr_e( 'Family tree — branches and roots', 'tc-ventures-child' ); ?>">
                <img
                    class="family-tree__image"
                    src="<?php echo esc_url( get_stylesheet_directory_uri() . '/assets/img/family-tree.png' ); ?>"
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                />

                <!-- Branches — five family lines, in numbered order. -->
                <a class="tree-chip tree-chip--branch tree-chip--cheesmans" href="<?php echo esc_url( home_url( '/family/heritage/cheesmans' ) ); ?>">
                    <span class="tree-chip__eyebrow">01</span>
                    <span class="tree-chip__title">The Cheesmans</span>
                    <span class="tree-chip__cta">Read the line &rarr;</span>
                </a>
                <a class="tree-chip tree-chip--branch tree-chip--dochertys" href="<?php echo esc_url( home_url( '/family/heritage/dochertys' ) ); ?>">
                    <span class="tree-chip__eyebrow">02</span>
                    <span class="tree-chip__title">The Dochertys</span>
                    <span class="tree-chip__cta">Read the line &rarr;</span>
                </a>
                <a class="tree-chip tree-chip--branch tree-chip--lakemans" href="<?php echo esc_url( home_url( '/family/heritage/lakemans' ) ); ?>">
                    <span class="tree-chip__eyebrow">03</span>
                    <span class="tree-chip__title">The Lakemans</span>
                    <span class="tree-chip__cta">Read the line &rarr;</span>
                </a>
                <a class="tree-chip tree-chip--branch tree-chip--rycrofts" href="<?php echo esc_url( home_url( '/family/heritage/rycrofts' ) ); ?>">
                    <span class="tree-chip__eyebrow">04</span>
                    <span class="tree-chip__title">The Rycrofts</span>
                    <span class="tree-chip__cta">Read the line &rarr;</span>
                </a>
                <a class="tree-chip tree-chip--branch tree-chip--haistes" href="<?php echo esc_url( home_url( '/family/heritage/haistes' ) ); ?>">
                    <span class="tree-chip__eyebrow">05</span>
                    <span class="tree-chip__title">The Haistes</span>
                    <span class="tree-chip__cta">Read the line &rarr;</span>
                </a>

                <!-- Roots — the three kids, in chronological order. -->
                <a class="tree-chip tree-chip--root tree-chip--patience" href="<?php echo esc_url( home_url( '/family/patience' ) ); ?>">
                    <span class="tree-chip__title">Patience</span>
                    <span class="tree-chip__role">Daughter</span>
                </a>
                <a class="tree-chip tree-chip--root tree-chip--daniel" href="<?php echo esc_url( home_url( '/family/daniel' ) ); ?>">
                    <span class="tree-chip__title">Daniel</span>
                    <span class="tree-chip__role">Son</span>
                </a>
                <a class="tree-chip tree-chip--root tree-chip--faith" href="<?php echo esc_url( home_url( '/family/faith' ) ); ?>">
                    <span class="tree-chip__title">Faith</span>
                    <span class="tree-chip__role">Daughter</span>
                </a>
            </div>
        </div>
    </section>

    <!-- ==============================================================
         HERITAGE BANNER
         A wide horizontal CTA below the tree, linking to the
         /family/heritage hub. The tree gives jump links to each spoke;
         this banner is the "see all five together" alternative.
         ============================================================== -->
    <section class="heritage-banner-section scroll-animate">
        <div class="container">
            <a class="heritage-banner" href="<?php echo esc_url( home_url( '/family/heritage' ) ); ?>">
                <div class="heritage-banner__body">
                    <span class="heritage-banner__eyebrow">Heritage</span>
                    <h3 class="heritage-banner__title">Five lines, one household</h3>
                    <p class="heritage-banner__copy">
                        The deeper read on where the kids came from &mdash; Cheesmans, Dochertys, Lakemans, Rycrofts, and Haistes, each with their own page.
                    </p>
                </div>
                <span class="heritage-banner__cta" aria-hidden="true">Read the lines &rarr;</span>
            </a>
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
         Italic colophon line crediting the photographer of the
         summer 2024 family photos.
         ============================================================== -->
    <p class="page-credit">
        Most of the recent family photos on these pages were taken by my good friend Dalyn Echo in summer 2024. Thanks Dalyn.
    </p>

</main>

<?php get_footer(); ?>
