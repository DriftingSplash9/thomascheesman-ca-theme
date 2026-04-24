<?php
/**
 * TC 'ventures Child Theme Functions
 */

/**
 * Enqueue parent and child theme styles and scripts
 */
function tc_ventures_enqueue_scripts() {
    
    // Parent theme style
    wp_enqueue_style( 'astra-parent-style', get_template_directory_uri() . '/style.css' );
    
    // Child theme style
    wp_enqueue_style( 'astra-child-style', get_stylesheet_uri() );
    
    // GSAP Library from jsDelivr CDN
    wp_enqueue_script( 'gsap-core', 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js', array(), '3.12.2', false );
    
    // GSAP ScrollTrigger Plugin
    wp_enqueue_script( 'gsap-scroll-trigger', 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js', array( 'gsap-core' ), '3.12.2', false );
    
    // Custom main JavaScript file - depends on GSAP
    wp_enqueue_script( 'tc-ventures-main', get_stylesheet_directory_uri() . '/assets/js/main.js', array( 'gsap-core', 'gsap-scroll-trigger' ), '1.0.0', true );
    
    // Localize script for passing PHP data to JavaScript if needed
    wp_localize_script( 'tc-ventures-main', 'tcVentures', array(
        'siteUrl' => home_url(),
        'themeUrl' => get_stylesheet_directory_uri(),
    ));
}
add_action( 'wp_enqueue_scripts', 'tc_ventures_enqueue_scripts' );

/**
 * Remove WordPress default jQuery if not needed
 * Uncomment if you want to use a newer version
 */
// wp_deregister_script( 'jquery' );

/**
 * Custom theme setup
 */
function tc_ventures_setup() {
    // Add theme support features
    add_theme_support( 'title-tag' );
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'custom-logo' );
    add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption' ) );
    
    // Register navigation menus
    register_nav_menus( array(
        'primary' => esc_html__( 'Primary Menu', 'tc-ventures-child' ),
        'footer'  => esc_html__( 'Footer Menu', 'tc-ventures-child' ),
    ));
}
add_action( 'after_setup_theme', 'tc_ventures_setup' );

/**
 * Register custom post types if needed
 * Uncomment and customize as needed
 */
// function tc_ventures_register_post_types() {
//     register_post_type( 'tc_story', array(
//         'label' => 'Stories',
//         'public' => true,
//         'supports' => array( 'title', 'editor', 'thumbnail' ),
//     ));
// }
// add_action( 'init', 'tc_ventures_register_post_types' );

/**
 * Disable Gutenberg editor for all posts
 * Uncomment if you want to use PHP templates instead
 */
// add_filter( 'use_block_editor_for_post_type', '__return_false', 10 );