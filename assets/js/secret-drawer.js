/*!
 * secret-drawer.js — "The Secret Drawer" loose-handle easter egg.
 *
 * Phase 1 of the nested-drawer build (see V0.15 handoff / CLAUDE.md).
 * The footer drawer's brass pull is secretly loose. The interaction:
 *
 *   hover the pull  -> a bubble appears: "the handle is loose"
 *   click the pull  -> a choice popover: [ try tightening it ] [ never mind ]
 *   try tightening  -> the pull spins tight with a satisfying settle,
 *                      then the junk-drawer overlay slides open
 *   never mind      -> popover closes, the handle stays loose
 *
 * Once tightened, the state persists in localStorage: on return visits
 * the handle is already tight and a click opens the drawer directly
 * (the bubble becomes "open the junk drawer").
 *
 * --- Pay-zero policy --------------------------------------------------
 * This script is small and loads site-wide (the handle must be live on
 * every page). The junk-drawer BACKGROUND image is NOT — it is lazy-set
 * from window.tcSecretDrawer.assets on first hover/focus of the handle,
 * so visitors who never go near the pull download nothing extra. The
 * Phase 2 interaction engine will likewise be lazy-loaded on first open.
 *
 * --- Phase 2 hook ----------------------------------------------------
 * window.TCSecretDrawer exposes { open, close, isOpen, objectsLayer }.
 * The Phase 2 engine mounts puzzle objects into objectsLayer and can
 * drive open/close itself.
 */
