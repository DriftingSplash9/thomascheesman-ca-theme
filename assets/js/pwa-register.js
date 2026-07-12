/**
 * Register the Back Quarter service worker at root scope, so the site
 * installs as a standalone PWA ("app/website in one"). Served from
 * /tc-bq-sw.js (root path → default scope is /). Failure is silent —
 * the site works identically without it.
 */
( function () {
	if ( ! ( 'serviceWorker' in navigator ) ) return;
	window.addEventListener( 'load', function () {
		navigator.serviceWorker.register( '/tc-bq-sw.js', { scope: '/' } )
			.catch( function () {} );
	} );
} )();
