# HERO-PROMOTION-SPEC.md — putting The Back Quarter at the top of the homepage

> **Status:** BUILT on disk 2026-09-19 (theme 1.0.754), **not yet pushed**.
> Decisions are closed (§6). What shipped, the measured P0 numbers and the
> verification list live in [`V0.42.md`](../V0.42.md) at the repo root; this
> doc keeps the reasoning.
> Requested 2026-09-19: *"I will make the backquarter menu at the top of the
> homepage instead of out of view. It can be the hero can't it?"*
>
> Yes. This doc says how, and what must not break on the way.
>
> Precedent: [`docs/QUARTER-SECTION-SPEC.md`](QUARTER-SECTION-SPEC.md).
> BHAG surface → **plan-first, no freelancing.** Work lands in commit-sized
> batches; each code commit bumps `style.css` `Version:`. The agent that starts
> the build writes `V0.42`.

---

## 0. What this is

The Back Quarter is the front door of the site, and it currently sits below a
full hero section, so a visitor has to scroll to find the thing the homepage is
actually for. This plan moves it up without breaking the four properties that
make it defensible: it loads nothing until asked, it never traps the keyboard,
it has a text equivalent, and the site works fine for someone who ignores it.

## 1. Current state — verified in the source, 2026-09-19

`front-page.php`, in order:

| # | Section | What it is |
|---|---|---|
| 1 | `.hero-section--pass` | "The pass" — kinetic `<h1>` (*Chef until my hands retired me*), subtitle, a short about-menu, a CTA, and the rotating order-ticket portrait. **The page's only `<h1>`.** |
| 2 | `.bq-section` | The Back Quarter stage. |
| 3 | `.ledger-section` | Recently added + a rotating pull-quote. Already written as the map's text equivalent. |
| — | drawer footer | The connect surface; the old CTA section was retired into it. |

The stage as it stands:

- `.bq-stage` is `aspect-ratio: 16/9`, `max-height: 74vh`, `background-size: contain`
  (never `cover`), painted board set inline from PHP via `data-bg`. On narrow
  screens it becomes `aspect-ratio: 4/5`.
- The board is a **real background image**, painted in on first render. The
  engines (Pixi + Matter for 2D, Three.js for 3D) load **only** on click of
  *Start driving* / *Try the 3D build (beta)*, which adds `.is-live`.
- **Keys are already safe.** Both engines' `onKey` begins
  `if ( document.activeElement !== stage ) return;` and `Esc` calls
  `stage.blur()`. Arrows and WASD do nothing to the page unless the visitor has
  deliberately focused the stage. **Do not touch this guard.** It is what makes
  a driveable hero legal.

So the promotion is mostly ordering, sizing and one new asset — not a rebuild.

## 2. Thesis

The hero currently *tells* a visitor who Thomas is. The farm *shows* them, and
they arrive inside it. Moving the stage up does not add capability; it changes
what the site is on contact. The cost is that a game engine's preview becomes
the first thing a stranger, a hiring manager or a crawler meets, so everything
in §4 has to hold.

## 3. Three ways to do it

**Option A — stage first, ticket second.** Move `.bq-section` above
`.hero-section--pass` and leave both intact. Smallest diff. Costs: the `<h1>`
is no longer the first heading on the page, and the first screen has no
sentence of real prose on it.

**Option B — merge.** The stage becomes the hero: name, `<h1>` and CTA overlay
the painted board, the order-ticket portrait moves down the page. Best-looking
ceiling, most work, and the highest risk — text over painted art is a contrast
problem at every breakpoint, and the first screen gets busy.

**Option C — slim title strip, then the stage. ← recommended.** A short band at
the very top: the name, the `<h1>` line, one sentence, and a *Skip the map*
link. Directly under it, the stage at ~70vh. The pass hero keeps its portrait
and CTA but moves below the ledger, or is retired into the about page.

C is recommended because it gets the farm on screen in the first second while
keeping a real text heading above it, which protects the crawler, the screen
reader and the visitor who does not want a game. It is also the smallest step
back to A or forward to B if Thomas wants to move again.

