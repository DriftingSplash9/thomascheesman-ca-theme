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

    <?php
    /* "Read next" carousel — other posts, newest first, current one
       excluded. Drafts (e.g. retired old posts) are excluded
       automatically by the default publish-only status. */
    $tc_read_next = new WP_Query( array(
        'post_type'           => 'post',
        'posts_per_page'      => 9,
        'post__not_in'        => array( get_queried_object_id() ),
        'orderby'             => 'date',
        'order'               => 'DESC',
        'ignore_sticky_posts' => true,
    ) );

    if ( $tc_read_next->have_posts() ) :
    ?>
        <section class="post-carousel" aria-label="<?php esc_attr_e( 'More posts to read', 'tc-ventures-child' ); ?>">
            <div class="container">
                <h2 class="post-carousel__heading">Read next</h2>
                <div class="post-carousel__viewport">
                    <button type="button" class="post-carousel__arrow post-carousel__arrow--prev" aria-label="<?php esc_attr_e( 'Scroll back', 'tc-ventures-child' ); ?>">&larr;</button>
                    <ul class="post-carousel__track">
                        <?php while ( $tc_read_next->have_posts() ) : $tc_read_next->the_post(); ?>
                            <li class="post-carousel__item">
                                <a class="post-carousel__card" href="<?php the_permalink(); ?>">
                                    <span class="post-carousel__thumb">
                                        <?php
                                        if ( has_post_thumbnail() ) {
                                            the_post_thumbnail( 'medium' );
                                        } else {
                                            echo '<span class="post-carousel__thumb-fallback" aria-hidden="true">TC</span>';
                                        }
                                        ?>
                                    </span>
                                    <span class="post-carousel__card-body">
                                        <span class="post-carousel__card-meta"><?php echo esc_html( get_the_date( 'F j, Y' ) ); ?></span>
                                        <span class="post-carousel__card-title"><?php the_title(); ?></span>
                                    </span>
                                </a>
                            </li>
                        <?php endwhile; ?>
                    </ul>
                    <button type="button" class="post-carousel__arrow post-carousel__arrow--next" aria-label="<?php esc_attr_e( 'Scroll forward', 'tc-ventures-child' ); ?>">&rarr;</button>
                </div>
            </div>
        </section>
        <?php
        wp_reset_postdata();
    endif;
    ?>

</main>

<?php get_footer(); ?>
