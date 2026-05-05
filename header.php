<?php
/**
 * Custom Header Template — TC 'ventures Child Theme
 *
 * Overrides Astra's header.php. WordPress's template hierarchy looks in
 * the child theme first, so simply having this file here is enough — no
 * action hook required.
 *
 * Renders:
 *   1. <!doctype>, <html>, <head> with wp_head() so plugins/admin-bar can hook in.
 *   2. <body> with WordPress's body classes so plugin styles still target correctly.
 *   3. Skip-link for keyboard users (a11y).
 *   4. The fixed glass-capsule chrome (brand · clock · Menu trigger).
 *   5. The fullscreen overlay menu (hidden until JS opens it).
 *
 * Open/close, the live clock, and the per-link character stagger all
 * live in main.js (initSiteChrome). The capsule itself is purely CSS
 * once the markup is on the page; the menu's "open" state is driven by
 * a single class on <html>: html.tc-menu-open.
 */
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <link rel="profile" href="https://gmpg.org/xfn/11">
    <?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<a class="skip-link screen-reader-text" href="#primary"><?php esc_html_e( 'Skip to content', 'tc-ventures-child' ); ?></a>

<!-- ============================================================
     FLOATING GLASS CAPSULE
     Always visible (top-right). Houses brand, live clock, and
     the menu trigger. The trigger morphs into a close (✕) when
     html.tc-menu-open is active — see CSS.
     ============================================================ -->
<header class="tc-capsule" role="banner">
    <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="tc-capsule__brand" aria-label="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?> — Home">
        <span class="tc-capsule__brand-mark">TC</span>
        <span class="tc-capsule__brand-tail">'ventures</span>
    </a>

    <span class="tc-capsule__divider" aria-hidden="true"></span>

    <span class="tc-capsule__clock" aria-hidden="true">
        <span class="tc-capsule__clock-time" data-clock-time>--:--</span>
        <span class="tc-capsule__clock-zone" data-clock-zone>—</span>
    </span>

    <button
        type="button"
        class="tc-capsule__trigger"
        data-menu-trigger
        aria-controls="tc-menu"
        aria-expanded="false"
        aria-label="<?php esc_attr_e( 'Open menu', 'tc-ventures-child' ); ?>"
    >
        <span class="tc-capsule__trigger-label" data-trigger-label>Menu</span>
        <span class="tc-capsule__trigger-bars" aria-hidden="true">
            <span></span>
            <span></span>
        </span>
    </button>
</header>

<!-- ============================================================
     FULLSCREEN OVERLAY MENU
     Hidden by default (CSS: opacity 0, pointer-events none).
     When html.tc-menu-open is set, the backdrop fades in and the
     inner panel reveals; main.js then runs the GSAP stagger over
     each link's per-character spans.
     ============================================================ -->
<div
    class="tc-menu"
    id="tc-menu"
    role="dialog"
    aria-modal="true"
    aria-hidden="true"
    aria-label="<?php esc_attr_e( 'Site navigation', 'tc-ventures-child' ); ?>"
>
    <div class="tc-menu__backdrop" data-menu-backdrop aria-hidden="true"></div>

    <div class="tc-menu__inner">

        <nav class="tc-menu__nav" aria-label="<?php esc_attr_e( 'Primary', 'tc-ventures-child' ); ?>">
            <?php
            // TEMPORARY MENU (2026-04 → BHAG).
            //
            // We deliberately ignore any WP-admin "primary" menu while the
            // basic temporary menu is in service. The hardcoded list below
            // is the source of truth — easier to keep in sync with the
            // theme's growing page set than asking Thomas to maintain it
            // in WP admin in parallel.
            //
            // When the BHAG (persistent-canvas / topography) menu ships,
            // this whole block gets replaced. See memory:
            //   project_tc_bhag_living_document.md
            //
            // To re-enable WP-admin menu control later, restore the
            // has_nav_menu( 'primary' ) conditional that lived here in
            // commit history before 2026-04-27.
            ?>
            <ul class="tc-menu__list">
                <li><a href="<?php echo esc_url( home_url( '/' ) ); ?>">Home</a></li>
                <li><a href="<?php echo esc_url( home_url( '/about' ) ); ?>">About</a></li>
                <li><a href="<?php echo esc_url( home_url( '/timeline' ) ); ?>">Timeline</a></li>
                <li><a href="<?php echo esc_url( home_url( '/passport' ) ); ?>">Passport</a></li>
                <li><a href="<?php echo esc_url( home_url( '/scrapbook' ) ); ?>">Scrapbook</a></li>
                <li><a href="<?php echo esc_url( home_url( '/hcs' ) ); ?>">HCS</a></li>
                <li><a href="<?php echo esc_url( home_url( '/family' ) ); ?>">Family</a></li>
                <li><a href="<?php echo esc_url( home_url( '/journal' ) ); ?>">My Ramblings</a></li>
                <li><a href="<?php echo esc_url( home_url( '/contact' ) ); ?>">Contact</a></li>
            </ul>
        </nav>

        <div class="tc-menu__meta">
            <div class="tc-menu__meta-block">
                <span class="tc-menu__meta-label">Heritage</span>
                <ul class="tc-menu__meta-list">
                    <li><a href="<?php echo esc_url( home_url( '/family/heritage' ) ); ?>">Heritage</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/family/heritage/cheesmans' ) ); ?>">↳ Cheesmans</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/family/heritage/lakemans' ) ); ?>">↳ Lakemans</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/family/heritage/rycrofts' ) ); ?>">↳ Rycrofts</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/family/heritage/haistes' ) ); ?>">↳ Haistes</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/family/heritage/dochertys' ) ); ?>">↳ Dochertys</a></li>
                </ul>
            </div>
            <div class="tc-menu__meta-block">
                <span class="tc-menu__meta-label">Kids</span>
                <ul class="tc-menu__meta-list">
                    <li><a href="<?php echo esc_url( home_url( '/family/patience' ) ); ?>">Patience</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/family/daniel' ) ); ?>">Daniel</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/family/faith' ) ); ?>">Faith</a></li>
                </ul>
            </div>
            <div class="tc-menu__meta-block">
                <span class="tc-menu__meta-label">Elsewhere</span>
                <ul class="tc-menu__meta-list">
                    <li><a href="https://bareyourrare.org" target="_blank" rel="noopener noreferrer">Bare Your Rare <span aria-hidden="true">↗</span></a></li>
                    <li><a href="https://www.gpresidentialsociety.com" target="_blank" rel="noopener noreferrer">GPRS <span aria-hidden="true">↗</span></a></li>
                </ul>
            </div>
        </div>

    </div>
</div>
