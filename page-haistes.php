<?php
/**
 * Page Template: Heritage Spoke — The Haistes.
 *
 * Auto-applied to the WP page with slug `haistes`. Page setup:
 *   - Title: "The Haistes" (slug stays "haistes")
 *   - Slug: haistes
 *   - Parent: Heritage  →  URL becomes /family/heritage/haistes/
 *
 * Thin stub. Melanie's father's side. Yorkshire textile-and-coal stock
 * that emigrated to a Saskatchewan homestead around 1900 and, three
 * generations later, settled across Alberta. Edit prose at
 * inc/heritage/haistes-body.php; chrome at inc/page-heritage-line.php.
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

$tc_heritage = array(
    'slug'     => 'haistes',
    'eyebrow'  => 'Family line 08 of 08',
    'title'    => 'The Haistes',
    'subtitle' => 'Yorkshire to the Peace Country',
    'body'     => get_stylesheet_directory() . '/inc/heritage/haistes-body.php',
);
require get_stylesheet_directory() . '/inc/page-heritage-line.php';
