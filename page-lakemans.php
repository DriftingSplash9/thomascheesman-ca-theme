<?php
/**
 * Page Template: Heritage Spoke — The Lakemans.
 *
 * Auto-applied to the WP page with slug `lakemans`. Page setup:
 *   - Title: "The Lakemans" (slug stays "lakemans")
 *   - Slug: lakemans
 *   - Parent: Heritage  →  URL becomes /family/heritage/lakemans/
 *
 * Thin stub. The biggest spoke in terms of prose because the Lakeman
 * story spans Indonesia, the Netherlands, Venezuela, England, Kuwait,
 * Singapore, and Calgary — most of it from a long email Martin (Thomas's
 * biological father) wrote out for the family record. Edit prose at
 * inc/heritage/lakemans-body.php; chrome at inc/page-heritage-line.php.
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

$tc_heritage = array(
    'slug'     => 'lakemans',
    'eyebrow'  => 'Family line 03 of 05',
    'title'    => 'The Lakemans',
    'subtitle' => 'Indonesia, Holland, Calgary, and most places in between',
    'body'     => get_stylesheet_directory() . '/inc/heritage/lakemans-body.php',
);
require get_stylesheet_directory() . '/inc/page-heritage-line.php';
