<?php
/**
 * Page Template: Scrapbook
 *
 * Auto-applied by WordPress to any page whose slug is `scrapbook`.
 * Spec: timeline-build-log/V0.07.md.
 *
 * BUILD STATUS — Commit C1.3 (intro keyframes only):
 *
 *   - Scroll-driven 5-keyframe intro: closed cover → half-open →
 *     dad's letter (long dwell) → open blank → zoomed-in.
 *   - The spreads region (page-flip mechanic, events, ornaments,
 *     decade tabs) is NOT scaffolded here yet — it lands in C2.
 *     Earlier C1.1 had a placeholder spreads section with the
 *     zoomed-in image as background for "visual continuity"; in
 *     practice it read as a second book pasted below the intro,
 *     so C1.3 removed it. C2 reintroduces .scrapbook-spreads +
 *     .scrapbook-book with real page-flip content.
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

    <?php // .scrapbook-spreads section + page-flip mechanic land in C2. ?>

</main>

<?php
get_footer();
