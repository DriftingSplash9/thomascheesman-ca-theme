# QUARTER-SECTION-SPEC.md — the build spec for **"The Back Quarter"** homepage

> **Status:** APPROVED — all open decisions resolved by Thomas 2026-07-01
> (see §7). Build may begin at P0. (Filename keeps the working title;
> the shipped name is **The Back Quarter**.)
>
> Precedent for this kind of doc: [`docs/SECRET-DRAWER-VISION.md`](SECRET-DRAWER-VISION.md),
> [`docs/CONVERGING-MAP-SPEC.md`](CONVERGING-MAP-SPEC.md).
> BHAG surface → **plan-first, no freelancing.** Work lands in commit-sized
> batches; each code commit bumps `style.css` `Version:`.

---

## 0. What this document is

Thomas asked (2026-07-01) for the homepage to become a BHAG matching the desk
menu and the secret drawer: an **explorable, drivable world** in the spirit of
sites you explore by driving a buggy around, Super Mario World's path-gated
overworld, and FF7's world map. This doc turns that into a buildable spec:

1. The **thesis** and why this fits the site's existing metaphors.
2. The **world** — every landmark and what site destination it is.
3. The **machine** — buggy physics, rendering, art plan, data model.
4. **Progressive enhancement** — the homepage must stay a real homepage.
5. **Phased build order** + the **open decisions** that are Thomas's.

---

## 1. The thesis (north star)

