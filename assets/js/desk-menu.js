/*!
 * desk-menu.js — interactions for the desk-as-menu overlay.
 *
 * Self-contained module. Owns:
 *
 *   - The menu trigger      (toggles html.tc-desk-open on the
 *                            [data-menu-trigger] button in the
 *                            top-right capsule)
 *   - Memory-card bin       (opens the slideshow drawer)
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
        wireMenuMode();
        wireDrawer( 'tc-desk-bin',       'tc-desk-slideshow-drawer' );
        wireDrawer( 'tc-desk-mouse',     'tc-desk-trail-drawer'     );
        wireDrawer( 'tc-desk-frog',      'tc-desk-games-drawer'     );
        wireDrawer( 'tc-desk-crest',     'tc-desk-crest-drawer'     );
        wireCrestVideo();
        wireKeyboardSearch();
        wireGlobalEsc();
        wireScreensaver();
        wireCursorTrail();
        wireHotspotTilt();
        wireMobileAccordion();
        wireHotspotKeys();
    }

    /* The clickable hotspots are divs with role="button" (the markup
       keeps the freeform desk layout); give them the keyboard contract
       a real button would have — Enter and Space activate. */
    function wireHotspotKeys() {
        var spots = doc.querySelectorAll( '.tc-desk__hotspot--clickable' );
        for ( var i = 0; i < spots.length; i++ ) {
            spots[ i ].addEventListener( 'keydown', function ( e ) {
                if ( e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar' ) {
                    e.preventDefault();
                    this.click();
                }
            } );
        }
    }

    /* Mobile menu accordion — tapping a parent (Family / Heritage /
       Elsewhere) toggles its child list open/closed. Pure class toggle;
       the slide is a CSS max-height transition. */
    function wireMobileAccordion() {
        var toggles = doc.querySelectorAll( '.tc-mobile-menu .tc-mm__toggle' );
        for ( var i = 0; i < toggles.length; i++ ) {
            toggles[ i ].addEventListener( 'click', function () {
                var group = this.closest( '.tc-mm__group' );
                if ( ! group ) { return; }
                var open = group.classList.toggle( 'is-open' );
                this.setAttribute( 'aria-expanded', open ? 'true' : 'false' );
            } );
        }
    }

    /* Menu mode — the desk (default) vs. a plain vertical list. The
       choice is saved in localStorage so a visitor who prefers the
       plain menu only switches once. [data-tc-menu-mode] buttons live
       in the Contents panel ("plain") and the plain nav ("desk"). */
    function wireMenuMode() {
        var KEY = 'tcMenuMode';
        function apply( mode ) {
            doc.documentElement.classList.toggle( 'tc-desk-plain', mode === 'plain' );
        }
        try {
            if ( localStorage.getItem( KEY ) === 'plain' ) { apply( 'plain' ); }
        } catch ( e ) {}
        var buttons = doc.querySelectorAll( '[data-tc-menu-mode]' );
        for ( var i = 0; i < buttons.length; i++ ) {
            buttons[ i ].addEventListener( 'click', function () {
                var mode = this.getAttribute( 'data-tc-menu-mode' );
                apply( mode );
                try { localStorage.setItem( KEY, mode ); } catch ( e ) {}
            } );
        }
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
            // Move focus INTO the dialog (it claims aria-modal). The
            // overlay carries tabindex="-1" in the markup for this.
            overlay.focus( { preventScroll: true } );
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

        // While the overlay is open it declares aria-modal="true" — back
        // that claim up by actually trapping Tab inside it. The capsule
        // trigger sits visually ON TOP of the overlay (it's the Close
        // control), so it's included in the cycle even though it lives
        // outside the overlay's DOM.
        doc.addEventListener( 'keydown', function ( e ) {
            if ( e.key !== 'Tab' ) { return; }
            if ( ! doc.documentElement.classList.contains( 'tc-desk-open' ) ) { return; }
            var nodes = overlay.querySelectorAll(
                'a[href], button:not([disabled]), input, select, textarea, [role="button"][tabindex="0"]'
            );
            var list = [ primaryTrigger ];
            for ( var i = 0; i < nodes.length; i++ ) {
                var el = nodes[ i ];
                if ( el.getClientRects().length && getComputedStyle( el ).visibility !== 'hidden' ) {
                    list.push( el );
                }
            }
            var first  = list[ 0 ];
            var last   = list[ list.length - 1 ];
            var active = doc.activeElement;
            if ( e.shiftKey && ( active === first || ! ( overlay.contains( active ) || active === primaryTrigger ) ) ) {
                e.preventDefault();
                last.focus();
            } else if ( ! e.shiftKey && ( active === last || ! ( overlay.contains( active ) || active === primaryTrigger ) ) ) {
                e.preventDefault();
                first.focus();
            }
        } );

        // Expose close() so Esc can call it from the global handler.
        overlay.__tcDeskOverlayClose = close;

        // Any link inside the overlay closes the menu on click so the
        // navigation doesn't leave it hanging open. Skip anchors with
        // href="#" — those are purely interactive (drawer view-switching,
        // trail-variant cards) and shouldn't dismiss the overlay; their
        // own handlers decide whether to close anything.
        overlay.querySelectorAll( 'a' ).forEach( function ( link ) {
            link.addEventListener( 'click', function () {
                var href = link.getAttribute( 'href' );
                if ( ! href || href === '#' ) return;
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

        // Quick-pick chips populate the input AND submit immediately.
        // The form posts to home_url('/') with name="s" → WP search.
        var form = doc.getElementById( 'tc-desk-search-form' );
        search.querySelectorAll( '.tc-desk__chip' ).forEach( function ( chip ) {
            chip.addEventListener( 'click', function () {
                input.value = chip.dataset.q || '';
                if ( form ) {
                    if ( typeof form.requestSubmit === 'function' ) {
                        form.requestSubmit();
                    } else {
                        form.submit();
                    }
                }
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
     * Manages two layers, never both at once:
     *
     *   - "Variant" trails (stars / comet / bubbles / confetti / sparkles):
     *     DOM particles spawned at the cursor on throttled mousemove.
     *     When one is active, the default ink-trail canvas is suppressed
     *     via window.__tcInkSet({ enabled: false }).
     *
     *   - The default ink trail (defined in main.js's initInkTrail), with
     *     user-tunable color and length, OR explicitly off.
     *
     * State in localStorage:
     *   tc-trail        which row is active: one of the variants, 'ink', or 'off'
     *   tc-ink-color    hex string for the ink trail's stroke
     *   tc-ink-age      ms for the ink trail's fade (200..1500)
     *
     * The "Off" card in the drawer doesn't actually turn things off — it
     * opens an inner view (color swatches + length slider + a real Off
     * button) so the user can fine-tune the default trail.
     */
    function wireCursorTrail() {
        var html = doc.documentElement;
        var VARIANTS = [ 'stars', 'comet', 'bubbles', 'confetti', 'sparkles', 'ink', 'off' ];
        var INK_COLOR_DEFAULT = '#ffffff';
        var INK_AGE_DEFAULT   = 510;

        var isTouch  = window.matchMedia( '(pointer: coarse)' ).matches;
        var reduceMo = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

        var container = null;
        var mouseHandler = null;
        var lastSpawn = 0;
        var currentTrail = 'ink';

        // Pastel candy palette — used by bubbles, confetti, sparkles glow
        var PASTEL_RGB = [
            '255,170,190',  // coral
            '170,220,255',  // sky
            '210,180,255',  // lavender
            '255,230,150',  // butter
            '170,240,200',  // mint
            '255,190,160',  // peach
            '255,180,230',  // rose
            '195,230,170',  // sage
        ];

        function readStored( key, fallback ) {
            try { return localStorage.getItem( key ) || fallback; }
            catch ( err ) { return fallback; }
        }
        function writeStored( key, val ) {
            try { localStorage.setItem( key, val ); } catch ( err ) {}
        }

        function readSettings() {
            var v = readStored( 'tc-trail', 'ink' );
            if ( VARIANTS.indexOf( v ) < 0 ) v = 'ink';
            var color = readStored( 'tc-ink-color', INK_COLOR_DEFAULT );
            var age   = parseInt( readStored( 'tc-ink-age', INK_AGE_DEFAULT ), 10 );
            if ( ! age || age < 200 || age > 3000 ) age = INK_AGE_DEFAULT;
            return { variant: v, inkColor: color, inkAge: age };
        }

        function applyInkSettings( settings ) {
            if ( typeof window.__tcInkSet !== 'function' ) return;
            // Ink trail is "alive" only when variant is 'ink'. Variants
            // (stars/comet/etc.) and 'off' both suppress it.
            window.__tcInkSet({
                color: settings.inkColor,
                age: settings.inkAge,
                enabled: settings.variant === 'ink' && ! reduceMo && ! isTouch,
            });
        }

        function setVariant( name ) {
            if ( VARIANTS.indexOf( name ) < 0 ) name = 'ink';
            // Strip any old variant class
            VARIANTS.forEach( function ( t ) {
                if ( t !== 'ink' && t !== 'off' ) {
                    html.classList.remove( 'tc-trail-' + t );
                }
            });
            // Apply new variant class (only for DOM-particle variants)
            if ( name !== 'ink' && name !== 'off' ) {
                html.classList.add( 'tc-trail-' + name );
            }
            writeStored( 'tc-trail', name );
            currentTrail = name;

            // Variant-particle renderer on/off
            var isVariant = name !== 'ink' && name !== 'off';
            if ( isVariant && ! isTouch && ! reduceMo ) {
                startRenderer();
            } else {
                stopRenderer();
            }

            // Push ink settings (covers both enabled/disabled and color/length)
            applyInkSettings( readSettings() );
        }

        function setInkColor( color ) {
            writeStored( 'tc-ink-color', color );
            applyInkSettings( readSettings() );
            updateSwatchHighlight();
        }
        function setInkAge( age ) {
            writeStored( 'tc-ink-age', String( age ) );
            applyInkSettings( readSettings() );
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
                p.textContent = '★';
                // Random size 10..22px + twinkle hue via inline custom property
                var size = Math.round( 10 + Math.random() * 12 );
                p.style.fontSize = size + 'px';
                p.style.setProperty( '--twinkle', ( 0.7 + Math.random() * 0.6 ).toFixed( 2 ) );
            } else if ( currentTrail === 'bubbles' ) {
                p.textContent = '○';
                // Random size 12..28px + random pastel color
                var bsize = Math.round( 12 + Math.random() * 16 );
                p.style.fontSize = bsize + 'px';
                var brgb = PASTEL_RGB[ Math.floor( Math.random() * PASTEL_RGB.length ) ];
                p.style.color = 'rgba(' + brgb + ', 0.85)';
                p.style.textShadow = '0 0 ' + Math.round( bsize / 2 ) + 'px rgba(' + brgb + ', 0.55)';
                p.style.setProperty( '--drift', ( Math.random() * 50 - 25 ).toFixed( 1 ) + 'px' );
            } else if ( currentTrail === 'confetti' ) {
                var crgb = PASTEL_RGB[ Math.floor( Math.random() * PASTEL_RGB.length ) ];
                p.style.background = 'rgb(' + crgb + ')';
                p.style.setProperty( '--spin', ( Math.random() * 540 - 270 ).toFixed( 0 ) + 'deg' );
                p.style.setProperty( '--drift', ( Math.random() * 60 - 30 ).toFixed( 1 ) + 'px' );
            } else if ( currentTrail === 'sparkles' ) {
                p.textContent = '❖';
                // Random pastel glow color
                var srgb = PASTEL_RGB[ Math.floor( Math.random() * PASTEL_RGB.length ) ];
                p.style.color = '#ffffff';
                p.style.textShadow =
                    '0 0 4px #fff,' +
                    '0 0 10px rgba(' + srgb + ', 0.85),' +
                    '0 0 20px rgba(' + srgb + ', 0.45)';
                p.style.setProperty( '--spin', ( Math.random() < .5 ? -1 : 1 ) * ( 180 + Math.random() * 360 ) + 'deg' );
            }
            // 'comet' uses CSS-only styling

            container.appendChild( p );
            setTimeout( function () {
                if ( p.parentNode ) p.parentNode.removeChild( p );
            }, 2200 );
        }

        // --- Drawer wiring ---
        var drawer  = doc.getElementById( 'tc-desk-trail-drawer' );
        var mainView = drawer ? drawer.querySelector( '[data-trail-view="main"]' ) : null;
        var inkView  = drawer ? drawer.querySelector( '[data-trail-view="ink"]' )  : null;

        function showView( name ) {
            if ( ! mainView || ! inkView ) return;
            if ( name === 'ink' ) {
                mainView.setAttribute( 'hidden', '' );
                inkView.removeAttribute( 'hidden' );
            } else {
                inkView.setAttribute( 'hidden', '' );
                mainView.removeAttribute( 'hidden' );
            }
        }

        function updateSwatchHighlight() {
            if ( ! inkView ) return;
            var color = readSettings().inkColor.toLowerCase();
            inkView.querySelectorAll( '[data-ink-color]' ).forEach( function ( btn ) {
                if ( btn.dataset.inkColor.toLowerCase() === color ) {
                    btn.classList.add( 'is-selected' );
                } else {
                    btn.classList.remove( 'is-selected' );
                }
            });
        }

        // Helper: close the trail drawer AND the parent desk overlay
        // so the user is returned to their page to see the new trail.
        function closeAll() {
            if ( drawer && typeof drawer.__tcDeskClose === 'function' ) {
                drawer.__tcDeskClose();
            }
            var ov = doc.getElementById( 'tc-desk-menu' );
            if ( ov && typeof ov.__tcDeskOverlayClose === 'function' ) {
                ov.__tcDeskOverlayClose();
            }
        }

        if ( drawer ) {
            // Variant cards: clicking a real variant applies + closes
            // everything. Clicking "Off" instead opens the inner
            // settings view (overlay + drawer stay open for live preview).
            drawer.querySelectorAll( '[data-trail]' ).forEach( function ( card ) {
                card.addEventListener( 'click', function ( e ) {
                    e.preventDefault();
                    var t = card.dataset.trail;
                    if ( t === 'off' ) {
                        // Switch the drawer's view; ink stays alive with current
                        // settings so the user can preview tweaks live.
                        showView( 'ink' );
                        setVariant( 'ink' );
                        updateSwatchHighlight();
                        return;
                    }
                    setVariant( t );
                    closeAll();
                });
            });

            // Back button in the inner view returns to the main grid.
            var back = drawer.querySelector( '[data-trail-back]' );
            if ( back ) {
                back.addEventListener( 'click', function ( e ) {
                    e.preventDefault();
                    showView( 'main' );
                });
            }

            // Color swatches
            var swatches = drawer.querySelectorAll( '[data-ink-color]' );
            swatches.forEach( function ( btn ) {
                btn.addEventListener( 'click', function ( e ) {
                    e.preventDefault();
                    setInkColor( btn.dataset.inkColor );
                });
            });

            // Length slider
            var slider = drawer.querySelector( '[data-ink-age]' );
            if ( slider ) {
                slider.value = readSettings().inkAge;
                slider.addEventListener( 'input', function () {
                    setInkAge( parseInt( slider.value, 10 ) );
                });
            }

            // "Turn it off completely" button: closes drawer + overlay
            // so the user sees the result (no trail) on their page.
            var killBtn = drawer.querySelector( '[data-ink-off]' );
            if ( killBtn ) {
                killBtn.addEventListener( 'click', function ( e ) {
                    e.preventDefault();
                    setVariant( 'off' );
                    closeAll();
                });
            }

            // Whenever the drawer opens, always start on the main variant
            // grid. User clicks "Off" to descend into the ink-settings view.
            var drawerObs = new MutationObserver( function () {
                if ( drawer.classList.contains( 'is-open' ) ) {
                    showView( 'main' );
                    updateSwatchHighlight();
                }
            });
            drawerObs.observe( drawer, { attributes: true, attributeFilter: [ 'class' ] });
        }

        // Apply the user's persisted choice on every page load. Wait a
        // tick so main.js's initInkTrail has had a chance to register
        // its __tcInkSet hook.
        setTimeout( function () {
            setVariant( readSettings().variant );
            updateSwatchHighlight();
        }, 50 );
    }

    /**
     * Crest video — clicking Faith's Alberta crest opens the crest
     * drawer with one of two videos. Alternates per visitor via
     * localStorage so a second click flips to the other clip.
     *
     * Drawer open/close is handled by wireDrawer in init(); this
     * function just picks the URL, sets it as <video src>, and pauses
     * the video when the drawer closes (via MutationObserver on the
     * drawer's class).
     */
    function wireCrestVideo() {
        var trigger = doc.getElementById( 'tc-desk-crest' );
        var drawer  = doc.getElementById( 'tc-desk-crest-drawer' );
        if ( ! trigger || ! drawer ) return;

        var video = drawer.querySelector( '[data-crest-video]' );
        var URL_A = drawer.getAttribute( 'data-crest-video-a' );
        var URL_B = drawer.getAttribute( 'data-crest-video-b' );
        if ( ! video || ! URL_A || ! URL_B ) return;

        var KEY = 'tcDeskCrestLast';

        function pickNext() {
            var last = '';
            try { last = localStorage.getItem( KEY ) || ''; } catch ( e ) {}
            // First click ever → random. Otherwise → the other one.
            if ( last === URL_A ) return URL_B;
            if ( last === URL_B ) return URL_A;
            return Math.random() < 0.5 ? URL_A : URL_B;
        }

        trigger.addEventListener( 'click', function () {
            var url = pickNext();
            // Setting src triggers a fresh load — needed when toggling
            // between the two clips on consecutive clicks.
            if ( video.src !== url ) {
                video.src = url;
            }
            try { localStorage.setItem( KEY, url ); } catch ( e ) {}
            // Attempt autoplay. Browsers block this if the video has
            // audio and the page wasn't directly interacted with, but
            // we're inside a click handler so it usually flies. The
            // controls attribute means the user can hit play anyway.
            var p = video.play();
            if ( p && typeof p.catch === 'function' ) p.catch( function () {} );
        } );

        // Pause + rewind whenever the drawer closes (button, ESC,
        // click-outside) so audio doesn't keep playing in the background.
        var obs = new MutationObserver( function () {
            if ( ! drawer.classList.contains( 'is-open' ) ) {
                video.pause();
                try { video.currentTime = 0; } catch ( e ) {}
            }
        } );
        obs.observe( drawer, { attributes: true, attributeFilter: [ 'class' ] } );
    }

    /**
     * Hotspot 3D tilt — on hover, the object's ::before image tilts to
     * follow the cursor's position within the hotspot. Combined with
     * the CSS scale + lift drop-shadow, this gives flat PNGs a sense
     * of dimension: the object appears to lean toward where you're
     * looking, like it's responding to your attention.
     *
     * Implementation: on mousemove inside a hotspot, compute the
     * cursor's offset from the hotspot center as a fraction (-0.5 to
     * 0.5) of width/height. Map that to a small tilt angle and push
     * the result into --tilt-x / --tilt-y custom properties. CSS
     * reads those vars in :hover::before's transform.
     *
     * On mouseleave, reset the tilt to zero so the object eases back
     * to neutral as the hover transition unwinds.
     *
     * Sit-out conditions: reduced motion + touch (no fine pointer).
     * Without those, hover doesn't behave the same way anyway.
     */
    function wireHotspotTilt() {
        if ( window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ) return;
        if ( ! window.matchMedia( '(pointer: fine)' ).matches ) return;

        var hotspots = doc.querySelectorAll( '.tc-desk__hotspot' );
        var MAX_TILT = 14; // degrees, peak rotation at the corners

        hotspots.forEach( function ( hotspot ) {
            hotspot.addEventListener( 'mousemove', function ( e ) {
                var rect = hotspot.getBoundingClientRect();
                // Offset from center, normalized to [-0.5, 0.5].
                var fx = ( e.clientX - rect.left ) / rect.width  - 0.5;
                var fy = ( e.clientY - rect.top  ) / rect.height - 0.5;
                // Cursor on right side → element's right edge tilts
                // toward viewer (rotateY negative). Cursor on top →
                // top edge tilts toward viewer (rotateX positive).
                hotspot.style.setProperty( '--tilt-x', ( -fx * MAX_TILT ).toFixed( 2 ) + 'deg' );
                hotspot.style.setProperty( '--tilt-y', (  fy * MAX_TILT ).toFixed( 2 ) + 'deg' );
            } );

            hotspot.addEventListener( 'mouseleave', function () {
                hotspot.style.setProperty( '--tilt-x', '0deg' );
                hotspot.style.setProperty( '--tilt-y', '0deg' );
            } );
        } );
    }

    if ( doc.readyState === 'loading' ) {
        doc.addEventListener( 'DOMContentLoaded', init );
    } else {
        init();
    }
} )();
