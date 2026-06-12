<?php
/**
 * Page Template: The McIvers long-read.
 *
 * Auto-applied (template hierarchy: page-{slug}.php) to the WP page whose slug
 * is `mcivers` — a CHILD of the Dochertys spoke, so the URL reads:
 *
 *   /family/heritage/dochertys/mcivers
 *
 * The McIver line is Granny Docherty's (Elizabeth Annie McIver's) ancestry —
 * three Hebridean streams (McIver of Lewis, Campbell of South Uist, Cameron of
 * Moray) that converged on the southeastern Saskatchewan prairie in the 1880s.
 * It earned its own long-read because this branch is, unusually, well supported
 * by primary records — the deepest-documented line in the family. The Docherty
 * spoke links here rather than carrying it all inline.
 *
 * This is a standalone long-read (its parent isn't in the page-story.php
 * registry), so it sets $tc_longread itself and hands off to the same shared
 * chrome the family stories use. The body is AUTO-GENERATED from the markdown
 * manuscript (McIver-Story-EDITED.md) by _md2heritage.js — edit the manuscript
 * + regenerate, never the body directly.
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

$tc_longread = array(
    'slug'        => 'mcivers',
    'eyebrow'     => 'Family line 03 of 08 · A maternal line of the Dochertys',
    'title'       => 'The McIvers',
    'subtitle'    => 'Three Hebridean streams — Lewis, South Uist, and Moray — that met on the Saskatchewan prairie',
    'kicker'      => 'Lewis &middot; South Uist &middot; Moray &middot; the Clearances &middot; Saltcoats &middot; c. 1832 &ndash; today',
    'spoke_url'   => home_url( '/family/heritage/dochertys/story' ),
    'spoke_label' => 'the Docherty story',
    'hero_image'  => get_stylesheet_directory_uri() . '/assets/img/heritage/mciver/mciver-hero-lewis-coast.jpg',
    'hero_alt'    => 'A windswept Isle of Lewis coastline, the Hebridean world the McIvers came from',
    'hero_w'      => 1280,
    'hero_h'      => 720,
    'body'        => get_stylesheet_directory() . '/inc/heritage/mcivers-story-body.php',
    // Orphan line: the trail points up to the PARENT spoke (the Dochertys),
    // mirroring the URL /family/heritage/dochertys/mcivers.
    'breadcrumb'  => array(
        array( 'label' => 'Family',        'url' => home_url( '/family' ) ),
        array( 'label' => 'Heritage',      'url' => home_url( '/family/heritage' ) ),
        array( 'label' => 'The Dochertys', 'url' => home_url( '/family/heritage/dochertys' ) ),
        array( 'label' => 'The McIvers' ),
    ),
);

require get_stylesheet_directory() . '/inc/page-heritage-longread.php';
