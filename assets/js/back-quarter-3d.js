/**
 * THE BACK QUARTER 3D — Path C (Bruno-Simon-style).
 * Spec: docs/QUARTER-SECTION-SPEC.md §8.
 *
 * SOFTER HANDLING (1.0.745): the controls were twitchy. THROTTLE now
 * eases in/out (throttleInput ramps toward the target at 0.055) so
 * acceleration builds and lift-off coasts instead of switching. STEER
 * wind-on softened 0.11 → 0.075. And a REAL TURNING RADIUS: the yaw
 * rate follows forward speed (turnEase = min(1, speed/4)) so she can't
 * tank-pivot in place — she has to be rolling to turn, eases into it,
 * and reversing flips the steer sense. Max turn 0.05 → 0.042 dry /
 * 0.036 → 0.03 wet. Air keeps its flat yaw for landings.
 *
 * MOBILE PLAY (1.0.744): phones are IN (supersedes the old PC/tablet-
 * only call). TOUCH detection builds on-screen controls: a floating
 * analog joystick owns the left half (steer + throttle, spawns under
 * the thumb, dead zone 0.14, reverse at 0.65), HOP/flip/honk cluster
 * bottom-right, contextual ENTER + race-mode + ✕ buttons that appear
 * only when they apply. LITE tier (touch + screen < 820): pixel ratio
 * 1, NO bloom composer, 1024 shadow map — playable, not a slideshow.
 * Fullscreen: back-quarter.js gains a pseudo-fullscreen fallback for
 * iPhones (no element-fullscreen API there) — fixed-position stage +
 * scroll lock; the ResizeObserver does the rest.
 *
 * HOMESTEAD PASS (1.0.743): three photo-referenced rebuilds. COWS are
 * BLACK ANGUS — solid black coats (four shades, no hide patches), legs
 * 6 → 9 (they read pig-on-stumps), slimmer flanks, POLLED (no horns —
 * Trumac keeps his). PUMPJACK rebuilt off Thomas's reference photo:
 * rust-streaked cream on beam/head/post/weights, skid rails, 4-leg
 * A-frame + ladder, big rounded horsehead (slab+crown+face), twin
 * bridle cables → spreader → polished rod, KIDNEY counterweights over
 * a dark gearbox. THE BIG RED BARN: 3.2× (2× the old), true GAMBREL
 * roof + gable pentagons, white trim/corner boards, hayloft door +
 * octagon window, west doors slid OPEN with matching physics shell
 * (wall segments + door gap) — park the buggy (or the horse, someday)
 * inside; plank floor + lantern glow. FLAT pad grown to keep the floor
 * level wall-to-wall.
 *
 * FIRE VOICE III (1.0.742): the crackle still read as "tin bashing" —
 * every pop was the SAME continuous noise through the SAME resonant
 * bandpass, ringing one note. Now the bed is a lowpassed (460Hz) ember
 * roar at constant low gain, and pops are discrete 12–45ms one-shot
 * noise slices, EACH through its own randomly-tuned lowpass (500–2400)
 * — different colour every snap, nothing rings, occasional knot-crack
 * + ember clusters. Same steep-rolloff panner.
 *
 * THE LIVING FARM (1.0.741): the herd was too still — a single velocity
 * impulse died to friction in under a second, so animals stood like
 * statues between "moves". Now a walk HOLDS its heading 1.4–4.6s with
 * velocity re-applied per frame, chosen more often (85% on a 1.1–3.2s
 * clock) — cows/horses/sheep/pigs genuinely wander. SCATTER + CLUSTER:
 * ~25% of hens are farm-wide rangers (range 1500) while the rest hold
 * the coop (180, rooster stays home); same for adult pigs (900 vs 190,
 * piglets stay). TRUMAC: +10% (scale 1.43, physics 17) and a BELLOW —
 * the moo sample at 0.5 rate through a barely-rolling-off panner
 * (ref 90 / rolloff 0.4) every 26–64s, heard across the whole quarter.
 *
 * RACE DAY (1.0.740): the loose lap timer becomes STRUCTURED RACING +
 * path-1 async multiplayer. Nothing times until you ARM a race at the
 * start line — 1: single lap · 3: three-lap race · T: rolling time
 * trial · X abandons; crossing unarmed just gets a hint chip, and laps
 * no longer roll over silently (single/three finish with results; only
 * the trial rolls). Direction stays free — you pick it off the line.
 * THE FARM RECORD: the fastest visitor's lap (time + 20 Hz stream)
 * lives in WP REST (inc/bq-ghost.php, tc-games/v1/bq-ghost, arcade-
 * grade hardening) and races every player as a fourth CYAN ghost; beat
 * it and your actual run takes the crown (name from localStorage
 * tcBqRaceName, one-time prompt). HUD: lap n/3, trial lap count, 👻
 * farm-record time.
 *
 * THE PEACOCK IS MAGNIFICENT (1.0.739): rounded iridescent body (the
 * farm's ONLY Phong specular — he shimmers), breast + folded wings,
 * S-neck, white cheek flashes, gold cone beak, five-pin teal-tipped
 * crown, and a THREE-LAYER train nearly twice his height (radial
 * gradient, 17 feather rays, two arcs of four-ring eyespots) that
 * breathes — regal sway + shimmer pulse in updatePeacock. Scale 1.15 →
 * 1.5, physics 5 → 7.
 *
 * FEEL TRIM (1.0.738): the fire crackle clicked like FIRECRACKERS — the
 * pops were instant gain jumps (discontinuity = click) through a bright
 * 2400Hz band. Now 1100Hz, ramped 14ms attacks, softer pops (0.12–0.28,
 * one in ~8 snaps 0.5), slower cadence. And the landing bounce is for
 * BIG hits only: threshold 100→180, rebound proportional (0.2×, no +30
 * floor) — a small hill-roller no longer rebounds higher than the hop.
 *
 * HEADLIGHT FIX (1.0.737): the spots aimed nearly level (target 300 out
 * at −4 → ~3° slope), so the beams sailed over the dirt and lit only
 * what stood at lamp height. Targets now 120 out at −10 (cone centre
 * strikes ~55 ahead), cone widened 0.46→0.54 + penumbra 0.75, intensity
 * 0.8, plus a small warm PointLight fill off the bull bar for the first
 * few metres of ground.
 *
 * ATMOSPHERE PASS (1.0.736): the air is INHABITED — 220 dust motes
 * drift on a lazy wind in a recycling cloud around the buggy (fuller by
 * day, faint by night). The prairie chorus is sparse + DISTANT (2.6–7s
 * gaps, panners 350–1000 out): crickets own the night, synth songbirds
 * the day, FROGS croak from the slough rim (harder after dark). Stars:
 * 2× the count at size 4 (was 900 at 7). Nights darker: moon 0.6→0.34
 * floor, amb/hemi dip with it. The flare + firepit light DANCES (two
 * incommensurate sines + jitter, and the PointLight itself sways around
 * its base). The firepit CRACKLES through its own steep-rolloff panner
 * (ref 8 / rolloff 2.6) — it swells fast as you walk up.
 *
 * RWD + SPRUNG PASS (1.0.735): she's rear-wheel drive now — on the gas
 * the tail kicks past the fronts' bite (angular kick scaled by throttle
 * × steer × slip: a drift on dry dirt, full DONUTS in a mud/water
 * spin-out) and on-throttle lateral grip loosens (power oversteer; lift
 * and she tucks in). Landings are SPRUNG, not welded: impacts > 100
 * rebound one damped hop (bounceAir guards the thud + never pogos), and
 * chassisDip is a real damped spring that overshoots. Roost pools 60 →
 * 100, spray cones fire from slip 0.35 (second pair past 0.7), hotter.
 *
 * WHEELSPIN PASS (1.0.734): throttle on mud/water/creek SPINS OUT — a
 * `slip` factor (worst bogged near-still at full throttle, fading as
 * ground speed comes up) revs the engine UP (it used to rev DOWN with
 * the speed), whirls the wheel meshes far past ground speed, sprays
 * mud/water CONES from the rear tires even at a standstill, and churns
 * the tire-noise loop. Traction down to match: less drive (water 0.4×,
 * mud 0.55×), less steering bite (0.036 vs 0.05), more lateral slide
 * (grip 0.92–0.94 vs 0.84).
 *
 * ANIMAL LIFE PASS (1.0.733): horses downsized 1.55–1.9 → 1.18–1.35
 * (that range was tuned for the old plank build — with real necks and
 * heads they'd grown into giraffes; physics radius 21 → 17). And the
 * herd MOVES now: legs swing in diagonal trot pairs while walking (with
 * a slight body bob), settle to neutral on stop, then the whole animal
 * eases into a nose-down graze lean for a spell (rotation order YZX so
 * the lean tracks heading; Trumac doesn't bow).
 *
 * ANIMAL ART PASS (1.0.732): "at least they're not Minecraft" — the herd
 * loses its crates. Ellipsoid barrels on cattle/horses/pigs (the chest/
 * rump spheres finish the rounding), dark hooves; horse heads rebuilt
 * (angled skull + dropped muzzle, tapered cylinder neck, forelock,
 * hanging tapered tail); some cows carry horns, some an udder; sheep get
 * a wool cap over the dark face, a fleece stub tail and dark legs; pigs
 * get a disc snout with nostrils, brow-flopped ears and a two-nub curl
 * tail.
 *
 * FEEDBACK PASS (1.0.731): the grain elevator RETIRES — the /hcs landmark
 * is now a MEDIC HUT in the open field west of the old site (white canvas,
 * red cross on all four walls + the medic flag overhead; the "one of fewer
 * than fifty" line rides along). Horse herd recoloured NO BROWNS (white/
 * dapple-grey/black/palomino, manes+tails matched to coat, new pricked
 * ears); the pen-squatter horse rehomed to the southeast pasture. The pig-
 * pit mud dressing conforms to the dug-in bog terrain (the flat brown
 * ellipse discs floated over the bowls — gone). The slough ramp backed off
 * the water + steepened into the belly-flop board (lip ~30 shy of shore).
 *
 * GRAPHICS PHASE 2 — COHESION & DEPTH: one shader injection (applyAtmosphere,
 * via onBeforeCompile on every Lambert surface) does two "one world" jobs at
 * once. DUST: near-ground fragments drift toward warm prairie dust + up-faces
 * sun-bleach — decades of wind, nothing freshly painted, everything belongs.
 * GROUND HAZE: low fragments fade toward the horizon colour with distance, so
 * fields feel huge and headlights read at night. Colours ride shared uniforms
 * updated from the day cycle (heavier haze at night); one program variant for
 * all. Lights stay excluded so they still bloom. (SSAO is the remaining
 * phase-2 depth item — deferred: heavier vendoring + a look to eyeball.)
 *
 * GRAPHICS PHASE 1 — THE PAINTED WORLD: the flat single-colour materials
 * that read as "coloured plastic" now carry hand-painted grain. A
 * procedural texture library (woodTex/barnTex/dirtTex/metalTex/stoneTex/
 * groundTex, each drawn once on a near-white base and MULTIPLIED over the
 * existing tint) feeds role materials (woodMat/barnMat/dirtMat/metalMat/
 * stoneMat) wired into the buildings, fences and ground. The prairie
 * palette shifted DRY OLIVE (grass is never emerald) with warmer ochre
 * roads, shadows tinted toward violet (ambient), and a subtle color-grade
 * ShaderPass after bloom (lift shadows to violet, warm-by-day/cool-by-
 * night tint, gentle saturation) unifies the whole frame. Model: "carved
 * from painted basswood, dusted with prairie, lit warm in a museum case."
 *
 * GRAPHICS PHASE D — BLOOM + EMISSIVE: the scene renders through an
 * EffectComposer (vendored r128 postprocessing, assets/js/vendor/
 * three-r128-postfx.js, loaded by back-quarter.js) with an
 * UnrealBloomPass, so the lights finally GLOW: windows, lanterns, lamp
 * heads, marquee bulbs, the flare, the fire, the headlights, screens'
 * titles, tokens, boost pads, sun/moon and the fireworks. Light-source
 * materials are pushed past 1.0 via glow() (HDR colours) so they cross
 * the bloom threshold after ACES; knobs live in BLOOM up top. Bloom is
 * WebGL2-only (a multisample target keeps the antialiasing the composer
 * would otherwise lose); WebGL1 or a missing postfx bundle falls back
 * to the direct render, exactly the phase-C look.
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
 * FILL THE FARM: a CREEK flows out of the slough, fords two roads and
 * exits the south fence (painted into the terrain like the roads;
 * shallow wade with splashes + drag). THE BOG — a long rutted wallow
 * in the south field with mud humps, ruts and a sign: mudbogging
 * country. The mud pit got the same face-lift (ruts + sheen). A
 * FIREPIT HANGOUT east of the estate: gravel pad, stone ring, LIVE
 * flickering fire + warm light, log benches, a firewood stack, and
 * the CAMPER parked beside it. An open STOCK BARN in the pasture
 * (three walls + roof — the herd and the buggy wander in), 64
 * instanced shrubs across the open quarter, the church grounded
 * (it floated where its old base mound used to be), and the cow
 * finally moos like a cow (new sample, credited).
 *
 * SOUND PASS 2 — REAL RECORDINGS + POSITIONAL AUDIO (Thomas's "1980s
 * driving game" review, addressed): ten real samples (public domain /
 * CC0 off Wikimedia Commons + one CC BY-SA mallard — see
 * assets/audio/CREDITS.md), lazy-fetched only when sound goes ON
 * (~340 KB total), every caller falling back to its synth when a
 * buffer is missing. A diesel-engine loop rides under the (ducked)
 * synth engine, rate-bent with the revs. PannerNode positional audio:
 * the listener rides the buggy; hens cluck FROM the coop, applause
 * drifts FROM the grandstands, the windmill creaks FROM the shore,
 * the pumpjack clanks FROM the unit. Real squawk slices when you
 * scatter chickens, mallard quacks off the slough, bathtub-splash
 * landings, cows moo / horses whinny as you pass, Trumac's pitched-
 * down moo, applause layered into the cheers — and the ROOSTER CROWS
 * AT SUNRISE, every dawn of the 8-minute day.
 *
 * FEEL + FARM SHUFFLE: gravity +15% again (476); BIG AIR pays turbo on
 * any clean landing over 0.85s aloft (scales with hang-time, caps at
 * 1300ms). Corner light towers moved OUTSIDE the ring, tripled in
 * height with double-size heads + longer-throw lamps. The chicken coop
 * moves to the empty NE corner at 2× (the corner token now lives inside
 * the pen); hens +5%, and the first bird out is a BLACK ROOSTER (tail
 * fan, tall comb). The old circular blob shadow under the buggy is gone
 * — the real moonlight shadow does the grounding.
 *
 * DAY/NIGHT + TRUE POSE: an 8-minute Minecraft-style day cycle (starts
 * at dusk) — one factor drives sky colours, fog, light intensities,
 * stars, and a sun/moon riding opposite ends of the arc; night is
 * dimmer than before (it read like daylight). The buggy now aligns to
 * the terrain as a WHOLE — wheels and axles ride the ground pitch and
 * camber (was body-only, wheels stayed flat), camber roll sign fixed
 * (it leaned away from the pond bank), body keeps lean/squat/dip on
 * top. Gravity +15% again. Billboards ride tall legs (panel ~246 up)
 * so trees never obstruct them. Church's decorative base mound removed
 * (visual-only — the buggy drove inside it at 2.4×).
 *
 * SCALE-UP PASS — the world grows into the low camera: chase cam drops
 * (54 up, looking 14 high — buildings/flags read at real height). The
 * farmhouse becomes the ESTATE: two storeys, wraparound patio on two
 * sides, second-floor balcony, garden beds + shrubs (scale 3.0);
 * cookshack 2.8, shed 2.9, church 2.4, treehouses 2.2 with their
 * windbreak cleared 150 around them so the kids' houses stand alone.
 * Windmill 2.5× and moved onto the slough shore; pumpjack 2.5×; flare
 * stack 25% taller. Flags double with poles set BEHIND the panels.
 * NW forest doubled + two new hills under it; six big poplars planted.
 * Prompt ranges now scale with footprint. Fullscreen-button text bug
 * hardened + documented in style.css (color + -webkit-text-fill-color,
 * repeated for :fullscreen).
 *
 * HEARTLAND PASS — gravity up (jumps were too airy), speed-up pads +
 * two inverted dimple swales on the track, six new track tokens, and
 * the token hunt now RESETS at the restack pad. The world grows its
 * heritage: a Dutch WINDMILL (sails turning, tulip rows) on the slough
 * shore linking to /lakemans, old-country FLAGS on poles above every
 * drive-in sign (mixed lines fly two), cattails on the northeast shore,
 * five ducks paddling the slough, two horses in the pastures, and an
 * oilpatch corner — nodding PUMPJACK + flickering flare stack.
 *
 * SECTION ROAD P4 — REAL JUMPS: the placeholder gaussian mounds on the
 * track become proper MX features — shaped dirt with steep take-off
 * faces, flat decks and landing faces (tabletops), plus a kicker. Each
 * is symmetric enough to hit fair in either lap direction; roll them or
 * send them. Physics (jumpAt/jumpProfile) and mesh (buildJumps) share
 * one profile so the buggy rides exactly what it sees. Whoops stay
 * rounded. The farm-road RAMPS and the 3 farm mounds are untouched.
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
		{ id: 'farmhouse', name: 'the farmhouse', x: 1211, y: 588, w: 130, h: 80, scale: 3.0,
		  href: '/thomas', build: 'farmhouse', signTo: { x: 1435, y: 700 },
		  prompt: 'The farmhouse — step inside, this is me' },
		{ id: 'cookshack', name: 'the cookshack', x: 2240, y: 462, w: 70, h: 50, scale: 2.8,
		  href: '/about', build: 'cookshack', signTo: { x: 2205, y: 578 },
		  prompt: 'The cookshack — my life on the line' },
		{ id: 'medic', name: 'the medic hut', x: 2960, y: 810, w: 64, h: 48, scale: 1.5,
		  href: '/hcs', build: 'medic', signTo: { x: 3045, y: 753 },
		  prompt: 'The medic hut — one of fewer than fifty' },
		{ id: 'church', name: 'the church', x: 693, y: 1302, w: 70, h: 90, scale: 2.4,
		  href: '/heritage', build: 'church', signTo: { x: 875, y: 1383 },
		  prompt: 'The church on the hill — eight family lines' },
		{ id: 'th1', name: 'Patience', x: 1435, y: 1036, w: 26, h: 26, scale: 2.2,
		  href: '/patience', build: 'treehouse', kidColor: 0xe86ba7, kidCss: '#ff9ecb',
		  prompt: 'Patience’s treehouse — the family key opens it' },
		{ id: 'th2', name: 'Daniel', x: 1631, y: 1281, w: 26, h: 26, scale: 2.2,
		  href: '/daniel', build: 'treehouse', kidColor: 0x4f9fd8, kidCss: '#8fd0ff',
		  prompt: 'Daniel’s treehouse — the family key opens it' },
		{ id: 'th3', name: 'Faith', x: 1873, y: 1505, w: 26, h: 26, scale: 2.2,
		  href: '/faith', build: 'treehouse', kidColor: 0x9a7fd8, kidCss: '#cbb2ff',
		  prompt: 'Faith’s treehouse — the family key opens it' },
		{ id: 'radio', name: 'the Bare Your Rare tower', x: 4095, y: 1260, w: 30, h: 30, scale: 1.45,
		  href: 'https://bareyourrare.org', external: true, build: 'mast', signTo: { x: 3955, y: 1295 },
		  prompt: 'The Bare Your Rare tower — rare disorders, worn proud · Enter visits bareyourrare.org' },
		{ id: 'barn', name: 'the big red barn', x: 3539, y: 1435, w: 120, h: 80, scale: 3.2,
		  href: null, build: 'barn', signTo: { x: 3325, y: 1505 },
		  prompt: 'The big red barn — pull her right inside (the arcade moves in soon)' },
		{ id: 'shed', name: 'the old shed', x: 651, y: 1932, w: 60, h: 44, scale: 2.9,
		  href: null, build: 'shed', signTo: { x: 753, y: 1838 },
		  prompt: 'The shed is padlocked… but a drawer in the house opens' },
		{ id: 'mailbox', name: 'the mailbox', x: 2083, y: 2450, w: 10, h: 10,
		  href: null, build: 'mailbox',
		  prompt: 'Fresh mail soon — “recently added” lands here' }
	];

	// The eight family lines: big marquee billboards OUTSIDE the section
	// road, facing the racing — four along the north straight (flanking
	// the grandstands), two each on the west and east sides.
	// `flags` = old-country flags flown on poles above each sign; mixed
	// heritages fly both (per the long-reads: Docherty Ireland→Scotland,
	// Steinke Germany-in-Poland).
	var LINES = [
		{ name: 'The Cheesmans', href: '/cheesmans', x: 600, z: -330, face: 1, flags: [ 'en' ] },
		{ name: 'The Dochertys', href: '/dochertys', x: 1250, z: -330, face: 1, flags: [ 'ie', 'sct' ] },
		{ name: 'The Haistes', href: '/haistes', x: 3230, z: -330, face: 1, flags: [ 'en' ] },
		{ name: 'The Lakemans', href: '/lakemans', x: 3880, z: -330, face: 1, flags: [ 'nl' ] },
		{ name: 'The Rycrofts', href: '/rycrofts', x: -330, z: 800, face: 2, flags: [ 'en' ] },
		{ name: 'The McIvers', href: '/mcivers', x: -330, z: 1700, face: 2, flags: [ 'sct' ] },
		{ name: 'The Verbooms', href: '/verbooms', x: 4810, z: 800, face: 3, flags: [ 'nl' ] },
		{ name: 'The Steinkes', href: '/steinkes', x: 4810, z: 1700, face: 3, flags: [ 'de', 'pl' ] }
	];
	// tiny canvas flags (cached by code)
	var flagTexCache = {};
	function flagTexture( THREE, code ) {
		if ( flagTexCache[ code ] ) return flagTexCache[ code ];
		var c = document.createElement( 'canvas' );
		c.width = 48; c.height = 32;
		var x = c.getContext( '2d' );
		function bands( cols, horiz ) {
			cols.forEach( function ( col, i ) {
				x.fillStyle = col;
				if ( horiz ) x.fillRect( 0, i * 32 / cols.length, 48, 32 / cols.length );
				else x.fillRect( i * 48 / cols.length, 0, 48 / cols.length, 32 );
			} );
		}
		if ( code === 'en' ) {
			x.fillStyle = '#f4f4f0'; x.fillRect( 0, 0, 48, 32 );
			x.fillStyle = '#c8102e'; x.fillRect( 20, 0, 8, 32 ); x.fillRect( 0, 12, 48, 8 );
		} else if ( code === 'sct' ) {
			x.fillStyle = '#0057a8'; x.fillRect( 0, 0, 48, 32 );
			x.strokeStyle = '#f4f4f0'; x.lineWidth = 6;
			x.beginPath(); x.moveTo( 0, 0 ); x.lineTo( 48, 32 ); x.moveTo( 48, 0 ); x.lineTo( 0, 32 ); x.stroke();
		} else if ( code === 'ie' ) {
			bands( [ '#169b62', '#f4f4f0', '#ff883e' ], false );
		} else if ( code === 'nl' ) {
			bands( [ '#ae1c28', '#f4f4f0', '#21468b' ], true );
		} else if ( code === 'de' ) {
			bands( [ '#1a1a1a', '#dd0000', '#ffce00' ], true );
		} else { // pl
			bands( [ '#f4f4f0', '#dc143c' ], true );
		}
		flagTexCache[ code ] = new THREE.CanvasTexture( c );
		return flagTexCache[ code ];
	}

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
		// rolling ground under the doubled northwest forest
		{ x: 900, z: 350, a: 22, r: 220 },
		{ x: 350, z: 900, a: 20, r: 200 },
		// the slough basin — one deep bowl under the big pond (enlarged
		// with the pond itself)
		{ x: 3730, z: 1000, a: -30, r: 560 },
		{ x: 3955, z: 1135, a: -14, r: 320 },
		{ x: 3535, z: 850, a: -12, r: 320 },
		// inverted dimples — two swales ON the section road (line-choice
		// hazards: they scrub speed if you take the lazy line)
		{ x: 4050, z: 2690, a: -13, r: 130 },
		{ x: -170, z: 990, a: -12, r: 120 }
	];
	// ONE pond now — an irregular slough, deep enough that the buggy floats
	// (see control()/render()). The blob outline is pondR(θ).
	var POND = { x: 3730, z: 1000, depth: 20, waterY: 0 };
	function pondR( th ) {
		// 1.5× linear (~2.25× the water) — as big as the neighbourhood
		// allows before the mast, barn and mill start flooding
		return 315 + 82 * Math.sin( 2 * th + 1.3 ) + 52 * Math.sin( 3 * th + 0.6 ) + 30 * Math.sin( 5 * th + 2.1 );
	}
	function inPond( x, z ) {
		var dx = x - POND.x, dz = z - POND.z;
		if ( dx * dx + dz * dz > 240100 ) return false; // beyond the widest lobe
		return Math.hypot( dx, dz ) < pondR( Math.atan2( dz, dx ) ) - 3;
	}
	// the barnyard: chicken coop filling the empty northeast corner, pig
	// pen with a mud pit on the hillside east of the north road
	var COOP = { x: 4130, z: 330 };
	// the pig pen lives ON the bog now — open south side spills straight
	// into the mud pit, which overlaps the bog's edge (all connected)
	var PIGPEN = { x: 1908, z: 2095 };
	var MUD = { x: 1885, z: 2185, r: 75 };
	// THE BOG — 3× long: a wallow RUN arcing across the whole south field
	// (extended west; the east tip stays clear of the gate road)
	var BOG = { x: 1689, z: 2135, rx: 510, rz: 180, rot: 0.5 };
	// the bog is DUG IN: a chain of soft bowls along its axis, baked into
	// hillsAt so the ground mesh, the physics and the mud all agree —
	// you drop in, wallow through the goo, and climb out the far side
	var BOG_BOWLS = [
		{ x: 1303, z: 1924, a: -5, r: 46 },
		{ x: 1412, z: 1984, a: -6, r: 50 },
		{ x: 1522, z: 2044, a: -5, r: 44 },
		{ x: 1632, z: 2104, a: -6.5, r: 52 },
		{ x: 1742, z: 2164, a: -5.5, r: 46 },
		{ x: 1851, z: 2224, a: -6, r: 50 },
		{ x: 1961, z: 2284, a: -5, r: 44 },
		{ x: 2071, z: 2344, a: -6.5, r: 52 },
		// side lobes — the run widens into pockets you can dip through
		{ x: 1443, z: 2064, a: -5.5, r: 46 },
		{ x: 1759, z: 2111, a: -5, r: 44 },
		{ x: 1882, z: 2303, a: -6, r: 48 },
		// the widened marsh (3×) — outer pockets both sides of the run
		{ x: 1350, z: 2090, a: -5, r: 48 },
		{ x: 1560, z: 2280, a: -6, r: 52 },
		{ x: 1690, z: 1975, a: -5.5, r: 48 },
		{ x: 1990, z: 2170, a: -5.5, r: 46 }
	];
	function inMudArea( x, z, pad ) {
		pad = pad || 0;
		if ( Math.hypot( x - MUD.x, z - MUD.z ) < MUD.r + pad ) return true;
		var dx = x - BOG.x, dz = z - BOG.z;
		var ca = Math.cos( -BOG.rot ), sa = Math.sin( -BOG.rot );
		var ex = ( dx * ca - dz * sa ) / ( BOG.rx + pad );
		var ez = ( dx * sa + dz * ca ) / ( BOG.rz + pad );
		return ex * ex + ez * ez < 1;
	}
	// THE CREEK — flows out of the slough, fords two roads, exits the
	// south fence. Painted into the ground like the roads; shallow wade.
	var CREEK = [
		{ x: 3520, y: 1090 }, { x: 3450, y: 1250 }, { x: 3250, y: 1500 },
		{ x: 3150, y: 1800 }, { x: 3220, y: 2100 }, { x: 3050, y: 2350 },
		{ x: 2950, y: 2520 }
	];
	function nearCreek( x, z, d ) {
		for ( var i = 0; i < CREEK.length - 1; i++ ) {
			if ( distToSeg( x, z, CREEK[ i ], CREEK[ i + 1 ] ) < d ) return true;
		}
		return false;
	}

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
		{ x: 1211, z: 588, ri: 260, ro: 460 },
		{ x: 2240, z: 462, ri: 170, ro: 340 },
		{ x: 2960, z: 810, ri: 120, ro: 260 }, // the medic hut (the elevator's old pad retired with it)
		{ x: 693, z: 1302, ri: 230, ro: 400 },
		{ x: 3539, z: 1435, ri: 210, ro: 400 }, // the barn at 3.2× needs a flat floor wall-to-wall
		{ x: 651, z: 1932, ri: 160, ro: 330 },
		{ x: 4095, z: 1260, ri: 88, ro: 228 },
		{ x: 2240, z: 2432, ri: 245, ro: 455 },
		{ x: 1694, z: 1284, ri: 560, ro: 750 },
		{ x: 3850, z: 1802, ri: 88, ro: 210 },
		{ x: 2730, z: 630, ri: 70, ro: 160 }, // the old pull-off (tractor spawn)
		{ x: 4135, z: 335, ri: 100, ro: 210 }, // chicken coop yard (NE corner)
		{ x: 1908, z: 2095, ri: 130, ro: 230 }, // pig pen — moved onto the bog
		{ x: 1600, z: 795, ri: 130, ro: 240 }, // the firepit hangout + camper
		{ x: 2900, z: 1550, ri: 130, ro: 260 } // the stock barn yard
	];
	// Tabletop mounds ON the roads — smooth launches that scale with speed.
	// The section-road rhythm sections + whoops are generated onto this array
	// at boot by generateTrackJumps(); these three are the farm-road jumps.
	var MOUNDS = [
		// the three big open-quarter jumps — piled HAY you launch off
		{ x: 2695, z: 1724, a: 32, r: 72, hay: true },
		{ x: 2205, z: 788, a: 28, r: 70, hay: true },
		{ x: 3325, z: 2100, a: 34, r: 86, hay: true },
		// mud humps inside the bog — rutted, lumpy bogging ground, spread
		// down the full 3× run
		{ x: 1860, z: 2210, a: 5, r: 34, mud: true },
		{ x: 1960, z: 2290, a: 4, r: 30, mud: true },
		{ x: 1800, z: 2290, a: 4.5, r: 30, mud: true },
		{ x: 1990, z: 2200, a: 4, r: 28, mud: true },
		{ x: 1620, z: 2075, a: 5, r: 32, mud: true },
		{ x: 1495, z: 2015, a: 4, r: 28, mud: true },
		{ x: 1365, z: 1950, a: 4.5, r: 30, mud: true }
	];
	// Real MX jumps on the section road: shaped features with steep takeoff
	// faces, flat decks and landing faces — not gaussian bumps. Each is
	// symmetric enough to hit fair in EITHER lap direction. `kind`:
	//   'table' — up-face → flat deck → down-face (roll it or send it)
	//   'kick'  — up-face → short steep drop (pure launch)
	// Profile + physics: jumpProfile()/jumpAt(); mesh: buildJumps().
	var JUMPS = [];
	var trackJumpsBuilt = false;
	function addJump( x, z, dir, kind, o ) {
		var dl = Math.hypot( dir.x, dir.z ) || 1;
		var j = { x: x, z: z, kind: kind, w: o.w || 98, h: o.h || 26,
			up: o.up || 50, flat: o.flat || 32, down: o.down || 30,
			cx: dir.x / dl, cz: dir.z / dl };
		j.len = kind === 'table' ? j.up + j.flat + j.down : j.up + j.down;
		JUMPS.push( j );
	}
	function generateTrackJumps() {
		if ( trackJumpsBuilt ) return;
		trackJumpsBuilt = true;
		var X = { x: 1, z: 0 }, Z = { x: 0, z: 1 };
		// SOUTH straight past the start line — two floaty tables building to
		// a steep SKY kicker (mix of big-air distance and big-height shots)
		addJump( 2700, 2690, X, 'table', { h: 24, up: 52, flat: 42, down: 42 } );
		addJump( 3200, 2690, X, 'table', { h: 30, up: 54, flat: 24, down: 28 } );
		addJump( 3760, 2690, X, 'kick', { h: 46, up: 42, down: 24 } ); // SKY shot
		// EAST straight
		addJump( 4650, 1820, Z, 'table', { h: 30, up: 54, flat: 22, down: 28 } );
		addJump( 4650, 1240, Z, 'table', { h: 24, up: 52, flat: 38, down: 40 } );
		addJump( 4650, 640, Z, 'kick', { h: 44, up: 46, down: 18 } ); // SKY before the NE berm
		// WEST straight
		addJump( -170, 700, Z, 'table', { h: 30, up: 54, flat: 22, down: 28 } );
		addJump( -170, 1280, Z, 'table', { h: 26, up: 52, flat: 34, down: 38 } );
		addJump( -170, 1860, Z, 'table', { h: 36, up: 56, flat: 18, down: 26 } );
		// NORTH straight: SPEED BUMPS in front of the grandstands — a tight
		// low washboard (the old tall whoops read as random mounds), with a
		// gap where the MEGA ramp stands
		for ( var nx = 3550; nx >= 1050; nx -= 90 ) {
			if ( nx > 1980 && nx < 2520 ) continue; // the MEGA ramp + its pad
			MOUNDS.push( { x: nx, z: -170, a: 6, r: 22 } );
		}
	}
	// Kicker ramps — a steepening face that ends in a lip. The launch is
	// terrain-honest (vertical speed = climb rate at the lip), so speed
	// matters: hit them flat-out, hit them boosted.
	var RAMPS = [
		{ x: 2180, z: 2010, dir: { x: 30, z: -380 }, w: 70, l: 110, h: 28 },   // entry straight — the pad feeds it
		{ x: 2835, z: 613, dir: { x: 420, z: 280 }, w: 70, l: 120, h: 34 },    // cookshack → medic-hut run
		{ x: 3283, z: 1210, dir: { x: 70, z: 455 }, w: 70, l: 120, h: 36 },    // medic hut → barn run (moved off the barn wall)
		{ x: 1242, z: 1698, dir: { x: -315, z: -140 }, w: 70, l: 110, h: 30 }, // west run below the compound
		{ x: 3270, z: 990, dir: { x: 1, z: 0 }, w: 76, l: 90, h: 34 }          // the belly-flop board — backed off the water + steepened, lip ~30 shy of the shore
	];
	RAMPS.forEach( function ( r ) {
		var dl = Math.hypot( r.dir.x, r.dir.z ) || 1;
		r.cx = r.dir.x / dl;
		r.cz = r.dir.z / dl;
	} );
	// THE MEGA RAMP: a gold boost pad on the north straight feeds a
	// near-vertical face between the grandstands. The launch itself is
	// SCRIPTED in control() (terrain can't express a wall); a clean landing
	// pays huge turbo + a wheelie + fireworks in front of the crowd.
	var MEGA = { x: 2240, z: -170, padX: 2470, w: 116, h: 96 };
	var PADS = [
		{ x: 2188, z: 2065 }, { x: 2258, z: 1155 },
		{ x: 2625, z: 1750 }, { x: 3693, z: 1960 },
		// speed-up pads on the section road, one per straight, chevrons
		// pointing the counterclockwise racing line
		{ x: 2420, z: 2690, rot: -Math.PI / 2 },
		{ x: 4650, z: 950, rot: 0 },
		{ x: 750, z: -170, rot: Math.PI / 2 },
		{ x: -170, z: 470, rot: Math.PI },
		// the MEGA pad — gold, bigger boost, feeds the mega ramp
		{ x: MEGA.padX, z: -170, rot: Math.PI / 2, mega: true }
	];
	// 21 COINS — one per million bitcoin that will ever exist ;) — real ₿
	// faces now. Curated from the old 30; store key bumped to v2 so old
	// saves start the new hunt fresh. APPEND ONLY from here (saved indices
	// must hold).
	var TOKENS = [
		{ x: 350, z: 350 }, { x: 4200, z: 315 }, { x: 315, z: 2188 },
		{ x: 4165, z: 2310 }, { x: 2240, z: 210 }, { x: 3325, z: 263 },
		{ x: 4288, z: 1225 }, { x: 175, z: 1225 }, { x: 2888, z: 2363 },
		{ x: 788, z: 1663 }, { x: 2625, z: 1225 }, { x: 613, z: 963 },
		{ x: 2695, z: 1724, air: true }, { x: 2205, z: 788, air: true },
		{ x: 2198, z: 1780, air: true, y: 70 },
		{ x: 3319, z: 1448, air: true, y: 75 },
		{ x: 2000, z: 2690 }, { x: 4650, z: 1500 }, { x: 2240, z: -170 },
		{ x: 3760, z: 2690, air: true, y: 40 },
		{ x: 4650, z: 640, air: true, y: 40 }
	];

	// TOUCH: phones + tablets get the on-screen controls; LITE (small
	// touch screens, i.e. phones) additionally drops bloom, pixel ratio
	// and shadow resolution so the farm runs instead of slideshows
	var TOUCH = ( 'ontouchstart' in window ) ||
		( window.matchMedia && window.matchMedia( '(pointer: coarse)' ).matches );
	var LITE = TOUCH && Math.min( window.screen.width, window.screen.height ) < 820;
	var touchPad = { active: false, id: null, ox: 0, oy: 0, steer: 0, throttle: 0 };
	var touchUi = null;
	var stage, hudEl, chipEl;
	var renderer, scene, camera, clock;
	var composer = null, bloomPass = null; // bloom stack — null renders plain
	var gradePass = null, dayFactor = 1; // color grade + time-of-day (1=day)
	var atmo = null; // shared prairie-dust + ground-haze uniforms (phase 2)
	var waterMat = null; // the slough's animated ripple shader
	var Matter, engine, buggyBody;
	var buggyGroup, chassisGroup, wheels = [];
	var frontSteer = []; // the front wheels' yaw pivots — they steer visibly
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
	var sampleBufs = {}, samplesLoading = false, posStarted = {}, engSample = null, dnPrevElev = null;
	var soundBtn = null;
	var tokens = [], tokenCount = 0, tokenFound = 0;
	var airborne = false, vAlt = 0, worldY = 0, prevGy = 0, climb = 0, chassisDip = 0;
	var chassisVel = 0, bounceAir = false; // suspension spring + rebound-hop state
	var groupPitchS = 0, groupRollS = 0; // smoothed whole-buggy terrain alignment
	var airTime = 0; // seconds aloft — big air pays boost on the landing
	var airPitch = 0, jumpCooldown = 0;
	var boostT = 0, padCooldown = [];
	var megaAir = false, megaCd = 0, wheelieT = 0; // the MEGA ramp state
	var inWater = false, inMud = false, inCreek = false;
	var slip = 0; // wheelspin 0..1 — throttle on a soft surface, eased
	var chickens = [], pigs = [];
	var lap = { active: false, t: 0, dir: 0, next: 0, rec: [] };
	// structured racing: nothing times until you ARM a race at the line
	// (1 = single lap, 3 = three-lap race, T = rolling time trial, X quits)
	var race = { mode: null, armed: null, lapNum: 0, laps: [] };
	// the FARM RECORD — the fastest visitor ever, fetched from WP REST and
	// raced as a fourth (cyan) ghost; beat it and your run takes the crown
	var farmGhost = null, farmGhostState = 0; // 0 unfetched · 1 fetching · 2 done
	var ghosts = [], ghostStore = null, prevSX = 0, lastHudTenth = -1;
	var skyGroup = null, moonLight = null, moonTarget = null;
	var ambLight = null, hemiLight = null;
	var skyMatRef = null, starMatRef = null, sunBall = null, sunHalo = null, moonBall = null, moonHalo = null;
	var DAY_CYCLE = 480; // seconds for a full day+night, Minecraft-style
	var DAY_START = 0.2; // open mid-morning: ~2.5 min of daylight, then the
	                     // farm rolls into its sunset — the show, not the start
	// Bloom knobs. Threshold is POST-tone-mapping luminance: ACES lands the
	// day sky around ~0.6 and moonlit ground far lower, so 0.72 catches only
	// the boosted glow() materials, the sun/moon discs and the fireworks.
	var BLOOM = { strength: 0.55, radius: 0.4, threshold: 0.72 };
	var windmillBlades = null, pumpBeam = null, pumpCrank = null, flareFlame = null, flareLight = null;
	var ducks = [];
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
		// the bog's dug-in bowls (bbox early-out keeps this free elsewhere)
		if ( x > 1220 && x < 2160 && z > 1770 && z < 2470 ) {
			for ( var bi = 0; bi < BOG_BOWLS.length; bi++ ) y += gauss( x, z, BOG_BOWLS[ bi ] );
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
	// normalized 0..1 height along a jump's axis (t in [0, len])
	function jumpProfile( j, t ) {
		if ( t <= 0 || t >= j.len ) return 0;
		if ( j.kind === 'table' ) {
			if ( t < j.up ) return Math.pow( t / j.up, 1.5 );               // steep take-off
			if ( t < j.up + j.flat ) return 1;                              // flat deck
			return Math.pow( 1 - ( t - j.up - j.flat ) / j.down, 1.4 );     // landing face
		}
		if ( t < j.up ) return Math.pow( t / j.up, 1.5 );
		return 1 - ( t - j.up ) / j.down;                                  // short steep drop
	}
	function jumpAt( x, z ) {
		if ( ! nearTrack( x, z ) ) return 0; // jumps live on the section road
		var y = 0;
		for ( var i = 0; i < JUMPS.length; i++ ) {
			var j = JUMPS[ i ];
			var dx = x - j.x, dz = z - j.z;
			var t = dx * j.cx + dz * j.cz + j.len / 2; // (x,z) is the jump's centre
			if ( t <= 0 || t >= j.len ) continue;
			var sd = Math.abs( dx * -j.cz + dz * j.cx );
			if ( sd >= j.w / 2 ) continue;
			y += j.h * jumpProfile( j, t ) * Math.min( 1, ( j.w / 2 - sd ) / 8 );
		}
		return y;
	}
	function heightAt( x, z ) {
		var y = hillsAt( x, z );
		for ( var i = 0; i < MOUNDS.length; i++ ) y += gauss( x, z, MOUNDS[ i ] );
		return y + rampAt( x, z ) + bermAt( x, z ) + jumpAt( x, z );
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
		skyMatRef = skyMat;

		// a FINER field: twice the stars at nearly half the size — dust of
		// stars, not chunky squares
		var N = 1800, sp = new Float32Array( N * 3 );
		for ( var i = 0; i < N; i++ ) {
			var y = Math.random() * 0.9 + 0.08;      // height fraction (upper sky)
			var s = Math.sqrt( 1 - y * y ), a = Math.random() * Math.PI * 2, r = 6200;
			sp[ i * 3 ] = r * s * Math.cos( a );
			sp[ i * 3 + 1 ] = r * y;
			sp[ i * 3 + 2 ] = r * s * Math.sin( a );
		}
		var starGeo = new THREE.BufferGeometry();
		starGeo.setAttribute( 'position', new THREE.BufferAttribute( sp, 3 ) );
		starMatRef = new THREE.PointsMaterial( {
			color: 0xcfe0ff, size: 4, sizeAttenuation: false, fog: false,
			transparent: true, opacity: 0.9
		} );
		skyGroup.add( new THREE.Points( starGeo, starMatRef ) );

		// the moon and the sun ride opposite ends of the day arc
		moonBall = new THREE.Mesh(
			new THREE.SphereGeometry( 150, 24, 24 ),
			new THREE.MeshBasicMaterial( { color: glow( THREE, 0xeef4ff, 1.3 ), fog: false } )
		);
		skyGroup.add( moonBall );
		moonHalo = new THREE.Sprite( new THREE.SpriteMaterial( {
			map: haloTexture( THREE ), color: 0xbcd2f4, transparent: true, opacity: 0.55,
			blending: THREE.AdditiveBlending, depthWrite: false, fog: false
		} ) );
		moonHalo.scale.set( 1400, 1400, 1 );
		skyGroup.add( moonHalo );
		sunBall = new THREE.Mesh(
			new THREE.SphereGeometry( 210, 24, 24 ),
			new THREE.MeshBasicMaterial( { color: glow( THREE, 0xfff3d0, 1.5 ), fog: false } )
		);
		skyGroup.add( sunBall );
		sunHalo = new THREE.Sprite( new THREE.SpriteMaterial( {
			map: haloTexture( THREE ), color: 0xffe2a8, transparent: true, opacity: 0,
			blending: THREE.AdditiveBlending, depthWrite: false, fog: false
		} ) );
		sunHalo.scale.set( 2200, 2200, 1 );
		skyGroup.add( sunHalo );

		scene.add( skyGroup );
	}

	// Minecraft-style day/night: an 8-minute cycle starting at dusk. One
	// factor df (0 = deep night, 1 = full day) drives sky colours, fog,
	// light intensities, stars and the sun/moon positions. Windows, marquee
	// bulbs and the flare keep burning — they're the payoff at night.
	var dnNight = null, dnDay = null;
	function updateDayNight( t ) {
		if ( ! skyMatRef ) return;
		if ( ! dnNight ) {
			dnNight = {
				top: new THREE.Color( 0x05070d ), bot: new THREE.Color( 0x1b2740 ),
				fog: new THREE.Color( 0x141d2e ), sun: new THREE.Color( 0xaecdf0 )
			};
			dnDay = {
				top: new THREE.Color( 0x3f6fb8 ), bot: new THREE.Color( 0xa9c8e8 ),
				fog: new THREE.Color( 0x93b2d6 ), sun: new THREE.Color( 0xfff2dc )
			};
		}
		var phase = ( t / DAY_CYCLE + DAY_START ) % 1;
		var elev = Math.sin( phase * Math.PI * 2 ); // >0 sun up, <0 moon up
		var df = Math.max( 0, Math.min( 1, ( elev + 0.08 ) / 0.45 ) );
		df = df * df * ( 3 - 2 * df );
		dayFactor = df; // the color grade follows dusk → night

		skyMatRef.uniforms.topCol.value.copy( dnNight.top ).lerp( dnDay.top, df );
		skyMatRef.uniforms.botCol.value.copy( dnNight.bot ).lerp( dnDay.bot, df );
		scene.fog.color.copy( dnNight.fog ).lerp( dnDay.fog, df );
		scene.background.copy( scene.fog.color );
		// ground haze rides the horizon colour; a touch warmer/stronger at dusk
		if ( atmo ) {
			atmo.haze.value.copy( scene.fog.color );
			atmo.amt.value = 0.42 + ( 1 - df ) * 0.18; // heavier at night
		}
		// day stack trimmed — the old sums clipped white walls to paper
		// darker nights (Thomas's call): the moon backs way off and the
		// fills dip with it — the burning windows/lanterns carry the dark
		ambLight.intensity = 0.44 + df * 0.38;
		hemiLight.intensity = 0.26 + df * 0.32;
		moonLight.intensity = 0.34 + df * 0.62;
		moonLight.color.copy( dnNight.sun ).lerp( dnDay.sun, df );
		starMatRef.opacity = 0.9 * ( 1 - df );
		// bloom is a NIGHT instrument: by day the threshold rises past any
		// sunlit wall (the white church was glowing like a lamp) and the
		// strength eases off — lights still bloom at dusk, walls never do
		if ( bloomPass ) {
			bloomPass.threshold = BLOOM.threshold + df * 0.16;
			bloomPass.strength = BLOOM.strength * ( 1 - df * 0.4 );
		}

		// the rooster greets the sunrise from the coop
		if ( dnPrevElev !== null && dnPrevElev <= 0.08 && elev > 0.08 ) {
			playSample( 'rooster', { gain: 0.95, at: { x: COOP.x, z: COOP.z } } );
		}
		dnPrevElev = elev;

		var sx = Math.cos( phase * Math.PI * 2 );
		sunBall.position.set( sx * 4200, elev * 3000 + 150, -2600 );
		sunHalo.position.copy( sunBall.position );
		sunBall.visible = sunHalo.visible = elev > -0.12;
		sunHalo.material.opacity = 0.5 * df;
		moonBall.position.set( -sx * 4200, -elev * 3000 + 150, -2600 );
		moonHalo.position.copy( moonBall.position );
		moonBall.visible = moonHalo.visible = elev < 0.12;
		moonHalo.material.opacity = 0.55 * ( 1 - df );
	}

	function boot( stageEl ) {
		stage = stageEl;
		hudEl = stage.querySelector( '.bq-hud' );
		chipEl = stage.querySelector( '.bq-chip' );
		Matter = window.Matter;
		var THREE = window.THREE;
		// shared atmosphere uniforms — must exist before any material is built
		atmo = {
			haze: { value: new THREE.Color( 0x93b2d6 ) },
			amt: { value: 0.5 },
			cam: { value: new THREE.Vector3() }
		};
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
		renderer.setPixelRatio( LITE ? 1 : Math.min( window.devicePixelRatio || 1, 2 ) );
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

		// ---------- bloom (graphics phase D) ----------
		// Render through an EffectComposer so UnrealBloomPass can pick up the
		// glow() materials. Composer render targets lose the canvas MSAA, so
		// bloom is WebGL2-only (multisample target keeps the AA) — WebGL1
		// falls back to the plain aliasing-free direct render, no bloom.
		if ( ! LITE && THREE.EffectComposer && THREE.UnrealBloomPass &&
			renderer.capabilities.isWebGL2 && THREE.WebGLMultisampleRenderTarget ) {
			var pr = renderer.getPixelRatio();
			var msTarget = new THREE.WebGLMultisampleRenderTarget(
				stage.clientWidth * pr, stage.clientHeight * pr,
				{ format: THREE.RGBAFormat } );
			composer = new THREE.EffectComposer( renderer, msTarget );
			composer.setPixelRatio( pr );
			composer.setSize( stage.clientWidth, stage.clientHeight );
			composer.addPass( new THREE.RenderPass( scene, camera ) );
			bloomPass = new THREE.UnrealBloomPass(
				new THREE.Vector2( stage.clientWidth, stage.clientHeight ),
				BLOOM.strength, BLOOM.radius, BLOOM.threshold );
			composer.addPass( bloomPass );

			// color grade (graphics phase 1): unify the whole frame. Lift the
			// shadows toward violet, warm the mids by day / cool to indigo by
			// night, nudge saturation. Kept SUBTLE — a grade, not a filter.
			if ( THREE.ShaderPass ) {
				gradePass = new THREE.ShaderPass( {
					uniforms: {
						tDiffuse: { value: null },
						night: { value: 0 }
					},
					vertexShader:
						'varying vec2 vUv; void main(){ vUv = uv;' +
						'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }',
					fragmentShader: [
						'uniform sampler2D tDiffuse;',
						'uniform float night;',
						'varying vec2 vUv;',
						'void main(){',
						'  vec4 src = texture2D( tDiffuse, vUv );',
						'  vec3 col = src.rgb;',
						// lift shadows toward violet (more indigo at night)
						'  vec3 lift = mix( vec3(0.016,0.013,0.026), vec3(0.010,0.012,0.034), night );',
						'  col += lift * ( 1.0 - col );',
						// time-of-day tint: warm by day, cool by night
						'  col *= mix( vec3(1.035,1.005,0.955), vec3(0.94,0.975,1.06), night );',
						// gentle saturation lift
						'  float l = dot( col, vec3(0.299,0.587,0.114) );',
						'  col = mix( vec3(l), col, 1.06 );',
						'  gl_FragColor = vec4( clamp( col, 0.0, 1.0 ), src.a );',
						'}'
					].join( '\n' )
				} );
				gradePass.renderToScreen = true;
				composer.addPass( gradePass );
			}
		}

		// shadows shift toward violet (painter's rule), not just darker
		ambLight = new THREE.AmbientLight( 0x2f2748, 0.52 );
		scene.add( ambLight );
		hemiLight = new THREE.HemisphereLight( 0x4a5878, 0x14160f, 0.32 );
		scene.add( hemiLight );
		moonLight = new THREE.DirectionalLight( 0xaecdf0, 0.6 );
		moonLight.position.set( -700, 900, -600 );
		moonLight.castShadow = true;
		moonLight.shadow.mapSize.set( LITE ? 1024 : 2048, LITE ? 1024 : 2048 );
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
			// the creek, painted over everything (fords where it crosses roads)
			var dK = 1e9;
			for ( var ci = 0; ci < CREEK.length - 1; ci++ ) {
				dK = Math.min( dK, distToSeg( vx, vz, CREEK[ ci ], CREEK[ ci + 1 ] ) );
				if ( dK < 14 ) break;
			}
			var crk = dK <= 14 ? 1 : ( dK >= 26 ? 0 : 1 - ( dK - 14 ) / 12 );
			var n = 0.5 + 0.5 * Math.sin( vx * 0.013 ) * Math.sin( vz * 0.017 );
			var lift = 1 + ( vy - 20 ) * 0.006;
			// prairie grass reads DRY OLIVE/SAGE, never emerald: R lifted
			// toward G, blue pulled down (dry wheat), with n giving patchiness
			var fr = ( 0.105 + n * 0.028 ) * lift, fg = ( 0.128 + n * 0.03 ) * lift, fb = ( 0.058 + n * 0.016 ) * lift;
			var rr = 0.325 * lift, rg = 0.245 * lift, rb = 0.152 * lift;
			var cr = fr + ( rr - fr ) * road, cg = fg + ( rg - fg ) * road, cb = fb + ( rb - fb ) * road;
			// racing dirt: a shade redder + more packed than the farm roads
			var kr = 0.335 * lift, kg = 0.245 * lift, kb = 0.175 * lift;
			cr = cr + ( kr - cr ) * trk;
			cg = cg + ( kg - cg ) * trk;
			cb = cb + ( kb - cb ) * trk;
			// the BOG painted into the ground like the creek: wet chocolate
			// mud, darkening toward the bowl bottoms where the goo stands
			if ( inMudArea( vx, vz, 26 ) ) {
				var bogW = inMudArea( vx, vz, 0 ) ? 1 : 0.45;
				var bogDeep = 0;
				for ( var bw2 = 0; bw2 < BOG_BOWLS.length; bw2++ ) bogDeep -= gauss( vx, vz, BOG_BOWLS[ bw2 ] );
				var deep = Math.max( 0, Math.min( 1, bogDeep / 5.5 ) );
				var mr = ( 0.148 - deep * 0.088 ) * lift;
				var mg = ( 0.102 - deep * 0.06 ) * lift;
				var mb = ( 0.063 - deep * 0.036 ) * lift;
				cr = cr + ( mr - cr ) * bogW;
				cg = cg + ( mg - cg ) * bogW;
				cb = cb + ( mb - cb ) * bogW;
			}
			// creek water: cool blue-green, brightest mid-channel
			colors[ vi * 3 ] = cr + ( 0.06 * lift - cr ) * crk;
			colors[ vi * 3 + 1 ] = cg + ( 0.15 * lift - cg ) * crk;
			colors[ vi * 3 + 2 ] = cb + ( 0.19 * lift - cb ) * crk;
		}
		groundGeo.setAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
		groundGeo.computeVertexNormals();
		var groundMesh = new THREE.Mesh( groundGeo,
			applyAtmosphere( new THREE.MeshLambertMaterial( { vertexColors: true, map: groundTex( THREE ) } ), false ) );
		groundMesh.receiveShadow = true;   // catches the buggy + building shadows
		groundMesh.userData.noCast = true; // the ground itself never casts
		scene.add( groundMesh );

		buildPonds( THREE );
		buildMounds( THREE );
		buildRamps( THREE );
		buildJumps( THREE );
		buildMegaRamp( THREE );
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
		// (the farm-edge walls are GONE — the fence rings the OUTSIDE of the
		// section road now, so the track belongs to the quarter and you can
		// roll onto it from anywhere; the outer world walls above still hold)
		LANDMARKS.forEach( function ( lm ) {
			var s = lm.scale || 1;
			if ( lm.build === 'treehouse' ) {
				statics.push( Matter.Bodies.circle( lm.x, lm.y, 13 * s, { isStatic: true } ) );
			} else if ( lm.build === 'mailbox' ) {
				statics.push( Matter.Bodies.circle( lm.x, lm.y, 7, { isStatic: true } ) );
			} else if ( lm.id === 'barn' ) {
				// the DRIVE-IN barn: wall segments matching the mesh (100×66
				// local × scale) with the west-end door gap left open, so
				// the buggy (and one day the horse) can park inside
				var hw = 50 * s, hd = 33 * s, wt = 4 * s, doorHalf = 17 * s;
				statics.push( Matter.Bodies.rectangle( lm.x, lm.y - hd, hw * 2, wt, { isStatic: true } ) );
				statics.push( Matter.Bodies.rectangle( lm.x, lm.y + hd, hw * 2, wt, { isStatic: true } ) );
				statics.push( Matter.Bodies.rectangle( lm.x + hw, lm.y, wt, hd * 2, { isStatic: true } ) );
				var flank = hd - doorHalf;
				statics.push( Matter.Bodies.rectangle( lm.x - hw, lm.y - ( doorHalf + flank / 2 ), wt, flank, { isStatic: true } ) );
				statics.push( Matter.Bodies.rectangle( lm.x - hw, lm.y + ( doorHalf + flank / 2 ), wt, flank, { isStatic: true } ) );
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
		buildPoplars( THREE );
		buildFence( THREE );
		buildForest( THREE );
		buildGateway( THREE );
		buildTrack( THREE );
		buildTrackLights( THREE );
		buildGrandstands( THREE );
		buildDriveIns( THREE );
		buildAnimals( THREE );
		buildCoop( THREE );
		buildChickens( THREE );
		buildPeacock( THREE );
		buildDogs( THREE );
		buildPigPen( THREE );
		buildTractor( THREE );
		buildWindmill( THREE );
		buildCattails( THREE );
		buildDucks( THREE );
		buildPumpjack( THREE );
		buildBog( THREE );
		buildHangout( THREE );
		buildStockBarn( THREE );
		buildGrainBins( THREE );
		buildShrubs( THREE );
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
		initFireworks( THREE );
		initTracks( THREE );
		initSmoke( THREE );
		initMotes( THREE );
		fetchFarmGhost(); // the farm-record lap rides in while you drive
		buildSoundToggle();
		buildTouchUi(); // phones + tablets get the on-screen controls

		LANDMARKS.forEach( function ( lm ) { PROMPTS.push( lm ); } );
		// (the physical family gate is gone — the treehouse pages carry the
		// login gate themselves; the compound is open ground now)
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
				if ( composer ) composer.setSize( w, h );
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
		var txt = ( TOUCH
			? '3D beta · left thumb drives · HOP jumps · buttons do the rest'
			: '3D beta · WASD drives · Space jumps · L/R Shift flips · H honks · Enter steps inside' )
			+ ' · ⛁ ' + tokenFound + '/' + tokenCount;
		if ( lap.active ) {
			txt += ' · ⏱ ' + fmtLap( lap.t );
			if ( race.mode === 'three' ) txt += ' · lap ' + race.lapNum + '/3';
			if ( race.mode === 'trial' ) txt += ' · trial lap ' + ( race.laps.length + 1 );
		} else {
			var st = loadLaps();
			if ( st.best ) txt += ' · 🏁 ' + fmtLap( st.best.t );
			if ( farmGhost && farmGhost.t ) txt += ' · 👻 ' + fmtLap( farmGhost.t );
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
				enter: 'enter', escape: 'esc', h: 'honk',
				'1': 'race1', '3': 'race3', t: 'raceT', x: 'raceX' };
			if ( k in map ) act = map[ k ];
		}
		if ( ! act ) return;
		e.preventDefault();
		var down = ( e.type === 'keydown' );
		keys[ act ] = down;
		if ( down && act === 'esc' ) stage.blur();
		if ( down && act === 'enter' && nearLandmark ) enterLandmark( nearLandmark );
		if ( down && act === 'honk' ) honk();
		if ( down && act === 'race1' ) armRace( 'single' );
		if ( down && act === 'race3' ) armRace( 'three' );
		if ( down && act === 'raceT' ) armRace( 'trial' );
		if ( down && act === 'raceX' ) abandonRace();
	}

	/* ------------------------------------------------------------------ *
	 *  TOUCH CONTROLS — the phone build. A floating joystick owns the
	 *  left half of the screen (analog steer + throttle, appears under
	 *  the thumb); HOP / flip / honk cluster bottom-right; contextual
	 *  ENTER + race buttons show themselves only when they mean something.
	 * ------------------------------------------------------------------ */
	function tbtn( txt, css ) {
		var d = document.createElement( 'div' );
		d.textContent = txt;
		d.setAttribute( 'style',
			'position:absolute;user-select:none;-webkit-user-select:none;' +
			'touch-action:none;display:flex;align-items:center;justify-content:center;' +
			'color:#eaf6f2;font:700 14px/1.1 system-ui,sans-serif;text-align:center;' +
			'background:rgba(8,22,20,.44);border:1.5px solid rgba(126,231,209,.55);' +
			'border-radius:999px;z-index:30;' + css );
		stage.appendChild( d );
		return d;
	}
	function holdKey( el2, act ) {
		el2.addEventListener( 'touchstart', function ( e ) {
			e.preventDefault();
			e.stopPropagation();
			keys[ act ] = true;
			el2.style.background = 'rgba(126,231,209,.35)';
		}, { passive: false } );
		[ 'touchend', 'touchcancel' ].forEach( function ( ev ) {
			el2.addEventListener( ev, function ( e ) {
				e.preventDefault();
				keys[ act ] = false;
				el2.style.background = 'rgba(8,22,20,.44)';
			}, { passive: false } );
		} );
	}
	function tapDo( el2, fn ) {
		el2.addEventListener( 'touchstart', function ( e ) {
			e.preventDefault();
			e.stopPropagation();
			fn();
		}, { passive: false } );
	}
	function buildTouchUi() {
		if ( ! TOUCH ) return;
		stage.style.touchAction = 'none';
		touchUi = {};
		touchUi.base = tbtn( '', 'width:104px;height:104px;left:0;top:0;display:none;opacity:.85;' );
		touchUi.nub = tbtn( '', 'width:44px;height:44px;left:0;top:0;display:none;background:rgba(126,231,209,.4);' );
		touchUi.jump = tbtn( 'HOP', 'width:78px;height:78px;right:16px;bottom:64px;font-size:17px;' );
		holdKey( touchUi.jump, 'jump' );
		touchUi.flipF = tbtn( '⟲ flip', 'width:56px;height:56px;right:106px;bottom:112px;font-size:12px;' );
		holdKey( touchUi.flipF, 'tiltF' );
		touchUi.flipB = tbtn( 'flip ⟳', 'width:56px;height:56px;right:102px;bottom:46px;font-size:12px;' );
		holdKey( touchUi.flipB, 'tiltB' );
		touchUi.honk = tbtn( '📯', 'width:46px;height:46px;right:32px;bottom:156px;font-size:18px;' );
		tapDo( touchUi.honk, function () { honk(); } );
		touchUi.act = tbtn( 'ENTER ↵', 'height:46px;padding:0 18px;right:16px;bottom:216px;display:none;' );
		tapDo( touchUi.act, function () { if ( nearLandmark ) enterLandmark( nearLandmark ); } );
		touchUi.race1 = tbtn( '1 lap', 'height:44px;padding:0 14px;left:50%;bottom:116px;transform:translateX(-135%);display:none;' );
		tapDo( touchUi.race1, function () { armRace( 'single' ); } );
		touchUi.race3 = tbtn( '3 laps', 'height:44px;padding:0 14px;left:50%;bottom:116px;transform:translateX(-50%);display:none;' );
		tapDo( touchUi.race3, function () { armRace( 'three' ); } );
		touchUi.raceT = tbtn( 'trial', 'height:44px;padding:0 14px;left:50%;bottom:116px;transform:translateX(45%);display:none;' );
		tapDo( touchUi.raceT, function () { armRace( 'trial' ); } );
		touchUi.raceX = tbtn( '✕ race', 'height:44px;padding:0 16px;left:16px;bottom:216px;display:none;' );
		tapDo( touchUi.raceX, function () { abandonRace(); } );
		stage.addEventListener( 'touchstart', padStart, { passive: false } );
		stage.addEventListener( 'touchmove', padMove, { passive: false } );
		stage.addEventListener( 'touchend', padEnd, { passive: false } );
		stage.addEventListener( 'touchcancel', padEnd, { passive: false } );
	}
	function padPlace( el2, cx, cy, half ) {
		var r = stage.getBoundingClientRect();
		el2.style.left = ( cx - r.left - half ) + 'px';
		el2.style.top = ( cy - r.top - half ) + 'px';
	}
	function padStart( e ) {
		if ( ! touchUi ) return;
		var r = stage.getBoundingClientRect();
		for ( var i = 0; i < e.changedTouches.length; i++ ) {
			var t2 = e.changedTouches[ i ];
			if ( touchPad.id === null && t2.clientX - r.left < r.width * 0.52 ) {
				e.preventDefault();
				touchPad.id = t2.identifier;
				touchPad.active = true;
				touchPad.ox = t2.clientX;
				touchPad.oy = t2.clientY;
				touchPad.steer = touchPad.throttle = 0;
				padPlace( touchUi.base, t2.clientX, t2.clientY, 52 );
				padPlace( touchUi.nub, t2.clientX, t2.clientY, 22 );
				touchUi.base.style.display = touchUi.nub.style.display = 'flex';
			}
		}
	}
	function padMove( e ) {
		if ( touchPad.id === null ) return;
		for ( var i = 0; i < e.changedTouches.length; i++ ) {
			var t2 = e.changedTouches[ i ];
			if ( t2.identifier !== touchPad.id ) continue;
			e.preventDefault();
			var dx = t2.clientX - touchPad.ox, dy = t2.clientY - touchPad.oy;
			var m = Math.hypot( dx, dy ), R = 54;
			if ( m > R ) { dx *= R / m; dy *= R / m; }
			var sx2 = dx / R, sy2 = -dy / R;
			// dead zone, then analog: up = drive, down = reverse (gentler)
			touchPad.steer = Math.abs( sx2 ) < 0.14 ? 0 : sx2;
			touchPad.throttle = Math.abs( sy2 ) < 0.14 ? 0 : ( sy2 > 0 ? sy2 : sy2 * 0.65 );
			padPlace( touchUi.nub, touchPad.ox + dx, touchPad.oy + dy, 22 );
		}
	}
	function padEnd( e ) {
		if ( ! touchUi ) return;
		for ( var i = 0; i < e.changedTouches.length; i++ ) {
			if ( e.changedTouches[ i ].identifier === touchPad.id ) {
				touchPad.id = null;
				touchPad.active = false;
				touchPad.steer = touchPad.throttle = 0;
				touchUi.base.style.display = touchUi.nub.style.display = 'none';
			}
		}
	}
	function updateTouchUi() {
		if ( ! touchUi ) return;
		touchUi.act.style.display = ( nearLandmark && nearLandmark.href ) ? 'flex' : 'none';
		var atLine = nearLandmark && nearLandmark.id === 'raceline' && ! race.mode && ! race.armed;
		touchUi.race1.style.display = touchUi.race3.style.display =
			touchUi.raceT.style.display = atLine ? 'flex' : 'none';
		touchUi.raceX.style.display = ( race.mode || race.armed ) ? 'flex' : 'none';
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

		// water check (the slough — floating, not wading), mud (pit + bog),
		// and the creek (a shallow wade)
		inWater = ! airborne && inPond( b.position.x, b.position.y );
		inMud = ! airborne && ! inWater && inMudArea( b.position.x, b.position.y );
		inCreek = ! airborne && ! inWater && ! inMud && nearCreek( b.position.x, b.position.y, 15 );
		b.frictionAir = airborne ? 0.02
			: ( inWater ? 0.3 : ( inMud ? 0.2 : ( inCreek ? 0.18 : 0.14 ) ) );

		var throttleTarget = ( keys.up ? 1 : 0 ) - ( keys.down ? 0.65 : 0 );
		steerInput = ( keys.right ? 1 : 0 ) - ( keys.left ? 1 : 0 );
		// the thumb overrides the keys — analog steer + throttle
		if ( touchPad.active ) {
			throttleTarget = touchPad.throttle;
			steerInput = touchPad.steer;
		}
		// SOFTER PEDAL: the throttle eases in and out instead of slamming
		// on/off — acceleration builds and lift-off coasts, no switch feel
		throttleInput += ( throttleTarget - throttleInput ) * 0.055;
		if ( Math.abs( throttleTarget - throttleInput ) < 0.008 ) throttleInput = throttleTarget;

		// eased steering: the wheel winds in and out instead of snapping —
		// softened further (0.11 → 0.075) so the turn-in is gradual
		steerVal += ( steerInput - steerVal ) * 0.075;
		if ( ! steerInput && Math.abs( steerVal ) < 0.02 ) steerVal = 0;
		// REALISTIC TURNING RADIUS: the yaw rate now follows FORWARD SPEED,
		// so she can't tank-pivot in place — she has to be rolling to turn,
		// and eases into the turn over the first bit of roll. Reversing
		// flips the steer sense like a real car backing up. (Air keeps a
		// flat yaw for lining up landings.)
		if ( airborne ) {
			Matter.Body.setAngularVelocity( b, steerVal * 0.026 );
		} else {
			var vYaw = b.velocity;
			var fwdYaw = vYaw.x * heading.x + vYaw.y * heading.y;
			var turnEase = Math.min( 1, Math.hypot( vYaw.x, vYaw.y ) / 4 );
			var maxTurn = ( inMud || inWater ) ? 0.03 : 0.042;
			Matter.Body.setAngularVelocity( b,
				steerVal * maxTurn * turnEase * ( fwdYaw < -0.05 ? -1 : 1 ) );
		}

		var power = boostT > 0 ? 0.0078 : 0.0042;
		if ( airborne ) power *= 0.25;
		// soft ground: the tires SPIN instead of biting — less forward
		// drive (the lost power goes to the wheelspin show below)
		if ( inWater ) power *= 0.4;
		if ( inMud ) power *= 0.55;
		if ( inCreek ) power *= 0.8;
		if ( throttleInput ) {
			Matter.Body.applyForce( b, b.position,
				{ x: heading.x * power * throttleInput * b.mass, y: heading.y * power * throttleInput * b.mass } );
		}

		var v = b.velocity;
		var fwd = v.x * heading.x + v.y * heading.y;
		var lat = { x: -heading.y, y: heading.x };
		var latSpeed = v.x * lat.x + v.y * lat.y;
		// looser — she slides now; on soft ground the tires barely bite,
		// so the sideways slop mostly survives (mud-bog traction)
		var grip = airborne ? 0.995 : ( inWater ? 0.94 : ( inMud ? 0.92 : 0.84 ) );
		// REAR-WHEEL DRIVE: on the gas the rear tires spend their grip on
		// GO, so the tail walks (power oversteer); lift off and she tucks
		// back in. Wheelspin loosens it further.
		if ( ! airborne && throttleInput > 0 ) grip = Math.min( 0.97, grip + 0.05 + slip * 0.04 );
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

		// WHEELSPIN: throttle on a soft surface spins the tires out — worst
		// when she's bogged near-still at full throttle, fading as the
		// ground speed actually comes up. Drives the engine rev, the wheel
		// spin and the roost cones.
		var slipT = 0;
		if ( ! airborne && throttleInput ) {
			var soft = inMud ? 1 : ( inWater ? 0.9 : ( inCreek ? 0.5 : 0 ) );
			slipT = soft * Math.abs( throttleInput ) *
				( 1 - Math.min( 1, sp / ( cap * 1.15 ) ) * 0.65 );
		}
		slip += ( slipT - slip ) * 0.12;

		// RWD tail-kick: power + steering rotates her past what the front
		// wheels bite — a drift on dry dirt, full donuts in a mud/water
		// spin-out (steer at a near-standstill and she comes right around)
		if ( ! airborne && throttleInput > 0 && steerVal ) {
			Matter.Body.setAngularVelocity( b, b.angularVelocity +
				steerVal * throttleInput * ( 0.014 + slip * 0.035 ) * Math.min( 1, sp / 3 + slip ) );
		}

		if ( boostT > 0 ) boostT -= 16.666;
		if ( jumpCooldown > 0 ) jumpCooldown -= 16.666;

		// SPACE: bunny hop (bigger with speed)
		if ( keys.jump && ! airborne && jumpCooldown <= 0 ) {
			jumpCooldown = 300;
			airborne = true;
			vAlt = 80 + sp * 4.5;
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
		if ( megaCd > 0 ) megaCd -= dt;
		if ( wheelieT > 0 ) wheelieT -= dms;
		if ( ! airborne && megaCd <= 0 && ! inWater &&
			Math.abs( rx - MEGA.x ) < 46 && Math.abs( rz - MEGA.z ) < 60 ) {
			// THE MEGA RAMP — scripted, nearly straight up (terrain can't be
			// a wall). Speed in buys height; the pad makes sure you have it.
			airborne = true;
			megaAir = true;
			megaCd = 4.5;
			vAlt = Math.min( 560, 220 + sp * 26 );
			worldY = gy;
			Matter.Body.setVelocity( b, { x: b.velocity.x * 0.22, y: b.velocity.y * 0.22 } );
			flashChip( 'MEGA RAMP — send it to the sky ⬆' );
			if ( audio.on ) whoosh();
		}
		if ( ! airborne ) {
			var groundRate = ( gy - prevGy ) / Math.max( dt, 0.001 );
			// remember how hard we were climbing — that's the honest launch
			climb = groundRate > 0 ? Math.max( climb * 0.85, groundRate ) : climb * 0.85;
			if ( groundRate < -60 && sp > 4.6 && ! inWater ) {
				airborne = true;
				// the lip drop alone launches modestly; carried climb rate
				// (slope × speed) is what buys big air off ramps/mounds.
				// Steeper cap + climb factor = launches go UP more…
				vAlt = Math.min( 230, Math.max( Math.min( -groundRate * 0.85, 110 ), climb * 0.85 ) );
				worldY = prevGy;
				// …and a hard launch trades forward speed for that height
				// (Thomas: "too far forward, not enough right up in the air")
				if ( vAlt > 140 ) {
					var keep2 = Math.max( 0.7, 1 - ( vAlt - 140 ) * 0.0026 );
					Matter.Body.setVelocity( b, { x: b.velocity.x * keep2, y: b.velocity.y * keep2 } );
				}
			} else {
				// afloat on the slough: ride the water line, bobbing
				worldY = inWater
					? Math.max( gy, POND.waterY - 5 + Math.sin( t * 2.3 ) * 0.9 )
					: gy;
			}
		}
		if ( airborne ) {
			worldY += vAlt * dt;
			vAlt -= ( boostT > 0 ? 524 : 571 ) * dt; // +20% again — snappier arcs
			airTime += dt;
			// L/R Shift pitch the buggy for flips
			var pitchVel = ( keys.tiltF ? -7.5 : 0 ) + ( keys.tiltB ? 7.5 : 0 );
			airPitch += pitchVel * dt;
			var splash = inPond( rx, rz );
			var landY = splash ? Math.max( gy, POND.waterY - 5 ) : gy;
			if ( worldY <= landY ) {
				airborne = false;
				worldY = landY;
				var impact = -vAlt;
				chassisDip = -Math.min( 7, 2 + impact * 0.03 ); // suspension compresses
				vAlt = 0;
				if ( splash ) splashSound();
				else if ( ! bounceAir ) thud( Math.hypot( b.velocity.x, b.velocity.y ) );
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
					if ( megaAir ) {
						// stuck the MEGA landing — huge turbo, pop a wheelie,
						// fireworks over the grandstands
						boostT = 2200;
						wheelieT = 950;
						megaCelebration( rx, worldY, rz );
						flashChip( 'MEGA AIR — wheelie money! 🎆' );
						if ( audio.on ) whoosh();
						var mha = b.angle;
						Matter.Body.setVelocity( b, { x: Math.cos( mha ) * 10, y: Math.sin( mha ) * 10 } );
					} else if ( Math.abs( airPitch ) > 11.5 ) { // stuck a DOUBLE
						boostT = 1600;
						flashChip( 'DOUBLE FLIP! — full send 🛞🛞' );
						if ( audio.on ) whoosh();
					} else if ( Math.abs( airPitch ) > 5.5 ) { // stuck a full flip
						boostT = 800;
						flashChip( 'FLIP! — have some boost 🛞' );
						if ( audio.on ) whoosh();
					} else if ( airTime > 0.85 ) {
						// big air pays boost on a clean landing
						boostT = Math.max( boostT, Math.min( 1300, airTime * 750 ) );
						flashChip( 'Big air — boost on the landing 🛞' );
						if ( audio.on ) whoosh();
					}
					for ( var ld = 0; ld < 6; ld++ ) spawnDust( wheelWorld( -8 + Math.random() * 16, -12 + Math.random() * 24 ), sp );
				}
				airPitch = 0;
				airTime = 0;
				megaAir = false;
				// she's SPRUNG, not welded — but only BIG landings hop. The
				// old +30 floor at a 100 threshold made a small hill-roller
				// rebound nearly as high as the hop itself; now the rebound
				// is purely proportional and rolling terrain never triggers
				// it (the chassis spring carries the everyday squish).
				if ( ! splash && ! bounceAir && impact > 180 ) {
					airborne = true;
					bounceAir = true;
					vAlt = Math.min( 80, impact * 0.2 );
					worldY = landY + 0.5;
				} else {
					bounceAir = false;
				}
			}
		}
		prevGy = gy;

		buggyGroup.position.set( rx, worldY, rz );
		buggyGroup.rotation.y = -ra;

		// --- buggy pose ---
		// TERRAIN alignment goes on the WHOLE group (wheels + axles ride
		// the ground pitch/camber, not just the body); the body-only layer
		// on chassisGroup adds cornering lean, throttle squat, and the
		// landing dip. Signs (verified in play): nose-up-hill = +rot.z;
		// camber roll = −atan(latSlope) about the forward axis (rot.x).
		var gsl = slopeAt( rx, rz );
		var cosA = Math.cos( ra ), sinA = Math.sin( ra );
		var fwdSlope = gsl.x * cosA + gsl.z * sinA;        // rise along heading
		var latSlope = gsl.x * -sinA + gsl.z * cosA;       // rise across (to the left)
		var af = airborne ? 0 : 1;                          // aloft, airPitch owns the pose
		groupPitchS += ( af * Math.atan( fwdSlope ) - groupPitchS ) * 0.18;
		groupRollS += ( af * -Math.atan( latSlope ) - groupRollS ) * 0.18;
		// the wheelie: a nose-up arc that rises fast and settles (mega landing)
		var wheelie = wheelieT > 0 ? Math.sin( Math.min( 1, wheelieT / 950 ) * Math.PI ) * 0.52 : 0;
		buggyGroup.rotation.z = airPitch + groupPitchS + wheelie;
		buggyGroup.rotation.x = groupRollS;
		var tRoll = af * steerVal * -0.17 * Math.min( 1, sp / 4 ); // lean OUT of the turn
		var tPitch = af * throttleInput * 0.06;                    // squat on gas / dive on brake
		tRoll = Math.max( -0.35, Math.min( 0.35, tRoll ) );
		tPitch = Math.max( -0.35, Math.min( 0.35, tPitch ) );
		chassisGroup.rotation.x += ( tRoll - chassisGroup.rotation.x ) * 0.18;
		chassisGroup.rotation.z += ( tPitch - chassisGroup.rotation.z ) * 0.18;
		// suspension is a damped SPRING now — it overshoots and jiggles a
		// touch on the way back instead of easing rigidly home
		chassisVel += ( 0 - chassisDip ) * 0.26;
		chassisVel *= 0.74;
		chassisDip += chassisVel;
		chassisGroup.position.y = 10 + chassisDip;
		// wheelspin: spinning-out tires whirl far faster than the ground speed
		for ( var i = 0; i < wheels.length; i++ ) wheels[ i ].rotation.z -= ( sp + slip * 12 ) * 0.09;
		// the fronts steer with the input (right = clockwise from above)
		for ( var fs = 0; fs < frontSteer.length; fs++ ) frontSteer[ fs ].rotation.y = -steerVal * 0.42;
		// (the old circular blob shadow is gone — the moonlight's real
		// shadow does the grounding now)

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
		updatePeacock( dms );
		updateDogs( dms, t );
		updatePigs( dms );
		updateDucks( dms, t );
		updateScenery( dms, t );
		updateDayNight( t );
		updateFireworks( dms );
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
		var spinRate = Math.abs( b.angularVelocity );
		if ( inWater && ( sp > 1.4 || spinRate > 0.03 || slip > 0.25 ) ) {
			// churn: bow wake at speed, and spinning out whips a spray ring
			spawnSplash( wheelWorld( 10, 12 ), sp + spinRate * 70 + slip * 5 );
			spawnSplash( wheelWorld( 10, -12 ), sp + spinRate * 70 + slip * 5 );
			if ( spinRate > 0.028 || slip > 0.25 || Math.random() < Math.min( 0.9, sp * 0.09 ) ) {
				spawnSplash( wheelWorld( -12, 12 ), sp + spinRate * 55 + slip * 5 );
				spawnSplash( wheelWorld( -12, -12 ), sp + spinRate * 55 + slip * 5 );
			}
			// ripping flat-out throws a proper ROOSTERTAIL behind
			if ( sp > 5 ) {
				spawnSplash( wheelWorld( -18, 4 ), sp * 1.3 );
				spawnSplash( wheelWorld( -18, -4 ), sp * 1.3 );
			}
			// dug-in wheelspin: spray CONES fan out behind the rear tires
			if ( slip > 0.35 ) {
				spawnSplash( wheelWorld( -16 - Math.random() * 6, 7 + Math.random() * 7 ), 2 + slip * 8 );
				spawnSplash( wheelWorld( -16 - Math.random() * 6, -7 - Math.random() * 7 ), 2 + slip * 8 );
				if ( slip > 0.7 ) {
					spawnSplash( wheelWorld( -20 - Math.random() * 8, 5 + Math.random() * 9 ), 3 + slip * 9 );
					spawnSplash( wheelWorld( -20 - Math.random() * 8, -5 - Math.random() * 9 ), 3 + slip * 9 );
				}
			}
		} else if ( inMud && ( sp > 1.2 || slip > 0.25 ) ) {
			// ROOST: all four corners sling mud, harder with speed
			spawnMud( wheelWorld( -14, 10 ), sp + slip * 5 );
			spawnMud( wheelWorld( -14, -10 ), sp + slip * 5 );
			if ( Math.random() < Math.min( 0.9, 0.25 + sp * 0.08 + slip * 0.5 ) ) {
				spawnMud( wheelWorld( 10, 12 ), sp * 0.8 + slip * 4 );
				spawnMud( wheelWorld( 10, -12 ), sp * 0.8 + slip * 4 );
			}
			if ( sp > 5 ) {
				spawnMud( wheelWorld( -18, 4 ), sp * 1.3 );
				spawnMud( wheelWorld( -18, -4 ), sp * 1.3 );
			}
			// dug-in wheelspin: mud CONES fan out behind the rear tires
			if ( slip > 0.35 ) {
				spawnMud( wheelWorld( -16 - Math.random() * 6, 7 + Math.random() * 7 ), 2 + slip * 8 );
				spawnMud( wheelWorld( -16 - Math.random() * 6, -7 - Math.random() * 7 ), 2 + slip * 8 );
				if ( slip > 0.7 ) {
					spawnMud( wheelWorld( -20 - Math.random() * 8, 5 + Math.random() * 9 ), 3 + slip * 9 );
					spawnMud( wheelWorld( -20 - Math.random() * 8, -5 - Math.random() * 9 ), 3 + slip * 9 );
				}
			}
		} else if ( inCreek && ( sp > 1.5 || slip > 0.3 ) ) {
			spawnSplash( wheelWorld( 8, ( Math.random() < 0.5 ? 11 : -11 ) ), sp * 0.7 );
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
		updateMotes( dms, t );
		updateTouchUi();
		updateAudio( dms, sp );

		var near = null, nearD = 1e9;
		for ( var p = 0; p < PROMPTS.length; p++ ) {
			var lm = PROMPTS[ p ];
			var d = Math.hypot( b.position.x - lm.x, b.position.y - lm.y );
			// big buildings need a bigger trigger — you park at the wall,
			// which is already ~half the footprint from the centre
			var range = lm.id === 'restack' ? 130
				: ( lm.w ? Math.max( 180, Math.max( lm.w, lm.h ) * ( lm.scale || 1 ) / 2 + 60 ) : 180 );
			if ( d < range && d < nearD ) { near = lm; nearD = d; }
		}
		if ( near !== nearLandmark ) {
			nearLandmark = near;
			if ( chipEl ) {
				chipEl.hidden = ! near;
				if ( near ) chipEl.textContent = near.prompt + ( near.href ? '  · Enter ↵' : '' );
			}
		}

		// chase camera — LOW pov: closer to the hood, looking slightly up
		// the world so buildings/flags/jumps read at their real height
		var hx = Math.cos( ra ), hy = Math.sin( ra );
		var tx = rx - hx * 158, tz = rz - hy * 158;
		camPos.x += ( tx - camPos.x ) * 0.06;
		camPos.z += ( tz - camPos.z ) * 0.06;
		camPos.y += ( ( worldY + 54 + sp * 2.5 ) - camPos.y ) * 0.06;
		camera.position.copy( camPos );
		camera.lookAt( rx + hx * 62, worldY + 14, rz + hy * 62 );
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

		if ( gradePass ) gradePass.uniforms.night.value = 1 - dayFactor;
		if ( waterMat ) {
			waterMat.uniforms.t.value = t;
			waterMat.uniforms.night.value = 1 - dayFactor;
		}
		if ( atmo ) atmo.cam.value.copy( camera.position );
		if ( composer ) composer.render();
		else renderer.render( scene, camera );
	}

	/* ------------------------------------------------------------------ *
	 *  Playground systems
	 * ------------------------------------------------------------------ */
	function buildMounds( THREE ) {
		// Each mound is meshed as the ACTUAL launch surface the buggy rides
		// (same gaussian as heightAt) — the old dome poked 35% above it, which
		// is what made the buggy look like it sank into the hill. Built
		// non-indexed so computeVertexNormals gives hard facets: sculpted
		// packed dirt, not a smooth cheese dome. (Real steep-faced ramps are
		// a later pass; this de-cheeses the placeholder + fixes the sink.)
		// dirt hills wear the dirt grain; MUD humps are dark, wet and NOT
		// dusted (dust-tinting is what made them read pale and plastic)
		var dirt = applyAtmosphere( new THREE.MeshLambertMaterial( { color: 0x4a3323, map: dirtTex( THREE ) } ), true );
		var wetMud = applyAtmosphere( new THREE.MeshLambertMaterial( { color: 0x2e2015, map: dirtTex( THREE ) } ), false );
		var hayMat = applyAtmosphere( new THREE.MeshLambertMaterial( { color: 0xd8bd6a, map: makeHayTexture( THREE ) } ), true );
		MOUNDS.forEach( function ( m ) {
			var RINGS = 5, SEG = 12, maxR = m.r * 1.6, inv = 2 / ( m.r * m.r );
			function vp( ri, si ) {
				if ( ri === 0 ) return [ 0, m.a, 0 ];
				var rr = maxR * ri / RINGS;
				var hh = m.a * Math.exp( -rr * rr * inv );
				var ang = si / SEG * Math.PI * 2;
				// slight radial lumpiness (skip hay) — a hill, not a dome;
				// small enough that the ride still matches the physics gauss
				if ( ! m.hay ) {
					var lj = 1 + 0.07 * Math.sin( ang * 3.3 + rr * 0.21 + m.x );
					rr *= lj;
				}
				return [ Math.cos( ang ) * rr, hh, Math.sin( ang ) * rr ];
			}
			var tri = [], uvs = [], TILE = m.hay ? 4 : 1;
			function push3( a, b, c ) {
				[ a, b, c ].forEach( function ( p ) {
					tri.push( p[ 0 ], p[ 1 ], p[ 2 ] );
					uvs.push( ( p[ 0 ] / ( maxR * 2 ) + 0.5 ) * TILE, ( p[ 2 ] / ( maxR * 2 ) + 0.5 ) * TILE );
				} );
			}
			for ( var si = 0; si < SEG; si++ ) {
				push3( vp( 0, 0 ), vp( 1, si + 1 ), vp( 1, si ) ); // centre fan
			}
			for ( var ri = 1; ri < RINGS; ri++ ) {
				for ( var s2 = 0; s2 < SEG; s2++ ) {
					push3( vp( ri, s2 ), vp( ri, s2 + 1 ), vp( ri + 1, s2 ) );
					push3( vp( ri, s2 + 1 ), vp( ri + 1, s2 + 1 ), vp( ri + 1, s2 ) );
				}
			}
			var geo = new THREE.BufferGeometry();
			geo.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( tri ), 3 ) );
			geo.setAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( uvs ), 2 ) );
			geo.computeVertexNormals(); // non-indexed → flat facets
			var mesh = new THREE.Mesh( geo, m.hay ? hayMat : ( m.mud ? wetMud : dirt ) );
			mesh.position.set( m.x, hillsAt( m.x, m.z ) + 0.1, m.z );
			scene.add( mesh );
		} );
	}

	// procedural straw for the hay mounds + bale sides — golden, stranded
	function makeHayTexture( THREE ) {
		return cacheTex( THREE, 'hay', function ( x ) {
			x.fillStyle = '#c9a94e';
			x.fillRect( 0, 0, 128, 128 );
			for ( var i = 0; i < 420; i++ ) {
				var gx = Math.random() * 128, gy = Math.random() * 128;
				var len = 6 + Math.random() * 15, ang = ( Math.random() - 0.5 ) * 1.1;
				x.strokeStyle = Math.random() < 0.5 ? 'rgba(120, 92, 40, 0.5)' : 'rgba(236, 214, 156, 0.6)';
				x.lineWidth = 1;
				x.beginPath();
				x.moveTo( gx, gy );
				x.lineTo( gx + Math.cos( ang ) * len, gy + Math.sin( ang ) * len );
				x.stroke();
			}
		} );
	}

	// The section-road jumps: shaped dirt features that follow jumpProfile()
	// exactly (so the buggy rides the surface it sees), faceted like the
	// mounds, with lit lip markers so the take-off reads at night.
	function buildJumps( THREE ) {
		var dirt = applyAtmosphere( new THREE.MeshLambertMaterial( {
			color: 0x4a3323, map: dirtTex( THREE ), side: THREE.DoubleSide } ), true );
		var lampMat = new THREE.MeshBasicMaterial( { color: glow( THREE, 0xffb45e, 1.15 ) } );
		JUMPS.forEach( function ( j ) {
			var hw = j.w / 2, N = 20;
			function pt( sd, t, y ) {
				var tl = t - j.len / 2;
				var wx = j.x + j.cx * tl - j.cz * sd;
				var wz = j.z + j.cz * tl + j.cx * sd;
				return [ wx, hillsAt( wx, wz ) + y, wz ];
			}
			var tris = [];
			function push3( a, b, c ) { tris.push( a[0],a[1],a[2], b[0],b[1],b[2], c[0],c[1],c[2] ); }
			function quad( a, b, c, d ) { push3( a, b, c ); push3( a, c, d ); }
			for ( var k = 0; k < N; k++ ) {
				var t0 = j.len * k / N, t1 = j.len * ( k + 1 ) / N;
				var y0 = j.h * jumpProfile( j, t0 ), y1 = j.h * jumpProfile( j, t1 );
				quad( pt( -hw, t0, y0 ), pt( hw, t0, y0 ), pt( hw, t1, y1 ), pt( -hw, t1, y1 ) ); // deck + faces
				quad( pt( -hw, t0, 0 ), pt( -hw, t0, y0 ), pt( -hw, t1, y1 ), pt( -hw, t1, 0 ) );  // left wall
				quad( pt( hw, t0, 0 ), pt( hw, t0, y0 ), pt( hw, t1, y1 ), pt( hw, t1, 0 ) );       // right wall
			}
			var geo = new THREE.BufferGeometry();
			geo.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( tris ), 3 ) );
			dirtUVs( THREE, geo, tris );
			geo.computeVertexNormals();
			scene.add( new THREE.Mesh( geo, dirt ) );
			// lit markers at the take-off lip
			var lipY = j.h * jumpProfile( j, Math.min( j.len - 0.1, j.up ) ) + 2;
			[ -1, 1 ].forEach( function ( s ) {
				var at = pt( s * ( hw - 4 ), j.up, lipY );
				var lamp = new THREE.Mesh( new THREE.BoxGeometry( 3, 3.5, 3 ), lampMat );
				lamp.position.set( at[0], at[1], at[2] );
				scene.add( lamp );
			} );
		} );
	}

	// planar UVs from world x/z so the sculpted dirt features can carry
	// dirtTex — they were built without UVs (single-texel smear otherwise)
	function dirtUVs( THREE, geo, tris ) {
		var uv = new Float32Array( tris.length / 3 * 2 );
		for ( var i = 0, j = 0; i < tris.length; i += 3 ) {
			uv[ j++ ] = tris[ i ] / 26;
			uv[ j++ ] = tris[ i + 2 ] / 26;
		}
		geo.setAttribute( 'uv', new THREE.BufferAttribute( uv, 2 ) );
		return geo;
	}

	// THE MEGA RAMP mesh — a curved face that goes near-vertical, wooden
	// side walls, lit lip. Physics is the scripted launch in control(); the
	// mesh just has to LOOK like the thing that threw you into the sky.
	function buildMegaRamp( THREE ) {
		var hw = MEGA.w / 2, N = 22, LEN = 68, baseX = MEGA.x + 58;
		var gy = hillsAt( MEGA.x, MEGA.z );
		function py( t ) { return MEGA.h * Math.pow( t / LEN, 2.6 ); }
		var tris = [];
		function push3( a, b, c ) { tris.push( a[0],a[1],a[2], b[0],b[1],b[2], c[0],c[1],c[2] ); }
		function quad( a, b, c, d ) { push3( a, b, c ); push3( a, c, d ); }
		for ( var k = 0; k < N; k++ ) {
			var t0 = LEN * k / N, t1 = LEN * ( k + 1 ) / N;
			var x0 = baseX - t0, x1 = baseX - t1;
			var y0 = gy + py( t0 ), y1 = gy + py( t1 );
			// the riding face
			quad( [ x0, y0, MEGA.z - hw ], [ x0, y0, MEGA.z + hw ],
			      [ x1, y1, MEGA.z + hw ], [ x1, y1, MEGA.z - hw ] );
			// side walls
			quad( [ x0, gy, MEGA.z - hw ], [ x0, y0, MEGA.z - hw ],
			      [ x1, y1, MEGA.z - hw ], [ x1, gy, MEGA.z - hw ] );
			quad( [ x0, gy, MEGA.z + hw ], [ x1, gy, MEGA.z + hw ],
			      [ x1, y1, MEGA.z + hw ], [ x0, y0, MEGA.z + hw ] );
		}
		// the back drops straight down
		var topX = baseX - LEN, topY = gy + MEGA.h;
		quad( [ topX, topY, MEGA.z - hw ], [ topX, topY, MEGA.z + hw ],
		      [ topX, gy, MEGA.z + hw ], [ topX, gy, MEGA.z - hw ] );
		var geo = new THREE.BufferGeometry();
		geo.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( tris ), 3 ) );
		var uv = new Float32Array( tris.length / 3 * 2 );
		for ( var ui = 0, uj = 0; ui < tris.length; ui += 3 ) {
			uv[ uj++ ] = tris[ ui ] / 26;
			uv[ uj++ ] = ( tris[ ui + 1 ] + tris[ ui + 2 ] ) / 26;
		}
		geo.setAttribute( 'uv', new THREE.BufferAttribute( uv, 2 ) );
		geo.computeVertexNormals();
		var face = new THREE.Mesh( geo, applyAtmosphere( new THREE.MeshLambertMaterial( {
			color: 0x9a7c50, map: plankTex( THREE ), side: THREE.DoubleSide } ), true ) );
		scene.add( face );
		// lit lip bulbs so the top edge reads at night
		[ -1, 1 ].forEach( function ( sd ) {
			var lamp = new THREE.Mesh( new THREE.SphereGeometry( 2.6, 10, 8 ),
				new THREE.MeshBasicMaterial( { color: glow( THREE, 0xffd76a, 1.5 ) } ) );
			lamp.position.set( topX, topY + 3, MEGA.z + sd * ( hw - 4 ) );
			scene.add( lamp );
		} );
	}

	function buildRamps( THREE ) {
		// world-space wedges that follow the terrain, matching rampAt()'s
		// f² face exactly so the buggy rides the surface it sees
		// the farm ramps are BUILT things now — boards, not dirt heaps
		var dirt = applyAtmosphere( new THREE.MeshLambertMaterial( {
			color: 0xa88a5c, map: plankTex( THREE ), side: THREE.DoubleSide } ), true );
		var lampMat = new THREE.MeshBasicMaterial( { color: glow( THREE, 0xffb45e, 1.15 ) } );
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
			dirtUVs( THREE, geo, tris );
			geo.computeVertexNormals();
			scene.add( new THREE.Mesh( geo, dirt ) );
			// lit lip markers so the kicker reads at night
			[ -1, 1 ].forEach( function ( sd ) {
				var at = pt( sd * ( hw - 4 ), r.l, r.h + 2 );
				var lamp = new THREE.Mesh( new THREE.BoxGeometry( 3, 3.5, 3 ), lampMat );
				lamp.position.set( at[ 0 ], at[ 1 ], at[ 2 ] );
				scene.add( lamp );
			} );
		} );
	}

	function buildPads( THREE ) {
		var padMat = new THREE.MeshBasicMaterial( { color: glow( THREE, 0x8be9ff, 1.5 ), transparent: true, opacity: 0.5 } );
		var megaMat = new THREE.MeshBasicMaterial( { color: glow( THREE, 0xffd76a, 1.7 ), transparent: true, opacity: 0.6 } );
		PADS.forEach( function ( p, i ) {
			padCooldown[ i ] = 0;
			var g = new THREE.Group();
			var mScale = p.mega ? 1.7 : 1; // the mega pad reads BIG and gold
			for ( var c = 0; c < 3; c++ ) {
				var chev = new THREE.Mesh(
					new THREE.PlaneGeometry( ( 26 - c * 5 ) * mScale, 8 * mScale ),
					p.mega ? megaMat : padMat );
				chev.rotation.x = -Math.PI / 2;
				chev.position.set( 0, 0.7 + c * 0.02, -c * 11 * mScale );
				g.add( chev );
			}
			g.position.set( p.x, hillsAt( p.x, p.z ), p.z );
			g.rotation.y = p.rot || 0;
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
			if ( Math.hypot( b.position.x - p.x, b.position.y - p.z ) < ( p.mega ? 44 : 30 ) ) {
				padCooldown[ i ] = t + 1.6;
				boostT = p.mega ? 1800 : 950;
				var a = b.angle;
				var sp = Math.max( Math.hypot( b.velocity.x, b.velocity.y ), p.mega ? 13.5 : 9.4 );
				Matter.Body.setVelocity( b, { x: Math.cos( a ) * sp, y: Math.sin( a ) * sp } );
				if ( audio.on && audio.ctx ) whoosh();
			}
		}
	}

	function buildTokens( THREE ) {
		var found = [];
		try { found = JSON.parse( window.localStorage.getItem( 'tcBqTok_v2' ) || '[]' ); } catch ( err ) {}
		var geo = new THREE.CylinderGeometry( 6, 6, 1.8, 16 );
		geo.rotateZ( Math.PI / 2 );
		var goldSide = new THREE.MeshBasicMaterial( { color: glow( THREE, 0xffd76a, 1.4 ) } );
		var coinFace = new THREE.MeshBasicMaterial( { map: coinTex( THREE ), color: glow( THREE, 0xffffff, 1.2 ) } );
		var gold = [ goldSide, coinFace, coinFace ];
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
				window.localStorage.setItem( 'tcBqTok_v2', JSON.stringify( got ) );
			} catch ( err ) {}
			updateHud();
			if ( tokenFound === tokenCount ) {
				flashChip( 'ALL ' + tokenCount + ' TOKENS — the quarter is yours! 🏆🎆 (the restack pad resets the hunt)' );
				startCelebration();
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
				var huntReset = restackAll();
				flashChip( huntReset
					? 'Bales restacked — and the token hunt is reset 🪙'
					: 'Bales restacked — go wreck ’em again' );
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
		// a completed token hunt resets here too — the pad is the farm's
		// "set it all up again" spot
		if ( tokenCount > 0 && tokenFound === tokenCount ) {
			try { window.localStorage.removeItem( 'tcBqTok_v2' ); } catch ( err ) {}
			tokens.forEach( function ( tk ) { tk.got = false; tk.mesh.visible = true; } );
			tokenFound = 0;
			updateHud();
			return true;
		}
		return false;
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
			new THREE.MeshBasicMaterial( { color: glow( THREE, 0xffcf8a, 1.5 ), transparent: true, opacity: 0.35 } )
		);
		ring.position.copy( pad.position );
		ring.position.y += 0.6;
		scene.add( ring );
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
		bulbLit = new THREE.Color( 0xffe6a8 ).multiplyScalar( 2.2 ); // HDR — the chase blooms
		bulbDim = new THREE.Color( 0x6a4d26 );
		var ring = [], rb;
		for ( rb = -62; rb <= 62; rb += 13.75 ) ring.push( [ rb, 149 ] );  // top →
		for ( rb = 136; rb >= 89; rb -= 13.5 ) ring.push( [ 66, rb ] );    // right ↓
		for ( rb = 62; rb >= -62; rb -= 13.75 ) ring.push( [ rb, 75 ] );   // bottom ←
		for ( rb = 89; rb <= 136; rb += 13.5 ) ring.push( [ -66, rb ] );   // left ↑
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
			// tall legs: the panel rides high (y 112 local ≈ 246 world) so
			// trees/fences/berms never obstruct it from the track
			[ -52, 52 ].forEach( function ( ox ) {
				var leg = new THREE.Mesh( new THREE.BoxGeometry( 5, 108, 5 ), wood );
				leg.position.set( ox, 54, 0 );
				g.add( leg );
			} );
			var panel = new THREE.Mesh( new THREE.BoxGeometry( 124, 70, 3 ), mat( THREE, 0x241c14 ) );
			panel.position.y = 112;
			g.add( panel );
			var face = new THREE.Mesh(
				new THREE.PlaneGeometry( 118, 66 ),
				// slight HDR lift: the white titles bloom like a projector beam,
				// the dark screen body stays dark
				new THREE.MeshBasicMaterial( { map: new THREE.CanvasTexture( c ), color: glow( THREE, 0xffffff, 1.25 ) } )
			);
			face.position.set( 0, 112, 2 );
			g.add( face );

			// the old-country flags fly on poles above the sign — big, and
			// set back behind the panel so the frame never crops them
			var fl = line.flags || [];
			fl.forEach( function ( code, fi ) {
				var fx = fl.length === 1 ? 0 : ( fi === 0 ? -34 : 34 );
				var pole = new THREE.Mesh( new THREE.CylinderGeometry( 1.1, 1.1, 34, 5 ), wood );
				pole.position.set( fx, 162, -4 );
				g.add( pole );
				var flag = new THREE.Mesh(
					new THREE.PlaneGeometry( 26, 17 ),
					new THREE.MeshBasicMaterial( {
						map: flagTexture( THREE, code ), side: THREE.DoubleSide
					} )
				);
				flag.position.set( fx + 14, 170, -4 );
				g.add( flag );
			} );

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
	function mat( THREE, color ) { return applyAtmosphere( new THREE.MeshLambertMaterial( { color: color } ), true ); }

	/* ------------------------------------------------------------------ *
	 *  PRAIRIE ATMOSPHERE (graphics phase 2) — one injected shader, applied
	 *  to every Lambert surface, that does two cohesion jobs at once:
	 *   • DUST: near-ground fragments drift toward a warm prairie-dust colour
	 *     (the "decades of wind, everything collects dust, nothing is freshly
	 *     painted" move) + up-facing faces sun-bleach a touch.
	 *   • GROUND HAZE: low fragments fade toward the horizon/fog colour with
	 *     distance — fields feel huge and headlights read at night.
	 *  Colours ride shared uniforms updated per-frame from the day cycle, so
	 *  all materials share ONE program variant (cache key below). Lights
	 *  (MeshBasic glow) are deliberately excluded so they still bloom.
	 * ------------------------------------------------------------------ */
	function applyAtmosphere( material, dust ) {
		if ( ! atmo ) return material; // pre-boot safety
		material.onBeforeCompile = function ( shader ) {
			shader.uniforms.uHaze = atmo.haze;
			shader.uniforms.uHazeAmt = atmo.amt;
			shader.uniforms.uCam = atmo.cam;
			shader.vertexShader = 'varying vec3 vWPos;\nvarying float vUpN;\n' + shader.vertexShader
				.replace( '#include <begin_vertex>',
					'#include <begin_vertex>\n' +
					'#ifdef USE_INSTANCING\n' +
					'\tvWPos = ( modelMatrix * instanceMatrix * vec4( transformed, 1.0 ) ).xyz;\n' +
					'#else\n' +
					'\tvWPos = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;\n' +
					'#endif' )
				.replace( '#include <beginnormal_vertex>',
					'#include <beginnormal_vertex>\n\tvUpN = normalize( mat3( modelMatrix ) * objectNormal ).y;' );
			shader.fragmentShader = 'uniform vec3 uHaze;\nuniform float uHazeAmt;\nuniform vec3 uCam;\n' +
				'varying vec3 vWPos;\nvarying float vUpN;\n' + shader.fragmentShader
				.replace( '#include <dithering_fragment>',
					'#include <dithering_fragment>\n' +
					( dust ?
						'\tfloat _g = smoothstep( 34.0, 2.0, vWPos.y );\n' +
						'\tgl_FragColor.rgb = mix( gl_FragColor.rgb, mix( gl_FragColor.rgb, vec3(0.60,0.53,0.40), 0.5 ), _g * 0.5 );\n' +
						'\tgl_FragColor.rgb += clamp( vUpN, 0.0, 1.0 ) * 0.04;\n'
						: '' ) +
					'\tfloat _low = clamp( smoothstep( 34.0, -6.0, vWPos.y ), 0.0, 1.0 );\n' +
					'\tfloat _haze = smoothstep( 240.0, 1500.0, length( vWPos - uCam ) ) * _low * uHazeAmt;\n' +
					'\tgl_FragColor.rgb = mix( gl_FragColor.rgb, uHaze, _haze );' );
		};
		material.customProgramCacheKey = function () { return dust ? 'atmo_d' : 'atmo_h'; };
		return material;
	}

	// A light source: a MeshBasic colour pushed past 1.0 (HDR) so ACES still
	// leaves it hot enough to cross BLOOM.threshold — these are the meshes
	// the bloom pass picks up. ~1.4 reads "lit", ~2.2 reads "burning".
	// Harmless without the composer: the colour just clamps at white-ish.
	function glow( THREE, hex, boost ) {
		return new THREE.Color( hex ).multiplyScalar( boost || 1.8 );
	}

	/* ------------------------------------------------------------------ *
	 *  PAINTED-SURFACE MATERIAL LIBRARY (graphics phase 1)
	 *  Every surface used to be one flat colour — reading "coloured plastic".
	 *  These procedural canvas textures give each material family its own
	 *  hand-painted grain, MULTIPLIED over the base colour (so the same call
	 *  sites keep their tint, they just gain surface). Textures are drawn on
	 *  a near-white base (~0.9) so the multiply barely dims — it adds detail,
	 *  not darkness. Each is generated ONCE and shared across every instance.
	 *  Model: "carved from painted basswood, dusted with prairie."
	 * ------------------------------------------------------------------ */
	var _texCache = {};
	function cacheTex( THREE, key, draw, rep ) {
		if ( _texCache[ key ] ) return _texCache[ key ];
		var c = document.createElement( 'canvas' );
		c.width = c.height = 128;
		draw( c.getContext( '2d' ) );
		var t = new THREE.CanvasTexture( c );
		t.wrapS = t.wrapT = THREE.RepeatWrapping;
		if ( rep ) t.repeat.set( rep[ 0 ], rep[ 1 ] );
		_texCache[ key ] = t;
		return t;
	}
	function strokes( x, n, cols, minL, maxL, vertical ) {
		for ( var i = 0; i < n; i++ ) {
			var gx = Math.random() * 128, gy = Math.random() * 128;
			var len = minL + Math.random() * ( maxL - minL );
			var ang = vertical ? Math.PI / 2 + ( Math.random() - 0.5 ) * 0.35
				: ( Math.random() - 0.5 ) * 0.7;
			x.strokeStyle = cols[ ( Math.random() * cols.length ) | 0 ];
			x.lineWidth = 0.6 + Math.random() * 1.4;
			x.beginPath();
			x.moveTo( gx, gy );
			x.lineTo( gx + Math.cos( ang ) * len, gy + Math.sin( ang ) * len );
			x.stroke();
		}
	}
	// warm cabin / painted wood — broad dry vertical brush drag
	function woodTex( THREE ) {
		return cacheTex( THREE, 'wood', function ( x ) {
			x.fillStyle = '#e7d9c4'; x.fillRect( 0, 0, 128, 128 );
			strokes( x, 70, [ 'rgba(150,116,74,0.35)', 'rgba(120,92,58,0.30)' ], 40, 120, true );
			strokes( x, 40, [ 'rgba(240,224,196,0.55)' ], 30, 90, true );
		}, [ 2, 2 ] );
	}
	// weathered barn wood — greyed, sun-bleached, knots + nail dots
	function barnTex( THREE ) {
		return cacheTex( THREE, 'barn', function ( x ) {
			x.fillStyle = '#ded6c8'; x.fillRect( 0, 0, 128, 128 );
			strokes( x, 90, [ 'rgba(120,110,96,0.34)', 'rgba(90,82,70,0.30)' ], 50, 128, true );
			strokes( x, 34, [ 'rgba(238,232,220,0.5)' ], 30, 100, true );
			for ( var k = 0; k < 5; k++ ) { // knots
				x.fillStyle = 'rgba(96,80,60,0.4)';
				x.beginPath();
				x.ellipse( Math.random() * 128, Math.random() * 128, 2.5, 4.5, 0, 0, 7 );
				x.fill();
			}
			for ( var d = 0; d < 10; d++ ) { // nail dots
				x.fillStyle = 'rgba(70,64,56,0.5)';
				x.beginPath();
				x.arc( Math.random() * 128, Math.random() * 128, 1, 0, 7 );
				x.fill();
			}
		}, [ 2, 2 ] );
	}
	// packed prairie dirt — sienna/ochre with lavender shadow + pebbles
	function dirtTex( THREE ) {
		return cacheTex( THREE, 'dirt', function ( x ) {
			x.fillStyle = '#e0cbaa'; x.fillRect( 0, 0, 128, 128 );
			strokes( x, 60, [ 'rgba(150,110,70,0.28)', 'rgba(120,96,120,0.16)' ], 20, 70, false );
			for ( var p = 0; p < 90; p++ ) { // pebbles
				x.fillStyle = Math.random() < 0.5 ? 'rgba(120,96,66,0.4)' : 'rgba(236,224,196,0.5)';
				x.beginPath();
				x.arc( Math.random() * 128, Math.random() * 128, 0.7 + Math.random() * 1.6, 0, 7 );
				x.fill();
			}
		}, [ 3, 3 ] );
	}
	// galvanized metal — cloudy zinc mottle, faint blue, rivet circles
	function metalTex( THREE ) {
		return cacheTex( THREE, 'metal', function ( x ) {
			x.fillStyle = '#dfe2e4'; x.fillRect( 0, 0, 128, 128 );
			for ( var m = 0; m < 26; m++ ) { // soft zinc clouds
				var r = 12 + Math.random() * 30;
				x.fillStyle = Math.random() < 0.5 ? 'rgba(150,160,172,0.12)' : 'rgba(236,240,244,0.14)';
				x.beginPath();
				x.arc( Math.random() * 128, Math.random() * 128, r, 0, 7 );
				x.fill();
			}
			strokes( x, 20, [ 'rgba(150,166,186,0.12)' ], 40, 110, true ); // faint blue streak
			for ( var v = 0; v < 8; v++ ) { // rivets down a seam
				x.fillStyle = 'rgba(150,158,168,0.5)';
				x.beginPath();
				x.arc( 20 + ( v % 2 ) * 88, 8 + v * 15, 1.4, 0, 7 );
				x.fill();
			}
		}, [ 1, 3 ] );
	}
	// fieldstone — rounded muted cobbles, faint lichen tint
	function stoneTex( THREE ) {
		return cacheTex( THREE, 'stone', function ( x ) {
			x.fillStyle = '#dedacf'; x.fillRect( 0, 0, 128, 128 );
			for ( var s = 0; s < 22; s++ ) {
				var sx = Math.random() * 128, sy = Math.random() * 128, r = 8 + Math.random() * 16;
				x.fillStyle = Math.random() < 0.5 ? 'rgba(150,146,134,0.22)' : 'rgba(238,236,228,0.28)';
				x.beginPath();
				x.arc( sx, sy, r, 0, 7 );
				x.fill();
				x.strokeStyle = 'rgba(120,116,104,0.3)';
				x.lineWidth = 1;
				x.stroke();
				if ( Math.random() < 0.3 ) { // lichen fleck
					x.fillStyle = 'rgba(150,160,120,0.22)';
					x.beginPath();
					x.arc( sx + ( Math.random() - 0.5 ) * r, sy + ( Math.random() - 0.5 ) * r, 2, 0, 7 );
					x.fill();
				}
			}
		}, [ 2, 2 ] );
	}
	// GRASS: short leaning blade strokes in two tones, multiplied over the
	// terrain's vertex colours — dry-olive tufts on the fields; on the
	// painted roads/bog the same strokes read as track marks, not grass
	function groundTex( THREE ) {
		return cacheTex( THREE, 'ground', function ( x ) {
			x.fillStyle = '#ece6da'; x.fillRect( 0, 0, 128, 128 );
			for ( var i = 0; i < 400; i++ ) {
				var gx = Math.random() * 128, gy = Math.random() * 128;
				var len = 4 + Math.random() * 7;
				var lean = ( Math.random() - 0.5 ) * 0.9;
				x.strokeStyle = Math.random() < 0.5 ? 'rgba(88,114,50,0.36)' : 'rgba(240,248,210,0.34)';
				x.lineWidth = 1;
				x.beginPath();
				x.moveTo( gx, gy );
				x.lineTo( gx + lean * len, gy - len );
				x.stroke();
			}
			for ( var d = 0; d < 160; d++ ) {
				x.fillStyle = Math.random() < 0.5 ? 'rgba(140,130,105,0.14)' : 'rgba(252,250,240,0.18)';
				x.beginPath();
				x.arc( Math.random() * 128, Math.random() * 128, 0.6 + Math.random() * 1.4, 0, 7 );
				x.fill();
			}
		}, [ 58, 42 ] );
	}
	// running-bond brickwork for the windmill tower
	function brickTex( THREE ) {
		return cacheTex( THREE, 'brick', function ( x ) {
			x.fillStyle = '#ded2c4'; x.fillRect( 0, 0, 128, 128 ); // mortar
			for ( var row = 0; row < 13; row++ ) {
				var offs = row % 2 ? 10 : 0;
				for ( var bcol = -1; bcol < 7; bcol++ ) {
					var shade = 0.28 + Math.random() * 0.16;
					x.fillStyle = 'rgba(120,62,40,' + shade.toFixed( 2 ) + ')';
					x.fillRect( bcol * 20 + offs + 1, row * 10 + 1, 18, 8 );
				}
			}
		}, [ 3, 2 ] );
	}
	// sailcloth lattice for the windmill sails
	function sailTex( THREE ) {
		return cacheTex( THREE, 'sail', function ( x ) {
			x.fillStyle = '#eae4d4'; x.fillRect( 0, 0, 128, 128 );
			x.strokeStyle = 'rgba(70,54,36,0.5)';
			x.lineWidth = 2;
			for ( var v2 = 8; v2 < 128; v2 += 24 ) {
				x.beginPath(); x.moveTo( v2, 0 ); x.lineTo( v2, 128 ); x.stroke();
			}
			for ( var h2 = 8; h2 < 128; h2 += 16 ) {
				x.beginPath(); x.moveTo( 0, h2 ); x.lineTo( 128, h2 ); x.stroke();
			}
		} );
	}
	// aviation bands for the flare stack
	function flareStripeTex( THREE ) {
		return cacheTex( THREE, 'flarestripe', function ( x ) {
			for ( var i = 0; i < 8; i++ ) {
				x.fillStyle = i % 2 ? '#d8d3c4' : '#a83a2a';
				x.fillRect( 0, i * 16, 128, 16 );
			}
		} );
	}
	// role materials — same tint as before, now with painted grain
	// foliage mottle — leafy dabs of dark + light so canopies stop being flat
	function leafTex( THREE ) {
		return cacheTex( THREE, 'leaf', function ( x ) {
			x.fillStyle = '#e4e8d8'; x.fillRect( 0, 0, 128, 128 );
			// dense leafy dabs, three tones — deeper shadow, brighter tips
			for ( var i = 0; i < 380; i++ ) {
				var pick = Math.random();
				x.fillStyle = pick < 0.4 ? 'rgba(48,78,42,0.34)'
					: ( pick < 0.7 ? 'rgba(90,120,64,0.26)' : 'rgba(246,252,226,0.36)' );
				x.beginPath();
				x.arc( Math.random() * 128, Math.random() * 128, 1.6 + Math.random() * 6, 0, 7 );
				x.fill();
			}
		}, [ 2, 2 ] );
	}
	// cattle hide — big soft blotches (holstein-ish under a brown tint)
	function hideTex( THREE ) {
		return cacheTex( THREE, 'hide', function ( x ) {
			x.fillStyle = '#efe9e0'; x.fillRect( 0, 0, 128, 128 );
			for ( var i = 0; i < 9; i++ ) {
				x.fillStyle = 'rgba(52,40,30,0.36)';
				x.beginPath();
				x.ellipse( Math.random() * 128, Math.random() * 128,
					10 + Math.random() * 20, 8 + Math.random() * 16,
					Math.random() * 3, 0, 7 );
				x.fill();
			}
			for ( var j = 0; j < 5; j++ ) {
				x.fillStyle = 'rgba(248,244,236,0.4)';
				x.beginPath();
				x.arc( Math.random() * 128, Math.random() * 128, 8 + Math.random() * 14, 0, 7 );
				x.fill();
			}
		}, [ 1, 1 ] );
	}
	// wool — dense tiny nubs
	function woolTex( THREE ) {
		return cacheTex( THREE, 'wool', function ( x ) {
			x.fillStyle = '#ece8de'; x.fillRect( 0, 0, 128, 128 );
			for ( var i = 0; i < 340; i++ ) {
				x.fillStyle = Math.random() < 0.5 ? 'rgba(150,142,124,0.20)' : 'rgba(252,250,244,0.30)';
				x.beginPath();
				x.arc( Math.random() * 128, Math.random() * 128, 1.5 + Math.random() * 3, 0, 7 );
				x.fill();
			}
		}, [ 2, 2 ] );
	}
	// built-ramp BOARDS — parallel planks with gaps + nail dots
	function plankTex( THREE ) {
		return cacheTex( THREE, 'plank', function ( x ) {
			x.fillStyle = '#d8c4a0'; x.fillRect( 0, 0, 128, 128 );
			for ( var p = 0; p < 8; p++ ) {
				var py = p * 16;
				x.fillStyle = 'rgba(120,90,54,' + ( 0.22 + Math.random() * 0.14 ).toFixed( 2 ) + ')';
				x.fillRect( 0, py + 1, 128, 14 );
				x.fillStyle = 'rgba(60,44,26,0.7)';
				x.fillRect( 0, py, 128, 1.6 );
				x.fillStyle = 'rgba(50,38,24,0.6)';
				x.beginPath(); x.arc( 14 + Math.random() * 8, py + 8, 1.2, 0, 7 ); x.fill();
				x.beginPath(); x.arc( 106 + Math.random() * 8, py + 8, 1.2, 0, 7 ); x.fill();
			}
			strokes( x, 30, [ 'rgba(150,116,74,0.25)' ], 30, 90, false );
		}, [ 2, 2 ] );
	}
	// the coin face — ₿, the B with two strokes through it, on stamped gold
	function coinTex( THREE ) {
		return cacheTex( THREE, 'coin', function ( x ) {
			x.fillStyle = '#e8b93a'; x.fillRect( 0, 0, 128, 128 );
			x.strokeStyle = '#a87f1e';
			x.lineWidth = 6;
			x.beginPath(); x.arc( 64, 64, 54, 0, 7 ); x.stroke();
			x.lineWidth = 2.5;
			x.beginPath(); x.arc( 64, 64, 44, 0, 7 ); x.stroke();
			x.fillStyle = '#7a5c14';
			x.font = '700 62px Georgia, serif';
			x.textAlign = 'center';
			x.fillText( 'B', 64, 86 );
			x.strokeStyle = '#7a5c14';
			x.lineWidth = 5;
			[ 54, 74 ].forEach( function ( bx ) {
				x.beginPath(); x.moveTo( bx, 30 ); x.lineTo( bx, 42 ); x.stroke();
				x.beginPath(); x.moveTo( bx, 86 ); x.lineTo( bx, 98 ); x.stroke();
			} );
		} );
	}
	// a sawn log's end — growth rings + a check crack
	function logEndTex( THREE ) {
		return cacheTex( THREE, 'logend', function ( x ) {
			x.fillStyle = '#c8a878'; x.fillRect( 0, 0, 128, 128 );
			x.strokeStyle = 'rgba(120,84,48,0.55)';
			for ( var r = 10; r < 62; r += 9 ) {
				x.lineWidth = 1.6 + Math.random();
				x.beginPath();
				x.arc( 64, 64, r + Math.random() * 3, 0, 7 );
				x.stroke();
			}
			x.strokeStyle = 'rgba(90,60,32,0.7)';
			x.lineWidth = 2.4;
			x.beginPath(); x.moveTo( 64, 64 ); x.lineTo( 108, 84 ); x.stroke();
		} );
	}
	// the rolled-bale END — an archimedean spiral, so a bale never again
	// reads as a giant gold token in the headlights
	function baleEndTex( THREE ) {
		return cacheTex( THREE, 'baleEnd', function ( x ) {
			x.fillStyle = '#cbb070'; x.fillRect( 0, 0, 128, 128 );
			x.strokeStyle = 'rgba(110,84,38,0.6)';
			x.lineWidth = 2.6;
			x.beginPath();
			x.moveTo( 64, 64 );
			for ( var a = 0; a < Math.PI * 12; a += 0.09 ) {
				var r = 2 + a * 1.55;
				x.lineTo( 64 + Math.cos( a ) * r, 64 + Math.sin( a ) * r );
			}
			x.stroke();
			x.strokeStyle = 'rgba(236,214,156,0.4)';
			x.lineWidth = 1.2;
			x.beginPath();
			x.moveTo( 64, 64 );
			for ( var a2 = 0.4; a2 < Math.PI * 12; a2 += 0.09 ) {
				var r2 = 2 + a2 * 1.55;
				x.lineTo( 64 + Math.cos( a2 ) * r2, 64 + Math.sin( a2 ) * r2 );
			}
			x.stroke();
		} );
	}
	// knobby tire tread wrapping the barrel — chunky alternating lugs
	function treadTex( THREE ) {
		return cacheTex( THREE, 'tread', function ( x ) {
			x.fillStyle = '#16130f'; x.fillRect( 0, 0, 128, 128 );
			var lugs = 16, w = 128 / lugs;
			for ( var i = 0; i < lugs; i++ ) {
				x.fillStyle = i % 2 ? '#2e2924' : '#262019';
				x.fillRect( i * w + 1, i % 2 ? 0 : 14, w - 3, 100 );
			}
		} );
	}
	// a wheel's face: rubber ring with tread blocks, painted rim, spoke
	// shadows, lug nuts + centre cap — the caps of the tire cylinder
	function wheelFaceTex( THREE, key, rimCss, lugCss ) {
		return cacheTex( THREE, key, function ( x ) {
			x.fillStyle = '#16130f'; x.fillRect( 0, 0, 128, 128 );
			for ( var a = 0; a < 22; a++ ) {
				x.save();
				x.translate( 64, 64 );
				x.rotate( a / 22 * Math.PI * 2 );
				x.fillStyle = a % 2 ? '#292420' : '#211c16';
				x.fillRect( 44, -8, 20, 16 );
				x.restore();
			}
			x.fillStyle = rimCss;
			x.beginPath(); x.arc( 64, 64, 37, 0, 7 ); x.fill();
			x.strokeStyle = 'rgba(0,0,0,0.4)'; x.lineWidth = 3;
			x.beginPath(); x.arc( 64, 64, 37, 0, 7 ); x.stroke();
			x.fillStyle = 'rgba(18,14,10,0.5)'; // the gaps between five spokes
			for ( var s = 0; s < 5; s++ ) {
				x.save();
				x.translate( 64, 64 );
				x.rotate( s / 5 * Math.PI * 2 );
				x.beginPath(); x.ellipse( 23, 0, 9.5, 7, 0, 0, 7 ); x.fill();
				x.restore();
			}
			x.fillStyle = lugCss;
			for ( var l = 0; l < 5; l++ ) {
				var la = l / 5 * Math.PI * 2 + 0.63;
				x.beginPath();
				x.arc( 64 + Math.cos( la ) * 10.5, 64 + Math.sin( la ) * 10.5, 3, 0, 7 );
				x.fill();
			}
			x.beginPath(); x.arc( 64, 64, 5.5, 0, 7 ); x.fill();
		} );
	}
	// a REAL wheel: treaded barrel + spoked rim faces + protruding hub.
	// One mesh, so the existing rotation.z spin keeps working; the rim
	// face visibly rotates with it.
	function makeWheel( THREE, r, w, key, rimCss, lugCss ) {
		var geo = new THREE.CylinderGeometry( r, r, w, 14 );
		geo.rotateX( Math.PI / 2 );
		var side = applyAtmosphere( new THREE.MeshLambertMaterial( { map: treadTex( THREE ) } ), true );
		var face = applyAtmosphere( new THREE.MeshLambertMaterial( { map: wheelFaceTex( THREE, key, rimCss, lugCss ) } ), true );
		return new THREE.Mesh( geo, [ side, face, face ] );
	}
	function woodMat( THREE, color ) { return applyAtmosphere( new THREE.MeshLambertMaterial( { color: color, map: woodTex( THREE ) } ), true ); }
	function barnMat( THREE, color ) { return applyAtmosphere( new THREE.MeshLambertMaterial( { color: color, map: barnTex( THREE ) } ), true ); }
	function dirtMat( THREE, color ) { return applyAtmosphere( new THREE.MeshLambertMaterial( { color: color, map: dirtTex( THREE ) } ), true ); }
	function metalMat( THREE, color ) { return applyAtmosphere( new THREE.MeshLambertMaterial( { color: color, map: metalTex( THREE ) } ), true ); }
	function stoneMat( THREE, color ) { return applyAtmosphere( new THREE.MeshLambertMaterial( { color: color, map: stoneTex( THREE ) } ), true ); }
	function leafMat( THREE, color ) { return applyAtmosphere( new THREE.MeshLambertMaterial( { color: color, map: leafTex( THREE ) } ), true ); }
	function skinMat( THREE, color, tex ) { return applyAtmosphere( new THREE.MeshLambertMaterial( { color: color, map: tex } ), true ); }

	function addWindow( THREE, group, w, h, x, y, z, rotY ) {
		var pane = new THREE.Mesh(
			new THREE.PlaneGeometry( w, h ),
			// deep warm amber, sub-1.0 so it can never clip toward white
			new THREE.MeshBasicMaterial( { color: glow( THREE, 0xff9440, 0.95 ) } )
		);
		pane.position.set( x, y, z );
		if ( rotY ) pane.rotation.y = rotY;
		group.add( pane );
	}

	// (the addGlowDisc fake light-pools are GONE — they predated bloom and
	// read as leftover blob shadows once the lights actually glowed)

	function gableRoof( THREE, len, halfWidth, color ) {
		// a REAL gable: two sloped planes to a ridge, closed triangular
		// ends, gentle pitch + eave overhang. (The old 3-sided cylinder
		// read as a giant equilateral wedge — Thomas's "odd triangles".)
		// Vertically it spans eaves −0.5·hw to ridge +0.7·hw so existing
		// caller positions still sit right on their walls.
		var L = len / 2, w = halfWidth * 1.12;
		var lo = -halfWidth * 0.5, hi = halfWidth * 0.7;
		var v = [];
		function push3( a, b, c ) { v.push( a[0],a[1],a[2], b[0],b[1],b[2], c[0],c[1],c[2] ); }
		function quad( a, b, c, d ) { push3( a, b, c ); push3( a, c, d ); }
		quad( [ -L, lo, w ], [ L, lo, w ], [ L, hi, 0 ], [ -L, hi, 0 ] );   // south slope
		quad( [ -L, lo, -w ], [ -L, hi, 0 ], [ L, hi, 0 ], [ L, lo, -w ] ); // north slope
		push3( [ -L, lo, -w ], [ -L, lo, w ], [ -L, hi, 0 ] );              // west gable
		push3( [ L, lo, w ], [ L, lo, -w ], [ L, hi, 0 ] );                 // east gable
		var geo = new THREE.BufferGeometry();
		geo.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( v ), 3 ) );
		var uv = new Float32Array( v.length / 3 * 2 );
		for ( var i = 0, j = 0; i < v.length; i += 3 ) {
			uv[ j++ ] = v[ i ] / 16;
			uv[ j++ ] = ( v[ i + 1 ] + v[ i + 2 ] ) / 16;
		}
		geo.setAttribute( 'uv', new THREE.BufferAttribute( uv, 2 ) );
		geo.computeVertexNormals();
		return new THREE.Mesh( geo, woodMat( THREE, color ) );
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
		// a round bulb, softly lit — warm, never white
		var lantern = new THREE.Mesh( new THREE.SphereGeometry( 1.9, 10, 8 ),
			new THREE.MeshBasicMaterial( { color: glow( THREE, 0xffb45e, 1.05 ) } ) );
		lantern.position.y = beamY + bh / 2 + 3.4;
		g.add( lantern );
		var cap = new THREE.Mesh( new THREE.ConeGeometry( 3.2, 2.8, 4 ), mat( THREE, 0x1c1512 ) );
		cap.position.y = beamY + bh / 2 + 6.6;
		cap.rotation.y = Math.PI / 4;
		g.add( cap );

		g.position.set( px, hillsAt( px, pz ), pz );
		g.rotation.y = Math.atan2( faceX - px, faceZ - pz );
		scene.add( g );
		return g;
	}

	function raiseLandmark( THREE, lm ) {
		var g;
		switch ( lm.build ) {
			case 'farmhouse': g = buildFarmhouse( THREE, lm ); break;
			case 'cookshack': g = buildCookshack( THREE, lm ); break;
			case 'medic': g = buildMedic( THREE, lm ); break;
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

		// (the landmark signposts are retired — the buildings speak for
		// themselves now; only the kids' treehouse nameplates remain)
	}

	/* ------------------------------------------------------------------ *
	 *  The family compound
	 * ------------------------------------------------------------------ */
	function buildCompound( THREE ) {
		// the fence, barrier AND sign are all gone — the kids' pages carry
		// the family login themselves, and their treehouses carry the names
	}

	/* ------------------------------------------------------------------ *
	 *  The buildings
	 * ------------------------------------------------------------------ */
	function buildFarmhouse( THREE, lm ) {
		// the estate build: two storeys, patio wrapping the front + east
		// sides, a second-floor balcony, garden beds behind, shrubs all
		// around. Everything local — the group scales as one.
		var g = new THREE.Group();
		var wallMat = woodMat( THREE, 0x4a3a2c );
		var trimMat = woodMat( THREE, 0x3a2e22 );
		var walls = new THREE.Mesh( new THREE.BoxGeometry( 110, 30, 64 ), wallMat );
		walls.position.y = 15;
		g.add( walls );
		var upper = new THREE.Mesh( new THREE.BoxGeometry( 92, 22, 52 ), wallMat );
		upper.position.set( -6, 41, -3 );
		g.add( upper );
		var roof = gableRoof( THREE, 100, 32, 0x2b2119 );
		roof.position.set( -6, 56, -3 );
		g.add( roof );
		var chim = new THREE.Mesh( new THREE.BoxGeometry( 8, 30, 8 ), mat( THREE, 0x59493c ) );
		chim.position.set( 22, 62, -10 );
		g.add( chim );

		// patio running two sides (front + east), posts and rails
		var patioF = new THREE.Mesh( new THREE.BoxGeometry( 126, 3, 22 ), trimMat );
		patioF.position.set( 4, 1.5, 43 );
		g.add( patioF );
		var patioE = new THREE.Mesh( new THREE.BoxGeometry( 22, 3, 96 ), trimMat );
		patioE.position.set( 66, 1.5, 6 );
		g.add( patioE );
		[ -54, -27, 0, 27, 54 ].forEach( function ( px ) {
			var post = new THREE.Mesh( new THREE.BoxGeometry( 2.6, 12, 2.6 ), trimMat );
			post.position.set( px + 4, 9, 52 );
			g.add( post );
		} );
		[ -36, -6, 24, 50 ].forEach( function ( pz ) {
			var post = new THREE.Mesh( new THREE.BoxGeometry( 2.6, 12, 2.6 ), trimMat );
			post.position.set( 75, 9, pz );
			g.add( post );
		} );
		var railF = new THREE.Mesh( new THREE.BoxGeometry( 126, 1.6, 1.6 ), trimMat );
		railF.position.set( 4, 14, 52 );
		g.add( railF );
		var railE = new THREE.Mesh( new THREE.BoxGeometry( 1.6, 1.6, 96 ), trimMat );
		railE.position.set( 75, 14, 6 );
		g.add( railE );

		// the balcony off the second floor
		var balc = new THREE.Mesh( new THREE.BoxGeometry( 44, 2.5, 14 ), trimMat );
		balc.position.set( -6, 31.5, 29 );
		g.add( balc );
		var balcRail = new THREE.Mesh( new THREE.BoxGeometry( 44, 1.4, 1.4 ), trimMat );
		balcRail.position.set( -6, 39, 35.6 );
		g.add( balcRail );
		[ -26, -6, 14 ].forEach( function ( px ) {
			var bp = new THREE.Mesh( new THREE.BoxGeometry( 1.6, 8, 1.6 ), trimMat );
			bp.position.set( px, 35, 35.6 );
			g.add( bp );
		} );
		var balcDoor = new THREE.Mesh( new THREE.PlaneGeometry( 9, 13 ), mat( THREE, 0x171310 ) );
		balcDoor.position.set( -6, 37.5, 23.2 );
		g.add( balcDoor );

		// door + windows, both floors + east gable
		var door = new THREE.Mesh( new THREE.PlaneGeometry( 10, 16 ), mat( THREE, 0x171310 ) );
		door.position.set( 24, 8, 32.2 );
		g.add( door );
		addWindow( THREE, g, 12, 10, -34, 17, 32.2 );
		addWindow( THREE, g, 12, 10, -4, 17, 32.2 );
		addWindow( THREE, g, 12, 10, 44, 17, 32.2 );
		addWindow( THREE, g, 10, 9, -34, 43, 23.4 );
		addWindow( THREE, g, 10, 9, 22, 43, 23.4 );
		addWindow( THREE, g, 10, 9, 55.2, 17, 0, Math.PI / 2 );
		addWindow( THREE, g, 9, 8, 40.2, 43, -3, Math.PI / 2 );

		// exterior lights: sconces flanking the door, one on the balcony,
		// one over the east patio — plus a warm pool of porch light
		var sconceMat = new THREE.MeshBasicMaterial( { color: glow( THREE, 0xffb45e, 1.05 ) } );
		[ [ 17, 16, 32.6 ], [ 31, 16, 32.6 ], [ -6, 42, 36 ], [ 66, 16, 26 ] ].forEach( function ( sc2 ) {
			var bulb = new THREE.Mesh( new THREE.SphereGeometry( 1.1, 8, 6 ), sconceMat );
			bulb.position.set( sc2[ 0 ], sc2[ 1 ], sc2[ 2 ] );
			g.add( bulb );
			var shade = new THREE.Mesh( new THREE.ConeGeometry( 1.5, 1.4, 6 ), trimMat );
			shade.position.set( sc2[ 0 ], sc2[ 1 ] + 1.4, sc2[ 2 ] );
			g.add( shade );
		} );
		var porchLight = new THREE.PointLight( 0xffb45e, 0.5, 280 );
		porchLight.position.set( 24, 20, 44 );
		g.add( porchLight );

		// the big garden out back: tilled soil beds + a REAL mixed crop —
		// row greens, cabbages, pumpkins — not seven identical spheres
		var soilMat = dirtMat( THREE, 0x33261a );
		var cropMats = [
			leafMat( THREE, 0x2f4a2a ),   // leafy row greens
			leafMat( THREE, 0x3c5a2e ),   // brighter greens
			leafMat( THREE, 0x53705c ),   // blue-green cabbage
			skinMat( THREE, 0xb06a28, dirtTex( THREE ) ) // pumpkin
		];
		for ( var row = 0; row < 3; row++ ) {
			var bed = new THREE.Mesh( new THREE.BoxGeometry( 84, 2, 7 ), soilMat );
			bed.position.set( -8, 1, -44 - row * 11 );
			g.add( bed );
			for ( var vi2 = 0; vi2 < 7; vi2++ ) {
				var kind = ( vi2 + row ) % 4;
				var vr = kind === 3 ? 2.9 : 2 + Math.random() * 1.1;
				var veg = new THREE.Mesh( new THREE.SphereGeometry( vr, 6, 5 ), cropMats[ kind ] );
				if ( kind === 3 ) veg.scale.y = 0.7; // pumpkins squat
				veg.position.set( -44 + vi2 * 12 + ( Math.random() - 0.5 ) * 3,
					kind === 3 ? 2.6 : 3.4, -44 - row * 11 );
				g.add( veg );
			}
		}
		// shrubs hugging the walls — mixed greens, mottled, squashed a touch
		// (the three that had crept into the garden beds are pulled)
		var shrubMats = [ leafMat( THREE, 0x263f24 ), leafMat( THREE, 0x2e4a2a ) ];
		[ [ -60, 38 ], [ -62, 8 ], [ -60, -26 ], [ 34, 52 ], [ 8, 54 ] ].forEach( function ( s, si ) {
			var shrub = new THREE.Mesh( lumpy( new THREE.SphereGeometry( 3 + Math.random() * 1.6, 7, 6 ), 0.26 ),
				shrubMats[ si % 2 ] );
			shrub.scale.y = 0.75 + Math.random() * 0.25;
			shrub.position.set( s[ 0 ], 3, s[ 1 ] );
			g.add( shrub );
		} );

		// the firewood pile — a proper winter's worth, stacked on the west
		// side between two stakes, ring-sawn ends facing out
		var logSide = woodMat( THREE, 0x6b4a2e );
		var logEnd = applyAtmosphere( new THREE.MeshLambertMaterial( { map: logEndTex( THREE ) } ), true );
		var logGeo = new THREE.CylinderGeometry( 1.3, 1.3, 11, 7 );
		logGeo.rotateX( Math.PI / 2 );
		[ 6, 5, 4, 3, 2 ].forEach( function ( rowN, ri ) {
			for ( var li2 = 0; li2 < rowN; li2++ ) {
				var lg = new THREE.Mesh( logGeo, [ logSide, logEnd, logEnd ] );
				lg.position.set( -72 - ri * 0.15 + ( li2 - rowN / 2 ) * 2.75 + ri * 1.35,
					1.3 + ri * 2.3, -14 + ( Math.random() - 0.5 ) * 0.8 );
				lg.rotation.y = ( Math.random() - 0.5 ) * 0.06;
				g.add( lg );
			}
		} );
		[ -81, -63 ].forEach( function ( sx ) {
			var stake = new THREE.Mesh( new THREE.BoxGeometry( 1.6, 14, 1.6 ), trimMat );
			stake.position.set( sx, 7, -14 );
			g.add( stake );
		} );
		var s3 = lm.scale || 1;
		Matter.Composite.add( engine.world, Matter.Bodies.rectangle(
			lm.x - 72 * s3, lm.y - 14 * s3, 22 * s3, 13 * s3, { isStatic: true } ) );

		return g;
	}

	function buildCookshack( THREE, lm ) {
		var g = new THREE.Group();
		var walls = new THREE.Mesh( new THREE.BoxGeometry( 56, 26, 40 ), woodMat( THREE, 0x54402e ) );
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
		return g;
	}

	function buildMedic( THREE, lm ) {
		// the HCS landmark: a field-hospital hut — white canvas over a
		// timber frame, a red cross on every wall that reads from the road,
		// and the white medic flag flying overhead (red cross on white =
		// "help lives here" the world over)
		var g = new THREE.Group();
		var canvas = mat( THREE, 0xe2ddcf );
		var red = mat( THREE, 0xc0392b );
		function cross( w, t, d ) {
			var c = new THREE.Group();
			c.add( new THREE.Mesh( new THREE.BoxGeometry( t, w, d ), red ) );
			c.add( new THREE.Mesh( new THREE.BoxGeometry( w, t, d ), red ) );
			return c;
		}
		var hut = new THREE.Mesh( new THREE.BoxGeometry( 50, 26, 38 ), canvas );
		hut.position.y = 13;
		g.add( hut );
		var roof = gableRoof( THREE, 56, 21, 0xcfc9b8 );
		roof.position.y = 31; // eaves (−0.5·hw) overlap the wall top at 26
		g.add( roof );
		// dark doorway on the road (north) face, cross above it
		var door = new THREE.Mesh( new THREE.BoxGeometry( 10, 16, 1 ), mat( THREE, 0x241f18 ) );
		door.position.set( -14, 8, -19.2 );
		g.add( door );
		// crosses on all four walls — prominent, proud of the canvas
		var cn = cross( 13, 4.4, 1.4 ); cn.position.set( 6, 15, -19.4 ); g.add( cn );
		var cs = cross( 13, 4.4, 1.4 ); cs.position.set( 0, 15, 19.4 ); g.add( cs );
		var cw = cross( 13, 4.4, 1.4 ); cw.rotation.y = Math.PI / 2; cw.position.set( -25.4, 15, 0 ); g.add( cw );
		var ce = cross( 13, 4.4, 1.4 ); ce.rotation.y = Math.PI / 2; ce.position.set( 25.4, 15, 0 ); g.add( ce );
		// canvas awning sheltering the door, on two lashed poles
		var awn = new THREE.Mesh( new THREE.BoxGeometry( 22, 1, 14 ), canvas );
		awn.position.set( -14, 19, -26 );
		awn.rotation.x = 0.18;
		g.add( awn );
		[ -23, -5 ].forEach( function ( px ) {
			var apole = new THREE.Mesh( new THREE.CylinderGeometry( 0.7, 0.9, 17, 5 ), woodMat( THREE, 0x6b5a44 ) );
			apole.position.set( px, 8.5, -31 );
			g.add( apole );
		} );
		// the medic flag: white field, red cross standing proud of BOTH
		// faces so it reads from every approach
		var pole = new THREE.Mesh( new THREE.CylinderGeometry( 0.8, 1.2, 64, 6 ), mat( THREE, 0x6b6257 ) );
		pole.position.set( 29, 32, 13 );
		g.add( pole );
		var flagMat = mat( THREE, 0xf2ede0 );
		flagMat.side = THREE.DoubleSide;
		var flag = new THREE.Mesh( new THREE.PlaneGeometry( 19, 12 ), flagMat );
		flag.position.set( 38.5, 57, 13 );
		g.add( flag );
		var fc = cross( 7.5, 2.6, 0.7 );
		fc.position.set( 38.5, 57, 13 );
		g.add( fc );
		return g;
	}

	function buildChurch( THREE, lm ) {
		// (all y-offsets sit 10 lower than the original build — that gap was
		// the old decorative base mound, whose removal left the church
		// floating at 2.4×)
		var g = new THREE.Group();
		var nave = new THREE.Mesh( new THREE.BoxGeometry( 46, 30, 70 ), stoneMat( THREE, 0xc0c4bb ) );
		nave.position.y = 15;
		g.add( nave );
		var roof = gableRoof( THREE, 76, 26, 0x3a4048 );
		roof.position.y = 34;
		roof.rotation.y = Math.PI / 2;
		g.add( roof );
		var tower = new THREE.Mesh( new THREE.BoxGeometry( 16, 34, 16 ), stoneMat( THREE, 0xc0c4bb ) );
		tower.position.set( 0, 32, 40 );
		g.add( tower );
		var spire = new THREE.Mesh( new THREE.ConeGeometry( 11, 22, 4 ), mat( THREE, 0x3a4048 ) );
		spire.position.set( 0, 60, 40 );
		spire.rotation.y = Math.PI / 4;
		g.add( spire );
		addWindow( THREE, g, 8, 14, -23.2, 14, 0, -Math.PI / 2 );
		addWindow( THREE, g, 8, 14, 23.2, 14, 0, Math.PI / 2 );
		// front window on the TOWER face (z 48), not floating out at z 75
		addWindow( THREE, g, 9, 15, 0, 30, 48.2 );
		return g;
	}

	function buildTreehouse( THREE, lm ) {
		// A cabin genuinely up IN the trees: three trees cradle it, the cabin
		// sits on a stilted deck with a railing, and a ladder climbs the
		// front. The kid's name is a yard signpost planted out front, low to
		// the ground — not stuck on the wall.
		var g = new THREE.Group();
		var kidColor = ( lm && lm.kidColor ) || 0x33261a;
		var bark = 0x2c2418;
		var lms = leafMats( THREE );
		var barkMat = woodMat( THREE, bark );

		// ONE great tree carries the house: a thick trunk rises through the
		// deck and out the roof, with the whole canopy ABOVE the roofline —
		// unmistakably a house built IN a tree
		var deckTop = 35;
		var bigTrunk = new THREE.Mesh( new THREE.CylinderGeometry( 5, 7.5, 100, 7 ), barkMat );
		bigTrunk.position.set( -5, 50, -3 );
		g.add( bigTrunk );
		// canopy: a cluster of lumpy crowns high over the roof
		[ [ -5, 84, -3, 17 ], [ 6, 78, 4, 12 ], [ -14, 76, 3, 11 ], [ -2, 92, 2, 12 ] ].forEach( function ( cn, ci ) {
			var crown = new THREE.Mesh( lumpy( new THREE.SphereGeometry( cn[ 3 ], 8, 6 ), 0.2 ), lms[ ci % 4 ] );
			crown.position.set( cn[ 0 ], cn[ 1 ], cn[ 2 ] );
			g.add( crown );
		} );
		// a big side branch with a ROPE SWING hanging off it
		var branch = new THREE.Mesh( new THREE.CylinderGeometry( 1.4, 1.9, 22, 5 ), barkMat );
		branch.position.set( 6, 66, -3 );
		branch.rotation.z = -1.35;
		g.add( branch );
		[ -2.6, 2.6 ].forEach( function ( rz2 ) {
			var rope = new THREE.Mesh( new THREE.CylinderGeometry( 0.22, 0.22, 24, 4 ), mat( THREE, 0x8a744a ) );
			rope.position.set( 15, 53, -3 + rz2 );
			g.add( rope );
		} );
		var seat2 = new THREE.Mesh( new THREE.BoxGeometry( 3, 1, 7.5 ), woodMat( THREE, 0x6b5236 ) );
		seat2.position.set( 15, 41, -3 );
		g.add( seat2 );
		// two framing trees set well out so they don't swallow the house
		[ [ -28, 8, 60, 10, 38 ], [ 26, 12, 54, 9, 34 ] ].forEach( function ( t, ti ) {
			var trunk = new THREE.Mesh( new THREE.CylinderGeometry( 2.4, 3.4, t[ 2 ] * 0.55, 6 ), barkMat );
			trunk.position.set( t[ 0 ], t[ 2 ] * 0.27, t[ 1 ] );
			g.add( trunk );
			var f1 = new THREE.Mesh( lumpy( new THREE.ConeGeometry( t[ 3 ], t[ 4 ], 7 ), 0.12 ), lms[ ti % 4 ] );
			f1.position.set( t[ 0 ], t[ 2 ] * 0.55 + t[ 4 ] * 0.3, t[ 1 ] );
			g.add( f1 );
		} );

		// the deck, braced FROM the trunk with knee braces (no stilts —
		// treehouses hang off their tree)
		var deck = new THREE.Mesh( new THREE.BoxGeometry( 30, 3, 26 ), woodMat( THREE, 0x5a4630 ) );
		deck.position.y = deckTop - 1.5;
		g.add( deck );
		[ [ -13, -11 ], [ 13, -11 ], [ -13, 11 ], [ 13, 11 ] ].forEach( function ( bc ) {
			var bdx = bc[ 0 ] - ( -5 ), bdz = bc[ 1 ] - ( -3 );
			var blen = Math.sqrt( bdx * bdx + 144 + bdz * bdz ); // 12 down
			var brace = new THREE.Mesh( new THREE.BoxGeometry( 1.8, blen, 1.8 ), barkMat );
			brace.position.set( ( -5 + bc[ 0 ] ) / 2, deckTop - 8, ( -3 + bc[ 1 ] ) / 2 );
			brace.quaternion.setFromUnitVectors( new THREE.Vector3( 0, 1, 0 ),
				new THREE.Vector3( bdx / blen, 12 / blen, bdz / blen ) );
			g.add( brace );
		} );

		// a low railing round the deck, with a gap at front-centre for the ladder
		var railMat = mat( THREE, 0x4a3a28 ), railY = deckTop + 4;
		var railBack = new THREE.Mesh( new THREE.BoxGeometry( 30, 6, 1.6 ), railMat );
		railBack.position.set( 0, railY, -13 );
		g.add( railBack );
		[ -15, 15 ].forEach( function ( x ) {
			var side = new THREE.Mesh( new THREE.BoxGeometry( 1.6, 6, 26 ), railMat );
			side.position.set( x, railY, 0 );
			g.add( side );
		} );
		[ -10.5, 10.5 ].forEach( function ( x ) {
			var frontRail = new THREE.Mesh( new THREE.BoxGeometry( 9, 6, 1.6 ), railMat );
			frontRail.position.set( x, railY, 13 );
			g.add( frontRail );
		} );

		// the cabin: bright playhouse lumber, white window trim, the kid's
		// own colour on the door AND roof, and their flag flying the ridge
		var cabin = new THREE.Mesh( new THREE.BoxGeometry( 22, 17, 18 ), woodMat( THREE, 0x8a6a42 ) );
		cabin.position.y = deckTop + 8.5;
		g.add( cabin );
		var roof = gableRoof( THREE, 26, 13, kidColor );
		roof.position.y = deckTop + 21;
		g.add( roof );
		var door = new THREE.Mesh( new THREE.PlaneGeometry( 6.5, 11.5 ),
			applyAtmosphere( new THREE.MeshLambertMaterial( { color: kidColor } ), true ) );
		door.position.set( 6, deckTop + 5.7, 9.2 );
		g.add( door );
		var winTrim = new THREE.Mesh( new THREE.BoxGeometry( 9.6, 9.6, 0.5 ), woodMat( THREE, 0xd8d3c4 ) );
		winTrim.position.set( -4, deckTop + 9, 9.05 );
		g.add( winTrim );
		addWindow( THREE, g, 8, 8, -4, deckTop + 9, 9.4 ); // warm glowing window
		var flagPole2 = new THREE.Mesh( new THREE.CylinderGeometry( 0.35, 0.35, 8, 4 ), barkMat );
		flagPole2.position.set( 8, deckTop + 30, 0 );
		g.add( flagPole2 );
		var kidFlag = new THREE.Mesh( new THREE.PlaneGeometry( 6, 3.6 ),
			new THREE.MeshBasicMaterial( { color: glow( THREE, kidColor, 1.1 ), side: THREE.DoubleSide } ) );
		kidFlag.position.set( 11.2, deckTop + 32.4, 0 );
		g.add( kidFlag );

		// the ladder up the front to the deck
		[ -3, 3 ].forEach( function ( x ) {
			var rail = new THREE.Mesh( new THREE.BoxGeometry( 1.4, deckTop + 2, 1.4 ), mat( THREE, bark ) );
			rail.position.set( x, ( deckTop + 2 ) / 2, 14.5 );
			g.add( rail );
		} );
		for ( var r = 6; r < deckTop; r += 7 ) {
			var rung = new THREE.Mesh( new THREE.BoxGeometry( 7.5, 1.2, 1.2 ), mat( THREE, bark ) );
			rung.position.set( 0, r, 14.5 );
			g.add( rung );
		}

		// the name: a yard SIGNPOST planted out front, low to the ground
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

			var signZ = 30, plateW = 22, plateH = plateW * 64 / wpx;
			var postH = 15;
			var signPost = new THREE.Mesh( new THREE.BoxGeometry( 2.4, postH, 2.4 ), mat( THREE, 0x3a2c1c ) );
			signPost.position.set( 0, postH / 2, signZ );
			g.add( signPost );
			var tex = new THREE.CanvasTexture( c );
			[ 1, -1 ].forEach( function ( side ) {
				var plate = new THREE.Mesh(
					new THREE.PlaneGeometry( plateW, plateH ),
					new THREE.MeshBasicMaterial( { map: tex } )
				);
				plate.position.set( 0, postH + plateH / 2, signZ + side * 0.4 );
				if ( side < 0 ) plate.rotation.y = Math.PI;
				g.add( plate );
			} );
		}
		return g;
	}

	function buildMast( THREE ) {
		// 2.25× taller — a real broadcast tower with its aircraft beacon
		// blinking at the top, and the BARE YOUR RARE plaque at the base:
		// the rainbow zebra, the symbol of rare disorders
		var g = new THREE.Group();
		var tower = new THREE.Mesh( new THREE.CylinderGeometry( 2.4, 11, 338, 4, 1, true ),
			new THREE.MeshLambertMaterial( { color: 0x6a7076, wireframe: true } ) );
		tower.position.y = 169;
		g.add( tower );
		var spine = new THREE.Mesh( new THREE.CylinderGeometry( 1.2, 1.2, 338, 4 ), mat( THREE, 0x8a9096 ) );
		spine.position.y = 169;
		g.add( spine );
		mastLamp = new THREE.Mesh( new THREE.SphereGeometry( 4.4, 8, 8 ),
			new THREE.MeshBasicMaterial( { color: glow( THREE, 0xff3b30, 1.6 ) } ) );
		mastLamp.position.y = 344;
		g.add( mastLamp );

		// the plaque: the rainbow zebra + the site's name, on two posts
		var zc = document.createElement( 'canvas' );
		zc.width = 128; zc.height = 64;
		var zx = zc.getContext( '2d' );
		zx.fillStyle = '#241f1a'; zx.fillRect( 0, 0, 128, 64 );
		zx.strokeStyle = 'rgba(255,225,180,0.5)'; zx.lineWidth = 3;
		zx.strokeRect( 2, 2, 124, 60 );
		// the zebra: white body, rainbow stripes clipped to it
		zx.save();
		zx.beginPath();
		zx.ellipse( 44, 30, 24, 12, 0, 0, 7 );          // body
		zx.ellipse( 68, 20, 8, 6, -0.5, 0, 7 );         // head/neck
		zx.rect( 26, 36, 5, 14 ); zx.rect( 56, 36, 5, 14 ); // legs
		zx.fillStyle = '#f4f2ea';
		zx.fill();
		zx.clip();
		[ '#d84a30', '#e8963a', '#e8d23a', '#4a9a4a', '#3a6ac8', '#8a4ac8' ].forEach( function ( rc2, ri2 ) {
			zx.fillStyle = rc2;
			zx.fillRect( 22 + ri2 * 9, 8, 4.5, 48 );
		} );
		zx.restore();
		zx.fillStyle = '#ffe3b0';
		zx.font = '700 13px Georgia, serif';
		zx.textAlign = 'center';
		zx.fillText( 'BARE YOUR RARE', 64, 60 );
		[ -9, 9 ].forEach( function ( px2 ) {
			var post = new THREE.Mesh( new THREE.BoxGeometry( 2, 16, 2 ), mat( THREE, 0x3a2c1c ) );
			post.position.set( px2, 8, 16 );
			g.add( post );
		} );
		var plaque = new THREE.Mesh( new THREE.PlaneGeometry( 24, 12 ),
			new THREE.MeshLambertMaterial( { map: new THREE.CanvasTexture( zc ) } ) );
		plaque.position.set( 0, 14, 17.1 );
		g.add( plaque );
		return g;
	}

	function buildBarnHouse( THREE, lm ) {
		// THE BIG RED BARN, rebuilt off Thomas's reference photo: gambrel
		// roof, white trim, hayloft door + octagon window on the gable, and
		// the WEST-end doors slid OPEN so you can drive her right inside —
		// the physics shell (barn branch in the landmark statics) matches.
		var g = new THREE.Group();
		var red = barnMat( THREE, 0x8a2f24 );
		var redDS = barnMat( THREE, 0x8a2f24 );
		redDS.side = THREE.DoubleSide;
		var trim = woodMat( THREE, 0xe2ddd2 );
		// walls as SEGMENTS so the west end truly opens
		var wallN = new THREE.Mesh( new THREE.BoxGeometry( 100, 40, 3 ), red );
		wallN.position.set( 0, 20, -31.5 );
		g.add( wallN );
		var wallS = wallN.clone();
		wallS.position.z = 31.5;
		g.add( wallS );
		var wallE = new THREE.Mesh( new THREE.BoxGeometry( 3, 40, 66 ), red );
		wallE.position.set( 48.5, 20, 0 );
		g.add( wallE );
		[ -1, 1 ].forEach( function ( sd ) {
			var flank = new THREE.Mesh( new THREE.BoxGeometry( 3, 40, 16 ), red );
			flank.position.set( -48.5, 20, sd * 25 );
			g.add( flank );
		} );
		var header = new THREE.Mesh( new THREE.BoxGeometry( 3, 10, 34 ), red );
		header.position.set( -48.5, 35, 0 );
		g.add( header );
		// the doors, slid open along the wall — red with the white X brace
		[ -1, 1 ].forEach( function ( sd ) {
			var door = new THREE.Mesh( new THREE.BoxGeometry( 1.6, 28, 15 ), red );
			door.position.set( -50.6, 14, sd * 26 );
			g.add( door );
			[ -1, 1 ].forEach( function ( xd ) {
				var cross = new THREE.Mesh( new THREE.BoxGeometry( 0.6, 19, 2 ), trim );
				cross.rotation.x = xd * 0.6;
				cross.position.set( -51.6, 14, sd * 26 );
				g.add( cross );
			} );
		} );
		// white door frame
		[ -17.8, 17.8 ].forEach( function ( dz ) {
			var jamb = new THREE.Mesh( new THREE.BoxGeometry( 1.4, 31, 1.8 ), trim );
			jamb.position.set( -49.6, 15.5, dz );
			g.add( jamb );
		} );
		var lintel = new THREE.Mesh( new THREE.BoxGeometry( 1.4, 1.8, 37 ), trim );
		lintel.position.set( -49.6, 30.6, 0 );
		g.add( lintel );
		// GAMBREL roof — steep lower panels breaking to a shallow top,
		// the classic profile from the photo
		var roofM = barnMat( THREE, 0x4a3f38 );
		[ -1, 1 ].forEach( function ( sd ) {
			var lower = new THREE.Mesh( new THREE.BoxGeometry( 108, 1.7, 29.5 ), roofM );
			lower.rotation.x = sd * 0.76;
			lower.position.set( 0, 50, sd * 26 );
			g.add( lower );
			var upper = new THREE.Mesh( new THREE.BoxGeometry( 108, 1.7, 19.5 ), roofM );
			upper.rotation.x = sd * 0.56;
			upper.position.set( 0, 65, sd * 8 );
			g.add( upper );
		} );
		// gable-end pentagons filling under the gambrel
		var pent = new THREE.Shape();
		pent.moveTo( -33, 0 );
		pent.lineTo( 33, 0 );
		pent.lineTo( 16, 20 );
		pent.lineTo( 0, 30 );
		pent.lineTo( -16, 20 );
		pent.closePath();
		var pentGeo = new THREE.ShapeGeometry( pent );
		[ -48.4, 48.4 ].forEach( function ( px ) {
			var endW = new THREE.Mesh( pentGeo, redDS );
			endW.rotation.y = px < 0 ? -Math.PI / 2 : Math.PI / 2;
			endW.position.set( px, 40, 0 );
			g.add( endW );
		} );
		// white corner boards + eave fascia
		[ [ -48.5, -31.5 ], [ -48.5, 31.5 ], [ 48.5, -31.5 ], [ 48.5, 31.5 ] ].forEach( function ( c ) {
			var cb = new THREE.Mesh( new THREE.BoxGeometry( 2.2, 40, 2.2 ), trim );
			cb.position.set( c[ 0 ], 20, c[ 1 ] );
			g.add( cb );
		} );
		[ -1, 1 ].forEach( function ( sd ) {
			var fascia = new THREE.Mesh( new THREE.BoxGeometry( 108, 2, 1.4 ), trim );
			fascia.position.set( 0, 40.6, sd * 33.4 );
			g.add( fascia );
		} );
		// HAYLOFT door + octagon window on the west gable, like the photo
		var loft = new THREE.Mesh( new THREE.BoxGeometry( 1, 12, 11 ), red );
		loft.position.set( -49.4, 50, 0 );
		g.add( loft );
		[ -5.9, 5.9 ].forEach( function ( lz ) {
			var lf = new THREE.Mesh( new THREE.BoxGeometry( 0.8, 13, 1.2 ), trim );
			lf.position.set( -49.8, 50, lz );
			g.add( lf );
		} );
		[ 56.3, 43.7 ].forEach( function ( ly ) {
			var lf2 = new THREE.Mesh( new THREE.BoxGeometry( 0.8, 1.2, 13 ), trim );
			lf2.position.set( -49.8, ly, 0 );
			g.add( lf2 );
		} );
		var octo = new THREE.Mesh( new THREE.CircleGeometry( 2.6, 8 ),
			new THREE.MeshBasicMaterial( { color: 0xe2ddd2 } ) );
		octo.rotation.y = -Math.PI / 2;
		octo.position.set( -49.9, 62, 0 );
		g.add( octo );
		// windows with lit panes on the long walls
		addWindow( THREE, g, 10, 9, -30, 26, 33.2 );
		addWindow( THREE, g, 10, 9, 30, 26, 33.2 );
		addWindow( THREE, g, 10, 9, 0, 26, -33.2, Math.PI );
		// INSIDE: plank floor + a lantern so the open door glows at night
		var floor = new THREE.Mesh( new THREE.PlaneGeometry( 94, 60 ), woodMat( THREE, 0x6a5136 ) );
		floor.rotation.x = -Math.PI / 2;
		floor.position.y = 0.5;
		g.add( floor );
		var lantern = new THREE.Mesh( new THREE.SphereGeometry( 1.6, 8, 6 ),
			new THREE.MeshBasicMaterial( { color: glow( THREE, 0xffb45e, 1.05 ) } ) );
		lantern.position.set( 0, 34, 0 );
		g.add( lantern );
		var inLight = new THREE.PointLight( 0xffb45e, 0.55, 520, 1.4 );
		inLight.position.set( 0, 30, 0 );
		g.add( inLight );
		return g;
	}

	function buildShed( THREE ) {
		var g = new THREE.Group();
		var walls = new THREE.Mesh( new THREE.BoxGeometry( 48, 22, 36 ), barnMat( THREE, 0x3c342a ) );
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
		// LIVING WATER: layered moving ripples, crest sparkles, day/night
		// palette — replaces the flat blue + static glint blobs
		waterMat = new THREE.ShaderMaterial( {
			uniforms: { t: { value: 0 }, night: { value: 0 } },
			vertexShader:
				'varying vec3 vPos; void main(){ vPos = position;' +
				'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }',
			fragmentShader: [
				'uniform float t; uniform float night;',
				'varying vec3 vPos;',
				'void main(){',
				'  float w1 = sin( vPos.x * 0.055 + t * 0.9 ) * sin( vPos.z * 0.047 - t * 0.7 );',
				'  float w2 = sin( ( vPos.x + vPos.z ) * 0.085 - t * 1.25 );',
				'  float w3 = sin( ( vPos.x - vPos.z * 1.3 ) * 0.03 + t * 0.5 );',
				'  float rip = w1 * 0.42 + w2 * 0.36 + w3 * 0.22;',
				'  vec3 deep = mix( vec3(0.085,0.20,0.27), vec3(0.028,0.065,0.10), night );',
				'  vec3 lite = mix( vec3(0.26,0.44,0.50), vec3(0.085,0.15,0.20), night );',
				'  vec3 col = mix( deep, lite, rip * 0.5 + 0.5 );',
				'  float sprk = smoothstep( 0.82, 0.98, rip );',
				'  col += sprk * mix( vec3(0.42,0.46,0.42), vec3(0.20,0.26,0.30), night );',
				'  gl_FragColor = vec4( col, 1.0 );',
				'}'
			].join( '\n' )
		} );
		var water = new THREE.Mesh( geo, waterMat );
		water.position.set( POND.x, POND.waterY, POND.z );
		scene.add( water );
	}

	/* ---- livestock ---- */
	var animals = [], trumacRef = null;

	function buildAnimals( THREE ) {
		// the herd doubled, six more sheep, five horses now
		var cows = [ [ 3063, 1365 ], [ 1575, 2013 ], [ 2713, 910 ], [ 3763, 1540 ],
			[ 2050, 2200 ], [ 2900, 1350 ], [ 1700, 2150 ],
			[ 3400, 1200 ], [ 3050, 1700 ], [ 2500, 1450 ], [ 1450, 1550 ],
			[ 3900, 1900 ], [ 2750, 2050 ], [ 3300, 620 ] ];
		var sheep = [ [ 875, 1050 ], [ 2538, 2188 ], [ 1838, 613 ], [ 3938, 735 ], [ 1225, 1750 ],
			[ 1000, 2100 ], [ 700, 1500 ], [ 2950, 2450 ], [ 3600, 2200 ], [ 1850, 900 ], [ 2450, 300 ] ];
		// (first horse used to spawn IN the pig pen and never left — it
		// lives in the southeast pasture now)
		var horses = [ [ 2560, 1660 ], [ 3350, 1750 ], [ 2900, 1250 ], [ 1350, 1900 ], [ 4150, 1650 ] ];
		cows.forEach( function ( p ) { addAnimal( THREE, 'cow', p[ 0 ], p[ 1 ] ); } );
		sheep.forEach( function ( p ) { addAnimal( THREE, 'sheep', p[ 0 ], p[ 1 ] ); } );
		horses.forEach( function ( p ) { addAnimal( THREE, 'horse', p[ 0 ], p[ 1 ] ); } );
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
		var horse = type === 'horse';
		var cow = type === 'cow' || bull;
		// a HERD, not clones: each animal draws a coat from its breed's
		// palette, wears a hide/wool texture, and comes out its own size
		// BLACK ANGUS across the herd (Thomas's call) — solid black, shade
		// varying just enough that they read as individuals, no hide patches
		var cowCoats = [ 0x191512, 0x120f0c, 0x201b16, 0x16110e ];
		// NO brown horses (Thomas's call) — white, dapple grey, black,
		// palomino, each with its true mane/tail (palomino flies a cream one)
		var horseCoats = [ 0xe6e0d2, 0x9aa0a8, 0x23211f, 0xc9a35e ];
		var horseManes = [ 0xb9b2a2, 0x50555c, 0x0f0d0b, 0xf0e6cc ];
		var hIdx = ( Math.random() * 4 ) | 0;
		var sheepCoats = [ 0xd8d3c4, 0xcac2ae ];
		var bodyC = bull ? 0x14100d
			: ( horse ? horseCoats[ hIdx ]
			: ( cow ? cowCoats[ ( Math.random() * 4 ) | 0 ]
			: sheepCoats[ ( Math.random() * 2 ) | 0 ] ) );
		var headC = bull ? 0x0d0a08
			: ( ( cow || horse ) ? new THREE.Color( bodyC ).multiplyScalar( 0.72 ).getHex() : 0x2a2420 );
		var legC = bull ? 0x0d0a08
			: ( ( cow || horse ) ? new THREE.Color( bodyC ).multiplyScalar( 0.55 ).getHex() : 0x3a342c );
		var coatTex = ( cow || horse ) ? null : woolTex( THREE ); // Angus wear solid black
		var bodyMat = coatTex ? skinMat( THREE, bodyC, coatTex ) : mat( THREE, bodyC );
		var bw = horse ? 22 : ( cow ? 20 : 13 );
		var bh = horse ? 11 : ( cow ? 11 : 8.5 );
		var bd = horse ? 8 : ( cow ? 10 : 9 );
		// real cattle legs — 6 read as a pig on stumps
		var legH = horse ? 9 : ( cow ? 9 : 4 );
		// yaw (heading) first, then z-pitch in the yawed frame — the graze
		// lean below stays nose-down whichever way the animal faces
		g.rotation.order = 'YZX';
		var legs = [];
		[ [ 1, 1 ], [ 1, -1 ], [ -1, 1 ], [ -1, -1 ] ].forEach( function ( c ) {
			var lx = c[ 0 ] * ( bw / 2 - 2 ), lz = c[ 1 ] * ( bd / 2 - 1.5 );
			var leg = new THREE.Mesh( new THREE.BoxGeometry( 1.6, legH, 1.6 ), mat( THREE, legC ) );
			leg.position.set( lx, legH / 2, lz );
			g.add( leg );
			legs.push( leg );
			// dark hooves ground the cattle + horses
			if ( cow || horse ) {
				var hoof = new THREE.Mesh( new THREE.BoxGeometry( 2, 1.4, 2 ), mat( THREE, 0x181410 ) );
				hoof.position.set( lx, 0.7, lz );
				g.add( hoof );
			}
		} );
		// sheep are WOOLLY now — a lumpy fleece blob, not a crate; cattle
		// and horses get rounded chest + rump so the silhouette reads flesh
		var body;
		if ( type === 'sheep' ) {
			body = new THREE.Mesh( lumpy( new THREE.SphereGeometry( bw * 0.62, 9, 7 ), 0.24 ), bodyMat );
			body.scale.set( 1.15, 0.85, 0.8 );
		} else {
			// a real BARREL, not a crate: ellipsoid torso — the chest/rump
			// spheres below finish the rounding ("not Minecraft" pass);
			// cattle ride slimmer through the flanks (the fat ellipsoid on
			// short legs was reading PIG)
			body = new THREE.Mesh( new THREE.SphereGeometry( 1, 12, 9 ), bodyMat );
			body.scale.set( bw * 0.55, bh * 0.62, bd * ( cow ? 0.58 : 0.66 ) );
		}
		body.position.y = legH + bh / 2 - 0.5;
		g.add( body );
		if ( cow || horse ) {
			var chest = new THREE.Mesh( new THREE.SphereGeometry( bd * 0.55, 9, 7 ), bodyMat );
			chest.scale.set( 1.05, ( bh / bd ) * 0.92, 1 );
			chest.position.set( bw / 2 - 2.5, legH + bh / 2 - 0.5, 0 );
			g.add( chest );
			var rump = chest.clone();
			rump.position.x = -bw / 2 + 2.5;
			g.add( rump );
		}
		var head = new THREE.Mesh(
			new THREE.BoxGeometry( cow ? 7 : 5, cow ? 7 : 5, cow ? 6 : 4.5 ), mat( THREE, headC ) );
		head.position.set( bw / 2 + 2, legH + bh - 1, 0 );
		g.add( head );
		if ( cow ) {
			// snout, ears, tail — the details that make a box read as a cow
			var snout = new THREE.Mesh( new THREE.BoxGeometry( 2.2, 3, 4.2 ),
				mat( THREE, new THREE.Color( bodyC ).multiplyScalar( 1.35 ).getHex() ) );
			snout.position.set( bw / 2 + 6.4, legH + bh - 2.6, 0 );
			g.add( snout );
			[ -1, 1 ].forEach( function ( sd ) {
				var ear = new THREE.Mesh( new THREE.BoxGeometry( 1.2, 1.6, 2.8 ), mat( THREE, headC ) );
				ear.position.set( bw / 2 + 2, legH + bh + 2.8, sd * 4.2 );
				g.add( ear );
			} );
			var tail = new THREE.Mesh( new THREE.BoxGeometry( 1.1, 7, 1.1 ), mat( THREE, legC ) );
			tail.position.set( -bw / 2 - 0.6, legH + bh - 3.2, 0 );
			tail.rotation.z = 0.16;
			g.add( tail );
			// Angus are POLLED — no horns on the cows (Trumac keeps his);
			// half the herd carries an udder
			if ( ! bull && Math.random() < 0.5 ) {
				var udder = new THREE.Mesh( new THREE.SphereGeometry( 2.4, 8, 6 ), mat( THREE, 0xd8a090 ) );
				udder.scale.set( 1.1, 0.75, 0.95 );
				udder.position.set( -bw / 2 + 6, legH - 1.8, 0 );
				g.add( udder );
			}
		}
		if ( type === 'sheep' ) {
			[ -1, 1 ].forEach( function ( sd ) {
				var ear = new THREE.Mesh( new THREE.BoxGeometry( 1, 1.3, 2.2 ), mat( THREE, 0x2a2420 ) );
				ear.position.set( bw / 2 + 2, legH + bh + 1.4, sd * 3 );
				g.add( ear );
			} );
			// a wool cap over the dark face + a stubby fleece tail
			var cap = new THREE.Mesh( lumpy( new THREE.SphereGeometry( 2.7, 8, 6 ), 0.22 ), bodyMat );
			cap.scale.set( 1, 0.7, 1.05 );
			cap.position.set( bw / 2 + 1.6, legH + bh + 2.6, 0 );
			g.add( cap );
			var stub = new THREE.Mesh( lumpy( new THREE.SphereGeometry( 1.7, 7, 5 ), 0.25 ), bodyMat );
			stub.position.set( -bw * 0.68, legH + bh - 1.5, 0 );
			g.add( stub );
		}
		if ( ! bull ) {
			// horses run a head taller than the cattle — no more (the old
			// 1.55–1.9 was sized for the plank build; with the real neck +
			// head they'd grown into giraffes)
			var js = horse ? 1.18 + Math.random() * 0.17 : 0.88 + Math.random() * 0.26;
			g.scale.set( js, js, js );
		}
		if ( horse ) {
			// a HEAD, not a plank: angled skull with a narrower muzzle
			// dropping off it, forelock between pricked ears — the profile
			// finally reads horse
			head.geometry = new THREE.BoxGeometry( 5.6, 4.2, 3.2 );
			head.position.set( bw / 2 + 5.2, legH + bh + 6.4, 0 );
			head.rotation.z = -0.45;
			var muzzle = new THREE.Mesh( new THREE.BoxGeometry( 4, 2.7, 2.4 ), mat( THREE, headC ) );
			muzzle.position.set( bw / 2 + 8.6, legH + bh + 4.6, 0 );
			muzzle.rotation.z = -0.45;
			g.add( muzzle );
			// arched, tapered neck in the coat colour
			var neck = new THREE.Mesh( new THREE.CylinderGeometry( 1.9, 3, 11, 7 ), bodyMat );
			neck.position.set( bw / 2 + 0.5, legH + bh + 1.6, 0 );
			neck.rotation.z = -0.38;
			g.add( neck );
			var mane = new THREE.Mesh( new THREE.BoxGeometry( 1.5, 10, 1.6 ), mat( THREE, horseManes[ hIdx ] ) );
			mane.position.set( bw / 2 - 2.2, legH + bh + 3.2, 0 );
			mane.rotation.z = -0.38;
			g.add( mane );
			var forelock = new THREE.Mesh( new THREE.BoxGeometry( 2, 1.4, 1.8 ), mat( THREE, horseManes[ hIdx ] ) );
			forelock.position.set( bw / 2 + 3.4, legH + bh + 8.6, 0 );
			g.add( forelock );
			[ -1, 1 ].forEach( function ( sd ) {
				var ear = new THREE.Mesh( new THREE.BoxGeometry( 1, 2.4, 1 ), mat( THREE, headC ) );
				ear.position.set( bw / 2 + 4.4, legH + bh + 9.6, sd * 1.5 );
				g.add( ear );
			} );
			// the tail HANGS — full at the dock, tapering as it falls
			var tail = new THREE.Mesh( new THREE.CylinderGeometry( 1.6, 0.6, 9, 5 ), mat( THREE, horseManes[ hIdx ] ) );
			tail.position.set( -bw / 2 - 1.6, legH + bh - 3.5, 0 );
			tail.rotation.z = 0.5;
			g.add( tail );
		}
		if ( bull ) {
			[ -1, 1 ].forEach( function ( sd ) {
				var horn = new THREE.Mesh( new THREE.BoxGeometry( 1.4, 1.4, 4.2 ), mat( THREE, 0xcfc8b8 ) );
				horn.position.set( bw / 2 + 2, legH + bh + 2.2, sd * 4.4 );
				g.add( horn );
			} );
			g.scale.set( 1.43, 1.43, 1.43 ); // +10% — Trumac earned it
		}
		scene.add( g );
		var body2d = Matter.Bodies.circle( x, z, bull ? 17 : ( horse ? 17 : ( cow ? 11 : 7 ) ),
			{ frictionAir: 0.18, density: bull ? 0.006 : ( horse ? 0.0035 : 0.003 ) } );
		Matter.Composite.add( engine.world, body2d );
		var entry = { g: g, body: body2d, type: type, wanderT: 800 + Math.random() * 2400,
			walkT: 0, walkDir: 0, legs: legs, phase: Math.random() * 6.28,
			grazeT: 1500 + Math.random() * 4000, graze: 0, grazeOn: false };
		animals.push( entry );
		return entry;
	}

	function updateAnimals( dms ) {
		for ( var i = 0; i < animals.length; i++ ) {
			var a = animals[ i ];
			a.wanderT -= dms;
			if ( a.wanderT <= 0 ) {
				a.wanderT = 1100 + Math.random() * 2100;
				if ( Math.random() < 0.85 ) {
					// a real WALK, not a nudge — the old single impulse died
					// to friction in under a second, so the herd stood like
					// statues. Now a heading is held for a stretch.
					a.walkDir = Math.random() * Math.PI * 2;
					a.walkT = 1400 + Math.random() * 3200;
				}
			}
			if ( a.walkT > 0 ) {
				a.walkT -= dms;
				var spd = a.type === 'bull' ? 0.4
					: ( a.type === 'cow' ? 0.5 : ( a.type === 'horse' ? 0.65 : 0.7 ) );
				Matter.Body.setVelocity( a.body,
					{ x: Math.cos( a.walkDir ) * spd, y: Math.sin( a.walkDir ) * spd } );
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
			var s = Math.hypot( v.x, v.y );
			if ( s > 0.15 ) {
				a.g.rotation.y = -Math.atan2( v.y, v.x );
			}
			// gait + grazing — the herd moves like it's alive now. Walking
			// swings the legs in diagonal (trot) pairs with a slight body
			// bob; standing settles the legs, then the head drops into a
			// nose-down graze lean for a while
			if ( s > 0.15 ) {
				a.phase += dms * ( 0.011 + s * 0.004 );
				a.graze = Math.max( 0, a.graze - dms * 0.004 );
				a.g.position.y += Math.abs( Math.sin( a.phase ) ) * 0.6;
			} else {
				a.phase += ( Math.round( a.phase / Math.PI ) * Math.PI - a.phase ) * 0.2;
				a.grazeT -= dms;
				if ( a.grazeT <= 0 ) {
					a.grazeT = 2200 + Math.random() * 5200;
					a.grazeOn = ! a.grazeOn && a.type !== 'bull'; // Trumac doesn't bow
				}
				a.graze += ( ( a.grazeOn ? 1 : 0 ) - a.graze ) * Math.min( 1, dms * 0.003 );
			}
			var sw = Math.sin( a.phase ) * Math.min( 0.38, s * 0.5 );
			for ( var li = 0; li < a.legs.length; li++ ) {
				a.legs[ li ].rotation.z = ( li === 0 || li === 3 ) ? sw : -sw;
			}
			a.g.rotation.z = -a.graze * 0.14;
			a.g.position.y -= a.graze * 1.2;
		}
	}

	/* ---- the old tractor — she does her own rounds now ---- */
	var tractor = null;

	function buildTractor( THREE ) {
		// the old girl, levelled up: weathered two-tone paint, lugged rear
		// wheels with red rims, a proper stack with a rain cap, fenders,
		// pan seat + steering wheel, front weights, canopy, amber beacon
		var g = new THREE.Group();
		var red = skinMat( THREE, 0x9a3f2e, metalTex( THREE ) );   // worn paint
		var redDark = skinMat( THREE, 0x7e3225, metalTex( THREE ) );
		var creamT = skinMat( THREE, 0xd8cdb0, metalTex( THREE ) );
		var darkMat = mat( THREE, 0x1c1512 );
		var tWheels = [], tSteer = [];
		[ 13, -13 ].forEach( function ( z ) {
			var rw = makeWheel( THREE, 11, 5.5, 'wheelTracR', '#a83a28', '#d8cdb0' );
			rw.position.set( -10, 11, z );
			g.add( rw );
			tWheels.push( rw );
			// fronts in a yaw pivot — they lean into her slow turns
			var fw = makeWheel( THREE, 6.5, 4, 'wheelTracF', '#a83a28', '#d8cdb0' );
			var fp = new THREE.Group();
			fp.position.set( 14, 6.5, z * 0.8 );
			fp.add( fw );
			g.add( fp );
			tWheels.push( fw );
			tSteer.push( fp );
		} );
		var chassis = new THREE.Mesh( new THREE.BoxGeometry( 34, 8, 18 ), red );
		chassis.position.set( 2, 14, 0 );
		g.add( chassis );
		var hood = new THREE.Mesh( new THREE.BoxGeometry( 16, 10, 14 ), redDark );
		hood.position.set( 10, 20, 0 );
		g.add( hood );
		// cream side stripe along the hood — the classic livery line
		[ -1, 1 ].forEach( function ( sd ) {
			var st = new THREE.Mesh( new THREE.BoxGeometry( 15.6, 1.6, 0.5 ), creamT );
			st.position.set( 10, 21.5, sd * 7.1 );
			g.add( st );
		} );
		// grille slats on the nose
		var gc2 = document.createElement( 'canvas' );
		gc2.width = 32; gc2.height = 64;
		var gx2 = gc2.getContext( '2d' );
		gx2.fillStyle = '#241f1a'; gx2.fillRect( 0, 0, 32, 64 );
		gx2.fillStyle = '#3a342c';
		for ( var gi2 = 2; gi2 < 64; gi2 += 8 ) gx2.fillRect( 2, gi2, 28, 4 );
		var grille2 = new THREE.Mesh( new THREE.PlaneGeometry( 11, 8 ),
			new THREE.MeshLambertMaterial( { map: new THREE.CanvasTexture( gc2 ) } ) );
		grille2.position.set( 18.06, 19.5, 0 );
		grille2.rotation.y = Math.PI / 2;
		g.add( grille2 );
		// fenders arch over the rear wheels
		[ 13, -13 ].forEach( function ( z ) {
			var fen = new THREE.Mesh( new THREE.BoxGeometry( 15, 2, 6.5 ), redDark );
			fen.position.set( -10, 23.4, z );
			g.add( fen );
			var fenB = new THREE.Mesh( new THREE.BoxGeometry( 2, 6, 6.5 ), redDark );
			fenB.position.set( -17.5, 20.5, z );
			g.add( fenB );
		} );
		// pan seat on a sprung post + steering wheel off the dash
		var post = new THREE.Mesh( new THREE.CylinderGeometry( 1, 1.4, 6, 6 ), darkMat );
		post.position.set( -12, 21, 0 );
		g.add( post );
		var pan = new THREE.Mesh( new THREE.CylinderGeometry( 4.2, 3.4, 1.6, 10 ), darkMat );
		pan.position.set( -12, 24.4, 0 );
		g.add( pan );
		var col2 = new THREE.Mesh( new THREE.CylinderGeometry( 0.6, 0.6, 7, 6 ), darkMat );
		col2.position.set( -3, 22.5, 0 );
		col2.rotation.z = 0.7;
		g.add( col2 );
		var sw = new THREE.Mesh( new THREE.TorusGeometry( 3, 0.5, 6, 12 ), darkMat );
		sw.position.set( -5, 25, 0 );
		sw.rotation.y = Math.PI / 2;
		sw.rotation.z = 0.7;
		g.add( sw );
		// the STACK — vertical exhaust with a tilted rain cap, plus the
		// air-cleaner canister beside it
		var stack = new THREE.Mesh( new THREE.CylinderGeometry( 1.2, 1.4, 14, 6 ), darkMat );
		stack.position.set( 13, 32, 3.5 );
		g.add( stack );
		var rainCap = new THREE.Mesh( new THREE.BoxGeometry( 3.4, 0.8, 2.4 ), darkMat );
		rainCap.position.set( 13, 39.4, 3.5 );
		rainCap.rotation.z = 0.5;
		g.add( rainCap );
		var airC = new THREE.Mesh( new THREE.CylinderGeometry( 1.6, 1.6, 5, 6 ), darkMat );
		airC.position.set( 9, 27.5, -3.5 );
		g.add( airC );
		// front suitcase weights
		var weights = new THREE.Mesh( new THREE.BoxGeometry( 3.5, 6, 10 ), darkMat );
		weights.position.set( 20.5, 11, 0 );
		g.add( weights );
		// open-station canopy on four posts, cream — prairie sun is real
		[ [ -2, 8 ], [ -2, -8 ], [ -17, 8 ], [ -17, -8 ] ].forEach( function ( cp ) {
			var cpost = new THREE.Mesh( new THREE.CylinderGeometry( 0.6, 0.6, 14, 5 ), darkMat );
			cpost.position.set( cp[ 0 ], 30, cp[ 1 ] );
			g.add( cpost );
		} );
		var canopy = new THREE.Mesh( new THREE.BoxGeometry( 22, 1.6, 20 ), creamT );
		canopy.position.set( -9.5, 37.5, 0 );
		g.add( canopy );
		// amber beacon on the canopy lip — blinks alive under bloom
		var beacon = new THREE.Mesh( new THREE.SphereGeometry( 1.3, 8, 6 ),
			new THREE.MeshBasicMaterial( { color: glow( THREE, 0xffa03a, 1.6 ) } ) );
		beacon.position.set( -9.5, 39, 8 );
		g.add( beacon );
		// rear drawbar hitch
		var hitch = new THREE.Mesh( new THREE.BoxGeometry( 6, 1.6, 3 ), darkMat );
		hitch.position.set( -18, 12, 0 );
		g.add( hitch );
		// she hauls a round bale on the FRONT LOADER — arms up from the
		// chassis, crossbar, spear, bale held proud out front
		[ -6, 6 ].forEach( function ( az2 ) {
			var arm2 = new THREE.Mesh( new THREE.BoxGeometry( 22, 2, 2 ), redDark );
			arm2.position.set( 12, 20, az2 );
			arm2.rotation.z = 0.35;
			g.add( arm2 );
		} );
		var crossbar = new THREE.Mesh( new THREE.BoxGeometry( 2, 2, 14 ), darkMat );
		crossbar.position.set( 22, 23.5, 0 );
		g.add( crossbar );
		var spear = new THREE.Mesh( new THREE.CylinderGeometry( 0.8, 0.4, 10, 5 ), darkMat );
		spear.rotation.z = Math.PI / 2;
		spear.position.set( 27, 22, 0 );
		g.add( spear );
		var haul = makeBaleMesh( THREE );
		haul.rotation.y = Math.PI / 2; // spiral ends face the sides, like the photo
		haul.position.set( 31, 22, 0 );
		g.add( haul );

		var lm = { id: 'tractor', name: 'the old tractor', x: 2730, y: 630, href: null,
			prompt: 'The old girl still runs — she does her own rounds now' };
		g.position.set( lm.x, hillsAt( lm.x, lm.y ), lm.y );
		g.userData.lm = lm;
		scene.add( g );
		clickables.push( g );
		PROMPTS.push( lm );
		var body = Matter.Bodies.circle( lm.x, lm.y, 20, { frictionAir: 0.12, density: 0.004 } );
		Matter.Composite.add( engine.world, body );
		tractor = { g: g, body: body, lm: lm, wheels: tWheels, steer: tSteer,
			angle: -0.6, turn: 0, turnT: 1500 };
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
		for ( var ts = 0; ts < tractor.steer.length; ts++ ) tractor.steer[ ts ].rotation.y = -tractor.turn * 22;
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
		var postMat = barnMat( THREE, 0x4a4034 );
		var dx = x1 - x0, dz = z1 - z0;
		var len = Math.hypot( dx, dz ), n = Math.max( 1, Math.round( len / 34 ) );
		for ( var i = 0; i <= n; i++ ) {
			var px = x0 + dx * ( i / n ), pz = z0 + dz * ( i / n );
			var p = new THREE.Mesh( new THREE.BoxGeometry( 2.2, 10, 2.2 ), postMat );
			p.position.set( px, hillsAt( px, pz ) + 5, pz );
			scene.add( p );
		}
		var penTex = barnTex( THREE ).clone();
		penTex.needsUpdate = true;
		penTex.repeat.set( Math.max( 2, len / 26 ), 0.6 );
		var rail = new THREE.Mesh( new THREE.BoxGeometry( len, 1.5, 1.5 ),
			applyAtmosphere( new THREE.MeshLambertMaterial( { color: 0x4a4034, map: penTex } ), true ) );
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
		g.scale.set( 2, 2, 2 );
		scene.add( g );
		Matter.Composite.add( engine.world,
			Matter.Bodies.rectangle( COOP.x, COOP.z, 56, 44, { isStatic: true } ) );
		// open pen east of the hut (the girls come and go as they please)
		penRun( THREE, COOP.x + 36, COOP.z - 68, COOP.x + 156, COOP.z - 68 );
		penRun( THREE, COOP.x + 156, COOP.z - 68, COOP.x + 156, COOP.z + 68 );
		penRun( THREE, COOP.x + 36, COOP.z + 68, COOP.x + 156, COOP.z + 68 );
		PROMPTS.push( { id: 'coop', name: 'the chicken coop', x: COOP.x, y: COOP.z, href: null,
			prompt: 'The coop — mind the girls' } );
	}

	/* ---- the peacock — he patrols the treehouse grounds like he owns
	 *      them, train fanned, unbothered by anything but the buggy ---- */
	var peacock = null;

	function peacockTrainTex( THREE ) {
		return cacheTex( THREE, 'peacock', function ( x ) {
			x.clearRect( 0, 0, 128, 128 );
			// the fan — deep teal at the root blooming green toward the rim
			var grad = x.createRadialGradient( 64, 122, 8, 64, 122, 118 );
			grad.addColorStop( 0, 'rgba(10,58,44,0.98)' );
			grad.addColorStop( 0.55, 'rgba(18,96,62,0.97)' );
			grad.addColorStop( 0.85, 'rgba(30,128,78,0.96)' );
			grad.addColorStop( 1, 'rgba(56,152,92,0.9)' );
			x.fillStyle = grad;
			x.beginPath();
			x.moveTo( 64, 122 );
			x.arc( 64, 122, 117, Math.PI + 0.24, -0.24 );
			x.closePath();
			x.fill();
			// individual feather rays
			x.strokeStyle = 'rgba(8,44,30,0.5)';
			x.lineWidth = 1.2;
			for ( var r = 0; r < 17; r++ ) {
				var an0 = Math.PI + 0.3 + ( r / 16 ) * ( Math.PI - 0.6 );
				x.beginPath();
				x.moveTo( 64 + Math.cos( an0 ) * 12, 122 + Math.sin( an0 ) * 12 );
				x.lineTo( 64 + Math.cos( an0 ) * 115, 122 + Math.sin( an0 ) * 115 );
				x.stroke();
			}
			// TWO arcs of eyespots — gold ring, violet, sapphire, teal spark
			function eye( ex2, ey, s ) {
				x.fillStyle = '#e6c04a';
				x.beginPath(); x.arc( ex2, ey, 6.5 * s, 0, 7 ); x.fill();
				x.fillStyle = '#7a3fa0';
				x.beginPath(); x.arc( ex2, ey, 4.6 * s, 0, 7 ); x.fill();
				x.fillStyle = '#123c8a';
				x.beginPath(); x.arc( ex2, ey, 3.1 * s, 0, 7 ); x.fill();
				x.fillStyle = '#39c8d8';
				x.beginPath(); x.arc( ex2, ey, 1.4 * s, 0, 7 ); x.fill();
			}
			for ( var e = 0; e < 11; e++ ) {
				var an = Math.PI + 0.42 + ( e / 10 ) * ( Math.PI - 0.84 );
				eye( 64 + Math.cos( an ) * 96, 122 + Math.sin( an ) * 96, 1.05 );
			}
			for ( var e2 = 0; e2 < 7; e2++ ) {
				var an2 = Math.PI + 0.55 + ( e2 / 6 ) * ( Math.PI - 1.1 );
				eye( 64 + Math.cos( an2 ) * 62, 122 + Math.sin( an2 ) * 62, 0.8 );
			}
		} );
	}

	function buildPeacock( THREE ) {
		var g = new THREE.Group();
		// iridescent royal blue — the only Phong specular on the farm, so
		// he SHIMMERS as the light moves. Magnificence is the whole job.
		var blue = applyAtmosphere( new THREE.MeshPhongMaterial( {
			color: 0x1d4fae, specular: 0x5fe8c8, shininess: 42, emissive: 0x071a3a } ), true );
		var body = new THREE.Mesh( new THREE.SphereGeometry( 3.4, 10, 8 ), blue );
		body.scale.set( 1.15, 0.95, 0.82 );
		body.position.y = 5.8;
		g.add( body );
		var breast = new THREE.Mesh( new THREE.SphereGeometry( 2.1, 9, 7 ), blue );
		breast.position.set( 2.2, 5.6, 0 );
		g.add( breast );
		// folded wing panels, a shade deeper
		var wingM = mat( THREE, 0x14406e );
		[ -1, 1 ].forEach( function ( s ) {
			var wing = new THREE.Mesh( new THREE.SphereGeometry( 2.4, 8, 6 ), wingM );
			wing.scale.set( 1.25, 0.7, 0.45 );
			wing.position.set( -0.6, 6, s * 2.6 );
			g.add( wing );
		} );
		// the S-neck: tapered, with a round head riding high
		var neck = new THREE.Mesh( new THREE.CylinderGeometry( 0.7, 1.2, 7, 7 ), blue );
		neck.position.set( 2.8, 9.6, 0 );
		neck.rotation.z = -0.14;
		g.add( neck );
		var head = new THREE.Mesh( new THREE.SphereGeometry( 1.4, 9, 7 ), blue );
		head.position.set( 3.4, 13.4, 0 );
		g.add( head );
		// white face flashes + gold beak
		[ -1, 1 ].forEach( function ( s ) {
			var cheek = new THREE.Mesh( new THREE.BoxGeometry( 0.9, 0.7, 0.3 ), mat( THREE, 0xe8e4da ) );
			cheek.position.set( 4.1, 13.2, s * 0.9 );
			g.add( cheek );
		} );
		var beak = new THREE.Mesh( new THREE.ConeGeometry( 0.55, 1.6, 5 ), mat( THREE, 0xd8a23a ) );
		beak.rotation.z = -Math.PI / 2;
		beak.position.set( 5.2, 13.1, 0 );
		g.add( beak );
		// the CROWN — five pin feathers tipped in teal
		for ( var c = 0; c < 5; c++ ) {
			var ca = ( c - 2 ) * 0.28;
			var pin = new THREE.Mesh( new THREE.CylinderGeometry( 0.09, 0.09, 1.9, 4 ), mat( THREE, 0x123c6a ) );
			pin.position.set( 3.4 + Math.sin( ca ) * 0.5, 15.1, Math.sin( ca ) * 0.9 );
			pin.rotation.x = ca * 0.6;
			g.add( pin );
			var tip = new THREE.Mesh( new THREE.SphereGeometry( 0.3, 6, 5 ), mat( THREE, 0x2fb8a8 ) );
			tip.position.set( pin.position.x, 16.1, pin.position.z );
			g.add( tip );
		}
		[ -1.4, 1.4 ].forEach( function ( lz ) {
			var leg = new THREE.Mesh( new THREE.BoxGeometry( 0.6, 3.4, 0.6 ), mat( THREE, 0x8a7a4a ) );
			leg.position.set( 0, 1.7, lz );
			g.add( leg );
		} );
		// THE TRAIN — three nested fans, nearly twice his height, that
		// breathe in updatePeacock (slow regal sway + shimmer pulse)
		var trainMat = new THREE.MeshLambertMaterial( {
			map: peacockTrainTex( THREE ), transparent: true, side: THREE.DoubleSide } );
		var train = new THREE.Group();
		[ [ 21, 18, 0 ], [ 16.5, 14, 0.15 ], [ 12.5, 10.5, 0.3 ] ].forEach( function ( ly, li ) {
			var layer = new THREE.Mesh( new THREE.PlaneGeometry( ly[ 0 ], ly[ 1 ] ), trainMat );
			layer.position.set( li * 0.7, ly[ 1 ] / 2 - 2, 0 );
			layer.rotation.y = Math.PI / 2;
			layer.rotation.x = -ly[ 2 ];
			train.add( layer );
		} );
		train.position.set( -3.8, 7.5, 0 );
		train.rotation.x = -0.22;
		g.add( train );
		// tail coverts — a teal tuft rooting the fan to the body
		var covert = new THREE.Mesh( new THREE.ConeGeometry( 1.9, 4.4, 7 ), mat( THREE, 0x1a7a6a ) );
		covert.rotation.z = 0.9;
		covert.position.set( -3.2, 6.4, 0 );
		g.add( covert );
		g.scale.setScalar( 1.5 );
		scene.add( g );
		var body2d = Matter.Bodies.circle( 1631, 1210, 7, { frictionAir: 0.22, density: 0.0008 } );
		Matter.Composite.add( engine.world, body2d );
		peacock = { g: g, body: body2d, train: train, t: Math.random() * 6,
			homeX: 1631, homeZ: 1281, wanderT: 900, cd: 0 };
		PROMPTS.push( { id: 'peacock', name: 'the peacock', x: 1631, y: 1210, href: null,
			prompt: 'The peacock — he thinks the treehouses are his' } );
	}

	function updatePeacock( dms ) {
		if ( ! peacock ) return;
		var p = peacock;
		p.wanderT -= dms;
		p.cd -= dms;
		var px = p.body.position.x, pz = p.body.position.y;
		if ( p.wanderT <= 0 ) {
			p.wanderT = 1400 + Math.random() * 2600;
			var dir = Math.hypot( px - p.homeX, pz - p.homeZ ) > 180
				? Math.atan2( p.homeZ - pz, p.homeX - px )
				: Math.random() * Math.PI * 2;
			Matter.Body.setVelocity( p.body, { x: Math.cos( dir ) * 0.45, y: Math.sin( dir ) * 0.45 } );
		}
		var b = buggyBody;
		if ( p.cd <= 0 && Math.hypot( px - b.position.x, pz - b.position.y ) < 50 &&
		     Math.hypot( b.velocity.x, b.velocity.y ) > 1 ) {
			p.cd = 1400;
			var fa = Math.atan2( pz - b.position.y, px - b.position.x );
			Matter.Body.setVelocity( p.body, { x: Math.cos( fa ) * 2, y: Math.sin( fa ) * 2 } );
		}
		// the train BREATHES — a slow regal sway and a shimmer pulse
		p.t += dms / 1000;
		if ( p.train ) {
			p.train.rotation.x = -0.22 + Math.sin( p.t * 0.9 ) * 0.05;
			p.train.rotation.z = Math.sin( p.t * 0.6 ) * 0.04;
			var ts2 = 1 + Math.sin( p.t * 1.3 ) * 0.025;
			p.train.scale.set( ts2, ts2, ts2 );
		}
		p.g.position.set( px, heightAt( px, pz ), pz );
		var v = p.body.velocity;
		if ( Math.hypot( v.x, v.y ) > 0.1 ) p.g.rotation.y = -Math.atan2( v.y, v.x );
		// keep his prompt where he is
		for ( var i = 0; i < PROMPTS.length; i++ ) {
			if ( PROMPTS[ i ].id === 'peacock' ) { PROMPTS[ i ].x = px; PROMPTS[ i ].y = pz; break; }
		}
	}

	/* ---- the farm dogs: the yard dog holds the pens, the road dog
	 *      tags along after the buggy — every farm has a couple ---- */
	var dogs = [];

	function buildDog( THREE, x, z, coat, chest, role ) {
		var g = new THREE.Group();
		var coatM = skinMat( THREE, coat, hideTex( THREE ) );
		var chestM = mat( THREE, chest );
		[ [ 1, 1 ], [ 1, -1 ], [ -1, 1 ], [ -1, -1 ] ].forEach( function ( c ) {
			var leg = new THREE.Mesh( new THREE.BoxGeometry( 1.1, 3.6, 1.1 ), coatM );
			leg.position.set( c[ 0 ] * 3.2, 1.8, c[ 1 ] * 1.7 );
			g.add( leg );
		} );
		var body = new THREE.Mesh( new THREE.BoxGeometry( 9.5, 4.6, 4 ), coatM );
		body.position.y = 5.6;
		g.add( body );
		var bib = new THREE.Mesh( new THREE.BoxGeometry( 2.2, 3.4, 3.4 ), chestM ); // white chest
		bib.position.set( 4.4, 5, 0 );
		g.add( bib );
		var head = new THREE.Mesh( new THREE.BoxGeometry( 3.6, 3.4, 3.2 ), coatM );
		head.position.set( 5.6, 8.6, 0 );
		g.add( head );
		var snout = new THREE.Mesh( new THREE.BoxGeometry( 2.2, 1.6, 1.8 ), chestM );
		snout.position.set( 7.7, 7.8, 0 );
		g.add( snout );
		[ -1, 1 ].forEach( function ( sd ) {
			var ear = new THREE.Mesh( new THREE.BoxGeometry( 1.2, 1.7, 0.9 ), coatM );
			ear.position.set( 5, 10.7, sd * 1.4 );
			ear.rotation.x = sd * 0.4; // floppy
			g.add( ear );
		} );
		// the tail — pivot at its base, wagged every frame in updateDogs
		var tail = new THREE.Mesh( new THREE.BoxGeometry( 4.5, 1.1, 1.1 ), chestM );
		tail.geometry.translate( -2, 0, 0 );
		tail.position.set( -4.6, 7.4, 0 );
		tail.rotation.z = 0.5;
		g.add( tail );
		scene.add( g );
		var body2d = Matter.Bodies.circle( x, z, 5, { frictionAir: 0.2, density: 0.001 } );
		Matter.Composite.add( engine.world, body2d );
		var dog = { g: g, body: body2d, tail: tail, role: role,
			homeX: x, homeZ: z, wanderT: 600, ph: Math.random() * 7 };
		dogs.push( dog );
		return dog;
	}

	function buildDogs( THREE ) {
		// MARY — the old brown lab-cross (with some pitbull in the chest),
		// stockier than a farm dog has any right to be; holds the pens
		var mary = buildDog( THREE, 2860, 1480, 0x7a5638, 0x9a7a52, 'yard' );
		mary.g.scale.set( 1.15, 1.02, 1.3 ); // broad through the shoulders
		mary.lm = { id: 'dogyard', name: 'Mary', x: 2860, y: 1480, href: null,
			prompt: 'Mary — the old lab-cross, keeping the herd honest' };
		PROMPTS.push( mary.lm );
		// CONE — the white road dog; wherever you're going, he's coming
		var cone = buildDog( THREE, SPAWN.x - 34, SPAWN.y + 22, 0xe8e4da, 0xcfc4ae, 'road' );
		cone.lm = { id: 'dogroad', name: 'Cone', x: SPAWN.x - 34, y: SPAWN.y + 22, href: null,
			prompt: 'Cone — wherever you’re going, he’s coming' };
		PROMPTS.push( cone.lm );
	}

	function updateDogs( dms, t ) {
		var b = buggyBody;
		var bsp = Math.hypot( b.velocity.x, b.velocity.y );
		for ( var i = 0; i < dogs.length; i++ ) {
			var d = dogs[ i ];
			d.wanderT -= dms;
			var px = d.body.position.x, pz = d.body.position.y;
			var toBuggy = Math.hypot( b.position.x - px, b.position.y - pz );
			if ( d.role === 'road' ) {
				// loose follow: amble after the buggy when it drifts off,
				// settle nearby, hop clear when it's about to run her over
				if ( toBuggy < 26 && bsp > 2 ) {
					var fa = Math.atan2( pz - b.position.y, px - b.position.x );
					Matter.Body.setVelocity( d.body, { x: Math.cos( fa ) * 2.4, y: Math.sin( fa ) * 2.4 } );
				} else if ( toBuggy > 90 ) {
					var ca2 = Math.atan2( b.position.y - pz, b.position.x - px );
					var chase = Math.min( 1.7, 0.5 + toBuggy * 0.004 );
					Matter.Body.setVelocity( d.body, { x: Math.cos( ca2 ) * chase, y: Math.sin( ca2 ) * chase } );
				} else if ( d.wanderT <= 0 ) {
					d.wanderT = 900 + Math.random() * 1600;
					var ra2 = Math.random() * Math.PI * 2;
					Matter.Body.setVelocity( d.body, { x: Math.cos( ra2 ) * 0.4, y: Math.sin( ra2 ) * 0.4 } );
				}
			} else if ( d.wanderT <= 0 ) {
				// the yard dog patrols home turf
				d.wanderT = 1200 + Math.random() * 2200;
				var dir = Math.hypot( px - d.homeX, pz - d.homeZ ) > 160
					? Math.atan2( d.homeZ - pz, d.homeX - px )
					: Math.random() * Math.PI * 2;
				Matter.Body.setVelocity( d.body, { x: Math.cos( dir ) * 0.7, y: Math.sin( dir ) * 0.7 } );
			}
			d.g.position.set( px, heightAt( px, pz ), pz );
			var v = d.body.velocity;
			var mv = Math.hypot( v.x, v.y );
			if ( mv > 0.12 ) d.g.rotation.y = -Math.atan2( v.y, v.x );
			// the wag never stops — it just gets faster when she's moving
			// or you're close
			var wag = 6 + ( mv > 0.3 || toBuggy < 60 ? 10 : 0 );
			d.tail.rotation.y = Math.sin( t * wag + d.ph ) * 0.55;
			if ( d.lm ) { d.lm.x = px; d.lm.y = pz; }
		}
	}

	function buildChickens( THREE ) {
		for ( var i = 0; i < 12; i++ ) {
			var an = Math.random() * Math.PI * 2;
			var rr = 40 + Math.random() * 120;
			// the first one out of the coop is the black rooster
			addChicken( THREE, COOP.x + Math.cos( an ) * rr, COOP.z + Math.sin( an ) * rr, i === 0 );
		}
	}

	function addChicken( THREE, x, z, rooster ) {
		var g = new THREE.Group();
		var feathers = mat( THREE, rooster ? 0x1c1815
			: ( Math.random() < 0.25 ? 0xb98850 : 0xd8d3c4 ) );
		var body = new THREE.Mesh( new THREE.BoxGeometry( 6, 5, 4.5 ), feathers );
		body.position.y = 4.5;
		g.add( body );
		var head = new THREE.Mesh( new THREE.BoxGeometry( 2.6, 2.6, 2.4 ), feathers );
		head.position.set( 3.4, 8, 0 );
		g.add( head );
		var comb = new THREE.Mesh(
			new THREE.BoxGeometry( rooster ? 2.2 : 1.6, rooster ? 2.4 : 1.4, 1 ),
			mat( THREE, 0xb8352c ) );
		comb.position.set( 3.4, rooster ? 10.4 : 9.8, 0 );
		g.add( comb );
		if ( rooster ) {
			// the tail fan, iridescent black-green
			var tail = new THREE.Mesh( new THREE.BoxGeometry( 1.2, 5.5, 4 ), mat( THREE, 0x14241c ) );
			tail.position.set( -3.6, 7.6, 0 );
			tail.rotation.z = 0.55;
			g.add( tail );
		}
		var beak = new THREE.Mesh( new THREE.BoxGeometry( 1.6, 1, 1.2 ), mat( THREE, 0xd8a23a ) );
		beak.position.set( 5, 7.6, 0 );
		g.add( beak );
		var wingL = new THREE.Mesh( new THREE.BoxGeometry( 4.5, 0.8, 3 ), feathers );
		wingL.position.set( -0.5, 6, 2.8 );
		g.add( wingL );
		var wingR = new THREE.Mesh( new THREE.BoxGeometry( 4.5, 0.8, 3 ), feathers );
		wingR.position.set( -0.5, 6, -2.8 );
		g.add( wingR );
		g.scale.setScalar( rooster ? 1.26 : 1.05 );
		scene.add( g );
		var body2d = Matter.Bodies.circle( x, z, rooster ? 5 : 4, { frictionAir: 0.24, density: 0.0008 } );
		Matter.Composite.add( engine.world, body2d );
		// most hens cluster the coop; a quarter of them are RANGERS who
		// peck their way across the whole farm (the rooster holds his yard)
		chickens.push( { g: g, body: body2d, wingL: wingL, wingR: wingR,
			range: ( ! rooster && Math.random() < 0.25 ) ? 1500 : 180,
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
					// peck about inside your range — tight for the coop
					// cluster, farm-wide for the rangers
					var dir = Math.hypot( px - COOP.x, pz - COOP.z ) > ( c.range || 200 )
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
				squawk( { x: px, z: pz } );
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
		// the pen sits ON the bog's north shoulder — open on the SOUTH side,
		// spilling straight into the mud pit and the bog beyond
		penRun( THREE, PIGPEN.x - 72, PIGPEN.z - 78, PIGPEN.x + 72, PIGPEN.z - 78 );
		penRun( THREE, PIGPEN.x - 72, PIGPEN.z - 78, PIGPEN.x - 72, PIGPEN.z + 78 );
		penRun( THREE, PIGPEN.x + 72, PIGPEN.z - 78, PIGPEN.x + 72, PIGPEN.z + 78 );
		// two huts at 4× — real pig housing, with dark open doorways
		[ [ 42, -55 ], [ -42, -52 ] ].forEach( function ( hp ) {
			var hx = PIGPEN.x + hp[ 0 ], hz = PIGPEN.z + hp[ 1 ];
			var shed = new THREE.Mesh( new THREE.BoxGeometry( 48, 20, 32 ), woodMat( THREE, 0x54402a ) );
			shed.position.set( hx, hillsAt( hx, hz ) + 10, hz );
			scene.add( shed );
			var shedRoof = new THREE.Mesh( new THREE.BoxGeometry( 56, 3, 40 ), mat( THREE, 0x3a2c1c ) );
			shedRoof.position.set( hx, hillsAt( hx, hz ) + 22, hz );
			shedRoof.rotation.z = 0.12;
			scene.add( shedRoof );
			var doorway = new THREE.Mesh( new THREE.PlaneGeometry( 12, 13 ), mat( THREE, 0x14100c ) );
			doorway.position.set( hx, hillsAt( hx, hz ) + 6.5, hz + 16.2 );
			scene.add( doorway );
			Matter.Composite.add( engine.world, Matter.Bodies.rectangle(
				hx, hz, 48, 32, { isStatic: true } ) );
		} );
		// the mud pit — layered, rutted, glinting wet
		buildMudPatch( THREE, MUD.x, MUD.z, MUD.r * 1.3, MUD.r, 0 );
		for ( var i = 0; i < 9; i++ ) {
			addPig( THREE, PIGPEN.x - 55 + Math.random() * 110, PIGPEN.z - 60 + Math.random() * 120 );
		}
		// four piglets in their own little colors, tumbling near the huts
		[ 0xe0a0b8, 0x6a5a4c, 0x3a332e, 0xdca878 ].forEach( function ( pc, pi ) {
			addPig( THREE, PIGPEN.x - 45 + Math.random() * 90,
				PIGPEN.z - 55 + pi * 26, { coat: pc, scale: 0.48 } );
		} );
		PROMPTS.push( { id: 'pigpen', name: 'the pig pen', x: PIGPEN.x, y: PIGPEN.z, href: null,
			prompt: 'The pig pen — the mud is deep and they love it' } );
	}

	function addPig( THREE, x, z, opts ) {
		opts = opts || {};
		var g = new THREE.Group();
		// each pig its own shade of pink, mud-mottled; piglets pass a coat
		var pigCoats = [ 0xc98d84, 0xb87f72, 0xd49a8e, 0xa8756a ];
		var coat = opts.coat || pigCoats[ ( Math.random() * 4 ) | 0 ];
		var pink = skinMat( THREE, coat, hideTex( THREE ) );
		var js = opts.scale || ( 0.85 + Math.random() * 0.3 );
		g.scale.set( js, js, js );
		[ [ 1, 1 ], [ 1, -1 ], [ -1, 1 ], [ -1, -1 ] ].forEach( function ( c ) {
			var leg = new THREE.Mesh( new THREE.BoxGeometry( 1.4, 3.5, 1.4 ), pink );
			leg.position.set( c[ 0 ] * 3.6, 1.75, c[ 1 ] * 2 );
			g.add( leg );
		} );
		// a TUB, not a crate: ellipsoid body, round head, proper disc snout
		// with nostrils, flopped ears and the curly tail
		var body = new THREE.Mesh( new THREE.SphereGeometry( 1, 11, 8 ), pink );
		body.scale.set( 6.3, 4.4, 4 );
		body.position.y = 6.5;
		g.add( body );
		var head = new THREE.Mesh( new THREE.SphereGeometry( 2.9, 9, 7 ), pink );
		head.scale.set( 1, 0.95, 0.9 );
		head.position.set( 7, 7, 0 );
		g.add( head );
		var snout = new THREE.Mesh( new THREE.CylinderGeometry( 1.5, 1.5, 1.4, 8 ), mat( THREE, 0xb87a70 ) );
		snout.rotation.z = Math.PI / 2;
		snout.position.set( 9.9, 6.6, 0 );
		g.add( snout );
		[ -1, 1 ].forEach( function ( sd ) {
			var nos = new THREE.Mesh( new THREE.BoxGeometry( 0.5, 0.7, 0.5 ), mat( THREE, 0x8a5a52 ) );
			nos.position.set( 10.7, 6.6, sd * 0.55 );
			g.add( nos );
			// ears flopped forward over the brow
			var ear = new THREE.Mesh( new THREE.BoxGeometry( 1.8, 2.2, 1.5 ), mat( THREE, 0xb87a70 ) );
			ear.position.set( 7.6, 9.6, sd * 1.9 );
			ear.rotation.z = 0.55;
			ear.rotation.x = sd * 0.3;
			g.add( ear );
		} );
		// the curl: two tiny offset nubs read as a twist at this scale
		var t1 = new THREE.Mesh( new THREE.BoxGeometry( 1.6, 0.7, 0.7 ), mat( THREE, 0xb87a70 ) );
		t1.position.set( -6.6, 8, 0.4 );
		t1.rotation.y = 0.7;
		g.add( t1 );
		var t2 = new THREE.Mesh( new THREE.BoxGeometry( 1.2, 0.6, 0.6 ), mat( THREE, 0xb87a70 ) );
		t2.position.set( -7.3, 8.5, -0.3 );
		t2.rotation.y = -0.8;
		g.add( t2 );
		scene.add( g );
		var body2d = Matter.Bodies.circle( x, z, Math.max( 3, 6 * js ), { frictionAir: 0.18, density: 0.002 } );
		Matter.Composite.add( engine.world, body2d );
		// most pigs cluster the pen/bog; a quarter of the ADULTS are rangers
		// who root their way out across the farm (piglets stay home)
		pigs.push( { g: g, body: body2d,
			range: ( ! opts.scale && Math.random() < 0.25 ) ? 900 : 190,
			wanderT: 600 + Math.random() * 2000, cd: 0 } );
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
				if ( Math.hypot( px - PIGPEN.x, pz - PIGPEN.z ) > ( p.range || 190 ) ) {
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

	/* ---- heritage + heartland dressing: windmill, tulips, cattails,
	 *      ducks, and the oilpatch corner ---- */
	function buildWindmill( THREE ) {
		// a Dutch windmill on the slough's west shore — the Lakeman/Verboom
		// nod, upgraded: running-bond brickwork, a stone base skirt, the
		// GALLERY (octagonal stage + railing), a tail pole off the cap,
		// latticed sailcloth with crossbars, and a second lit window
		var g = new THREE.Group();
		var brick = skinMat( THREE, 0x8a5a40, brickTex( THREE ) );
		var millWood = woodMat( THREE, 0x54402a );
		var tower = new THREE.Mesh( new THREE.CylinderGeometry( 10, 16, 52, 8 ), brick );
		tower.position.y = 26;
		g.add( tower );
		var skirt = new THREE.Mesh( new THREE.CylinderGeometry( 17, 18.5, 4, 8 ), stoneMat( THREE, 0x8a857c ) );
		skirt.position.y = 2;
		g.add( skirt );
		var cap = new THREE.Mesh( new THREE.ConeGeometry( 12, 14, 8 ), woodMat( THREE, 0x3a2c1c ) );
		cap.position.y = 59;
		g.add( cap );
		// the gallery — an octagonal stage ringing the tower
		var deck = new THREE.Mesh( new THREE.CylinderGeometry( 16.5, 16.5, 1.4, 8 ), millWood );
		deck.position.y = 22;
		g.add( deck );
		var galRail = new THREE.Mesh( new THREE.TorusGeometry( 16.2, 0.5, 5, 8 ), millWood );
		galRail.rotation.x = Math.PI / 2;
		galRail.position.y = 27;
		g.add( galRail );
		for ( var gp = 0; gp < 8; gp++ ) {
			var ga = gp / 8 * Math.PI * 2 + Math.PI / 8;
			var gpost = new THREE.Mesh( new THREE.BoxGeometry( 0.8, 5.2, 0.8 ), millWood );
			gpost.position.set( Math.cos( ga ) * 16.2, 24.5, Math.sin( ga ) * 16.2 );
			g.add( gpost );
		}
		// tail pole: from the cap down past the gallery (how millers turned her)
		var tailPole = new THREE.Mesh( new THREE.CylinderGeometry( 0.7, 0.9, 26, 5 ), millWood );
		tailPole.position.set( 0, 40, -16 );
		tailPole.rotation.x = 0.62;
		g.add( tailPole );
		var door = new THREE.Mesh( new THREE.PlaneGeometry( 7, 11 ), mat( THREE, 0x171310 ) );
		door.position.set( 0, 6, 14.6 );
		g.add( door );
		addWindow( THREE, g, 5, 6, 0, 34, 12.4 );
		addWindow( THREE, g, 4, 5, 0, 46, 11.2 );
		// four sails on a hub, spun in render — latticed cloth + crossbars
		windmillBlades = new THREE.Group();
		windmillBlades.position.set( 0, 52, 14 );
		var hub = new THREE.Mesh( new THREE.CylinderGeometry( 2.4, 2.4, 4, 8 ), mat( THREE, 0x2a211b ) );
		hub.rotation.x = Math.PI / 2;
		windmillBlades.add( hub );
		var sailMat2 = applyAtmosphere( new THREE.MeshLambertMaterial( {
			color: 0xd8d3c4, map: sailTex( THREE ), side: THREE.DoubleSide } ), true );
		for ( var bi = 0; bi < 4; bi++ ) {
			var arm = new THREE.Group();
			arm.rotation.z = bi * Math.PI / 2;
			var spar = new THREE.Mesh( new THREE.BoxGeometry( 2, 34, 1.2 ), mat( THREE, 0x3a2c1c ) );
			spar.position.y = 17;
			arm.add( spar );
			var sail = new THREE.Mesh( new THREE.PlaneGeometry( 7, 26 ), sailMat2 );
			sail.position.set( 4.2, 20, 0 );
			arm.add( sail );
			[ 12, 20, 28 ].forEach( function ( cy ) {
				var cross = new THREE.Mesh( new THREE.BoxGeometry( 7.6, 0.8, 0.9 ), mat( THREE, 0x3a2c1c ) );
				cross.position.set( 4.2, cy, 0 );
				arm.add( cross );
			} );
			windmillBlades.add( arm );
		}
		g.add( windmillBlades );
		var lm = { id: 'windmill', name: 'the windmill', x: 3370, y: 813, href: '/lakemans',
			prompt: 'The windmill — the Dutch lines still turn in the wind' };
		g.position.set( lm.x, hillsAt( lm.x, lm.y ), lm.y );
		g.rotation.y = -0.5; // sails face the slough
		g.scale.set( 5, 5, 5 ); // 2× again — a LANDMARK mill on the shore
		g.userData.lm = lm;
		scene.add( g );
		clickables.push( g );
		PROMPTS.push( lm );
		Matter.Composite.add( engine.world, Matter.Bodies.circle( lm.x, lm.y, 84, { isStatic: true } ) );

		// tulip rows beside the mill — red, yellow, pink
		var rows = [ 0xc8321e, 0xe8b93a, 0xd86f9a ];
		var COLS = 8;
		var stemGeo = new THREE.CylinderGeometry( 0.5, 0.5, 7, 5 );
		var stems = new THREE.InstancedMesh( stemGeo, mat( THREE, 0x3f6b3a ), rows.length * COLS );
		var headGeo = new THREE.BoxGeometry( 2.3, 2.7, 2.3 );
		var heads = new THREE.InstancedMesh( headGeo,
			new THREE.MeshLambertMaterial( { color: 0xffffff } ), rows.length * COLS );
		var dummy = new THREE.Object3D();
		var col = new THREE.Color();
		var ti = 0;
		rows.forEach( function ( rc, ri ) {
			for ( var cix = 0; cix < COLS; cix++ ) {
				var tx = 3160 + cix * 12 + ( Math.random() - 0.5 ) * 5;
				var tz = 660 + ri * 15 + ( Math.random() - 0.5 ) * 5;
				var ty = hillsAt( tx, tz );
				dummy.position.set( tx, ty + 3.5, tz );
				dummy.updateMatrix();
				stems.setMatrixAt( ti, dummy.matrix );
				dummy.position.y = ty + 8.2;
				dummy.updateMatrix();
				heads.setMatrixAt( ti, dummy.matrix );
				col.setHex( rc );
				heads.setColorAt( ti, col );
				ti++;
			}
		} );
		scene.add( stems );
		scene.add( heads );
	}

	function buildCattails( THREE ) {
		// tall weeds on the slough's northeast shore
		var N = 30;
		var stalks = new THREE.InstancedMesh(
			new THREE.CylinderGeometry( 0.55, 0.75, 1, 5 ), mat( THREE, 0x4a5d3a ), N );
		var heads = new THREE.InstancedMesh(
			new THREE.CylinderGeometry( 1.2, 1.2, 4.5, 6 ), mat( THREE, 0x3a2a1a ), N );
		var dummy = new THREE.Object3D();
		for ( var i = 0; i < N; i++ ) {
			var th = -0.9 + Math.random() * 1.5; // east → northeast arc
			var rr = pondR( th ) + 6 + Math.random() * 30;
			var cx2 = POND.x + Math.cos( th ) * rr;
			var cz2 = POND.z + Math.sin( th ) * rr;
			var base = heightAt( cx2, cz2 );
			var h = 14 + Math.random() * 8;
			dummy.position.set( cx2, base + h / 2, cz2 );
			dummy.scale.set( 1, h, 1 );
			dummy.updateMatrix();
			stalks.setMatrixAt( i, dummy.matrix );
			dummy.position.y = base + h + 2;
			dummy.scale.set( 1, 1, 1 );
			dummy.updateMatrix();
			heads.setMatrixAt( i, dummy.matrix );
		}
		scene.add( stalks );
		scene.add( heads );
	}

	function buildDucks( THREE ) {
		for ( var i = 0; i < 10; i++ ) { // doubled with the bigger water
			var th = Math.random() * Math.PI * 2;
			var rr = 60 + Math.random() * 230;
			addDuck( THREE, POND.x + Math.cos( th ) * rr, POND.z + Math.sin( th ) * rr );
		}
	}

	function addDuck( THREE, x, z ) {
		var g = new THREE.Group();
		var mallard = Math.random() < 0.6;
		var bodyC = mallard ? 0x6b5a42 : 0xd8d3c4;
		var body = new THREE.Mesh( new THREE.BoxGeometry( 7, 4, 4.5 ), mat( THREE, bodyC ) );
		body.position.y = 2.5;
		g.add( body );
		var head = new THREE.Mesh( new THREE.BoxGeometry( 2.8, 2.8, 2.6 ),
			mat( THREE, mallard ? 0x2d5a35 : 0xd8d3c4 ) );
		head.position.set( 3.6, 5.6, 0 );
		g.add( head );
		var beak = new THREE.Mesh( new THREE.BoxGeometry( 1.8, 0.9, 1.4 ), mat( THREE, 0xd8a23a ) );
		beak.position.set( 5.6, 5.2, 0 );
		g.add( beak );
		scene.add( g );
		var body2d = Matter.Bodies.circle( x, z, 4, { frictionAir: 0.26, density: 0.0006 } );
		Matter.Composite.add( engine.world, body2d );
		ducks.push( { g: g, body: body2d, wanderT: 400 + Math.random() * 1800, cd: 0 } );
	}

	function updateDucks( dms, t ) {
		var b = buggyBody;
		for ( var i = 0; i < ducks.length; i++ ) {
			var d = ducks[ i ];
			d.wanderT -= dms;
			d.cd -= dms;
			var px = d.body.position.x, pz = d.body.position.y;
			var wet = inPond( px, pz );
			if ( d.wanderT <= 0 ) {
				d.wanderT = 1400 + Math.random() * 2400;
				// paddle about, but stay on the water
				var dir = wet
					? Math.random() * Math.PI * 2
					: Math.atan2( POND.z - pz, POND.x - px );
				Matter.Body.setVelocity( d.body, { x: Math.cos( dir ) * 0.5, y: Math.sin( dir ) * 0.5 } );
			}
			// scatter (and squawk-ish) when the buggy wades in close
			if ( d.cd <= 0 && Math.hypot( px - b.position.x, pz - b.position.y ) < 60 &&
			     Math.hypot( b.velocity.x, b.velocity.y ) > 1 ) {
				d.cd = 1600;
				var fa = Math.atan2( pz - b.position.y, px - b.position.x );
				Matter.Body.setVelocity( d.body, { x: Math.cos( fa ) * 2.6, y: Math.sin( fa ) * 2.6 } );
				if ( ! playSample( 'duck', { slice: 1.3, gain: 0.8, at: { x: px, z: pz } } ) ) softCluck();
			}
			d.g.position.set( px,
				wet ? POND.waterY - 1 + Math.sin( t * 2.1 + i * 1.7 ) * 0.5 : heightAt( px, pz ), pz );
			var v = d.body.velocity;
			if ( Math.hypot( v.x, v.y ) > 0.1 ) d.g.rotation.y = -Math.atan2( v.y, v.x );
		}
	}

	function buildPumpjack( THREE ) {
		// the oilpatch corner: a REAL pumping unit — A-frame samson post,
		// walking beam with a curved horsehead + hanger cables, twin
		// counterweight cranks with pitman arms, motor block, wellhead with
		// a valve wheel, and the pipe run to the flare
		// palette straight off Thomas's reference photo: rust-streaked
		// CREAM paint on everything that moves, dark oil-black iron below
		var cream = skinMat( THREE, 0xcfc3ac, metalTex( THREE ) );
		var rust = skinMat( THREE, 0x7a4a32, metalTex( THREE ) );
		var black = skinMat( THREE, 0x241f19, metalTex( THREE ) );
		var g = new THREE.Group();
		// gravel pad + the steel SKID rails the whole unit sits on
		var slab = new THREE.Mesh( new THREE.BoxGeometry( 40, 2, 18 ), stoneMat( THREE, 0x6a655c ) );
		slab.position.y = 1;
		g.add( slab );
		[ -6.5, 6.5 ].forEach( function ( rz ) {
			var rail = new THREE.Mesh( new THREE.BoxGeometry( 38, 1.8, 2.2 ), black );
			rail.position.set( -2, 2.6, rz );
			g.add( rail );
		} );
		// A-frame samson post — four legs to a dark bearing block
		[ -1, 1 ].forEach( function ( sd ) {
			[ -1, 1 ].forEach( function ( xd ) {
				var leg = new THREE.Mesh( new THREE.BoxGeometry( 2, 21.5, 2 ), cream );
				leg.position.set( -2 + xd * 3.2, 12, sd * 3 );
				leg.rotation.x = sd * -0.26;
				leg.rotation.z = xd * -0.3;
				g.add( leg );
			} );
			var brace = new THREE.Mesh( new THREE.BoxGeometry( 9, 1.3, 1.3 ), cream );
			brace.position.set( -2, 11, sd * 4.2 );
			g.add( brace );
		} );
		var bearing = new THREE.Mesh( new THREE.BoxGeometry( 5, 2.6, 7 ), black );
		bearing.position.set( -2, 20.4, 0 );
		g.add( bearing );
		// the ladder up the post (it's in the photo)
		[ -1.4, 1.4 ].forEach( function ( lz ) {
			var railL = new THREE.Mesh( new THREE.BoxGeometry( 0.5, 19, 0.5 ), rust );
			railL.position.set( 3.4, 10.5, lz );
			g.add( railL );
		} );
		for ( var ru = 0; ru < 7; ru++ ) {
			var rung = new THREE.Mesh( new THREE.BoxGeometry( 0.4, 0.4, 2.8 ), rust );
			rung.position.set( 3.4, 3.5 + ru * 2.6, 0 );
			g.add( rung );
		}
		pumpBeam = new THREE.Group();
		pumpBeam.position.set( -2, 21, 0 );
		// the walking beam — cream, deeper through the pivot like a real I-beam
		var beam = new THREE.Mesh( new THREE.BoxGeometry( 34, 3.2, 3 ), cream );
		beam.position.x = 2;
		pumpBeam.add( beam );
		var beamRib = new THREE.Mesh( new THREE.BoxGeometry( 14, 1.6, 3.4 ), cream );
		beamRib.position.set( -1, -2, 0 );
		pumpBeam.add( beamRib );
		var tailPlate = new THREE.Mesh( new THREE.BoxGeometry( 2.4, 4.6, 3.6 ), black );
		tailPlate.position.set( -14.4, 0, 0 );
		pumpBeam.add( tailPlate );
		// the HORSEHEAD — the photo's big rounded plate: tall main slab,
		// crown bulge on top, curved face dropping away at the nose
		var headA = new THREE.Mesh( new THREE.BoxGeometry( 5.2, 11, 4.4 ), cream );
		headA.position.set( 18, -0.8, 0 );
		headA.rotation.z = 0.12;
		pumpBeam.add( headA );
		var headCrown = new THREE.Mesh( new THREE.BoxGeometry( 4.6, 3.4, 4.4 ), cream );
		headCrown.position.set( 16.9, 4.6, 0 );
		headCrown.rotation.z = -0.34;
		pumpBeam.add( headCrown );
		var headFace = new THREE.Mesh( new THREE.BoxGeometry( 3.4, 7.5, 4.4 ), cream );
		headFace.position.set( 20.4, -3.6, 0 );
		headFace.rotation.z = 0.4;
		pumpBeam.add( headFace );
		// bridle: TWIN cables off the head to a spreader + polished rod
		[ -1.1, 1.1 ].forEach( function ( cz ) {
			var cable = new THREE.Mesh( new THREE.CylinderGeometry( 0.22, 0.22, 9.5, 4 ), black );
			cable.position.set( 19.2, -9, cz );
			pumpBeam.add( cable );
		} );
		var spreader = new THREE.Mesh( new THREE.BoxGeometry( 1.6, 1, 3.4 ), black );
		spreader.position.set( 19.2, -13.4, 0 );
		pumpBeam.add( spreader );
		var rod = new THREE.Mesh( new THREE.CylinderGeometry( 0.3, 0.3, 6, 5 ), black );
		rod.position.set( 19.2, -16.5, 0 );
		pumpBeam.add( rod );
		g.add( pumpBeam );
		// crank + KIDNEY counterweights (the photo's rounded double-lobe
		// plates) in cream — spun in render
		pumpCrank = new THREE.Group();
		pumpCrank.position.set( -13, 7.5, 0 );
		[ -1, 1 ].forEach( function ( sd ) {
			var lobeA = new THREE.Mesh( new THREE.CylinderGeometry( 5.4, 5.4, 1.8, 14 ), cream );
			lobeA.rotation.x = Math.PI / 2;
			lobeA.position.z = sd * 3.4;
			pumpCrank.add( lobeA );
			var lobeB = new THREE.Mesh( new THREE.CylinderGeometry( 3.6, 3.6, 1.8, 12 ), cream );
			lobeB.rotation.x = Math.PI / 2;
			lobeB.position.set( -3.4, -2.6, sd * 3.4 );
			pumpCrank.add( lobeB );
			var carm = new THREE.Mesh( new THREE.BoxGeometry( 7.5, 2.4, 1.9 ), black );
			carm.position.set( -1.4, -1.2, sd * 3.4 );
			carm.rotation.z = 0.6;
			pumpCrank.add( carm );
		} );
		g.add( pumpCrank );
		// pitman arms connecting cranks up to the beam tail
		[ -1, 1 ].forEach( function ( sd ) {
			var parm = new THREE.Mesh( new THREE.BoxGeometry( 1.3, 13.5, 1.3 ), cream );
			parm.position.set( -13.5, 14, sd * 3.4 );
			parm.rotation.z = -0.08;
			g.add( parm );
		} );
		// the GEARBOX hulk + motor behind it, all dark iron
		var gearbox = new THREE.Mesh( new THREE.BoxGeometry( 9, 7.5, 7.5 ), black );
		gearbox.position.set( -14, 4.2, 0 );
		g.add( gearbox );
		var motor = new THREE.Mesh( new THREE.BoxGeometry( 5.5, 4.2, 4.5 ), black );
		motor.position.set( -21.5, 3.4, 0 );
		g.add( motor );
		var belt = new THREE.Mesh( new THREE.CylinderGeometry( 2.4, 2.4, 1.4, 10 ), rust );
		belt.rotation.x = Math.PI / 2;
		belt.position.set( -18, 5.5, 3.6 );
		g.add( belt );
		// wellhead under the horsehead: casing + valve wheel
		var casing = new THREE.Mesh( new THREE.CylinderGeometry( 1.6, 1.9, 7, 8 ), black );
		casing.position.set( 16.4, 3.5, 0 );
		g.add( casing );
		var valve = new THREE.Mesh( new THREE.TorusGeometry( 1.7, 0.4, 6, 10 ), rust );
		valve.position.set( 16.4, 7.6, 0 );
		valve.rotation.x = Math.PI / 2;
		g.add( valve );
		// the pipe run heading off toward the flare stack
		var pipe2 = new THREE.Mesh( new THREE.CylinderGeometry( 0.8, 0.8, 26, 6 ), black );
		pipe2.rotation.z = Math.PI / 2;
		pipe2.rotation.y = -0.5;
		pipe2.position.set( 26, 1.8, -8 );
		g.add( pipe2 );
		// the TANK BATTERY — two production tanks behind the unit with a
		// catwalk plank between and a feed line, very Alberta
		[ -8, 8 ].forEach( function ( tz2 ) {
			var tank = new THREE.Mesh( new THREE.CylinderGeometry( 7, 7, 16, 10 ), rust );
			tank.position.set( -34, 8, tz2 );
			g.add( tank );
			var lid = new THREE.Mesh( new THREE.CylinderGeometry( 7.4, 7.4, 1, 10 ), black );
			lid.position.set( -34, 16.6, tz2 );
			g.add( lid );
			var hatch = new THREE.Mesh( new THREE.CylinderGeometry( 1.6, 1.6, 1.6, 6 ), black );
			hatch.position.set( -34, 18, tz2 );
			g.add( hatch );
		} );
		var catwalk = new THREE.Mesh( new THREE.BoxGeometry( 4, 0.8, 10 ), black );
		catwalk.position.set( -34, 16.4, 0 );
		g.add( catwalk );
		var feed = new THREE.Mesh( new THREE.CylinderGeometry( 0.7, 0.7, 12, 5 ), black );
		feed.rotation.z = Math.PI / 2;
		feed.position.set( -26, 3, -8 );
		g.add( feed );
		var lm = { id: 'pumpjack', name: 'the pumpjack', x: 3820, y: 2280, href: null,
			prompt: 'The pumpjack — the oilpatch kept the lights on' };
		g.position.set( lm.x, hillsAt( lm.x, lm.y ), lm.y );
		g.rotation.y = 0.4;
		g.scale.set( 2.5, 2.5, 2.5 ); // a proper oilfield unit
		g.userData.lm = lm;
		scene.add( g );
		clickables.push( g );
		PROMPTS.push( lm );
		Matter.Composite.add( engine.world,
			Matter.Bodies.rectangle( lm.x, lm.y, 85, 45, { isStatic: true } ) );

		// flare stack, always burning — now a real unit: aviation-striped
		// barrel, top platform + railing, a ladder up the side, three guy
		// wires, a knockout drum at the base on a concrete pad
		var fx = 3888, fz = 2238;
		var fy = hillsAt( fx, fz );
		var fPad = new THREE.Mesh( new THREE.BoxGeometry( 18, 2, 14 ), stoneMat( THREE, 0x6a655c ) );
		fPad.position.set( fx, fy + 1, fz );
		scene.add( fPad );
		var stack = new THREE.Mesh( new THREE.CylinderGeometry( 3.2, 4.8, 138, 7 ),
			applyAtmosphere( new THREE.MeshLambertMaterial( { map: flareStripeTex( THREE ) } ), true ) );
		stack.position.set( fx, fy + 69, fz );
		scene.add( stack );
		var fDeck = new THREE.Mesh( new THREE.CylinderGeometry( 7.4, 7.4, 1.4, 8 ), black );
		fDeck.position.set( fx, fy + 128, fz );
		scene.add( fDeck );
		var fRail = new THREE.Mesh( new THREE.TorusGeometry( 7.6, 0.5, 5, 8 ), black );
		fRail.rotation.x = Math.PI / 2;
		fRail.position.set( fx, fy + 133, fz );
		scene.add( fRail );
		// ladder up the west face
		[ -1.1, 1.1 ].forEach( function ( lz ) {
			var lrail = new THREE.Mesh( new THREE.BoxGeometry( 0.6, 122, 0.6 ), black );
			lrail.position.set( fx - 5, fy + 64, fz + lz );
			scene.add( lrail );
		} );
		for ( var lr = 0; lr < 20; lr++ ) {
			var rung2 = new THREE.Mesh( new THREE.BoxGeometry( 0.5, 0.5, 2.6 ), black );
			rung2.position.set( fx - 5, fy + 7 + lr * 6, fz );
			scene.add( rung2 );
		}
		// guy wires to ground anchors
		[ 0.4, 2.5, 4.6 ].forEach( function ( ga2 ) {
			var ax2 = fx + Math.cos( ga2 ) * 52, az2 = fz + Math.sin( ga2 ) * 52;
			var ay2 = hillsAt( ax2, az2 );
			var ddx = ax2 - fx, ddy = ay2 - ( fy + 104 ), ddz = az2 - fz;
			var wlen = Math.sqrt( ddx * ddx + ddy * ddy + ddz * ddz );
			var wire = new THREE.Mesh( new THREE.CylinderGeometry( 0.16, 0.16, wlen, 4 ), black );
			wire.position.set( fx + ddx / 2, fy + 104 + ddy / 2, fz + ddz / 2 );
			wire.quaternion.setFromUnitVectors( new THREE.Vector3( 0, 1, 0 ),
				new THREE.Vector3( ddx / wlen, ddy / wlen, ddz / wlen ) );
			scene.add( wire );
		} );
		// knockout drum + feed pipe at the base
		var drum = new THREE.Mesh( new THREE.CylinderGeometry( 3, 3, 9, 8 ), black );
		drum.rotation.z = Math.PI / 2;
		drum.position.set( fx - 9, fy + 3.4, fz + 4 );
		scene.add( drum );
		var feed = new THREE.Mesh( new THREE.CylinderGeometry( 0.7, 0.7, 8, 5 ), black );
		feed.rotation.z = Math.PI / 2;
		feed.position.set( fx - 4, fy + 3.4, fz + 4 );
		scene.add( feed );
		flareFlame = new THREE.Mesh( new THREE.ConeGeometry( 7.5, 26, 6 ),
			new THREE.MeshBasicMaterial( { color: glow( THREE, 0xffa03a, 2.2 ), transparent: true, opacity: 0.9 } ) );
		flareFlame.position.set( fx, fy + 150, fz );
		scene.add( flareFlame );
		flareLight = new THREE.PointLight( 0xff8c3a, 0.8, 560 );
		flareLight.position.set( fx, fy + 146, fz );
		flareLight.userData = { bx: fx, bz: fz }; // base — the dance wobbles around it
		scene.add( flareLight );
		Matter.Composite.add( engine.world, Matter.Bodies.circle( fx, fz, 5, { isStatic: true } ) );
	}

	function updateScenery( dms, t ) {
		if ( windmillBlades ) windmillBlades.rotation.z += dms * 0.0006;
		if ( pumpBeam ) pumpBeam.rotation.z = Math.sin( t * 1.7 ) * 0.2;
		if ( pumpCrank ) pumpCrank.rotation.z -= dms * 0.0034; // counterweights orbit
		if ( flareFlame ) {
			// the warm light DANCES: two incommensurate sines + jitter on the
			// intensity, and the light itself sways around its base — the
			// glow crawls across the ground the way real flame-light does
			var fl = 0.72 + Math.sin( t * 13 ) * 0.14 + Math.sin( t * 29 + 1.7 ) * 0.1 + Math.random() * 0.16;
			flareFlame.scale.set( 1 + Math.sin( t * 17 ) * 0.08, fl * 1.2, 1 );
			flareFlame.material.opacity = 0.6 + fl * 0.3;
			if ( flareLight ) {
				flareLight.intensity = 0.32 + fl * 0.78;
				flareLight.position.x = flareLight.userData.bx + Math.sin( t * 21 ) * 4;
				flareLight.position.z = flareLight.userData.bz + Math.cos( t * 17 ) * 4;
			}
		}
		if ( fireFlames.length ) {
			var ff = 0.68 + Math.sin( t * 11 + 1 ) * 0.16 + Math.sin( t * 23 ) * 0.1 + Math.random() * 0.18;
			for ( var fi2 = 0; fi2 < fireFlames.length; fi2++ ) {
				// each layer breathes on its own phase and slowly twists
				var fw = 1 + Math.sin( t * 7 + fi2 * 2.1 ) * 0.12;
				fireFlames[ fi2 ].scale.set( fw, ff * ( 1 + fi2 * 0.15 ), fw );
				fireFlames[ fi2 ].rotation.y += 0.012 + fi2 * 0.009;
				fireFlames[ fi2 ].material.opacity = 0.45 + ff * 0.4;
			}
			if ( fireLight ) {
				fireLight.intensity = 0.42 + ff * 0.78;
				fireLight.position.x = fireLight.userData.bx + Math.sin( t * 19 ) * 3;
				fireLight.position.z = fireLight.userData.bz + Math.cos( t * 26 ) * 3;
			}
		}
	}

	// wet dressing for the pig pit. The dark mud ITSELF is painted into the
	// dug-in bog terrain now — the old flat brown ellipses floated over the
	// bowl curves and read wrong. Every glint and rut samples the ground
	// under its own feet, same treatment as buildBog's goo.
	function buildMudPatch( THREE, cx, cz, rx, rz, rot ) {
		var glintMat = new THREE.MeshBasicMaterial( { color: 0x5a6f80, transparent: true, opacity: 0.13 } );
		for ( var gi = 0; gi < 4; gi++ ) {
			var gx = cx + ( Math.random() - 0.5 ) * rx;
			var gz = cz + ( Math.random() - 0.5 ) * rz;
			var glint = new THREE.Mesh( new THREE.CircleGeometry( 7 + Math.random() * 9, 10 ), glintMat );
			glint.rotation.x = -Math.PI / 2;
			glint.rotation.z = rot;
			glint.scale.x = 1.6;
			glint.position.set( gx, hillsAt( gx, gz ) + 0.6, gz );
			scene.add( glint );
		}
		// tire ruts carved through it, each on its own patch of ground
		var rutMat = mat( THREE, 0x1c130b );
		for ( var ri = 0; ri < 4; ri++ ) {
			var px = cx + ( Math.random() - 0.5 ) * rx * 0.6;
			var pz = cz + ( Math.random() - 0.5 ) * rz * 0.8;
			var rut = new THREE.Mesh( new THREE.PlaneGeometry( 4, 26 ), rutMat );
			rut.rotation.x = -Math.PI / 2;
			rut.rotation.z = rot + Math.PI / 2 + ( Math.random() - 0.5 ) * 0.5;
			rut.position.set( px, hillsAt( px, pz ) + 0.45, pz );
			scene.add( rut );
		}
	}

	function buildBog( THREE ) {
		// the bog is dug in (BOG_BOWLS) and painted into the terrain itself
		// — the dressing is what sits IN it: standing-goo sheen pooled in
		// each bowl bottom, tire ruts, and clods thrown around the rims.
		// (The old flat mud discs would float over the dip — gone.)
		// darker steel sheen, smaller — reads as wet goo, not pale sand
		var glintMat = new THREE.MeshBasicMaterial( { color: 0x5a6f80, transparent: true, opacity: 0.13 } );
		BOG_BOWLS.forEach( function ( bw ) {
			var glint = new THREE.Mesh( new THREE.CircleGeometry( bw.r * 0.42, 16 ), glintMat );
			glint.rotation.x = -Math.PI / 2;
			glint.rotation.z = BOG.rot;
			glint.scale.set( 1.5, 1, 1 );
			glint.position.set( bw.x, hillsAt( bw.x, bw.z ) + 0.6, bw.z );
			scene.add( glint );
			// a smaller offset pool beside each — the goo pools unevenly
			var g2x = bw.x + ( Math.random() - 0.5 ) * bw.r;
			var g2z = bw.z + ( Math.random() - 0.5 ) * bw.r;
			var glint2 = new THREE.Mesh( new THREE.CircleGeometry( bw.r * 0.2, 10 ), glintMat );
			glint2.rotation.x = -Math.PI / 2;
			glint2.position.set( g2x, hillsAt( g2x, g2z ) + 0.55, g2z );
			scene.add( glint2 );
		} );
		var rutMat = mat( THREE, 0x1c130b );
		var ca = Math.cos( BOG.rot ), sa = Math.sin( BOG.rot );
		for ( var ri = 0; ri < 16; ri++ ) {
			var t = -BOG.rx * 0.8 + Math.random() * BOG.rx * 1.6;
			var off = ( Math.random() - 0.5 ) * BOG.rz * 1.1;
			var px = BOG.x + ca * t - sa * off;
			var pz = BOG.z + sa * t + ca * off;
			var rut = new THREE.Mesh( new THREE.PlaneGeometry( 4, 24 ), rutMat );
			rut.rotation.x = -Math.PI / 2;
			rut.rotation.z = BOG.rot + Math.PI / 2 + ( Math.random() - 0.5 ) * 0.5;
			rut.position.set( px, hillsAt( px, pz ) + 0.45, pz );
			scene.add( rut );
		}
		// clods slung out around the rims
		var clodMat = mat( THREE, 0x241a0e );
		for ( var ci = 0; ci < 20; ci++ ) {
			var an = Math.random() * Math.PI * 2;
			var bwl = BOG_BOWLS[ ci % BOG_BOWLS.length ];
			var cxp = bwl.x + Math.cos( an ) * bwl.r * ( 0.9 + Math.random() * 0.5 );
			var czp = bwl.z + Math.sin( an ) * bwl.r * ( 0.9 + Math.random() * 0.5 );
			var clod = new THREE.Mesh( lumpy( new THREE.SphereGeometry( 1.6 + Math.random() * 2, 6, 5 ), 0.3 ), clodMat );
			clod.scale.y = 0.6;
			clod.position.set( cxp, hillsAt( cxp, czp ) + 0.8, czp );
			scene.add( clod );
		}
		PROMPTS.push( { id: 'bog', name: 'the bog', x: BOG.x, y: BOG.z, href: null,
			prompt: 'The bog — mudbogging country. Keep your momentum up' } );
	}

	// the firepit hangout: gravel pad, stone ring, live fire, log benches,
	// the camper, and a firewood stack — every farm's summer living room
	var fireFlames = [], fireLight = null;

	function buildHangout( THREE ) {
		var HX = 1580, HZ = 800;
		var gy = hillsAt( HX, HZ );
		var gravel = new THREE.Mesh( new THREE.CircleGeometry( 58, 22 ), mat( THREE, 0x3f3a33 ) );
		gravel.rotation.x = -Math.PI / 2;
		gravel.position.set( HX, gy + 0.4, HZ );
		scene.add( gravel );
		// stone ring
		var stone = mat( THREE, 0x59554c );
		for ( var si = 0; si < 10; si++ ) {
			var a = si / 10 * Math.PI * 2;
			var rock = new THREE.Mesh( new THREE.BoxGeometry( 5, 4, 4 ), stone );
			rock.position.set( HX + Math.cos( a ) * 12, gy + 2, HZ + Math.sin( a ) * 12 );
			rock.rotation.y = a;
			scene.add( rock );
		}
		// the fire — three nested flame cones (deep red → orange → hot
		// yellow core) over a glowing ember bed, charred logs crossed in
		// the ring, warm light; smoke rises from initSmoke's emitter
		[ { r: 5, h: 11, c: 0xd8551e, b: 1.7, o: 0.55 },
		  { r: 3.4, h: 8.5, c: 0xff8c3a, b: 2.0, o: 0.75 },
		  { r: 1.9, h: 6, c: 0xffe09a, b: 2.2, o: 0.9 } ].forEach( function ( f, fi ) {
			var flame = new THREE.Mesh( new THREE.ConeGeometry( f.r, f.h, 6 ),
				new THREE.MeshBasicMaterial( { color: glow( THREE, f.c, f.b ), transparent: true, opacity: f.o } ) );
			flame.position.set( HX, gy + 3.5 + f.h / 2 + fi * 0.8, HZ );
			scene.add( flame );
			fireFlames.push( flame );
		} );
		var embers = new THREE.Mesh( new THREE.CircleGeometry( 6, 12 ),
			new THREE.MeshBasicMaterial( { color: glow( THREE, 0xff5a1a, 1.5 ), transparent: true, opacity: 0.8 } ) );
		embers.rotation.x = -Math.PI / 2;
		embers.position.set( HX, gy + 1.4, HZ );
		scene.add( embers );
		var charMat = mat( THREE, 0x241a12 );
		var charGeo = new THREE.CylinderGeometry( 1.8, 1.8, 16, 6 );
		charGeo.rotateZ( Math.PI / 2 );
		[ 0, 1.05, 2.1 ].forEach( function ( la ) {
			var clog = new THREE.Mesh( charGeo, charMat );
			clog.position.set( HX, gy + 2.6, HZ );
			clog.rotation.y = la;
			clog.rotation.z = 0.12;
			scene.add( clog );
		} );
		fireLight = new THREE.PointLight( 0xff9c46, 0.9, 420 );
		fireLight.position.set( HX, gy + 14, HZ );
		fireLight.userData = { bx: HX, bz: HZ }; // base — the dance wobbles around it
		scene.add( fireLight );
		// log benches around the pit
		var logMat = mat( THREE, 0x4a3423 );
		var logGeo = new THREE.CylinderGeometry( 3.2, 3.2, 26, 8 );
		logGeo.rotateZ( Math.PI / 2 );
		[ 0.6, 2.2, 3.8, 5.2 ].forEach( function ( a2 ) {
			var bench = new THREE.Mesh( logGeo, logMat );
			bench.position.set( HX + Math.cos( a2 ) * 30, gy + 3.2, HZ + Math.sin( a2 ) * 30 );
			bench.rotation.y = -a2 + Math.PI / 2;
			scene.add( bench );
		} );
		// the firewood stack
		var wx = 1510, wz = 860;
		var wgy = hillsAt( wx, wz );
		var splitGeo = new THREE.CylinderGeometry( 2.5, 2.5, 14, 6 );
		splitGeo.rotateX( Math.PI / 2 );
		for ( var row = 0; row < 2; row++ ) {
			for ( var li2 = 0; li2 < 5 - row; li2++ ) {
				var log2 = new THREE.Mesh( splitGeo, mat( THREE, li2 % 2 ? 0x5a4330 : 0x4a3423 ) );
				log2.position.set( wx - 12 + li2 * 5.4 + row * 2.7, wgy + 2.5 + row * 4.6, wz );
				scene.add( log2 );
			}
		}
		Matter.Composite.add( engine.world, Matter.Bodies.rectangle( wx, wz, 30, 16, { isStatic: true } ) );
		// the camper — a proper 1960s canned-ham: rounded roofline, teal
		// belt stripe, chrome trim, fender skirt over a real wheel, striped
		// awning off the door side, step, roof vent, propane up front
		var cx2 = 1700, cz2 = 755;
		var cgy = hillsAt( cx2, cz2 );
		var camper = new THREE.Group();
		var shellMat = applyAtmosphere( new THREE.MeshPhongMaterial( {
			color: 0xdcd8cc, shininess: 55, specular: 0x555044 } ), true );
		var tealMat = applyAtmosphere( new THREE.MeshPhongMaterial( {
			color: 0x2a7a8a, shininess: 45, specular: 0x224444 } ), true );
		var shell = new THREE.Mesh( new THREE.BoxGeometry( 58, 18, 22 ), shellMat );
		shell.position.y = 17;
		camper.add( shell );
		var roofCurve = new THREE.Mesh( new THREE.CylinderGeometry( 11, 11, 57, 12, 1, false, 0, Math.PI ), shellMat );
		roofCurve.rotation.z = Math.PI / 2;
		roofCurve.position.y = 26;
		camper.add( roofCurve );
		var belt = new THREE.Mesh( new THREE.BoxGeometry( 58.4, 4.5, 22.4 ), tealMat );
		belt.position.y = 13;
		camper.add( belt );
		var chromeTrim = new THREE.Mesh( new THREE.BoxGeometry( 58.4, 0.8, 22.5 ), metalMat( THREE, 0xb8bec2 ) );
		chromeTrim.position.y = 15.6;
		camper.add( chromeTrim );
		var door = new THREE.Mesh( new THREE.PlaneGeometry( 8, 14 ), tealMat );
		door.position.set( 8, 15, 11.3 );
		camper.add( door );
		var doorWin = new THREE.Mesh( new THREE.PlaneGeometry( 4.5, 4 ), mat( THREE, 0x2a2e30 ) );
		doorWin.position.set( 8, 19, 11.4 );
		camper.add( doorWin );
		var handle = new THREE.Mesh( new THREE.BoxGeometry( 0.6, 2, 0.5 ), metalMat( THREE, 0xb8bec2 ) );
		handle.position.set( 4.6, 14.5, 11.5 );
		camper.add( handle );
		var step = new THREE.Mesh( new THREE.BoxGeometry( 7, 1.4, 4 ), mat( THREE, 0x3a3630 ) );
		step.position.set( 8, 4.5, 13.5 );
		camper.add( step );
		addWindow( THREE, camper, 9, 6, -14, 21, 11.3 );
		addWindow( THREE, camper, 8, 5.5, 14, 21, -11.3, Math.PI );
		var vent = new THREE.Mesh( new THREE.BoxGeometry( 8, 1.6, 7 ), shellMat );
		vent.position.set( -6, 36.4, 0 );
		vent.rotation.z = 0.1;
		camper.add( vent );
		// striped awning rolled out over the door, on two poles
		var ac = document.createElement( 'canvas' );
		ac.width = 64; ac.height = 32;
		var ax = ac.getContext( '2d' );
		for ( var as = 0; as < 8; as++ ) {
			ax.fillStyle = as % 2 ? '#d8d3c4' : '#2a7a8a';
			ax.fillRect( as * 8, 0, 8, 32 );
		}
		var awning = new THREE.Mesh( new THREE.PlaneGeometry( 24, 12 ),
			new THREE.MeshLambertMaterial( { map: new THREE.CanvasTexture( ac ), side: THREE.DoubleSide } ) );
		awning.position.set( 2, 25, 17 );
		awning.rotation.x = -1.25;
		camper.add( awning );
		[ -8, 12 ].forEach( function ( axp ) {
			var pole = new THREE.Mesh( new THREE.CylinderGeometry( 0.4, 0.4, 20, 5 ), metalMat( THREE, 0xb8bec2 ) );
			pole.position.set( axp, 10, 21.5 );
			camper.add( pole );
		} );
		var wh = makeWheel( THREE, 5, 4, 'wheelCamper', '#d8d3c4', '#2a7a8a' );
		wh.position.set( 2, 5, 9.5 );
		camper.add( wh );
		var skirtF = new THREE.Mesh( new THREE.BoxGeometry( 14, 6, 1.6 ), shellMat );
		skirtF.position.set( 2, 9.5, 10.8 );
		camper.add( skirtF );
		var tongue = new THREE.Mesh( new THREE.BoxGeometry( 16, 2, 2.4 ), mat( THREE, 0x59554c ) );
		tongue.position.set( -36, 9, 0 );
		camper.add( tongue );
		var propane = new THREE.Mesh( new THREE.SphereGeometry( 3.4, 8, 8 ), shellMat );
		propane.position.set( -31, 12, 0 );
		camper.add( propane );
		camper.position.set( cx2, cgy, cz2 );
		camper.rotation.y = 0.45;
		scene.add( camper );
		Matter.Composite.add( engine.world,
			Matter.Bodies.rectangle( cx2, cz2, 66, 26, { isStatic: true, angle: -0.45 } ) );
		PROMPTS.push( { id: 'firepit', name: 'the firepit', x: HX, y: HZ, href: null,
			prompt: 'The firepit — pull up a log, the night’s long' } );
		PROMPTS.push( { id: 'camper', name: 'the camper', x: cx2, y: cz2, href: null,
			prompt: 'The camper — half the summer lives in here' } );
	}

	// THE GRAIN BINS — the tallest, biggest structures on any farm, as they
	// should be: three corrugated-steel giants in the old pen clearing,
	// well away from the pond and the mill. Cone roofs, hatches, ladders.
	function buildGrainBins( THREE ) {
		var corr = cacheTex( THREE, 'bin', function ( x ) {
			x.fillStyle = '#d4d8da'; x.fillRect( 0, 0, 128, 128 );
			for ( var v3 = 0; v3 < 128; v3 += 7 ) {
				x.fillStyle = 'rgba(120,128,134,0.4)';
				x.fillRect( v3, 0, 2.4, 128 );
				x.fillStyle = 'rgba(244,248,250,0.4)';
				x.fillRect( v3 + 3.4, 0, 1.6, 128 );
			}
			// horizontal panel seams
			for ( var h3 = 0; h3 < 128; h3 += 26 ) {
				x.fillStyle = 'rgba(90,96,102,0.5)';
				x.fillRect( 0, h3, 128, 1.8 );
			}
		}, [ 3, 2 ] );
		var binMat = applyAtmosphere( new THREE.MeshLambertMaterial( { color: 0xb8bcbe, map: corr } ), true );
		var roofMat = metalMat( THREE, 0x8a8f92 );
		[ [ 2450, 880, 1 ], [ 2590, 850, 1.08 ], [ 2725, 890, 0.92 ] ].forEach( function ( bn ) {
			var bx2 = bn[ 0 ], bz2 = bn[ 1 ], bs = bn[ 2 ];
			var by = hillsAt( bx2, bz2 );
			var drum2 = new THREE.Mesh( new THREE.CylinderGeometry( 40 * bs, 40 * bs, 170 * bs, 12 ), binMat );
			drum2.position.set( bx2, by + 85 * bs, bz2 );
			scene.add( drum2 );
			var roof2 = new THREE.Mesh( new THREE.ConeGeometry( 44 * bs, 34 * bs, 12 ), roofMat );
			roof2.position.set( bx2, by + ( 170 + 17 ) * bs, bz2 );
			scene.add( roof2 );
			var hatch2 = new THREE.Mesh( new THREE.CylinderGeometry( 4 * bs, 4 * bs, 4, 8 ), mat( THREE, 0x3a3630 ) );
			hatch2.position.set( bx2, by + ( 170 + 32 ) * bs, bz2 );
			scene.add( hatch2 );
			// ladder strip up the face
			var lad = new THREE.Mesh( new THREE.BoxGeometry( 2.4, 168 * bs, 0.8 ), mat( THREE, 0x5a6064 ) );
			lad.position.set( bx2, by + 84 * bs, bz2 + 40 * bs + 0.6 );
			scene.add( lad );
			Matter.Composite.add( engine.world,
				Matter.Bodies.circle( bx2, bz2, 44 * bs, { isStatic: true } ) );
		} );
		PROMPTS.push( { id: 'bins', name: 'the grain bins', x: 2590, y: 870, href: null,
			prompt: 'The grain bins — a good year lives in there' } );
	}

	// the open stock barn: three walls + a big roof, open to the south so
	// the herd (and the buggy) can wander in
	function buildStockBarn( THREE ) {
		var BX = 2900, BZ = 1550;
		var g = new THREE.Group();
		var red = barnMat( THREE, 0x6e2a20 );
		var back = new THREE.Mesh( new THREE.BoxGeometry( 170, 40, 6 ), red );
		back.position.set( 0, 20, -52 );
		g.add( back );
		[ -82, 82 ].forEach( function ( ox ) {
			var side = new THREE.Mesh( new THREE.BoxGeometry( 6, 40, 110 ), red );
			side.position.set( ox, 20, 0 );
			g.add( side );
		} );
		var roof = gableRoof( THREE, 178, 62, 0x2f2119 );
		roof.position.y = 52;
		g.add( roof );
		// stall rails + hay + trough inside
		var railMat = mat( THREE, 0x4a4034 );
		[ -30, 30 ].forEach( function ( ox ) {
			var rail = new THREE.Mesh( new THREE.BoxGeometry( 3, 2.5, 70 ), railMat );
			rail.position.set( ox, 12, -12 );
			g.add( rail );
		} );
		[ [ -60, -30 ], [ -45, -38 ], [ -55, -14 ] ].forEach( function ( hp ) {
			var hay = new THREE.Mesh( new THREE.SphereGeometry( 9, 8, 6 ), mat( THREE, 0x8f7a3e ) );
			hay.scale.y = 0.6;
			hay.position.set( hp[ 0 ], 5, hp[ 1 ] );
			g.add( hay );
		} );
		var trough = new THREE.Mesh( new THREE.BoxGeometry( 40, 6, 10 ), mat( THREE, 0x3a3630 ) );
		trough.position.set( 40, 3, 20 );
		g.add( trough );
		addWindow( THREE, g, 10, 8, 0, 26, -48.8 );
		// a lantern hangs from the ridge and lights the interior — no more
		// black void when you wander in (glows under bloom)
		var lantern = new THREE.Mesh( new THREE.SphereGeometry( 2.8, 10, 8 ),
			new THREE.MeshBasicMaterial( { color: glow( THREE, 0xffb45e, 1.1 ) } ) );
		lantern.position.set( 0, 41, -8 );
		g.add( lantern );
		var cap = new THREE.Mesh( new THREE.ConeGeometry( 4, 3, 4 ), mat( THREE, 0x1c1512 ) );
		cap.position.set( 0, 45, -8 );
		cap.rotation.y = Math.PI / 4;
		g.add( cap );
		var barnLight = new THREE.PointLight( 0xffcf8a, 0.9, 340 );
		barnLight.position.set( 0, 36, -8 );
		g.add( barnLight );
		g.position.set( BX, hillsAt( BX, BZ ), BZ );
		scene.add( g );
		Matter.Composite.add( engine.world, Matter.Bodies.rectangle( BX, BZ - 52, 170, 10, { isStatic: true } ) );
		[ -82, 82 ].forEach( function ( ox ) {
			Matter.Composite.add( engine.world,
				Matter.Bodies.rectangle( BX + ox, BZ, 10, 110, { isStatic: true } ) );
		} );
		PROMPTS.push( { id: 'stockbarn', name: 'the stock barn', x: BX, y: BZ, href: null,
			prompt: 'The stock barn — everybody wanders home eventually' } );
	}

	// brush across the quarter — 4× the old count, three varieties, and
	// big enough to read as plants instead of warts: plain bushes
	// (drive-through), BERRY bushes (red berries), and little APPLE
	// trees (trunk + canopy + apples; solid). Six instanced draws total.
	function buildShrubs( THREE ) {
		// clustered, not scattered: hedgerows lining the road shoulders +
		// bluffs (dense clumps) seeded into the genuinely empty ground
		var spots = [];
		function tryAdd( x, z, minSpace ) {
			if ( x < 150 || x > W - 150 || z < 150 || z > H - 150 ) return;
			if ( ! farFromLandmarks( x, z, 280 ) || ! farFromRoads( x, z, 42 ) ||
			     inPond( x, z ) || inCompound( x, z, 40 ) ||
			     inMudArea( x, z, 40 ) || nearCreek( x, z, 40 ) ) return;
			// stay OFF the launch features — apple trees were squatting on
			// the hay piles and ramp run-ups
			for ( var mi = 0; mi < MOUNDS.length; mi++ ) {
				if ( Math.hypot( x - MOUNDS[ mi ].x, z - MOUNDS[ mi ].z ) < MOUNDS[ mi ].r * 1.6 + 34 ) return;
			}
			for ( var ri2 = 0; ri2 < RAMPS.length; ri2++ ) {
				if ( Math.hypot( x - RAMPS[ ri2 ].x, z - RAMPS[ ri2 ].z ) < 110 ) return;
			}
			for ( var i = 0; i < spots.length; i++ ) {
				if ( Math.hypot( x - spots[ i ].x, z - spots[ i ].z ) < minSpace ) return;
			}
			spots.push( { x: x, z: z, gy: hillsAt( x, z ) } );
		}
		// hedgerows: DENSE brush hugging both shoulders of every farm road —
		// the trails carry the planting, the open quarter stays open
		PATHS.forEach( function ( seg ) {
			var ax = seg[ 0 ].x, az = seg[ 0 ].y, bx = seg[ 1 ].x, bz = seg[ 1 ].y;
			var len = Math.hypot( bx - ax, bz - az );
			var nx = -( bz - az ) / len, nz = ( bx - ax ) / len;
			var count = Math.floor( len / 52 );
			for ( var k = 0; k < count; k++ ) {
				var t2 = ( k + 0.3 + Math.random() * 0.5 ) / count;
				var side = Math.random() < 0.5 ? 1 : -1;
				var off = 44 + Math.random() * 20;
				tryAdd( ax + ( bx - ax ) * t2 + nx * off * side,
					az + ( bz - az ) * t2 + nz * off * side, 21 );
			}
		} );
		// a few bluffs in the true voids (was 16 — they scattered the look)
		var clusters = 0, cGuard = 0;
		while ( clusters < 7 && cGuard++ < 400 ) {
			var cx = 300 + Math.random() * ( W - 600 );
			var cz = 300 + Math.random() * ( H - 600 );
			if ( ! farFromLandmarks( cx, cz, 340 ) || ! farFromRoads( cx, cz, 130 ) ||
			     inPond( cx, cz ) || inCompound( cx, cz, 60 ) ||
			     inMudArea( cx, cz, 80 ) || nearCreek( cx, cz, 70 ) ) continue;
			clusters++;
			var n3 = 7 + Math.floor( Math.random() * 6 );
			for ( var m = 0; m < n3; m++ ) {
				var a5 = Math.random() * Math.PI * 2;
				var r5 = Math.pow( Math.random(), 0.6 ) * 85;
				tryAdd( cx + Math.cos( a5 ) * r5, cz + Math.sin( a5 ) * r5, 24 );
			}
		}
		var bushes = [], berries = [], apples = [];
		spots.forEach( function ( s, i2 ) {
			if ( i2 % 9 < 5 ) bushes.push( s );
			else if ( i2 % 9 < 7 ) berries.push( s );
			else apples.push( s );
		} );
		var dummy = new THREE.Object3D();
		var col = new THREE.Color();

		var greens = [ 0x263f24, 0x2e4a2a, 0x22422c ];
		var bushInst = new THREE.InstancedMesh( lumpy( new THREE.SphereGeometry( 7, 8, 6 ), 0.24 ),
			leafMat( THREE, 0xffffff ), bushes.length );
		// each bush also grows an off-centre lobe — no more perfect balls
		var lobeInst = new THREE.InstancedMesh( lumpy( new THREE.SphereGeometry( 4.2, 7, 5 ), 0.3 ),
			leafMat( THREE, 0xffffff ), bushes.length );
		bushes.forEach( function ( s, i3 ) {
			var sc = 1.2 + Math.random();
			dummy.position.set( s.x, s.gy + 4.5 * sc, s.z );
			dummy.scale.set( sc, sc * ( 0.65 + Math.random() * 0.25 ), sc );
			dummy.rotation.y = Math.random() * Math.PI;
			dummy.updateMatrix();
			bushInst.setMatrixAt( i3, dummy.matrix );
			col.setHex( greens[ i3 % 3 ] );
			bushInst.setColorAt( i3, col );
			var la = Math.random() * Math.PI * 2;
			dummy.position.set( s.x + Math.cos( la ) * 5.5 * sc,
				s.gy + 2.6 * sc, s.z + Math.sin( la ) * 5.5 * sc );
			dummy.scale.set( sc * 0.9, sc * 0.7, sc * 0.9 );
			dummy.rotation.y = Math.random() * Math.PI;
			dummy.updateMatrix();
			lobeInst.setMatrixAt( i3, dummy.matrix );
			col.setHex( greens[ ( i3 + 1 ) % 3 ] );
			lobeInst.setColorAt( i3, col );
		} );
		scene.add( bushInst );
		scene.add( lobeInst );

		// berry bushes — a lighter bush studded with bright berries
		var bbInst = new THREE.InstancedMesh( lumpy( new THREE.SphereGeometry( 7, 8, 6 ), 0.24 ),
			leafMat( THREE, 0x33512e ), berries.length );
		var berryInst = new THREE.InstancedMesh( new THREE.SphereGeometry( 1.1, 5, 4 ),
			new THREE.MeshBasicMaterial( { color: 0xc83a3a } ), berries.length * 5 );
		var bi = 0;
		berries.forEach( function ( s, i4 ) {
			var sc = 1.1 + Math.random() * 0.8;
			dummy.position.set( s.x, s.gy + 4.5 * sc, s.z );
			dummy.rotation.y = Math.random() * Math.PI;
			dummy.scale.set( sc, sc * 0.8, sc );
			dummy.updateMatrix();
			bbInst.setMatrixAt( i4, dummy.matrix );
			dummy.rotation.y = 0;
			dummy.scale.set( 1, 1, 1 );
			for ( var b2 = 0; b2 < 5; b2++ ) {
				var a3 = Math.random() * Math.PI * 2;
				dummy.position.set(
					s.x + Math.cos( a3 ) * 5.6 * sc,
					s.gy + 4.5 * sc + ( Math.random() - 0.2 ) * 4,
					s.z + Math.sin( a3 ) * 5.6 * sc );
				dummy.updateMatrix();
				berryInst.setMatrixAt( bi++, dummy.matrix );
			}
		} );
		scene.add( bbInst );
		scene.add( berryInst );

		// little apple trees — solid trunks, round canopies, hanging fruit
		var trunkInst = new THREE.InstancedMesh( new THREE.CylinderGeometry( 1.6, 2.2, 14, 6 ),
			woodMat( THREE, 0x4a3423 ), apples.length );
		var canInst = new THREE.InstancedMesh( lumpy( new THREE.SphereGeometry( 10, 8, 6 ), 0.2 ),
			leafMat( THREE, 0xffffff ), apples.length );
		var appleInst = new THREE.InstancedMesh( new THREE.SphereGeometry( 1.2, 5, 4 ),
			new THREE.MeshBasicMaterial( { color: 0xd84a30 } ), apples.length * 4 );
		var canGreens = [ 0x2e5a30, 0x37623a, 0x2a5230 ];
		var ai2 = 0;
		apples.forEach( function ( s, i5 ) {
			var sc = 1.8 + Math.random(); // 2× — proper orchard trees now
			dummy.rotation.y = 0;
			dummy.scale.set( sc, sc, sc );
			dummy.position.set( s.x, s.gy + 7 * sc, s.z );
			dummy.updateMatrix();
			trunkInst.setMatrixAt( i5, dummy.matrix );
			dummy.position.set( s.x, s.gy + 22 * sc, s.z );
			dummy.scale.set( sc, sc * 0.9, sc );
			dummy.updateMatrix();
			canInst.setMatrixAt( i5, dummy.matrix );
			col.setHex( canGreens[ i5 % 3 ] );
			canInst.setColorAt( i5, col );
			dummy.scale.set( 1, 1, 1 );
			for ( var a4 = 0; a4 < 4; a4++ ) {
				var an2 = Math.random() * Math.PI * 2;
				dummy.position.set(
					s.x + Math.cos( an2 ) * 8 * sc,
					s.gy + 22 * sc - 4 + Math.random() * 6,
					s.z + Math.sin( an2 ) * 8 * sc );
				dummy.updateMatrix();
				appleInst.setMatrixAt( ai2++, dummy.matrix );
			}
			Matter.Composite.add( engine.world, Matter.Bodies.circle( s.x, s.z, 5 * sc, { isStatic: true } ) );
		} );
		scene.add( trunkInst );
		scene.add( canInst );
		scene.add( appleInst );
	}

	// bake organic wobble into foliage geometry — perfect spheres and cones
	// read as plastic; real bushes and crowns have lumps. Deterministic per
	// position, so seam vertices stay welded.
	function lumpy( geo, amt ) {
		var pos = geo.attributes.position;
		for ( var i = 0; i < pos.count; i++ ) {
			var x = pos.getX( i ), y = pos.getY( i ), z = pos.getZ( i );
			var s = 1 + amt * Math.sin( x * 2.3 + z * 1.9 ) * Math.cos( y * 1.7 + z * 0.9 );
			pos.setXYZ( i, x * s, y * s, z * s );
		}
		geo.computeVertexNormals();
		return geo;
	}

	// shared foliage palette — a few materials, picked per tree, so the
	// stands stop being one flat green (leafTex adds the mottle)
	function leafMats( THREE ) {
		if ( ! _texCache.leafMats ) {
			_texCache.leafMats = [ 0x1d3a26, 0x254428, 0x1a3620, 0x2a4a2c ].map( function ( c ) {
				return leafMat( THREE, c );
			} );
		}
		return _texCache.leafMats;
	}

	// a little side branch poking out of the lower canopy — about half the
	// trees get one, tilted outward; kills the perfect-cone read
	function addOffshoot( THREE, lm, x, z, footY, h, r ) {
		if ( Math.random() > 0.55 ) return;
		var oa = Math.random() * Math.PI * 2;
		var dx = Math.cos( oa ), dz = Math.sin( oa );
		var off = new THREE.Mesh(
			lumpy( new THREE.ConeGeometry( r * 0.34, h * 0.3, 6 ), 0.15 ),
			lm[ ( Math.random() * 4 ) | 0 ] );
		off.position.set( x + dx * r * 0.72, footY + h * 0.28, z + dz * r * 0.72 );
		off.rotation.x = dz * 0.5;
		off.rotation.z = -dx * 0.5;
		scene.add( off );
	}

	function buildWindbreak( THREE ) {
		var trunkMat = woodMat( THREE, 0x3a2c1e );
		var lm = leafMats( THREE );
		// keep clear of the treehouses — the kids' houses were getting lost
		// in the windbreak; their own (bigger) trees carry them now
		var TH = [ [ 1435, 1036 ], [ 1631, 1281 ], [ 1873, 1505 ] ];
		for ( var i = 0; i < 14; i++ ) {
			var f = i / 13;
			var x = 1383 + f * 615 + ( Math.random() - 0.5 ) * 40;
			var z = 980 + f * 595 + ( Math.random() - 0.5 ) * 40;
			var nearTh = false;
			for ( var thi = 0; thi < 3; thi++ ) {
				if ( Math.hypot( x - TH[ thi ][ 0 ], z - TH[ thi ][ 1 ] ) < 150 ) { nearTh = true; break; }
			}
			if ( nearTh ) continue;
			var gy = hillsAt( x, z );
			var trunk = new THREE.Mesh( new THREE.CylinderGeometry( 4.2, 6, 28, 6 ), trunkMat );
			trunk.position.set( x, gy + 14, z );
			scene.add( trunk );
			// two stacked cones — a stepped spruce silhouette, not a witch hat
			var h = 75 + Math.random() * 40, r = 17 + Math.random() * 7;
			var cone = new THREE.Mesh( lumpy( new THREE.ConeGeometry( r, h, 7 ), 0.11 ), lm[ i % 4 ] );
			cone.position.set( x, gy + 28 + h / 2, z );
			cone.rotation.y = Math.random() * Math.PI;
			scene.add( cone );
			var cone2 = new THREE.Mesh( lumpy( new THREE.ConeGeometry( r * 0.6, h * 0.5, 7 ), 0.13 ), lm[ ( i + 1 ) % 4 ] );
			cone2.position.set( x, gy + 28 + h * 0.78, z );
			cone2.rotation.y = Math.random() * Math.PI;
			scene.add( cone2 );
			addOffshoot( THREE, lm, x, z, gy + 28, h, r );
			Matter.Composite.add( engine.world, Matter.Bodies.circle( x, z, 11, { isStatic: true } ) );
		}
	}

	function buildGrove( THREE ) {
		// wind-rows: the northwest forest, DOUBLED — rolling over its own
		// hills, still weavable at speed if you're brave
		var trunkMat = woodMat( THREE, 0x362a1c );
		var lm = leafMats( THREE );
		var spots = [], guard = 0;
		while ( spots.length < 90 && guard++ < 1200 ) {
			var x = 130 + Math.random() * 1000;
			var z = 150 + Math.random() * 1000;
			if ( ( x - 130 ) + ( z - 150 ) > 1700 ) continue; // hug the corner
			if ( Math.hypot( x - 350, z - 350 ) < 32 ) continue; // token clearing
			if ( Math.hypot( x - 130, z - 800 ) < 150 ) continue; // Rycroft screen approach
			if ( Math.hypot( x - 1211, z - 588 ) < 400 ) continue; // the farmhouse yard
			var ok = true;
			for ( var i = 0; i < spots.length; i++ ) {
				if ( Math.hypot( x - spots[ i ].x, z - spots[ i ].z ) < 48 ) { ok = false; break; }
			}
			if ( ! ok ) continue;
			spots.push( { x: x, z: z } );
			var gy = hillsAt( x, z );
			var trunk = new THREE.Mesh( new THREE.CylinderGeometry( 4, 5.8, 30, 6 ), trunkMat );
			trunk.position.set( x, gy + 15, z );
			scene.add( trunk );
			var h = 70 + Math.random() * 60, r = 16 + Math.random() * 9;
			var cone = new THREE.Mesh( lumpy( new THREE.ConeGeometry( r, h, 7 ), 0.11 ), lm[ spots.length % 4 ] );
			cone.position.set( x, gy + 30 + h / 2, z );
			cone.rotation.y = Math.random() * Math.PI;
			scene.add( cone );
			var cone2 = new THREE.Mesh( lumpy( new THREE.ConeGeometry( r * 0.6, h * 0.5, 7 ), 0.13 ), lm[ ( spots.length + 2 ) % 4 ] );
			cone2.position.set( x, gy + 30 + h * 0.78, z );
			cone2.rotation.y = Math.random() * Math.PI;
			scene.add( cone2 );
			addOffshoot( THREE, lm, x, z, gy + 30, h, r );
			Matter.Composite.add( engine.world, Matter.Bodies.circle( x, z, 10, { isStatic: true } ) );
		}
	}

	function buildPoplars( THREE ) {
		// a few big prairie poplars — tall columnar canopies you can see
		// across the quarter
		var trunkMat = woodMat( THREE, 0x453a26 );
		var lm = leafMats( THREE );
		[ [ 950, 430 ], [ 2550, 330 ], [ 2950, 1620 ],
		  [ 1150, 1900 ], [ 4000, 1500 ], [ 600, 2350 ] ].forEach( function ( p ) {
			var x = p[ 0 ], z = p[ 1 ];
			if ( ! farFromRoads( x, z, 70 ) || ! farFromLandmarks( x, z, 220 ) ||
			     inPond( x, z ) || inCompound( x, z, 40 ) ) return;
			var gy = hillsAt( x, z );
			var trunk = new THREE.Mesh( new THREE.CylinderGeometry( 2.6, 3.6, 44, 6 ), trunkMat );
			trunk.position.set( x, gy + 22, z );
			scene.add( trunk );
			// two offset lobes — a poplar crown, not a green pill
			var canopy = new THREE.Mesh( lumpy( new THREE.SphereGeometry( 12, 8, 8 ), 0.16 ), lm[ 1 ] );
			canopy.scale.set( 1, 3.4, 1 );
			canopy.position.set( x, gy + 44 + 34, z );
			scene.add( canopy );
			var lobe = new THREE.Mesh( lumpy( new THREE.SphereGeometry( 8, 7, 6 ), 0.2 ), lm[ 3 ] );
			lobe.scale.set( 1, 2.2, 1 );
			lobe.position.set( x + 6, gy + 44 + 20, z + 3 );
			scene.add( lobe );
			Matter.Composite.add( engine.world, Matter.Bodies.circle( x, z, 8, { isStatic: true } ) );
		} );
	}

	function fenceRun( THREE, x0, z0, x1, z1 ) {
		var postMat = barnMat( THREE, 0x4a4034 );
		var postMat2 = barnMat( THREE, 0x554a3c ); // sun hits some posts differently
		var dx = x1 - x0, dz = z1 - z0;
		var len = Math.hypot( dx, dz ), n = Math.max( 1, Math.floor( len / 60 ) );
		for ( var i = 0; i <= n; i++ ) {
			var px = x0 + dx * ( i / n ), pz = z0 + dz * ( i / n );
			// no two posts alike: height + lean jitter, alternating weathering
			var ph = 15 + Math.random() * 3.5;
			var p = new THREE.Mesh( new THREE.BoxGeometry( 3, ph, 3 ),
				i % 2 ? postMat2 : postMat );
			p.position.set( px, hillsAt( px, pz ) + ph / 2, pz );
			p.rotation.x = ( Math.random() - 0.5 ) * 0.07;
			p.rotation.z = ( Math.random() - 0.5 ) * 0.07;
			scene.add( p );
		}
		var midY = hillsAt( ( x0 + x1 ) / 2, ( z0 + z1 ) / 2 );
		// rails get their own texture repeat along the length — the shared
		// barn map was stretched over 300 units and vanished
		var railTex = barnTex( THREE ).clone();
		railTex.needsUpdate = true;
		railTex.repeat.set( Math.max( 2, len / 26 ), 0.6 );
		var railMat2 = applyAtmosphere( new THREE.MeshLambertMaterial( {
			color: 0x4a4034, map: railTex } ), true );
		[ 12, 6 ].forEach( function ( y ) {
			var rail = new THREE.Mesh( new THREE.BoxGeometry( len, 2, 2 ), railMat2 );
			rail.position.set( ( x0 + x1 ) / 2, midY + y, ( z0 + z1 ) / 2 );
			rail.rotation.y = -Math.atan2( dz, dx );
			scene.add( rail );
		} );
	}

	// THE OUTER FOREST — the void beyond the section road becomes a belt of
	// instanced conifers running from past the berms out beyond the world
	// walls to the horizon. Three instanced draws for ~240 trees; only the
	// reachable ones (inside the walls) get physics.
	function buildForest( THREE ) {
		var spots = [], guard = 0;
		while ( spots.length < 380 && guard++ < 7000 ) {
			var x = -940 + Math.random() * ( W + 1880 );
			var z = -940 + Math.random() * ( H + 1880 );
			var out = Math.max( Math.max( -x, x - W, 0 ), Math.max( -z, z - H, 0 ) );
			if ( out < 300 || out > 940 ) continue;
			// clear of the stands, light towers and drive-in billboards
			if ( Math.hypot( x - 1900, z + 300 ) < 250 || Math.hypot( x - 2580, z + 300 ) < 250 ) continue;
			var blocked = false;
			[ { x: -300, z: -300 }, { x: W + 300, z: -300 },
			  { x: -300, z: H + 300 }, { x: W + 300, z: H + 300 } ].forEach( function ( tw ) {
				if ( Math.hypot( x - tw.x, z - tw.z ) < 110 ) blocked = true;
			} );
			for ( var li = 0; li < LINES.length && ! blocked; li++ ) {
				if ( Math.hypot( x - LINES[ li ].x, z - LINES[ li ].z ) < 160 ) blocked = true;
			}
			for ( var si = 0; si < spots.length && ! blocked; si++ ) {
				if ( Math.hypot( x - spots[ si ].x, z - spots[ si ].z ) < 88 ) blocked = true;
			}
			if ( blocked ) continue;
			// 3× the old size — a REAL forest wall out there
			spots.push( { x: x, z: z, gy: hillsAt( x, z ), sc: 2.2 + Math.random() * 1.8 } );
		}
		var trunkInst = new THREE.InstancedMesh(
			new THREE.CylinderGeometry( 3, 4.5, 24, 5 ), woodMat( THREE, 0x33281a ), spots.length );
		var cone1 = new THREE.InstancedMesh(
			lumpy( new THREE.ConeGeometry( 14, 52, 6 ), 0.11 ), leafMat( THREE, 0xffffff ), spots.length );
		var cone2 = new THREE.InstancedMesh(
			lumpy( new THREE.ConeGeometry( 8.5, 26, 6 ), 0.13 ), leafMat( THREE, 0xffffff ), spots.length );
		var dummy = new THREE.Object3D();
		var col = new THREE.Color();
		var greens = [ 0x1d3a26, 0x254428, 0x1a3620, 0x2a4a2c ];
		spots.forEach( function ( s, i ) {
			dummy.rotation.y = Math.random() * Math.PI;
			dummy.scale.set( s.sc, s.sc, s.sc );
			dummy.position.set( s.x, s.gy + 12 * s.sc, s.z );
			dummy.updateMatrix();
			trunkInst.setMatrixAt( i, dummy.matrix );
			dummy.position.set( s.x, s.gy + ( 24 + 20 ) * s.sc, s.z );
			dummy.updateMatrix();
			cone1.setMatrixAt( i, dummy.matrix );
			col.setHex( greens[ i % 4 ] );
			cone1.setColorAt( i, col );
			dummy.position.set( s.x, s.gy + ( 24 + 44 ) * s.sc, s.z );
			dummy.updateMatrix();
			cone2.setMatrixAt( i, dummy.matrix );
			col.setHex( greens[ ( i + 1 ) % 4 ] );
			cone2.setColorAt( i, col );
			var out2 = Math.max( Math.max( -s.x, s.x - W, 0 ), Math.max( -s.z, s.z - H, 0 ) );
			if ( out2 < 415 ) { // reachable — give it a trunk to hit
				Matter.Composite.add( engine.world,
					Matter.Bodies.circle( s.x, s.z, 9 * s.sc, { isStatic: true } ) );
			}
		} );
		scene.add( trunkInst );
		scene.add( cone1 );
		scene.add( cone2 );
	}

	function buildFence( THREE ) {
		// the perimeter fence rings the OUTSIDE of the section road now —
		// the track is part of the quarter, not an outer loop beyond a fence
		var F = 424, step = 300;
		for ( var x = -F; x < W + F; x += step ) {
			fenceRun( THREE, x, -F, Math.min( x + step, W + F ), -F );
			fenceRun( THREE, x, H + F, Math.min( x + step, W + F ), H + F );
		}
		for ( var z = -F; z < H + F; z += step ) {
			fenceRun( THREE, -F, z, -F, Math.min( z + step, H + F ) );
			fenceRun( THREE, W + F, z, W + F, Math.min( z + step, H + F ) );
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
			var lamp = new THREE.Mesh( new THREE.SphereGeometry( 2.2, 10, 8 ),
				new THREE.MeshBasicMaterial( { color: glow( THREE, 0xffb45e, 1.1 ) } ) );
			lamp.position.set( START.x, hillsAt( START.x, pz ) + 37, pz );
			scene.add( lamp );
		} );

		PROMPTS.push( { id: 'raceline', name: 'the section road', x: START.x, y: START.z, href: null,
			prompt: 'The start line — 1: single lap · 3: three-lap race · T: time trial' } );

		// four ghost buggies: gold = your best, silver ×2 = your recents,
		// cyan = THE FARM RECORD (the fastest visitor ever, via REST)
		for ( var gi = 0; gi < 4; gi++ ) {
			var gm = new THREE.MeshLambertMaterial( {
				color: gi === 0 ? 0xd8b25e : ( gi === 3 ? 0x7fd8d8 : 0x8fa8c8 ),
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
		// stadium towers OUTSIDE the ring corners — triple height, big
		// double-size heads, lamp light thrown both ways down the track
		var poleMat = mat( THREE, 0x3a3630 );
		var headMat = new THREE.MeshBasicMaterial( { color: glow( THREE, 0xfff2d0, 2.0 ) } );
		[ { x: -300, z: -300 }, { x: W + 300, z: -300 },
		  { x: -300, z: H + 300 }, { x: W + 300, z: H + 300 } ].forEach( function ( c ) {
			var gy = hillsAt( c.x, c.z );
			var pole = new THREE.Mesh( new THREE.CylinderGeometry( 4, 6.5, 330, 8 ), poleMat );
			pole.position.set( c.x, gy + 165, c.z );
			scene.add( pole );
			var A = Math.atan2( H / 2 - c.z, W / 2 - c.x );
			var th = A + Math.PI / 2; // crossbar perpendicular to the infield diagonal
			var bar = new THREE.Mesh( new THREE.BoxGeometry( 70, 8, 16 ), poleMat );
			bar.position.set( c.x, gy + 326, c.z );
			bar.rotation.y = -th;
			scene.add( bar );
			[ -28, 28 ].forEach( function ( o ) {
				var head = new THREE.Mesh( new THREE.BoxGeometry( 22, 13, 18 ), headMat );
				head.position.set( c.x + Math.cos( th ) * o, gy + 318, c.z + Math.sin( th ) * o );
				head.rotation.y = -th;
				scene.add( head );
			} );
			var pt = new THREE.PointLight( 0xffe2b0, 1.2, 2300 );
			pt.position.set( c.x, gy + 300, c.z );
			scene.add( pt );
		} );
	}

	function buildGrandstands( THREE ) {
		// two stands on the far straight, packed with a bobbing crowd.
		// Upgraded: SOLID stepped bleachers (risers meet — no floating
		// slabs), painted bench rows, a centre stair aisle, a barn-board
		// back wall, white roof fascia, and pennants off the roof corners.
		var frame = woodMat( THREE, 0x3a3630 );
		var benchA = woodMat( THREE, 0x7a3a30 ); // painted red benches
		var benchB = woodMat( THREE, 0x565048 ); // weathered grey
		var stairMat = woodMat( THREE, 0x8a8078 );
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
				// riser-height boxes so each step meets the one below
				var tier = new THREE.Mesh( new THREE.BoxGeometry( 310, 14, 26 ),
					r % 2 ? benchB : benchA );
				tier.position.set( st.x, baseY + r * 13 + 7, st.z - r * 24 );
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
				// the centre stair aisle climbs the middle
				var stair = new THREE.Mesh( new THREE.BoxGeometry( 22, 14.6, 26 ), stairMat );
				stair.position.set( st.x, baseY + r * 13 + 7.4, st.z - r * 24 );
				scene.add( stair );
			}
			// barn-board back wall up to the roof
			var back = new THREE.Mesh( new THREE.BoxGeometry( 310, 36, 6 ),
				barnMat( THREE, 0x5a4a3a ) );
			back.position.set( st.x, baseY + ROWS * 13 + 14, st.z - ROWS * 24 - 10 );
			scene.add( back );
			var roof = new THREE.Mesh( new THREE.BoxGeometry( 320, 4, 110 ), frame );
			roof.position.set( st.x, baseY + 96, st.z - 48 );
			scene.add( roof );
			// white fascia along the roof's front edge
			var fascia = new THREE.Mesh( new THREE.BoxGeometry( 320, 7, 3 ),
				woodMat( THREE, 0xd8d3c4 ) );
			fascia.position.set( st.x, baseY + 93, st.z + 7 );
			scene.add( fascia );
			[ -152, 152 ].forEach( function ( ox ) {
				[ 6, -100 ].forEach( function ( oz ) {
					var post = new THREE.Mesh( new THREE.BoxGeometry( 4, 96, 4 ), frame );
					post.position.set( st.x + ox, baseY + 48, st.z + oz );
					scene.add( post );
				} );
				// pennants fly off the roof's front corners
				var pole = new THREE.Mesh( new THREE.CylinderGeometry( 0.9, 0.9, 22, 5 ), frame );
				pole.position.set( st.x + ox, baseY + 107, st.z + 4 );
				scene.add( pole );
				var pennant = new THREE.Mesh( new THREE.PlaneGeometry( 13, 6 ),
					new THREE.MeshBasicMaterial( {
						color: ox < 0 ? 0xc84a3a : 0xd8b25e, side: THREE.DoubleSide } ) );
				pennant.position.set( st.x + ox + 7.5, baseY + 114, st.z + 4 );
				scene.add( pennant );
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
		// v4: two track jumps became steep SKY kickers + launch physics
		// retuned — old ghosts ran different ground, fresh records only
		try { ghostStore = JSON.parse( window.localStorage.getItem( 'tcBqLaps_v4' ) || 'null' ); } catch ( err ) {}
		if ( ! ghostStore || typeof ghostStore !== 'object' ) ghostStore = { best: null, recent: [] };
		if ( ! ghostStore.recent ) ghostStore.recent = [];
		return ghostStore;
	}

	function saveLaps( st ) {
		ghostStore = st;
		try { window.localStorage.setItem( 'tcBqLaps_v4', JSON.stringify( st ) ); } catch ( err ) {}
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
		for ( var i = 0; i < 3; i++ ) {
			ghosts[ i ].s = streams[ i ] || null;
			ghosts[ i ].gt = 0;
			ghosts[ i ].mesh.visible = !! ghosts[ i ].s;
		}
		// slot 3 (cyan) is the FARM RECORD — another visitor's actual run
		// (skipped if the record IS your own local best, no point doubling)
		var fg = farmGhost && farmGhost.s && ! ( st.best && farmGhost.t === st.best.t ) ? farmGhost : null;
		ghosts[ 3 ].s = fg ? fg.s : null;
		ghosts[ 3 ].gt = 0;
		ghosts[ 3 ].mesh.visible = !! fg;
		flashChip( fg
			? 'GO — the farm record is running (' + fg.name + ' · ' + fmtLap( fg.t ) + ')'
			: ( streams.length ? 'GO — the ghosts are running' : 'GO — three corners and home' ) );
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
		maybeClaimFarmRecord( entry );
		return entry;
	}

	function armRace( mode ) {
		if ( race.mode || ! buggyBody ) return;
		if ( Math.hypot( buggyBody.position.x - START.x, buggyBody.position.y - START.z ) > 300 ) return;
		race.armed = mode;
		fetchFarmGhost();
		flashChip( ( mode === 'single' ? 'SINGLE LAP' : ( mode === 'three' ? 'THREE-LAP RACE' : 'TIME TRIAL' ) )
			+ ' armed — cross the line to start (X cancels)' );
		tone( 659, 0.1, 0.1, 'square' );
	}

	function abandonRace() {
		if ( ! race.mode && ! race.armed ) return;
		var trialDone = race.mode === 'trial' && race.laps.length;
		race.mode = null;
		race.armed = null;
		lap.active = false;
		for ( var i = 0; i < ghosts.length; i++ ) ghosts[ i ].mesh.visible = false;
		flashChip( trialDone
			? '🏁 TRIAL OVER — ' + race.laps.length + ' lap' + ( race.laps.length === 1 ? '' : 's' )
				+ ', best ' + fmtLap( Math.min.apply( null, race.laps ) )
			: 'Race abandoned — the line will wait' );
	}

	function finishRace() {
		var mode = race.mode;
		race.mode = null;
		lap.active = false;
		for ( var i = 0; i < ghosts.length; i++ ) ghosts[ i ].mesh.visible = false;
		if ( mode === 'three' ) {
			var total = 0;
			for ( var li = 0; li < race.laps.length; li++ ) total += race.laps[ li ];
			flashChip( '🏁 THREE LAPS — ' + fmtLap( total )
				+ ' · best lap ' + fmtLap( Math.min.apply( null, race.laps ) ) );
		} else {
			flashChip( '🏁 FINISH — ' + fmtLap( race.laps[ 0 ] ) );
		}
	}

	// the farm record rides in lazily, first time anyone arms a race
	function fetchFarmGhost() {
		if ( farmGhostState || ! window.fetch ) return;
		farmGhostState = 1;
		fetch( '/wp-json/tc-games/v1/bq-ghost' )
			.then( function ( r ) { return r.json(); } )
			.then( function ( d ) { farmGhost = ( d && d.ghost ) || null; farmGhostState = 2; } )
			.catch( function () { farmGhostState = 2; } );
	}

	// beat the farm record and your run — the actual stream — takes the
	// crown for every future visitor to race against
	function maybeClaimFarmRecord( entry ) {
		if ( ! entry.s || farmGhostState !== 2 || ! window.fetch ) return;
		if ( farmGhost && farmGhost.t <= entry.t ) return;
		var nm = '';
		try { nm = window.localStorage.getItem( 'tcBqRaceName' ) || ''; } catch ( err ) {}
		if ( ! nm ) {
			nm = ( window.prompt( 'FARM RECORD! Sign your run (name or initials):', '' ) || 'Anonymous' ).slice( 0, 16 );
			try { window.localStorage.setItem( 'tcBqRaceName', nm ); } catch ( err ) {}
		}
		farmGhost = { name: nm, t: entry.t, s: entry.s }; // optimistic — server keeps the truly faster
		fetch( '/wp-json/tc-games/v1/bq-ghost', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify( { name: nm, t: entry.t, s: entry.s } )
		} ).then( function ( r ) { return r.json(); } ).then( function ( d ) {
			if ( d && d.success && d.beaten ) {
				flashChip( '🏆 FARM RECORD — ' + nm + ' · ' + fmtLap( entry.t ) );
			} else if ( d && d.ghost ) {
				// someone out-ran us in the meantime — pull their run down
				farmGhost = null;
				farmGhostState = 0;
				fetchFarmGhost();
			}
		} ).catch( function () {} );
	}

	// called every 60 Hz physics step
	function lapControl() {
		var b = buggyBody;
		var sx = b.position.x - START.x;
		var onLine = Math.abs( b.position.y - START.z ) < 80;
		if ( onLine && ( ( prevSX < 0 && sx >= 0 ) || ( prevSX > 0 && sx <= 0 ) ) ) {
			var dir = sx >= 0 ? 1 : -1; // 1 = heading east = counterclockwise
			if ( race.armed ) {
				// the flag drops — direction is whichever way you drove off
				race.mode = race.armed;
				race.armed = null;
				race.lapNum = 1;
				race.laps = [];
				startLap( dir );
			} else if ( race.mode && lap.active && dir === lap.dir && lap.next === 3 ) {
				var entry = finishLap();
				race.laps.push( entry.t );
				if ( race.mode === 'trial' ) {
					startLap( dir ); // the trial rolls until X
				} else if ( race.mode === 'three' && race.lapNum < 3 ) {
					race.lapNum++;
					startLap( dir );
					flashChip( 'Lap ' + race.lapNum + ' of 3 — GO' );
				} else {
					finishRace();
				}
			} else if ( race.mode && lap.active && dir === lap.dir ) {
				flashChip( 'Not yet — ' + ( 3 - lap.next ) + ' corner' + ( lap.next === 2 ? '' : 's' ) + ' to go' );
			} else if ( race.mode && lap.active ) {
				flashChip( 'WRONG WAY — turn her around!' );
			} else {
				flashChip( 'Pick a race first — 1: single lap · 3: three laps · T: time trial' );
			}
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
		var lantern = new THREE.Mesh( new THREE.SphereGeometry( 2.2, 10, 8 ),
			new THREE.MeshBasicMaterial( { color: glow( THREE, 0xffb45e, 1.05 ) } ) );
		lantern.position.set( 2240, gh + 31, H - 6 );
		scene.add( lantern );
	}

	function makeBaleMesh( THREE ) {
		// side wears the straw wrap, the caps wear the rolled SPIRAL — after
		// rotateZ the caps face ±x, right where headlights used to turn a
		// bale into a giant gold token. Duller tint than the real tokens.
		var baleGeo = new THREE.CylinderGeometry( 9, 9, 16, 12 );
		baleGeo.rotateZ( Math.PI / 2 );
		var side = skinMat( THREE, 0x9a824a, makeHayTexture( THREE ) );
		var ends = skinMat( THREE, 0xffffff, baleEndTex( THREE ) );
		return new THREE.Mesh( baleGeo, [ side, ends, ends ] );
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
			if ( ! farFromLandmarks( x, z, 260 ) || inCompound( x, z, 30 ) || ! farFromRoads( x, z, 60 ) || inPond( x, z ) ) continue;
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
	function initSplash( THREE ) { initPool( THREE, splashPool, 100, makePuffTexture( THREE, 140, 180, 214 ) ); }
	function initMud( THREE ) { initPool( THREE, mudPool, 100, makePuffTexture( THREE, 74, 56, 38 ) ); }

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
				p.vx = 0; p.vz = 0;
				p.grow = 10 + sp * 2.4;
				return p;
			}
		}
		return null;
	}
	function spawnDust( at, sp ) { return spawnFrom( dustPool, at, sp ); }
	function spawnSplash( at, sp ) {
		var p = spawnFrom( splashPool, at, sp * 0.8 );
		if ( p ) {
			p.vy = 16 + Math.random() * 18; // water throws UP…
			p.vx = ( Math.random() - 0.5 ) * ( 10 + sp * 3 ); // …and OUT
			p.vz = ( Math.random() - 0.5 ) * ( 10 + sp * 3 );
		}
		return p;
	}
	function spawnMud( at, sp ) {
		var p = spawnFrom( mudPool, at, sp );
		if ( p ) {
			p.vy = 30 + Math.random() * 34;          // mud flies HIGH
			p.vx = ( Math.random() - 0.5 ) * ( 14 + sp * 4 ); // and SIDEWAYS —
			p.vz = ( Math.random() - 0.5 ) * ( 14 + sp * 4 ); // a proper roost
			p.grow = 16 + sp * 2.4;
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
			p.spr.position.x += ( p.vx || 0 ) * ( dms / 1000 );
			p.spr.position.z += ( p.vz || 0 ) * ( dms / 1000 );
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

	/* ---- fireworks — the all-tokens celebration ---- */
	var fwPool = [], fwBursts = 0, fwNextT = 0;

	function initFireworks( THREE ) {
		var tex = makePuffTexture( THREE, 255, 255, 255 );
		for ( var i = 0; i < 70; i++ ) {
			var spr = new THREE.Sprite( new THREE.SpriteMaterial( {
				map: tex, transparent: true, opacity: 0, depthWrite: false,
				blending: THREE.AdditiveBlending, color: 0xffffff
			} ) );
			spr.scale.set( 6, 6, 1 );
			scene.add( spr );
			fwPool.push( { spr: spr, life: 0, max: 0, vx: 0, vy: 0, vz: 0 } );
		}
	}

	function fireworkBurst( cx, cy, cz, color ) {
		var used = 0;
		for ( var i = 0; i < fwPool.length && used < 20; i++ ) {
			var p = fwPool[ i ];
			if ( p.life > 0 ) continue;
			used++;
			p.max = p.life = 1100 + Math.random() * 500;
			p.spr.material.color.setHex( color ).multiplyScalar( 1.6 ); // HDR — bursts bloom
			p.spr.position.set( cx, cy, cz );
			var th = Math.random() * Math.PI * 2, ph = Math.random() * Math.PI;
			var sp2 = 40 + Math.random() * 55;
			p.vx = Math.cos( th ) * Math.sin( ph ) * sp2;
			p.vz = Math.sin( th ) * Math.sin( ph ) * sp2;
			p.vy = Math.abs( Math.cos( ph ) ) * sp2 * 0.9 + 25;
		}
	}

	// the MEGA landing: three quick bursts over the buggy, kid colors + gold
	function megaCelebration( x, y, z ) {
		var cols = [ 0xffd76a, 0xff9ecb, 0x8fd0ff ];
		for ( var i = 0; i < 3; i++ ) {
			fireworkBurst(
				x - 50 + Math.random() * 100,
				y + 70 + Math.random() * 60,
				z - 50 + Math.random() * 100,
				cols[ i ] );
		}
	}

	// six bursts over ~4s in the kids' colors + gold, cheers with each
	function startCelebration() {
		fwBursts = 6;
		fwNextT = 0;
		fanfare();
	}

	function updateFireworks( dms ) {
		if ( fwBursts > 0 ) {
			fwNextT -= dms;
			if ( fwNextT <= 0 ) {
				fwNextT = 640;
				fwBursts--;
				var cols = [ 0xffd76a, 0xff9ecb, 0x8fd0ff, 0xcbb2ff, 0xf4f4f0 ];
				fireworkBurst(
					buggyBody.position.x + ( Math.random() - 0.5 ) * 240,
					worldY + 90 + Math.random() * 70,
					buggyBody.position.y + ( Math.random() - 0.5 ) * 240,
					cols[ fwBursts % cols.length ] );
				cheer( 1.3 );
			}
		}
		for ( var i = 0; i < fwPool.length; i++ ) {
			var p = fwPool[ i ];
			if ( p.life <= 0 ) continue;
			p.life -= dms;
			var dt2 = dms / 1000;
			p.vy -= 85 * dt2;
			p.spr.position.x += p.vx * dt2;
			p.spr.position.y += p.vy * dt2;
			p.spr.position.z += p.vz * dt2;
			p.spr.material.opacity = 0.85 * Math.max( 0, p.life / p.max );
		}
	}

	// AIR MOTES — fine dust hanging in the air, drifting on a lazy wind.
	// The cloud recycles around the buggy so the air is always inhabited;
	// each recycled mote re-seats itself off the terrain under it.
	var moteField = null, MOTE_N = 220, MOTE_R = 340;
	function initMotes( THREE ) {
		var bx = buggyBody ? buggyBody.position.x : SPAWN.x;
		var bz = buggyBody ? buggyBody.position.y : SPAWN.y;
		var pos = new Float32Array( MOTE_N * 3 );
		for ( var i = 0; i < MOTE_N; i++ ) {
			var mx = bx + ( Math.random() - 0.5 ) * MOTE_R * 2;
			var mz = bz + ( Math.random() - 0.5 ) * MOTE_R * 2;
			pos[ i * 3 ] = mx;
			pos[ i * 3 + 1 ] = hillsAt( mx, mz ) + 3 + Math.random() * 55;
			pos[ i * 3 + 2 ] = mz;
		}
		var geo = new THREE.BufferGeometry();
		geo.setAttribute( 'position', new THREE.BufferAttribute( pos, 3 ) );
		moteField = new THREE.Points( geo, new THREE.PointsMaterial( {
			map: makePuffTexture( THREE, 216, 206, 182 ), color: 0xd8cdb4,
			size: 2.4, sizeAttenuation: true, transparent: true,
			opacity: 0.3, depthWrite: false
		} ) );
		scene.add( moteField );
	}
	function updateMotes( dms, t ) {
		if ( ! moteField || ! buggyBody ) return;
		var pos = moteField.geometry.attributes.position;
		var bx = buggyBody.position.x, bz = buggyBody.position.y;
		var dt2 = dms / 1000;
		for ( var i = 0; i < MOTE_N; i++ ) {
			var x = pos.getX( i ) + ( 2.6 + Math.sin( t * 0.7 + i ) * 1.8 ) * dt2;
			var y = pos.getY( i ) + Math.sin( t * 1.1 + i * 2.7 ) * 2.4 * dt2;
			var z = pos.getZ( i ) + Math.cos( t * 0.5 + i * 1.3 ) * 2.2 * dt2;
			var re = false;
			if ( x < bx - MOTE_R ) { x += MOTE_R * 2; re = true; }
			else if ( x > bx + MOTE_R ) { x -= MOTE_R * 2; re = true; }
			if ( z < bz - MOTE_R ) { z += MOTE_R * 2; re = true; }
			else if ( z > bz + MOTE_R ) { z -= MOTE_R * 2; re = true; }
			if ( re ) y = hillsAt( x, z ) + 3 + Math.random() * 55;
			pos.setXYZ( i, x, y, z );
		}
		pos.needsUpdate = true;
		// motes catch the light — fuller by day, faint sparks by night
		moteField.material.opacity = 0.12 + dayFactor * 0.22;
	}

	function initSmoke( THREE ) {
		var tex = makePuffTexture( THREE, 186, 188, 198 );
		// chimney tops: farmhouse local (22, 77, -10) × 3.0, cookshack
		// local (18, 52, 6) × 2.8 — move these when a chimney moves
		[ { x: 1277, y: hillsAt( 1211, 588 ) + 231, z: 558 },
		  { x: 2290, y: hillsAt( 2240, 462 ) + 146, z: 479 },
		  { x: 1580, y: hillsAt( 1580, 800 ) + 16, z: 800 } ].forEach( function ( at ) { // firepit
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
			loadSamples(); // real recordings, fetched once, first time sound goes on
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
		// the engine bus: synth AND diesel sample route through it, and a
		// square-wave LFO chops its gain at cylinder-firing rate — the
		// "putt putt". Slow + deep at idle, blurring away as revs climb.
		audio.engBus = audio.ctx.createGain();
		audio.engBus.gain.value = 0.75;
		audio.engBus.connect( audio.master );
		audio.engGain.connect( audio.engBus );
		audio.puttOsc = audio.ctx.createOscillator();
		audio.puttOsc.type = 'square';
		audio.puttOsc.frequency.value = 9;
		audio.puttDepth = audio.ctx.createGain();
		audio.puttDepth.gain.value = 0.4;
		audio.puttOsc.connect( audio.puttDepth );
		audio.puttDepth.connect( audio.engBus.gain );
		audio.puttOsc.start();
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

		// FIRE VOICE, take three. The old pops were shaped from ONE
		// continuous noise source through ONE resonant bandpass — every pop
		// rang the same note ("tin bashing"). Now: a soft LOWPASSED roar
		// bed here, and discrete millisecond snaps (firePop, each through
		// its own randomly-tuned filter) fired by updateAudio. Both share
		// a steep-rolloff panner so the fire swells as you walk up.
		audio.noiseBuf = nb; // firePop slices its snaps from this
		audio.crackleGain = audio.ctx.createGain();
		audio.crackleGain.gain.value = 0.05; // the constant ember roar
		var ckLP = audio.ctx.createBiquadFilter();
		ckLP.type = 'lowpass'; ckLP.frequency.value = 460;
		audio.noise.connect( ckLP );
		ckLP.connect( audio.crackleGain );
		audio.cracklePan = makePanner( 1580, 800 ); // the firepit
		audio.cracklePan.refDistance = 8;
		audio.cracklePan.rolloffFactor = 2.6;
		audio.crackleGain.connect( audio.cracklePan );

		audio.noise.start();
	}

	/* ---- the SAMPLE layer: real recordings, lazy-loaded on sound-on.
	 * Sources + licenses: assets/audio/CREDITS.md. bq-duck.mp3 is a
	 * recording by Jonathon Jongsma, CC BY-SA 3.0, xeno-canto.org/62258;
	 * bq-moo.mp3 by MichaeltheFox8621, CC BY-SA 4.0, Wikimedia Commons;
	 * everything else is public domain / CC0. Every caller falls back to
	 * its synth version when a buffer is missing — audio can never break.
	 * Positional sound: PannerNodes in world-units/10; the listener rides
	 * the buggy (see updateAudio). ---- */
	var SAMPLE_NAMES = [ 'engine', 'clucks', 'coop', 'rooster', 'horse', 'moo',
		'splash', 'creak', 'crowd', 'duck' ];

	function loadSamples() {
		if ( samplesLoading || ! audio.ctx || ! window.fetch ) return;
		samplesLoading = true;
		var base = ( ( window.tcVentures && window.tcVentures.themeUrl ) || '' ) + '/assets/audio/bq-';
		SAMPLE_NAMES.forEach( function ( name ) {
			fetch( base + name + '.mp3' )
				.then( function ( r ) { if ( ! r.ok ) throw new Error( name ); return r.arrayBuffer(); } )
				.then( function ( ab ) {
					return new Promise( function ( res, rej ) {
						audio.ctx.decodeAudioData( ab, res, rej ); // callback form for Safari
					} );
				} )
				.then( function ( buf ) {
					sampleBufs[ name ] = buf;
					if ( name === 'engine' ) startEngineSample();
					if ( name === 'creak' || name === 'coop' || name === 'crowd' ) startPosLoops();
				} )
				.catch( function () { /* synth fallback covers it */ } );
		} );
	}

	function makePanner( x, z ) {
		var p = audio.ctx.createPanner();
		p.panningModel = 'equalpower';
		p.distanceModel = 'inverse';
		p.refDistance = 14;
		p.rolloffFactor = 1.1;
		if ( p.positionX ) { p.positionX.value = x / 10; p.positionZ.value = z / 10; }
		else p.setPosition( x / 10, 0, z / 10 );
		p.connect( audio.master );
		return p;
	}

	// one-shot sample; o = { at:{x,z}, gain, rate, slice } — slice plays a
	// random window of that many seconds (varied clucks/quacks for free)
	function playSample( name, o ) {
		var buf = sampleBufs[ name ];
		if ( ! buf || ! audio.on || ! audio.ctx ) return false;
		o = o || {};
		var src = audio.ctx.createBufferSource();
		src.buffer = buf;
		src.playbackRate.value = o.rate || 1;
		var g = audio.ctx.createGain();
		g.gain.value = o.gain !== undefined ? o.gain : 0.5;
		src.connect( g );
		g.connect( o.at ? makePanner( o.at.x, o.at.z ) : audio.master );
		var off = 0, dur = buf.duration;
		if ( o.slice && buf.duration > o.slice ) {
			off = Math.random() * ( buf.duration - o.slice );
			dur = o.slice;
		}
		src.start( 0, off, dur + 0.05 );
		return true;
	}

	// the diesel loop rides UNDER the synth engine; rate + gain follow revs
	function startEngineSample() {
		if ( engSample || ! sampleBufs.engine || ! audio.ctx ) return;
		var src = audio.ctx.createBufferSource();
		src.buffer = sampleBufs.engine;
		src.loop = true;
		var g = audio.ctx.createGain();
		g.gain.value = 0;
		src.connect( g );
		g.connect( audio.engBus || audio.master ); // through the putt bus
		src.start();
		engSample = { src: src, gain: g };
	}

	// world-anchored beds: hens at the coop, applause at the stands, the
	// windmill creaking on a lazy randomized repeat
	function startPosLoops() {
		if ( ! audio.ctx ) return;
		[ { name: 'coop', x: COOP.x, z: COOP.z, gain: 0.5, loop: true },
		  { name: 'crowd', x: 2240, z: -300, gain: 0.4, loop: true },
		  { name: 'creak', x: 3370, z: 813, gain: 0.7, rate: 0.8, gapMin: 2000, gapMax: 4600 } ].forEach( function ( d ) {
			if ( posStarted[ d.name ] || ! sampleBufs[ d.name ] ) return;
			posStarted[ d.name ] = true;
			var panner = makePanner( d.x, d.z );
			if ( d.loop ) {
				var src = audio.ctx.createBufferSource();
				src.buffer = sampleBufs[ d.name ];
				src.loop = true;
				var g = audio.ctx.createGain();
				g.gain.value = d.gain;
				src.connect( g );
				g.connect( panner );
				src.start();
			} else {
				( function again() {
					var src = audio.ctx.createBufferSource();
					src.buffer = sampleBufs[ d.name ];
					src.playbackRate.value = d.rate * ( 0.92 + Math.random() * 0.16 );
					var g = audio.ctx.createGain();
					g.gain.value = d.gain;
					src.connect( g );
					g.connect( panner );
					src.start();
					setTimeout( again, d.gapMin + Math.random() * ( d.gapMax - d.gapMin ) );
				} )();
			}
		} );
	}

	// one fire SNAP: a 12–45ms noise slice through its own randomly-tuned
	// lowpass — every pop a different colour, none of them ring. One in
	// ~8 is a louder knot-crack.
	function firePop() {
		if ( ! audio.on || ! audio.ctx || ! audio.cracklePan || ! audio.noiseBuf ) return;
		var t0 = audio.ctx.currentTime;
		var src = audio.ctx.createBufferSource();
		src.buffer = audio.noiseBuf;
		var lp = audio.ctx.createBiquadFilter();
		lp.type = 'lowpass';
		lp.frequency.value = 500 + Math.random() * 1900;
		var g = audio.ctx.createGain();
		var peak = Math.random() < 0.12 ? 0.55 : 0.14 + Math.random() * 0.18;
		var dur = 0.012 + Math.random() * 0.033;
		g.gain.setValueAtTime( 0.0001, t0 );
		g.gain.linearRampToValueAtTime( peak, t0 + 0.003 );
		g.gain.exponentialRampToValueAtTime( 0.0001, t0 + dur );
		src.connect( lp );
		lp.connect( g );
		g.connect( audio.cracklePan );
		src.start( t0, Math.random() * ( audio.noiseBuf.duration - 0.1 ), dur + 0.02 );
	}

	// TRUMAC'S BELLOW — the moo sample pitched down to a chest-deep roar,
	// through a barely-rolling-off panner so the whole quarter hears him
	// (louder near the bull, but never gone). Synth fallback: low saw swell.
	function trumacBellow() {
		if ( ! audio.on || ! audio.ctx || ! trumacRef ) return;
		if ( sampleBufs.moo ) {
			var src = audio.ctx.createBufferSource();
			src.buffer = sampleBufs.moo;
			src.playbackRate.value = 0.5 + Math.random() * 0.08;
			var g = audio.ctx.createGain();
			g.gain.value = 0.9;
			var p = makePanner( trumacRef.body.position.x, trumacRef.body.position.y );
			p.refDistance = 90;
			p.rolloffFactor = 0.4;
			src.connect( g );
			g.connect( p );
			src.start();
		} else {
			var t0 = audio.ctx.currentTime;
			var o = audio.ctx.createOscillator();
			o.type = 'sawtooth';
			o.frequency.setValueAtTime( 72, t0 );
			o.frequency.linearRampToValueAtTime( 54, t0 + 0.7 );
			var lp = audio.ctx.createBiquadFilter();
			lp.type = 'lowpass';
			lp.frequency.value = 300;
			var gg = audio.ctx.createGain();
			gg.gain.setValueAtTime( 0.0001, t0 );
			gg.gain.exponentialRampToValueAtTime( 0.3, t0 + 0.12 );
			gg.gain.exponentialRampToValueAtTime( 0.0001, t0 + 0.9 );
			o.connect( lp );
			lp.connect( gg );
			gg.connect( audio.master );
			o.start( t0 );
			o.stop( t0 + 0.95 );
		}
	}

	// the pumpjack's clank — synth, but placed in the world at the unit
	function pumpClank() {
		if ( ! audio.on || ! audio.ctx ) return;
		var t0 = audio.ctx.currentTime;
		var o = audio.ctx.createOscillator();
		o.type = 'sine';
		o.frequency.setValueAtTime( 92, t0 );
		o.frequency.exponentialRampToValueAtTime( 55, t0 + 0.16 );
		var g = audio.ctx.createGain();
		g.gain.setValueAtTime( 0.5, t0 );
		g.gain.exponentialRampToValueAtTime( 0.0001, t0 + 0.22 );
		o.connect( g );
		g.connect( makePanner( 3820, 2280 ) );
		o.start( t0 );
		o.stop( t0 + 0.24 );
	}

	// the windmill's sail SWOOSH — a soft noise swell from the shore
	function millSwoosh() {
		if ( ! audio.on || ! audio.ctx || ! audio.noise ) return;
		var t0 = audio.ctx.currentTime;
		var src = audio.ctx.createBufferSource();
		src.buffer = audio.noise.buffer;
		src.loop = true;
		var bp = audio.ctx.createBiquadFilter();
		bp.type = 'bandpass';
		bp.frequency.setValueAtTime( 180, t0 );
		bp.frequency.exponentialRampToValueAtTime( 420, t0 + 0.5 );
		bp.Q.value = 1.4;
		var g = audio.ctx.createGain();
		g.gain.setValueAtTime( 0.0001, t0 );
		g.gain.exponentialRampToValueAtTime( 0.5, t0 + 0.32 );
		g.gain.exponentialRampToValueAtTime( 0.0001, t0 + 0.85 );
		src.connect( bp );
		bp.connect( g );
		g.connect( makePanner( 3370, 813 ) );
		src.start( t0 );
		src.stop( t0 + 0.9 );
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
		// wheelspin REVS the engine — bogged in mud at full throttle she
		// screams while barely moving (it used to rev DOWN with the speed)
		var rev = Math.min( 1, Math.min( 1, sp / 9 ) + slip * 0.85 )
			+ Math.abs( throttleInput ) * 0.25 + ( boostT > 0 ? 0.3 : 0 );
		audio.engOsc1.frequency.value = 52 + rev * 80;
		audio.engOsc2.frequency.value = ( 52 + rev * 80 ) * 2.02;
		// with the diesel sample running, the synth ducks to a bass layer.
		// AUDIBLE IDLE: the sample keeps a floor at rest, slowed to a chug.
		audio.engGain.gain.value = ( 0.02 + rev * 0.05 ) * ( engSample ? 0.4 : 1 );
		if ( engSample ) {
			engSample.gain.gain.value = 0.085 + rev * 0.13;
			engSample.src.playbackRate.value = 0.6 + rev * 0.9;
		}
		// putt-putt: firing-rate pulses, deep + slow at idle, faded at speed
		if ( audio.puttOsc ) {
			var idleF = 1 - Math.min( 1, rev * 1.4 );
			audio.puttOsc.frequency.value = 8.5 + rev * 22 + Math.random() * 0.9;
			audio.puttDepth.gain.value = 0.42 * ( 0.3 + idleF * 0.7 );
		}

		// the listener rides the buggy — positional sound tracks the drive
		var L = audio.ctx.listener;
		var lx = buggyBody.position.x / 10, lz = buggyBody.position.y / 10;
		var lfx = Math.cos( buggyBody.angle ), lfz = Math.sin( buggyBody.angle );
		if ( L.positionX ) {
			L.positionX.value = lx; L.positionZ.value = lz;
			L.forwardX.value = lfx; L.forwardZ.value = lfz;
		} else if ( L.setPosition ) {
			L.setPosition( lx, 0, lz );
			L.setOrientation( lfx, 0, lfz, 0, 1, 0 );
		}

		// tire roll — louder/brighter with speed, muffled in water, gritty in mud
		if ( audio.tireGain ) {
			// spinning tires churn loud even when the truck barely moves
			var roll = airborne ? 0 : Math.min( 1, sp / 9 + slip * 0.8 ) * 0.055;
			if ( inWater ) roll *= 0.35 + slip * 0.5;
			audio.tireGain.gain.value += ( roll - audio.tireGain.gain.value ) * 0.2;
			var tf = inMud ? 280 : ( inWater ? 480 : ( inCreek ? 540 : 640 + sp * 95 ) );
			audio.tireBP.frequency.value += ( tf - audio.tireBP.frequency.value ) * 0.2;
		}

		// scheduled ambience — the prairie chorus: sparse and DISTANT, never
		// constant. Crickets own the night, songbirds the day, and the
		// frogs sing from the slough rim (harder after dark).
		audio.cricketT = ( audio.cricketT || 0 ) - dms;
		if ( audio.cricketT <= 0 ) {
			audio.cricketT = 2600 + Math.random() * 4600;
			if ( dayFactor < 0.5 ) cricket(); else birdChirp();
		}
		audio.frogT = ( audio.frogT || 0 ) - dms;
		if ( audio.frogT <= 0 ) {
			audio.frogT = ( dayFactor < 0.5 ? 1700 : 4200 ) + Math.random() * 3800;
			frogCroak();
		}
		// Trumac sounds off across the whole farm, on his own clock
		audio.bellowT = ( audio.bellowT === undefined ? 12000 + Math.random() * 20000 : audio.bellowT ) - dms;
		if ( audio.bellowT <= 0 ) {
			audio.bellowT = 26000 + Math.random() * 38000;
			trumacBellow();
		}
		// the fire SNAPS — short discrete pops on an irregular clock, which
		// sometimes cluster the way settling embers do
		if ( audio.cracklePan ) {
			audio.crackleT = ( audio.crackleT || 0 ) - dms;
			if ( audio.crackleT <= 0 ) {
				audio.crackleT = 90 + Math.random() * 320;
				firePop();
				if ( Math.random() < 0.3 ) setTimeout( firePop, 30 + Math.random() * 70 );
			}
		}
		audio.cluckT = ( audio.cluckT || 0 ) - dms;
		if ( audio.cluckT <= 0 ) {
			audio.cluckT = 4200 + Math.random() * 6500;
			// the coop's earshot: mostly the hens bed (loop), sometimes the
			// rooster sounds off over it
			if ( Math.hypot( buggyBody.position.x - COOP.x, buggyBody.position.y - COOP.z ) < 900 ) {
				if ( Math.random() < 0.18 && sampleBufs.rooster ) {
					playSample( 'rooster', { gain: 0.6, at: { x: COOP.x, z: COOP.z } } );
				} else if ( ! posStarted.coop ) {
					softCluck();
				}
			}
		}
		audio.snortT = ( audio.snortT || 0 ) - dms;
		if ( audio.snortT <= 0 ) {
			if ( trumacRef && Math.hypot( buggyBody.position.x - trumacRef.body.position.x,
				buggyBody.position.y - trumacRef.body.position.y ) < 240 ) {
				audio.snortT = 2600;
				if ( Math.random() < 0.75 ) {
					// Trumac: a LOW moo (pitched down) — or the old synth snort
					if ( ! playSample( 'moo', { rate: 0.62, gain: 0.9,
						at: { x: trumacRef.body.position.x, z: trumacRef.body.position.y } } ) ) snort();
				}
			} else { audio.snortT = 900; }
		}
		// cows moo / horses whinny as you pass
		audio.herdT = ( audio.herdT || 0 ) - dms;
		if ( audio.herdT <= 0 ) {
			audio.herdT = 1400;
			for ( var ai = 0; ai < animals.length; ai++ ) {
				var an = animals[ ai ];
				if ( an.type !== 'cow' && an.type !== 'horse' ) continue;
				if ( Math.hypot( buggyBody.position.x - an.body.position.x,
					buggyBody.position.y - an.body.position.y ) < 260 && Math.random() < 0.3 ) {
					playSample( an.type === 'cow' ? 'moo' : 'horse',
						{ gain: 0.75, rate: 0.9 + Math.random() * 0.2,
						  at: { x: an.body.position.x, z: an.body.position.y } } );
					audio.herdT = 5200 + Math.random() * 4000;
					break;
				}
			}
		}
		// the pumpjack clanks once per beam stroke, from where it stands
		audio.pumpT = ( audio.pumpT || 0 ) - dms;
		if ( audio.pumpT <= 0 ) {
			audio.pumpT = 1848; // one clank per sin(t*1.7) cycle
			if ( Math.hypot( buggyBody.position.x - 3820, buggyBody.position.y - 2280 ) < 1000 ) pumpClank();
		}
		// the mill's sails swoosh by — one per blade pass, from the shore
		audio.millT = ( audio.millT || 0 ) - dms;
		if ( audio.millT <= 0 ) {
			audio.millT = 2618; // rev 10.47s / 4 sails
			if ( Math.hypot( buggyBody.position.x - 3370, buggyBody.position.y - 813 ) < 1400 ) millSwoosh();
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

	function squawk( at ) {
		if ( ! audio.on || ! audio.ctx ) return;
		// a random slice of REAL flustered hens, from where the bird is
		if ( playSample( 'clucks', { slice: 0.9, rate: 0.95 + Math.random() * 0.2,
			gain: 0.85, at: at } ) ) return;
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
	function tone( freq, dur, peak, type, t0, dest ) {
		if ( ! audio.on || ! audio.ctx ) return;
		t0 = t0 || audio.ctx.currentTime;
		var o = audio.ctx.createOscillator();
		o.type = type || 'square';
		o.frequency.value = freq;
		var g = audio.ctx.createGain();
		g.gain.setValueAtTime( 0.0001, t0 );
		g.gain.exponentialRampToValueAtTime( peak, t0 + 0.015 );
		g.gain.exponentialRampToValueAtTime( 0.0001, t0 + dur );
		o.connect( g ); g.connect( dest || audio.master );
		o.start( t0 ); o.stop( t0 + dur + 0.02 );
	}

	function splashSound() {
		if ( playSample( 'splash', { gain: 0.85, rate: 0.95 + Math.random() * 0.1 } ) ) return;
		noiseBurst( 0.5, 'bandpass', 1400, 0.6, 0.14, 380 );
	}
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
	// a random patch of distant prairie, bearing off the buggy — the
	// chorus surrounds you but is never ON you
	function distantAt( minD, maxD ) {
		var a = Math.random() * Math.PI * 2;
		var d = minD + Math.random() * ( maxD - minD );
		return makePanner( buggyBody.position.x + Math.cos( a ) * d,
			buggyBody.position.y + Math.sin( a ) * d );
	}
	function cricket() {
		if ( ! audio.on || ! audio.ctx ) return;
		var t0 = audio.ctx.currentTime;
		var out = distantAt( 380, 1000 );
		var n = 3 + ( Math.random() * 3 | 0 );
		for ( var i = 0; i < n; i++ ) tone( 4300 + Math.random() * 300, 0.03, 0.06, 'triangle', t0 + i * 0.055, out );
	}
	// a distant songbird — a few warbled down-chirps from somewhere off
	// in the trees
	function birdChirp() {
		if ( ! audio.on || ! audio.ctx ) return;
		var t0 = audio.ctx.currentTime;
		var out = distantAt( 350, 950 );
		var n = 2 + ( Math.random() * 3 | 0 );
		var f0 = 2300 + Math.random() * 1400;
		for ( var i = 0; i < n; i++ ) {
			var ts = t0 + i * ( 0.11 + Math.random() * 0.07 );
			var o = audio.ctx.createOscillator();
			o.type = 'sine';
			o.frequency.setValueAtTime( f0 + Math.random() * 500, ts );
			o.frequency.exponentialRampToValueAtTime( f0 * ( 0.6 + Math.random() * 0.25 ), ts + 0.09 );
			var g = audio.ctx.createGain();
			g.gain.setValueAtTime( 0.0001, ts );
			g.gain.exponentialRampToValueAtTime( 0.14, ts + 0.02 );
			g.gain.exponentialRampToValueAtTime( 0.0001, ts + 0.1 );
			o.connect( g ); g.connect( out );
			o.start( ts ); o.stop( ts + 0.12 );
		}
	}
	// frogs on the slough rim — low sawtooth croaks with a throat-sac
	// rattle, placed on the shore so the pond announces itself
	function frogCroak() {
		if ( ! audio.on || ! audio.ctx ) return;
		var th = Math.random() * Math.PI * 2;
		var rr = pondR( th ) + 4;
		var out = makePanner( POND.x + Math.cos( th ) * rr, POND.z + Math.sin( th ) * rr );
		var t0 = audio.ctx.currentTime;
		var n = 1 + ( Math.random() * 3 | 0 );
		for ( var i = 0; i < n; i++ ) {
			var ts = t0 + i * ( 0.32 + Math.random() * 0.18 );
			var o = audio.ctx.createOscillator();
			o.type = 'sawtooth';
			o.frequency.setValueAtTime( 82 + Math.random() * 30, ts );
			o.frequency.linearRampToValueAtTime( 64, ts + 0.16 );
			var wob = audio.ctx.createOscillator(); // the throat-sac rattle
			wob.frequency.value = 22 + Math.random() * 8;
			var wg = audio.ctx.createGain();
			wg.gain.value = 0.5;
			var g = audio.ctx.createGain();
			g.gain.setValueAtTime( 0.0001, ts );
			g.gain.exponentialRampToValueAtTime( 0.85, ts + 0.03 );
			g.gain.exponentialRampToValueAtTime( 0.0001, ts + 0.2 );
			wob.connect( wg ); wg.connect( g.gain );
			var lp = audio.ctx.createBiquadFilter();
			lp.type = 'lowpass';
			lp.frequency.value = 640;
			o.connect( lp ); lp.connect( g ); g.connect( out );
			o.start( ts ); o.stop( ts + 0.22 );
			wob.start( ts ); wob.stop( ts + 0.22 );
		}
	}
	function softCluck() { noiseBurst( 0.14, 'bandpass', 700, 1.2, 0.045, 480 ); }
	function cheer( level ) {
		if ( ! audio.on || ! audio.ctx ) return;
		// real applause when loaded, layered over the synth voice-wash
		playSample( 'crowd', { slice: 2.6, gain: 0.3 * level } );
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
	// THE BUGGY — pimped. Fresh two-tone paint over a real tube cage,
	// knobby wheels with spoked rims, bull bar + grille, bucket seat,
	// steering wheel, mirrors, mud flaps, spare on the back, taillights
	// that bloom, and a pennant whip in the kids' gold. Same footprint,
	// same pose rig (chassisGroup leans, wheels ride the group).
	function buildBuggy( THREE ) {
		var g = new THREE.Group();

		chassisGroup = new THREE.Group();
		chassisGroup.position.y = 10;
		g.add( chassisGroup );

		// fresh paint (Phong so it catches highlights); the trims stay matte
		var paint = applyAtmosphere( new THREE.MeshPhongMaterial( {
			color: 0xb0472a, shininess: 46, specular: 0x4a2a1a } ), true );
		var cream = applyAtmosphere( new THREE.MeshPhongMaterial( {
			color: 0xe8dcc0, shininess: 30, specular: 0x333026 } ), true );
		var darkMat = mat( THREE, 0x1c1512 );
		var tube = mat( THREE, 0x2a2624 );
		var chrome = metalMat( THREE, 0xb8bec2 );

		// the tub + sloped hood + nose
		var tub = new THREE.Mesh( new THREE.BoxGeometry( 40, 8, 26 ), paint );
		tub.position.set( -2, 1, 0 );
		chassisGroup.add( tub );
		var hood = new THREE.Mesh( new THREE.BoxGeometry( 15, 5.5, 24 ), paint );
		hood.position.set( 14, 4.6, 0 );
		hood.rotation.z = -0.14;
		chassisGroup.add( hood );
		var nose = new THREE.Mesh( new THREE.BoxGeometry( 4, 7, 25 ), paint );
		nose.position.set( 21.5, 1.2, 0 );
		chassisGroup.add( nose );
		var deck = new THREE.Mesh( new THREE.BoxGeometry( 8, 5, 24 ), applyAtmosphere(
			new THREE.MeshPhongMaterial( { color: 0x8a3520, shininess: 30, specular: 0x3a2418 } ), true ) );
		deck.position.set( -19, 1.8, 0 );
		chassisGroup.add( deck );
		// cream racing stripe up the hood + over the tub
		var stripe = new THREE.Mesh( new THREE.BoxGeometry( 38, 0.6, 6 ), cream );
		stripe.position.set( 1.5, 5.35, 0 );
		stripe.rotation.z = -0.035;
		chassisGroup.add( stripe );
		// skid plate under the nose
		var skid = new THREE.Mesh( new THREE.BoxGeometry( 10, 1.2, 20 ), chrome );
		skid.position.set( 18, -3.2, 0 );
		chassisGroup.add( skid );

		// side livery: cream roundel with the "3" (one per kid) both doors
		var lc = document.createElement( 'canvas' );
		lc.width = lc.height = 64;
		var lx = lc.getContext( '2d' );
		lx.fillStyle = '#e8dcc0';
		lx.beginPath(); lx.arc( 32, 32, 26, 0, 7 ); lx.fill();
		lx.strokeStyle = '#7a2a18'; lx.lineWidth = 4;
		lx.beginPath(); lx.arc( 32, 32, 26, 0, 7 ); lx.stroke();
		lx.fillStyle = '#7a2a18';
		lx.font = '700 38px Georgia, serif';
		lx.textAlign = 'center';
		lx.fillText( '3', 32, 45 );
		var roundelTex = new THREE.CanvasTexture( lc );
		[ 1, -1 ].forEach( function ( sd ) {
			var plate = new THREE.Mesh( new THREE.PlaneGeometry( 7.5, 7.5 ),
				new THREE.MeshLambertMaterial( { map: roundelTex, transparent: true } ) );
			plate.position.set( 0, 1.6, sd * 13.06 );
			plate.rotation.y = sd > 0 ? 0 : Math.PI;
			chassisGroup.add( plate );
		} );

		// the ROLL CAGE — real tubes, not a box
		function bar( x0, y0, z0, x1, y1, z1, r ) {
			var dx = x1 - x0, dy = y1 - y0, dz = z1 - z0;
			var len = Math.sqrt( dx * dx + dy * dy + dz * dz );
			var m = new THREE.Mesh( new THREE.CylinderGeometry( r || 0.9, r || 0.9, len, 6 ), tube );
			m.position.set( ( x0 + x1 ) / 2, ( y0 + y1 ) / 2, ( z0 + z1 ) / 2 );
			m.quaternion.setFromUnitVectors( new THREE.Vector3( 0, 1, 0 ),
				new THREE.Vector3( dx / len, dy / len, dz / len ) );
			chassisGroup.add( m );
			return m;
		}
		[ -1, 1 ].forEach( function ( sd ) {
			var z = sd * 10;
			bar( 3, 5, z, 3, 15, z );          // front uprights
			bar( -13, 5, z, -13, 14, z );      // rear uprights
			bar( 3, 15, z, -13, 14, z );       // top side rails
			bar( -13, 14, z, -20, 4.5, z );    // rear diagonals
		} );
		bar( 3, 15, -10, 3, 15, 10 );          // front cross
		bar( -13, 14, -10, -13, 14, 10 );      // rear cross
		bar( 3, 15, -10, -13, 14, 10, 0.7 );   // X-brace
		bar( 3, 15, 10, -13, 14, -10, 0.7 );

		// bucket seat + headrest + steering wheel on a column
		var seatMat2 = mat( THREE, 0x6e4226 );
		var seatBase = new THREE.Mesh( new THREE.BoxGeometry( 9, 2.6, 10 ), seatMat2 );
		seatBase.position.set( -6, 4.4, 0 );
		chassisGroup.add( seatBase );
		var seatBack = new THREE.Mesh( new THREE.BoxGeometry( 2.6, 9, 10 ), seatMat2 );
		seatBack.position.set( -10.6, 8.6, 0 );
		seatBack.rotation.z = -0.14;
		chassisGroup.add( seatBack );
		var headrest = new THREE.Mesh( new THREE.BoxGeometry( 2.4, 3.2, 6 ), seatMat2 );
		headrest.position.set( -11.8, 13.2, 0 );
		chassisGroup.add( headrest );
		var column = new THREE.Mesh( new THREE.CylinderGeometry( 0.6, 0.6, 6, 6 ), darkMat );
		column.position.set( 3.5, 6.8, 0 );
		column.rotation.z = 0.9;
		chassisGroup.add( column );
		var wheelRim = new THREE.Mesh( new THREE.TorusGeometry( 2.6, 0.5, 6, 14 ), darkMat );
		wheelRim.position.set( 1.6, 9, 0 );
		wheelRim.rotation.y = Math.PI / 2;
		wheelRim.rotation.z = 0.9;
		chassisGroup.add( wheelRim );

		// bull bar + grille + round headlights in chrome rings
		bar( 24.2, -2, -8, 24.2, 6, -8, 0.8 );
		bar( 24.2, -2, 8, 24.2, 6, 8, 0.8 );
		bar( 24.2, 5.4, -9, 24.2, 5.4, 9, 0.8 );
		bar( 24.2, 0, -9, 24.2, 0, 9, 0.8 );
		var gc = document.createElement( 'canvas' );
		gc.width = 64; gc.height = 32;
		var gx = gc.getContext( '2d' );
		gx.fillStyle = '#241f1a'; gx.fillRect( 0, 0, 64, 32 );
		gx.fillStyle = '#3a342c';
		for ( var gi = 2; gi < 32; gi += 6 ) gx.fillRect( 2, gi, 60, 3 );
		var grille = new THREE.Mesh( new THREE.PlaneGeometry( 14, 5 ),
			new THREE.MeshLambertMaterial( { map: new THREE.CanvasTexture( gc ) } ) );
		grille.position.set( 23.56, 1.4, 0 );
		grille.rotation.y = Math.PI / 2;
		chassisGroup.add( grille );
		var lampMat = new THREE.MeshBasicMaterial( { color: glow( THREE, 0xffe9c9, 1.7 ) } );
		[ -8, 8 ].forEach( function ( z ) {
			var ring = new THREE.Mesh( new THREE.CylinderGeometry( 2.2, 2.2, 1.6, 10 ), chrome );
			ring.rotation.z = Math.PI / 2;
			ring.position.set( 23.4, 4.4, z );
			chassisGroup.add( ring );
			var bulb = new THREE.Mesh( new THREE.SphereGeometry( 1.6, 8, 8 ), lampMat );
			bulb.position.set( 24.2, 4.4, z );
			chassisGroup.add( bulb );
			// warmer + gentler: 1.1 pale-gold washed white walls to paper
			var spot = new THREE.SpotLight( 0xffb45e, 0.8, 440, 0.54, 0.75, 1.3 );
			spot.position.set( 22, 12, z );
			// aim DOWN the road, not along it: the old target (300 out, −4)
			// gave a 3° slope, so the beam sailed over the dirt and only lit
			// whatever stood at lamp height. The cone centre now strikes the
			// ground ~55 units ahead — a real lit pool in front of her.
			spot.target.position.set( 120, -10, z * 2 );
			g.add( spot );
			g.add( spot.target );
		} );
		// ground FILL: a warm pool right off the bull bar — catches the
		// dirt the spot cones still fly over in the first few metres
		var hlFill = new THREE.PointLight( 0xffb45e, 0.34, 150, 1.7 );
		hlFill.position.set( 42, 8, 0 );
		g.add( hlFill );

		// taillights (they bloom), exhaust with a chrome tip, mud flaps
		var tailMat = new THREE.MeshBasicMaterial( { color: glow( THREE, 0xff3b30, 1.5 ) } );
		[ -9, 9 ].forEach( function ( z ) {
			var tail = new THREE.Mesh( new THREE.BoxGeometry( 1, 2, 3.4 ), tailMat );
			tail.position.set( -23.2, 1.6, z );
			chassisGroup.add( tail );
		} );
		var pipe = new THREE.Mesh( new THREE.CylinderGeometry( 1, 1.2, 9, 6 ), darkMat );
		pipe.position.set( -20.5, 6.5, -8 );
		pipe.rotation.z = 0.5;
		chassisGroup.add( pipe );
		var tip = new THREE.Mesh( new THREE.CylinderGeometry( 1.4, 1.4, 2.4, 8 ), chrome );
		tip.position.set( -22.6, 10.2, -8 );
		tip.rotation.z = 0.5;
		chassisGroup.add( tip );
		[ -13.5, 13.5 ].forEach( function ( z ) {
			var flap = new THREE.Mesh( new THREE.BoxGeometry( 0.8, 5, 6 ), darkMat );
			flap.position.set( -21.5, -2.4, z );
			chassisGroup.add( flap );
		} );

		// mirrors + the whip antenna flying the kids' gold pennant
		[ -12, 12 ].forEach( function ( z ) {
			bar( 9, 8, z * 0.83, 9, 12.5, z, 0.4 );
			var mir = new THREE.Mesh( new THREE.BoxGeometry( 0.8, 2.2, 3 ), cream );
			mir.position.set( 9, 13.4, z );
			chassisGroup.add( mir );
		} );
		var whip = new THREE.Mesh( new THREE.CylinderGeometry( 0.25, 0.4, 13, 5 ), darkMat );
		whip.position.set( -19, 14, 10 );
		whip.rotation.x = 0.12;
		chassisGroup.add( whip );
		var pennant = new THREE.Mesh( new THREE.PlaneGeometry( 4.6, 2.4 ),
			new THREE.MeshBasicMaterial( { color: glow( THREE, 0xffd76a, 1.2 ), side: THREE.DoubleSide } ) );
		pennant.position.set( -16.6, 19.6, 10.8 );
		chassisGroup.add( pennant );

		// the spare on the back — every farm rig carries one
		var spare = makeWheel( THREE, 5.5, 4, 'wheelSpare', '#c8beac', '#7a2a18' );
		spare.rotation.y = Math.PI / 2;
		spare.position.set( -17.5, 9, 3 );
		chassisGroup.add( spare );

		// knobby wheels with cream five-spoke rims. The FRONTS sit inside a
		// yaw pivot group so they visibly steer; the mesh inside still owns
		// the rolling spin (rotation.z), so both motions compose correctly.
		[ [ 15, 8, 15 ], [ 15, 8, -15 ], [ -15, 8, 15 ], [ -15, 8, -15 ] ].forEach( function ( p ) {
			var w = makeWheel( THREE, 8, 6.5, 'wheelBuggy', '#c8beac', '#7a2a18' );
			if ( p[ 0 ] > 0 ) {
				var pivot = new THREE.Group();
				pivot.position.set( p[ 0 ], p[ 1 ], p[ 2 ] );
				pivot.add( w );
				g.add( pivot );
				frontSteer.push( pivot );
			} else {
				w.position.set( p[ 0 ], p[ 1 ], p[ 2 ] );
				g.add( w );
			}
			wheels.push( w );
		} );

		return g;
	}

	window.TCBackQuarter3D = { boot: boot };

} )();
