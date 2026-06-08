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

    <?php /* Preconnect hints for the four third-party origins we hit
       early in the page lifecycle. The browser opens TCP + TLS in
       parallel with HTML parsing, so by the time the corresponding
       <link rel=stylesheet> / <script src> tags are encountered the
       connection is warm. Saves ~100-200 ms of DNS+TLS on cold cache
       per origin.

       fonts.gstatic.com needs `crossorigin` because font files are
       always CORS-fetched; cdnjs + unpkg also serve scripts CORS so
       same treatment. fonts.googleapis.com serves CSS without CORS
       so no crossorigin attr. */ ?>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>
    <link rel="preconnect" href="https://unpkg.com" crossorigin>

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

    <a class="tc-capsule__weather"
       href="https://www.theweathernetwork.com/ca/weather/alberta/grande-prairie"
       target="_blank"
       rel="noopener noreferrer"
       data-tc-weather
       aria-label="<?php esc_attr_e( 'Current weather in Grande Prairie — opens The Weather Network', 'tc-ventures-child' ); ?>">
        <span class="tc-capsule__weather-icon" data-tc-weather-icon aria-hidden="true">·</span>
        <span class="tc-capsule__weather-temp" data-tc-weather-temp>--°</span>
    </a>

    <span class="tc-capsule__divider" aria-hidden="true"></span>

    <a class="tc-capsule__btc"
       href="https://www.coingecko.com/en/coins/bitcoin"
       target="_blank"
       rel="noopener noreferrer"
       data-tc-btc
       aria-label="<?php esc_attr_e( 'Current Bitcoin price in USD — opens CoinGecko', 'tc-ventures-child' ); ?>">
        <span class="tc-capsule__btc-icon" aria-hidden="true">&#8383;</span>
        <span class="tc-capsule__btc-price" data-tc-btc-price>$--</span>
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
     Replaces the legacy fullscreen overlay menu (retired in C4 of
     the desk-menu rebuild). Markup rendered by tc_render_desk_menu()
     from inc/desk-menu.php. Open/close handled by desk-menu.js,
     which binds to the same [data-menu-trigger] button above and
     toggles html.tc-desk-open.

     main.js's initSiteChrome() still runs (the live clock + reduced
     motion handling); it bails when #tc-menu is missing, so removing
     the old markup is enough — no main.js edit required.
     ============================================================ -->
<?php tc_render_desk_menu(); ?>
