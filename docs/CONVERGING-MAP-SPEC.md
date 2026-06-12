# Build spec — The Lanterns of Record (converging-families map)

> An interactive world map + unified timeline + ghost family-tree that traces all of Thomas & Melanie's bloodlines across ~250 years and the globe as they converge on Alberta — rendered as **records becoming light**. The capstone for the heritage section. Referenced from `V0.18.md` Task E.

**Status:** design-complete, pre-build. BHAG-tier — **plan + propose before each phase; nothing built yet.**
**Owner-facing concept name:** *The Lanterns of Record.*

---

## 0. How to use this doc
This is the build contract. Section 11 (data model) is the thing to nail first — everything else renders *from* it. Build in the phases in §14; each phase is its own plan → approval → build. Reuse the existing long-read CSS tokens (atmosphere/glass/shimmer) for cohesion — see §12.

---

## 1. The thesis (the soul)
**History is the story of people becoming visible.** This family spent months tagging every ancestor by how *certain* the record is — **Verified / Probable / Inherited / Living memory.** This feature turns that epistemic data into the visual mechanic: a record is literally a source of light. The map begins in near-darkness (1750, almost no records) and brightens, century by century, as church registers, Napoleon's *état civil*, civil registration, censuses, and military rolls switch lights on across the world — until seven lines of carried light converge on one prairie and kindle three new lanterns.

Most genealogy maps show *where people went.* This one shows *how we came to be able to remember them.*

---

## 2. Concept summary
Four interlocking parts, **one visual language** (light in the dark — committed to fully; no competing metaphors):

