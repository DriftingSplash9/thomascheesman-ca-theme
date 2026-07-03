/**
 * THE BACK QUARTER — the homepage drivable-overworld BHAG.
 * P1 (docs/QUARTER-SECTION-SPEC.md): the authored painting is the ground,
 * the full landmark set is wired to real destinations, and the whole board
 * fits the stage (no panning — you see the entire farm and drive around it).
 *
 * Boot contract (mirrors desk-drawer.js → pinball):
 * - Front page only; a cheap deferred shim until the visitor engages.
 * - Matter + Pixi (self-hosted in assets/js/vendor/) load ONLY on engage.
 * - Every failure is non-fatal: the painted preview stays and the site's
 *   normal nav is always the real path to every destination.
 *
 * The painting URL comes from #bq-stage[data-bg] (PHP-owned; one place to
 * swap the art). Landmark coordinates below are in the painting's own pixel
 * space (1280×720) — measured against the delivered image; nudge here if the
 * art is ever re-generated.
 *
 * ⭐ Verification limit (carried from the pinball): background/automation
 * tabs freeze rAF/WebGL — smoke-test = boots clean, zero console errors; the
 * FEEL check is Thomas driving it in a foreground tab.
 */
( function () {
	'use strict';

	var WORLD = {
		w: 1280,
		h: 720,
		bg: '', // filled from #bq-stage[data-bg]
		spawn: { x: 614, y: 628, angle: -Math.PI / 2 }, // just inside the gate, facing north
		// hub-and-spoke dirt routes (grip bonus + drift cues). Approximate the
		// painted paths; the buggy grips on these and drifts off them.
		hub: { x: 610, y: 470 },
		pathHalfWidth: 58,
		landmarks: [
			{ id: 'farmhouse', name: 'the farmhouse', x: 346, y: 168, w: 150, h: 96,
			  href: '/thomas', prompt: 'The farmhouse — step inside, this is me' },
			{ id: 'cookshack', name: 'the cookshack', x: 640, y: 132, w: 92, h: 66,
			  href: '/about', prompt: 'The cookshack — my life on the line' },
			{ id: 'elevator', name: 'the grain elevator', x: 896, y: 196, w: 96, h: 140,
			  href: '/hcs', prompt: 'The grain elevator — one of fewer than fifty' },
			{ id: 'church', name: 'the church', x: 198, y: 372, w: 92, h: 96,
			  href: '/heritage', prompt: 'The church on the hill — eight family lines' },
			{ id: 'th1', name: 'a treehouse', x: 410, y: 296, w: 46, h: 46,
			  href: '/patience', prompt: 'A treehouse — needs the family key' },
			{ id: 'th2', name: 'a treehouse', x: 454, y: 360, w: 46, h: 46,
			  href: '/daniel', prompt: 'A treehouse — needs the family key' },
			{ id: 'th3', name: 'a treehouse', x: 563, y: 436, w: 46, h: 46,
			  href: '/faith', prompt: 'A treehouse — needs the family key' },
			{ id: 'radio', name: 'the radio mast', x: 1184, y: 360, w: 40, h: 150,
			  href: 'https://bareyourrare.org', external: true,
			  prompt: 'The radio mast — broadcasting beyond the fence' },
			{ id: 'barn', name: 'the arcade barn', x: 1011, y: 410, w: 150, h: 92,
			  href: null, prompt: 'The arcade barn — the games are moving in here soon' },
			{ id: 'shed', name: 'the old shed', x: 186, y: 552, w: 78, h: 58,
			  href: null, prompt: 'The shed is padlocked… but a drawer in the house opens' },
			{ id: 'mailbox', name: 'the mailbox', x: 560, y: 664, w: 44, h: 40,
			  href: null, prompt: 'Fresh mail soon — “recently added” lands here' }
		]
	};

	var stage, previewNote, chipEl, hudEl, goBtn;
	var app, cam, engine, buggyBody, buggyGfx, headlights;
	var Matter, keys = {}, engaged = false, booted = false;
	var accMS = 0, pointerDrive = null, nearLandmark = null;
	var ZOOM = 2.3; // how far in the follow-camera sits over the board
	var camScale = 1, camPivX = 0, camPivY = 0;
	var markers = []; // {lm, label, ring, isLive, phase}

	document.addEventListener( 'DOMContentLoaded', function () {
		stage = document.getElementById( 'bq-stage' );
		if ( ! stage ) return;
		WORLD.bg = stage.getAttribute( 'data-bg' ) || '';
		previewNote = stage.querySelector( '.bq-preview__note' );
		chipEl = stage.querySelector( '.bq-chip' );
		hudEl = stage.querySelector( '.bq-hud' );
		goBtn = stage.querySelector( '.bq-preview__go' );

		if ( goBtn ) goBtn.addEventListener( 'click', engage );
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
			.then( function () { return loadScript( base + '/assets/js/vendor/pixi-7.4.2.min.js' ); } )
			.then( function () {
				if ( ! window.Matter || ! window.PIXI ) throw new Error( 'engine globals missing' );
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
			s.src = src; s.async = true;
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

		// physics
		engine = Matter.Engine.create();
		engine.gravity.x = 0; engine.gravity.y = 0;
		buggyBody = Matter.Bodies.rectangle( WORLD.spawn.x, WORLD.spawn.y, 40, 26,
			{ frictionAir: 0.12, density: 0.002 } );
		Matter.Body.setAngle( buggyBody, WORLD.spawn.angle );

		var statics = [];
		var T = 40;
		statics.push( Matter.Bodies.rectangle( WORLD.w / 2, 14, WORLD.w, T, { isStatic: true } ) );
		statics.push( Matter.Bodies.rectangle( WORLD.w / 2, WORLD.h - 14, WORLD.w, T, { isStatic: true } ) );
		statics.push( Matter.Bodies.rectangle( 14, WORLD.h / 2, T, WORLD.h, { isStatic: true } ) );
		statics.push( Matter.Bodies.rectangle( WORLD.w - 14, WORLD.h / 2, T, WORLD.h, { isStatic: true } ) );
		WORLD.landmarks.forEach( function ( lm ) {
			// treehouses stay drivable-around; only solid buildings collide
			if ( lm.id.indexOf( 'th' ) === 0 || lm.id === 'mailbox' ) return;
			statics.push( Matter.Bodies.rectangle( lm.x, lm.y, lm.w * 0.8, lm.h * 0.7, { isStatic: true } ) );
		} );
		Matter.Composite.add( engine.world, [ buggyBody ].concat( statics ) );

		// render tree
		cam = new PIXI.Container();
		app.stage.addChild( cam );
		drawGround( PIXI );
		WORLD.landmarks.forEach( function ( lm ) { drawMarker( PIXI, lm ); } );
		buggyGfx = drawBuggy( PIXI );
		cam.addChild( buggyGfx );

		camPivX = WORLD.spawn.x;
		camPivY = WORLD.spawn.y;

		// input
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
		var map = { w: 'up', arrowup: 'up', s: 'down', arrowdown: 'down',
			a: 'left', arrowleft: 'left', d: 'right', arrowright: 'right',
			enter: 'enter', escape: 'esc' };
		if ( ! ( k in map ) ) return;
		e.preventDefault();
		var down = ( e.type === 'keydown' );
		keys[ map[ k ] ] = down;
		if ( down && map[ k ] === 'esc' ) stage.blur();
		if ( down && map[ k ] === 'enter' && nearLandmark ) enterLandmark( nearLandmark );
	}

	function onPointer( e ) {
		if ( e.pointerType === 'mouse' && e.type === 'pointermove' ) return;
		if ( e.type === 'pointermove' && ! pointerDrive ) return;
		var r = app.view.getBoundingClientRect();
		pointerDrive = {
			x: ( e.clientX - r.left - r.width / 2 ) / camScale + camPivX,
			y: ( e.clientY - r.top - r.height / 2 ) / camScale + camPivY
		};
		stage.focus();
	}

	function enterLandmark( lm ) {
		if ( ! lm.href ) { flashChip( lm.prompt ); return; }
		if ( lm.external ) { window.open( lm.href, '_blank', 'noopener' ); return; }
		var root = ( window.tcVentures && window.tcVentures.siteUrl ) || '';
		window.location.href = root + lm.href;
	}

	var flashT = null;
	function flashChip( msg ) {
		if ( ! chipEl ) return;
		chipEl.textContent = msg;
		chipEl.hidden = false;
		clearTimeout( flashT );
		flashT = setTimeout( function () { if ( ! nearLandmark ) chipEl.hidden = true; }, 2200 );
	}

	/* ------------------------------------------------------------------ *
	 *  Simulation — fixed 60Hz steps inside the rAF ticker
	 * ------------------------------------------------------------------ */
	function tick() {
		if ( document.hidden ) return;
		accMS = Math.min( accMS + app.ticker.deltaMS, 100 );
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
		var onPath = distToHubSpokes( b.position ) < WORLD.pathHalfWidth;

		// The dirt road really matters: on the path the buggy is quick and
		// grippy; off it (grass/stubble) it bogs down with heavy rolling
		// resistance and slides more, so staying on the road is worth it.
		b.frictionAir = onPath ? 0.085 : 0.20;

		var throttle = ( keys.up ? 1 : 0 ) - ( keys.down ? 0.6 : 0 );
		var steer = ( keys.right ? 1 : 0 ) - ( keys.left ? 1 : 0 );

		if ( pointerDrive ) {
			var dx = pointerDrive.x - b.position.x, dy = pointerDrive.y - b.position.y;
			if ( dx * dx + dy * dy > 46 * 46 ) {
				var diff = wrapAngle( Math.atan2( dy, dx ) - b.angle );
				steer = Math.max( -1, Math.min( 1, diff * 2.2 ) );
				throttle = 0.85;
			}
		}

		var power = onPath ? 0.0030 : 0.0015; // grass saps the drive
		if ( throttle ) {
			Matter.Body.applyForce( b, b.position,
				{ x: heading.x * power * throttle * b.mass, y: heading.y * power * throttle * b.mass } );
		}

		var v = b.velocity;
		var fwd = v.x * heading.x + v.y * heading.y;
		var steerScale = Math.max( -1, Math.min( 1, fwd / 3.5 ) );
		Matter.Body.setAngularVelocity( b, steer * 0.055 * steerScale );

		var lat = { x: -heading.y, y: heading.x };
		var latSpeed = v.x * lat.x + v.y * lat.y;
		var grip = onPath ? 0.78 : 0.94; // road bites, grass lets it drift
		Matter.Body.setVelocity( b, {
			x: heading.x * fwd + lat.x * latSpeed * grip,
			y: heading.y * fwd + lat.y * latSpeed * grip
		} );

		var cap = onPath ? 7.2 : 3.6; // top speed roughly doubles on the road
		var sp = Math.hypot( b.velocity.x, b.velocity.y );
		if ( sp > cap ) Matter.Body.setVelocity( b, { x: b.velocity.x * cap / sp, y: b.velocity.y * cap / sp } );
	}

	function render() {
		var b = buggyBody;
		buggyGfx.position.set( b.position.x, b.position.y );
		buggyGfx.rotation = b.angle;
		var sp = Math.hypot( b.velocity.x, b.velocity.y );
		headlights.alpha = 0.10 + Math.min( 0.10, sp * 0.02 );

		// zoom in and follow the buggy; pivot clamped so we never show past
		// the fence line. camScale = contain-fit × ZOOM.
		var vw = app.screen.width, vh = app.screen.height;
		var fit = Math.min( vw / WORLD.w, vh / WORLD.h );
		camScale = fit * ZOOM;
		var halfW = ( vw / 2 ) / camScale, halfH = ( vh / 2 ) / camScale;
		var tx = clampPivot( b.position.x, halfW, WORLD.w );
		var ty = clampPivot( b.position.y, halfH, WORLD.h );
		camPivX += ( tx - camPivX ) * 0.10;
		camPivY += ( ty - camPivY ) * 0.10;
		cam.scale.set( camScale );
		cam.pivot.set( camPivX, camPivY );
		cam.position.set( vw / 2, vh / 2 );

		// marker pulse + proximity highlight
		var t = app.ticker.lastTime / 1000;
		var near = null;
		markers.forEach( function ( m ) {
			var d = Math.hypot( b.position.x - m.lm.x, b.position.y - m.lm.y );
			var close = d < 150;
			if ( close && ( ! near || d < Math.hypot( b.position.x - near.x, b.position.y - near.y ) ) ) near = m.lm;
			var pulse = 0.5 + 0.5 * Math.sin( t * 2.2 + m.phase );
			var rest = m.isLive ? 0.42 : 0.22;
			m.ring.alpha = ( close ? 0.95 : rest ) * ( 0.6 + 0.4 * pulse );
			m.label.alpha = close ? 1 : ( m.isLive ? 0.6 : 0.42 );
			m.ring.scale.set( close ? 1.15 : 1 );
		} );

		if ( near !== nearLandmark ) {
			nearLandmark = near;
			if ( chipEl ) {
				chipEl.hidden = ! near;
				if ( near ) chipEl.textContent = near.prompt + ( near.href ? '  · Enter ↵' : '' );
			}
		}
	}

	function clampPivot( c, half, worldSize ) {
		if ( half * 2 >= worldSize ) return worldSize / 2;
		return Math.max( half, Math.min( worldSize - half, c ) );
	}

	function wrapAngle( a ) {
		while ( a > Math.PI ) a -= 2 * Math.PI;
		while ( a < -Math.PI ) a += 2 * Math.PI;
		return a;
	}

	function distToHubSpokes( p ) {
		var best = distToSeg( p, WORLD.spawn, WORLD.hub );
		for ( var i = 0; i < WORLD.landmarks.length; i++ ) {
			best = Math.min( best, distToSeg( p, WORLD.hub, WORLD.landmarks[ i ] ) );
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
	 *  Rendering — the painting is the ground; we only draw the buggy +
	 *  interactive markers on top (buildings live IN the painting).
	 * ------------------------------------------------------------------ */
	function drawGround( PIXI ) {
		// dark base so a slow/failed texture load never flashes empty
		var base = new PIXI.Graphics();
		base.beginFill( 0x0a120b ); base.drawRect( 0, 0, WORLD.w, WORLD.h ); base.endFill();
		cam.addChild( base );

		if ( WORLD.bg ) {
			var sprite = PIXI.Sprite.from( WORLD.bg );
			sprite.width = WORLD.w; sprite.height = WORLD.h;
			cam.addChild( sprite );
		}
	}

	function drawMarker( PIXI, lm ) {
		var live = !! lm.href; // cyan = you can go here; amber = flavour stub
		// a soft ring + a downward pin above each landmark, plus a label
		var ring = new PIXI.Graphics();
		if ( live ) { ring.beginFill( 0x8be9ff, 0.12 ); ring.drawCircle( 0, 0, 16 ); ring.endFill(); }
		ring.lineStyle( live ? 3 : 2, live ? 0x9bf0ff : 0xffcf8a, 0.95 );
		ring.drawCircle( 0, 0, 16 );
		ring.moveTo( 0, 16 ); ring.lineTo( 0, 27 ); // little stem toward the roof
		ring.position.set( lm.x, lm.y - lm.h / 2 - 24 );
		ring.alpha = live ? 0.42 : 0.22;
		cam.addChild( ring );

		var label = new PIXI.Text( lm.name, {
			fontFamily: 'Georgia, serif', fontSize: 17, fill: 0xeef0e4,
			dropShadow: true, dropShadowDistance: 1, dropShadowAlpha: 0.8, dropShadowBlur: 2
		} );
		label.anchor.set( 0.5, 1 );
		label.position.set( lm.x, lm.y - lm.h / 2 - 44 );
		label.alpha = 0.5;
		cam.addChild( label );

		// clickable hotspot over the whole building footprint
		var hit = new PIXI.Graphics();
		hit.beginFill( 0xffffff, 0.001 ); // ~invisible but hittable
		hit.drawRect( lm.x - lm.w / 2, lm.y - lm.h / 2, lm.w, lm.h );
		hit.endFill();
		hit.eventMode = 'static';
		hit.cursor = 'pointer';
		hit.on( 'pointertap', function () { enterLandmark( lm ); } );
		hit.on( 'pointerover', function () { nearLandmark = lm; label.alpha = 1; if ( chipEl ) { chipEl.hidden = false; chipEl.textContent = lm.prompt + ( lm.href ? '  · click' : '' ); } } );
		cam.addChild( hit );

		markers.push( { lm: lm, label: label, ring: ring, isLive: live, phase: Math.random() * 6.28 } );
	}

	function drawBuggy( PIXI ) {
		var c = new PIXI.Container();
		headlights = new PIXI.Graphics();
		headlights.beginFill( 0xffd9a0, 1 );
		headlights.moveTo( 18, -8 ); headlights.lineTo( 120, -38 ); headlights.lineTo( 120, -2 ); headlights.closePath();
		headlights.moveTo( 18, 8 ); headlights.lineTo( 120, 2 ); headlights.lineTo( 120, 38 ); headlights.closePath();
		headlights.endFill();
		headlights.alpha = 0.1;
		c.addChild( headlights );

		var g = new PIXI.Graphics();
		g.beginFill( 0x14181c ); // wheels
		g.drawRoundedRect( -17, -17, 12, 7, 3 ); g.drawRoundedRect( 6, -17, 12, 7, 3 );
		g.drawRoundedRect( -17, 10, 12, 7, 3 ); g.drawRoundedRect( 6, 10, 12, 7, 3 );
		g.endFill();
		g.beginFill( 0x8a3a22 ); g.drawRoundedRect( -20, -12, 40, 24, 6 ); g.endFill(); // chassis
		g.beginFill( 0x5f2716 ); g.drawRoundedRect( -20, -12, 12, 24, 6 ); g.endFill(); // engine hump
		g.lineStyle( 3, 0x1c1512 ); g.drawRoundedRect( -5, -10, 20, 20, 5 ); g.lineStyle( 0 ); // roll cage
		g.beginFill( 0xffe9c9 ); g.drawRect( 16, -7, 4, 4 ); g.drawRect( 16, 3, 4, 4 ); g.endFill(); // lamps
		c.addChild( g );
		return c;
	}

} )();
