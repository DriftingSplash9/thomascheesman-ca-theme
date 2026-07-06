/**
 * THE BACK QUARTER 3D — Path C (Bruno-Simon-style).
 * Spec: docs/QUARTER-SECTION-SPEC.md §8.
 *
 * 3D-P2.6 — MONSTER QUARTER: the world triples again (4480×2520 — 12× the
 * original board), the whole quarter sits on a tilted grade with hills
 * ~50% stronger, and the toys grow up:
 * - MONSTER-TRUCK AIR: Space bunny-hops (stronger with speed), the dirt
 *   mounds are proper ramps, and while airborne LEFT/RIGHT SHIFT pitch
 *   the buggy nose-down/nose-up — full front/back FLIPS. Land a clean
 *   full flip → turbo reward. Botch the rotation → you eat dirt (speed
 *   cut + dust). The buggy pitches on its own axis via a YZX euler.
 * - PONDS ARE DIMPLES: negative-gaussian bowls in the terrain with real
 *   water sitting in them — drive through and you wade: splash puffs,
 *   heavy drag, dip and out the far side.
 * - HERITAGE DRIVE-INS: eight drive-in-movie screens along the perimeter
 *   fence, marquee-lit, one per family line (Cheesmans, Dochertys,
 *   Haistes, Lakemans, Rycrofts, McIvers, Verbooms, Steinkes), each
 *   clickable/Enter-able straight into that line's long-read.
 *
 * Carried: interpolated 60Hz physics (no jitter), painted-in roads that
 * ride the terrain, wandering livestock + tractor, token hunt, bale
 * stacks + restack pad, family-gated compound, lantern archway signs.
 *
 * ⭐ Verification limit: background/automation tabs freeze rAF/WebGL —
 * smoke-test = boots clean, zero console errors; feel is Thomas's drive.
 */
