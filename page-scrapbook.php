<?php
/**
 * Page Template: Scrapbook
 *
 * Auto-applied by WordPress to any page whose slug is `scrapbook`.
 * Spec: timeline-build-log/V0.07.md.
 *
 * BUILD STATUS — Commit C2a.9 (video IS the rest pose):
 *
 *   - Scroll-driven 4-keyframe intro: cover → half-open → letter →
 *     open. The fifth visual ("zoomed-in blank book") is now the
 *     video element itself, paused at TURN_START. Eliminates the
 *     pixel mismatch between a separate KF5 image and the video's
 *     first/last frames — same source pixels = perfect alignment.
 *   - Slideshow lives INSIDE the intro's sticky stage. Wrapper
 *     opacity fades in over scroll progress 0.78..0.82, taking
 *     KF5's old role visually. The video stays at opacity 1
 *     whenever the wrapper is visible.
 *   - Click chevrons drive the slideshow. The page is exactly the
 *     intro region tall (no separate spreads section, no footer).
 *   - C2b replaces dummy spread 0 with the real cover spread
 *     (greeting + decade jump menu). C2c adds decade tabs + the
 *     letter envelope. C3+ replaces remaining dummies with events.
 *
 * Page-flip mechanic uses Thomas's authored 6-second video
 * (pageturner.mp4) instead of CSS 3D transforms. The video is
 * always visible when the slideshow wrapper is visible (no fade
 * in/out per click) — paused at TURN_START between flips, plays
 * t=3..6 on click, then pause + seek back to TURN_START for the
 * next idle. Forward plays at 1x with the SFX audio. Backward
 * plays the same clip at 1x with the video horizontally mirrored
 * (scaleX(-1)) so it reads as a page turning the other way. HTML
 * overlay fades old-out / new-in mid-turn to cover the swap.
 *
 * Future: Thomas plans to record his voice reading the letter.
 * Audio play button will live near KF3 when the recording lands.
 */

get_header();

/**
 * Intro keyframes — narrative arc from closed-on-desk to open book.
 * Order matters: this is the scroll sequence the reader experiences.
 *
 * KF3 (the letter) gets ~50% of the scroll budget for reading time;
 * the actual opacity windows live in assets/js/scrapbook.js. The
 * fifth "zoomed-in" beat is supplied by the video element itself
 * (paused at TURN_START) so its rest pose matches the animation
 * source pixel-for-pixel.
 */
$tc_scrapbook_intro_kfs = array(
    array(
        'src' => '/wp-content/uploads/2026/05/cover.png',
        'alt' => 'A scrapbook on a wooden desk, surrounded by small mementos.',
    ),
    array(
        'src' => '/wp-content/uploads/2026/05/book-half-open.png',
        'alt' => '',
    ),
    array(
        'src' => '/wp-content/uploads/2026/05/letter-in-book.png',
        'alt' => 'A handwritten letter from Thomas to his children, opening the scrapbook.',
    ),
    array(
        'src' => '/wp-content/uploads/2026/05/book-open.png',
        'alt' => '',
    ),
);

/**
 * Scrapbook events — the actual content that mounts onto each
 * spread's right page. C2b populates the first event; future
 * commits will extend this array. When count(events) < spread
 * count, the remaining spreads keep their placeholder boxes.
 */
$tc_scrapbook_events = array(
    array(
        'year'  => '1980',
        'place' => 'Calgary',
        'title' => 'Born',
        'note'  => 'Look out, Calgary.',
        'image' => '/wp-content/uploads/2026/04/a-baby-thomas-scaled.jpg',
    ),
);

/**
 * Per-spread layout variations — keeps the scrapbook feeling
 * hand-assembled. Each spread gets a deterministic tilt + offset
 * (cycled through this list by spread index) so the photos land
 * at slightly different angles instead of perfectly grid-aligned.
 * Cycle is 7 entries deep so neighbouring spreads never share
 * exact values.
 */
$tc_scrapbook_variations = array(
    array( 'tilt' => -3, 'x' => -2, 'y' => -3 ),
    array( 'tilt' =>  2, 'x' =>  5, 'y' =>  1 ),
    array( 'tilt' => -5, 'x' => -1, 'y' =>  4 ),
    array( 'tilt' =>  4, 'x' =>  3, 'y' => -2 ),
    array( 'tilt' => -1, 'x' =>  0, 'y' =>  5 ),
    array( 'tilt' =>  6, 'x' => -4, 'y' => -1 ),
    array( 'tilt' => -7, 'x' =>  2, 'y' =>  2 ),
);

$tc_total_spreads = max( 6, count( $tc_scrapbook_events ) );
?>

