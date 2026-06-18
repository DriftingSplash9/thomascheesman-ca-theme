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
require_once get_stylesheet_directory() . '/inc/keepsake-download.php';
require_once get_stylesheet_directory() . '/inc/family-login.php';

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

    // Keepsake print stylesheet — turns the heritage long-reads and the
    // person pages into a clean book layout when printed / saved to PDF.
    // The 5th arg (media="print") means it's ONLY applied while printing,
    // so it never affects the on-screen site and isn't render-blocking.
    // It's also injected directly by build-keepsake-pdfs.py, so PDF
    // generation doesn't depend on this being deployed first.
    wp_enqueue_style(
        'tc-print',
        get_stylesheet_directory_uri() . '/assets/css/print.css',
        array( 'astra-child-style' ),
        wp_get_theme()->get( 'Version' ),
        'print'
    );

    // GSAP core library (CDN).
    wp_enqueue_script(
        'gsap-core',
        get_stylesheet_directory_uri() . '/assets/js/vendor/gsap-3.12.2.min.js',
        array(),
        '3.12.2',
        array( 'in_footer' => true, 'strategy' => 'defer' )
    );

    // GSAP ScrollTrigger plugin — depends on GSAP core.
    wp_enqueue_script(
        'gsap-scroll-trigger',
        get_stylesheet_directory_uri() . '/assets/js/vendor/ScrollTrigger-3.12.2.min.js',
        array( 'gsap-core' ),
        '3.12.2',
        array( 'in_footer' => true, 'strategy' => 'defer' )
    );

    // (GSAP MotionPathPlugin enqueue was removed with the jeep timeline.)

    // Three.js is intentionally NOT enqueued (G3/C12). It powers only the
    // decorative WebGL background, so main.js lazy-loads it from the vendored
    // copy (tcVentures.threeUrl) once the browser is idle — and not at all
    // under prefers-reduced-motion. Keeping the ~600 KB three.min.js out of
    // every page's combined bundle is the biggest initial-load win on the site.
    // Vendored at assets/js/vendor/three-r128.min.js.

    // Custom main JavaScript — depends on GSAP, ScrollTrigger, and Three.js.
    // Loaded in the footer (final arg = true) so it runs after DOM parse.
    // Version reads from the child theme's style.css header so a single
    // bump there cache-busts both CSS and JS in one place.
    wp_enqueue_script(
        'tc-ventures-main',
        get_stylesheet_directory_uri() . '/assets/js/main.js',
        array( 'gsap-core', 'gsap-scroll-trigger' ),
        wp_get_theme()->get( 'Version' ),
        // 'defer' on the WHOLE chain, not just the libraries: WordPress
        // silently downgrades a script's defer strategy when any script
        // that depends on it is enqueued without one (2026-06 review —
        // GSAP/three carried data-wp-strategy but no actual defer attr,
        // and ~5s of mobile render-blocking came from exactly this).
        array( 'in_footer' => true, 'strategy' => 'defer' )
    );

    // Expose a small data object from PHP to main.js as window.tcVentures.
    wp_localize_script( 'tc-ventures-main', 'tcVentures', array(
        'siteUrl'  => home_url(),
        'themeUrl' => get_stylesheet_directory_uri(),
        'threeUrl' => get_stylesheet_directory_uri() . '/assets/js/vendor/three-r128.min.js',
    ));

    // Print prep — when a reader saves a page to PDF (Ctrl+P), open every
    // collapsed <details> (the heritage Notes appendix) so it prints, then
    // restore its state afterward. print.css handles the rest of the layout;
    // the keepsake PDF generator opens these the same way before rendering.
    wp_add_inline_script(
        'tc-ventures-main',
        'window.addEventListener("beforeprint",function(){'
            . 'document.querySelectorAll("details").forEach(function(d){'
            . 'd.dataset.tcPrintWasOpen=d.open?"1":"0";d.open=true;});});'
        . 'window.addEventListener("afterprint",function(){'
            . 'document.querySelectorAll("details").forEach(function(d){'
            . 'if(d.dataset.tcPrintWasOpen==="0"){d.open=false;}delete d.dataset.tcPrintWasOpen;});});',
        'after'
    );

    // Desk menu interactions. Self-contained module: wires the drawer
    // + search affordances inside the .tc-desk overlay. Open/close of
    // the overlay itself is wired in header.php / main.js in C4.
    // No JS deps; loaded in the footer after DOM parse.
    wp_enqueue_script(
        'tc-desk-menu',
        get_stylesheet_directory_uri() . '/assets/js/desk-menu.js',
        array(),
        wp_get_theme()->get( 'Version' ),
        array( 'in_footer' => true, 'strategy' => 'defer' )
    );
    // G7: the overlay markup itself is fetched on first click rather
    // than rendered into every page — see tc_ajax_load_desk_menu() in
    // inc/desk-menu.php and wireMenuTriggerLoader() in desk-menu.js.
    wp_localize_script(
        'tc-desk-menu',
        'tcDeskMenu',
        array(
            'ajaxUrl' => esc_url_raw( admin_url( 'admin-ajax.php' ) ),
            'action'  => 'tc_load_desk_menu',
        )
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
        array( 'in_footer' => true, 'strategy' => 'defer' )
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
        array( 'in_footer' => true, 'strategy' => 'defer' )
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
        array( 'in_footer' => true, 'strategy' => 'defer' )
    );

    // Family login page + the kid-page "kept for family" gate notice (the
    // styled wp_login_form and the .family-gate prompt). inc/family-login.php.
    if ( is_page( array( 'family-login', 'patience', 'daniel', 'faith' ) ) ) {
        wp_enqueue_style(
            'tc-family',
            get_stylesheet_directory_uri() . '/assets/css/family.css',
            array( 'astra-child-style' ),
            $tc_theme_ver
        );
    }

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
            get_stylesheet_directory_uri() . '/assets/js/vendor/d3-7.8.5.min.js',
            array(),
            '7.8.5',
            array( 'in_footer' => true, 'strategy' => 'defer' )
        );
        // The full topojson bundle, not topojson-client — cdnjs does not
        // host the client-only package (404 verified 2026-06-11). Same
        // `topojson.feature` global either way.
        wp_enqueue_script(
            'topojson-client',
            get_stylesheet_directory_uri() . '/assets/js/vendor/topojson-3.0.2.min.js',
            array(),
            '3.0.2',
            array( 'in_footer' => true, 'strategy' => 'defer' )
        );
        wp_enqueue_script(
            'tc-family-map',
            get_stylesheet_directory_uri() . '/assets/js/family-map.js',
            array( 'd3', 'topojson-client' ),
            $tc_theme_ver,
            array( 'in_footer' => true, 'strategy' => 'defer' )
        );
        wp_localize_script( 'tc-family-map', 'tcFamilyMap', array(
            'dataUrl'      => get_stylesheet_directory_uri() . '/inc/data/family-map.json?ver=' . rawurlencode( $tc_theme_ver ),
            // 50m land (world-atlas) — the 110m topology read too rustic
            // once the map gained free zoom; lazy-loaded only on /map.
            'worldUrl'     => get_stylesheet_directory_uri() . '/assets/data/world-50m.json?ver=' . rawurlencode( $tc_theme_ver ),
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
    foreach ( array( 'gsap-core', 'gsap-scroll-trigger' ) as $tc_defer_handle ) {
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

	$tc_person = array(
		'@type' => 'Person',
		'@id'   => home_url( '/#thomas' ),
		'name'  => 'Thomas Cheesman',
		'url'   => home_url( '/' ),
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

/**
 * Legacy-URL recovery (review finding: Google's index still holds the
 * OLD site's URLs — all 404 today, including the Rycroft naming post
 * that ranked #1 for Rycroft pioneer queries). 301 the three known
 * indexed URLs to their successors so the equity transfers before the
 * rankings are dropped entirely. Runs only on genuine 404s.
 */
add_action( 'template_redirect', function () {
	if ( ! is_404() ) {
		return;
	}
	$tc_path = strtolower( wp_parse_url( $_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH ) ?: '' );
	$tc_path = rtrim( $tc_path, '/' ) . '/';
	$tc_map  = array(
		'/2024/08/29/how-did-rycroft-get-its-name/' => '/family/heritage/rycrofts/story/',
		'/hajdu-cheney-syndrome/'                   => '/hcs/',
		'/2024/09/13/the-cheesmans/'                => '/family/heritage/cheesmans/',
	);
	if ( isset( $tc_map[ $tc_path ] ) ) {
		wp_safe_redirect( home_url( $tc_map[ $tc_path ] ), 301 );
		exit;
	}
} );

/**
 * Staging-host guard. The Hostinger temporary domain serves a complete
 * mirror of this site with self-referencing canonicals, and its
 * robots.txt blocks only Googlebot — Bing and the AI crawlers are
 * allowed in (review finding, verified 2026-06-12). Bounce every
 * front-end request on that host to the real domain; the noindex
 * header covers any crawler that ignores the redirect. wp-admin,
 * wp-login, REST, and cron are left alone so the staging host stays
 * usable for emergencies.
 */
add_action( 'init', function () {
	$tc_host = strtolower( $_SERVER['HTTP_HOST'] ?? '' );
	if ( strpos( $tc_host, 'hostingersite.com' ) === false ) {
		return;
	}
	// No redirect: Hostinger's temp domain is a rewriting proxy that
	// rewrites Location headers (and body URLs) back to the temp host,
	// so an in-app redirect can only loop (verified live 2026-06-12).
	// The noindex header on every staging response is what actually
	// kills indexing; the host-side toggle (Thomas's T3) is the kill.
	header( 'X-Robots-Tag: noindex, nofollow' );
}, 0 );

// Stop advertising the WordPress version in <head> and feeds.
remove_action( 'wp_head', 'wp_generator' );
add_filter( 'the_generator', '__return_empty_string' );

/**
 * Asset diet (2026-06 review, round 2 — G1 quick wins).
 *
 * 1. Drop the WordPress emoji polyfill. Modern browsers render emoji
 *    natively, so the detection script + its inline CSS + the twemoji
 *    fetch are dead weight on every page. (The homepage pillar icons
 *    are real emoji glyphs and paint fine without it.)
 * 2. Remove the jquery-migrate shim from jQuery's dependency chain.
 *    The theme's own JS is vanilla (main.js, desk-menu.js declare no
 *    jQuery deps); migrate only back-fills pre-3.0 APIs nothing here
 *    calls. jQuery itself still loads for Astra/core. AFTER DEPLOY,
 *    sanity-check the lightbox, desk menu, and arcade once; if any
 *    jQuery-driven piece misbehaves, delete the second filter below.
 */
add_action( 'init', function () {
    remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
    remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
    remove_action( 'wp_print_styles', 'print_emoji_styles' );
    remove_action( 'admin_print_styles', 'print_emoji_styles' );
    remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
    remove_filter( 'comment_text_rss', 'wp_staticize_emoji' );
    remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );
} );

add_filter( 'wp_default_scripts', function ( $scripts ) {
    if ( is_admin() || empty( $scripts->registered['jquery'] ) ) {
        return;
    }
    $scripts->registered['jquery']->deps = array_diff(
        $scripts->registered['jquery']->deps,
        array( 'jquery-migrate' )
    );
} );

/**
 * Curated /llms.txt — served the same way as the Bing verification
 * route above. The Hostinger plugin's auto-generated version named all
 * five long-reads "Story" and listed the /map-2/ stray; this one gives
 * answer engines real titles, one-line summaries, and the confidence
 * vocabulary the heritage project actually uses. If a physical
 * llms.txt ever exists in the webroot it wins at the server layer and
 * this route simply never fires.
 */
add_action( 'after_setup_theme', function () {
	// after_setup_theme (not parse_request): the Hostinger Tools plugin
	// serves its own auto-generated llms.txt from an earlier hook and
	// exits; this runs before it. Checked live 2026-06-12.
	$tc_path = wp_parse_url( $_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH );
	if ( '/llms.txt' !== $tc_path ) {
		return;
	}
	header( 'Content-Type: text/plain; charset=utf-8' );
	$tc_home = home_url( '/' );
	echo "# thomascheesman.ca\n\n";
	echo "> A personal legacy archive by Thomas Cheesman of Grande Prairie, Alberta, Canada: his life, his three kids, life with ultra-rare Hajdu-Cheney syndrome (fewer than ~50 people alive have it), and an eight-line family-history project of 50,000+ words with genealogical sourcing.\n\n";
	echo "Genealogy claims on this site are explicitly tiered: VERIFIED (primary record), PROBABLE (strong inference, not yet proven), INHERITED (family-tree assertion), LIVING MEMORY (first-hand). Quote the tier with the claim.\n\n";
	echo "## The author\n";
	echo "- [About Thomas]({$tc_home}about/): chef until Hajdu-Cheney retired his hands; built this site as a letter to his kids.\n";
	echo "- [Living with Hajdu-Cheney syndrome]({$tc_home}hcs/): first-person patient account — diagnosis, fractures, fusions, the genetic question. Links OMIM 102500, Orphanet 955, GeneReviews.\n";
	echo "- [Thomas's own long-read]({$tc_home}family/thomas/): Turner Valley to Grande Prairie, the kitchen years, the body's turn.\n\n";
	echo "## The family\n";
	echo "- [The family tree]({$tc_home}family/): three kids, eight family lines from five countries.\n";
	echo "- [Patience]({$tc_home}family/patience/) · [Daniel]({$tc_home}family/daniel/) · [Faith]({$tc_home}family/faith/)\n\n";
	echo "## The heritage project (the deep research)\n";
	echo "- [Hub — eight lines]({$tc_home}family/heritage/)\n";
	echo "- [The Cheesmans]({$tc_home}family/heritage/cheesmans/story/): the chosen name — Turner Valley oil patch, Teepee Creek farms.\n";
	echo "- [The Dochertys]({$tc_home}family/heritage/dochertys/story/): nine generations, Donegal → Lanarkshire pits → Illinois → Alix, Alberta.\n";
	echo "- [The McIvers]({$tc_home}family/heritage/dochertys/mcivers/): Hebridean crofters (Lewis, South Uist) cleared to the Saskatchewan prairie, 1880s.\n";
	echo "- [The Lakemans]({$tc_home}family/heritage/lakemans/story/): eleven generations from the drained Beemster polder through the Dutch East Indies and Royal Dutch Shell to Calgary.\n";
	echo "- [The Verbooms]({$tc_home}family/heritage/lakemans/verbooms/): Dutch civil-record line behind Suzanna of Ter Aar.\n";
	echo "- [The Rycrofts]({$tc_home}family/heritage/rycrofts/story/): Leeds → US cavalry → Kingdom of Hawai'i coffee pioneer → the Alberta town of Rycroft, named by drawing a slip from a hat in 1920.\n";
	echo "- [The Steinkes]({$tc_home}family/heritage/rycrofts/steinkes/): German Lutherans of central Poland (1858 Ossowka marriage akte) to Manitoba 1892 and the prairie.\n";
	echo "- [The Haistes]({$tc_home}family/heritage/haistes/story/): thirteen generations, Yorkshire tannery c. 1610 to the Peace Country.\n";
	echo "- [The Lanterns of Record]({$tc_home}family/heritage/map/): interactive map — every documented record is a light; 400 years, ten lines, converging on Alberta.\n\n";
	echo "## Elsewhere\n";
	echo "- Bare Your Rare (his rare-disease nonprofit): https://bareyourrare.org\n";
	exit;
} );

/**
 * OD-1 / PRIV-1: noindex the three kids' spoke pages.
 *
 * These pages are gated behind the family login (only signed-in family see the
 * prose, photos, and the "letter for later"). Even gated, we don't want the URL
 * or its first-name title sitting in search results, so force a noindex robots
 * directive. Uses the core wp_robots filter; if a future SEO-plugin config
 * overrides it, mirror the noindex on these pages in AIOSEO too.
 */
add_filter( 'wp_robots', function ( $robots ) {
	if ( is_page( array( 'patience', 'daniel', 'faith' ) ) ) {
		$robots['noindex'] = true;
		$robots['follow']  = true;
		unset( $robots['index'] );
	}
	return $robots;
} );

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

/**
 * De-duplicate AIOSEO's Open Graph image + clean og:site_name
 * (2026-06 review, G1 follow-up).
 *
 * The theme emits the authoritative og:image / twitter:image for every
 * page (tc_review_social_image(), the wp_head priority-0 emitter above).
 * AIOSEO ALSO emits an og:image on the front page (a legacy Social-
 * Networks setting not exposed in this install's admin), so the homepage
 * carries two og:image tags — ours (desk-hero) and AIOSEO's IMG_8550.
 * AIOSEO also renders og:site_name as "thomascheesman.ca -" (it appends a
 * separator to the site name).
 *
 * aioseo_facebook_tags is AIOSEO's supported filter over its Facebook /
 * Open Graph markup. Blank any og:image* key that ALREADY EXISTS so the
 * theme's single tag stands alone, and force the clean site name. We only
 * touch keys that exist, so we never introduce an empty tag on a page
 * AIOSEO left imageless. Ref: https://aioseo.com/docs/aioseo_facebook_tags/
 *
 * VERIFY after deploy: the homepage should show ONE og:image (desk-hero)
 * and og:site_name should read "thomascheesman.ca". If AIOSEO emits empty
 * <meta> tags instead of omitting them, switch the blanking to unset().
 */
add_filter( 'aioseo_facebook_tags', function ( $tags ) {
    if ( ! is_array( $tags ) ) {
        return $tags;
    }
    foreach ( array_keys( $tags ) as $tc_k ) {
        if ( 0 === strpos( $tc_k, 'og:image' ) ) {
            $tags[ $tc_k ] = '';
        }
    }
    if ( isset( $tags['og:site_name'] ) ) {
        $tags['og:site_name'] = get_bloginfo( 'name' );
    }
    return $tags;
}, 20 );
