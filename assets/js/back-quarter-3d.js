/**
 * THE BACK QUARTER 3D — Path C (Bruno-Simon-style), phase 3D-P0.
 * Spec: docs/QUARTER-SECTION-SPEC.md §8.
 *
 * The FEEL CHECK sandbox: a low-poly night quarter — ground, moon, fog,
 * fence line, poplars, knockable hay bales — with a chunky low-poly buggy,
 * spinning wheels, headlight spotlights, faked suspension lean, and a
 * chase camera. No landmarks yet (3D-P1 raises the farm).
 *
 * Architecture decisions (deliberate):
 * - PHYSICS IS STILL MATTER, in 2D top-down — the exact handling tuned on
 *   the 2D board (1.0.670–672) carries over 1:1: same units, same numbers.
 *   Matter (x, y) maps to Three (x, z); body.angle maps to rotation.y = -angle.
 *   cannon-es only enters later if we add ramps/vertical play.
 * - THREE r128 is the site's already-vendored copy (tcVentures.threeUrl).
 * - Loaded ONLY by the hash-gated beta button in back-quarter.js; the 2D
 *   board remains the public homepage until 3D earns the swap.
 *
 * ⭐ Verification limit: background/automation tabs freeze rAF/WebGL —
 * smoke-test = boots clean, zero console errors; feel is Thomas's drive.
 */
