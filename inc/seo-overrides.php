<?php
/**
 * SEO overrides — hand-written page titles, meta descriptions, and social
 * share images, plus the heritage/HCS Article JSON-LD. Extracted verbatim
 * from functions.php (CODE-1) with NO behaviour change: the same AIOSEO
 * filters (aioseo_title / aioseo_description) + wp_head hooks, the same maps
 * keyed by page URI. Privacy rules apply to this copy like any other prose.
 *
 * @package tc-ventures-child
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }


/**
 * Hand-written meta descriptions, keyed by page path (2026-06 review
 * triage — every page was shipping WITHOUT a description). AIOSEO has
 * no per-page descriptions set, so its `aioseo_description` filter is
 * the clean hook: AIOSEO emits the <meta name="description"> plus the
 * og:/twitter: description tags from whatever this returns. Pages not
 * in the map keep AIOSEO's default behaviour. Versioned here rather
 * than in the AIOSEO admin UI so the copy lives in git with the rest
 * of the prose. Privacy rules apply to this copy like any other.
 */
add_filter( 'aioseo_description', function ( $description ) {
    if ( is_front_page() ) {
        return 'Chef turned builder in Grande Prairie, Alberta: three kids, eight family lines traced across 400 years, and life with the ultra-rare Hajdu-Cheney syndrome.';
    }
    if ( ! is_page() ) {
        return $description;
    }
    $tc_uri = get_page_uri();
    $tc_map = array(
        'about'                                   => 'Who I am, plainly told — the cooking years, the body I was given, the family I built, and why this site exists: a letter to my kids, written while I can.',
        'hcs'                                     => 'Living with Hajdu-Cheney syndrome — one of the rarest bone disorders on Earth — told first-hand: diagnosis, fractures, fusions, and a good life anyway.',
        'hcs/case-studies'                        => 'Case studies and research on Hajdu-Cheney syndrome, gathered by a patient — for the newly diagnosed, their families, and the clinicians who treat them.',
        'contact'                                 => 'Write to Thomas Cheesman — a click-to-copy address, no forms, no tracking. Letters welcome; stories about the family lines doubly so.',
        'privacy'                                 => 'What this site does with your data — almost nothing: no analytics, no advertising, no tracking cookies, nothing sold. Only what a feature can\'t work without.',
        'family'                                  => 'The family tree of Patience, Daniel, and Faith — three kids in Grande Prairie where eight family lines from five countries finally meet.',
        'family/patience'                         => 'Patience, the eldest of the three — her story in her dad\'s words: who she is, what she loves, and the letter he wrote her for later.',
        'family/daniel'                           => 'Daniel, the only boy of the three — his story in his dad\'s words, from a hundred questions answered together to the letter written for later.',
        'family/faith'                            => 'Faith, the youngest of the three — her story in her dad\'s words: the engine that never idles, school and the long game, and a letter for later.',
        'family/thomas'                           => 'Thomasito — Thomas\'s own long-read: born a Lakeman, raised a Cheesman, the kitchen years, the body\'s turn, and still here to tell it.',
        'capybara'                                => 'CopyCatCapybara — Faith\'s click-the-capybara game. Four lengths, server top-tens, zero ads. Built for Faith, playable by anyone.',
        'family/heritage'                         => 'Eight family lines — Cheesman, Docherty, McIver, Lakeman, Verboom, Rycroft, Steinke, Haiste — traced from five countries to one Alberta household.',
        'family/heritage/cheesmans'               => 'The Cheesmans — the chosen name: Turner Valley oil-patch roots, the bird farm, the Candy Cane pig farm, and a family that built itself by hand.',
        'family/heritage/cheesmans/story'         => 'The full Cheesman story — the name Thomas chose at twenty: a closed-door adoption, farm years at Teepee Creek and Little Smokey, and the kitchen life they led to.',
        'family/heritage/dochertys'               => 'The Dochertys — Donegal to the Lanarkshire coal to the Alberta prairie: an Irish line that endured, told with its records honestly tiered.',
        'family/heritage/dochertys/story'         => 'Nine generations of Dochertys — Inishowen origins, the Scottish pits, the Illinois waystation, and the prairie town of Alix: the full documented story.',
        'family/heritage/dochertys/mcivers'       => 'The McIvers, Campbells, and Camerons — Hebridean crofters cleared from Lewis and South Uist to a Saskatchewan colony, traced by primary record.',
        'family/heritage/lakemans'                => 'The Lakemans — Dutch polder farmers, a cholera orphan, the East Indies school service, and Royal Dutch Shell across five continents to Calgary.',
        'family/heritage/lakemans/story'          => 'Eleven generations of Lakemans — from the drained Beemster lakebed through the Dutch East Indies to Calgary: the full documented story, akte by akte.',
        'family/heritage/lakemans/verbooms'       => 'The Verbooms — Suzanna\'s people: a tailor-barber of Ter Aar and the river-village and island families behind him, sealed by Dutch civil records.',
        'family/heritage/rycrofts'                => 'The Rycrofts — a Leeds boy in the U.S. cavalry, a Hawai\'i coffee pioneer, and the Alberta town that drew its name from a hat in 1920.',
        'family/heritage/rycrofts/story'          => 'Eight generations of Rycrofts — Leeds to the Kingdom of Hawai\'i to the Peace Country: a street in Honolulu, a town in Alberta, one family.',
        'family/heritage/rycrofts/steinkes'       => 'The Steinkes — German Lutherans of central Poland to the Canadian prairie: the 1858 Ossowka marriage akte, fifteen children, and Nana Bette.',
        'family/heritage/haistes'                 => 'The Haistes — thirteen generations from a Yorkshire tannery through the Saskatchewan dust to Alberta: Melanie\'s father\'s line.',
        'family/heritage/haistes/story'           => 'Thirteen generations of Haistes — a 1610 tanner, the Calverley clothier of 1802, the Atlantic crossing, the Dust Bowl, and the Alberta patriarch.',
        'family/heritage/map'                     => 'The Lanterns of Record — 400 years of family history as an interactive map where every documented record is a light. Press play; watch ten lines converge on Alberta.',
    );
    return isset( $tc_map[ $tc_uri ] ) ? $tc_map[ $tc_uri ] : $description;
} );

