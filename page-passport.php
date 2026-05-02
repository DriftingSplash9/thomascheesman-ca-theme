<?php
/**
 * Page Template: Passport
 *
 * Auto-applied by WordPress to any page whose slug is `passport`.
 *
 * The /passport page is Thomas's life rendered as the interior of a
 * well-traveled passport, opened on a wood table. The reader scrolls
 * vertically through stacked spreads (facing pages); each spread holds
 * a few stamps representing eras / locations / jobs / family beats.
 * Stamps are styled in the language of a real passport — circular ink
 * stamps, rectangular postmarks, ticket stubs paperclipped to the
 * page, hand-written margin notes. Photos sit inside the stamp shapes.
 *
 * Visual continuity with the existing footer passport: same
 * passport-bg.png wood-table image, same --pp-* color palette
 * (cream paper, navy + gold cover, dark inks). The footer passport
 * sits at the bottom of this page like the same passport closed up
 * after the reader's been through it.
 *
 * Replaces the parallax-jeep timeline at /timeline (page-timeline.php).
 * The jeep version is preserved at page-timeline-jeep.php as an
 * archive. Possible BHAG revival.
 *
 * BUILD STATUS: Commit 1 of 4 — foundation scaffold. Wood-table
 * background, passport book centered, all 36 events laid out as
 * page text with ONE prototype stamp at top showing the target
 * format. Stamps + spreads come in commit 2.
 */

/**
 * Passport events.
 *
 * Same data as the jeep timeline (titles, prose, dates, photos, place
 * names, employer logos). For commit 1 the array is duplicated here;
 * a future commit will extract to a shared include so both templates
 * (and the eventual BHAG bridge) read from one source.
 */
