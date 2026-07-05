/**
 * THE BACK QUARTER 3D — Path C (Bruno-Simon-style).
 * Spec: docs/QUARTER-SECTION-SPEC.md §8.
 *
 * 3D-P2.5 — THE PLAYGROUND: the world grows 4× (2560×1440), the roads
 * widen (60 > the buggy's 46) and twist through many more bends, and the
 * flatness dies:
 * - ROLLING HILLS: a gaussian heightfield displaces the ground mesh; the
 *   buggy rides it, downhill runs free, uphill costs. (Physics stays
 *   Matter 2D — height is sampled, not simulated.)
 * - DIRT JUMPS: narrow steep mounds on the roads (brown domes). Crest one
 *   with speed and the buggy goes BALLISTIC — real air, gravity, landing
 *   dust. Two tokens can only be grabbed mid-air.
 * - TURBO PADS: glowing chevrons; cross one for a ~1s speed burst (FOV
 *   kicks wider while boosting).
 * - BALE STACKS: pyramids that TOPPLE when you ram them, plus a wooden
 *   RESTACK PAD — park on it a moment and the farm tidies itself.
 * - TOKEN HUNT: 20 gold tokens hidden across the quarter (HUD counter,
 *   persisted in localStorage; find-all fanfare).
 *
 * Carried: tuned Matter handling, vendored Three r128, hash-gated beta
 * (/#bq3d), signs/compound/family gate/juice from P1–P2.
 *
 * ⭐ Verification limit: background/automation tabs freeze rAF/WebGL —
 * smoke-test = boots clean, zero console errors; feel is Thomas's drive.
 */
