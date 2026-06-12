# Audit v2 — Claude prompt
# (Thomas: paste this back to Claude in a fresh session AFTER you have Grok's
# results in hand — attach or paste Grok's full report alongside this prompt.)

---

You are re-auditing https://thomascheesman.ca — second pass, deeper layer. The first audit (2026-06-12, report in chat history / triage in Review-Triage-2026-06.xlsx) drove a round of fixes that all shipped and verified: titles, descriptions, og:image, 301s, schema, llms.txt, defer chain, hero LCP, corpus cross-links, next-line footers, heading hygiene, and the sunglasses-lens readability pass (theme 1.0.540+). Do not re-litigate those — spot-verify they held, then go deeper.

You have the local repo, the live site, browser automation, Lighthouse via local PHP/node tooling, and agents. Use them. House rules apply: CLAUDE.md, the privacy rules, never object-fit: cover, plan-first on the desk menu and drawer.

## Part 1 — adjudicate Grok

Grok ran a parallel audit (attached). Treat it as a rival reviewer's submission, not as truth:

- Verify every concrete claim it makes before accepting it — load the page, quote the text, measure the number. Mark each finding CONFIRMED / WRONG / EXAGGERATED / ALREADY-FIXED.
- Where Grok is wrong, say so plainly and show the evidence.
- Where Grok found something the 2026-06-12 audit missed, flag it prominently — that is the most valuable category.
- End Part 1 with a scorecard: how many of Grok's findings survived contact with the evidence.

## Part 2 — the three reviewers, your own pass

Run the same three lenses independently of Grok (form your findings BEFORE comparing, so the two reports genuinely cross-check):

1. **World-class book editor.** The corpus as a manuscript: the 8 long-reads + Thomasito + the kid pages + /hcs (~70k words). Structural verdict: pacing, cross-story repetition (quote duplicated constructions side by side), voice drift toward tool-cadence (em-dash density, "It is not X. It is Y.", identical chapter architectures), whether the confidence-tier device survives 70k words or becomes a tic, the three strongest and three weakest chapters in the corpus, what a publisher would cut and how many words. Be critical of THOMAS'S OWN writing too, not just the AI-collaboration seams — he is asking for the real edit. Title the compiled book; say what's missing from it.
2. **Web developer guru.** Fresh outside-in pass: mobile performance now that defer/LCP landed (re-run Lighthouse, compare to the June baselines: home 51, story 22, map 40), WCAG 2.2 AA over the new dark-lens design, keyboard paths (desk menu, tree chips, map timeline), fragility, and code-review-grade craft notes from the actual repo. Three most fragile things, three best-engineered.
3. **General users.** His mom (70s, iPad), his uncle (60s, Android, skims), and the kids at ages 10 / 14 / 25. Walk their actual paths. Include the uncomfortable question: is anything written about the kids that a 14-year-old version of them might not want public? (Flag for Thomas's call — never decide for him.)

## Part 3 — deliverable

- Findings in the house format: location → observation (quoted) → why → fix.
- Letter grades per lens + overall; explicit deltas vs the 2026-06-12 grades (Content B+, Design A−, IA B−, Engineering B−, SEO C+, GEO C+).
- One merged, prioritized top-10 across your findings AND Grok's confirmed ones, ranked by impact ÷ effort.
- A cut list and a don't-touch list.
- Close with the three-things-over-coffee section — and this time, no kindness padding: the standing instruction from Thomas is "challenge him, and be critical of my work."
