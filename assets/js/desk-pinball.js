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

    // GlowFilter tuning for the WebGL renderer — per bright element group.
    // distance = glow reach (px), outerStrength = intensity. Kept modest so
    // the table reads as "lit", not blown out; Thomas tunes the look live.
    var GLOW = {
        ramp:     { distance: 12, outerStrength: 1.5, innerStrength: 0, quality: 0.3 },
        sling:    { distance: 10, outerStrength: 1.4, innerStrength: 0, quality: 0.3 },
        bumper:   { distance: 16, outerStrength: 2.2, innerStrength: 0, quality: 0.35 },
        peg:      { distance: 9,  outerStrength: 1.6, innerStrength: 0, quality: 0.3 },
        ball:     { distance: 14, outerStrength: 2.0, innerStrength: 0, quality: 0.4 },
        spark:    { distance: 8,  outerStrength: 2.2, innerStrength: 0, quality: 0.3 },
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
        this.ballTrail = [];  // recent ball positions for a motion trail

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
        var bumperLabels = [
            { x: 200, y: 220, name: 'mug',    story: "Patience picked this Charlie Brown mug." },
            { x: 280, y: 280, name: 'spider', story: "Daniel made this with a 3D pen." },
            { x: 360, y: 220, name: 'sticker67', story: "67 — that's Faith's thing." },
            { x: 440, y: 280, name: 'duck',   story: "Daniel started the rubber-duck collection." },
            { x: 520, y: 220, name: 'marble', story: "Same marble that sits in the drawer." },
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
        // Score 25 × mult.
        this.pegs = [];
        var pegSpots = [
            { x: 300, y: 175 }, { x: 360, y: 168 }, { x: 420, y: 175 }, // top arc
            { x: 240, y: 250 }, { x: 480, y: 250 },                     // mid flanks
            { x: 160, y: 235 }, { x: 560, y: 235 },                     // outer
        ];
        pegSpots.forEach( function ( spec ) {
            var p = Bodies.circle( spec.x, spec.y, 6, {
                isStatic: true,
                restitution: 1.25,
                label: 'peg',
                render: { fillStyle: COLORS.dropTarget },
            } );
            p.tcFlashUntil = 0;
            World.add( w, p );
            pinball.pegs.push( p );
        } );

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
        var rampSpecs = [
            { x: 110, y: 130, angle: -0.4, label: 'ramp:link',  color: '#4caf50' }, // green tunic
            { x: 250, y: 110, angle: -0.2, label: 'ramp:ganon', color: '#e0452e' }, // special: double score
            { x: 390, y: 110, angle:  0.2, label: 'ramp:zelda', color: '#e8b923' }, // royal gold
            { x: 530, y: 130, angle:  0.4, label: 'ramp:impa',  color: '#7c6bd6' }, // Sheikah indigo
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
        places.forEach( function ( place, i ) {
            var x = 260 + i * 70;
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
        this.leftFlipper = Bodies.rectangle( 0, 0, 104, 18,
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
        this.rightFlipper = Bodies.rectangle( 0, 0, 104, 18,
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
    // BALL — single ball, parked in the plunger chute until launched.
    Pinball.prototype.spawnBall = function () {
        var w = this.engine.world;
        if ( this.theBall ) {
            World.remove( w, this.theBall );
        }
        var x = TABLE_W - 36;
        var y = TABLE_H - 30;
        this.theBall = Bodies.circle( x, y, BALL_R, {
            density: 0.025,
            restitution: 0.88,
            // Lower air friction so the ball doesn't bleed velocity
            // climbing the chute; previously 0.005 left it arriving
            // at the deflector with too little energy to escape.
            frictionAir: 0.002,
            friction: 0.01,
            label: 'ball',
            render: { fillStyle: COLORS.ball },
        } );
        World.add( w, this.theBall );
        this.plungerCharge = 0;
        this.plungerActive = false;
        this.hcsThisBall = 0;
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
            var k = e.key.toLowerCase();
            if ( e.type === 'keydown' ) {
                if ( k === 'a' )       { self.leftFlipperUp  = true;  e.preventDefault(); }
                if ( k === 'l' || k === 'd' ) { self.rightFlipperUp = true; e.preventDefault(); }
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
        // Only fires if the ball is in the chute and plunger was charging.
        if ( ! this.plungerActive || ! this.theBall ) {
            this.plungerActive = false;
            this.plungerCharge = 0;
            return;
        }
        var b = this.theBall;
        // Only fire if ball is still in the shooter lane (right side,
        // lower half — i.e. resting on the chute floor).
        if ( b.position.x > TABLE_W - 60 && b.position.y > TABLE_H * 0.45 ) {
            // Direct velocity set. Range -13 (tap) to -28 (full charge)
            // px per step. Earlier -8/-18 had the ball arriving at
            // the deflector with not enough energy to enter the
            // playfield — it would flop back into the chute. Bumped
            // to give the launch real authority.
            var vy = -13 - 15 * this.plungerCharge;
            Body.setVelocity( b, { x: 0, y: vy } );
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
        if ( now < this.nudgeUntil ) return;
        this.nudgeUntil = now + 180;
        var vx = 0, vy = 0, sx = 0, sy = 0;
        if ( side === 'left'  ) { vx =  4.4; vy = -1.6; sx = -7; }
        if ( side === 'right' ) { vx = -4.4; vy = -1.6; sx =  7; }
        if ( side === 'up'    ) { vy = -5.8; sy = -8; }
        if ( this.theBall ) {
            Body.setVelocity( this.theBall, {
                x: this.theBall.velocity.x + vx,
                y: this.theBall.velocity.y + vy,
            } );
        }
        this.shake = { x: sx, y: sy, until: now + 130 };
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
                    self.handleDrain();
                } else if ( label.indexOf( 'bumper:' ) === 0 ) {
                    self.handleBumper( other );
                } else if ( label.indexOf( 'slingshot:' ) === 0 ) {
                    self.handleSlingshot( other );
                } else if ( label.indexOf( 'ramp:' ) === 0 ) {
                    self.handleRamp( other );
                } else if ( label.indexOf( 'drop:' ) === 0 ) {
                    self.handleDrop( other );
                } else if ( label === 'peg' ) {
                    self.handlePeg( other );
                }
            } );
        } );
    };

    Pinball.prototype.handlePeg = function ( body ) {
        body.tcFlashUntil = performance.now() + 140;
        this.addScore( 25 );
        this.spawnSparks( body.position.x, body.position.y, COLORS.dropTarget );
        // Small nudge so the peg feels springy (lighter than a bumper).
        if ( this.theBall ) {
            var dir = Vector.normalise( Vector.sub( this.theBall.position, body.position ) );
            Body.applyForce( this.theBall, this.theBall.position,
                { x: dir.x * 0.006, y: dir.y * 0.006 } );
        }
    };

    Pinball.prototype.handleBumper = function ( body ) {
        body.tcFlashUntil = performance.now() + 160;
        this.totalBumperHits++;
        var hits = this.bumperHits[ body.tcName ] = ( this.bumperHits[ body.tcName ] || 0 ) + 1;
        var gold = hits >= 12;
        // A gold post is worth 5× a normal one.
        this.addScore( gold ? 500 : 100 );
        // Apply a small extra impulse to the ball so the bumper feels alive.
        if ( this.theBall ) {
            var dir = Vector.normalise( Vector.sub( this.theBall.position, body.position ) );
            Body.applyForce( this.theBall, this.theBall.position,
                { x: dir.x * 0.012, y: dir.y * 0.012 } );
        }
        // Sparks fly off on every hit, tinted to the post's current colour.
        this.spawnSparks( body.position.x, body.position.y, bumperBrightColor( hits ) );
        // The post jumps through bold hues over its first 12 hits; the 12th
        // locks it GOLD for good — gold posts score 5× AND speed the ball up.
        if ( hits === 12 ) {
            this.goldPosts++;
            this.flashBanner( body.tcName + ' is GOLD — 5× points + speed boost', 2400 );
            // All five posts gold → jackpot.
            if ( this.goldPosts === 5 ) {
                this.score += 25000;
                this.scoreEl.textContent = this.score.toLocaleString();
                this.multiplier = Math.max( this.multiplier, 3 );
                this.multUntil = performance.now() + 20000;
                this.flashBanner( 'ALL FIVE POSTS GOLD — 25,000 + 3× for 20s!', 3600 );
            }
        }
        if ( gold && this.theBall ) {
            var v = this.theBall.velocity;
            Body.setVelocity( this.theBall, { x: v.x * 1.16, y: v.y * 1.16 } );
        }
        // Story-credit easter egg at 10 cumulative hits per object.
        if ( hits === 10 ) {
            this.flashBanner( body.tcStory, 3200 );
        }
    };

    // Spawn a little burst of spark particles at a point.
    Pinball.prototype.spawnSparks = function ( x, y, color ) {
        for ( var i = 0; i < 9; i++ ) {
            var a = Math.random() * Math.PI * 2, sp = 1.8 + Math.random() * 3.2;
            this.sparks.push( {
                x: x, y: y,
                vx: Math.cos( a ) * sp,
                vy: Math.sin( a ) * sp - 1.2,
                life: 1, color: color,
            } );
        }
    };

    Pinball.prototype.handleSlingshot = function ( body ) {
        body.tcFlashUntil = performance.now() + 140;
        this.addScore( 50 );
    };

    Pinball.prototype.handleRamp = function ( body ) {
        body.tcFlashUntil = performance.now() + 220;
        if ( body.label === 'ramp:ganon' ) {
            this.hcsThisBall++;
            this.addScore( 1000 );
            if ( this.hcsThisBall === 3 ) {
                this.flashBanner( 'TILT — Ganon awakens! The Triforce trembles.', 3400 );
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
        this.addScore( 250 );

        // Cleared all 3? Bonus multiplier + reset the row.
        var allDown = this.dropTargets.every( function ( d ) { return d.tcDropped; } );
        if ( allDown ) {
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

    Pinball.prototype.handleDrain = function () {
        if ( this.gameOver ) return;
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

    // ================================================================
    // END GAME — submit if score qualifies; show summary; close.
    Pinball.prototype.endGame = function () {
        this.gameOver = true;
        this.flashBanner( 'Game over — ' + this.score.toLocaleString() + ' points', 2600 );

        var self = this;
        var url = ( window.tcDeskGames && window.tcDeskGames.scoresUrl ) || '/wp-json/tc-games/v1/scores';

        // Quick read first to decide if we should prompt for a name; either
        // way we land on the Play Again / Exit panel.
        fetch( url + '?game=pinball', { credentials: 'same-origin' } )
            .then( function ( r ) { return r.ok ? r.json() : null; } )
            .then( function ( data ) {
                var rows = data
                    ? ( Array.isArray( data ) ? data : ( data.pinball || [] ) )
                    : [];
                var qualifies = self.score > 0 && (
                    rows.length < 10 || self.score > rows[ rows.length - 1 ].score
                );
                if ( ! qualifies ) { self.showEndPanel( null ); return; }
                var name = ( window.prompt(
                    'Top 10! Initials or name (max 16 chars):',
                    'TC'
                ) || '' ).trim();
                if ( ! name ) { self.showEndPanel( null ); return; }
                fetch( url, {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify( {
                        game: 'pinball',
                        name: name.slice( 0, 16 ),
                        score: self.score,
                    } ),
                } )
                .then( function () { self.showEndPanel( 'Saved to the leaderboard.' ); } )
                .catch( function () { self.showEndPanel( 'Could not save score.' ); } );
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
        var row = document.createElement( 'div' );
        row.style.cssText = 'display:flex;gap:14px;margin-top:6px;';
        var self = this;
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
        this.spawnBall();
        this.flashBanner( 'Push Space to launch', 1800 );
    };

    // ================================================================
    // RENDER + TICK.
    Pinball.prototype.tick = function ( ts ) {
        if ( ! this.running ) return;
        var dt = Math.min( 32, ts - this.lastTs );
        this.lastTs = ts;

        // Kinematic flippers — step each toward its target, override
        // the body pose every frame. Must happen BEFORE Engine.update
        // so the new pose is what collisions are resolved against.
        this.driveFlipper( 'left',  this.leftFlipperUp,  dt );
        this.driveFlipper( 'right', this.rightFlipperUp, dt );

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
        if ( this.theBall ) {
            var bv = this.theBall.velocity, bs = Math.hypot( bv.x, bv.y ), BMAX = 26;
            if ( bs > BMAX ) {
                Body.setVelocity( this.theBall, { x: bv.x / bs * BMAX, y: bv.y / bs * BMAX } );
            }
            // Motion trail — a short history of recent spots.
            this.ballTrail.push( { x: this.theBall.position.x, y: this.theBall.position.y } );
            if ( this.ballTrail.length > 9 ) this.ballTrail.shift();
        }

        // Spark particles (bumper hits) — integrate + age out.
        for ( var si = this.sparks.length - 1; si >= 0; si-- ) {
            var sp = this.sparks[ si ];
            sp.x += sp.vx; sp.y += sp.vy; sp.vy += 0.16; sp.life -= 0.045;
            if ( sp.life <= 0 ) this.sparks.splice( si, 1 );
        }

        // Edge cases — ball flew out the top, or is stuck in the trough?
        if ( this.theBall && this.theBall.position.y < -30 ) {
            // Re-spawn in the shooter lane.
            Body.setPosition( this.theBall, { x: TABLE_W - 36, y: TABLE_H - 30 } );
            Body.setVelocity( this.theBall, { x: 0, y: 0 } );
        }

        // Anti-stuck watchdog — if the ball sits nearly motionless in the
        // playfield (not the shooter lane, where it waits for the plunger)
        // for ~3s, give it a small random nudge so it can never wedge for
        // good. Cheap insurance for any geometry corner I haven't tuned.
        if ( this.theBall && ! this.gameOver ) {
            var inLane = this.theBall.position.x > TABLE_W - 60 &&
                         this.theBall.position.y > TABLE_H * 0.45;
            var spd = Math.hypot( this.theBall.velocity.x, this.theBall.velocity.y );
            if ( ! inLane && spd < 0.35 ) {
                this.stuckFrames++;
                if ( this.stuckFrames > 170 ) {
                    Body.setVelocity( this.theBall, {
                        x: ( Math.random() - 0.5 ) * 5,
                        y: -3 - Math.random() * 3,
                    } );
                    this.stuckFrames = 0;
                }
            } else {
                this.stuckFrames = 0;
            }
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

        // Pins — small gold studs.
        this.pegs.forEach( function ( p ) {
            var flash = p.tcFlashUntil > now;
            var r = p.circleRadius, x = p.position.x, y = p.position.y;
            ctx.save();
            ctx.shadowColor = COLORS.dropTarget;
            ctx.shadowBlur  = flash ? 8 : 3;
            var g = ctx.createRadialGradient( x - r * 0.3, y - r * 0.3, 1, x, y, r );
            g.addColorStop( 0, '#fff3d0' );
            g.addColorStop( 1, flash ? '#ffffff' : COLORS.dropTarget );
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc( x, y, r, 0, Math.PI * 2 );
            ctx.fill();
            ctx.restore();
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.beginPath();
            ctx.arc( x - r * 0.3, y - r * 0.3, r * 0.3, 0, Math.PI * 2 );
            ctx.fill();
        } );

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

        // Ball trail — fading afterimages so fast shots streak.
        if ( this.theBall && this.ballTrail.length > 1 ) {
            for ( var ti = 0; ti < this.ballTrail.length - 1; ti++ ) {
                var tp = this.ballTrail[ ti ];
                var tf = ti / this.ballTrail.length;     // 0 oldest .. 1 newest
                ctx.globalAlpha = tf * 0.35;
                ctx.fillStyle = COLORS.ball;
                ctx.beginPath();
                ctx.arc( tp.x, tp.y, BALL_R * ( 0.35 + 0.55 * tf ), 0, Math.PI * 2 );
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }

        // Ball — glassy sphere with a soft glow so it reads as it moves.
        if ( this.theBall ) {
            var b = this.theBall;
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
        }

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
        // Rounded rectangle 104×18 (matches the flipper body)
        var w = 104, h = 18, r = 6;
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

    // A flipper: 104×18 rounded bar + a lighter top highlight, centred on
    // its origin so we can drive it by the Matter body's position/angle.
    function makeFlipperGfx() {
        var g = new PIXI.Graphics();
        g.beginFill( colorToNum( COLORS.flipper ), 1 );
        g.drawRoundedRect( -52, -9, 104, 18, 6 );
        g.endFill();
        g.beginFill( colorToNum( COLORS.flipperShine ), 0.5 );
        g.drawRoundedRect( -52, -9, 104, 7, 5 );
        g.endFill();
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

    // Paint the never-moving table chrome into a 2D context (reused to
    // build the baked background texture). Identical math to render().
    Pinball.prototype.paintStaticBackground = function ( ctx ) {
        var bg = ctx.createRadialGradient( TABLE_W / 2, TABLE_H * 0.35, 50,
                                           TABLE_W / 2, TABLE_H * 0.5, TABLE_W );
        bg.addColorStop( 0, '#1a1228' );
        bg.addColorStop( 1, COLORS.bg );
        ctx.fillStyle = bg; ctx.fillRect( 0, 0, TABLE_W, TABLE_H );

        var spot = ctx.createRadialGradient( TABLE_W / 2, 165, 30, TABLE_W / 2, 165, 350 );
        spot.addColorStop( 0, 'rgba(122,112,225,0.13)' );
        spot.addColorStop( 1, 'rgba(122,112,225,0)' );
        ctx.fillStyle = spot; ctx.fillRect( 0, 0, TABLE_W, TABLE_H );

        var vg = ctx.createRadialGradient( TABLE_W / 2, TABLE_H * 0.42, TABLE_H * 0.34,
                                           TABLE_W / 2, TABLE_H * 0.5, TABLE_W * 0.62 );
        vg.addColorStop( 0, 'rgba(0,0,0,0)' );
        vg.addColorStop( 1, 'rgba(0,0,0,0.5)' );
        ctx.fillStyle = vg; ctx.fillRect( 0, 0, TABLE_W, TABLE_H );

        var self = this;
        Composite.allBodies( this.engine.world ).forEach( function ( b ) {
            if ( b.label === 'wall' ) self.drawWall( b, ctx );
        } );
    };

    Pinball.prototype.buildPixiScene = function () {
        var P = window.PIXI;
        var self = this;

        var app = new P.Application( {
            view: this.canvas,
            width: TABLE_W,
            height: TABLE_H,
            antialias: true,
            backgroundColor: colorToNum( COLORS.bg ),
            backgroundAlpha: 1,
            resolution: Math.min( window.devicePixelRatio || 1, 2 ),
            autoDensity: false,   // CSS (.tc-pinball__canvas) controls display size
            autoStart: false,     // we drive render() from tick()
            powerPreference: 'high-performance',
        } );
        this.app = app;
        var stage = app.stage;

        // Baked static background (felt + spotlight + vignette + walls).
        var bgCanvas = document.createElement( 'canvas' );
        bgCanvas.width = TABLE_W; bgCanvas.height = TABLE_H;
        this.paintStaticBackground( bgCanvas.getContext( '2d' ) );
        stage.addChild( new P.Sprite( P.Texture.from( bgCanvas ) ) );

        // Dynamic playfield lives under shakeRoot (nudge jitters this, not
        // the felt — matches Canvas2D).
        var shakeRoot = new P.Container();
        stage.addChild( shakeRoot );
        this.pixi = { app: app, shakeRoot: shakeRoot };

        // GlowFilter factory — returns null when pixi-filters didn't load
        // (Pixi treats `.filters = null` as "no filters"), so the scene
        // still renders, just without the bloom.
        var Glow = P.filters && P.filters.GlowFilter;
        function glow( cfg, colorCss ) {
            if ( ! Glow ) return null;
            var o = {}; for ( var k in cfg ) o[ k ] = cfg[ k ];
            o.color = colorToNum( colorCss || '#ffffff' );
            return [ new Glow( o ) ];
        }

        // Ramps — white rounded rects, tinted per frame; glow on the group.
        var rampsBox = new P.Container();
        rampsBox.filters = glow( GLOW.ramp, '#ffffff' );
        this.pixi.rampGfx = this.ramps.map( function ( r ) {
            var g = localRoundRect( 84, 10, 4, 0xffffff, 1 );
            g.position.set( r.position.x, r.position.y );
            g.rotation = r.angle;
            g.tint = colorToNum( r.tcColor );
            rampsBox.addChild( g );
            return g;
        } );
        shakeRoot.addChild( rampsBox );

        var rampLabelStyle = new P.TextStyle( {
            fontFamily: 'Georgia, serif', fontSize: 9, fontWeight: 'bold', fill: 0x0a0814,
        } );
        this.pixi.rampLabels = this.ramps.map( function ( r ) {
            var t = new P.Text( labelOfRamp( r.label ), rampLabelStyle );
            t.anchor.set( 0.5 ); t.position.set( r.position.x, r.position.y ); t.rotation = r.angle;
            shakeRoot.addChild( t ); return t;
        } );

        // Slingshots — redrawn each frame (2 triangles).
        var slingsG = new P.Graphics();
        slingsG.filters = glow( GLOW.sling, COLORS.bumperBright );
        shakeRoot.addChild( slingsG ); this.pixi.slingsG = slingsG;

        // Bumpers — redrawn each frame (5 glassy discs).
        var bumpersG = new P.Graphics();
        bumpersG.filters = glow( GLOW.bumper, '#ffffff' );
        shakeRoot.addChild( bumpersG ); this.pixi.bumpersG = bumpersG;

        // Pins — redrawn each frame (gold studs).
        var pegsG = new P.Graphics();
        pegsG.filters = glow( GLOW.peg, COLORS.dropTarget );
        shakeRoot.addChild( pegsG ); this.pixi.pegsG = pegsG;

        // Drop targets + labels.
        var dropsG = new P.Graphics();
        shakeRoot.addChild( dropsG ); this.pixi.dropsG = dropsG;
        var dropLabelStyle = new P.TextStyle( {
            fontFamily: 'Georgia, serif', fontSize: 10, fontWeight: 'bold', fill: 0x3a2616,
        } );
        this.pixi.dropLabels = this.dropTargets.map( function ( d ) {
            var t = new P.Text( d.tcLabel, dropLabelStyle );
            t.anchor.set( 0.5 ); t.position.set( d.position.x, d.position.y );
            shakeRoot.addChild( t ); return t;
        } );

        // Flippers — drawn once, transformed each frame.
        var flippersBox = new P.Container();
        this.pixi.flipperGfx = { left: makeFlipperGfx(), right: makeFlipperGfx() };
        flippersBox.addChild( this.pixi.flipperGfx.left, this.pixi.flipperGfx.right );
        shakeRoot.addChild( flippersBox );

        // Ball texture → trail pool + ball sprite.
        var ballTex = makeBallTexture();
        this.pixi.ballTex = ballTex;
        var trailBox = new P.Container();
        this.pixi.trailSprites = [];
        for ( var i = 0; i < 9; i++ ) {
            var ts = new P.Sprite( ballTex );
            ts.anchor.set( 0.5 ); ts.visible = false;
            trailBox.addChild( ts ); this.pixi.trailSprites.push( ts );
        }
        shakeRoot.addChild( trailBox );

        var ballSprite = new P.Sprite( ballTex );
        ballSprite.anchor.set( 0.5 );
        ballSprite.width = ballSprite.height = BALL_R * 2;
        ballSprite.filters = glow( GLOW.ball, COLORS.ballShine );
        shakeRoot.addChild( ballSprite ); this.pixi.ballSprite = ballSprite;

        // Sparks + plunger meter (redrawn each frame).
        var sparksG = new P.Graphics();
        sparksG.filters = glow( GLOW.spark, '#ffffff' );
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

        // Screen-shake (felt stays; shakeRoot jitters).
        var shx = 0, shy = 0;
        if ( this.shake && now < this.shake.until ) {
            var sk = ( this.shake.until - now ) / 130;
            shx = this.shake.x * sk * ( 0.4 + Math.random() * 0.6 );
            shy = this.shake.y * sk * ( 0.4 + Math.random() * 0.6 );
        }
        px.shakeRoot.position.set( shx, shy );

        // Ramps — tint flips to bright on flash.
        this.ramps.forEach( function ( r, i ) {
            px.rampGfx[ i ].tint = ( r.tcFlashUntil > now )
                ? colorToNum( COLORS.bumperBright )
                : colorToNum( r.tcColor );
        } );

        // Slingshots — dark slate body with a glowing "rubber band" on the
        // kicker face (verts[0]→verts[1], the top-sloped edge the ball hits).
        var slingsG = px.slingsG; slingsG.clear();
        this.slingshots.forEach( function ( s ) {
            var flash = s.tcFlashUntil > now;
            var v = s.tcVerts;
            var pts = [ v[ 0 ].x, v[ 0 ].y, v[ 1 ].x, v[ 1 ].y, v[ 2 ].x, v[ 2 ].y ];
            slingsG.lineStyle( 0 );
            slingsG.beginFill( 0x232f44, 1 );           // slate body
            slingsG.drawPolygon( pts );
            slingsG.endFill();
            // a thin lit edge around the whole shape for definition
            slingsG.lineStyle( 1.5, 0x3a4a66, 1 );
            slingsG.drawPolygon( pts );
            slingsG.lineStyle( 0 );
            // the bright rubber band on the active edge
            slingsG.lineStyle( 4, colorToNum( flash ? '#ffffff' : COLORS.bumperBright ), 1 );
            slingsG.moveTo( v[ 0 ].x, v[ 0 ].y );
            slingsG.lineTo( v[ 1 ].x, v[ 1 ].y );
            slingsG.lineStyle( 0 );
        } );

        // Bumpers — dimensional pop-bumpers: dark socket, metallic ring,
        // coloured body, cap rim, an idle-pulsing core, and a specular.
        var bumpersG = px.bumpersG; bumpersG.clear();
        this.bumpers.forEach( function ( bp, bi ) {
            var flash = bp.tcFlashUntil > now;
            var hits = self.bumperHits[ bp.tcName ] || 0;
            var baseN = colorToNum( flash ? COLORS.bumperBright : bumperColor( hits ) );
            var brightN = colorToNum( bumperBrightColor( hits ) );
            var rad = bp.circleRadius, x = bp.position.x, y = bp.position.y;
            var pulse = 0.5 + 0.5 * Math.sin( now / 320 + bi * 1.7 );
            bumpersG.beginFill( 0x0a0814, 0.85 );           // dark socket
            bumpersG.drawCircle( x, y, rad + 2.5 );
            bumpersG.endFill();
            bumpersG.beginFill( brightN, 0.32 );            // metallic ring
            bumpersG.drawCircle( x, y, rad + 1 );
            bumpersG.endFill();
            bumpersG.beginFill( baseN, 1 );                 // body
            bumpersG.drawCircle( x, y, rad );
            bumpersG.endFill();
            bumpersG.lineStyle( 2.5, flash ? 0xffffff : brightN, 1 );  // cap rim
            bumpersG.drawCircle( x, y, rad - 1 );
            bumpersG.lineStyle( 0 );
            bumpersG.beginFill( brightN, flash ? 0.95 : ( 0.35 + 0.4 * pulse ) ); // pulsing core
            bumpersG.drawCircle( x, y, rad * ( 0.42 + 0.12 * pulse ) );
            bumpersG.endFill();
            bumpersG.beginFill( 0xffffff, 0.8 );            // specular
            bumpersG.drawCircle( x - rad * 0.32, y - rad * 0.34, rad * 0.22 );
            bumpersG.endFill();
        } );

        // Pins — small gold studs with a bright rim + specular.
        var pegsG = px.pegsG; pegsG.clear();
        this.pegs.forEach( function ( p ) {
            var flash = p.tcFlashUntil > now;
            var r = p.circleRadius, x = p.position.x, y = p.position.y;
            pegsG.beginFill( 0x0a0814, 0.85 );              // socket
            pegsG.drawCircle( x, y, r + 1.5 );
            pegsG.endFill();
            pegsG.beginFill( colorToNum( flash ? '#ffffff' : COLORS.dropTarget ), 1 );
            pegsG.drawCircle( x, y, r );
            pegsG.endFill();
            pegsG.lineStyle( 1.5, colorToNum( flash ? '#ffffff' : '#fff3d0' ), 1 );
            pegsG.drawCircle( x, y, r - 0.5 );
            pegsG.lineStyle( 0 );
            pegsG.beginFill( 0xffffff, 0.75 );
            pegsG.drawCircle( x - r * 0.3, y - r * 0.3, r * 0.32 );
            pegsG.endFill();
        } );

        // Drop targets — dim when dropped; bright flash on hit.
        var dropsG = px.dropsG; dropsG.clear();
        this.dropTargets.forEach( function ( d, i ) {
            var flash = d.tcFlashUntil > now, label = px.dropLabels[ i ];
            var fillN;
            if ( d.tcDropped ) { fillN = colorToNum( COLORS.dropTargetOff ); if ( label ) label.alpha = 0.35; }
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

        // Ball trail — fading afterimages.
        var trail = this.ballTrail, tlen = trail.length;
        for ( var ti = 0; ti < px.trailSprites.length; ti++ ) {
            var spr = px.trailSprites[ ti ];
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

        // Ball.
        if ( this.theBall ) {
            px.ballSprite.visible = true;
            px.ballSprite.position.set( this.theBall.position.x, this.theBall.position.y );
        } else {
            px.ballSprite.visible = false;
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
