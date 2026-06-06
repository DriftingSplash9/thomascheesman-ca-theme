# SITE-DIRECTORY.md — content & feature map for thomascheesman.ca

> Internal reference (not a public page). A single place to see **every page, feature, and Easter egg** on the site, plus where each one lives in the theme. Keep this current when pages/features are added or removed. See also the file map in `CLAUDE.md` and the latest `V0.*.md` for current state.

_Last refreshed: 2026-06-06 (theme ~1.0.455). Pages-only site (no public blog)._

---

## 1. Public pages

| Route | Template | What it is |
|---|---|---|
| `/` | `front-page.php` / `index.php` | Home — hero + intro into the site |
| `/about` | `page-about.php` | First-person essay (chapters, figures) |
| `/hcs` | `page-hcs.php` | Hajdu-Cheney Syndrome — the condition, his story, the foot/spine chapters |
| `/case-studies` | `page-case-studies.php` | HCS case studies (child of HCS) |
| `/contact` | `page-contact.php` | rot13'd email click-to-copy card (no server mail) |
| `/family` | `page-family.php` | **The family tree** — 8 flag line-chips (canopy) + Thomas (trunk) + 3 kid roots; foil-tilt hover, rustle, falling leaves |
| `/family/patience` | `page-patience.php` | Per-kid spoke — intro + photo wall (~128) — **purple** |
| `/family/daniel` | `page-daniel.php` | Per-kid spoke — intro + photo wall (~199) — **green** |
| `/family/faith` | `page-faith.php` | Per-kid spoke — intro + photo wall (~204) — **pink** |
| `/family/thomas` | `page-thomas.php` | Thomas's own first-person long-read ("Thomasito"); fire/ember WebGL bg, candle-flame headings, ~160-photo gallery |
| `/family/heritage` | `page-heritage.php` | Heritage hub — 8 line cards |

### Heritage lines (each: a spoke page + a book-length long-read)

| Line | Spoke page | Long-read body | Flag | Accent |
|---|---|---|---|---|
| Cheesmans (01) | `page-cheesmans.php` | `inc/heritage/cheesmans-story-body.php` | gb | cyan |
| Dochertys (02) | `page-dochertys.php` | `dochertys-story-body.php` | ie | pink |
| McIvers (03, orphan→Docherty) | `page-mcivers.php` | `mcivers-story-body.php` | scotland | slate-blue |
| Lakemans (04) | `page-lakemans.php` | `lakemans-story-body.php` | nl | emerald |
| Verbooms (05, orphan→Lakeman) | `page-verbooms.php` | `verbooms-story-body.php` | nl | teal |
| Rycrofts (06) | `page-rycrofts.php` | `rycrofts-story-body.php` | rycrofts.svg (USA+England) | amber |
| Steinkes (07, orphan→Rycroft) | `page-steinkes.php` | `steinkes-story-body.php` | de | grey-blue |
| Haistes (08) | `page-haistes.php` | `haistes-story-body.php` | gb | indigo |

- **Long-read system:** `page-story.php` (dispatcher, resolves a `story` page by its parent spoke) + `inc/page-heritage-longread.php` (shared chrome) + auto-generated `inc/heritage/{line}-story-body.php` bodies (**never hand-edit** — regenerate via `_md2heritage.js` from `{line}-images.json` + the edited manuscript).
- **Signature look:** per-line atmosphere gradient + morphing blobs, brushed-chrome glass plate, sticky chapter rail, pull-quotes, fact-kickers, duotone photos (color on hover), lineage ribbon, in-text Notes links to a Notes appendix, breadcrumb trail.

### Dormant-by-design (kept for draft preview, don't delete)
`single.php`, `single-post-make-canada-great-again.php`, `page-journal.php`, `tc_render_read_next()` in `functions.php`. Old-site posts are **Drafts**, not deleted.

---

## 2. Signature interactive features

