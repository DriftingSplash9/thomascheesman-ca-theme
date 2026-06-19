<?php
/**
 * Page Template: Heritage / The Families
 *
 * Auto-applied for any WP page with slug `heritage` (template hierarchy
 * resolves `page-{slug}.php` before generic `page.php`). Make the WP
 * page a child of Family in admin (Page Attributes → Parent: Family)
 * so the URL stays /family/heritage.
 *
 * This file used to be the long-form scrollable hub covering all five
 * lines on a single page. As of 2026-04-26 it has been split: the hub
 * now shows a 5-card grid linking to per-line spoke pages, and the
 * detailed long-form prose lives in:
 *
 *   /family/heritage/cheesmans  ←  page-cheesmans.php
 *   /family/heritage/dochertys  ←  page-dochertys.php
 *   /family/heritage/lakemans   ←  page-lakemans.php
 *   /family/heritage/rycrofts   ←  page-rycrofts.php
 *   /family/heritage/haistes    ←  page-haistes.php
 *
 * The hub keeps the page-hero, the lyric intro, and the closing
 * "A note on names" coda — it just hands the body off to the spokes.
 */

get_header(); ?>

<main id="primary" class="site-main heritage-page heritage-page--hub">

    <!-- ==============================================================
         PAGE HERO
         Same minimal pattern as page-family.php — kinetic title plus
         eyebrow and subtitle. Adds a "back to Family" link above the
         eyebrow so the breadcrumb is obvious without a full nav bar.
         ============================================================== -->
    <section class="page-hero">
        <div class="container">
            <?php
            $tc_crumbs = array(
                array( 'label' => 'Family', 'url' => home_url( '/family' ) ),
                array( 'label' => 'Heritage' ),
            );
            require get_stylesheet_directory() . '/inc/heritage-breadcrumb.php';
            ?>
            <span class="page-hero__eyebrow">Eight lines, one household</span>
            <h1 class="page-hero__title kinetic-text">The Families</h1>
            <p class="page-hero__subtitle kinetic-fade">
                A working map of where my kids come from
            </p>
        </div>
    </section>

    <!-- ==============================================================
         INTRO LEAD
         Narrow column, larger type than body — sets the voice for the
         hub. Each line has its own page-hero on its spoke; this is the
         shared framing.
         ============================================================== -->
    <section class="heritage-intro">
        <div class="container container--narrow">
            <p class="heritage-intro__lead">
                Family is its own kind of map. Mine has eight lines pulling it in different directions &mdash; the Cheesmans, Dochertys, Lakemans, Rycrofts, and Haistes, plus the three maternal lines that married into them: the McIvers, Verbooms, and Steinkes. Some I know inside and out. Others are still mostly names on paper and a few photographs I'm trying to put faces to. Each line has its own page; tap a card to follow it down.
            </p>
            <p class="heritage-intro__lead heritage-intro__lead--secondary">
                If you have a story, a photo, or a correction, <a href="<?php echo esc_url( home_url( '/contact' ) ); ?>">send it my way</a>. These pages are working drafts for as long as I can keep typing.
            </p>
        </div>
    </section>

    <!-- ==============================================================
         EIGHT LINE CARDS
         Image-led cards in a responsive grid, numbered 01–08. The three
         maternal lines (McIver, Verboom, Steinke) sit right after their
         parent and link STRAIGHT to their full long-read, so they're one
         hop from the hub. The whole tile is the link affordance — no
         separate "read more" needed because the entire card is clickable.
         ============================================================== -->
    <section class="heritage-cards-section scroll-animate">
        <div class="container">

            <div class="heritage-cards">

                <!-- 01 — Cheesmans -->
                <a class="heritage-card" href="<?php echo esc_url( home_url( '/family/heritage/cheesmans' ) ); ?>">
                    <div class="heritage-card__image">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2024/09/family-photos-me-as-a-kid_20220510140646989-scaled.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Mom and Brian Cheesman wedding, July 1991', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                    </div>
                    <div class="heritage-card__body">
                        <span class="heritage-card__number" aria-hidden="true">01</span>
                        <h2 class="heritage-card__title">The Cheesmans</h2>
                        <p class="heritage-card__subtitle">The Cheesiest Clan</p>
                        <p class="heritage-card__blurb">
                            My stepfather Brian's family. We became Cheesmans on July 20, 1991, in a double wedding with Brian's brother. Now my kids carry the name &mdash; and so do my brother Christopher's two boys.
                        </p>
                        <p class="heritage-card__kicker">Turner Valley &middot; the oil patch &middot; the Peace Country farms &middot; c. 1947 &ndash; today</p>
                        <span class="heritage-card__cta" aria-hidden="true">Read the line &rarr;</span>
                    </div>
                </a>

                <!-- 02 — Dochertys -->
                <a class="heritage-card" href="<?php echo esc_url( home_url( '/family/heritage/dochertys' ) ); ?>">
                    <div class="heritage-card__image">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2024/09/img_0676-scaled.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Maryanne Docherty with her brother David', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                    </div>
                    <div class="heritage-card__body">
                        <span class="heritage-card__number" aria-hidden="true">02</span>
                        <h2 class="heritage-card__title">The Dochertys</h2>
                        <p class="heritage-card__subtitle">Few and far between, deep roots</p>
                        <p class="heritage-card__blurb">
                            Mom's side. A Golden Gloves boxer for a grandfather, Hebridean Scots through Saskatchewan on Granny's McIver line, and a slice of bare-knuckle boxing folklore tied to John L. Sullivan.
                        </p>
                        <p class="heritage-card__kicker">Eight generations &middot; Donegal to Alberta &middot; c. 1750 &ndash; today</p>
                        <span class="heritage-card__cta" aria-hidden="true">Read the line &rarr;</span>
                    </div>
                </a>

                <!-- 03 — McIvers (maternal line of the Dochertys; links straight to the full story) -->
                <a class="heritage-card" href="<?php echo esc_url( home_url( '/family/heritage/dochertys/mcivers' ) ); ?>">
                    <div class="heritage-card__image">
                        <img
                            src="<?php echo esc_url( get_stylesheet_directory_uri() . '/assets/img/heritage/mciver/mciver-hero-lewis-coast.jpg' ); ?>"
                            alt="<?php esc_attr_e( 'A windswept Isle of Lewis coastline, the Hebridean world the McIvers came from', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                    </div>
                    <div class="heritage-card__body">
                        <span class="heritage-card__number" aria-hidden="true">03</span>
                        <h2 class="heritage-card__title">The McIvers</h2>
                        <p class="heritage-card__subtitle">A maternal line of the Dochertys</p>
                        <p class="heritage-card__blurb">
                            Granny Docherty's people &mdash; McIver of Lewis, Campbell of South Uist, Cameron of Moray. Three Hebridean streams cleared off the islands that met on the Saskatchewan prairie in the 1880s, and the deepest-documented branch of the whole family.
                        </p>
                        <p class="heritage-card__kicker">Lewis &middot; South Uist &middot; Moray &middot; the Clearances &middot; Saltcoats &middot; c. 1832 &ndash; today</p>
                        <span class="heritage-card__cta" aria-hidden="true">Read the line &rarr;</span>
                    </div>
                </a>

                <!-- 04 — Lakemans -->
                <a class="heritage-card" href="<?php echo esc_url( home_url( '/family/heritage/lakemans' ) ); ?>">
                    <div class="heritage-card__image">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/06/Senior-Lakemans.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Suzan Lakeman with her sons Lex, Reink, and Martin', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                    </div>
                    <div class="heritage-card__body">
                        <span class="heritage-card__number" aria-hidden="true">04</span>
                        <h2 class="heritage-card__title">The Lakemans</h2>
                        <p class="heritage-card__subtitle">Indonesia, Holland, Calgary, and most places in between</p>
                        <p class="heritage-card__blurb">
                            My biological father's side. Dutch East Indies colonial roots, a great-grandfather who patrolled his district on horseback, a grandmother who lived to 100, and a story that rides Royal Dutch Shell across five continents.
                        </p>
                        <p class="heritage-card__kicker">Eleven generations &middot; the Netherlands to Calgary &middot; c. 1660 &ndash; today</p>
                        <span class="heritage-card__cta" aria-hidden="true">Read the line &rarr;</span>
                    </div>
                </a>

                <!-- 05 — Verbooms (maternal line of the Lakemans; links straight to the full story) -->
                <a class="heritage-card" href="<?php echo esc_url( home_url( '/family/heritage/lakemans/verbooms' ) ); ?>">
                    <div class="heritage-card__image">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/05/Broek-Waterland-canal-view.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'A canal and timber houses in a Zuid-Holland village, the country the Verbooms came from', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                    </div>
                    <div class="heritage-card__body">
                        <span class="heritage-card__number" aria-hidden="true">05</span>
                        <h2 class="heritage-card__title">The Verbooms</h2>
                        <p class="heritage-card__subtitle">A maternal line of the Lakemans</p>
                        <p class="heritage-card__blurb">
                            Suzanna Verboom's people &mdash; a tailor-barber of Ter Aar and the river-village and island families behind him, traced deep into the polders and waterways of Zuid-Holland.
                        </p>
                        <p class="heritage-card__kicker">Ter Aar to Calgary &middot; the riverside, the polders, and the islands &middot; c. 1760 &ndash; today</p>
                        <span class="heritage-card__cta" aria-hidden="true">Read the line &rarr;</span>
                    </div>
                </a>

                <!-- 06 — Rycrofts -->
                <a class="heritage-card" href="<?php echo esc_url( home_url( '/family/heritage/rycrofts' ) ); ?>">
                    <div class="heritage-card__image">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2026/05/Papa-Sam-and-Patience.png' ) ); ?>"
                            alt="<?php esc_attr_e( 'Papa Sam Rycroft holding newborn Patience', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                    </div>
                    <div class="heritage-card__body">
                        <span class="heritage-card__number" aria-hidden="true">06</span>
                        <h2 class="heritage-card__title">The Rycrofts</h2>
                        <p class="heritage-card__subtitle">Pioneers of the Region</p>
                        <p class="heritage-card__blurb">
                            Melanie's mother's side. The Alberta hamlet of Rycroft is named after her great-great-grandfather &mdash; settled in 1920 by four pioneers writing names on slips of paper and pulling one out of a hat.
                        </p>
                        <p class="heritage-card__kicker">Leeds &middot; the Civil War &middot; Hawai&lsquo;i &middot; the Peace Country &middot; 1843 &ndash; today</p>
                        <span class="heritage-card__cta" aria-hidden="true">Read the line &rarr;</span>
                    </div>
                </a>

                <!-- 07 — Steinkes (maternal line of the Rycrofts; links straight to the full story) -->
                <a class="heritage-card" href="<?php echo esc_url( home_url( '/family/heritage/rycrofts/steinkes' ) ); ?>">
                    <div class="heritage-card__image">
                        <img
                            src="<?php echo esc_url( get_stylesheet_directory_uri() . '/assets/img/heritage/steinke/steinke-hero-sod-house.jpg' ); ?>"
                            alt="<?php esc_attr_e( 'A prairie family before their sod house, the world the Steinkes settled', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                    </div>
                    <div class="heritage-card__body">
                        <span class="heritage-card__number" aria-hidden="true">07</span>
                        <h2 class="heritage-card__title">The Steinkes</h2>
                        <p class="heritage-card__subtitle">A maternal line of the Rycrofts</p>
                        <p class="heritage-card__blurb">
                            Origins unknown no more &mdash; one evening of records work dropped the floor three generations: an 1858 parish akte in central Poland, fifteen children, and Nana Bette.
                        </p>
                        <p class="heritage-card__kicker">Ossowka, central Poland &middot; Winnipeg 1892 &middot; the Sexsmith prairie &middot; c. 1858 &ndash; today</p>
                        <span class="heritage-card__cta" aria-hidden="true">Read the line &rarr;</span>
                    </div>
                </a>

                <!-- 08 — Haistes -->
                <a class="heritage-card" href="<?php echo esc_url( home_url( '/family/heritage/haistes' ) ); ?>">
                    <div class="heritage-card__image">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2024/10/20170330_160029-scaled.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Papa Dan Haiste meeting newborn Daniel', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                    </div>
                    <div class="heritage-card__body">
                        <span class="heritage-card__number" aria-hidden="true">08</span>
                        <h2 class="heritage-card__title">The Haistes</h2>
                        <p class="heritage-card__subtitle">Yorkshire to the Peace Country</p>
                        <p class="heritage-card__blurb">
                            Melanie's father's side. Yorkshire textile-and-coal stock that emigrated to a Saskatchewan homestead around 1900 and, three generations later, settled across Alberta from Edmonton to Grande Prairie.
                        </p>
                        <p class="heritage-card__kicker">Thirteen generations &middot; Yorkshire to the Peace Country &middot; c. 1610 &ndash; today</p>
                        <span class="heritage-card__cta" aria-hidden="true">Read the line &rarr;</span>
                    </div>
                </a>

            </div>
        </div>
    </section>

    <!-- ==============================================================
         CODA — A NOTE ON NAMES
         Closes the hub with the surname-history map. Centred,
         smaller type, signs off the page like a colophon.
         ============================================================== -->
    <section class="heritage-coda scroll-animate">
        <div class="container container--narrow">
            <h2 class="heritage-coda__title">A note on names</h2>
            <p>
                If you're keeping score, my surname history runs Lakeman &rarr; Cheesman, my mom's runs Docherty &rarr; Lakeman &rarr; Cheesman, my wife's runs Rycroft &rarr; Haiste &rarr; Cheesman. Eight family lines, one household, three kids who carry pieces of all of it. That's the map I'm trying to draw.
            </p>
        </div>
    </section>

</main>

<?php get_footer(); ?>
