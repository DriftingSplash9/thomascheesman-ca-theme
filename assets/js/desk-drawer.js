/*!
 * desk-drawer.js — The Drawer footer's interactive layer.
 *
 * Responsibilities:
 *   1. Reveal the drawer on scroll-into-view (adds .is-open).
 *   2. Decode the rot13 email + copy-on-click.
 *   3. Live clock (Grande Prairie / America/Edmonton).
 *   4. Fetch the current pinball top score and pin it on the brass tag.
 *   5. Wire the marble button: lazy-load Matter.js, then desk-pinball.js,
 *      then hand off to TCPinball.boot(footerEl).
 *
 * Lazy-load policy: nothing pinball-related touches the network or main
 * thread until the visitor clicks the marble. Visitors who never click
 * pay zero. Matter.js (~85kb gz) and desk-pinball.js are both injected
 * on demand, cached by the browser thereafter.
 *
 * Mobile note: the desk-pinball table is keyboard-friendly (flippers on
 * A/L, plunger on Space). Touch flippers tap the left/right halves of
 * the canvas. Very narrow viewports show a "rotate to play" notice — the
 * physics needs landscape room. The marble itself remains tappable.
 */
( function () {
    'use strict';

    var MATTER_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.20.0/matter.min.js';

    document.addEventListener( 'DOMContentLoaded', function () {
        var footer = document.querySelector( '[data-tc-drawer]' );
        if ( ! footer ) return;

        revealOnScroll( footer );
        wireEmailCopy( footer );
        wireLiveClock( footer );
        fetchTopScore( footer );
        wireMarble( footer );
    } );

    // ----------------------------------------------------------------
    // 1. Reveal — adds .is-open the first time the drawer's lip
    // crosses the viewport. Pure visual polish; the drawer is always
    // functional without the class.
    function revealOnScroll( footer ) {
        if ( ! ( 'IntersectionObserver' in window ) ) {
            footer.classList.add( 'is-open' );
            return;
        }
        var io = new IntersectionObserver( function ( entries ) {
            entries.forEach( function ( entry ) {
                if ( entry.isIntersecting ) {
                    footer.classList.add( 'is-open' );
                    io.disconnect();
                }
            } );
        }, { rootMargin: '0px 0px -10% 0px' } );
        io.observe( footer );
    }

    // ----------------------------------------------------------------
    // 2. Email copy. The button carries the address rot13'd in source
    // so harvester bots see gibberish; we decode it on mount, reveal
    // the real text, and copy on click.
    function rot13( s ) {
        return s.replace( /[A-Za-z]/g, function ( c ) {
            var base = c <= 'Z' ? 65 : 97;
            return String.fromCharCode( ( ( c.charCodeAt( 0 ) - base + 13 ) % 26 ) + base );
        } );
    }
    function wireEmailCopy( footer ) {
        var button = footer.querySelector( '.tc-drawer__email[data-tc-email-rot13]' );
        if ( ! button ) return;
        var address = rot13( button.dataset.tcEmailRot13 || '' );
        if ( ! address ) return;
        var textEl = button.querySelector( '.tc-drawer__email-text' );
        if ( textEl ) textEl.textContent = address;

        var resetTimer = 0;
        button.addEventListener( 'click', async function () {
            var copied = false;
            try {
                await navigator.clipboard.writeText( address );
                copied = true;
            } catch ( e ) {
                try {
                    var ta = document.createElement( 'textarea' );
                    ta.value = address;
                    ta.style.position = 'fixed';
                    ta.style.top = '-1000px';
                    document.body.appendChild( ta );
                    ta.select();
                    copied = document.execCommand( 'copy' );
                    document.body.removeChild( ta );
                } catch ( e2 ) { copied = false; }
            }
            button.classList.toggle( 'is-copied', copied );
            if ( resetTimer ) clearTimeout( resetTimer );
            resetTimer = setTimeout( function () {
                button.classList.remove( 'is-copied' );
            }, 2200 );
        } );
    }

    // ----------------------------------------------------------------
    // 3. Live clock — Grande Prairie is on America/Edmonton (MDT/MST).
    // We let the browser do the timezone math via Intl.DateTimeFormat;
    // also pick the right abbreviation based on isDST.
    function wireLiveClock( footer ) {
        var slot = footer.querySelector( '[data-tc-clock]' );
        if ( ! slot ) return;
        var fmt = new Intl.DateTimeFormat( 'en-CA', {
            timeZone: 'America/Edmonton',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        } );
        function isMountainDST( d ) {
            // Simple DST check: compare the offset of this date to the
            // offset of Jan 1 of the same year for the same TZ. If they
            // differ, we're in DST.
            function offsetMinutes( date ) {
                var dtf = new Intl.DateTimeFormat( 'en-US', {
                    timeZone: 'America/Edmonton',
                    timeZoneName: 'shortOffset',
                } );
                var parts = dtf.formatToParts( date );
                var p = parts.find( function ( x ) { return x.type === 'timeZoneName'; } );
                if ( ! p ) return 0;
                // e.g. "GMT-7" or "GMT-6"
                var m = /GMT([+-]?\d+)(?::(\d+))?/.exec( p.value );
                if ( ! m ) return 0;
                return parseInt( m[ 1 ], 10 ) * 60 + ( m[ 2 ] ? parseInt( m[ 2 ], 10 ) : 0 );
            }
            var jan = new Date( d.getFullYear(), 0, 1 );
            return offsetMinutes( d ) !== offsetMinutes( jan );
        }
        function tick() {
            var now = new Date();
            slot.textContent = fmt.format( now ) + ' ' + ( isMountainDST( now ) ? 'MDT' : 'MST' );
        }
        tick();
        setInterval( tick, 30 * 1000 );
    }

    // ----------------------------------------------------------------
    // 4. Top pinball score — quick GET against the existing leaderboard.
    // Endpoint URL is exposed by tcDeskGames.scoresUrl (wp_localize_script
    // in functions.php). Silently fails to "—" if the call errors.
    function fetchTopScore( footer ) {
        var slot = footer.querySelector( '[data-tc-pinball-top]' );
        if ( ! slot ) return;
        var url = ( window.tcDeskGames && window.tcDeskGames.scoresUrl )
            ? window.tcDeskGames.scoresUrl + '?game=pinball'
            : '/wp-json/tc-games/v1/scores?game=pinball';
        fetch( url, { credentials: 'same-origin' } )
            .then( function ( r ) { return r.ok ? r.json() : null; } )
            .then( function ( data ) {
                if ( ! data ) return;
                // The endpoint returns either { pinball: [...] } or [...]
                // depending on whether the ?game= filter was honored.
                var rows = Array.isArray( data ) ? data : ( data.pinball || [] );
                if ( ! rows.length ) return;
                slot.textContent = rows[ 0 ].score.toLocaleString() + ' — ' + rows[ 0 ].name;
            } )
            .catch( function () { /* leave the "—" placeholder. */ } );
    }

    // ----------------------------------------------------------------
    // 5. Marble click → lazy-load Matter.js and desk-pinball.js, then
    // boot the game. Loads sequentially because desk-pinball.js depends
    // on global `Matter`. Once loaded, subsequent clicks are instant.
    function wireMarble( footer ) {
        var marble = footer.querySelector( '[data-tc-pinball-trigger]' );
        if ( ! marble ) return;

        var loaded = false;
        marble.addEventListener( 'click', function () {
            if ( window.TCPinball && window.TCPinball.boot ) {
                window.TCPinball.boot( footer );
                return;
            }
            if ( loaded ) return;
            loaded = true;
            marble.classList.add( 'is-loading' );
            loadScript( MATTER_CDN ).then( function () {
                var themeBase = ( window.tcVentures && window.tcVentures.themeUrl ) || '';
                var v = ( window.tcDeskGames && window.tcDeskGames.version ) || Date.now();
                return loadScript( themeBase + '/assets/js/desk-pinball.js?ver=' + encodeURIComponent( v ) );
            } ).then( function () {
                marble.classList.remove( 'is-loading' );
                if ( window.TCPinball && window.TCPinball.boot ) {
                    window.TCPinball.boot( footer );
                }
            } ).catch( function ( err ) {
                console.warn( 'Pinball failed to load — sorry.', err );
                marble.classList.remove( 'is-loading' );
                loaded = false;
            } );
        } );
    }

    function loadScript( src ) {
        return new Promise( function ( resolve, reject ) {
            var s = document.createElement( 'script' );
            s.src = src;
            s.async = true;
            s.onload = function () { resolve(); };
            s.onerror = function () { reject( new Error( 'Script failed: ' + src ) ); };
            document.head.appendChild( s );
        } );
    }

} )();
