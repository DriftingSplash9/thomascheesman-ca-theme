<?php
/**
 * Page Template: Scrapbook
 *
 * Auto-applied by WordPress to any page whose slug is `scrapbook`.
 * Spec: timeline-build-log/V0.07.md.
 *
 * BUILD STATUS — Commit C1.1 (intro keyframes shipped, spreads pending):
 *
 *   - Scroll-driven 5-keyframe intro: closed cover → half-open →
 *     dad's letter (long dwell) → open blank → zoomed-in (handoff).
 *   - Spreads region scaffolded with the zoomed-in image as bg so the
 *     end of the intro flows into the start of the spreads region
 *     without a visual cut.
 *   - No page-flip mechanic, events, ornaments, or decade tabs yet —
 *     those land in C2..C7 per the V0.07 commit sequence.
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
         SPREADS — page-flip placeholder.

         Uses book-zoomed-in.png as background so the visual handoff
         from the end of the intro is seamless: the reader scrolls
         out of the sticky intro and the same image continues here as
         the working surface. .scrapbook-page elements (the actual
         flippable pages) mount inside .scrapbook-book in C2.
         ============================================================== -->
    <section class="scrapbook-spreads" data-scrapbook-spreads>
        <div class="scrapbook-book" aria-hidden="true"></div>
    </section>

</main>

<?php
get_footer();
