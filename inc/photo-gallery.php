<?php
/**
 * Photo gallery renderer — used on per-kid spoke pages (Patience,
 * Daniel, Faith) to display a long ordered list of photographs as
 * a CSS-Columns masonry wall, optionally divided into chapter sections.
 *
 * Output is plain <img> tags wrapped in figures inside <main>. The
 * site-wide initLightbox() in main.js automatically wraps each img
 * in a PhotoSwipe link, so clicking any thumbnail opens the full-size
 * lightbox with arrow navigation across the entire page.
 *
 * Galleries of 12+ items render DEFERRED: the whole wall sits inside
 * an inert <template> behind a "click to open" cover button, so the
 * page makes zero image/video requests for the wall until a reader
 * opts in. initDeferredGalleries() in main.js expands it on click and
 * wires the lightbox + slideshow for the newly-live images.
 *
 * Per the no-cover rule (memory: feedback_no_object_fit_cover.md),
 * thumbnails preserve their natural aspect ratio. The masonry varies
 * cell heights based on each photo's intrinsic shape — no cropping.
 *
 * --- Item formats (auto-detected) -----------------------------------
 *
 * Legacy flat list (used by Daniel/Faith stubs):
 *   $items = array( 'https://.../a.jpg', 'https://.../b.jpg', ... );
 *
 * Year-tagged list (Patience — sourced from partiences-styled.XLSX):
 *   $items = array(
 *       array( 'url' => 'https://.../a.jpg', 'year' => 2013 ),
 *       array( 'url' => 'https://.../b.jpg', 'year' => 2013 ),
 *       ...
 *   );
 *
 * Captioned item (optional — accessibility + lightbox caption):
 *   array(
 *       'url'     => 'https://.../a.jpg',
 *       'year'    => 2013,
 *       'caption' => 'Patience asleep on the kitchen counter, two weeks old',
 *       // Optional: explicit alt overrides everything. Use only when
 *       // the visible caption differs from what a screen reader should
 *       // announce — usually leave it off and let `caption` double as
 *       // alt text.
 *       'alt'     => 'Two-week-old Patience asleep on a kitchen counter',
 *   )
 *
 * Items, sections, and captions can be mixed freely — uncaptioned
 * items fall back to a section-aware alt ("Patience, Year One — 2013,
 * photo 7") so screen-reader output stays meaningful even before any
 * captions are backfilled.
 *
 * --- Section formats (auto-detected per-section) --------------------
 *
 * Count-based slice (legacy):
 *   array( 'label' => 'First Years', 'count' => 28 )
 *
 * Year-based filter (used when items are year-tagged):
 *   array( 'label' => '2014—2016', 'years' => array( 2014, 2015, 2016 ) )
 *
 * Mix and match per section as you like — the renderer dispatches
 * each section independently.
 *
 * @param array  $items      Photo list (see formats above).
 * @param array  $sections   Section definitions (see formats above).
 *                           Empty array = render everything in one block.
 * @param string $alt_prefix Image alt-text prefix, e.g. "Patience" yields
 *                           "Patience photo 12".
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

/**
 * URL → attachment-ID lookup with a persistent cache.
 *
 * attachment_url_to_postid() is a LIKE query — far too heavy to run
 * ~200× per kid page on every uncached render. Each URL is looked up
 * once, memoised into a single autoload=false option, and read back on
 * later renders. Misses (external files, deleted attachments) cache as
 * 0 so they are never retried.
 */
