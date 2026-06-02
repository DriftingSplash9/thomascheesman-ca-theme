<?php
/**
 * Page Template: Heritage Spoke — The Rycrofts.
 *
 * Auto-applied to the WP page with slug `rycrofts`. Page setup:
 *   - Title: "The Rycrofts" (slug stays "rycrofts")
 *   - Slug: rycrofts
 *   - Parent: Heritage  →  URL becomes /family/heritage/rycrofts/
 *
 * Thin stub. Centrepiece: Robert Henry Rycroft, after whom the Alberta
 * hamlet of Rycroft is named (1920 hat-draw story). Closes with the 2x2
 * grandparents-with-grandchildren grid that V0.16 added. Edit prose at
 * inc/heritage/rycrofts-body.php; chrome at inc/page-heritage-line.php.
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

$tc_heritage = array(
    'slug'     => 'rycrofts',
    'eyebrow'  => 'Family line 06 of 08',
    'title'    => 'The Rycrofts',
    'subtitle' => 'Pioneers of the Region',
    'body'     => get_stylesheet_directory() . '/inc/heritage/rycrofts-body.php',
);
require get_stylesheet_directory() . '/inc/page-heritage-line.php';
