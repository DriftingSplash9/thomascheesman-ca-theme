<?php
/**
 * Shared chrome for the heritage long-read pages (the full family stories).
 *
 * Sister to inc/page-heritage-line.php (the short spokes). Where a spoke is a
 * ~400-word overview, a long-read is the full edited manuscript (~6,000 words:
 * chapters, a lineage table, a collapsible Notes appendix).
 *
 * Reached via page-story.php (the dispatcher), which resolves for any WP page
 * whose slug is `story`, reads the PARENT page slug to pick the line, and sets
 * $tc_longread before require()-ing this file.
 *
 * --- $tc_longread shape ---------------------------------------------
 *
 *   $tc_longread = array(
 *       'slug'        => 'dochertys',
 *       'eyebrow'     => 'The full story · Family line 02 of 08',
 *       'title'       => 'The Dochertys',
 *       'subtitle'    => 'A family that came through Ireland and Scotland...',
 *       'spoke_url'   => home_url( '/family/heritage/dochertys' ),
 *       'spoke_label' => 'The Dochertys',
 *       'hero_image'  => home_url( '/wp-content/uploads/.../img.jpg' ), // optional
 *       'hero_alt'    => 'Caption',                                     // optional
 *       'body'        => '/abs/path/to/{line}-story-body.php',
 *   );
 *
 * The body include is AUTO-GENERATED from the markdown manuscript by
 * _md2heritage.js — edit the manuscript + regenerate, don't hand-edit the body.
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

$lr          = isset( $tc_longread ) && is_array( $tc_longread ) ? $tc_longread : array();
$lr_slug     = isset( $lr['slug'] )        ? (string) $lr['slug']        : '';
$lr_eyebrow  = isset( $lr['eyebrow'] )     ? (string) $lr['eyebrow']     : '';
$lr_title    = isset( $lr['title'] )       ? (string) $lr['title']       : '';
$lr_subtitle = isset( $lr['subtitle'] )    ? (string) $lr['subtitle']    : '';
$lr_kicker   = isset( $lr['kicker'] )      ? (string) $lr['kicker']      : '';
$lr_spoke    = isset( $lr['spoke_url'] )   ? (string) $lr['spoke_url']   : home_url( '/family/heritage' );
$lr_splabel  = isset( $lr['spoke_label'] ) ? (string) $lr['spoke_label'] : 'the family';
$lr_himg     = isset( $lr['hero_image'] )  ? (string) $lr['hero_image']  : '';
$lr_halt     = isset( $lr['hero_alt'] )    ? (string) $lr['hero_alt']    : '';
$lr_hw       = isset( $lr['hero_w'] )      ? (int) $lr['hero_w']         : 0;
$lr_hh       = isset( $lr['hero_h'] )      ? (int) $lr['hero_h']         : 0;
$lr_body     = isset( $lr['body'] )        ? (string) $lr['body']        : '';

// Reading order through the eight lines (hub order 01–08), so every
// story ends with a door to the next one instead of a dead end. The
// last line hands the finished reader to the map — the payoff view.
// A line may override via 'next_url'/'next_label'. (2026-06 review.)
$lr_next_map = array(
	'cheesmans' => array( '/family/heritage/dochertys/story',   'The Dochertys &mdash; family line 02 of 08' ),
	'dochertys' => array( '/family/heritage/dochertys/mcivers', 'The McIvers &mdash; family line 03 of 08' ),
	'mcivers'   => array( '/family/heritage/lakemans/story',    'The Lakemans &mdash; family line 04 of 08' ),
	'lakemans'  => array( '/family/heritage/lakemans/verbooms', 'The Verbooms &mdash; family line 05 of 08' ),
	'verbooms'  => array( '/family/heritage/rycrofts/story',    'The Rycrofts &mdash; family line 06 of 08' ),
	'rycrofts'  => array( '/family/heritage/rycrofts/steinkes', 'The Steinkes &mdash; family line 07 of 08' ),
	'steinkes'  => array( '/family/heritage/haistes/story',     'The Haistes &mdash; family line 08 of 08' ),
	'haistes'   => array( '/family/heritage/map',               'You&rsquo;ve read the last line &mdash; watch all eight converge on the map' ),
);
$lr_next_url   = isset( $lr['next_url'] ) ? (string) $lr['next_url']
	: ( isset( $lr_next_map[ $lr_slug ] ) ? home_url( $lr_next_map[ $lr_slug ][0] ) : '' );
$lr_next_label = isset( $lr['next_label'] ) ? (string) $lr['next_label']
	: ( isset( $lr_next_map[ $lr_slug ] ) ? $lr_next_map[ $lr_slug ][1] : '' );

// The top breadcrumb returns "up one level" to the story's own spoke
// ($lr_spoke). The bottom-of-content return instead sends the finished reader
// to the heritage hub ("The Families"), which is more useful than bouncing
// back to the short intro. A line may override via 'return_url'/'return_label'.
$lr_returl   = isset( $lr['return_url'] )   ? (string) $lr['return_url']   : home_url( '/family/heritage' );
$lr_retlabel = isset( $lr['return_label'] ) ? (string) $lr['return_label'] : 'the family lines';

// Breadcrumb trail (Family › Heritage › … › this story). A line may pass an
// explicit 'breadcrumb' array (the orphan lines do, so their trail points up
// to the PARENT spoke rather than the parent's story). Otherwise we build the
// default for a hub line: the line's own short spoke, then "The full story".
$lr_crumbs = ( isset( $lr['breadcrumb'] ) && is_array( $lr['breadcrumb'] ) )
    ? $lr['breadcrumb']
    : array(
        array( 'label' => 'Family',     'url' => home_url( '/family' ) ),
        array( 'label' => 'Heritage',   'url' => home_url( '/family/heritage' ) ),
        array( 'label' => $lr_splabel,  'url' => $lr_spoke ),
        array( 'label' => 'The full story' ),
    );

get_header();
?>

<main id="primary" class="site-main heritage-page heritage-longread heritage-longread--<?php echo esc_attr( $lr_slug ); ?>">

    <!-- ==============================================================
         SIGNATURE ATMOSPHERE — three organic, slowly morphing/drifting
         blobs in the line's own palette (set via --blob-a/b/c per line in
         style.css). Fixed behind the content (z:0, above the global WebGL
         canvas at z:-1) so the frosted glass plates blur them through.
         Pure CSS; pauses under prefers-reduced-motion. Decorative only.
         ============================================================== -->
    <div class="heritage-longread__atmos" aria-hidden="true">
        <span class="heritage-longread__blob heritage-longread__blob--a"></span>
        <span class="heritage-longread__blob heritage-longread__blob--b"></span>
        <span class="heritage-longread__blob heritage-longread__blob--c"></span>
    </div>

    <!-- ==============================================================
         PAGE HERO — breadcrumb returns to the short spoke, not the hub.
         ============================================================== -->
    <section class="page-hero">
        <div class="container">
            <?php
            $tc_crumbs = $lr_crumbs;
            require get_stylesheet_directory() . '/inc/heritage-breadcrumb.php';
            ?>
            <?php if ( $lr_eyebrow !== '' ) : ?>
                <span class="page-hero__eyebrow"><?php echo esc_html( $lr_eyebrow ); ?></span>
            <?php endif; ?>
            <h1 class="page-hero__title kinetic-text"><?php echo esc_html( $lr_title ); ?></h1>
            <?php if ( $lr_subtitle !== '' ) : ?>
                <p class="page-hero__subtitle kinetic-fade"><?php echo esc_html( $lr_subtitle ); ?></p>
            <?php endif; ?>
            <?php if ( $lr_kicker !== '' ) : ?>
                <p class="heritage-longread__hero-kicker"><?php echo esc_html( $lr_kicker ); ?></p>
            <?php endif; ?>
            <p class="heritage-longread__hero-kicker heritage-longread__maplink">
                <a href="<?php echo esc_url( home_url( '/family/heritage/map' ) ); ?>">see this line on the map &rarr;</a>
            </p>
        </div>
    </section>

    <!-- ==============================================================
         LONG-READ BODY — the full manuscript inside the same frosted
         .heritage-line__body plate the spokes use, so prose, drop-cap,
         pull-quotes, and figures inherit the existing heritage styling.
         The --longread modifier layers on chapter headers, the lineage
         table, and the collapsible Notes block.
         ============================================================== -->
    <article class="heritage-lines">
        <div class="container container--narrow">

            <?php if ( $lr_himg !== '' ) : ?>
                <figure class="heritage-line__figure heritage-longread__hero">
                    <?php /* eager + fetchpriority, NOT lazy: this image IS the
                             page's LCP element — lazy-loading it delayed its
                             own discovery (Docherty story LCP measured 14.5s
                             in the 2026-06 review). width/height reserve its
                             box so the frame below stops shifting. */ ?>
                    <img src="<?php echo esc_url( $lr_himg ); ?>" alt="<?php echo esc_attr( $lr_halt ); ?>"
                        loading="eager" fetchpriority="high"
                        <?php if ( $lr_hw && $lr_hh ) : ?>width="<?php echo (int) $lr_hw; ?>" height="<?php echo (int) $lr_hh; ?>"<?php endif; ?> />
                </figure>
            <?php endif; ?>

            <!-- The frame wrapper carries the chrome border + the periodic
                 colour reflection (its ::before / ::after are free; the
                 plate's own pseudo-elements are taken by the ghost numeral
                 and the legacy section glow). -->
            <div class="heritage-longread__frame">
                <section class="heritage-line heritage-line--longread scroll-animate" id="<?php echo esc_attr( $lr_slug ); ?>">
                    <div class="heritage-line__body heritage-line__body--longread">
                        <?php
                        if ( $lr_body !== '' && is_readable( $lr_body ) ) {
                            require $lr_body;
                        }
                        ?>
                    </div>
                </section>
            </div>

            <?php if ( $lr_next_url !== '' ) : ?>
                <p class="heritage-line__readmore heritage-longread__next">
                    <a href="<?php echo esc_url( $lr_next_url ); ?>">Next line &rarr; <?php echo wp_kses_post( $lr_next_label ); ?></a>
                </p>
            <?php endif; ?>

            <p class="heritage-longread__return">
                <a href="<?php echo esc_url( $lr_returl ); ?>">&larr; Back to <?php echo esc_html( $lr_retlabel ); ?></a>
            </p>

        </div>
    </article>

</main>

<?php get_footer(); ?>