function tc_gallery_attachment_id( string $url ) : int {
    static $map   = null;
    static $dirty = false;
    // Versioned key: each schema fix retires the previous cache (with
    // its page of memoised misses) without a manual option delete.
    // v1 cached misses for root-relative paths; v2 for bare-stem URLs
    // whose library entry is the -scaled variant.
    $opt = 'tc_gallery_url_map_v3';
    if ( $map === null ) {
        $map = get_option( $opt, array() );
        if ( ! is_array( $map ) ) {
            $map = array();
        }
        register_shutdown_function( function () use ( &$map, &$dirty, $opt ) {
            if ( $dirty ) {
                update_option( $opt, $map, false );
            }
        } );
    }
    if ( array_key_exists( $url, $map ) ) {
        return (int) $map[ $url ];
    }
    $lookup = $url;
    if ( strpos( $lookup, '//' ) === false ) {
        $lookup = home_url( $lookup );
    }
    $id = (int) attachment_url_to_postid( $lookup );
    if ( ! $id ) {
        if ( strpos( $lookup, '-scaled.' ) !== false ) {
            // Attachments whose main file is the un-scaled original.
            $id = (int) attachment_url_to_postid( str_replace( '-scaled.', '.', $lookup ) );
        } else {
            // The reverse (live-verified on Daniel's wall): big uploads'
            // library entry IS the -scaled variant, while several gallery
            // arrays reference the bare original — which also exists on
            // disk, so the page served the heaviest possible file.
            $scaled = preg_replace( '/\.(jpe?g|png|webp)$/i', '-scaled.$1', $lookup );
            if ( $scaled && $scaled !== $lookup ) {
                $id = (int) attachment_url_to_postid( $scaled );
            }
        }
    }
    $map[ $url ] = $id;
    $dirty       = true;
    return $id;
}

