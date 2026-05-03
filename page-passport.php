<?php
/**
 * Page Template: Passport
 *
 * Auto-applied by WordPress to any page whose slug is `passport`.
 *
 * The /passport page is Thomas's life rendered as the interior of a
 * well-traveled passport, opened on a wood table. The reader scrolls
 * vertically through stacked spreads (facing pages); each spread holds
 * two events as stamps. Single-image events get a circular ink stamp;
 * multi-image events get a primary circular stamp plus secondary
 * stamps in mixed styles (rectangular postmark, polaroid, ticket stub)
 * — like a real passport page where multiple stamps got crammed in
 * over time.
 *
 * Visual continuity with the existing footer passport: same
 * passport-bg.png wood-table image, same --pp-* color palette
 * (cream paper, navy + gold cover, dark inks).
 *
 * BUILD STATUS: Commit 2 of 4 — real stamps + spread groupings.
 * 50 events laid out across 25 facing-page spreads. Stamp variants
 * implemented (circular / postmark / polaroid / ticket). PhotoSwipe
 * lightbox integration + margin doodles + era headers + view
 * transitions land in commit 3.
 */

/**
 * Passport events — chronological. Each entry:
 *   year   display label (string — supports ranges like "1990-91")
 *   place  short geographic label
 *   title  page heading
 *   note   short prose block
 *   images array of one or more image URLs
 *            - first image renders as the primary circular ink stamp
 *            - subsequent images render as secondary stamps in mixed
 *              styles (postmark, polaroid, ticket) cycling by index
 */
