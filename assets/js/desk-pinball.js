/*!
 * desk-pinball.js — the marble's escalation.
 *
 * Lazy-loaded by desk-drawer.js the first time the visitor clicks the
 * footer's marble. By the time boot() runs, global `Matter` is on the
 * page (loaded ahead of us by desk-drawer.js).
 *
 * Layout: the canvas overlays the drawer's interior. The drawer's
 * compartments dim (.is-pinball on the <footer>) but stay visible
 * behind as ghosts of where the bumpers/ramps "belong" — the directory
 * is literally what you're playing on.
 *
 *   ┌────────────────────────────────────────────┐
 *   │  [T] [C] [V]        drop-target row        │  <- top of table
 *   │                                            │
 *   │   ▲ family  ▲ hcs  ▲ site  ▲ elsewhere     │  <- ramps
 *   │                                            │
 *   │    ● mug  ● spider  ● 67  ● duck  ● mar    │  <- desk-object bumpers
 *   │                                            │
 *   │   ◢ slingshot              slingshot ◣      │
 *   │                                            │
 *   │    \  flippers  /              plunger ↕    │
 *   └────────────────────────────────────────────┘
 *
 * Score & HUD: bottom-left score, top-right ball #, multiplier under
 * the score. CRT-phosphor green to match the existing toad arcade
 * (desk-games.js).
 *
 * Controls:
 *   A           — left flipper
 *   L (or D)    — right flipper
 *   Space       — plunger (hold to charge, release to launch)
 *   Esc         — exit back to the drawer
 *   Touch       — tap left/right half = flippers; drag plunger lane up
 *
 * Scoring (with multiplier `m`, starts at 1):
 *   bumper hit   = 100 * m
 *   slingshot    = 50  * m
 *   ramp         = 500 * m  (HCS ramp = 1000 * m + tilt-banner)
 *   drop target  = 250 * m  (all 3 cleared → m = 5 for 10s)
 *
 * Leaderboard: submits to /wp-json/tc-games/v1/scores with game="pinball"
 * if the run cracks the existing top 10.
 */