<main id="primary" class="scrapbook-page">

    <!-- ==============================================================
         INTRO + SLIDESHOW — single sticky stage.

         The .scrapbook-intro section is 400vh tall; the inner
         .scrapbook-intro__sticky pins to the top of the viewport
         for the full intro scroll. The five keyframe <img>s stack
         inside it (scroll-driven crossfade), AND the slideshow
         wrapper lives inside the same sticky stage.

         As scroll progress approaches 1, KF5 (the zoomed-in blank
         book) reaches full opacity AND the slideshow wrapper fades
         in. The HTML spread renders directly on top of the same
         blank pages KF5 shows — no jump cut, no second book.

         Once the user reaches max scroll (intro region ends), the
         page is at its bottom. Click chevrons drive the slideshow
         from there; there is no more scroll. No footer either.

         If JS fails to load: KF1 (.is-initial) stays at full opacity
         and the slideshow stays hidden (CSS default). Graceful.
         ============================================================== -->
    <section class="scrapbook-intro" data-scrapbook-intro>
        <div class="scrapbook-intro__sticky">

            <?php foreach ( $tc_scrapbook_intro_kfs as $i => $kf ) : ?>
                <img
                    class="scrapbook-intro__kf<?php echo $i === 0 ? ' is-initial' : ''; ?>"
                    data-kf-index="<?php echo (int) $i; ?>"
                    src="<?php echo esc_url( home_url( $kf['src'] ) ); ?>"
                    alt="<?php echo esc_attr( $kf['alt'] ); ?>"
                    loading="<?php echo $i === 0 ? 'eager' : 'lazy'; ?>"
                    decoding="async"
                />
            <?php endforeach; ?>

            <!--
                Slideshow wrapper. Opacity is JS-driven (tied to the
                same scroll window as KF5) so it's invisible during
                the early intro keyframes and fades in when the
                zoomed-in book reaches full opacity.

                Z-stacked above the keyframes so the video + HTML
                content render on top of KF5 once visible. The video
                poster is also book-zoomed-in.png, so when the
                wrapper first appears the user sees a continuous
                blank-book surface from KF5 + poster.
            -->
            <div class="scrapbook-slideshow" data-scrapbook-slideshow>

                <video
                    class="scrapbook-flipper"
                    data-scrapbook-flipper
                    src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/05/pageturner.mp4' ) ); ?>"
                    poster="<?php echo esc_url( home_url( '/wp-content/uploads/2026/05/book-zoomed-in.png' ) ); ?>"
                    preload="auto"
                    playsinline
                    aria-hidden="true"
                ></video>

                <!--
                    HTML pages overlay the video. The .is-active spread
                    is opaque; non-active spreads are kept in the DOM
                    at opacity 0 so we can crossfade quickly without
                    re-rendering. Mid-turn the active class moves to
                    the next spread; CSS handles the 250ms fade.
                -->
                <div class="scrapbook-pages" data-scrapbook-pages>
                    <?php
                    /*
                     * Spread loop. Each spread = left page + right page.
                     * - Right page: real event content if available,
                     *   otherwise the build-time placeholder box.
                     * - Left page: placeholder for now (real left-page
                     *   content lands in later commits — currently
                     *   reserved for date dividers / decorative ornaments).
                     *
                     * The .is-active class drives the entrance animations
                     * on the spread's children (see scrapbook.css). Each
                     * spread carries CSS custom properties (--photo-tilt
                     * etc.) from the variations table, so neighbouring
                     * spreads land at distinct hand-placed angles.
                     */
                    for ( $i = 0; $i < $tc_total_spreads; $i++ ) :
                        $is_active = $i === 0 ? ' is-active' : '';
                        $event     = isset( $tc_scrapbook_events[ $i ] ) ? $tc_scrapbook_events[ $i ] : null;
                        $variant   = $tc_scrapbook_variations[ $i % count( $tc_scrapbook_variations ) ];
                        $style     = sprintf(
                            '--photo-tilt: %ddeg; --photo-x: %dpx; --photo-y: %dpx;',
                            (int) $variant['tilt'],
                            (int) $variant['x'],
                            (int) $variant['y']
                        );
                    ?>
                        <div class="scrapbook-spread<?php echo $is_active; ?>"
                             data-spread-index="<?php echo $i; ?>"
                             aria-hidden="<?php echo $i === 0 ? 'false' : 'true'; ?>"
                             style="<?php echo esc_attr( $style ); ?>">

                            <div class="scrapbook-spread__page scrapbook-spread__page--left">
                                <span class="scrapbook-spread__placeholder">Spread <?php echo $i + 1; ?> &mdash; left</span>
                            </div>

                            <div class="scrapbook-spread__page scrapbook-spread__page--right">
                                <?php if ( $event ) : ?>
                                    <figure class="scrapbook-photo">
                                        <img
                                            src="<?php echo esc_url( home_url( $event['image'] ) ); ?>"
                                            alt="<?php echo esc_attr( $event['title'] ); ?>"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                        <figcaption class="scrapbook-photo__caption">
                                            <span class="scrapbook-photo__title"><?php echo esc_html( $event['title'] ); ?></span>
                                            <span class="scrapbook-photo__meta"><?php echo esc_html( $event['place'] . ' &middot; ' . $event['year'] ); ?></span>
                                        </figcaption>
                                    </figure>
                                <?php else : ?>
                                    <span class="scrapbook-spread__placeholder">Spread <?php echo $i + 1; ?> &mdash; right</span>
                                <?php endif; ?>
                            </div>

                        </div>
                    <?php endfor; ?>
                </div>

                <!--
                    Navigation chevrons. Disabled at sequence boundaries
                    and during the flip animation (busy flag). JS in
                    scrapbook.js attaches handlers.
                -->
                <button
                    type="button"
                    class="scrapbook-nav scrapbook-nav--prev"
                    data-scrapbook-prev
                    aria-label="<?php esc_attr_e( 'Previous spread', 'tc-ventures-child' ); ?>"
                    disabled
                >
                    <span aria-hidden="true">&lsaquo;</span>
                </button>
                <button
                    type="button"
                    class="scrapbook-nav scrapbook-nav--next"
                    data-scrapbook-next
                    aria-label="<?php esc_attr_e( 'Next spread', 'tc-ventures-child' ); ?>"
                >
                    <span aria-hidden="true">&rsaquo;</span>
                </button>

            </div>

        </div>
    </section>

</main>

<?php
/*
 * No get_footer() — the scrapbook ends at the slideshow by design.
 * Same approach as the parked /timeline page (per V0.05). We still
 * need wp_footer() so plugins, the sitewide JS, and the closing
 * body/html tags get emitted that footer.php would normally handle.
 */
wp_footer();
?>
</body>
</html>
