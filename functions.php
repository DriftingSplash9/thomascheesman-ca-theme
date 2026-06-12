<?php
/**
 * TC 'ventures Child Theme Functions
 */

/**
 * Helper includes — small reusable PHP-side renderers used across
 * multiple page templates. Kept in inc/ so each helper is one file
 * with one responsibility, easy to find and refactor.
 */
require_once get_stylesheet_directory() . '/inc/photo-gallery.php';
require_once get_stylesheet_directory() . '/inc/desk-menu.php';
require_once get_stylesheet_directory() . '/inc/games-leaderboard.php';
require_once get_stylesheet_directory() . '/inc/daily-quote.php';
require_once get_stylesheet_directory() . '/inc/agent-role.php';
require_once get_stylesheet_directory() . '/inc/agent-password-page.php';
require_once get_stylesheet_directory() . '/inc/agent-abilities.php';
require_once get_stylesheet_directory() . '/inc/email-smtp.php';
require_once get_stylesheet_directory() . '/inc/drawer-events.php';
require_once get_stylesheet_directory() . '/inc/security-and-seo.php';
require_once get_stylesheet_directory() . '/inc/cross-links.php';

/**
 * Enqueue parent and child theme styles and scripts.
 *
 * Load order is enforced via the third argument of wp_enqueue_style/script,
 * which declares dependencies. WordPress guarantees a handle's dependencies
 * are output before the handle itself.
 */
