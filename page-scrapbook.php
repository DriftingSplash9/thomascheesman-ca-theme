<?php
/**
 * Page Template: Scrapbook
 *
 * Auto-applied by WordPress to any page whose slug is `scrapbook`.
 * Spec: timeline-build-log/V0.07.md.
 *
 * BUILD STATUS — Commit C2a.4 (slideshow merged into intro):
 *
 *   - Scroll-driven 5-keyframe intro (C1.x).
 *   - Slideshow lives INSIDE the intro's sticky stage. As the user
 *     scrolls into KF5 (the zoomed-in blank book) the slideshow
 *     wrapper fades in and the first HTML spread appears on the
 *     same blank pages — no scrolling to a separate "second book"
 *     section. Once intro reaches max scroll the page is fully
 *     scrolled; click chevrons drive the slideshow from there.
 *   - C2b replaces dummy spread 0 with the real cover spread
 *     (greeting + decade jump menu). C2c adds decade tabs + the
 *     letter envelope. C3+ replaces remaining dummies with events.
 *
 * Page-flip mechanic uses Thomas's authored 6-second video
 * (pageturner.mp4) instead of CSS 3D transforms. Idle pause is
 * t=0..3, page turn + audio SFX is t=3..4, post-turn idle is
 * t=4..6. JS plays t=3..4 forward on every click (the visual turn
 * is symmetric — same animation reads as next or prev) and the
 * HTML overlay fades old-out / new-in mid-turn so the video
 * covers the swap.
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
                     * 6 dummy spreads for C2a verification. Each spread
                     * is split into a left page and right page;
                     * placeholder text confirms content swapping works
                     * in both directions before real events are wired.
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
