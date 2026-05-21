# CLAUDE.md — agent onboarding for tc-ventures-child-theme

> **This file auto-loads into every Claude Code session.** Read it before doing anything.

---

## What this is

The child theme for **thomascheesman.ca** — a personal site for **Thomas Cheesman**. Pages-only (no blog), built as ~14 bespoke PHP page templates plus a "desk metaphor" navigation overlay, an in-browser pinball game, and a sitemap-style drawer footer.

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

1. **Never auto-commit-and-push.** Propose the commit + message; wait for the user to say "go." Preauthorization is task-scoped only — a new request needs a new approval.
2. **Bump `style.css` `Version:`** on every commit that touches theme code. Patch increment. Pure docs / `.gitignore`-only commits don't bump.
3. **Never use `object-fit: cover`** — always `contain`.
4. **The desk menu (`inc/desk-menu.php` + `assets/js/desk-menu.js`) AND the drawer footer (`footer.php` + `assets/css/desk-drawer.css`) are BHAG-tier surfaces.** Plan + propose before changes; don't freelance.
   - **Bring bold ideas to both.** Thomas explicitly wants features that push what's possible in a browser. He's not afraid of complexity. Don't preemptively scope down; lean toward "let's try it." Many tasks Claude estimates as "15 minutes" ship in a few moments — don't telegraph time anxiety.
   - **For desk-menu OR drawer-footer work, ask Thomas if he wants a ChatGPT brainstorm prompt first** before coding starts. ChatGPT is strong at imagining cool, weird, surprising directions but weaker at implementing them. Claude is the opposite. The division of labor that works: Claude drafts a context-rich prompt for ChatGPT, Thomas pastes it into ChatGPT, brings the ideas back, Claude implements the strongest ones. Offer the prompt; let Thomas decide whether to use it.
5. **The user is Thomas Cheesman, a programmer-adjacent collaborator who understands some but not everything.** Explain at a medium register: don't over-explain CLI / git / wp-admin basics, but do number multi-step workflows and call out the *why* behind architectural decisions. Skip the very-beginner framing; he'll ask if something's unclear.
6. **🔒 Privacy: Thomas and Mel are parenting cohabitants and friends.** Their status is private — **do not disclose it on the site**, and **do not write copy that frames them as a current couple**. Don't auto-rewrite existing copy that mentions Mel; don't surface this context unprompted.

## Conventions

- **Commits**: imperative subject, body explains the *why*. Co-author footer:
  `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>`
- **Branches**: feature branches optional; main is the deploy branch.
- **Session handoffs**: at the end of a meaningful session, write a fresh `V0.X.md` at repo root (V0.13 was the last as of CLAUDE.md creation; the next agent writes V0.14, then V0.15, etc.). Use the structure of V0.13.md as a template.
- **Deep references**: anything that warrants its own doc lives in `docs/`. CLAUDE.md points to them by filename.

## Where to find what

| Thing | Path |
|---|---|
| Page templates (prose hardcoded) | `page-{about,hcs,family,heritage,contact,…}.php` |
| Heritage line pages | `page-{cheesmans,dochertys,haistes,lakemans,rycrofts}.php` |
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

## Sharp edges (carried from V0.13+)

1. **LiteSpeed cache** is the #1 source of "did the deploy actually go through?" confusion. Always remind the user to Purge All after a push.
2. **Hostinger sometimes shows stale `?ver=X.Y.Z` numbers** in the rendered HTML even after a WP/plugin update — that's the page HTML cache, not the actual installed version. Cache-bust with a query string (`?cb=$(date +%s)`) when verifying versions remotely.
3. **Dormant-by-design files**: `single.php`, `single-post-make-canada-great-again.php`, `page-journal.php`, `tc_render_read_next()` in `functions.php`. All inert with no published posts; kept for draft preview. Don't delete.
4. **Posts are Drafts, not deleted** — fully recoverable from wp-admin.
5. **Video playback** can't be verified in an automated browser — verify the crest "secret videos" + Daniel's crawl clip in a real browser.
6. **The cross-site agent diary CSV** is intended to live at `C:\Users\thoma\Documents\Claude-Diary\diary.csv` (V0.13 noted it was unreachable — confirm path on first attempt; possibly OneDrive-redirected).

## Opening prompt template for the next agent

> I'm picking up the TC personal site theme (`tc-ventures-child-theme`). **Start by reading `CLAUDE.md` and the most recent `V0.*.md`** at the repo root — those carry the project rules, current state, and any outstanding work. The site runs on WordPress 7.0; before doing anything theme-code-related, also skim `docs/WORDPRESS-7.0.md` for the deprecation and AI-integration notes.
