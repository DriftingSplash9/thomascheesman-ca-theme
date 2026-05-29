<?php
/**
 * Page Template: Heritage Spoke — The Cheesmans.
 *
 * Auto-applied to the WP page with slug `cheesmans`. Page setup:
 *   - Title: "The Cheesmans" (slug stays "cheesmans")
 *   - Slug: cheesmans
 *   - Parent: Heritage  →  URL becomes /family/heritage/cheesmans/
 *
 * Thin stub. Hero metadata + body include path live in the array
 * below; the shared template at inc/page-heritage-line.php does the
 * rendering. Edit prose at inc/heritage/cheesmans-body.php.
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

$tc_heritage = array(
    'slug'     => 'cheesmans',
    'eyebrow'  => 'Family line 01 of 05',
    'title'    => 'The Cheesmans',
    'subtitle' => 'The Cheesiest Clan',
    'body'     => get_stylesheet_directory() . '/inc/heritage/cheesmans-body.php',
);
require get_stylesheet_directory() . '/inc/page-heritage-line.php';