function tc_ventures_enqueue_scripts() {

    // Parent theme (Astra) stylesheet.
    // get_template_directory_uri() points to the PARENT theme folder.
    wp_enqueue_style(
        'astra-parent-style',
        get_template_directory_uri() . '/style.css',
        array(),
        wp_get_theme( 'astra' )->get( 'Version' )
    );

    // PhotoSwipe v5 lightbox CSS (CDN). The JS for PhotoSwipe is
    // dynamically imported by main.js's initLightbox() the first time
    // the user clicks a figure — keeps the initial load light.
    //
    // Enqueued BEFORE the child stylesheet so the child can override
    // PhotoSwipe's defaults (frosted pills on buttons, counter, etc.).
    // Same-specificity selectors lose if PhotoSwipe loads later.
    wp_enqueue_style(
        'photoswipe',
        'https://unpkg.com/photoswipe@5.4.4/dist/photoswipe.css',
        array(),
        '5.4.4'
    );

    // Child theme stylesheet — must load AFTER the parent and AFTER
    // PhotoSwipe so it can override either. get_stylesheet_uri() points
    // to the CHILD theme's style.css.
    wp_enqueue_style(
        'astra-child-style',
        get_stylesheet_uri(),
        array( 'astra-parent-style', 'photoswipe' ),
        wp_get_theme()->get( 'Version' )
    );

    // Child-theme Google Fonts — Italiana + Fraunces + Caveat.
    //
    //   Italiana (400)     — Didone display serif used by the lightbox
    //                        counter ("01 / 06").
    //   Fraunces (var)     — variable serif used by the footer marquee.
    //                        Two axes: wght 300..900 drives the per-
    //                        character "breathing" at the marquee edges,
    //                        opsz 9..144 keeps display sizes from looking
    //                        thin. Google serves a single variable file
    //                        covering both ranges.
    //   Caveat (400, 600)  — handwritten font used by the desk-menu hover
    //                        cards (small attribution slips that fade in
    //                        on hotspot hover).
    //
    // Combined into a single Google Fonts request — Google supports
    // multiple `family=` params per CSS URL — so the browser opens one
    // TLS connection to fonts.googleapis.com instead of three. Saves
    // 2 RTTs on cold cache (was tc-italiana + tc-fraunces + tc-caveat).
    // The corresponding preconnect hints live in header.php.
    wp_enqueue_style(
        'tc-google-fonts',
        'https://fonts.googleapis.com/css2'
            . '?family=Italiana'
            . '&family=Fraunces:opsz,wght@9..144,300..900'
            . '&family=Caveat:wght@400;600'
            . '&display=swap',
        array(),
        null
    );

    // Desk menu — the BHAG navigation surface. Loaded site-wide; the
    // overlay is always in the DOM (rendered by tc_render_desk_menu()
    // from inc/desk-menu.php) but hidden by default. Activated by setting
    // html.tc-desk-open via the menu-trigger button (wired in C4).
    //
    // Depends on astra-child-style so its rules can override sitewide
    // defaults. Version bumps via the child theme's style.css header.
    wp_enqueue_style(
        'tc-desk-menu',
        get_stylesheet_directory_uri() . '/assets/css/desk-menu.css',
        array( 'astra-child-style' ),
        wp_get_theme()->get( 'Version' )
    );

    // GSAP core library (CDN).
    wp_enqueue_script(
        'gsap-core',
        'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js',
        array(),
        '3.12.2',
        false
    );

    // GSAP ScrollTrigger plugin — depends on GSAP core.
    wp_enqueue_script(
        'gsap-scroll-trigger',
        'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js',
        array( 'gsap-core' ),
        '3.12.2',
        false
    );

    // (GSAP MotionPathPlugin enqueue was removed with the jeep timeline.)

    // Three.js (UMD build) — used by main.js to drive the WebGL background.
    // Pinned to r128 because it's widely cached on cdnjs and definitively
    // has the UMD `three.min.js` artifact. Newer releases (r150+) shifted
    // to ES modules and the UMD path is unreliable across CDNs.
    wp_enqueue_script(
        'three-js',
        'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
        array(),
        'r128',
        true
    );

    // Custom main JavaScript — depends on GSAP, ScrollTrigger, and Three.js.
    // Loaded in the footer (final arg = true) so it runs after DOM parse.
    // Version reads from the child theme's style.css header so a single
    // bump there cache-busts both CSS and JS in one place.
    wp_enqueue_script(
        'tc-ventures-main',
        get_stylesheet_directory_uri() . '/assets/js/main.js',
        array( 'gsap-core', 'gsap-scroll-trigger', 'three-js' ),
        wp_get_theme()->get( 'Version' ),
        true
    );

    // Expose a small data object from PHP to main.js as window.tcVentures.
    wp_localize_script( 'tc-ventures-main', 'tcVentures', array(
        'siteUrl'  => home_url(),
        'themeUrl' => get_stylesheet_directory_uri(),
    ));

    // Desk menu interactions. Self-contained module: wires the drawer
    // + search affordances inside the .tc-desk overlay. Open/close of
    // the overlay itself is wired in header.php / main.js in C4.
    // No JS deps; loaded in the footer after DOM parse.
    wp_enqueue_script(
        'tc-desk-menu',
        get_stylesheet_directory_uri() . '/assets/js/desk-menu.js',
        array(),
        wp_get_theme()->get( 'Version' ),
        true
    );

    // Desk-games arcade. The canvas games (Snake / Pong / Pac-Man /
    // Asteroids / Brickles / Solitaire) tucked behind the toad
    // hotspot. Depends on desk-menu.js for the drawer's open/close
    // wiring; this file owns picker→play view switching, the game
    // loops, and the REST-backed leaderboard wiring.
    wp_enqueue_script(
        'tc-desk-games',
        get_stylesheet_directory_uri() . '/assets/js/desk-games.js',
        array( 'tc-desk-menu' ),
        wp_get_theme()->get( 'Version' ),
        true
    );
    wp_localize_script(
        'tc-desk-games',
        'tcDeskGames',
        array(
            'scoresUrl' => esc_url_raw( rest_url( 'tc-games/v1/scores' ) ),
            // Per-game SFX + a shared background loop. Played inline
            // inside the game loops via a small playSfx() helper at
            // the top of desk-games.js. The bg loop is owned by the
            // picker→play transition (started on play, stopped on
            // back/game-over). See assets/audio/CREDITS.md for
            // attribution.
            'audio' => array(
                'pongHit'         => get_stylesheet_directory_uri() . '/assets/audio/pong-hit.mp3?ver=' . rawurlencode( wp_get_theme()->get( 'Version' ) ),
                'asteroidsShoot'  => get_stylesheet_directory_uri() . '/assets/audio/asteroids-shoot.mp3?ver=' . rawurlencode( wp_get_theme()->get( 'Version' ) ),
                'arcadeBg'        => get_stylesheet_directory_uri() . '/assets/audio/arcade-bg.mp3?ver=' . rawurlencode( wp_get_theme()->get( 'Version' ) ),
            ),
            // Cache-buster for the lazy-loaded desk-pinball.js; reads
            // the same Version: header that cache-busts every other
            // CSS/JS handle, so a single style.css version bump
            // invalidates the pinball script too.
            'version'   => wp_get_theme()->get( 'Version' ),
        )
    );

    // The Drawer footer — sitemap compartments + daily quote + giant
    // click-to-copy email + live clock + a marble that escalates into
    // pinball. The pinball script (desk-pinball.js) and Matter.js are
    // lazy-loaded by desk-drawer.js on first marble click, so visitors
    // who never trigger it pay zero. Loaded site-wide because footer.php
    // is the global footer template.
    wp_enqueue_style(
        'tc-desk-drawer',
        get_stylesheet_directory_uri() . '/assets/css/desk-drawer.css',
        array( 'astra-child-style', 'tc-google-fonts' ),
        wp_get_theme()->get( 'Version' )
    );
    wp_enqueue_style(
        'tc-desk-pinball',
        get_stylesheet_directory_uri() . '/assets/css/desk-pinball.css',
        array( 'tc-desk-drawer' ),
        wp_get_theme()->get( 'Version' )
    );
    wp_enqueue_script(
        'tc-desk-drawer',
        get_stylesheet_directory_uri() . '/assets/js/desk-drawer.js',
        array( 'tc-desk-games' ),
        wp_get_theme()->get( 'Version' ),
        true
    );

    // The Secret Drawer — the loose-handle easter egg in the footer's
    // brass pull. Tightening the handle opens the junk-drawer overlay;
    // opening it lazy-loads the Phase 2 interaction engine.
    // The shell CSS + JS are small and load site-wide (the handle must
    // be live on every page). The junk-drawer background image AND
    // drawer-engine.js are lazy-loaded only once a visitor opens the
    // drawer — so non-curious visitors pay nothing.
    $tc_theme_ver = wp_get_theme()->get( 'Version' );

    wp_enqueue_style(
        'tc-secret-drawer',
        get_stylesheet_directory_uri() . '/assets/css/secret-drawer.css',
        array( 'tc-desk-drawer' ),
        $tc_theme_ver
    );
    wp_enqueue_style(
        'tc-drawer-engine',
        get_stylesheet_directory_uri() . '/assets/css/drawer-engine.css',
        array( 'tc-secret-drawer' ),
        $tc_theme_ver
    );
    wp_enqueue_script(
        'tc-secret-drawer',
        get_stylesheet_directory_uri() . '/assets/js/secret-drawer.js',
        array( 'tc-desk-drawer' ),
        $tc_theme_ver,
        true
    );

    // The Lanterns of Record — the converging-families map at /map
    // (page-map.php; spec at docs/CONVERGING-MAP-SPEC.md). D3 + the
    // topojson client (CDN, pinned) and the map engine load ONLY on
    // the map page; the merged dataset (inc/data/family-map.json,
    // generated off-repo by _xlsx2map.py) and the self-hosted world
    // topology are fetched lazily by the script itself.
    if ( is_page( 'map' ) ) {
        wp_enqueue_style(
            'tc-family-map',
            get_stylesheet_directory_uri() . '/assets/css/family-map.css',
            array( 'astra-child-style' ),
            $tc_theme_ver
        );
        wp_enqueue_script(
            'd3',
            'https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js',
            array(),
            '7.8.5',
            true
        );
        // The full topojson bundle, not topojson-client — cdnjs does not
        // host the client-only package (404 verified 2026-06-11). Same
        // `topojson.feature` global either way.
        wp_enqueue_script(
            'topojson-client',
            'https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js',
            array(),
            '3.0.2',
            true
        );
        wp_enqueue_script(
            'tc-family-map',
            get_stylesheet_directory_uri() . '/assets/js/family-map.js',
            array( 'd3', 'topojson-client' ),
            $tc_theme_ver,
            true
        );
        wp_localize_script( 'tc-family-map', 'tcFamilyMap', array(
            'dataUrl'      => get_stylesheet_directory_uri() . '/inc/data/family-map.json?ver=' . rawurlencode( $tc_theme_ver ),
            'worldUrl'     => get_stylesheet_directory_uri() . '/assets/data/world-110m.json?ver=' . rawurlencode( $tc_theme_ver ),
            'heritageBase' => home_url( '/family/heritage/' ),
        ) );
    }

    // Load + enrich the puzzle data: resolve every surface/object
    // attachment ID to a URL so the engine (JS) never has to. Phase 4
    // edits drawer-puzzle.json only; this code does not change.
    $tc_puzzle      = array();
    $tc_puzzle_path = get_stylesheet_directory() . '/inc/data/drawer-puzzle.json';
    if ( is_readable( $tc_puzzle_path ) ) {
        $tc_decoded = json_decode( file_get_contents( $tc_puzzle_path ), true );
        if ( is_array( $tc_decoded ) ) {
            $tc_puzzle = $tc_decoded;
        }
    }
    if ( ! empty( $tc_puzzle['surfaces'] ) && is_array( $tc_puzzle['surfaces'] ) ) {
        foreach ( $tc_puzzle['surfaces'] as $tc_sk => $tc_sid ) {
            $tc_puzzle['surfaces'][ $tc_sk ] = wp_get_attachment_image_url( (int) $tc_sid, 'full' );
        }
    }
    if ( ! empty( $tc_puzzle['objects'] ) && is_array( $tc_puzzle['objects'] ) ) {
        foreach ( $tc_puzzle['objects'] as $tc_ok => $tc_obj ) {
            if ( empty( $tc_obj['media'] ) ) {
                continue;
            }
            $tc_aid  = (int) $tc_obj['media'];
            $tc_mime = (string) get_post_mime_type( $tc_aid );
            if ( $tc_mime && 0 === strpos( $tc_mime, 'video/' ) ) {
                // Video attachments don't have wp_get_attachment_image_url
                // variants — pull the raw file URL for the engine's
                // `video:` verb. If the video has a featured-image still
                // assigned, that becomes the on-drawer thumbnail.
                $tc_puzzle['objects'][ $tc_ok ]['videoUrl'] = wp_get_attachment_url( $tc_aid );
                $tc_poster_id = (int) get_post_thumbnail_id( $tc_aid );
                if ( $tc_poster_id ) {
                    $tc_puzzle['objects'][ $tc_ok ]['mediaUrl'] =
                        wp_get_attachment_image_url( $tc_poster_id, 'full' );
                }
            } else {
                $tc_puzzle['objects'][ $tc_ok ]['mediaUrl'] =
                    wp_get_attachment_image_url( $tc_aid, 'full' );
            }
        }
    }

    // Resolve any `gallery: [id, id, …]` action arrays to
    // `[ {src,w,h}, … ]` so the engine can feed them straight into
    // PhotoSwipe without a runtime REST round-trip per image.
    // Walks recursively because gallery actions can live inside choice
    // option do-lists, passcode success/failure, etc.
    if ( ! empty( $tc_puzzle['interactions'] ) && is_array( $tc_puzzle['interactions'] ) ) {
        $tc_resolve_gallery = function ( &$list ) use ( &$tc_resolve_gallery ) {
            if ( ! is_array( $list ) ) {
                return;
            }
            foreach ( $list as &$tc_node ) {
                if ( ! is_array( $tc_node ) ) {
                    continue;
                }
                if ( isset( $tc_node['gallery'] ) && is_array( $tc_node['gallery'] ) ) {
                    $tc_resolved = array();
                    foreach ( $tc_node['gallery'] as $tc_gid ) {
                        if ( ! is_numeric( $tc_gid ) ) {
                            continue;
                        }
                        $tc_info = wp_get_attachment_image_src( (int) $tc_gid, 'full' );
                        if ( $tc_info ) {
                            $tc_resolved[] = array(
                                'src' => $tc_info[0],
                                'w'   => (int) $tc_info[1],
                                'h'   => (int) $tc_info[2],
                            );
                        }
                    }
                    $tc_node['gallery'] = $tc_resolved;
                }
                if ( isset( $tc_node['after'] ) )   $tc_resolve_gallery( $tc_node['after'] );
                if ( isset( $tc_node['success'] ) ) $tc_resolve_gallery( $tc_node['success'] );
                if ( isset( $tc_node['failure'] ) ) $tc_resolve_gallery( $tc_node['failure'] );
                if ( isset( $tc_node['passcode']['success'] ) ) $tc_resolve_gallery( $tc_node['passcode']['success'] );
                if ( isset( $tc_node['passcode']['failure'] ) ) $tc_resolve_gallery( $tc_node['passcode']['failure'] );
                if ( isset( $tc_node['choice']['options'] ) && is_array( $tc_node['choice']['options'] ) ) {
                    foreach ( $tc_node['choice']['options'] as &$tc_opt ) {
                        if ( isset( $tc_opt['do'] ) ) {
                            $tc_resolve_gallery( $tc_opt['do'] );
                        }
                    }
                    unset( $tc_opt );
                }
            }
            unset( $tc_node );
        };
        foreach ( $tc_puzzle['interactions'] as &$tc_it ) {
            if ( isset( $tc_it['do'] ) ) {
                $tc_resolve_gallery( $tc_it['do'] );
            }
        }
        unset( $tc_it );
    }

    // The signature SVG, inlined so the engine's clue cards can sign
    // themselves without baking a separate paper image.
    $tc_signature_svg = '';
    $tc_sig_file      = get_stylesheet_directory() . '/assets/svg/signature.svg';
    if ( is_readable( $tc_sig_file ) ) {
        $tc_signature_svg = file_get_contents( $tc_sig_file );
    }

    wp_localize_script(
        'tc-secret-drawer',
        'tcSecretDrawer',
        array(
            'assets' => array(
                // The initial overlay background (preloaded on first hover
                // of the brass pull). Once the engine boots, the puzzle's
                // `surfaces` array takes over — this is just so the very
                // first frame after opening already has art behind it.
                // Must match `start` in drawer-puzzle.json (junk-clean).
                'junkClean' => wp_get_attachment_image_url( 3660, 'full' ),
                // Theme-bundled audio. Files ship with the deploy
                // (assets/audio/) and need no media-library upload.
                // See assets/audio/CREDITS.md for attribution.
                'pacmanStartup'  => get_stylesheet_directory_uri() . '/assets/audio/pacman-startup.mp3?ver=' . rawurlencode( $tc_theme_ver ),
                'pacmanLoop'     => get_stylesheet_directory_uri() . '/assets/audio/pacman-loop.mp3?ver=' . rawurlencode( $tc_theme_ver ),
                // Whoosh played on every drawer combine (screwdriver+
                // screw, banana+tape, etc.). The Faberge reveal is a
                // `video:` action, not a combine, so it plays its own
                // audio independently.
                'combineWhoosh'  => get_stylesheet_directory_uri() . '/assets/audio/combine-whoosh.mp3?ver=' . rawurlencode( $tc_theme_ver ),
            ),
            'engineUrl'    => get_stylesheet_directory_uri()
                . '/assets/js/drawer-engine.js?ver=' . rawurlencode( $tc_theme_ver ),
            'eventUrl'     => esc_url_raw( rest_url( 'tc-drawer/v1/event' ) ),
            'signatureSvg' => $tc_signature_svg,
            'puzzle'       => $tc_puzzle,
        )
    );

    // --- Asset diet: defer + dequeue ---------------------------------
    //
    // Mark heavy third-party JS as defer so they don't block HTML parsing.
    // GSAP + ScrollTrigger were enqueued in the head (the false fifth arg
    // a few hundred lines up). With strategy=defer the browser still
    // fetches them in parallel with the document, but executes them after
    // the parser is done — which moves them off the critical render path
    // without breaking dependency order (defer scripts in head still run
    // before footer scripts, so tc-ventures-main can rely on them).
    //
    // Three.js is in the footer already so defer is mostly a no-op for
    // it, but harmless and consistent.
    //
    // wp_script_add_data( $handle, 'strategy', 'defer' ) is the WP 6.3+
    // official API. Replaces the old script_loader_tag string-replace
    // hacks.
    foreach ( array( 'gsap-core', 'gsap-scroll-trigger', 'three-js' ) as $tc_defer_handle ) {
        wp_script_add_data( $tc_defer_handle, 'strategy', 'defer' );
    }

    // Drop Astra's Open Sans + Playfair Google Fonts. The child theme
    // overrides all typography (Fraunces / Italiana / Caveat for display,
    // Inter system fallback for body), so the Astra-supplied fonts
    // download on every page and never paint. Saves one render-blocking
    // <link> + one cross-origin handshake on cold cache.
    //
    // If anything in the Astra UI ends up falling back to a system font
    // that looks wrong, re-enable by removing this dequeue.
    wp_dequeue_style( 'astra-google-fonts' );

    // Faith's CopyCatCapybara Clicker — only on its own page template, so
    // the rest of the site pays nothing. REST leaderboard URL passed in;
    // the four boards (capybara-5/15/30/60) are whitelisted in
    // inc/games-leaderboard.php.
    if ( is_page( 'capybara' ) || is_page_template( 'page-capybara.php' ) ) {
        $tc_ver = wp_get_theme()->get( 'Version' );
        wp_enqueue_style(
            'tc-capybara',
            get_stylesheet_directory_uri() . '/assets/css/capybara.css',
            array( 'astra-child-style', 'tc-google-fonts' ),
            $tc_ver
        );
        wp_enqueue_script(
            'tc-capybara',
            get_stylesheet_directory_uri() . '/assets/js/capybara.js',
            array(),
            $tc_ver,
            true
        );
        wp_localize_script(
            'tc-capybara',
            'tcCapybara',
            array(
                'scoresUrl' => esc_url_raw( rest_url( 'tc-games/v1/scores' ) ),
            )
        );
    }

}
add_action( 'wp_enqueue_scripts', 'tc_ventures_enqueue_scripts' );


