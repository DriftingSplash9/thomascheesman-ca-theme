<?php
/**
 * Page Template: Scrapbook
 *
 * Auto-applied by WordPress to any page whose slug is `scrapbook`.
 *
 * The /scrapbook page presents Thomas's life as the interior of a
 * scrapbook resting on a wooden desk. The reader navigates by flipping
 * facing-page spreads with decade tabs for jumping between eras.
 * Spec: timeline-build-log/V0.07.md.
 *
 * BUILD STATUS — Commit C1 of N (shell only):
 *   - Wooden-desk surface art is rendered full-bleed
 *   - .scrapbook-book reserved as the 3D perspective container that
 *     future .scrapbook-page elements will mount into
 *   - No page-flip mechanic, no event data, no ornaments yet — those
 *     land in C2..C7 per the V0.07 commit sequence
 *
 * The surface art (`blank-scrab-book.png` — filename misspells "scrap"
 * as "scrab"; preserve verbatim) shows the wooden desk with the open
 * scrapbook painted on it. The .scrapbook-book overlay sits over the
 * painted book area; future commits position .scrapbook-page elements
 * inside it to match the spreads.
 */

get_header();
?>

<main id="primary" class="scrapbook-page">

    <div class="scrapbook-stage" role="presentation">

        <!--
            .scrapbook-book — 3D perspective stage for the page-flip.
            Empty in C1; .scrapbook-page elements mount in here in C2
            when the flip mechanic gets scaffolded.
        -->
        <div class="scrapbook-book" aria-hidden="true"></div>

    </div>

</main>

<?php
get_footer();