$tc_passport_events = array(
    array( 'year' => '1980',         'place' => 'Calgary',           'title' => 'Born',                                 'image' => '/wp-content/uploads/2026/04/a-baby-thomas-scaled.jpg',                       'note'  => 'Look out, Calgary.' ),
    array( 'year' => '1984',         'place' => 'Turner Valley',     'title' => 'Out of the city',                      'image' => '/wp-content/uploads/2026/04/derrik-turnervalley.jpg',                        'note'  => 'Six years in the foothills — mountains close, oil derricks scattered through the trees.' ),
    array( 'year' => '1985',         'place' => 'Turner Valley',     'title' => 'Diagnosed — Hajdu-Cheney',             'image' => '/wp-content/uploads/2026/04/hands-and-xray-scaled.png',                      'note'  => 'A bump in the road, before the road had even straightened out.' ),
    array( 'year' => '1990–91',      'place' => 'Teepee Creek',      'title' => 'The Big Migration North',              'image' => '/wp-content/uploads/2026/04/vicious-geese-scaled-e1777693090234.jpg',        'note'  => 'A long drive north — open prairie, distant trees, a different kind of quiet.' ),
    array( 'year' => '1991–93',      'place' => 'Edmonton',          'title' => 'First city',                           'image' => '/wp-content/uploads/2026/04/edmonton-skyline.jpg',                           'note'  => 'Mom remarried; a year later, a break. First time living in a real city.' ),
    array( 'year' => '1993–94',      'place' => 'LaGlace',           'title' => 'Back together',                        'image' => '/wp-content/uploads/2026/05/laglace.png',                                    'note'  => 'Mom and Brian found a place together. Hamlet small.' ),
    array( 'year' => '1994–97',      'place' => 'Teepee Creek',      'title' => 'Building the Pig Farm',                'image' => '/wp-content/uploads/2026/05/farm-teepee-e1777693689505.png',                 'note'  => 'Three years building it out. Cattle, crops, chickens, birds, and quite a few pigs.' ),
    array( 'year' => '1997',         'place' => 'Spirit River',      'title' => 'Briefly',                              'image' => '',                                                                            'note'  => 'A month, then on to Little Smokey.' ),
    array( 'year' => '1997–99',      'place' => 'Little Smokey',     'title' => 'Into the trees',                       'image' => '/wp-content/uploads/2026/05/little-smoky.jpg',                               'note'  => 'Boreal forest in every direction. Quiet, layered, alive.' ),
    array( 'year' => 'Summer 1999',  'place' => 'Valleyview',        'title' => 'Horizon — server',                     'image' => '',                                                                            'note'  => 'Serving alongside Mom, brother Christopher, Uncle Dave (Brian\'s brother).' ),
    array( 'year' => 'Fall 1999',    'place' => 'Grande Prairie',    'title' => 'College',                              'image' => '/wp-content/uploads/2026/04/Grande_Prairie_Regional_College_02-scaled.jpg', 'note'  => 'Graduated. Campus housing, late nights.' ),
    array( 'year' => 'Summer 2000',  'place' => 'Valleyview',        'title' => 'Pharmacy',                             'image' => '/wp-content/uploads/2026/05/rexall-pharmacy.png',                            'note'  => 'Summer at the local Rexall.' ),
    array( 'year' => 'Summer 2001',  'place' => 'Valleyview',        'title' => 'Town crew',                            'image' => '',                                                                            'note'  => 'Worked for the Town of Valleyview.' ),
    array( 'year' => 'Winter 2002',  'place' => 'Grande Prairie',    'title' => 'The Keg — part-time',                  'image' => '',                                                                            'note'  => 'Part-time while finishing college.' ),
    array( 'year' => '2002',         'place' => 'Grande Prairie',    'title' => 'Met Melanie',                          'image' => '/wp-content/uploads/2026/04/mel-18-yrs-old-scaled-e1777577734243.jpg',      'note'  => 'Started in a restaurant.' ),
    array( 'year' => '2002–03',      'place' => 'Grande Prairie',    'title' => 'Power Engineering — final year',       'image' => '/wp-content/uploads/2026/05/Grande_Prairie_Regional_College_02.jpg',        'note'  => 'The technical career path.' ),
    array( 'year' => 'Winter 2003',  'place' => 'Fort McMurray',     'title' => 'Petro-Canada SAGD practicum',          'image' => '/wp-content/uploads/2026/04/sagd-ft-mac.jpg',                                'note'  => 'One month at the SAGD plant. Wish I had pictures.' ),
    array( 'year' => '2003',         'place' => 'Grande Prairie',    'title' => 'HCS sidelines, kitchen calls',         'image' => '/wp-content/uploads/2026/05/young-and-reflective.png',                       'note'  => 'Insurance won\'t cover power engineers with HCS. The Keg promoted me to Asst Kitchen Manager that fall. Cooking it is.' ),
    array( 'year' => '2003–13',      'place' => 'The Keg',           'title' => 'Getting a Groove On',                  'image' => '/wp-content/uploads/2026/04/chef-presentation.jpg',                          'note'  => 'Twelve years grinding through Keg kitchens — line cook to senior, paying off student loans, building the chops.' ),
    array( 'year' => '2009',         'place' => 'The Keg',           'title' => 'Movember \'Stache',                    'image' => '/wp-content/uploads/2026/05/chef-thomas.png',                                'note'  => 'November tradition — chef hat on, mustache up.' ),
    array( 'year' => '2010–13',      'place' => 'Grande Prairie',    'title' => 'Journeyman chef',                      'image' => '/wp-content/uploads/2024/09/me.jpg',                                         'note'  => 'Earned the journeyman chef ticket.' ),
    array( 'year' => '2011–13',      'place' => 'The Keg',           'title' => 'Mel, again',                           'image' => '/wp-content/uploads/2026/04/Hnging-at-the-keg.jpg',                          'note'  => 'Reconnected. Cohabitation began late 2012.' ),
    array( 'year' => '2013',         'place' => 'Grande Prairie',    'title' => 'OMG, a baby (Patience)',               'image' => '/wp-content/uploads/2026/04/newborn-patience.jpg',                           'note'  => 'Quick — get shit together. Bought a house. Stepped up to head chef.' ),
    array( 'year' => 'Sept 2013',    'place' => 'Grande Prairie',    'title' => 'Rics Grill',                           'image' => '/wp-content/uploads/2026/05/rics-grill-buffet.jpg',                          'note'  => 'Started Sept 24 — Patience\'s birthday. Stayed until we shut down to transform into Township 71.' ),
    array( 'year' => 'Nov 2014',     'place' => 'Grande Prairie',    'title' => 'Township 71',                          'image' => '/wp-content/uploads/2026/04/t71logo.png',                                    'note'  => 'Opened Township 71. Taught culinary courses on the side.' ),
    array( 'year' => '2015',         'place' => 'Grande Prairie',    'title' => 'A new chapter',                        'image' => '/wp-content/uploads/2026/05/majors-dad.png',                                 'note'  => 'T71 closed in June. First time since childhood without farming or working — new dad, taking time, plan in pocket. (Photo: Major\'s, second-time dad.)' ),
    array( 'year' => 'June 2015',    'place' => 'Grande Prairie',    'title' => 'Daniel',                               'image' => '/wp-content/uploads/2026/04/baby-daniel.jpg',                                'note'  => 'Daniel born.' ),
    array( 'year' => '2015',         'place' => 'Grande Prairie',    'title' => 'Grand Parents visiting',               'image' => '/wp-content/uploads/2026/04/mom-and-brian.jpg',                              'note'  => 'Mom and Brian came to help with the new arrival.' ),
    array( 'year' => '2015–21',      'place' => 'Major\'s / Tractor Jack\'s', 'title' => 'Long stretch in the kitchen', 'image' => '/wp-content/uploads/2026/05/tractor-jacks-logo.png',                         'note'  => 'Same kitchen, two front-of-house personalities. Anchored 2015–19, then a little here and there to 2021.' ),
    array( 'year' => '2017',         'place' => 'Grande Prairie',    'title' => 'Faith',                                'image' => '/wp-content/uploads/2024/10/20180524_163145-scaled.jpg',                     'note'  => 'Faith born. Kitchen work continued — body began to argue.' ),
    array( 'year' => '2019',         'place' => 'Grande Prairie',    'title' => 'Permanent disability',                 'image' => '/wp-content/uploads/2026/04/foot-recovery.jpg',                              'note'  => 'Chronic, accumulated.' ),
    array( 'year' => '2020',         'place' => 'Grande Prairie',    'title' => 'Pandemic',                             'image' => '/wp-content/uploads/2026/04/covid-xmas-scaled.jpg',                          'note'  => 'Empty streets, masks, the whole thing.' ),
    array( 'year' => '2022',         'place' => 'Grande Prairie',    'title' => 'Spinal fusion',                        'image' => '/wp-content/uploads/2026/04/awake-from-surgery-scaled.jpg',                  'note'  => 'Hardware in. A long recovery, and the slow rebuild.' ),
    array( 'year' => '2023–24',      'place' => 'Grande Prairie',    'title' => 'Coming back',                          'image' => '/wp-content/uploads/2026/04/walk-after-surgery-scaled.jpg',                  'note'  => 'Return toward normalcy.' ),
    array( 'year' => '2025',         'place' => 'Grande Prairie',    'title' => 'Settled, twice over',                  'image' => '/wp-content/uploads/2026/04/royal-chariot-scaled.jpg',                       'note'  => 'New roof, furnace, central air, water heater. A 2022 Kia Carnival in the driveway. Patience earned the Award for Excellence again — top of the schoolboard, twice now.' ),
    array( 'year' => '2026',         'place' => 'Grande Prairie',    'title' => 'Into the ring',                        'image' => '/wp-content/uploads/2026/04/daniel-ready-to-box-scaled.jpg',                 'note'  => 'Daniel started boxing. A couple of months later, Faith laced up too.' ),
);