/**
 * Asset diet, part 2: lazy-load drawer-puzzle stylesheets.
 *
 * `drawer-engine.css` (46 KB) + `desk-pinball.css` (6 KB) ship on every
 * page because the footer drawer is global, but they only paint when a
 * visitor interacts with the secret-drawer puzzle or the pinball table.
 * Eager-loading them blocks render on every page for an interaction the
 * vast majority of visitors won't trigger.
 *
 * The fix: emit them as `<link rel="preload" as="style" onload="...">`
 * so the browser downloads them at low priority in parallel with the
 * critical render path, then applies them as a stylesheet once loaded.
 * No JS gating needed — if a visitor opens the drawer, the CSS is
 * already present or about to be; if they don't, the bytes are still
 * downloaded but never block paint.
 *
 * The <noscript> fallback restores eager-load for visitors without JS
 * — they can't open the drawer anyway, but the styling stays consistent
 * if they ever do.
 */
function tc_defer_heavy_stylesheets( $tag, $handle ) {
    $deferred = array( 'tc-drawer-engine', 'tc-desk-pinball' );
    if ( ! in_array( $handle, $deferred, true ) ) {
        return $tag;
    }
    // WP emits style tags with single-quoted attributes. Swap rel and add
    // the preload onload swap dance. Preserve the original tag for the
    // <noscript> fallback so the same URL + media + version-string apply.
    $preload = str_replace(
        array( "rel='stylesheet'", 'rel="stylesheet"' ),
        "rel='preload' as='style' onload=\"this.onload=null;this.rel='stylesheet'\"",
        $tag
    );
    return $preload . '<noscript>' . $tag . '</noscript>';
}
add_filter( 'style_loader_tag', 'tc_defer_heavy_stylesheets', 10, 2 );

