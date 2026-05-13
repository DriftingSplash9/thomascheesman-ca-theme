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
        wireDrawer( 'tc-desk-mouse',     'tc-desk-trail-drawer'     );
        wireKeyboardSearch();
        wireGlobalEsc();
        wireScreensaver();
        wireCursorTrail();
    }

    /**
     * Any [data-menu-trigger] element toggles the desk overlay. There
     * are currently two: the hamburger button in the top-right capsule
     * (always visible) and the "back to the desk" button in the
     * footer (added in C5). Both behave identically.
     *
     * The "Menu" ↔ "Close" label morph + aria-expanded are only kept
     * in sync on triggers that carry [data-trigger-label] — i.e. the
     * capsule one. The footer button stays labelled "back to the desk"
     * regardless of state.
     */
    function wireMenuTrigger() {
        var triggers = doc.querySelectorAll( '[data-menu-trigger]' );
        var overlay  = doc.getElementById( 'tc-desk-menu' );
        var label    = doc.querySelector( '[data-trigger-label]' );
        if ( ! triggers.length || ! overlay ) return;

        // Treat the FIRST trigger (the capsule one) as the focus-return
        // target. After the user closes the menu, focus returns there
        // even if they opened it via the footer button.
        var primaryTrigger = triggers[0];

        function open() {
            doc.documentElement.classList.add( 'tc-desk-open' );
            overlay.setAttribute( 'aria-hidden', 'false' );
            triggers.forEach( function ( t ) {
                t.setAttribute( 'aria-expanded', 'true' );
            });
            primaryTrigger.setAttribute( 'aria-label', 'Close menu' );
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
            triggers.forEach( function ( t ) {
                t.setAttribute( 'aria-expanded', 'false' );
            });
            primaryTrigger.setAttribute( 'aria-label', 'Open menu' );
            if ( label ) label.textContent = 'Menu';
            // Return focus to the primary trigger so keyboard users keep
            // their place.
            primaryTrigger.focus({ preventScroll: true });
        }
        function toggle() {
            if ( doc.documentElement.classList.contains( 'tc-desk-open' ) ) {
                close();
            } else {
                open();
            }
        }

        triggers.forEach( function ( t ) {
            t.addEventListener( 'click', toggle );
        });

        // Expose close() so Esc can call it from the global handler.
        overlay.__tcDeskOverlayClose = close;

        // Any link inside the overlay closes the menu on click so the
        // navigation doesn't leave it hanging open.
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

    /**
     * Starfield screensaver: 30s of inactivity inside the open desk
     * overlay flips the monitor into screensaver mode. Any mousemove
     * / click / key / touch INSIDE the overlay wakes it up. The
     * detection only runs while the overlay is open — when it closes,
     * any pending timer is cleared and the idle class is removed.
     */
    function wireScreensaver() {
        var monitor = doc.querySelector( '.tc-desk__monitor' );
        var overlay = doc.getElementById( 'tc-desk-menu' );
        var html    = doc.documentElement;
        if ( ! monitor || ! overlay ) return;

        var IDLE_MS   = 30000;
        var idleTimer = null;
        var armed     = false;
        var wakeEvents = [ 'mousemove', 'mousedown', 'keydown', 'touchstart', 'wheel' ];

        function startTimer() {
            if ( idleTimer ) clearTimeout( idleTimer );
            monitor.classList.remove( 'is-idle' );
            idleTimer = setTimeout( function () {
                monitor.classList.add( 'is-idle' );
            }, IDLE_MS );
        }
        function clearAll() {
            if ( idleTimer ) {
                clearTimeout( idleTimer );
                idleTimer = null;
            }
            monitor.classList.remove( 'is-idle' );
        }
        function arm() {
            if ( armed ) return;
            armed = true;
            wakeEvents.forEach( function ( evt ) {
                overlay.addEventListener( evt, startTimer, { passive: true, capture: true } );
            });
            startTimer();
        }
        function disarm() {
            if ( ! armed ) return;
            armed = false;
            wakeEvents.forEach( function ( evt ) {
                overlay.removeEventListener( evt, startTimer, { capture: true } );
            });
            clearAll();
        }

        // Arm when the overlay opens, disarm when it closes. Watching
        // the html element's class list catches every open/close path
        // (trigger click, footer button, Esc, link click).
        var obs = new MutationObserver( function () {
            if ( html.classList.contains( 'tc-desk-open' ) ) {
                arm();
            } else {
                disarm();
            }
        });
        obs.observe( html, { attributes: true, attributeFilter: [ 'class' ] });

        // If the overlay is somehow already open at init time, arm now.
        if ( html.classList.contains( 'tc-desk-open' ) ) arm();
    }

    /**
     * Cursor-trail engine.
     *
     * Listens for clicks on .tc-desk__drawer-card[data-trail] inside
     * the trail drawer and applies the chosen trail sitewide. The
     * choice is persisted in localStorage under "tc-trail" so it
     * survives navigation. Trail effects spawn small DOM particles
     * at the cursor on every throttled mousemove; each particle
     * self-removes after its CSS animation finishes.
     *
     * Trail types: stars, comet, bubbles, confetti, sparkles, none.
     * Disabled on touch devices (no cursor) and under reduced-motion.
     */
    function wireCursorTrail() {
        var html = doc.documentElement;
        var STORAGE_KEY = 'tc-trail';
        var TRAIL_TYPES = [ 'stars', 'comet', 'bubbles', 'confetti', 'sparkles', 'none' ];

        var isTouch  = window.matchMedia( '(pointer: coarse)' ).matches;
        var reduceMo = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

        var container = null;
        var mouseHandler = null;
        var lastSpawn = 0;
        var currentTrail = 'none';

        // Confetti colour palette + a few unicode glyphs per trail.
        var CONFETTI_RGB = [
            '255,170,190',  // coral
            '170,220,255',  // sky
            '210,180,255',  // lavender
            '255,230,150',  // butter
            '170,240,200',  // mint
            '255,190,160',  // peach
        ];

        function readStored() {
            try {
                var v = localStorage.getItem( STORAGE_KEY );
                return TRAIL_TYPES.indexOf( v ) >= 0 ? v : 'none';
            } catch ( err ) {
                return 'none';
            }
        }
        function writeStored( v ) {
            try { localStorage.setItem( STORAGE_KEY, v ); } catch ( err ) {}
        }

        function setTrail( name ) {
            if ( TRAIL_TYPES.indexOf( name ) < 0 ) name = 'none';
            // Strip any existing trail class
            TRAIL_TYPES.forEach( function ( t ) {
                if ( t !== 'none' ) html.classList.remove( 'tc-trail-' + t );
            });
            if ( name !== 'none' ) {
                html.classList.add( 'tc-trail-' + name );
            }
            writeStored( name );
            currentTrail = name;
            // Reset the renderer for the new type
            if ( name === 'none' || isTouch || reduceMo ) {
                stopRenderer();
            } else {
                startRenderer();
            }
        }

        function startRenderer() {
            if ( ! container ) {
                container = doc.createElement( 'div' );
                container.className = 'tc-trail-container';
                container.setAttribute( 'aria-hidden', 'true' );
                doc.body.appendChild( container );
            }
            if ( ! mouseHandler ) {
                mouseHandler = function ( e ) {
                    var now = performance.now ? performance.now() : Date.now();
                    if ( now - lastSpawn < 28 ) return;
                    lastSpawn = now;
                    spawn( e.clientX, e.clientY );
                };
                window.addEventListener( 'mousemove', mouseHandler, { passive: true } );
            }
        }

        function stopRenderer() {
            if ( mouseHandler ) {
                window.removeEventListener( 'mousemove', mouseHandler );
                mouseHandler = null;
            }
            if ( container ) {
                container.remove();
                container = null;
            }
        }

        function spawn( x, y ) {
            if ( ! container ) return;
            var p = doc.createElement( 'span' );
            p.className = 'tc-trail-particle tc-trail-particle--' + currentTrail;
            p.style.left = x + 'px';
            p.style.top  = y + 'px';

            // Per-trail content / inline overrides
            if ( currentTrail === 'stars' ) {
                p.textContent = '★'; // ★
            } else if ( currentTrail === 'bubbles' ) {
                p.textContent = '○'; // ○
                // Slight horizontal drift via inline custom property
                p.style.setProperty( '--drift', ( Math.random() * 40 - 20 ).toFixed( 1 ) + 'px' );
            } else if ( currentTrail === 'confetti' ) {
                var rgb = CONFETTI_RGB[ Math.floor( Math.random() * CONFETTI_RGB.length ) ];
                p.style.background = 'rgb(' + rgb + ')';
                p.style.setProperty( '--spin', ( Math.random() * 540 - 270 ).toFixed( 0 ) + 'deg' );
                p.style.setProperty( '--drift', ( Math.random() * 60 - 30 ).toFixed( 1 ) + 'px' );
            } else if ( currentTrail === 'sparkles' ) {
                p.textContent = '❖'; // ❖
            }
            // 'comet' uses CSS-only styling — no content/inline needed

            container.appendChild( p );
            // Auto-cleanup after the animation finishes (longest is ~2s)
            setTimeout( function () {
                if ( p.parentNode ) p.parentNode.removeChild( p );
            }, 2200 );
        }

        // Wire the drawer's option cards
        var drawer = doc.getElementById( 'tc-desk-trail-drawer' );
        if ( drawer ) {
            drawer.querySelectorAll( '[data-trail]' ).forEach( function ( card ) {
                card.addEventListener( 'click', function ( e ) {
                    e.preventDefault();
                    setTrail( card.dataset.trail );
                    // Close the drawer on selection
                    if ( typeof drawer.__tcDeskClose === 'function' ) {
                        drawer.__tcDeskClose();
                    }
                });
            });
        }

        // Apply the user's persisted choice on every page load
        setTrail( readStored() );
    }

    if ( doc.readyState === 'loading' ) {
        doc.addEventListener( 'DOMContentLoaded', init );
    } else {
        init();
    }
} )();
