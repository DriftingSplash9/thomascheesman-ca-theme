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
 *   interactions [ { on:'click'|'drop'|'combine', ..., once, require,
 *                    do:[...] } ]
 *
 * Object/zone ids share ONE namespace. State is "shown" | "hidden" |
 * "gone". x/y are the CENTRE of the element as a % of the artwork.
 *
 * --- Interaction-level gates ------------------------------------------
 *   once:true        — fire at most one time
 *   require:{ all:[flag,…], none:[flag,…] }
 *                    — precondition gate. An interaction is invisible to
 *                      the engine until its flags match. Used for chains
 *                      that depend on earlier progress (the padlock only
 *                      opens with keys + charms, the prize fork branches
 *                      on `dust-cleared`, etc.). `all` and `none` are
 *                      both optional; both default to []. The flag set
 *                      is global to the puzzle.
 *
 * --- Action verbs (inside an interaction's "do" list) ----------------
 *   reveal:[ids]  hide:[ids]  remove:[ids]   — state changes
 *   surface:id    — swap the drawer background
 *   flag:name     — set a progress flag
 *   clue:text     — show a handwritten clue card (\n splits paragraphs)
 *   effect:name   — play an effect ("flash" implemented; others stub)
 *   notify:name   — POST a milestone event so the site emails Thomas
 *                   (the puzzle-completion alert; see inc/drawer-events.php)
 *   video:id      — open a centred video player for the given WP
 *                   attachment id (resolved to a URL by functions.php).
 *                   Closes on backdrop click / Escape / playback end.
 *   fullscreen:id — request element.requestFullscreen() with the named
 *                   object's image at full bleed. Tap to exit early.
 *   passcode:{ expected, success:[…], failure:[…] }
 *                 — show a number-pad modal. The entered digits are
 *                   compared to `expected` (string). On match, the
 *                   `success` action list runs; on mismatch, `failure`.
 *                   Both lists are recursively interpreted by runActions.
 *   hangman:true  — open the Hangman mini-game. Picks a random word
 *                   from P.hangman[currentMonth] (the 12-month word
 *                   rotation in drawer-puzzle.json). Wins set flag
 *                   `hangman-won`; either outcome shows a clue card.
 *                   Re-playable from the same combine.
 *
 * --- Persistence ------------------------------------------------------
 * The whole world (surface, per-id states, flags, fired once-ids) is
 * saved to localStorage under tc_drawer_progress, keyed by puzzle
 * version. A version bump discards stale progress.
 *
 * Phase 4 hook: window.TCDrawerEngine.reset() wipes progress (handy
 * while authoring). boot() is idempotent.
 *
 * --- Author mode (add ?author to the URL) ----------------------------
 * Renders EVERY object + zone (hidden ones included, dimmed), makes
 * them all free-drag, and disables interactions. Drag to place, wheel
 * to resize (Shift+wheel = a zone's height). A toolbar offers "Copy
 * layout" — the current coordinates as pasteable JSON. Author layout
 * persists locally so a reload doesn't lose work. TCDrawerEngine.dump()
 * returns the same JSON from the console.
 */
window.TCDrawerEngine = ( function () {
    'use strict';

    var LS_KEY = 'tc_drawer_progress';
    var DRAG_THRESHOLD = 6; // px of movement before a press counts as a drag

    // Author mode: ?author anywhere in the query string.
    var AUTHOR = /[?&]author(=|&|$)/.test( location.search );
    var AUTHOR_LS = 'tc_drawer_author';

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
            if ( AUTHOR ) applyAuthorLayout();
            booted = true;
        }
        applySurface();
        render();
        if ( AUTHOR ) buildAuthorToolbar();
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
        // Author mode renders EVERYTHING so it can all be placed;
        // normal mode renders only what's currently "shown".
        // Zones first (lower z-index) so objects sit above them.
        for ( var z in P.zones ) {
            if ( P.zones.hasOwnProperty( z ) && ( AUTHOR || W.state[ z ] === 'shown' ) ) {
                mount.appendChild( buildZone( z, P.zones[ z ] ) );
            }
        }
        for ( var o in P.objects ) {
            if ( P.objects.hasOwnProperty( o ) && ( AUTHOR || W.state[ o ] === 'shown' ) ) {
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

        if ( AUTHOR ) {
            authorize( el, id, 'object' );
        } else {
            bindObject( el, id, def );
        }
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
        if ( AUTHOR ) authorize( el, id, 'zone' );
        return el;
    }

    // Author-mode decoration shared by objects + zones: an id tag, a
    // dimmed look for things not normally visible, and the drag binding.
    function authorize( el, id, kind ) {
        el.classList.add( 'is-author' );
        if ( W.state[ id ] !== 'shown' ) el.classList.add( 'is-author-hidden' );
        var tag = document.createElement( 'span' );
        tag.className = 'tc-author-tag';
        tag.textContent = id;
        el.appendChild( tag );
        bindAuthorDrag( el, id, kind );
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
            if ( ! moved && Math.abs( dx ) + Math.abs( dy ) > DRAG_THRESHOLD ) {
                moved = true;
                highlightTargets( id ); // light up valid drop targets
            }
            if ( ! moved ) return;
            var r = mount.getBoundingClientRect();
            el.style.left = ( ( e.clientX - r.left ) / r.width  * 100 ) + '%';
            el.style.top  = ( ( e.clientY - r.top  ) / r.height * 100 ) + '%';
        } );

        el.addEventListener( 'pointerup', function ( e ) {
            var wasDragging = dragging, didMove = moved;
            dragging = false; moved = false;
            el.classList.remove( 'is-dragging' );
            clearHighlights();
            try { el.releasePointerCapture( e.pointerId ); } catch ( ex ) {}

            if ( wasDragging && didMove ) {
                handleDrop( id, el );
            } else {
                handleClick( id );
            }
        } );

        el.addEventListener( 'lostpointercapture', function () {
            dragging = false; moved = false;
            el.classList.remove( 'is-dragging' );
            clearHighlights();
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

    // A drag that was released → test the dragged element against
    // zones + other objects by rectangle OVERLAP (forgiving — you
    // don't have to land the cursor pixel-perfect on a small zone).
    function handleDrop( id, el ) {
        var target = hitTest( el, id );
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

    // The other shown object/zone the dragged element overlaps MOST.
    function hitTest( selfEl, selfId ) {
        var sr = selfEl.getBoundingClientRect();
        var els = mount.children, best = null, bestArea = 0;
        for ( var i = 0; i < els.length; i++ ) {
            var el = els[ i ];
            if ( el.dataset.id === selfId ) continue;
            var r = el.getBoundingClientRect();
            var ox = Math.min( sr.right, r.right ) - Math.max( sr.left, r.left );
            var oy = Math.min( sr.bottom, r.bottom ) - Math.max( sr.top, r.top );
            if ( ox > 0 && oy > 0 && ox * oy > bestArea ) {
                bestArea = ox * oy;
                best = el.dataset.id;
            }
        }
        return best;
    }

    // While dragging, glow every zone/object that has a live
    // interaction with the dragged object — so it's obvious where
    // things go (and confirms zones actually rendered).
    function highlightTargets( draggedId ) {
        var list = P.interactions || [], wanted = {};
        for ( var i = 0; i < list.length; i++ ) {
            var x = list[ i ];
            if ( x.once && x.id && W.done.indexOf( x.id ) !== -1 ) continue;
            if ( ! meetsRequire( x.require ) ) continue;
            if ( x.on === 'drop' && x.object === draggedId ) wanted[ x.zone ] = 1;
            if ( x.on === 'combine' && x.a === draggedId )   wanted[ x.b ] = 1;
            if ( x.on === 'combine' && x.b === draggedId )   wanted[ x.a ] = 1;
        }
        var els = mount.children;
        for ( var j = 0; j < els.length; j++ ) {
            els[ j ].classList.toggle( 'is-droptarget', !! wanted[ els[ j ].dataset.id ] );
        }
    }
    function clearHighlights() {
        var els = mount.children;
        for ( var i = 0; i < els.length; i++ ) els[ i ].classList.remove( 'is-droptarget' );
    }

    function findInteraction( pred ) {
        var list = P.interactions || [];
        for ( var i = 0; i < list.length; i++ ) {
            var x = list[ i ];
            if ( x.once && x.id && W.done.indexOf( x.id ) !== -1 ) continue;
            if ( ! meetsRequire( x.require ) ) continue;
            if ( pred( x ) ) return x;
        }
        return null;
    }

    // `require: { all:[flag,…], none:[flag,…] }` — both optional. An
    // interaction with an unmet require is hidden from findInteraction
    // and from drag-time highlighting. The opposite flag combination
    // makes the OTHER path light up instead — the prize fork's two
    // ends sit on the same drop target with opposite requires.
    function meetsRequire( req ) {
        if ( ! req ) return true;
        var i;
        if ( req.all ) {
            for ( i = 0; i < req.all.length; i++ ) if ( ! W.flags[ req.all[ i ] ] ) return false;
        }
        if ( req.none ) {
            for ( i = 0; i < req.none.length; i++ ) if ( W.flags[ req.none[ i ] ] ) return false;
        }
        return true;
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
            if ( a.reveal )     setStates( a.reveal, 'shown' );
            if ( a.hide )       setStates( a.hide, 'hidden' );
            if ( a.remove )     setStates( a.remove, 'gone' );
            if ( a.surface )    { W.surface = a.surface; applySurface(); }
            if ( a.flag )       W.flags[ a.flag ] = true;
            if ( a.clue )       showClue( a.clue );
            if ( a.effect )     playEffect( a.effect );
            if ( a.notify )     sendEvent( a.notify );
            if ( a.video )      playVideo( a.video );
            if ( a.fullscreen ) goFullscreen( a.fullscreen );
            if ( a.passcode )   showPasscode( a.passcode );
            if ( a.hangman )    playHangman();
        }
    }

    // Fire-and-forget milestone ping → inc/drawer-events.php emails
    // Thomas. keepalive lets it complete even if the page is leaving.
    function sendEvent( name ) {
        var url = window.tcSecretDrawer && window.tcSecretDrawer.eventUrl;
        if ( ! url || ! window.fetch ) return;
        try {
            fetch( url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify( { event: String( name ) } ),
                keepalive: true,
                credentials: 'same-origin'
            } ).catch( function () {} );
        } catch ( e ) {}
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
    // Video overlay — centred player for a WP video attachment. The
    // target is an OBJECT id; functions.php resolves the attachment's
    // mime and, if it's a video, sets def.videoUrl alongside (or in
    // place of) def.mediaUrl. Closes on backdrop click, Escape, or
    // playback end. Auto-plays muted-on-fail (autoplay-policy fallback).
    function playVideo( objectId ) {
        if ( ! overlay ) return;
        var def = P.objects && P.objects[ objectId ];
        var src = def && ( def.videoUrl || def.mediaUrl );
        if ( ! src ) return;

        var stage = document.createElement( 'div' );
        stage.className = 'tc-drawer-video';
        stage.setAttribute( 'role', 'dialog' );
        stage.setAttribute( 'aria-modal', 'true' );

        var video = document.createElement( 'video' );
        video.src = src;
        video.controls = true;
        video.autoplay = true;
        video.playsInline = true;
        video.preload = 'auto';
        stage.appendChild( video );

        function close() {
            try { video.pause(); } catch ( e ) {}
            stage.classList.remove( 'is-in' );
            document.removeEventListener( 'keydown', onKey, true );
            setTimeout( function () { if ( stage.parentNode ) stage.remove(); }, 220 );
        }
        function onKey( e ) {
            if ( e.key === 'Escape' || e.key === 'Esc' ) {
                e.stopImmediatePropagation();
                close();
            }
        }
        stage.addEventListener( 'click', function ( e ) { if ( e.target === stage ) close(); } );
        video.addEventListener( 'ended', close );
        document.addEventListener( 'keydown', onKey, true );

        overlay.appendChild( stage );
        void stage.offsetWidth;
        stage.classList.add( 'is-in' );

        // The Promise rejection path covers Chrome's audible-autoplay
        // policy: if the browser blocks sound, mute and retry so the
        // payoff isn't a frozen first frame.
        var p = video.play();
        if ( p && p.catch ) p.catch( function () { video.muted = true; video.play().catch( function () {} ); } );
    }

    // -----------------------------------------------------------------
    // Fullscreen — the giant duck head crushes the whole browser. The
    // host element is a wrapper we create on the fly (we don't full-
    // screen the drawer itself because exiting would dismiss the
    // overlay too). On exit we tear the wrapper down.
    function goFullscreen( objectId ) {
        var def = P.objects && P.objects[ objectId ];
        var src = def && def.mediaUrl;
        if ( ! src ) return;

        var stage = document.createElement( 'div' );
        stage.className = 'tc-drawer-fullscreen';
        var img = document.createElement( 'img' );
        img.src = src;
        img.alt = def.name || '';
        img.draggable = false;
        stage.appendChild( img );
        document.body.appendChild( stage );

        function cleanup() {
            document.removeEventListener( 'fullscreenchange', onChange );
            if ( stage.parentNode ) stage.remove();
        }
        function onChange() { if ( ! document.fullscreenElement ) cleanup(); }
        document.addEventListener( 'fullscreenchange', onChange );
        stage.addEventListener( 'click', function () {
            if ( document.exitFullscreen ) document.exitFullscreen().catch( cleanup );
            else cleanup();
        } );

        // requestFullscreen may reject (not user-activated, denied).
        // Fall back to the in-page fullscreen stage rather than nothing —
        // the gag still lands, just without locking the OS chrome away.
        var req = stage.requestFullscreen && stage.requestFullscreen();
        if ( req && req.catch ) req.catch( function () { /* stage stays as overlay */ } );
    }

    // -----------------------------------------------------------------
    // Passcode pad — used by the Ledger. A small modal: digit pad,
    // entered string, CLEAR + OK. On match, success do-list fires;
    // on mismatch, failure (typically a "wrong code" clue).
    function showPasscode( spec ) {
        if ( ! overlay || ! spec || ! spec.expected ) return;
        var expected = String( spec.expected );
        var entered = '';

        var card = document.createElement( 'div' );
        card.className = 'tc-passcode';
        card.setAttribute( 'role', 'dialog' );
        card.setAttribute( 'aria-modal', 'true' );

        var paper = document.createElement( 'div' );
        paper.className = 'tc-passcode__paper';

        var screen = document.createElement( 'div' );
        screen.className = 'tc-passcode__screen';
        screen.textContent = ''.padEnd( expected.length, '·' );
        paper.appendChild( screen );

        var pad = document.createElement( 'div' );
        pad.className = 'tc-passcode__pad';
        // 1-9 top, then ⌫ / 0 / ✓ on the bottom row.
        [ '1','2','3','4','5','6','7','8','9','⌫','0','✓' ].forEach( function ( label ) {
            var b = document.createElement( 'button' );
            b.type = 'button';
            b.className = 'tc-passcode__key';
            b.textContent = label;
            b.addEventListener( 'click', function () {
                if ( label === '⌫' ) {
                    entered = entered.slice( 0, -1 );
                } else if ( label === '✓' ) {
                    return submit();
                } else if ( entered.length < expected.length ) {
                    entered += label;
                }
                paint();
                if ( entered.length === expected.length ) submit();
            } );
            pad.appendChild( b );
        } );
        paper.appendChild( pad );
        card.appendChild( paper );

        function paint() {
            var dots = entered.replace( /./g, '●' );
            screen.textContent = dots + ''.padEnd( expected.length - entered.length, '·' );
        }
        function close() {
            card.classList.remove( 'is-in' );
            document.removeEventListener( 'keydown', onKey, true );
            setTimeout( function () { if ( card.parentNode ) card.remove(); }, 220 );
        }
        function submit() {
            if ( entered === expected ) {
                close();
                runActions( spec.success || [] );
            } else {
                screen.classList.add( 'is-bad' );
                setTimeout( function () {
                    entered = '';
                    paint();
                    screen.classList.remove( 'is-bad' );
                    close();
                    runActions( spec.failure || [] );
                }, 480 );
            }
        }
        function onKey( e ) {
            if ( /^[0-9]$/.test( e.key ) ) {
                if ( entered.length < expected.length ) { entered += e.key; paint(); }
                if ( entered.length === expected.length ) submit();
            } else if ( e.key === 'Backspace' ) {
                entered = entered.slice( 0, -1 );
                paint();
            } else if ( e.key === 'Enter' ) {
                submit();
            } else if ( e.key === 'Escape' || e.key === 'Esc' ) {
                e.stopImmediatePropagation();
                close();
            }
        }
        document.addEventListener( 'keydown', onKey, true );

        overlay.appendChild( card );
        void card.offsetWidth;
        card.classList.add( 'is-in' );
    }

    // -----------------------------------------------------------------
    // Hangman mini-game (chain 9). Word source: P.hangman[month], a
    // 12-keyed object of 20-word arrays. Picks one at random for the
    // current calendar month. Classic A-Z guessing — 6 wrong = noose.
    // Win sets the `hangman-won` flag. Either outcome closes the modal
    // and shows a clue card with the answer.
    var HANGMAN_GALLOWS = [
        "  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========",
        "  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========",
        "  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========",
        "  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========",
        "  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========",
        "  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========",
        "  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n========="
    ];

    function playHangman() {
        if ( ! overlay || ! P.hangman ) return;
        var month = new Date().getMonth() + 1;
        var pool = P.hangman[ month ] || P.hangman[ String( month ) ] || P.hangman[ 1 ] || P.hangman[ '1' ];
        if ( ! pool || ! pool.length ) return;
        var word = String( pool[ Math.floor( Math.random() * pool.length ) ] ).toUpperCase();
        var guessed = {};
        var wrong   = 0;
        var MAX_WRONG = HANGMAN_GALLOWS.length - 1;
        var settled = false;

        var card = document.createElement( 'div' );
        card.className = 'tc-hangman';
        card.setAttribute( 'role', 'dialog' );
        card.setAttribute( 'aria-modal', 'true' );

        var paper = document.createElement( 'div' );
        paper.className = 'tc-hangman__paper';

        var gallows = document.createElement( 'pre' );
        gallows.className = 'tc-hangman__gallows';
        paper.appendChild( gallows );

        var wordEl = document.createElement( 'div' );
        wordEl.className = 'tc-hangman__word';
        paper.appendChild( wordEl );

        var usedEl = document.createElement( 'div' );
        usedEl.className = 'tc-hangman__used';
        paper.appendChild( usedEl );

        var keyboard = document.createElement( 'div' );
        keyboard.className = 'tc-hangman__keys';
        var buttons = {};
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split( '' ).forEach( function ( L ) {
            var b = document.createElement( 'button' );
            b.type = 'button';
            b.className = 'tc-hangman__key';
            b.textContent = L;
            b.addEventListener( 'click', function () { guess( L ); } );
            buttons[ L ] = b;
            keyboard.appendChild( b );
        } );
        paper.appendChild( keyboard );

        card.appendChild( paper );

        function renderWord() {
            return word.split( '' ).map( function ( c ) {
                if ( /[A-Z]/.test( c ) ) return guessed[ c ] ? c : '_';
                return c; // spaces, hyphens — passed through
            } ).join( ' ' );
        }
        function isWon() {
            for ( var i = 0; i < word.length; i++ ) {
                var c = word.charAt( i );
                if ( /[A-Z]/.test( c ) && ! guessed[ c ] ) return false;
            }
            return true;
        }
        function paint() {
            gallows.textContent = HANGMAN_GALLOWS[ Math.min( wrong, MAX_WRONG ) ];
            wordEl.textContent = renderWord();
            var used = Object.keys( guessed ).sort().join( ' ' );
            usedEl.textContent = used ? 'Tried: ' + used : '';
        }
        function close( finalMsg ) {
            settled = true;
            card.classList.remove( 'is-in' );
            document.removeEventListener( 'keydown', onKey, true );
            setTimeout( function () {
                if ( card.parentNode ) card.remove();
                if ( finalMsg ) showClue( finalMsg );
            }, 240 );
        }
        function guess( L ) {
            if ( settled || guessed[ L ] ) return;
            guessed[ L ] = true;
            var hit = word.indexOf( L ) !== -1;
            if ( ! hit ) wrong++;
            var btn = buttons[ L ];
            if ( btn ) {
                btn.disabled = true;
                btn.classList.add( hit ? 'is-hit' : 'is-miss' );
            }
            paint();
            if ( isWon() ) {
                W.flags[ 'hangman-won' ] = true;
                save();
                setTimeout( function () {
                    close( "You cracked it.\n\nThe word was " + word + "." );
                }, 360 );
            } else if ( wrong >= MAX_WRONG ) {
                setTimeout( function () {
                    close( "The noose pulls.\n\nThe word was " + word + ".\n\n(Words rotate by month — try again.)" );
                }, 520 );
            }
        }
        function onKey( e ) {
            var k = ( e.key || '' ).toUpperCase();
            if ( /^[A-Z]$/.test( k ) ) { e.stopImmediatePropagation(); guess( k ); }
            else if ( k === 'ESCAPE' || k === 'ESC' ) {
                e.stopImmediatePropagation();
                close();
            }
        }
        document.addEventListener( 'keydown', onKey, true );

        overlay.appendChild( card );
        void card.offsetWidth;
        card.classList.add( 'is-in' );
        paint();
    }

    // =================================================================
    // AUTHOR MODE — free layout. Drag to reposition, wheel to resize.
    // Interactions are off; this is purely for placing things and
    // copying the coordinates back out.
    function round1( n ) { return Math.round( n * 10 ) / 10; }

    // Author-mode drag state. ONE active drag at a time, tracked here
    // so the single set of global document handlers below can find it.
    // Per-element handlers are minimal — they just register intent
    // (set authorDragActive on pointerdown) and let the document
    // handlers do the work.
    var authorDragActive = null;
    var authorGlobalsBound = false;

    function ensureAuthorGlobals() {
        if ( authorGlobalsBound ) return;
        authorGlobalsBound = true;

        document.addEventListener( 'pointermove', function ( e ) {
            var a = authorDragActive;
            if ( ! a || ! mount ) return;
            var r = mount.getBoundingClientRect();
            if ( ! r.width || ! r.height ) return;
            a.def.x = round1( ( e.clientX - r.left ) / r.width  * 100 );
            a.def.y = round1( ( e.clientY - r.top  ) / r.height * 100 );
            a.el.style.left = a.def.x + '%';
            a.el.style.top  = a.def.y + '%';
        }, true );

        var endDrag = function () {
            var a = authorDragActive;
            if ( ! a ) return;
            a.el.classList.remove( 'is-dragging' );
            authorDragActive = null;
            saveAuthorLayout();
        };
        document.addEventListener( 'pointerup',     endDrag, true );
        document.addEventListener( 'pointercancel', endDrag, true );

        // Defensive net: if the page loses focus (alt-tab, blur) mid-drag,
        // any subsequent move events stop firing and we never end the
        // drag. Treat blur as a release too.
        window.addEventListener( 'blur', endDrag );
    }

    function bindAuthorDrag( el, id, kind ) {
        var def = ( kind === 'zone' ? P.zones[ id ] : P.objects[ id ] );
        if ( ! def ) return;
        ensureAuthorGlobals();

        el.addEventListener( 'pointerdown', function ( e ) {
            if ( e.button != null && e.button !== 0 ) return;
            e.preventDefault();
            // Release any implicit pointer capture so the document-level
            // handlers receive subsequent pointer events without being
            // intercepted. (Chrome sets implicit capture on the
            // pointerdown target.)
            try { el.releasePointerCapture( e.pointerId ); } catch ( ex ) {}
            authorDragActive = { el: el, def: def, id: id };
            el.classList.add( 'is-dragging' );
        } );

        // Wheel = width; Shift+wheel = a zone's height; Alt+wheel = rotate
        // (objects only — zones are axis-aligned rectangles).
        el.addEventListener( 'wheel', function ( e ) {
            e.preventDefault();
            if ( kind === 'object' && e.altKey ) {
                var delta = e.deltaY < 0 ? -3 : 3;
                def.rot = round1( ( def.rot || 0 ) + delta );
                el.style.setProperty( '--rot', def.rot + 'deg' );
                saveAuthorLayout();
                return;
            }
            var step = e.deltaY < 0 ? 1.05 : 0.95;
            if ( kind === 'zone' && e.shiftKey ) {
                def.h = round1( Math.max( 2, ( def.h || 10 ) * step ) );
                el.style.height = def.h + '%';
            } else {
                def.w = round1( Math.max( 2, ( def.w || 10 ) * step ) );
                el.style.width = def.w + '%';
            }
            saveAuthorLayout();
        }, { passive: false } );
    }

    // Author layout persists locally (applied OVER the puzzle defs) so
    // an in-progress arrangement survives a reload.
    function saveAuthorLayout() {
        var out = { objects: {}, zones: {} };
        for ( var o in P.objects ) if ( P.objects.hasOwnProperty( o ) ) {
            var od = P.objects[ o ];
            out.objects[ o ] = { x: od.x, y: od.y, w: od.w, rot: od.rot };
        }
        for ( var z in P.zones ) if ( P.zones.hasOwnProperty( z ) ) {
            var zd = P.zones[ z ];
            out.zones[ z ] = { x: zd.x, y: zd.y, w: zd.w, h: zd.h };
        }
        try { localStorage.setItem( AUTHOR_LS, JSON.stringify( out ) ); } catch ( e ) {}
    }
    function applyAuthorLayout() {
        var saved;
        try { saved = JSON.parse( localStorage.getItem( AUTHOR_LS ) || 'null' ); }
        catch ( e ) { saved = null; }
        if ( ! saved ) return;
        applyCoords( saved.objects, P.objects );
        applyCoords( saved.zones, P.zones );
    }
    function applyCoords( src, dst ) {
        if ( ! src || ! dst ) return;
        for ( var k in src ) {
            if ( src.hasOwnProperty( k ) && dst[ k ] ) {
                [ 'x', 'y', 'w', 'h', 'rot' ].forEach( function ( p ) {
                    if ( typeof src[ k ][ p ] === 'number' ) dst[ k ][ p ] = src[ k ][ p ];
                } );
            }
        }
    }

    // The deliverable: current objects + zones as pasteable JSON.
    function dumpLayout() {
        var pick = function ( d, keys ) {
            var o = {};
            keys.forEach( function ( k ) { if ( d[ k ] !== undefined ) o[ k ] = d[ k ]; } );
            return o;
        };
        var objs = {}, zns = {};
        for ( var o in P.objects ) if ( P.objects.hasOwnProperty( o ) ) {
            objs[ o ] = pick( P.objects[ o ], [ 'x', 'y', 'w', 'rot' ] );
        }
        for ( var z in P.zones ) if ( P.zones.hasOwnProperty( z ) ) {
            zns[ z ] = pick( P.zones[ z ], [ 'x', 'y', 'w', 'h' ] );
        }
        return JSON.stringify( { objects: objs, zones: zns }, null, 2 );
    }

    function buildAuthorToolbar() {
        if ( document.querySelector( '.tc-author-bar' ) ) return;
        var bar = document.createElement( 'div' );
        bar.className = 'tc-author-bar';
        bar.innerHTML = '<strong>AUTHOR MODE</strong>' +
            '<span class="tc-author-bar__hint">drag to place · wheel resize · alt+wheel rotate · shift+wheel zone height</span>';

        var copyBtn = document.createElement( 'button' );
        copyBtn.type = 'button';
        copyBtn.textContent = 'Copy layout';
        copyBtn.addEventListener( 'click', function () {
            var json = dumpLayout();
            var done = function () {
                copyBtn.textContent = 'Copied ✓';
                setTimeout( function () { copyBtn.textContent = 'Copy layout'; }, 1800 );
            };
            if ( navigator.clipboard && navigator.clipboard.writeText ) {
                navigator.clipboard.writeText( json ).then( done, function () {
                    window.prompt( 'Copy the layout JSON:', json );
                } );
            } else {
                window.prompt( 'Copy the layout JSON:', json );
            }
        } );
        bar.appendChild( copyBtn );

        // Surface previews — arrange objects against any drawer state.
        for ( var s in P.surfaces ) {
            if ( P.surfaces.hasOwnProperty( s ) ) {
                ( function ( sid ) {
                    var b = document.createElement( 'button' );
                    b.type = 'button';
                    b.className = 'tc-author-bar__surface';
                    b.textContent = sid;
                    b.addEventListener( 'click', function () {
                        W.surface = sid;
                        applySurface();
                    } );
                    bar.appendChild( b );
                } )( s );
            }
        }
        document.body.appendChild( bar );
    }

    // -----------------------------------------------------------------
    function esc( s ) {
        return String( s ).replace( /[&<>"]/g, function ( c ) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ c ];
        } );
    }

    return { boot: boot, reset: reset, dump: dumpLayout };
} )();
