/**
 * THE BACK QUARTER — the homepage drivable-overworld BHAG.
 * P0 walking skeleton (docs/QUARTER-SECTION-SPEC.md).
 *
 * What P0 is: real buggy physics (Matter) on a placeholder-painted world
 * (Pixi), camera follow, ONE landmark (the farmhouse → /about), lazy boot.
 * What P0 is NOT: the authored painting, the full landmark set, the ledger,
 * gating, sound — those are P1–P3. Landmark/path data is inlined here for
 * P0 and externalizes to inc/data/quarter-section.json in P1.
 *
 * Boot contract (mirrors desk-drawer.js → pinball):
 * - This file is a cheap, deferred shim on the front page only.
 * - Matter + Pixi (both self-hosted in assets/js/vendor/) load ONLY when
 *   the visitor engages (Start button / W / ArrowUp on the focused stage).
 * - Every failure is non-fatal: the preview card stays, the site's normal
 *   nav is always the real path to every destination.
 *
 * ⭐ Verification limit (carried from the pinball): background/automation
 * tabs freeze rAF/WebGL — smoke-test = boots clean, zero console errors;
 * the FEEL check is Thomas driving it in a foreground tab.
 */
( function () {
	'use strict';

	/* ------------------------------------------------------------------ *
	 *  P0 world data (→ inc/data/quarter-section.json in P1)
	 * ------------------------------------------------------------------ */
	var WORLD = {
		w: 2600,
		h: 1950,
		spawn: { x: 1300, y: 1650, angle: -Math.PI / 2 }, // facing "north"
		// dirt path: spawn → a bend → the farmhouse yard
		path: [
			{ x: 1300, y: 1700 },
			{ x: 1280, y: 1350 },
			{ x: 1050, y: 1050 },
			{ x: 820, y: 760 },
			{ x: 760, y: 580 }
		],
		pathHalfWidth: 55,
		landmarks: [
			{
				id: 'farmhouse',
				name: 'the farmhouse',
				x: 700, y: 430, w: 230, h: 180,
				href: '/about',
				prompt: 'Step inside the farmhouse'
			}
		]
	};

	var stage, previewNote, chipEl, hudEl, goBtn;
	var app, cam, engine, buggyBody, buggyGfx, headlights;
	var Matter, keys = {}, engaged = false, booted = false;
	var camX, camY, accMS = 0;
	var pointerDrive = null; // {x,y} world-space target while touch held
	var nearLandmark = null;

	document.addEventListener( 'DOMContentLoaded', function () {
		stage = document.getElementById( 'bq-stage' );
		if ( ! stage ) return;
		previewNote = stage.querySelector( '.bq-preview__note' );
		chipEl = stage.querySelector( '.bq-chip' );
		hudEl = stage.querySelector( '.bq-hud' );
		goBtn = stage.querySelector( '.bq-preview__go' );

		if ( goBtn ) goBtn.addEventListener( 'click', engage );
		// W / ArrowUp on the focused stage also engages (spec §4).
		stage.addEventListener( 'keydown', function ( e ) {
			if ( engaged ) return;
			if ( e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp' ) {
				e.preventDefault();
				engage();
			}
		} );
	} );

	/* ------------------------------------------------------------------ *
	 *  Boot
	 * ------------------------------------------------------------------ */
	function engage() {
		if ( engaged ) return;
		engaged = true;
		if ( previewNote ) previewNote.textContent = 'starting the buggy…';
		var base = ( window.tcVentures && window.tcVentures.themeUrl ) || '';
		loadScript( base + '/assets/js/vendor/matter-0.20.0.min.js' )
			.then( function () {
				return loadScript( base + '/assets/js/vendor/pixi-7.4.2.min.js' );
			} )
			.then( function () {
				if ( ! window.Matter || ! window.PIXI ) {
					throw new Error( 'engine globals missing' );
				}
				start();
			} )
			.catch( function ( err ) {
				console.warn( 'The Back Quarter failed to load.', err );
				engaged = false;
				if ( previewNote ) {
					previewNote.textContent =
						'Couldn’t start the buggy — no matter: the menu up top gets you everywhere.';
				}
			} );
	}

	function loadScript( src ) {
		return new Promise( function ( resolve, reject ) {
			var s = document.createElement( 'script' );
			s.src = src;
			s.async = true;
			s.onload = resolve;
			s.onerror = function () { reject( new Error( 'Script failed: ' + src ) ); };
			document.head.appendChild( s );
		} );
	}

	/* ------------------------------------------------------------------ *
	 *  World + physics + render
	 * ------------------------------------------------------------------ */
	function start() {
		if ( booted ) return;
		booted = true;
		Matter = window.Matter;
		var PIXI = window.PIXI;

		app = new PIXI.Application( {
			resizeTo: stage,
			backgroundAlpha: 0,
			antialias: true,
			resolution: Math.min( window.devicePixelRatio || 1, 2 ),
			autoDensity: true
		} );
		app.view.className = 'bq-canvas';
		app.view.setAttribute( 'aria-hidden', 'true' );
		stage.appendChild( app.view );

		// -------- physics --------
		engine = Matter.Engine.create();
		engine.gravity.x = 0;
		engine.gravity.y = 0;

		buggyBody = Matter.Bodies.rectangle(
			WORLD.spawn.x, WORLD.spawn.y, 46, 30,
			{ frictionAir: 0.12, density: 0.002 }
		);
		Matter.Body.setAngle( buggyBody, WORLD.spawn.angle );

		var statics = [];
		// world border fences
		var T = 60;
		statics.push( Matter.Bodies.rectangle( WORLD.w / 2, -T / 2 + 20, WORLD.w, T, { isStatic: true } ) );
		statics.push( Matter.Bodies.rectangle( WORLD.w / 2, WORLD.h + T / 2 - 20, WORLD.w, T, { isStatic: true } ) );
		statics.push( Matter.Bodies.rectangle( -T / 2 + 20, WORLD.h / 2, T, WORLD.h, { isStatic: true } ) );
		statics.push( Matter.Bodies.rectangle( WORLD.w + T / 2 - 20, WORLD.h / 2, T, WORLD.h, { isStatic: true } ) );
		// landmark footprints
		WORLD.landmarks.forEach( function ( lm ) {
			statics.push( Matter.Bodies.rectangle(
				lm.x + lm.w / 2, lm.y + lm.h / 2, lm.w, lm.h, { isStatic: true }
			) );
		} );
		Matter.Composite.add( engine.world, [ buggyBody ].concat( statics ) );

		// -------- render world --------
		cam = new PIXI.Container();
		app.stage.addChild( cam );
		drawGround( PIXI );
		WORLD.landmarks.forEach( function ( lm ) { drawFarmhouse( PIXI, lm ); } );
		buggyGfx = drawBuggy( PIXI );
		cam.addChild( buggyGfx );

		camX = buggyBody.position.x;
		camY = buggyBody.position.y;

		// -------- input --------
		window.addEventListener( 'keydown', onKey, true );
		window.addEventListener( 'keyup', onKey, true );
		app.view.addEventListener( 'pointerdown', onPointer );
		app.view.addEventListener( 'pointermove', onPointer );
		window.addEventListener( 'pointerup', function () { pointerDrive = null; } );
		app.view.addEventListener( 'click', function () { stage.focus(); } );

		stage.classList.add( 'is-live' );
		if ( hudEl ) hudEl.hidden = false;
		stage.focus();

		app.ticker.add( tick );
	}

	function onKey( e ) {
		if ( document.activeElement !== stage ) return;
		var k = e.key.toLowerCase();
		var map = {
			w: 'up', arrowup: 'up',
			s: 'down', arrowdown: 'down',
			a: 'left', arrowleft: 'left',
			d: 'right', arrowright: 'right',
			enter: 'enter', escape: 'esc'
		};
		if ( ! ( k in map ) ) return;
		e.preventDefault(); // driving keys must not scroll the page
		var down = ( e.type === 'keydown' );
		keys[ map[ k ] ] = down;
		if ( down && map[ k ] === 'esc' ) stage.blur();
		if ( down && map[ k ] === 'enter' && nearLandmark ) {
			enterLandmark( nearLandmark );
		}
	}

	function onPointer( e ) {
		if ( e.pointerType === 'mouse' && e.type === 'pointermove' ) return;
		if ( e.type === 'pointermove' && ! pointerDrive ) return;
		var r = app.view.getBoundingClientRect();
		// screen → world (cam is centered on pivot)
		pointerDrive = {
			x: ( e.clientX - r.left ) - app.screen.width / 2 + cam.pivot.x,
			y: ( e.clientY - r.top ) - app.screen.height / 2 + cam.pivot.y
		};
		stage.focus();
	}

	function enterLandmark( lm ) {
		var root = ( window.tcVentures && window.tcVentures.siteUrl ) || '';
		window.location.href = root + lm.href;
	}

	/* ------------------------------------------------------------------ *
	 *  Simulation — fixed 60Hz steps inside the rAF ticker
	 * ------------------------------------------------------------------ */
	function tick() {
		if ( document.hidden ) return;
		accMS = Math.min( accMS + app.ticker.deltaMS, 100 ); // clamp long tab-away gaps
		while ( accMS >= 16.666 ) {
			control();
			Matter.Engine.update( engine, 16.666 );
			accMS -= 16.666;
		}
		render();
	}

	function control() {
		var b = buggyBody;
		var heading = { x: Math.cos( b.angle ), y: Math.sin( b.angle ) };
		var onPath = distToPath( b.position ) < WORLD.pathHalfWidth;

		// --- desired inputs (keys or touch drive-toward) ---
		var throttle = ( keys.up ? 1 : 0 ) - ( keys.down ? 0.6 : 0 );
		var steer = ( keys.right ? 1 : 0 ) - ( keys.left ? 1 : 0 );

		if ( pointerDrive ) {
			var dx = pointerDrive.x - b.position.x;
			var dy = pointerDrive.y - b.position.y;
			if ( dx * dx + dy * dy > 60 * 60 ) {
				var want = Math.atan2( dy, dx );
				var diff = wrapAngle( want - b.angle );
				steer = Math.max( -1, Math.min( 1, diff * 2.2 ) );
				throttle = 0.85;
			}
		}

		// --- forward force (grass is slower going) ---
		var power = 0.0026 * ( onPath ? 1 : 0.8 );
		if ( throttle ) {
			Matter.Body.applyForce( b, b.position, {
				x: heading.x * power * throttle * b.mass,
				y: heading.y * power * throttle * b.mass
			} );
		}

		// --- steering, scaled by signed speed so it feels like wheels ---
		var v = b.velocity;
		var fwdSpeed = v.x * heading.x + v.y * heading.y;
		var steerScale = Math.max( -1, Math.min( 1, fwdSpeed / 4 ) );
		Matter.Body.setAngularVelocity( b, steer * 0.055 * steerScale );

		// --- grip: bleed lateral velocity; grass keeps more slide (drift) ---
		var lat = { x: -heading.y, y: heading.x };
		var latSpeed = v.x * lat.x + v.y * lat.y;
		var grip = onPath ? 0.80 : 0.90;
		Matter.Body.setVelocity( b, {
			x: heading.x * fwdSpeed + lat.x * latSpeed * grip,
			y: heading.y * fwdSpeed + lat.y * latSpeed * grip
		} );

		// --- speed cap ---
		var cap = onPath ? 9 : 7;
		var sp = Math.hypot( b.velocity.x, b.velocity.y );
		if ( sp > cap ) {
			Matter.Body.setVelocity( b, {
				x: b.velocity.x * cap / sp,
				y: b.velocity.y * cap / sp
			} );
		}
	}

	function render() {
		var b = buggyBody;
		buggyGfx.position.set( b.position.x, b.position.y );
		buggyGfx.rotation = b.angle;
		headlights.alpha = 0.10 + Math.min( 0.06, Math.hypot( b.velocity.x, b.velocity.y ) * 0.008 );

		// camera lerp + clamp to world (letterbox-centre if viewport > world)
		camX += ( b.position.x - camX ) * 0.08;
		camY += ( b.position.y - camY ) * 0.08;
		var vw = app.screen.width, vh = app.screen.height;
		cam.pivot.set( clampCam( camX, vw, WORLD.w ), clampCam( camY, vh, WORLD.h ) );
		cam.position.set( vw / 2, vh / 2 );

		// landmark proximity → prompt chip
		var near = null;
		WORLD.landmarks.forEach( function ( lm ) {
			var cx = lm.x + lm.w / 2, cy = lm.y + lm.h / 2;
			if ( Math.hypot( b.position.x - cx, b.position.y - cy ) < 190 ) near = lm;
		} );
		if ( near !== nearLandmark ) {
			nearLandmark = near;
			if ( chipEl ) {
				chipEl.hidden = ! near;
				if ( near ) chipEl.textContent = near.prompt + ' — Enter ↵';
			}
		}
	}

	function clampCam( c, view, world ) {
		if ( view >= world ) return world / 2;
		return Math.max( view / 2, Math.min( world - view / 2, c ) );
	}

	function wrapAngle( a ) {
		while ( a > Math.PI ) a -= 2 * Math.PI;
		while ( a < -Math.PI ) a += 2 * Math.PI;
		return a;
	}

	function distToPath( p ) {
		var best = Infinity;
		for ( var i = 0; i < WORLD.path.length - 1; i++ ) {
			best = Math.min( best, distToSeg( p, WORLD.path[ i ], WORLD.path[ i + 1 ] ) );
		}
		return best;
	}

	function distToSeg( p, a, b ) {
		var abx = b.x - a.x, aby = b.y - a.y;
		var t = ( ( p.x - a.x ) * abx + ( p.y - a.y ) * aby ) / ( abx * abx + aby * aby );
		t = Math.max( 0, Math.min( 1, t ) );
		return Math.hypot( p.x - ( a.x + abx * t ), p.y - ( a.y + aby * t ) );
	}

	/* ------------------------------------------------------------------ *
	 *  Placeholder art (all procedural — replaced by the painting in P1)
	 * ------------------------------------------------------------------ */
	function drawGround( PIXI ) {
		var g = new PIXI.Graphics();
		// night field
		g.beginFill( 0x141c12 );
		g.drawRect( 0, 0, WORLD.w, WORLD.h );
		g.endFill();
		// mowed-strip banding so motion is readable
		g.beginFill( 0x182115, 0.6 );
		for ( var y = 0; y < WORLD.h; y += 220 ) g.drawRect( 0, y, WORLD.w, 110 );
		g.endFill();
		// scattered grass tufts
		g.beginFill( 0x223022, 0.5 );
		for ( var i = 0; i < 420; i++ ) {
			g.drawCircle( Math.random() * WORLD.w, Math.random() * WORLD.h, 1.5 + Math.random() * 2.5 );
		}
		g.endFill();
		// the dirt path (wide base + darker wheel ruts)
		g.lineStyle( { width: WORLD.pathHalfWidth * 2, color: 0x4a3b28, alpha: 0.95, join: 'round', cap: 'round' } );
		tracePath( g );
		g.lineStyle( { width: 10, color: 0x362a1b, alpha: 0.9, join: 'round', cap: 'round' } );
		tracePathOffset( g, -14 );
		tracePathOffset( g, 14 );
		g.lineStyle( 0 );
		// border fence posts
		g.beginFill( 0x3a3227 );
		for ( var x = 40; x < WORLD.w; x += 130 ) {
			g.drawRect( x, 16, 6, 18 );
			g.drawRect( x, WORLD.h - 34, 6, 18 );
		}
		for ( var fy = 40; fy < WORLD.h; fy += 130 ) {
			g.drawRect( 16, fy, 18, 6 );
			g.drawRect( WORLD.w - 34, fy, 18, 6 );
		}
		g.endFill();
		cam.addChild( g );
	}

	function tracePath( g ) {
		g.moveTo( WORLD.path[ 0 ].x, WORLD.path[ 0 ].y );
		for ( var i = 1; i < WORLD.path.length; i++ ) g.lineTo( WORLD.path[ i ].x, WORLD.path[ i ].y );
	}

	function tracePathOffset( g, off ) {
		g.moveTo( WORLD.path[ 0 ].x + off, WORLD.path[ 0 ].y );
		for ( var i = 1; i < WORLD.path.length; i++ ) g.lineTo( WORLD.path[ i ].x + off, WORLD.path[ i ].y );
	}

	function drawFarmhouse( PIXI, lm ) {
		var c = new PIXI.Container();
		c.position.set( lm.x, lm.y );
		var g = new PIXI.Graphics();
		// warm spill on the grass around the house
		g.beginFill( 0xffb65e, 0.05 );
		g.drawEllipse( lm.w / 2, lm.h / 2, lm.w * 1.1, lm.h * 1.0 );
		g.endFill();
		// walls + roof ridge (top-down)
		g.beginFill( 0x241c14 );
		g.drawRoundedRect( 0, 0, lm.w, lm.h, 6 );
		g.endFill();
		g.lineStyle( 3, 0x120d08 );
		g.moveTo( 10, lm.h / 2 );
		g.lineTo( lm.w - 10, lm.h / 2 );
		g.lineStyle( 0 );
		// lit windows
		g.beginFill( 0xffb65e, 0.9 );
		g.drawRect( 26, 18, 20, 14 );
		g.drawRect( lm.w - 48, 22, 20, 14 );
		g.drawRect( 30, lm.h - 34, 20, 14 );
		g.endFill();
		c.addChild( g );

		var label = new PIXI.Text( lm.name + '  →', {
			fontFamily: 'Georgia, serif',
			fontSize: 22,
			fill: 0xe7ead7,
			dropShadow: true,
			dropShadowDistance: 1,
			dropShadowAlpha: 0.7
		} );
		label.anchor.set( 0.5, 1 );
		label.position.set( lm.w / 2, -12 );
		c.addChild( label );

		c.eventMode = 'static';
		c.cursor = 'pointer';
		c.on( 'pointertap', function () { enterLandmark( lm ); } );
		cam.addChild( c );
	}

	function drawBuggy( PIXI ) {
		var c = new PIXI.Container();
		// headlight cones (drawn first, under the chassis; buggy faces +x)
		headlights = new PIXI.Graphics();
		headlights.beginFill( 0xffd9a0, 1 );
		headlights.moveTo( 20, -9 ); headlights.lineTo( 150, -46 ); headlights.lineTo( 150, -2 ); headlights.closePath();
		headlights.moveTo( 20, 9 ); headlights.lineTo( 150, 2 ); headlights.lineTo( 150, 46 ); headlights.closePath();
		headlights.endFill();
		headlights.alpha = 0.10;
		c.addChild( headlights );

		var g = new PIXI.Graphics();
		// wheels
		g.beginFill( 0x14181c );
		g.drawRoundedRect( -20, -19, 13, 8, 3 );
		g.drawRoundedRect( 7, -19, 13, 8, 3 );
		g.drawRoundedRect( -20, 11, 13, 8, 3 );
		g.drawRoundedRect( 7, 11, 13, 8, 3 );
		g.endFill();
		// chassis — rust-red with a roll cage
		g.beginFill( 0x8a3a22 );
		g.drawRoundedRect( -23, -13, 46, 26, 7 );
		g.endFill();
		g.beginFill( 0x5f2716 );
		g.drawRoundedRect( -23, -13, 14, 26, 7 ); // engine hump at the back
		g.endFill();
		g.lineStyle( 3, 0x1c1512 );
		g.drawRoundedRect( -6, -11, 22, 22, 5 ); // roll cage
		g.lineStyle( 0 );
		g.beginFill( 0xffe9c9 );
		g.drawRect( 19, -8, 4, 5 ); // headlamps
		g.drawRect( 19, 3, 4, 5 );
		g.endFill();
		c.addChild( g );
		return c;
	}

} )();
