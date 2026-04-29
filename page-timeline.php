<?php
/**
 * Page Template: Timeline — "The Long Drive"
 *
 * Auto-applied by WordPress to any page whose slug is `timeline`.
 *
 * The page is one continuous parallax scene. Vertical scrolling drives a
 * horizontal pan: four scenery layers slide in alternating directions
 * (carnival-duck mechanic), a curving road below them holds the events,
 * and a side-profile safari jeep is pinned center-bottom with three
 * functioning windows — passenger (prose), rear (image), windshield
 * (atmosphere). Capsule chrome morphs on this page only: the time clock
 * becomes a year-display, the timezone slot becomes a compass that
 * follows the road's tangent direction. No footer; the page ends at a
 * "Roll-Out" sign.
 *
 * All scroll motion runs through a JS lerp loop, so high-line-count
 * mouse wheels can't make the scene jerk. Prose / image cross-fades
 * are time-based, not scroll-based, so reading rhythm is preserved
 * regardless of how violently the reader scrolls.
 *
 * Image assets are dropped in via CSS background-image as Thomas
 * uploads them; the scaffold renders without them (gray placeholders
 * tinted by era so the parallax is still visible end-to-end).
 *
 * See:
 *   - project_tc_bhag_living_document.md (the jeep cameos here as a
 *     2D dress-rehearsal for the BHAG)
 *   - project_tc_lightbox.md (the projector lightbox is a separate
 *     component, NOT a PhotoSwipe skin — different aesthetic)
 */

/**
 * Timeline events.
 *
 * Each entry maps to a road segment + a "beat" the jeep windows hit:
 *   - year         display label (string — supports ranges like "1990–91")
 *   - yearStart    integer — what the capsule odometer should show
 *   - title        short heading (passenger window header)
 *   - prose        body text (passenger window body)
 *   - image        URL or empty (rear window)
 *   - pos          0..1 along the road
 *   - mark         optional — { kind: 'sign'|'mailbox'|'pothole'|...,
 *                                label: 'Township 71',
 *                                eg: [{ type: 'image'|'video', src: ... }] }
 *
 * Source: thomascheesman.ca/my-timeline/ (verbatim, light editing).
 * Images intentionally blank for now — Thomas will fill from WP Media.
 */
