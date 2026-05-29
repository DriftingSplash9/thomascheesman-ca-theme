<?php
/**
 * Shared template for the five heritage spoke pages.
 *
 * Each heritage line (cheesmans, dochertys, lakemans, rycrofts,
 * haistes) has its own page-{slug}.php in the theme root, but those
 * files are thin stubs that set $tc_heritage and require() this
 * template. Centralising the chrome here means: page hero, article
 * wrapper, breadcrumb, sibling nav, and the heritage-line shell live
 * in exactly one place; the only thing that varies per line is the
 * 3-field hero data + the body HTML.
 *
 * --- $tc_heritage shape ---------------------------------------------
 *
 *   $tc_heritage = array(
 *       'slug'     => 'cheesmans',                  // line slug
 *       'eyebrow'  => 'Family line 01 of 05',       // small chip above title
 *       'title'    => 'The Cheesmans',              // page H1
 *       'subtitle' => 'The Cheesiest Clan',         // subtitle under H1
 *       'body'     => '/abs/path/to/body.php',      // resolved body include
 *   );
 *
 * The body include is plain PHP — same HTML the per-page templates
 * used to inline (paragraphs, figures, asides, callouts, the Rycrofts'
 * 2x2 grid). It can use PHP function calls (home_url, esc_url, etc.)
 * because it's `require`d, not heredoc-loaded.
 *
 * --- What the template renders --------------------------------------
 *
 *   <main>
 *     <section.page-hero>...</section>
 *     <article.heritage-lines>
 *       <section.heritage-line.heritage-line--spoke id="{slug}">
 *         <div.heritage-line__body>
 *           {body include}
 *         </div>
 *       </section>
 *       {sibling nav, four other lines}
 *     </article>
 *   </main>
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

// Defensive defaults so a stub missing a key never produces a fatal —
// the page still renders, just with the missing chip blank.
$tc_heritage = isset( $tc_heritage ) && is_array( $tc_heritage ) ? $tc_heritage : array();
$tc_slug     = isset( $tc_heritage['slug'] )     ? (string) $tc_heritage['slug']     : '';
$tc_eyebrow  = isset( $tc_heritage['eyebrow'] )  ? (string) $tc_heritage['eyebrow']  : '';
$tc_title    = isset( $tc_heritage['title'] )    ? (string) $tc_heritage['title']    : '';
$tc_subtitle = isset( $tc_heritage['subtitle'] ) ? (string) $tc_heritage['subtitle'] : '';
$tc_body     = isset( $tc_heritage['body'] )     ? (string) $tc_heritage['body']     : '';

get_header();
?>

<main id="primary" class="site-main heritage-page heritage-spoke heritage-spoke--<?php echo esc_attr( $tc_slug ); ?>">

    <!-- ==============================================================
         PAGE HERO
         Eyebrow shows position in the five-line set; breadcrumb above
         the eyebrow returns to the hub.
         ============================================================== -->
    <section class="page-hero">
        <div class="container">
            <a class="heritage-page__back" href="<?php echo esc_url( home_url( '/family/heritage' ) ); ?>">&larr; The Families</a>
            <?php if ( $tc_eyebrow !== '' ) : ?>
                <span class="page-hero__eyebrow"><?php echo esc_html( $tc_eyebrow ); ?></span>
            <?php endif; ?>
            <h1 class="page-hero__title kinetic-text"><?php echo esc_html( $tc_title ); ?></h1>
            <?php if ( $tc_subtitle !== '' ) : ?>
                <p class="page-hero__subtitle kinetic-fade">
                    <?php echo esc_html( $tc_subtitle ); ?>
                </p>
            <?php endif; ?>
        </div>
    </section>

    <!-- ==============================================================
         SPOKE BODY
         One .heritage-line wrapper containing the per-line prose, images,
         quotes, and callouts. The wrapper supplies the frosted plate; the
         spoke modifier suppresses the giant ghost numeral + duplicate H2
         that would otherwise conflict with the page-hero above.
         ============================================================== -->
    <article class="heritage-lines">
        <div class="container container--narrow">

            <section class="heritage-line heritage-line--spoke scroll-animate" id="<?php echo esc_attr( $tc_slug ); ?>">
                <div class="heritage-line__body">
                    <?php
                    if ( $tc_body !== '' && is_readable( $tc_body ) ) {
                        require $tc_body;
                    }
                    ?>
                </div>
            </section>

            <?php tc_render_heritage_siblings( $tc_slug ); ?>

        </div>
    </article>

</main>

<?php get_footer(); ?>