$tc_passport_events = array(
    array( 'year' => '1980',         'place' => 'Calgary',                     'title' => 'Born',                                'note' => 'Look out, Calgary.',
        'images' => array(
            '/wp-content/uploads/2026/04/a-baby-thomas-scaled.jpg',
            '/wp-content/uploads/2026/05/grandpa-lakeman-1.jpg',
        )),
    array( 'year' => '1982',         'place' => 'Turner Valley',               'title' => 'Laundry day',                         'note' => 'I tried — but a nap was in order.',
        'images' => array( '/wp-content/uploads/2026/05/Life-is-hard-already-scaled.png' )),
    array( 'year' => '1982',         'place' => 'Turner Valley',               'title' => 'Auntie',                              'note' => 'Christopher and I crawling on Auntie Eleanor.',
        'images' => array( '/wp-content/uploads/2026/05/keg-2002-1.jpg' )),
    array( 'year' => '1982',         'place' => 'Calgary',                     'title' => 'Mom napping',                         'note' => 'Mom was trying to nap. I wasn\'t letting her.',
        'images' => array( '/wp-content/uploads/2026/05/me-and-mom-calgary.jpg' )),
    array( 'year' => '1982',         'place' => 'Calgary',                     'title' => 'With Father and Chris',               'note' => 'Father, Thomas, and Christopher.',
        'images' => array( '/wp-content/uploads/2026/05/father-and-2yr-old-me.jpg' )),
    array( 'year' => '1983',         'place' => 'Calgary',                     'title' => 'Granny visits',                       'note' => 'Always glad to help, even then.',
        'images' => array( '/wp-content/uploads/2026/05/Granny-Docherty.jpg' )),
    array( 'year' => '1984',         'place' => 'Turner Valley',               'title' => 'Out of the city',                     'note' => 'Six years in the foothills — mountains close, oil derricks scattered through the trees.',
        'images' => array( '/wp-content/uploads/2026/04/derrik-turnervalley.jpg' )),
    array( 'year' => '1985',         'place' => 'Turner Valley',               'title' => 'Diagnosed — Hajdu-Cheney',            'note' => 'A bump in the road, before the road had even straightened out.',
        'images' => array( '/wp-content/uploads/2026/04/hands-and-xray-scaled.png' )),
    array( 'year' => '1986',         'place' => 'Turner Valley',               'title' => 'Kindergarten class photo',            'note' => 'Class of 1986/87.',
        'images' => array( '/wp-content/uploads/2026/05/my-kindergarten-class.png' )),
    array( 'year' => '1986',         'place' => 'Turner Valley',               'title' => 'Learning to skate',                   'note' => 'One of my first memories. Forward was OK; turning and stopping were horrible. My ankles had limits other kids didn\'t. I just did things my way.',
        'images' => array( '/wp-content/uploads/2026/05/me-skating-in-turner-valley.png' )),
    array( 'year' => '1986',         'place' => 'Turner Valley',               'title' => 'In the sun with Grandma Lakeman',     'note' => 'I can tell it\'s Turner Valley by the fence — I remember that fence well.',
        'images' => array( '/wp-content/uploads/2026/05/gramma-lakeman-in-turner-valley.jpg' )),
    array( 'year' => '1988',         'place' => 'Turner Valley',               'title' => '8th birthday',                        'note' => 'Happy birthday, Thomas.',
        'images' => array( '/wp-content/uploads/2026/05/my-birthday-8th-I-think-scaled.png' )),
    array( 'year' => '1980',         'place' => 'Turner Valley',               'title' => 'Don\'t mess with my family',          'note' => 'Mom won competitions for being the strongest in her weight class.',
        'images' => array(
            '/wp-content/uploads/2026/05/mom-competing.jpg',
            '/wp-content/uploads/2026/05/mom-body-built-with-kids-in-turner-valley.jpg',
        )),
    array( 'year' => '1990-91',      'place' => 'Teepee Creek',                'title' => 'The Big Migration North',             'note' => 'A long drive north — open prairie, distant trees, a different kind of quiet.',
        'images' => array(
            '/wp-content/uploads/2026/04/vicious-geese-scaled-e1777693090234.jpg',
            '/wp-content/uploads/2026/05/me-in-teepee-halloween.png',
            '/wp-content/uploads/2026/05/teepee-with-mom.jpg',
        )),
    array( 'year' => '1990',         'place' => 'Teepee Creek',                'title' => 'The double wedding',                  'note' => 'Brian and Dave proposed around the same time. They had a double wedding.',
        'images' => array( '/wp-content/uploads/2026/05/mom-and-brians-wedding-day.jpg' )),
    array( 'year' => '1991-93',      'place' => 'Edmonton',                    'title' => 'First city',                          'note' => 'Mom remarried; a year later, a break. First time living in a real city.',
        'images' => array( '/wp-content/uploads/2026/04/edmonton-skyline.jpg' )),
    array( 'year' => '1993-94',      'place' => 'LaGlace',                     'title' => 'Back together',                       'note' => 'Mom and Brian found a place together. Hamlet small.',
        'images' => array( '/wp-content/uploads/2026/05/laglace.png' )),
    array( 'year' => '1994-97',      'place' => 'Teepee Creek / Sexsmith',     'title' => 'A farm, a barn, and corrals',         'note' => 'Three years building it out. Cattle, chickens, and pigs.',
        'images' => array( '/wp-content/uploads/2026/05/farm-teepee-Creek-.png' )),
    array( 'year' => '1997-99',      'place' => 'Little Smokey',               'title' => 'Into the trees',                      'note' => 'Boreal forest in every direction. Quiet, layered, alive.',
        'images' => array( '/wp-content/uploads/2026/05/little-smoky.jpg' )),
    array( 'year' => 'Summer 1999',  'place' => 'Valleyview',                  'title' => 'Graduated high school',               'note' => 'Hillside Jr/Sr High.',
        'images' => array( '/wp-content/uploads/2026/05/graduation.png' )),
    array( 'year' => 'Fall 1999',    'place' => 'Grande Prairie',              'title' => 'College — Swan City',                 'note' => 'Graduated. Campus housing, late nights. Welcome to Swan City.',
        'images' => array(
            '/wp-content/uploads/2026/04/Grande_Prairie_Regional_College_02-scaled.jpg',
            '/wp-content/uploads/2026/05/swan-1.jpg',
        )),
    array( 'year' => 'Summer 2000',  'place' => 'Valleyview',                  'title' => 'Pharmacy',                            'note' => 'Summer at the local Rexall.',
        'images' => array( '/wp-content/uploads/2026/05/rexall-pharmacy.png' )),
    array( 'year' => '2001',         'place' => 'Grande Prairie',              'title' => 'Chef Darrel Johanson',                'note' => 'I owe a lot of my culinary education to this man — the great Chef Darrel.',
        'images' => array( '/wp-content/uploads/2026/05/Chef-Darrel-the-Great-Johanson.png' )),
    array( 'year' => '2001',         'place' => 'Grande Prairie',              'title' => 'Met Melanie',                         'note' => 'Started in a restaurant.',
        'images' => array( '/wp-content/uploads/2026/04/mel-18-yrs-old-scaled-e1777577734243.jpg' )),
    array( 'year' => 'Winter 2002',  'place' => 'Grande Prairie',              'title' => 'The Keg — part-time',                 'note' => 'Part-time while finishing college.',
        'images' => array( '/wp-content/uploads/2026/05/young-and-reflective.png' )),
    array( 'year' => '2002-03',      'place' => 'Grande Prairie',              'title' => 'Power Engineering — final year',      'note' => 'The technical career path.',
        'images' => array( '/wp-content/uploads/2026/05/Grande_Prairie_Regional_College_02.jpg' )),
    array( 'year' => 'Winter 2003',  'place' => 'Fort McMurray',               'title' => 'Petro-Canada SAGD practicum',         'note' => 'One month at the SAGD plant. Wish I had pictures.',
        'images' => array( '/wp-content/uploads/2026/04/sagd-ft-mac.jpg' )),
    array( 'year' => '2003',         'place' => 'Grande Prairie',              'title' => 'HCS sidelines, kitchen calls',        'note' => 'Insurance won\'t cover power engineers with HCS. The Keg promoted me to Asst Kitchen Manager that fall. Cooking it is.',
        'images' => array(
            '/wp-content/uploads/2026/05/young-and-reflective.png',
            '/wp-content/uploads/2026/05/keg-2002-e1777754187492.jpg',
        )),
    array( 'year' => '2003-13',      'place' => 'The Keg',                     'title' => 'Getting a Groove On',                 'note' => 'Twelve years grinding through Keg kitchens — line cook to senior, paying off student loans, building the chops.',
        'images' => array(
            '/wp-content/uploads/2026/04/chef-presentation.jpg',
            '/wp-content/uploads/2026/05/keg-cup.png',
            '/wp-content/uploads/2026/05/ian-and-micheal.jpg',
            '/wp-content/uploads/2026/05/keg-2002-e1777754187492.jpg',
        )),
    array( 'year' => '2006',         'place' => 'Grande Prairie',              'title' => 'Family united again',                 'note' => 'Mom and Dad moved up to GP. Chris came up from Vancouver. Dave, Shannon, Marlee, Kristina, and Clarisa visited. What a reunion.',
        'images' => array(
            '/wp-content/uploads/2026/05/gp-with-family.jpg',
            '/wp-content/uploads/2026/05/gp-chill.png',
            '/wp-content/uploads/2026/05/brian-and-dave-gp-years.jpg',
            '/wp-content/uploads/2026/05/cute-cousins.jpg',
        )),
    array( 'year' => '2007',         'place' => 'Calgary',                     'title' => 'Visiting Father',                     'note' => 'JP, Chris, and Thomas — goofing around as usual.',
        'images' => array( '/wp-content/uploads/2026/05/me-and-the-boys.jpg' )),
    array( 'year' => '2009',         'place' => 'The Keg',                     'title' => 'Movember \'Stache',                   'note' => 'November tradition — chef hat on, mustache up.',
        'images' => array( '/wp-content/uploads/2026/05/chef-thomas.png' )),
    array( 'year' => '2010',         'place' => 'The Keg',                     'title' => 'Movember \'Stache, year two',         'note' => 'Same tradition, another year.',
        'images' => array( '/wp-content/uploads/2026/05/Chef-Thomasc-.png' )),
    array( 'year' => '2010-13',      'place' => 'Grande Prairie',              'title' => 'Journeyman chef',                     'note' => 'Earned the journeyman chef ticket.',
        'images' => array( '/wp-content/uploads/2024/09/me.jpg' )),
    array( 'year' => '2011-13',      'place' => 'The Keg',                     'title' => 'Mel, again',                          'note' => 'Reconnected. Cohabitation began late 2012.',
        'images' => array( '/wp-content/uploads/2026/04/Hnging-at-the-keg.jpg' )),
    array( 'year' => '2013',         'place' => 'Grande Prairie',              'title' => 'OMG, a baby (Patience)',              'note' => 'Quick — get shit together. Bought a house. Stepped up to head chef.',
        'images' => array( '/wp-content/uploads/2026/04/newborn-patience.jpg' )),
    array( 'year' => 'Sept 2013',    'place' => 'Grande Prairie',              'title' => 'Rics Grill',                          'note' => 'Started Sept 24 — Patience\'s birthday. Stayed until we shut down to transform into Township 71.',
        'images' => array( '/wp-content/uploads/2026/05/rics-grill-buffet.jpg' )),
    array( 'year' => 'Nov 2014',     'place' => 'Grande Prairie',              'title' => 'Township 71',                         'note' => 'Opened Township 71. Taught culinary courses on the side.',
        'images' => array( '/wp-content/uploads/2026/04/t71logo.png' )),
    array( 'year' => '2015',         'place' => 'Grande Prairie',              'title' => 'A new chapter',                       'note' => 'T71 closed in June. First time since childhood without farming or working — new dad, taking time, plan in pocket.',
        'images' => array( '/wp-content/uploads/2026/05/majors-dad.png' )),
    array( 'year' => 'June 2015',    'place' => 'Grande Prairie',              'title' => 'Daniel',                              'note' => 'Daniel born.',
        'images' => array( '/wp-content/uploads/2026/04/baby-daniel.jpg' )),
    array( 'year' => '2015',         'place' => 'Grande Prairie',              'title' => 'Grand Parents visiting',              'note' => 'Mom and Brian came to help with the new arrival.',
        'images' => array( '/wp-content/uploads/2026/04/mom-and-brian.jpg' )),
    array( 'year' => '2015-21',      'place' => 'Major\'s / Tractor Jack\'s',  'title' => 'Long stretch in the kitchen',         'note' => 'Same kitchen, two front-of-house personalities. Anchored 2015-19, then a little here and there to 2021.',
        'images' => array( '/wp-content/uploads/2026/05/tractor-jacks-logo.png' )),
    array( 'year' => '2016',         'place' => 'Teepee Creek',                'title' => 'The wedding',                         'note' => 'Married in Teepee Creek.',
        'images' => array( '/wp-content/uploads/2026/05/DSC0256-scaled.jpg' )),
    array( 'year' => '2017',         'place' => 'Grande Prairie',              'title' => 'Faith',                               'note' => 'Faith born. Kitchen work continued — body began to argue.',
        'images' => array( '/wp-content/uploads/2024/10/20180524_163145-scaled.jpg' )),
    array( 'year' => '2019',         'place' => 'Grande Prairie',              'title' => 'Permanent disability',                'note' => 'Chronic, accumulated.',
        'images' => array( '/wp-content/uploads/2026/04/foot-recovery.jpg' )),
    array( 'year' => '2020',         'place' => 'Grande Prairie',              'title' => 'Pandemic',                            'note' => 'Empty streets, masks, the whole thing.',
        'images' => array( '/wp-content/uploads/2026/04/covid-xmas-scaled.jpg' )),
    array( 'year' => '2022',         'place' => 'Grande Prairie',              'title' => 'Spinal fusion',                       'note' => 'Hardware in. A long recovery, and the slow rebuild.',
        'images' => array( '/wp-content/uploads/2026/04/awake-from-surgery-scaled.jpg' )),
    array( 'year' => '2023-24',      'place' => 'Grande Prairie',              'title' => 'Coming back',                         'note' => 'Return toward normalcy.',
        'images' => array( '/wp-content/uploads/2026/04/walk-after-surgery-scaled.jpg' )),
    array( 'year' => '2025',         'place' => 'Grande Prairie',              'title' => 'Settled, twice over',                 'note' => 'New roof, furnace, central air, water heater. A 2022 Kia Carnival in the driveway. Patience earned the Award for Excellence again — top of the schoolboard, twice now.',
        'images' => array( '/wp-content/uploads/2026/04/royal-chariot-scaled.jpg' )),
    array( 'year' => '2026',         'place' => 'Grande Prairie',              'title' => 'Into the ring',                       'note' => 'Daniel started boxing. A couple of months later, Faith laced up too.',
        'images' => array( '/wp-content/uploads/2026/04/daniel-ready-to-box-scaled.jpg' )),
);

