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
 * DRIVE FEEL — BODY DYNAMICS: the chassis stops being rigid. It leans
 * OUT of corners (roll ∝ steer × speed), squats on the gas / dives on
 * the brake, drops on its suspension when it lands (springs back), and
 * — the big one — TILTS TO THE TERRAIN: it noses up hills and jump
 * faces and banks onto the berms instead of staying dead flat. Roll is
 * about the forward axis, pitch about the lateral; both are smoothed
 * and clamped, and neutral while airborne so flips stay clean.
 *
 * GRAPHICS P2 — SHADOWS: the moonlight now casts real soft shadows
 * (PCFSoft, 2048) through a tight frustum that FOLLOWS the buggy — the
 * light direction stays fixed, so only nearby geometry casts and it
 * stays crisp. Solid matte (Lambert) meshes cast + receive; the ground
 * receives; the emissive "lights", sky, sprites and points don't. This
 * is what stops everything from looking like it's floating.
 *
 * GRAPHICS P1 — FOUNDATION: ACES filmic tone mapping + exposure (pulls
 * the flat-bright night into contrast), a gradient sky DOME with a
 * starfield and a haloed moon (rides the camera so it never clips),
 * and fog retuned to the horizon colour so distance fades into the sky.
 * Zero new dependencies — the bloom/shadow passes come next.
 *
 * AUDIO PASS — a full synthesized soundscape (still zero hosted files):
 * a night wind bed that gusts, surface-aware tire roll (grass/road/mud/
 * water), splash + mud + landing thud, ambient crickets and coop clucks,
 * Trumac's snort when you crowd him, a grandstand crowd that swells as
 * you rip past, and race audio — start blip, corner ticks, best-lap
 * fanfare. Sound stays OFF by default; the toggle now mutes the master.
 *
 * SECTION ROAD P3 — ROUGH GROUND (ref: a real MX track): the four
 * corners now BANK — a raised outer shoulder (bermAt) baked into the
 * ground mesh and ridden by the buggy, a low lip on the straights
 * rising to a tall berm wall through the turns. The straights fill
 * with rhythm: a double off the start, climbing tabletops east/west/
 * south, and a whoop (washboard) section down the north straight —
 * all generated onto MOUNDS at boot by generateTrackJumps().
 *
 * SECTION ROAD P2 — MOTOCROSS: the ring rebuilt wider (128) with
 * corners that bulge away from the fence like berms; a double after
 * the start line, whoop section on the north straight, tabletops on
 * the others. Heritage drive-ins move OUTSIDE the track at 2.2× with
 * real instanced GLASS BULBS chasing around their borders; four
 * corner light towers throw real PointLight pools both ways; two
 * grandstands of bobbing spectators face the far straight. Steering
 * eased + loosened (wind-in smoothing, lower rate, more slide);
 * chicken cluck slowed into an actual buk-bawk. Lap storage moves to
 * tcBqLaps_v2 (new track, fresh records).
 *
 * THE SECTION ROAD — a dirt race track ringing the OUTSIDE of the
 * quarter (the world's walls moved out; the perimeter fence is now
 * solid and the farm gate at bottom centre is the only way out).
 * Cross the start line on the south straight for a TIMED LAP: three
 * corners in order + back over the line. Three GHOSTS replay with
 * you — your best-ever run (gold) and your two most recent (silver),
 * kept in localStorage ('tcBqLaps_v1', ~40 KB/lap at 20 Hz samples).
 *
 * 3D-P2.9 — THE BARNYARD: the tractor slows to a putter and rolls a
 * proper dust cloud; 12 chickens live around an open coop by the
 * farmhouse — squawk and FLUTTER when the buggy scatters them, and
 * they keep close to home; the herd grows to seven cows plus TRUMAC,
 * the main bull — black, 30% bigger, horned, with his own prompt; and
 * a pig pen with a real mud pit — drive through and the mud kicks
 * up high (pigs wallow in it on their own).
 *
 * 3D-P2.8 — THE SLOUGH + THE ROUNDS: air toned to half (Thomas flew
 * across the quarter); the four puddles become ONE deep irregular
 * slough — the buggy FLOATS on it (splash-down landings, bobbing,
 * heavy paddle-drag); the old tractor now putters her own rounds
 * autonomously (steers off fences, the pond and the compound); and a
 * dense wind-row grove fills the northwest corner.
 *
 * 3D-P2.7 — TO SCALE + REAL AIR: every farm building scales up to sit
 * honestly beside the buggy (mesh AND Matter footprint together, via a
 * per-landmark `scale` in LANDMARKS), and the air stops being polite:
 * five kicker RAMPS on the straights (launch is terrain-honest —
 * vertical speed = the climb rate you carried up the face, so speed
 * matters), the mounds grow into real tabletops, boost lowers gravity
 * for hang-time, and a stuck DOUBLE flip pays double boost. Three new
 * sky tokens ride the ramp arcs (20 → 23, appended so saves survive).
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

	// `scale` grows the mesh AND the Matter footprint together — a building
	// without one renders at its authored size.
	var LANDMARKS = [
		{ id: 'farmhouse', name: 'the farmhouse', x: 1211, y: 588, w: 130, h: 80, scale: 1.6,
		  href: '/thomas', build: 'farmhouse', signTo: { x: 1435, y: 700 },
		  prompt: 'The farmhouse — step inside, this is me' },
		{ id: 'cookshack', name: 'the cookshack', x: 2240, y: 462, w: 70, h: 50, scale: 1.6,
		  href: '/about', build: 'cookshack', signTo: { x: 2205, y: 578 },
		  prompt: 'The cookshack — my life on the line' },
		{ id: 'elevator', name: 'the grain elevator', x: 3136, y: 686, w: 70, h: 70, scale: 1.5,
		  href: '/hcs', build: 'elevator', signTo: { x: 3045, y: 753 },
		  prompt: 'The grain elevator — one of fewer than fifty' },
		{ id: 'church', name: 'the church', x: 693, y: 1302, w: 70, h: 90, scale: 1.6,
		  href: '/heritage', build: 'church', signTo: { x: 875, y: 1383 },
		  prompt: 'The church on the hill — eight family lines' },
		{ id: 'th1', name: 'Patience', x: 1435, y: 1036, w: 26, h: 26, scale: 1.75,
		  href: '/patience', build: 'treehouse', kidColor: 0xe86ba7, kidCss: '#ff9ecb',
		  prompt: 'Patience’s treehouse — the family key opens it' },
		{ id: 'th2', name: 'Daniel', x: 1631, y: 1281, w: 26, h: 26, scale: 1.75,
		  href: '/daniel', build: 'treehouse', kidColor: 0x4f9fd8, kidCss: '#8fd0ff',
		  prompt: 'Daniel’s treehouse — the family key opens it' },
		{ id: 'th3', name: 'Faith', x: 1873, y: 1505, w: 26, h: 26, scale: 1.75,
		  href: '/faith', build: 'treehouse', kidColor: 0x9a7fd8, kidCss: '#cbb2ff',
		  prompt: 'Faith’s treehouse — the family key opens it' },
		{ id: 'radio', name: 'the radio mast', x: 4095, y: 1260, w: 30, h: 30, scale: 1.45,
		  href: 'https://bareyourrare.org', external: true, build: 'mast', signTo: { x: 3955, y: 1295 },
		  prompt: 'The radio mast — broadcasting beyond the fence' },
		{ id: 'barn', name: 'the arcade barn', x: 3539, y: 1435, w: 120, h: 80, scale: 1.6,
		  href: null, build: 'barn', signTo: { x: 3325, y: 1505 },
		  prompt: 'The arcade barn — the games are moving in here soon' },
		{ id: 'shed', name: 'the old shed', x: 651, y: 1932, w: 60, h: 44, scale: 1.45,
		  href: null, build: 'shed', signTo: { x: 753, y: 1838 },
		  prompt: 'The shed is padlocked… but a drawer in the house opens' },
		{ id: 'mailbox', name: 'the mailbox', x: 2083, y: 2450, w: 10, h: 10,
		  href: null, build: 'mailbox',
		  prompt: 'Fresh mail soon — “recently added” lands here' }
	];

	// The eight family lines: big marquee billboards OUTSIDE the section
	// road, facing the racing — four along the north straight (flanking
	// the grandstands), two each on the west and east sides.
	var LINES = [
		{ name: 'The Cheesmans', href: '/cheesmans', x: 600, z: -330, face: 1 },
		{ name: 'The Dochertys', href: '/dochertys', x: 1250, z: -330, face: 1 },
		{ name: 'The Haistes', href: '/haistes', x: 3230, z: -330, face: 1 },
		{ name: 'The Lakemans', href: '/lakemans', x: 3880, z: -330, face: 1 },
		{ name: 'The Rycrofts', href: '/rycrofts', x: -330, z: 800, face: 2 },
		{ name: 'The McIvers', href: '/mcivers', x: -330, z: 1700, face: 2 },
		{ name: 'The Verbooms', href: '/verbooms', x: 4810, z: 800, face: 3 },
		{ name: 'The Steinkes', href: '/steinkes', x: 4810, z: 1700, face: 3 }
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
		// the slough basin — one deep bowl under the big pond
		{ x: 3730, z: 1000, a: -26, r: 420 },
		{ x: 3880, z: 1090, a: -14, r: 240 },
		{ x: 3600, z: 900, a: -12, r: 240 }
	];
	// ONE pond now — an irregular slough, deep enough that the buggy floats
	// (see control()/render()). The blob outline is pondR(θ).
	var POND = { x: 3730, z: 1000, depth: 20, waterY: 0 };
	function pondR( th ) {
		return 210 + 55 * Math.sin( 2 * th + 1.3 ) + 35 * Math.sin( 3 * th + 0.6 ) + 20 * Math.sin( 5 * th + 2.1 );
	}
	function inPond( x, z ) {
		var dx = x - POND.x, dz = z - POND.z;
		if ( dx * dx + dz * dz > 108900 ) return false; // beyond the widest lobe
		return Math.hypot( dx, dz ) < pondR( Math.atan2( dz, dx ) ) - 3;
	}
	// the barnyard: chicken coop by the farmhouse, pig pen with a mud pit
	// on the hillside east of the north road
	var COOP = { x: 1390, z: 800 };
	var PIGPEN = { x: 2640, z: 985 };
	var MUD = { x: 2545, z: 985, r: 60 };

	// THE SECTION ROAD — the race ring outside the fence. Centerline sits
	// 150 off the property line, corners rounded. Painted into the ground
	// like the farm roads; the start/finish line is on the south straight,
	// dead ahead when you leave the farm gate.
	var TRACK = [
		{ x: 2240, y: 2690 }, { x: 4180, y: 2690 }, { x: 4430, y: 2700 },
		{ x: 4640, y: 2620 }, { x: 4740, y: 2440 }, { x: 4700, y: 2230 },
		{ x: 4650, y: 2070 }, { x: 4650, y: 450 }, { x: 4700, y: 290 },
		{ x: 4740, y: 80 }, { x: 4640, y: -100 }, { x: 4430, y: -180 },
		{ x: 4180, y: -170 }, { x: 300, y: -170 }, { x: 50, y: -180 },
		{ x: -160, y: -100 }, { x: -260, y: 80 }, { x: -220, y: 290 },
		{ x: -170, y: 450 }, { x: -170, y: 2070 }, { x: -220, y: 2230 },
		{ x: -260, y: 2440 }, { x: -160, y: 2620 }, { x: 50, y: 2700 },
		{ x: 300, y: 2690 }, { x: 2240, y: 2690 }
	];
	var TRACK_W = 128;
	var START = { x: 2240, z: 2690 };
	// three corners, hit in order (either direction), then home
	var LAP_CKPTS = [
		{ x: 4650, z: 1260 }, // east
		{ x: 2240, z: -170 }, // north
		{ x: -170, z: 1260 }  // west
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
		{ x: 2730, z: 630, ri: 70, ro: 160 }, // the old pull-off (tractor spawn)
		{ x: 1395, z: 805, ri: 70, ro: 150 }, // chicken coop yard
		{ x: 2620, z: 985, ri: 110, ro: 220 } // pig pen + mud pit
	];
	// Tabletop mounds ON the roads — smooth launches that scale with speed.
	// The section-road rhythm sections + whoops are generated onto this array
	// at boot by generateTrackJumps(); these three are the farm-road jumps.
	var MOUNDS = [
		{ x: 2695, z: 1724, a: 32, r: 72 },
		{ x: 2205, z: 788, a: 28, r: 70 },
		{ x: 3325, z: 2100, a: 34, r: 86 }
	];
	var trackJumpsBuilt = false;
	// A proper motocross build for the section road (reference: a real MX
	// track — bermed corners, rhythm doubles, tabletops, a whoop section):
	// rhythm along the straights + a washboard run on the north straight.
	function generateTrackJumps() {
		if ( trackJumpsBuilt ) return;
		trackJumpsBuilt = true;
		var J = [];
		// SOUTH straight (the start): a double just past the line, then two
		// climbing tabletops before the east berm
		J.push( { x: 2760, z: 2690, a: 20, r: 64 }, { x: 2985, z: 2690, a: 20, r: 64 } );
		J.push( { x: 3450, z: 2690, a: 30, r: 90 }, { x: 3900, z: 2690, a: 26, r: 82 } );
		// EAST straight: big rhythm tabletops
		var ez;
		for ( ez = 1850; ez >= 700; ez -= 384 ) J.push( { x: 4650, z: ez, a: 30, r: 88 } );
		// NORTH straight: a WHOOP section — a run of tight washboard bumps
		var nx;
		for ( nx = 3550; nx >= 1050; nx -= 178 ) J.push( { x: nx, z: -170, a: 15, r: 47 } );
		// WEST straight: a step-up then climbing tabletops
		var wz;
		for ( wz = 1850; wz >= 700; wz -= 384 ) J.push( { x: -170, z: wz, a: 28, r: 84 } );
		for ( var i = 0; i < J.length; i++ ) MOUNDS.push( J[ i ] );
	}
	// Kicker ramps — a steepening face that ends in a lip. The launch is
	// terrain-honest (vertical speed = climb rate at the lip), so speed
	// matters: hit them flat-out, hit them boosted.
	var RAMPS = [
		{ x: 2180, z: 2010, dir: { x: 30, z: -380 }, w: 70, l: 110, h: 28 },   // entry straight — the pad feeds it
		{ x: 2835, z: 613, dir: { x: 420, z: 280 }, w: 70, l: 120, h: 34 },    // cookshack → elevator run
		{ x: 3640, z: 1400, dir: { x: 630, z: -90 }, w: 70, l: 120, h: 36 },   // barn → radio mast run
		{ x: 1242, z: 1698, dir: { x: -315, z: -140 }, w: 70, l: 110, h: 30 }, // west run below the compound
		{ x: 3390, z: 990, dir: { x: 1, z: 0 }, w: 76, l: 100, h: 14 }         // the slough jump — splash-down
	];
	RAMPS.forEach( function ( r ) {
		var dl = Math.hypot( r.dir.x, r.dir.z ) || 1;
		r.cx = r.dir.x / dl;
		r.cz = r.dir.z / dl;
	} );
	var PADS = [
		{ x: 2188, z: 2065 }, { x: 2258, z: 1155 },
		{ x: 2625, z: 1750 }, { x: 3693, z: 1960 }
	];
	var TOKENS = [
		{ x: 350, z: 350 }, { x: 4200, z: 315 }, { x: 315, z: 2188 },
		{ x: 4165, z: 2310 }, { x: 2240, z: 210 }, { x: 1120, z: 210 },
		{ x: 3325, z: 263 }, { x: 4288, z: 1225 }, { x: 175, z: 1225 },
		{ x: 1225, z: 2363 }, { x: 2888, z: 2363 }, { x: 788, z: 1663 },
		{ x: 1575, z: 315 }, { x: 2625, z: 1225 }, { x: 3763, z: 660 },
		{ x: 613, z: 963 }, { x: 2695, z: 1724, air: true }, { x: 2205, z: 788, air: true },
		{ x: 525, z: 2065 }, { x: 4078, z: 1138 },
		// sky tokens on the ramp arcs — APPEND ONLY (saved indices must hold)
		{ x: 2198, z: 1780, air: true, y: 70 },
		{ x: 3868, z: 1370, air: true, y: 75 },
		{ x: 3565, z: 990, air: true, y: 26 }
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
	var dustPool = [], splashPool = [], mudPool = [], smokeEmitters = [], trackPool = [], trackIdx = 0, distMark = 0;
	var audio = { ctx: null, on: false, master: null, engGain: null, engOsc1: null, engOsc2: null };
	var soundBtn = null;
	var tokens = [], tokenCount = 0, tokenFound = 0;
	var airborne = false, vAlt = 0, worldY = 0, prevGy = 0, climb = 0, chassisDip = 0;
	var airPitch = 0, jumpCooldown = 0;
	var boostT = 0, padCooldown = [];
	var inWater = false, inMud = false;
	var chickens = [], pigs = [];
	var lap = { active: false, t: 0, dir: 0, next: 0, rec: [] };
	var ghosts = [], ghostStore = null, prevSX = 0, lastHudTenth = -1;
	var skyGroup = null, moonLight = null, moonTarget = null;
	var bulbInst = null, bulbCount = 0, bulbTimer = 0, bulbPhase = 0, bulbLit = null, bulbDim = null;
	var crowdInst = null, crowdData = [], crowdDummy = null;
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
	function rampAt( x, z ) {
		var y = 0;
		for ( var i = 0; i < RAMPS.length; i++ ) {
			var r = RAMPS[ i ];
			var dx = x - r.x, dz = z - r.z;
			var t = dx * r.cx + dz * r.cz;
			if ( t < 0 || t > r.l + 9 ) continue;
			var sd = Math.abs( dz * r.cx - dx * r.cz );
			if ( sd > r.w / 2 ) continue;
			// f² face (steepest at the lip), 9-unit backslope past it
			var p = t <= r.l ? ( t / r.l ) * ( t / r.l ) : 1 - ( t - r.l ) / 9;
			var edge = Math.min( 1, ( r.w / 2 - sd ) / 6 );
			y += r.h * p * edge;
		}
		return y;
	}
	// Banked corners: a raised shoulder on the OUTER edge of the section
	// road — a low lip on the straights, a tall berm wall through the four
	// corners. The buggy rides the bank (heightAt), and the ground mesh
	// shows it (displaced at boot). nearTrack() early-outs everything inside
	// the fence so the 25-segment scan only runs out on the ring.
	var BERM = { w: 108, max: 42, straightMax: 8, cr: 780 };
	var CORNERS = [
		{ x: 4740, z: 2440 }, { x: 4740, z: 80 },
		{ x: -260, z: 80 }, { x: -260, z: 2440 }
	];
	function nearTrack( x, z ) {
		return ! ( x > 90 && x < W - 90 && z > 90 && z < H - 90 );
	}
	function bermAt( x, z ) {
		if ( ! nearTrack( x, z ) ) return 0;
		var best = 1e9, cx = 0, cz = 0;
		for ( var i = 0; i < TRACK.length - 1; i++ ) {
			var a = TRACK[ i ], b = TRACK[ i + 1 ];
			var abx = b.x - a.x, abz = b.y - a.y;
			var t = ( ( x - a.x ) * abx + ( z - a.y ) * abz ) / ( abx * abx + abz * abz );
			t = t < 0 ? 0 : ( t > 1 ? 1 : t );
			var px = a.x + abx * t, pz = a.y + abz * t;
			var d = Math.hypot( x - px, z - pz );
			if ( d < best ) { best = d; cx = px; cz = pz; }
		}
		var ex = best - TRACK_W / 2; // how far outside the racing surface
		if ( ex <= 0 || ex >= BERM.w ) return 0;
		// outer side only (farther from the farm centre than the racing line)
		if ( ( x - cx ) * ( cx - W / 2 ) + ( z - cz ) * ( cz - H / 2 ) <= 0 ) return 0;
		var cf = BERM.straightMax / BERM.max;
		for ( var k = 0; k < CORNERS.length; k++ ) {
			var cd = Math.hypot( x - CORNERS[ k ].x, z - CORNERS[ k ].z );
			if ( cd < BERM.cr ) cf = Math.max( cf, 1 - cd / BERM.cr );
		}
		var f = ex / BERM.w;
		f = f < 0.62 ? f / 0.62 : 1; // climb to the crest, then hold as a wall
		f = f * f * ( 3 - 2 * f );
		return BERM.max * cf * f;
	}
	function heightAt( x, z ) {
		var y = hillsAt( x, z );
		for ( var i = 0; i < MOUNDS.length; i++ ) y += gauss( x, z, MOUNDS[ i ] );
		return y + rampAt( x, z ) + bermAt( x, z );
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

	function haloTexture( THREE ) {
		var c = document.createElement( 'canvas' );
		c.width = c.height = 128;
		var ctx = c.getContext( '2d' );
		var g = ctx.createRadialGradient( 64, 64, 0, 64, 64, 64 );
		g.addColorStop( 0, 'rgba(255,255,255,1)' );
		g.addColorStop( 0.25, 'rgba(205,222,255,0.5)' );
		g.addColorStop( 1, 'rgba(205,222,255,0)' );
		ctx.fillStyle = g; ctx.fillRect( 0, 0, 128, 128 );
		return new THREE.CanvasTexture( c );
	}

	// A gradient sky dome + starfield + a haloed moon, all parented into
	// one group that rides the camera each frame (so we never clip out the
	// far side). Replaces the flat background fill.
	function buildSky( THREE ) {
		skyGroup = new THREE.Group();

		var skyMat = new THREE.ShaderMaterial( {
			side: THREE.BackSide, depthWrite: false, fog: false,
			uniforms: {
				topCol: { value: new THREE.Color( 0x05070d ) },
				botCol: { value: new THREE.Color( 0x1b2740 ) },
				expo: { value: 0.7 }
			},
			vertexShader:
				'varying vec3 vP; void main(){ vP = position; ' +
				'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }',
			fragmentShader:
				'uniform vec3 topCol; uniform vec3 botCol; uniform float expo; varying vec3 vP;' +
				'void main(){ float h = normalize( vP ).y; float t = pow( max( h, 0.0 ), expo );' +
				'gl_FragColor = vec4( mix( botCol, topCol, t ), 1.0 ); }'
		} );
		skyGroup.add( new THREE.Mesh( new THREE.SphereGeometry( 6500, 32, 16 ), skyMat ) );

		var N = 900, sp = new Float32Array( N * 3 );
		for ( var i = 0; i < N; i++ ) {
			var y = Math.random() * 0.9 + 0.08;      // height fraction (upper sky)
			var s = Math.sqrt( 1 - y * y ), a = Math.random() * Math.PI * 2, r = 6200;
			sp[ i * 3 ] = r * s * Math.cos( a );
			sp[ i * 3 + 1 ] = r * y;
			sp[ i * 3 + 2 ] = r * s * Math.sin( a );
		}
		var starGeo = new THREE.BufferGeometry();
		starGeo.setAttribute( 'position', new THREE.BufferAttribute( sp, 3 ) );
		skyGroup.add( new THREE.Points( starGeo, new THREE.PointsMaterial( {
			color: 0xcfe0ff, size: 7, sizeAttenuation: false, fog: false,
			transparent: true, opacity: 0.9
		} ) ) );

		var moonBall = new THREE.Mesh(
			new THREE.SphereGeometry( 150, 24, 24 ),
			new THREE.MeshBasicMaterial( { color: 0xeef4ff, fog: false } )
		);
		moonBall.position.set( -1500, 1400, -2400 );
		skyGroup.add( moonBall );
		var halo = new THREE.Sprite( new THREE.SpriteMaterial( {
			map: haloTexture( THREE ), color: 0xbcd2f4, transparent: true, opacity: 0.55,
			blending: THREE.AdditiveBlending, depthWrite: false, fog: false
		} ) );
		halo.scale.set( 1400, 1400, 1 );
		halo.position.copy( moonBall.position );
		skyGroup.add( halo );

		scene.add( skyGroup );
	}

	function boot( stageEl ) {
		stage = stageEl;
		hudEl = stage.querySelector( '.bq-hud' );
		chipEl = stage.querySelector( '.bq-chip' );
		Matter = window.Matter;
		var THREE = window.THREE;
		isFamily = !! ( window.tcVentures && Number( window.tcVentures.bqFamily ) );
		generateTrackJumps(); // populate MOUNDS with the section-road rhythm



		// fresh mail: the mailbox prompt + flag follow the ledger
		if ( Number( ledgerData().mailNew ) ) {
			LANDMARKS.forEach( function ( lm ) {
				if ( lm.id === 'mailbox' ) {
					lm.prompt = 'The flag’s up — fresh mail · Enter reads the ledger';
				}
			} );
		}

		renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.setPixelRatio( Math.min( window.devicePixelRatio || 1, 2 ) );
		renderer.setSize( stage.clientWidth, stage.clientHeight );
		// filmic tone mapping — the biggest single "less cheesy" win: it
		// pulls the flat-bright night into contrast and lets the lights read.
		renderer.toneMapping = THREE.ACESFilmicToneMapping;
		renderer.toneMappingExposure = 1.15;
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		renderer.domElement.className = 'bq-canvas';
		renderer.domElement.setAttribute( 'aria-hidden', 'true' );
		stage.appendChild( renderer.domElement );

		scene = new THREE.Scene();
		scene.background = new THREE.Color( 0x0a1220 );
		// fog tinted to the horizon so distance fades into the sky, not a wall
		scene.fog = new THREE.Fog( 0x141d2e, 620, 3000 );

		camera = new THREE.PerspectiveCamera( baseFov, stage.clientWidth / stage.clientHeight, 1, 9000 );

		scene.add( new THREE.AmbientLight( 0x233248, 0.8 ) );
		scene.add( new THREE.HemisphereLight( 0x3a5372, 0x121a12, 0.5 ) );
		moonLight = new THREE.DirectionalLight( 0xaecdf0, 0.9 );
		moonLight.position.set( -700, 900, -600 );
		moonLight.castShadow = true;
		moonLight.shadow.mapSize.set( 2048, 2048 );
		moonLight.shadow.bias = -0.0004;
		moonLight.shadow.normalBias = 1.2;
		var sc = moonLight.shadow.camera; // a tight frustum that follows the buggy
		sc.near = 200; sc.far = 2600;
		sc.left = -760; sc.right = 760; sc.top = 760; sc.bottom = -760;
		sc.updateProjectionMatrix();
		moonTarget = new THREE.Object3D();
		scene.add( moonTarget );
		moonLight.target = moonTarget;
		scene.add( moonLight );
		buildSky( THREE );

		// ---------- ground: displaced terrain with roads painted in ----------
		var groundGeo = new THREE.PlaneGeometry( 7200, 5200, 260, 180 );
		groundGeo.rotateX( -Math.PI / 2 );
		groundGeo.translate( W / 2, 0, H / 2 );
		var pos = groundGeo.attributes.position;
		var colors = new Float32Array( pos.count * 3 );
		var core = ROAD_W / 2, feather = ROAD_W / 2 + 18;
		var tCore = TRACK_W / 2, tFeather = TRACK_W / 2 + 16;
		for ( var vi = 0; vi < pos.count; vi++ ) {
			var vx = pos.getX( vi ), vz = pos.getZ( vi );
			var vy = hillsAt( vx, vz ) + bermAt( vx, vz );
			pos.setY( vi, vy );
			var dR = 1e9;
			for ( var pi = 0; pi < PATHS.length; pi++ ) {
				dR = Math.min( dR, distToSeg( vx, vz, PATHS[ pi ][ 0 ], PATHS[ pi ][ 1 ] ) );
				if ( dR < core ) break;
			}
			var road = dR <= core ? 1 : ( dR >= feather ? 0 : 1 - ( dR - core ) / ( feather - core ) );
			// the section road ring, painted the same way
			var dT = 1e9;
			for ( var ti = 0; ti < TRACK.length - 1; ti++ ) {
				dT = Math.min( dT, distToSeg( vx, vz, TRACK[ ti ], TRACK[ ti + 1 ] ) );
				if ( dT < tCore ) break;
			}
			var trk = dT <= tCore ? 1 : ( dT >= tFeather ? 0 : 1 - ( dT - tCore ) / ( tFeather - tCore ) );
			var n = 0.5 + 0.5 * Math.sin( vx * 0.013 ) * Math.sin( vz * 0.017 );
			var lift = 1 + ( vy - 20 ) * 0.006;
			var fr = ( 0.085 + n * 0.02 ) * lift, fg = ( 0.14 + n * 0.03 ) * lift, fb = ( 0.10 + n * 0.02 ) * lift;
			var rr = 0.30 * lift, rg = 0.24 * lift, rb = 0.165 * lift;
			var cr = fr + ( rr - fr ) * road, cg = fg + ( rg - fg ) * road, cb = fb + ( rb - fb ) * road;
			// racing dirt: a shade redder + more packed than the farm roads
			var kr = 0.335 * lift, kg = 0.245 * lift, kb = 0.175 * lift;
			colors[ vi * 3 ] = cr + ( kr - cr ) * trk;
			colors[ vi * 3 + 1 ] = cg + ( kg - cg ) * trk;
			colors[ vi * 3 + 2 ] = cb + ( kb - cb ) * trk;
		}
		groundGeo.setAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
		groundGeo.computeVertexNormals();
		var groundMesh = new THREE.Mesh( groundGeo,
			new THREE.MeshLambertMaterial( { vertexColors: true } ) );
		groundMesh.receiveShadow = true;   // catches the buggy + building shadows
		groundMesh.userData.noCast = true; // the ground itself never casts
		scene.add( groundMesh );

		buildPonds( THREE );
		buildMounds( THREE );
		buildRamps( THREE );
		buildPads( THREE );

		// ---------- physics ----------
		engine = Matter.Engine.create();
		engine.gravity.x = 0; engine.gravity.y = 0;
		buggyBody = Matter.Bodies.rectangle( SPAWN.x, SPAWN.y, 46, 30, { frictionAir: 0.14, density: 0.002 } );
		Matter.Body.setAngle( buggyBody, SPAWN.angle );
		pX = SPAWN.x; pY = SPAWN.y; pA = SPAWN.angle;

		// world walls sit OUTSIDE the section road ring now; the perimeter
		// fence itself is solid, with the farm gate (x 2180–2300, south) the
		// only way out onto the track.
		var statics = [], T = 40, OUT = 430;
		statics.push( Matter.Bodies.rectangle( W / 2, -OUT + 6, W + OUT * 2 + 80, T, { isStatic: true } ) );
		statics.push( Matter.Bodies.rectangle( W / 2, H + OUT - 6, W + OUT * 2 + 80, T, { isStatic: true } ) );
		statics.push( Matter.Bodies.rectangle( -OUT + 6, H / 2, T, H + OUT * 2 + 80, { isStatic: true } ) );
		statics.push( Matter.Bodies.rectangle( W + OUT - 6, H / 2, T, H + OUT * 2 + 80, { isStatic: true } ) );
		statics.push( Matter.Bodies.rectangle( W / 2, 3, W, 10, { isStatic: true } ) );
		statics.push( Matter.Bodies.rectangle( 3, H / 2, 10, H, { isStatic: true } ) );
		statics.push( Matter.Bodies.rectangle( W - 3, H / 2, 10, H, { isStatic: true } ) );
		statics.push( Matter.Bodies.rectangle( 2180 / 2, H - 3, 2180, 10, { isStatic: true } ) );
		statics.push( Matter.Bodies.rectangle( ( 2300 + W ) / 2, H - 3, W - 2300, 10, { isStatic: true } ) );
		LANDMARKS.forEach( function ( lm ) {
			var s = lm.scale || 1;
			if ( lm.build === 'treehouse' ) {
				statics.push( Matter.Bodies.circle( lm.x, lm.y, 13 * s, { isStatic: true } ) );
			} else if ( lm.build === 'mailbox' ) {
				statics.push( Matter.Bodies.circle( lm.x, lm.y, 7, { isStatic: true } ) );
			} else {
				statics.push( Matter.Bodies.rectangle( lm.x, lm.y, lm.w * s, lm.h * s, { isStatic: true } ) );
			}
		} );
		Matter.Composite.add( engine.world, [ buggyBody ].concat( statics ) );

		// ---------- the farm ----------
		LANDMARKS.forEach( function ( lm ) { raiseLandmark( THREE, lm ); } );
		buildCompound( THREE );
		buildWindbreak( THREE );
		buildGrove( THREE );
		buildFence( THREE );
		buildGateway( THREE );
		buildTrack( THREE );
		buildTrackLights( THREE );
		buildGrandstands( THREE );
		buildDriveIns( THREE );
		buildAnimals( THREE );
		buildCoop( THREE );
		buildChickens( THREE );
		buildPigPen( THREE );
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
		initMud( THREE );
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

		// grounding: solid matte (Lambert) meshes cast shadows; the emissive
		// "lights" (MeshBasic), sky, sprites, points and the ground itself
		// don't. One traverse now that the whole world is built.
		scene.traverse( function ( o ) {
			if ( ! o.isMesh || o.userData.noCast ) return;
			if ( o.material && o.material.isMeshLambertMaterial ) {
				o.castShadow = true;
				o.receiveShadow = true;
			}
		} );
		buggyGroup.traverse( function ( o ) { if ( o.isMesh ) o.castShadow = true; } );

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
		var txt = '3D beta · WASD drives · Space jumps · L/R Shift flips · H honks · Enter steps inside · ⛁ '
			+ tokenFound + '/' + tokenCount;
		if ( lap.active ) {
			txt += ' · ⏱ ' + fmtLap( lap.t );
		} else {
			var st = loadLaps();
			if ( st.best ) txt += ' · 🏁 ' + fmtLap( st.best.t );
		}
		hudEl.textContent = txt;
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

	function ledgerData() {
		return ( window.tcVentures && window.tcVentures.bqLedger ) || { mailNew: 0, quotes: [] };
	}

	function openLedger() {
		var el = document.getElementById( 'bq-ledger' );
		if ( ! el ) return;
		var fs = document.fullscreenElement || document.webkitFullscreenElement;
		if ( fs ) ( document.exitFullscreen || document.webkitExitFullscreen ).call( document );
		stage.blur();
		el.scrollIntoView( { behavior: 'smooth', block: 'center' } );
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

	var steerInput = 0, throttleInput = 0, steerVal = 0;
	function control() {
		var b = buggyBody;
		var heading = { x: Math.cos( b.angle ), y: Math.sin( b.angle ) };

		// water check (the slough — floating, not wading) + the mud pit
		inWater = ! airborne && inPond( b.position.x, b.position.y );
		inMud = ! airborne && ! inWater &&
			Math.hypot( b.position.x - MUD.x, b.position.y - MUD.z ) < MUD.r;
		b.frictionAir = airborne ? 0.02 : ( inWater ? 0.3 : ( inMud ? 0.2 : 0.14 ) );

		throttleInput = ( keys.up ? 1 : 0 ) - ( keys.down ? 0.65 : 0 );
		steerInput = ( keys.right ? 1 : 0 ) - ( keys.left ? 1 : 0 );

		// eased steering: the wheel winds in and out instead of snapping
		steerVal += ( steerInput - steerVal ) * 0.16;
		if ( ! steerInput && Math.abs( steerVal ) < 0.02 ) steerVal = 0;
		Matter.Body.setAngularVelocity( b, steerVal * ( airborne ? 0.03 : 0.06 ) );

		var power = boostT > 0 ? 0.0078 : 0.0042;
		if ( airborne ) power *= 0.25;
		if ( inWater ) power *= 0.5;
		if ( inMud ) power *= 0.75;
		if ( throttleInput ) {
			Matter.Body.applyForce( b, b.position,
				{ x: heading.x * power * throttleInput * b.mass, y: heading.y * power * throttleInput * b.mass } );
		}

		var v = b.velocity;
		var fwd = v.x * heading.x + v.y * heading.y;
		var lat = { x: -heading.y, y: heading.x };
		var latSpeed = v.x * lat.x + v.y * lat.y;
		var grip = airborne ? 0.995 : 0.84; // looser — she slides now
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
		if ( inWater ) cap *= 0.5;
		if ( inMud ) cap *= 0.8;
		var sp = Math.hypot( b.velocity.x, b.velocity.y );
		if ( sp > cap ) Matter.Body.setVelocity( b, { x: b.velocity.x * cap / sp, y: b.velocity.y * cap / sp } );

		if ( boostT > 0 ) boostT -= 16.666;
		if ( jumpCooldown > 0 ) jumpCooldown -= 16.666;

		// SPACE: bunny hop (bigger with speed)
		if ( keys.jump && ! airborne && jumpCooldown <= 0 ) {
			jumpCooldown = 300;
			airborne = true;
			vAlt = 85 + sp * 5;
		}

		lapControl();

		// the tractor putters her own rounds — steer off the fences,
		// the slough and the compound; otherwise wander gently
		if ( tractor ) {
			var tb = tractor.body;
			tractor.turnT -= 16.666;
			if ( tractor.turnT <= 0 ) {
				tractor.turnT = 2400 + Math.random() * 3600;
				tractor.turn = ( Math.random() - 0.5 ) * 0.016;
			}
			var ax = tb.position.x + Math.cos( tractor.angle ) * 160;
			var az = tb.position.y + Math.sin( tractor.angle ) * 160;
			if ( ax < 130 || ax > W - 130 || az < 130 || az > H - 130 ||
			     inPond( ax, az ) || inCompound( ax, az, 60 ) ) {
				var homeA = Math.atan2( H / 2 - tb.position.y, W / 2 - tb.position.x );
				tractor.turn = wrapAngle( homeA - tractor.angle ) > 0 ? 0.02 : -0.02;
			}
			tractor.angle = wrapAngle( tractor.angle + tractor.turn );
			Matter.Body.applyForce( tb, tb.position, {
				x: Math.cos( tractor.angle ) * 0.001 * tb.mass,
				y: Math.sin( tractor.angle ) * 0.001 * tb.mass
			} );
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
			// remember how hard we were climbing — that's the honest launch
			climb = groundRate > 0 ? Math.max( climb * 0.85, groundRate ) : climb * 0.85;
			if ( groundRate < -60 && sp > 4.6 && ! inWater ) {
				airborne = true;
				// the lip drop alone launches modestly; carried climb rate
				// (slope × speed) is what buys big air off ramps/mounds
				vAlt = Math.min( 200, Math.max( Math.min( -groundRate * 0.85, 115 ), climb * 0.75 ) );
				worldY = prevGy;
			} else {
				// afloat on the slough: ride the water line, bobbing
				worldY = inWater
					? Math.max( gy, POND.waterY - 5 + Math.sin( t * 2.3 ) * 0.9 )
					: gy;
			}
		}
		if ( airborne ) {
			worldY += vAlt * dt;
			vAlt -= ( boostT > 0 ? 270 : 300 ) * dt; // boost = hang-time
			// L/R Shift pitch the buggy for flips
			var pitchVel = ( keys.tiltF ? -7.5 : 0 ) + ( keys.tiltB ? 7.5 : 0 );
			airPitch += pitchVel * dt;
			var splash = inPond( rx, rz );
			var landY = splash ? Math.max( gy, POND.waterY - 5 ) : gy;
			if ( worldY <= landY ) {
				airborne = false;
				worldY = landY;
				chassisDip = -Math.min( 7, 2 + ( -vAlt ) * 0.03 ); // suspension compresses
				vAlt = 0;
				if ( splash ) splashSound(); else thud( Math.hypot( b.velocity.x, b.velocity.y ) );
				var n = wrapAngle( airPitch );
				if ( splash ) {
					// splash-down — she floats
					Matter.Body.setVelocity( b, { x: b.velocity.x * 0.45, y: b.velocity.y * 0.45 } );
					for ( var sd2 = 0; sd2 < 12; sd2++ ) spawnSplash( wheelWorld( -14 + Math.random() * 28, -16 + Math.random() * 32 ), 7 );
					flashChip( 'SPLASH DOWN — she floats!' );
				} else if ( Math.abs( n ) > 0.75 ) {
					// crashed the rotation — eat dirt
					Matter.Body.setVelocity( b, { x: b.velocity.x * 0.3, y: b.velocity.y * 0.3 } );
					for ( var cd = 0; cd < 10; cd++ ) spawnDust( wheelWorld( -10 + Math.random() * 20, -14 + Math.random() * 28 ), 6 );
					flashChip( 'Ate dirt — square the landing next time' );
				} else {
					if ( Math.abs( airPitch ) > 11.5 ) { // stuck a DOUBLE
						boostT = 1600;
						flashChip( 'DOUBLE FLIP! — full send 🛞🛞' );
						if ( audio.on ) whoosh();
					} else if ( Math.abs( airPitch ) > 5.5 ) { // stuck a full flip
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

		// --- buggy body dynamics ---
		// The chassis leans OUT of corners, squats/dives on the pedal, tilts
		// to follow the terrain (berms, mounds, hills), and compresses on
		// landing. ROLL is about the forward axis (rotation.x), PITCH about
		// the lateral axis (rotation.z). If a lean/tilt reads BACKWARDS,
		// flip that term's sign — roll and pitch are independent, and the
		// two roll terms share a sign (flip tRoll whole if lean inverts).
		var gsl = slopeAt( rx, rz );
		var cosA = Math.cos( ra ), sinA = Math.sin( ra );
		var fwdSlope = gsl.x * cosA + gsl.z * sinA;        // rise along heading
		var latSlope = gsl.x * -sinA + gsl.z * cosA;       // rise across (to the left)
		var af = airborne ? 0 : 1;                          // aloft, airPitch owns the pose
		var tRoll = af * ( Math.atan( latSlope ) * -1.0     // sit on the ground camber
			+ steerVal * 0.17 * Math.min( 1, sp / 4 ) );    // + lean out of the turn
		var tPitch = af * ( Math.atan( fwdSlope )           // nose up the hill / jump face
			+ throttleInput * 0.06 );                       // + squat on gas / dive on brake
		tRoll = Math.max( -0.55, Math.min( 0.55, tRoll ) );
		tPitch = Math.max( -0.55, Math.min( 0.55, tPitch ) );
		chassisGroup.rotation.x += ( tRoll - chassisGroup.rotation.x ) * 0.18;
		chassisGroup.rotation.z += ( tPitch - chassisGroup.rotation.z ) * 0.18;
		chassisDip += ( 0 - chassisDip ) * 0.2;             // suspension rebound
		chassisGroup.position.y = 10 + chassisDip;
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
		updateTractor();
		updateChickens( dms, t );
		updatePigs( dms );
		updateGhosts( dms );
		updateDriveInChase( dms );
		updateCrowd( t );
		if ( lap.active ) {
			var tenth = Math.floor( lap.t / 100 );
			if ( tenth !== lastHudTenth ) {
				lastHudTenth = tenth;
				updateHud();
			}
		}
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
		} else if ( inMud && sp > 1.2 ) {
			// mud kicks up HIGH
			spawnMud( wheelWorld( -14, 10 ), sp );
			spawnMud( wheelWorld( -14, -10 ), sp );
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
		updateAudio( dms, sp );

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

		if ( skyGroup ) skyGroup.position.copy( camera.position ); // sky rides with us

		// the shadow frustum tracks the buggy, keeping the light direction
		// constant (position − target is a fixed vector)
		if ( moonLight ) {
			moonTarget.position.set( rx, worldY, rz );
			moonTarget.updateMatrixWorld();
			moonLight.position.set( rx - 700, worldY + 1000, rz - 600 );
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

	function buildRamps( THREE ) {
		// world-space wedges that follow the terrain, matching rampAt()'s
		// f² face exactly so the buggy rides the surface it sees
		var dirt = new THREE.MeshLambertMaterial( { color: 0x5c4830, side: THREE.DoubleSide } );
		var lampMat = new THREE.MeshBasicMaterial( { color: 0xffd9a0 } );
		RAMPS.forEach( function ( r ) {
			var hw = r.w / 2;
			function pt( sd, t, y ) {
				var wx = r.x + r.cx * t - r.cz * sd;
				var wz = r.z + r.cz * t + r.cx * sd;
				return [ wx, hillsAt( wx, wz ) + y, wz ];
			}
			var prof = [], N = 8;
			for ( var k = 0; k <= N; k++ ) {
				var f = k / N;
				prof.push( { t: r.l * f, y: r.h * f * f } );
			}
			prof.push( { t: r.l + 9, y: 0 } );
			var tris = [];
			function quad( a, b, c, d ) {
				tris.push( a[ 0 ], a[ 1 ], a[ 2 ], b[ 0 ], b[ 1 ], b[ 2 ], c[ 0 ], c[ 1 ], c[ 2 ],
					a[ 0 ], a[ 1 ], a[ 2 ], c[ 0 ], c[ 1 ], c[ 2 ], d[ 0 ], d[ 1 ], d[ 2 ] );
			}
			for ( var i = 0; i < prof.length - 1; i++ ) {
				var p0 = prof[ i ], p1 = prof[ i + 1 ];
				quad( pt( -hw, p0.t, p0.y ), pt( hw, p0.t, p0.y ), pt( hw, p1.t, p1.y ), pt( -hw, p1.t, p1.y ) );
				quad( pt( -hw, p0.t, 0 ), pt( -hw, p0.t, p0.y ), pt( -hw, p1.t, p1.y ), pt( -hw, p1.t, 0 ) );
				quad( pt( hw, p0.t, 0 ), pt( hw, p0.t, p0.y ), pt( hw, p1.t, p1.y ), pt( hw, p1.t, 0 ) );
			}
			var geo = new THREE.BufferGeometry();
			geo.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( tris ), 3 ) );
			geo.computeVertexNormals();
			scene.add( new THREE.Mesh( geo, dirt ) );
			// lit lip markers so the kicker reads at night
			[ -1, 1 ].forEach( function ( sd ) {
				var at = pt( sd * ( hw - 4 ), r.l, r.h + 2 );
				var lamp = new THREE.Mesh( new THREE.BoxGeometry( 3, 3.5, 3 ), lampMat );
				lamp.position.set( at[ 0 ], at[ 1 ], at[ 2 ] );
				scene.add( lamp );
			} );
			addGlowDisc( THREE, r.x, r.z, 18, 0.07 );
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
			var baseY = heightAt( tk.x, tk.z ) + ( tk.y || ( tk.air ? 30 : 11 ) );
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
			if ( d2 < ( tk.air ? 34 : 24 ) && dy < ( tk.air ? 30 : 17 ) ) {
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
		// "now showing": each screen carries a VERBATIM sentence from that
		// line's long-read (spec §2 billboards) — pool lives in
		// inc/data/quarter-section.json, localized as tcVentures.bqLedger.
		var quotes = {};
		( ledgerData().quotes || [] ).forEach( function ( q ) { quotes[ q.href ] = q.text; } );

		// old-school GLASS BULBS around every border — one InstancedMesh for
		// all screens, colors chased in updateDriveInChase()
		bulbLit = new THREE.Color( 0xffe6a8 );
		bulbDim = new THREE.Color( 0x6a4d26 );
		var ring = [], rb;
		for ( rb = -62; rb <= 62; rb += 13.75 ) ring.push( [ rb, 103 ] );  // top →
		for ( rb = 90; rb >= 43; rb -= 13.5 ) ring.push( [ 66, rb ] );     // right ↓
		for ( rb = 62; rb >= -62; rb -= 13.75 ) ring.push( [ rb, 29 ] );   // bottom ←
		for ( rb = 43; rb <= 90; rb += 13.5 ) ring.push( [ -66, rb ] );    // left ↑
		bulbCount = ring.length * LINES.length;
		bulbInst = new THREE.InstancedMesh(
			new THREE.SphereGeometry( 2.1, 8, 8 ),
			new THREE.MeshBasicMaterial( { color: 0xffffff } ),
			bulbCount
		);
		var dummy = new THREE.Object3D();
		var idx = 0;

		LINES.forEach( function ( line ) {
			var c = document.createElement( 'canvas' );
			c.width = 560; c.height = 320;
			var ctx = c.getContext( '2d' );
			// the dark screen
			ctx.fillStyle = '#171310';
			ctx.fillRect( 0, 0, 560, 320 );
			ctx.fillStyle = '#0d0b09';
			ctx.fillRect( 16, 16, 528, 288 );
			ctx.textAlign = 'center';
			ctx.font = '600 46px Georgia, serif';
			ctx.fillStyle = '#ffe3b0';
			ctx.fillText( line.name, 280, 88 );
			var quote = quotes[ line.href ];
			if ( quote ) {
				ctx.font = '20px Georgia, serif';
				ctx.fillStyle = 'rgba(255, 227, 176, 0.45)';
				ctx.fillText( 'NOW SHOWING', 280, 126 );
				ctx.font = 'italic 25px Georgia, serif';
				ctx.fillStyle = 'rgba(255, 227, 176, 0.85)';
				var words = ( '“' + quote + '”' ).split( ' ' );
				var lines = [], cur = '';
				words.forEach( function ( w ) {
					var t = cur ? cur + ' ' + w : w;
					if ( ctx.measureText( t ).width > 480 && cur ) { lines.push( cur ); cur = w; }
					else cur = t;
				} );
				if ( cur ) lines.push( cur );
				lines.slice( 0, 4 ).forEach( function ( ln, li ) {
					ctx.fillText( ln, 280, 166 + li * 32 );
				} );
				ctx.font = '22px Georgia, serif';
				ctx.fillStyle = 'rgba(255, 227, 176, 0.55)';
				ctx.fillText( 'drive in →', 280, 294 );
			} else {
				ctx.font = 'italic 30px Georgia, serif';
				ctx.fillStyle = 'rgba(255, 227, 176, 0.6)';
				ctx.fillText( 'a family line · drive in', 280, 200 );
			}

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
			// face the racing: 1 = north side (face south), 2 = west side
			// (face east), 3 = east side (face west)
			g.rotation.y = line.face === 1 ? 0 : ( line.face === 2 ? Math.PI / 2 : -Math.PI / 2 );
			g.scale.set( 2.2, 2.2, 2.2 );
			g.userData.lm = lm;
			scene.add( g );
			clickables.push( g );
			PROMPTS.push( lm );
			Matter.Composite.add( engine.world,
				Matter.Bodies.rectangle( line.x, line.z,
					line.face === 1 ? 273 : 26, line.face === 1 ? 26 : 273, { isStatic: true } ) );

			// place this screen's bulbs in world space
			g.updateMatrixWorld( true );
			ring.forEach( function ( rp ) {
				var v = new THREE.Vector3( rp[ 0 ], rp[ 1 ], 3 );
				g.localToWorld( v );
				dummy.position.copy( v );
				dummy.scale.set( 2.2, 2.2, 2.2 );
				dummy.updateMatrix();
				bulbInst.setMatrixAt( idx, dummy.matrix );
				bulbInst.setColorAt( idx, bulbDim );
				idx++;
			} );
		} );
		bulbInst.instanceMatrix.needsUpdate = true;
		scene.add( bulbInst );
	}

	function updateDriveInChase( dms ) {
		if ( ! bulbInst ) return;
		bulbTimer += dms;
		if ( bulbTimer < 300 ) return;
		bulbTimer = 0;
		bulbPhase = ( bulbPhase + 1 ) % 3;
		for ( var i = 0; i < bulbCount; i++ ) {
			bulbInst.setColorAt( i, ( i + bulbPhase ) % 3 === 0 ? bulbLit : bulbDim );
		}
		bulbInst.instanceColor.needsUpdate = true;
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
		var s = lm.scale || 1;
		g.position.set( lm.x, hillsAt( lm.x, lm.y ), lm.y );
		g.scale.set( s, s, s );
		g.userData.lm = lm;
		scene.add( g );
		clickables.push( g );

		if ( lm.signTo ) {
			var dx = lm.signTo.x - lm.x, dz = lm.signTo.y - lm.y;
			var dl = Math.hypot( dx, dz ) || 1;
			var off = Math.max( lm.w, lm.h ) * s / 2 + 30;
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
		addGlowDisc( THREE, lm.x, lm.y + 77, 80, 0.10 ); // porch pool, 1.6× out
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
		addGlowDisc( THREE, lm.x, lm.y + 51, 62, 0.10 );
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
		addGlowDisc( THREE, lm.x, lm.y + 51, 57, 0.09 );
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
		addGlowDisc( THREE, lm.x, lm.y + 83, 70, 0.10 );
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
		addGlowDisc( THREE, lm.x, lm.y + 74, 73, 0.10 );
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
		// the flag pivots at its hinge: up while the ledger has fresh mail
		var flag = new THREE.Group();
		flag.position.set( 6.6, 25.5, 0 );
		var arm = new THREE.Mesh( new THREE.BoxGeometry( 1.1, 7, 1.1 ), mat( THREE, 0xb8352c ) );
		arm.position.y = 3.5;
		flag.add( arm );
		var paddle = new THREE.Mesh( new THREE.BoxGeometry( 4.2, 3.4, 0.9 ), mat( THREE, 0xb8352c ) );
		paddle.position.y = 8.1;
		flag.add( paddle );
		if ( ! Number( ledgerData().mailNew ) ) flag.rotation.z = -1.35; // dropped
		g.add( flag );
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
		// ONE irregular slough: dark, deep water filling a real basin. The
		// buggy floats on it (control()/render()) — no more wading puddles.
		POND.waterY = hillsAt( POND.x, POND.z ) + POND.depth;
		var shape = new THREE.Shape();
		for ( var i = 0; i <= 72; i++ ) {
			var th = ( i / 72 ) * Math.PI * 2;
			var r = pondR( th );
			// -sin: the shape lies in XY and rotateX(-90°) maps y → -z
			var sx = Math.cos( th ) * r, sy = -Math.sin( th ) * r;
			if ( i === 0 ) shape.moveTo( sx, sy ); else shape.lineTo( sx, sy );
		}
		var geo = new THREE.ShapeGeometry( shape );
		geo.rotateX( -Math.PI / 2 );
		var water = new THREE.Mesh( geo,
			new THREE.MeshLambertMaterial( { color: 0x0c2232, emissive: 0x050f18 } ) );
		water.position.set( POND.x, POND.waterY, POND.z );
		scene.add( water );
		var glintMat = new THREE.MeshBasicMaterial( { color: 0xbcd6ea, transparent: true, opacity: 0.14 } );
		[ { x: -70, z: -55, r: 34 }, { x: 60, z: 40, r: 26 }, { x: -10, z: 90, r: 20 } ].forEach( function ( gl ) {
			var glint = new THREE.Mesh( new THREE.CircleGeometry( gl.r, 12 ), glintMat );
			glint.rotation.x = -Math.PI / 2;
			glint.position.set( POND.x + gl.x, POND.waterY + 0.2, POND.z + gl.z );
			glint.scale.x = 1.9;
			scene.add( glint );
		} );
	}

	/* ---- livestock ---- */
	var animals = [], trumacRef = null;

	function buildAnimals( THREE ) {
		var cows = [ [ 3063, 1365 ], [ 1575, 2013 ], [ 2713, 910 ], [ 3763, 1540 ],
			[ 2050, 2200 ], [ 2900, 1350 ], [ 1700, 2150 ] ];
		var sheep = [ [ 875, 1050 ], [ 2538, 2188 ], [ 1838, 613 ], [ 3938, 735 ], [ 1225, 1750 ] ];
		cows.forEach( function ( p ) { addAnimal( THREE, 'cow', p[ 0 ], p[ 1 ] ); } );
		sheep.forEach( function ( p ) { addAnimal( THREE, 'sheep', p[ 0 ], p[ 1 ] ); } );
		// Trumac, the main bull — black, 30% bigger, and he knows it
		var trumac = addAnimal( THREE, 'bull', 3150, 1900 );
		trumac.lm = { id: 'trumac', name: 'Trumac', x: 3150, y: 1900, href: null,
			prompt: 'Trumac — the main bull. Give him room' };
		trumacRef = trumac;
		PROMPTS.push( trumac.lm );
	}

	function addAnimal( THREE, type, x, z ) {
		var g = new THREE.Group();
		var bull = type === 'bull';
		var cow = type === 'cow' || bull;
		var bodyC = bull ? 0x14100d : ( cow ? 0x6f4a33 : 0xd8d3c4 );
		var headC = bull ? 0x0d0a08 : ( cow ? 0x543527 : 0x2a2420 );
		var legC = bull ? 0x0d0a08 : ( cow ? 0x452c1f : 0xbdb7a6 );
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
		if ( bull ) {
			[ -1, 1 ].forEach( function ( sd ) {
				var horn = new THREE.Mesh( new THREE.BoxGeometry( 1.4, 1.4, 4.2 ), mat( THREE, 0xcfc8b8 ) );
				horn.position.set( bw / 2 + 2, legH + bh + 2.2, sd * 4.4 );
				g.add( horn );
			} );
			g.scale.set( 1.3, 1.3, 1.3 );
		}
		scene.add( g );
		var body2d = Matter.Bodies.circle( x, z, bull ? 15 : ( cow ? 11 : 7 ),
			{ frictionAir: 0.18, density: bull ? 0.006 : 0.003 } );
		Matter.Composite.add( engine.world, body2d );
		var entry = { g: g, body: body2d, type: type, wanderT: 800 + Math.random() * 2400 };
		animals.push( entry );
		return entry;
	}

	function updateAnimals( dms ) {
		for ( var i = 0; i < animals.length; i++ ) {
			var a = animals[ i ];
			a.wanderT -= dms;
			if ( a.wanderT <= 0 ) {
				a.wanderT = 1800 + Math.random() * 2800;
				if ( Math.random() < 0.7 ) {
					var dir = Math.random() * Math.PI * 2;
					var spd = a.type === 'bull' ? 0.4 : ( a.type === 'cow' ? 0.5 : 0.7 );
					Matter.Body.setVelocity( a.body, { x: Math.cos( dir ) * spd, y: Math.sin( dir ) * spd } );
				}
			}
			var px = a.body.position.x, pz = a.body.position.y;
			if ( a.lm ) { a.lm.x = px; a.lm.y = pz; } // Trumac's prompt follows him
			if ( inPond( px, pz ) ) {
				// swim for shore — heads above water
				var away = Math.atan2( pz - POND.z, px - POND.x );
				Matter.Body.setVelocity( a.body, { x: Math.cos( away ) * 0.8, y: Math.sin( away ) * 0.8 } );
				a.g.position.set( px, Math.max( heightAt( px, pz ), POND.waterY - 7 ), pz );
			} else {
				a.g.position.set( px, heightAt( px, pz ), pz );
			}
			var v = a.body.velocity;
			if ( Math.hypot( v.x, v.y ) > 0.15 ) {
				a.g.rotation.y = -Math.atan2( v.y, v.x );
			}
		}
	}

	/* ---- the old tractor — she does her own rounds now ---- */
	var tractor = null;

	function buildTractor( THREE ) {
		var g = new THREE.Group();
		var red = mat( THREE, 0x9a3f2e );
		var darkMat = mat( THREE, 0x1c1512 );
		var tWheels = [];
		var rearGeo = new THREE.CylinderGeometry( 11, 11, 5, 12 );
		rearGeo.rotateX( Math.PI / 2 );
		var frontGeo = new THREE.CylinderGeometry( 6.5, 6.5, 4, 10 );
		frontGeo.rotateX( Math.PI / 2 );
		[ 13, -13 ].forEach( function ( z ) {
			var rw = new THREE.Mesh( rearGeo, darkMat );
			rw.position.set( -10, 11, z );
			g.add( rw );
			tWheels.push( rw );
			var fw = new THREE.Mesh( frontGeo, darkMat );
			fw.position.set( 14, 6.5, z * 0.8 );
			g.add( fw );
			tWheels.push( fw );
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
			prompt: 'The old girl still runs — she does her own rounds now' };
		g.position.set( lm.x, hillsAt( lm.x, lm.y ), lm.y );
		g.userData.lm = lm;
		scene.add( g );
		clickables.push( g );
		PROMPTS.push( lm );
		var body = Matter.Bodies.circle( lm.x, lm.y, 20, { frictionAir: 0.12, density: 0.004 } );
		Matter.Composite.add( engine.world, body );
		tractor = { g: g, body: body, lm: lm, wheels: tWheels, angle: -0.6, turn: 0, turnT: 1500 };
	}

	function updateTractor() {
		if ( ! tractor ) return;
		var tp = tractor.body.position;
		tractor.g.position.set( tp.x,
			Math.max( heightAt( tp.x, tp.y ), inPond( tp.x, tp.y ) ? POND.waterY - 8 : -1e9 ), tp.y );
		tractor.g.rotation.y = -tractor.angle;
		tractor.lm.x = tp.x;
		tractor.lm.y = tp.y;
		var tsp = Math.hypot( tractor.body.velocity.x, tractor.body.velocity.y );
		for ( var tw = 0; tw < tractor.wheels.length; tw++ ) tractor.wheels[ tw ].rotation.z -= tsp * 0.07;
		// she rolls a proper cloud behind her now
		if ( tsp > 0.5 && Math.random() < 0.18 ) {
			var td = spawnDust( {
				x: tp.x - Math.cos( tractor.angle ) * ( 16 + Math.random() * 14 ),
				y: tp.y - Math.sin( tractor.angle ) * ( 16 + Math.random() * 14 )
			}, 4 );
			if ( td ) {
				td.vy = 14 + Math.random() * 12;
				td.grow += 10;
			}
		}
	}

	/* ---- the barnyard: coop + chickens, pig pen + mud pit ---- */
	function penRun( THREE, x0, z0, x1, z1 ) {
		var postMat = mat( THREE, 0x4a4034 );
		var dx = x1 - x0, dz = z1 - z0;
		var len = Math.hypot( dx, dz ), n = Math.max( 1, Math.round( len / 34 ) );
		for ( var i = 0; i <= n; i++ ) {
			var px = x0 + dx * ( i / n ), pz = z0 + dz * ( i / n );
			var p = new THREE.Mesh( new THREE.BoxGeometry( 2.2, 10, 2.2 ), postMat );
			p.position.set( px, hillsAt( px, pz ) + 5, pz );
			scene.add( p );
		}
		var rail = new THREE.Mesh( new THREE.BoxGeometry( len, 1.5, 1.5 ), postMat );
		rail.position.set( ( x0 + x1 ) / 2, hillsAt( ( x0 + x1 ) / 2, ( z0 + z1 ) / 2 ) + 8.4, ( z0 + z1 ) / 2 );
		rail.rotation.y = -Math.atan2( dz, dx );
		scene.add( rail );
		Matter.Composite.add( engine.world, Matter.Bodies.rectangle(
			( x0 + x1 ) / 2, ( z0 + z1 ) / 2, len, 4,
			{ isStatic: true, angle: Math.atan2( dz, dx ) } ) );
	}

	function buildCoop( THREE ) {
		var g = new THREE.Group();
		var hut = new THREE.Mesh( new THREE.BoxGeometry( 26, 16, 20 ), mat( THREE, 0x6b4a2a ) );
		hut.position.y = 8;
		g.add( hut );
		var roof = gableRoof( THREE, 30, 13, 0x3a2c1c );
		roof.position.y = 19;
		g.add( roof );
		var door = new THREE.Mesh( new THREE.PlaneGeometry( 7, 9 ), mat( THREE, 0x171310 ) );
		door.position.set( 13.2, 6, 0 );
		door.rotation.y = Math.PI / 2;
		g.add( door );
		var plank = new THREE.Mesh( new THREE.BoxGeometry( 14, 1, 6 ), mat( THREE, 0x54402a ) );
		plank.position.set( 19, 2.5, 0 );
		plank.rotation.z = -0.28;
		g.add( plank );
		g.position.set( COOP.x, hillsAt( COOP.x, COOP.z ), COOP.z );
		scene.add( g );
		Matter.Composite.add( engine.world,
			Matter.Bodies.rectangle( COOP.x, COOP.z, 28, 22, { isStatic: true } ) );
		// open pen east of the hut (the girls come and go as they please)
		penRun( THREE, COOP.x + 18, COOP.z - 34, COOP.x + 78, COOP.z - 34 );
		penRun( THREE, COOP.x + 78, COOP.z - 34, COOP.x + 78, COOP.z + 34 );
		penRun( THREE, COOP.x + 18, COOP.z + 34, COOP.x + 78, COOP.z + 34 );
		PROMPTS.push( { id: 'coop', name: 'the chicken coop', x: COOP.x, y: COOP.z, href: null,
			prompt: 'The coop — mind the girls' } );
	}

	function buildChickens( THREE ) {
		for ( var i = 0; i < 12; i++ ) {
			var an = Math.random() * Math.PI * 2;
			var rr = 30 + Math.random() * 95;
			addChicken( THREE, COOP.x + Math.cos( an ) * rr, COOP.z + Math.sin( an ) * rr );
		}
	}

	function addChicken( THREE, x, z ) {
		var g = new THREE.Group();
		var feathers = mat( THREE, Math.random() < 0.25 ? 0xb98850 : 0xd8d3c4 );
		var body = new THREE.Mesh( new THREE.BoxGeometry( 6, 5, 4.5 ), feathers );
		body.position.y = 4.5;
		g.add( body );
		var head = new THREE.Mesh( new THREE.BoxGeometry( 2.6, 2.6, 2.4 ), feathers );
		head.position.set( 3.4, 8, 0 );
		g.add( head );
		var comb = new THREE.Mesh( new THREE.BoxGeometry( 1.6, 1.4, 1 ), mat( THREE, 0xb8352c ) );
		comb.position.set( 3.4, 9.8, 0 );
		g.add( comb );
		var beak = new THREE.Mesh( new THREE.BoxGeometry( 1.6, 1, 1.2 ), mat( THREE, 0xd8a23a ) );
		beak.position.set( 5, 7.6, 0 );
		g.add( beak );
		var wingL = new THREE.Mesh( new THREE.BoxGeometry( 4.5, 0.8, 3 ), feathers );
		wingL.position.set( -0.5, 6, 2.8 );
		g.add( wingL );
		var wingR = new THREE.Mesh( new THREE.BoxGeometry( 4.5, 0.8, 3 ), feathers );
		wingR.position.set( -0.5, 6, -2.8 );
		g.add( wingR );
		scene.add( g );
		var body2d = Matter.Bodies.circle( x, z, 4, { frictionAir: 0.24, density: 0.0008 } );
		Matter.Composite.add( engine.world, body2d );
		chickens.push( { g: g, body: body2d, wingL: wingL, wingR: wingR,
			wanderT: 400 + Math.random() * 2000, fT: 0, cd: 0 } );
	}

	function updateChickens( dms, t ) {
		var b = buggyBody;
		var bsp = Math.hypot( b.velocity.x, b.velocity.y );
		for ( var i = 0; i < chickens.length; i++ ) {
			var c = chickens[ i ];
			c.wanderT -= dms;
			c.cd -= dms;
			if ( c.fT > 0 ) c.fT -= dms;
			var px = c.body.position.x, pz = c.body.position.y;
			if ( c.wanderT <= 0 ) {
				c.wanderT = 900 + Math.random() * 2200;
				if ( Math.random() < 0.8 ) {
					// peck about, but keep close to home
					var dir = Math.hypot( px - COOP.x, pz - COOP.z ) > 200
						? Math.atan2( COOP.z - pz, COOP.x - px )
						: Math.random() * Math.PI * 2;
					Matter.Body.setVelocity( c.body, { x: Math.cos( dir ) * 0.9, y: Math.sin( dir ) * 0.9 } );
				}
			}
			// the buggy scatters them: squawk + flutter
			if ( c.cd <= 0 && bsp > 0.8 &&
			     Math.hypot( px - b.position.x, pz - b.position.y ) < 42 ) {
				c.cd = 1400;
				c.fT = 680;
				var fa = Math.atan2( pz - b.position.y, px - b.position.x ) + ( Math.random() - 0.5 ) * 0.7;
				Matter.Body.setVelocity( c.body, { x: Math.cos( fa ) * 3.4, y: Math.sin( fa ) * 3.4 } );
				squawk();
			}
			var hop = c.fT > 0 ? Math.sin( ( 1 - c.fT / 680 ) * Math.PI ) * 15 : 0;
			c.g.position.set( px, heightAt( px, pz ) + hop, pz );
			var flap = c.fT > 0 ? Math.sin( t * 42 ) * 0.9 : 0;
			c.wingL.rotation.x = flap;
			c.wingR.rotation.x = -flap;
			var v = c.body.velocity;
			if ( Math.hypot( v.x, v.y ) > 0.12 ) c.g.rotation.y = -Math.atan2( v.y, v.x );
		}
	}

	function buildPigPen( THREE ) {
		// pen open on the west side — straight into the mud pit
		penRun( THREE, PIGPEN.x - 30, PIGPEN.z - 55, PIGPEN.x + 70, PIGPEN.z - 55 );
		penRun( THREE, PIGPEN.x + 70, PIGPEN.z - 55, PIGPEN.x + 70, PIGPEN.z + 55 );
		penRun( THREE, PIGPEN.x - 30, PIGPEN.z + 55, PIGPEN.x + 70, PIGPEN.z + 55 );
		var shed = new THREE.Mesh( new THREE.BoxGeometry( 24, 10, 16 ), mat( THREE, 0x54402a ) );
		shed.position.set( PIGPEN.x + 52, hillsAt( PIGPEN.x + 52, PIGPEN.z - 38 ) + 5, PIGPEN.z - 38 );
		scene.add( shed );
		var shedRoof = new THREE.Mesh( new THREE.BoxGeometry( 28, 1.6, 20 ), mat( THREE, 0x3a2c1c ) );
		shedRoof.position.set( PIGPEN.x + 52, hillsAt( PIGPEN.x + 52, PIGPEN.z - 38 ) + 11, PIGPEN.z - 38 );
		shedRoof.rotation.z = 0.12;
		scene.add( shedRoof );
		Matter.Composite.add( engine.world, Matter.Bodies.rectangle(
			PIGPEN.x + 52, PIGPEN.z - 38, 24, 16, { isStatic: true } ) );
		// the mud pit — layered wet-brown discs
		[ { r: MUD.r, c: 0x2c1f12, y: 0.35 },
		  { r: MUD.r * 0.72, c: 0x382817, y: 0.5 },
		  { r: MUD.r * 0.4, c: 0x241a0e, y: 0.65 } ].forEach( function ( ring ) {
			var disc = new THREE.Mesh( new THREE.CircleGeometry( ring.r, 20 ), mat( THREE, ring.c ) );
			disc.rotation.x = -Math.PI / 2;
			disc.position.set( MUD.x, hillsAt( MUD.x, MUD.z ) + ring.y, MUD.z );
			disc.scale.x = 1.3;
			scene.add( disc );
		} );
		for ( var i = 0; i < 4; i++ ) {
			addPig( THREE, PIGPEN.x - 10 + Math.random() * 60, PIGPEN.z - 30 + Math.random() * 60 );
		}
		PROMPTS.push( { id: 'pigpen', name: 'the pig pen', x: PIGPEN.x, y: PIGPEN.z, href: null,
			prompt: 'The pig pen — the mud is deep and they love it' } );
	}

	function addPig( THREE, x, z ) {
		var g = new THREE.Group();
		var pink = mat( THREE, 0xc98d84 );
		[ [ 1, 1 ], [ 1, -1 ], [ -1, 1 ], [ -1, -1 ] ].forEach( function ( c ) {
			var leg = new THREE.Mesh( new THREE.BoxGeometry( 1.4, 3.5, 1.4 ), pink );
			leg.position.set( c[ 0 ] * 3.6, 1.75, c[ 1 ] * 2 );
			g.add( leg );
		} );
		var body = new THREE.Mesh( new THREE.BoxGeometry( 11, 7, 6.5 ), pink );
		body.position.y = 6.5;
		g.add( body );
		var head = new THREE.Mesh( new THREE.BoxGeometry( 4.5, 5, 5 ), pink );
		head.position.set( 7, 7, 0 );
		g.add( head );
		var snout = new THREE.Mesh( new THREE.BoxGeometry( 1.6, 2, 2.4 ), mat( THREE, 0xb87a70 ) );
		snout.position.set( 9.6, 6.4, 0 );
		g.add( snout );
		[ -1, 1 ].forEach( function ( sd ) {
			var ear = new THREE.Mesh( new THREE.BoxGeometry( 1.4, 1.8, 1.4 ), mat( THREE, 0xb87a70 ) );
			ear.position.set( 6.4, 10, sd * 1.8 );
			g.add( ear );
		} );
		scene.add( g );
		var body2d = Matter.Bodies.circle( x, z, 6, { frictionAir: 0.18, density: 0.002 } );
		Matter.Composite.add( engine.world, body2d );
		pigs.push( { g: g, body: body2d, wanderT: 600 + Math.random() * 2000, cd: 0 } );
	}

	function updatePigs( dms ) {
		var b = buggyBody;
		for ( var i = 0; i < pigs.length; i++ ) {
			var p = pigs[ i ];
			p.wanderT -= dms;
			p.cd -= dms;
			var px = p.body.position.x, pz = p.body.position.y;
			if ( p.wanderT <= 0 ) {
				p.wanderT = 1600 + Math.random() * 2600;
				var dir;
				if ( Math.hypot( px - PIGPEN.x, pz - PIGPEN.z ) > 150 ) {
					dir = Math.atan2( PIGPEN.z - pz, PIGPEN.x - px );
				} else if ( Math.random() < 0.4 ) {
					// pigs love the mud
					dir = Math.atan2( MUD.z - pz, MUD.x - px ) + ( Math.random() - 0.5 ) * 0.6;
				} else {
					dir = Math.random() * Math.PI * 2;
				}
				Matter.Body.setVelocity( p.body, { x: Math.cos( dir ) * 0.55, y: Math.sin( dir ) * 0.55 } );
			}
			if ( p.cd <= 0 && Math.hypot( px - b.position.x, pz - b.position.y ) < 46 &&
			     Math.hypot( b.velocity.x, b.velocity.y ) > 1 ) {
				p.cd = 1200;
				var fa = Math.atan2( pz - b.position.y, px - b.position.x );
				Matter.Body.setVelocity( p.body, { x: Math.cos( fa ) * 2.2, y: Math.sin( fa ) * 2.2 } );
			}
			var wallow = Math.hypot( px - MUD.x, pz - MUD.z ) < MUD.r ? 1.8 : 0;
			p.g.position.set( px, heightAt( px, pz ) - wallow, pz );
			var v = p.body.velocity;
			if ( Math.hypot( v.x, v.y ) > 0.12 ) p.g.rotation.y = -Math.atan2( v.y, v.x );
		}
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

	function buildGrove( THREE ) {
		// wind-rows: a dense shelterbelt grove packed into the northwest
		// corner — tight enough to weave a buggy through, barely
		var trunkMat = mat( THREE, 0x2c2418 );
		var leafMat = mat( THREE, 0x22422c );
		var spots = [], guard = 0;
		while ( spots.length < 40 && guard++ < 500 ) {
			var x = 130 + Math.random() * 500;
			var z = 150 + Math.random() * 500;
			if ( ( x - 130 ) + ( z - 150 ) > 860 ) continue; // hug the corner
			if ( Math.hypot( x - 350, z - 350 ) < 32 ) continue; // token clearing
			if ( Math.hypot( x - 130, z - 800 ) < 150 ) continue; // Rycroft screen approach
			var ok = true;
			for ( var i = 0; i < spots.length; i++ ) {
				if ( Math.hypot( x - spots[ i ].x, z - spots[ i ].z ) < 46 ) { ok = false; break; }
			}
			if ( ! ok ) continue;
			spots.push( { x: x, z: z } );
			var gy = hillsAt( x, z );
			var trunk = new THREE.Mesh( new THREE.CylinderGeometry( 3.6, 5.2, 24, 6 ), trunkMat );
			trunk.position.set( x, gy + 12, z );
			scene.add( trunk );
			var h = 55 + Math.random() * 55;
			var cone = new THREE.Mesh( new THREE.ConeGeometry( 14 + Math.random() * 8, h, 7 ), leafMat );
			cone.position.set( x, gy + 24 + h / 2, z );
			scene.add( cone );
			Matter.Composite.add( engine.world, Matter.Bodies.circle( x, z, 10, { isStatic: true } ) );
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
		}
		// south side leaves the farm gate open — the way out to the track
		for ( var xa = 0; xa < 2180; xa += step ) {
			fenceRun( THREE, xa, H, Math.min( xa + step, 2180 ), H );
		}
		for ( var xb = 2300; xb < W; xb += step ) {
			fenceRun( THREE, xb, H, Math.min( xb + step, W ), H );
		}
		for ( var z = 0; z < H; z += step ) {
			fenceRun( THREE, 0, z, 0, Math.min( z + step, H ) );
			fenceRun( THREE, W, z, W, Math.min( z + step, H ) );
		}
	}

	/* ------------------------------------------------------------------ *
	 *  THE SECTION ROAD — start line, timed laps, ghosts
	 * ------------------------------------------------------------------ */
	function buildTrack( THREE ) {
		// checkered start/finish strip across the south straight
		var c = document.createElement( 'canvas' );
		c.width = 64; c.height = 256;
		var ctx = c.getContext( '2d' );
		for ( var cy = 0; cy < 16; cy++ ) {
			for ( var cx = 0; cx < 4; cx++ ) {
				ctx.fillStyle = ( cx + cy ) % 2 ? '#20201e' : '#cfc8b8';
				ctx.fillRect( cx * 16, cy * 16, 16, 16 );
			}
		}
		var strip = new THREE.Mesh(
			new THREE.PlaneGeometry( 16, TRACK_W ),
			new THREE.MeshBasicMaterial( { map: new THREE.CanvasTexture( c ) } )
		);
		strip.rotation.x = -Math.PI / 2;
		strip.position.set( START.x, hillsAt( START.x, START.z ) + 0.5, START.z );
		scene.add( strip );

		// posts with lamps at both ends of the line
		[ START.z - TRACK_W / 2 - 8, START.z + TRACK_W / 2 + 8 ].forEach( function ( pz ) {
			var post = new THREE.Mesh( new THREE.BoxGeometry( 3, 34, 3 ), mat( THREE, 0x3a2c1c ) );
			post.position.set( START.x, hillsAt( START.x, pz ) + 17, pz );
			scene.add( post );
			var lamp = new THREE.Mesh( new THREE.BoxGeometry( 4, 4.5, 4 ),
				new THREE.MeshBasicMaterial( { color: 0xffd9a0 } ) );
			lamp.position.set( START.x, hillsAt( START.x, pz ) + 37, pz );
			scene.add( lamp );
		} );

		buildSign( THREE, 'the section road — timed laps', 2085, 2590, START.x, START.z );
		PROMPTS.push( { id: 'raceline', name: 'the section road', x: START.x, y: START.z, href: null,
			prompt: 'The section road — cross the line to race the clock (and your ghosts)' } );

		// three ghost buggies: gold = best ever, silver = the two most recent
		for ( var gi = 0; gi < 3; gi++ ) {
			var gm = new THREE.MeshLambertMaterial( {
				color: gi === 0 ? 0xd8b25e : 0x8fa8c8,
				transparent: true, opacity: 0.34, depthWrite: false
			} );
			var gg = new THREE.Group();
			var chassis = new THREE.Mesh( new THREE.BoxGeometry( 44, 10, 26 ), gm );
			chassis.position.y = 12;
			gg.add( chassis );
			var cage = new THREE.Mesh( new THREE.BoxGeometry( 16, 14, 20 ), gm );
			cage.position.set( -6, 22, 0 );
			gg.add( cage );
			gg.visible = false;
			scene.add( gg );
			ghosts.push( { mesh: gg, s: null, gt: 0 } );
		}
	}

	function buildTrackLights( THREE ) {
		// tall corner towers, lamp heads aimed both ways down the track,
		// with a real PointLight pooling on the dirt
		var poleMat = mat( THREE, 0x3a3630 );
		var headMat = new THREE.MeshBasicMaterial( { color: 0xfff2d0 } );
		[ { x: -60, z: -60 }, { x: W + 60, z: -60 },
		  { x: -60, z: H + 60 }, { x: W + 60, z: H + 60 } ].forEach( function ( c ) {
			var gy = hillsAt( c.x, c.z );
			var pole = new THREE.Mesh( new THREE.CylinderGeometry( 2.6, 3.4, 110, 8 ), poleMat );
			pole.position.set( c.x, gy + 55, c.z );
			scene.add( pole );
			var A = Math.atan2( H / 2 - c.z, W / 2 - c.x );
			var th = A + Math.PI / 2; // crossbar perpendicular to the infield diagonal
			var bar = new THREE.Mesh( new THREE.BoxGeometry( 34, 4, 8 ), poleMat );
			bar.position.set( c.x, gy + 108, c.z );
			bar.rotation.y = -th;
			scene.add( bar );
			[ -14, 14 ].forEach( function ( o ) {
				var head = new THREE.Mesh( new THREE.BoxGeometry( 11, 6.5, 9 ), headMat );
				head.position.set( c.x + Math.cos( th ) * o, gy + 105, c.z + Math.sin( th ) * o );
				head.rotation.y = -th;
				scene.add( head );
			} );
			var pt = new THREE.PointLight( 0xffe2b0, 0.9, 1150 );
			pt.position.set( c.x, gy + 100, c.z );
			scene.add( pt );
		} );
	}

	function buildGrandstands( THREE ) {
		// two stands on the far straight, packed with a bobbing crowd
		var frame = mat( THREE, 0x3a3630 );
		var seatMat = mat( THREE, 0x4a443c );
		var stands = [ { x: 1900, z: -300 }, { x: 2580, z: -300 } ];
		var ROWS = 5, SEATS = 20;
		crowdDummy = new THREE.Object3D();
		crowdInst = new THREE.InstancedMesh(
			new THREE.BoxGeometry( 6, 9, 4 ),
			new THREE.MeshLambertMaterial( { color: 0xffffff } ),
			stands.length * ROWS * SEATS
		);
		crowdInst.instanceMatrix.setUsage( THREE.DynamicDrawUsage );
		var palette = [ 0xc84a3a, 0x4a78c8, 0xd8b25e, 0x5da868, 0xd8d3c4, 0x9a6fc8, 0xd88a3a ];
		var col = new THREE.Color();
		var idx = 0;
		stands.forEach( function ( st ) {
			var baseY = hillsAt( st.x, st.z );
			for ( var r = 0; r < ROWS; r++ ) {
				var tier = new THREE.Mesh( new THREE.BoxGeometry( 310, 10, 24 ), seatMat );
				tier.position.set( st.x, baseY + r * 13 + 5, st.z - r * 24 );
				scene.add( tier );
				for ( var s2 = 0; s2 < SEATS; s2++ ) {
					var px = st.x - 133 + s2 * 14;
					var py = baseY + r * 13 + 14.5;
					var pz = st.z - r * 24 - 3;
					crowdDummy.position.set( px, py, pz );
					crowdDummy.updateMatrix();
					crowdInst.setMatrixAt( idx, crowdDummy.matrix );
					col.setHex( palette[ ( idx * 7 + 3 ) % palette.length ] );
					crowdInst.setColorAt( idx, col );
					crowdData.push( { x: px, y: py, z: pz,
						ph: Math.random() * Math.PI * 2, sp: 2.2 + Math.random() * 1.6 } );
					idx++;
				}
			}
			var roof = new THREE.Mesh( new THREE.BoxGeometry( 320, 4, 110 ), frame );
			roof.position.set( st.x, baseY + 96, st.z - 48 );
			scene.add( roof );
			[ -152, 152 ].forEach( function ( ox ) {
				[ 6, -100 ].forEach( function ( oz ) {
					var post = new THREE.Mesh( new THREE.BoxGeometry( 4, 96, 4 ), frame );
					post.position.set( st.x + ox, baseY + 48, st.z + oz );
					scene.add( post );
				} );
			} );
			Matter.Composite.add( engine.world,
				Matter.Bodies.rectangle( st.x, st.z - 48, 330, 130, { isStatic: true } ) );
			PROMPTS.push( { id: 'stand' + st.x, name: 'the grandstands', x: st.x, y: st.z,
				href: null, prompt: 'The grandstands — they came to watch you send it' } );
		} );
		scene.add( crowdInst );
	}

	function updateCrowd( t ) {
		if ( ! crowdInst ) return;
		for ( var i = 0; i < crowdData.length; i++ ) {
			var p = crowdData[ i ];
			var hop = Math.max( 0, Math.sin( t * p.sp + p.ph ) ) * 5;
			crowdDummy.position.set( p.x, p.y + hop, p.z );
			crowdDummy.updateMatrix();
			crowdInst.setMatrixAt( i, crowdDummy.matrix );
		}
		crowdInst.instanceMatrix.needsUpdate = true;
	}

	function loadLaps() {
		if ( ghostStore ) return ghostStore;
		try { ghostStore = JSON.parse( window.localStorage.getItem( 'tcBqLaps_v2' ) || 'null' ); } catch ( err ) {}
		if ( ! ghostStore || typeof ghostStore !== 'object' ) ghostStore = { best: null, recent: [] };
		if ( ! ghostStore.recent ) ghostStore.recent = [];
		return ghostStore;
	}

	function saveLaps( st ) {
		ghostStore = st;
		try { window.localStorage.setItem( 'tcBqLaps_v2', JSON.stringify( st ) ); } catch ( err ) {}
	}

	function fmtLap( ms ) {
		var s = ms / 1000;
		var m = Math.floor( s / 60 );
		var r = s - m * 60;
		return m + ':' + ( r < 10 ? '0' : '' ) + r.toFixed( 1 );
	}

	function startLap( dir ) {
		lap.active = true;
		lap.t = 0;
		lap.dir = dir;
		lap.next = 0;
		lap.rec = [];
		// wake the ghosts: best (gold, slot 0) + up to two recents (silver),
		// skipping one recent if it IS the best run
		var st = loadLaps();
		var streams = [];
		if ( st.best && st.best.s ) streams.push( st.best.s );
		var skipped = false;
		st.recent.forEach( function ( r ) {
			if ( ! skipped && st.best && r.t === st.best.t ) { skipped = true; return; }
			if ( r.s && streams.length < 3 ) streams.push( r.s );
		} );
		for ( var i = 0; i < ghosts.length; i++ ) {
			ghosts[ i ].s = streams[ i ] || null;
			ghosts[ i ].gt = 0;
			ghosts[ i ].mesh.visible = !! ghosts[ i ].s;
		}
		flashChip( streams.length
			? 'Lap started — the ghosts are running'
			: 'Lap started — three corners and home' );
		tone( 784, 0.12, 0.12, 'square' ); // start blip
	}

	function finishLap() {
		var entry = { t: Math.round( lap.t ), s: lap.rec.length ? lap.rec : null };
		var st = loadLaps();
		var isBest = ! st.best || entry.t < st.best.t;
		if ( entry.s ) {
			st.recent.unshift( entry );
			st.recent = st.recent.slice( 0, 2 );
			if ( isBest ) st.best = entry;
			saveLaps( st );
		}
		flashChip( isBest
			? 'NEW BEST LAP — ' + fmtLap( entry.t ) + ' 🏆'
			: 'Lap ' + fmtLap( entry.t ) + ' · best ' + fmtLap( st.best.t ) );
		if ( isBest ) fanfare(); else tone( 988, 0.16, 0.11, 'square' );
	}

	// called every 60 Hz physics step
	function lapControl() {
		var b = buggyBody;
		var sx = b.position.x - START.x;
		var onLine = Math.abs( b.position.y - START.z ) < 80;
		if ( onLine && ( ( prevSX < 0 && sx >= 0 ) || ( prevSX > 0 && sx <= 0 ) ) ) {
			var dir = sx >= 0 ? 1 : -1; // 1 = heading east = counterclockwise
			if ( lap.active && dir === lap.dir && lap.next === 3 ) finishLap();
			startLap( dir );
		}
		prevSX = sx;
		if ( ! lap.active ) return;
		lap.t += 16.666;
		// 20 Hz ghost samples ([x, z, angle] flat); 3-minute cap
		if ( lap.rec.length < 3600 * 3 && Math.round( lap.t / 16.666 ) % 3 === 0 ) {
			lap.rec.push( Math.round( b.position.x ), Math.round( b.position.y ),
				Math.round( b.angle * 100 ) / 100 );
		}
		if ( lap.next < 3 ) {
			var seq = lap.dir === 1 ? [ 0, 1, 2 ] : [ 2, 1, 0 ];
			var ck = LAP_CKPTS[ seq[ lap.next ] ];
			if ( Math.hypot( b.position.x - ck.x, b.position.y - ck.z ) < 175 ) {
				lap.next++;
				flashChip( 'Corner ' + lap.next + ' of 3 · ' + fmtLap( lap.t ) );
				tone( 523 + lap.next * 130, 0.09, 0.09, 'square' );
			}
		}
	}

	function updateGhosts( dms ) {
		for ( var i = 0; i < ghosts.length; i++ ) {
			var g = ghosts[ i ];
			if ( ! g.s || ! g.mesh.visible ) continue;
			g.gt += dms;
			var f = g.gt / 50; // samples every 50 ms
			var i0 = Math.floor( f ) * 3;
			if ( i0 + 5 >= g.s.length ) {
				g.mesh.visible = false;
				continue;
			}
			var u = f - Math.floor( f );
			var gx = g.s[ i0 ] + ( g.s[ i0 + 3 ] - g.s[ i0 ] ) * u;
			var gz = g.s[ i0 + 1 ] + ( g.s[ i0 + 4 ] - g.s[ i0 + 1 ] ) * u;
			var ga = g.s[ i0 + 2 ] + wrapAngle( g.s[ i0 + 5 ] - g.s[ i0 + 2 ] ) * u;
			g.mesh.position.set( gx, heightAt( gx, gz ), gz );
			g.mesh.rotation.y = -ga;
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
			if ( ! farFromLandmarks( x, z, 170 ) || inCompound( x, z, 30 ) || ! farFromRoads( x, z, 60 ) || inPond( x, z ) ) continue;
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

	function initDust( THREE ) { initPool( THREE, dustPool, 44, makePuffTexture( THREE, 158, 138, 106 ) ); }
	function initSplash( THREE ) { initPool( THREE, splashPool, 20, makePuffTexture( THREE, 140, 180, 214 ) ); }
	function initMud( THREE ) { initPool( THREE, mudPool, 22, makePuffTexture( THREE, 96, 74, 52 ) ); }

	function spawnFrom( pool, at, sp ) {
		for ( var i = 0; i < pool.length; i++ ) {
			if ( pool[ i ].life <= 0 ) {
				var p = pool[ i ];
				p.max = p.life = 550 + Math.random() * 450;
				var py = inPond( at.x, at.y ) ? POND.waterY : heightAt( at.x, at.y );
				p.spr.position.set(
					at.x + ( Math.random() - 0.5 ) * 8,
					py + 3,
					at.y + ( Math.random() - 0.5 ) * 8 );
				p.vy = 8 + Math.random() * 8;
				p.grow = 10 + sp * 2.4;
				return p;
			}
		}
		return null;
	}
	function spawnDust( at, sp ) { return spawnFrom( dustPool, at, sp ); }
	function spawnSplash( at, sp ) { return spawnFrom( splashPool, at, sp * 0.8 ); }
	function spawnMud( at, sp ) {
		var p = spawnFrom( mudPool, at, sp );
		if ( p ) {
			p.vy = 26 + Math.random() * 28; // mud flies HIGH
			p.grow = 14 + sp * 2;
		}
	}

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
		updatePool( mudPool, dms, 0.5 );
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
		// chimney tops moved with the 1.6× building scale
		[ { x: 1265, y: hillsAt( 1211, 588 ) + 114, z: 575 },
		  { x: 2269, y: hillsAt( 2240, 462 ) + 85, z: 472 } ].forEach( function ( at ) {
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
			if ( audio.master ) audio.master.gain.value = 0.6;
		} else if ( audio.master ) {
			audio.master.gain.value = 0; // mutes engine + ambient bed + SFX
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

		// ---- shared noise source feeds the wind bed AND the tire roll ----
		var nb = audio.ctx.createBuffer( 1, audio.ctx.sampleRate * 2, audio.ctx.sampleRate );
		var nd = nb.getChannelData( 0 );
		for ( var i = 0; i < nd.length; i++ ) nd[ i ] = Math.random() * 2 - 1;
		audio.noise = audio.ctx.createBufferSource();
		audio.noise.buffer = nb;
		audio.noise.loop = true;

		// night wind — low-passed noise that gusts on a slow LFO
		var windLP = audio.ctx.createBiquadFilter();
		windLP.type = 'lowpass'; windLP.frequency.value = 360;
		audio.windGain = audio.ctx.createGain();
		audio.windGain.gain.value = 0.02;
		audio.noise.connect( windLP ); windLP.connect( audio.windGain );
		audio.windGain.connect( audio.master );
		var gust = audio.ctx.createOscillator();
		gust.frequency.value = 0.08;
		var gustAmt = audio.ctx.createGain(); gustAmt.gain.value = 0.012;
		gust.connect( gustAmt ); gustAmt.connect( audio.windGain.gain );
		gust.start();

		// tire roll — band-passed noise, driven by speed + surface in updateAudio
		audio.tireBP = audio.ctx.createBiquadFilter();
		audio.tireBP.type = 'bandpass'; audio.tireBP.frequency.value = 800; audio.tireBP.Q.value = 0.7;
		audio.tireGain = audio.ctx.createGain(); audio.tireGain.gain.value = 0;
		audio.noise.connect( audio.tireBP ); audio.tireBP.connect( audio.tireGain );
		audio.tireGain.connect( audio.master );

		audio.noise.start();
	}

	// a short filtered-noise burst — the workhorse for splash/mud/snort/cheer
	function noiseBurst( dur, type, freq, Q, peak, sweepTo ) {
		if ( ! audio.on || ! audio.ctx ) return;
		var t0 = audio.ctx.currentTime;
		var src = audio.ctx.createBufferSource();
		src.buffer = audio.noise.buffer;
		src.loop = true;
		var bp = audio.ctx.createBiquadFilter();
		bp.type = type; bp.frequency.value = freq; bp.Q.value = Q || 1;
		if ( sweepTo ) bp.frequency.exponentialRampToValueAtTime( sweepTo, t0 + dur );
		var g = audio.ctx.createGain();
		g.gain.setValueAtTime( 0.0001, t0 );
		g.gain.exponentialRampToValueAtTime( peak, t0 + dur * 0.18 );
		g.gain.exponentialRampToValueAtTime( 0.0001, t0 + dur );
		src.connect( bp ); bp.connect( g ); g.connect( audio.master );
		src.start( t0 ); src.stop( t0 + dur + 0.02 );
	}

	function updateAudio( dms, sp ) {
		if ( ! audio.on || ! audio.ctx || ! audio.engGain ) return;
		var rev = Math.min( 1, sp / 9 ) + Math.abs( throttleInput ) * 0.25 + ( boostT > 0 ? 0.3 : 0 );
		audio.engOsc1.frequency.value = 52 + rev * 80;
		audio.engOsc2.frequency.value = ( 52 + rev * 80 ) * 2.02;
		audio.engGain.gain.value = 0.012 + rev * 0.05;

		// tire roll — louder/brighter with speed, muffled in water, gritty in mud
		if ( audio.tireGain ) {
			var roll = airborne ? 0 : Math.min( 1, sp / 9 ) * 0.055;
			if ( inWater ) roll *= 0.35;
			audio.tireGain.gain.value += ( roll - audio.tireGain.gain.value ) * 0.2;
			var tf = inMud ? 280 : ( inWater ? 480 : 640 + sp * 95 );
			audio.tireBP.frequency.value += ( tf - audio.tireBP.frequency.value ) * 0.2;
		}

		// scheduled ambience
		audio.cricketT = ( audio.cricketT || 0 ) - dms;
		if ( audio.cricketT <= 0 ) { audio.cricketT = 900 + Math.random() * 1700; cricket(); }
		audio.cluckT = ( audio.cluckT || 0 ) - dms;
		if ( audio.cluckT <= 0 ) {
			audio.cluckT = 4200 + Math.random() * 6500;
			// only the coop's earshot, and softer than a scattered squawk
			if ( Math.hypot( buggyBody.position.x - COOP.x, buggyBody.position.y - COOP.z ) < 900 ) softCluck();
		}
		audio.snortT = ( audio.snortT || 0 ) - dms;
		if ( audio.snortT <= 0 ) {
			if ( trumacRef && Math.hypot( buggyBody.position.x - trumacRef.body.position.x,
				buggyBody.position.y - trumacRef.body.position.y ) < 240 ) {
				audio.snortT = 2600; if ( Math.random() < 0.75 ) snort();
			} else { audio.snortT = 900; }
		}
		// the crowd rises as you rip past the grandstands
		audio.cheerT = ( audio.cheerT || 0 ) - dms;
		if ( audio.cheerT <= 0 ) {
			if ( sp > 5 && Math.hypot( buggyBody.position.x - 2240, buggyBody.position.y + 300 ) < 720 ) {
				audio.cheerT = 3400; cheer( 0.4 );
			} else { audio.cheerT = 700; }
		}
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

	function squawk() {
		if ( ! audio.on || ! audio.ctx ) return;
		var t0 = audio.ctx.currentTime;
		// an unhurried barnyard "buk-BAWK" — low, throaty, two beats
		[ 0, 0.22 ].forEach( function ( d, i ) {
			var o = audio.ctx.createOscillator();
			o.type = 'triangle';
			var f0 = ( i ? 430 : 330 ) + Math.random() * 60;
			o.frequency.setValueAtTime( f0, t0 + d );
			o.frequency.exponentialRampToValueAtTime( f0 * 0.55, t0 + d + 0.16 );
			var g = audio.ctx.createGain();
			g.gain.setValueAtTime( 0.0001, t0 + d );
			g.gain.exponentialRampToValueAtTime( 0.11, t0 + d + 0.025 );
			g.gain.exponentialRampToValueAtTime( 0.0001, t0 + d + 0.2 );
			o.connect( g );
			g.connect( audio.master );
			o.start( t0 + d );
			o.stop( t0 + d + 0.24 );
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

	// a short tone helper (beeps, snort pitch, fanfare notes)
	function tone( freq, dur, peak, type, t0 ) {
		if ( ! audio.on || ! audio.ctx ) return;
		t0 = t0 || audio.ctx.currentTime;
		var o = audio.ctx.createOscillator();
		o.type = type || 'square';
		o.frequency.value = freq;
		var g = audio.ctx.createGain();
		g.gain.setValueAtTime( 0.0001, t0 );
		g.gain.exponentialRampToValueAtTime( peak, t0 + 0.015 );
		g.gain.exponentialRampToValueAtTime( 0.0001, t0 + dur );
		o.connect( g ); g.connect( audio.master );
		o.start( t0 ); o.stop( t0 + dur + 0.02 );
	}

	function splashSound() { noiseBurst( 0.5, 'bandpass', 1400, 0.6, 0.14, 380 ); }
	function thud( sp ) {
		if ( ! audio.on || ! audio.ctx ) return;
		var t0 = audio.ctx.currentTime;
		var o = audio.ctx.createOscillator();
		o.type = 'sine';
		o.frequency.setValueAtTime( 130, t0 );
		o.frequency.exponentialRampToValueAtTime( 48, t0 + 0.18 );
		var g = audio.ctx.createGain();
		var vol = Math.min( 0.22, 0.06 + ( sp || 0 ) * 0.016 );
		g.gain.setValueAtTime( vol, t0 );
		g.gain.exponentialRampToValueAtTime( 0.0001, t0 + 0.24 );
		o.connect( g ); g.connect( audio.master );
		o.start( t0 ); o.stop( t0 + 0.26 );
		noiseBurst( 0.16, 'lowpass', 500, 0.7, 0.06 );
	}
	function snort() { noiseBurst( 0.28, 'bandpass', 340, 1.4, 0.11, 190 ); }
	function cricket() {
		if ( ! audio.on || ! audio.ctx ) return;
		var t0 = audio.ctx.currentTime;
		for ( var i = 0; i < 3; i++ ) tone( 4300 + Math.random() * 300, 0.03, 0.018, 'triangle', t0 + i * 0.055 );
	}
	function softCluck() { noiseBurst( 0.14, 'bandpass', 700, 1.2, 0.045, 480 ); }
	function cheer( level ) {
		if ( ! audio.on || ! audio.ctx ) return;
		// a wash of crowd noise + a few detuned "voices" swelling and fading
		noiseBurst( 1.3, 'bandpass', 1100, 0.5, 0.05 * level );
		var t0 = audio.ctx.currentTime;
		for ( var i = 0; i < 4; i++ ) {
			var o = audio.ctx.createOscillator();
			o.type = 'sawtooth';
			o.frequency.value = 180 + Math.random() * 340;
			var g = audio.ctx.createGain();
			g.gain.setValueAtTime( 0.0001, t0 );
			g.gain.exponentialRampToValueAtTime( 0.02 * level, t0 + 0.3 + Math.random() * 0.3 );
			g.gain.exponentialRampToValueAtTime( 0.0001, t0 + 1.1 + Math.random() * 0.3 );
			o.connect( g ); g.connect( audio.master );
			o.start( t0 ); o.stop( t0 + 1.5 );
		}
	}
	function fanfare() {
		if ( ! audio.on || ! audio.ctx ) return;
		var t0 = audio.ctx.currentTime;
		[ 523, 659, 784, 1047 ].forEach( function ( f, i ) {
			tone( f, 0.34, 0.13, 'triangle', t0 + i * 0.11 );
		} );
		cheer( 0.9 );
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
