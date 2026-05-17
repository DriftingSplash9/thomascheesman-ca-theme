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
            <a class="heritage-page__back" href="<?php echo esc_url( home_url( '/family' ) ); ?>">&larr; Family</a>
            <span class="page-hero__eyebrow">Five lines, one household</span>
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
                Family is its own kind of map. Mine has five lines pulling it in different directions &mdash; Cheesmans, Dochertys/McIvers, Lakemans, Rycrofts, and Haistes. Some I know inside and out. Others are still mostly names on paper and a few photographs I'm trying to put faces to. Each line has its own page; tap a card to follow it down.
            </p>
            <p class="heritage-intro__lead heritage-intro__lead--secondary">
                If you have a story, a photo, or a correction, send it my way. These pages are working drafts for as long as I can keep typing.
            </p>
        </div>
    </section>

    <!-- ==============================================================
         FIVE LINE CARDS
         Image-led cards in a responsive grid. Order matches the spoke
         numbering: 01 Cheesmans, 02 Dochertys, 03 Lakemans, 04 Rycrofts,
         05 Haistes. The whole tile is the link affordance — no separate
         "read more" needed because the entire card is clickable.
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
                        <span class="heritage-card__cta" aria-hidden="true">Read the line &rarr;</span>
                    </div>
                </a>

                <!-- 03 — Lakemans -->
                <a class="heritage-card" href="<?php echo esc_url( home_url( '/family/heritage/lakemans' ) ); ?>">
                    <div class="heritage-card__image">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2024/08/img_9355-1.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Martin Lakeman with his three sons', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                    </div>
                    <div class="heritage-card__body">
                        <span class="heritage-card__number" aria-hidden="true">03</span>
                        <h2 class="heritage-card__title">The Lakemans</h2>
                        <p class="heritage-card__subtitle">Indonesia, Holland, Calgary, and most places in between</p>
                        <p class="heritage-card__blurb">
                            My biological father's side. Dutch East Indies colonial roots, a great-grandfather who patrolled his district on horseback, a grandmother who lived to 100, and a story that rides Royal Dutch Shell across five continents.
                        </p>
                        <span class="heritage-card__cta" aria-hidden="true">Read the line &rarr;</span>
                    </div>
                </a>

                <!-- 04 — Rycrofts -->
                <a class="heritage-card" href="<?php echo esc_url( home_url( '/family/heritage/rycrofts' ) ); ?>">
                    <div class="heritage-card__image">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2024/10/papa-sam-and-p-scaled.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Papa Sam Rycroft holding newborn Patience', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                    </div>
                    <div class="heritage-card__body">
                        <span class="heritage-card__number" aria-hidden="true">04</span>
                        <h2 class="heritage-card__title">The Rycrofts</h2>
                        <p class="heritage-card__subtitle">Pioneers of the Region</p>
                        <p class="heritage-card__blurb">
                            Melanie's mother's side. The Alberta hamlet of Rycroft is named after her great-great-grandfather &mdash; settled in 1920 by four pioneers writing names on slips of paper and pulling one out of a hat.
                        </p>
                        <span class="heritage-card__cta" aria-hidden="true">Read the line &rarr;</span>
                    </div>
                </a>

                <!-- 05 — Haistes -->
                <a class="heritage-card" href="<?php echo esc_url( home_url( '/family/heritage/haistes' ) ); ?>">
                    <div class="heritage-card__image">
                        <img
                            src="<?php echo esc_url( home_url( '/wp-content/uploads/2024/10/20170330_160029-scaled.jpg' ) ); ?>"
                            alt="<?php esc_attr_e( 'Papa Dan Haiste meeting newborn Daniel', 'tc-ventures-child' ); ?>"
                            loading="lazy"
                        />
                    </div>
                    <div class="heritage-card__body">
                        <span class="heritage-card__number" aria-hidden="true">05</span>
                        <h2 class="heritage-card__title">The Haistes</h2>
                        <p class="heritage-card__subtitle">Yorkshire to the Peace Country</p>
                        <p class="heritage-card__blurb">
                            Melanie's father's side. Yorkshire textile-and-coal stock that emigrated to a Saskatchewan homestead around 1900 and, three generations later, settled across Alberta from Edmonton to Grande Prairie.
                        </p>
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
                If you're keeping score, my surname history runs Lakeman &rarr; Cheesman, my mom's runs Docherty &rarr; Lakeman &rarr; Cheesman, my wife's runs Rycroft &rarr; Haiste &rarr; Cheesman. Five family lines, one household, three kids who carry pieces of all of it. That's the map I'm trying to draw.
            </p>
        </div>
    </section>

</main>

<?php get_footer(); ?>
