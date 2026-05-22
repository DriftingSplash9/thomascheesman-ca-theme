/*!
 * drawer-engine.js — "The Secret Drawer" interaction engine (Phase 2).
 *
 * A small, data-driven escape-room engine. ALL puzzle content lives in
 * inc/data/drawer-puzzle.json (localised to window.tcSecretDrawer.puzzle
 * with media IDs already resolved to URLs by functions.php). This file
 * is the interpreter; Phase 4 only edits the JSON.
 *
 * Lazy-loaded by secret-drawer.js the first time the drawer opens —
 * visitors who never tighten the handle never download it.
 *
 * --- Data model -------------------------------------------------------
 *   surfaces     id -> background image URL (the drawer artwork states)
 *   objects      id -> { name, media|placeholder, x,y,w,rot, state,
 *                        draggable, hint }
 *   zones        id -> { x,y,w,h, state, hint }   (drop targets)
 *   interactions [ { on:'click'|'drop'|'combine', ..., once, do:[...] } ]
 *
 * Object/zone ids share ONE namespace. State is "shown" | "hidden" |
 * "gone". x/y are the CENTRE of the element as a % of the artwork.
 *
 * --- Action verbs (inside an interaction's "do" list) ----------------
 *   reveal:[ids]  hide:[ids]  remove:[ids]   — state changes
 *   surface:id    — swap the drawer background
 *   flag:name     — set a progress flag
 *   clue:text     — show a handwritten clue card (\n splits paragraphs)
 *   effect:name   — play an effect ("flash" implemented; others stub)
 *
 * --- Persistence ------------------------------------------------------
 * The whole world (surface, per-id states, flags, fired once-ids) is
 * saved to localStorage under tc_drawer_progress, keyed by puzzle
 * version. A version bump discards stale progress.
 *
 * Phase 4 hook: window.TCDrawerEngine.reset() wipes progress (handy
 * while authoring). boot() is idempotent.
 */
