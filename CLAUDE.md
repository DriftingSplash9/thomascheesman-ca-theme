# CLAUDE.md — agent onboarding for tc-ventures-child-theme

> **This file auto-loads into every Claude Code session.** Read it before doing anything.

---

## What this is

The child theme for **thomascheesman.ca** — a personal site for **Thomas Cheesman**. Pages-only (no blog), built as a few dozen bespoke PHP page templates (incl. the heritage spokes + long-reads, below) plus a "desk metaphor" navigation overlay, an in-browser pinball game, and a sitemap-style drawer footer.

The site is **live** at https://thomascheesman.ca (staging hostname previously: `lightgoldenrodyellow-dugong-336485.hostingersite.com`).

## Stack

| | |
|---|---|
| **WordPress** | 7.0 — see `docs/WORDPRESS-7.0.md` for deprecations + AI integration notes |
| **Astra parent theme** | 4.13.x — child overrides aggressively (see Astra-override block in `style.css`) |
| **Child theme version** | tracked in `style.css` line 7 (`Version:`) — bump on every theme-code commit |
| **Hosting** | Hostinger + LiteSpeed Cache |
| **Deploy** | push to `origin/main` → Hostinger auto-deploys from GitHub |
| **Cache busting** | `wp_get_theme()->get('Version')` reads from style.css's Version: header; one bump cache-busts all enqueued CSS/JS |

## ⭐ Hard rules (memorize)

1. **Commit-and-push is pre-authorized on this project (TC)** — granted 2026-06-06. **As of 2026-08-04 this also carries to BYR and GPRS**, whose own `AGENTS.md` files were updated the same way (propose-and-wait was slowing work down without catching a real problem across ~50 hours of site work). Commit + push each finished unit of work without asking first, with a clear message. Even with auto-push on: **stage explicit paths — never `git add .`** (the tree holds unrelated changes + loose `sk_*.html` research scrapes that must never be swept in), and don't push half-finished or unreviewed-risky work — finish the unit first.
2. **Bump `style.css` `Version:`** on every commit that touches theme code. Patch increment. Pure docs / `.gitignore`-only commits don't bump. **Bump it with the Edit tool, never `sed`** (`sed -i` rewrites all line endings → a phantom multi-thousand-line CRLF diff).
3. **Never use `object-fit: cover`** — always `contain`.
4. **The desk menu (`inc/desk-menu.php` + `assets/js/desk-menu.js`) AND the drawer footer (`footer.php` + `assets/css/desk-drawer.css`) are BHAG-tier surfaces.** Plan + propose before changes; don't freelance.
   - **Bring bold ideas to both.** Thomas explicitly wants features that push what's possible in a browser. He's not afraid of complexity. Don't preemptively scope down; lean toward "let's try it." Many tasks Claude estimates as "15 minutes" ship in a few moments — don't telegraph time anxiety.
   - **For desk-menu OR drawer-footer work, ask Thomas if he wants a ChatGPT brainstorm prompt first** before coding starts. ChatGPT is strong at imagining cool, weird, surprising directions but weaker at implementing them. Claude is the opposite. The division of labor that works: Claude drafts a context-rich prompt for ChatGPT, Thomas pastes it into ChatGPT, brings the ideas back, Claude implements the strongest ones. Offer the prompt; let Thomas decide whether to use it.
5. **The user is Thomas Cheesman, a programmer-adjacent collaborator who understands some but not everything.** Explain at a medium register: don't over-explain CLI / git / wp-admin basics, but do number multi-step workflows and call out the *why* behind architectural decisions. Skip the very-beginner framing; he'll ask if something's unclear.
6. **🔒 Privacy: Thomas and Mel are parenting cohabitants and friends.** Their status is private — **do not disclose it on the site**, and **do not write copy that frames them as a current couple**. Don't auto-rewrite existing copy that mentions Mel; don't surface this context unprompted. More broadly, **don't publish names or photos of living relatives unprompted** — surface couple/living-person framing for Thomas's call rather than deciding it (e.g., the heritage pages use period imagery, not photos of living extended family).

## Conventions

