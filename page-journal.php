<?php
/**
 * Page Template: Journal — "My Ramblings"
 *
 * Auto-applied by WordPress to any page whose slug is `journal`.
 *
 * Layout: editorial chrome (page-hero + narrow container) + a post
 * archive list. Excludes family and hcs categories — family stories
 * have a dedicated home at /family, HCS deep-dives live on /hcs.
 * Everything else lands here: finance, civics, AISH, Bitcoin, the
 * miscellaneous in-between.
 *
 * Cards are horizontal (thumb + body) collapsing to vertical on
 * narrow viewports. Posts without a featured image render full-width
 * (no empty thumb column).
 */

get_header();
?>

<main id="primary" class="site-main journal-page">

    <!-- ==============================================================
         PAGE HERO
         ============================================================== -->
    <section class="page-hero">
        <div class="container">
            <span class="page-hero__eyebrow">My Ramblings</span>
            <h1 class="page-hero__title kinetic-text">My Ramblings</h1>
            <p class="page-hero__subtitle kinetic-fade">
                Squirrels, Flying Pigs, Crayons
            </p>
        </div>
    </section>

    <article class="about-body">
        <div class="container container--narrow">

            <section class="about-section scroll-animate">

                <p class="about-lead">
                    This is where the topics that don't fit Family or HCS end up &mdash; finance, civics, AISH, Bitcoin, whatever I've been chewing on lately. Most of it lives somewhere between a journal entry and a draft. None of it is final. The Hajdu-Cheney and rare-disease writing mostly lives over on <a href="https://bareyourrare.org" target="_blank" rel="noopener noreferrer">Bare Your Rare</a>.
                </p>

                <?php
                // Exclude family and hcs categories. Look up by slug, not
                // display name — display names get renamed (e.g. "HCS" →
                // "Hajdu-Cheney Syndrome") and break get_cat_ID(). Slugs
                // are stable. array_filter strips any zeros so the query
                // doesn't accidentally exclude posts in category ID 0.
                $family_term = get_term_by( 'slug', 'family', 'category' );
                $hcs_term    = get_term_by( 'slug', 'hcs', 'category' );
                $excluded    = array_filter( array(
                    $family_term ? $family_term->term_id : 0,
                    $hcs_term    ? $hcs_term->term_id    : 0,
                ) );

                $rambling_query = new WP_Query( array(
                    'post_type'        => 'post',
                    'posts_per_page'   => -1,
                    'orderby'          => 'date',
                    'order'            => 'DESC',
                    'category__not_in' => $excluded,
                    'ignore_sticky_posts' => true,
                ) );
                ?>

                <?php if ( $rambling_query->have_posts() ) : ?>
                    <ul class="rambling-list">
                        <?php while ( $rambling_query->have_posts() ) : $rambling_query->the_post(); ?>
                            <li class="rambling-card<?php echo has_post_thumbnail() ? '' : ' rambling-card--no-thumb'; ?>">
                                <?php if ( has_post_thumbnail() ) : ?>
                                    <a class="rambling-card__thumb" href="<?php the_permalink(); ?>" tabindex="-1" aria-hidden="true">
                                        <?php the_post_thumbnail( 'medium_large', array( 'loading' => 'lazy' ) ); ?>
                                    </a>
                                <?php endif; ?>
                                <div class="rambling-card__body">
                                    <span class="rambling-card__meta"><?php echo esc_html( get_the_date( 'F j, Y' ) ); ?></span>
                                    <h2 class="rambling-card__title">
                                        <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                                    </h2>
                                    <p class="rambling-card__excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 38, '&hellip;' ) ); ?></p>
                                    <a class="rambling-card__more" href="<?php the_permalink(); ?>">
                                        Continue reading <span aria-hidden="true">&rarr;</span>
                                    </a>
                                </div>
                            </li>
                        <?php endwhile; ?>
                    </ul>
                <?php else : ?>
                    <p class="rambling-empty">Nothing here yet. I'm slow to publish.</p>
                <?php endif; ?>
                <?php wp_reset_postdata(); ?>

            </section>

        </div>
    </article>

</main>

<?php get_footer(); ?>