( function () {
    'use strict';

    // Bail if Matter didn't load — desk-drawer.js handles user-facing
    // error reporting. This file going inert is fine.
    if ( typeof Matter === 'undefined' ) {
        console.warn( '[desk-pinball] Matter not present; not booting.' );
        return;
    }

    var Engine     = Matter.Engine;
    var World      = Matter.World;
    var Bodies     = Matter.Bodies;
    var Body       = Matter.Body;
    var Constraint = Matter.Constraint;
    var Composite  = Matter.Composite;
    var Events     = Matter.Events;
    var Vector     = Matter.Vector;

    // Table dimensions — pinball is portrait-ish, but the drawer is
    // landscape, so we compromise on a 760×460 logical playfield. CSS
    // scales it to fit the drawer width.
    var TABLE_W = 760;
    var TABLE_H = 460;

    // Ball is small relative to playfield so it doesn't tunnel.
    var BALL_R = 10;

    // Multiball cap — the all-gold jackpot drops one extra ball.
    var MAX_BALLS = 2;

    // Color palette — warm wood/brass on the table, CRT phosphor for HUD.
    var COLORS = {
        bg:            '#0a0814',
        wall:          '#3a2616',
        wallShine:     '#6a4626',
        flipper:       '#d4a953',
        flipperShine:  '#f5d896',
        bumper:        '#22d3ee',
        bumperBright:  '#67e8f9',
        slingshot:     '#67e8f9',
        ramp:          '#9a5cff',
        rampHcs:       '#ff5a8c',
        dropTarget:    '#e7c98f',
        dropTargetOff: '#3a2616',
        ball:          '#3fc7da',
        ballShine:     '#e6fbff',
        ballRim:       '#0e4a55',
        hud:           '#00ff66',
        hudDim:        '#057a2f',
    };

    // Is the Pixi WebGL renderer actually usable right now? True only when
    // the global loaded (it's lazy + non-fatal) and WebGL is supported.
    function pixiUsable() {
        return !! ( window.PIXI && PIXI.Application &&
            ( ! PIXI.utils || typeof PIXI.utils.isWebGLSupported !== 'function' ||
              PIXI.utils.isWebGLSupported() ) );
    }

    // Resolve ANY CSS colour string (hex, hsl(), rgb(), name) to a 0xRRGGBB
    // number for Pixi. Uses the browser's own canvas colour parser so the
    // hsl() bumper-hue ramp and '#rrggbb' constants both Just Work.
    var _colCanvas, _colCtx;
    function colorToNum( css ) {
        if ( typeof css === 'number' ) return css;
        if ( ! _colCtx ) {
            _colCanvas = document.createElement( 'canvas' );
            _colCanvas.width = _colCanvas.height = 1;
            _colCtx = _colCanvas.getContext( '2d' );
        }
        _colCtx.fillStyle = '#000';
        _colCtx.fillStyle = css;           // browser normalises the colour
        var s = _colCtx.fillStyle;         // '#rrggbb' (opaque) or 'rgba(...)'
        if ( s.charAt( 0 ) === '#' ) return parseInt( s.slice( 1 ), 16 );
        var m = s.match( /\d+/g );
        return m ? ( ( +m[ 0 ] << 16 ) | ( +m[ 1 ] << 8 ) | +m[ 2 ] ) : 0xffffff;
    }

    // An rgba() string from any CSS colour + alpha (for soft nebula fills).
    function hexA( css, a ) {
        var n = colorToNum( css );
        return 'rgba(' + ( ( n >> 16 ) & 255 ) + ',' + ( ( n >> 8 ) & 255 ) +
               ',' + ( n & 255 ) + ',' + a + ')';
    }

    // Impact intensity from a flash timer: 1 at the moment of contact,
    // decaying linearly to 0 over `ms`. Drives the electric glow pulse.
    function impactAmt( flashUntil, now, ms ) {
        var t = flashUntil - now;
        return t > 0 ? Math.min( 1, t / ms ) : 0;
    }

    // Apply an animated glow to an element's stored GlowFilter. Detaches the
    // filter entirely when effectively off (glow is impact-triggered, so most
    // elements sit dark most of the time — no wasted filter pass per frame).
    function setGlow( obj, amt ) {
        if ( ! obj.tcGlow ) return;
        if ( amt > 0.05 ) {
            obj.tcGlow.outerStrength = amt;
            if ( ! obj.filters ) obj.filters = obj.tcGlowArr;
        } else if ( obj.filters ) {
            obj.filters = null;
        }
    }

    // ---- SPACEY THEME (Pixi/WebGL renderer only — the desk-menu arcade's
    // Canvas2D pinball keeps the original wood look).
    var SPACE = {
        wall0: '#2a3450', wall1: '#141a2c', wall2: '#0b0f1c', // metal rail body
        wallEdge: 'rgba(120,214,255,0.55)',                   // neon rail edge
        flipper: '#5fe6ff',                                   // neon flipper
        slingBody: 0x1a2238, slingEdge: 0x3a4a66,
    };
    // Glow: near-off at rest, spikes electric on contact, then decays.
    var GLOW_SPIKE = 4.5;

    // Background "sectors" — felt + nebula shift every 10,000 points.
    var FELT_TIERS = [
        { inner: '#241a52', outer: '#05030f', nebula: '#4a2a8c' }, // violet
        { inner: '#0e2b4e', outer: '#03070f', nebula: '#1f6fa6' }, // blue
        { inner: '#073a33', outer: '#02100c', nebula: '#129a6a' }, // teal
        { inner: '#451636', outer: '#10030c', nebula: '#b02a78' }, // magenta
        { inner: '#46300f', outer: '#120a03', nebula: '#c98520' }, // amber
        { inner: '#311046', outer: '#0c0312', nebula: '#8a2ad6' }, // deep purple
    ];
    var SECTOR_NAMES = [
        'Hyrule Field', 'Lake Hylia', 'Lost Woods',
        'Gerudo Sands', 'Death Mountain', 'The Dark World',
    ];

    // ---- SOUND — synthesized in-browser (WebAudio), so there are no audio
    // files to ship or fetch. One shared AudioContext, resumed on the first
    // user gesture (boot/keydown). All sounds are short blips with a quick
    // attack + exponential decay; tone() is a no-op if audio is unavailable.
    // A single `muted` flag (persisted) silences both SFX and music.
    var muted = false;
    try { muted = localStorage.getItem( 'tcPinballMuted' ) === '1'; } catch ( e ) {}
    function setMuted( m ) {
        muted = m;
        try { localStorage.setItem( 'tcPinballMuted', m ? '1' : '0' ); } catch ( e ) {}
    }
    var _actx = null;
    function audioCtx() {
        if ( _actx === null ) {
            try { _actx = new ( window.AudioContext || window.webkitAudioContext )(); }
            catch ( e ) { _actx = false; }
        }
        if ( _actx && _actx.state === 'suspended' ) { try { _actx.resume(); } catch ( e ) {} }
        return _actx || null;
    }
    function tone( freq, dur, type, gain, sweepTo ) {
        if ( muted ) return;
        var ctx = audioCtx(); if ( ! ctx ) return;
        var t = ctx.currentTime;
        var osc = ctx.createOscillator(), g = ctx.createGain();
        osc.type = type || 'square';
        osc.frequency.setValueAtTime( freq, t );
        if ( sweepTo ) osc.frequency.exponentialRampToValueAtTime( Math.max( 1, sweepTo ), t + dur );
        g.gain.setValueAtTime( 0.0001, t );
        g.gain.exponentialRampToValueAtTime( gain || 0.12, t + 0.005 );
        g.gain.exponentialRampToValueAtTime( 0.0001, t + dur );
        osc.connect( g ); g.connect( ctx.destination );
        osc.start( t ); osc.stop( t + dur + 0.02 );
    }
    var SFX = {
        bumper:  function ( hits ) { tone( 480 + ( hits || 0 ) * 16, 0.07, 'square', 0.11 ); },
        peg:     function () { tone( 900, 0.035, 'triangle', 0.07 ); },
        sling:   function () { tone( 320, 0.06, 'sawtooth', 0.10, 200 ); },
        ramp:    function () { tone( 440, 0.13, 'sine', 0.10, 900 ); },
        flip:    function () { tone( 150, 0.03, 'square', 0.05 ); },
        launch:  function () { tone( 200, 0.20, 'sawtooth', 0.10, 680 ); },
        drain:   function () { tone( 440, 0.45, 'sine', 0.12, 100 ); },
        gold:    function () { tone( 660, 0.10, 'square', 0.11 ); tone( 990, 0.13, 'square', 0.09 ); },
        tilt:    function () { tone( 120, 0.5, 'sawtooth', 0.16, 70 ); },
        jackpot: function () { [ 523, 659, 784, 1046 ].forEach( function ( f, i ) {
            setTimeout( function () { tone( f, 0.13, 'square', 0.12 ); }, i * 70 ); } ); },
        sector:  function () { [ 392, 523, 659 ].forEach( function ( f, i ) {
            setTimeout( function () { tone( f, 0.14, 'triangle', 0.10 ); }, i * 80 ); } ); },
    };

    // ---- MUSIC — a gentle generative "spacey" loop, also synthesized (no
    // files). A soft bass + arpeggio over a 4-chord minor progression, low
    // under the SFX. Steps on a setInterval; honours the same `muted` flag.
    function mtof( m ) { return 440 * Math.pow( 2, ( m - 69 ) / 12 ); }
    function musicTone( freq, dur, type, gain ) {
        if ( muted ) return;
        var ctx = audioCtx(); if ( ! ctx ) return;
        var t = ctx.currentTime;
        var osc = ctx.createOscillator(), g = ctx.createGain();
        osc.type = type || 'sine';
        osc.frequency.value = freq;
        g.gain.setValueAtTime( 0.0001, t );
        g.gain.exponentialRampToValueAtTime( gain || 0.05, t + 0.03 );
        g.gain.exponentialRampToValueAtTime( 0.0001, t + dur );
        osc.connect( g ); g.connect( ctx.destination );
        osc.start( t ); osc.stop( t + dur + 0.05 );
    }
    // Am – F – C – G (roots as MIDI), each with four chord tones to arpeggiate.
    var MUSIC_CHORDS = [
        { root: 45, tones: [ 45, 48, 52, 57 ] },
        { root: 41, tones: [ 41, 45, 48, 53 ] },
        { root: 48, tones: [ 48, 52, 55, 60 ] },
        { root: 43, tones: [ 43, 47, 50, 55 ] },
    ];
    var _musicTimer = null, _musicStep = 0;
    function startMusic() {
        if ( _musicTimer ) return;
        _musicStep = 0;
        _musicTimer = setInterval( function () {
            if ( muted ) return; // keep the clock running but stay silent
            var bar = Math.floor( _musicStep / 8 ) % MUSIC_CHORDS.length;
            var s = _musicStep % 8;
            var ch = MUSIC_CHORDS[ bar ];
            if ( s === 0 || s === 4 ) musicTone( mtof( ch.root - 12 ), 0.7, 'triangle', 0.06 );
            musicTone( mtof( ch.tones[ s % ch.tones.length ] + 12 ), 0.32, 'sine', 0.045 );
            if ( Math.random() < 0.12 ) musicTone( mtof( ch.tones[ 3 ] + 24 ), 0.5, 'sine', 0.03 );
            _musicStep++;
        }, 230 );
    }
    function stopMusic() { if ( _musicTimer ) { clearInterval( _musicTimer ); _musicTimer = null; } }

    // Escape user-supplied leaderboard names before injecting into HTML.
    function escapeHtml( s ) {
        return String( s ).replace( /[&<>"']/g, function ( c ) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ c ];
        } );
    }

    // ----------------------------------------------------------------
    // Public entry point. Boots a fresh game instance bound to the
    // given footer element. Multiple boots (Esc → reopen) are fine;
    // the previous instance is torn down before a new one is built.
    //
    // Blurs the marble button after booting — without this, the
    // marble keeps keyboard focus (CSS hides it but it's still
    // focused) and pressing Space activates it via the browser's
    // default button-activation behaviour, which calls boot() again
    // and gives the appearance that Space "exits the game".
    // boot( host, opts ) — `host` is the element the game is attached to
    // (the drawer <footer> when launched from the marble) or null/omitted
    // when launched standalone (the desk-menu arcade). `opts.renderer` is
    // 'canvas' (default, the OG Canvas2D look) or 'pixi' (the WebGL build).
    // Back-compat: boot( footer ) still works — the drawer calls it that way.
    var current = null;
    window.TCPinball = {
        boot: function ( host, opts ) {
            if ( current ) current.destroy();
            current = new Pinball( host || null, opts || {} );
            // The drawer launches from the marble button, which keeps
            // keyboard focus; blur it so Space doesn't re-trigger boot().
            // The arcade launch has no marble — guard for its absence.
            if ( host && typeof host.querySelector === 'function' ) {
                var marble = host.querySelector( '[data-tc-pinball-trigger]' );
                if ( marble && typeof marble.blur === 'function' ) {
                    marble.blur();
                }
            }
        }
    };

    // ----------------------------------------------------------------
    // Pinball — one game instance.
    function Pinball( host, opts ) {
        var self = this;
        // `footer` is the drawer host (or null for the arcade launch). Its
        // only roles are drawer-specific: dimming the compartments behind
        // the table and blurring the marble. The full-screen overlay is
        // appended to <body> regardless, so the game runs fine without it.
        this.footer = host || null;
        this.interior = this.footer
            ? this.footer.querySelector( '.tc-drawer__interior' )
            : null;
        // Renderer selection — 'canvas' is the OG Canvas2D path; 'pixi' is
        // the WebGL build (added in Phase 1b). Default keeps the arcade and
        // any legacy caller on the proven Canvas2D renderer.
        this.renderer = opts && opts.renderer === 'pixi' ? 'pixi' : 'canvas';

        // ---- overlay + canvas.
        // Full-screen: the overlay is position:fixed covering the
        // viewport. We append to <body> (not the drawer interior)
        // so no ancestor transform/filter can break the fixed
        // positioning. Body scroll is locked while the game runs.
        this.root = document.createElement( 'div' );
        this.root.className = 'tc-pinball';
        this.root.innerHTML =
            '<canvas class="tc-pinball__canvas" width="' + TABLE_W + '" height="' + TABLE_H + '" aria-label="Pinball table"></canvas>' +
            '<div class="tc-pinball__hud">' +
                '<span class="tc-pinball__score" data-pinball-score>0</span>' +
                '<span class="tc-pinball__ball">ball <span data-pinball-ball>1</span> / 3</span>' +
                '<span class="tc-pinball__mult" data-pinball-mult></span>' +
            '</div>' +
            '<div class="tc-pinball__banner" data-pinball-banner aria-live="polite"></div>' +
            '<button type="button" class="tc-pinball__exit" data-pinball-exit aria-label="Exit pinball">×</button>' +
            '<div class="tc-pinball__hint" data-pinball-hint>' +
                '<strong>controls</strong> · A / L flippers · Space plunger · Shift / B nudge · Esc exits' +
            '</div>';
        document.body.appendChild( this.root );
        this.prevBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        this.canvas = this.root.querySelector( 'canvas' );
        // Renderer init. Pixi is opt-in (the drawer marble requests it) and
        // honoured only when the lib actually loaded AND WebGL is available;
        // otherwise downgrade to the proven Canvas2D path (also what the
        // desk-menu arcade uses). The Pixi scene is built after the bodies
        // exist (buildPixiScene(), below).
        if ( this.renderer === 'pixi' && ! pixiUsable() ) {
            this.renderer = 'canvas';
        }
        if ( this.renderer === 'canvas' ) {
            this.ctx = this.canvas.getContext( '2d' );
        }
        this.scoreEl  = this.root.querySelector( '[data-pinball-score]' );
        this.ballEl   = this.root.querySelector( '[data-pinball-ball]' );
        this.multEl   = this.root.querySelector( '[data-pinball-mult]' );
        this.bannerEl = this.root.querySelector( '[data-pinball-banner]' );

        // ---- game state
        this.score = 0;
        this.ball = 1;
        this.maxBalls = 3;
        this.multiplier = 1;
        this.multUntil = 0;
        this.hcsThisBall = 0;
        this.bumperHits = {};
        this.totalBumperHits = 0;
        this.unlocked25k = false;
        this.unlocked50k = false;
        this.gameOver = false;
        this.plungerCharge = 0; // 0..1
        this.plungerActive = false;
        this.leftFlipperUp = false;
        this.rightFlipperUp = false;
        this.sparks = [];     // bumper-hit spark particles
        this.nudgeUntil = 0;  // nudge cooldown timestamp
        this.shake = null;    // { x, y, until } screen-shake offset
        this.stuckFrames = 0; // anti-stuck watchdog counter
        this.goldPosts = 0;   // how many of the 5 posts have hit gold
        this.overPanel = null;// game-over panel element while shown
        this.balls = [];      // active ball bodies (1 normally, up to MAX_BALLS)
        this.bgTier = -1;     // current background "sector" (score/10k), Pixi
        this.tiltMeter = 0;   // nudge-aggression accumulator
        this.tilted = false;  // true → flippers dead until the next ball
        this.gatesActive = false; // side-guards up (all pegs same on/off mode)

        // Prime the audio context within the boot click gesture so SFX are
        // allowed to play (autoplay policy), and start the background music.
        audioCtx();
        startMusic();
        this.buildMuteButton();

        // ---- engine
        this.engine = Engine.create();
        this.engine.world.gravity.y = 1.0;
        this.engine.positionIterations = 12;
        this.engine.velocityIterations = 10;
        this.engine.constraintIterations = 4;

        this.buildTable();
        this.buildFlippers();
        this.spawnBall();

        // Build the WebGL scene once the bodies exist. Any failure here
        // downgrades cleanly to Canvas2D so the game still runs.
        if ( this.renderer === 'pixi' ) {
            try {
                this.buildPixiScene();
            } catch ( e ) {
                console.warn( '[desk-pinball] Pixi init failed; using Canvas2D.', e );
                this.teardownPixi();
                // Pixi may have bound a WebGL context to the canvas, and a
                // canvas can't switch contexts — swap in a fresh one (it's
                // cloned before bindInput attaches the touch listeners).
                if ( ! this.canvas.getContext( '2d' ) && this.canvas.parentNode ) {
                    var fresh = this.canvas.cloneNode( false );
                    this.canvas.parentNode.replaceChild( fresh, this.canvas );
                    this.canvas = fresh;
                }
                this.renderer = 'canvas';
                this.ctx = this.canvas.getContext( '2d' );
            }
        }

        this.bindInput();
        this.bindCollisions();

        // mark the footer so CSS dims the compartments (drawer only)
        if ( this.footer ) this.footer.classList.add( 'is-pinball' );

        // Start the render loop.
        this.lastTs = performance.now();
        this.running = true;
        this.tick = this.tick.bind( this );
        requestAnimationFrame( this.tick );

        this.flashBanner( 'Push Space to launch · A / L flippers', 2400 );
    }

    // ================================================================
    // TABLE — walls, ramps, slingshots, bumpers, drop targets, plunger.
    Pinball.prototype.buildTable = function () {
        var w = this.engine.world;
        var wallOpts = { isStatic: true, restitution: 0.4, friction: 0.02, label: 'wall',
                         render: { fillStyle: COLORS.wall } };

        // Outer walls. The plunger lane sits on the right; we leave a
        // gap at the top-right for the ball to roll out of the lane
        // into the playfield (the "shooter lane").
        var t = 14; // wall thickness
        World.add( w, [
            // left wall
            Bodies.rectangle( t / 2, TABLE_H / 2, t, TABLE_H, wallOpts ),
            // right outer wall
            Bodies.rectangle( TABLE_W - t / 2, TABLE_H / 2, t, TABLE_H, wallOpts ),
            // top wall
            Bodies.rectangle( TABLE_W / 2, t / 2, TABLE_W, t, wallOpts ),
            // plunger chute inner wall (vertical, to the left of the lane)
            Bodies.rectangle( TABLE_W - 56, TABLE_H * 0.6, t, TABLE_H * 0.8, wallOpts ),
            // shooter-lane deflector — angled \ shape positioned ABOVE
            // the chute exit (y=55, well clear of the inner-wall top
            // at y=92). High restitution (0.85) so the ball doesn't
            // bleed all its energy on the bounce — without that boost
            // the ball was "flopping" off the deflector and falling
            // straight back into the chute.
            Bodies.rectangle( TABLE_W - 40, 55, 80, t, Object.assign( {}, wallOpts, {
                angle: Math.PI / 5,
                restitution: 0.85,
            } ) ),
            // CHUTE FLOOR — closes the bottom of the shooter lane so
            // the ball rests on it until the plunger fires upward.
            // Without this the ball drops out the open bottom of the
            // chute into the drain sensor and the game ends instantly.
            // Sized to sit between the inner and outer chute walls
            // (inner wall right edge ~711, outer wall left edge ~746),
            // so it doesn't visually protrude into the playfield.
            Bodies.rectangle( ( 711 + 746 ) / 2, TABLE_H - 8, 36, 8, wallOpts ),
        ] );

        // ---- TOP-LEFT CHUTE CURVE — chamfer the top-left corner so a ball
        // skimming the top "follows around" and rolls down the left side
        // instead of dead-bouncing in the corner. Gentle restitution (0.5) —
        // it guides, it doesn't kick. Labelled 'wall' so both renderers draw
        // it. (The top-right corner is left to the shooter mechanism.)
        World.add( w, [
            // from ~(14,74) up to ~(74,14).
            Bodies.rectangle( 44, 44, 84, 14, Object.assign( {}, wallOpts, {
                angle: -Math.PI / 4, restitution: 0.5,
            } ) ),
        ] );

        // ---- FUNNEL WALLS — the fix for "the ball drains down the sides
        // before I can hit it." The table is landscape (760 wide) with the
        // flippers at the centre, so the outlanes used to be ~115px of open
        // space each — balls poured down them straight to the drain. These
        // two walls close the bottom corners: each slopes from a side wall
        // down to just outside a flipper base, so a ball anywhere along the
        // bottom is funnelled INTO the flipper zone instead of past it. Only
        // the centre gap between the flipper tips still reaches the drain
        // (which the flippers guard). They sit just below the slingshots.
        World.add( w, [
            // left: starts ~22px OFF the wall (at x36, not x14) and runs
            // down to just above the left flipper pivot (~270, 414). The gap
            // between the wall (x14) and this funnel is the left gutter the
            // ball can drain through, like a real outlane. Bouncy (0.9).
            Bodies.rectangle( 153, 390, 239, t, Object.assign( {}, wallOpts, {
                angle: 0.206, restitution: 0.9,
            } ) ),
            // right: from just above the right flipper pivot (~490, 414) out
            // to x675 — ~22px short of the chute inner wall (x697), leaving
            // the right gutter. (Still clears the plunger lane x711-746.)
            Bodies.rectangle( 582, 406, 186, t, Object.assign( {}, wallOpts, {
                angle: -0.086, restitution: 0.9,
            } ) ),
        ] );

        // ---- OUTLANE BARS — bridge the gap between each side wall and the
        // slingshot, at the slingshot-top level, so a ball coming down the
        // outlane is redirected toward the slingshots/flippers instead of
        // dropping into the corner trap below (Thomas's "bouncy bar above
        // them, in line with the top of the blue triangles" idea). Bouncy
        // (restitution 1.0) so the ball springs back into play. Validated
        // in-browser: outlane drops now reach the bottom instead of wedging.
        World.add( w, [
            // left "\" — starts ~22px off the wall (the gutter gap) and runs
            // down toward the slingshot. Shorter than before so the ball can
            // slip past it into the gutter (Thomas's ask).
            Bodies.rectangle( 83, 328, 95, t, Object.assign( {}, wallOpts, {
                angle: 0.117, restitution: 1.0,
            } ) ),
            // right "/" — from the slingshot out to ~22px short of the chute
            // wall, leaving the right gutter gap.
            Bodies.rectangle( 618, 325, 116, t, Object.assign( {}, wallOpts, {
                angle: -0.121, restitution: 1.0,
            } ) ),
        ] );

        // ---- BUMPERS — circular, springy, score 100 × mult per hit.
        // Five of them, named after desk objects. Names propagate to
        // the story-credit easter egg at 10 cumulative hits each.
        this.bumpers = [];
        // Spread wide toward the edges (two far flanks, two mid, one top)
        // so the playfield doesn't feel crowded into the centre, while the
        // lower-centre funnel to the flippers stays clear.
        var bumperLabels = [
            { x: 110, y: 225, name: 'mug',    story: "Patience picked this Charlie Brown mug." },
            { x: 235, y: 295, name: 'spider', story: "Daniel made this with a 3D pen." },
            { x: 380, y: 200, name: 'sticker67', story: "67 — that's Faith's thing." },
            { x: 525, y: 295, name: 'duck',   story: "Daniel started the rubber-duck collection." },
            { x: 650, y: 225, name: 'marble', story: "Same marble that sits in the drawer." },
        ];
        var pinball = this;
        bumperLabels.forEach( function ( spec ) {
            var b = Bodies.circle( spec.x, spec.y, 15, {
                isStatic: true,
                restitution: 1.7, // overspring so the ball pops
                label: 'bumper:' + spec.name,
                render: { fillStyle: COLORS.bumper },
            } );
            b.tcStory = spec.story;
            b.tcName = spec.name;
            b.tcFlashUntil = 0;
            World.add( w, b );
            pinball.bumpers.push( b );
        } );

        // ---- PINS — small static studs in the UPPER/mid-field ("more
        // pins"). Gold, to contrast the cyan bumpers. Kept up high (y<=250)
        // and out of the x270–490 centre so the lower funnel to the flippers
        // stays clear — the ball must roll down to the flippers unobstructed.
        // r6 (vs the r10 ball) so they can't be tunnelled at the speed cap.
        // Score 25 × mult. Each peg is a TWO-STATE switch (tcOn): hitting it
        // flips it; line them all to the same mode to raise the side-guards.
        // Start alternating so they're not all-aligned at kickoff.
        this.pegs = [];
        var pegSpots = [
            { x: 380, y: 130 },                       // centre, in line between Ganon & Zelda
            { x: 290, y: 168 }, { x: 470, y: 168 },   // top inner arc
            { x: 150, y: 205 }, { x: 610, y: 205 },   // upper flanks
            { x: 95,  y: 260 }, { x: 650, y: 260 },   // outer edges
        ];
        pegSpots.forEach( function ( spec, i ) {
            var p = Bodies.circle( spec.x, spec.y, 6, {
                isStatic: true,
                restitution: 1.25,
                label: 'peg',
                render: { fillStyle: COLORS.dropTarget },
            } );
            p.tcFlashUntil = 0;
            p.tcOn = ( i % 2 === 0 );
            World.add( w, p );
            pinball.pegs.push( p );
        } );

        // ---- SIDE GUARDS — angled "kicker" walls at the bottom of each
        // outlane gutter. Normally sensors (inert); when every peg is in the
        // same mode they go solid and bat a side-draining ball back inward.
        this.gates = [];
        var gateOpts = { isStatic: true, isSensor: true, label: 'gate',
                         restitution: 1.0, render: { fillStyle: COLORS.slingshot } };
        this.gates.push( Bodies.rectangle( 27, 427, 40, 10,
            Object.assign( {}, gateOpts, { angle: 0.76 } ) ) );  // left "\"
        this.gates.push( Bodies.rectangle( 689, 427, 34, 10,
            Object.assign( {}, gateOpts, { angle: -0.76 } ) ) ); // right "/"
        World.add( w, this.gates );

        // ---- SLINGSHOTS — triangular bumpers above each flipper.
        // High restitution; score 50 × mult.
        this.slingshots = [];
        function slingshot( verts, label ) {
            var s = Bodies.fromVertices( 0, 0, [ verts ], {
                isStatic: true,
                restitution: 1.5,
                label: label,
                render: { fillStyle: COLORS.slingshot },
            }, true );
            // fromVertices recenters; reposition by computing centroid.
            var cx = ( verts[ 0 ].x + verts[ 1 ].x + verts[ 2 ].x ) / 3;
            var cy = ( verts[ 0 ].y + verts[ 1 ].y + verts[ 2 ].y ) / 3;
            Body.setPosition( s, { x: cx, y: cy } );
            s.tcVerts = verts;
            s.tcFlashUntil = 0;
            World.add( w, s );
            return s;
        }
        // Tops SLOPE toward the centre so a ball can't rest on them — it
        // rolls off toward the flippers (the flat tops used to be a perch).
        this.slingshots.push( slingshot( [
            { x: 130, y: 330 }, { x: 222, y: 352 }, { x: 130, y: 400 },
        ], 'slingshot:left' ) );
        this.slingshots.push( slingshot( [
            { x: 560, y: 330 }, { x: 468, y: 352 }, { x: 560, y: 400 },
        ], 'slingshot:right' ) );

        // ---- RAMPS — angled rails at the top representing the nav
        // categories. Hitting a ramp scores 500 × mult; HCS scores
        // double + triggers the rare-disease tilt banner.
        // We model each ramp as a short angled rectangle; on contact
        // the ball deflects and we award points.
        this.ramps = [];
        // Spread the platforms wide toward the edges.
        var rampSpecs = [
            { x: 95,  y: 135, angle: -0.4, label: 'ramp:link',  color: '#4caf50' }, // green tunic
            { x: 290, y: 112, angle: -0.2, label: 'ramp:ganon', color: '#e0452e' }, // special: double score
            { x: 470, y: 112, angle:  0.2, label: 'ramp:zelda', color: '#e8b923' }, // royal gold
            { x: 645, y: 135, angle:  0.4, label: 'ramp:impa',  color: '#7c6bd6' }, // Sheikah indigo
        ];
        rampSpecs.forEach( function ( spec ) {
            var r = Bodies.rectangle( spec.x, spec.y, 84, 10, {
                isStatic: true,
                angle: spec.angle,
                restitution: 0.7,
                label: spec.label,
                render: { fillStyle: spec.color },
            } );
            r.tcColor = spec.color;
            r.tcFlashUntil = 0;
            World.add( w, r );
            pinball.ramps.push( r );
        } );

        // ---- DROP TARGETS — three rectangles in a row at the very
        // top spelling T·C·V. Each "drops" (becomes inactive) when
        // hit. Clearing all 3 grants 5× multiplier for 10 seconds and
        // they reset.
        this.dropTargets = [];
        var places = [ 'Hyrule', 'Kakariko', 'Gerudo' ];
        var dropX = [ 190, 380, 570 ]; // spread across the top
        places.forEach( function ( place, i ) {
            var x = dropX[ i ];
            var d = Bodies.rectangle( x, 50, 64, 14, {
                isStatic: true,
                restitution: 0.6,
                label: 'drop:' + place,
                render: { fillStyle: COLORS.dropTarget },
            } );
            d.tcLabel = place;
            d.tcDropped = false;
            d.tcFlashUntil = 0;
            World.add( w, d );
            pinball.dropTargets.push( d );
        } );

        // ---- DRAIN sensor — a thin rectangle at the very bottom,
        // between the flippers, that detects the ball falling out.
        this.drain = Bodies.rectangle( TABLE_W / 2, TABLE_H + 10, TABLE_W, 20, {
            isStatic: true,
            isSensor: true,
            label: 'drain',
        } );
        World.add( w, this.drain );
    };

    // ================================================================
    // FLIPPERS — kinematic. We do NOT use hinge constraints. Each
    // frame the tick() loop computes the flipper's target angle
    // (rest or active) and steps the current angle toward it at a
    // fixed angular speed; the body's world position is computed
    // from the pivot + a body-local hinge offset rotated by the new
    // angle, and Body.setPosition / Body.setAngle override whatever
    // the physics tried to do.
    //
    // To make ball contacts feel right we ALSO set the body's
    // angularVelocity (and linear velocity) to match the kinematic
    // step — Matter's collision response uses those to compute the
    // impulse imparted to the ball.
    //
    // This solves the oscillation: gravity can't affect the flipper
    // because its pose is forcibly set every frame, so there's no
    // gravity-vs-controller fight to settle.
    Pinball.prototype.buildFlippers = function () {
        var w = this.engine.world;

        var flipperOpts = {
            // density barely matters because we're kinematic, but keep
            // a value so Matter can still compute mass for collisions.
            density: 0.02,
            friction: 0.05,
            restitution: 0.55,
            chamfer: { radius: 5 },
            render: { fillStyle: COLORS.flipper },
        };

        // LEFT — pivots around world (270, 412). Hinge sits at body-local
        // (-45, 0). Wider (90) and the pivots are closer together than
        // before, so the pair covers more of the bottom and the centre
        // drain gap between the tips is smaller (harder to drain, easier
        // to cradle). Funnel walls deliver the ball to the base at ~265.
        this.leftFlipper = Bodies.rectangle( 0, 0, 104, 14,
            Object.assign( {}, flipperOpts, { label: 'flipper:left' } ) );
        this.leftPivot        = { x: 270, y: 412 };
        this.leftHingeOffset  = { x: -52, y: 0 };
        this.leftRestAngle    = 0.35;
        this.leftActiveAngle  = -0.55;
        this.leftAngle        = this.leftRestAngle;
        this.positionFlipper( this.leftFlipper, this.leftPivot,
                              this.leftHingeOffset, this.leftAngle );
        World.add( w, this.leftFlipper );

        // RIGHT — pivots around world (490, 412). Hinge at body-local (+45, 0).
        this.rightFlipper = Bodies.rectangle( 0, 0, 104, 14,
            Object.assign( {}, flipperOpts, { label: 'flipper:right' } ) );
        this.rightPivot        = { x: 490, y: 412 };
        this.rightHingeOffset  = { x: 52, y: 0 };
        this.rightRestAngle    = -0.35;
        this.rightActiveAngle  = 0.55;
        this.rightAngle        = this.rightRestAngle;
        this.positionFlipper( this.rightFlipper, this.rightPivot,
                              this.rightHingeOffset, this.rightAngle );
        World.add( w, this.rightFlipper );
    };

    // Place a flipper so that its body-local hinge point sits at the
    // given world pivot, with the body rotated by `angle`. The math:
    // hinge_world = body.position + R(angle) * hingeOffset.
    // We want hinge_world = pivot, so body.position = pivot - R(angle)*hingeOffset.
    Pinball.prototype.positionFlipper = function ( body, pivot, hingeOffset, angle ) {
        var cos = Math.cos( angle );
        var sin = Math.sin( angle );
        var rx  = cos * hingeOffset.x - sin * hingeOffset.y;
        var ry  = sin * hingeOffset.x + cos * hingeOffset.y;
        Body.setPosition( body, { x: pivot.x - rx, y: pivot.y - ry } );
        Body.setAngle( body, angle );
    };

    // ================================================================
    // BALL(S). makeBall() builds one body; spawnBall() resets to a single
    // ball parked in the chute (start of a turn); addBall() drops an extra
    // one for multiball.
    Pinball.prototype.makeBall = function ( x, y, vx, vy ) {
        var b = Bodies.circle( x, y, BALL_R, {
            density: 0.025,
            restitution: 0.88,
            // Lower air friction so the ball doesn't bleed velocity climbing
            // the chute (0.005 left it too weak to escape the deflector).
            frictionAir: 0.002,
            friction: 0.01,
            label: 'ball',
            render: { fillStyle: COLORS.ball },
        } );
        b.tcTrail = [];   // per-ball motion trail
        b.tcStuck = 0;    // per-ball anti-stuck counter
        World.add( this.engine.world, b );
        if ( vx || vy ) Body.setVelocity( b, { x: vx, y: vy } );
        return b;
    };

    Pinball.prototype.spawnBall = function () {
        var w = this.engine.world;
        this.balls.forEach( function ( b ) { World.remove( w, b ); } );
        this.balls = [ this.makeBall( TABLE_W - 36, TABLE_H - 30, 0, 0 ) ];
        this.plungerCharge = 0;
        this.plungerActive = false;
        this.hcsThisBall = 0;
        this.tilted = false;   // fresh ball is never tilted
        this.tiltMeter = 0;
    };

    // Drop an extra ball from the top centre (multiball).
    Pinball.prototype.addBall = function () {
        if ( this.balls.length >= MAX_BALLS ) return;
        this.balls.push( this.makeBall( TABLE_W / 2, 120, ( Math.random() - 0.5 ) * 4, 3 ) );
    };

    // ================================================================
    // INPUT — keyboard + touch.
    Pinball.prototype.bindInput = function () {
        var self = this;

        // Avoid swallowing keystrokes while a text input is focused
        // (matches the desk-games convention).
        function typing( e ) {
            var t = e.target;
            return t && ( t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable );
        }

        this.onKey = function ( e ) {
            if ( typing( e ) ) return;
            audioCtx(); // keep the audio context live within a user gesture
            var k = e.key.toLowerCase();
            if ( e.type === 'keydown' ) {
                if ( k === 'a' ) {
                    if ( ! self.leftFlipperUp && ! self.tilted ) SFX.flip();
                    self.leftFlipperUp = true; e.preventDefault();
                }
                if ( k === 'l' || k === 'd' ) {
                    if ( ! self.rightFlipperUp && ! self.tilted ) SFX.flip();
                    self.rightFlipperUp = true; e.preventDefault();
                }
                if ( k === ' ' )       { self.plungerActive = true;   e.preventDefault(); }
                // Nudges — Left/Right Shift bump the sides, B bumps up.
                if ( e.code === 'ShiftLeft'  && ! e.repeat ) { self.nudge( 'left' );  e.preventDefault(); }
                if ( e.code === 'ShiftRight' && ! e.repeat ) { self.nudge( 'right' ); e.preventDefault(); }
                if ( k === 'b' && ! e.repeat )               { self.nudge( 'up' );    e.preventDefault(); }
                if ( k === 'escape' )  { self.destroy(); }
            } else {
                if ( k === 'a' )       { self.leftFlipperUp  = false; }
                if ( k === 'l' || k === 'd' ) { self.rightFlipperUp = false; }
                if ( k === ' ' )       { self.releasePlunger(); e.preventDefault(); }
            }
        };
        document.addEventListener( 'keydown', this.onKey );
        document.addEventListener( 'keyup',   this.onKey );

        // Touch: tap left half → left flipper, tap right half → right flipper.
        // We listen on the canvas only so the rest of the page still scrolls.
        this.onTouchStart = function ( e ) {
            var rect = self.canvas.getBoundingClientRect();
            for ( var i = 0; i < e.changedTouches.length; i++ ) {
                var t = e.changedTouches[ i ];
                var rx = ( t.clientX - rect.left ) / rect.width;
                if ( rx < 0.45 ) self.leftFlipperUp  = true;
                else if ( rx > 0.55 ) self.rightFlipperUp = true;
                else self.plungerActive = true;
            }
            e.preventDefault();
        };
        this.onTouchEnd = function ( e ) {
            self.leftFlipperUp  = false;
            self.rightFlipperUp = false;
            if ( self.plungerActive ) self.releasePlunger();
            e.preventDefault();
        };
        this.canvas.addEventListener( 'touchstart', this.onTouchStart, { passive: false } );
        this.canvas.addEventListener( 'touchend',   this.onTouchEnd,   { passive: false } );
        this.canvas.addEventListener( 'touchcancel', this.onTouchEnd,  { passive: false } );

        // Exit button.
        this.root.querySelector( '[data-pinball-exit]' )
            .addEventListener( 'click', function () { self.destroy(); } );
    };

    Pinball.prototype.releasePlunger = function () {
        if ( ! this.plungerActive ) { this.plungerCharge = 0; return; }
        // Launch whichever ball is sitting in the shooter lane (right side,
        // lower half — on the chute floor).
        var lane = null;
        for ( var i = 0; i < this.balls.length; i++ ) {
            var b = this.balls[ i ];
            if ( b.position.x > TABLE_W - 60 && b.position.y > TABLE_H * 0.45 ) { lane = b; break; }
        }
        if ( lane ) {
            // -13 (tap) to -28 (full charge) px/step — enough authority to
            // clear the deflector into the playfield.
            var vy = -13 - 15 * this.plungerCharge;
            Body.setVelocity( lane, { x: 0, y: vy } );
            SFX.launch();
        }
        this.plungerActive = false;
        this.plungerCharge = 0;
    };

    // Table nudge — Left/Right Shift bump the sides, B bumps up. Gives the
    // ball a small impulse (+ a brief screen shake) so the player can coax
    // it out of a dead spot, like shoving a real machine. Convention: a
    // LEFT-side bump shoves the ball RIGHT, and vice-versa. A short cooldown
    // stops nudge-spam.
    Pinball.prototype.nudge = function ( side ) {
        var now = performance.now();
        if ( this.tilted || this.gameOver ) return;
        if ( now < this.nudgeUntil ) return;
        this.nudgeUntil = now + 180;

        // Tilt accumulation — over-nudge and the table tilts. The meter
        // decays in tick(), so it's the RATE of nudging that trips it.
        this.tiltMeter += 1;
        if ( this.tiltMeter >= 5 ) { this.doTilt(); return; }
        if ( this.tiltMeter >= 3 ) this.flashBanner( 'Careful — TILT warning', 1000 );

        var vx = 0, vy = 0, sx = 0, sy = 0;
        if ( side === 'left'  ) { vx =  4.4; vy = -1.6; sx = -7; }
        if ( side === 'right' ) { vx = -4.4; vy = -1.6; sx =  7; }
        if ( side === 'up'    ) { vy = -5.8; sy = -8; }
        this.balls.forEach( function ( b ) {
            Body.setVelocity( b, { x: b.velocity.x + vx, y: b.velocity.y + vy } );
        } );
        this.shake = { x: sx, y: sy, until: now + 130 };
    };

    // TILT — too many nudges too fast. Flippers go dead until the ball
    // drains (which clears it via spawnBall), like a real machine.
    Pinball.prototype.doTilt = function () {
        this.tilted = true;
        this.tiltMeter = 0;
        this.leftFlipperUp = false;
        this.rightFlipperUp = false;
        SFX.tilt();
        this.flashBanner( 'TILT — flippers dead till next ball', 2600 );
        this.shake = { x: 0, y: 13, until: performance.now() + 420 };
    };

    // ================================================================
    // COLLISIONS — score, multiplier, banners, drain handling.
    Pinball.prototype.bindCollisions = function () {
        var self = this;
        Events.on( this.engine, 'collisionStart', function ( evt ) {
            evt.pairs.forEach( function ( pair ) {
                var ball = null, other = null;
                if ( pair.bodyA.label === 'ball' ) { ball = pair.bodyA; other = pair.bodyB; }
                else if ( pair.bodyB.label === 'ball' ) { ball = pair.bodyB; other = pair.bodyA; }
                if ( ! ball ) return;

                var label = other.label || '';
                if ( label === 'drain' ) {
                    self.handleDrain( ball );
                } else if ( label.indexOf( 'bumper:' ) === 0 ) {
                    self.handleBumper( other, ball );
                } else if ( label.indexOf( 'slingshot:' ) === 0 ) {
                    self.handleSlingshot( other, ball );
                } else if ( label.indexOf( 'ramp:' ) === 0 ) {
                    self.handleRamp( other );
                } else if ( label.indexOf( 'drop:' ) === 0 ) {
                    self.handleDrop( other );
                } else if ( label === 'peg' ) {
                    self.handlePeg( other, ball );
                }
            } );
        } );
    };

    Pinball.prototype.handlePeg = function ( body, ball ) {
        body.tcFlashUntil = performance.now() + 140;
        body.tcOn = ! body.tcOn;   // toggle this switch
        SFX.peg();
        this.addScore( 25 );
        this.spawnSparks( body.position.x, body.position.y, COLORS.dropTarget );
        // Small nudge so the peg feels springy (lighter than a bumper).
        if ( ball ) {
            var dir = Vector.normalise( Vector.sub( ball.position, body.position ) );
            Body.applyForce( ball, ball.position, { x: dir.x * 0.006, y: dir.y * 0.006 } );
        }
        this.updateGates();
    };

    // Raise the side-guards when every peg shares a mode (all on or all off);
    // drop them otherwise. Solid ↔ sensor is the whole mechanism.
    Pinball.prototype.updateGates = function () {
        var on = 0;
        this.pegs.forEach( function ( p ) { if ( p.tcOn ) on++; } );
        var allSame = ( on === 0 || on === this.pegs.length );
        if ( allSame === this.gatesActive ) return; // no change
        this.gatesActive = allSame;
        this.gates.forEach( function ( g ) { g.isSensor = ! allSame; } );
        if ( allSame ) {
            SFX.gold();
            this.flashBanner( 'Pegs aligned — side guards UP!', 1800 );
        } else {
            this.flashBanner( 'Side guards down', 900 );
        }
    };

    Pinball.prototype.handleBumper = function ( body, ball ) {
        body.tcFlashUntil = performance.now() + 160;
        this.totalBumperHits++;
        var hits = this.bumperHits[ body.tcName ] = ( this.bumperHits[ body.tcName ] || 0 ) + 1;
        var gold = hits >= 12;
        SFX.bumper( hits );
        // A gold post is worth 5× a normal one.
        this.addScore( gold ? 500 : 100 );
        // Apply a small extra impulse to the ball so the bumper feels alive.
        if ( ball ) {
            var dir = Vector.normalise( Vector.sub( ball.position, body.position ) );
            Body.applyForce( ball, ball.position, { x: dir.x * 0.012, y: dir.y * 0.012 } );
        }
        // Sparks fly off on every hit, tinted to the post's current colour.
        this.spawnSparks( body.position.x, body.position.y, bumperBrightColor( hits ) );
        // The post jumps through bold hues over its first 12 hits; the 12th
        // locks it GOLD for good — gold posts score 5× AND speed the ball up.
        if ( hits === 12 ) {
            this.goldPosts++;
            SFX.gold();
            this.flashBanner( body.tcName + ' is GOLD — 5× points + speed boost', 2400 );
            // All five posts gold → JACKPOT: ×20 + MULTIBALL.
            if ( this.goldPosts === 5 ) {
                SFX.jackpot();
                this.score += 25000;
                this.scoreEl.textContent = this.score.toLocaleString();
                this.multiplier = 20;
                this.multUntil = performance.now() + 20000;
                this.addBall();
                this.flashBanner( 'ALL POSTS GOLD — ×20 & MULTIBALL!', 3600 );
            }
        }
        if ( gold && ball ) {
            var v = ball.velocity;
            Body.setVelocity( ball, { x: v.x * 1.16, y: v.y * 1.16 } );
        }
        // Story-credit easter egg at 10 cumulative hits per object.
        if ( hits === 10 ) {
            this.flashBanner( body.tcStory, 3200 );
        }
    };

    // Spawn a burst of spark particles at a point. Bigger, faster bursts
    // read as more electric.
    Pinball.prototype.spawnSparks = function ( x, y, color ) {
        for ( var i = 0; i < 14; i++ ) {
            var a = Math.random() * Math.PI * 2, sp = 2.2 + Math.random() * 4.0;
            this.sparks.push( {
                x: x, y: y,
                vx: Math.cos( a ) * sp,
                vy: Math.sin( a ) * sp - 1.4,
                life: 1, color: color,
            } );
        }
    };

    Pinball.prototype.handleSlingshot = function ( body, ball ) {
        body.tcFlashUntil = performance.now() + 140;
        SFX.sling();
        this.spawnSparks( body.position.x, body.position.y, COLORS.bumperBright );
        this.addScore( 50 );
        // Chaotic kick — the slingshots randomly REVERSE the ball or give it
        // a speed BOOST (or just a normal bounce). Keeps play unpredictable.
        var b = ball;
        if ( ! b ) return;
        var v = b.velocity, roll = Math.random();
        if ( roll < 0.30 ) {
            // Reverse: send it back the way it came, with a little lift.
            Body.setVelocity( b, { x: -v.x * 1.05, y: -Math.abs( v.y ) * 0.7 - 2 } );
        } else if ( roll < 0.62 ) {
            // Boost (the speed cap in tick() keeps it sane).
            Body.setVelocity( b, { x: v.x * 1.5, y: v.y * 1.5 } );
        }
    };

    Pinball.prototype.handleRamp = function ( body ) {
        body.tcFlashUntil = performance.now() + 220;
        SFX.ramp();
        if ( body.label === 'ramp:ganon' ) {
            this.hcsThisBall++;
            this.addScore( 1000 );
            if ( this.hcsThisBall === 3 ) {
                this.flashBanner( 'Ganon awakens! The Triforce trembles.', 3400 );
            }
        } else {
            this.addScore( 500 );
        }
    };

    Pinball.prototype.handleDrop = function ( body ) {
        if ( body.tcDropped ) return;
        body.tcDropped = true;
        body.isSensor = true; // ball passes through after it's "dropped"
        body.tcFlashUntil = performance.now() + 260;
        SFX.peg();
        this.addScore( 250 );

        // Cleared all 3? Bonus multiplier + reset the row.
        var allDown = this.dropTargets.every( function ( d ) { return d.tcDropped; } );
        if ( allDown ) {
            SFX.gold();
            this.multiplier = 5;
            this.multUntil = performance.now() + 10000;
            this.flashBanner( 'All Hyrule explored — ×5 for 10 seconds!', 2400 );
            var self = this;
            setTimeout( function () {
                self.dropTargets.forEach( function ( d ) {
                    d.tcDropped = false;
                    d.isSensor = false;
                } );
            }, 1200 );
        }
    };

    Pinball.prototype.handleDrain = function ( ball ) {
        if ( this.gameOver ) return;
        // Remove just the ball that drained. Guard against a double-fire
        // (sub-stepping) draining the same ball twice in one frame.
        var idx = this.balls.indexOf( ball );
        if ( idx < 0 ) return;
        World.remove( this.engine.world, ball );
        this.balls.splice( idx, 1 );
        SFX.drain();
        // Draining costs you: the multiplier drops to ×1 and the gold posts
        // reset (back to cyan/zero hits), so a long gold run is real progress.
        this.multiplier = 1;
        this.multUntil = 0;
        if ( this.multEl ) this.multEl.textContent = '';
        this.goldPosts = 0;
        this.bumperHits = {};
        // Other balls still live → multiball continues, no turn lost.
        if ( this.balls.length > 0 ) {
            this.flashBanner( 'Ball lost — ×1, gold reset', 1400 );
            return;
        }
        // Last ball gone → lose a turn (or end the game).
        if ( this.ball < this.maxBalls ) {
            this.ball++;
            this.ballEl.textContent = this.ball;
            this.flashBanner( 'Ball ' + this.ball + ' — push Space to launch', 1800 );
            this.spawnBall();
        } else {
            this.endGame();
        }
    };

    // ================================================================
    // SCORING + MULTIPLIER + BANNER.
    Pinball.prototype.addScore = function ( base ) {
        var pts = Math.round( base * this.multiplier );
        this.score += pts;
        this.scoreEl.textContent = this.score.toLocaleString();

        if ( ! this.unlocked25k && this.score >= 25000 ) {
            this.unlocked25k = true;
            this.flashBanner( "You're good at this. Keep going.", 2400 );
        }
        if ( ! this.unlocked50k && this.score >= 50000 ) {
            this.unlocked50k = true;
            this.flashBanner( 'You found it. The toad has an arcade too.', 3000 );
        }
    };

    Pinball.prototype.updateMultiplier = function () {
        if ( this.multUntil && performance.now() > this.multUntil ) {
            this.multiplier = 1;
            this.multUntil = 0;
            this.multEl.textContent = '';
        } else if ( this.multUntil ) {
            this.multEl.textContent = '× ' + this.multiplier;
        }
    };

    Pinball.prototype.flashBanner = function ( text, ms ) {
        var el = this.bannerEl;
        if ( ! el ) return;
        el.textContent = text;
        el.classList.add( 'is-visible' );
        clearTimeout( this._bannerTimer );
        this._bannerTimer = setTimeout( function () {
            el.classList.remove( 'is-visible' );
        }, ms || 2000 );
    };

    // A small round sound-toggle in the overlay's bottom-left.
    Pinball.prototype.buildMuteButton = function () {
        var b = document.createElement( 'button' );
        b.type = 'button';
        b.setAttribute( 'aria-label', 'Toggle sound' );
        b.style.cssText = 'position:absolute;bottom:14px;left:14px;z-index:13;width:42px;height:42px;' +
            'border-radius:999px;border:1px solid rgba(63,199,218,0.5);background:rgba(8,6,20,0.55);' +
            'color:#bfefff;font-size:18px;line-height:1;cursor:pointer;';
        b.textContent = muted ? '🔇' : '🔊';
        b.addEventListener( 'click', function () {
            setMuted( ! muted );
            b.textContent = muted ? '🔇' : '🔊';
        } );
        this.root.appendChild( b );
        this.muteBtn = b;
    };

    // ================================================================
    // END GAME — submit if score qualifies; show summary + top 10; close.
    Pinball.prototype.endGame = function () {
        this.gameOver = true;
        this.flashBanner( 'Game over — ' + this.score.toLocaleString() + ' points', 2600 );

        var self = this;
        var url = ( window.tcDeskGames && window.tcDeskGames.scoresUrl ) || '/wp-json/tc-games/v1/scores';

        // Quick read first to decide if we should prompt for a name; either
        // way we land on the Play Again / Exit panel (which shows the top 10).
        fetch( url + '?game=pinball', { credentials: 'same-origin' } )
            .then( function ( r ) { return r.ok ? r.json() : null; } )
            .then( function ( data ) {
                var rows = data
                    ? ( Array.isArray( data ) ? data : ( data.pinball || [] ) )
                    : [];
                self.topScores = rows.slice();
                var qualifies = self.score > 0 && (
                    rows.length < 10 || self.score > rows[ rows.length - 1 ].score
                );
                if ( ! qualifies ) { self.showEndPanel( null ); return; }
                var name = ( window.prompt(
                    'Top 10! Initials or name (max 16 chars):',
                    'TC'
                ) || '' ).trim();
                if ( ! name ) { self.showEndPanel( null ); return; }
                name = name.slice( 0, 16 );
                // Optimistically place the new score so the board shows it
                // immediately, even before the POST round-trips.
                self.topScores = rows.concat( [ {
                    name: name, score: self.score, ts: Math.floor( Date.now() / 1000 ), mine: true,
                } ] ).sort( function ( a, b ) { return b.score - a.score; } ).slice( 0, 10 );
                fetch( url, {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify( { game: 'pinball', name: name, score: self.score } ),
                } )
                .then( function ( r ) { return r.ok ? r.json() : null; } )
                .then( function ( j ) {
                    if ( j && Array.isArray( j.scores ) ) self.topScores = j.scores;
                    self.showEndPanel( 'Saved to the leaderboard.' );
                } )
                .catch( function () { self.showEndPanel( 'Could not save (shown locally).' ); } );
            } )
            .catch( function () { self.showEndPanel( null ); } );
    };

    // Game-over panel — final score + Play Again / Exit. Built with inline
    // styles so it ships entirely in this JS file (no bundled-CSS change).
    Pinball.prototype.showEndPanel = function ( note ) {
        if ( this.overPanel ) return;
        var panel = document.createElement( 'div' );
        panel.className = 'tc-pinball__over';
        panel.setAttribute( 'role', 'dialog' );
        panel.setAttribute( 'aria-modal', 'true' );
        panel.style.cssText = 'position:absolute;inset:0;z-index:12;display:flex;' +
            'flex-direction:column;align-items:center;justify-content:center;gap:16px;' +
            'text-align:center;background:rgba(8,6,20,0.85);';
        panel.innerHTML =
            '<div style="font:700 30px Georgia,serif;color:#00ff66;letter-spacing:2px;">GAME OVER</div>' +
            '<div style="font:400 19px Georgia,serif;color:#e6fbff;">' +
                this.score.toLocaleString() + ' points</div>' +
            ( note ? '<div style="font:400 13px Georgia,serif;color:#9fb0d0;">' + note + '</div>' : '' );
        var self = this;

        // Top-10 scoreboard.
        var board = document.createElement( 'div' );
        board.style.cssText = 'margin-top:2px;min-width:300px;max-width:80vw;' +
            'font:400 13px Georgia,serif;color:#cfe;';
        var scores = ( this.topScores || [] ).slice( 0, 10 );
        if ( scores.length ) {
            var rows = scores.map( function ( r, i ) {
                var hi = r.mine ? 'color:#00ff66;font-weight:700;' : 'color:#cfe;';
                return '<div style="display:flex;justify-content:space-between;gap:24px;' +
                    'padding:2px 12px;' + hi + '">' +
                    '<span>' + ( i + 1 ) + '. ' + escapeHtml( r.name || '—' ) + '</span>' +
                    '<span>' + Number( r.score || 0 ).toLocaleString() + '</span></div>';
            } ).join( '' );
            board.innerHTML = '<div style="color:#00ff66;font-weight:700;letter-spacing:2px;' +
                'margin-bottom:6px;">TOP 10</div>' + rows;
        } else {
            board.innerHTML = '<div style="color:#9fb0d0;">No scores yet — be the first.</div>';
        }
        panel.appendChild( board );

        var row = document.createElement( 'div' );
        row.style.cssText = 'display:flex;gap:14px;margin-top:6px;';
        function mkBtn( label, fn ) {
            var b = document.createElement( 'button' );
            b.type = 'button';
            b.textContent = label;
            b.style.cssText = 'font:600 14px Georgia,serif;letter-spacing:.04em;padding:11px 26px;' +
                'border-radius:999px;border:1px solid #3fc7da;background:rgba(63,199,218,0.16);' +
                'color:#e6fbff;cursor:pointer;';
            b.addEventListener( 'mouseenter', function () { b.style.background = 'rgba(63,199,218,0.32)'; } );
            b.addEventListener( 'mouseleave', function () { b.style.background = 'rgba(63,199,218,0.16)'; } );
            b.addEventListener( 'click', fn );
            return b;
        }
        var again = mkBtn( 'Play Again', function () { self.restart(); } );
        row.appendChild( again );
        row.appendChild( mkBtn( 'Exit', function () { self.destroy(); } ) );
        panel.appendChild( row );
        this.root.appendChild( panel );
        this.overPanel = panel;
        again.focus();
    };

    // Reset for a fresh game without tearing down the instance.
    Pinball.prototype.restart = function () {
        if ( this.overPanel ) { this.overPanel.remove(); this.overPanel = null; }
        this.score = 0;        this.scoreEl.textContent = '0';
        this.ball = 1;         this.ballEl.textContent  = '1';
        this.multiplier = 1;   this.multUntil = 0;  this.multEl.textContent = '';
        this.hcsThisBall = 0;
        this.bumperHits = {};  this.totalBumperHits = 0;
        this.unlocked25k = false; this.unlocked50k = false;
        this.goldPosts = 0;
        this.gameOver = false;
        this.sparks = [];
        this.stuckFrames = 0;
        this.dropTargets.forEach( function ( d ) { d.tcDropped = false; d.isSensor = false; } );
        // Reset the peg puzzle (alternating) + drop the side-guards.
        this.pegs.forEach( function ( p, i ) { p.tcOn = ( i % 2 === 0 ); } );
        this.gatesActive = false;
        this.gates.forEach( function ( g ) { g.isSensor = true; } );
        // Reset the background sector to 1 (quietly — no banner).
        if ( this.renderer === 'pixi' && this.pixi ) {
            this.bgTier = 0;
            this.paintBackground( this.pixi.bgCtx, 0 );
            this.pixi.bgTex.update();
        }
        this.spawnBall();
        this.flashBanner( 'Push Space to launch', 1800 );
    };

    // ================================================================
    // RENDER + TICK.
    Pinball.prototype.tick = function ( ts ) {
        if ( ! this.running ) return;
        var dt = Math.min( 32, ts - this.lastTs );
        this.lastTs = ts;

        // Tilt meter decays over time, so it's the RATE of nudging that
        // trips a tilt, not the lifetime count.
        if ( this.tiltMeter > 0 ) this.tiltMeter = Math.max( 0, this.tiltMeter - dt / 600 );

        // Kinematic flippers — step each toward its target, override
        // the body pose every frame. Must happen BEFORE Engine.update
        // so the new pose is what collisions are resolved against. When
        // tilted, both flippers are forced to rest (dead).
        this.driveFlipper( 'left',  this.tilted ? false : this.leftFlipperUp,  dt );
        this.driveFlipper( 'right', this.tilted ? false : this.rightFlipperUp, dt );

        // Charge plunger while held.
        if ( this.plungerActive ) {
            this.plungerCharge = Math.min( 1, this.plungerCharge + dt / 800 );
        }

        // Sub-step the physics so a fast ball can't tunnel through the thin
        // flippers/walls in one big step. Then cap the ball's speed (the
        // gold-post boosts can otherwise compound into a tunnelling missile).
        var subSteps = 2;
        for ( var ss = 0; ss < subSteps; ss++ ) {
            Engine.update( this.engine, dt / subSteps );
        }
        // Per-ball upkeep: speed cap, motion trail, fly-out + anti-stuck.
        var BMAX = 26;
        for ( var bi = 0; bi < this.balls.length; bi++ ) {
            var bb = this.balls[ bi ];
            var bv = bb.velocity, bs = Math.hypot( bv.x, bv.y );
            if ( bs > BMAX ) Body.setVelocity( bb, { x: bv.x / bs * BMAX, y: bv.y / bs * BMAX } );
            // Motion trail — a short per-ball history.
            bb.tcTrail.push( { x: bb.position.x, y: bb.position.y } );
            if ( bb.tcTrail.length > 9 ) bb.tcTrail.shift();
            // Flew out the top → bat it back down rather than losing it.
            if ( bb.position.y < -30 ) {
                Body.setPosition( bb, { x: bb.position.x, y: 0 } );
                Body.setVelocity( bb, { x: bv.x, y: Math.abs( bv.y ) + 1 } );
            }
            // Anti-stuck watchdog (per ball) — a motionless ball outside the
            // shooter lane for ~3s gets a small random nudge so it can't wedge.
            if ( ! this.gameOver ) {
                var inLane = bb.position.x > TABLE_W - 60 && bb.position.y > TABLE_H * 0.45;
                var spd = Math.hypot( bb.velocity.x, bb.velocity.y );
                if ( ! inLane && spd < 0.35 ) {
                    bb.tcStuck = ( bb.tcStuck || 0 ) + 1;
                    if ( bb.tcStuck > 170 ) {
                        Body.setVelocity( bb, { x: ( Math.random() - 0.5 ) * 5, y: -3 - Math.random() * 3 } );
                        bb.tcStuck = 0;
                    }
                } else {
                    bb.tcStuck = 0;
                }
            }
        }

        // Spark particles (bumper hits) — integrate + age out.
        for ( var si = this.sparks.length - 1; si >= 0; si-- ) {
            var sp = this.sparks[ si ];
            sp.x += sp.vx; sp.y += sp.vy; sp.vy += 0.16; sp.life -= 0.045;
            if ( sp.life <= 0 ) this.sparks.splice( si, 1 );
        }

        this.updateMultiplier();
        if ( this.renderer === 'pixi' ) this.renderPixi();
        else this.render();
        requestAnimationFrame( this.tick );
    };

    // Kinematic flipper step. `side` is 'left' or 'right' — used to
    // index into this[side+'Flipper'], this[side+'Pivot'], etc.
    Pinball.prototype.driveFlipper = function ( side, isUp, dt ) {
        var body         = this[ side + 'Flipper' ];
        var pivot        = this[ side + 'Pivot' ];
        var hingeOffset  = this[ side + 'HingeOffset' ];
        var restA        = this[ side + 'RestAngle' ];
        var activeA      = this[ side + 'ActiveAngle' ];
        var prevAngle    = this[ side + 'Angle' ];

        // Angular speed in rad / ms. 0.024 rad/ms = ~1370 deg/s — a
        // full 0.9 rad swing takes about 38 ms, which feels arcade-
        // snappy without tunneling through the ball. Return swing is
        // slightly slower than the up-swing so the flipper "drops"
        // back rather than snapping (more pinball-realistic).
        var speedUp   = 0.024;
        var speedDown = 0.014;
        var speed     = isUp ? speedUp : speedDown;
        var maxStep   = speed * dt;

        var target    = isUp ? activeA : restA;
        var diff      = target - prevAngle;
        var step      = ( Math.abs( diff ) <= maxStep )
                            ? diff
                            : Math.sign( diff ) * maxStep;
        var newAngle  = prevAngle + step;
        this[ side + 'Angle' ] = newAngle;

        // Compute the new world position from the pivot + offset.
        var prevPos = { x: body.position.x, y: body.position.y };
        this.positionFlipper( body, pivot, hingeOffset, newAngle );

        // Set angular + linear velocity so the ball gets the right
        // impulse on contact. Matter's velocity unit is per-step
        // displacement (NOT per-second) — Body.setVelocity sets
        // positionPrev = position - velocity, and the next Engine
        // .update integrates velocity = position - positionPrev.
        // So we pass the raw per-frame delta. Dividing by dt/1000
        // (an earlier mistake) gave velocity values ~62x too large,
        // which teleported the flippers off-screen.
        Body.setAngularVelocity( body, step );
        Body.setVelocity( body, {
            x: body.position.x - prevPos.x,
            y: body.position.y - prevPos.y,
        } );
    };

    Pinball.prototype.render = function () {
        var ctx = this.ctx;
        var now = performance.now();
        ctx.clearRect( 0, 0, TABLE_W, TABLE_H );

        // Felt background gradient.
        var bg = ctx.createRadialGradient( TABLE_W / 2, TABLE_H * 0.35, 50,
                                           TABLE_W / 2, TABLE_H * 0.5, TABLE_W );
        bg.addColorStop( 0, '#1a1228' );
        bg.addColorStop( 1, COLORS.bg );
        ctx.fillStyle = bg;
        ctx.fillRect( 0, 0, TABLE_W, TABLE_H );

        // Soft top spotlight — lifts the upper playfield out of flat black.
        var spot = ctx.createRadialGradient( TABLE_W / 2, 165, 30, TABLE_W / 2, 165, 350 );
        spot.addColorStop( 0, 'rgba(122,112,225,0.13)' );
        spot.addColorStop( 1, 'rgba(122,112,225,0)' );
        ctx.fillStyle = spot;
        ctx.fillRect( 0, 0, TABLE_W, TABLE_H );

        // Vignette — push the edges darker for depth + focus on the play.
        var vg = ctx.createRadialGradient( TABLE_W / 2, TABLE_H * 0.42, TABLE_H * 0.34,
                                           TABLE_W / 2, TABLE_H * 0.5, TABLE_W * 0.62 );
        vg.addColorStop( 0, 'rgba(0,0,0,0)' );
        vg.addColorStop( 1, 'rgba(0,0,0,0.5)' );
        ctx.fillStyle = vg;
        ctx.fillRect( 0, 0, TABLE_W, TABLE_H );

        // Screen-shake — jitter the playfield (not the felt) briefly after a
        // nudge. Wrapped in save/restore; everything below is offset.
        var shx = 0, shy = 0;
        if ( this.shake && now < this.shake.until ) {
            var sk = ( this.shake.until - now ) / 130;
            shx = this.shake.x * sk * ( 0.4 + Math.random() * 0.6 );
            shy = this.shake.y * sk * ( 0.4 + Math.random() * 0.6 );
        }
        ctx.save();
        ctx.translate( shx, shy );

        // Walls — draw all static rectangles as wood.
        var self = this;
        var bodies = Composite.allBodies( this.engine.world );
        bodies.forEach( function ( b ) {
            if ( b.label === 'wall' ) self.drawWall( b );
        } );

        // Ramps.
        this.ramps.forEach( function ( r ) {
            var flash = r.tcFlashUntil > now;
            self.drawRect( r, flash ? COLORS.bumperBright : r.tcColor );
            self.drawRectLabel( r, labelOfRamp( r.label ), flash );
        } );

        // Slingshots — glowing triangles with a lit edge.
        this.slingshots.forEach( function ( s ) {
            var flash = s.tcFlashUntil > now;
            function trace() {
                ctx.beginPath();
                s.vertices.forEach( function ( v, i ) {
                    if ( i === 0 ) ctx.moveTo( v.x, v.y );
                    else ctx.lineTo( v.x, v.y );
                } );
                ctx.closePath();
            }
            ctx.save();
            ctx.shadowColor = COLORS.slingshot;
            ctx.shadowBlur  = flash ? 5 : 3;
            ctx.fillStyle   = flash ? COLORS.bumperBright : COLORS.slingshot;
            trace();
            ctx.fill();
            ctx.restore();
            ctx.lineWidth   = 2;
            ctx.strokeStyle = flash ? '#ffffff' : COLORS.bumperBright;
            trace();
            ctx.stroke();
        } );

        // Bumpers — glass discs that warm toward gold with hits; bright rim
        // + specular dot.
        this.bumpers.forEach( function ( bp ) {
            var flash  = bp.tcFlashUntil > now;
            var hits   = self.bumperHits[ bp.tcName ] || 0;
            var base   = bumperColor( hits ), bright = bumperBrightColor( hits );
            var radius = bp.circleRadius;
            var x = bp.position.x, y = bp.position.y;
            ctx.save();
            ctx.shadowColor = flash ? '#ffffff' : bright;
            ctx.shadowBlur  = flash ? 5 : 3;
            var grad = ctx.createRadialGradient( x - 5, y - 6, 2, x, y, radius );
            grad.addColorStop( 0, flash ? '#ffffff' : bright );
            grad.addColorStop( 1, flash ? bright : base );
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc( x, y, radius, 0, Math.PI * 2 );
            ctx.fill();
            ctx.restore();
            ctx.lineWidth = 2;
            ctx.strokeStyle = flash ? '#ffffff' : bright;
            ctx.beginPath();
            ctx.arc( x, y, radius - 1, 0, Math.PI * 2 );
            ctx.stroke();
            ctx.fillStyle = 'rgba(255,255,255,0.65)';
            ctx.beginPath();
            ctx.arc( x - radius * 0.32, y - radius * 0.36, radius * 0.22, 0, Math.PI * 2 );
            ctx.fill();
        } );

        // Pins — two-state studs (ON = bright gold, OFF = dark).
        this.pegs.forEach( function ( p ) {
            var flash = p.tcFlashUntil > now, on = p.tcOn;
            var r = p.circleRadius, x = p.position.x, y = p.position.y;
            ctx.save();
            ctx.shadowColor = COLORS.dropTarget;
            ctx.shadowBlur  = flash ? 8 : ( on ? 3 : 0 );
            var g = ctx.createRadialGradient( x - r * 0.3, y - r * 0.3, 1, x, y, r );
            g.addColorStop( 0, on ? '#fff3d0' : '#5a4a2a' );
            g.addColorStop( 1, flash ? '#ffffff' : ( on ? COLORS.dropTarget : '#3a2e18' ) );
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc( x, y, r, 0, Math.PI * 2 );
            ctx.fill();
            ctx.restore();
            ctx.fillStyle = on ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)';
            ctx.beginPath();
            ctx.arc( x - r * 0.3, y - r * 0.3, r * 0.3, 0, Math.PI * 2 );
            ctx.fill();
        } );

        // Side-guards — only when raised.
        if ( this.gatesActive ) {
            this.gates.forEach( function ( gt ) {
                ctx.save();
                ctx.shadowColor = COLORS.bumperBright;
                ctx.shadowBlur = 8;
                ctx.fillStyle = COLORS.slingshot;
                ctx.beginPath();
                gt.vertices.forEach( function ( v, i ) {
                    if ( i === 0 ) ctx.moveTo( v.x, v.y ); else ctx.lineTo( v.x, v.y );
                } );
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            } );
        }

        // Drop targets — lit, rounded letter tiles; dimmed when dropped.
        this.dropTargets.forEach( function ( d ) {
            var flash = d.tcFlashUntil > now;
            ctx.save();
            ctx.translate( d.position.x, d.position.y );
            ctx.rotate( d.angle );
            if ( d.tcDropped ) {
                ctx.fillStyle = COLORS.dropTargetOff;
            } else {
                ctx.shadowColor = COLORS.dropTarget;
                ctx.shadowBlur  = flash ? 8 : 3;
                var dg = ctx.createLinearGradient( 0, -7, 0, 7 );
                dg.addColorStop( 0, '#fff3d0' );
                dg.addColorStop( 1, flash ? '#ffffff' : COLORS.dropTarget );
                ctx.fillStyle = dg;
            }
            roundRectPath( ctx, -32, -7, 64, 14, 4 );
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = d.tcDropped ? '#1a1018' : '#3a2616';
            ctx.font = 'bold 10px Georgia, serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText( d.tcLabel, 0, 0 );
            ctx.restore();
        } );

        // Flippers.
        this.drawFlipper( this.leftFlipper );
        this.drawFlipper( this.rightFlipper );

        // Balls + their fading motion trails.
        this.balls.forEach( function ( b ) {
            var trail = b.tcTrail;
            for ( var ti = 0; ti < trail.length - 1; ti++ ) {
                var tp = trail[ ti ], tf = ti / trail.length;
                ctx.globalAlpha = tf * 0.35;
                ctx.fillStyle = COLORS.ball;
                ctx.beginPath();
                ctx.arc( tp.x, tp.y, BALL_R * ( 0.35 + 0.55 * tf ), 0, Math.PI * 2 );
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            ctx.save();
            ctx.shadowColor = COLORS.ballShine;
            ctx.shadowBlur  = 3;
            var bg2 = ctx.createRadialGradient(
                b.position.x - 3, b.position.y - 3, 1,
                b.position.x, b.position.y, BALL_R
            );
            bg2.addColorStop( 0, COLORS.ballShine );
            bg2.addColorStop( 0.45, COLORS.ball );
            bg2.addColorStop( 1, COLORS.ballRim );
            ctx.fillStyle = bg2;
            ctx.beginPath();
            ctx.arc( b.position.x, b.position.y, BALL_R, 0, Math.PI * 2 );
            ctx.fill();
            ctx.restore();
        } );

        // Sparks — bumper-hit particles, fading as they fly.
        this.sparks.forEach( function ( sp ) {
            ctx.globalAlpha = Math.max( 0, sp.life );
            ctx.fillStyle = sp.color;
            ctx.beginPath();
            ctx.arc( sp.x, sp.y, 2.2 * sp.life + 0.6, 0, Math.PI * 2 );
            ctx.fill();
        } );
        ctx.globalAlpha = 1;

        // Plunger charge meter — thin vertical bar in the shooter lane.
        if ( this.plungerActive ) {
            ctx.fillStyle = COLORS.hud;
            ctx.fillRect( TABLE_W - 32, TABLE_H - 16,
                          14, -120 * this.plungerCharge );
        }

        ctx.restore(); // end screen-shake transform
    };

    function labelOfRamp( label ) {
        if ( label === 'ramp:link' )  return 'Link';
        if ( label === 'ramp:ganon' ) return 'Ganon';
        if ( label === 'ramp:zelda' ) return 'Zelda';
        if ( label === 'ramp:impa' )  return 'Impa';
        return '';
    }

    // A post's colour by hit count — it jumps through BOLD, saturated hues
    // so each hit really reads as a colour change, then locks GOLD on the
    // 12th hit. (bright = the lit/highlight tone for the gradient + sparks.)
    var POST_HUES = [ 187, 217, 258, 288, 318, 344, 8, 28, 52, 96, 146, 172 ];
    function bumperColor( hits ) {
        if ( hits >= 12 ) return '#f5c33a';
        return 'hsl(' + POST_HUES[ hits ] + ', 95%, 56%)';
    }
    function bumperBrightColor( hits ) {
        if ( hits >= 12 ) return '#ffe79a';
        return 'hsl(' + POST_HUES[ hits ] + ', 100%, 78%)';
    }

    // Trace a rounded rectangle (body-local). Shared by the walls.
    function roundRectPath( ctx, x, y, w, h, r ) {
        ctx.beginPath();
        ctx.moveTo( x + r, y );
        ctx.lineTo( x + w - r, y );
        ctx.quadraticCurveTo( x + w, y, x + w, y + r );
        ctx.lineTo( x + w, y + h - r );
        ctx.quadraticCurveTo( x + w, y + h, x + w - r, y + h );
        ctx.lineTo( x + r, y + h );
        ctx.quadraticCurveTo( x, y + h, x, y + h - r );
        ctx.lineTo( x, y + r );
        ctx.quadraticCurveTo( x, y, x + r, y );
        ctx.closePath();
    }

    Pinball.prototype.drawWall = function ( b, ctxOverride ) {
        var ctx = ctxOverride || this.ctx;
        // True body-local extents. Using the AABB (b.bounds) inflated every
        // ROTATED wall into a fat block — that's what read as "blocky". Pull
        // the real width/height from the vertices instead, like drawRect.
        var cosA = Math.cos( -b.angle ), sinA = Math.sin( -b.angle );
        var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        b.vertices.forEach( function ( v ) {
            var dx = v.x - b.position.x, dy = v.y - b.position.y;
            var lx = dx * cosA - dy * sinA;
            var ly = dx * sinA + dy * cosA;
            if ( lx < minX ) minX = lx;
            if ( lx > maxX ) maxX = lx;
            if ( ly < minY ) minY = ly;
            if ( ly > maxY ) maxY = ly;
        } );
        var w = maxX - minX, h = maxY - minY;
        ctx.save();
        ctx.translate( b.position.x, b.position.y );
        ctx.rotate( b.angle );
        // Tubular wood shade: lit edge → core → lit edge, so a rail reads
        // as rounded rather than a flat slab.
        var grad = ctx.createLinearGradient( 0, -h / 2, 0, h / 2 );
        grad.addColorStop( 0,   COLORS.wallShine );
        grad.addColorStop( 0.5, COLORS.wall );
        grad.addColorStop( 1,   COLORS.wallShine );
        ctx.fillStyle = grad;
        roundRectPath( ctx, -w / 2, -h / 2, w, h, Math.min( h / 2, 6 ) );
        ctx.fill();
        ctx.restore();
    };

    Pinball.prototype.drawRect = function ( body, color ) {
        var ctx = this.ctx;
        ctx.save();
        ctx.translate( body.position.x, body.position.y );
        ctx.rotate( body.angle );
        ctx.fillStyle = color;
        var w = body.bounds.max.x - body.bounds.min.x;
        var h = body.bounds.max.y - body.bounds.min.y;
        // Recompute width/height in body-local space because rotation
        // inflates the AABB. Use vertices instead.
        var vs = body.vertices;
        var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        // Convert vertices back to body-local space.
        var cosA = Math.cos( -body.angle ), sinA = Math.sin( -body.angle );
        vs.forEach( function ( v ) {
            var dx = v.x - body.position.x, dy = v.y - body.position.y;
            var lx = dx * cosA - dy * sinA;
            var ly = dx * sinA + dy * cosA;
            if ( lx < minX ) minX = lx;
            if ( lx > maxX ) maxX = lx;
            if ( ly < minY ) minY = ly;
            if ( ly > maxY ) maxY = ly;
        } );
        ctx.shadowColor = color;
        ctx.shadowBlur  = 4;
        roundRectPath( ctx, minX, minY, maxX - minX, maxY - minY, 4 );
        ctx.fill();
        ctx.restore();
    };

    Pinball.prototype.drawRectLabel = function ( body, label ) {
        var ctx = this.ctx;
        ctx.save();
        ctx.translate( body.position.x, body.position.y );
        ctx.rotate( body.angle );
        ctx.fillStyle = '#0a0814';
        ctx.font = 'bold 9px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText( label, 0, 0 );
        ctx.restore();
    };

    Pinball.prototype.drawFlipper = function ( body ) {
        var ctx = this.ctx;
        ctx.save();
        ctx.translate( body.position.x, body.position.y );
        ctx.rotate( body.angle );
        var grad = ctx.createLinearGradient( 0, -8, 0, 8 );
        grad.addColorStop( 0, COLORS.flipperShine );
        grad.addColorStop( 1, COLORS.flipper );
        ctx.fillStyle = grad;
        // Rounded rectangle 104×14 (matches the thinner flipper body)
        var w = 104, h = 14, r = 5;
        ctx.beginPath();
        ctx.moveTo( -w / 2 + r, -h / 2 );
        ctx.lineTo(  w / 2 - r, -h / 2 );
        ctx.quadraticCurveTo( w / 2, -h / 2, w / 2, -h / 2 + r );
        ctx.lineTo(  w / 2, h / 2 - r );
        ctx.quadraticCurveTo( w / 2, h / 2, w / 2 - r, h / 2 );
        ctx.lineTo( -w / 2 + r, h / 2 );
        ctx.quadraticCurveTo( -w / 2, h / 2, -w / 2, h / 2 - r );
        ctx.lineTo( -w / 2, -h / 2 + r );
        ctx.quadraticCurveTo( -w / 2, -h / 2, -w / 2 + r, -h / 2 );
        ctx.fill();
        ctx.restore();
    };

    // ================================================================
    // WEBGL RENDERER (PixiJS) — Phase 1b. Same Matter physics + game
    // logic; only the drawing layer differs. The scene mirrors the
    // Canvas2D render() exactly, then layers on real GlowFilter bloom.
    //
    // Strategy: bake the static stuff (felt + spotlight + vignette +
    // walls) into one texture; build per-element display objects for
    // the things that move (flippers, ball, trail) or change colour
    // (ramps via .tint); redraw the cheap immediate-mode shapes
    // (bumpers, slingshots, drop targets, sparks, plunger) each frame.
    // Pixi's autoStart is off — we call app.render() from our tick().
    // ================================================================

    // A rounded rect centred on its own origin (for transform-driven
    // elements like ramps, drawn white so .tint sets the colour).
    function localRoundRect( w, h, r, color, alpha ) {
        var g = new PIXI.Graphics();
        g.beginFill( color, alpha == null ? 1 : alpha );
        g.drawRoundedRect( -w / 2, -h / 2, w, h, r );
        g.endFill();
        return g;
    }

    // A flipper: a neon energy bar (spacey), thinner + wedge-shaped — full
    // height at the hinge end, tapering to the tip. `s` is the tip direction
    // (+1 = tip toward +x, -1 = toward -x). Centred on its origin so we can
    // drive it by the Matter body's position/angle.
    function makeFlipperGfx( s ) {
        var g = new PIXI.Graphics();
        // hinge end (full ±7) at -52*s, tip (±3.5) at +52*s.
        var pts = [ -52 * s, -7, 52 * s, -3.5, 52 * s, 3.5, -52 * s, 7 ];
        g.beginFill( colorToNum( SPACE.flipper ), 1 );
        g.drawPolygon( pts ); g.endFill();
        g.beginFill( 0xffffff, 0.5 ); // top highlight band
        g.drawPolygon( [ -52 * s, -7, 52 * s, -3.5, 52 * s, -0.5, -52 * s, -2 ] ); g.endFill();
        g.lineStyle( 1.5, 0xffffff, 0.65 );
        g.drawPolygon( pts ); g.lineStyle( 0 );
        return g;
    }

    // The ball, baked once as a glassy radial-gradient sphere texture
    // (super-sampled 4× then downscaled for a smooth edge). Reused for
    // the motion-trail sprites too.
    function makeBallTexture() {
        var SS = 4, d = BALL_R * 2 * SS, r = BALL_R * SS;
        var c = document.createElement( 'canvas' ); c.width = c.height = d;
        var x = c.getContext( '2d' );
        var g = x.createRadialGradient( r - 3 * SS, r - 3 * SS, 1, r, r, r );
        g.addColorStop( 0, COLORS.ballShine );
        g.addColorStop( 0.45, COLORS.ball );
        g.addColorStop( 1, COLORS.ballRim );
        x.fillStyle = g;
        x.beginPath(); x.arc( r, r, r, 0, Math.PI * 2 ); x.fill();
        return PIXI.Texture.from( c );
    }

    // Paint the spacey background into a 2D context (uploaded as the bg
    // texture). `tier` (score / 10,000) shifts the felt + nebula colour, so
    // the table changes "sector" as the score climbs. Walls are baked in too
    // (they never move). Repainted only when the tier changes.
    Pinball.prototype.paintBackground = function ( ctx, tier ) {
        var T = FELT_TIERS[ tier ] || FELT_TIERS[ 0 ];
        ctx.clearRect( 0, 0, TABLE_W, TABLE_H );

        // Deep-space radial felt.
        var bg = ctx.createRadialGradient( TABLE_W / 2, TABLE_H * 0.4, 40,
                                           TABLE_W / 2, TABLE_H * 0.5, TABLE_W * 0.85 );
        bg.addColorStop( 0, T.inner );
        bg.addColorStop( 1, T.outer );
        ctx.fillStyle = bg; ctx.fillRect( 0, 0, TABLE_W, TABLE_H );

        // Two soft nebula clouds.
        [ [ 0.34, 0.30, 380, 0.33 ], [ 0.72, 0.62, 300, 0.22 ] ].forEach( function ( c ) {
            var g = ctx.createRadialGradient( TABLE_W * c[ 0 ], TABLE_H * c[ 1 ], 20,
                                              TABLE_W * c[ 0 ], TABLE_H * c[ 1 ], c[ 2 ] );
            g.addColorStop( 0, hexA( T.nebula, c[ 3 ] ) );
            g.addColorStop( 1, hexA( T.nebula, 0 ) );
            ctx.fillStyle = g; ctx.fillRect( 0, 0, TABLE_W, TABLE_H );
        } );

        // Starfield (fixed positions so it doesn't twinkle on repaint).
        if ( this.stars ) {
            this.stars.forEach( function ( s ) {
                ctx.globalAlpha = s.a;
                ctx.fillStyle = '#ffffff';
                ctx.beginPath(); ctx.arc( s.x, s.y, s.r, 0, Math.PI * 2 ); ctx.fill();
            } );
            ctx.globalAlpha = 1;
        }

        // Vignette.
        var vg = ctx.createRadialGradient( TABLE_W / 2, TABLE_H * 0.45, TABLE_H * 0.34,
                                           TABLE_W / 2, TABLE_H * 0.5, TABLE_W * 0.62 );
        vg.addColorStop( 0, 'rgba(0,0,0,0)' );
        vg.addColorStop( 1, 'rgba(0,0,0,0.55)' );
        ctx.fillStyle = vg; ctx.fillRect( 0, 0, TABLE_W, TABLE_H );

        // Spacey metal rails (neon edge) instead of wood.
        var self = this;
        Composite.allBodies( this.engine.world ).forEach( function ( b ) {
            if ( b.label === 'wall' ) self.drawSpaceWall( ctx, b );
        } );
    };

    // A wall as a dark metal rail with a neon edge (the spacey replacement
    // for drawWall's wood). Same body-local extent math as drawWall.
    Pinball.prototype.drawSpaceWall = function ( ctx, b ) {
        var cosA = Math.cos( -b.angle ), sinA = Math.sin( -b.angle );
        var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        b.vertices.forEach( function ( v ) {
            var dx = v.x - b.position.x, dy = v.y - b.position.y;
            var lx = dx * cosA - dy * sinA, ly = dx * sinA + dy * cosA;
            if ( lx < minX ) minX = lx;
            if ( lx > maxX ) maxX = lx;
            if ( ly < minY ) minY = ly;
            if ( ly > maxY ) maxY = ly;
        } );
        var w = maxX - minX, h = maxY - minY;
        ctx.save();
        ctx.translate( b.position.x, b.position.y );
        ctx.rotate( b.angle );
        var grad = ctx.createLinearGradient( 0, -h / 2, 0, h / 2 );
        grad.addColorStop( 0,   SPACE.wall0 );
        grad.addColorStop( 0.5, SPACE.wall1 );
        grad.addColorStop( 1,   SPACE.wall2 );
        ctx.fillStyle = grad;
        roundRectPath( ctx, -w / 2, -h / 2, w, h, Math.min( h / 2, 6 ) );
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = SPACE.wallEdge;
        roundRectPath( ctx, -w / 2, -h / 2, w, h, Math.min( h / 2, 6 ) );
        ctx.stroke();
        ctx.restore();
    };

    Pinball.prototype.buildPixiScene = function () {
        var P = window.PIXI;
        var self = this;

        var app = new P.Application( {
            view: this.canvas,
            width: TABLE_W,
            height: TABLE_H,
            antialias: true,
            backgroundColor: colorToNum( FELT_TIERS[ 0 ].outer ),
            backgroundAlpha: 1,
            resolution: Math.min( window.devicePixelRatio || 1, 2 ),
            autoDensity: false,   // CSS (.tc-pinball__canvas) controls display size
            autoStart: false,     // we drive render() from tick()
            powerPreference: 'high-performance',
        } );
        this.app = app;
        var stage = app.stage;

        var Glow = P.filters && P.filters.GlowFilter;
        // Make a GlowFilter (or null if pixi-filters didn't load). Starts at
        // strength 0 — it's impact-triggered, pulsed up in renderPixi.
        function mkGlow( distance, colorCss ) {
            return Glow ? new Glow( {
                distance: distance, outerStrength: 0, innerStrength: 0,
                color: colorToNum( colorCss ), quality: 0.25,
            } ) : null;
        }

        // ---- Score-reactive starfield background. Fixed star positions so
        // the field doesn't twinkle when the texture is repainted per sector.
        this.stars = [];
        for ( var si = 0; si < 90; si++ ) {
            this.stars.push( {
                x: Math.random() * TABLE_W, y: Math.random() * TABLE_H,
                r: Math.random() * 1.3 + 0.3, a: Math.random() * 0.6 + 0.22,
            } );
        }
        var bgCanvas = document.createElement( 'canvas' );
        bgCanvas.width = TABLE_W; bgCanvas.height = TABLE_H;
        var bgCtx = bgCanvas.getContext( '2d' );
        this.bgTier = 0;
        this.paintBackground( bgCtx, 0 );
        var bgTex = P.Texture.from( bgCanvas );
        var bgSprite = new P.Sprite( bgTex );
        stage.addChild( bgSprite );

        // Dynamic playfield under shakeRoot (nudge jitters this, not the felt).
        var shakeRoot = new P.Container();
        stage.addChild( shakeRoot );
        this.pixi = {
            app: app, shakeRoot: shakeRoot,
            bgCtx: bgCtx, bgTex: bgTex,
        };

        // Ramps — white rounded rects, tinted per frame; each carries its own
        // impact glow (so only a freshly-hit ramp lights up).
        var rampsBox = new P.Container();
        this.pixi.rampGfx = this.ramps.map( function ( r ) {
            var g = localRoundRect( 84, 10, 4, 0xffffff, 1 );
            g.position.set( r.position.x, r.position.y );
            g.rotation = r.angle;
            g.tint = colorToNum( r.tcColor );
            g.tcGlow = mkGlow( 14, r.tcColor );
            g.tcGlowArr = g.tcGlow ? [ g.tcGlow ] : null;
            rampsBox.addChild( g );
            return g;
        } );
        shakeRoot.addChild( rampsBox );

        // Labels — bigger, white, dark-outlined, 2× resolution for crispness.
        var rampLabelStyle = new P.TextStyle( {
            fontFamily: 'Georgia, serif', fontSize: 15, fontWeight: 'bold',
            fill: 0xffffff, stroke: 0x05030f, strokeThickness: 4,
        } );
        this.pixi.rampLabels = this.ramps.map( function ( r ) {
            var t = new P.Text( labelOfRamp( r.label ), rampLabelStyle );
            t.resolution = 2; t.anchor.set( 0.5 );
            t.position.set( r.position.x, r.position.y ); t.rotation = r.angle;
            shakeRoot.addChild( t ); return t;
        } );

        // Slingshots — one Graphics each, own impact glow.
        var slingsBox = new P.Container();
        this.pixi.slingGfx = this.slingshots.map( function () {
            var g = new P.Graphics();
            g.tcGlow = mkGlow( 12, COLORS.bumperBright );
            g.tcGlowArr = g.tcGlow ? [ g.tcGlow ] : null;
            slingsBox.addChild( g );
            return g;
        } );
        shakeRoot.addChild( slingsBox );

        // Bumpers — one Graphics each, own impact glow.
        var bumpersBox = new P.Container();
        this.pixi.bumperGfx = this.bumpers.map( function () {
            var g = new P.Graphics();
            g.tcGlow = mkGlow( 16, '#bfefff' );
            g.tcGlowArr = g.tcGlow ? [ g.tcGlow ] : null;
            bumpersBox.addChild( g );
            return g;
        } );
        shakeRoot.addChild( bumpersBox );

        // Pins — one Graphics each, own impact glow.
        var pegsBox = new P.Container();
        this.pixi.pegGfx = this.pegs.map( function () {
            var g = new P.Graphics();
            g.tcGlow = mkGlow( 9, '#fff3d0' );
            g.tcGlowArr = g.tcGlow ? [ g.tcGlow ] : null;
            pegsBox.addChild( g );
            return g;
        } );
        shakeRoot.addChild( pegsBox );

        // Side-guards — drawn only when raised; constant cyan glow.
        var gatesG = new P.Graphics();
        if ( Glow ) gatesG.filters = [ new Glow( {
            distance: 12, outerStrength: 1.7, innerStrength: 0,
            color: colorToNum( COLORS.bumperBright ), quality: 0.3,
        } ) ];
        shakeRoot.addChild( gatesG ); this.pixi.gatesG = gatesG;

        // Drop targets + labels.
        var dropsG = new P.Graphics();
        shakeRoot.addChild( dropsG ); this.pixi.dropsG = dropsG;
        var dropLabelStyle = new P.TextStyle( {
            fontFamily: 'Georgia, serif', fontSize: 13, fontWeight: 'bold',
            fill: 0xffffff, stroke: 0x05030f, strokeThickness: 3,
        } );
        this.pixi.dropLabels = this.dropTargets.map( function ( d ) {
            var t = new P.Text( d.tcLabel, dropLabelStyle );
            t.resolution = 2; t.anchor.set( 0.5 );
            t.position.set( d.position.x, d.position.y );
            shakeRoot.addChild( t ); return t;
        } );

        // Flippers — neon energy bars with a constant gentle glow.
        var flippersBox = new P.Container();
        if ( Glow ) flippersBox.filters = [ new Glow( {
            distance: 10, outerStrength: 1.2, innerStrength: 0,
            color: colorToNum( SPACE.flipper ), quality: 0.25,
        } ) ];
        // Left flipper pivots at its -x end (hinge offset -52) so its tip is
        // toward +x; the right is mirrored.
        this.pixi.flipperGfx = { left: makeFlipperGfx( 1 ), right: makeFlipperGfx( -1 ) };
        flippersBox.addChild( this.pixi.flipperGfx.left, this.pixi.flipperGfx.right );
        shakeRoot.addChild( flippersBox );

        // Ball texture → per-ball trail pools + ball sprites (one set per
        // possible ball, for multiball). All start hidden; renderPixi shows
        // the ones in use.
        var ballTex = makeBallTexture();
        this.pixi.ballTex = ballTex;
        var trailsC = new P.Container(), ballsC = new P.Container();
        this.pixi.trailPools = [];
        this.pixi.ballSprites = [];
        for ( var mb = 0; mb < MAX_BALLS; mb++ ) {
            var trailBox = new P.Container(), pool = [];
            for ( var i = 0; i < 9; i++ ) {
                var ts = new P.Sprite( ballTex );
                ts.anchor.set( 0.5 ); ts.visible = false;
                trailBox.addChild( ts ); pool.push( ts );
            }
            trailsC.addChild( trailBox );
            this.pixi.trailPools.push( pool );

            var bspr = new P.Sprite( ballTex );
            bspr.anchor.set( 0.5 );
            bspr.width = bspr.height = BALL_R * 2;
            bspr.visible = false;
            if ( Glow ) bspr.filters = [ new Glow( {
                distance: 16, outerStrength: 1.6, innerStrength: 0,
                color: colorToNum( COLORS.ballShine ), quality: 0.3,
            } ) ];
            ballsC.addChild( bspr );
            this.pixi.ballSprites.push( bspr );
        }
        shakeRoot.addChild( trailsC );
        shakeRoot.addChild( ballsC );

        // Sparks (own glow, always lit — they're impact bursts) + plunger.
        var sparksG = new P.Graphics();
        if ( Glow ) sparksG.filters = [ new Glow( {
            distance: 8, outerStrength: 2.0, innerStrength: 0,
            color: 0xffffff, quality: 0.3,
        } ) ];
        shakeRoot.addChild( sparksG ); this.pixi.sparksG = sparksG;

        var plungerG = new P.Graphics();
        shakeRoot.addChild( plungerG ); this.pixi.plungerG = plungerG;

        // Paint frame one so the table isn't blank for a tick.
        this.renderPixi();
    };

    // Per-frame scene sync — reads Matter bodies + game state, updates the
    // Pixi display objects, then renders. Mirrors render()'s element order.
    Pinball.prototype.renderPixi = function () {
        var px = this.pixi;
        if ( ! px ) return;
        var now = performance.now();
        var self = this;

        // Score-reactive background — repaint the felt+nebula when the score
        // crosses a 10k "sector" boundary.
        var tier = Math.min( Math.floor( this.score / 10000 ), FELT_TIERS.length - 1 );
        if ( tier !== this.bgTier ) {
            this.bgTier = tier;
            this.paintBackground( px.bgCtx, tier );
            px.bgTex.update();
            SFX.sector();
            this.flashBanner( 'Sector ' + ( tier + 1 ) + ' — ' + SECTOR_NAMES[ tier ], 2200 );
        }

        // Screen-shake (felt stays; shakeRoot jitters).
        var shx = 0, shy = 0;
        if ( this.shake && now < this.shake.until ) {
            var sk = ( this.shake.until - now ) / 130;
            shx = this.shake.x * sk * ( 0.4 + Math.random() * 0.6 );
            shy = this.shake.y * sk * ( 0.4 + Math.random() * 0.6 );
        }
        px.shakeRoot.position.set( shx, shy );

        // Ramps — tint flips bright on flash; glow pulses on impact.
        this.ramps.forEach( function ( r, i ) {
            var g = px.rampGfx[ i ];
            g.tint = ( r.tcFlashUntil > now )
                ? colorToNum( COLORS.bumperBright ) : colorToNum( r.tcColor );
            setGlow( g, GLOW_SPIKE * impactAmt( r.tcFlashUntil, now, 220 ) );
        } );

        // Slingshots — slate body + a "rubber band" on the kicker face
        // (tcVerts[0]→[1]); glow pulses on impact.
        this.slingshots.forEach( function ( s, i ) {
            var g = px.slingGfx[ i ]; g.clear();
            var flash = s.tcFlashUntil > now, v = s.tcVerts;
            var pts = [ v[ 0 ].x, v[ 0 ].y, v[ 1 ].x, v[ 1 ].y, v[ 2 ].x, v[ 2 ].y ];
            g.beginFill( SPACE.slingBody, 1 ); g.drawPolygon( pts ); g.endFill();
            g.lineStyle( 1.5, SPACE.slingEdge, 1 ); g.drawPolygon( pts ); g.lineStyle( 0 );
            g.lineStyle( 4, colorToNum( flash ? '#ffffff' : COLORS.bumperBright ), 1 );
            g.moveTo( v[ 0 ].x, v[ 0 ].y ); g.lineTo( v[ 1 ].x, v[ 1 ].y ); g.lineStyle( 0 );
            setGlow( g, GLOW_SPIKE * impactAmt( s.tcFlashUntil, now, 140 ) );
        } );

        // Bumpers — pop-bumpers (socket, ring, body, cap, pulsing core,
        // specular); glow spikes electric on impact.
        var bonusRings = this.score >= 30000;
        this.bumpers.forEach( function ( bp, bi ) {
            var g = px.bumperGfx[ bi ]; g.clear();
            var flash = bp.tcFlashUntil > now;
            var hits = self.bumperHits[ bp.tcName ] || 0;
            var gold = hits >= 12;
            var baseN = colorToNum( flash ? COLORS.bumperBright : bumperColor( hits ) );
            var brightN = colorToNum( bumperBrightColor( hits ) );
            var rad = bp.circleRadius, x = bp.position.x, y = bp.position.y;
            var pulse = 0.5 + 0.5 * Math.sin( now / 320 + bi * 1.7 );
            // Bonus rings — gold posts ripple once you pass 30k.
            if ( gold && bonusRings ) {
                for ( var ri = 0; ri < 2; ri++ ) {
                    var ph = ( ( now / 700 + ri * 0.5 ) % 1 );
                    g.lineStyle( 2, 0xffe79a, ( 1 - ph ) * 0.85 );
                    g.drawCircle( x, y, rad + 3 + ph * 16 );
                }
                g.lineStyle( 0 );
            }
            g.beginFill( 0x05030f, 0.85 ); g.drawCircle( x, y, rad + 2.5 ); g.endFill();
            g.beginFill( brightN, 0.32 );  g.drawCircle( x, y, rad + 1 );   g.endFill();
            g.beginFill( baseN, 1 );       g.drawCircle( x, y, rad );        g.endFill();
            g.lineStyle( 2.5, flash ? 0xffffff : brightN, 1 );
            g.drawCircle( x, y, rad - 1 ); g.lineStyle( 0 );
            g.beginFill( brightN, flash ? 0.95 : ( 0.3 + 0.4 * pulse ) );
            g.drawCircle( x, y, rad * ( 0.42 + 0.12 * pulse ) ); g.endFill();
            g.beginFill( 0xffffff, 0.8 );
            g.drawCircle( x - rad * 0.32, y - rad * 0.34, rad * 0.22 ); g.endFill();
            // Gold posts stay glowing (constant), spiking brighter on impact;
            // their glow runs warm gold rather than electric cyan.
            if ( g.tcGlow ) g.tcGlow.color = colorToNum( gold ? '#ffe79a' : '#bfefff' );
            var amt = GLOW_SPIKE * impactAmt( bp.tcFlashUntil, now, 160 );
            if ( gold ) amt = Math.max( amt, 2.2 );
            setGlow( g, amt );
        } );

        // Pins — two-state switches: ON = bright lit gold (faint constant
        // glow), OFF = dark stud. Glow spikes on impact.
        this.pegs.forEach( function ( p, i ) {
            var g = px.pegGfx[ i ]; g.clear();
            var flash = p.tcFlashUntil > now, on = p.tcOn;
            var r = p.circleRadius, x = p.position.x, y = p.position.y;
            var faceN = colorToNum( flash ? '#ffffff' : ( on ? COLORS.dropTarget : '#4a3c20' ) );
            var rimN  = colorToNum( flash ? '#ffffff' : ( on ? '#fff3d0' : '#2c2412' ) );
            g.beginFill( 0x05030f, 0.85 ); g.drawCircle( x, y, r + 1.5 ); g.endFill();
            g.beginFill( faceN, 1 ); g.drawCircle( x, y, r ); g.endFill();
            g.lineStyle( 1.5, rimN, 1 ); g.drawCircle( x, y, r - 0.5 ); g.lineStyle( 0 );
            g.beginFill( 0xffffff, on ? 0.75 : 0.3 );
            g.drawCircle( x - r * 0.3, y - r * 0.3, r * 0.32 ); g.endFill();
            var pamt = GLOW_SPIKE * impactAmt( p.tcFlashUntil, now, 140 );
            if ( on ) pamt = Math.max( pamt, 0.9 ); // lit pegs keep a soft glow
            setGlow( g, pamt );
        } );

        // Side-guards — only drawn when raised (all pegs aligned).
        var gatesG = px.gatesG; gatesG.clear();
        if ( this.gatesActive ) {
            this.gates.forEach( function ( gt ) {
                var pts = []; gt.vertices.forEach( function ( v ) { pts.push( v.x, v.y ); } );
                gatesG.beginFill( colorToNum( COLORS.bumperBright ), 0.9 );
                gatesG.drawPolygon( pts ); gatesG.endFill();
                gatesG.lineStyle( 2, 0xffffff, 1 ); gatesG.drawPolygon( pts ); gatesG.lineStyle( 0 );
            } );
        }

        // Drop targets — dim when dropped; bright flash on hit.
        var dropsG = px.dropsG; dropsG.clear();
        this.dropTargets.forEach( function ( d, i ) {
            var flash = d.tcFlashUntil > now, label = px.dropLabels[ i ];
            var fillN;
            if ( d.tcDropped ) { fillN = colorToNum( COLORS.dropTargetOff ); if ( label ) label.alpha = 0.55; }
            else { fillN = colorToNum( flash ? '#ffffff' : COLORS.dropTarget ); if ( label ) label.alpha = 1; }
            dropsG.beginFill( fillN, 1 );
            dropsG.drawRoundedRect( d.position.x - 32, d.position.y - 7, 64, 14, 4 );
            dropsG.endFill();
        } );

        // Flippers — transform-driven.
        var lf = this.leftFlipper, rf = this.rightFlipper;
        px.flipperGfx.left.position.set( lf.position.x, lf.position.y );
        px.flipperGfx.left.rotation = lf.angle;
        px.flipperGfx.right.position.set( rf.position.x, rf.position.y );
        px.flipperGfx.right.rotation = rf.angle;

        // Balls + their fading trails (one sprite/pool slot per possible ball).
        for ( var mbi = 0; mbi < px.ballSprites.length; mbi++ ) {
            var bspr = px.ballSprites[ mbi ], pool = px.trailPools[ mbi ];
            var ball = this.balls[ mbi ];
            if ( ball ) {
                bspr.visible = true;
                bspr.position.set( ball.position.x, ball.position.y );
                var trail = ball.tcTrail, tlen = trail.length;
                for ( var ti = 0; ti < pool.length; ti++ ) {
                    var spr = pool[ ti ];
                    if ( ti < tlen - 1 ) {
                        var tp = trail[ ti ], tf = ti / tlen;
                        spr.visible = true;
                        spr.position.set( tp.x, tp.y );
                        spr.alpha = tf * 0.35;
                        spr.width = spr.height = BALL_R * ( 0.35 + 0.55 * tf ) * 2;
                    } else {
                        spr.visible = false;
                    }
                }
            } else {
                bspr.visible = false;
                for ( var ti2 = 0; ti2 < pool.length; ti2++ ) pool[ ti2 ].visible = false;
            }
        }

        // Sparks.
        var sparksG = px.sparksG; sparksG.clear();
        this.sparks.forEach( function ( sp ) {
            sparksG.beginFill( colorToNum( sp.color ), Math.max( 0, sp.life ) );
            sparksG.drawCircle( sp.x, sp.y, 2.2 * sp.life + 0.6 );
            sparksG.endFill();
        } );

        // Plunger charge meter.
        var plungerG = px.plungerG; plungerG.clear();
        if ( this.plungerActive ) {
            var h = 120 * this.plungerCharge;
            plungerG.beginFill( colorToNum( COLORS.hud ), 1 );
            plungerG.drawRect( TABLE_W - 32, TABLE_H - 16 - h, 14, h );
            plungerG.endFill();
        }

        this.app.render();
    };

    // Free the Pixi app + GPU resources. Idempotent.
    Pinball.prototype.teardownPixi = function () {
        if ( this.app ) {
            try {
                this.app.destroy( false, { children: true, texture: true, baseTexture: true } );
            } catch ( e ) {}
            this.app = null;
        }
        this.pixi = null;
    };

    // ================================================================
    // DESTROY — tear down listeners, remove the overlay, restore the
    // drawer to its quiet state. Idempotent.
    Pinball.prototype.destroy = function () {
        if ( ! this.running ) return;
        this.running = false;
        stopMusic();
        document.removeEventListener( 'keydown', this.onKey );
        document.removeEventListener( 'keyup',   this.onKey );
        if ( this.canvas ) {
            this.canvas.removeEventListener( 'touchstart', this.onTouchStart );
            this.canvas.removeEventListener( 'touchend',   this.onTouchEnd );
            this.canvas.removeEventListener( 'touchcancel', this.onTouchEnd );
        }
        if ( this.engine ) {
            World.clear( this.engine.world, false );
            Engine.clear( this.engine );
        }
        // Free the WebGL context + textures before pulling the canvas.
        if ( this.app ) this.teardownPixi();
        if ( this.root && this.root.parentNode ) {
            this.root.parentNode.removeChild( this.root );
        }
        // Restore the body scroll-lock that boot() set.
        document.body.style.overflow = this.prevBodyOverflow || '';
        if ( this.footer ) this.footer.classList.remove( 'is-pinball' );
        if ( current === this ) current = null;
    };

} )();