/**
 * Bing Webmaster Tools — site verification.
 *
 * Bing verifies ownership by fetching a token file at the site root.
 * They generate a `BingSiteAuth.xml` containing a one-line user token
 * and expect it served from `https://thomascheesman.ca/BingSiteAuth.xml`.
 *
 * Rather than ship the file via Hostinger's File Manager (which means
 * a file that lives outside this repo and can drift), we intercept
 * the exact URL via WordPress's `parse_request` action — which fires
 * before WP tries to match the URL against posts/pages — and emit the
 * XML response directly.
 *
 * Token from the Bing-generated file (Downloads/BingSiteAuth.xml,
 * 2026-05-20). If Bing ever asks for re-verification with a new token,
 * update this constant and push.
 */
const TC_BING_VERIFY_TOKEN = '5776B695B9937BEFEC7FA41711B62BA9';

// Method 1: serve the XML token file at /BingSiteAuth.xml. Intercept
// the URL before WP tries to match it to a post/page.
add_action( 'parse_request', function () {
    $req = isset( $_SERVER['REQUEST_URI'] ) ? $_SERVER['REQUEST_URI'] : '';
    // Match the exact path with or without a trailing slash and ignore
    // any query string. Case-insensitive because Bing has historically
    // probed with mixed casing.
    $path = strtolower( strtok( $req, '?' ) );
    if ( $path === '/bingsiteauth.xml' || $path === '/bingsiteauth.xml/' ) {
        status_header( 200 );
        nocache_headers();
        header( 'Content-Type: application/xml; charset=UTF-8' );
        echo "<?xml version=\"1.0\"?>\n";
        echo "<users>\n";
        echo "\t<user>" . TC_BING_VERIFY_TOKEN . "</user>\n";
        echo "</users>\n";
        exit;
    }
}, 0 );

