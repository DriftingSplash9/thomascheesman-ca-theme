/**
 * THE BACK QUARTER 3D — Path C (Bruno-Simon-style).
 * Spec: docs/QUARTER-SECTION-SPEC.md §8.
 *
 * 3D-P1.5 — SIGNS & THE FAMILY GATE (on top of P1's raised farm):
 * - Floating label sprites are GONE. Every destination now has a physical
 *   lantern-lit SIGNPOST at buggy eye-level, planted at its yard facing
 *   the road you arrive on (Thomas: labels were too high to read).
 * - The three treehouses live inside a FENCED COMPOUND with one gated
 *   road in — a parking-barrier arm. Family (tcVentures.bqFamily, set
 *   server-side from tc_user_is_family()) get the arm lifting as they
 *   approach; everyone else gets "locked — the family key opens it" and
 *   Enter goes to /family-login. The login gate, made diegetic.
 * - Roads rerouted around the compound (no path cuts through the grove).
 *
 * Carried architecture: physics is Matter 2D top-down (tuned handling,
 * 1280×720 world units, Matter (x,y) → Three (x,z)); render is the
 * vendored Three r128; loaded only via the /#bq3d beta button.
 *
 * ⭐ Verification limit: background/automation tabs freeze rAF/WebGL —
 * smoke-test = boots clean, zero console errors; feel is Thomas's drive.
 */
