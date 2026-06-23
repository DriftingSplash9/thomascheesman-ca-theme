# SECRET-DRAWER-VISION.md — the forward build spec for "The Secret Drawer"

> **Status:** Vision / draft for review. **Not** a rebuild plan — the drawer
> already exists as a deep escape room. This is the spec for taking it from
> *great* to *unforgettable*, written 2026-06-22 (theme at 1.0.627).
>
> Precedent for this kind of doc: [`docs/CONVERGING-MAP-SPEC.md`](CONVERGING-MAP-SPEC.md).
> BHAG surface → **plan-first, no freelancing.** Chains land in commit-sized
> batches; each chain commit bumps `style.css` `Version:`.

---

## 0. What this document is

In a brainstorm (2026-06-22) we set out to fix the footer **pinball** mini-game
and instead realized the *real* centrepiece is the **secret drawer** — and that
most of the "moonshot" ideas an outside AI proposed are **already built**. This
doc:

1. Records, accurately, **what already exists** (so we never rebuild shipped work).
2. Captures the **north star** the drawer is reaching for.
3. Lays out **four workstreams** + the marble/pinball decision.
4. Gives a **phased build order** and the **open decisions** that are Thomas's.

---

## 1. The thesis (north star)

> *"It is the glory of God to conceal a thing."* — Proverbs 25:2, hand-placed
> inside the puzzle as its own thesis.

The drawer is chasing the same feeling the whole site chases: **curiosity,
discovery, craftsmanship, hidden depth, personal meaning.** The award-worthy
version isn't the best graphics or the most particles — it's:

> **A handcrafted artifact, hidden in Thomas's desk, that slowly unfolds into
> something larger than seems physically possible — and is unmistakably *his*.**

Two clarifications Thomas made that sharpen the aim:

- **It's about Thomas and his kids** — contemporary and personal — **not** the
  ancestral heritage corpus. The truer "family relic" is the *kids*, not the
  1800s migrations. New objects are welcome **only if each one earns a moment**
  (a memory, a clue, a reaction). Meaning over quantity.
- The most-wanted mechanic is **things interacting with each other** — more
  inter-object reactions — plus a drawer that **quietly remembers** its visitors.

---

## 2. What already exists today (grounded inventory)

> Source-of-truth files: [`assets/js/drawer-engine.js`](../assets/js/drawer-engine.js)
> (the interpreter), [`assets/js/secret-drawer.js`](../assets/js/secret-drawer.js)
> (the footer trigger + lazy boot), [`inc/data/drawer-puzzle.json`](../inc/data/drawer-puzzle.json)
> (all content). Off-repo design: `Secret-Drawer-Items (NEW2).docx` +
> `Secret-Drawer-Playbook.docx` on Thomas's Desktop.
>
> ⚠️ **Caveat:** this inventory is read from the *design data + engine docblock*,
> not a full end-to-end browser playthrough. A couple of chains are explicit
> stubs, and video/PDF playback can't be verified headlessly. Treat as "built
> as designed," to be confirmed in a real browser before we build on it.

**The two footer easter eggs are different things:**

| Trigger | Opens | File |
|---|---|---|
| The **brass pull / loose handle** | the **secret drawer** (the escape room) | `secret-drawer.js` → `drawer-engine.js` |
| The **marble** | the **pinball** mini-game | `desk-drawer.js` → `desk-pinball.js` (Matter.js) |

**The engine** (`drawer-engine.js`) is a small, data-driven escape-room
interpreter. Data model: `surfaces` (background art states), `objects`
(`{name, media, x, y, w, rot, state, draggable, hint, view}`), `zones` (drop
targets), `interactions` (`on: click|drop|combine|auto`, with `once` / `require`
gates: `all` / `none` / `minOf`). Action verbs include: `reveal` · `hide` ·
`remove` · `surface` · `flag` · `clue` · `effect` · `video` · `fullscreen` ·
`passcode` · `gallery` (PhotoSwipe) · `scroll` (PDF.js). It logs progress events
to a REST endpoint (`tc-drawer/v1/event`).

**The puzzle** (`drawer-puzzle.json`, version 5) is built on **real photos of
Thomas's actual drawer**, with **four surfaces** — `junk-{clean,dusty}` (wide
top-down) × `secret-{clean,dusty}` (close-up of the recessed compartments) —
and a **16-chain** escape room, including:

- **Combine mechanics**: screwdriver + screw → dust → duster; Hulk + hammer →
  smash nugget → rings; BIC + scroll → the **Bitcoin whitepaper unfurls
  page-by-page** (PDF.js); keys + train, glasses combines, etc.