/**
 * Stamp variant cycle for SECONDARY images on a multi-image event
 * (the primary image always renders as a circular ink stamp).
 */
$tc_passport_stamp_variants = array( 'postmark', 'polaroid', 'ticket' );

/**
 * Era bucket for an event year. Used to render section dividers between
 * spreads when the era changes. Year strings can be "1990-91",
 * "Summer 1999", "Nov 2014", etc — extract the first 4-digit number.
 */
function tc_passport_era_for( $year_label ) {
    if ( preg_match( '/(\d{4})/', $year_label, $m ) ) {
        $y = intval( $m[1] );
    } else {
        $y = 9999;
    }
    if ( $y < 1990 ) return 'Calgary & The Foothills';
    if ( $y < 1993 ) return 'The Migration North';
    if ( $y < 1999 ) return 'Reunion & The Farm';
    if ( $y < 2003 ) return 'College & The Keg Start';
    if ( $y < 2013 ) return 'The Keg Years';
    if ( $y < 2015 ) return 'New Restaurants, New Family';
    if ( $y < 2025 ) return 'Family, Body, Recovery';
    return 'Settled';
}

/**
 * Render one passport page (single event).
 */
function tc_passport_render_page( $event, $page_num, $side, $stamp_variants ) {
    if ( ! $event ) {
        return;
    }
    $images       = isset( $event['images'] ) ? $event['images'] : array();
    $primary_img  = ! empty( $images[0] ) ? $images[0] : '';
    $extra_images = array_slice( $images, 1 );
    ?>
    <article class="passport-page passport-page--<?php echo esc_attr( $side ); ?>">
        <div class="passport-page__num"><?php echo esc_html( $page_num ); ?></div>
        <header class="passport-page__heading">
            <h2 class="passport-page__title"><?php echo esc_html( $event['title'] ); ?></h2>
            <p class="passport-page__meta">
                <span class="passport-page__place"><?php echo esc_html( $event['place'] ); ?></span>
                <span class="passport-page__year"><?php echo esc_html( $event['year'] ); ?></span>
            </p>
        </header>

        <div class="passport-stamps passport-stamps--count-<?php echo count( $images ); ?>">
            <?php if ( $primary_img ) : ?>
                <div class="passport-stamp passport-stamp--circular">
                    <img class="passport-stamp__photo" src="<?php echo esc_url( $primary_img ); ?>" alt="" loading="lazy" />
                    <div class="passport-stamp__ring" aria-hidden="true"></div>
                    <span class="passport-stamp__place"><?php echo esc_html( $event['place'] ); ?></span>
                    <span class="passport-stamp__year"><?php echo esc_html( $event['year'] ); ?></span>
                </div>
            <?php endif; ?>

            <?php foreach ( $extra_images as $idx => $img_url ) : ?>
                <?php $variant = $stamp_variants[ $idx % count( $stamp_variants ) ]; ?>
                <div class="passport-stamp passport-stamp--<?php echo esc_attr( $variant ); ?>">
                    <img class="passport-stamp__photo" src="<?php echo esc_url( $img_url ); ?>" alt="" loading="lazy" />
                    <span class="passport-stamp__caption"><?php echo esc_html( $event['place'] ); ?> · <?php echo esc_html( $event['year'] ); ?></span>
                </div>
            <?php endforeach; ?>
        </div>

        <p class="passport-page__note"><?php echo esc_html( $event['note'] ); ?></p>
    </article>
    <?php
}

