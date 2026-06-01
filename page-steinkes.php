<?php
/**
 * Page Template: The Steinkes long-read.
 *
 * Auto-applied (template hierarchy: page-{slug}.php) to the WP page whose slug
 * is `steinkes` — a CHILD of the Rycrofts spoke, so the URL reads:
 *
 *   /family/heritage/rycrofts/steinkes
 *
 * The Steinke line is Bette Doreen Steinke's family (Sam Rycroft's wife) — a
 * German Lutheran family of the Sexsmith prairie. It earns its own short page,
 * like the Verbooms under the Lakemans, rather than being carried inline in the
 * Rycroft story. The line is thinly traced (documented only to Bette's parents,
 * Henry & Martha Steinke); the page is honest about it.
 *
 * Standalone long-read (its parent isn't in the page-story.php registry): it
 * sets $tc_longread itself and hands off to the same shared chrome. The body is
 * AUTO-GENERATED from the markdown manuscript by _md2heritage.js.
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

$tc_longread = array(
    'slug'        => 'steinkes',
    'eyebrow'     => 'A maternal line of the Rycrofts',
    'title'       => 'The Steinkes',
    'subtitle'    => 'Bette&rsquo;s people &mdash; German Lutheran settlers of the Sexsmith prairie',
    'kicker'      => 'Sexsmith, Alberta &middot; German Lutheran prairie &middot; a line still being traced',
    'spoke_url'   => home_url( '/family/heritage/rycrofts/story' ),
    'spoke_label' => 'the Rycroft story',
    'hero_image'  => get_stylesheet_directory_uri() . '/assets/img/heritage/steinke/steinke-hero-sod-house.jpg',
    'hero_alt'    => 'A prairie family standing before their sod house, early 1900s',
    'body'        => get_stylesheet_directory() . '/inc/heritage/steinkes-story-body.php',
);

require get_stylesheet_directory() . '/inc/page-heritage-longread.php';