// Method 2: emit the <meta name="msvalidate.01"> tag in <head> on
// every page. Bing's note when generating the tag: "don't remove
// the meta tag even after verification succeeds" — they spot-check
// periodically. wp_head priority 1 puts it near the top of <head>.
add_action( 'wp_head', function () {
    echo '<meta name="msvalidate.01" content="' . esc_attr( TC_BING_VERIFY_TOKEN ) . '" />' . "\n";
}, 1 );

/**
 * Theme setup: register features the theme supports.
 * Runs once, after Astra's own after_setup_theme.
 */
function tc_ventures_setup() {
    add_theme_support( 'title-tag' );
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'custom-logo' );
    add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption' ) );

    register_nav_menus( array(
        'primary' => esc_html__( 'Primary Menu', 'tc-ventures-child' ),
        'footer'  => esc_html__( 'Footer Menu', 'tc-ventures-child' ),
    ));
}
add_action( 'after_setup_theme', 'tc_ventures_setup' );

/**
 * Disable WordPress attachment pages.
 *
 * Every file uploaded to the Media Library gets a public "attachment page"
 * at /<slug>/ that mirrors the file. They:
 *   - Have no value to visitors (the actual file URL already serves the file)
 *   - Hijack slugs we want for real pages — uploading family.jpg made
 *     /family/ permanently route to the JPEG, blocking the Family page
 *   - Often get indexed as duplicate/thin content by search engines
 *
 * This filter marks the `attachment` post type as not publicly queryable
 * and removes its rewrite rule. Attachment URLs return 404 (or, via the
 * belt-and-suspenders redirect below, send visitors to the file itself).
 *
 * IMPORTANT — after deploying this, visit `Settings → Permalinks` in WP
 * admin and click `Save Changes` (no fields need to be touched). That
 * flushes the cached rewrite rules so the change actually takes effect.
 */
