<?php
/**
 * Gut Tracking Log — a private, installable PWA served at /gut-log/.
 *
 * A self-contained 21-day gut/food/symptom tracker (built off Thomas's
 * Gut_Tracking_Log PDF) that autosaves to the phone's localStorage
 * (key `gutlog:v1`) — the data NEVER leaves the device. This just gets
 * the app onto the site so it can be "Add to Home Screen"'d and opened
 * like a native app.
 *
 * The app is six static files in assets/gut-log/ (index.html + manifest
 * + service worker + icons, all relative-pathed for a folder). We serve
 * them at clean /gut-log/* URLs via `parse_request` — the same
 * mechanism as the Bing token and the site PWA — so nothing needs
 * uploading outside the repo; a normal git push deploys it.
 *
 * Privacy: every response carries `X-Robots-Tag: noindex, nofollow` and
 * the app is linked from nowhere (no menu, no sitemap — it isn't a WP
 * object). It's health-adjacent, so it stays unlisted. A random visitor
 * to /gut-log/ sees only an empty form; the data lives on Thomas's phone.
 *
 * @package tc-ventures-child
 */

if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'parse_request', function () {
	$path = wp_parse_url( isset( $_SERVER['REQUEST_URI'] ) ? $_SERVER['REQUEST_URI'] : '', PHP_URL_PATH );
	if ( ! $path ) {
		return;
	}
	// Only handle the /gut-log space (exact, or anything beneath it).
	if ( $path !== '/gut-log' && strpos( $path, '/gut-log/' ) !== 0 ) {
		return;
	}

	// Bare /gut-log → /gut-log/ so the app's relative asset paths resolve.
	if ( $path === '/gut-log' ) {
		wp_redirect( home_url( '/gut-log/' ), 301 );
		exit;
	}

	$rel = substr( $path, strlen( '/gut-log' ) ); // '/', '/manifest.json', …

	// Whitelisted files only — anything else under /gut-log/ 404s normally.
	$map = array(
		'/'                      => array( 'index.html', 'text/html; charset=UTF-8' ),
		'/index.html'            => array( 'index.html', 'text/html; charset=UTF-8' ),
		'/manifest.json'         => array( 'manifest.json', 'application/manifest+json; charset=UTF-8' ),
		'/service-worker.js'     => array( 'service-worker.js', 'application/javascript; charset=UTF-8' ),
		'/icon-192.png'          => array( 'icon-192.png', 'image/png' ),
		'/icon-512.png'          => array( 'icon-512.png', 'image/png' ),
		'/icon-maskable-512.png' => array( 'icon-maskable-512.png', 'image/png' ),
	);
	if ( ! isset( $map[ $rel ] ) ) {
		return;
	}

	list( $file, $ctype ) = $map[ $rel ];
	$full = get_stylesheet_directory() . '/assets/gut-log/' . $file;
	if ( ! is_readable( $full ) ) {
		return;
	}

	header( 'Content-Type: ' . $ctype );
	header( 'X-Robots-Tag: noindex, nofollow' ); // private health tool — keep it out of search
	if ( $rel === '/service-worker.js' ) {
		header( 'Service-Worker-Allowed: /gut-log/' );
	}
	// No page-cache for the shell so app updates aren't stuck behind
	// LiteSpeed; the service worker owns the offline caching itself.
	if ( 'image/png' !== $ctype ) {
		header( 'Cache-Control: no-cache, must-revalidate' );
	}
	readfile( $full );
	exit;
} );