( function () {
	'use strict';

	var W = 2560, H = 1440; // 4× the old quarter
	var SPAWN = { x: 1280, y: 1350, angle: -Math.PI / 2 };
	var HUB = { x: 1220, y: 940 };

	// The treehouse compound (the family yard) + its gated entry.
	var COMPOUND = { x0: 744, z0: 516, x1: 1192, z1: 952, gateZ0: 856, gateZ1: 944 };
	var GATE = { x: 1192, z: 900 };

	var LANDMARKS = [
		{ id: 'farmhouse', name: 'the farmhouse', x: 692, y: 336, w: 130, h: 80,
		  href: '/thomas', build: 'farmhouse', signTo: { x: 820, y: 400 },
		  prompt: 'The farmhouse — step inside, this is me' },
		{ id: 'cookshack', name: 'the cookshack', x: 1280, y: 264, w: 70, h: 50,
		  href: '/about', build: 'cookshack', signTo: { x: 1260, y: 330 },
		  prompt: 'The cookshack — my life on the line' },
		{ id: 'elevator', name: 'the grain elevator', x: 1792, y: 392, w: 70, h: 70,
		  href: '/hcs', build: 'elevator', signTo: { x: 1740, y: 430 },
		  prompt: 'The grain elevator — one of fewer than fifty' },
		{ id: 'church', name: 'the church', x: 396, y: 744, w: 70, h: 90,
		  href: '/heritage', build: 'church', signTo: { x: 500, y: 790 },
		  prompt: 'The church on the hill — eight family lines' },
		{ id: 'th1', name: 'Patience', x: 820, y: 592, w: 26, h: 26,
		  href: '/patience', build: 'treehouse', kidColor: 0xe86ba7, kidCss: '#ff9ecb',
		  prompt: 'Patience’s treehouse — the family key opens it' },
		{ id: 'th2', name: 'Daniel', x: 932, y: 732, w: 26, h: 26,
		  href: '/daniel', build: 'treehouse', kidColor: 0x4f9fd8, kidCss: '#8fd0ff',
		  prompt: 'Daniel’s treehouse — the family key opens it' },
		{ id: 'th3', name: 'Faith', x: 1070, y: 860, w: 26, h: 26,
		  href: '/faith', build: 'treehouse', kidColor: 0x9a7fd8, kidCss: '#cbb2ff',
		  prompt: 'Faith’s treehouse — the family key opens it' },
		{ id: 'radio', name: 'the radio mast', x: 2340, y: 720, w: 30, h: 30,
		  href: 'https://bareyourrare.org', external: true, build: 'mast', signTo: { x: 2260, y: 740 },
		  prompt: 'The radio mast — broadcasting beyond the fence' },
		{ id: 'barn', name: 'the arcade barn', x: 2022, y: 820, w: 120, h: 80,
		  href: null, build: 'barn', signTo: { x: 1900, y: 860 },
		  prompt: 'The arcade barn — the games are moving in here soon' },
		{ id: 'shed', name: 'the old shed', x: 372, y: 1104, w: 60, h: 44,
		  href: null, build: 'shed', signTo: { x: 430, y: 1050 },
		  prompt: 'The shed is padlocked… but a drawer in the house opens' },
		{ id: 'mailbox', name: 'the mailbox', x: 1190, y: 1400, w: 10, h: 10,
		  href: null, build: 'mailbox',
		  prompt: 'Fresh mail soon — “recently added” lands here' }
	];

	// The road net — wide (60) and full of bends. Nothing cuts the grove.
	var PATHS = [
		[ { x: 1280, y: 1420 }, { x: 1268, y: 1300 } ],
		[ { x: 1268, y: 1300 }, { x: 1240, y: 1080 } ],
		[ { x: 1240, y: 1080 }, HUB ],
		// west loop, twisting to the church
		[ HUB, { x: 1000, y: 1020 } ],
		[ { x: 1000, y: 1020 }, { x: 800, y: 1010 } ],
		[ { x: 800, y: 1010 }, { x: 620, y: 930 } ],
		[ { x: 620, y: 930 }, { x: 500, y: 790 } ],
		[ { x: 500, y: 790 }, { x: 430, y: 1050 } ],  // church down to the shed
		// north road, east of the grove, with a kink
		[ HUB, { x: 1300, y: 760 } ],
		[ { x: 1300, y: 760 }, { x: 1260, y: 560 } ],
		[ { x: 1260, y: 560 }, { x: 1260, y: 330 } ],
		// the top road: farmhouse ← cookshack → elevator
		[ { x: 1260, y: 330 }, { x: 1040, y: 280 } ],
		[ { x: 1040, y: 280 }, { x: 820, y: 400 } ],
		[ { x: 1260, y: 330 }, { x: 1500, y: 270 } ],
		[ { x: 1500, y: 270 }, { x: 1740, y: 430 } ],
		[ { x: 1740, y: 430 }, { x: 1860, y: 600 } ],
		[ { x: 1860, y: 600 }, { x: 1900, y: 860 } ],
		// hub out east to the barn
		[ HUB, { x: 1420, y: 1010 } ],
		[ { x: 1420, y: 1010 }, { x: 1650, y: 960 } ],
		[ { x: 1650, y: 960 }, { x: 1900, y: 860 } ],
		[ { x: 1900, y: 860 }, { x: 2260, y: 740 } ],
		// the big south-east joyride loop
		[ { x: 1420, y: 1010 }, { x: 1500, y: 1180 } ],
		[ { x: 1500, y: 1180 }, { x: 1750, y: 1240 } ],
		[ { x: 1750, y: 1240 }, { x: 2050, y: 1150 } ],
		[ { x: 2050, y: 1150 }, { x: 2200, y: 980 } ],
		[ { x: 2200, y: 980 }, { x: 2260, y: 740 } ],
		// the family-gate spur
		[ HUB, { x: 1198, y: 902 } ]
	];
	var ROAD_W = 60;

	// Rolling hills (gaussians in the ground mesh; roads + yards stay clear).
	var HILLS = [
		{ x: 300, z: 300, a: 16, r: 150 },
		{ x: 2300, z: 300, a: 18, r: 170 },
		{ x: 700, z: 700, a: 10, r: 120 },
		{ x: 1600, z: 650, a: 12, r: 140 },
		{ x: 2350, z: 1250, a: 14, r: 150 },
		{ x: 350, z: 1300, a: 12, r: 130 }
	];
	// Dirt-jump mounds ON the roads (visual brown domes, not in the mesh).
	var MOUNDS = [
		{ x: 1540, z: 985, a: 12, r: 40 },
		{ x: 1260, z: 450, a: 11, r: 36 },
		{ x: 1900, z: 1200, a: 13, r: 44 }
	];
	// Turbo pads (glowing chevrons on straights).
	var PADS = [
		{ x: 1250, z: 1180 }, { x: 1290, z: 660 },
		{ x: 1500, z: 1000 }, { x: 2110, z: 1120 }
	];
	// The 20 hidden tokens. 'air' tokens hover above jump mounds —
	// you can only grab them mid-flight.
	var TOKENS = [
		{ x: 200, z: 200 }, { x: 2400, z: 180 }, { x: 180, z: 1250 },
		{ x: 2380, z: 1320 }, { x: 1280, z: 120 }, { x: 640, z: 120 },
		{ x: 1900, z: 150 }, { x: 2450, z: 700 }, { x: 100, z: 700 },
		{ x: 700, z: 1350 }, { x: 1650, z: 1350 }, { x: 450, z: 950 },
		{ x: 900, z: 180 }, { x: 1500, z: 700 }, { x: 2150, z: 500 },
		{ x: 350, z: 550 }, { x: 1540, z: 985, air: true }, { x: 1260, z: 450, air: true },
		{ x: 300, z: 1180 }, { x: 2330, z: 650 }
	];

	var stage, hudEl, chipEl;
	var renderer, scene, camera, clock;
	var Matter, engine, buggyBody;
	var buggyGroup, chassisGroup, wheels = [], blobShadow;
	var bales = [];      // loose + stack-bottoms: {body, mesh, hx, hz, fall}
	var stacks = [];     // {toppled, bottoms:[idx into bales], uppers:[{mesh,hx,hz,hy,body,fallT}]}
	var restackPad = { x: 2200, z: 1030, r: 34, holdMS: 0 };
	var clickables = [];
	var mastLamp = null;
	var gateArm = null, gateBody = null, gateOpen = false, isFamily = false;
	var PROMPTS = [];
	var keys = {}, accMS = 0, nearLandmark = null;
	var camPos = null, raycaster = null, pointerNDC = null;
	// P2 juice
	var dustPool = [], smokeEmitters = [], trackPool = [], trackIdx = 0, distMark = 0;
	var audio = { ctx: null, on: false, master: null, engGain: null, engOsc1: null, engOsc2: null };
	var soundBtn = null;
	// P2.5 playground state
	var tokens = [], tokenCount = 0, tokenFound = 0;
	var airborne = false, vAlt = 0, worldY = 0, prevGy = 0;
	var boostT = 0, padCooldown = [];
	var baseFov = 55;

	/* ------------------------------------------------------------------ *
	 *  Heightfield
	 * ------------------------------------------------------------------ */
	function gauss( x, z, g ) {
		var dx = x - g.x, dz = z - g.z;
		var s2 = ( g.r / 2 ) * ( g.r / 2 ) * 2;
		return g.a * Math.exp( -( dx * dx + dz * dz ) / s2 );
	}
	function hillsAt( x, z ) {
		var y = 0;
		for ( var i = 0; i < HILLS.length; i++ ) y += gauss( x, z, HILLS[ i ] );
		return y;
	}
	function heightAt( x, z ) { // hills + jump mounds (what the buggy rides)
		var y = hillsAt( x, z );
		for ( var i = 0; i < MOUNDS.length; i++ ) y += gauss( x, z, MOUNDS[ i ] );
		return y;
	}
	function slopeAt( x, z ) {
		return {
			x: ( heightAt( x + 6, z ) - heightAt( x - 6, z ) ) / 12,
			z: ( heightAt( x, z + 6 ) - heightAt( x, z - 6 ) ) / 12
		};
	}

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
		scene.fog = new THREE.Fog( 0x0a1220, 480, 2100 );

		camera = new THREE.PerspectiveCamera( baseFov, stage.clientWidth / stage.clientHeight, 1, 5200 );

		// ---------- light ----------
		scene.add( new THREE.AmbientLight( 0x24324a, 0.85 ) );
		scene.add( new THREE.HemisphereLight( 0x39506e, 0x141d14, 0.5 ) );
		var moon = new THREE.DirectionalLight( 0x9ec2e8, 0.75 );
		moon.position.set( -500, 700, -400 );
		scene.add( moon );
		var moonBall = new THREE.Mesh(
			new THREE.SphereGeometry( 80, 20, 20 ),
			new THREE.MeshBasicMaterial( { color: 0xdfe9f5, fog: false } )
		);
		moonBall.position.set( -1000, 640, -1400 );
		scene.add( moonBall );

		// ---------- ground (displaced by the hills) ----------
		var groundGeo = new THREE.PlaneGeometry( 4200, 3200, 120, 84 );
		groundGeo.rotateX( -Math.PI / 2 );
		groundGeo.translate( W / 2, 0, H / 2 );
		var pos = groundGeo.attributes.position;
		for ( var vi = 0; vi < pos.count; vi++ ) {
			pos.setY( vi, hillsAt( pos.getX( vi ), pos.getZ( vi ) ) );
		}
		groundGeo.computeVertexNormals();
		var ground = new THREE.Mesh( groundGeo, new THREE.MeshLambertMaterial( { color: 0x16241a } ) );
		scene.add( ground );

		buildStubble( THREE );
		buildPaths( THREE );
		buildPonds( THREE );
		buildMounds( THREE );
		buildPads( THREE );

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
		buildStacks( THREE );
		buildRestackPad( THREE );
		buildTokens( THREE );

		buggyGroup = buildBuggy( THREE );
		scene.add( buggyGroup );
		camPos = new THREE.Vector3( SPAWN.x, 70, SPAWN.y + 140 );
		prevGy = heightAt( SPAWN.x, SPAWN.y );
		worldY = prevGy;

		// P2 juice
		initDust( THREE );
		initTracks( THREE );
		initSmoke( THREE );
		buildSoundToggle();

		// proximity prompts: all landmarks + the family gate + the restack pad
		PROMPTS = LANDMARKS.slice();
		PROMPTS.push( {
			id: 'familygate', name: 'the family gate', x: GATE.x + 6, y: GATE.z,
			href: isFamily ? null : '/family-login',
			prompt: isFamily
				? 'The gate lifts for you — welcome home'
				: 'The family gate — locked. The family key opens it'
		} );
		PROMPTS.push( {
			id: 'restack', name: 'the restack pad', x: restackPad.x, y: restackPad.z,
			href: null, prompt: 'Park here a moment and the bales restack'
		} );

		// ---------- input ----------
		window.addEventListener( 'keydown', onKey, true );
		window.addEventListener( 'keyup', onKey, true );
		raycaster = new THREE.Raycaster();
		pointerNDC = new THREE.Vector2();
		renderer.domElement.addEventListener( 'pointerdown', onClick );

		updateHud();
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

	function updateHud() {
		if ( ! hudEl ) return;
		hudEl.hidden = false;
		hudEl.textContent = '3D beta · WASD drives · H honks · Enter steps inside · Esc hops out · ⛁ '
			+ tokenFound + '/' + tokenCount + ' tokens';
	}

	function onKey( e ) {
		if ( document.activeElement !== stage ) return;
		var k = e.key.toLowerCase();
		var map = { w: 'up', arrowup: 'up', s: 'down', arrowdown: 'down',
			a: 'left', arrowleft: 'left', d: 'right', arrowright: 'right',
			enter: 'enter', escape: 'esc', h: 'honk' };
		if ( ! ( k in map ) ) return;
		e.preventDefault();
		var down = ( e.type === 'keydown' );
		keys[ map[ k ] ] = down;
		if ( down && map[ k ] === 'esc' ) stage.blur();
		if ( down && map[ k ] === 'enter' && nearLandmark ) enterLandmark( nearLandmark );
		if ( down && map[ k ] === 'honk' ) honk();
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
		var dms = Math.min( clock.getDelta() * 1000, 100 );
		accMS += dms;
		while ( accMS >= 16.666 ) {
			control();
			Matter.Engine.update( engine, 16.666 );
			accMS -= 16.666;
		}
		render( dms );
	}

	var steerInput = 0, throttleInput = 0;
	function control() {
		var b = buggyBody;
		var heading = { x: Math.cos( b.angle ), y: Math.sin( b.angle ) };
		b.frictionAir = airborne ? 0.02 : 0.14;

		throttleInput = ( keys.up ? 1 : 0 ) - ( keys.down ? 0.65 : 0 );
		steerInput = ( keys.right ? 1 : 0 ) - ( keys.left ? 1 : 0 );

		// tank steering; muted in the air
		Matter.Body.setAngularVelocity( b, steerInput * ( airborne ? 0.03 : 0.072 ) );

		var power = boostT > 0 ? 0.0062 : 0.0032;
		if ( airborne ) power *= 0.25;
		if ( throttleInput ) {
			Matter.Body.applyForce( b, b.position,
				{ x: heading.x * power * throttleInput * b.mass, y: heading.y * power * throttleInput * b.mass } );
		}

		var v = b.velocity;
		var fwd = v.x * heading.x + v.y * heading.y;
		var lat = { x: -heading.y, y: heading.x };
		var latSpeed = v.x * lat.x + v.y * lat.y;
		var grip = airborne ? 0.995 : 0.76;
		var nvx = heading.x * fwd + lat.x * latSpeed * grip;
		var nvy = heading.y * fwd + lat.y * latSpeed * grip;

		// hills push back: downhill runs free, uphill costs
		if ( ! airborne ) {
			var g = slopeAt( b.position.x, b.position.y );
			var along = g.x * heading.x + g.z * heading.y;
			nvx += heading.x * ( -along ) * 0.9;
			nvy += heading.y * ( -along ) * 0.9;
		}
		Matter.Body.setVelocity( b, { x: nvx, y: nvy } );

		var cap = boostT > 0 ? 10.2 : 7.0;
		var sp = Math.hypot( b.velocity.x, b.velocity.y );
		if ( sp > cap ) Matter.Body.setVelocity( b, { x: b.velocity.x * cap / sp, y: b.velocity.y * cap / sp } );

		if ( boostT > 0 ) boostT -= 16.666;
	}

	function render( dms ) {
		dms = dms || 16.666;
		var dt = dms / 1000;
		var b = buggyBody;
		var sp = Math.hypot( b.velocity.x, b.velocity.y );
		var t = clock.elapsedTime;

		// ---- vertical: ride the terrain; go ballistic off the mound lips ----
		var gy = heightAt( b.position.x, b.position.y );
		if ( ! airborne ) {
			var groundRate = ( gy - prevGy ) / Math.max( dt, 0.001 );
			if ( groundRate < -55 && sp > 4.4 ) {
				airborne = true;
				vAlt = Math.min( 120, -groundRate * 0.85 );
				worldY = prevGy;
			} else {
				worldY = gy;
			}
		}
		if ( airborne ) {
			worldY += vAlt * dt;
			vAlt -= 320 * dt;
			if ( worldY <= gy ) {
				airborne = false;
				worldY = gy;
				vAlt = 0;
				for ( var ld = 0; ld < 6; ld++ ) spawnDust( wheelWorld( -8 + Math.random() * 16, -12 + Math.random() * 24 ), sp );
			}
		}
		prevGy = gy;

		buggyGroup.position.set( b.position.x, worldY, b.position.y );
		buggyGroup.rotation.y = -b.angle;
		chassisGroup.rotation.x += ( ( steerInput * -0.08 * Math.min( 1, sp / 3 ) ) - chassisGroup.rotation.x ) * 0.15;
		chassisGroup.rotation.z += ( ( ( airborne ? -0.14 : throttleInput * -0.05 ) ) - chassisGroup.rotation.z ) * 0.12;
		for ( var i = 0; i < wheels.length; i++ ) wheels[ i ].rotation.z -= sp * 0.09;
		var hover = worldY - gy;
		blobShadow.position.set( b.position.x, gy + 0.6, b.position.y );
		blobShadow.material.opacity = Math.max( 0.08, 0.32 - hover * 0.01 );

		// bales follow their bodies (and the terrain)
		for ( var j = 0; j < bales.length; j++ ) {
			var bl = bales[ j ];
			var by = heightAt( bl.body.position.x, bl.body.position.y ) + 9;
			if ( bl.fall && bl.fall.t < 1 ) {
				bl.fall.t = Math.min( 1, bl.fall.t + dms / 480 );
				by = by + ( bl.fall.fromY - 9 ) * ( 1 - bl.fall.t );
			}
			bl.mesh.position.set( bl.body.position.x, by, bl.body.position.y );
			bl.mesh.rotation.y = -bl.body.angle;
		}
		checkStacks();
		checkRestack( dms, sp );

		// tokens spin, bob, get collected
		updateTokens( dms, t );

		// turbo pads
		checkPads( t );

		if ( mastLamp ) mastLamp.visible = ( Math.floor( t * 1.4 ) % 2 ) === 0;

		// the family gate
		if ( gateArm ) {
			var gd = Math.hypot( b.position.x - GATE.x, b.position.y - GATE.z );
			if ( isFamily && ! gateOpen && gd < 120 ) {
				gateOpen = true;
				if ( gateBody ) Matter.Composite.remove( engine.world, gateBody );
			}
			var target = gateOpen ? -1.25 : 0;
			gateArm.rotation.x += ( target - gateArm.rotation.x ) * 0.06;
		}

		// ---- P2 juice ----
		if ( ! airborne && sp > 1.6 && Math.random() < Math.min( 0.55, 0.1 + sp * 0.05 + Math.abs( steerInput ) * 0.2 ) ) {
			spawnDust( wheelWorld( -16, steerInput >= 0 ? 13 : -13 ), sp );
		}
		updateDust( dms );
		distMark += sp * ( dms / 16.666 );
		if ( ! airborne && sp > 1.2 && distMark > 9 ) {
			distMark = 0;
			dropTrack( wheelWorld( -15, 13 ) );
			dropTrack( wheelWorld( -15, -13 ) );
		}
		updateTracks( dms );
		updateSmoke( dms );
		updateAudio( sp );

		// nearest in-range prompt drives the chip
		var near = null, nearD = 1e9;
		for ( var p = 0; p < PROMPTS.length; p++ ) {
			var lm = PROMPTS[ p ];
			var d = Math.hypot( b.position.x - lm.x, b.position.y - lm.y );
			var range = ( lm.id === 'familygate' || lm.id === 'restack' ) ? 120 : 170;
			if ( d < range && d < nearD ) { near = lm; nearD = d; }
		}
		if ( near !== nearLandmark ) {
			nearLandmark = near;
			if ( chipEl ) {
				chipEl.hidden = ! near;
				if ( near ) chipEl.textContent = near.prompt + ( near.href ? '  · Enter ↵' : '' );
			}
		}

		// chase camera (rides the terrain, kicks wide on boost)
		var hx = Math.cos( b.angle ), hy = Math.sin( b.angle );
		var tx = b.position.x - hx * 130, tz = b.position.y - hy * 130;
		camPos.x += ( tx - camPos.x ) * 0.06;
		camPos.z += ( tz - camPos.z ) * 0.06;
		camPos.y += ( ( worldY + 66 + sp * 3 ) - camPos.y ) * 0.06;
		camera.position.copy( camPos );
		camera.lookAt( b.position.x + hx * 44, worldY + 6, b.position.y + hy * 44 );
		var wantFov = boostT > 0 ? 63 : baseFov;
		if ( Math.abs( camera.fov - wantFov ) > 0.1 ) {
			camera.fov += ( wantFov - camera.fov ) * 0.1;
			camera.updateProjectionMatrix();
		}

		renderer.render( scene, camera );
	}

	/* ------------------------------------------------------------------ *
	 *  Playground systems
	 * ------------------------------------------------------------------ */
	function buildMounds( THREE ) {
		// brown dirt domes matching the math bumps the buggy rides
		var dirt = new THREE.MeshLambertMaterial( { color: 0x4a3826 } );
		MOUNDS.forEach( function ( m ) {
			var dome = new THREE.Mesh( new THREE.SphereGeometry( m.r, 18, 12,
				0, Math.PI * 2, 0, Math.PI / 2 ), dirt );
			dome.scale.y = ( m.a / m.r ) * 1.35;
			dome.position.set( m.x, hillsAt( m.x, m.z ) + 0.2, m.z );
			scene.add( dome );
		} );
	}

	function buildPads( THREE ) {
		var padMat = new THREE.MeshBasicMaterial( { color: 0x8be9ff, transparent: true, opacity: 0.5 } );
		PADS.forEach( function ( p, i ) {
			padCooldown[ i ] = 0;
			var g = new THREE.Group();
			for ( var c = 0; c < 3; c++ ) {
				var chev = new THREE.Mesh( new THREE.PlaneGeometry( 26 - c * 5, 8 ), padMat );
				chev.rotation.x = -Math.PI / 2;
				chev.position.set( 0, 0.7 + c * 0.02, -c * 11 );
				g.add( chev );
			}
			g.position.set( p.x, hillsAt( p.x, p.z ), p.z );
			p.group = g;
			scene.add( g );
		} );
	}

	function checkPads( t ) {
		var b = buggyBody;
		for ( var i = 0; i < PADS.length; i++ ) {
			var p = PADS[ i ];
			p.group.children.forEach( function ( ch, ci ) {
				ch.material.opacity = 0.35 + 0.3 * Math.sin( t * 5 - ci * 0.9 );
			} );
			if ( padCooldown[ i ] > t ) continue;
			if ( Math.hypot( b.position.x - p.x, b.position.y - p.z ) < 30 ) {
				padCooldown[ i ] = t + 1.6;
				boostT = 950;
				var a = b.angle;
				var sp = Math.max( Math.hypot( b.velocity.x, b.velocity.y ), 7.4 );
				Matter.Body.setVelocity( b, { x: Math.cos( a ) * sp, y: Math.sin( a ) * sp } );
				if ( audio.on && audio.ctx ) whoosh();
			}
		}
	}

	function buildTokens( THREE ) {
		var found = [];
		try { found = JSON.parse( window.localStorage.getItem( 'tcBqTok_v1' ) || '[]' ); } catch ( err ) {}
		var geo = new THREE.CylinderGeometry( 6, 6, 1.8, 16 );
		geo.rotateZ( Math.PI / 2 ); // coin standing upright
		var gold = new THREE.MeshBasicMaterial( { color: 0xffd76a } );
		tokenCount = TOKENS.length;
		TOKENS.forEach( function ( tk, i ) {
			var got = found.indexOf( i ) !== -1;
			var mesh = new THREE.Mesh( geo, gold );
			var baseY = heightAt( tk.x, tk.z ) + ( tk.air ? 30 : 11 );
			mesh.position.set( tk.x, baseY, tk.z );
			mesh.visible = ! got;
			scene.add( mesh );
			tokens.push( { mesh: mesh, x: tk.x, z: tk.z, baseY: baseY, air: !! tk.air, got: got, idx: i } );
			if ( got ) tokenFound++;
		} );
	}

	function updateTokens( dms, t ) {
		var b = buggyBody;
		var changed = false;
		for ( var i = 0; i < tokens.length; i++ ) {
			var tk = tokens[ i ];
			if ( tk.got ) continue;
			tk.mesh.rotation.y += dms * 0.0028;
			tk.mesh.position.y = tk.baseY + Math.sin( t * 2.4 + i ) * 2.2;
			var d2 = Math.hypot( b.position.x - tk.x, b.position.y - tk.z );
			var dy = Math.abs( ( worldY + 10 ) - tk.mesh.position.y );
			if ( d2 < 24 && dy < 17 ) {
				tk.got = true;
				tk.mesh.visible = false;
				tokenFound++;
				changed = true;
				for ( var s = 0; s < 5; s++ ) spawnDust( { x: tk.x, y: tk.z }, 5 );
				chime();
			}
		}
		if ( changed ) {
			try {
				var got = tokens.filter( function ( k ) { return k.got; } ).map( function ( k ) { return k.idx; } );
				window.localStorage.setItem( 'tcBqTok_v1', JSON.stringify( got ) );
			} catch ( err ) {}
			updateHud();
			if ( tokenFound === tokenCount ) {
				flashChip( 'All ' + tokenCount + ' tokens found — the quarter is yours! 🏆' );
			}
		}
	}

	function buildStacks( THREE ) {
		// pyramids of bales: 3 on the ground (real bodies), 2 + 1 stacked on
		// top (visual until toppled). Ram the bottoms and the top comes down.
		[ { x: 2140, z: 950 }, { x: 560, z: 470 } ].forEach( function ( at ) {
			var stack = { toppled: false, bottoms: [], uppers: [] };
			[ -22, 0, 22 ].forEach( function ( off ) {
				var idx = addBale( THREE, at.x + off, at.z, true );
				stack.bottoms.push( idx );
			} );
			[ { ox: -11, y: 27 }, { ox: 11, y: 27 }, { ox: 0, y: 45 } ].forEach( function ( u ) {
				var mesh = makeBaleMesh( THREE );
				mesh.position.set( at.x + u.ox, heightAt( at.x, at.z ) + u.y, at.z );
				scene.add( mesh );
				stack.uppers.push( { mesh: mesh, hx: at.x + u.ox, hz: at.z, hy: u.y, body: null } );
			} );
			stacks.push( stack );
		} );
	}

	function checkStacks() {
		for ( var s = 0; s < stacks.length; s++ ) {
			var st = stacks[ s ];
			if ( st.toppled ) continue;
			for ( var bi = 0; bi < st.bottoms.length; bi++ ) {
				var bl = bales[ st.bottoms[ bi ] ];
				if ( Math.hypot( bl.body.position.x - bl.hx, bl.body.position.y - bl.hz ) > 10 ) {
					toppleStack( st );
					break;
				}
			}
		}
	}

	function toppleStack( st ) {
		st.toppled = true;
		st.uppers.forEach( function ( u ) {
			var body = Matter.Bodies.circle( u.mesh.position.x, u.mesh.position.z, 12,
				{ frictionAir: 0.08, density: 0.0012 } );
			Matter.Body.setVelocity( body, { x: ( Math.random() - 0.5 ) * 7, y: ( Math.random() - 0.5 ) * 7 } );
			Matter.Composite.add( engine.world, body );
			u.body = body;
			bales.push( { body: body, mesh: u.mesh, hx: u.hx, hz: u.hz,
				fall: { fromY: u.hy, t: 0 }, upperOf: st } );
		} );
	}

	function checkRestack( dms, sp ) {
		var b = buggyBody;
		var d = Math.hypot( b.position.x - restackPad.x, b.position.y - restackPad.z );
		if ( d < restackPad.r && sp < 0.6 ) {
			restackPad.holdMS += dms;
			if ( restackPad.holdMS > 900 ) {
				restackPad.holdMS = -2500; // debounce
				restackAll();
				flashChip( 'Bales restacked — go wreck ’em again' );
			}
		} else if ( restackPad.holdMS > 0 ) {
			restackPad.holdMS = 0;
		} else if ( restackPad.holdMS < 0 ) {
			restackPad.holdMS = Math.min( 0, restackPad.holdMS + dms );
		}
	}

	function restackAll() {
		// loose + bottom bales roll home
		for ( var i = bales.length - 1; i >= 0; i-- ) {
			var bl = bales[ i ];
			if ( bl.upperOf ) {
				// uppers: remove their temp bodies, restore the visual stack
				Matter.Composite.remove( engine.world, bl.body );
				bl.mesh.position.set( bl.hx, heightAt( bl.hx, bl.hz ) + bl.fall.fromY, bl.hz );
				bl.mesh.rotation.y = 0;
				bales.splice( i, 1 );
				continue;
			}
			Matter.Body.setPosition( bl.body, { x: bl.hx, y: bl.hz } );
			Matter.Body.setVelocity( bl.body, { x: 0, y: 0 } );
			Matter.Body.setAngularVelocity( bl.body, 0 );
		}
		stacks.forEach( function ( st ) {
			st.toppled = false;
			st.uppers.forEach( function ( u ) {
				u.body = null;
				u.mesh.position.set( u.hx, heightAt( u.hx, u.hz ) + u.hy, u.hz );
				u.mesh.rotation.y = 0;
			} );
		} );
	}

	function buildRestackPad( THREE ) {
		var pad = new THREE.Mesh(
			new THREE.CylinderGeometry( restackPad.r, restackPad.r, 1.4, 22 ),
			new THREE.MeshLambertMaterial( { color: 0x54402a } )
		);
		pad.position.set( restackPad.x, hillsAt( restackPad.x, restackPad.z ) + 0.7, restackPad.z );
		scene.add( pad );
		var ring = new THREE.Mesh(
			new THREE.CylinderGeometry( restackPad.r + 2.5, restackPad.r + 2.5, 0.6, 22 ),
			new THREE.MeshBasicMaterial( { color: 0xffcf8a, transparent: true, opacity: 0.35 } )
		);
		ring.position.copy( pad.position );
		ring.position.y += 0.6;
		scene.add( ring );
		buildSign( THREE, 'restack the bales', restackPad.x + 46, restackPad.z,
			restackPad.x, restackPad.z );
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
		disc.position.set( x, hillsAt( x, z ) + 0.5, z );
		scene.add( disc );
	}

	function gableRoof( THREE, len, halfWidth, color ) {
		var geo = new THREE.CylinderGeometry( halfWidth, halfWidth, len, 3 );
		geo.rotateZ( Math.PI / 2 );
		return new THREE.Mesh( geo, mat( THREE, color ) );
	}

	function buildSign( THREE, text, px, pz, faceX, faceZ ) {
		var lines = [ text ];
		if ( text.length > 14 ) {
			var words = text.split( ' ' );
			if ( words.length > 1 ) {
				var best = 1, bestDiff = 1e9;
				for ( var s = 1; s < words.length; s++ ) {
					var l = words.slice( 0, s ).join( ' ' ).length;
					var r = words.slice( s ).join( ' ' ).length;
					if ( Math.abs( l - r ) < bestDiff ) { bestDiff = Math.abs( l - r ); best = s; }
				}
				lines = [ words.slice( 0, best ).join( ' ' ), words.slice( best ).join( ' ' ) ];
			}
		}

		var c = document.createElement( 'canvas' );
		var ctx = c.getContext( '2d' );
		ctx.font = '600 40px Georgia, serif';
		var wpx = 0;
		lines.forEach( function ( ln ) {
			wpx = Math.max( wpx, Math.ceil( ctx.measureText( ln ).width ) );
		} );
		wpx += 44;
		var lineH = 52;
		c.width = wpx; c.height = 18 + lines.length * lineH;
		ctx = c.getContext( '2d' );
		ctx.fillStyle = '#2a1f14';
		ctx.fillRect( 0, 0, c.width, c.height );
		ctx.strokeStyle = 'rgba(255, 205, 140, 0.55)';
		ctx.lineWidth = 4;
		ctx.strokeRect( 4, 4, c.width - 8, c.height - 8 );
		ctx.font = '600 40px Georgia, serif';
		ctx.fillStyle = '#ffe3b0';
		ctx.textAlign = 'center';
		lines.forEach( function ( ln, i ) {
			ctx.fillText( ln, c.width / 2, 48 + i * lineH );
		} );

		var bw = Math.max( 26, Math.min( 58, wpx * 0.17 ) );
		var bh = bw * c.height / c.width;
		var beamY = 43;
		var g = new THREE.Group();
		var wood = mat( THREE, 0x3a2c1c );
		[ -1, 1 ].forEach( function ( s ) {
			var post = new THREE.Mesh( new THREE.BoxGeometry( 3.2, 42, 3.2 ), wood );
			post.position.set( s * ( bw / 2 + 4 ), 21, 0 );
			g.add( post );
		} );
		var frame = new THREE.Mesh( new THREE.BoxGeometry( bw + 10, bh + 2.5, 2 ), wood );
		frame.position.y = beamY;
		g.add( frame );
		var tex = new THREE.CanvasTexture( c );
		[ 1, -1 ].forEach( function ( side ) {
			var face = new THREE.Mesh(
				new THREE.PlaneGeometry( bw, bh ),
				new THREE.MeshBasicMaterial( { map: tex } )
			);
			face.position.set( 0, beamY, side * 1.15 );
			if ( side < 0 ) face.rotation.y = Math.PI;
			g.add( face );
		} );
		var lantern = new THREE.Mesh( new THREE.BoxGeometry( 3.4, 3.8, 3.4 ),
			new THREE.MeshBasicMaterial( { color: 0xffd9a0 } ) );
		lantern.position.y = beamY + bh / 2 + 3.4;
		g.add( lantern );
		var cap = new THREE.Mesh( new THREE.ConeGeometry( 3.2, 2.8, 4 ), mat( THREE, 0x1c1512 ) );
		cap.position.y = beamY + bh / 2 + 6.6;
		cap.rotation.y = Math.PI / 4;
		g.add( cap );

		g.position.set( px, hillsAt( px, pz ), pz );
		g.rotation.y = Math.atan2( faceX - px, faceZ - pz );
		scene.add( g );
		addGlowDisc( THREE, px, pz, 16, 0.09 );
		return g;
	}

	function raiseLandmark( THREE, lm ) {
		var g;
		switch ( lm.build ) {
			case 'farmhouse': g = buildFarmhouse( THREE, lm ); break;
			case 'cookshack': g = buildCookshack( THREE, lm ); break;
			case 'elevator': g = buildElevator( THREE, lm ); break;
			case 'church': g = buildChurch( THREE, lm ); break;
			case 'treehouse': g = buildTreehouse( THREE, lm ); break;
			case 'mast': g = buildMast( THREE ); break;
			case 'barn': g = buildBarnHouse( THREE, lm ); break;
			case 'shed': g = buildShed( THREE ); break;
			case 'mailbox': g = buildMailboxPost( THREE ); break;
		}
		g.position.set( lm.x, 0, lm.y );
		g.userData.lm = lm;
		scene.add( g );
		clickables.push( g );

		if ( lm.signTo ) {
			var dx = lm.signTo.x - lm.x, dz = lm.signTo.y - lm.y;
			var dl = Math.hypot( dx, dz ) || 1;
			var off = Math.max( lm.w, lm.h ) / 2 + 30;
			var sign = buildSign( THREE, lm.name,
				lm.x + ( dx / dl ) * off, lm.y + ( dz / dl ) * off,
				lm.signTo.x, lm.signTo.y );
			sign.userData.lm = lm;
			clickables.push( sign );
		}
	}

	/* ------------------------------------------------------------------ *
	 *  The family compound
	 * ------------------------------------------------------------------ */
	function buildCompound( THREE ) {
		fenceRun( THREE, COMPOUND.x0, COMPOUND.z0, COMPOUND.x1, COMPOUND.z0 );
		fenceRun( THREE, COMPOUND.x0, COMPOUND.z0, COMPOUND.x0, COMPOUND.z1 );
		fenceRun( THREE, COMPOUND.x0, COMPOUND.z1, COMPOUND.x1, COMPOUND.z1 );
		fenceRun( THREE, COMPOUND.x1, COMPOUND.z0, COMPOUND.x1, COMPOUND.gateZ0 );

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

		var postMat = mat( THREE, 0x59554c );
		[ COMPOUND.gateZ0, COMPOUND.gateZ1 ].forEach( function ( z ) {
			var p = new THREE.Mesh( new THREE.BoxGeometry( 6, 20, 6 ), postMat );
			p.position.set( COMPOUND.x1, 10, z );
			scene.add( p );
		} );

		var armGeo = new THREE.BoxGeometry( 2.4, 2.6, COMPOUND.gateZ1 - COMPOUND.gateZ0 - 4 );
		armGeo.translate( 0, 0, ( COMPOUND.gateZ1 - COMPOUND.gateZ0 - 4 ) / 2 );
		gateArm = new THREE.Mesh( armGeo, mat( THREE, 0xb8352c ) );
		gateArm.position.set( COMPOUND.x1, 12, COMPOUND.gateZ0 + 2 );
		scene.add( gateArm );
		gateBody = Matter.Bodies.rectangle( GATE.x, GATE.z, 10,
			COMPOUND.gateZ1 - COMPOUND.gateZ0, { isStatic: true } );
		Matter.Composite.add( engine.world, gateBody );

		buildSign( THREE, 'the treehouses · family only',
			COMPOUND.x1 + 22, COMPOUND.gateZ0 - 12, HUB.x + 30, HUB.y );

		var lamp = new THREE.Mesh( new THREE.BoxGeometry( 3.4, 4, 3.4 ),
			new THREE.MeshBasicMaterial( { color: 0xffd9a0 } ) );
		lamp.position.set( COMPOUND.x1, 22, COMPOUND.gateZ0 );
		scene.add( lamp );
		addGlowDisc( THREE, GATE.x + 8, GATE.z, 26, 0.08 );
	}

	/* ------------------------------------------------------------------ *
	 *  The buildings
	 * ------------------------------------------------------------------ */
	function buildFarmhouse( THREE, lm ) {
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
		addGlowDisc( THREE, lm.x, lm.y + 48, 62, 0.10 );
		return g;
	}

	function buildCookshack( THREE, lm ) {
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
		addGlowDisc( THREE, lm.x, lm.y + 32, 48, 0.10 );
		return g;
	}

	function buildElevator( THREE, lm ) {
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
		addGlowDisc( THREE, lm.x, lm.y + 34, 44, 0.09 );
		return g;
	}

	function buildChurch( THREE, lm ) {
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
		addGlowDisc( THREE, lm.x, lm.y + 52, 54, 0.10 );
		return g;
	}

	function buildTreehouse( THREE, lm ) {
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
		var kidColor = ( lm && lm.kidColor ) || 0x33261a;
		var roof = gableRoof( THREE, 26, 13, kidColor );
		roof.position.y = 52;
		g.add( roof );
		var ladder = new THREE.Mesh( new THREE.BoxGeometry( 2, 34, 6 ), mat( THREE, kidColor ) );
		ladder.position.set( 12, 17, 0 );
		g.add( ladder );
		addWindow( THREE, g, 8, 7, 0, 40, 9.2 );
		if ( lm && lm.name ) {
			var c = document.createElement( 'canvas' );
			var ctx = c.getContext( '2d' );
			ctx.font = '600 44px Georgia, serif';
			var wpx = Math.ceil( ctx.measureText( lm.name ).width ) + 36;
			c.width = wpx; c.height = 64;
			ctx = c.getContext( '2d' );
			ctx.fillStyle = '#241a10';
			ctx.fillRect( 0, 0, wpx, 64 );
			ctx.strokeStyle = 'rgba(255, 225, 180, 0.35)';
			ctx.lineWidth = 4;
			ctx.strokeRect( 3, 3, wpx - 6, 58 );
			ctx.font = '600 44px Georgia, serif';
			ctx.fillStyle = lm.kidCss || '#ffe3b0';
			ctx.fillText( lm.name, 18, 47 );
			var bw = Math.max( 12, Math.min( 20, wpx * 0.075 ) );
			var plate = new THREE.Mesh(
				new THREE.PlaneGeometry( bw, bw * 64 / wpx ),
				new THREE.MeshBasicMaterial( { map: new THREE.CanvasTexture( c ) } )
			);
			plate.position.set( 0, 31.5, 9.3 );
			g.add( plate );
		}
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

	function buildBarnHouse( THREE, lm ) {
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
		addGlowDisc( THREE, lm.x, lm.y + 46, 56, 0.10 );
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
		var arm = new THREE.Mesh( new THREE.BoxGeometry( 1.1, 7, 1.1 ), mat( THREE, 0xb8352c ) );
		arm.position.set( 6.6, 29, 0 );
		g.add( arm );
		var paddle = new THREE.Mesh( new THREE.BoxGeometry( 4.2, 3.4, 0.9 ), mat( THREE, 0xb8352c ) );
		paddle.position.set( 6.6, 33.6, 0 );
		g.add( paddle );
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

	function distToSeg( px, pz, a, b ) {
		var abx = b.x - a.x, abz = b.y - a.y;
		var t = ( ( px - a.x ) * abx + ( pz - a.y ) * abz ) / ( abx * abx + abz * abz );
		t = Math.max( 0, Math.min( 1, t ) );
		return Math.hypot( px - ( a.x + abx * t ), pz - ( a.y + abz * t ) );
	}

	function farFromRoads( x, z, min ) {
		for ( var i = 0; i < PATHS.length; i++ ) {
			if ( distToSeg( x, z, PATHS[ i ][ 0 ], PATHS[ i ][ 1 ] ) < min ) return false;
		}
		return true;
	}

	function buildStubble( THREE ) {
		var stripMat = new THREE.MeshLambertMaterial( { color: 0x3d3a24 } );
		var placed = 0, guard = 0;
		while ( placed < 16 && guard++ < 160 ) {
			var x = 160 + Math.random() * ( W - 320 );
			var z = 140 + Math.random() * ( H - 280 );
			if ( ! farFromLandmarks( x, z, 140 ) || inCompound( x, z, 40 ) || ! farFromRoads( x, z, 90 ) ) continue;
			var strip = new THREE.Mesh(
				new THREE.PlaneGeometry( 190 + Math.random() * 170, 90 + Math.random() * 70 ), stripMat );
			strip.rotation.x = -Math.PI / 2;
			strip.rotation.z = ( Math.random() - 0.5 ) * 0.5;
			strip.position.set( x, hillsAt( x, z ) + 0.3, z );
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
			var strip = new THREE.Mesh( new THREE.PlaneGeometry( len + 40, ROAD_W ), pathMat );
			strip.rotation.x = -Math.PI / 2;
			strip.rotation.z = -Math.atan2( dz, dx );
			var mx = ( a.x + b.x ) / 2, mz = ( a.y + b.y ) / 2;
			strip.position.set( mx, hillsAt( mx, mz ) + 0.4, mz );
			scene.add( strip );
		} );
	}

	function buildPonds( THREE ) {
		var pondMat = new THREE.MeshLambertMaterial( { color: 0x152c3e, emissive: 0x060f16 } );
		var glintMat = new THREE.MeshBasicMaterial( { color: 0xbcd6ea, transparent: true, opacity: 0.16 } );
		[ [ 2110, 560, 55 ], [ 2290, 1180, 48 ], [ 720, 1180, 44 ], [ 1680, 180, 40 ] ].forEach( function ( p ) {
			var pond = new THREE.Mesh( new THREE.CircleGeometry( p[ 2 ], 18 ), pondMat );
			pond.rotation.x = -Math.PI / 2;
			pond.position.set( p[ 0 ], hillsAt( p[ 0 ], p[ 1 ] ) + 0.35, p[ 1 ] );
			pond.scale.x = 1.35;
			scene.add( pond );
			var glint = new THREE.Mesh( new THREE.CircleGeometry( p[ 2 ] * 0.32, 12 ), glintMat );
			glint.rotation.x = -Math.PI / 2;
			glint.position.set( p[ 0 ] - p[ 2 ] * 0.3, hillsAt( p[ 0 ], p[ 1 ] ) + 0.45, p[ 1 ] - p[ 2 ] * 0.2 );
			glint.scale.x = 1.8;
			scene.add( glint );
		} );
	}

	function buildWindbreak( THREE ) {
		var trunkMat = mat( THREE, 0x2c2418 );
		var leafMat = mat( THREE, 0x1d3a26 );
		for ( var i = 0; i < 14; i++ ) {
			var f = i / 13;
			var x = 790 + f * 350 + ( Math.random() - 0.5 ) * 30;
			var z = 560 + f * 340 + ( Math.random() - 0.5 ) * 30;
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
			var px = x0 + dx * ( i / n ), pz = z0 + dz * ( i / n );
			var p = new THREE.Mesh( new THREE.BoxGeometry( 3, 16, 3 ), postMat );
			p.position.set( px, hillsAt( px, pz ) + 8, pz );
			scene.add( p );
		}
		var midY = hillsAt( ( x0 + x1 ) / 2, ( z0 + z1 ) / 2 );
		[ 12, 6 ].forEach( function ( y ) {
			var rail = new THREE.Mesh( new THREE.BoxGeometry( len, 2, 2 ), postMat );
			rail.position.set( ( x0 + x1 ) / 2, midY + y, ( z0 + z1 ) / 2 );
			rail.rotation.y = -Math.atan2( dz, dx );
			scene.add( rail );
		} );
	}

	function buildFence( THREE ) {
		// border runs in shorter chunks so posts + rails follow the hills
		var step = 320;
		for ( var x = 0; x < W; x += step ) {
			fenceRun( THREE, x, 0, Math.min( x + step, W ), 0 );
			fenceRun( THREE, x, H, Math.min( x + step, W ), H );
		}
		for ( var z = 0; z < H; z += step ) {
			fenceRun( THREE, 0, z, 0, Math.min( z + step, H ) );
			fenceRun( THREE, W, z, W, Math.min( z + step, H ) );
		}
	}

	function buildGateway( THREE ) {
		var stone = mat( THREE, 0x59554c );
		[ 1220, 1340 ].forEach( function ( x ) {
			var pillar = new THREE.Mesh( new THREE.BoxGeometry( 10, 26, 10 ), stone );
			pillar.position.set( x, 13, H - 6 );
			scene.add( pillar );
		} );
		var bar = new THREE.Mesh( new THREE.BoxGeometry( 124, 3, 3 ), mat( THREE, 0x4a4034 ) );
		bar.position.set( 1280, 27, H - 6 );
		scene.add( bar );
		var lantern = new THREE.Mesh( new THREE.BoxGeometry( 4, 5, 4 ),
			new THREE.MeshBasicMaterial( { color: 0xffd9a0 } ) );
		lantern.position.set( 1280, 31, H - 6 );
		scene.add( lantern );
		addGlowDisc( THREE, 1280, H - 30, 34, 0.08 );
	}

	function buildTrees( THREE ) {
		var trunkMat = mat( THREE, 0x2c2418 );
		var leafMat = mat( THREE, 0x1d3a26 );
		var placed = 0, guard = 0;
		while ( placed < 34 && guard++ < 220 ) {
			var x = 80 + Math.random() * ( W - 160 );
			var z = 80 + Math.random() * ( H - 160 );
			if ( Math.hypot( x - SPAWN.x, z - SPAWN.y ) < 150 ) continue;
			if ( ! farFromLandmarks( x, z, 120 ) || inCompound( x, z, 30 ) || ! farFromRoads( x, z, 55 ) ) continue;
			var gy = hillsAt( x, z );
			var trunk = new THREE.Mesh( new THREE.CylinderGeometry( 2.5, 3.5, 14, 6 ), trunkMat );
			trunk.position.set( x, gy + 7, z );
			scene.add( trunk );
			var h = 40 + Math.random() * 26;
			var cone = new THREE.Mesh( new THREE.ConeGeometry( 11 + Math.random() * 4, h, 7 ), leafMat );
			cone.position.set( x, gy + 14 + h / 2, z );
			scene.add( cone );
			Matter.Composite.add( engine.world, Matter.Bodies.circle( x, z, 8, { isStatic: true } ) );
			placed++;
		}
	}

	function makeBaleMesh( THREE ) {
		var baleGeo = new THREE.CylinderGeometry( 9, 9, 16, 12 );
		baleGeo.rotateZ( Math.PI / 2 );
		return new THREE.Mesh( baleGeo, mat( THREE, 0x8f7a3e ) );
	}

	function addBale( THREE, x, z, still ) {
		var mesh = makeBaleMesh( THREE );
		mesh.position.set( x, heightAt( x, z ) + 9, z );
		scene.add( mesh );
		var body = Matter.Bodies.circle( x, z, 12, { frictionAir: 0.08, density: 0.0012 } );
		Matter.Composite.add( engine.world, body );
		bales.push( { body: body, mesh: mesh, hx: x, hz: z } );
		return bales.length - 1;
	}

	function buildBales( THREE ) {
		var placed = 0, guard = 0;
		while ( placed < 9 && guard++ < 120 ) {
			var x = 260 + Math.random() * ( W - 520 );
			var z = 180 + Math.random() * ( H - 360 );
			if ( Math.hypot( x - SPAWN.x, z - SPAWN.y ) < 130 ) continue;
			if ( ! farFromLandmarks( x, z, 120 ) || inCompound( x, z, 30 ) || ! farFromRoads( x, z, 60 ) ) continue;
			addBale( THREE, x, z );
			placed++;
		}
	}

	/* ------------------------------------------------------------------ *
	 *  P2 juice — dust, tracks, smoke, sound
	 * ------------------------------------------------------------------ */
	function wheelWorld( lx, lz ) {
		var a = buggyBody.angle, p = buggyBody.position;
		return {
			x: p.x + lx * Math.cos( a ) - lz * Math.sin( a ),
			y: p.y + lx * Math.sin( a ) + lz * Math.cos( a )
		};
	}

	function makePuffTexture( THREE, r, g2, b2 ) {
		var c = document.createElement( 'canvas' );
		c.width = c.height = 64;
		var ctx = c.getContext( '2d' );
		var grad = ctx.createRadialGradient( 32, 32, 4, 32, 32, 30 );
		grad.addColorStop( 0, 'rgba(' + r + ',' + g2 + ',' + b2 + ',0.85)' );
		grad.addColorStop( 1, 'rgba(' + r + ',' + g2 + ',' + b2 + ',0)' );
		ctx.fillStyle = grad;
		ctx.fillRect( 0, 0, 64, 64 );
		return new THREE.CanvasTexture( c );
	}

	function initDust( THREE ) {
		var tex = makePuffTexture( THREE, 158, 138, 106 );
		for ( var i = 0; i < 32; i++ ) {
			var spr = new THREE.Sprite( new THREE.SpriteMaterial( {
				map: tex, transparent: true, opacity: 0, depthWrite: false
			} ) );
			spr.scale.set( 8, 8, 1 );
			scene.add( spr );
			dustPool.push( { spr: spr, life: 0, max: 0 } );
		}
	}

	function spawnDust( at, sp ) {
		for ( var i = 0; i < dustPool.length; i++ ) {
			if ( dustPool[ i ].life <= 0 ) {
				var p = dustPool[ i ];
				p.max = p.life = 550 + Math.random() * 450;
				p.spr.position.set(
					at.x + ( Math.random() - 0.5 ) * 8,
					heightAt( at.x, at.y ) + 3,
					at.y + ( Math.random() - 0.5 ) * 8 );
				p.vy = 8 + Math.random() * 8;
				p.grow = 10 + sp * 2.4;
				return;
			}
		}
	}

	function updateDust( dms ) {
		for ( var i = 0; i < dustPool.length; i++ ) {
			var p = dustPool[ i ];
			if ( p.life <= 0 ) continue;
			p.life -= dms;
			var f = Math.max( 0, p.life / p.max );
			p.spr.material.opacity = 0.34 * f;
			p.spr.position.y += p.vy * ( dms / 1000 );
			var s = 8 + ( 1 - f ) * p.grow;
			p.spr.scale.set( s, s, 1 );
		}
	}

	function initTracks( THREE ) {
		var geo = new THREE.PlaneGeometry( 3.4, 8 );
		for ( var i = 0; i < 90; i++ ) {
			var m = new THREE.Mesh( geo, new THREE.MeshBasicMaterial( {
				color: 0x0e130d, transparent: true, opacity: 0, depthWrite: false
			} ) );
			m.rotation.x = -Math.PI / 2;
			scene.add( m );
			trackPool.push( { mesh: m, life: 0 } );
		}
	}

	function dropTrack( at ) {
		var tr = trackPool[ trackIdx ];
		trackIdx = ( trackIdx + 1 ) % trackPool.length;
		tr.life = 6000;
		tr.mesh.position.set( at.x, heightAt( at.x, at.y ) + 0.55, at.y );
		tr.mesh.rotation.z = -buggyBody.angle + Math.PI / 2;
		tr.mesh.material.opacity = 0.30;
	}

	function updateTracks( dms ) {
		for ( var i = 0; i < trackPool.length; i++ ) {
			var tr = trackPool[ i ];
			if ( tr.life <= 0 ) continue;
			tr.life -= dms;
			tr.mesh.material.opacity = 0.30 * Math.max( 0, tr.life / 6000 );
		}
	}

	function initSmoke( THREE ) {
		var tex = makePuffTexture( THREE, 186, 188, 198 );
		// chimney mouths: farmhouse + cookshack (world coords)
		[ { x: 726, y: 72, z: 328 }, { x: 1298, y: 53, z: 270 } ].forEach( function ( at ) {
			var em = { at: at, parts: [], timer: Math.random() * 600 };
			for ( var i = 0; i < 7; i++ ) {
				var spr = new THREE.Sprite( new THREE.SpriteMaterial( {
					map: tex, transparent: true, opacity: 0, depthWrite: false
				} ) );
				spr.scale.set( 7, 7, 1 );
				scene.add( spr );
				em.parts.push( { spr: spr, life: 0, max: 0 } );
			}
			smokeEmitters.push( em );
		} );
	}

	function updateSmoke( dms ) {
		for ( var e = 0; e < smokeEmitters.length; e++ ) {
			var em = smokeEmitters[ e ];
			em.timer -= dms;
			if ( em.timer <= 0 ) {
				em.timer = 520 + Math.random() * 320;
				for ( var s = 0; s < em.parts.length; s++ ) {
					if ( em.parts[ s ].life <= 0 ) {
						var p = em.parts[ s ];
						p.max = p.life = 2600 + Math.random() * 1200;
						p.spr.position.set( em.at.x, em.at.y, em.at.z );
						p.drift = ( Math.random() - 0.5 ) * 3.5;
						break;
					}
				}
			}
			for ( var i = 0; i < em.parts.length; i++ ) {
				var q = em.parts[ i ];
				if ( q.life <= 0 ) continue;
				q.life -= dms;
				var f = Math.max( 0, q.life / q.max );
				q.spr.material.opacity = 0.20 * Math.sin( Math.min( 1, 1 - f + 0.15 ) * Math.PI );
				q.spr.position.y += 7.5 * ( dms / 1000 );
				q.spr.position.x += q.drift * ( dms / 1000 );
				var sc = 7 + ( 1 - f ) * 14;
				q.spr.scale.set( sc, sc, 1 );
			}
		}
	}

	/* ---- sound ---- */
	function buildSoundToggle() {
		soundBtn = document.createElement( 'button' );
		soundBtn.type = 'button';
		soundBtn.className = 'bq-fs';
		soundBtn.style.right = 'auto';
		soundBtn.style.left = '10px';
		stage.appendChild( soundBtn );
		var want = false;
		try { want = window.localStorage.getItem( 'tcBqSound' ) === 'on'; } catch ( err ) {}
		setSound( want );
		soundBtn.addEventListener( 'click', function () { setSound( ! audio.on ); stage.focus(); } );
	}

	function setSound( on ) {
		audio.on = on;
		try { window.localStorage.setItem( 'tcBqSound', on ? 'on' : 'off' ); } catch ( err ) {}
		if ( soundBtn ) soundBtn.textContent = on ? '🔊 Sound on' : '🔇 Sound off';
		if ( on ) {
			ensureAudio();
			if ( audio.ctx && audio.ctx.state === 'suspended' ) audio.ctx.resume();
		} else if ( audio.engGain ) {
			audio.engGain.gain.value = 0;
		}
	}

	function ensureAudio() {
		if ( audio.ctx ) return;
		var AC = window.AudioContext || window.webkitAudioContext;
		if ( ! AC ) return;
		audio.ctx = new AC();
		audio.master = audio.ctx.createGain();
		audio.master.gain.value = 0.6;
		audio.master.connect( audio.ctx.destination );
		var lp = audio.ctx.createBiquadFilter();
		lp.type = 'lowpass';
		lp.frequency.value = 420;
		audio.engGain = audio.ctx.createGain();
		audio.engGain.gain.value = 0;
		audio.engOsc1 = audio.ctx.createOscillator();
		audio.engOsc1.type = 'sawtooth';
		audio.engOsc1.frequency.value = 54;
		audio.engOsc2 = audio.ctx.createOscillator();
		audio.engOsc2.type = 'square';
		audio.engOsc2.frequency.value = 109;
		audio.engOsc1.connect( lp );
		audio.engOsc2.connect( lp );
		lp.connect( audio.engGain );
		audio.engGain.connect( audio.master );
		audio.engOsc1.start();
		audio.engOsc2.start();
	}

	function updateAudio( sp ) {
		if ( ! audio.on || ! audio.ctx || ! audio.engGain ) return;
		var rev = Math.min( 1, sp / 7 ) + Math.abs( throttleInput ) * 0.25 + ( boostT > 0 ? 0.3 : 0 );
		audio.engOsc1.frequency.value = 52 + rev * 80;
		audio.engOsc2.frequency.value = ( 52 + rev * 80 ) * 2.02;
		audio.engGain.gain.value = 0.012 + rev * 0.05;
	}

	function honk() {
		if ( ! audio.on ) return;
		ensureAudio();
		if ( ! audio.ctx ) return;
		var t0 = audio.ctx.currentTime;
		[ 392, 494 ].forEach( function ( f ) {
			var o = audio.ctx.createOscillator();
			o.type = 'triangle';
			o.frequency.value = f;
			var g = audio.ctx.createGain();
			g.gain.setValueAtTime( 0.0001, t0 );
			g.gain.exponentialRampToValueAtTime( 0.16, t0 + 0.02 );
			g.gain.exponentialRampToValueAtTime( 0.0001, t0 + 0.32 );
			o.connect( g );
			g.connect( audio.master );
			o.start( t0 );
			o.stop( t0 + 0.36 );
		} );
	}

	function chime() {
		if ( ! audio.on || ! audio.ctx ) return;
		var t0 = audio.ctx.currentTime;
		[ 880, 1318 ].forEach( function ( f, i ) {
			var o = audio.ctx.createOscillator();
			o.type = 'sine';
			o.frequency.value = f;
			var g = audio.ctx.createGain();
			g.gain.setValueAtTime( 0.0001, t0 + i * 0.07 );
			g.gain.exponentialRampToValueAtTime( 0.12, t0 + i * 0.07 + 0.02 );
			g.gain.exponentialRampToValueAtTime( 0.0001, t0 + i * 0.07 + 0.22 );
			o.connect( g );
			g.connect( audio.master );
			o.start( t0 + i * 0.07 );
			o.stop( t0 + i * 0.07 + 0.25 );
		} );
	}

	function whoosh() {
		if ( ! audio.on || ! audio.ctx ) return;
		var t0 = audio.ctx.currentTime;
		var o = audio.ctx.createOscillator();
		o.type = 'sawtooth';
		o.frequency.setValueAtTime( 160, t0 );
		o.frequency.exponentialRampToValueAtTime( 420, t0 + 0.5 );
		var g = audio.ctx.createGain();
		g.gain.setValueAtTime( 0.0001, t0 );
		g.gain.exponentialRampToValueAtTime( 0.09, t0 + 0.05 );
		g.gain.exponentialRampToValueAtTime( 0.0001, t0 + 0.55 );
		o.connect( g );
		g.connect( audio.master );
		o.start( t0 );
		o.stop( t0 + 0.6 );
	}

	/* ------------------------------------------------------------------ *
	 *  The buggy
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
			var spot = new THREE.SpotLight( 0xffd9a0, 1.1, 460, 0.5, 0.55, 1.2 );
			spot.position.set( 22, 12, z );
			spot.target.position.set( 280, -4, z * 3 );
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
