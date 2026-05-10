<?php
/**
 * Page Template: Person Spoke — Daniel
 *
 * Auto-applied to the WP page with slug `daniel`. Page setup:
 *   - Title: "Daniel"
 *   - Slug: daniel
 *   - Parent: Family  →  /family/daniel/
 *
 * Same chrome as the other two per-person spokes; the
 * `.person-spoke--daniel` body class swaps in his sky-blue accent.
 */

get_header(); ?>

<main id="primary" class="site-main heritage-page heritage-spoke person-spoke person-spoke--daniel">

    <section class="page-hero">
        <div class="container">
            <a class="heritage-page__back" href="<?php echo esc_url( home_url( '/family' ) ); ?>">&larr; Family</a>
            <span class="page-hero__eyebrow">Son &mdash; middle</span>
            <h1 class="page-hero__title kinetic-text">Daniel</h1>
            <p class="page-hero__subtitle kinetic-fade">
                Charlie Brown, the quiet observer who set the calendar
            </p>
        </div>
    </section>

    <article class="heritage-lines">
        <div class="container container--narrow">

            <section class="heritage-line heritage-line--spoke heritage-line--person scroll-animate" id="daniel">
                <div class="heritage-line__body">

                    <figure class="heritage-line__figure">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2024/10/20161028_190844.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Toddler Daniel, October 2016 — the bald grin that earned the nickname', 'tc-ventures-child' ); ?>"
                            loading="eager"
                        />
                    </figure>

                    <p>Daniel was born on June 30, 2015. He's the reason Melanie and I delayed our wedding by a year &mdash; he would've shown up right when we'd planned to tie the knot, so he set the calendar instead.</p>

                    <figure class="heritage-line__figure">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2024/10/20171031_125533-scaled.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Daniel in vest and tie, Halloween 2017', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                    </figure>

                    <p>I figured out he was on the way during hell week opening a new restaurant, with Patience at home and a Culinary Arts class to teach on top of it. I called Melanie out of the blue and said, &ldquo;Hey, I think you're pregnant.&rdquo; She rushed out for tests and called back giddy an hour later.</p>

                    <figure class="heritage-line__figure">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2025/03/img_0911-scaled.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Recent Daniel portrait', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                    </figure>

                    <p>Daniel arrived dreamy-eyed and bald enough that Uncle Vance nicknamed him Charlie Brown. He never really crawled &mdash; he butt-scootched, sitting upright and pushing himself along with one leg, then the other.</p>

                    <figure class="heritage-line__figure">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2024/08/img_2212.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Daniel in a dinosaur costume in the snow', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                    </figure>

                    <p>He's still a quiet kid. Doesn't say much, but pay attention when he does. He goes at his own pace and goes in spurts &mdash; sometimes he'll mature a bunch overnight. Who knows, maybe he'll talk your ear off one day.</p>

                </div>
            </section>

            <?php
            // 222 year-tagged photos sourced from daniels.XLSX. Section
            // structure mirrors Patience's (Daniel born 2015, two years
            // after Patience). The "Newly added" bucket catches the
            // sentinel year 9999 — items Thomas hasn't put a year on yet
            // — so they remain visible while he sorts.
            $daniel_items = require get_stylesheet_directory() . '/inc/gallery-daniel.php';
            tc_render_photo_gallery(
                $daniel_items,
                array(
                    array( 'label' => 'Year One — 2015',           'years' => array( 2015 ) ),
                    array( 'label' => 'Toddler Years — 2016',      'years' => array( 2016 ) ),
                    array( 'label' => 'Little Person — 2017–2018', 'years' => array( 2017, 2018 ) ),
                    array( 'label' => 'A Big Year — 2019',          'years' => array( 2019 ) ),
                    array( 'label' => 'The Quiet Years — 2020–2022', 'years' => array( 2020, 2021, 2022 ) ),
                    array( 'label' => 'Schoolboy — 2023–Today',    'years' => array( 2023, 2024, 2025, 2026 ) ),
                    array( 'label' => 'Newly added — to sort',      'years' => array( 9999 ) ),
                ),
                'Daniel'
            );
            ?>

        </div>
    </article>

</main>

<?php get_footer(); ?>