1. **The lantern map (primary).** A dark world that lights up as documented lives enter the record. Brightness = confidence tier. Migration = light *carried* across the dark (incl. across the sea — "a' dol thar a' chuain" lives inside the paths, not as separate ocean wakes).
2. **The unified timeline (Thomas's idea).** All event-points from the 7–8 spokes merged into one scrubbable axis, shaped as a **record-density silhouette** — the "becoming visible" curve you slide along.
3. **The ghost family-tree (Thomas's idea).** A large, translucent tree behind/beneath the map that brightens branch-by-branch in lockstep with the map and timeline — the same data, projected genealogically instead of geographically.
4. **The frosted-glass HUD container.** The whole thing sits in a luminous "archive light-table" — the site's glassmorphism made into a desk-situation display you lean over.

---

## 3. The three synced windows (one dataset, three projections)
The map (geographic), the tree (genealogical), and the timeline (temporal) are **driven by the same merged dataset** and brighten together. Scrub time → lanterns ignite on the map, the matching branches glow on the tree, the bar advances along its density curve. This synchrony is the core engineering invariant: one time cursor, three renderers subscribing to it.

---

## 4. Visual language & the glass HUD container
- **Base:** deep indigo "after-hours archive," not black. Land barely discernible until records arrive.
- **Container:** reuse `.heritage-longread__frame` glass plate + the iridescent shimmer (`::after`) + the atmosphere base-gradient/blobs. The map surface reads as a **light-table / situation display**: a faint coordinate **graticule** that *sharpens* as records accumulate (ties to §6), subtle scanline + film grain, vignette.
- **On-brand:** this is the "desk metaphor" extended — the user leans over a glowing table of their own history. Cohesive with the desk-menu and long-reads, not a bolted-on dashboard.
- **Never `object-fit: cover`** on any imagery; author at target ratio.

---

## 5. The lantern system (the core mechanic)

### 5.1 Confidence tier → luminosity (the load-bearing rule)
The four existing tiers map directly to light:

| Tier | Light | Rationale |
|---|---|---|
| **Inherited** | faint, uncertain flicker (low opacity, slow shimmer) | family tradition only, unverified |
| **Probable** | soft steady glow | consistent across sources, no primary record |
| **Verified** | bright, crisp flame | anchored to a primary register/government record |
| **Living memory** | warm, full light | remembered directly by family |

The map renders **how sure we are**, not just who/where. This is the differentiator no other genealogy map has — because no one else captured the tiers.

### 5.2 Event type → light *character*
| event_type | light behaviour |
|---|---|
| birth / baptism | a candle kindling |
| marriage | two lights merging into one steadier flame |
| residence / census | a wider, calmer halo |
| migration / immigration | light **carried** along a path (see §5.4) |
| military | a brief, hard flash |
| death | the light **gutters and goes out** (see §5.3) |
| record (a registration event) | a steadying pulse — the moment a life becomes documentable |

### 5.3 Lights that go out (loss — render it honestly)
- **The Clearances / famine:** lights at the Hebridean and Irish origins **scatter and dim** as the lineage is pushed off the land; trails of light move away from extinguishing homes.
- **Norman George McIver, KIA 1917:** his lantern is carried from Saltcoats across the Atlantic and **extinguished in France**, with **no descendant light ever branching from it.** One honest dark point in a brightening world. A single low tone may accompany it (§10).

### 5.4 Paths as carried light
Migration is **not** a drawn line and **not** a separate ocean-wake system — it's a lantern *moving*, leaving a fading luminous trail (longer/brighter where the journey is well-documented, frayed/short where it isn't). The crossing of the water is light moving across the dark sea. One metaphor, fully committed.

---

## 6. The world-history spine — the "clarity wave"
As the time cursor crosses each region's **civil-registration milestone**, a soft wave of *sharpening* sweeps that region: the graticule and coastlines crisp up, faint lanterns steady into flames. The Napoleon spine becomes a **visible event**, not a caption.

| Milestone | Year | Touches |
|---|---|---|
| Parish registers only (church-kept) | pre-milestone | all — Scotland OPRs run to **1854** |
| Napoleon's *état civil* (Napoleonic Code) | **1804** → Netherlands ~**1811** | Lakeman, Verboom (why the Dutch lines are so deep) |
| England & Wales civil registration | **1837** | Haiste, Rycroft |
| Scotland statutory registration | **1855** | McIver/Campbell/Cameron, Docherty's Scottish leg |
| Ireland civil registration (all) | **1864** | Docherty (Donegal) |
| German Empire civil registration | **1876** | Steinke |
| Canadian provincial vital statistics | **late 1800s** (varies; SK regs the McIver fix used) | the prairie generation |

> Each family becomes "visible to history" at a different moment. Optional toggle: shade each region "records become reliable here." This is also the **opening line of the unified essay.**

---

## 7. The unified timeline (Thomas's merged-spoke scrubber)
- Merge **every event point from all 7–8 spokes** into one time axis (1750 → today).
- Render the axis as a **record-density silhouette**: nearly flat in 1750, swelling through the registration era, dense in the 20th century — the "becoming visible" curve as a skyline.
- **Family-colour banded** (stacked area or stream), so you can see which line dominates which decade.
- The bar is **navigation**: scrub freely, click a peak to jump, or hit **Play** for the cinematic sweep.
- Doubles as the master time cursor all three windows subscribe to (§3).

---

## 8. The convergence sequence (the payoff)
One restrained climax (not three competing ones):
1. The seven carried-lights all reach **Alberta** (Calgary / Grande Prairie).
2. They **merge into a single light.**
3. From it, **three new lanterns kindle** — Patience, Daniel, Faith.
4. The **ghost tree finishes lighting** and resolves so the three children sit at its base — the root the whole tree was growing toward (a quiet inversion of "descent").
5. The map reaches its brightest state ever — then **settles back to a warm, held glow.** A hearth, not fireworks. Bright, then *home.*

---

## 9. Interaction
- **Play mode (cinematic):** auto-advance 1750 → today; lanterns ignite, paths carry light, clarity-waves pass, tree brightens, ending on the convergence. The "lean back and watch your family become visible" experience.
- **Explore mode:** scrub the timeline; **hover** a lantern → name · date · place · source · **confidence tier**; **click** → opens that family's **long-read at the relevant chapter** (closes the loop back into the seven stories already built).
- Mode toggle; Explore is the default after Play finishes.

---

## 10. Sound (optional, opt-in)
Subtle, off by default, one-tap on. Per-region ambient cue on a departure (surf at Lewis, bells in Dutch villages, mill-hum in Leeds, tropical wind in Honolulu); a single low tone when a lantern goes out (Norman George). Must respect autoplay policy + an explicit mute; never required to understand the piece.

---

## 11. Data model — THE CONTRACT (build this first)

### 11.1 One spreadsheet per family (Thomas's workflow)
Columns:

| col | type | notes |
|---|---|---|
| `family` | enum | McIver, Campbell, Cameron, Docherty, Lakeman, Verboom, Haiste, Rycroft, Steinke, Cheesman |
| `person` | text | display name |
| `event_type` | enum | birth, baptism, marriage, residence, migration, immigration, military, death, record |
| `place` | text | human-readable ("Parish of Lochs, Isle of Lewis") |
| `lat`, `lng` | decimal | geocoded once, stored back (stable) |
| `year_start` | int | the event year |
| `year_end` | int / blank | for residence spans |
| `confidence` | enum | verified, probable, inherited, living |
| `source` | text | the record/citation (from the master references) |
| `chapter_link` | text / blank | `{slug}#{anchor}` into the long-read (e.g. `dochertys/mcivers#lr-chapter-six`) |
| `note` | text | optional |

### 11.2 Merge pipeline (off-repo converter, e.g. `_xlsx2map.js` in `Heritage research/`)
All per-family xlsx → one `inc/data/family-map.json`:
- **Point** feature per event (carries family, person, event_type, year, confidence, source, chapter_link).
- **LineString** per person, places ordered by year → the carried-light path.
- A derived **timeline index**: events bucketed by year × family → the density silhouette (§7).
- Same pattern as the existing `_md2heritage.js` / `{line}-images.json` pipeline — keep it `fs`-only, no deps.

### 11.3 Geocoding
Place → lat/lng once (manual, or a small geocode pass), written back into the xlsx so coordinates are stable and reviewable. Many places are already named precisely in the master references.

### 11.4 Privacy
The convergence shows living people (Thomas, Melanie, the three children). Frame consistently with the existing **Living Line** decision on the Docherty page (Thomas's informed call) — and **no living extended family** (second cousins etc.) unless Thomas says so, per the CLAUDE.md privacy rule.

---

## 12. Tech stack & architecture
- **Rendering:** **D3-geo** (SVG) + a world **TopoJSON** (110m). SVG is fine for hundreds of lanterns; if a glow layer gets heavy, promote *only the glow* to a `<canvas>` behind the SVG. (Leaflet is the fallback if pan/zoom-on-a-real-basemap is wanted, with `Leaflet.Arc` + `leaflet-ant-path` + `leaflet-timedimension` — but D3 wins for the themeable, animatable, "light in the dark" look.)
- **Files (proposed):**
  - `page-map.php` (or `page-family-map.php`) — WP page template; slug **TBD** (see §15).
  - `assets/js/family-map.js` — D3 + topojson; the three-window engine + time cursor.
  - `assets/css/family-map.css` — glass HUD; **reuse** the long-read atmosphere/glass/shimmer variables.
  - `inc/data/family-map.json` — generated; the merged GeoJSON + timeline index.
  - `Heritage research/_xlsx2map.js` + the per-family xlsxs — off-repo source + converter.
- **Enqueue** D3/topojson only on the map page (conditional, like pinball's lazy load). Bump `style.css` Version on ship.

---

## 13. Performance & accessibility
- **`prefers-reduced-motion`:** skip auto-play and path animation; render the final fully-lit state statically, timeline still scrubbable.
- **Mobile / low-power fallback:** drop the ghost tree, fewer glow layers, the timeline can go vertical; keep the lantern map + scrub. Never ship a janky globe to a phone.
- **Lazy:** load `family-map.json` and the D3 libs only when the page is reached.
- Keyboard: timeline scrubber and lanterns focusable; tooltips reachable.

---

## 14. Phased build plan (each = plan → approve → build)
- **P0 — Data template.** Generate the per-family xlsx (the §11.1 schema, styled, with the confidence/event_type enums as dropdowns) so Thomas can fill it one family at a time. Seed 1–2 families as proof. *(Smallest, unblocks everything — recommended first.)*
- **P1 — Static light-table.** D3 world map in the glass HUD; all lanterns placed at tiered brightness (§5.1); the density-bar timeline (§7); hover tooltips. **No time animation.** Proof of soul on the seeded families.
- **P2 — Time.** The master time cursor; scrub + Play; paths carry light (§5.4); lanterns ignite/extinguish over time (§5.3); the clarity-wave at each registration milestone (§6).
- **P3 — Tree + convergence + depth.** The ghost tree synced beneath (§3); the convergence sequence (§8); click-into-the-long-reads (§9); optional sound (§10); mobile fallback (§13).

The companion **unified essay** (opening on the Napoleon/records spine) can be drafted alongside P2/P3, drawing on `Family-Intersection-Bible.md`.

---

## 15. Open decisions — ALL SETTLED (Thomas, 2026-06-11)
1. **Page location / slug:** top-level **`/map`**.
2. **Line colours — SETTLED:** the eight approved pastels (§16).
3. **Campbell & Cameron:** **their own threads** (own light-paths; they may share the McIver sea-glass family or take derived shades — render call at P1).
4. **The Lakeman Shell-era globe-hops:** **include** (Venezuela, London, Kuwait, Singapore — the line's signature reach).
5. **Sound:** **off** by default (opt-in toggle per §10).
6. **"Departures" flourish:** **adopted** — brief zoom into the place being left, as a P3 grace note.
7. **Geocoding:** scripted/knowledge pass with coordinates written back into the xlsx for Thomas's review; uncertain places stay blank rather than guessed.

**P0 amendment (Thomas, 2026-06-11):** the workbook is pre-seeded BY the agent from the eight manuscripts/lineage tables (confidence tiers + sources carried over); Thomas fills only what the family alone knows — living residences (Dan's life points await the Dan interview; Melanie's Edmonton years + return-to-GP await her answer — blank years with a TBC note are valid rows).

---

## 16. Reference

### Family colours (5 set; 3 proposed)
**SETTLED (2026-06-11) — the eight line pastels, approved and live in style.css:** Cheesmans `#E9C87E` (hearth gold) · Dochertys `#DFA8C8` (Donegal heather) · McIvers `#8FD0C6` (sea glass) · Lakemans `#A8D5A2` (polder green) · Verbooms `#9FBCE8` (Delft blue) · Rycrofts `#F0A58F` (Kona sunset) · Steinkes `#A9BFCF` (quarried stone) · Haistes `#B7A8E3` (indigo wash). Use these for the map's family paths; the earlier proposals in this doc are superseded.

### The seven journeys (key geographies for geocoding)
- **McIver / Campbell / Cameron** — Isle of Lewis (Lochs/Carloway), South Uist, Urquhart-in-Moray (Spey Bay) → Saltcoats & Wapella/Earlswood, SK → Edmonton.
- **Docherty** — Donegal, Ireland → Hamilton/Lanarkshire, Scotland → eastern USA (incl. Preemption, Illinois) → Alix, Alberta.
- **Lakeman** — Netherlands (polders) → Dutch East Indies (Surabaya) → [Shell: Venezuela, London, Kuwait, Singapore] → Calgary.
- **Verboom** — Ter Aar & Zuid-Holland river-villages/polders/islands → Calgary.
- **Haiste** — Yorkshire (Barwick, Leeds, Pontefract) → Assiniboia, SK (~1907) → Alberta Peace Country.
- **Rycroft** — Leeds → Kingdom of Hawai'i (Honolulu) → Alberta Peace Country (+ a US Civil War cavalry thread).
- **Steinke** — German Lutheran → Illinois prairie → Peace Country.
- **Converge:** Thomas (Calgary 1980) + Melanie (Grande Prairie 1983), m. Calgary 2016 → Patience (2013), Daniel (2015), Faith (2017), Grande Prairie.

---

*Concept relay that produced this: Claude → Grok → ChatGPT (5 concepts) → Claude synthesis. Primary = Lanterns of Record; ghost tree + unified timeline = Thomas; one committed light-metaphor + this-family's confidence-tier data = the build edge.*
