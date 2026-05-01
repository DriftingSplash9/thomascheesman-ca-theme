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
 *   - image        URL or empty (drives the polaroid for this event)
 *   - pos          0..1 along the road
 *   - bearing      optional — degrees (0=N, 90=E) Thomas was heading FROM
 *                  the previous event's location TO this one. Stationary
 *                  events omit it and JS inherits the previous value.
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
        'image'     => '/wp-content/uploads/2026/04/a-baby-thomas-scaled.jpg',
        'pos'       => 0.02,
    ),
    array(
        'year'      => '1984',
        'yearStart' => 1984,
        'title'     => 'Headed to Turner Valley',
        'prose'     => 'Out of the city and into the foothills. Six years lived in Turner Valley — mountains close, oil derricks scattered through the trees.',
        'image'     => '/wp-content/uploads/2026/04/derrik-turnervalley.jpg',
        'pos'       => 0.06,
        'bearing'   => 205,  // Calgary → Turner Valley (SSW)
        'mark'      => array(
            'kind'   => 'highway',
            'label'  => 'Turner Valley',
            'text'   => 'Turner Valley 1km',
            'image'  => '/wp-content/uploads/2026/04/turner-valley.jpg',
            'offset' => 60,  // px raised above the default windshield height
        ),
    ),
    array(
        'year'      => '1985',
        'yearStart' => 1985,
        'title'     => 'Diagnosed with Hajdu-Cheney',
        'prose'     => 'A bump in the road, before the road had even straightened out. The diagnosis arrived inside the first year in Turner Valley. Life kept moving.',
        'image'     => '/wp-content/uploads/2026/04/hands-and-xray-scaled.png',
        'pos'       => 0.085,
        // mark removed V0.04 — pothole sprite was a bad image. The HCS
        // beat is still narrated via the polaroid + prose; doesn't need
        // a roadside marker. If revisited, source a cleaner pothole asset.
        'prop'      => array(
            'image' => '/wp-content/uploads/2026/04/1777567236118-52-kodak-projector.png',
        ),
    ),
    array(
        'year'      => '1990–91',
        'yearStart' => 1990,
        'title'     => 'Parents divorce — Teepee Creek',
        'prose'     => 'Parents divorced. Moved to Teepee Creek, AB — to the Bird Farm. Open prairie, distant trees, a different kind of quiet.',
        'image'     => '',
        'pos'       => 0.13,
        'bearing'   => 330,  // Turner Valley → Teepee Creek (NNW, big jump)
        'mark'      => array(
            'kind'  => 'highway',
            'label' => 'Teepee Creek',
            'text'  => 'Teepee Creek 1km',
            'image' => '/wp-content/uploads/2026/04/teepee-creek-scaled.jpg',
        ),
        'prop'      => array(
            'image' => '/wp-content/uploads/2026/04/1777567236118-142-telephone.png',
        ),
    ),
    array(
        'year'      => '1991–93',
        'yearStart' => 1991,
        'title'     => 'Edmonton interlude',
        'prose'     => 'Mom remarried. A year later she took a break from it and we moved to Edmonton. First time living in a real city.',
        'image'     => '/wp-content/uploads/2026/04/edmonton-skyline.jpg',
        'pos'       => 0.17,
        'bearing'   => 155,  // Teepee Creek → Edmonton (SSE)
        'prop'      => array(
            'image' => '/wp-content/uploads/2026/04/1777567236118-332-boom-box.png',
        ),
    ),
    array(
        'year'      => '1993–94',
        'yearStart' => 1993,
        'title'     => 'Back together — LaGlace',
        'prose'     => 'Lived in Edmonton until Mom and Brian found a place together in LaGlace, AB. Hamlet small.',
        // mom-and-brian.jpg moved to the 2015 'Grand Parents visiting'
        // event — that photo is actually from Daniel's birth, not LaGlace.
        'image'     => '',
        'pos'       => 0.21,
        'bearing'   => 310,  // Edmonton → LaGlace (NW)
        'mark'      => array(
            'kind'  => 'highway',
            'label' => 'LaGlace',
            'text'  => 'LaGlace 5km',
            // No place-photo available; highway sign renders text-only
            // (the photo slot is conditional on mark.image).
        ),
    ),
    array(
        'year'      => '1994–95',
        'yearStart' => 1994,
        'title'     => 'The Pig Farm',
        'prose'     => 'Moved on to a different farm near Teepee Creek — the Pig Farm.',
        'image'     => '',
        'pos'       => 0.245,
        'bearing'   => 50,   // Le Glace → Teepee Creek (NE)
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
        'bearing'   => 350,  // Pig Farm (Teepee Creek) → Spirit River (~N)
        // Spirit River sign marker removed — Thomas decided the sign asset
        // wasn't earning its place. Event itself stays; prose narrates the
        // brief stop without a roadside marker.
    ),
    array(
        'year'      => '1997–99',
        'yearStart' => 1997,
        'title'     => 'Little Smokey — into the trees',
        'prose'     => 'Boreal forest in every direction. Quiet, layered, alive.',
        'image'     => '',
        'pos'       => 0.345,
        'bearing'   => 135,  // Spirit River → Little Smoky (SE)
        'prop'      => array(
            'image' => '/wp-content/uploads/2026/04/cabin.png',
        ),
    ),
    array(
        'year'      => '1999–2000',
        'yearStart' => 1999,
        'title'     => 'Grande Prairie — college',
        'prose'     => 'Graduated high school. College in Grande Prairie. Campus housing, late nights.',
        'image'     => '/wp-content/uploads/2026/04/Grande_Prairie_Regional_College_02-scaled.jpg',
        'pos'       => 0.39,
        'bearing'   => 315,  // Little Smoky → Grande Prairie (NW)
    ),
    array(
        'year'      => '2000',
        'yearStart' => 2000,
        'title'     => 'Town of Valleyview',
        'prose'     => 'Worked for the Town of Valleyview. Returned to college dorms after.',
        'image'     => '',
        'pos'       => 0.42,
        'bearing'   => 110,  // GP → Valleyview (ESE)
        'prop'      => array(
            'image' => '/wp-content/uploads/2026/04/1777567236118-164-diner-sign.png',
        ),
    ),
    array(
        'year'      => '2000–01',
        'yearStart' => 2000,
        'title'     => 'College + summer pharmacy',
        'prose'     => 'College carried on, summers in pharmacy work.',
        'image'     => '',
        'pos'       => 0.445,
        'bearing'   => 290,  // Valleyview → GP (WNW)
    ),
    array(
        'year'      => '2001–02',
        'yearStart' => 2001,
        'title'     => 'Met Melanie',
        'prose'     => 'Met Mel. Started in a restaurant.',
        'image'     => '/wp-content/uploads/2026/04/mel-18-yrs-old-scaled-e1777577734243.jpg',
        'pos'       => 0.47,
    ),
    array(
        'year'      => '2002–03',
        'yearStart' => 2002,
        'title'     => 'Power engineering — Fort Mac',
        'prose'     => 'Power Engineering training in Fort McMurray.',
        'image'     => '/wp-content/uploads/2026/04/sagd-ft-mac.jpg',
        'pos'       => 0.50,
        'prop'      => array(
            'image' => '/wp-content/uploads/2026/04/1777567236118-247-Winnebago-.png',
        ),
        'bearing'   => 50,   // GP → Fort McMurray (NE, big jump)
    ),
    array(
        'year'      => '2003–05',
        'yearStart' => 2003,
        'title'     => 'Kitchen management',
        'prose'     => 'Climbed into a kitchen-management role.',
        'image'     => '/wp-content/uploads/2026/04/chef-presentation.jpg',
        'pos'       => 0.535,
        'bearing'   => 230,  // Fort McMurray → GP region (SW, return)
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
        'image'     => '/wp-content/uploads/2024/09/me.jpg',
        'pos'       => 0.645,
    ),
    array(
        'year'          => '2011–13',
        'yearStart'     => 2011,
        'title'         => 'Mel, again',
        'prose'         => 'Reconnected with Mel. Cohabitation began late 2012.',
        'image'         => '/wp-content/uploads/2026/04/Hnging-at-the-keg.jpg',
        'polaroid_title'=> 'Relaxing after a hard day\'s work',
        'pos'           => 0.665,
    ),
    array(
        'year'      => '2013',
        'yearStart' => 2013,
        'title'     => 'OMG, a baby',
        'prose'     => 'OMG we are having a baby. Quick — get shit together. Bought a house. Stepped up to head chef.',
        'image'     => '/wp-content/uploads/2026/04/newborn-patience.jpg',
        'pos'       => 0.69,
    ),
    array(
        'year'      => '2014',
        'yearStart' => 2014,
        'title'     => 'Township 71',
        'prose'     => 'Opened Township 71. Taught culinary courses on the side.',
        'image'     => '/wp-content/uploads/2026/04/t71logo.png',
        'pos'       => 0.71,
        'mark'      => array(
            'kind'  => 'highway',
            'label' => 'Township 71',
            'text'  => 'Township 71 1km',
            'image' => '/wp-content/uploads/2026/04/t71logo.png',
        ),
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
        'image'     => '/wp-content/uploads/2026/04/baby-daniel.jpg',
        'pos'       => 0.76,
    ),
    array(
        'year'      => '2015',
        'yearStart' => 2015,
        'title'     => 'Grand Parents visiting to help out',
        'prose'     => 'Mom and Brian came to help with the new arrival.',
        'image'     => '/wp-content/uploads/2026/04/mom-and-brian.jpg',
        'pos'       => 0.765,
    ),
    array(
        'year'      => '2015–21',
        'yearStart' => 2015,
        'title'     => 'Major\'s / Tractor Jack\'s',
        'prose'     => 'Long stretch in the kitchen at Major\'s Homestyle and Tractor Jack\'s — same kitchen, two front-of-house personalities (diner + bar). Anchored 2015–19, then a little here and there to 2021.',
        'image'     => '/wp-content/uploads/2026/04/helper-at-majors-scaled.jpg',
        'pos'       => 0.775,
        'mark'      => array(
            'kind'   => 'highway',
            'label'  => 'Major\'s / Tractor Jack\'s',
            'text'   => 'Major\'s 1km',
            'image'  => '/wp-content/uploads/2026/04/helper-at-majors-scaled.jpg',
            'offset' => 120,  // raised so it doesn't stack on Township 71 at pos 0.71
        ),
    ),
    array(
        'year'      => '2017',
        'yearStart' => 2017,
        'title'     => 'Faith',
        'prose'     => 'Faith born. Kitchen work continued — body began to argue.',
        'image'     => '/wp-content/uploads/2024/10/20180524_163145-scaled.jpg',
        'pos'       => 0.79,
    ),
    array(
        'year'      => '2019',
        'yearStart' => 2019,
        'title'     => 'Permanent disability',
        'prose'     => 'Went on permanent disability support. Chronic, accumulated.',
        'image'     => '/wp-content/uploads/2026/04/foot-recovery.jpg',
        'pos'       => 0.81,
    ),
    array(
        'year'      => '2020',
        'yearStart' => 2020,
        'title'     => 'Pandemic',
        'prose'     => 'COVID. Empty streets, masks, the whole thing.',
        'image'     => '/wp-content/uploads/2026/04/covid-xmas-scaled.jpg',
        'pos'       => 0.84,
    ),
    array(
        'year'      => '2022',
        'yearStart' => 2022,
        'title'     => 'Spinal fusion',
        'prose'     => 'Spinal fusion surgery. Hardware in. A long recovery, and the slow rebuild from there.',
        'image'     => '/wp-content/uploads/2026/04/awake-from-surgery-scaled.jpg',
        'pos'       => 0.87,
    ),
    array(
        'year'      => '2023–24',
        'yearStart' => 2023,
        'title'     => 'Coming back',
        'prose'     => 'Return toward normalcy.',
        'image'     => '/wp-content/uploads/2026/04/walk-after-surgery-scaled.jpg',
        'pos'       => 0.90,
    ),
    array(
        'year'      => '2025',
        'yearStart' => 2025,
        'title'     => 'Settled, twice over',
        'prose'     => 'New roof, furnace, central air, water heater. A 2022 Kia Carnival in the driveway. Patience earned the Award for Excellence again — top of the schoolboard, twice now.',
        'image'     => '/wp-content/uploads/2026/04/royal-chariot-scaled.jpg',
        'pos'       => 0.93,
    ),
    array(
        'year'      => '2026',
        'yearStart' => 2026,
        'title'     => 'Into the ring',
        'prose'     => 'Daniel started boxing. A couple of months later, Faith laced up too.',
        'image'     => '/wp-content/uploads/2026/04/daniel-ready-to-box-scaled.jpg',
        'pos'       => 0.96,
    ),
);