$tc_timeline_events = array(
    array(
        'year'      => '1980',
        'yearStart' => 1980,
        'title'     => 'Born — look out, Calgary',
        'prose'     => 'Born in Calgary. Look out, Calgary.',
        'image'     => '',
        'pos'       => 0.02,
    ),
    array(
        'year'      => '1984',
        'yearStart' => 1984,
        'title'     => 'Headed to Turner Valley',
        'prose'     => 'Out of the city and into the foothills. Six years lived in Turner Valley — mountains close, oil derricks scattered through the trees.',
        'image'     => '',
        'pos'       => 0.06,
        'mark'      => array( 'kind' => 'sign', 'label' => 'Welcome to Turner Valley' ),
    ),
    array(
        'year'      => '1985',
        'yearStart' => 1985,
        'title'     => 'Diagnosed with Hajdu-Cheney',
        'prose'     => 'A bump in the road, before the road had even straightened out. The diagnosis arrived inside the first year in Turner Valley. Life kept moving.',
        'image'     => '',
        'pos'       => 0.085,
        'mark'      => array( 'kind' => 'pothole', 'label' => 'HCS' ),
    ),
    array(
        'year'      => '1990–91',
        'yearStart' => 1990,
        'title'     => 'Parents divorce — Teepee Creek',
        'prose'     => 'Parents divorced. Moved to Teepee Creek, AB — to the Bird Farm. Open prairie, distant trees, a different kind of quiet.',
        'image'     => '',
        'pos'       => 0.13,
        'mark'      => array( 'kind' => 'sign', 'label' => 'Welcome to Teepee Creek' ),
    ),
    array(
        'year'      => '1991–93',
        'yearStart' => 1991,
        'title'     => 'Edmonton interlude',
        'prose'     => 'Mom remarried. A year later she took a break from it and we moved to Edmonton. First time living in a real city.',
        'image'     => '',
        'pos'       => 0.17,
    ),
    array(
        'year'      => '1993–94',
        'yearStart' => 1993,
        'title'     => 'Back together — Le Glace',
        'prose'     => 'Lived in Edmonton until Mom and Brian found a place together in Le Glace, AB. Hamlet small.',
        'image'     => '',
        'pos'       => 0.21,
    ),
    array(
        'year'      => '1994–95',
        'yearStart' => 1994,
        'title'     => 'The Pig Farm',
        'prose'     => 'Moved on to a different farm near Teepee Creek — the Pig Farm.',
        'image'     => '',
        'pos'       => 0.245,
    ),
    array(
        'year'      => '1995–97',
        'yearStart' => 1995,
        'title'     => 'Build, raise, repeat',
        'prose'     => 'Built the Pig Farm out. Cattle, crops, chickens, birds, and quite a few pigs.',
        'image'     => '',
        'pos'       => 0.28,
    ),
    array(
        'year'      => '1997',
        'yearStart' => 1997,
        'title'     => 'Spirit River, briefly',
        'prose'     => 'A few months in Spirit River before finding a farm near Little Smokey.',
        'image'     => '',
        'pos'       => 0.31,
    ),
    array(
        'year'      => '1997–99',
        'yearStart' => 1997,
        'title'     => 'Little Smokey — into the trees',
        'prose'     => 'Boreal forest in every direction. Quiet, layered, alive.',
        'image'     => '',
        'pos'       => 0.345,
    ),
    array(
        'year'      => '1999–2000',
        'yearStart' => 1999,
        'title'     => 'Grande Prairie — college',
        'prose'     => 'Graduated high school. College in Grande Prairie. Campus housing, late nights.',
        'image'     => '',
        'pos'       => 0.39,
    ),
    array(
        'year'      => '2000',
        'yearStart' => 2000,
        'title'     => 'Town of Valleyview',
        'prose'     => 'Worked for the Town of Valleyview. Returned to college dorms after.',
        'image'     => '',
        'pos'       => 0.42,
    ),
    array(
        'year'      => '2000–01',
        'yearStart' => 2000,
        'title'     => 'College + summer pharmacy',
        'prose'     => 'College carried on, summers in pharmacy work.',
        'image'     => '',
        'pos'       => 0.445,
    ),
    array(
        'year'      => '2001–02',
        'yearStart' => 2001,
        'title'     => 'Met Melanie',
        'prose'     => 'Met Mel. Started in a restaurant.',
        'image'     => '',
        'pos'       => 0.47,
    ),
    array(
        'year'      => '2002–03',
        'yearStart' => 2002,
        'title'     => 'Power engineering — Fort Mac',
        'prose'     => 'Power Engineering training in Fort McMurray.',
        'image'     => '',
        'pos'       => 0.50,
    ),
    array(
        'year'      => '2003–05',
        'yearStart' => 2003,
        'title'     => 'Kitchen management',
        'prose'     => 'Climbed into a kitchen-management role.',
        'image'     => '',
        'pos'       => 0.535,
    ),
    array(
        'year'      => '2005–07',
        'yearStart' => 2005,
        'title'     => 'Living with parents — saving',
        'prose'     => 'Back at parents to save money.',
        'image'     => '',
        'pos'       => 0.565,
    ),
    array(
        'year'      => '2007–08',
        'yearStart' => 2007,
        'title'     => 'Move with a friend',
        'prose'     => 'Parents relocated; moved out with a friend.',
        'image'     => '',
        'pos'       => 0.59,
    ),
    array(
        'year'      => '2008–11',
        'yearStart' => 2008,
        'title'     => 'The duplex years',
        'prose'     => 'Shared a duplex with roommates.',
        'image'     => '',
        'pos'       => 0.615,
    ),
    array(
        'year'      => '2010–13',
        'yearStart' => 2010,
        'title'     => 'Journeyman chef',
        'prose'     => 'Completed culinary arts. Earned the journeyman chef ticket.',
        'image'     => '',
        'pos'       => 0.645,
    ),
    array(
        'year'      => '2011–13',
        'yearStart' => 2011,
        'title'     => 'Mel, again',
        'prose'     => 'Reconnected with Mel. Cohabitation began late 2012.',
        'image'     => '',
        'pos'       => 0.665,
    ),
    array(
        'year'      => '2013',
        'yearStart' => 2013,
        'title'     => 'OMG, a baby',
        'prose'     => 'OMG we are having a baby. Quick — get shit together. Bought a house. Stepped up to head chef.',
        'image'     => '',
        'pos'       => 0.69,
    ),
    array(
        'year'      => '2014',
        'yearStart' => 2014,
        'title'     => 'Township 71',
        'prose'     => 'Opened Township 71. Taught culinary courses on the side.',
        'image'     => '',
        'pos'       => 0.71,
        'mark'      => array( 'kind' => 'sign', 'label' => 'Township 71' ),
    ),
    array(
        'year'      => '2014–15',
        'yearStart' => 2014,
        'title'     => 'Township 71 closes',
        'prose'     => 'Nine months in, the oil bust took most of the room. Township 71 closed.',
        'image'     => '',
        'pos'       => 0.735,
    ),
    array(
        'year'      => '2015',
        'yearStart' => 2015,
        'title'     => 'Daniel',
        'prose'     => 'Daniel born. Worked at multiple kitchens as head chef.',
        'image'     => '',
        'pos'       => 0.76,
    ),
    array(
        'year'      => '2017',
        'yearStart' => 2017,
        'title'     => 'Faith',
        'prose'     => 'Faith born. Kitchen work continued — body began to argue.',
        'image'     => '',
        'pos'       => 0.79,
    ),
    array(
        'year'      => '2019',
        'yearStart' => 2019,
        'title'     => 'Permanent disability',
        'prose'     => 'Went on permanent disability support. Chronic, accumulated.',
        'image'     => '',
        'pos'       => 0.825,
    ),
    array(
        'year'      => '2020',
        'yearStart' => 2020,
        'title'     => 'Pandemic',
        'prose'     => 'COVID. Empty streets, masks, the whole thing.',
        'image'     => '',
        'pos'       => 0.86,
    ),
    array(
        'year'      => '2023–24',
        'yearStart' => 2023,
        'title'     => 'Coming back',
        'prose'     => 'Return toward normalcy.',
        'image'     => '',
        'pos'       => 0.93,
    ),
);