function tc_ventures_disable_attachment_pages( $args, $post_type ) {
    if ( 'attachment' === $post_type ) {
        $args['publicly_queryable'] = false;
        $args['rewrite']            = false;
    }
    return $args;
}
add_filter( 'register_post_type_args', 'tc_ventures_disable_attachment_pages', 10, 2 );

/**
 * Belt-and-suspenders: if a stale link or external referrer still hits
 * an attachment URL after the filter above, redirect to the file's
 * direct URL (under /wp-content/uploads/...) so we don't break inbound
 * links to images during the transition.
 */
function tc_ventures_redirect_attachment_to_file() {
    if ( is_attachment() ) {
        $file_url = wp_get_attachment_url( get_queried_object_id() );
        if ( $file_url ) {
            wp_safe_redirect( $file_url, 301 );
            exit;
        }
    }
}
add_action( 'template_redirect', 'tc_ventures_redirect_attachment_to_file' );

/**
 * Allow pages and posts to reclaim slugs that are "taken" by attachments.
 *
 * WordPress enforces slug uniqueness across ALL post types — so even
 * after we've disabled attachment URLs above, the slug records in the
 * database still count as taken. Result: trying to publish a page named
 * "Family" with a family.jpg attachment present will auto-rename the
 * page slug to "family-2", "family-3", etc.
 *
 * This filter looks at the slug WP wants to use (the modified one) and
 * the original slug the user requested. If the only conflict for the
 * original slug is with an attachment, we hand back the original — the
 * attachment's slug doesn't matter anymore because attachment URLs no
 * longer route. Pages and other posts are still checked normally, so
 * two real pages can't ever share a slug.
 *
 * Filter signature ref: WP core's `wp_unique_post_slug`.
 */