get_header(); ?>

<main id="primary" class="site-main passport-page" data-passport-root>

    <!-- Cover / title spread — the front of the passport, before the
         interior pages begin. -->
    <section class="passport-spread passport-spread--cover" aria-label="Passport — title spread">
        <div class="passport-cover">
            <div class="passport-cover__crest" aria-hidden="true">TC</div>
            <div class="passport-cover__country">'VENTURES</div>
            <div class="passport-cover__doc-type">PASSPORT</div>
            <div class="passport-cover__name"><?php echo esc_html( get_the_title() ?: 'Thomas Cheesman' ); ?></div>
            <div class="passport-cover__years">1980 — present</div>
        </div>
    </section>

    <!-- COMMIT 1 PROTOTYPE — single sample stamp showing the target
         visual format. The full set of stamps + spreads ships in
         commit 2. For now, all 36 events are listed below in plain
         text on placeholder pages so the layout reads end-to-end. -->
    <section class="passport-spread" aria-label="Sample stamp">
        <div class="passport-page passport-page--left">
            <div class="passport-page__num">1</div>
            <div class="passport-page__header">Alberta — 1980</div>

            <?php $sample = $tc_passport_events[0]; ?>
            <article class="passport-stamp passport-stamp--circular">
                <?php if ( ! empty( $sample['image'] ) ) : ?>
                    <img class="passport-stamp__photo" src="<?php echo esc_url( $sample['image'] ); ?>" alt="" loading="lazy" />
                <?php endif; ?>
                <div class="passport-stamp__ring">
                    <span class="passport-stamp__place"><?php echo esc_html( $sample['place'] ); ?></span>
                    <span class="passport-stamp__year"><?php echo esc_html( $sample['year'] ); ?></span>
                </div>
                <div class="passport-stamp__title"><?php echo esc_html( $sample['title'] ); ?></div>
            </article>

            <p class="passport-page__note">
                <?php echo esc_html( $sample['note'] ); ?>
            </p>
        </div>

        <div class="passport-page passport-page--right">
            <div class="passport-page__num">2</div>
            <div class="passport-page__header">Sample stamp · prototype</div>
            <p class="passport-page__note passport-page__note--muted">
                The circular stamp on the facing page is a prototype for the
                stamp format the rest of the timeline will use. Photo inside
                a ringed border, place + year on the ring, title and note
                below. The full set of stamps lands in the next commit.
            </p>
        </div>
    </section>

    <!-- COMMIT 1 PLACEHOLDER — every event in the array rendered as
         a plain page-text item so the layout's height and pacing are
         legible end-to-end. Each becomes a real stamp in commit 2. -->
    <section class="passport-spread passport-spread--placeholder" aria-label="All events (commit 1 placeholder)">
        <div class="passport-page passport-page--full">
            <div class="passport-page__header">All entries — commit 1 placeholder</div>
            <ol class="passport-placeholder-list">
                <?php foreach ( $tc_passport_events as $idx => $e ) : ?>
                    <li class="passport-placeholder-list__item">
                        <span class="passport-placeholder-list__year"><?php echo esc_html( $e['year'] ); ?></span>
                        <span class="passport-placeholder-list__place"><?php echo esc_html( $e['place'] ); ?></span>
                        <span class="passport-placeholder-list__title"><?php echo esc_html( $e['title'] ); ?></span>
                    </li>
                <?php endforeach; ?>
            </ol>
        </div>
    </section>

</main>

<?php get_footer(); ?>
