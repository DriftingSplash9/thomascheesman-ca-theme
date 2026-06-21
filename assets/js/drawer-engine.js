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
 *   interactions [ { on:'click'|'drop'|'combine'|'auto', ..., once,
 *                    require, do:[...] } ]
 *
 * Object/zone ids share ONE namespace. State is "shown" | "hidden" |
 * "gone". x/y are the CENTRE of the element as a % of the artwork.
 *
 * An object/zone may carry an optional `view` field (e.g. "junk" or
 * "secret"). When set, the engine renders that element only while the
 * current surface key starts with the matching prefix — so a "secret"
 * object stays hidden while the player is on a junk-* surface and
 * vice-versa. Useful for the secret-drawer reveal: items inside the
 * lock-up shouldn't render while the player is in the wide junk view.
 *
 * `on: 'auto'` interactions fire themselves whenever the world state
 * satisfies their `require` precondition — after every other fire()
 * the engine sweeps autos and triggers any that newly qualify. Used
 * for "the keys reveal when the puzzle is complete" — no user action
 * directly triggers it; it's a function of accumulated flags.
 *
 * --- Interaction-level gates ------------------------------------------
 *   once:true        — fire at most one time
 *   require:{ all:[flag,…], none:[flag,…], minOf:{flags:[…],count:N} }
 *                    — precondition gate. An interaction is invisible to
 *                      the engine until its flags match. Used for chains
 *                      that depend on earlier progress (the padlock only
 *                      opens with keys + charms, the prize fork branches
 *                      on `dust-cleared`, etc.). `all`, `none`, `minOf`
 *                      are all optional. `minOf` fires when at least
 *                      `count` of the listed flags are set (used to drop
 *                      the gorilla tape into play partway through, when
 *                      3 of the 8 real-chain flags remain). The flag
 *                      set is global to the puzzle.
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
 *   choice:{ prompt, options:[ { label, do:[…] }, … ] }
 *                 — present a one-shot decision modal: the prompt
 *                   text + N labelled buttons. Clicking a button
 *                   runs that option's `do` list and closes the
 *                   modal. Used for the Golden-Egg EAT/SELL fork
 *                   and any future branching choice.
 *   youtube:"<id|url>"
 *                 — open a YouTube iframe overlay (autoplay,
 *                   no related videos, modestbranding). Accepts a
 *                   raw 11-character video id OR any youtu.be /
 *                   youtube.com / embed / shorts URL — the engine
 *                   extracts the id. Used by the iPhone click.
 *   stream:{ url, label }
 *                 — start (or replace) the corner radio widget
 *                   with this station. Direct mp3/aac/icecast URLs
 *                   use a plain <audio> element; .m3u8 URLs lazy-
 *                   load HLS.js from a CDN. Widget has play/pause,
 *                   volume, close. Only one stream plays at a time
 *                   — calling `stream:` again hard-cuts to the new
 *                   station. Used by the Bluetooth speaker channels.
 *   pacman:true   — open the desk arcade's Pac-Man on a modal canvas
 *                   inside the drawer. Reuses the game loop exposed
 *                   by desk-games.js (window.TCDeskGames.pacman). On
 *                   game over, offers play-again or close. If desk-
 *                   games.js isn't loaded, falls back to a clue card
 *                   pointing the player at the toad on the desk.
 *   bubbles:true|{count} — release N pearlescent bubbles that drift
 *                   up through the drawer stage and pop out the top.
 *                   Pure CSS animation, GPU-only (transform/opacity),
 *                   pointer-events none. Self-cleans after the longest
 *                   bubble finishes its rise. Used by the bubble-bottle
 *                   click — fires alongside the keep/bin choice modal.
 *   crash:"<object-id>" — full-viewport "object falls from above and
 *                   shatters the screen" gag. Builds a fixed overlay
 *                   above everything (z-index 99999), drops the
 *                   object's image with a bouncy entrance, overlays
 *                   an SVG crack pattern emanating from impact, holds
 *                   for ~3.5s, then fades out. Total lifetime ~5.4s.
 *                   Used by the giant-duck click.
 *   link:"<url>"  — open an https:// URL in a new tab via
 *                   window.open(noopener, noreferrer). Used to send
 *                   the player to the actual Bitcoin whitepaper PDF
 *                   when the scroll burns open. Non-https URLs are
 *                   rejected for safety.
 *   gallery:[{src,w,h},…]  + optional `after:[…]`
 *                 — open a PhotoSwipe v5 lightbox showing the given
 *                   images in sequence. Attachment IDs are resolved
 *                   to {src,w,h} server-side by functions.php so the
 *                   engine doesn't fetch metadata at runtime. If an
 *                   `after` action list is provided it runs when the
 *                   lightbox closes (used by the kids-camera chain
 *                   to follow the gallery with a keep/bin choice).
 *                   PhotoSwipe core is lazy-loaded from jsDelivr on
 *                   first use.
 *   scroll:"<url>"  — open the supplied PDF in a parchment-scroll
 *                   modal: two wooden spindle caps top + bottom,
 *                   scrollable parchment middle that renders the
 *                   PDF page-by-page (sepia + multiply blend so the
 *                   stark whitepaper takes on the cream of aged
 *                   paper). PDF.js is lazy-loaded from jsDelivr on
 *                   first use. Used by the BIC + rolled-scroll
 *                   combine (chain 4) to keep the Bitcoin whitepaper
 *                   in the puzzle world rather than a popup tab.
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
            applyUserPositions();
            booted = true;
        }
        applySurface();
        render();
        if ( AUTHOR ) buildAuthorToolbar();
        // Pick up any auto-fires whose `require` is already satisfied at
        // boot — e.g. a saved game whose preconditions were loosened by
        // a puzzle JSON edit, or a player whose final qualifying flag
        // got set in a session that closed before the sweep could land.
        else sweepAutoInteractions();
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
        // Tear down any in-flight puzzle modals (clue card, video,
        // passcode, scroll, etc.) so a mid-modal reset doesn't leave
        // stray overlays floating above a fresh drawer.
        if ( overlay ) {
            var selectors = [
                '.tc-clue', '.tc-passcode', '.tc-drawer-video', '.tc-drawer-youtube',
                '.tc-drawer-fullscreen', '.tc-drawer-scroll', '.tc-drawer-stream',
                '.tc-drawer-bubbles', '.tc-drawer-crash', '.tc-fx-blackhole-overlay',
                '.tc-pacman', '.tc-hangman', '.tc-drawer-flash'
            ];
            var nodes = overlay.querySelectorAll( selectors.join( ',' ) );
            for ( var i = 0; i < nodes.length; i++ ) nodes[ i ].remove();
            // A few effects mount outside the overlay (e.g. fullscreen).
            var bodyNodes = document.querySelectorAll( '.tc-drawer-fullscreen' );
            for ( var j = 0; j < bodyNodes.length; j++ ) bodyNodes[ j ].remove();
            var stageEl = overlay.querySelector( '.tc-secret-drawer__stage' );
            if ( stageEl ) stageEl.classList.remove( 'tc-fx-blackhole' );
        }
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
        var view = currentView();
        // Author mode renders EVERYTHING so it can all be placed;
        // normal mode renders only what's currently "shown" AND
        // matches the active view (if the def declared one).
        // Zones first (lower z-index) so objects sit above them.
        for ( var z in P.zones ) {
            if ( ! P.zones.hasOwnProperty( z ) ) continue;
            if ( ! AUTHOR && W.state[ z ] !== 'shown' ) continue;
            if ( ! AUTHOR && ! matchesView( P.zones[ z ], view ) ) continue;
            mount.appendChild( buildZone( z, P.zones[ z ] ) );
        }
        for ( var o in P.objects ) {
            if ( ! P.objects.hasOwnProperty( o ) ) continue;
            if ( ! AUTHOR && W.state[ o ] !== 'shown' ) continue;
            if ( ! AUTHOR && ! matchesView( P.objects[ o ], view ) ) continue;
            mount.appendChild( buildObject( o, P.objects[ o ] ) );
        }
    }

    // The current surface key (e.g. "junk-clean") collapses to a view
    // bucket via its prefix ("junk"). Objects/zones with no `view`
    // field render in every view; those with one render only when it
    // matches.
    function currentView() {
        var key = W && W.surface;
        if ( ! key ) return '';
        var dash = key.indexOf( '-' );
        return dash >= 0 ? key.slice( 0, dash ) : key;
    }
    function matchesView( def, view ) {
        if ( ! def || ! def.view ) return true;
        return def.view === view;
    }

    function place( el, def ) {
        el.style.left = def.x + '%';
        el.style.top  = def.y + '%';
        el.style.width = ( def.w || 10 ) + '%';
        el.style.setProperty( '--rot', ( def.rot || 0 ) + 'deg' );
    }

    function buildObject( id, def ) {
        var el = document.createElement( 'div' );
        // Every object is draggable unless the def explicitly opts out
        // with `draggable: false`. Players need to nudge clutter aside
        // to find what's buried, and the engine still treats a
        // press-without-movement as a click — so the click→clue flow
        // for "flavour-only" items keeps working.
        var classes = [ 'tc-do' ];
        if ( def.draggable !== false ) classes.push( 'is-draggable' );
        // classWhen: a map of { className: flagName } — adds the class
        // whenever the flag is set. Lets a def declare conditional
        // visual states (e.g. the jack-o-lantern's lit-glow when
        // `lantern-lit` is set) without runtime CSS injection.
        if ( def.classWhen ) {
            for ( var cls in def.classWhen ) {
                if ( def.classWhen.hasOwnProperty( cls ) && W.flags[ def.classWhen[ cls ] ] ) {
                    classes.push( cls );
                }
            }
        }
        el.className = classes.join( ' ' );
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
            // Draggable unless explicitly opted out. A press without
            // enough movement still falls through to handleClick on
            // pointerup, so click→clue interactions remain intact.
            dragging = def.draggable !== false;
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
        if ( it ) {
            fire( it );
        } else {
            // No interaction matched — honour the player's intent
            // and leave the object where they dropped it. They were
            // probably moving it out of the way to reveal what's
            // buried underneath. Persist the new coords in W so the
            // nudge survives a reload. Soft-clamp keeps the element
            // grabbable if a drop wandered off the stage edge.
            var def = P.objects[ id ];
            if ( def ) {
                var lx = parseFloat( el.style.left );
                var ly = parseFloat( el.style.top );
                if ( ! isNaN( lx ) ) def.x = Math.max( -3, Math.min( 103, lx ) );
                if ( ! isNaN( ly ) ) def.y = Math.max( -3, Math.min( 103, ly ) );
                W.userPositions = W.userPositions || {};
                W.userPositions[ id ] = { x: def.x, y: def.y };
                save();
                // Re-paint the inline style in case the clamp moved it.
                el.style.left = def.x + '%';
                el.style.top  = def.y + '%';
            }
        }
    }

    // The dragged element's best target by rectangle overlap. We
    // PREFER targets that have a live interaction with the dragged
    // object — so in a stacked drawer, dragging the screwdriver onto
    // an area where the screw is partially hidden under another
    // object still picks the SCREW (the valid target) instead of
    // whatever overlaps the most. Falls back to "any overlap" so the
    // drag still has feedback even when there's no matching rule.
    function hitTest( selfEl, selfId ) {
        var sr = selfEl.getBoundingClientRect();
        var validTargets = {};
        var list = P.interactions || [];
        for ( var k = 0; k < list.length; k++ ) {
            var x = list[ k ];
            if ( x.once && x.id && W.done.indexOf( x.id ) !== -1 ) continue;
            if ( ! meetsRequire( x.require ) ) continue;
            if ( x.on === 'drop'    && x.object === selfId ) validTargets[ x.zone ] = 1;
            if ( x.on === 'combine' && x.a      === selfId ) validTargets[ x.b ]    = 1;
            if ( x.on === 'combine' && x.b      === selfId ) validTargets[ x.a ]    = 1;
        }
        var els = mount.children;
        var bestValid = null, bestValidArea = 0;
        var bestAny   = null, bestAnyArea   = 0;
        for ( var i = 0; i < els.length; i++ ) {
            var el = els[ i ];
            if ( el.dataset.id === selfId ) continue;
            var r = el.getBoundingClientRect();
            var ox = Math.min( sr.right, r.right ) - Math.max( sr.left, r.left );
            var oy = Math.min( sr.bottom, r.bottom ) - Math.max( sr.top, r.top );
            if ( ox <= 0 || oy <= 0 ) continue;
            var area = ox * oy;
            var id   = el.dataset.id;
            if ( validTargets[ id ] && area > bestValidArea ) {
                bestValidArea = area;
                bestValid = id;
            }
            if ( area > bestAnyArea ) {
                bestAnyArea = area;
                bestAny = id;
            }
        }
        return bestValid || bestAny;
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
        if ( req.minOf ) {
            var pool = req.minOf.flags || [];
            var need = req.minOf.count || 0;
            var seen = 0;
            for ( i = 0; i < pool.length; i++ ) if ( W.flags[ pool[ i ] ] ) seen++;
            if ( seen < need ) return false;
        }
        return true;
    }

    // -----------------------------------------------------------------
    // Fire an interaction: run its actions, mark once-fired, persist.
    function fire( it ) {
        if ( it.once && it.id && W.done.indexOf( it.id ) === -1 ) W.done.push( it.id );
        // Combine-whoosh — every drag-onto-target combine gets a
        // cinematic swoosh by default (DRAGON-STUDIO via Pixabay).
        // Interactions can opt out with `silent: true` for moments
        // that own their own audio (the Faberge reveal video does).
        if ( it.on === 'combine' && ! it.silent ) playCombineWhoosh();
        runActions( it.do || [] );
        save();
        render();
        // Newly-set flags may have unlocked an `on: 'auto'` rule
        // (e.g. the keys reveal once every chain flag is in).
        sweepAutoInteractions();
    }

    // One Audio per call so overlapping combines don't cut each other
    // off — the file is small enough that the cost is fine.
    function playCombineWhoosh() {
        var url = window.tcSecretDrawer && window.tcSecretDrawer.assets &&
                  window.tcSecretDrawer.assets.combineWhoosh;
        if ( ! url ) return;
        try {
            var a = new Audio( url );
            a.volume = 0.35;
            var p = a.play();
            if ( p && p.catch ) p.catch( function () {} );
        } catch ( e ) {}
    }

    // Walk the interactions list and fire any `on: 'auto'` whose
    // preconditions are newly met. Guard against recursion + the same
    // auto firing twice with `once` + done-list bookkeeping.
    function sweepAutoInteractions() {
        var list = P.interactions || [];
        var fired = false;
        for ( var i = 0; i < list.length; i++ ) {
            var x = list[ i ];
            if ( x.on !== 'auto' ) continue;
            if ( x.once && x.id && W.done.indexOf( x.id ) !== -1 ) continue;
            if ( ! meetsRequire( x.require ) ) continue;
            if ( x.once && x.id ) W.done.push( x.id );
            runActions( x.do || [] );
            fired = true;
        }
        if ( fired ) {
            save();
            render();
            // Another auto might have unlocked further autos; cap depth
            // by relying on `once` to terminate the chain.
            sweepAutoInteractions();
        }
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
            if ( a.choice )     showChoice( a.choice );
            if ( a.youtube )    playYoutube( a.youtube );
            if ( a.stream )     playStream( a.stream );
            if ( a.pacman )     playPacman();
            if ( a.bubbles )    playBubbles( a.bubbles );
            if ( a.crash )      doCrash( a.crash );
            if ( a.link )       openLink( a.link );
            if ( a.gallery )    playGallery( a.gallery, a.after );
            if ( a.scroll )     showScroll( a.scroll );
        }
    }

    // Open an https URL in a new browser tab. Called inside a user-
    // gesture stack (combine/click → fire → runActions), so the popup
    // blocker should pass. Non-https rejected to avoid the engine
    // being a redirect helper for whatever ends up in the JSON.
    function openLink( url ) {
        if ( ! url || typeof url !== 'string' ) return;
        if ( ! /^https:\/\//i.test( url ) ) return;
        try { window.open( url, '_blank', 'noopener,noreferrer' ); } catch ( e ) {}
    }

    // Open a PhotoSwipe v5 lightbox with the supplied items. Items are
    // pre-resolved to {src,w,h} by functions.php. An optional `after`
    // action list fires when the lightbox closes — runs through the full
    // modal-action epilogue (save → render → sweep) so any state
    // changes persist and any auto-fires get a chance to qualify.
    //
    // PhotoSwipe core is reused across calls: the dataSource gets
    // swapped in place rather than re-importing the module per click.
    var pswpModule = null;
    var pswpLightboxClass = null;
    function playGallery( items, afterList ) {
        if ( ! Array.isArray( items ) || ! items.length ) return;

        function open() {
            var lightbox = new pswpLightboxClass( {
                dataSource: items.map( function ( it ) {
                    return { src: it.src, width: it.w, height: it.h, alt: '' };
                } ),
                pswpModule: function () { return Promise.resolve( pswpModule ); },
                showHideAnimationType: 'fade',
                bgOpacity: 0.96,
            } );
            lightbox.on( 'destroy', function () {
                if ( afterList && afterList.length ) {
                    runActions( afterList );
                    save();
                    render();
                    sweepAutoInteractions();
                }
            } );
            lightbox.init();
            lightbox.loadAndOpen( 0 );
        }

        if ( pswpLightboxClass && pswpModule ) {
            open();
            return;
        }
        var V = ( window.tcSecretDrawer && window.tcSecretDrawer.vendor ) || {};
        Promise.all( [
            import( V.pswpLightbox ),
            import( V.pswp ),
        ] ).then( function ( mods ) {
            pswpLightboxClass = mods[ 0 ].default;
            pswpModule = mods[ 1 ];
            open();
        } ).catch( function ( err ) {
            console.warn( '[drawer-engine] PhotoSwipe failed to load.', err );
        } );
    }

    // Open a PDF inside a parchment-scroll modal. The action accepts
    // either a plain URL string ("scroll": "https://…") or an object
    // ("scroll": { url, after:[…] }) — the latter mirrors gallery's
    // after-chain pattern so a future caller can sequence actions
    // post-close. PDF.js is lazy-loaded from the theme (self-hosted,
    // PERF-1) the first time a scroll opens; the module is memoised so
    // subsequent opens are a single network round-trip for the PDF itself.
    var pdfjs = null;
    function loadPdfJs() {
        if ( pdfjs ) return Promise.resolve( pdfjs );
        var V = ( window.tcSecretDrawer && window.tcSecretDrawer.vendor ) || {};
        return import( V.pdf ).then( function ( mod ) {
            pdfjs = mod;
            // The worker URL has to be set before getDocument() — once,
            // module-globally. Self-hosted from the theme; the .mjs worker
            // ships as .js so Hostinger serves a JS MIME (module workers
            // reject application/octet-stream).
            pdfjs.GlobalWorkerOptions.workerSrc = V.pdfWorker;
            return pdfjs;
        } );
    }
    function showScroll( spec ) {
        if ( ! overlay ) return;
        var url, afterList;
        if ( typeof spec === 'string' ) {
            url = spec;
        } else if ( spec && typeof spec === 'object' ) {
            url = spec.url;
            afterList = spec.after;
        }
        if ( ! url ) return;

        var stage = document.createElement( 'div' );
        stage.className = 'tc-drawer-scroll';
        stage.setAttribute( 'role', 'dialog' );
        stage.setAttribute( 'aria-modal', 'true' );
        stage.innerHTML =
            '<div class="tc-drawer-scroll__paper">' +
                '<div class="tc-drawer-scroll__cap tc-drawer-scroll__cap--top" aria-hidden="true"></div>' +
                '<div class="tc-drawer-scroll__parchment" data-tc-scroll-parchment>' +
                    '<p class="tc-drawer-scroll__loading">unrolling…</p>' +
                '</div>' +
                '<div class="tc-drawer-scroll__cap tc-drawer-scroll__cap--bottom" aria-hidden="true"></div>' +
            '</div>' +
            '<button type="button" class="tc-drawer-scroll__exit" aria-label="Close scroll">&times;</button>';

        var closed = false;
        function close() {
            if ( closed ) return;
            closed = true;
            document.removeEventListener( 'keydown', onKey, true );
            stage.classList.remove( 'is-in' );
            setTimeout( function () { if ( stage.parentNode ) stage.remove(); }, 280 );
            if ( afterList && afterList.length ) {
                runActions( afterList );
                save();
                render();
                sweepAutoInteractions();
            }
        }
        function onKey( e ) {
            if ( e.key === 'Escape' || e.key === 'Esc' ) {
                e.stopImmediatePropagation();
                close();
            }
        }
        stage.addEventListener( 'click', function ( e ) { if ( e.target === stage ) close(); } );
        stage.querySelector( '.tc-drawer-scroll__exit' ).addEventListener( 'click', close );
        document.addEventListener( 'keydown', onKey, true );

        overlay.appendChild( stage );
        void stage.offsetWidth;
        stage.classList.add( 'is-in' );

        var parchment = stage.querySelector( '[data-tc-scroll-parchment]' );

        loadPdfJs().then( function ( lib ) {
            return lib.getDocument( url ).promise;
        } ).then( function ( pdf ) {
            if ( closed ) return;
            parchment.innerHTML = '';
            // Render pages sequentially so the user can start reading
            // the top of the scroll while the bottom is still painting,
            // and so PDF.js doesn't try to render N canvases in
            // parallel on a low-power device.
            var chain = Promise.resolve();
            var _loop = function ( n ) {
                chain = chain.then( function () {
                    if ( closed ) return;
                    return pdf.getPage( n ).then( function ( page ) {
                        if ( closed ) return;
                        // Render at 2× the parchment width so the canvas
                        // stays crisp on HiDPI without ballooning memory.
                        var parchWidth = parchment.clientWidth - 44; // minus horizontal padding
                        var baseViewport = page.getViewport( { scale: 1 } );
                        var scale = ( parchWidth * 2 ) / baseViewport.width;
                        var viewport = page.getViewport( { scale: scale } );
                        var canvas = document.createElement( 'canvas' );
                        canvas.className = 'tc-drawer-scroll__page';
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;
                        parchment.appendChild( canvas );
                        return page.render( {
                            canvasContext: canvas.getContext( '2d' ),
                            viewport: viewport
                        } ).promise;
                    } );
                } );
            };
            for ( var i = 1; i <= pdf.numPages; i++ ) _loop( i );
            return chain;
        } ).catch( function ( err ) {
            console.warn( '[drawer-engine] scroll: PDF failed to load.', err );
            if ( ! closed ) {
                parchment.innerHTML = '<p class="tc-drawer-scroll__error">The scroll crumbles before you can read it.</p>';
            }
        } );
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
        } else if ( name === 'blackhole' ) {
            // Six-phase cosmic event: shake + chromatic wrongness, then
            // a swirling accretion disk + event horizon, then the stage
            // implodes into a screen-engulfing void, brief silence, a
            // blinding white flash + rebound. The visuals (disk, ring,
            // void, flash, the sucked-in astronaut clone) live in a
            // separate overlay element sibling to the stage so they
            // don't scale to nothing along with the imploding stage.
            var fx = document.createElement( 'div' );
            fx.className = 'tc-fx-blackhole-overlay';
            fx.innerHTML =
                '<div class="tc-fx-blackhole__disk"  aria-hidden="true"></div>' +
                '<div class="tc-fx-blackhole__ring"  aria-hidden="true"></div>' +
                '<div class="tc-fx-blackhole__void"  aria-hidden="true"></div>' +
                '<div class="tc-fx-blackhole__flash" aria-hidden="true"></div>';

            // If the astronaut is on the stage at fire-time, clone it
            // into the overlay so it can be animated being slingshotted
            // into the singularity. The original stays in the stage and
            // gets removed by the engine's `remove:` action (rendered
            // out immediately after the effect runs) — but by then the
            // clone in the overlay is independently animating, so the
            // sucked-in visual still lands.
            overlay.appendChild( fx );
            var astronaut = stage.querySelector( '[data-id="astronaut-sticker"]' );
            if ( astronaut ) {
                var aRect    = astronaut.getBoundingClientRect();
                var fxRect   = fx.getBoundingClientRect();
                var clone    = astronaut.cloneNode( true );
                clone.removeAttribute( 'data-id' );
                clone.className = ( clone.className || '' ).replace( /\bis-draggable\b/g, '' )
                    + ' tc-fx-blackhole__victim';
                clone.style.cssText =
                    'left:'   + ( aRect.left - fxRect.left ) + 'px;' +
                    'top:'    + ( aRect.top  - fxRect.top  ) + 'px;' +
                    'width:'  + aRect.width  + 'px;' +
                    'height:' + aRect.height + 'px;';
                // Distance from sticker centre to overlay centre — the
                // CSS keyframes use --dx/--dy to slingshot the clone
                // toward the singularity regardless of where it was.
                var dx = ( fxRect.width  / 2 ) - ( aRect.left - fxRect.left + aRect.width  / 2 );
                var dy = ( fxRect.height / 2 ) - ( aRect.top  - fxRect.top  + aRect.height / 2 );
                clone.style.setProperty( '--dx', dx + 'px' );
                clone.style.setProperty( '--dy', dy + 'px' );
                fx.appendChild( clone );
            }

            stage.classList.add( 'tc-fx-blackhole' );
            var clearBh = function () {
                stage.classList.remove( 'tc-fx-blackhole' );
                if ( fx.parentNode ) fx.remove();
            };
            setTimeout( clearBh, 2900 );
        }
        // Other effect types (smash, others) land as the puzzle asks for them.
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
                save();
                render();
                sweepAutoInteractions();
            } else {
                screen.classList.add( 'is-bad' );
                setTimeout( function () {
                    entered = '';
                    paint();
                    screen.classList.remove( 'is-bad' );
                    close();
                    runActions( spec.failure || [] );
                    save();
                    render();
                    sweepAutoInteractions();
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
    // YouTube overlay — for embeds that aren't WP attachments (most
    // famously the duct-taped-banana research video on the iPhone).
    // Accepts either an 11-char video id or any YouTube URL form;
    // anything else is rejected. Reuses the .tc-drawer-video scrim
    // styles so a YouTube clip and a WP video read the same.
    function playYoutube( ref ) {
        if ( ! overlay || ! ref ) return;
        var id = String( ref ).trim();
        var m = id.match( /(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/ );
        if ( m ) id = m[ 1 ];
        if ( ! /^[A-Za-z0-9_-]{11}$/.test( id ) ) return;

        var stage = document.createElement( 'div' );
        stage.className = 'tc-drawer-video tc-drawer-youtube';
        stage.setAttribute( 'role', 'dialog' );
        stage.setAttribute( 'aria-modal', 'true' );

        var iframe = document.createElement( 'iframe' );
        iframe.src = 'https://www.youtube-nocookie.com/embed/' + id +
            '?autoplay=1&rel=0&modestbranding=1&playsinline=1';
        iframe.setAttribute( 'allow',
            'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture' );
        iframe.setAttribute( 'allowfullscreen', '' );
        iframe.setAttribute( 'frameborder', '0' );
        iframe.setAttribute( 'title', 'YouTube video' );
        stage.appendChild( iframe );

        function close() {
            try { iframe.src = ''; } catch ( e ) {} // stop playback
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
        document.addEventListener( 'keydown', onKey, true );

        overlay.appendChild( stage );
        void stage.offsetWidth;
        stage.classList.add( 'is-in' );
    }

    // -----------------------------------------------------------------
    // Radio-stream widget — modeled on the tc-timeline radio player.
    // One stream at a time; calling `stream:` again replaces the
    // current station. HLS (.m3u8) URLs lazy-load HLS.js from a CDN
    // the first time they're needed (only Chrome/Edge need it — Safari
    // plays HLS natively). Direct mp3/aac/icecast URLs go straight to
    // a plain <audio> element. The widget sits in the bottom-right
    // corner of the drawer overlay with play/pause, volume, close.
    var activeStream = null;
    var hlsLoading   = false;

    function playStream( spec ) {
        if ( ! overlay || ! spec || ! spec.url ) return;
        var url = String( spec.url ).trim();
        if ( ! /^https?:\/\//.test( url ) ) return; // ignore TODO placeholders
        var label = spec.label || 'Radio';

        stopStream(); // hard-cut any existing stream

        var widget = document.createElement( 'div' );
        widget.className = 'tc-drawer-stream';

        var labelEl = document.createElement( 'span' );
        labelEl.className = 'tc-stream__label';
        labelEl.textContent = label;
        widget.appendChild( labelEl );

        var playBtn = document.createElement( 'button' );
        playBtn.type = 'button';
        playBtn.className = 'tc-stream__btn tc-stream__playpause';
        playBtn.setAttribute( 'aria-label', 'pause' );
        playBtn.textContent = '⏸';
        widget.appendChild( playBtn );

        var vol = document.createElement( 'input' );
        vol.type = 'range';
        vol.className = 'tc-stream__vol';
        vol.min = '0'; vol.max = '1'; vol.step = '0.05';
        vol.value = '0.25';
        widget.appendChild( vol );

        var closeBtn = document.createElement( 'button' );
        closeBtn.type = 'button';
        closeBtn.className = 'tc-stream__btn tc-stream__close';
        closeBtn.setAttribute( 'aria-label', 'close' );
        closeBtn.textContent = '✕';
        widget.appendChild( closeBtn );

        var audio = document.createElement( 'audio' );
        audio.preload = 'auto';
        audio.volume  = parseFloat( vol.value );
        widget.appendChild( audio );

        playBtn.addEventListener( 'click', function () {
            if ( audio.paused ) {
                audio.play().catch( function () {} );
                playBtn.textContent = '⏸';
                playBtn.setAttribute( 'aria-label', 'pause' );
            } else {
                audio.pause();
                playBtn.textContent = '▶';
                playBtn.setAttribute( 'aria-label', 'play' );
            }
        } );
        vol.addEventListener( 'input', function () {
            audio.volume = parseFloat( vol.value );
        } );
        closeBtn.addEventListener( 'click', stopStream );

        overlay.appendChild( widget );
        activeStream = { widget: widget, audio: audio, hls: null };

        var isHLS = /\.m3u8(\?|#|$)/i.test( url );

        function attachSrc() {
            if ( isHLS && typeof window.Hls !== 'undefined' && window.Hls.isSupported && window.Hls.isSupported() ) {
                var hls = new window.Hls();
                hls.loadSource( url );
                hls.attachMedia( audio );
                if ( activeStream ) activeStream.hls = hls;
            } else {
                // Either non-HLS (direct mp3) or Safari (native HLS).
                audio.src = url;
            }
            var p = audio.play();
            if ( p && p.catch ) p.catch( function () { /* autoplay blocked — play button still works */ } );
        }

        if ( isHLS && typeof window.Hls === 'undefined' ) {
            if ( ! hlsLoading ) {
                hlsLoading = true;
                var s = document.createElement( 'script' );
                // hls.js — self-hosted from the theme (PERF-1).
                s.src = ( window.tcSecretDrawer && window.tcSecretDrawer.vendor && window.tcSecretDrawer.vendor.hls ) || '';
                s.onload  = function () { hlsLoading = false; attachSrc(); };
                s.onerror = function () { hlsLoading = false; };
                document.head.appendChild( s );
            } else {
                // Already loading; wait it out
                var poll = setInterval( function () {
                    if ( ! hlsLoading ) { clearInterval( poll ); attachSrc(); }
                }, 200 );
                setTimeout( function () { clearInterval( poll ); }, 6000 );
            }
        } else {
            attachSrc();
        }
    }

    function stopStream() {
        if ( ! activeStream ) return;
        try {
            activeStream.audio.pause();
            activeStream.audio.src = '';
            if ( activeStream.hls ) activeStream.hls.destroy();
        } catch ( e ) {}
        if ( activeStream.widget && activeStream.widget.parentNode ) {
            activeStream.widget.remove();
        }
        activeStream = null;
    }

    // -----------------------------------------------------------------
    // Choice modal — the Golden-Egg EAT/SELL fork and any future
    // branching decision. A prompt + N buttons; clicking one runs
    // that option's sub-action list and closes. Same paper aesthetic
    // as the clue card / passcode pad.
    function showChoice( spec ) {
        if ( ! overlay || ! spec || ! spec.options || ! spec.options.length ) return;

        var card = document.createElement( 'div' );
        card.className = 'tc-choice';
        card.setAttribute( 'role', 'dialog' );
        card.setAttribute( 'aria-modal', 'true' );

        var paper = document.createElement( 'div' );
        paper.className = 'tc-choice__paper';

        if ( spec.prompt ) {
            var p = document.createElement( 'div' );
            p.className = 'tc-choice__prompt';
            String( spec.prompt ).split( '\n' ).forEach( function ( line ) {
                var l = document.createElement( 'p' );
                l.textContent = line;
                p.appendChild( l );
            } );
            paper.appendChild( p );
        }

        var btnRow = document.createElement( 'div' );
        btnRow.className = 'tc-choice__btns';
        spec.options.forEach( function ( opt ) {
            var b = document.createElement( 'button' );
            b.type = 'button';
            b.className = 'tc-choice__btn';
            b.textContent = opt.label || '?';
            b.addEventListener( 'click', function () {
                close();
                // The button's `do` list runs async (after user click)
                // so it lives outside the original fire()'s save/render
                // pass. Persist + repaint + re-sweep autos here so the
                // state change actually shows on screen.
                runActions( opt.do || [] );
                save();
                render();
                sweepAutoInteractions();
            } );
            btnRow.appendChild( b );
        } );
        paper.appendChild( btnRow );

        card.appendChild( paper );

        function close() {
            card.classList.remove( 'is-in' );
            document.removeEventListener( 'keydown', onKey, true );
            setTimeout( function () { if ( card.parentNode ) card.remove(); }, 240 );
        }
        function onKey( e ) {
            if ( e.key === 'Escape' || e.key === 'Esc' ) {
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

    // -----------------------------------------------------------------
    // Bubbles — pearlescent divs that rise from the bottom of the
    // drawer stage and drift out the top. Each gets a random size,
    // start x, sway amount, duration, and delay so the cloud feels
    // organic. Pure CSS animation on transform + opacity (GPU-only),
    // pointer-events none, self-cleans on the longest lifetime.
    function playBubbles( opts ) {
        if ( ! overlay ) return;
        var stage = overlay.querySelector( '.tc-secret-drawer__stage' );
        if ( ! stage ) return;
        var count = ( opts && typeof opts === 'object' && opts.count ) || 18;

        var container = document.createElement( 'div' );
        container.className = 'tc-bubbles';
        container.setAttribute( 'aria-hidden', 'true' );

        var stageRect = stage.getBoundingClientRect();
        var travel    = stageRect.height + 60;    // travel out the top
        var maxDelay  = 0;
        var maxDur    = 0;

        for ( var i = 0; i < count; i++ ) {
            var b      = document.createElement( 'div' );
            b.className = 'tc-bubble';
            var size   = 10 + Math.random() * 26;
            var leftPc = Math.random() * 100;
            var dur    = 3 + Math.random() * 3.5;
            var delay  = Math.random() * 1.2;
            var sway   = -40 + Math.random() * 80;
            b.style.width  = size + 'px';
            b.style.height = size + 'px';
            b.style.left   = leftPc + '%';
            b.style.setProperty( '--travel', travel + 'px' );
            b.style.setProperty( '--sway',   sway   + 'px' );
            b.style.animationDuration = dur   + 's';
            b.style.animationDelay    = delay + 's';
            if ( dur   > maxDur   ) maxDur   = dur;
            if ( delay > maxDelay ) maxDelay = delay;
            container.appendChild( b );
        }

        stage.appendChild( container );

        setTimeout( function () {
            if ( container.parentNode ) container.remove();
        }, ( maxDur + maxDelay ) * 1000 + 400 );
    }

    // -----------------------------------------------------------------
    // Crash — full-viewport "object falls from above and cracks the
    // screen" gag. The duck-giant's hero moment lives here. Mounts a
    // position-fixed overlay ABOVE the whole browser (z-index 99999),
    // drops the named object with a bouncy fall, overlays an SVG of
    // radiating cracks, holds, then fades everything out. Total
    // lifetime ~5.4s. Pointer-events: none on the overlay so the
    // gag doesn't block anything underneath when it fades.
    function doCrash( spec ) {
        var id = ( typeof spec === 'string' ) ? spec : ( spec && spec.id );
        if ( ! id ) return;
        var def = P.objects && P.objects[ id ];
        if ( ! def || ! def.mediaUrl ) return;

        var holder = document.createElement( 'div' );
        holder.className = 'tc-crash';
        holder.setAttribute( 'aria-hidden', 'true' );

        var falling = document.createElement( 'img' );
        falling.className = 'tc-crash__obj';
        falling.src = def.mediaUrl;
        falling.alt = def.name || '';
        falling.draggable = false;
        holder.appendChild( falling );

        var cracks = document.createElement( 'div' );
        cracks.className = 'tc-crash__cracks';
        // Twelve primary cracks radiating from centre + a handful of
        // branching forks for organic randomness. Drawn in viewBox %
        // so the SVG fills any viewport without distortion math.
        cracks.innerHTML =
            '<svg viewBox="0 0 100 100" preserveAspectRatio="none">' +
              '<g stroke="rgba(255,255,255,0.95)" stroke-width="0.28" fill="none" stroke-linecap="round">' +
                '<path d="M50,50 L18,8 L12,2"/>' +
                '<path d="M50,50 L82,12 L88,4"/>' +
                '<path d="M50,50 L6,38 L0,34"/>' +
                '<path d="M50,50 L92,55 L98,58"/>' +
                '<path d="M50,50 L22,92 L18,98"/>' +
                '<path d="M50,50 L74,88 L78,96"/>' +
                '<path d="M50,50 L8,72 L2,76"/>' +
                '<path d="M50,50 L88,28 L94,22"/>' +
                '<path d="M50,50 L48,2"/>' +
                '<path d="M50,50 L52,98"/>' +
                '<path d="M50,50 L2,52"/>' +
                '<path d="M50,50 L98,48"/>' +
                '<path d="M28,18 L20,12 M28,18 L32,8"/>' +
                '<path d="M72,18 L78,12 M72,18 L70,8"/>' +
                '<path d="M16,40 L8,38"/>' +
                '<path d="M84,55 L92,52"/>' +
                '<path d="M26,82 L22,90"/>' +
                '<path d="M76,82 L82,90"/>' +
              '</g>' +
              '<circle cx="50" cy="50" r="2.6" fill="rgba(255,255,255,0.95)"/>' +
              '<circle cx="50" cy="50" r="5.2" fill="rgba(255,255,255,0.35)"/>' +
            '</svg>';
        holder.appendChild( cracks );

        document.body.appendChild( holder );

        // Lifetime is governed by the CSS animation durations
        // (tc-crash-bg, tc-crash-fall, tc-crash-cracks all 5.4s).
        // Add a small buffer before tearing down.
        setTimeout( function () {
            if ( holder.parentNode ) holder.remove();
        }, 5600 );
    }

    // -----------------------------------------------------------------
    // Pac-Man modal (chain 16 — the mini arcade). Mounts a canvas
    // inside the overlay and hands it to desk-games.js's startPacman
    // via window.TCDeskGames.pacman. Reuses the existing game loop
    // wholesale; this just wraps it in our modal aesthetic.
    function playPacman() {
        if ( ! overlay ) return;
        var starter = window.TCDeskGames && window.TCDeskGames.pacman;
        if ( typeof starter !== 'function' ) {
            // desk-games.js loads site-wide, but be defensive — if for
            // any reason it's missing, point the player at the desk arcade.
            showClue( "The arcade is sleeping.\n\n(Click the toad on the desk-menu\nto wake the full Pac-Man.)" );
            return;
        }

        var card = document.createElement( 'div' );
        card.className = 'tc-pacman';
        card.setAttribute( 'role', 'dialog' );
        card.setAttribute( 'aria-modal', 'true' );

        var stage = document.createElement( 'div' );
        stage.className = 'tc-pacman__stage';

        var hud = document.createElement( 'div' );
        hud.className = 'tc-pacman__hud';
        hud.innerHTML =
            '<span class="tc-pacman__title">PAC-MAN</span>' +
            '<span class="tc-pacman__score">score <b>0</b></span>' +
            '<button type="button" class="tc-pacman__close" aria-label="close">✕</button>';
        stage.appendChild( hud );

        var canvas = document.createElement( 'canvas' );
        canvas.className = 'tc-pacman__canvas';
        canvas.tabIndex = 0;
        stage.appendChild( canvas );

        var controls = document.createElement( 'div' );
        controls.className = 'tc-pacman__controls';
        controls.innerHTML = '← ↑ ↓ → — eat the dots';
        stage.appendChild( controls );

        var gameover = document.createElement( 'div' );
        gameover.className = 'tc-pacman__gameover';
        gameover.hidden = true;
        stage.appendChild( gameover );

        // Tiny attribution line at the bottom of the modal — Pixabay and
        // freesound.org both require credit when their assets ship in a
        // public project. Keeps the licenses honest without taking over
        // the screen.
        var credits = document.createElement( 'div' );
        credits.className = 'tc-pacman__credits';
        credits.innerHTML =
            'music: <a href="https://pixabay.com/users/lucadialessandro-25927643/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=music&amp;utm_content=288597" target="_blank" rel="noopener">Luca Di Alessandro</a> &middot; ' +
            '<a href="https://freesound.org/" target="_blank" rel="noopener">freesound.org</a> &middot; ' +
            '<a href="https://pixabay.com/" target="_blank" rel="noopener">Pixabay</a>';
        stage.appendChild( credits );

        card.appendChild( stage );

        var scoreEl = hud.querySelector( '.tc-pacman__score b' );
        var closeBtn = hud.querySelector( '.tc-pacman__close' );
        var stopFn = null;

        // Audio: a short startup ding (Luca Di Alessandro arcade SFX)
        // followed by the gameplay loop (freesound community). Both are
        // theme-bundled at /assets/audio/. Volume kept low — the game is
        // about visuals, not blasting music.
        var audioCfg = window.tcSecretDrawer && window.tcSecretDrawer.assets;
        var startupAudio = null;
        var loopAudio    = null;
        if ( audioCfg && audioCfg.pacmanStartup ) {
            startupAudio = new Audio( audioCfg.pacmanStartup );
            startupAudio.volume = 0.5;
        }
        if ( audioCfg && audioCfg.pacmanLoop ) {
            loopAudio = new Audio( audioCfg.pacmanLoop );
            loopAudio.loop = true;
            loopAudio.volume = 0.3;
        }

        function stopAudio() {
            [ startupAudio, loopAudio ].forEach( function ( a ) {
                if ( ! a ) return;
                try { a.pause(); a.src = ''; } catch ( e ) {}
            } );
            startupAudio = null;
            loopAudio    = null;
        }

        function teardown() {
            if ( stopFn ) { try { stopFn(); } catch ( e ) {} stopFn = null; }
            stopAudio();
            card.classList.remove( 'is-in' );
            document.removeEventListener( 'keydown', onKey, true );
            setTimeout( function () { if ( card.parentNode ) card.remove(); }, 240 );
        }
        function onKey( e ) {
            // Esc closes the modal; everything else goes to the game.
            if ( e.key === 'Escape' || e.key === 'Esc' ) {
                e.stopImmediatePropagation();
                teardown();
            }
        }
        closeBtn.addEventListener( 'click', teardown );
        document.addEventListener( 'keydown', onKey, true );

        overlay.appendChild( card );
        void card.offsetWidth;
        card.classList.add( 'is-in' );

        stopFn = starter( canvas, {
            onScore: function ( n ) { scoreEl.textContent = String( n ); },
            onGameOver: function ( score, msg ) {
                gameover.innerHTML =
                    '<div class="tc-pacman__msg">' + ( msg ? String( msg ) : 'game over' ) + '</div>' +
                    '<div class="tc-pacman__final">final score: <b>' + score + '</b></div>' +
                    '<div class="tc-pacman__btns">' +
                        '<button type="button" class="tc-pacman__btn tc-pacman__again">play again</button>' +
                        '<button type="button" class="tc-pacman__btn tc-pacman__quit">close</button>' +
                    '</div>';
                gameover.hidden = false;
                gameover.querySelector( '.tc-pacman__again' ).addEventListener( 'click', function () {
                    teardown();
                    setTimeout( playPacman, 220 );
                } );
                gameover.querySelector( '.tc-pacman__quit' ).addEventListener( 'click', teardown );
            }
        } );

        // Focus the canvas so the game's document-level key handler
        // doesn't fight with any other focused control.
        try { canvas.focus(); } catch ( e ) {}

        // Kick off audio: startup ding, then handoff to the looping
        // bg music when the ding ends. play() returns a Promise that
        // rejects on autoplay-policy block — Chrome may refuse without
        // a user gesture. The arcade click that opened the modal IS a
        // user gesture so it usually passes, but we swallow failures
        // so a silent game isn't an error.
        if ( startupAudio ) {
            startupAudio.addEventListener( 'ended', function () {
                if ( loopAudio ) {
                    var lp = loopAudio.play();
                    if ( lp && lp.catch ) lp.catch( function () {} );
                }
            }, { once: true } );
            var sp = startupAudio.play();
            if ( sp && sp.catch ) sp.catch( function () {
                // Skip the ding, jump straight to the loop
                if ( loopAudio ) {
                    var lp = loopAudio.play();
                    if ( lp && lp.catch ) lp.catch( function () {} );
                }
            } );
        } else if ( loopAudio ) {
            var lp = loopAudio.play();
            if ( lp && lp.catch ) lp.catch( function () {} );
        }
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

    // Player-side position overrides. When a player nudges an object
    // out of the way and the drop doesn't match any interaction, the
    // new x/y is stashed in W.userPositions (per-puzzle-version). On
    // every boot we splice those back into P so the arrangement
    // survives a reload. Distinct from the author layout cache,
    // which is editor state and lives at a different LS key.
    function applyUserPositions() {
        if ( ! W || ! W.userPositions || ! P.objects ) return;
        var up = W.userPositions;
        for ( var id in up ) {
            if ( ! up.hasOwnProperty( id ) ) continue;
            var dst = P.objects[ id ];
            if ( ! dst ) continue;
            if ( typeof up[ id ].x === 'number' ) dst.x = up[ id ].x;
            if ( typeof up[ id ].y === 'number' ) dst.y = up[ id ].y;
        }
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