## 4. Non-negotiables

1. **The painted board stays the first paint. The engines stay behind the click.**
   No autoboot, not on desktop, not on a fast connection, not behind a query
   string. A visitor who lands and leaves should have downloaded one image.
2. **The board becomes the LCP element**, so it has to be treated like one:
   resized to the stage's real maximum, served as WebP with the JPEG as
   fallback, and `<link rel="preload" as="image">` in the head. Measure before
   and after — today it is an unoptimised upload doing hero duty from the middle
   of the page.
3. **The keyboard guard survives untouched** (`activeElement !== stage`), and a
   **Skip the map** link becomes the first focusable element inside the section.
   Tab order: skip link → header nav → stage → content.
4. **The stage never takes the whole viewport.** Cap around 70vh so the next
   band's edge is visible and the page reads as a page. On phones the 4:5 stage
   plus the strip must still leave the first text band reachable in one swipe.
5. **A real `<h1>` with real words stays above the fold**, including on a phone.
6. **`prefers-reduced-motion: reduce` means a still.** Nothing in the preview
   may animate on its own; the *Start driving* button is the only way in.
7. **The ledger stays immediately after the stage.** It is the text equivalent
   of the map, and it is the answer to "what if they never drive".
8. **Nothing familial changes.** The hero photo captions are deliberately
   non-identifying (see the comment above `$tc_hero_imgs`); keep that true of
   anything new at the top of the page.
9. **Purge LiteSpeed after every push, and verify from outside** — curl the live
   `style.css` and grep `Version:`. A push is not a deploy.

## 5. Build order

- **P0 — Measure. DONE.** Live 1.0.753, headless, cold: LCP 2.10 s on both
  desktop and phone, 38 requests, ~1.84 MB — and **the LCP element was
  `SPAN.hero-ghost`**, the decorative photo behind the pass hero. Those are the
  numbers the promotion is judged against.
- **P1 — The board as a real asset.** Resize and convert the painted board,
  preload it, confirm the LCP element is the board and the number did not get
  worse. This ships on its own and is worth doing whatever else happens.
- **P2 — The reorder.** Option C's title strip; `.bq-section` moved up; the pass
  hero relocated. `front-page.php` plus a CSS block. No engine files touched.
- **P3 — Focus and motion.** Skip link, tab order, focus-visible on the stage
  (already styled), reduced-motion check.
