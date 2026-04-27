<?php
/**
 * Page Template: Person Spoke — Faith
 *
 * Auto-applied to the WP page with slug `faith`. Page setup:
 *   - Title: "Faith"
 *   - Slug: faith
 *   - Parent: Family  →  /family/faith/
 *
 * Same chrome as the other two per-person spokes; the
 * `.person-spoke--faith` body class swaps in her pink accent.
 */

get_header(); ?>

<main id="primary" class="site-main heritage-page heritage-spoke person-spoke person-spoke--faith">

    <section class="page-hero">
        <div class="container">
            <a class="heritage-page__back" href="<?php echo esc_url( home_url( '/family' ) ); ?>">&larr; Family</a>
            <span class="page-hero__eyebrow">Daughter &mdash; youngest</span>
            <h1 class="page-hero__title kinetic-text">Faith</h1>
            <p class="page-hero__subtitle kinetic-fade">
                Came to me in a dream at 3 a.m.
            </p>
        </div>
    </section>

    <article class="heritage-lines">
        <div class="container container--narrow">

            <section class="heritage-line heritage-line--spoke heritage-line--person scroll-animate" id="faith">
                <div class="heritage-line__body">

                    <figure class="heritage-line__figure">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2025/03/fall-2-scaled.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Toddler Faith in a blue puffy vest, holding a fistful of fall leaves', 'tc-ventures-child' ); ?>"
                            loading="eager"
                        />
                        <figcaption>Faith with a fistful of leaves.</figcaption>
                    </figure>

                    <p>Faith was born on March 29, 2017 &mdash; 8 pounds, 20 inches &mdash; and finished off our family. We'd been turning over names for months and I couldn't think of one to save my life. Faith came to me in a dream. Melanie was teasing me for not having ideas and the name just popped in. I woke her up at 3 a.m. and asked if she liked it.</p>

                    <figure class="heritage-line__figure">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2024/10/20180524_163145-scaled.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Faith at about 14 months, May 2018', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                        <figcaption>Faith at about 14 months, May 2018.</figcaption>
                    </figure>

                    <p>We weren't sure. We almost called her Charlotte. It wasn't until she turned blue &mdash; choking, rushed to the NICU &mdash; that we looked at each other and knew it had to be Faith.</p>

                    <figure class="heritage-line__figure">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2024/08/img_0754-scaled.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Faith, summer 2024', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                        <figcaption>Faith, summer 2024.</figcaption>
                    </figure>

                    <p>She's stubborn, independent, particular about her things. She had a hamster named Jeffery James. Now she has Mataeo. The youngest gets away with more, I know that. We butt heads more than I want to. She has a wild and free spirit and I'm trying to learn it.</p>

                    <figure class="heritage-line__figure">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2025/03/img_0698-scaled.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Faith, recent portrait', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                        <figcaption>A recent one.</figcaption>
                    </figure>

                    <figure class="heritage-line__figure">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2024/08/img_0360-scaled.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Faith with a bird that hopped onto her hand', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                        <figcaption>The bird that hopped onto her hand.</figcaption>
                    </figure>

                </div>
            </section>

        </div>
    </article>

</main>

<?php get_footer(); ?>