| Feature | Files | Notes |
|---|---|---|
| **Desk menu** (the BHAG nav) | `inc/desk-menu.php` · `assets/css/desk-menu.css` · `assets/js/desk-menu.js` | Photo of Thomas's actual desk; ~20 hover hotspots with handwritten cards; clickable affordances: keyboard→search, notebooks→journal drawer, memory-card bin→slideshow drawer. Monitor TOC (Contents + "Elsewhere" → BYR/GPRS). Object cutouts with oil-slick sheen + 3D tilt. Matrix screensaver after 30s idle. **BHAG surface — plan before changes.** |
| **Desk arcade** | `assets/js/desk-games.js` · `inc/games-leaderboard.php` | 6 games behind the toad: Snake, Pong, Pac-Man, Asteroids, Brickles, Solitaire. CRT bezel + fullscreen. REST leaderboard at `/wp-json/tc-games/v1/scores`. |
| **Secret Drawer puzzle** | `assets/js/secret-drawer.js` · `inc/data/drawer-puzzle.json` · `inc/secret-drawer*.php` | 16-chain point-and-click puzzle in a drawer. Action verbs: require/video/passcode/hangman/choice/youtube/stream/pacman/bubbles/crash/link. Terminal email events: golden-egg / top-prize / bigger-reward. |
| **Pinball game** | `assets/js/desk-pinball.js` · `assets/css/desk-pinball.css` | Lazy-loaded by the desk marble. |
| **Drawer footer** ("The Drawer") | `footer.php` · `assets/css/desk-drawer.css` · `assets/js/desk-drawer.js` | Sitemap-style footer; the "← back to the desk" button. **BHAG surface.** |
| **WebGL background** | `assets/js/main.js` → `initWebGLBackground()` | Drifting noise-gradient + cursor-reactive glow on every page. Per-page palette via `--webgl-tint` (falls back to `--line-color`) + `--webgl-accent` (defaults cyan). **BHAG surface.** |
| **Custom cursor + ink-trail** | `assets/js/main.js` → `initInkTrail()` | White-dot/amber-ring cursor leading a pressure-sensitive ink trail with amber sparks. Variants/picker on the desk mouse hotspot (localStorage). |
| **Family tree** | `page-family.php` · `assets/js/main.js` (`initFamilyTreeReveal/Leaves/TreeChipFoil`) | Flag chips: holographic foil-tilt hover (cursor-tracked 3D + rainbow sheen), GSAP entrance reveal, hover rustle + falling leaves, click→navigate. View-transition chip→hero morph. |
| **Lightbox** | PhotoSwipe v5 via `initLightbox()` | Sitewide; editorial pills/counter/caption/blur/download. |
| **Per-kid photo galleries** | `inc/photo-gallery.php` (`tc_render_photo_gallery()`) · `inc/gallery-{patience,daniel,faith}.php` | CSS-columns masonry, year-tagged sections, slideshow autoplay, video support. |
| **Daily quote/riddle** | `inc/daily-quote.php` · `inc/data/quotes.json` | Mixed quotes + riddles by `type`. |
| **Header capsule** | `header.php` | Brand · live weather (Open-Meteo → Weather Network) · menu trigger. |
| **Sitewide JS misc** | `assets/js/main.js` | Carousel, rot13 email, ink-trail, header weather, kinetic hero text, magnetic elements, particle field, Ken Burns figures, scroll reveals. |

### Easter eggs / hidden
- Alberta **crest** hidden videos (2 `.mp4`, alternate per visitor) — verify in a real browser, not automated.
- Desk **arcade** behind the toad; **Pac-Man** also reachable from the Secret Drawer.
- Secret Drawer terminal **email rewards**.
- Page-number / hotspot micro-interactions in the desk menu.

---

## 3. Data & content sources

| Thing | Where |
|---|---|
| Heritage manuscripts + research (off-repo) | `C:\Users\thoma\Desktop\Heritage research\` — `{Line}-Story-EDITED.md`, master references, `{line}-images.json`, converters `_md2heritage.js` / `_md2docx.js` |
| Thomas page source (off-repo) | `Heritage research\Thomas.docx` (canonical Q&A) + `Thomasito.docx` (polished) |
| Heritage long-read images | `assets/img/heritage/{line}/` (optimized theme assets) |
| Thomas page images | `assets/img/thomas/` (figures by name; gallery globs `g-*.jpg`) |
| Per-kid gallery data | `inc/gallery-{patience,daniel,faith}.php` (generated from xlsx, year-tagged) |
| Flags | `assets/img/flags/` |
| Converging-families map (planned) | `docs/CONVERGING-MAP-SPEC.md` — Task E, the big unstarted BHAG |

---

## 4. Deploy & ops quick-reference
- **Stack:** WordPress 7.0 + Astra 4.13 parent + this child theme. Hostinger + LiteSpeed.
- **Deploy:** push `origin/main` → Hostinger auto-deploys. Then **LiteSpeed → Purge All** + hard-refresh.
- **Cache busting:** bump `style.css` `Version:` (Edit tool, never `sed`) every theme-code commit → busts all enqueued CSS/JS.
- **Bing verify:** `functions.php` (`TC_BING_VERIFY_TOKEN`).
- Sharp edges, privacy rules, and "what's next" live in `CLAUDE.md` + the latest `V0.*.md`.