- **A padlock gate (chain 8)** that, once enough chains are solved, **flips the
  drawer from the wide "junk" view into the hidden "secret" compartment** —
  i.e. the "unfold into a deeper world" mechanic already exists.
- **Branching endgame (chain 14)**: a Ledger + passcode (`67676767`), a **Top
  Prize** path, a **Golden Egg** path, a **$6.4M Fabergé** fork, and a
  responsible-cleanup *penalty* ending.
- **A wallet sub-puzzle (15)** whose five inserts surface the Ledger passcode.
- A **Hangman** mini-game (20 themed words **per month**), a **Pac-Man** arcade
  (coin-insert), a **PhotoSwipe gallery** of 14 real kid-camera photos, a hidden
  **December "Elf"** mechanic, plus many click→clue flavour beats.

**Known stubs / pending:** chain 5 (Hot Wheels race) waits on Thomas + Daniel
filming the bracket; chain 13 notes a planned **footer-marble ↔ pinball**
link that's never been done.

**Bottom line:** Directions a brainstorm framed as moonshots — "desk becomes an
escape room," "drawer unfolds into deeper machinery," "intentionally
handcrafted" — are **substantially shipped.** The frontier is narrower and more
interesting than a blank page.

---

## 3. The metaphor map (decided 2026-06-22)

Two drawer-pulls, two clearly different things — **no collision**:

- **Header pull = "the desk"** → opens the **desk-menu** nav overlay.
  The current top-right **hamburger trigger is redundant** now that the
  full nav bar is visible. Re-skin it as a **brass drawer pull** so it reads
  as *"open me — there's something here,"* not *"a menu you already see."*
  This is a **discoverability + metaphor** win.
- **Footer pull = "the secret drawer"** → opens the escape room.
  Stays the deeper, hidden surprise with its **own** distinct handle, lower
  on the page. Its findability is its own question (see Workstream D).

Guardrail: a visitor must never yank the header handle expecting the treasure
room and get a nav menu. Scale + placement + copy keep them distinct (a small
index-card pull up top vs. the big secret drawer below).

---

## 4. The workstreams

### D — Discoverability *(highest leverage, smallest)*
A masterpiece nobody finds is a tree falling in an empty forest. The **first
question is not "what to build" — it's "does anyone ever find the brass pull?"**
- **D1.** Re-skin the **header desk-menu trigger** as a brass drawer pull
  (BHAG header surface → plan-first). Removes the redundant-hamburger feel.
- **D2.** Audit + improve the **footer secret-drawer handle's** findability —
  is the current hover/affordance enough that a curious visitor notices it?
  (Needs a `secret-drawer.js` read + a real-device look before proposing.)
- **D3.** Decide how loud the cue should be — the magic depends on it feeling
  *found*, not advertised. A whisper, not a banner.

### I — More things interacting *(most buildable; engine's wheelhouse)*
The engine already does `combine`. Adding inter-object reactions is squarely
content-driven (JSON chains), not new engine code.
- New combine/reaction chains between existing objects.
- Chain reactions (`on: 'auto'` + `require`) so one discovery quietly arms
  another — the "Rube Goldberg / it keeps going" feeling.

### B — The kids relic *(uniquely his; meaning over quantity)*
Deepen objects so each is a **portal to a memory of the kids/family**, not just
a clue. New knick-knacks welcome **only if each earns a moment.** Candidate
hooks: link select discoveries to the kids' pages / family content already on
the site (gated appropriately per OD-1 / family-login).

### R — The drawer that remembers → a VISITORS' BOOK *(decided 2026-06-22)*
The "remembering" trace is concretized as a **visitors' book** — a comment
thread **disguised as an old guestbook/ledger**, hidden in the drawer, that
fills over time ("I am not the first person here").
- **Likely rides existing infra (confirm at build):** the site already has a
  custom, no-plugin **moderated comments system** ([[project_tc_comments]] —
  honeypot, monogram avatars, no Gravatar, all entries *held* for review;
  built 2026-06-18). The guestbook should reuse that pipeline rather than be
  rebuilt. Probable shape: a dedicated hidden WP page/post holds the entries;
  the drawer surfaces them with guestbook styling; writes go through the same
  moderated comment path. (Cross-visitor persistence is also proven by the
  arcade leaderboard `tc-games/v1/scores` + drawer events `tc-drawer/v1/event`.)
- **Non-negotiables:**
  - **Moderation / held, never live** — guestbooks are the web's #1 spam
    magnet. Entries queue for review (the comments system already does this).
  - **Privacy (OD-1)** — anonymous "I was here" signing is on-brand; stranger
    free-text is screened; **nothing about the kids is ever exposed**. Never
    tracking — aggregate/anonymous only.
  - **Performance** — paginate / cap render as the book grows.

