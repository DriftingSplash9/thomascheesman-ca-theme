<?php
/**
 * Page Template: Person Spoke — Patience
 *
 * Auto-applied to the WP page with slug `patience`. Page setup:
 *   - Title: "Patience"
 *   - Slug: patience
 *   - Parent: Family  →  /family/patience/
 *
 * Mirrors the heritage-spoke chrome (page-hero with breadcrumb,
 * frosted .heritage-line plate, inline figures) so the visual
 * language carries between the line and per-person pages. The
 * `.person-spoke--patience` body class swaps in her purple accent.
 */

get_header(); ?>

<main id="primary" class="site-main heritage-page heritage-spoke person-spoke person-spoke--patience">

    <section class="page-hero">
        <div class="container">
            <a class="heritage-page__back" href="<?php echo esc_url( home_url( '/family' ) ); ?>">&larr; Family</a>
            <span class="page-hero__eyebrow">Daughter &mdash; eldest</span>
            <h1 class="page-hero__title kinetic-text">Patience</h1>
            <p class="page-hero__subtitle kinetic-fade">
                The natural-born leader who tries to hide her dimples
            </p>
        </div>
    </section>

    <article class="heritage-lines">
        <div class="container container--narrow">

            <section class="heritage-line heritage-line--spoke heritage-line--person scroll-animate" id="patience">
                <div class="heritage-line__body">

                    <figure class="heritage-line__figure">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2024/08/img_0913-1-scaled.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Patience portrait — the slight smile that doesn\'t quite hide her dimples', 'tc-ventures-child' ); ?>"
                            loading="eager"
                        />
                    </figure>

                    <p>Patience is my first miracle. I never thought I'd have kids &mdash; Hajdu-Cheney made the whole question feel risky enough that I figured most people wouldn't take it on. Melanie did.</p>

                    <figure class="heritage-line__figure">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2024/08/20160707_155302-scaled.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Selfie with toddler Patience, July 2016', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                    </figure>

                    <p>Patience arrived 10 days late, on the same day I started a new job as Head Chef at Ric's Grill. Family had come through the hospital and then gone back to their lives, and Melanie and I were left with this little princess P who, in her first spring, learned to stand right around the time I did the dumbest thing a new dad can do &mdash; pressed a blade of grass between my thumbs and blew hard, just to see what would happen. She screamed like she did when they cut her tongue tie. She forgave me.</p>

                    <figure class="heritage-line__figure">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2024/10/20161023_140245-scaled.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Patience in her purple butterfly outfit, October 2016', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                    </figure>

                    <p>That summer we drove from Vancouver to Calgary to Grande Prairie in our old red Pontiac G5 to introduce her to the rest of the family. The stories that follow are hers.</p>

                    <figure class="heritage-line__figure">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2024/09/p8210172-scaled.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Thomas and Patience on the merry-go-round', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                    </figure>

                </div>
            </section>

        </div>
    </article>

</main>

<?php get_footer(); ?>