The site already has an *indoors*: the desk (Thomas's head) and the drawer
(Thomas's secrets). The homepage becomes the *outdoors*:

> **A fictional quarter section of Peace Country — Thomas's whole world
> compressed onto one piece of land — that you explore by driving a rugged
> off-road buggy down dirt paths connecting the parts of his life.**

Header pull = the desk. Footer pull = the drawer. Front door = the land.
The site becomes a **place**.

Design values (same as the drawer's): curiosity, discovery, craftsmanship,
hidden depth, personal meaning. The buggy is not a gimmick bolted on — driving
past a billboard that carries a real sentence from the Lakeman story is the
site's writing *reaching the visitor* instead of waiting for them.

---

## 2. The world — landmarks and destinations

One quarter section (~a half-mile square), top-down with a slight oblique lean
(FF7-overworld feel, not flat satellite). Dirt paths rut between landmarks.
The buggy spawns at the **farm gate** (bottom centre, by the mailbox).

| # | Landmark | Site destination | Notes |
|---|---|---|---|
| 1 | **Farm gate + mailbox** (flag up when new) | "Recently added" | The flag is literally up when content is new. Clicking/driving up opens the ledger (§5). |
| 2 | **Farmhouse** (chimney smoke) | `/about` + `/family/thomas` | The house *is* Thomas. |
| 3 | **Cookshack / diner** (flickering neon OPEN) | the chef story (About §chef / hero content) | Its menu board reuses the Chef's Pass chalkboard art. |
| 4 | **Three treehouses in the windbreak** | the three kid pages | Doors carry a small "family key" sign → `/family-login`. **No names, no likenesses in map art.** |
| 5 | **Church + eight lanterns on the hill** | `/heritage` hub + 8 long-reads | Visual kinship with the Lanterns-of-Record map. Each lantern = one line; hover names it. |
| 6 | **Grain elevator** painted "1 of <50" | `/hcs` | The prairie's tallest thing = the page that matters most to searchers. |
| 7 | **Arcade barn** | desk-menu arcade / pinball | Drive in → the games actually boot (reuse existing lazy-load boots). |
| 8 | **Radio mast** (blinking red light) | `/elsewhere` (BYR + GPRS) | Broadcasting beyond the property line. |
| 9 | **Locked shed, off-path** | (no link) | Winks at the secret drawer. Interacting yields only a hint. The drawer stays the centrepiece; the shed never competes. |
| 10 | **Billboards along the paths** (3–4) | heritage long-reads + `/family` | Each carries a REAL pull-quote from the corpus, clickable to its story. Rotates per visit from a pool. |
| 11 | **The map table** (a roadside picnic table with a map on it) | `/map` (Lanterns of Record) | A map within the map. |

**Path-gating (Mario-style, light touch):** one path (to the church hill) starts
"bridge out"; visiting any long-read (tracked via localStorage) rebuilds the
bridge with a small animation next visit. Nothing is ever hard-locked — every
landmark is always clickable directly. Gating is a reward, not a wall.

**Privacy rules (OD-1):** no children's names, faces, or photos anywhere in the
map art or labels. Treehouses are anonymous ("the kids' pages"). The map is
public and indexed.

---

## 3. The machine

### 3.1 Rendering + physics
- **PixiJS 7 UMD** (already vendored for pinball) renders the world; **Matter.js**
  (already vendored) drives the buggy: top-down body with linear damping,
  angular steering, loose-dirt drift (lower friction on grass than path),
  soft collision with landmark footprints. Speed cap tuned so crossing the
  world takes ~10–15s — big enough to explore, small enough to never bore.
- Camera follows the buggy with lerp smoothing; world is ~2.5–3× the viewport.
- **Boot pattern copied from the pinball:** the game bundle + Pixi lazy-load
  only when the visitor engages (first keypress / tap on the map area), never
  on page load. Non-fatal everywhere: any load failure → the static homepage
  is simply what remains.

### 3.2 Art plan (recommendation)
- **One authored painted background** (the terrain: fields, windbreak, hill,
  paths) generated via AI image prompts at a fixed working ratio — same
  pipeline as the heritage pastels (`build-*-image-prompts-docx.js` precedent),
  with Thomas approving the art before integration. Authored at target ratio;
  **never `cover`-cropped** (hard rule) — the canvas letterboxes on odd
  viewports with a vignette.
- **Interactive elements** (buggy, mailbox flag, smoke, neon, lantern glows,
  billboards, blinking mast) are procedural Pixi sprites/graphics layered on
  top — same technique that built the whole pinball table, so they can animate,
  glow, and react without baking variants into the painting.
- Optional day/night tint driven by the visitor's local clock (cheap Pixi
  colour-matrix — the site's nocturnal palette is the night look; day is a
  warm desaturation).

### 3.3 Controls
- **Desktop:** WASD/arrows to drive; Enter/click to "honk → enter" a landmark
  when in range (prompt chip appears). Escape releases focus to the page.
- **Mobile:** a thumb joystick (bottom-left) + a single "enter" button; or
  tap-to-drive-toward. Decide in P4 after real-phone feel-testing (MOB-1 pass).
- **Keyboard-only / screen readers:** the canvas is `aria-hidden`; the ledger
  (§5) and the existing nav carry every destination as plain links. The game
  is additive, never the only door.

### 3.4 Data model
- `inc/data/quarter-section.json` (mirrors the drawer-engine convention):
  `landmarks[] {id, name, x, y, w, h, href, sign, gate?}`,
  `billboards[] {quote, source, href}`, `paths[]` polylines, `spawn`.
  Content edits never require touching engine code.
- Progress (`bridge rebuilt`, `landmarks visited`) in localStorage under one
  key, versioned.

---

## 4. Progressive enhancement — the homepage stays a homepage

Non-negotiable structure of `front-page.php` after the build:

1. **The Chef's Pass hero stays** (compact) — it is the LCP, the SEO h1, and
   the identity statement. The map must not replace the *meaning* of the page.
2. **The Quarter Section section** sits below the hero: a static painted
   preview image (the world seen from above, `loading=lazy`) with a "press W /
   tap to drive" invitation. Engagement swaps in the live canvas.
3. **The Ledger** (§5) below/beside the map: plain HTML links + excerpt —
   this is the no-JS / a11y / SEO fallback AND a real content section.
4. The pillars section **retires** (the map + ledger replace it; emojis die
   with it, per Thomas 2026-07-01).

Performance budget: zero new bytes on first paint beyond the preview image
(≤ ~180KB webp) + the invitation chip. Pixi/Matter/engine/painting lazy-load
on engagement only. LCP unchanged (hero). CLS 0 (fixed-height section).

---

## 5. The Ledger — "recently added" + excerpt (works even if you never drive)

A slim, bespoke HTML strip styled like the farm's **logbook page**:

- **Recently added** — 3 rows, hand-maintained in `inc/data/quarter-section.json`
  (`recent[] {label, href, date}`). Updated as part of any content push (same
  discipline as version bumps). The mailbox flag raises when the newest entry
  is < 21 days old — one shared data source for both the HTML and the map.
- **One rotating pull-quote** from the heritage corpus (same pool the
  billboards draw from) with "read the whole story →".

This satisfies homepage needs #2 (excerpt) and #5 (recency) even for visitors
who never touch the game — and it's the accessibility text-equivalent of the
entire map.

---

## 6. Phased build order

| Phase | Ships | Definition of done |
|---|---|---|
| **P0 — walking skeleton** ✅ 1.0.668 | Canvas boots on engagement; buggy drives with real physics on a placeholder-painted ground; camera follows; ONE landmark links out; static preview + fallback intact. | Feels good to drive. Thomas taste-checks *feel* before any art money is spent. |
| **P1 — the world** ✅ 1.0.669 | Authored painting (`…/2026/07/6255f323-…jpg`) is the ground; whole board fits the stage (no pan); 11 landmarks with collision + pulsing markers + labels + hotspots; 8 live destinations + 3 stubs (barn/shed/mailbox); painting doubles as the pre-engagement preview. Landmark coords in painting px space (1280×720) live in `back-quarter.js` `WORLD`. Day/night tint deferred (art is already night). | Every destination reachable by driving or clicking. |
| **P2 — the ledger + signs** | Mailbox + flag logic; the Ledger HTML strip; billboards with the real quote pool; pillars section retired. | #2/#5 satisfied for all visitors; emojis gone. |
| **P3 — life** | Bridge-out gating; smoke/neon/lantern ambient animation; honk; small SFX (reuse pinball's WebAudio synth patterns, mute persisted); locked-shed wink. | The world feels tended, not static. |
| **P4 — mobile + polish** | Joystick/tap-to-drive after real-phone testing; reduced-motion audit; perf pass (PSI before/after); a11y verification. | MOB-1-grade phone experience; budgets hold. |

Each phase = one or more normal commits (version-bumped, pushed, purged,
Toolbox CSS/JS purge reminder when bundles change).

**Verification limit (carried from pinball):** background/automation tabs
freeze rAF/WebGL — I can verify clean boot + zero console errors, but the
*feel* checks (P0 especially) are Thomas's foreground playthroughs.

---

## 7. Decisions — RESOLVED by Thomas, 2026-07-01

| # | Decision | Resolution |
|---|---|---|
| D1 | Name | **"The Back Quarter."** |
| D2 | Art pipeline | Claude drafts image prompts → Thomas runs them through **Grok Imagine** (optionally regenerated/adapted by Grok), grades/crops in **CapCut**, delivers a static image at the spec'd ratio. Thomas approves the sample before P1 integration. |
| D3 | Hero position | **Compact above the map.** |
| D4 | Sound default | **Off** + persisted toggle. (Trivial one-line default to flip later.) |
| D5 | Landmark cut | All of §2; #11 (map table) optional if crowded. |
| D6 | (superseded) | Thomas redirected this to a hero enhancement instead: a **faded black-and-white ghost image** behind the chalkboard + ticket (shipped 1.0.667). December reading-photo re-add deferred to ~November. |

---

## 8. PATH C — "Back Quarter 3D" (approved 2026-07-02)

After driving the 2D board, Thomas pointed at **bruno-simon.com** as the true
north star and approved **Path C**: a low-poly 3D rebuild. Clarified for the
record: Hostinger/WP was never a blocker — Bruno's site is all client-side
(Three.js + physics + static assets); the real cost is 3D art, which we cover
with **procedural low-poly built in code** (Monument-Valley/Crossy-Road
aesthetic), optionally AI-generated GLBs (Meshy/Tripo) later.

**Architecture (deliberate):**
- **Physics stays Matter, 2D top-down** — the tuned handling (turn 0.072,
  grip 0.76, cap 5.6, frictionAir 0.14) carries 1:1. Matter (x,y) → Three
  (x,z); `rotation.y = -body.angle`. cannon-es only if ramps/vertical play
  arrive later.
- **Render is the already-vendored Three r128** (`tcVentures.threeUrl`).
- **The 2D board STAYS the public homepage** until 3D earns the swap; then 2D
  becomes the weak-device/fallback experience. During the build the 3D is
  hash-gated: visit `/#bq3d` → a "Try the 3D build (beta)" button appears in
  the stage preview. Engine: `assets/js/back-quarter-3d.js` (cache-busted
  `?cb=Date.now()` while in beta).

**3D phases:**

| Phase | Ships | Status |
|---|---|---|
| **3D-P0 — feel check** | Low-poly night sandbox: ground, moon, fog, fence, poplars, knockable hay bales; chunky buggy (spinning wheels, headlight spotlights, faked suspension lean, blob shadow); chase camera; WASD + fullscreen. | ✅ 1.0.673 |
| **3D-P1 — raise the farm** | All 11 landmarks as procedural low-poly buildings (self-lit windows + fake glow pools, no per-building lights), floating label sprites that brighten on approach, dirt-path strips, 3 ponds, the farm gate + lantern, the treehouse windbreak; navigation wired (proximity + Enter, click via raycaster; blinking mast beacon). Same 1280×720 coords as the 2D board. | ✅ 1.0.674 |
| **3D-P2 — life & juice** | Dust particles, tire tracks, honk + engine hum (WebAudio, muted default), chimney smoke, mailbox flag, billboard quotes in 3D. | |
| **3D-P3 — the swap** | Mobile joystick, perf pass (device-capability gate), reduced-motion audit; 3D becomes the homepage default, 2D board demoted to fallback. | |