( function () {
	'use strict';

	var W = 1280, H = 720;
	var SPAWN = { x: 640, y: 600, angle: -Math.PI / 2 };
	var HUB = { x: 610, y: 470 };

	// The treehouse compound (the family yard) + its gated entry.
	var COMPOUND = { x0: 372, z0: 258, x1: 596, z1: 476, gateZ0: 428, gateZ1: 472 };
	var GATE = { x: 596, z: 450 };

	var LANDMARKS = [
		{ id: 'farmhouse', name: 'the farmhouse', x: 346, y: 168, w: 130, h: 80,
		  href: '/thomas', build: 'farmhouse', signTo: { x: 390, y: 215 },
		  prompt: 'The farmhouse — step inside, this is me' },
		{ id: 'cookshack', name: 'the cookshack', x: 640, y: 132, w: 70, h: 50,
		  href: '/about', build: 'cookshack', signTo: { x: 630, y: 175 },
		  prompt: 'The cookshack — my life on the line' },
		{ id: 'elevator', name: 'the grain elevator', x: 896, y: 196, w: 70, h: 70,
		  href: '/hcs', build: 'elevator', signTo: { x: 870, y: 235 },
		  prompt: 'The grain elevator — one of fewer than fifty' },
		{ id: 'church', name: 'the church', x: 198, y: 372, w: 70, h: 90,
		  href: '/heritage', build: 'church', signTo: { x: 330, y: 480 },
		  prompt: 'The church on the hill — eight family lines' },
		{ id: 'th1', name: 'a treehouse', x: 410, y: 296, w: 26, h: 26,
		  href: '/patience', build: 'treehouse',
		  prompt: 'A treehouse — needs the family key' },
		{ id: 'th2', name: 'a treehouse', x: 466, y: 366, w: 26, h: 26,
		  href: '/daniel', build: 'treehouse',
		  prompt: 'A treehouse — needs the family key' },
		{ id: 'th3', name: 'a treehouse', x: 535, y: 430, w: 26, h: 26,
		  href: '/faith', build: 'treehouse',
		  prompt: 'A treehouse — needs the family key' },
		{ id: 'radio', name: 'the radio mast', x: 1170, y: 360, w: 30, h: 30,
		  href: 'https://bareyourrare.org', external: true, build: 'mast', signTo: { x: 1135, y: 375 },
		  prompt: 'The radio mast — broadcasting beyond the fence' },
		{ id: 'barn', name: 'the arcade barn', x: 1011, y: 410, w: 120, h: 80,
		  href: null, build: 'barn', signTo: { x: 975, y: 425 },
		  prompt: 'The arcade barn — the games are moving in here soon' },
		{ id: 'shed', name: 'the old shed', x: 186, y: 552, w: 60, h: 44,
		  href: null, build: 'shed', signTo: { x: 230, y: 500 },
		  prompt: 'The shed is padlocked… but a drawer in the house opens' },
		{ id: 'mailbox', name: 'the mailbox', x: 574, y: 640, w: 10, h: 10,
		  href: null, build: 'mailbox',
		  prompt: 'Fresh mail soon — “recently added” lands here' }
	];

	// Dirt roads, rerouted AROUND the compound (nothing cuts the grove).
	var PATHS = [
		[ { x: 614, y: 660 }, HUB ],                      // gate road in
		[ HUB, { x: 400, y: 510 } ],                      // south loop…
		[ { x: 400, y: 510 }, { x: 245, y: 390 } ],       // …up to the church
		[ { x: 245, y: 390 }, { x: 215, y: 525 } ],       // church → shed
		[ HUB, { x: 630, y: 175 } ],                      // main north road (east of the grove)
		[ { x: 630, y: 175 }, { x: 390, y: 215 } ],       // north road west → farmhouse
		[ { x: 630, y: 175 }, { x: 870, y: 235 } ],       // → elevator
		[ HUB, { x: 975, y: 425 } ],                      // → barn
		[ { x: 975, y: 425 }, { x: 1135, y: 375 } ],      // barn → mast
		[ { x: 870, y: 235 }, { x: 975, y: 425 } ],       // elevator → barn
		[ HUB, { x: 604, y: 450 } ]                       // the family-gate spur
	];

	var stage, hudEl, chipEl;
	var renderer, scene, camera, clock;
	var Matter, engine, buggyBody;
	var buggyGroup, chassisGroup, wheels = [], blobShadow;
	var bales = [];
	var clickables = [];
	var mastLamp = null;
	var gateArm = null, gateBody = null, gateOpen = false, isFamily = false;
	var PROMPTS = [];
	var keys = {}, accMS = 0, nearLandmark = null;
	var camPos = null, raycaster = null, pointerNDC = null;

	function boot( stageEl ) {
		stage = stageEl;
		hudEl = stage.querySelector( '.bq-hud' );
		chipEl = stage.querySelector( '.bq-chip' );
		Matter = window.Matter;
		var THREE = window.THREE;
		isFamily = !! ( window.tcVentures && Number( window.tcVentures.bqFamily ) );

		// ---------- renderer / scene ----------
		renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.setPixelRatio( Math.min( window.devicePixelRatio || 1, 2 ) );
		renderer.setSize( stage.clientWidth, stage.clientHeight );
		renderer.domElement.className = 'bq-canvas';
		renderer.domElement.setAttribute( 'aria-hidden', 'true' );
		stage.appendChild( renderer.domElement );

		scene = new THREE.Scene();
		scene.background = new THREE.Color( 0x0a1220 );
		scene.fog = new THREE.Fog( 0x0a1220, 420, 1600 );

		camera = new THREE.PerspectiveCamera( 55, stage.clientWidth / stage.clientHeight, 1, 4000 );

		// ---------- light ----------
		scene.add( new THREE.AmbientLight( 0x24324a, 0.85 ) );
		scene.add( new THREE.HemisphereLight( 0x39506e, 0x141d14, 0.5 ) );
		var moon = new THREE.DirectionalLight( 0x9ec2e8, 0.75 );
		moon.position.set( -300, 500, -200 );
		scene.add( moon );
		var moonBall = new THREE.Mesh(
			new THREE.SphereGeometry( 60, 20, 20 ),
			new THREE.MeshBasicMaterial( { color: 0xdfe9f5, fog: false } )
		);
		moonBall.position.set( -700, 420, -900 );
		scene.add( moonBall );

		// ---------- ground / paths / ponds ----------
		var ground = new THREE.Mesh(
			new THREE.PlaneGeometry( 2600, 2000 ),
			new THREE.MeshLambertMaterial( { color: 0x16241a } )
		);
		ground.rotation.x = -Math.PI / 2;
		ground.position.set( W / 2, 0, H / 2 );
		scene.add( ground );

		buildStubble( THREE );
		buildPaths( THREE );
		buildPonds( THREE );

		// ---------- physics ----------
		engine = Matter.Engine.create();
		engine.gravity.x = 0; engine.gravity.y = 0;
		buggyBody = Matter.Bodies.rectangle( SPAWN.x, SPAWN.y, 46, 30, { frictionAir: 0.14, density: 0.002 } );
		Matter.Body.setAngle( buggyBody, SPAWN.angle );

		var statics = [], T = 40;
		statics.push( Matter.Bodies.rectangle( W / 2, 6, W, T, { isStatic: true } ) );
		statics.push( Matter.Bodies.rectangle( W / 2, H - 6, W, T, { isStatic: true } ) );
		statics.push( Matter.Bodies.rectangle( 6, H / 2, T, H, { isStatic: true } ) );
		statics.push( Matter.Bodies.rectangle( W - 6, H / 2, T, H, { isStatic: true } ) );
		LANDMARKS.forEach( function ( lm ) {
			if ( lm.build === 'treehouse' || lm.build === 'mailbox' ) {
				statics.push( Matter.Bodies.circle( lm.x, lm.y, 7, { isStatic: true } ) );
			} else {
				statics.push( Matter.Bodies.rectangle( lm.x, lm.y, lm.w, lm.h, { isStatic: true } ) );
			}
		} );
		Matter.Composite.add( engine.world, [ buggyBody ].concat( statics ) );

		// ---------- the farm ----------
		LANDMARKS.forEach( function ( lm ) { raiseLandmark( THREE, lm ); } );
		buildCompound( THREE );
		buildWindbreak( THREE );
		buildFence( THREE );
		buildGateway( THREE );
		buildTrees( THREE );
		buildBales( THREE );

		buggyGroup = buildBuggy( THREE );
		scene.add( buggyGroup );
		camPos = new THREE.Vector3( SPAWN.x, 60, SPAWN.y + 130 );

		// proximity prompts: all landmarks + the family gate itself
		PROMPTS = LANDMARKS.slice();
		PROMPTS.push( {
			id: 'familygate', name: 'the family gate', x: GATE.x + 6, y: GATE.z,
			href: isFamily ? null : '/family-login',
			prompt: isFamily
				? 'The gate lifts for you — welcome home'
				: 'The family gate — locked. The family key opens it'
		} );

		// ---------- input ----------
		window.addEventListener( 'keydown', onKey, true );
		window.addEventListener( 'keyup', onKey, true );
		raycaster = new THREE.Raycaster();
		pointerNDC = new THREE.Vector2();
		renderer.domElement.addEventListener( 'pointerdown', onClick );

		if ( hudEl ) { hudEl.hidden = false; hudEl.textContent = '3D beta · WASD drives · Enter steps inside · Esc hops out'; }
		stage.focus();

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
			a: 'left', arrowleft: 'left', d: 'right', arrowright: 'right',
			enter: 'enter', escape: 'esc' };
		if ( ! ( k in map ) ) return;
		e.preventDefault();
		var down = ( e.type === 'keydown' );
		keys[ map[ k ] ] = down;
		if ( down && map[ k ] === 'esc' ) stage.blur();
		if ( down && map[ k ] === 'enter' && nearLandmark ) enterLandmark( nearLandmark );
	}

	function onClick( e ) {
		stage.focus();
		var r = renderer.domElement.getBoundingClientRect();
		pointerNDC.set(
			( ( e.clientX - r.left ) / r.width ) * 2 - 1,
			-( ( e.clientY - r.top ) / r.height ) * 2 + 1
		);
		raycaster.setFromCamera( pointerNDC, camera );
		var hits = raycaster.intersectObjects( clickables, true );
		if ( ! hits.length ) return;
		var obj = hits[ 0 ].object;
		while ( obj && ! ( obj.userData && obj.userData.lm ) ) obj = obj.parent;
		if ( obj ) enterLandmark( obj.userData.lm );
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
	 *  Simulation
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
		var t = clock.elapsedTime;

		buggyGroup.position.set( b.position.x, 0, b.position.y );
		buggyGroup.rotation.y = -b.angle;
		chassisGroup.rotation.x += ( ( steerInput * -0.08 * Math.min( 1, sp / 3 ) ) - chassisGroup.rotation.x ) * 0.15;
		chassisGroup.rotation.z += ( ( throttleInput * -0.05 ) - chassisGroup.rotation.z ) * 0.12;
		for ( var i = 0; i < wheels.length; i++ ) wheels[ i ].rotation.z -= sp * 0.09;
		blobShadow.position.set( b.position.x, 0.6, b.position.y );

		for ( var j = 0; j < bales.length; j++ ) {
			bales[ j ].mesh.position.set( bales[ j ].body.position.x, 9, bales[ j ].body.position.y );
			bales[ j ].mesh.rotation.y = -bales[ j ].body.angle;
		}

		if ( mastLamp ) mastLamp.visible = ( Math.floor( t * 1.4 ) % 2 ) === 0;

		// the family gate: lifts for family as they approach; stays down otherwise
		if ( gateArm ) {
			var gd = Math.hypot( b.position.x - GATE.x, b.position.y - GATE.z );
			if ( isFamily && ! gateOpen && gd < 120 ) {
				gateOpen = true;
				if ( gateBody ) Matter.Composite.remove( engine.world, gateBody );
			}
			var target = gateOpen ? -1.25 : 0;
			gateArm.rotation.x += ( target - gateArm.rotation.x ) * 0.06;
		}

		// nearest in-range prompt drives the chip
		var near = null, nearD = 1e9;
		for ( var p = 0; p < PROMPTS.length; p++ ) {
			var lm = PROMPTS[ p ];
			var d = Math.hypot( b.position.x - lm.x, b.position.y - lm.y );
			var range = lm.id === 'familygate' ? 130 : 170;
			if ( d < range && d < nearD ) { near = lm; nearD = d; }
		}
		if ( near !== nearLandmark ) {
			nearLandmark = near;
			if ( chipEl ) {
				chipEl.hidden = ! near;
				if ( near ) chipEl.textContent = near.prompt + ( near.href ? '  · Enter ↵' : '' );
			}
		}

		// chase camera
		var hx = Math.cos( b.angle ), hy = Math.sin( b.angle );
		var tx = b.position.x - hx * 120, tz = b.position.y - hy * 120;
		camPos.x += ( tx - camPos.x ) * 0.06;
		camPos.z += ( tz - camPos.z ) * 0.06;
		camPos.y += ( ( 62 + sp * 3 ) - camPos.y ) * 0.06;
		camera.position.copy( camPos );
		camera.lookAt( b.position.x + hx * 40, 6, b.position.y + hy * 40 );

		renderer.render( scene, camera );
	}

	/* ------------------------------------------------------------------ *
	 *  Shared low-poly helpers
	 * ------------------------------------------------------------------ */
	function mat( THREE, color ) { return new THREE.MeshLambertMaterial( { color: color } ); }

	function addWindow( THREE, group, w, h, x, y, z, rotY ) {
		var pane = new THREE.Mesh(
			new THREE.PlaneGeometry( w, h ),
			new THREE.MeshBasicMaterial( { color: 0xffb65e } )
		);
		pane.position.set( x, y, z );
		if ( rotY ) pane.rotation.y = rotY;
		group.add( pane );
	}

	function addGlowDisc( THREE, x, z, r, opacity ) {
		var disc = new THREE.Mesh(
			new THREE.CircleGeometry( r, 24 ),
			new THREE.MeshBasicMaterial( { color: 0xff9c46, transparent: true, opacity: opacity } )
		);
		disc.rotation.x = -Math.PI / 2;
		disc.position.set( x, 0.5, z );
		scene.add( disc );
	}

	function gableRoof( THREE, len, halfWidth, color ) {
		var geo = new THREE.CylinderGeometry( halfWidth, halfWidth, len, 3 );
		geo.rotateZ( Math.PI / 2 );
		return new THREE.Mesh( geo, mat( THREE, color ) );
	}

	/* ------------------------------------------------------------------ *
	 *  Lantern-lit signposts — eye-level wayfinding (replaces sprites)
	 * ------------------------------------------------------------------ */
	function buildSign( THREE, text, px, pz, faceX, faceZ ) {
		var c = document.createElement( 'canvas' );
		var ctx = c.getContext( '2d' );
		ctx.font = '600 40px Georgia, serif';
		var wpx = Math.ceil( ctx.measureText( text ).width ) + 44;
		c.width = wpx; c.height = 64;
		ctx = c.getContext( '2d' );
		ctx.fillStyle = '#2a1f14'; // lantern-lit dark wood
		ctx.fillRect( 0, 0, wpx, 64 );
		ctx.strokeStyle = 'rgba(255, 205, 140, 0.55)';
		ctx.lineWidth = 4;
		ctx.strokeRect( 4, 4, wpx - 8, 56 );
		ctx.font = '600 40px Georgia, serif';
		ctx.fillStyle = '#ffe3b0';
		ctx.fillText( text, 22, 45 );

		// Ranch-driveway archway: two tall posts, an overhead crossbeam sign
		// you could drive under, DOUBLE-SIDED so it reads from any approach.
		var bw = Math.max( 34, Math.min( 88, wpx * 0.24 ) );
		var g = new THREE.Group();
		var wood = mat( THREE, 0x3a2c1c );
		[ -1, 1 ].forEach( function ( s ) {
			var post = new THREE.Mesh( new THREE.BoxGeometry( 3.2, 32, 3.2 ), wood );
			post.position.set( s * ( bw / 2 + 4 ), 16, 0 );
			g.add( post );
		} );
		var frame = new THREE.Mesh( new THREE.BoxGeometry( bw + 12, 12.5, 2 ), wood );
		frame.position.y = 33;
		g.add( frame );
		var tex = new THREE.CanvasTexture( c );
		[ 1, -1 ].forEach( function ( side ) {
			var face = new THREE.Mesh(
				new THREE.PlaneGeometry( bw, 10.5 ),
				new THREE.MeshBasicMaterial( { map: tex } )
			);
			face.position.set( 0, 33, side * 1.15 );
			if ( side < 0 ) face.rotation.y = Math.PI; // back face, unmirrored
			g.add( face );
		} );
		// the lantern on the ridge
		var lantern = new THREE.Mesh( new THREE.BoxGeometry( 3.4, 3.8, 3.4 ),
			new THREE.MeshBasicMaterial( { color: 0xffd9a0 } ) );
		lantern.position.y = 41.2;
		g.add( lantern );
		var cap = new THREE.Mesh( new THREE.ConeGeometry( 3.2, 2.8, 4 ), mat( THREE, 0x1c1512 ) );
		cap.position.y = 44.4;
		cap.rotation.y = Math.PI / 4;
		g.add( cap );

		g.position.set( px, 0, pz );
		g.rotation.y = Math.atan2( faceX - px, faceZ - pz ); // face the road
		scene.add( g );
		addGlowDisc( THREE, px, pz, 16, 0.09 );
		return g;
	}

	function raiseLandmark( THREE, lm ) {
		var g;
		switch ( lm.build ) {
			case 'farmhouse': g = buildFarmhouse( THREE ); break;
			case 'cookshack': g = buildCookshack( THREE ); break;
			case 'elevator': g = buildElevator( THREE ); break;
			case 'church': g = buildChurch( THREE ); break;
			case 'treehouse': g = buildTreehouse( THREE ); break;
			case 'mast': g = buildMast( THREE ); break;
			case 'barn': g = buildBarnHouse( THREE ); break;
			case 'shed': g = buildShed( THREE ); break;
			case 'mailbox': g = buildMailboxPost( THREE ); break;
		}
		g.position.set( lm.x, 0, lm.y );
		g.userData.lm = lm;
		scene.add( g );
		clickables.push( g );

		// eye-level signpost at the yard, facing its road
		if ( lm.signTo ) {
			var dx = lm.signTo.x - lm.x, dz = lm.signTo.y - lm.y;
			var dl = Math.hypot( dx, dz ) || 1;
			var off = Math.max( lm.w, lm.h ) / 2 + 30;
			var sign = buildSign( THREE, lm.name,
				lm.x + ( dx / dl ) * off, lm.y + ( dz / dl ) * off,
				lm.signTo.x, lm.signTo.y );
			sign.userData.lm = lm; // the sign is clickable too
			clickables.push( sign );
		}
	}

	/* ------------------------------------------------------------------ *
	 *  The family compound (fence + gated road + barrier arm)
	 * ------------------------------------------------------------------ */
	function buildCompound( THREE ) {
		// visual fence, leaving the gate opening on the east edge
		fenceRun( THREE, COMPOUND.x0, COMPOUND.z0, COMPOUND.x1, COMPOUND.z0 );
		fenceRun( THREE, COMPOUND.x0, COMPOUND.z0, COMPOUND.x0, COMPOUND.z1 );
		fenceRun( THREE, COMPOUND.x0, COMPOUND.z1, COMPOUND.x1, COMPOUND.z1 );
		fenceRun( THREE, COMPOUND.x1, COMPOUND.z0, COMPOUND.x1, COMPOUND.gateZ0 );

		// physics walls (thin statics along each fence line)
		var cx = ( COMPOUND.x0 + COMPOUND.x1 ) / 2;
		var cz = ( COMPOUND.z0 + COMPOUND.z1 ) / 2;
		var wReg = COMPOUND.x1 - COMPOUND.x0, hReg = COMPOUND.z1 - COMPOUND.z0;
		var walls = [
			Matter.Bodies.rectangle( cx, COMPOUND.z0, wReg, 6, { isStatic: true } ),
			Matter.Bodies.rectangle( cx, COMPOUND.z1, wReg, 6, { isStatic: true } ),
			Matter.Bodies.rectangle( COMPOUND.x0, cz, 6, hReg, { isStatic: true } ),
			Matter.Bodies.rectangle( COMPOUND.x1, ( COMPOUND.z0 + COMPOUND.gateZ0 ) / 2, 6,
				COMPOUND.gateZ0 - COMPOUND.z0, { isStatic: true } )
		];
		Matter.Composite.add( engine.world, walls );

		// gate posts
		var postMat = mat( THREE, 0x59554c );
		[ COMPOUND.gateZ0, COMPOUND.gateZ1 ].forEach( function ( z ) {
			var p = new THREE.Mesh( new THREE.BoxGeometry( 6, 20, 6 ), postMat );
			p.position.set( COMPOUND.x1, 10, z );
			scene.add( p );
		} );

		// the barrier arm — pivots at the north post, swings up for family
		var armGeo = new THREE.BoxGeometry( 2.4, 2.6, COMPOUND.gateZ1 - COMPOUND.gateZ0 - 4 );
		armGeo.translate( 0, 0, ( COMPOUND.gateZ1 - COMPOUND.gateZ0 - 4 ) / 2 );
		gateArm = new THREE.Mesh( armGeo, mat( THREE, 0xb8352c ) );
		gateArm.position.set( COMPOUND.x1, 12, COMPOUND.gateZ0 + 2 );
		scene.add( gateArm );
		gateBody = Matter.Bodies.rectangle( GATE.x, GATE.z, 10,
			COMPOUND.gateZ1 - COMPOUND.gateZ0, { isStatic: true } );
		Matter.Composite.add( engine.world, gateBody );

		// the compound sign, beside the gate facing the spur road
		buildSign( THREE, 'the treehouses · family only',
			COMPOUND.x1 + 22, COMPOUND.gateZ0 - 12, HUB.x + 30, HUB.y );

		// warm lamp over the gate
		var lamp = new THREE.Mesh( new THREE.BoxGeometry( 3.4, 4, 3.4 ),
			new THREE.MeshBasicMaterial( { color: 0xffd9a0 } ) );
		lamp.position.set( COMPOUND.x1, 22, COMPOUND.gateZ0 );
		scene.add( lamp );
		addGlowDisc( THREE, GATE.x + 8, GATE.z, 26, 0.08 );
	}

	/* ------------------------------------------------------------------ *
	 *  The buildings (unchanged from 3D-P1)
	 * ------------------------------------------------------------------ */
	function buildFarmhouse( THREE ) {
		var g = new THREE.Group();
		var walls = new THREE.Mesh( new THREE.BoxGeometry( 110, 34, 64 ), mat( THREE, 0x4a3a2c ) );
		walls.position.y = 17;
		g.add( walls );
		var roof = gableRoof( THREE, 118, 40, 0x2b2119 );
		roof.position.y = 44;
		g.add( roof );
		var porch = new THREE.Mesh( new THREE.BoxGeometry( 60, 3, 20 ), mat( THREE, 0x3a2e22 ) );
		porch.position.set( 0, 1.5, 42 );
		g.add( porch );
		var awning = new THREE.Mesh( new THREE.BoxGeometry( 60, 2, 22 ), mat( THREE, 0x2b2119 ) );
		awning.position.set( 0, 26, 42 );
		g.add( awning );
		[ -24, 24 ].forEach( function ( px ) {
			var post = new THREE.Mesh( new THREE.BoxGeometry( 3, 24, 3 ), mat( THREE, 0x3a2e22 ) );
			post.position.set( px, 13, 50 );
			g.add( post );
		} );
		var chim = new THREE.Mesh( new THREE.BoxGeometry( 8, 26, 8 ), mat( THREE, 0x59493c ) );
		chim.position.set( 34, 58, -8 );
		g.add( chim );
		addWindow( THREE, g, 12, 10, -30, 18, 32.2 );
		addWindow( THREE, g, 12, 10, 0, 18, 32.2 );
		addWindow( THREE, g, 12, 10, 30, 18, 32.2 );
		addWindow( THREE, g, 10, 9, 55.2, 18, 0, Math.PI / 2 );
		addGlowDisc( THREE, 346, 168 + 48, 62, 0.10 );
		return g;
	}

	function buildCookshack( THREE ) {
		var g = new THREE.Group();
		var walls = new THREE.Mesh( new THREE.BoxGeometry( 56, 26, 40 ), mat( THREE, 0x54402e ) );
		walls.position.y = 13;
		g.add( walls );
		var roof = gableRoof( THREE, 62, 26, 0x33261a );
		roof.position.y = 33;
		g.add( roof );
		var chim = new THREE.Mesh( new THREE.CylinderGeometry( 3, 3, 20, 8 ), mat( THREE, 0x59493c ) );
		chim.position.set( 18, 42, 6 );
		g.add( chim );
		addWindow( THREE, g, 24, 12, 0, 14, 20.2 );
		addWindow( THREE, g, 9, 9, -28.2, 13, 0, -Math.PI / 2 );
		addGlowDisc( THREE, 640, 132 + 32, 48, 0.10 );
		return g;
	}

	function buildElevator( THREE ) {
		var g = new THREE.Group();
		var tower = new THREE.Mesh( new THREE.BoxGeometry( 46, 120, 46 ), mat( THREE, 0x4e4438 ) );
		tower.position.y = 60;
		g.add( tower );
		var cap = gableRoof( THREE, 50, 30, 0x2f281f );
		cap.position.y = 130;
		g.add( cap );
		var annex = new THREE.Mesh( new THREE.BoxGeometry( 34, 44, 30 ), mat( THREE, 0x453b30 ) );
		annex.position.set( 34, 22, 10 );
		g.add( annex );
		var silo = new THREE.Mesh( new THREE.CylinderGeometry( 12, 12, 52, 10 ), mat( THREE, 0x5a5148 ) );
		silo.position.set( -36, 26, 14 );
		g.add( silo );
		addWindow( THREE, g, 8, 10, 0, 96, 23.2 );
		addWindow( THREE, g, 12, 14, 0, 12, 23.2 );
		addGlowDisc( THREE, 896, 196 + 34, 44, 0.09 );
		return g;
	}

	function buildChurch( THREE ) {
		var g = new THREE.Group();
		var mound = new THREE.Mesh( new THREE.CylinderGeometry( 78, 92, 10, 18 ), mat( THREE, 0x1c2d20 ) );
		mound.position.y = 5;
		g.add( mound );
		var nave = new THREE.Mesh( new THREE.BoxGeometry( 46, 30, 70 ), mat( THREE, 0xcfd2cd ) );
		nave.position.y = 25;
		g.add( nave );
		var roof = gableRoof( THREE, 76, 26, 0x3a4048 );
		roof.position.y = 44;
		roof.rotation.y = Math.PI / 2;
		g.add( roof );
		var tower = new THREE.Mesh( new THREE.BoxGeometry( 16, 34, 16 ), mat( THREE, 0xcfd2cd ) );
		tower.position.set( 0, 42, 40 );
		g.add( tower );
		var spire = new THREE.Mesh( new THREE.ConeGeometry( 11, 22, 4 ), mat( THREE, 0x3a4048 ) );
		spire.position.set( 0, 70, 40 );
		spire.rotation.y = Math.PI / 4;
		g.add( spire );
		addWindow( THREE, g, 8, 14, -23.2, 24, 0, -Math.PI / 2 );
		addWindow( THREE, g, 8, 14, 23.2, 24, 0, Math.PI / 2 );
		addWindow( THREE, g, 10, 16, 0, 24, 75.2 );
		addGlowDisc( THREE, 198, 372 + 52, 54, 0.10 );
		return g;
	}

	function buildTreehouse( THREE ) {
		var g = new THREE.Group();
		[ [ -10, -6 ], [ 12, 4 ], [ -2, 10 ] ].forEach( function ( p ) {
			var trunk = new THREE.Mesh( new THREE.CylinderGeometry( 2.5, 3.5, 44, 6 ), mat( THREE, 0x2c2418 ) );
			trunk.position.set( p[ 0 ], 22, p[ 1 ] );
			g.add( trunk );
			var cone = new THREE.Mesh( new THREE.ConeGeometry( 11, 46, 7 ), mat( THREE, 0x1d3a26 ) );
			cone.position.set( p[ 0 ], 62, p[ 1 ] );
			g.add( cone );
		} );
		var cabin = new THREE.Mesh( new THREE.BoxGeometry( 22, 16, 18 ), mat( THREE, 0x4a3a28 ) );
		cabin.position.y = 40;
		g.add( cabin );
		var roof = gableRoof( THREE, 26, 13, 0x33261a );
		roof.position.y = 52;
		g.add( roof );
		var ladder = new THREE.Mesh( new THREE.BoxGeometry( 2, 34, 6 ), mat( THREE, 0x3a2e22 ) );
		ladder.position.set( 12, 17, 0 );
		g.add( ladder );
		addWindow( THREE, g, 8, 7, 0, 40, 9.2 );
		return g;
	}

	function buildMast( THREE ) {
		var g = new THREE.Group();
		var tower = new THREE.Mesh( new THREE.CylinderGeometry( 1.6, 7, 150, 4, 1, true ),
			new THREE.MeshLambertMaterial( { color: 0x6a7076, wireframe: true } ) );
		tower.position.y = 75;
		g.add( tower );
		var spine = new THREE.Mesh( new THREE.CylinderGeometry( 0.9, 0.9, 150, 4 ), mat( THREE, 0x8a9096 ) );
		spine.position.y = 75;
		g.add( spine );
		mastLamp = new THREE.Mesh( new THREE.SphereGeometry( 3.4, 8, 8 ),
			new THREE.MeshBasicMaterial( { color: 0xff3b30 } ) );
		mastLamp.position.y = 154;
		g.add( mastLamp );
		return g;
	}

	function buildBarnHouse( THREE ) {
		var g = new THREE.Group();
		var walls = new THREE.Mesh( new THREE.BoxGeometry( 100, 40, 66 ), mat( THREE, 0x7a2b22 ) );
		walls.position.y = 20;
		g.add( walls );
		var roof = gableRoof( THREE, 108, 42, 0x3a2c24 );
		roof.position.y = 52;
		g.add( roof );
		var door = new THREE.Mesh( new THREE.PlaneGeometry( 30, 28 ), mat( THREE, 0x571f18 ) );
		door.position.set( 0, 15, 33.2 );
		g.add( door );
		addWindow( THREE, g, 10, 9, -34, 26, 33.2 );
		addWindow( THREE, g, 10, 9, 34, 26, 33.2 );
		addWindow( THREE, g, 9, 8, 50.2, 22, 0, Math.PI / 2 );
		addGlowDisc( THREE, 1011, 410 + 46, 56, 0.10 );
		return g;
	}

	function buildShed( THREE ) {
		var g = new THREE.Group();
		var walls = new THREE.Mesh( new THREE.BoxGeometry( 48, 22, 36 ), mat( THREE, 0x3c342a ) );
		walls.position.y = 11;
		g.add( walls );
		var roof = gableRoof( THREE, 54, 22, 0x2a231b );
		roof.position.y = 28;
		g.add( roof );
		var door = new THREE.Mesh( new THREE.PlaneGeometry( 12, 16 ), mat( THREE, 0x171310 ) );
		door.position.set( 0, 9, 18.2 );
		g.add( door );
		return g;
	}

	function buildMailboxPost( THREE ) {
		var g = new THREE.Group();
		var post = new THREE.Mesh( new THREE.BoxGeometry( 3, 22, 3 ), mat( THREE, 0x4a4034 ) );
		post.position.y = 11;
		g.add( post );
		var box = new THREE.Mesh( new THREE.BoxGeometry( 12, 8, 8 ), mat( THREE, 0x39424c ) );
		box.position.y = 24;
		g.add( box );
		return g;
	}

	/* ------------------------------------------------------------------ *
	 *  Grounds & dressing
	 * ------------------------------------------------------------------ */
	function inCompound( x, z, pad ) {
		return x > COMPOUND.x0 - pad && x < COMPOUND.x1 + pad &&
		       z > COMPOUND.z0 - pad && z < COMPOUND.z1 + pad;
	}

	function farFromLandmarks( x, z, min ) {
		for ( var i = 0; i < LANDMARKS.length; i++ ) {
			if ( Math.hypot( x - LANDMARKS[ i ].x, z - LANDMARKS[ i ].y ) < min ) return false;
		}
		return true;
	}

	function buildStubble( THREE ) {
		var stripMat = new THREE.MeshLambertMaterial( { color: 0x3d3a24 } );
		var placed = 0, guard = 0;
		while ( placed < 8 && guard++ < 80 ) {
			var x = 120 + Math.random() * ( W - 240 );
			var z = 100 + Math.random() * ( H - 200 );
			if ( ! farFromLandmarks( x, z, 130 ) || inCompound( x, z, 40 ) ) continue;
			var strip = new THREE.Mesh(
				new THREE.PlaneGeometry( 170 + Math.random() * 150, 80 + Math.random() * 60 ), stripMat );
			strip.rotation.x = -Math.PI / 2;
			strip.rotation.z = ( Math.random() - 0.5 ) * 0.5;
			strip.position.set( x, 0.3, z );
			scene.add( strip );
			placed++;
		}
	}

	function buildPaths( THREE ) {
		var pathMat = new THREE.MeshLambertMaterial( { color: 0x4a3b28 } );
		PATHS.forEach( function ( seg ) {
			var a = seg[ 0 ], b = seg[ 1 ];
			var dx = b.x - a.x, dz = b.y - a.y;
			var len = Math.hypot( dx, dz );
			var strip = new THREE.Mesh( new THREE.PlaneGeometry( len + 26, 30 ), pathMat );
			strip.rotation.x = -Math.PI / 2;
			strip.rotation.z = -Math.atan2( dz, dx );
			strip.position.set( ( a.x + b.x ) / 2, 0.4, ( a.y + b.y ) / 2 );
			scene.add( strip );
		} );
	}

	function buildPonds( THREE ) {
		var pondMat = new THREE.MeshLambertMaterial( { color: 0x274c6e, emissive: 0x0c1f30 } );
		[ [ 1055, 295, 40 ], [ 1145, 590, 34 ], [ 950, 555, 30 ] ].forEach( function ( p ) {
			var pond = new THREE.Mesh( new THREE.CircleGeometry( p[ 2 ], 18 ), pondMat );
			pond.rotation.x = -Math.PI / 2;
			pond.position.set( p[ 0 ], 0.35, p[ 1 ] );
			pond.scale.x = 1.35;
			scene.add( pond );
		} );
	}

	function buildWindbreak( THREE ) {
		var trunkMat = mat( THREE, 0x2c2418 );
		var leafMat = mat( THREE, 0x1d3a26 );
		for ( var i = 0; i < 12; i++ ) {
			var f = i / 11;
			var x = 385 + f * 195 + ( Math.random() - 0.5 ) * 26;
			var z = 270 + f * 190 + ( Math.random() - 0.5 ) * 26;
			var trunk = new THREE.Mesh( new THREE.CylinderGeometry( 2.5, 3.5, 16, 6 ), trunkMat );
			trunk.position.set( x, 8, z );
			scene.add( trunk );
			var h = 44 + Math.random() * 24;
			var cone = new THREE.Mesh( new THREE.ConeGeometry( 10 + Math.random() * 4, h, 7 ), leafMat );
			cone.position.set( x, 16 + h / 2, z );
			scene.add( cone );
			Matter.Composite.add( engine.world, Matter.Bodies.circle( x, z, 7, { isStatic: true } ) );
		}
	}

	function fenceRun( THREE, x0, z0, x1, z1 ) {
		var postMat = mat( THREE, 0x4a4034 );
		var dx = x1 - x0, dz = z1 - z0;
		var len = Math.hypot( dx, dz ), n = Math.max( 1, Math.floor( len / 60 ) );
		for ( var i = 0; i <= n; i++ ) {
			var p = new THREE.Mesh( new THREE.BoxGeometry( 3, 16, 3 ), postMat );
			p.position.set( x0 + dx * ( i / n ), 8, z0 + dz * ( i / n ) );
			scene.add( p );
		}
		[ 12, 6 ].forEach( function ( y ) {
			var rail = new THREE.Mesh( new THREE.BoxGeometry( len, 2, 2 ), postMat );
			rail.position.set( ( x0 + x1 ) / 2, y, ( z0 + z1 ) / 2 );
			rail.rotation.y = -Math.atan2( dz, dx );
			scene.add( rail );
		} );
	}

	function buildFence( THREE ) {
		fenceRun( THREE, 0, 0, W, 0 );
		fenceRun( THREE, 0, H, W, H );
		fenceRun( THREE, 0, 0, 0, H );
		fenceRun( THREE, W, 0, W, H );
	}

	function buildGateway( THREE ) {
		var stone = mat( THREE, 0x59554c );
		[ 585, 645 ].forEach( function ( x ) {
			var pillar = new THREE.Mesh( new THREE.BoxGeometry( 10, 26, 10 ), stone );
			pillar.position.set( x, 13, H - 6 );
			scene.add( pillar );
		} );
		var bar = new THREE.Mesh( new THREE.BoxGeometry( 64, 3, 3 ), mat( THREE, 0x4a4034 ) );
		bar.position.set( 615, 27, H - 6 );
		scene.add( bar );
		var lantern = new THREE.Mesh( new THREE.BoxGeometry( 4, 5, 4 ),
			new THREE.MeshBasicMaterial( { color: 0xffd9a0 } ) );
		lantern.position.set( 615, 31, H - 6 );
		scene.add( lantern );
		addGlowDisc( THREE, 615, H - 30, 34, 0.08 );
	}

	function buildTrees( THREE ) {
		var trunkMat = mat( THREE, 0x2c2418 );
		var leafMat = mat( THREE, 0x1d3a26 );
		var placed = 0, guard = 0;
		while ( placed < 14 && guard++ < 90 ) {
			var x = 60 + Math.random() * ( W - 120 );
			var z = 60 + Math.random() * ( H - 120 );
			if ( Math.hypot( x - SPAWN.x, z - SPAWN.y ) < 140 ) continue;
			if ( ! farFromLandmarks( x, z, 110 ) || inCompound( x, z, 30 ) ) continue;
			var trunk = new THREE.Mesh( new THREE.CylinderGeometry( 2.5, 3.5, 14, 6 ), trunkMat );
			trunk.position.set( x, 7, z );
			scene.add( trunk );
			var h = 40 + Math.random() * 26;
			var cone = new THREE.Mesh( new THREE.ConeGeometry( 11 + Math.random() * 4, h, 7 ), leafMat );
			cone.position.set( x, 14 + h / 2, z );
			scene.add( cone );
			Matter.Composite.add( engine.world, Matter.Bodies.circle( x, z, 8, { isStatic: true } ) );
			placed++;
		}
	}

	function buildBales( THREE ) {
		var baleGeo = new THREE.CylinderGeometry( 9, 9, 16, 12 );
		baleGeo.rotateZ( Math.PI / 2 );
		var baleMat = mat( THREE, 0x8f7a3e );
		var placed = 0, guard = 0;
		while ( placed < 7 && guard++ < 70 ) {
			var x = 200 + Math.random() * ( W - 400 );
			var z = 120 + Math.random() * ( H - 240 );
			if ( Math.hypot( x - SPAWN.x, z - SPAWN.y ) < 120 ) continue;
			if ( ! farFromLandmarks( x, z, 110 ) || inCompound( x, z, 30 ) ) continue;
			var mesh = new THREE.Mesh( baleGeo, baleMat );
			mesh.position.set( x, 9, z );
			scene.add( mesh );
			var body = Matter.Bodies.circle( x, z, 12, { frictionAir: 0.08, density: 0.0012 } );
			Matter.Composite.add( engine.world, body );
			bales.push( { body: body, mesh: mesh } );
			placed++;
		}
	}

	/* ------------------------------------------------------------------ *
	 *  The buggy (unchanged)
	 * ------------------------------------------------------------------ */
	function buildBuggy( THREE ) {
		var g = new THREE.Group();

		chassisGroup = new THREE.Group();
		chassisGroup.position.y = 10;
		g.add( chassisGroup );

		var bodyMat = mat( THREE, 0x8a3a22 );
		var darkMat = mat( THREE, 0x1c1512 );
		var chassis = new THREE.Mesh( new THREE.BoxGeometry( 44, 10, 26 ), bodyMat );
		chassis.position.y = 2;
		chassisGroup.add( chassis );
		var hood = new THREE.Mesh( new THREE.BoxGeometry( 16, 7, 22 ), bodyMat );
		hood.position.set( 13, 6, 0 );
		chassisGroup.add( hood );
		var cage = new THREE.Mesh( new THREE.BoxGeometry( 16, 14, 20 ), mat( THREE, 0x2a211b ) );
		cage.position.set( -6, 12, 0 );
		chassisGroup.add( cage );
		var seat = new THREE.Mesh( new THREE.BoxGeometry( 10, 4, 12 ), mat( THREE, 0x3a2c20 ) );
		seat.position.set( -6, 8, 0 );
		chassisGroup.add( seat );

		var wheelGeo = new THREE.CylinderGeometry( 8, 8, 6, 12 );
		wheelGeo.rotateX( Math.PI / 2 );
		[ [ 15, 8, 15 ], [ 15, 8, -15 ], [ -15, 8, 15 ], [ -15, 8, -15 ] ].forEach( function ( p ) {
			var w = new THREE.Mesh( wheelGeo, darkMat );
			w.position.set( p[ 0 ], p[ 1 ], p[ 2 ] );
			g.add( w );
			wheels.push( w );
		} );

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

		blobShadow = new THREE.Mesh(
			new THREE.CircleGeometry( 26, 20 ),
			new THREE.MeshBasicMaterial( { color: 0x000000, transparent: true, opacity: 0.32 } )
		);
		blobShadow.rotation.x = -Math.PI / 2;
		scene.add( blobShadow );

		return g;
	}

	window.TCBackQuarter3D = { boot: boot };

} )();
