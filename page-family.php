<?php
/**
 * Page Template: Family
 *
 * Auto-applied by WordPress to any page whose slug is `family`.
 *
 * Layout (top to bottom):
 *   1. Page hero (kinetic title + subtitle)
 *   2. Side-by-side hero photos (group + three kids)
 *   3. Page intro lead paragraph
 *   4. The family tree — a single illustrated tree with eight family-line
 *      chips along the canopy (five main lines + the three maternal lines
 *      beside their parents) and three kid chips at the roots. Each chip
 *      links to its spoke / long-read or per-person page.
 *   5. Heritage banner — a wider call-to-action linking to the
 *      /family/heritage hub for the deeper card-grid view of all 8 lines.
 *   6. Stories feed (posts categorized "family")
 *   7. Photo credit colophon
 */

get_header(); ?>

<main id="primary" class="site-main family-page">

    <!-- ==============================================================
         PAGE HERO
         Kinetic title + eyebrow + subtitle. No big gradient or horizon
         glow — those are reserved for the homepage hero.
         ============================================================== -->
    <section class="page-hero">
        <div class="container">
            <span class="page-hero__eyebrow">My Awesome Figgin' Family</span>
            <h1 class="page-hero__title kinetic-text">Family</h1>
            <p class="page-hero__subtitle kinetic-fade">
                The people I love and the stories we share
            </p>
        </div>
    </section>

    <!-- ==============================================================
         HERO PAIR
         Two hero photos side by side instead of stacked: the
         extended-family group on the left, the three kids on the right.
         Both eager-loaded — they're above the fold on desktop.
         ============================================================== -->
    <div class="hero-pair">
        <figure class="hero-pair__item">
            <img
                src="<?php echo esc_url( home_url( '/wp-content/uploads/2024/08/img_9320.jpg' ) ); ?>"
                alt="<?php esc_attr_e( 'Extended-family group photo, summer 2024', 'tc-ventures-child' ); ?>"
                loading="eager"
            />
        </figure>
        <figure class="hero-pair__item">
            <img
                src="<?php echo esc_url( home_url( '/wp-content/uploads/2024/08/fall-leaves-scaled.jpg' ) ); ?>"
                alt="<?php esc_attr_e( 'The three kids together', 'tc-ventures-child' ); ?>"
                loading="eager"
            />
        </figure>
    </div>

    <!-- ==============================================================
         PAGE INTRO
         Single lead paragraph in the narrower reading column.
         ============================================================== -->
    <section class="page-intro">
        <div class="container">
            <p class="page-intro__lead">
                This part of the site is about my kids and the families they came from. Patience, Daniel, and Faith are the reason I'm here &mdash; three kids I never thought I'd have, given the Hajdu-Cheney Syndrome that I figured I would never take that risk on. Around the three of them are the rest of it: Cheesmans, Dochertys and McIvers, Lakemans and Verbooms, Rycrofts and Steinkes, and Haistes. Eight family lines, a handful of stories, and the things I want my kids to be able to find later if they go looking.
            </p>
        </div>
    </section>

    <!-- ==============================================================
         THE FAMILY TREE
         A transparent-PNG tree image as the visual scaffolding, with
         eight chips positioned absolutely around it: 5 family-line
         chips along the canopy edge (top), 3 kid chips at the roots
         (bottom). Each chip is a link.

         Tree image: assets/img/family-tree.webp. Sized to a fixed
         aspect ratio so chip percentages stay anchored to the same
         visual landmarks at every breakpoint.

         Mobile fallback (< 768px, see CSS): the tree disappears and
         the chips become a clean stacked list, separated into a
         "Branches" group and a "Roots" group via CSS.
         ============================================================== -->
    <section class="family-tree-section scroll-animate">
        <div class="container">
            <h2 class="family-tree-section__heading kinetic-text-scroll">The Family Tree</h2>

            <div class="family-tree" role="navigation" aria-label="<?php esc_attr_e( 'Family tree — branches and roots', 'tc-ventures-child' ); ?>">
                <div class="family-tree__core" aria-hidden="true">
                    <img
                        class="family-tree__image"
                        src="<?php echo esc_url( get_stylesheet_directory_uri() . '/assets/img/family-tree.webp' ); ?>"
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                    />
                </div>

                <!-- Branches — eight family lines, numbered 01–08. The three
                     maternal lines (McIver, Verboom, Steinke) sit beside their
                     parent line on the canopy and link straight to their full
                     long-read, so they're reachable in one hop from here. -->
                <a class="tree-chip tree-chip--branch tree-chip--cheesmans" href="<?php echo esc_url( home_url( '/family/heritage/cheesmans' ) ); ?>">
                    <span class="tree-chip__eyebrow">01</span>
                    <span class="tree-chip__title">The Cheesmans</span>
                    <span class="tree-chip__cta">Read the line &rarr;</span>
                </a>
                <a class="tree-chip tree-chip--branch tree-chip--dochertys" href="<?php echo esc_url( home_url( '/family/heritage/dochertys' ) ); ?>">
                    <span class="tree-chip__eyebrow">02</span>
                    <span class="tree-chip__title">The Dochertys</span>
                    <span class="tree-chip__cta">Read the line &rarr;</span>
                </a>
                <a class="tree-chip tree-chip--branch tree-chip--mcivers" href="<?php echo esc_url( home_url( '/family/heritage/dochertys/mcivers' ) ); ?>">
                    <span class="tree-chip__eyebrow">03</span>
                    <span class="tree-chip__title">The McIvers</span>
                    <span class="tree-chip__cta">Read the line &rarr;</span>
                </a>
                <a class="tree-chip tree-chip--branch tree-chip--lakemans" href="<?php echo esc_url( home_url( '/family/heritage/lakemans' ) ); ?>">
                    <span class="tree-chip__eyebrow">04</span>
                    <span class="tree-chip__title">The Lakemans</span>
                    <span class="tree-chip__cta">Read the line &rarr;</span>
                </a>
                <a class="tree-chip tree-chip--branch tree-chip--verbooms" href="<?php echo esc_url( home_url( '/family/heritage/lakemans/verbooms' ) ); ?>">
                    <span class="tree-chip__eyebrow">05</span>
                    <span class="tree-chip__title">The Verbooms</span>
                    <span class="tree-chip__cta">Read the line &rarr;</span>
                </a>
                <a class="tree-chip tree-chip--branch tree-chip--rycrofts" href="<?php echo esc_url( home_url( '/family/heritage/rycrofts' ) ); ?>">
                    <span class="tree-chip__eyebrow">06</span>
                    <span class="tree-chip__title">The Rycrofts</span>
                    <span class="tree-chip__cta">Read the line &rarr;</span>
                </a>
                <a class="tree-chip tree-chip--branch tree-chip--steinkes" href="<?php echo esc_url( home_url( '/family/heritage/rycrofts/steinkes' ) ); ?>">
                    <span class="tree-chip__eyebrow">07</span>
                    <span class="tree-chip__title">The Steinkes</span>
                    <span class="tree-chip__cta">Read the line &rarr;</span>
                </a>
                <a class="tree-chip tree-chip--branch tree-chip--haistes" href="<?php echo esc_url( home_url( '/family/heritage/haistes' ) ); ?>">
                    <span class="tree-chip__eyebrow">08</span>
                    <span class="tree-chip__title">The Haistes</span>
                    <span class="tree-chip__cta">Read the line &rarr;</span>
                </a>

                <!-- Trunk — Thomas, the person the eight lines pour into. -->
                <a class="tree-chip tree-chip--trunk tree-chip--thomas" href="<?php echo esc_url( home_url( '/family/thomas' ) ); ?>">
                    <span class="tree-chip__title">Thomas</span>
                    <span class="tree-chip__role">Dad &mdash; my story</span>
                </a>

                <!-- Roots — the three kids, in chronological order. -->
                <a class="tree-chip tree-chip--root tree-chip--patience" href="<?php echo esc_url( home_url( '/family/patience' ) ); ?>">
                    <span class="tree-chip__title">Patience</span>
                    <span class="tree-chip__role">Daughter</span>
                </a>
                <a class="tree-chip tree-chip--root tree-chip--daniel" href="<?php echo esc_url( home_url( '/family/daniel' ) ); ?>">
                    <span class="tree-chip__title">Daniel</span>
                    <span class="tree-chip__role">Son</span>
                </a>
                <a class="tree-chip tree-chip--root tree-chip--faith" href="<?php echo esc_url( home_url( '/family/faith' ) ); ?>">
                    <span class="tree-chip__title">Faith</span>
                    <span class="tree-chip__role">Daughter</span>
                </a>
            </div>
        </div>
    </section>

    <!-- ==============================================================
         HERITAGE BANNER
         A wide horizontal CTA below the tree, linking to the
         /family/heritage hub. The tree gives jump links to each spoke;
         this banner is the "see all five together" alternative.
         ============================================================== -->
    <section class="heritage-banner-section scroll-animate">
        <div class="container">
            <a class="heritage-banner" href="<?php echo esc_url( home_url( '/family/heritage' ) ); ?>">
                <div class="heritage-banner__body">
                    <span class="heritage-banner__eyebrow">Heritage</span>
                    <h3 class="heritage-banner__title">Eight lines, one household</h3>
                    <p class="heritage-banner__copy">
                        The deeper read on where the kids came from &mdash; the Cheesmans, Dochertys, Lakemans, Rycrofts, and Haistes, and the McIver, Verboom, and Steinke lines that married into them, each with their own page.
                    </p>
                </div>
                <span class="heritage-banner__cta" aria-hidden="true">Read the lines &rarr;</span>
            </a>
            <p class="heritage-banner__maplink">
                Or watch all eight converge:
                <a href="<?php echo esc_url( home_url( '/family/heritage/map' ) ); ?>">the Lanterns of Record &mdash; four centuries of records on one map &rarr;</a>
            </p>
        </div>
    </section>

    <!-- ==============================================================
         PHOTO CREDIT
         Italic colophon line crediting the photographer of the
         summer 2024 family photos.
         ============================================================== -->
    <p class="page-credit">
        Most of the recent family photos on these pages were taken by my good friend Dalyn Echo in summer 2024. Thanks Dalyn.
    </p>

</main>

<?php get_footer(); ?>
