<?php
/**
 * Photo gallery renderer — used on per-kid spoke pages (Patience,
 * Daniel, Faith) to display a long ordered list of photographs as
 * a justified-style wall, optionally divided into chapter sections.
 *
 * The output is plain <img> tags wrapped in figures inside <main>.
 * The site-wide initLightbox() in main.js automatically wraps every
 * such img in a PhotoSwipe link, so clicking any thumbnail opens the
 * full-size lightbox with arrow navigation across the entire page.
 *
 * Per the no-cover rule (memory: feedback_no_object_fit_cover.md),
 * thumbnails preserve their natural aspect ratio. The wall flexes
 * to a uniform row height so visual rhythm holds regardless of how
 * the photos were composed.
 *
 * @param array $urls     Flat ordered list of image URLs.
 * @param array $sections Optional list of section definitions. Each
 *                        entry: array( 'label' => string, 'count' => int ).
 *                        The counts must sum to <= count($urls); any
 *                        leftover photos render after the last section
 *                        without a divider. Pass an empty array (or omit)
 *                        to render one continuous wall with no dividers.
 * @param string $alt_prefix Used as the base for image alt text — e.g.
 *                           "Patience" yields "Patience photo 12".
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

function tc_render_photo_gallery( array $urls, array $sections = array(), string $alt_prefix = 'Photo' ) : void {
    if ( empty( $urls ) ) {
        return;
    }

    // Resolve sections into [start, end, label] slices. Fall back to a
    // single unlabeled section covering everything when none provided.
    $slices = array();
    $cursor = 0;
    foreach ( $sections as $section ) {
        $count = (int) ( $section['count'] ?? 0 );
        if ( $count <= 0 ) { continue; }
        $end = min( $cursor + $count, count( $urls ) );
        $slices[] = array(
            'label' => (string) ( $section['label'] ?? '' ),
            'start' => $cursor,
            'end'   => $end,
        );
        $cursor = $end;
    }
    if ( $cursor < count( $urls ) ) {
        // Trailing remainder if section counts didn't sum to total.
        $slices[] = array(
            'label' => '',
            'start' => $cursor,
            'end'   => count( $urls ),
        );
    }
    if ( empty( $slices ) ) {
        // No sections supplied — render everything as one block.
        $slices[] = array( 'label' => '', 'start' => 0, 'end' => count( $urls ) );
    }

    echo '<section class="tc-photo-gallery" aria-label="' . esc_attr( $alt_prefix . ' photo gallery' ) . '">';

    foreach ( $slices as $idx => $slice ) {
        if ( ! empty( $slice['label'] ) ) {
            echo '<header class="tc-photo-gallery__section-head">';
            echo '<span class="tc-photo-gallery__rule" aria-hidden="true"></span>';
            echo '<h2 class="tc-photo-gallery__section-label">' . esc_html( $slice['label'] ) . '</h2>';
            echo '<span class="tc-photo-gallery__rule" aria-hidden="true"></span>';
            echo '</header>';
        }

        echo '<div class="tc-photo-gallery__grid">';
        for ( $i = $slice['start']; $i < $slice['end']; $i++ ) {
            $url = $urls[ $i ];
            // First few photos eager-load so the page feels populated
            // immediately; the rest lazy-load as the reader scrolls.
            $loading = ( $i < 6 ) ? 'eager' : 'lazy';
            $alt     = sprintf( '%s photo %d', $alt_prefix, $i + 1 );
            printf(
                '<figure class="tc-photo-gallery__item"><img src="%1$s" alt="%2$s" loading="%3$s" decoding="async" /></figure>',
                esc_url( $url ),
                esc_attr( $alt ),
                esc_attr( $loading )
            );
        }
        echo '</div>';
    }

    echo '</section>';
}
