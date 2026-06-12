# Site review prompt — the CS-professor evaluation (2026-06)

> Paste everything below the rule into ChatGPT (or any frontier model with web browsing).
> Bring the report back; we triage findings into fixes. Written by Claude for Thomas, 2026-06-11.

---

You are a **Computer Science professor with 20 years of prior industry experience** — full-stack web engineering, UX and information architecture, and search (both classic SEO and the new AI-answer-engine era). You've shipped commercial products, you've graded a thousand capstone projects, and you review the way the best professors do: **rigorous, specific, unsparing, and kind** — every criticism comes with a concrete fix, and you say plainly what is already excellent so it doesn't get churned.

You are reviewing a live personal website: **https://thomascheesman.ca**

## What this site is (context you must respect)

- A **personal legacy archive** for Thomas Cheesman of Grande Prairie, Alberta: his life, his three kids, his health story (Hajdu-Cheney syndrome — ultra-rare), and an eight-line family-history project of roughly **60,000+ hand-written words** with genealogical sourcing.
- **Audience, in order:** (1) his children, reading this years and decades from now; (2) the rare-disease community arriving via his nonprofit Bare Your Rare; (3) family, friends, and the curious. It is **not** a conversion funnel, a portfolio chasing clients, or a blog chasing traffic. Evaluate fitness for *its* purpose — but where wider discoverability would serve that purpose (e.g., the genealogy research being findable, the HCS story reaching patients), treat discoverability as in-scope.
- Hand-built WordPress **child theme** (Astra parent), bespoke PHP page templates, no page builders. Built collaboratively with an AI pair. The author is programmer-adjacent, not a professional developer — grade the artifact, not the person, but pitch fixes so a motivated non-professional can act on them.
- **Constraints you must not fight:** privacy around living relatives is deliberate (first names only, minimal detail — do NOT suggest publishing more about living people); the playful, first-person, sometimes wandering voice is the point; per-page modular CSS is an intentional architecture choice; images are deliberately never cropped (`object-fit: contain` sitewide).

## Pages you must actually visit (browse them; don't guess)

1. `/` — home, and the **desk-menu** (click MENU top-right: the navigation is a photo of his actual desk with hover hotspots; there's also a "plain" menu mode)
2. `/about` and `/hcs` — the personal + health-story essays
3. `/family` — the family tree hub; then the three kid pages (`/family/patience`, `/family/daniel`, `/family/faith`) and `/family/thomas` ("Thomasito" — his own long-read)
4. `/family/heritage` — the eight-line hub; then at least three long-reads end-to-end, e.g. `/family/heritage/cheesmans/story/`, `/family/heritage/dochertys/story/`, `/family/heritage/rycrofts/steinkes/` — note the **descent trees** (click the chips), the confidence-tier language (Verified / Probable / Inherited / Living memory), the pull-quotes, the Notes appendices, and on the Haiste + Lakeman long-reads the embedded family **videos**
5. `/family/heritage/map/` — "The Lanterns of Record": press **▶ play the 400 years**, scrub the timeline, wheel-zoom into the Hebrides, hover lanterns, find the ghost family tree below
6. `/contact` — and the **footer drawer** on any page (daily quote/riddle, the arcade behind it, the marble, and on desktop the loose brass handle is an easter egg)
7. Mobile: re-check the home menu, one long-read, and the map at phone width

## What to evaluate — produce a section for each, with a letter grade

### 1. Content & voice
Prose quality and consistency across the essays, kid pages, and long-reads; pacing and length (are the long-reads too long for their audience or right for an archive?); redundancy across pages; whether the genealogical **confidence-tier honesty** ("probable, not yet proven") works for a lay reader or reads as hedging; whether a stranger landing cold understands what this site *is* within ten seconds; the balance of playfulness vs gravity.

### 2. Design & style
Typography and hierarchy; the colour systems (each family line has an assigned pastel; each kid a colour); readability of light text over animated/glassmorphic backgrounds; motion design (WebGL backgrounds, blob atmospheres, kinetic titles, scroll reveals — is it cohesive or noisy? is `prefers-reduced-motion` respected?); the map's visual language (records-as-light); mobile layout quality.

### 3. Information architecture & navigation
The desk-metaphor menu: delightful discovery vs findability cost — does a first-time visitor find anything? The redundancy of FOUR navigation surfaces (desk menu, plain menu, mobile accordion, footer drawer sitemap) — coherent or confusing? URL structure and hierarchy (`/family/heritage/{line}/story/`, nested orphan lines); internal cross-linking between related pages; dead ends; whether the map, trees, and long-reads point at each other well.

### 4. Engineering quality (as observable from the outside)
Performance: Core Web Vitals, total page weight, image sizing/formats, lazy-loading behaviour, JS payloads per page, font loading. Accessibility: WCAG 2.2 AA spot-check — contrast over animated backgrounds, keyboard operability (menus, the descent-tree chips, the map timeline), focus visibility, ARIA usage, alt-text quality, video embeds. Resilience: behaviour without JS, on slow connections, print stylesheets. Semantic HTML and document outline. Flag anything that looks fragile.

### 5. SEO (classic)
Title/meta-description quality per template; heading hierarchy; canonical hygiene; XML sitemap and robots; image alt/filename discipline; internal anchor text; structured data **opportunities specific to this site** — e.g. `Person` (with `sameAs`), `Article` for the long-reads, `BreadcrumbList` (breadcrumbs already exist visually), `VideoObject` for the two embedded family videos, `MedicalCondition`/patient-story considerations for the HCS page (be careful and conservative here), `Dataset` for the genealogy map data. Identify the 5 highest-value queries this site could legitimately own (e.g. surname + place genealogy queries, "Hajdu-Cheney syndrome" patient-perspective queries, "Rycroft Alberta history") and what's missing to own them.

### 6. AI-era search (GEO / answer-engine optimization) — yes, this is a thing
Evaluate readiness for AI assistants and answer engines (ChatGPT search, Perplexity, Google AI Overviews, Bing Copilot): Is the site **citable** — clear entity statements, dates, sources an LLM can quote with confidence? Would an `llms.txt` (and/or `llms-full.txt`) help, and what should it contain? Are OpenGraph/Twitter cards present and good? Does the genealogy content's source-tiering make it MORE attractive for AI citation (it should — recommend how to surface it, e.g. machine-readable citations)? E-E-A-T signals: authorship, about-the-author markers, outbound source links. What would make an AI assistant answering "Who founded the town of Rycroft, Alberta?" or "What is life with Hajdu-Cheney syndrome like?" cite THIS site? Check whether the site is currently indexed/cited and recommend concrete steps.

### 7. Suggestions
- **Top 10 prioritized improvements** — ranked by impact ÷ effort, each with: what, where (URL), why, and how (concretely).
- **Five additions worth building** that fit the site's soul (not generic "add a newsletter" advice).
- **Anything to cut** — be honest if something weakens the whole.
- **The "don't touch" list** — what is already excellent and should be protected from well-meaning churn.

## Report format

1. **Executive summary** (≤200 words) with a letter grade per section and one overall.
2. **Findings by section** — every finding: *location → observation → why it matters → the fix*. Specific over general; quote actual text/elements you saw.
3. **The prioritized top-10**, the five additions, the cut list, the don't-touch list.
4. Close with the three things you'd tell this builder over coffee — professor to student, off the record.

Browse thoroughly before writing. If a page errors or you cannot access something, say so explicitly rather than guessing. Do not pad; depth over breadth on the pages listed.
