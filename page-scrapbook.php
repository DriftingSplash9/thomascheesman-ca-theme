<?php
/**
 * Page Template: Scrapbook
 *
 * Auto-applied by WordPress to any page whose slug is `scrapbook`.
 * Spec: timeline-build-log/V0.07.md.
 *
 * BUILD STATUS — Commit C2a (page-flip foundation):
 *
 *   - Scroll-driven 5-keyframe intro (C1.x).
 *   - Spreads region with the page-turner.mp4 video as the flip
 *     animation. 6 dummy spreads with placeholder content; click
 *     chevrons trigger forward / reverse playback + content fade
 *     swap. C2b replaces dummy spread 1 with the real cover spread
 *     (greeting + decade jump menu); C2c adds decade tabs + the
 *     letter envelope; C3+ replaces remaining dummies with events
 *     and ornaments.
 *
 * Page-flip mechanic uses Thomas's authored 6-second video instead
 * of CSS 3D transforms. The video has a 4s static-book pause then
 * a 2s page turn; JS seeks past the pause and plays t=4..6 forward
 * on Next, t=6..4 in reverse at 2x on Prev. HTML overlays fade out
 * during the lift and fade in during the settle, so the video acts
 * as a "physical" cover for the content swap.
 *
 * Future: Thomas plans to record his voice reading the letter.
 * Audio play button will live near KF3 when the recording lands.
 */

get_header();

/**
 * Intro keyframes — narrative arc from closed-on-desk to zoomed-in.
 * Order matters: this is the scroll sequence the reader experiences.
 *
 * KF3 (the letter) gets ~50% of the scroll budget for reading time;
 * the actual opacity windows live in assets/js/scrapbook.js.
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
    array(
        'src' => '/wp-content/uploads/2026/05/book-zoomed-in.png',
        'alt' => '',
    ),
);
?>

<main id="primary" class="scrapbook-page">

    <!-- ==============================================================
         INTRO — scroll-driven 5-keyframe crossfade.

         The .scrapbook-intro section is 400vh tall; the inner
         .scrapbook-intro__sticky pins to the top of the viewport
         for the full intro scroll. The five <img>s stack inside it
         and the JS in scrapbook.js maps scroll progress 0..1 to
         per-keyframe opacity windows.

         If JS fails to load: KF1 (.is-initial) stays at full opacity
         and the user sees the cover throughout. Graceful degrade.
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
        </div>
    </section>

    <!-- ==============================================================
         SPREADS — page-flip presentation.

         The .scrapbook-spreads outer is 150vh tall (soft-lock scroll
         budget — user must scroll past the spreads region to reach
         the footer; can scroll back up to revisit the intro letter).

         The .scrapbook-stage inner is sticky-pinned; inside it lives
         the page-turner video (the "flip" animation), the HTML
         overlay with the current spread, and the prev/next chevrons.

         C2a uses 6 dummy spreads to verify the mechanic. Real
         content lands in C2b (cover spread) and C3+ (events).
         ============================================================== -->
    <section class="scrapbook-spreads" data-scrapbook-spreads>
        <div class="scrapbook-stage">

            <!--
                The page-turn video. Paused at t=4 (start of the
                physical motion) when idle, so its visible frame
                matches the static-book pose the HTML overlays sit
                on top of. Poster falls back to KF5 so before the
                video metadata arrives the user sees the same frame
                that ended the intro — seamless handoff.
            -->
            <video
                class="scrapbook-flipper"
                data-scrapbook-flipper
                src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/05/page-turner.mp4' ) ); ?>"
                poster="<?php echo esc_url( home_url( '/wp-content/uploads/2026/05/book-zoomed-in.png' ) ); ?>"
                preload="auto"
                playsinline
                muted
                aria-hidden="true"
            ></video>

            <!--
                HTML pages overlay the video. The .is-active spread
                is opaque; non-active spreads are kept in the DOM at
                opacity 0 so we can crossfade quickly without
                re-rendering. Mid-turn the active class moves to the
                next spread; CSS handles the fade.
            -->
            <div class="scrapbook-pages" data-scrapbook-pages>
                <?php
                /*
                 * 6 dummy spreads for C2a verification. Each spread
                 * is split into a left page and right page; placeholder
                 * text lets us confirm content swapping works in both
                 * directions before we wire real events. C2b replaces
                 * spread 0 with the cover; C3+ replaces the rest.
                 */
                for ( $i = 0; $i < 6; $i++ ) :
                    $is_active = $i === 0 ? ' is-active' : '';
                ?>
                    <div class="scrapbook-spread<?php echo $is_active; ?>" data-spread-index="<?php echo $i; ?>" aria-hidden="<?php echo $i === 0 ? 'false' : 'true'; ?>">
                        <div class="scrapbook-spread__page scrapbook-spread__page--left">
                            <span class="scrapbook-spread__placeholder">Spread <?php echo $i + 1; ?> &mdash; left</span>
                        </div>
                        <div class="scrapbook-spread__page scrapbook-spread__page--right">
                            <span class="scrapbook-spread__placeholder">Spread <?php echo $i + 1; ?> &mdash; right</span>
                        </div>
                    </div>
                <?php endfor; ?>
            </div>

            <!--
                Navigation. Chevrons sit at the viewport edges so
                they're always reachable; refine to book-edge
                placement later if the wide-screen reach feels off.
                JS disables the buttons during the flip animation
                and at the start / end of the spread sequence.
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
    </section>

</main>

<?php
get_footer();
