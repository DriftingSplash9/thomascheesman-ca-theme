<?php
/**
 * Page Template: Scrapbook
 *
 * Auto-applied by WordPress to any page whose slug is `scrapbook`.
 * Spec: timeline-build-log/V0.07.md.
 *
 * BUILD STATUS — C3a (flat surface rebuild):
 *
 *   - Scroll-driven 4-keyframe intro (cover → half-open → letter →
 *     open) sets the metaphor: this is a scrapbook, on a desk.
 *   - Slideshow surface is now a FLAT illustrative book — two
 *     cream parchment rectangles centered on the dark wood. The
 *     curved-pages photo (and the page-turn video) was dropped
 *     because flat HTML content didn't read correctly on a curved
 *     surface. We set the "physical book" feel in the intro; the
 *     slideshow stage is the top-down view where content lives.
 *   - Slideshow wrapper opacity fades in over scroll progress
 *     0.78..1.00 (replaces the previous video element).
 *   - Click chevrons drive a spread crossfade. CSS handles the
 *     transitions (spread opacity, photo drop-in, caption fade).
 *   - First event ("Born — Calgary 1980") populated on Spread 1
 *     right page. Subsequent spreads keep placeholder boxes until
 *     events are added in C3b+.
 *
 * Audio (page-turn SFX) is deferred until Thomas provides a
 * standalone .mp3/.wav file (pageturner.mp4 audio extraction
 * blocked locally without ffmpeg). Optional CSS 3D rotateY
 * page-flip is a follow-up if the crossfade feels too tame.
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
        'src' => '/wp-content/uploads/2026/05/table-today.png',
        'alt' => 'Thomas\'s wooden writing desk with small mementos scattered across it.',
    ),
    array(
        'src' => '/wp-content/uploads/2026/05/wide-book.jpg',
        'alt' => 'A leather-bound scrapbook resting on the desk.',
    ),
    array(
        'src' => '/wp-content/uploads/2026/05/tflOf-1.png',
        'alt' => 'A handwritten letter from Thomas to his children, opening the scrapbook.',
    ),
    array(
        'src' => '/wp-content/uploads/2026/05/cropped-book.png',
        'alt' => '',
    ),
);

/**
 * Scrapbook events — the actual content that mounts onto each
 * spread's right page. Pulled from the parked /passport build
 * (all image URLs re-verified 2026-05-06). One photo per event;
 * multi-image events from the passport pick the most representative
 * shot for now.
 */