- **P4 — Phones.** 390px pass: stage height, button size, one-swipe reach to
  text. Phones are in (V0.41's mobile work), so this is a check, not a build.
- **P5 — Copy.** "Out past the yard light" reads differently as the first line of
  the site than as a mid-page eyebrow. Thomas's words, his call.
- **P6 — Verify, purge, screenshot.** Re-measure P0's numbers. If the framing
  changed, the tc-ventures.ca project still may want reshooting (that repo's
  handoff tracks it as P-5).

## 5a. What Thomas settled, 2026-09-19

- **The 3D build becomes the default.** "The beta is the alpha." All beta
  labelling comes off: the button, the in-world HUD string, the code comments,
  and the tc-ventures.ca project copy that currently says the painted map is the
  one he would put weight on.
- **The stage is the hero.** The pass hero and its rotating photos move directly
  below it.
- **The preview art must change**, because the painted 2D board is no longer what
  a visitor gets when they press the button.

## 5b. Three findings that change the build

1. **`data-bg` is not a poster — it is the 2D game's ground.** `back-quarter.js`
   reads `#bq-stage[data-bg]` as the world's painting and its landmark
   coordinates are measured in that image's own 1280x720 pixel space. Swapping it
   for a 3D render silently breaks every landmark hit-box on the painted map.
   **The new preview art must be a separate variable** (`$tc_bq_poster`), with
   `$tc_bq_bg` left pointing at the painting. Two images, two jobs.
2. **The 3D module is cache-busted with `Date.now()`** — both the postfx bundle
   and `back-quarter-3d.js` are requested with `?cb=<timestamp>`, deliberately,
   "while in beta". As the default that is a re-download of the whole engine on
   every visit, forever, and it cannot be cached by anything. **It has to come
   off in the same commit that promotes 3D**, replaced by the theme version
   string the rest of the site cache-busts with.
3. **The beta door never actually closed.** The 3D button is `hidden` in PHP and
   `back-quarter.js` only un-hides it at `#bq3d` — but `.tc-btn { display:
   inline-flex }` overrides the `hidden` attribute, so every visitor has been
   seeing the beta button since it shipped. Harmless now that 3D is being
   promoted, but the gate code should be deleted rather than left looking like
   it works. **Lesson for elsewhere in the theme: a class with `display` beats
   `[hidden]`.** Any other element hidden that way is also visible.

## 6. Open decisions — Thomas's

### 6a — answered
- **OD-1. Which option.** The stage is the hero; the pass hero and photos sit
  directly below it. Whether a slim text strip sits *above* the stage is still
  open — see OD-6.
- **OD-2. The pass hero stays**, directly below the stage.
- **OD-5. The 3D is not a second option any more.** It is the thing.

### 6b — answered 2026-09-19

- **OD-3. The `<h1>` stays** *Chef until my hands retired me*. It remains the
  site's first line.
- **OD-4. Phones get the painted map.** The 3D LITE tier is not the phone
  experience; the painting is. One less thing to tune, and a phone visitor gets
  a drivable map that costs a fraction of the engine.
- **OD-6. A slim text strip sits above the stage.** See §6c for why.
- **OD-7. The painted map is the fallback**, and it is called **The Painted
  Map** — in the button, in any copy, and in the code comments. Its job: what
  boots on a phone, when WebGL is missing, or when the 3D engine fails to load.
  Not an old version; the version that always works.
- **OD-8. The engine waits for a click.** Confirmed. No autoboot, ever.
- **The `Date.now()` cache-bust comes off** in the promoting commit, replaced by
  the theme version string the rest of the site uses.
- **The `#bq3d` gate is deleted**, not left in place.

## 6c. Why a strip above the stage, and not a heading over it

Two patterns are normal for an interactive hero:

1. **Text over the media.** The common one on marketing sites — full-bleed image
   or video, heading and CTA laid over it. It looks the best when it works.
2. **A short text band above the media.** Common on editorial and personal
   sites, and the one to use when the media is interactive, because the text
   does not depend on the media rendering, moving, or being lit the way you
   expected.

Pattern 2 is right here, for three specific reasons rather than taste:

- **The stage already has its own title card.** `.bq-preview` carries an
  eyebrow, a title, a deck and the button, and `.is-live` hides all of it the
  moment the engine boots. An `<h1>` inside that block would vanish when a
  visitor starts driving. A heading that disappears is a heading that was not
  doing its job.
- **Two large headings over one painted scene is a fight**, and the painting's
  light changes across the frame — a scrim strong enough to make the `<h1>`
  legible over a bright sky would smother the art.
- **The strip is where the skip link lives**, which it needs to do before the
  stage in tab order anyway.

So: name, `<h1>`, one sentence, *Skip the map* — then the stage, with its
existing preview card demoted to an `<h2>`.

## 7. Verification checklist

- [ ] Homepage with JavaScript disabled: board renders, all destinations reachable
      through the header nav and the ledger.
- [ ] Tab from the address bar: skip link, nav, stage, content — in that order.
- [ ] Focus the stage, press arrows: the page does not scroll. Press Esc: focus
      leaves the stage, arrows scroll normally again.
- [ ] Nothing from the engines in the network panel until *Start driving*.
- [ ] LCP element is the painted board; LCP no worse than P0's number.
- [ ] 390px: `<h1>` visible on load, first text band reachable in one swipe.
- [ ] Reduced-motion on: nothing moves before a click.
- [ ] Live `style.css` `Version:` matches HEAD after the purge.
