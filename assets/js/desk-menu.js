/*!
 * desk-menu.js — interactions inside the desk-as-menu overlay.
 *
 * Self-contained module. Wires the click affordances on the .tc-desk
 * surface (the three cyan-spotlit objects):
 *
 *   - Memory-card bin    → open the slideshow drawer
 *   - Notebooks          → open the journal drawer
 *   - Keyboard           → swap the monitor to the search interface
 *
 * Also handles drawer close (button, click-outside, Esc) and search
 * exit (back button, Esc).
 *
 * The OVERLAY itself (html.tc-desk-open) is NOT toggled here — that's
 * C4's job, wired through the existing menu-trigger button in
 * header.php / main.js's initSiteChrome(). For testing C2 + C3
 * before C4 lands, append `?desk=1` to any URL and the overlay opens
 * on page load. That test hook is removed in C4.
 *
 * No dependencies. Loaded in the footer after DOM parse.
 */
( function () {
    'use strict';

    var doc = document;

    function init() {
        wireDrawer( 'tc-desk-bin',       'tc-desk-slideshow-drawer' );
        wireDrawer( 'tc-desk-notebooks', 'tc-desk-journal-drawer'   );
        wireKeyboardSearch();
        wireGlobalEsc();
        maybeAutoOpen();
    }

    /**
     * Generic drawer behaviour. The trigger element opens the drawer;
     * the drawer's `.tc-desk__drawer-close` button + click-outside +
     * Esc all close it.
     *
     * @param {string} triggerId
     * @param {string} drawerId
     */
    function wireDrawer( triggerId, drawerId ) {
        var trigger = doc.getElementById( triggerId );
        var drawer  = doc.getElementById( drawerId );
        if ( ! trigger || ! drawer ) return;

        var closeBtn = drawer.querySelector( '.tc-desk__drawer-close' );

        function open( e ) {
            if ( e ) e.preventDefault();
            drawer.classList.add( 'is-open' );
            drawer.setAttribute( 'aria-hidden', 'false' );
        }
        function close() {
            drawer.classList.remove( 'is-open' );
            drawer.setAttribute( 'aria-hidden', 'true' );
        }

        trigger.addEventListener( 'click', open );
        if ( closeBtn ) closeBtn.addEventListener( 'click', close );
        drawer.addEventListener( 'click', function ( e ) {
            // Click on the backdrop (the drawer itself, not its inner) closes.
            if ( e.target === drawer ) close();
        });

        // Park the close fn on the element so the global Esc handler
        // can call it without recomputing which drawer is open.
        drawer.__tcDeskClose = close;
    }

    /**
     * Keyboard hotspot → swap the monitor's contents from the Contents
     * nav to a search field with quick-pick chips. `monitor.is-searching`
     * is the class hook the CSS uses to hide the nav.
     */
    function wireKeyboardSearch() {
        var kb      = doc.getElementById( 'tc-desk-keyboard' );
        var monitor = doc.querySelector( '.tc-desk__monitor' );
        var search  = doc.getElementById( 'tc-desk-search' );
        var input   = doc.getElementById( 'tc-desk-search-input' );
        var backBtn = doc.getElementById( 'tc-desk-search-back' );
        if ( ! kb || ! monitor || ! search || ! input || ! backBtn ) return;

        function enter( e ) {
            if ( e ) e.preventDefault();
            monitor.classList.add( 'is-searching' );
            search.hidden = false;
            // Defer focus so the CSS transition finishes first.
            setTimeout( function () { input.focus(); }, 80 );
        }
        function exit() {
            monitor.classList.remove( 'is-searching' );
            search.hidden = true;
            input.value   = '';
        }

        kb.addEventListener( 'click', enter );
        backBtn.addEventListener( 'click', exit );

        // Quick-pick chips populate the input.
        search.querySelectorAll( '.tc-desk__chip' ).forEach( function ( chip ) {
            chip.addEventListener( 'click', function () {
                input.value = chip.dataset.q || '';
                input.focus();
            });
        });

        // Expose exit() so the global Esc handler can call it.
        monitor.__tcDeskExitSearch = exit;
    }

    /**
     * Global Esc: close the topmost interactive thing.
     *   1. Any open drawer
     *   2. Active search (exits back to Contents)
     *   3. (C4 will add) the desk overlay itself
     */
    function wireGlobalEsc() {
        var monitor = doc.querySelector( '.tc-desk__monitor' );

        doc.addEventListener( 'keydown', function ( e ) {
            if ( e.key !== 'Escape' ) return;

            var openDrawer = doc.querySelector( '.tc-desk__drawer.is-open' );
            if ( openDrawer && typeof openDrawer.__tcDeskClose === 'function' ) {
                openDrawer.__tcDeskClose();
                return;
            }

            if (
                monitor
                && monitor.classList.contains( 'is-searching' )
                && typeof monitor.__tcDeskExitSearch === 'function'
            ) {
                monitor.__tcDeskExitSearch();
                return;
            }

            // Future: C4 closes the desk overlay here.
        });
    }

    /**
     * Test hook: `?desk=1` opens the overlay on page load. Lets us
     * exercise the C2 + C3 work without waiting for C4 to wire the
     * trigger. Removed in C4.
     */
    function maybeAutoOpen() {
        try {
            var params = new URLSearchParams( window.location.search );
            if ( params.get( 'desk' ) === '1' ) {
                doc.documentElement.classList.add( 'tc-desk-open' );
            }
        } catch ( err ) {
            // Old browser without URLSearchParams — silently skip.
        }
    }

    if ( doc.readyState === 'loading' ) {
        doc.addEventListener( 'DOMContentLoaded', init );
    } else {
        init();
    }
} )();
