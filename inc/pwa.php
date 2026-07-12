<?php
/**
 * PWA — make thomascheesman.ca installable as a standalone app ("app/
 * website in one"), so the Back Quarter can live on a phone's home
 * screen and open fullscreen.
 *
 * Three moving parts:
 *   1. A web app MANIFEST served at /tc-bq.webmanifest (name, icons,
 *      standalone display, start_url = the 3D door).
 *   2. A minimal SERVICE WORKER served at /tc-bq-sw.js. Served from the
 *      root path so its default scope is "/" (covers the whole site).
 *      Network-first for page navigations with a cached shell as the
 *      offline fallback; everything else passes straight through —
 *      the cb=Date.now() 3D engine and versioned assets must NEVER be
 *      served stale from a cache (see CLAUDE.md sharp edges).
 *   3. wp_head <link>/<meta> tags + Apple's home-screen meta, and the
 *      registration script.
 *
 * Both dynamic URLs are intercepted via `parse_request` (the same
 * mechanism as the Bing token in functions.php) so no files need to
 * live outside the repo. Icons are static PNGs in assets/pwa/
 * (regenerate with assets/pwa/make-icons.py).
 *
 * @package tc-ventures-child
 */

if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Serve the manifest and the service worker at their root URLs, before
 * WordPress tries to match them to a post/page.
 */
add_action( 'parse_request', function () {
	$path = wp_parse_url( isset( $_SERVER['REQUEST_URI'] ) ? $_SERVER['REQUEST_URI'] : '', PHP_URL_PATH );
	if ( ! $path ) {
		return;
	}
	$path = rtrim( $path, '/' );

	if ( $path === '/tc-bq.webmanifest' ) {
		$base = get_stylesheet_directory_uri() . '/assets/pwa';
		$manifest = array(
			'name'             => 'The Back Quarter — Thomas Cheesman',
			'short_name'       => 'Back Quarter',
			'description'      => "Drive Thomas Cheesman's farm — the Back Quarter.",
			'start_url'        => '/#bq3d',
			'scope'            => '/',
			'display'          => 'standalone',
			'orientation'      => 'any',
			'background_color' => '#101826',
			'theme_color'      => '#1a2a1e',
			'icons'            => array(
				array( 'src' => $base . '/icon-192.png', 'sizes' => '192x192', 'type' => 'image/png', 'purpose' => 'any' ),
				array( 'src' => $base . '/icon-512.png', 'sizes' => '512x512', 'type' => 'image/png', 'purpose' => 'any' ),
				array( 'src' => $base . '/icon-maskable-512.png', 'sizes' => '512x512', 'type' => 'image/png', 'purpose' => 'maskable' ),
			),
		);
		header( 'Content-Type: application/manifest+json; charset=UTF-8' );
		header( 'Cache-Control: max-age=3600' );
		echo wp_json_encode( $manifest );
		exit;
	}

	if ( $path === '/tc-bq-sw.js' ) {
		header( 'Content-Type: application/javascript; charset=UTF-8' );
		header( 'Service-Worker-Allowed: /' );
		header( 'Cache-Control: no-cache' ); // let SW updates propagate
		echo tc_pwa_service_worker_js();
		exit;
	}
} );

/**
 * The service worker source. Network-first for navigations (so an online
 * visitor is NEVER served stale HTML), with a cached shell only as the
 * offline fallback; all other requests pass through uncached. Bump the
 * cache name to force a refresh.
 *
 * @return string
 */
function tc_pwa_service_worker_js() {
	return <<<'JS'
var TC_BQ_CACHE = 'tc-bq-shell-v1';

self.addEventListener( 'install', function () {
	self.skipWaiting();
} );

self.addEventListener( 'activate', function ( e ) {
	e.waitUntil(
		caches.keys().then( function ( keys ) {
			return Promise.all( keys.map( function ( k ) {
				if ( k !== TC_BQ_CACHE ) { return caches.delete( k ); }
			} ) );
		} ).then( function () { return self.clients.claim(); } )
	);
} );

self.addEventListener( 'fetch', function ( e ) {
	var req = e.request;
	if ( req.method !== 'GET' ) { return; }
	// Only page navigations get the cache-shell treatment; assets pass
	// straight through so the versioned CSS/JS and the cb=Date.now() 3D
	// engine are always fetched fresh.
	if ( req.mode === 'navigate' ) {
		e.respondWith(
			fetch( req ).then( function ( res ) {
				var copy = res.clone();
				caches.open( TC_BQ_CACHE ).then( function ( c ) { c.put( '/', copy ); } );
				return res;
			} ).catch( function () {
				return caches.match( '/' ).then( function ( m ) { return m || Response.error(); } );
			} )
		);
	}
} );
JS;
}

/**
 * Head tags: the manifest link, theme colour, and Apple's home-screen
 * meta (iOS has no manifest support — these give it the icon, title and
 * standalone launch).
 */
add_action( 'wp_head', function () {
	$icon = get_stylesheet_directory_uri() . '/assets/pwa/apple-touch-icon.png';
	echo "\n<!-- Back Quarter PWA -->\n";
	echo '<link rel="manifest" href="/tc-bq.webmanifest">' . "\n";
	echo '<meta name="theme-color" content="#1a2a1e">' . "\n";
	echo '<meta name="mobile-web-app-capable" content="yes">' . "\n";
	echo '<meta name="apple-mobile-web-app-capable" content="yes">' . "\n";
	echo '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">' . "\n";
	echo '<meta name="apple-mobile-web-app-title" content="Back Quarter">' . "\n";
	echo '<link rel="apple-touch-icon" sizes="180x180" href="' . esc_url( $icon ) . '">' . "\n";
}, 100 ); // after wp_site_icon (99) so iOS uses the buggy app icon, not the Site Icon

/**
 * Register the service worker (front-end only, all pages, so the app
 * scope covers the whole site).
 */
add_action( 'wp_enqueue_scripts', function () {
	if ( is_admin() ) {
		return;
	}
	$ver = wp_get_theme()->get( 'Version' );
	wp_enqueue_script(
		'tc-pwa-register',
		get_stylesheet_directory_uri() . '/assets/js/pwa-register.js',
		array(),
		$ver,
		true
	);
} );
