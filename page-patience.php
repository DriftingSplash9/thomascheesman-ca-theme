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

                    <p>Patience arrived 10 days late, on the same day I started a new job as Head Chef at Ric's Grill. Family had come through the hospital and then gone back to their lives, and Melanie and I were left with this little princess P who, in her first spring, learned to stand right around the time I did the dumbest thing a new dad can do &mdash; pressed a blade of grass between my thumbs and blew hard, just to see what would happen. She screamed like she did when they cut her tongue tie. She forgave me.</p>

                    <p>That summer we drove from Vancouver to Calgary to Grande Prairie in our old red Pontiac G5 to introduce her to the rest of the family. The stories that follow are hers.</p>

                </div>
            </section>

            <?php
            // Photo wall — Patience.
            //
            // 139 photos sourced from inc/gallery-patience.php (curated
            // ordering lives in partiences.XLSX → re-import via the
            // converter). Five chronological-ish sections derived from
            // the order index; section labels are placeholder editorial
            // names that Thomas can tweak as memory clarifies.
            //
            // Counts sum to 139: 28 + 28 + 28 + 28 + 27.
            // 134 year-tagged photos sourced from partiences-styled.XLSX.
            // Sections group sparse years together so the rhythm is even
            // (2013 alone has 37 photos; 2021/2022 only 2 each, so they
            // ride along with neighbours).
            $patience_items = require get_stylesheet_directory() . '/inc/gallery-patience.php';
            tc_render_photo_gallery(
                $patience_items,
                array(
                    array( 'label' => 'Year One — 2013',          'years' => array( 2013 ) ),
                    array( 'label' => 'Toddler Years — 2014–2016', 'years' => array( 2014, 2015, 2016 ) ),
                    array( 'label' => 'Little Person — 2017–2018', 'years' => array( 2017, 2018 ) ),
                    array( 'label' => 'A Big Year — 2019',         'years' => array( 2019 ) ),
                    array( 'label' => 'The Quiet Years — 2020–2022', 'years' => array( 2020, 2021, 2022 ) ),
                    array( 'label' => 'Schoolgirl — 2023–Today',   'years' => array( 2023, 2024, 2025, 2026 ) ),
                ),
                'Patience'
            );
            ?>

        </div>
    </article>

</main>

<?php get_footer(); ?>