function tc_render_photo_gallery( array $items, array $sections = array(), string $alt_prefix = 'Photo' ) : void {
    if ( empty( $items ) ) {
        return;
    }

    // Normalise items → uniform [url, year, caption, alt] tuples
    // regardless of which input format the caller passed. caption +
    // alt are optional — defaults are empty strings; the rendering
    // loop's alt-precedence chain handles fallbacks.
    $normalised = array();
    foreach ( $items as $item ) {
        if ( is_string( $item ) ) {
            $normalised[] = array(
                'url'     => $item,
                'year'    => null,
                'caption' => '',
                'alt'     => '',
            );
        } elseif ( is_array( $item ) && isset( $item['url'] ) ) {
            $normalised[] = array(
                'url'     => $item['url'],
                'year'    => isset( $item['year'] ) ? (int) $item['year'] : null,
                'caption' => isset( $item['caption'] ) ? (string) $item['caption'] : '',
                'alt'     => isset( $item['alt'] ) ? (string) $item['alt'] : '',
            );
        }
    }
    if ( empty( $normalised ) ) {
        return;
    }

    // Resolve the sections list into [label, items_subset] slices.
    // Each section can opt into either count-based slicing (legacy) or
    // year-based filtering (preferred when years are present).
    $slices = array();
    $cursor = 0;
    foreach ( $sections as $section ) {
        $label = (string) ( $section['label'] ?? '' );
        if ( isset( $section['years'] ) && is_array( $section['years'] ) ) {
            $year_set = array_map( 'intval', $section['years'] );
            $subset = array();
            foreach ( $normalised as $entry ) {
                if ( in_array( $entry['year'], $year_set, true ) ) {
                    $subset[] = $entry;
                }
            }
            if ( ! empty( $subset ) ) {
                $slices[] = array( 'label' => $label, 'items' => $subset );
            }
        } else {
            $count = (int) ( $section['count'] ?? 0 );
            if ( $count > 0 ) {
                $end = min( $cursor + $count, count( $normalised ) );
                $slices[] = array(
                    'label' => $label,
                    'items' => array_slice( $normalised, $cursor, $end - $cursor ),
                );
                $cursor = $end;
            }
        }
    }
    // Trailing remainder for count-based sections that didn't sum to all.
    if ( $cursor > 0 && $cursor < count( $normalised ) ) {
        $slices[] = array(
            'label' => '',
            'items' => array_slice( $normalised, $cursor ),
        );
    }
    // No sections defined at all — render everything as one block.
    if ( empty( $slices ) ) {
        $slices[] = array( 'label' => '', 'items' => $normalised );
    }

    // Deferred ("click to open") mode — galleries at or above the
    // threshold render their entire wall inside an inert <template>
    // behind a cover button, so a reader who only wants the story pays
    // zero image/video requests for the wall. initDeferredGalleries()
    // in main.js moves the template content live on click, wraps the
    // new imgs for the lightbox, and wires the slideshow button.
    // Threshold matches the slideshow button's: 12.
    $deferred = count( $normalised ) >= 12;

    echo '<section class="tc-photo-gallery' . ( $deferred ? ' tc-photo-gallery--deferred' : '' ) . '" aria-label="' . esc_attr( $alt_prefix . ' photo gallery' ) . '">';

    if ( $deferred ) {
        $photo_count = 0;
        $video_count = 0;
        foreach ( $normalised as $entry ) {
            if ( preg_match( '/\.(mp4|webm|mov|m4v|ogg|ogv)(\?|#|$)/i', $entry['url'] ) ) {
                $video_count++;
            } else {
                $photo_count++;
            }
        }
        $meta = sprintf(
            /* translators: %d: number of photos. */
            _n( '%d photo', '%d photos', $photo_count, 'tc-ventures-child' ),
            $photo_count
        );
        if ( $video_count > 0 ) {
            $meta .= ' &middot; ' . sprintf(
                /* translators: %d: number of videos. */
                _n( '%d video', '%d videos', $video_count, 'tc-ventures-child' ),
                $video_count
            );
        }
        $cover_label = ! empty( $sections[0]['label'] ) && count( $sections ) === 1
            ? $sections[0]['label']
            : __( 'The photo wall', 'tc-ventures-child' );

        echo '<button type="button" class="tc-photo-gallery__cover" aria-expanded="false">';
        echo '<span class="tc-photo-gallery__cover-icon" aria-hidden="true">&#10064;</span>';
        echo '<span class="tc-photo-gallery__cover-text">';
        echo '<span class="tc-photo-gallery__cover-title">' . esc_html( $cover_label ) . '</span>';
        echo '<span class="tc-photo-gallery__cover-meta">' . wp_kses( $meta, array() ) . ' &middot; ' . esc_html__( 'click to open', 'tc-ventures-child' ) . '</span>';
        echo '</span>';
        echo '</button>';
        echo '<template class="tc-photo-gallery__tpl">';
    }

    // Slideshow toolbar — only shown when the gallery is large enough
    // for autoplay to be a meaningful affordance. Threshold of 12 means
    // small galleries stay quiet (clicking through them is fine).
    if ( count( $normalised ) >= 12 ) {
        echo '<div class="tc-photo-gallery__toolbar">';
        echo '<button type="button" class="tc-photo-gallery__slideshow-btn" data-tc-autoplay-ms="4500">';
        echo '<span class="tc-photo-gallery__slideshow-icon" aria-hidden="true">&#9654;</span>';
        echo '<span class="tc-photo-gallery__slideshow-label">' . esc_html__( 'Play as slideshow', 'tc-ventures-child' ) . '</span>';
        echo '</button>';
        echo '</div>';
    }

    $global_idx = 0;
    foreach ( $slices as $slice ) {
        if ( ! empty( $slice['label'] ) ) {
            echo '<header class="tc-photo-gallery__section-head">';
            echo '<span class="tc-photo-gallery__rule" aria-hidden="true"></span>';
            echo '<h2 class="tc-photo-gallery__section-label">' . esc_html( $slice['label'] ) . '</h2>';
            echo '<span class="tc-photo-gallery__rule" aria-hidden="true"></span>';
            echo '</header>';
        }

        echo '<div class="tc-photo-gallery__grid">';
        foreach ( $slice['items'] as $entry ) {
            // First six photos site-wide eager-load so the page feels
            // populated immediately; everything else lazy-loads as the
            // reader scrolls into view.
            $loading = ( $global_idx < 6 ) ? 'eager' : 'lazy';
            $url     = $entry['url'];
            $caption = $entry['caption'];

            // Alt-text precedence:
            //   1. Explicit alt — overrides everything (useful when the
            //      visible caption shouldn't double as screen-reader
            //      content, e.g. a pull-quote caption).
            //   2. Caption — when present, doubles as alt text. Means a
            //      backfilled caption immediately upgrades a11y too.
            //   3. Section-aware fallback — uses the current section
            //      label ("Patience, Year One — 2013, photo 7") so even
            //      uncaptioned photos give screen-reader users some
            //      context.
            //   4. Bare prefix fallback — for galleries with no
            //      sections defined ("Patience photo 7"). Worst-case;
            //      previous behaviour.
            if ( $entry['alt'] !== '' ) {
                $alt = $entry['alt'];
            } elseif ( $caption !== '' ) {
                $alt = $caption;
            } elseif ( ! empty( $slice['label'] ) ) {
                $alt = sprintf( '%s, %s, photo %d', $alt_prefix, $slice['label'], $global_idx + 1 );
            } else {
                $alt = sprintf( '%s photo %d', $alt_prefix, $global_idx + 1 );
            }

            // Detect video URLs by extension. Render with <video> +
            // controls instead of <img>, otherwise the browser shows
            // a broken-image icon. PhotoSwipe's initLightbox() only
            // wraps <img> tags, so videos sit inline as native players
            // without entering the lightbox flow.
            if ( preg_match( '/\.(mp4|webm|mov|m4v|ogg|ogv)(\?|#|$)/i', $url ) ) {
                $caption_html = $caption !== ''
                    ? sprintf( '<figcaption>%s</figcaption>', esc_html( $caption ) )
                    : '';
                printf(
                    '<figure class="tc-photo-gallery__item tc-photo-gallery__item--video"><video src="%1$s" controls preload="metadata" playsinline aria-label="%2$s"></video>%3$s</figure>',
                    esc_url( $url ),
                    esc_attr( $alt ),
                    $caption_html
                );
            } else {
                $caption_html = $caption !== ''
                    ? sprintf( '<figcaption>%s</figcaption>', esc_html( $caption ) )
                    : '';

                // Review-2 perf fix: the wall used to serve every photo at
                // its full -scaled size (≈5 MB pages, 18 s mobile LCP on
                // Patience). When the URL maps to a media-library
                // attachment, emit srcset + sizes so browsers pick a small
                // candidate for the ~130–200px grid cells, plus intrinsic
                // width/height. data-tc-full* hands the lightbox the
                // full-size URL and true dimensions — with srcset, the
                // thumb's currentSrc/naturalWidth describe the SMALL
                // candidate, so main.js prefers these attributes.
                $dims = '';
                $resp = '';
                $att  = tc_gallery_attachment_id( $url );
                if ( $att ) {
                    $meta = wp_get_attachment_metadata( $att );
                    if ( is_array( $meta ) && ! empty( $meta['width'] ) && ! empty( $meta['height'] ) ) {
                        $dims = sprintf(
                            ' width="%1$d" height="%2$d" data-tc-full="%3$s" data-tc-fullw="%1$d" data-tc-fullh="%2$d"',
                            (int) $meta['width'],
                            (int) $meta['height'],
                            esc_url( $url )
                        );
                    }
                    $srcset = wp_get_attachment_image_srcset( $att, 'full' );
                    if ( $srcset ) {
                        $resp = sprintf(
                            ' srcset="%s" sizes="(max-width: 700px) 33vw, 200px"',
                            esc_attr( $srcset )
                        );
                    }
                }

                printf(
                    '<figure class="tc-photo-gallery__item"><img src="%1$s" alt="%2$s" loading="%3$s" decoding="async"%5$s%6$s />%4$s</figure>',
                    esc_url( $url ),
                    esc_attr( $alt ),
                    esc_attr( $loading ),
                    $caption_html,
                    $dims,
                    $resp
                );
            }
            $global_idx++;
        }
        echo '</div>';
    }

    if ( $deferred ) {
        echo '</template>';
    }

    echo '</section>';
}