( function () {
	'use strict';

	var W = 1280, H = 720; // same world units as the 2D board
	var SPAWN = { x: 640, y: 560, angle: -Math.PI / 2 };

	var stage, hudEl, chipEl;
	var renderer, scene, camera, clock;
	var Matter, engine, buggyBody;
	var buggyGroup, chassisGroup, wheels = [], blobShadow;
	var bales = []; // { body, mesh }
	var keys = {}, accMS = 0;
	var camPos = null;

	function boot( stageEl ) {
		stage = stageEl;
		hudEl = stage.querySelector( '.bq-hud' );
		chipEl = stage.querySelector( '.bq-chip' );
		Matter = window.Matter;
		var THREE = window.THREE;

		// ---------- renderer / scene ----------
		renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.setPixelRatio( Math.min( window.devicePixelRatio || 1, 2 ) );
		renderer.setSize( stage.clientWidth, stage.clientHeight );
		renderer.domElement.className = 'bq-canvas';
		renderer.domElement.setAttribute( 'aria-hidden', 'true' );
		stage.appendChild( renderer.domElement );

		scene = new THREE.Scene();
		scene.background = new THREE.Color( 0x0a1220 );
		scene.fog = new THREE.Fog( 0x0a1220, 420, 1500 );

		camera = new THREE.PerspectiveCamera( 55, stage.clientWidth / stage.clientHeight, 1, 4000 );

		// ---------- light: moon + ambient + a warm hint ----------
		scene.add( new THREE.AmbientLight( 0x24324a, 0.85 ) );
		var hemi = new THREE.HemisphereLight( 0x39506e, 0x141d14, 0.5 );
		scene.add( hemi );
		var moon = new THREE.DirectionalLight( 0x9ec2e8, 0.75 );
		moon.position.set( -300, 500, -200 );
		scene.add( moon );
		// the moon itself, big and low on the horizon
		var moonBall = new THREE.Mesh(
			new THREE.SphereGeometry( 60, 20, 20 ),
			new THREE.MeshBasicMaterial( { color: 0xdfe9f5, fog: false } )
		);
		moonBall.position.set( -700, 420, -900 );
		scene.add( moonBall );

		// ---------- ground + dressing ----------
		var ground = new THREE.Mesh(
			new THREE.PlaneGeometry( 2600, 2000 ),
			new THREE.MeshLambertMaterial( { color: 0x16241a } )
		);
		ground.rotation.x = -Math.PI / 2;
		ground.position.set( W / 2, 0, H / 2 );
		scene.add( ground );

		// moonlit stubble-field strips, laid flat just above the ground
		var stripMat = new THREE.MeshLambertMaterial( { color: 0x3d3a24 } );
		for ( var s = 0; s < 7; s++ ) {
			var strip = new THREE.Mesh( new THREE.PlaneGeometry( 200 + Math.random() * 160, 90 + Math.random() * 70 ), stripMat );
			strip.rotation.x = -Math.PI / 2;
			strip.rotation.z = ( Math.random() - 0.5 ) * 0.5;
			strip.position.set( 120 + Math.random() * ( W - 240 ), 0.4, 100 + Math.random() * ( H - 200 ) );
			scene.add( strip );
		}

		// ---------- physics (identical world to the 2D board) ----------
		engine = Matter.Engine.create();
		engine.gravity.x = 0; engine.gravity.y = 0;
		buggyBody = Matter.Bodies.rectangle( SPAWN.x, SPAWN.y, 46, 30, { frictionAir: 0.14, density: 0.002 } );
		Matter.Body.setAngle( buggyBody, SPAWN.angle );

		var statics = [], T = 40;
		statics.push( Matter.Bodies.rectangle( W / 2, 6, W, T, { isStatic: true } ) );
		statics.push( Matter.Bodies.rectangle( W / 2, H - 6, W, T, { isStatic: true } ) );
		statics.push( Matter.Bodies.rectangle( 6, H / 2, T, H, { isStatic: true } ) );
		statics.push( Matter.Bodies.rectangle( W - 6, H / 2, T, H, { isStatic: true } ) );
		Matter.Composite.add( engine.world, [ buggyBody ].concat( statics ) );

		buildFence( THREE );
		buildTrees( THREE, statics );
		buildBales( THREE );
		buggyGroup = buildBuggy( THREE );
		scene.add( buggyGroup );

		camPos = new THREE.Vector3( SPAWN.x, 60, SPAWN.y + 130 );

		// ---------- input ----------
		window.addEventListener( 'keydown', onKey, true );
		window.addEventListener( 'keyup', onKey, true );
		renderer.domElement.addEventListener( 'click', function () { stage.focus(); } );

		if ( hudEl ) { hudEl.hidden = false; hudEl.textContent = '3D beta · WASD drives · Esc hops out'; }
		if ( chipEl ) chipEl.hidden = true;
		stage.focus();

		// keep the canvas matched to the stage (incl. fullscreen toggles)
		if ( window.ResizeObserver ) {
			new ResizeObserver( function () {
				var w = stage.clientWidth, h = stage.clientHeight;
				if ( ! w || ! h ) return;
				renderer.setSize( w, h );
				camera.aspect = w / h;
				camera.updateProjectionMatrix();
			} ).observe( stage );
		}

		clock = new THREE.Clock();
		renderer.setAnimationLoop( tick );
	}

	function onKey( e ) {
		if ( document.activeElement !== stage ) return;
		var k = e.key.toLowerCase();
		var map = { w: 'up', arrowup: 'up', s: 'down', arrowdown: 'down',
			a: 'left', arrowleft: 'left', d: 'right', arrowright: 'right', escape: 'esc' };
		if ( ! ( k in map ) ) return;
		e.preventDefault();
		keys[ map[ k ] ] = ( e.type === 'keydown' );
		if ( keys.esc ) stage.blur();
	}

	/* ------------------------------------------------------------------ *
	 *  Simulation — same fixed-step + tuned handling as the 2D board
	 * ------------------------------------------------------------------ */
	function tick() {
		if ( document.hidden ) return;
		accMS = Math.min( accMS + clock.getDelta() * 1000, 100 );
		while ( accMS >= 16.666 ) {
			control();
			Matter.Engine.update( engine, 16.666 );
			accMS -= 16.666;
		}
		render();
	}

	var steerInput = 0, throttleInput = 0;
	function control() {
		var b = buggyBody;
		var heading = { x: Math.cos( b.angle ), y: Math.sin( b.angle ) };
		b.frictionAir = 0.14;

		throttleInput = ( keys.up ? 1 : 0 ) - ( keys.down ? 0.65 : 0 );
		steerInput = ( keys.right ? 1 : 0 ) - ( keys.left ? 1 : 0 );

		Matter.Body.setAngularVelocity( b, steerInput * 0.072 );

		var power = 0.0026;
		if ( throttleInput ) {
			Matter.Body.applyForce( b, b.position,
				{ x: heading.x * power * throttleInput * b.mass, y: heading.y * power * throttleInput * b.mass } );
		}

		var v = b.velocity;
		var fwd = v.x * heading.x + v.y * heading.y;
		var lat = { x: -heading.y, y: heading.x };
		var latSpeed = v.x * lat.x + v.y * lat.y;
		var grip = 0.76;
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
		var sp = Math.hypot( b.velocity.x, b.velocity.y );

		// buggy pose: Matter (x, y) → Three (x, z)
		buggyGroup.position.set( b.position.x, 0, b.position.y );
		buggyGroup.rotation.y = -b.angle;

		// faked suspension: roll into the steer, pitch under throttle
		chassisGroup.rotation.x += ( ( steerInput * -0.08 * Math.min( 1, sp / 3 ) ) - chassisGroup.rotation.x ) * 0.15;
		chassisGroup.rotation.z += ( ( throttleInput * -0.05 ) - chassisGroup.rotation.z ) * 0.12;

		// wheels spin with ground speed
		for ( var i = 0; i < wheels.length; i++ ) wheels[ i ].rotation.z -= sp * 0.09;

		blobShadow.position.set( b.position.x, 0.6, b.position.y );

		// hay bales follow their bodies
		for ( var j = 0; j < bales.length; j++ ) {
			bales[ j ].mesh.position.set( bales[ j ].body.position.x, 9, bales[ j ].body.position.y );
			bales[ j ].mesh.rotation.y = -bales[ j ].body.angle;
		}

		// chase camera: sit behind the buggy's heading, look a touch ahead
		var hx = Math.cos( b.angle ), hy = Math.sin( b.angle );
		var tx = b.position.x - hx * 120, tz = b.position.y - hy * 120;
		camPos.x += ( tx - camPos.x ) * 0.06;
		camPos.z += ( tz - camPos.z ) * 0.06;
		camPos.y += ( ( 62 + sp * 3 ) - camPos.y ) * 0.06; // lifts slightly with speed
		camera.position.copy( camPos );
		camera.lookAt( b.position.x + hx * 40, 6, b.position.y + hy * 40 );

		renderer.render( scene, camera );
	}

	/* ------------------------------------------------------------------ *
	 *  Low-poly builders
	 * ------------------------------------------------------------------ */
	function buildBuggy( THREE ) {
		var g = new THREE.Group();

		chassisGroup = new THREE.Group();
		chassisGroup.position.y = 10;
		g.add( chassisGroup );

		var bodyMat = new THREE.MeshLambertMaterial( { color: 0x8a3a22 } );
		var darkMat = new THREE.MeshLambertMaterial( { color: 0x1c1512 } );
		var chassis = new THREE.Mesh( new THREE.BoxGeometry( 44, 10, 26 ), bodyMat );
		chassis.position.y = 2;
		chassisGroup.add( chassis );
		var hood = new THREE.Mesh( new THREE.BoxGeometry( 16, 7, 22 ), bodyMat );
		hood.position.set( 13, 6, 0 );
		chassisGroup.add( hood );
		// roll cage
		var cage = new THREE.Mesh( new THREE.BoxGeometry( 16, 14, 20 ), new THREE.MeshLambertMaterial( { color: 0x2a211b } ) );
		cage.position.set( -6, 12, 0 );
		chassisGroup.add( cage );
		var seatGlow = new THREE.Mesh( new THREE.BoxGeometry( 10, 4, 12 ), new THREE.MeshLambertMaterial( { color: 0x3a2c20 } ) );
		seatGlow.position.set( -6, 8, 0 );
		chassisGroup.add( seatGlow );

		// wheels — big knobbly cylinders, axles along local z
		var wheelGeo = new THREE.CylinderGeometry( 8, 8, 6, 12 );
		wheelGeo.rotateX( Math.PI / 2 );
		var positions = [ [ 15, 8, 15 ], [ 15, 8, -15 ], [ -15, 8, 15 ], [ -15, 8, -15 ] ];
		for ( var i = 0; i < 4; i++ ) {
			var w = new THREE.Mesh( wheelGeo, darkMat );
			w.position.set( positions[ i ][ 0 ], positions[ i ][ 1 ], positions[ i ][ 2 ] );
			g.add( w );
			wheels.push( w );
		}

		// headlights: two warm spotlights + lamp blocks
		var lampMat = new THREE.MeshBasicMaterial( { color: 0xffe9c9 } );
		[ -8, 8 ].forEach( function ( z ) {
			var lamp = new THREE.Mesh( new THREE.BoxGeometry( 2.5, 3, 4 ), lampMat );
			lamp.position.set( 22, 10, z );
			g.add( lamp );
			var spot = new THREE.SpotLight( 0xffd9a0, 1.1, 420, 0.5, 0.55, 1.2 );
			spot.position.set( 22, 12, z );
			spot.target.position.set( 260, -4, z * 3 );
			g.add( spot );
			g.add( spot.target );
		} );

		// soft blob shadow grounds it (cheaper than real shadow maps)
		blobShadow = new THREE.Mesh(
			new THREE.CircleGeometry( 26, 20 ),
			new THREE.MeshBasicMaterial( { color: 0x000000, transparent: true, opacity: 0.32 } )
		);
		blobShadow.rotation.x = -Math.PI / 2;
		scene.add( blobShadow );

		return g;
	}

	function buildFence( THREE ) {
		var postMat = new THREE.MeshLambertMaterial( { color: 0x4a4034 } );
		var railGeo = null;
		function run( x0, z0, x1, z1 ) {
			var dx = x1 - x0, dz = z1 - z0;
			var len = Math.hypot( dx, dz ), n = Math.floor( len / 60 );
			for ( var i = 0; i <= n; i++ ) {
				var p = new THREE.Mesh( new THREE.BoxGeometry( 3, 16, 3 ), postMat );
				p.position.set( x0 + dx * ( i / n ), 8, z0 + dz * ( i / n ) );
				scene.add( p );
			}
			railGeo = new THREE.BoxGeometry( len, 2, 2 );
			[ 12, 6 ].forEach( function ( y ) {
				var rail = new THREE.Mesh( railGeo, postMat );
				rail.position.set( ( x0 + x1 ) / 2, y, ( z0 + z1 ) / 2 );
				rail.rotation.y = -Math.atan2( dz, dx );
				scene.add( rail );
			} );
		}
		run( 0, 0, W, 0 ); run( 0, H, W, H ); run( 0, 0, 0, H ); run( W, 0, W, H );
	}

	function buildTrees( THREE, statics ) {
		var trunkMat = new THREE.MeshLambertMaterial( { color: 0x2c2418 } );
		var leafMat = new THREE.MeshLambertMaterial( { color: 0x1d3a26 } );
		for ( var i = 0; i < 26; i++ ) {
			var x = 60 + Math.random() * ( W - 120 );
			var z = 60 + Math.random() * ( H - 120 );
			if ( Math.hypot( x - SPAWN.x, z - SPAWN.y ) < 140 ) continue; // clear the spawn
			var t = new THREE.Group();
			var trunk = new THREE.Mesh( new THREE.CylinderGeometry( 2.5, 3.5, 14, 6 ), trunkMat );
			trunk.position.y = 7;
			t.add( trunk );
			var h = 40 + Math.random() * 26;
			var cone = new THREE.Mesh( new THREE.ConeGeometry( 11 + Math.random() * 4, h, 7 ), leafMat );
			cone.position.y = 14 + h / 2;
			t.add( cone );
			t.position.set( x, 0, z );
			scene.add( t );
			var bodyT = Matter.Bodies.circle( x, z, 8, { isStatic: true } );
			Matter.Composite.add( engine.world, bodyT );
		}
	}

	function buildBales( THREE ) {
		var baleGeo = new THREE.CylinderGeometry( 9, 9, 16, 12 );
		baleGeo.rotateZ( Math.PI / 2 ); // lying on its side
		var baleMat = new THREE.MeshLambertMaterial( { color: 0x8f7a3e } );
		for ( var i = 0; i < 7; i++ ) {
			var x = 200 + Math.random() * ( W - 400 );
			var z = 120 + Math.random() * ( H - 240 );
			if ( Math.hypot( x - SPAWN.x, z - SPAWN.y ) < 120 ) continue;
			var mesh = new THREE.Mesh( baleGeo, baleMat );
			mesh.position.set( x, 9, z );
			scene.add( mesh );
			var body = Matter.Bodies.circle( x, z, 12, { frictionAir: 0.08, density: 0.0012 } );
			Matter.Composite.add( engine.world, body );
			bales.push( { body: body, mesh: mesh } );
		}
	}

	window.TCBackQuarter3D = { boot: boot };

} )();
