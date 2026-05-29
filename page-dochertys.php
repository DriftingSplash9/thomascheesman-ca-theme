<?php
/**
 * Page Template: Heritage Spoke — The Dochertys (and McIvers).
 *
 * Auto-applied to the WP page with slug `dochertys`. Page setup:
 *   - Title: "The Dochertys" (slug stays "dochertys")
 *   - Slug: dochertys
 *   - Parent: Heritage  →  URL becomes /family/heritage/dochertys/
 *
 * Thin stub. Carries the McIver thread inside the same page (Granny
 * Docherty's maiden name) since the McIvers don't have enough on-record
 * material yet to warrant their own spoke. Edit prose at
 * inc/heritage/dochertys-body.php; chrome at inc/page-heritage-line.php.
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

$tc_heritage = array(
    'slug'     => 'dochertys',
    'eyebrow'  => 'Family line 02 of 05',
    'title'    => 'The Dochertys',
    'subtitle' => 'Few and far between, deep roots',
    'body'     => get_stylesheet_directory() . '/inc/heritage/dochertys-body.php',
);
require get_stylesheet_directory() . '/inc/page-heritage-line.php';