function tc_ventures_allow_page_slug_over_attachment( $slug, $post_id, $post_status, $post_type, $post_parent, $original_slug ) {
    // Only relevant when WP changed the slug (collision detected) and
    // the post being saved is a page or a regular post.
    if ( $slug === $original_slug ) {
        return $slug;
    }
    if ( ! in_array( $post_type, array( 'page', 'post' ), true ) ) {
        return $slug;
    }

    global $wpdb;

    // Direct DB check: is there any *non-attachment* post with this
    // slug, excluding the current one and excluding trashed / auto-draft
    // entries? If not, the conflict was only with attachments — safe to
    // reuse the original slug.
    $conflict = $wpdb->get_var( $wpdb->prepare(
        "SELECT ID FROM {$wpdb->posts}
         WHERE post_name = %s
           AND post_type != 'attachment'
           AND post_status NOT IN ('trash', 'auto-draft')
           AND ID != %d
         LIMIT 1",
        $original_slug,
        $post_id
    ) );

    if ( ! $conflict ) {
        return $original_slug;
    }

    return $slug;
}
add_filter( 'wp_unique_post_slug', 'tc_ventures_allow_page_slug_over_attachment', 10, 6 );

/**
 * Contact form — formerly server-side via wp_mail() to wecare@bareyourrare.org
 * with Gmail POP3 fetching. That path was abandoned 2026-05-11 after
 * persistent delivery flakiness (Gmail forwarder dropping silently,
 * Hostinger SMTP failing SPF on outbound to gmail.com, POP fetches
 * stalling). The /contact form now uses a client-side mailto: composer
 * (see initContactMailto() in main.js) — visitor's own email client
 * sends the message, no server-side mail at all.
 *
 * The TC_CONTACT_RECIPIENT constant in wp-config.php is now unused
 * but harmless if left defined.
 */