get_header(); ?>

<main id="primary" class="site-main timeline-page" data-timeline-root>

    <!-- ==============================================================
         PINNED STAGE — sticks to the viewport while the page scrolls.
         The outer .timeline-page is tall (height controlled in CSS via
         --timeline-length); the inner stage stays put and its layers
         translate horizontally based on scroll progress.
         ============================================================== -->
    <section class="timeline-stage" data-timeline-stage aria-label="Timeline">

        <!-- Sky / atmosphere — slowest, tints across eras. -->
        <div class="timeline-layer timeline-layer--sky" data-layer="sky" aria-hidden="true"></div>

        <!-- Backdrop — mountains, distant skylines, dense forest, the home.
             Era-banded photographic strips, stacked top-to-bottom by
             chronology. Earlier eras sit on top and fade out to reveal
             later ones underneath. The home era uses stitched landscape
             images (forest meeting house) so the transition feels like
             the house emerging from the trees rather than a hard cut. -->
        <div class="timeline-layer timeline-layer--back" data-layer="back" aria-hidden="true">
            <div class="timeline-back-strip timeline-back-strip--forested-house"></div>
            <div class="timeline-back-strip timeline-back-strip--forest"></div>
            <div class="timeline-back-strip timeline-back-strip--prairie"></div>
            <div class="timeline-back-strip timeline-back-strip--foothills"></div>
        </div>

        <!-- Middle band — towns, farms, scattered groups with empty stretches.
             Slides leftward, faster than back, slower than foreground. -->
        <div class="timeline-layer timeline-layer--mid" data-layer="mid" aria-hidden="true"></div>

        <!-- Foreground tufts — closest, fastest, leftward. -->
        <div class="timeline-layer timeline-layer--fore" data-layer="fore" aria-hidden="true"></div>

        <!-- The road. One long SVG path with the curves of life baked in.
             Translates left as scroll advances; markers ride along it.
             The viewBox is wide so the path can wander without clipping. -->
        <svg class="timeline-road" data-road
             viewBox="-4000 0 20000 600"
             preserveAspectRatio="xMinYMax slice"
             aria-hidden="true">
            <defs>
                <!-- Shoulder/edge gradient under the road. -->
                <linearGradient id="tc-road-shadow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"  stop-color="rgba(40,30,20,0)"/>
                    <stop offset="100%" stop-color="rgba(40,30,20,0.45)"/>
                </linearGradient>
            </defs>

            <!-- Lead-in: visual road extension before the first event so
                 the viewport is never half-empty at scroll progress 0.
                 NOT used for marker positioning (events still index along
                 the main #tc-road-path only). -->
            <path d="M -4000 540 L 0 520"
                  fill="none"
                  stroke="#3b2c1a"
                  stroke-width="38"
                  stroke-linecap="round"
                  vector-effect="non-scaling-stroke"/>
            <path d="M -4000 540 L 0 520"
                  fill="none"
                  stroke="rgba(245, 230, 200, 0.55)"
                  stroke-width="2"
                  stroke-dasharray="14 18"
                  stroke-linecap="round"
                  vector-effect="non-scaling-stroke"/>

            <!-- Road body. Tuned by hand to bend at biographical inflections.
                 If you re-tune, also retune the marker positions in CSS via
                 their --pos custom properties. -->
            <path id="tc-road-path" data-road-path
                  d="
                    M 0 520
                    C 400 510, 700 500, 1000 480
                    S 1500 360, 1900 380
                    S 2400 520, 2700 460
                    S 3100 320, 3500 360
                    S 4000 500, 4400 470
                    S 4900 380, 5300 400
                    S 5800 460, 6200 430
                    S 6700 360, 7100 380
                    S 7600 470, 8000 440
                    S 8500 360, 8900 380
                    S 9400 480, 9800 430
                    S 10400 360, 10800 400
                    S 11500 460, 12000 440
                  "
                  fill="none"
                  stroke="#3b2c1a"
                  stroke-width="38"
                  stroke-linecap="round"
                  vector-effect="non-scaling-stroke"/>

            <!-- Center dashed line. -->
            <path d="
                    M 0 520
                    C 400 510, 700 500, 1000 480
                    S 1500 360, 1900 380
                    S 2400 520, 2700 460
                    S 3100 320, 3500 360
                    S 4000 500, 4400 470
                    S 4900 380, 5300 400
                    S 5800 460, 6200 430
                    S 6700 360, 7100 380
                    S 7600 470, 8000 440
                    S 8500 360, 8900 380
                    S 9400 480, 9800 430
                    S 10400 360, 10800 400
                    S 11500 460, 12000 440
                  "
                  fill="none"
                  stroke="rgba(245, 230, 200, 0.55)"
                  stroke-width="2"
                  stroke-dasharray="14 18"
                  stroke-linecap="round"
                  vector-effect="non-scaling-stroke"/>

            <!-- Lead-out: visual road extension past the last event. -->
            <path d="M 12000 440 L 16000 440"
                  fill="none"
                  stroke="#3b2c1a"
                  stroke-width="38"
                  stroke-linecap="round"
                  vector-effect="non-scaling-stroke"/>
            <path d="M 12000 440 L 16000 440"
                  fill="none"
                  stroke="rgba(245, 230, 200, 0.55)"
                  stroke-width="2"
                  stroke-dasharray="14 18"
                  stroke-linecap="round"
                  vector-effect="non-scaling-stroke"/>
        </svg>

        <!-- Easter-egg roadside markers. Positioned along the road via a
             CSS custom property (--pos: 0..1). JS reads --pos and computes
             the matching point on the SVG path each frame. Click → projector
             lightbox. Visually rendered as small placeholder badges until
             Thomas drops in landmark sprites. -->
        <div class="timeline-markers" data-markers>
            <?php
            $marker_idx = 0;
            foreach ( $tc_timeline_events as $event ) :
                if ( empty( $event['mark'] ) ) {
                    continue;
                }
                $kind  = esc_attr( $event['mark']['kind'] );
                $label = esc_html( $event['mark']['label'] ?? '' );
                $pos   = floatval( $event['pos'] );
                $marker_idx++;
            ?>
                <button type="button"
                        class="timeline-marker timeline-marker--<?php echo $kind; ?>"
                        data-marker
                        data-marker-pos="<?php echo esc_attr( $pos ); ?>"
                        aria-label="<?php echo esc_attr( $label ?: 'Roadside marker' ); ?>">
                    <span class="timeline-marker__label" aria-hidden="true"><?php echo $label; ?></span>
                </button>
            <?php endforeach; ?>
        </div>

        <!-- The jeep — pinned center-bottom of the stage. Three windows
             are content surfaces. The jeep image is set as a background on
             .timeline-jeep__shell so the windows can sit absolutely on top
             at known coordinates (tuned in CSS once Thomas's jeep image is
             plugged in). -->
        <div class="timeline-jeep" data-jeep aria-hidden="false">
            <div class="timeline-jeep__shell">
                <!-- Windshield — atmosphere. Currently empty; reserved for
                     "next place" ghost text or weather hint. -->
                <div class="timeline-jeep__windshield" data-jeep-windshield aria-hidden="true"></div>

                <!-- Passenger window — current entry's prose lives here. -->
                <div class="timeline-jeep__passenger" data-jeep-passenger>
                    <span class="timeline-jeep__year" data-jeep-year aria-hidden="true">1980</span>
                    <h2 class="timeline-jeep__title" data-jeep-title>Born — look out, Calgary</h2>
                    <p class="timeline-jeep__prose" data-jeep-prose>Born in Calgary. Look out, Calgary.</p>
                </div>

                <!-- Rear cargo window — image for the current entry. Empty
                     until Thomas drops in per-event imagery. -->
                <div class="timeline-jeep__rear" data-jeep-rear aria-hidden="true"></div>

                <!-- Wheels — CSS-spun by JS per scroll velocity. -->
                <span class="timeline-jeep__wheel timeline-jeep__wheel--front" data-jeep-wheel aria-hidden="true"></span>
                <span class="timeline-jeep__wheel timeline-jeep__wheel--rear"  data-jeep-wheel aria-hidden="true"></span>
            </div>
        </div>

        <!-- "Roll-Out" sign — appears at the road's end (scroll progress ≈ 1).
             Click → home (or, when BHAG ships, returns to topography). -->
        <a class="timeline-rollout" data-rollout href="<?php echo esc_url( home_url( '/' ) ); ?>"
           aria-label="Roll out — return home">
            <img class="timeline-rollout__sign"
                 src="https://lightgoldenrodyellow-dugong-336485.hostingersite.com/wp-content/uploads/2026/04/roll-out.png"
                 alt=""
                 aria-hidden="true" />
        </a>

    </section>

    <!-- The vertical-scroll spacer that drives the whole thing. Height set
         in CSS via --timeline-length. The stage above is position: sticky
         within this container. -->
    <div class="timeline-spacer" data-timeline-spacer aria-hidden="true"></div>

    <!-- Embed event data for JS. Server-rendered so JS doesn't have to
         re-parse the DOM to find prose/image/year/pos. -->
    <script type="application/json" data-timeline-data>
    <?php echo wp_json_encode( $tc_timeline_events ); ?>
    </script>

    <!-- ==============================================================
         PROJECTOR LIGHTBOX (closed by default)
         A separate component from the sitewide PhotoSwipe — different
         aesthetic, different chrome. Same nav contract: prev/next/close,
         escape, swipe. JS wires interactions in initTimelinePage().
         ============================================================== -->
    <div class="timeline-projector"
         data-projector
         role="dialog"
         aria-modal="true"
         aria-hidden="true"
         aria-label="Projected memory">
        <div class="timeline-projector__night" aria-hidden="true"></div>
        <div class="timeline-projector__beam" aria-hidden="true"></div>
        <div class="timeline-projector__stage">
            <div class="timeline-projector__jeep" aria-hidden="true"></div>
            <figure class="timeline-projector__screen" data-projector-screen>
                <!-- The image (projector-screen.png) draws the tripod + screen
                     fabric. Everything dynamic — the projected media, caption,
                     flicker — lives inside .__canvas which is positioned to
                     overlap exactly with the white screen region of the image. -->
                <div class="timeline-projector__canvas">
                    <div class="timeline-projector__media" data-projector-media>
                        <!-- Populated by JS: img or video element with aged-film overlay. -->
                    </div>
                    <figcaption class="timeline-projector__caption" data-projector-caption></figcaption>
                    <div class="timeline-projector__flicker" aria-hidden="true"></div>
                </div>
            </figure>
        </div>
        <div class="timeline-projector__chrome">
            <button type="button" class="timeline-projector__nav timeline-projector__nav--prev"
                    data-projector-prev aria-label="Previous">‹</button>
            <span class="timeline-projector__counter" data-projector-counter aria-hidden="true">01 / 01</span>
            <button type="button" class="timeline-projector__nav timeline-projector__nav--next"
                    data-projector-next aria-label="Next">›</button>
            <button type="button" class="timeline-projector__close"
                    data-projector-close aria-label="Close">✕</button>
        </div>
    </div>

    <!-- Mobile fallback list — hidden on desktop, shown under ~768px.
         The parallax stage is hidden in the same media query. Same
         events, plain vertical reading. -->
    <ol class="timeline-mobile-list" aria-label="Timeline (list view)">
        <?php foreach ( $tc_timeline_events as $event ) : ?>
            <li class="timeline-mobile-item">
                <span class="timeline-mobile-item__year"><?php echo esc_html( $event['year'] ); ?></span>
                <h3 class="timeline-mobile-item__title"><?php echo esc_html( $event['title'] ); ?></h3>
                <p class="timeline-mobile-item__prose"><?php echo esc_html( $event['prose'] ); ?></p>
            </li>
        <?php endforeach; ?>
    </ol>

</main>

<?php
/*
 * No get_footer() — the timeline page ends at the Roll-Out sign by design.
 * We still need wp_footer() so plugins, GSAP, ScrollTrigger, Three.js, and
 * main.js boot correctly, plus the closing body/html tags WP would have
 * emitted from footer.php.
 */
wp_footer();
?>
</body>
</html>
