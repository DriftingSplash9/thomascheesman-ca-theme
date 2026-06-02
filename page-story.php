<?php
/**
 * Page Template: Heritage Long-Read dispatcher.
 *
 * Auto-applied (template hierarchy: page-{slug}.php) to ANY WP page whose slug
 * is `story`. Each family line's long-read is a WP page titled "Story" placed
 * as a CHILD of that line's spoke page, so the URLs read:
 *
 *   /family/heritage/dochertys/story   ← parent slug "dochertys"
 *   /family/heritage/haistes/story     ← parent slug "haistes"   (future)
 *   /family/heritage/lakemans/story    ← parent slug "lakemans"  (future)
 *
 * This dispatcher reads the PARENT page slug, looks it up in the registry
 * below, sets $tc_longread, and hands off to inc/page-heritage-longread.php.
 * Adding a new line = (1) generate its *-story-body.php via _md2heritage.js,
 * (2) add a registry row here, (3) create the child "Story" page in wp-admin.
 *
 * Any `story` page whose parent isn't registered falls back to a plain render.
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

$tc_qid         = get_queried_object_id();
$tc_parent_id   = $tc_qid ? wp_get_post_parent_id( $tc_qid ) : 0;
$tc_parent_slug = $tc_parent_id ? get_post_field( 'post_name', $tc_parent_id ) : '';

$tc_longread_registry = array(

    'dochertys' => array(
        'slug'        => 'dochertys',
        'eyebrow'     => 'The full story · Family line 02 of 08',
        'title'       => 'The Dochertys',
        'subtitle'    => 'A family that came through Ireland and Scotland to the Canadian prairie',
        'kicker'      => 'Eight generations · Donegal to Alberta · c. 1750 – today',
        'spoke_url'   => home_url( '/family/heritage/dochertys' ),
        'spoke_label' => 'The Dochertys',
        'hero_image'  => home_url( '/wp-content/uploads/2024/09/img_0676-scaled.jpg' ),
        'hero_alt'    => 'Maryanne Docherty with her brother David',
        'body'        => get_stylesheet_directory() . '/inc/heritage/dochertys-story-body.php',
    ),

    'lakemans' => array(
        'slug'        => 'lakemans',
        'eyebrow'     => 'The full story · Family line 04 of 08',
        'title'       => 'The Lakemans',
        'subtitle'    => 'From a Dutch polder, through the spice islands of the Indies, to a Calgary lake',
        'kicker'      => 'Eleven generations · the Netherlands to Calgary · c. 1660 – today',
        'spoke_url'   => home_url( '/family/heritage/lakemans' ),
        'spoke_label' => 'The Lakemans',
        'hero_image'  => home_url( '/wp-content/uploads/2026/05/vintage-historic-bw-photos-of-dutch-windmills-in-19th-century-07-1040x440-1.jpg' ),
        'hero_alt'    => 'A nineteenth-century photograph of Dutch polder windmills',
        'body'        => get_stylesheet_directory() . '/inc/heritage/lakemans-story-body.php',
    ),

    'haistes' => array(
        'slug'        => 'haistes',
        'eyebrow'     => 'The full story · Family line 08 of 08',
        'title'       => 'The Haistes',
        'subtitle'    => 'A Yorkshire-to-prairie saga, from a tannery yard to the Peace Country',
        'kicker'      => 'Thirteen generations · Yorkshire to the Peace Country · c. 1610 – today',
        'spoke_url'   => home_url( '/family/heritage/haistes' ),
        'spoke_label' => 'The Haistes',
        'hero_image'  => get_stylesheet_directory_uri() . '/assets/img/heritage/haiste/haiste-hero-prairie-barn-sunset.jpg',
        'hero_alt'    => 'An old barn on the Alberta prairie at winter sunset',
        'body'        => get_stylesheet_directory() . '/inc/heritage/haistes-story-body.php',
    ),

    'rycrofts' => array(
        'slug'        => 'rycrofts',
        'eyebrow'     => 'The full story · Family line 06 of 08',
        'title'       => 'The Rycrofts',
        'subtitle'    => 'From a Leeds back-street to the Kingdom of Hawai&lsquo;i, and home to the Peace Country',
        'kicker'      => 'Leeds &middot; the Civil War &middot; Hawai&lsquo;i &middot; the Peace Country &middot; 1843 &ndash; today',
        'spoke_url'   => home_url( '/family/heritage/rycrofts' ),
        'spoke_label' => 'The Rycrofts',
        'hero_image'  => get_stylesheet_directory_uri() . '/assets/img/heritage/rycroft/rycroft-hero-honolulu-harbor-1900.jpg',
        'hero_alt'    => 'Tall sailing ships dressed with flags in Honolulu Harbor about 1900',
        'body'        => get_stylesheet_directory() . '/inc/heritage/rycrofts-story-body.php',
    ),

);

if ( isset( $tc_longread_registry[ $tc_parent_slug ] ) ) {

    $tc_longread = $tc_longread_registry[ $tc_parent_slug ];
    require get_stylesheet_directory() . '/inc/page-heritage-longread.php';

} else {

    // Unknown "story" page — render it as an ordinary page so nothing breaks.
    get_header();
    ?>
    <main id="primary" class="site-main">
        <section class="page-hero">
            <div class="container">
                <h1 class="page-hero__title kinetic-text"><?php echo esc_html( get_the_title() ); ?></h1>
            </div>
        </section>
        <article class="heritage-lines">
            <div class="container container--narrow">
                <?php
                if ( have_posts() ) {
                    while ( have_posts() ) {
                        the_post();
                        the_content();
                    }
                }
                ?>
            </div>
        </article>
    </main>
    <?php
    get_footer();
}