/* ======================================================================
 * 2026-06 review triage, round 2 — SEO plumbing.
 * All approvals recorded in Review-Triage-2026-06.xlsx (Q2/Q3 etc.).
 * ==================================================================== */

/**
 * Hand-written page titles (Q2, approved verbatim). Same mechanism as
 * the descriptions above: AIOSEO's filter, keyed by page URI, versioned
 * in git. Before this, all five hub long-reads shared the literal title
 * "Story - thomascheesman.ca" and the homepage led with "Home -".
 * Pages not in the map keep AIOSEO's default behaviour.
 */
function tc_review_titles() {
	return array(
		''                                  => "Thomas Cheesman — a life, three kids, eight family lines | thomascheesman.ca",
		'family/heritage/map'               => "The Lanterns of Record — 400 years of family history, mapped | thomascheesman.ca",
		'family/heritage/cheesmans/story'   => "The Cheesmans — Turner Valley to Teepee Creek, the chosen name | thomascheesman.ca",
		'family/heritage/dochertys/story'   => "The Dochertys — Donegal to Alberta, nine generations | thomascheesman.ca",
		'family/heritage/dochertys/mcivers' => "The McIvers — cleared from the Hebrides to the prairie | thomascheesman.ca",
		'family/heritage/lakemans/story'    => "The Lakemans — Beemster to Calgary, eleven generations | thomascheesman.ca",
		'family/heritage/lakemans/verbooms' => "The Verbooms — Suzanna's people of Ter Aar | thomascheesman.ca",
		'family/heritage/rycrofts/story'    => "The Rycrofts — Leeds, Hawai'i, and the town drawn from a hat | thomascheesman.ca",
		'family/heritage/rycrofts/steinkes' => "The Steinkes — German Poland to the prairie, fifteen children | thomascheesman.ca",
		'family/heritage/haistes/story'     => "The Haistes — thirteen generations, Yorkshire to the Peace Country | thomascheesman.ca",
		// Section + spoke pages (2026-06 review, round 2 — extends C3
		// beyond the long-reads, which shipped first because all five
		// shared the literal "Story -". These pages previously inherited
		// AIOSEO's bare "<Page> - thomascheesman.ca".
		'about'                             => "About Thomas Cheesman — chef, father, and a letter to my kids | thomascheesman.ca",
		'hcs'                               => "Living with Hajdu-Cheney syndrome — a patient's first-hand account | thomascheesman.ca",
		'hcs/case-studies'                  => "Hajdu-Cheney syndrome — case studies and research, gathered by a patient | thomascheesman.ca",
		'contact'                           => "Contact Thomas Cheesman — a click-to-copy address, no forms | thomascheesman.ca",
		'privacy'                           => "Privacy — what I do with your data | thomascheesman.ca",
		'capybara'                          => "CopyCatCapybara — Faith's click-the-capybara game | thomascheesman.ca",
		'family'                            => "The family — three kids, eight lines, five countries, one Alberta home | thomascheesman.ca",
		'family/patience'                   => "Patience — the eldest of the three, in her dad's words | thomascheesman.ca",
		'family/daniel'                     => "Daniel — the only boy of the three, in his dad's words | thomascheesman.ca",
		'family/faith'                      => "Faith — the youngest of the three, in her dad's words | thomascheesman.ca",
		'family/thomas'                     => "Thomasito — born a Lakeman, raised a Cheesman, here to tell it | thomascheesman.ca",
		'family/heritage'                   => "The family lines — eight families, five countries, four centuries | thomascheesman.ca",
		'family/heritage/cheesmans'         => "The Cheesmans — the chosen name, from the Turner Valley oil patch | thomascheesman.ca",
		'family/heritage/dochertys'         => "The Dochertys — Donegal to the Lanarkshire coal to the prairie | thomascheesman.ca",
		'family/heritage/lakemans'          => "The Lakemans — Dutch polders to Royal Dutch Shell to Calgary | thomascheesman.ca",
		'family/heritage/rycrofts'          => "The Rycrofts — Leeds to the Kingdom of Hawai'i to the Peace Country | thomascheesman.ca",
		'family/heritage/haistes'           => "The Haistes — thirteen generations, a Yorkshire tannery to Alberta | thomascheesman.ca",
	);
}
add_filter( 'aioseo_title', function ( $title ) {
	if ( is_front_page() ) {
		$tc_titles = tc_review_titles();
		return $tc_titles[''];
	}
	if ( ! is_page() ) {
		return $title;
	}
	$tc_titles = tc_review_titles();
	$tc_uri    = get_page_uri();
	return isset( $tc_titles[ $tc_uri ] ) ? $tc_titles[ $tc_uri ] : $title;
} );