get_header();
?>

<main id="primary" class="site-main passport-page" data-passport-root>

    <!-- Cover spread — front of the passport, before the interior pages -->
    <section class="passport-spread passport-spread--cover" aria-label="Passport — title spread">
        <div class="passport-cover">
            <div class="passport-cover__crest" aria-hidden="true">TC</div>
            <div class="passport-cover__country">'VENTURES</div>
            <div class="passport-cover__doc-type">PASSPORT</div>
            <div class="passport-cover__name"><?php echo esc_html( get_the_title() ?: 'Thomas Cheesman' ); ?></div>
            <div class="passport-cover__years">1980 — present</div>
        </div>
    </section>

    <!-- Interior spreads — 2 events per spread (left + right page), in
         chronological order. Total spreads = ceil(events / 2). Single
         tail event (odd count) renders alone on the left of its spread.
         Era dividers print between spreads when the era changes (Calgary
         & The Foothills → The Migration North → Reunion & The Farm → ...). -->
    <?php
    $events_total = count( $tc_passport_events );
    $current_era  = '';
    for ( $i = 0; $i < $events_total; $i += 2 ) :
        $left  = $tc_passport_events[ $i ];
        $right = isset( $tc_passport_events[ $i + 1 ] ) ? $tc_passport_events[ $i + 1 ] : null;
        // Era of the spread = era of its left (first) event.
        $spread_era = tc_passport_era_for( $left['year'] );
        $era_changed = ( $spread_era !== $current_era );
        if ( $era_changed ) {
            $current_era = $spread_era;
        ?>
            <aside class="passport-era-divider" aria-label="<?php echo esc_attr( $spread_era ); ?>">
                <span class="passport-era-divider__rule" aria-hidden="true"></span>
                <span class="passport-era-divider__label"><?php echo esc_html( $spread_era ); ?></span>
                <span class="passport-era-divider__rule" aria-hidden="true"></span>
            </aside>
        <?php } ?>
        <section class="passport-spread" aria-label="Spread <?php echo esc_attr( ( $i / 2 ) + 1 ); ?> — <?php echo esc_attr( $spread_era ); ?>">
            <?php tc_passport_render_page( $left,  $i + 1,         'left',  $tc_passport_stamp_variants ); ?>
            <?php if ( $right ) : ?>
                <?php tc_passport_render_page( $right, $i + 2,     'right', $tc_passport_stamp_variants ); ?>
            <?php else : ?>
                <div class="passport-page passport-page--right passport-page--blank" aria-hidden="true"></div>
            <?php endif; ?>
        </section>
    <?php endfor; ?>

</main>

<?php get_footer(); ?>
