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

    <?php /* No third-party preconnects: every front-end asset — display
       fonts, PhotoSwipe, Matter.js, pdf.js, hls.js, d3/topojson — is now
       self-hosted from the theme (PERF-1). The CDN origins we used to warm
       (fonts.googleapis.com / fonts.gstatic.com, cdnjs, unpkg) are gone,
       so the browser opens zero cross-origin connections for the site's
       own resources. */ ?>

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
    <?php /* No aria-label here: WCAG 2.5.3 wants the visible text ("TC
             'ventures") inside the accessible name, so the name is built
             from the content itself plus a screen-reader-only suffix. */ ?>
    <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="tc-capsule__brand">
        <span class="tc-capsule__brand-mark">TC</span>
        <span class="tc-capsule__brand-tail">'ventures</span>
        <span class="screen-reader-text"> &mdash; <?php echo esc_html( get_bloginfo( 'name' ) ); ?>, home</span>
    </a>

    <?php /* Full-width header navigation (desktop >=1000px only; CSS hides
             it below that, where the compact pill + mobile accordion take
             over). Condenses into the pill on scroll — see header-nav.css +
             initHeaderNav() in main.js. The section parents are disclosure
             buttons; each tray's first item is the hub/overview so the
             destination stays one click away. Links mirror the plain/mobile
             menus in inc/desk-menu.php. */ ?>
    <nav class="tc-headnav" aria-label="<?php esc_attr_e( 'Primary', 'tc-ventures-child' ); ?>">
        <ul class="tc-headnav__list">

            <li class="tc-headnav__item">
                <a class="tc-headnav__link" href="<?php echo esc_url( home_url( '/' ) ); ?>"<?php echo is_front_page() ? ' aria-current="page"' : ''; ?>>Home</a>
            </li>

            <li class="tc-headnav__item">
                <a class="tc-headnav__link" href="<?php echo esc_url( home_url( '/about' ) ); ?>"<?php echo is_page( 'about' ) ? ' aria-current="page"' : ''; ?>>About</a>
            </li>

            <li class="tc-headnav__item">
                <button type="button" class="tc-headnav__link tc-headnav__toggle" aria-expanded="false" aria-controls="hn-hcs">
                    HCS <span class="tc-headnav__chev" aria-hidden="true">&#x25BE;</span>
                </button>
                <div class="tc-headnav__drawer" id="hn-hcs">
                    <ul>
                        <li><a href="<?php echo esc_url( home_url( '/hcs' ) ); ?>">Hajdu-Cheney Syndrome</a></li>
                        <li><a href="<?php echo esc_url( home_url( '/hcs/case-studies' ) ); ?>">Case studies &amp; research</a></li>
                    </ul>
                </div>
            </li>

            <li class="tc-headnav__item">
                <button type="button" class="tc-headnav__link tc-headnav__toggle" aria-expanded="false" aria-controls="hn-family">
                    Family <span class="tc-headnav__chev" aria-hidden="true">&#x25BE;</span>
                </button>
                <div class="tc-headnav__drawer tc-headnav__drawer--family" id="hn-family">
                    <ul>
                        <li><a href="<?php echo esc_url( home_url( '/family' ) ); ?>">The family tree</a></li>
                        <li><a class="tc-plain-kid tc-plain-kid--patience" href="<?php echo esc_url( home_url( '/family/patience' ) ); ?>">Patience</a></li>
                        <li><a class="tc-plain-kid tc-plain-kid--daniel" href="<?php echo esc_url( home_url( '/family/daniel' ) ); ?>">Daniel</a></li>
                        <li><a class="tc-plain-kid tc-plain-kid--faith" href="<?php echo esc_url( home_url( '/family/faith' ) ); ?>">Faith</a></li>
                        <li><a href="<?php echo esc_url( home_url( '/family/thomas' ) ); ?>">Thomas &mdash; the long way round</a></li>
                        <li><a href="<?php echo esc_url( home_url( '/capybara' ) ); ?>">Faith&rsquo;s Capybara Clicker</a></li>
                    </ul>
                </div>
            </li>

            <li class="tc-headnav__item">
                <button type="button" class="tc-headnav__link tc-headnav__toggle" aria-expanded="false" aria-controls="hn-heritage">
                    Heritage <span class="tc-headnav__chev" aria-hidden="true">&#x25BE;</span>
                </button>
                <div class="tc-headnav__drawer tc-headnav__drawer--heritage" id="hn-heritage">
                    <ul class="tc-headnav__drawer-top">
                        <li><a href="<?php echo esc_url( home_url( '/family/heritage' ) ); ?>">Heritage hub</a></li>
                        <li><a href="<?php echo esc_url( home_url( '/family/heritage/map' ) ); ?>">The Map</a></li>
                    </ul>
                    <hr class="tc-headnav__drawer-rule">
                    <ul class="tc-headnav__lines">
                        <li><a href="<?php echo esc_url( home_url( '/family/heritage/cheesmans' ) ); ?>"><span class="tc-headnav__chip" style="--hn-chip:#E9C87E" aria-hidden="true"></span>Cheesmans</a></li>
                        <li><a href="<?php echo esc_url( home_url( '/family/heritage/dochertys' ) ); ?>"><span class="tc-headnav__chip" style="--hn-chip:#DFA8C8" aria-hidden="true"></span>Dochertys</a></li>
                        <li><a href="<?php echo esc_url( home_url( '/family/heritage/dochertys/mcivers' ) ); ?>"><span class="tc-headnav__chip" style="--hn-chip:#8FD0C6" aria-hidden="true"></span>McIvers</a></li>
                        <li><a href="<?php echo esc_url( home_url( '/family/heritage/lakemans' ) ); ?>"><span class="tc-headnav__chip" style="--hn-chip:#A8D5A2" aria-hidden="true"></span>Lakemans</a></li>
                        <li><a href="<?php echo esc_url( home_url( '/family/heritage/lakemans/verbooms' ) ); ?>"><span class="tc-headnav__chip" style="--hn-chip:#9FBCE8" aria-hidden="true"></span>Verbooms</a></li>
                        <li><a href="<?php echo esc_url( home_url( '/family/heritage/rycrofts' ) ); ?>"><span class="tc-headnav__chip" style="--hn-chip:#F0A58F" aria-hidden="true"></span>Rycrofts</a></li>
                        <li><a href="<?php echo esc_url( home_url( '/family/heritage/rycrofts/steinkes' ) ); ?>"><span class="tc-headnav__chip" style="--hn-chip:#A9BFCF" aria-hidden="true"></span>Steinkes</a></li>
                        <li><a href="<?php echo esc_url( home_url( '/family/heritage/haistes' ) ); ?>"><span class="tc-headnav__chip" style="--hn-chip:#B7A8E3" aria-hidden="true"></span>Haistes</a></li>
                    </ul>
                </div>
            </li>

            <li class="tc-headnav__item">
                <a class="tc-headnav__link" href="<?php echo esc_url( home_url( '/contact' ) ); ?>"<?php echo is_page( 'contact' ) ? ' aria-current="page"' : ''; ?>>Contact</a>
            </li>

            <li class="tc-headnav__item">
                <button type="button" class="tc-headnav__link tc-headnav__toggle" aria-expanded="false" aria-controls="hn-elsewhere">
                    Elsewhere <span class="tc-headnav__chev" aria-hidden="true">&#x25BE;</span>
                </button>
                <div class="tc-headnav__drawer" id="hn-elsewhere">
                    <ul>
                        <li><a href="https://bareyourrare.org" target="_blank" rel="noopener noreferrer">Bare Your Rare <span class="tc-headnav__ext" aria-hidden="true">&#x2197;</span></a></li>
                        <li><a href="https://www.gpresidentialsociety.com" target="_blank" rel="noopener noreferrer">GPRS <span class="tc-headnav__ext" aria-hidden="true">&#x2197;</span></a></li>
                        <li><a href="https://tc-timeline.vercel.app/" target="_blank" rel="noopener noreferrer">My whole life <span class="tc-headnav__ext" aria-hidden="true">&#x2197;</span></a></li>
                    </ul>
                </div>
            </li>

        </ul>
    </nav>

    <span class="tc-capsule__divider" aria-hidden="true"></span>

    <?php /* The visible text is the live temperature, which a static
             aria-label can never contain (WCAG 2.5.3) — so the accessible
             name is the temperature plus this screen-reader-only suffix. */ ?>
    <a class="tc-capsule__weather"
       href="https://www.theweathernetwork.com/ca/weather/alberta/grande-prairie"
       target="_blank"
       rel="noopener noreferrer"
       data-tc-weather>
        <span class="tc-capsule__weather-icon" data-tc-weather-icon aria-hidden="true">·</span>
        <span class="tc-capsule__weather-temp" data-tc-weather-temp>--°</span>
        <span class="screen-reader-text"> <?php esc_html_e( 'in Grande Prairie — opens The Weather Network', 'tc-ventures-child' ); ?></span>
    </a>

    <button
        type="button"
        class="tc-capsule__trigger"
        data-menu-trigger
        aria-controls="tc-desk-menu"
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
     DESK MENU — the BHAG navigation surface.
     G7 (payload diet, 2026-06): markup is NOT rendered here anymore.
     The plain list is the default menu and the desk is opt-in, so
     most visitors never open this overlay — inlining its ~25-30 KB
     of markup into every page cost everyone for a feature most never
     use. desk-menu.js fetches it from the tc_load_desk_menu AJAX
     action (inc/desk-menu.php) on the FIRST click of
     [data-menu-trigger], injects it, then wires it exactly as before.
     Open/close still toggles html.tc-desk-open once present.

     main.js's initSiteChrome() still runs (the live clock + reduced
     motion handling); it bails when #tc-menu is missing, so no
     main.js edit was needed.
     ============================================================ -->
