/*!
 * desk-menu.js — interactions for the desk-as-menu overlay.
 *
 * Self-contained module. Owns:
 *
 *   - The menu trigger      (toggles html.tc-desk-open on the
 *                            [data-menu-trigger] button in the
 *                            top-right capsule)
 *   - Memory-card bin       (opens the slideshow drawer)
 *   - Notebooks             (opens the journal drawer)
 *   - Keyboard              (swaps the monitor to the search interface)
 *
 * Drawer close: button, click-outside, Esc.
 * Search exit:  back button, Esc.
 * Overlay close: trigger again, Esc.
 *
 * Esc layering (closes the topmost interactive surface):
 *   open drawer  →  search active  →  overlay open
 *
 * main.js's initSiteChrome() still runs (clock + a11y bits) but
 * bails when #tc-menu is missing, so it does not bind the trigger.
 * This module is the sole owner of the trigger's open/close behaviour.
 *
 * No dependencies. Loaded in the footer after DOM parse.
 */
( function () {
    'use strict';

    var doc = document;

    function init() {
        wireMenuTrigger();
        wireDrawer( 'tc-desk-bin',       'tc-desk-slideshow-drawer' );
        wireDrawer( 'tc-desk-notebooks', 'tc-desk-journal-drawer'   );
        wireKeyboardSearch();
        wireGlobalEsc();
    }

    /**
     * The hamburger button in the top-right capsule toggles the desk
     * overlay. Mirrors the legacy .tc-menu open/close behaviour for
     * aria + the "Menu" ↔ "Close" label morph.
     */
    function wireMenuTrigger() {
        var trigger = doc.querySelector( '[data-menu-trigger]' );
        var overlay = doc.getElementById( 'tc-desk-menu' );
        var label   = doc.querySelector( '[data-trigger-label]' );
        if ( ! trigger || ! overlay ) return;

        function open() {
            doc.documentElement.classList.add( 'tc-desk-open' );
            overlay.setAttribute( 'aria-hidden', 'false' );
            trigger.setAttribute( 'aria-expanded', 'true' );
            trigger.setAttribute( 'aria-label', 'Close menu' );
            if ( label ) label.textContent = 'Close';
        }
        function close() {
            // Close any open drawer first.
            doc.querySelectorAll( '.tc-desk__drawer.is-open' ).forEach( function ( d ) {
                if ( typeof d.__tcDeskClose === 'function' ) d.__tcDeskClose();
            });
            // Exit search if active.
            var monitor = doc.querySelector( '.tc-desk__monitor' );
            if (
                monitor
                && monitor.classList.contains( 'is-searching' )
                && typeof monitor.__tcDeskExitSearch === 'function'
            ) {
                monitor.__tcDeskExitSearch();
            }
            doc.documentElement.classList.remove( 'tc-desk-open' );
            overlay.setAttribute( 'aria-hidden', 'true' );
            trigger.setAttribute( 'aria-expanded', 'false' );
            trigger.setAttribute( 'aria-label', 'Open menu' );
            if ( label ) label.textContent = 'Menu';
            // Return focus to the trigger so keyboard users keep their place.
            trigger.focus({ preventScroll: true });
        }
        function toggle() {
            if ( doc.documentElement.classList.contains( 'tc-desk-open' ) ) {
                close();
            } else {
                open();
            }
        }

        trigger.addEventListener( 'click', toggle );

        // Expose close() so Esc can call it from the global handler.
        overlay.__tcDeskOverlayClose = close;

        // Same-page anchors close the menu before the scroll/navigation.
        // External and off-route links navigate normally; the menu closes
        // as the page unloads anyway.
        overlay.querySelectorAll( 'a' ).forEach( function ( link ) {
            link.addEventListener( 'click', function () {
                if ( doc.documentElement.classList.contains( 'tc-desk-open' ) ) {
                    close();
                }
            });
        });
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
     *   3. The desk overlay itself (returns to whatever page was behind it)
     */
    function wireGlobalEsc() {
        var monitor = doc.querySelector( '.tc-desk__monitor' );
        var overlay = doc.getElementById( 'tc-desk-menu' );

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

            if (
                overlay
                && doc.documentElement.classList.contains( 'tc-desk-open' )
                && typeof overlay.__tcDeskOverlayClose === 'function'
            ) {
                overlay.__tcDeskOverlayClose();
            }
        });
    }

    if ( doc.readyState === 'loading' ) {
        doc.addEventListener( 'DOMContentLoaded', init );
    } else {
        init();
    }
} )();