- **Commits**: imperative subject, body explains the *why*. Co-author footer:
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`
- **Branches**: feature branches optional; main is the deploy branch.
- **Session handoffs**: at the end of a meaningful session, write the next-numbered `V0.*.md` at repo root. Use the highest-numbered existing `V0.*.md` as the template — it carries current state and the open task list. (Don't hardcode a specific number here — it goes stale immediately; check the folder.)
- **Deep references**: anything that warrants its own doc lives in `docs/`. CLAUDE.md points to them by filename.

## Where to find what

| Thing | Path |
|---|---|
| Page templates (prose hardcoded) | `page-{about,hcs,family,heritage,contact,…}.php` |
| Heritage hub + short spokes | `page-heritage.php` (5-card hub) + `page-{cheesmans,dochertys,haistes,lakemans,rycrofts}.php` → `inc/heritage/{line}-body.php` (prose) |
| Heritage **long-reads** (book-length stories) | `page-story.php` (dispatcher for hub lines) + `inc/page-heritage-longread.php` (shared chrome) + `inc/heritage/{line}-story-body.php` (**auto-generated — never hand-edit**). Runbook: `V0.17.md` |
| Heritage **orphan lines** (not on the hub; nest under a parent) | `page-{mcivers,verbooms,steinkes}.php` — McIver→Docherty, Verboom→Lakeman, Steinke→Rycroft |
| Heritage authoring/research (off-repo) | `C:\Users\thoma\Desktop\Heritage research\` — manuscripts (`{Line}-Story-EDITED.md`), master references, image maps (`{line}-images.json`), converters `_md2heritage.js` / `_md2docx.js` |
| Case Studies page | `page-case-studies.php` (slug `case-studies`, parent HCS) |
| Sitemap footer ("The Drawer") | `footer.php` + `assets/css/desk-drawer.css` + `assets/js/desk-drawer.js` |
| Pinball game | `assets/js/desk-pinball.js` + `assets/css/desk-pinball.css` (lazy-loaded by the marble) |
| Desk-menu nav | `inc/desk-menu.php` + `assets/css/desk-menu.css` + `assets/js/desk-menu.js` |
| Arcade games + leaderboard | `assets/js/desk-games.js` + `inc/games-leaderboard.php` (REST at `/wp-json/tc-games/v1/scores`) |
| Daily quote/riddle picker | `inc/daily-quote.php` + `inc/data/quotes.json` (mix of quotes and riddles by type field) |
| Sitewide JS (carousel, rot13, ink-trail, header weather, kinetic text) | `assets/js/main.js` |
| Bing site verification | `functions.php` (parse_request hook + wp_head meta tag; token: `TC_BING_VERIFY_TOKEN` constant) |
| Header capsule (brand · weather · menu trigger) | `header.php` — weather fed by Open-Meteo API, links to The Weather Network |
| Most recent session handoff | latest `V0.*.md` at repo root |
| WP 7.0 deprecations + AI notes | `docs/WORDPRESS-7.0.md` |
| Converging-families map (planned) | `docs/CONVERGING-MAP-SPEC.md` — "Lanterns of Record" build spec (D3-geo; records-as-light; data from per-family xlsx) |
| "The Back Quarter" homepage BHAG (approved) | `docs/QUARTER-SECTION-SPEC.md` — drivable-buggy overworld homepage build spec (Pixi + Matter; landmarks = site sections; ledger fallback). Decisions resolved §7. Read before homepage work. |
| Promoting The Back Quarter to the top of the homepage | `docs/HERO-PROMOTION-SPEC.md` — plan only, awaiting Thomas's decisions (§6). Read before any front-page reorder. |

## Sharp edges (carried from V0.13+)

1. **LiteSpeed cache** is the #1 source of "did the deploy actually go through?" confusion. Always remind the user to Purge All after a push.
2. **Hostinger sometimes shows stale `?ver=X.Y.Z` numbers** in the rendered HTML even after a WP/plugin update — that's the page HTML cache, not the actual installed version. Cache-bust with a query string (`?cb=$(date +%s)`) when verifying versions remotely.
3. **Dormant-by-design files**: `single.php`, `single-post-make-canada-great-again.php`, `page-journal.php`, `tc_render_read_next()` in `functions.php`. All inert with no published posts; kept for draft preview. Don't delete.
4. **Posts are Drafts, not deleted** — fully recoverable from wp-admin.
5. **Video playback** can't be verified in an automated browser — verify the crest "secret videos" + Daniel's crawl clip in a real browser.
6. **The cross-site agent diary CSV** lives at `C:\Users\thoma\Desktop\My Files\Claude-Diary\diary.csv` — read it at session start, append a row at wrap (covers BYR / GPRS / TC).
7. **WP image URLs:** strip the `-e<digits>` edited-thumbnail suffix (those 404 on Hostinger); `-scaled.jpg` often 404s too while the bare stem is 200 — HEAD-check (`curl -sI`).

## Opening prompt template for the next agent

> I'm picking up the TC personal site theme (`tc-ventures-child-theme`). **Start by reading `CLAUDE.md` and the most recent `V0.*.md`** at the repo root — those carry the project rules, current state, and any outstanding work. The site runs on WordPress 7.0; before doing anything theme-code-related, also skim `docs/WORDPRESS-7.0.md` for the deprecation and AI-integration notes.

## Truth rules — read before you claim anything

Twenty rules distilled from ~700 documented AI misses across Thomas's projects (the
receipts inventory, `tc-ventures site/plans/receipts-001.md`, 2026-09-23). Every one was
broken more than once, usually on more than one project.

**Checking your work**
1. Test the thing itself, not a proxy for it: drag the slider, Tab through the page, load it logged out.
2. "Done", "verified" and "deployed" are claims. Prove them from outside: curl the live URL, read the live console.
3. Test the test. A checker that cannot fail, or reads the wrong field, is not checking.
4. A build or a script cannot judge how something looks. Look at it rendered.
5. The same miss twice means the rule belongs in code: a validator, a test, a check that fails.

**Reading and sources**
6. Say what you read, not what exists: "I could not see X", never "X is missing".
7. "Blocked" describes your tool and network, not the site. Re-test before repeating it.
8. A quote is verbatim, or the field is empty. Don't tidy it, don't decorate it.
9. Never trust a summarising tool's quote, figure or URL. Fetch the raw page and confirm a 200.
10. Read the primary source, and the table itself, not a note or a report about it.

**Facts and claims**
11. Never invent a date, figure, name or organisation. Unknown → ask Thomas.
12. Count with a command, never from memory.
13. A recommendation, a premise or a summary is a hypothesis until it is checked.
14. A context-compaction summary is a lead, not a fact.
15. Whoever extracts doesn't also decide. Report a doubt; never override it quietly.
16. Don't sell: no claims that go stale, no vanity numbers, no commitments only Thomas can make.

**Process**
17. One copy of each fact. A claim repeated in three notes is still one claim.
18. Write as you go. A draft that isn't on disk doesn't exist.
19. Stay inside the request. Don't act beyond it, and don't run anything that jams Thomas's tools.
20. Before anything goes public, read it against the privacy rules.