$tc_scrapbook_events = array(
    array( 'year' => '1980',         'place' => 'Calgary',                     'title' => 'Born',                                'note' => 'Look out, Calgary.',
        'image' => '/wp-content/uploads/2026/04/a-baby-thomas-scaled.jpg' ),
    array( 'year' => '1982',         'place' => 'Turner Valley',               'title' => 'Laundry day',                         'note' => 'I tried — but a nap was in order.',
        'image' => '/wp-content/uploads/2026/05/Life-is-hard-already-scaled.png' ),
    array( 'year' => '1982',         'place' => 'Turner Valley',               'title' => 'Auntie',                              'note' => 'Christopher and I crawling on Auntie Eleanor.',
        'image' => '/wp-content/uploads/2026/05/keg-2002-1.jpg' ),
    array( 'year' => '1982',         'place' => 'Calgary',                     'title' => 'Mom napping',                         'note' => 'Mom was trying to nap. I wasn\'t letting her.',
        'image' => '/wp-content/uploads/2026/05/me-and-mom-calgary.jpg' ),
    array( 'year' => '1982',         'place' => 'Calgary',                     'title' => 'With Father and Chris',               'note' => 'Father, Thomas, and Christopher.',
        'image' => '/wp-content/uploads/2026/05/father-and-2yr-old-me.jpg' ),
    array( 'year' => '1983',         'place' => 'Calgary',                     'title' => 'Granny visits',                       'note' => 'Always glad to help, even then.',
        'image' => '/wp-content/uploads/2026/05/Granny-Docherty.jpg' ),
    array( 'year' => '1984',         'place' => 'Turner Valley',               'title' => 'Out of the city',                     'note' => 'Six years in the foothills — mountains close, oil derricks scattered through the trees.',
        'image' => '/wp-content/uploads/2026/04/derrik-turnervalley.jpg' ),
    array( 'year' => '1985',         'place' => 'Turner Valley',               'title' => 'Diagnosed — Hajdu-Cheney',            'note' => 'A bump in the road, before the road had even straightened out.',
        'image' => '/wp-content/uploads/2026/04/hands-and-xray-scaled.png' ),
    array( 'year' => '1986',         'place' => 'Turner Valley',               'title' => 'Kindergarten class photo',            'note' => 'Class of 1986/87.',
        'image' => '/wp-content/uploads/2026/05/my-kindergarten-class.png' ),
    array( 'year' => '1986',         'place' => 'Turner Valley',               'title' => 'Learning to skate',                   'note' => 'One of my first memories. Forward was OK; turning and stopping were horrible. My ankles had limits other kids didn\'t. I just did things my way.',
        'image' => '/wp-content/uploads/2026/05/me-skating-in-turner-valley.png' ),
    array( 'year' => '1986',         'place' => 'Turner Valley',               'title' => 'In the sun with Grandma Lakeman',     'note' => 'I can tell it\'s Turner Valley by the fence — I remember that fence well.',
        'image' => '/wp-content/uploads/2026/05/gramma-lakeman-in-turner-valley.jpg' ),
    array( 'year' => '1988',         'place' => 'Turner Valley',               'title' => '8th birthday',                        'note' => 'Happy birthday, Thomas.',
        'image' => '/wp-content/uploads/2026/05/my-birthday-8th-I-think-scaled.png' ),
    array( 'year' => '1989',         'place' => 'Turner Valley',               'title' => 'Don\'t mess with my family',          'note' => 'Mom won competitions for being the strongest in her weight class.',
        'image' => '/wp-content/uploads/2026/05/mom-competing.jpg' ),
    array( 'year' => '1990-91',      'place' => 'Teepee Creek',                'title' => 'The Big Migration North',             'note' => 'A long drive north — open prairie, distant trees, a different kind of quiet.',
        'image' => '/wp-content/uploads/2026/04/vicious-geese-scaled-e1777693090234.jpg' ),
    array( 'year' => '1990',         'place' => 'Teepee Creek',                'title' => 'The double wedding',                  'note' => 'Brian and Dave proposed around the same time. They had a double wedding.',
        'image' => '/wp-content/uploads/2026/05/mom-and-brians-wedding-day.jpg' ),
    array( 'year' => '1991-93',      'place' => 'Edmonton',                    'title' => 'First city',                          'note' => 'Mom remarried; a year later, a break. First time living in a real city.',
        'image' => '/wp-content/uploads/2026/04/edmonton-skyline.jpg' ),
    array( 'year' => '1993-94',      'place' => 'LaGlace',                     'title' => 'Back together',                       'note' => 'Mom and Brian found a place together. Hamlet small.',
        'image' => '/wp-content/uploads/2026/05/laglace.png' ),
    array( 'year' => '1994-97',      'place' => 'Teepee Creek / Sexsmith',     'title' => 'A farm, a barn, and corrals',         'note' => 'Three years building it out. Cattle, chickens, and pigs.',
        'image' => '/wp-content/uploads/2026/05/farm-teepee-Creek-.png' ),
    array( 'year' => '1997-99',      'place' => 'Little Smokey',               'title' => 'Into the trees',                      'note' => 'Boreal forest in every direction. Quiet, layered, alive.',
        'image' => '/wp-content/uploads/2026/05/little-smoky.jpg' ),
    array( 'year' => 'Summer 1999',  'place' => 'Valleyview',                  'title' => 'Graduated high school',               'note' => 'Hillside Jr/Sr High.',
        'image' => '/wp-content/uploads/2026/05/graduation.png' ),
    array( 'year' => 'Fall 1999',    'place' => 'Grande Prairie',              'title' => 'College — Swan City',                 'note' => 'Graduated. Campus housing, late nights. Welcome to Swan City.',
        'image' => '/wp-content/uploads/2026/04/Grande_Prairie_Regional_College_02-scaled.jpg' ),
    array( 'year' => 'Summer 2000',  'place' => 'Valleyview',                  'title' => 'Pharmacy',                            'note' => 'Summer at the local Rexall.',
        'image' => '/wp-content/uploads/2026/05/rexall-pharmacy.png' ),
    array( 'year' => '2001',         'place' => 'Grande Prairie',              'title' => 'Chef Darrel Johanson',                'note' => 'I owe a lot of my culinary education to this man — the great Chef Darrel.',
        'image' => '/wp-content/uploads/2026/05/Chef-Darrel-the-Great-Johanson.png' ),
    array( 'year' => '2001',         'place' => 'Grande Prairie',              'title' => 'Met Melanie',                         'note' => 'Started in a restaurant.',
        'image' => '/wp-content/uploads/2026/04/mel-18-yrs-old-scaled-e1777577734243.jpg' ),
    array( 'year' => 'Winter 2002',  'place' => 'Grande Prairie',              'title' => 'The Keg — part-time',                 'note' => 'Part-time while finishing college.',
        'image' => '/wp-content/uploads/2026/05/young-and-reflective.png' ),
    array( 'year' => '2002-03',      'place' => 'Grande Prairie',              'title' => 'Power Engineering — final year',      'note' => 'The technical career path.',
        'image' => '/wp-content/uploads/2026/05/Grande_Prairie_Regional_College_02.jpg' ),
    array( 'year' => 'Winter 2003',  'place' => 'Fort McMurray',               'title' => 'Petro-Canada SAGD practicum',         'note' => 'One month at the SAGD plant. Wish I had pictures.',
        'image' => '/wp-content/uploads/2026/04/sagd-ft-mac.jpg' ),
    array( 'year' => '2003',         'place' => 'Grande Prairie',              'title' => 'HCS sidelines, kitchen calls',        'note' => 'Insurance won\'t cover power engineers with HCS. The Keg promoted me to Asst Kitchen Manager that fall. Cooking it is.',
        'image' => '/wp-content/uploads/2026/05/young-and-reflective.png' ),
    array( 'year' => '2003-13',      'place' => 'The Keg',                     'title' => 'Getting a Groove On',                 'note' => 'Twelve years grinding through Keg kitchens — line cook to senior, paying off student loans, building the chops.',
        'image' => '/wp-content/uploads/2026/04/chef-presentation.jpg' ),
    array( 'year' => '2006',         'place' => 'Grande Prairie',              'title' => 'Family united again',                 'note' => 'Mom and Dad moved up to GP. Chris came up from Vancouver. Dave, Shannon, Marlee, Kristina, and Clarisa visited. What a reunion.',
        'image' => '/wp-content/uploads/2026/05/gp-with-family.jpg' ),
    array( 'year' => '2007',         'place' => 'Calgary',                     'title' => 'Visiting Father',                     'note' => 'JP, Chris, and Thomas — goofing around as usual.',
        'image' => '/wp-content/uploads/2026/05/me-and-the-boys.jpg' ),
    array( 'year' => '2009',         'place' => 'The Keg',                     'title' => 'Movember \'Stache',                   'note' => 'November tradition — chef hat on, mustache up.',
        'image' => '/wp-content/uploads/2026/05/chef-thomas.png' ),
    array( 'year' => '2010',         'place' => 'The Keg',                     'title' => 'Movember \'Stache, year two',         'note' => 'Same tradition, another year.',
        'image' => '/wp-content/uploads/2026/05/Chef-Thomasc-.png' ),
    array( 'year' => '2010-13',      'place' => 'Grande Prairie',              'title' => 'Journeyman chef',                     'note' => 'Earned the journeyman chef ticket.',
        'image' => '/wp-content/uploads/2024/09/me.jpg' ),
    array( 'year' => '2011-13',      'place' => 'The Keg',                     'title' => 'Mel, again',                          'note' => 'Reconnected. Cohabitation began late 2012.',
        'image' => '/wp-content/uploads/2026/04/Hnging-at-the-keg.jpg' ),
    array( 'year' => '2013',         'place' => 'Grande Prairie',              'title' => 'OMG, a baby (Patience)',              'note' => 'Quick — get shit together. Bought a house. Stepped up to head chef.',
        'image' => '/wp-content/uploads/2026/04/newborn-patience.jpg' ),
    array( 'year' => 'Sept 2013',    'place' => 'Grande Prairie',              'title' => 'Rics Grill',                          'note' => 'Started Sept 24 — Patience\'s birthday. Stayed until we shut down to transform into Township 71.',
        'image' => '/wp-content/uploads/2026/05/rics-grill-buffet.jpg' ),
    array( 'year' => 'Nov 2014',     'place' => 'Grande Prairie',              'title' => 'Township 71',                         'note' => 'Opened Township 71. Taught culinary courses on the side.',
        'image' => '/wp-content/uploads/2026/04/t71logo.png' ),
    array( 'year' => '2015',         'place' => 'Grande Prairie',              'title' => 'A new chapter',                       'note' => 'T71 closed in June. First time since childhood without farming or working — new dad, taking time, plan in pocket.',
        'image' => '/wp-content/uploads/2026/05/majors-dad.png' ),
    array( 'year' => 'June 2015',    'place' => 'Grande Prairie',              'title' => 'Daniel',                              'note' => 'Daniel born.',
        'image' => '/wp-content/uploads/2026/04/baby-daniel.jpg' ),
    array( 'year' => '2015',         'place' => 'Grande Prairie',              'title' => 'Grand Parents visiting',              'note' => 'Mom and Brian came to help with the new arrival.',
        'image' => '/wp-content/uploads/2026/04/mom-and-brian.jpg' ),
    array( 'year' => '2015-21',      'place' => 'Major\'s / Tractor Jack\'s',  'title' => 'Long stretch in the kitchen',         'note' => 'Same kitchen, two front-of-house personalities. Anchored 2015-19, then a little here and there to 2021.',
        'image' => '/wp-content/uploads/2026/05/tractor-jacks-logo.png' ),
    array( 'year' => '2016',         'place' => 'Teepee Creek',                'title' => 'The wedding',                         'note' => 'Married in Teepee Creek.',
        'image' => '/wp-content/uploads/2026/05/DSC0256-scaled.jpg' ),
    array( 'year' => '2017',         'place' => 'Grande Prairie',              'title' => 'Faith',                               'note' => 'Faith born. Kitchen work continued — body began to argue.',
        'image' => '/wp-content/uploads/2024/10/20180524_163145-scaled.jpg' ),
    array( 'year' => '2019',         'place' => 'Grande Prairie',              'title' => 'Permanent disability',                'note' => 'Chronic, accumulated.',
        'image' => '/wp-content/uploads/2026/04/foot-recovery.jpg' ),
    array( 'year' => '2020',         'place' => 'Grande Prairie',              'title' => 'Pandemic',                            'note' => 'Empty streets, masks, the whole thing.',
        'image' => '/wp-content/uploads/2026/04/covid-xmas-scaled.jpg' ),
    array( 'year' => '2022',         'place' => 'Grande Prairie',              'title' => 'Spinal fusion',                       'note' => 'Hardware in. A long recovery, and the slow rebuild.',
        'image' => '/wp-content/uploads/2026/04/awake-from-surgery-scaled.jpg' ),
    array( 'year' => '2023-24',      'place' => 'Grande Prairie',              'title' => 'Coming back',                         'note' => 'Return toward normalcy.',
        'image' => '/wp-content/uploads/2026/04/walk-after-surgery-scaled.jpg' ),
    array( 'year' => '2025',         'place' => 'Grande Prairie',              'title' => 'Settled, twice over',                 'note' => 'New roof, furnace, central air, water heater. A 2022 Kia Carnival in the driveway. Patience earned the Award for Excellence again — top of the schoolboard, twice now.',
        'image' => '/wp-content/uploads/2026/04/royal-chariot-scaled.jpg' ),
    array( 'year' => '2026',         'place' => 'Grande Prairie',              'title' => 'Into the ring',                       'note' => 'Daniel started boxing. A couple of months later, Faith laced up too.',
        'image' => '/wp-content/uploads/2026/04/daniel-ready-to-box-scaled.jpg' ),
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
                SLIDESHOW_WINDOW scroll range) so it's invisible
                during the early intro keyframes and fades in as
                the intro completes.

                Z-stacked above the keyframes so the parchment
                surface + spread content render on top of KF4 once
                visible. By that point the user has experienced the
                book photographically through the intro — the flat
                top-down surface reads as "looking at the pages."
            -->
            <div class="scrapbook-slideshow" data-scrapbook-slideshow>

                <!--
                    .scrapbook-book-surface — Thomas's authored
                    photographic stage (an open book on the desk,
                    designed flat top-down so HTML spread content
                    sits on the painted-on pages cleanly). Replaces
                    the earlier CSS parchment since the real photo
                    matches the intro keyframes' visual register.
                -->
                <img
                    class="scrapbook-book-surface"
                    src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/05/cropped-book.png' ) ); ?>"
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                />

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
                     * Spread loop. ONE PAGE AT A TIME — the surface
                     * shows a single open book page (cropped-book.png),
                     * so each "spread" is one event's content centred
                     * on the visible page.
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
                                <span class="scrapbook-spread__placeholder">Page <?php echo $i + 1; ?></span>
                            <?php endif; ?>
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