/**
 * Social share images (Q3: desk photo as the sitewide default, each
 * page's lead image where one exists). AIOSEO emits no og:image at all
 * on this install, so these tags are emitted directly — no filter-name
 * roulette, nothing to collide with. Story pages share their line's
 * image with the spoke page.
 */
function tc_review_social_image() {
	$tc_default = '/wp-content/uploads/2026/05/desk-hero.jpg';
	$tc_map     = array(
		'about'                             => '/wp-content/uploads/2024/08/img_2534-2-scaled.jpg',
		'hcs'                               => '/wp-content/uploads/2026/04/day-after-surgert.jpg',
		'family'                            => '/wp-content/uploads/2024/08/img_9320.jpg',
		'family/patience'                   => '/wp-content/uploads/2026/05/IMG_1359-scaled.jpg',
		'family/faith'                      => '/wp-content/uploads/2024/10/20180524_163145-scaled.jpg',
		'family/heritage/dochertys'         => '/wp-content/uploads/2026/05/IMG_4532.jpg',
		'family/heritage/dochertys/story'   => '/wp-content/uploads/2026/05/IMG_4532.jpg',
		'family/heritage/lakemans'          => '/wp-content/uploads/2026/05/Broek-Waterland-canal-view.jpg',
		'family/heritage/lakemans/story'    => '/wp-content/uploads/2026/05/Broek-Waterland-canal-view.jpg',
		'family/heritage/rycrofts/steinkes' => '/wp-content/uploads/2026/06/Edward-and-Augusta-Steinke.jpg',
	);
	$tc_uri = is_page() ? get_page_uri() : '';
	$tc_img = isset( $tc_map[ $tc_uri ] ) ? $tc_map[ $tc_uri ] : $tc_default;
	return home_url( $tc_img );
}
add_action( 'wp_head', function () {
	$tc_img = esc_url( tc_review_social_image() );
	// Priority 0: AIOSEO emits its own og:image on the front page (a
	// legacy setting) — share scrapers take the FIRST og:image, and
	// Thomas picked the desk photo (Q3), so ours must print first.
	echo '<meta property="og:image" content="' . $tc_img . '" />' . "\n";
	echo '<meta name="twitter:image" content="' . $tc_img . '" />' . "\n";
}, 0 );

