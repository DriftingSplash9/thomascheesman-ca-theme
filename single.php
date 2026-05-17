<?php
/**
 * Single Post Template — TC 'ventures Child Theme
 *
 * Wraps every blog post in the site's editorial chrome (page-hero +
 * narrow reading column) so posts read as part of the rebuilt site
 * instead of the Astra / block-editor default.
 *
 * A CSS "detox" layer in style.css (scoped to .single-post__content)
 * neutralises the legacy block-editor styling baked into the older
 * post bodies — gradient-coloured paragraph boxes, palette colours,
 * oversized font-size classes, and the stray search-form widgets that
 * got pasted into a couple of posts. The post's actual prose then
 * inherits the same editorial typography as /about and /hcs.
 *
 * Each post ends with a "Read next" carousel of other posts; the
 * arrows are wired up by initPostCarousel() in main.js.
 */

get_header(); ?>

<main id="primary" class="site-main single-post-page">

<?php
while ( have_posts() ) :
    the_post();

    $tc_cats    = get_the_category();
    $tc_eyebrow = ( ! empty( $tc_cats ) ) ? $tc_cats[0]->name : 'Journal';
?>

    <article <?php post_class( 'single-post' ); ?>>

        <!-- Editorial hero — eyebrow (category), title, publish date. -->
        <section class="page-hero">
            <div class="container">
                <span class="page-hero__eyebrow"><?php echo esc_html( $tc_eyebrow ); ?></span>
                <h1 class="page-hero__title kinetic-fade"><?php the_title(); ?></h1>
                <p class="page-hero__subtitle kinetic-fade"><?php echo esc_html( get_the_date( 'F j, Y' ) ); ?></p>
            </div>
        </section>

        <?php if ( has_post_thumbnail() ) : ?>
            <div class="container container--narrow">
                <figure class="single-post__hero-figure">
                    <?php the_post_thumbnail( 'large' ); ?>
                </figure>
            </div>
        <?php endif; ?>

        <div class="about-body">
            <div class="container container--narrow">
                <div class="single-post__content">
                    <?php the_content(); ?>
                </div>
            </div>
        </div>

    </article>

<?php endwhile; ?>

    <?php tc_render_read_next(); ?>

</main>

<?php get_footer(); ?>
