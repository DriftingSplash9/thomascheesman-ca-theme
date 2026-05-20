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
        ball:          '#dde8f0',
        ballShine:     '#ffffff',
        hud:           '#00ff66',
        hudDim:        '#057a2f',
    };

    // ----------------------------------------------------------------
    // Public entry point. Boots a fresh game instance bound to the
    // given footer element. Multiple boots (Esc → reopen) are fine;
    // the previous instance is torn down before a new one is built.
    var current = null;
    window.TCPinball = {
        boot: function ( footer ) {
            if ( current ) current.destroy();
            current = new Pinball( footer );
        }
    };

    // ----------------------------------------------------------------
    // Pinball — one game instance.
    function Pinball( footer ) {
        var self = this;
        this.footer = footer;
        this.interior = footer.querySelector( '.tc-drawer__interior' );
        if ( ! this.interior ) {
            console.warn( '[desk-pinball] missing .tc-drawer__interior; aborting.' );
            return;
        }

        // ---- overlay + canvas
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
                '<strong>controls</strong> · A / L flippers · Space plunger · Esc exits' +
            '</div>';
        this.interior.appendChild( this.root );
        this.canvas = this.root.querySelector( 'canvas' );
        this.ctx = this.canvas.getContext( '2d' );
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

        // ---- engine
        this.engine = Engine.create();
        this.engine.world.gravity.y = 1.0;
        this.engine.positionIterations = 8;
        this.engine.velocityIterations = 8;
        this.engine.constraintIterations = 4;

        this.buildTable();
        this.buildFlippers();
        this.spawnBall();

        this.bindInput();
        this.bindCollisions();

        // mark the footer so CSS dims the compartments
        this.footer.classList.add( 'is-pinball' );

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
            // shooter-lane "arch" — diagonal top of the chute deflecting
            // the ball leftward into the playfield once launched
            Bodies.rectangle( TABLE_W - 36, 90, 70, t, Object.assign( {}, wallOpts, {
                angle: -Math.PI / 5,
            } ) ),
        ] );

        // ---- drain trough lips (slope inward at the bottom so the
        // ball funnels toward the center between the flippers).
        World.add( w, [
            Bodies.rectangle( 60, TABLE_H - 50, 180, t, Object.assign( {}, wallOpts, {
                angle: Math.PI / 8,
            } ) ),
            Bodies.rectangle( TABLE_W - 60 - 70, TABLE_H - 50, 180, t, Object.assign( {}, wallOpts, {
                angle: -Math.PI / 8,
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
            var b = Bodies.circle( spec.x, spec.y, 18, {
                isStatic: true,
                restitution: 1.6, // overspring so the ball pops
                label: 'bumper:' + spec.name,
                render: { fillStyle: COLORS.bumper },
            } );
            b.tcStory = spec.story;
            b.tcName = spec.name;
            b.tcFlashUntil = 0;
            World.add( w, b );
            pinball.bumpers.push( b );
        } );

        // ---- SLINGSHOTS — triangular bumpers above each flipper.
        // High restitution; score 50 × mult.
        this.slingshots = [];
        function slingshot( verts, label ) {
            var s = Bodies.fromVertices( 0, 0, [ verts ], {
                isStatic: true,
                restitution: 1.4,
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
        this.slingshots.push( slingshot( [
            { x: 130, y: 330 }, { x: 220, y: 330 }, { x: 130, y: 400 },
        ], 'slingshot:left' ) );
        this.slingshots.push( slingshot( [
            { x: 470, y: 330 }, { x: 560, y: 330 }, { x: 560, y: 400 },
        ], 'slingshot:right' ) );

        // ---- RAMPS — angled rails at the top representing the nav
        // categories. Hitting a ramp scores 500 × mult; HCS scores
        // double + triggers the rare-disease tilt banner.
        // We model each ramp as a short angled rectangle; on contact
        // the ball deflects and we award points.
        this.ramps = [];
        var rampSpecs = [
            { x: 110, y: 130, angle: -0.4, label: 'ramp:family',    color: COLORS.ramp },
            { x: 250, y: 110, angle: -0.2, label: 'ramp:hcs',       color: COLORS.rampHcs },
            { x: 390, y: 110, angle:  0.2, label: 'ramp:site',      color: COLORS.ramp },
            { x: 530, y: 130, angle:  0.4, label: 'ramp:elsewhere', color: COLORS.ramp },
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
        var letters = [ 'T', 'C', 'V' ];
        letters.forEach( function ( letter, i ) {
            var x = 260 + i * 70;
            var d = Bodies.rectangle( x, 50, 56, 14, {
                isStatic: true,
                restitution: 0.6,
                label: 'drop:' + letter,
                render: { fillStyle: COLORS.dropTarget },
            } );
            d.tcLetter = letter;
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
    // FLIPPERS — pivoted rectangles. Each has a hinge constraint and
    // is driven by angular velocity on key press.
    Pinball.prototype.buildFlippers = function () {
        var w = this.engine.world;

        var flipperOpts = {
            density: 0.005,
            friction: 0.05,
            restitution: 0.4,
            chamfer: { radius: 5 },
            render: { fillStyle: COLORS.flipper },
        };

        // Left flipper hinges at (250, 410), rests pointing right-down.
        this.leftFlipper = Bodies.rectangle( 290, 410, 80, 14,
            Object.assign( {}, flipperOpts, { label: 'flipper:left' } ) );
        this.leftHinge = Constraint.create( {
            pointA: { x: 250, y: 410 },
            bodyB: this.leftFlipper,
            pointB: { x: -40, y: 0 },
            stiffness: 1,
            length: 0,
            render: { visible: false },
        } );
        World.add( w, [ this.leftFlipper, this.leftHinge ] );

        // Right flipper hinges at (510, 410).
        this.rightFlipper = Bodies.rectangle( 470, 410, 80, 14,
            Object.assign( {}, flipperOpts, { label: 'flipper:right' } ) );
        this.rightHinge = Constraint.create( {
            pointA: { x: 510, y: 410 },
            bodyB: this.rightFlipper,
            pointB: { x: 40, y: 0 },
            stiffness: 1,
            length: 0,
            render: { visible: false },
        } );
        World.add( w, [ this.rightFlipper, this.rightHinge ] );

        // Rest / active angles for clamping. The left flipper rests at
        // a slight downward tilt (+0.35 rad) and fires up to (-0.45 rad);
        // mirror for the right.
        this.leftRestAngle    = 0.35;
        this.leftActiveAngle  = -0.45;
        this.rightRestAngle   = -0.35;
        this.rightActiveAngle = 0.45;

        Body.setAngle( this.leftFlipper, this.leftRestAngle );
        Body.setAngle( this.rightFlipper, this.rightRestAngle );
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
            restitution: 0.5,
            frictionAir: 0.005,
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
            return;
        }
        var b = this.theBall;
        // Only fire if ball is still in the shooter lane (right side, lower half).
        if ( b.position.x > TABLE_W - 60 && b.position.y > TABLE_H * 0.45 ) {
            var force = -0.025 - 0.05 * this.plungerCharge; // upward
            Body.applyForce( b, b.position, { x: 0, y: force } );
        }
        this.plungerActive = false;
        this.plungerCharge = 0;
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
                }
            } );
        } );
    };

    Pinball.prototype.handleBumper = function ( body ) {
        body.tcFlashUntil = performance.now() + 160;
        this.totalBumperHits++;
        this.bumperHits[ body.tcName ] = ( this.bumperHits[ body.tcName ] || 0 ) + 1;
        this.addScore( 100 );
        // Apply a small extra impulse to the ball so the bumper feels alive.
        if ( this.theBall ) {
            var dir = Vector.normalise( Vector.sub( this.theBall.position, body.position ) );
            Body.applyForce( this.theBall, this.theBall.position,
                { x: dir.x * 0.012, y: dir.y * 0.012 } );
        }
        // Story-credit easter egg at 10 cumulative hits per object.
        if ( this.bumperHits[ body.tcName ] === 10 ) {
            this.flashBanner( body.tcStory, 3200 );
        }
    };

    Pinball.prototype.handleSlingshot = function ( body ) {
        body.tcFlashUntil = performance.now() + 140;
        this.addScore( 50 );
    };

    Pinball.prototype.handleRamp = function ( body ) {
        body.tcFlashUntil = performance.now() + 220;
        if ( body.label === 'ramp:hcs' ) {
            this.hcsThisBall++;
            this.addScore( 1000 );
            if ( this.hcsThisBall === 3 ) {
                this.flashBanner( 'TILT — 1 in 200,000 live with Hajdu-Cheney.', 3400 );
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
            this.flashBanner( '× 5 MULTIPLIER — 10 seconds', 2400 );
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
        this.flashBanner( 'Game over — ' + this.score.toLocaleString() + ' points', 3000 );

        var self = this;
        var url = ( window.tcDeskGames && window.tcDeskGames.scoresUrl ) || '/wp-json/tc-games/v1/scores';

        // Quick read first to decide if we should prompt for a name.
        fetch( url + '?game=pinball', { credentials: 'same-origin' } )
            .then( function ( r ) { return r.ok ? r.json() : null; } )
            .then( function ( data ) {
                var rows = data
                    ? ( Array.isArray( data ) ? data : ( data.pinball || [] ) )
                    : [];
                var qualifies = self.score > 0 && (
                    rows.length < 10 || self.score > rows[ rows.length - 1 ].score
                );
                if ( ! qualifies ) {
                    setTimeout( function () { self.destroy(); }, 2400 );
                    return;
                }
                var name = ( window.prompt(
                    'Top 10! Initials or name (max 16 chars):',
                    'TC'
                ) || '' ).trim();
                if ( ! name ) {
                    setTimeout( function () { self.destroy(); }, 1200 );
                    return;
                }
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
                .then( function () {
                    self.flashBanner( 'Saved. Top score: ' + self.score.toLocaleString(), 2400 );
                    setTimeout( function () { self.destroy(); }, 2600 );
                } )
                .catch( function () {
                    self.flashBanner( 'Could not save score.', 2000 );
                    setTimeout( function () { self.destroy(); }, 2200 );
                } );
            } )
            .catch( function () {
                setTimeout( function () { self.destroy(); }, 2400 );
            } );
    };

    // ================================================================
    // RENDER + TICK.
    Pinball.prototype.tick = function ( ts ) {
        if ( ! this.running ) return;
        var dt = Math.min( 32, ts - this.lastTs );
        this.lastTs = ts;

        // Clamp flipper angles, drive them with angular velocity.
        this.driveFlipper( this.leftFlipper, this.leftFlipperUp,
            this.leftRestAngle, this.leftActiveAngle );
        this.driveFlipper( this.rightFlipper, this.rightFlipperUp,
            this.rightRestAngle, this.rightActiveAngle );

        // Charge plunger while held.
        if ( this.plungerActive ) {
            this.plungerCharge = Math.min( 1, this.plungerCharge + dt / 800 );
        }

        Engine.update( this.engine, dt );

        // Edge cases — ball flew out the top, or is stuck in the trough?
        if ( this.theBall && this.theBall.position.y < -30 ) {
            // Re-spawn in the shooter lane.
            Body.setPosition( this.theBall, { x: TABLE_W - 36, y: TABLE_H - 30 } );
            Body.setVelocity( this.theBall, { x: 0, y: 0 } );
        }

        this.updateMultiplier();
        this.render();
        requestAnimationFrame( this.tick );
    };

    Pinball.prototype.driveFlipper = function ( body, isUp, restA, activeA ) {
        // Goal: rotate toward activeA while held, toward restA when not.
        // Use angular velocity directly; clamp the angle at the limit.
        var target = isUp ? activeA : restA;
        var diff   = target - body.angle;
        // Snappy: high gain for fast response, capped so it doesn't tunnel.
        var av = Math.sign( diff ) * Math.min( Math.abs( diff ) * 30, 0.7 );
        Body.setAngularVelocity( body, av );
        // Hard clamp at the limit if we've passed it.
        var lo = Math.min( restA, activeA );
        var hi = Math.max( restA, activeA );
        if ( body.angle < lo ) Body.setAngle( body, lo );
        if ( body.angle > hi ) Body.setAngle( body, hi );
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

        // Slingshots.
        this.slingshots.forEach( function ( s ) {
            var flash = s.tcFlashUntil > now;
            ctx.fillStyle = flash ? COLORS.bumperBright : COLORS.slingshot;
            ctx.beginPath();
            s.vertices.forEach( function ( v, i ) {
                if ( i === 0 ) ctx.moveTo( v.x, v.y );
                else ctx.lineTo( v.x, v.y );
            } );
            ctx.closePath();
            ctx.fill();
        } );

        // Bumpers — circles with bright rim.
        this.bumpers.forEach( function ( bp ) {
            var flash = bp.tcFlashUntil > now;
            var radius = bp.circleRadius;
            var grad = ctx.createRadialGradient(
                bp.position.x - 4, bp.position.y - 4, 2,
                bp.position.x, bp.position.y, radius
            );
            grad.addColorStop( 0, flash ? '#ffffff' : COLORS.bumperBright );
            grad.addColorStop( 1, flash ? COLORS.bumperBright : COLORS.bumper );
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc( bp.position.x, bp.position.y, radius, 0, Math.PI * 2 );
            ctx.fill();
        } );

        // Drop targets — letters; dimmed when dropped.
        this.dropTargets.forEach( function ( d ) {
            var flash = d.tcFlashUntil > now;
            ctx.fillStyle = d.tcDropped
                ? COLORS.dropTargetOff
                : ( flash ? '#ffffff' : COLORS.dropTarget );
            ctx.save();
            ctx.translate( d.position.x, d.position.y );
            ctx.rotate( d.angle );
            ctx.fillRect( -28, -7, 56, 14 );
            ctx.fillStyle = d.tcDropped ? '#1a1018' : '#3a2616';
            ctx.font = 'bold 12px Georgia, serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText( d.tcLetter, 0, 0 );
            ctx.restore();
        } );

        // Flippers.
        this.drawFlipper( this.leftFlipper );
        this.drawFlipper( this.rightFlipper );

        // Ball.
        if ( this.theBall ) {
            var b = this.theBall;
            var bg2 = ctx.createRadialGradient(
                b.position.x - 3, b.position.y - 3, 1,
                b.position.x, b.position.y, BALL_R
            );
            bg2.addColorStop( 0, COLORS.ballShine );
            bg2.addColorStop( 1, '#7790a0' );
            ctx.fillStyle = bg2;
            ctx.beginPath();
            ctx.arc( b.position.x, b.position.y, BALL_R, 0, Math.PI * 2 );
            ctx.fill();
        }

        // Plunger charge meter — thin vertical bar in the shooter lane.
        if ( this.plungerActive ) {
            ctx.fillStyle = COLORS.hud;
            ctx.fillRect( TABLE_W - 32, TABLE_H - 16,
                          14, -120 * this.plungerCharge );
        }
    };

    function labelOfRamp( label ) {
        if ( label === 'ramp:family' )    return 'family';
        if ( label === 'ramp:hcs' )       return 'hcs';
        if ( label === 'ramp:site' )      return 'site';
        if ( label === 'ramp:elsewhere' ) return 'elsewhere';
        return '';
    }

    Pinball.prototype.drawWall = function ( b ) {
        var ctx = this.ctx;
        ctx.save();
        ctx.translate( b.position.x, b.position.y );
        ctx.rotate( b.angle );
        var grad = ctx.createLinearGradient( 0, -b.bounds.max.y + b.position.y,
                                             0,  b.bounds.max.y - b.position.y );
        grad.addColorStop( 0, COLORS.wallShine );
        grad.addColorStop( 1, COLORS.wall );
        ctx.fillStyle = grad;
        var w = b.bounds.max.x - b.bounds.min.x;
        var h = b.bounds.max.y - b.bounds.min.y;
        ctx.fillRect( -w / 2, -h / 2, w, h );
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
        ctx.fillRect( minX, minY, maxX - minX, maxY - minY );
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
        // Rounded rectangle 80×14
        var w = 80, h = 14, r = 5;
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
        if ( this.root && this.root.parentNode ) {
            this.root.parentNode.removeChild( this.root );
        }
        this.footer.classList.remove( 'is-pinball' );
        if ( current === this ) current = null;
    };

} )();
