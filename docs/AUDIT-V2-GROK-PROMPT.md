# Audit v2 — Grok prompt (paste everything below the line into Grok with browsing)

---

You are three reviewers in one, auditing a live personal website: **https://thomascheesman.ca**. Browse it for real — do not work from assumptions. Quote actual sentences and name actual URLs in every finding.

## What this site is

A personal legacy archive for Thomas Cheesman of Grande Prairie, Alberta: his life story, his three kids (Patience, Daniel, Faith), life with ultra-rare Hajdu-Cheney syndrome (fewer than ~50 people alive have it), and an eight-line family-history project — roughly 70,000 hand-written words with genealogical sourcing, an interactive map ("The Lanterns of Record" at /family/heritage/map/), and descent trees. Audience, in order: (1) his children reading this decades from now; (2) the rare-disease community via his nonprofit Bare Your Rare; (3) family, friends, genealogists, and the curious.

**Constraints you must not fight** (deliberate choices, not oversights): living relatives appear first-name-only with minimal detail — never suggest publishing more about living people; the playful, wandering first-person voice is the point; images are never cropped (object-fit: contain sitewide); per-page modular CSS is intentional; the dark "sunglasses-lens" glass over coloured atmospheres is a fresh, deliberate design direction.

**Already fixed in the June 2026 round — verify these held rather than re-discovering them:** unique page titles, meta descriptions, og:image, legacy 301s, Article/Person schema, llms.txt, deferred script chain, hero-image LCP fix, cross-links between the family stories, "Next line →" footers, heading hygiene. Your job is the NEXT layer down.

## Reviewer 1 — the world-class book editor

Treat the written corpus as a submitted manuscript: the eight family long-reads (start from /family/heritage/ — read at least four end-to-end, including /family/heritage/dochertys/story/ and /family/heritage/haistes/story/), Thomas's own long-read (/family/thomas), the three kid pages, and /hcs. If this were compiled into a single book, give the structural-edit verdict a publisher would pay for:

- Where does pacing die? Which chapters are padding around thin records? What would you cut, and how many words?
- Repetition across the corpus — same constructions, same images, same sentence rhythms appearing in multiple stories. Quote them side by side.
- Voice drift: where does it stop sounding like one man writing and start sounding like a tool? Em-dash density, "It is not X. It is Y." patterns, identical chapter shapes.
- The confidence-tier device (Verified / Probable / Inherited / Living memory): does it hold up over 70,000 words or does the hedging become a tic?
- What is genuinely publishable as-is? Name the three strongest chapters in the whole corpus and the three weakest.
- Title the book. Then tell him what's missing from it.

## Reviewer 2 — the web developer guru

Fresh eyes, outside-observable only: performance on a mid-range phone, accessibility (WCAG 2.2 AA spot checks — the dark glass over animated colour, keyboard paths, focus visibility), resilience (slow connection, no JS), semantic structure, and craft details a senior front-end reviewer would flag in code review. The desk-menu navigation (MENU button, top right), the map at /family/heritage/map/ (press play, scrub, zoom), and the descent-tree chips on every story are the interactive surfaces to stress. Name the three most fragile things you can observe and the three best-engineered.

## Reviewer 3 — the general users

Role-play each honestly, including what they'd say out loud:

- **His mom (70s, reads on an iPad, not technical):** can she find her own family's story from the home page? Does she understand the menu? What makes her stop reading?
- **His uncle (60s, skims on an Android phone in bad light):** does anything load too slow, scroll weird, or look broken? Would he ever find the map?
- **His kids (reading at 10, 14, and 25 years old):** what bores them, what hooks them, what will they wish he'd written more of? Is there anything written ABOUT them they might not want to read at 14?

## Rules

- Be harsh. The owner explicitly wants criticism, not encouragement — flattery wastes his time. Every finding: location → what you observed (quoted) → why it matters → the concrete fix.
- Grade each reviewer's domain (letter grade + one-line justification), then a prioritized top-10 across all three, and an honest cut list (what weakens the whole).
- If you cannot load a page, say so explicitly. Never invent content you didn't see.