( function () {
    'use strict';

    var LS_KEY = 'tc_handle_tightened';
    var prefersReduced = !! ( window.matchMedia &&
        window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches );
    var FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    document.addEventListener( 'DOMContentLoaded', function () {
        var handle  = document.querySelector( '[data-tc-loose-handle]' );
        var overlay = document.querySelector( '[data-tc-secret-drawer]' );
        if ( ! handle || ! overlay ) return;
        window.TCSecretDrawer = new SecretDrawer( handle, overlay );
    } );

    // --------------------------------------------------------------------
    function SecretDrawer( handle, overlay ) {
        this.handle      = handle;
        this.overlay     = overlay;
        this.lip         = handle.closest( '.tc-drawer__lip' ) || handle.parentNode;
        this.bubble      = handle.querySelector( '[data-tc-handle-bubble]' );
        this.choice      = document.querySelector( '[data-tc-handle-choice]' );
        this.bgImg       = overlay.querySelector( '[data-tc-secret-bg]' );
        this.objectsLayer = overlay.querySelector( '[data-tc-secret-objects]' );

        this.choiceOpen   = false;
        this.isOpen       = false;
        this.bgRequested  = false;
        this.lastFocus    = null;
        this.engineBooted = false;
        this.engineLoading = false;

        this.tightened = false;
        try { this.tightened = localStorage.getItem( LS_KEY ) === '1'; } catch ( e ) {}

        this.syncHint();
        this.bind();
    }

    // Hint text + aria-label reflect whether the handle is still loose.
    SecretDrawer.prototype.syncHint = function () {
        var loose = ! this.tightened;
        if ( this.bubble ) {
            this.bubble.textContent = loose ? 'the handle is loose' : 'open the junk drawer';
        }
        this.handle.setAttribute( 'aria-label',
            loose ? 'The drawer handle — it feels loose' : 'Open the junk drawer' );
    };

    // Resolve + assign the junk-drawer background once. Called on first
    // hover so the image is decoded and ready by the time it's opened.
    SecretDrawer.prototype.preloadBg = function () {
        if ( this.bgRequested || ! this.bgImg ) return;
        var assets = ( window.tcSecretDrawer && window.tcSecretDrawer.assets ) || {};
        var url = assets.junkClean;
        if ( ! url ) return;
        this.bgRequested = true;
        this.bgImg.src = url;
    };

    SecretDrawer.prototype.bind = function () {
        var self = this;

        // Preload the artwork the moment the visitor shows interest.
        this.handle.addEventListener( 'mouseenter', function () { self.preloadBg(); } );
        this.handle.addEventListener( 'focus',      function () { self.preloadBg(); } );

        // Click the pull: open directly if tight, else show the choice.
        this.handle.addEventListener( 'click', function ( e ) {
            e.preventDefault();
            if ( self.tightened ) { self.open(); return; }
            self.toggleChoice();
        } );

        if ( this.choice ) {
            var tightenBtn = this.choice.querySelector( '[data-tc-handle-tighten]' );
            var nvmBtn     = this.choice.querySelector( '[data-tc-handle-nevermind]' );
            if ( tightenBtn ) tightenBtn.addEventListener( 'click', function () { self.tighten(); } );
            if ( nvmBtn )     nvmBtn.addEventListener( 'click', function () { self.closeChoice( true ); } );
        }

        // Click-away dismisses the choice popover.
        document.addEventListener( 'click', function ( e ) {
            if ( ! self.choiceOpen ) return;
            if ( self.handle.contains( e.target ) ) return;
            if ( self.choice && self.choice.contains( e.target ) ) return;
            self.closeChoice( false );
        } );

        // Overlay close affordances: the scrim, and the × button.
        Array.prototype.forEach.call(
            this.overlay.querySelectorAll( '[data-tc-secret-close]' ),
            function ( el ) { el.addEventListener( 'click', function () { self.close(); } ); }
        );

        // Global keys: Escape closes popover/overlay; Tab is trapped while open.
        document.addEventListener( 'keydown', function ( e ) {
            if ( e.key === 'Escape' || e.key === 'Esc' ) {
                if ( self.isOpen )      { self.close(); return; }
                if ( self.choiceOpen )  { self.closeChoice( true ); return; }
            }
            if ( ( e.key === 'Tab' ) && self.isOpen ) self.trapFocus( e );
        } );
    };

    // ---- the choice popover -------------------------------------------
    SecretDrawer.prototype.toggleChoice = function () {
        if ( this.choiceOpen ) { this.closeChoice( true ); return; }
        if ( ! this.choice ) { this.tighten(); return; }
        this.choiceOpen = true;
        this.choice.hidden = false;
        this.lip.classList.add( 'is-choosing' );
        this.handle.setAttribute( 'aria-expanded', 'true' );
        var first = this.choice.querySelector( 'button' );
        if ( first ) first.focus();
    };

    SecretDrawer.prototype.closeChoice = function ( returnFocus ) {
        if ( ! this.choiceOpen ) return;
        this.choiceOpen = false;
        if ( this.choice ) this.choice.hidden = true;
        this.lip.classList.remove( 'is-choosing' );
        this.handle.setAttribute( 'aria-expanded', 'false' );
        if ( returnFocus ) this.handle.focus();
    };

    // ---- tighten: spin the pull, then open ----------------------------
    SecretDrawer.prototype.tighten = function () {
        var self = this;
        this.closeChoice( false );

        var finish = function () {
            self.handle.classList.remove( 'is-tightening' );
            self.tightened = true;
            try { localStorage.setItem( LS_KEY, '1' ); } catch ( e ) {}
            self.syncHint();
            self.open();
        };

        if ( prefersReduced ) { finish(); return; }

        this.handle.classList.add( 'is-tightening' );
        var done = false;
        var run = function () { if ( ! done ) { done = true; finish(); } };
        this.handle.addEventListener( 'animationend', run, { once: true } );
        // Fallback in case animationend never fires (animation ~900ms).
        setTimeout( run, 1100 );
    };

    // ---- open / close the junk-drawer overlay -------------------------
    SecretDrawer.prototype.open = function () {
        if ( this.isOpen ) return;
        this.preloadBg();
        this.isOpen = true;
        this.lastFocus = document.activeElement;

        this.overlay.hidden = false;
        // Force a reflow so the .is-open transition actually animates
        // from the hidden state rather than snapping.
        void this.overlay.offsetWidth;
        this.overlay.classList.add( 'is-open' );
        document.documentElement.classList.add( 'tc-secret-lock' );

        this.ensureEngine();

        var closeBtn = this.overlay.querySelector( '[data-tc-secret-close]' );
        if ( closeBtn ) closeBtn.focus();
    };

    // Lazy-load the Phase 2 interaction engine the first time the
    // drawer opens, then boot it onto the objects layer. Visitors who
    // never tighten the handle never download drawer-engine.js.
    SecretDrawer.prototype.ensureEngine = function () {
        var self = this;
        var bootIt = function () {
            if ( window.TCDrawerEngine && window.TCDrawerEngine.boot ) {
                window.TCDrawerEngine.boot( self.objectsLayer );
                self.engineBooted = true;
            }
        };
        if ( this.engineBooted || ! this.objectsLayer ) return;
        if ( window.TCDrawerEngine && window.TCDrawerEngine.boot ) { bootIt(); return; }
        if ( this.engineLoading ) return;

        var url = window.tcSecretDrawer && window.tcSecretDrawer.engineUrl;
        if ( ! url ) return;
        this.engineLoading = true;

        var s = document.createElement( 'script' );
        s.src = url;
        s.async = true;
        s.onload = function () { self.engineLoading = false; bootIt(); };
        s.onerror = function () {
            self.engineLoading = false;
            console.warn( 'Drawer engine failed to load.' );
        };
        document.head.appendChild( s );
    };

    SecretDrawer.prototype.close = function () {
        if ( ! this.isOpen ) return;
        this.isOpen = false;
        this.overlay.classList.remove( 'is-open' );
        document.documentElement.classList.remove( 'tc-secret-lock' );

        var overlay = this.overlay;
        var hide = function () { overlay.hidden = true; };
        if ( prefersReduced ) {
            hide();
        } else {
            // Wait for the STAGE's transition specifically — the scrim
            // also transitions, so a plain once-listener could be spent
            // on the scrim's event before the stage finishes.
            var done = false;
            var stage = overlay.querySelector( '.tc-secret-drawer__stage' );
            var run = function () { if ( ! done ) { done = true; hide(); } };
            var onEnd = function ( e ) {
                if ( e.target !== stage ) return;
                overlay.removeEventListener( 'transitionend', onEnd );
                run();
            };
            overlay.addEventListener( 'transitionend', onEnd );
            setTimeout( run, 700 );
        }

        if ( this.lastFocus && this.lastFocus.focus ) this.lastFocus.focus();
        else this.handle.focus();
    };

    // Simple focus trap — keeps Tab within the overlay while it's open.
    SecretDrawer.prototype.trapFocus = function ( e ) {
        var els = Array.prototype.filter.call(
            this.overlay.querySelectorAll( FOCUSABLE ),
            function ( el ) { return el.offsetParent !== null; }
        );
        if ( ! els.length ) { e.preventDefault(); return; }
        var first = els[ 0 ], last = els[ els.length - 1 ];
        if ( e.shiftKey && document.activeElement === first ) {
            e.preventDefault(); last.focus();
        } else if ( ! e.shiftKey && document.activeElement === last ) {
            e.preventDefault(); first.focus();
        }
    };

} )();
