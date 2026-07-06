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
			  href: null, prompt: 'The mailbox — “recently added” lands here' }
		]
	};

	// The ledger (spec §5): tcVentures.bqLedger is localized on the front
	// page only — mailNew drives the flag; the mailbox scrolls to the strip.
	function ledgerData() {
		return ( window.tcVentures && window.tcVentures.bqLedger ) || { mailNew: 0 };
	}

	function openLedger() {
		var el = document.getElementById( 'bq-ledger' );
		if ( ! el ) return;
		if ( fsElement() ) {
			( document.exitFullscreen || document.webkitExitFullscreen ).call( document );
		}
		stage.blur();
		el.scrollIntoView( { behavior: 'smooth', block: 'center' } );
	}

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

		// fresh mail: the mailbox prompt says so on both boards
		if ( ledgerData().mailNew ) {
			WORLD.landmarks.forEach( function ( lm ) {
				if ( lm.id === 'mailbox' ) {
					lm.prompt = 'The flag’s up — fresh mail · Enter reads the ledger';
				}
			} );
		}

		if ( goBtn ) goBtn.addEventListener( 'click', engage );
		stage.addEventListener( 'keydown', function ( e ) {
			if ( engaged ) return;
			if ( e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp' ) {
				e.preventDefault();
				engage();
			}
		} );

		var fsBtn = stage.querySelector( '.bq-fs' );
		if ( fsBtn ) fsBtn.addEventListener( 'click', toggleFullscreen );
		document.addEventListener( 'fullscreenchange', updateFsLabel );
		document.addEventListener( 'webkitfullscreenchange', updateFsLabel );

		// Path C beta door — visit /#bq3d to see the 3D build button.
		// The 2D board stays the public experience until 3D earns the swap.
		var btn3d = stage.querySelector( '.bq-3d' );
		if ( btn3d ) {
			if ( /bq3d/.test( window.location.hash ) ) btn3d.hidden = false;
			btn3d.addEventListener( 'click', engage3d );
		}
	} );

	// Boot the 3D beta: Matter (physics) + the site's vendored Three r128
	// (render) + the 3D module. Cache-busted with Date.now() while in beta.
	function engage3d() {
		if ( engaged ) return;
		engaged = true;
		if ( previewNote ) previewNote.textContent = 'raising the 3D world…';
		var base = ( window.tcVentures && window.tcVentures.themeUrl ) || '';
		var threeUrl = ( window.tcVentures && window.tcVentures.threeUrl ) ||
			( base + '/assets/js/vendor/three-r128.min.js' );
		loadScript( base + '/assets/js/vendor/matter-0.20.0.min.js' )
			.then( function () { return window.THREE ? null : loadScript( threeUrl ); } )
			.then( function () { return loadScript( base + '/assets/js/back-quarter-3d.js?cb=' + Date.now() ); } )
			.then( function () {
				if ( ! window.Matter || ! window.THREE || ! window.TCBackQuarter3D ) {
					throw new Error( '3D globals missing' );
				}
				stage.classList.add( 'is-live' );
				window.TCBackQuarter3D.boot( stage );
			} )
			.catch( function ( err ) {
				console.warn( 'Back Quarter 3D failed to load.', err );
				engaged = false;
				if ( previewNote ) previewNote.textContent = '3D wouldn’t start — the 2D board still drives.';
			} );
	}

	function fsElement() {
		return document.fullscreenElement || document.webkitFullscreenElement || null;
	}
	function toggleFullscreen() {
		if ( fsElement() ) {
			( document.exitFullscreen || document.webkitExitFullscreen ).call( document );
		} else {
			( stage.requestFullscreen || stage.webkitRequestFullscreen ).call( stage );
		}
	}
	function updateFsLabel() {
		var fsBtn = stage.querySelector( '.bq-fs' );
		if ( ! fsBtn ) return;
		var on = fsElement() === stage;
		fsBtn.textContent = on ? '⤡ Exit' : '⛶ Fullscreen';
		fsBtn.setAttribute( 'aria-label', on ? 'Exit fullscreen' : 'Enter fullscreen' );
	}

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
		// follow the pointer only while it's actually held down — a drag,
		// not a hover. (buttons===0 on move means the button was released.)
		if ( e.type === 'pointermove' && ( ! pointerDrive || e.buttons === 0 ) ) return;
		var r = app.view.getBoundingClientRect();
		pointerDrive = {
			x: ( e.clientX - r.left - r.width / 2 ) / camScale + camPivX,
			y: ( e.clientY - r.top - r.height / 2 ) / camScale + camPivY
		};
		stage.focus();
	}

	function enterLandmark( lm ) {
		if ( lm.id === 'mailbox' ) { openLedger(); return; }
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
		// Uniform handling across the whole quarter — same feel on grass or
		// road, so the buggy never rips out of control crossing a boundary.
		b.frictionAir = 0.14;

		var throttle = ( keys.up ? 1 : 0 ) - ( keys.down ? 0.65 : 0 );
		var steer = ( keys.right ? 1 : 0 ) - ( keys.left ? 1 : 0 );

		if ( pointerDrive ) {
			var dx = pointerDrive.x - b.position.x, dy = pointerDrive.y - b.position.y;
			if ( dx * dx + dy * dy > 46 * 46 ) {
				var diff = wrapAngle( Math.atan2( dy, dx ) - b.angle );
				steer = Math.max( -1, Math.min( 1, diff * 2.2 ) );
				throttle = 0.85;
			}
		}

		// Tank-style steering: left/right rotate the buggy in place, whether
		// or not it's moving. Up/down drive along the facing.
		Matter.Body.setAngularVelocity( b, steer * 0.072 );

		var power = 0.0026;
		if ( throttle ) {
			Matter.Body.applyForce( b, b.position,
				{ x: heading.x * power * throttle * b.mass, y: heading.y * power * throttle * b.mass } );
		}

		// grip: bleed sideways velocity so it tracks its heading (light drift)
		var v = b.velocity;
		var fwd = v.x * heading.x + v.y * heading.y;
		var lat = { x: -heading.y, y: heading.x };
		var latSpeed = v.x * lat.x + v.y * lat.y;
		var grip = 0.76; // tires bite — the buggy carves with its nose, no wide sweeps
		Matter.Body.setVelocity( b, {
			x: heading.x * fwd + lat.x * latSpeed * grip,
			y: heading.y * fwd + lat.y * latSpeed * grip
		} );

		var cap = 5.6;
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

		// labels brighten + grow slightly as the buggy comes near
		var near = null;
		markers.forEach( function ( m ) {
			var d = Math.hypot( b.position.x - m.lm.x, b.position.y - m.lm.y );
			var close = d < 150;
			if ( close && ( ! near || d < Math.hypot( b.position.x - near.x, b.position.y - near.y ) ) ) near = m.lm;
			m.label.alpha = close ? 1 : ( m.isLive ? 0.5 : 0.4 );
			m.label.scale.set( close ? 1.12 : 1 );
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
		var live = !! lm.href; // live = you can go here; stub = flavour only
		// no rings — the label IS the marker; it brightens as the buggy nears
		var label = new PIXI.Text( lm.name, {
			fontFamily: 'Georgia, serif', fontSize: 16,
			fill: live ? 0xeef0e4 : 0xe6ddca,
			dropShadow: true, dropShadowDistance: 1, dropShadowAlpha: 0.85, dropShadowBlur: 3
		} );
		label.anchor.set( 0.5, 1 );
		label.position.set( lm.x, lm.y - lm.h / 2 - 14 );
		label.alpha = live ? 0.5 : 0.4;
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

		// the mailbox flag, raised while the ledger has fresh mail
		if ( lm.id === 'mailbox' && ledgerData().mailNew ) {
			var flag = new PIXI.Graphics();
			flag.lineStyle( 2, 0x8a7a5e );
			flag.moveTo( 0, 0 ); flag.lineTo( 0, -22 );
			flag.lineStyle( 0 );
			flag.beginFill( 0xd84a3a );
			flag.moveTo( 0, -22 ); flag.lineTo( 14, -17 ); flag.lineTo( 0, -12 );
			flag.closePath();
			flag.endFill();
			flag.position.set( lm.x + lm.w / 2 - 4, lm.y - lm.h / 2 );
			cam.addChild( flag );
		}

		markers.push( { lm: lm, label: label, isLive: live } );
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