/**
 * Article JSON-LD for the eight heritage long-reads + the HCS essay.
 * AIOSEO types everything as a bare WebPage; these are book-length
 * original works with an author. The Person node is emitted compactly
 * alongside so the author reference resolves on its own; /hcs adds a
 * MedicalCondition as the page's `about` entity — identification only
 * (OMIM / Orphanet / GeneReviews), no clinical claims: this is a
 * patient-perspective essay, and the schema says exactly that.
 */
add_action( 'wp_head', function () {
	if ( ! is_page() ) {
		return;
	}
	$tc_uri    = get_page_uri();
	$tc_titles = tc_review_titles();
	$tc_is_story = isset( $tc_titles[ $tc_uri ] ) && ( strpos( $tc_uri, 'heritage/' ) !== false ) && ( $tc_uri !== 'family/heritage/map' );
	if ( ! $tc_is_story && 'hcs' !== $tc_uri ) {
		return;
	}

	// E-E-A-T at the point of citation: AI retrieval (RAG / query
	// fan-out) often grabs a SINGLE essay URL in isolation, where the
	// homepage Person node isn't present. So the author reference here
	// carries the Experience/Expertise signal inline — description +
	// knowsAbout mirror the fuller homepage Person (security-and-seo.php)
	// so the two never contradict. All of it is stated on the pages.
	$tc_person = array(
		'@type'      => 'Person',
		'@id'        => home_url( '/#thomas' ),
		'name'       => 'Thomas Cheesman',
		'url'        => home_url( '/' ),
		'description' => 'Former chef. Father of three. Lives with Hajdu-Cheney Syndrome. Writes the family record and, through Bare Your Rare, about rare disease.',
		'knowsAbout' => array(
			'Hajdu-Cheney Syndrome',
			'Rare diseases',
			'Genealogy',
			'Culinary arts',
		),
	);
	$tc_headline = $tc_is_story
		? trim( explode( '|', $tc_titles[ $tc_uri ] )[0] )
		: 'Hajdu-Cheney Syndrome — living with one of the rarest bone disorders on Earth';
	$tc_article = array(
		'@type'            => 'Article',
		'mainEntityOfPage' => get_permalink(),
		'headline'         => $tc_headline,
		'author'           => array( '@id' => home_url( '/#thomas' ) ),
		'datePublished'    => get_the_date( 'c' ),
		'dateModified'     => get_the_modified_date( 'c' ),
		'image'            => tc_review_social_image(),
		'inLanguage'       => 'en-CA',
	);
	if ( 'hcs' === $tc_uri ) {
		$tc_article['about'] = array(
			'@type'         => 'MedicalCondition',
			'name'          => 'Hajdu-Cheney Syndrome',
			'alternateName' => 'Acroosteolysis dominant type',
			'sameAs'        => array(
				'https://omim.org/entry/102500',
				'https://www.orpha.net/en/disease/detail/955',
				'https://www.ncbi.nlm.nih.gov/books/NBK1311/',
			),
		);
	}
	$tc_graph = array(
		'@context' => 'https://schema.org',
		'@graph'   => array( $tc_person, $tc_article ),
	);
	echo '<script type="application/ld+json">' . wp_json_encode( $tc_graph, JSON_UNESCAPED_SLASHES ) . '</script>' . "\n";
}, 3 );
