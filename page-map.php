<?php
/**
 * Page Template: The Lanterns of Record — the converging-families map.
 *
 * Auto-applied for any WP page with slug `map` (template hierarchy
 * resolves `page-{slug}.php`). Top-level page per Thomas's call
 * (2026-06-11): the URL is /map.
 *
 * P1 of docs/CONVERGING-MAP-SPEC.md — the STATIC light-table: every
 * lantern placed at its confidence-tier brightness over a dark world,
 * faint carried-light trails, the record-density timeline, hover
 * dossiers, click-through into the long-reads. No time animation yet
 * (that's P2). Data: inc/data/family-map.json, generated from the
 * pre-seeded family-map-data.xlsx by _xlsx2map.py (off-repo).
 * Engine: assets/js/family-map.js (D3-geo, enqueued only here).
 */

get_header(); ?>

<main id="primary" class="site-main map-page">

    <!-- ==============================================================
         PAGE HERO — minimal, same kinetic pattern as the heritage hub.
         The site's default indigo/cyan WebGL background IS the spec's
         "after-hours archive" base; nothing overrides it here.
         ============================================================== -->
    <section class="page-hero">
        <div class="container">
            <span class="page-hero__eyebrow">The Lanterns of Record</span>
            <h1 class="page-hero__title kinetic-text">The Map</h1>
            <p class="page-hero__subtitle kinetic-fade">
                Ten family lines, two and a half centuries, one prairie &mdash;
                drawn as records becoming light
            </p>
        </div>
    </section>

    <!-- ==============================================================
         THE LIGHT-TABLE HUD
         A glass plate the visitor leans over. The SVG world, the
         lanterns, and the density timeline are all drawn by
         family-map.js into the mounts below.
         ============================================================== -->
    <section class="tc-map-section">
        <div class="tc-map-hud">

            <p class="tc-map-hud__intro">
                Every light is a documented life-event &mdash; a birth, a marriage,
                a crossing, a grave. <strong>How brightly it burns is how sure the
                record is:</strong> a verified register entry is a crisp flame, a
                family tradition only a flicker. Hover a lantern for its story;
                click it to open that family&rsquo;s long-read.
            </p>

            <div id="tc-map-legend" class="tc-map-legend" aria-hidden="true"></div>

            <div id="tc-map" class="tc-map" role="img"
                 aria-label="A world map of the family's documented life-events, each drawn as a point of light coloured by family line and brightened by how certain the record is. The lines converge on Alberta.">
                <noscript>
                    <p class="tc-map__noscript">The lantern map needs JavaScript.
                    The same history is told in full in
                    <a href="<?php echo esc_url( home_url( '/family/heritage' ) ); ?>">the eight family stories</a>.</p>
                </noscript>
            </div>

            <div id="tc-map-timeline" class="tc-map-timeline" role="img"
                 aria-label="A timeline from 1610 to today showing how many documented family events exist per decade, stacked by family line - nearly silent before 1800, swelling as civil registration arrives, dense in the twentieth century."></div>

            <p class="tc-map-hud__foot" id="tc-map-foot"></p>

        </div>
    </section>

</main>

<?php get_footer(); ?>