/**
 * Placeholders — uncomment when ready.
 */

// Custom post type example (stories, projects, etc.):
// function tc_ventures_register_post_types() {
//     register_post_type( 'tc_story', array(
//         'label'    => 'Stories',
//         'public'   => true,
//         'supports' => array( 'title', 'editor', 'thumbnail' ),
//     ));
// }
// add_action( 'init', 'tc_ventures_register_post_types' );

// Disable Gutenberg editor entirely (we want PHP templates, not blocks):
// add_filter( 'use_block_editor_for_post_type', '__return_false', 10 );

/**
 * Render the "Read next" carousel — a horizontal strip of other posts.
 *
 * Lives in one place so single.php and the bespoke page/post templates
 * (e.g. the case-studies page, the Proud Of Canada essay) can all drop
 * it in. initPostCarousel() in main.js drives the prev/next arrows.
 */
function tc_render_read_next() {
    $q = new WP_Query( array(
        'post_type'           => 'post',
        'posts_per_page'      => 9,
        'post__not_in'        => array( get_queried_object_id() ),
        'orderby'             => 'date',
        'order'               => 'DESC',
        'ignore_sticky_posts' => true,
    ) );
    if ( ! $q->have_posts() ) {
        return;
    }
    ?>
    <section class="post-carousel" aria-label="<?php esc_attr_e( 'More posts to read', 'tc-ventures-child' ); ?>">
        <div class="container">
            <h2 class="post-carousel__heading">Read next</h2>
            <div class="post-carousel__viewport">
                <button type="button" class="post-carousel__arrow post-carousel__arrow--prev" aria-label="<?php esc_attr_e( 'Scroll back', 'tc-ventures-child' ); ?>">&larr;</button>
                <ul class="post-carousel__track">
                    <?php while ( $q->have_posts() ) : $q->the_post(); ?>
                        <li class="post-carousel__item">
                            <a class="post-carousel__card" href="<?php the_permalink(); ?>">
                                <span class="post-carousel__thumb">
                                    <?php
                                    if ( has_post_thumbnail() ) {
                                        the_post_thumbnail( 'medium' );
                                    } else {
                                        echo '<span class="post-carousel__thumb-fallback" aria-hidden="true">TC</span>';
                                    }
                                    ?>
                                </span>
                                <span class="post-carousel__card-body">
                                    <span class="post-carousel__card-meta"><?php echo esc_html( get_the_date( 'F j, Y' ) ); ?></span>
                                    <span class="post-carousel__card-title"><?php the_title(); ?></span>
                                </span>
                            </a>
                        </li>
                    <?php endwhile; ?>
                </ul>
                <button type="button" class="post-carousel__arrow post-carousel__arrow--next" aria-label="<?php esc_attr_e( 'Scroll forward', 'tc-ventures-child' ); ?>">&rarr;</button>
            </div>
        </div>
    </section>
    <?php
    wp_reset_postdata();
}