window.TCDrawerEngine = ( function () {
    'use strict';

    var LS_KEY = 'tc_drawer_progress';
    var DRAG_THRESHOLD = 6; // px of movement before a press counts as a drag

    var P = null;      // puzzle data
    var W = null;      // world state
    var mount = null;  // the .tc-secret-drawer__objects layer
    var bgImg = null;  // the .tc-secret-drawer__bg <img>
    var overlay = null;
    var booted = false;

    // -----------------------------------------------------------------
    function boot( mountEl ) {
        P = ( window.tcSecretDrawer && window.tcSecretDrawer.puzzle ) || null;
        if ( ! P || ! mountEl ) return;
        mount = mountEl;
        bgImg = document.querySelector( '[data-tc-secret-bg]' );
        overlay = mountEl.closest( '[data-tc-secret-drawer]' );

        if ( ! booted ) {
            W = loadProgress() || freshWorld();
            booted = true;
        }
        applySurface();
        render();
    }

    function freshWorld() {
        var w = { v: P.version, surface: P.start, state: {}, flags: {}, done: [] };
        eachDef( function ( id, def ) { w.state[ id ] = def.state || 'hidden'; } );
        return w;
    }

    // Iterate every object + zone definition.
    function eachDef( fn ) {
        var k;
        for ( k in P.objects ) if ( P.objects.hasOwnProperty( k ) ) fn( k, P.objects[ k ], 'object' );
        for ( k in P.zones )   if ( P.zones.hasOwnProperty( k ) )   fn( k, P.zones[ k ], 'zone' );
    }
    function defOf( id )  { return ( P.objects && P.objects[ id ] ) || ( P.zones && P.zones[ id ] ) || null; }
    function isZone( id ) { return !! ( P.zones && P.zones[ id ] ); }

    // -----------------------------------------------------------------
    // Persistence
    function loadProgress() {
        try {
            var raw = localStorage.getItem( LS_KEY );
            if ( ! raw ) return null;
            var saved = JSON.parse( raw );
            if ( ! saved || saved.v !== P.version ) return null; // stale → discard
            // Backfill any ids added since the save.
            eachDef( function ( id, def ) {
                if ( ! ( id in saved.state ) ) saved.state[ id ] = def.state || 'hidden';
            } );
            return saved;
        } catch ( e ) { return null; }
    }
    function save() {
        try { localStorage.setItem( LS_KEY, JSON.stringify( W ) ); } catch ( e ) {}
    }
    function reset() {
        try { localStorage.removeItem( LS_KEY ); } catch ( e ) {}
        W = freshWorld();
        applySurface();
        render();
    }

    // -----------------------------------------------------------------
    // Surface (background artwork)
    function applySurface() {
        if ( ! bgImg || ! P.surfaces ) return;
        var url = P.surfaces[ W.surface ];
        // The artwork is the same 16:9 size in every surface state, so a
        // plain src swap causes no layout jump; a "flash" effect is what
        // visually covers the change when an interaction triggers it.
        if ( url && bgImg.getAttribute( 'src' ) !== url ) bgImg.src = url;
    }

    // -----------------------------------------------------------------
    // Render — rebuild the objects layer from world state.
    function render() {
        if ( ! mount ) return;
        mount.innerHTML = '';
        // Zones first (lower z-index) so objects sit above them.
        for ( var z in P.zones ) {
            if ( P.zones.hasOwnProperty( z ) && W.state[ z ] === 'shown' ) {
                mount.appendChild( buildZone( z, P.zones[ z ] ) );
            }
        }
        for ( var o in P.objects ) {
            if ( P.objects.hasOwnProperty( o ) && W.state[ o ] === 'shown' ) {
                mount.appendChild( buildObject( o, P.objects[ o ] ) );
            }
        }
    }

    function place( el, def ) {
        el.style.left = def.x + '%';
        el.style.top  = def.y + '%';
        el.style.width = ( def.w || 10 ) + '%';
        el.style.setProperty( '--rot', ( def.rot || 0 ) + 'deg' );
    }

    function buildObject( id, def ) {
        var el = document.createElement( 'div' );
        el.className = 'tc-do' + ( def.draggable ? ' is-draggable' : '' );
        el.dataset.id = id;
        place( el, def );

        if ( def.mediaUrl ) {
            var img = document.createElement( 'img' );
            img.src = def.mediaUrl;
            img.alt = def.name || '';
            img.draggable = false;
            el.appendChild( img );
        } else {
            // Placeholder chip — un-shot object (Phase 3 will supply media).
            el.classList.add( 'is-placeholder' );
            var ph = ( def.placeholder || {} );
            el.innerHTML = '<span class="tc-do__chip">' +
                ( ph.icon ? '<span class="tc-do__icon">' + esc( ph.icon ) + '</span>' : '' ) +
                esc( ph.label || def.name || id ) + '</span>';
        }
        if ( def.hint ) el.appendChild( hintEl( def.hint ) );

        bindObject( el, id, def );
        return el;
    }

    function buildZone( id, def ) {
        var el = document.createElement( 'div' );
        el.className = 'tc-zone';
        el.dataset.id = id;
        el.style.left = def.x + '%';
        el.style.top  = def.y + '%';
        el.style.width  = ( def.w || 10 ) + '%';
        el.style.height = ( def.h || 10 ) + '%';
        if ( def.hint ) el.appendChild( hintEl( def.hint ) );
        return el;
    }

    function hintEl( text ) {
        var h = document.createElement( 'span' );
        h.className = 'tc-do__hint';
        h.textContent = text;
        return h;
    }

    // -----------------------------------------------------------------
    // Interaction binding — click + pointer drag (combine / drop).
    function bindObject( el, id, def ) {
        var startX = 0, startY = 0, dragging = false, moved = false;

        el.addEventListener( 'pointerdown', function ( e ) {
            if ( e.button != null && e.button !== 0 ) return;
            startX = e.clientX; startY = e.clientY;
            moved = false;
            dragging = !! def.draggable;
            if ( dragging ) {
                el.setPointerCapture( e.pointerId );
                el.classList.add( 'is-dragging' );
            }
        } );

        el.addEventListener( 'pointermove', function ( e ) {
            if ( ! dragging ) return;
            var dx = e.clientX - startX, dy = e.clientY - startY;
            if ( ! moved && Math.abs( dx ) + Math.abs( dy ) > DRAG_THRESHOLD ) moved = true;
            if ( ! moved ) return;
            var r = mount.getBoundingClientRect();
            el.style.left = ( ( e.clientX - r.left ) / r.width  * 100 ) + '%';
            el.style.top  = ( ( e.clientY - r.top  ) / r.height * 100 ) + '%';
        } );

        el.addEventListener( 'pointerup', function ( e ) {
            var wasDragging = dragging, didMove = moved;
            dragging = false;
            el.classList.remove( 'is-dragging' );
            try { el.releasePointerCapture( e.pointerId ); } catch ( ex ) {}

            if ( wasDragging && didMove ) {
                handleDrop( id, e.clientX, e.clientY );
            } else {
                handleClick( id );
            }
        } );

        el.addEventListener( 'lostpointercapture', function () {
            dragging = false;
            el.classList.remove( 'is-dragging' );
        } );
    }

    // A press that didn't move → click interaction.
    function handleClick( id ) {
        var it = findInteraction( function ( x ) {
            return x.on === 'click' && x.object === id;
        } );
        if ( it ) { fire( it ); }
        else { render(); } // snap any stray transform back
    }

    // A drag that was released → test against zones + other objects.
    function handleDrop( id, cx, cy ) {
        var target = hitTest( id, cx, cy );
        var it = null;
        if ( target ) {
            if ( isZone( target ) ) {
                it = findInteraction( function ( x ) {
                    return x.on === 'drop' && x.object === id && x.zone === target;
                } );
            } else {
                it = findInteraction( function ( x ) {
                    return x.on === 'combine' &&
                        ( ( x.a === id && x.b === target ) || ( x.a === target && x.b === id ) );
                } );
            }
        }
        if ( it ) { fire( it ); }
        else { render(); } // no match → snap back home
    }

    // Topmost shown object/zone (other than self) under the point.
    function hitTest( selfId, cx, cy ) {
        var els = mount.children, hit = null;
        for ( var i = 0; i < els.length; i++ ) {
            var el = els[ i ];
            if ( el.dataset.id === selfId ) continue;
            var r = el.getBoundingClientRect();
            if ( cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom ) {
                hit = el.dataset.id; // later children paint on top → keep last match
            }
        }
        return hit;
    }

    function findInteraction( pred ) {
        var list = P.interactions || [];
        for ( var i = 0; i < list.length; i++ ) {
            var x = list[ i ];
            if ( x.once && x.id && W.done.indexOf( x.id ) !== -1 ) continue;
            if ( pred( x ) ) return x;
        }
        return null;
    }

    // -----------------------------------------------------------------
    // Fire an interaction: run its actions, mark once-fired, persist.
    function fire( it ) {
        if ( it.once && it.id && W.done.indexOf( it.id ) === -1 ) W.done.push( it.id );
        runActions( it.do || [] );
        save();
        render();
    }

    function runActions( list ) {
        for ( var i = 0; i < list.length; i++ ) {
            var a = list[ i ];
            if ( a.reveal )  setStates( a.reveal, 'shown' );
            if ( a.hide )    setStates( a.hide, 'hidden' );
            if ( a.remove )  setStates( a.remove, 'gone' );
            if ( a.surface ) { W.surface = a.surface; applySurface(); }
            if ( a.flag )    W.flags[ a.flag ] = true;
            if ( a.clue )    showClue( a.clue );
            if ( a.effect )  playEffect( a.effect );
        }
    }
    function setStates( ids, state ) {
        ( ids || [] ).forEach( function ( id ) { if ( id in W.state ) W.state[ id ] = state; } );
    }

    // -----------------------------------------------------------------
    // Effects
    function playEffect( name ) {
        var stage = overlay && overlay.querySelector( '.tc-secret-drawer__stage' );
        if ( ! stage ) return;
        if ( name === 'flash' ) {
            var f = document.createElement( 'div' );
            f.className = 'tc-drawer-flash';
            stage.appendChild( f );
            f.addEventListener( 'animationend', function () { f.remove(); }, { once: true } );
            setTimeout( function () { if ( f.parentNode ) f.remove(); }, 900 );
        }
        // Other effect types (giant-duck overlay, smash, video) land in
        // later phases once their assets exist.
    }

    // -----------------------------------------------------------------
    // Clue card — a handwritten note on aged paper, signed.
    function showClue( text ) {
        if ( ! overlay ) return;
        var card = document.createElement( 'div' );
        card.className = 'tc-clue';
        card.setAttribute( 'role', 'dialog' );
        card.setAttribute( 'aria-modal', 'true' );

        var paper = document.createElement( 'div' );
        paper.className = 'tc-clue__paper';

        var body = document.createElement( 'div' );
        body.className = 'tc-clue__body';
        String( text ).split( '\n' ).forEach( function ( line ) {
            var p = document.createElement( 'p' );
            p.textContent = line;
            body.appendChild( p );
        } );
        paper.appendChild( body );

        var sigSvg = window.tcSecretDrawer && window.tcSecretDrawer.signatureSvg;
        if ( sigSvg ) {
            var sig = document.createElement( 'div' );
            sig.className = 'tc-clue__sig';
            sig.innerHTML = sigSvg; // trusted: our own theme asset
            paper.appendChild( sig );
        }
        card.appendChild( paper );

        var dismiss = document.createElement( 'button' );
        dismiss.type = 'button';
        dismiss.className = 'tc-clue__dismiss';
        dismiss.textContent = 'got it';
        card.appendChild( dismiss );

        function close() {
            card.classList.remove( 'is-in' );
            setTimeout( function () { if ( card.parentNode ) card.remove(); }, 260 );
            document.removeEventListener( 'keydown', onKey, true );
        }
        // Capture phase + stopImmediatePropagation so Escape dismisses
        // only the clue — it must not also reach secret-drawer.js's
        // document handler and close the whole drawer.
        function onKey( e ) {
            if ( e.key === 'Escape' || e.key === 'Esc' ) {
                e.stopImmediatePropagation();
                close();
            }
        }

        dismiss.addEventListener( 'click', close );
        card.addEventListener( 'click', function ( e ) { if ( e.target === card ) close(); } );
        document.addEventListener( 'keydown', onKey, true );

        overlay.appendChild( card );
        void card.offsetWidth;          // reflow so the entrance animates
        card.classList.add( 'is-in' );
        dismiss.focus();
    }

    // -----------------------------------------------------------------
    function esc( s ) {
        return String( s ).replace( /[&<>"]/g, function ( c ) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ c ];
        } );
    }

    return { boot: boot, reset: reset };
} )();