get_header(); ?>

<!-- Entrance: full-viewport intro the reader scrolls past before the
     parallax stage begins. Sits outside the timeline-page main so it
     doesn't add to the progress-driving height of the parallax. -->
<section class="timeline-intro" aria-label="Introduction">
    <div class="timeline-intro__inner">
        <h1 class="timeline-intro__title">The Long Drive</h1>
        <p class="timeline-intro__sub">Forty-six years, one road. Scroll to drive.</p>
        <span class="timeline-intro__chevron" aria-hidden="true">⌄</span>
    </div>
</section>

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
            <!-- Home photos (highest z, fade in newest-on-top). JS sets
                 per-slide opacity using FINALE_SLIDE_POSITIONS. Night sky
                 fills the gap before 2012 (the move-in year) and tiles
                 around the photos where they don't reach. -->
            <div class="timeline-back-strip timeline-back-strip--house timeline-back-strip--house-2026" data-finale-frame="3"></div>
            <div class="timeline-back-strip timeline-back-strip--house timeline-back-strip--house-2025" data-finale-frame="2"></div>
            <div class="timeline-back-strip timeline-back-strip--house timeline-back-strip--house-2022" data-finale-frame="1"></div>
            <div class="timeline-back-strip timeline-back-strip--house timeline-back-strip--house-2012" data-finale-frame="0"></div>
            <!-- Era backdrops behind the home photos. -->
            <div class="timeline-back-strip timeline-back-strip--foothills"></div>
            <div class="timeline-back-strip timeline-back-strip--prairie"></div>
            <div class="timeline-back-strip timeline-back-strip--forest"></div>
            <div class="timeline-back-strip timeline-back-strip--night-sky"></div>
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
                 Flat-line per V0.04 PARKED decision — the curved on-ramp
                 + jeep-follows-curve combo (V0.19/V0.20) didn't land
                 cleanly enough; Thomas chose to ship straight track and
                 backburner the curve. Don't reactivate without explicit
                 go from Thomas (see V0.04.md PARKED list). -->
            <path d="M -4000 540 L 0 540"
                  fill="none"
                  stroke="#3b2c1a"
                  stroke-width="38"
                  stroke-linecap="round"
                  vector-effect="non-scaling-stroke"/>
            <path d="M -4000 540 L 0 540"
                  fill="none"
                  stroke="rgba(245, 230, 200, 0.55)"
                  stroke-width="2"
                  stroke-dasharray="14 18"
                  stroke-linecap="round"
                  vector-effect="non-scaling-stroke"/>

            <!-- Road body. V0.05+++.4 — simplified to 3 explicit gentle
                 bumps (Q quadratics) with flat sections between. The
                 prior 14-segment chained-S path produced compounding
                 local tangent wildness that read as "the jeep is acting
                 nuts" even with a tilt cap. Three discrete bumps are
                 predictable and match what the reader sees. -->
            <path id="tc-road-path" data-road-path
                  d="
                    M 0 540
                    L 800 540
                    Q 1100 510, 1400 540
                    L 4000 540
                    Q 4400 500, 4800 540
                    L 8000 540
                    Q 8400 510, 8800 540
                    L 12000 540
                  "
                  fill="none"
                  stroke="#3b2c1a"
                  stroke-width="38"
                  stroke-linecap="round"
                  vector-effect="non-scaling-stroke"/>

            <!-- Center dashed line — same simplified path as main road. -->
            <path d="
                    M 0 540
                    L 800 540
                    Q 1100 510, 1400 540
                    L 4000 540
                    Q 4400 500, 4800 540
                    L 8000 540
                    Q 8400 510, 8800 540
                    L 12000 540
                  "
                  fill="none"
                  stroke="rgba(245, 230, 200, 0.55)"
                  stroke-width="2"
                  stroke-dasharray="14 18"
                  stroke-linecap="round"
                  vector-effect="non-scaling-stroke"/>

            <!-- Lead-out: visual road extension past the last event.
                 V0.05 follow-up: y=540 (was 440) for continuity with the
                 now-straight main road. -->
            <path d="M 12000 540 L 16000 540"
                  fill="none"
                  stroke="#3b2c1a"
                  stroke-width="38"
                  stroke-linecap="round"
                  vector-effect="non-scaling-stroke"/>
            <path d="M 12000 540 L 16000 540"
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
                $kind_raw   = $event['mark']['kind'];
                $kind       = esc_attr( $kind_raw );
                $label      = esc_html( $event['mark']['label'] ?? '' );
                $mark_img   = $event['mark']['image'] ?? '';
                $mark_text  = $event['mark']['text'] ?? '';
                $mark_offset = isset( $event['mark']['offset'] )
                    ? floatval( $event['mark']['offset'] )
                    : 0;
                $is_highway = ( $kind_raw === 'highway' );
                $pos        = floatval( $event['pos'] );
                $marker_idx++;
                // Build the class string. Highway markers have their own
                // visual treatment (green sign + text + photo), so they
                // don't get the bare-sprite --image modifier.
                $css_class = 'timeline-marker timeline-marker--' . $kind;
                if ( ! $is_highway && $mark_img ) {
                    $css_class .= ' timeline-marker--image';
                }
            ?>
                <button type="button"
                        class="<?php echo esc_attr( $css_class ); ?>"
                        data-marker
                        data-marker-pos="<?php echo esc_attr( $pos ); ?>"
                        <?php if ( $mark_offset ) : ?>style="--m-offset: <?php echo esc_attr( $mark_offset ); ?>px;"<?php endif; ?>
                        aria-label="<?php echo esc_attr( $label ?: 'Roadside marker' ); ?>">
                    <?php if ( $is_highway ) : ?>
                        <span class="timeline-marker__text"><?php echo esc_html( $mark_text ?: $label ); ?></span>
                        <?php if ( $mark_img ) : ?>
                            <img class="timeline-marker__photo"
                                 src="<?php echo esc_url( $mark_img ); ?>"
                                 alt="" loading="lazy" />
                        <?php endif; ?>
                    <?php elseif ( $mark_img ) : ?>
                        <img class="timeline-marker__sprite"
                             src="<?php echo esc_url( $mark_img ); ?>"
                             alt="" loading="lazy" />
                    <?php else : ?>
                        <span class="timeline-marker__label" aria-hidden="true"><?php echo $label; ?></span>
                    <?php endif; ?>
                </button>
            <?php endforeach; ?>
        </div>

        <!-- Phase 4 props (V0.05++) — era sprite sitting on the ground
             at each event's road position. Stakes/poles abandoned —
             with a straight road, every sprite lives at the exact same
             y-level (road bottom) so they read as roadside objects.
             Small deterministic per-prop rotation (-3..+3 deg) keeps
             them from looking rigidly placed. -->
        <div class="timeline-props" data-props>
            <?php
            $prop_idx = 0;
            foreach ( $tc_timeline_events as $event ) :
                if ( empty( $event['prop'] ) || empty( $event['prop']['image'] ) ) {
                    continue;
                }
                $prop_idx++;
                $prop_pos   = floatval( $event['pos'] );
                $prop_img   = $event['prop']['image'];
                $prop_label = esc_attr( $event['title'] ?? '' );
                $prop_rot   = ( ( $prop_idx * 37 + 11 ) % 7 ) - 3;
            ?>
                <div class="timeline-prop"
                     data-prop
                     data-prop-pos="<?php echo esc_attr( $prop_pos ); ?>"
                     style="--prop-rot: <?php echo esc_attr( $prop_rot ); ?>deg;"
                     aria-hidden="true">
                    <img class="timeline-prop__sprite"
                         src="<?php echo esc_url( $prop_img ); ?>"
                         alt="<?php echo $prop_label; ?>"
                         loading="lazy" />
                </div>
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

                <?php /*
                    PARKED — HEADLIGHT
                    Tried multiple times across V0.04 → V0.08 (radial
                    gradient, two-layer gradient, clip-path cone, apex
                    shifts). Never read as a clean beam — felt blocky
                    or detached from the jeep. Decision was to park and
                    move on. CSS `.timeline-jeep__headlight` block is
                    also commented out in style.css. Re-enable here +
                    there to revisit.
                    <div class="timeline-jeep__headlight" aria-hidden="true"></div>

                    PARKED — WHEEL ROTOR
                    Tried full-shell-sized copies of good-jeep.png with
                    clip-path: circle() at each wheel center, rotated
                    around the wheel pivot, opacity gated to scroll
                    velocity. Visual artifacts (double-exposure during
                    fades, bolt-symmetry mismatch when scrolling stopped)
                    didn't resolve. Parked. CSS `.timeline-jeep__wheel-
                    spin` is commented out in style.css.
                    <span class="timeline-jeep__wheel-spin timeline-jeep__wheel-spin--rear"  aria-hidden="true"></span>
                    <span class="timeline-jeep__wheel-spin timeline-jeep__wheel-spin--front" aria-hidden="true"></span>
                */ ?>
            </div>
        </div>

        <!-- Polaroid field: one per event with an image. Each polaroid
             drops in when scroll passes its trigger (the previous event's
             pos), then drifts leftward off-screen as scroll continues —
             so the album piles up behind us instead of replacing on every
             beat. Random landing position + rotation are baked in
             server-side from the event index so they're stable across
             reloads but feel hand-tossed. -->
        <div class="timeline-polaroid-field" aria-hidden="true">
            <?php
            foreach ( $tc_timeline_events as $idx => $event ) :
                if ( empty( $event['image'] ) ) {
                    continue;
                }
                // Trigger: the prior event's pos (or 0 for the very first).
                $trigger = ( $idx === 0 ) ? 0 : floatval( $tc_timeline_events[ $idx - 1 ]['pos'] );
                // Deterministic randoms from the index so each polaroid
                // lands in the same spot every reload — different from
                // its neighbors, but consistent for the reader.
                // y-range tightened back to keep the polaroid frame fully
                // on-screen — polaroid is ~58vh tall and centered on
                // --polaroid-y, so center < 28vh clips the title slot
                // above the viewport (V0.04 Patience-newborn bug).
                $rot   = ( ( $idx * 73  ) % 17 ) - 8;             // -8 .. +8
                $xVw   = 28 + ( ( $idx * 137 ) % 44 );            // 28 .. 72 vw
                $yVh   = 28 + ( ( $idx * 211 ) % 44 );            // 28 .. 72 vh

                // polaroid_title overrides event['title'] for the polaroid
                // label only — useful when the chosen photo doesn't match
                // the event's narrative title (e.g. "Mel, again" event
                // with a Thomas-relaxing-at-the-keg photo).
                $polaroid_title = ! empty( $event['polaroid_title'] )
                    ? $event['polaroid_title']
                    : ( $event['title'] ?? '' );

                // image_rotate (degrees, e.g. -90, 90, 180) for photos
                // that were uploaded sideways. Applied as a CSS transform
                // on the img inside the polaroid.
                $image_rotate = isset( $event['image_rotate'] )
                    ? (int) $event['image_rotate']
                    : 0;

                // Pull the description from the WP attachment for this
                // image (Media Library → image → Description field).
                // Thomas authors descriptions per-image in WP so they
                // auto-update if he edits them later. Falls back to ''
                // when the URL doesn't resolve to an attachment or the
                // description is blank.
                $description = '';
                $image_url = $event['image'];
                if ( strpos( $image_url, 'http' ) !== 0 ) {
                    $image_url = home_url( $image_url );
                }
                $attachment_id = attachment_url_to_postid( $image_url );
                if ( $attachment_id ) {
                    $description = get_post_field( 'post_content', $attachment_id );
                }
            ?>
                <div class="timeline-polaroid<?php echo $description ? ' timeline-polaroid--has-description' : ''; ?>"
                     data-polaroid-trigger="<?php echo esc_attr( $trigger ); ?>"
                     data-polaroid-x="<?php echo esc_attr( $xVw ); ?>"
                     style="--polaroid-rot: <?php echo esc_attr( $rot ); ?>deg;
                            --polaroid-x: <?php echo esc_attr( $xVw ); ?>vw;
                            --polaroid-y: <?php echo esc_attr( $yVh ); ?>vh;<?php
                            if ( $image_rotate ) {
                                echo ' --img-rotate: ' . esc_attr( $image_rotate ) . 'deg;';
                            }
                            ?>">
                    <span class="timeline-polaroid__title"><?php echo esc_html( $polaroid_title ); ?></span>
                    <img class="timeline-polaroid__img<?php echo $image_rotate ? ' timeline-polaroid__img--rotated' : ''; ?>"
                         src="<?php echo esc_url( $event['image'] ); ?>"
                         alt="" loading="lazy" />
                    <?php if ( $description ) : ?>
                        <span class="timeline-polaroid__description"><?php echo esc_html( $description ); ?></span>
                    <?php endif; ?>
                </div>
            <?php endforeach; ?>
        </div>

        <?php /*
            PARKED V0.04 — prose pill commented out per Thomas's feedback.
            The pill was crowding the polaroids and Thomas wants the bottom
            area free (possibly for menu integration later). The JS that
            updates [data-jeep-passenger]/[data-jeep-year]/[data-jeep-title]/
            [data-jeep-prose] becomes a no-op because each querySelector
            returns null and the if-guards in main.js skip the operations.
            The full prose still lives in the events array (used by the
            mobile fallback list and as JSON for any future uses).
            To revive: remove this PHP comment block.

        <div class="timeline-prose-pill" data-jeep-passenger>
            <span class="timeline-jeep__year" data-jeep-year aria-hidden="true">1980</span>
            <h2 class="timeline-jeep__title" data-jeep-title>Born — look out, Calgary</h2>
            <p class="timeline-jeep__prose" data-jeep-prose>Born in Calgary. Look out, Calgary.</p>
        </div>

        */ ?>

        <!-- "Roll-Out" sign — appears at the road's end (scroll progress ≈ 1).
             Click → home (or, when BHAG ships, returns to topography). -->
        <a class="timeline-rollout" data-rollout href="<?php echo esc_url( home_url( '/' ) ); ?>"
           aria-label="Roll out — return home">
            <img class="timeline-rollout__sign"
                 src="https://lightgoldenrodyellow-dugong-336485.hostingersite.com/wp-content/uploads/2026/04/PixelBin-AI-Image-Editor-1777582716109-1-scaled.png"
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