( function () {
	'use strict';

	var W = 4480, H = 2520; // 12x the original board
	var SPAWN = { x: 2240, y: 2360, angle: -Math.PI / 2 };
	var HUB = { x: 2135, y: 1645 };

	var COMPOUND = { x0: 1302, z0: 903, x1: 2086, z1: 1666, gateZ0: 1498, gateZ1: 1652 };
	var GATE = { x: 2086, z: 1575 };

	var LANDMARKS = [
		{ id: 'farmhouse', name: 'the farmhouse', x: 1211, y: 588, w: 130, h: 80,
		  href: '/thomas', build: 'farmhouse', signTo: { x: 1435, y: 700 },
		  prompt: 'The farmhouse — step inside, this is me' },
		{ id: 'cookshack', name: 'the cookshack', x: 2240, y: 462, w: 70, h: 50,
		  href: '/about', build: 'cookshack', signTo: { x: 2205, y: 578 },
		  prompt: 'The cookshack — my life on the line' },
		{ id: 'elevator', name: 'the grain elevator', x: 3136, y: 686, w: 70, h: 70,
		  href: '/hcs', build: 'elevator', signTo: { x: 3045, y: 753 },
		  prompt: 'The grain elevator — one of fewer than fifty' },
		{ id: 'church', name: 'the church', x: 693, y: 1302, w: 70, h: 90,
		  href: '/heritage', build: 'church', signTo: { x: 875, y: 1383 },
		  prompt: 'The church on the hill — eight family lines' },
		{ id: 'th1', name: 'Patience', x: 1435, y: 1036, w: 26, h: 26,
		  href: '/patience', build: 'treehouse', kidColor: 0xe86ba7, kidCss: '#ff9ecb',
		  prompt: 'Patience’s treehouse — the family key opens it' },
		{ id: 'th2', name: 'Daniel', x: 1631, y: 1281, w: 26, h: 26,
		  href: '/daniel', build: 'treehouse', kidColor: 0x4f9fd8, kidCss: '#8fd0ff',
		  prompt: 'Daniel’s treehouse — the family key opens it' },
		{ id: 'th3', name: 'Faith', x: 1873, y: 1505, w: 26, h: 26,
		  href: '/faith', build: 'treehouse', kidColor: 0x9a7fd8, kidCss: '#cbb2ff',
		  prompt: 'Faith’s treehouse — the family key opens it' },
		{ id: 'radio', name: 'the radio mast', x: 4095, y: 1260, w: 30, h: 30,
		  href: 'https://bareyourrare.org', external: true, build: 'mast', signTo: { x: 3955, y: 1295 },
		  prompt: 'The radio mast — broadcasting beyond the fence' },
		{ id: 'barn', name: 'the arcade barn', x: 3539, y: 1435, w: 120, h: 80,
		  href: null, build: 'barn', signTo: { x: 3325, y: 1505 },
		  prompt: 'The arcade barn — the games are moving in here soon' },
		{ id: 'shed', name: 'the old shed', x: 651, y: 1932, w: 60, h: 44,
		  href: null, build: 'shed', signTo: { x: 753, y: 1838 },
		  prompt: 'The shed is padlocked… but a drawer in the house opens' },
		{ id: 'mailbox', name: 'the mailbox', x: 2083, y: 2450, w: 10, h: 10,
		  href: null, build: 'mailbox',
		  prompt: 'Fresh mail soon — “recently added” lands here' }
	];

	// The eight family lines, shown as drive-in movie screens on the fence.
	var LINES = [
		{ name: 'The Cheesmans', href: '/cheesmans', x: 700, z: 130, face: 1 },
		{ name: 'The Dochertys', href: '/dochertys', x: 1700, z: 130, face: 1 },
		{ name: 'The Haistes', href: '/haistes', x: 2700, z: 130, face: 1 },
		{ name: 'The Lakemans', href: '/lakemans', x: 3700, z: 130, face: 1 },
		{ name: 'The Rycrofts', href: '/rycrofts', x: 130, z: 800, face: 2 },
		{ name: 'The McIvers', href: '/mcivers', x: 130, z: 1700, face: 2 },
		{ name: 'The Verbooms', href: '/verbooms', x: 4350, z: 800, face: 3 },
		{ name: 'The Steinkes', href: '/steinkes', x: 4350, z: 1700, face: 3 }
	];

	// The road net — wide, and full of bends. Nothing cuts the grove.
	var PATHS = [
		[ { x: 2240, y: 2485 }, { x: 2219, y: 2275 } ],
		[ { x: 2219, y: 2275 }, { x: 2170, y: 1890 } ],
		[ { x: 2170, y: 1890 }, HUB ],
		[ HUB, { x: 1750, y: 1785 } ],
		[ { x: 1750, y: 1785 }, { x: 1400, y: 1768 } ],
		[ { x: 1400, y: 1768 }, { x: 1085, y: 1628 } ],
		[ { x: 1085, y: 1628 }, { x: 875, y: 1383 } ],
		[ { x: 875, y: 1383 }, { x: 753, y: 1838 } ],
		[ HUB, { x: 2275, y: 1330 } ],
		[ { x: 2275, y: 1330 }, { x: 2205, y: 980 } ],
		[ { x: 2205, y: 980 }, { x: 2205, y: 578 } ],
		[ { x: 2205, y: 578 }, { x: 1820, y: 490 } ],
		[ { x: 1820, y: 490 }, { x: 1435, y: 700 } ],
		[ { x: 2205, y: 578 }, { x: 2625, y: 473 } ],
		[ { x: 2625, y: 473 }, { x: 3045, y: 753 } ],
		[ { x: 3045, y: 753 }, { x: 3255, y: 1050 } ],
		[ { x: 3255, y: 1050 }, { x: 3325, y: 1505 } ],
		[ HUB, { x: 2485, y: 1768 } ],
		[ { x: 2485, y: 1768 }, { x: 2888, y: 1680 } ],
		[ { x: 2888, y: 1680 }, { x: 3325, y: 1505 } ],
		[ { x: 3325, y: 1505 }, { x: 3955, y: 1295 } ],
		[ { x: 2485, y: 1768 }, { x: 2625, y: 2065 } ],
		[ { x: 2625, y: 2065 }, { x: 3063, y: 2170 } ],
		[ { x: 3063, y: 2170 }, { x: 3588, y: 2013 } ],
		[ { x: 3588, y: 2013 }, { x: 3850, y: 1715 } ],
		[ { x: 3850, y: 1715 }, { x: 3955, y: 1295 } ],
		[ HUB, { x: 2097, y: 1579 } ]
	];
	var ROAD_W = 62;

	// Terrain: a tilted grade + strong hills + broad swells + POND BOWLS
	// (negative gaussians — the dimples the water sits in).
	var TILT_Z = 0.016, TILT_X = 0.005; // climbs to the north, leans a little east
	var HILLS = [
		{ x: 525, z: 525, a: 36, r: 240 },
		{ x: 4025, z: 525, a: 40, r: 270 },
		{ x: 1225, z: 1225, a: 22, r: 190 },
		{ x: 2800, z: 1138, a: 27, r: 225 },
		{ x: 4113, z: 2188, a: 32, r: 240 },
		{ x: 613, z: 2275, a: 27, r: 210 },
		{ x: 3325, z: 735, a: 21, r: 240 },
		{ x: 1925, z: 2188, a: 20, r: 225 },
		{ x: 2240, z: 1260, a: 15, r: 900 },
		{ x: 1085, z: 735, a: 12, r: 700 },
		{ x: 3500, z: 1925, a: 14, r: 800 },
		// pond bowls
		{ x: 3690, z: 980, a: -11, r: 260 },
		{ x: 4000, z: 2065, a: -10, r: 230 },
		{ x: 1260, z: 2065, a: -10, r: 220 },
		{ x: 2940, z: 315, a: -9, r: 200 }
	];
	var PONDS = [
		{ x: 3690, z: 980, waterR: 100 },
		{ x: 4000, z: 2065, waterR: 88 },
		{ x: 1260, z: 2065, waterR: 84 },
		{ x: 2940, z: 315, waterR: 74 }
	];
	var FLAT = [
		{ x: 1211, z: 588, ri: 160, ro: 315 },
		{ x: 2240, z: 462, ri: 122, ro: 262 },
		{ x: 3136, z: 686, ri: 140, ro: 300 },
		{ x: 693, z: 1302, ri: 175, ro: 332 },
		{ x: 3539, z: 1435, ri: 158, ro: 315 },
		{ x: 651, z: 1932, ri: 105, ro: 245 },
		{ x: 4095, z: 1260, ri: 88, ro: 228 },
		{ x: 2240, z: 2432, ri: 245, ro: 455 },
		{ x: 1694, z: 1284, ri: 560, ro: 750 },
		{ x: 3850, z: 1802, ri: 88, ro: 210 },
		{ x: 2730, z: 630, ri: 70, ro: 160 } // the tractor's pull-off
	];
	// Monster ramps ON the roads — big enough to launch a flip from.
	var MOUNDS = [
		{ x: 2695, z: 1724, a: 20, r: 60 },
		{ x: 2205, z: 788, a: 18, r: 54 },
		{ x: 3325, z: 2100, a: 22, r: 66 }
	];
	var PADS = [
		{ x: 2188, z: 2065 }, { x: 2258, z: 1155 },
		{ x: 2625, z: 1750 }, { x: 3693, z: 1960 }
	];
	var TOKENS = [
		{ x: 350, z: 350 }, { x: 4200, z: 315 }, { x: 315, z: 2188 },
		{ x: 4165, z: 2310 }, { x: 2240, z: 210 }, { x: 1120, z: 210 },
		{ x: 3325, z: 263 }, { x: 4288, z: 1225 }, { x: 175, z: 1225 },
		{ x: 1225, z: 2363 }, { x: 2888, z: 2363 }, { x: 788, z: 1663 },
		{ x: 1575, z: 315 }, { x: 2625, z: 1225 }, { x: 3763, z: 875 },
		{ x: 613, z: 963 }, { x: 2695, z: 1724, air: true }, { x: 2205, z: 788, air: true },
		{ x: 525, z: 2065 }, { x: 4078, z: 1138 }
	];

	var stage, hudEl, chipEl;
	var renderer, scene, camera, clock;
	var Matter, engine, buggyBody;
	var buggyGroup, chassisGroup, wheels = [], blobShadow;
	var bales = [];
	var stacks = [];
	var restackPad = { x: 3850, z: 1802, r: 40, holdMS: 0 };
	var clickables = [];
	var mastLamp = null;
	var gateArm = null, gateBody = null, gateOpen = false, isFamily = false;
	var PROMPTS = [];
	var keys = {}, accMS = 0, nearLandmark = null;
	var camPos = null, raycaster = null, pointerNDC = null;
	var dustPool = [], splashPool = [], smokeEmitters = [], trackPool = [], trackIdx = 0, distMark = 0;
	var audio = { ctx: null, on: false, master: null, engGain: null, engOsc1: null, engOsc2: null };
	var soundBtn = null;
	var tokens = [], tokenCount = 0, tokenFound = 0;
	var airborne = false, vAlt = 0, worldY = 0, prevGy = 0;
	var airPitch = 0, jumpCooldown = 0;
	var boostT = 0, padCooldown = [];
	var inWater = false;
	var baseFov = 55;
	var pX = 0, pY = 0, pA = 0; // physics-step interpolation

	/* ------------------------------------------------------------------ *
	 *  Terrain
	 * ------------------------------------------------------------------ */
	function gauss( x, z, g ) {
		var dx = x - g.x, dz = z - g.z;
		var s2 = ( g.r / 2 ) * ( g.r / 2 ) * 2;
		return g.a * Math.exp( -( dx * dx + dz * dz ) / s2 );
	}
	function rawHills( x, z ) {
		var y = ( H - z ) * TILT_Z + ( x - W / 2 ) * TILT_X; // the grade
		for ( var i = 0; i < HILLS.length; i++ ) y += gauss( x, z, HILLS[ i ] );
		return y;
	}
	function hillsAt( x, z ) {
		var y = rawHills( x, z );
		for ( var i = 0; i < FLAT.length; i++ ) {
			var f = FLAT[ i ];
			var d = Math.hypot( x - f.x, z - f.z );
			if ( d >= f.ro ) continue;
			var w = d <= f.ri ? 1 : 1 - ( d - f.ri ) / ( f.ro - f.ri );
			w = w * w * ( 3 - 2 * w );
			if ( f.h === undefined ) f.h = rawHills( f.x, f.z );
			y = y * ( 1 - w ) + f.h * w;
		}
		return y;
	}
	function heightAt( x, z ) {
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
	function wrapAngle( a ) {
		while ( a > Math.PI ) a -= 2 * Math.PI;
		while ( a < -Math.PI ) a += 2 * Math.PI;
		return a;
	}

	function boot( stageEl ) {
		stage = stageEl;
		hudEl = stage.querySelector( '.bq-hud' );
		chipEl = stage.querySelector( '.bq-chip' );
		Matter = window.Matter;
		var THREE = window.THREE;
		isFamily = !! ( window.tcVentures && Number( window.tcVentures.bqFamily ) );

		renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.setPixelRatio( Math.min( window.devicePixelRatio || 1, 2 ) );
		renderer.setSize( stage.clientWidth, stage.clientHeight );
		renderer.domElement.className = 'bq-canvas';
		renderer.domElement.setAttribute( 'aria-hidden', 'true' );
		stage.appendChild( renderer.domElement );

		scene = new THREE.Scene();
		scene.background = new THREE.Color( 0x0a1220 );
		scene.fog = new THREE.Fog( 0x0a1220, 560, 2700 );

		camera = new THREE.PerspectiveCamera( baseFov, stage.clientWidth / stage.clientHeight, 1, 8000 );

		scene.add( new THREE.AmbientLight( 0x24324a, 0.85 ) );
		scene.add( new THREE.HemisphereLight( 0x39506e, 0x141d14, 0.5 ) );
		var moon = new THREE.DirectionalLight( 0x9ec2e8, 0.75 );
		moon.position.set( -700, 900, -600 );
		scene.add( moon );
		var moonBall = new THREE.Mesh(
			new THREE.SphereGeometry( 110, 20, 20 ),
			new THREE.MeshBasicMaterial( { color: 0xdfe9f5, fog: false } )
		);
		moonBall.position.set( -1400, 900, -2000 );
		scene.add( moonBall );

		// ---------- ground: displaced terrain with roads painted in ----------
		var groundGeo = new THREE.PlaneGeometry( 7200, 5200, 260, 180 );
		groundGeo.rotateX( -Math.PI / 2 );
		groundGeo.translate( W / 2, 0, H / 2 );
		var pos = groundGeo.attributes.position;
		var colors = new Float32Array( pos.count * 3 );
		var core = ROAD_W / 2, feather = ROAD_W / 2 + 18;
		for ( var vi = 0; vi < pos.count; vi++ ) {
			var vx = pos.getX( vi ), vz = pos.getZ( vi );
			var vy = hillsAt( vx, vz );
			pos.setY( vi, vy );
			var dR = 1e9;
			for ( var pi = 0; pi < PATHS.length; pi++ ) {
				dR = Math.min( dR, distToSeg( vx, vz, PATHS[ pi ][ 0 ], PATHS[ pi ][ 1 ] ) );
				if ( dR < core ) break;
			}
			var road = dR <= core ? 1 : ( dR >= feather ? 0 : 1 - ( dR - core ) / ( feather - core ) );
			var n = 0.5 + 0.5 * Math.sin( vx * 0.013 ) * Math.sin( vz * 0.017 );
			var lift = 1 + ( vy - 20 ) * 0.006;
			var fr = ( 0.085 + n * 0.02 ) * lift, fg = ( 0.14 + n * 0.03 ) * lift, fb = ( 0.10 + n * 0.02 ) * lift;
			var rr = 0.30 * lift, rg = 0.24 * lift, rb = 0.165 * lift;
			colors[ vi * 3 ] = fr + ( rr - fr ) * road;
			colors[ vi * 3 + 1 ] = fg + ( rg - fg ) * road;
			colors[ vi * 3 + 2 ] = fb + ( rb - fb ) * road;
		}
		groundGeo.setAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
		groundGeo.computeVertexNormals();
		scene.add( new THREE.Mesh( groundGeo,
			new THREE.MeshLambertMaterial( { vertexColors: true } ) ) );

		buildPonds( THREE );
		buildMounds( THREE );
		buildPads( THREE );

		// ---------- physics ----------
		engine = Matter.Engine.create();
		engine.gravity.x = 0; engine.gravity.y = 0;
		buggyBody = Matter.Bodies.rectangle( SPAWN.x, SPAWN.y, 46, 30, { frictionAir: 0.14, density: 0.002 } );
		Matter.Body.setAngle( buggyBody, SPAWN.angle );
		pX = SPAWN.x; pY = SPAWN.y; pA = SPAWN.angle;

		var statics = [], T = 40;
		statics.push( Matter.Bodies.rectangle( W / 2, 6, W, T, { isStatic: true } ) );
		statics.push( Matter.Bodies.rectangle( W / 2, H - 6, W, T, { isStatic: true } ) );
		statics.push( Matter.Bodies.rectangle( 6, H / 2, T, H, { isStatic: true } ) );
		statics.push( Matter.Bodies.rectangle( W - 6, H / 2, T, H, { isStatic: true } ) );
		LANDMARKS.forEach( function ( lm ) {
			if ( lm.build === 'treehouse' ) {
				statics.push( Matter.Bodies.circle( lm.x, lm.y, 13, { isStatic: true } ) );
			} else if ( lm.build === 'mailbox' ) {
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
		buildDriveIns( THREE );
		buildAnimals( THREE );
		buildTractor( THREE );
		buildBales( THREE );
		buildStacks( THREE );
		buildRestackPad( THREE );
		buildTokens( THREE );

		buggyGroup = buildBuggy( THREE );
		buggyGroup.rotation.order = 'YZX'; // yaw, then pitch about the axles
		scene.add( buggyGroup );
		camPos = new THREE.Vector3( SPAWN.x, 90, SPAWN.y + 160 );
		prevGy = heightAt( SPAWN.x, SPAWN.y );
		worldY = prevGy;

		initDust( THREE );
		initSplash( THREE );
		initTracks( THREE );
		initSmoke( THREE );
		buildSoundToggle();

		LANDMARKS.forEach( function ( lm ) { PROMPTS.push( lm ); } );
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
		hudEl.textContent = '3D beta · WASD drives · Space jumps · L/R Shift flips · H honks · Enter steps inside · ⛁ '
			+ tokenFound + '/' + tokenCount;
	}

	function onKey( e ) {
		if ( document.activeElement !== stage ) return;
		var act = null;
		if ( e.code === 'Space' ) act = 'jump';
		else if ( e.code === 'ShiftLeft' ) act = 'tiltF';
		else if ( e.code === 'ShiftRight' ) act = 'tiltB';
		else {
			var k = e.key.toLowerCase();
			var map = { w: 'up', arrowup: 'up', s: 'down', arrowdown: 'down',
				a: 'left', arrowleft: 'left', d: 'right', arrowright: 'right',
				enter: 'enter', escape: 'esc', h: 'honk' };
			if ( k in map ) act = map[ k ];
		}
		if ( ! act ) return;
		e.preventDefault();
		var down = ( e.type === 'keydown' );
		keys[ act ] = down;
		if ( down && act === 'esc' ) stage.blur();
		if ( down && act === 'enter' && nearLandmark ) enterLandmark( nearLandmark );
		if ( down && act === 'honk' ) honk();
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
			pX = buggyBody.position.x;
			pY = buggyBody.position.y;
			pA = buggyBody.angle;
			control();
			Matter.Engine.update( engine, 16.666 );
			accMS -= 16.666;
		}
		render( dms, Math.max( 0, Math.min( 1, accMS / 16.666 ) ) );
	}

	var steerInput = 0, throttleInput = 0;
	function control() {
		var b = buggyBody;
		var heading = { x: Math.cos( b.angle ), y: Math.sin( b.angle ) };

		// water check (the pond dimples)
		inWater = false;
		if ( ! airborne ) {
			for ( var pw = 0; pw < PONDS.length; pw++ ) {
				if ( Math.hypot( b.position.x - PONDS[ pw ].x, b.position.y - PONDS[ pw ].z ) < PONDS[ pw ].waterR ) {
					inWater = true;
					break;
				}
			}
		}
		b.frictionAir = airborne ? 0.02 : ( inWater ? 0.26 : 0.14 );

		throttleInput = ( keys.up ? 1 : 0 ) - ( keys.down ? 0.65 : 0 );
		steerInput = ( keys.right ? 1 : 0 ) - ( keys.left ? 1 : 0 );

		Matter.Body.setAngularVelocity( b, steerInput * ( airborne ? 0.03 : 0.072 ) );

		var power = boostT > 0 ? 0.0078 : 0.0042;
		if ( airborne ) power *= 0.25;
		if ( inWater ) power *= 0.7;
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

		if ( ! airborne ) {
			var g = slopeAt( b.position.x, b.position.y );
			var along = g.x * heading.x + g.z * heading.y;
			nvx += heading.x * ( -along ) * 0.9;
			nvy += heading.y * ( -along ) * 0.9;
		}
		Matter.Body.setVelocity( b, { x: nvx, y: nvy } );

		var cap = boostT > 0 ? 13 : 9;
		if ( inWater ) cap *= 0.6;
		var sp = Math.hypot( b.velocity.x, b.velocity.y );
		if ( sp > cap ) Matter.Body.setVelocity( b, { x: b.velocity.x * cap / sp, y: b.velocity.y * cap / sp } );

		if ( boostT > 0 ) boostT -= 16.666;
		if ( jumpCooldown > 0 ) jumpCooldown -= 16.666;

		// SPACE: bunny hop (bigger with speed)
		if ( keys.jump && ! airborne && jumpCooldown <= 0 ) {
			jumpCooldown = 300;
			airborne = true;
			vAlt = 95 + sp * 5;
		}
	}

	function render( dms, alpha ) {
		dms = dms || 16.666;
		if ( alpha === undefined ) alpha = 1;
		var dt = dms / 1000;
		var b = buggyBody;
		var sp = Math.hypot( b.velocity.x, b.velocity.y );
		var t = clock.elapsedTime;

		var rx = pX + ( b.position.x - pX ) * alpha;
		var rz = pY + ( b.position.y - pY ) * alpha;
		var ra = pA + wrapAngle( b.angle - pA ) * alpha;

		// ---- vertical: terrain, ramps, Space-jumps, mid-air FLIPS ----
		var gy = heightAt( rx, rz );
		if ( ! airborne ) {
			var groundRate = ( gy - prevGy ) / Math.max( dt, 0.001 );
			if ( groundRate < -60 && sp > 4.6 ) {
				airborne = true;
				vAlt = Math.min( 150, -groundRate * 0.9 );
				worldY = prevGy;
			} else {
				worldY = gy;
			}
		}
		if ( airborne ) {
			worldY += vAlt * dt;
			vAlt -= 320 * dt;
			// L/R Shift pitch the buggy for flips
			var pitchVel = ( keys.tiltF ? -6.8 : 0 ) + ( keys.tiltB ? 6.8 : 0 );
			airPitch += pitchVel * dt;
			if ( worldY <= gy ) {
				airborne = false;
				worldY = gy;
				vAlt = 0;
				var n = wrapAngle( airPitch );
				if ( Math.abs( n ) > 0.75 ) {
					// crashed the rotation — eat dirt
					Matter.Body.setVelocity( b, { x: b.velocity.x * 0.3, y: b.velocity.y * 0.3 } );
					for ( var cd = 0; cd < 10; cd++ ) spawnDust( wheelWorld( -10 + Math.random() * 20, -14 + Math.random() * 28 ), 6 );
					flashChip( 'Ate dirt — square the landing next time' );
				} else {
					if ( Math.abs( airPitch ) > 5.5 ) { // stuck a full flip
						boostT = 800;
						flashChip( 'FLIP! — have some boost 🛞' );
						if ( audio.on ) whoosh();
					}
					for ( var ld = 0; ld < 6; ld++ ) spawnDust( wheelWorld( -8 + Math.random() * 16, -12 + Math.random() * 24 ), sp );
				}
				airPitch = 0;
			}
		}
		prevGy = gy;

		buggyGroup.position.set( rx, worldY, rz );
		buggyGroup.rotation.y = -ra;
		buggyGroup.rotation.z = airPitch;
		chassisGroup.rotation.x += ( ( steerInput * -0.08 * Math.min( 1, sp / 3 ) ) - chassisGroup.rotation.x ) * 0.15;
		chassisGroup.rotation.z += ( ( ( airborne ? -0.1 : throttleInput * -0.05 ) ) - chassisGroup.rotation.z ) * 0.12;
		for ( var i = 0; i < wheels.length; i++ ) wheels[ i ].rotation.z -= sp * 0.09;
		var hover = worldY - gy;
		blobShadow.position.set( rx, gy + 0.6, rz );
		blobShadow.material.opacity = Math.max( 0.06, 0.32 - hover * 0.008 );

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
		updateAnimals( dms );
		updateTokens( dms, t );
		checkPads( t );

		if ( mastLamp ) mastLamp.visible = ( Math.floor( t * 1.4 ) % 2 ) === 0;

		if ( gateArm ) {
			var gd = Math.hypot( b.position.x - GATE.x, b.position.y - GATE.z );
			if ( isFamily && ! gateOpen && gd < 140 ) {
				gateOpen = true;
				if ( gateBody ) Matter.Composite.remove( engine.world, gateBody );
			}
			var target = gateOpen ? -1.25 : 0;
			gateArm.rotation.x += ( target - gateArm.rotation.x ) * 0.06;
		}

		// juice
		if ( inWater && sp > 1.4 ) {
			spawnSplash( wheelWorld( 10, 12 ), sp );
			spawnSplash( wheelWorld( 10, -12 ), sp );
		} else if ( ! airborne && sp > 1.6 && Math.random() < Math.min( 0.55, 0.1 + sp * 0.04 + Math.abs( steerInput ) * 0.2 ) ) {
			spawnDust( wheelWorld( -16, steerInput >= 0 ? 13 : -13 ), sp );
		}
		updateDust( dms );
		distMark += sp * ( dms / 16.666 );
		if ( ! airborne && ! inWater && sp > 1.2 && distMark > 9 ) {
			distMark = 0;
			dropTrack( wheelWorld( -15, 13 ) );
			dropTrack( wheelWorld( -15, -13 ) );
		}
		updateTracks( dms );
		updateSmoke( dms );
		updateAudio( sp );

		var near = null, nearD = 1e9;
		for ( var p = 0; p < PROMPTS.length; p++ ) {
			var lm = PROMPTS[ p ];
			var d = Math.hypot( b.position.x - lm.x, b.position.y - lm.y );
			var range = ( lm.id === 'familygate' || lm.id === 'restack' ) ? 130 : 180;
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
		var hx = Math.cos( ra ), hy = Math.sin( ra );
		var tx = rx - hx * 150, tz = rz - hy * 150;
		camPos.x += ( tx - camPos.x ) * 0.06;
		camPos.z += ( tz - camPos.z ) * 0.06;
		camPos.y += ( ( worldY + 76 + sp * 3 ) - camPos.y ) * 0.06;
		camera.position.copy( camPos );
		camera.lookAt( rx + hx * 48, worldY + 6, rz + hy * 48 );
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
				var sp = Math.max( Math.hypot( b.velocity.x, b.velocity.y ), 9.4 );
				Matter.Body.setVelocity( b, { x: Math.cos( a ) * sp, y: Math.sin( a ) * sp } );
				if ( audio.on && audio.ctx ) whoosh();
			}
		}
	}

	function buildTokens( THREE ) {
		var found = [];
		try { found = JSON.parse( window.localStorage.getItem( 'tcBqTok_v1' ) || '[]' ); } catch ( err ) {}
		var geo = new THREE.CylinderGeometry( 6, 6, 1.8, 16 );
		geo.rotateZ( Math.PI / 2 );
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
			if ( d2 < ( tk.air ? 34 : 24 ) && dy < ( tk.air ? 26 : 17 ) ) {
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
		[ { x: 3745, z: 1663 }, { x: 980, z: 823 } ].forEach( function ( at ) {
			var stack = { toppled: false, bottoms: [], uppers: [] };
			[ -22, 0, 22 ].forEach( function ( off ) {
				var idx = addBale( THREE, at.x + off, at.z );
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
				restackPad.holdMS = -2500;
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
		for ( var i = bales.length - 1; i >= 0; i-- ) {
			var bl = bales[ i ];
			if ( bl.upperOf ) {
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
		buildSign( THREE, 'restack the bales', restackPad.x + 52, restackPad.z,
			restackPad.x, restackPad.z );
	}

	/* ------------------------------------------------------------------ *
	 *  Heritage drive-in screens (one per family line)
	 * ------------------------------------------------------------------ */
	function buildDriveIns( THREE ) {
		LINES.forEach( function ( line ) {
			var c = document.createElement( 'canvas' );
			c.width = 560; c.height = 320;
			var ctx = c.getContext( '2d' );
			// the dark screen
			ctx.fillStyle = '#171310';
			ctx.fillRect( 0, 0, 560, 320 );
			ctx.fillStyle = '#0d0b09';
			ctx.fillRect( 22, 22, 516, 276 );
			// marquee bulbs around the border
			for ( var bx = 34; bx < 560; bx += 44 ) {
				ctx.fillStyle = ( bx / 44 ) % 2 < 1 ? '#ffd9a0' : '#7a5a34';
				ctx.beginPath(); ctx.arc( bx, 11, 6, 0, 7 ); ctx.fill();
				ctx.beginPath(); ctx.arc( bx, 309, 6, 0, 7 ); ctx.fill();
			}
			ctx.textAlign = 'center';
			ctx.font = '600 58px Georgia, serif';
			ctx.fillStyle = '#ffe3b0';
			ctx.fillText( line.name, 280, 150 );
			ctx.font = 'italic 30px Georgia, serif';
			ctx.fillStyle = 'rgba(255, 227, 176, 0.6)';
			ctx.fillText( 'a family line · drive in', 280, 215 );

			var g = new THREE.Group();
			var wood = mat( THREE, 0x3a2c1c );
			[ -52, 52 ].forEach( function ( ox ) {
				var leg = new THREE.Mesh( new THREE.BoxGeometry( 5, 34, 5 ), wood );
				leg.position.set( ox, 17, 0 );
				g.add( leg );
			} );
			var panel = new THREE.Mesh( new THREE.BoxGeometry( 124, 70, 3 ), mat( THREE, 0x241c14 ) );
			panel.position.y = 66;
			g.add( panel );
			var face = new THREE.Mesh(
				new THREE.PlaneGeometry( 118, 66 ),
				new THREE.MeshBasicMaterial( { map: new THREE.CanvasTexture( c ) } )
			);
			face.position.set( 0, 66, 2 );
			g.add( face );

			var lm = { id: 'line-' + line.href, name: line.name, x: line.x, y: line.z,
				href: line.href, prompt: line.name + ' — a family line, projected on the night' };
			g.position.set( line.x, hillsAt( line.x, line.z ), line.z );
			// face into the field: 1 = north fence (face south), 2 = west
			// fence (face east), 3 = east fence (face west)
			g.rotation.y = line.face === 1 ? 0 : ( line.face === 2 ? Math.PI / 2 : -Math.PI / 2 );
			g.userData.lm = lm;
			scene.add( g );
			clickables.push( g );
			PROMPTS.push( lm );
			Matter.Composite.add( engine.world,
				Matter.Bodies.rectangle( line.x, line.z,
					line.face === 1 ? 124 : 12, line.face === 1 ? 12 : 124, { isStatic: true } ) );
		} );
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
		[ -1, 1 ].forEach( function ( sd ) {
			var post = new THREE.Mesh( new THREE.BoxGeometry( 3.2, 42, 3.2 ), wood );
			post.position.set( sd * ( bw / 2 + 4 ), 21, 0 );
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
		g.position.set( lm.x, hillsAt( lm.x, lm.y ), lm.y );
		if ( lm.build === 'treehouse' ) g.scale.set( 1.75, 1.75, 1.75 );
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
		Matter.Composite.add( engine.world, [
			Matter.Bodies.rectangle( cx, COMPOUND.z0, wReg, 6, { isStatic: true } ),
			Matter.Bodies.rectangle( cx, COMPOUND.z1, wReg, 6, { isStatic: true } ),
			Matter.Bodies.rectangle( COMPOUND.x0, cz, 6, hReg, { isStatic: true } ),
			Matter.Bodies.rectangle( COMPOUND.x1, ( COMPOUND.z0 + COMPOUND.gateZ0 ) / 2, 6,
				COMPOUND.gateZ0 - COMPOUND.z0, { isStatic: true } )
		] );

		var gateH = hillsAt( GATE.x, GATE.z );
		var postMat = mat( THREE, 0x59554c );
		[ COMPOUND.gateZ0, COMPOUND.gateZ1 ].forEach( function ( z ) {
			var p = new THREE.Mesh( new THREE.BoxGeometry( 6, 20, 6 ), postMat );
			p.position.set( COMPOUND.x1, gateH + 10, z );
			scene.add( p );
		} );

		var armGeo = new THREE.BoxGeometry( 2.4, 2.6, COMPOUND.gateZ1 - COMPOUND.gateZ0 - 4 );
		armGeo.translate( 0, 0, ( COMPOUND.gateZ1 - COMPOUND.gateZ0 - 4 ) / 2 );
		gateArm = new THREE.Mesh( armGeo, mat( THREE, 0xb8352c ) );
		gateArm.position.set( COMPOUND.x1, gateH + 12, COMPOUND.gateZ0 + 2 );
		scene.add( gateArm );
		gateBody = Matter.Bodies.rectangle( GATE.x, GATE.z, 10,
			COMPOUND.gateZ1 - COMPOUND.gateZ0, { isStatic: true } );
		Matter.Composite.add( engine.world, gateBody );

		buildSign( THREE, 'the treehouses · family only',
			COMPOUND.x1 + 26, COMPOUND.gateZ0 - 14, HUB.x + 40, HUB.y );

		var lamp = new THREE.Mesh( new THREE.BoxGeometry( 3.4, 4, 3.4 ),
			new THREE.MeshBasicMaterial( { color: 0xffd9a0 } ) );
		lamp.position.set( COMPOUND.x1, gateH + 22, COMPOUND.gateZ0 );
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

	function buildPonds( THREE ) {
		// water sits in the dimples: a disc at each bowl's level. Driving in
		// is a wade — splash + drag (see control()/render()).
		var pondMat = new THREE.MeshLambertMaterial( { color: 0x152c3e, emissive: 0x060f16 } );
		var glintMat = new THREE.MeshBasicMaterial( { color: 0xbcd6ea, transparent: true, opacity: 0.16 } );
		PONDS.forEach( function ( p ) {
			p.waterY = hillsAt( p.x, p.z ) + 3;
			var pond = new THREE.Mesh( new THREE.CircleGeometry( p.waterR, 22 ), pondMat );
			pond.rotation.x = -Math.PI / 2;
			pond.position.set( p.x, p.waterY, p.z );
			pond.scale.x = 1.25;
			scene.add( pond );
			var glint = new THREE.Mesh( new THREE.CircleGeometry( p.waterR * 0.3, 12 ), glintMat );
			glint.rotation.x = -Math.PI / 2;
			glint.position.set( p.x - p.waterR * 0.3, p.waterY + 0.15, p.z - p.waterR * 0.2 );
			glint.scale.x = 1.8;
			scene.add( glint );
		} );
	}

	/* ---- livestock ---- */
	var animals = [];

	function buildAnimals( THREE ) {
		var cows = [ [ 3063, 1365 ], [ 1575, 2013 ], [ 2713, 910 ], [ 3763, 1540 ] ];
		var sheep = [ [ 875, 1050 ], [ 2538, 2188 ], [ 1838, 613 ], [ 3938, 735 ], [ 1225, 1750 ] ];
		cows.forEach( function ( p ) { addAnimal( THREE, 'cow', p[ 0 ], p[ 1 ] ); } );
		sheep.forEach( function ( p ) { addAnimal( THREE, 'sheep', p[ 0 ], p[ 1 ] ); } );
	}

	function addAnimal( THREE, type, x, z ) {
		var g = new THREE.Group();
		var cow = type === 'cow';
		var bodyC = cow ? 0x6f4a33 : 0xd8d3c4;
		var headC = cow ? 0x543527 : 0x2a2420;
		var legC = cow ? 0x452c1f : 0xbdb7a6;
		var bw = cow ? 20 : 13, bh = cow ? 11 : 8.5, bd = cow ? 10 : 9;
		var legH = cow ? 6 : 4;
		[ [ 1, 1 ], [ 1, -1 ], [ -1, 1 ], [ -1, -1 ] ].forEach( function ( c ) {
			var leg = new THREE.Mesh( new THREE.BoxGeometry( 1.6, legH, 1.6 ), mat( THREE, legC ) );
			leg.position.set( c[ 0 ] * ( bw / 2 - 2 ), legH / 2, c[ 1 ] * ( bd / 2 - 1.5 ) );
			g.add( leg );
		} );
		var body = new THREE.Mesh( new THREE.BoxGeometry( bw, bh, bd ), mat( THREE, bodyC ) );
		body.position.y = legH + bh / 2 - 0.5;
		g.add( body );
		var head = new THREE.Mesh(
			new THREE.BoxGeometry( cow ? 7 : 5, cow ? 7 : 5, cow ? 6 : 4.5 ), mat( THREE, headC ) );
		head.position.set( bw / 2 + 2, legH + bh - 1, 0 );
		g.add( head );
		scene.add( g );
		var body2d = Matter.Bodies.circle( x, z, cow ? 11 : 7,
			{ frictionAir: 0.18, density: 0.003 } );
		Matter.Composite.add( engine.world, body2d );
		animals.push( { g: g, body: body2d, cow: cow, wanderT: 800 + Math.random() * 2400 } );
	}

	function updateAnimals( dms ) {
		for ( var i = 0; i < animals.length; i++ ) {
			var a = animals[ i ];
			a.wanderT -= dms;
			if ( a.wanderT <= 0 ) {
				a.wanderT = 1800 + Math.random() * 2800;
				if ( Math.random() < 0.7 ) {
					var dir = Math.random() * Math.PI * 2;
					var spd = a.cow ? 0.5 : 0.7;
					Matter.Body.setVelocity( a.body, { x: Math.cos( dir ) * spd, y: Math.sin( dir ) * spd } );
				}
			}
			var px = a.body.position.x, pz = a.body.position.y;
			a.g.position.set( px, heightAt( px, pz ), pz );
			var v = a.body.velocity;
			if ( Math.hypot( v.x, v.y ) > 0.15 ) {
				a.g.rotation.y = -Math.atan2( v.y, v.x );
			}
		}
	}

	/* ---- the old tractor ---- */
	function buildTractor( THREE ) {
		var g = new THREE.Group();
		var red = mat( THREE, 0x9a3f2e );
		var darkMat = mat( THREE, 0x1c1512 );
		var rearGeo = new THREE.CylinderGeometry( 11, 11, 5, 12 );
		rearGeo.rotateX( Math.PI / 2 );
		var frontGeo = new THREE.CylinderGeometry( 6.5, 6.5, 4, 10 );
		frontGeo.rotateX( Math.PI / 2 );
		[ 13, -13 ].forEach( function ( z ) {
			var rw = new THREE.Mesh( rearGeo, darkMat );
			rw.position.set( -10, 11, z );
			g.add( rw );
			var fw = new THREE.Mesh( frontGeo, darkMat );
			fw.position.set( 14, 6.5, z * 0.8 );
			g.add( fw );
		} );
		var chassis = new THREE.Mesh( new THREE.BoxGeometry( 34, 8, 18 ), red );
		chassis.position.set( 2, 14, 0 );
		g.add( chassis );
		var hood = new THREE.Mesh( new THREE.BoxGeometry( 16, 10, 14 ), mat( THREE, 0x7e3225 ) );
		hood.position.set( 10, 20, 0 );
		g.add( hood );
		var seatBack = new THREE.Mesh( new THREE.BoxGeometry( 3, 10, 12 ), darkMat );
		seatBack.position.set( -14, 22, 0 );
		g.add( seatBack );
		var pipe = new THREE.Mesh( new THREE.CylinderGeometry( 1.2, 1.2, 9, 6 ), darkMat );
		pipe.position.set( 15, 29, 4 );
		g.add( pipe );

		var lm = { id: 'tractor', name: 'the old tractor', x: 2730, y: 630, href: null,
			prompt: 'The old girl still runs — she just needs a reason' };
		g.position.set( lm.x, hillsAt( lm.x, lm.y ), lm.y );
		g.rotation.y = 0.6;
		g.userData.lm = lm;
		scene.add( g );
		clickables.push( g );
		PROMPTS.push( lm );
		Matter.Composite.add( engine.world,
			Matter.Bodies.rectangle( lm.x, lm.y, 42, 26, { isStatic: true } ) );
	}

	function buildWindbreak( THREE ) {
		var trunkMat = mat( THREE, 0x2c2418 );
		var leafMat = mat( THREE, 0x1d3a26 );
		for ( var i = 0; i < 14; i++ ) {
			var f = i / 13;
			var x = 1383 + f * 615 + ( Math.random() - 0.5 ) * 40;
			var z = 980 + f * 595 + ( Math.random() - 0.5 ) * 40;
			var gy = hillsAt( x, z );
			var trunk = new THREE.Mesh( new THREE.CylinderGeometry( 4.2, 6, 28, 6 ), trunkMat );
			trunk.position.set( x, gy + 14, z );
			scene.add( trunk );
			var h = 75 + Math.random() * 40;
			var cone = new THREE.Mesh( new THREE.ConeGeometry( 17 + Math.random() * 7, h, 7 ), leafMat );
			cone.position.set( x, gy + 28 + h / 2, z );
			scene.add( cone );
			Matter.Composite.add( engine.world, Matter.Bodies.circle( x, z, 11, { isStatic: true } ) );
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
		var step = 300;
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
		var gh = hillsAt( 2240, H - 6 );
		var stone = mat( THREE, 0x59554c );
		[ 2180, 2300 ].forEach( function ( x ) {
			var pillar = new THREE.Mesh( new THREE.BoxGeometry( 10, 26, 10 ), stone );
			pillar.position.set( x, gh + 13, H - 6 );
			scene.add( pillar );
		} );
		var bar = new THREE.Mesh( new THREE.BoxGeometry( 124, 3, 3 ), mat( THREE, 0x4a4034 ) );
		bar.position.set( 2240, gh + 27, H - 6 );
		scene.add( bar );
		var lantern = new THREE.Mesh( new THREE.BoxGeometry( 4, 5, 4 ),
			new THREE.MeshBasicMaterial( { color: 0xffd9a0 } ) );
		lantern.position.set( 2240, gh + 31, H - 6 );
		scene.add( lantern );
		addGlowDisc( THREE, 2240, H - 30, 34, 0.08 );
	}

	function makeBaleMesh( THREE ) {
		var baleGeo = new THREE.CylinderGeometry( 9, 9, 16, 12 );
		baleGeo.rotateZ( Math.PI / 2 );
		return new THREE.Mesh( baleGeo, mat( THREE, 0x8f7a3e ) );
	}

	function addBale( THREE, x, z ) {
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
		while ( placed < 12 && guard++ < 160 ) {
			var x = 350 + Math.random() * ( W - 700 );
			var z = 260 + Math.random() * ( H - 520 );
			if ( Math.hypot( x - SPAWN.x, z - SPAWN.y ) < 160 ) continue;
			if ( ! farFromLandmarks( x, z, 130 ) || inCompound( x, z, 30 ) || ! farFromRoads( x, z, 60 ) ) continue;
			addBale( THREE, x, z );
			placed++;
		}
	}

	/* ------------------------------------------------------------------ *
	 *  P2 juice — dust, splash, tracks, smoke, sound
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

	function initPool( THREE, pool, count, tex ) {
		for ( var i = 0; i < count; i++ ) {
			var spr = new THREE.Sprite( new THREE.SpriteMaterial( {
				map: tex, transparent: true, opacity: 0, depthWrite: false
			} ) );
			spr.scale.set( 8, 8, 1 );
			scene.add( spr );
			pool.push( { spr: spr, life: 0, max: 0 } );
		}
	}

	function initDust( THREE ) { initPool( THREE, dustPool, 32, makePuffTexture( THREE, 158, 138, 106 ) ); }
	function initSplash( THREE ) { initPool( THREE, splashPool, 20, makePuffTexture( THREE, 140, 180, 214 ) ); }

	function spawnFrom( pool, at, sp ) {
		for ( var i = 0; i < pool.length; i++ ) {
			if ( pool[ i ].life <= 0 ) {
				var p = pool[ i ];
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
	function spawnDust( at, sp ) { spawnFrom( dustPool, at, sp ); }
	function spawnSplash( at, sp ) { spawnFrom( splashPool, at, sp * 0.8 ); }

	function updatePool( pool, dms, baseOpacity ) {
		for ( var i = 0; i < pool.length; i++ ) {
			var p = pool[ i ];
			if ( p.life <= 0 ) continue;
			p.life -= dms;
			var f = Math.max( 0, p.life / p.max );
			p.spr.material.opacity = baseOpacity * f;
			p.spr.position.y += p.vy * ( dms / 1000 );
			var s = 8 + ( 1 - f ) * p.grow;
			p.spr.scale.set( s, s, 1 );
		}
	}
	function updateDust( dms ) {
		updatePool( dustPool, dms, 0.34 );
		updatePool( splashPool, dms, 0.4 );
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
		[ { x: 1245, y: hillsAt( 1211, 588 ) + 72, z: 580 },
		  { x: 2258, y: hillsAt( 2240, 462 ) + 53, z: 468 } ].forEach( function ( at ) {
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
		var rev = Math.min( 1, sp / 9 ) + Math.abs( throttleInput ) * 0.25 + ( boostT > 0 ? 0.3 : 0 );
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
			var spot = new THREE.SpotLight( 0xffd9a0, 1.1, 500, 0.5, 0.55, 1.2 );
			spot.position.set( 22, 12, z );
			spot.target.position.set( 300, -4, z * 3 );
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