### The marble / pinball — DECIDED 2026-06-22: beautify + keep
The current pinball is *slow + blocky* because **it's the code, not the
browser** (hand-drawn flat-colour Canvas2D on Matter.js; the site already runs
WebGL). Thomas's call: **keep pinball, make it genuinely beautiful** — it stays
the marble's payoff and a *sidekick* to the drawer, not a rival. Scope:
- **Retina-crisp** — scale the canvas by `devicePixelRatio` (a likely culprit
  for the "blocky/soft on phone" look).
- **Real art + lighting** instead of flat `fillStyle` shapes; juicier feedback
  (particles, flash, sound), tighter input + flipper/physics tuning.
- Render upgrade candidates: a much richer Canvas2D pass, or PixiJS/WebGL.
- Fold in the long-noted **footer-marble ↔ pinball-ball colour match** (chain 13).

---

## 5. Constraints & guardrails

- **BHAG surfaces** (desk menu, drawer, header) → **plan + propose** before code.
  Offer a ChatGPT brainstorm for bold directions; Claude implements the strongest.
- **Performance:** the drawer + libs are **lazy-loaded** on first open — visitors
  who never trigger it pay nothing. Keep it that way; budget download weight.
- **Mobile + desktop, touch + keyboard.** Touch is not an afterthought.
- **`prefers-reduced-motion`** must degrade gracefully (the engine already honours it).
- **Privacy is load-bearing** (OD-1): kids' content stays gated; the "remembering"
  layer is anonymous/aggregate only — **never** visitor tracking.
- **Never `object-fit` / `background-size: cover`** — always `contain`.
- **Data-driven:** content lives in `drawer-puzzle.json`; the engine is the
  interpreter. Most new work is JSON + art, not engine rewrites.
- **Versioning:** each chain/feature commit bumps `style.css` `Version:`
  (Edit tool, never `sed`). Docs-only commits (like this one) don't bump.

---

## 6. Phased build order (proposed)

| Phase | Workstream | Why this order | Size |
|---|---|---|---|
| **0** | **D1** — header trigger → drawer pull | First *tangible* win; small; raises the metaphor sitewide | S |
| **1** | **I** — more inter-object interactions | Engine's wheelhouse; pure content; immediate "alive" feeling | S–M |
| **2** | **D2/D3** — footer-handle discoverability | Make sure the depth gets *found* before adding more depth | S |
| **3** | **B** — kids-relic deepening | The uniquely-his payload; reuses existing family content | M |
| **4** | **Marble decision** — fold-in or replace | Resolve the sideshow once the drawer's direction is set | M |
| **5** | **R** — the remembering layer | New infra + privacy design; ride existing REST patterns | L |

Each phase is independently shippable and reversible. We can reorder freely;
this is the *recommended* sequence (cheap wins + "get it found" first, the big
ambitious R last).

---

## 7. Open decisions (Thomas's call)

1. ~~**Marble/pinball fate**~~ — **DECIDED: beautify + keep** (see Workstream §4).
2. ~~**R / "remembering"** — what trace?~~ — **DECIDED: a moderated visitors'
   book** disguised as a guestbook (see Workstream R). Still open *within* it:
   how loud is the "sign here" invitation?
3. **D3** — how *discoverable* should the secret drawer be? Whisper vs. nudge.
4. **B** — which kid memories / objects are in scope to surface, and how do they
   intersect the family-login gate (OD-1)?
5. **Scope of effort** — weeks (Phases 0–2) vs. months (through Phase 5)?

---

## 8. References

- Engine: [`assets/js/drawer-engine.js`](../assets/js/drawer-engine.js) ·
  Trigger/boot: [`assets/js/secret-drawer.js`](../assets/js/secret-drawer.js) ·
  Content: [`inc/data/drawer-puzzle.json`](../inc/data/drawer-puzzle.json)
- Marble game: [`assets/js/desk-pinball.js`](../assets/js/desk-pinball.js) ·
  loader [`assets/js/desk-drawer.js`](../assets/js/desk-drawer.js)
- Header/desk-menu: `header.php` · `inc/desk-menu.php` ·
  `assets/css/desk-menu.css` · `assets/js/desk-menu.js`
- Cross-visitor infra precedent: arcade leaderboard
  (`inc/games-leaderboard.php`, `tc-games/v1/scores`); drawer event endpoint
  (`tc-drawer/v1/event`)
- Off-repo design: `Secret-Drawer-Items (NEW2).docx`, `Secret-Drawer-Playbook.docx`
- Doc precedent: [`docs/CONVERGING-MAP-SPEC.md`](CONVERGING-MAP-SPEC.md)
