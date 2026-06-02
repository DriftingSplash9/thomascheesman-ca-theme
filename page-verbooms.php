<?php
/**
 * Page Template: The Verbooms long-read.
 *
 * Auto-applied (template hierarchy: page-{slug}.php) to the WP page whose slug
 * is `verbooms` — a CHILD of the Lakemans spoke, so the URL reads:
 *
 *   /family/heritage/lakemans/verbooms
 *
 * The Verboom line is Suzanna Verboom's ancestry (Rienk Lakeman Sr.'s wife).
 * It earned its own page because the maternal tree runs deep and well-
 * documented — Sliedrecht riverside Verbooms, Petten/Zijpe polder Vriesmans
 * and Hoflands, Goeree-Overflakkee island Grevenstuks and Tiggelmans. The
 * Lakeman story links here rather than carrying it all inline.
 *
 * This is a standalone long-read (its parent isn't in the page-story.php
 * registry), so it sets $tc_longread itself and hands off to the same shared
 * chrome the family stories use. The body is AUTO-GENERATED from the markdown
 * manuscript by _md2heritage.js — edit the manuscript + regenerate.
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

$tc_longread = array(
    'slug'        => 'verbooms',
    'eyebrow'     => 'Family line 05 of 08 · A maternal line of the Lakemans',
    'title'       => 'The Verbooms',
    'subtitle'    => 'Suzanna’s people — a tailor-barber of Ter Aar, and the river-village and island families behind him',
    'kicker'      => 'Ter Aar to Calgary · the riverside, the polders, and the islands · c. 1760 – today',
    'spoke_url'   => home_url( '/family/heritage/lakemans/story' ),
    'spoke_label' => 'the Lakeman story',
    'hero_image'  => home_url( '/wp-content/uploads/2026/05/Broek-Waterland-canal-view.jpg' ),
    'hero_alt'    => 'A canal and timber houses in a Zuid-Holland village, the kind of country the Verbooms came from',
    'body'        => get_stylesheet_directory() . '/inc/heritage/verbooms-story-body.php',
    // Orphan line: the trail points up to the PARENT spoke (the Lakemans),
    // mirroring the URL /family/heritage/lakemans/verbooms.
    'breadcrumb'  => array(
        array( 'label' => 'Family',       'url' => home_url( '/family' ) ),
        array( 'label' => 'Heritage',     'url' => home_url( '/family/heritage' ) ),
        array( 'label' => 'The Lakemans', 'url' => home_url( '/family/heritage/lakemans' ) ),
        array( 'label' => 'The Verbooms' ),
    ),
);

require get_stylesheet_directory() . '/inc/page-heritage-longread.php';
