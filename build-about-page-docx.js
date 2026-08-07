/**
 * build-about-page-docx.js — generates About-Page-Text.docx
 *
 * Editing draft for Thomas: revised /about prose, alternative openings for
 * Patience's and Faith's pages, home-page pillar-card options, and notes.
 * Nothing goes live without Thomas's pass.
 *
 * Run: node build-about-page-docx.js
 */

const fs = require("fs");
const path = require("path");
const docx = require("C:/Users/thoma/AppData/Roaming/npm/node_modules/docx");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  LevelFormat, BorderStyle,
} = docx;

// ---------------------------------------------------------------- helpers
const wordCounts = { s1: 0, s2: 0, s3: 0, s4: 0 };
let currentSection = "s1";
function countWords(text) {
  const n = (text || "").trim().split(/\s+/).filter(Boolean).length;
  wordCounts[currentSection] += n;
}

// His text — normal style.
function P(text, opts = {}) {
  countWords(text);
  return new Paragraph({
    spacing: { after: 160 },
    children: [new TextRun({ text })],
    ...opts,
  });
}

// A paragraph that opens with the [CHANGED] marker, then his revised text.
// segments: array of { changed: true|false, text }
function PMixed(segments) {
  const runs = [];
  for (const seg of segments) {
    if (seg.marker) {
      runs.push(new TextRun({ text: "[CHANGED] ", bold: true, color: "C00000" }));
      countWords(""); // marker not counted
    } else {
      countWords(seg.text);
      runs.push(new TextRun({ text: seg.text }));
    }
  }
  return new Paragraph({ spacing: { after: 160 }, children: runs });
}

// Claude's notes — italics, grey.
function note(text) {
  countWords(text);
  return new Paragraph({
    spacing: { after: 160 },
    children: [new TextRun({ text, italics: true, color: "595959" })],
  });
}

// Bold-italic label (option labels etc.)
function label(text) {
  countWords(text);
  return new Paragraph({
    spacing: { before: 120, after: 100 },
    children: [new TextRun({ text, bold: true, italics: true, color: "595959" })],
  });
}

function H1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(text)] });
}
function H2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(text)] });
}
function H3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(text)] });
}

// Numbered note item for Section 4.
function noteItem(text) {
  countWords(text);
  return new Paragraph({
    numbering: { reference: "notes", level: 0 },
    spacing: { after: 120 },
    children: [new TextRun({ text, italics: true, color: "595959" })],
  });
}

const children = [];

// ================================================================ TITLE
children.push(new Paragraph({
  heading: HeadingLevel.TITLE,
  children: [new TextRun("About-Page Text — editing draft")],
}));
children.push(note("Prepared 12 June 2026 for Thomas Cheesman. How to read this document: regular text is page copy (yours, or proposed); a red [CHANGED] tag marks every passage I touched — everything without a tag is your original wording, verbatim. Italic grey text like this is me talking to you, not page copy. Nothing here goes live without your pass."));

// ================================================================ SECTION 1
currentSection = "s1";
children.push(H1("Section 1 — /about, the full revised text"));
children.push(note("The whole page, top to bottom, in reading order. Images, captions, and the email block are untouched; links are shown as plain text (e.g., /hcs). Headings below are the page's own section headings."));

children.push(H2("Page hero (unchanged)"));
children.push(P("The Long Version"));
children.push(P("Chef, dad, rare-disease guy — the unhurried bio."));

children.push(H2("Lead"));
children.push(PMixed([
  { marker: true },
  { text: "Hi, I'm Thomas Cheesman. I cooked for a living for the better part of two decades, I apprenticed a couple chefs and even taught a semester at the local college, my first and only, and stopped when Hajdu-Cheney Syndrome made the line unbearable. " },
  { text: "I live in Grande Prairie, Alberta, with Melanie and our three kids — Daniel, Patience, and Faith. The rest of this page is where the threads come from." },
]));
children.push(note("Fix (a): the broken clause “though for the last and my only semester” is repaired; only the first sentence changed, the rest of the lead is verbatim."));

children.push(H2("The kitchen years"));
children.push(PMixed([
  { text: "I went to SAIT in Calgary for the Apprentice Cooking program, then worked as Head Chef at Ric's Grill. While chefing it up at Ric's Grill I was offered the opportunity to teach the cooking part of the Hospitality and Tourism Diploma at GPRC — the Grande Prairie Regional College, now Northwestern Polytechnic. I was feeling some real pressure at the time. I was still a new dad, I was beginning to really struggle with HCS and the physical requirements of a Chef position. I was shutting down Ric's Grill so that we could renovate and open a new restaurant called Township 71. " },
  { marker: true },
  { text: "The day before we opened, Melanie and I were surprised to learn she was carrying the boy who would become Daniel, our handsome boy." },
]));
children.push(note("Fix (b): “pregnant with what grew to become” is gone; this borrows the /thomas construction (“carrying the boy who would become…”) but keeps your “surprised” and “handsome boy” so the two pages don't match word-for-word. “Township71” also standardized to “Township 71” to match the rest of the site."));

children.push(PMixed([
  { text: "I wrote curriculum. I built lesson plans. I stood in front of students eager to learn and I had to be the one with the answer by day 1. That was the hardest time I ever had and the best one. " },
  { marker: true },
  { text: "Every bit of it drew on my years of speaking and teaching Product Knowledge/Steakology/Orientations, and on everything a good chef does to ensure the kitchen and dining staff know everything they need for success." },
]));
children.push(note("Fix (c): the verbless fragment now hangs off a verb (“drew on”) and connects the teaching back to the classroom story. Your slash style kept on purpose."));

children.push(P("The last full kitchen I ran was Majors Homestyle & Tractor Jack's. Before that, Ric's Grill & Township 71 — I started at Ric's Grill as Head Chef on the same day Patience was born, ten days late. There's a story in that."));

children.push(PMixed([
  { text: "What stopped me wasn't a single moment. Hajdu-Cheney takes hands and feet apart slowly. " },
  { marker: true },
  { text: "There comes a point where you can't sustain twelve hours on the line, where the saute pan has to be gripped white-knuckled and the standing and walking of a long shift is no joy at all. I wish I knew it before everyone around me did. Still, I'm grateful I got to leave on my own terms. I wish I had stopped sooner, or slowed my degeneration down, but the years since I stopped have been the hardest of my life." },
]));
children.push(note("Fix (d), the stockpot cluster: /about now keeps only the white-knuckled saute pan — the one detail unique to this page — plus your phrase “no joy.” The thirty-pound stockpot, the fifty-pound potato box, and the twelve-miles-a-day figure stay owned by /hcs and /thomas. Also repaired the comma splice and “I wish I would have stopped.”"));

children.push(H2("The constraint"));
children.push(PMixed([
  { text: "Hajdu-Cheney Syndrome — “hay-dew chaye-knee” — is a rare connective-tissue and bone disorder. The skeletal system reabsorbs faster than it should; the bones in the hands and feet get smaller/shorter over time. " },
  { marker: true },
  { text: "Exactly how rare it is, and what forty years of it look like up close, has its own page: the full clinical story lives at /hcs. It's the reason I built Bare Your Rare." },
]));
children.push(note("Fix (d), the statistic: the roughly-a-hundred-documented / fewer-than-fifty-alive numbers are removed from /about and replaced with a pointer to /hcs, which keeps the stat. “Forty years” is from your own line on /hcs (“Over the next forty years that one thumb became both hands…”)."));

children.push(H2("Family & heritage (unchanged)"));
children.push(P("Melanie and I were apart for a decade before we got back together, and then had three kids in five years. The kids' stories, and the eight family lines that meet in them, live at /family."));
children.push(P("Since I left the kitchen I've used a lot of that returned time putting our family history together — back to the 1600s on a couple of branches. The long-form research turns into video documentaries on YouTube at @DriftingSplash9. The Lakeman Branch of Our Family and Haiste Family Line From Daniel On are the two longest, ninety minutes each. The condensed versions live in the heritage section of this site."));
children.push(note("Left verbatim, but both paragraphs have near-twins on /hcs — see note 6 in Section 4."));

children.push(H2("Three sites I built"));
children.push(PMixed([
  { marker: true },
  { text: "I run three websites now. I trained to cook, not to code, so nobody is more surprised about that than I am." },
]));
children.push(note("Fix (d): “which is funny to type given that I'm not a programmer” appears word-for-word on /hcs (and nearly so on /thomas), so /about gets its own version of the joke."));

children.push(P("This one — thomascheesman.ca — is the personal hub. bareyourrare.org is a writing project about Hajdu-Cheney specifically and rare disease in general, built for the small group of people who go looking for it and don't find much. gpresidentialsociety.com is the volunteer hub for the Grande Prairie Residential Society; I sit on its board and the website work is one of the ways I contribute."));
children.push(note("Unchanged. (The template prints the live hostname dynamically; shown here as thomascheesman.ca.)"));

children.push(PMixed([
  { text: "I work with Claude, Anthropic's coding assistant, to build them. I don't write all the code; I spec the design, the voice, the editorial moves, and Claude writes them out. Sometimes I write bits here and there but I am leagues behind AI and to tell the truth I am better off learning to use them than I am to learn how to build a pac-man game. " },
  { marker: true },
  { text: "All three sites went up inside a year and a half, which tells you how well the arrangement works." },
]));
children.push(note("Fix (d): “Three sites in eighteen months says something about how that collaboration goes” is word-for-word on /hcs, so /about keeps the fact in new words and /hcs keeps the original sentence."));

children.push(H2("What I'm chewing on (unchanged)"));
children.push(P("I've kept structured goals — BHAGs, PDPs, annual reviews — for almost twenty years. The frameworks stayed even when the kitchen left. I admit the framework has been a little neglected the last year or so."));
children.push(P("Lately the threads are: Bitcoin and decentralized ledgers (curiosity, mostly), AISH advocacy — Alberta's disability program is in a slow crisis and I've written about it — and the slow craft of getting the family record onto the page/slide/YouTube before the people who remember it stop being here to ask."));

children.push(H2("Closing (unchanged)"));
children.push(P("The fastest way to reach me is email: thomasmcheesman@gmail.com"));

// ================================================================ SECTION 2
currentSection = "s2";
children.push(new Paragraph({ pageBreakBefore: true, children: [] }));
children.push(H1("Section 2 — Patience and Faith: alternatives to “three words”"));
children.push(note("Per your call, Daniel's double set stays exactly as it is (“If you held me to three words: compassionate, creative, patient. If you held me to three more: shy, quiet, private.”). Below are two replacement devices each for the girls. Every alternative uses only details already on her page, names the same traits, and runs under 120 words. The H3 headings on the pages can stay as they are with any of these."));

children.push(H2("Patience"));
children.push(label("Her current opening, verbatim, under the heading “Determined, self-driven, sensitive”:"));
children.push(P("If you made me sum her up in three words, those are the ones — and the sensitive one shows first. She is shy, properly shy, the kind that floods her cheeks pink and tugs the dimples out at the smallest provocation. Turn the radio up, say hello to one of her friends, call her name across a parking lot, and there they are, those dimples, betraying her in front of everyone. She would much prefer they stayed hidden — which is, of course, the entire reason I can never quite stop trying to coax them out."));

children.push(label("Alternative A — “The tell” (the dimples become the evidence; the traits arrive at the end instead of the start):"));
children.push(P("Patience has a tell. She is shy, properly shy, the kind that floods her cheeks pink and tugs the dimples out at the smallest provocation. Turn the radio up, say hello to one of her friends, call her name across a parking lot, and there they are, betraying her in front of everyone. She would much prefer they stayed hidden, which is the entire reason I can never quite stop trying to coax them out. But don't let the blush fool you. The girl behind the dimples runs this house, takes top marks year after year, and quietly carries more than anyone asks of her. Sensitive is just what shows first. Determined and self-driven are what you get."));
children.push(note("Lowest-risk option: it keeps most of your existing sentences and just moves the trait-naming to the close, so the scaffold sentence disappears."));

children.push(label("Alternative B — “7:55” (one scene from her own page carries the traits):"));
children.push(P("At 7:55 every school morning, on the dot, Patience takes command of this house: chasing the other two to find their things and make the truck, and not above shoving her dawdling old man along with them. Nobody assigned her the job. Nobody asks her to spend a Saturday quietly working down the chore list so her mum doesn't lose her one day off to cleaning, either. That's the determined, self-driven part, and it never needs an alarm. The sensitive part you have to catch: say hello to one of her friends or call her name across a parking lot, and the cheeks go pink and the dimples she hates give her away every time."));
children.push(note("If you pick this one, the later “The one who runs the show” paragraph repeats the 7:55 scene and would need a one-sentence trim — happy to do that pass once you choose."));

children.push(H2("Faith"));
children.push(label("Her current opening, verbatim, under the heading “A carefree wandering fireball”:"));
children.push(P("Carefree, wandering, fireball — three words, if you held me to it. I have met a lot of people, and not one of them with Faith's engine. She runs flat out from the moment her feet hit the floor, and I keep up the way you keep up with weather — mostly by watching where it's headed."));

children.push(label("Alternative A — “The ropes” (one scene from her own page does the describing):"));
children.push(P("There's a playground scene that says it better than any list of words. Faith used to climb out along the ropes and get further than her nerve could carry her, and freeze, and I'd go up and bring her down. Before her feet had properly found the ground she was off, sprinting for the next thing to climb. That's the whole of her. I have met a lot of people, and not one of them with Faith's engine; she runs flat out from the moment her feet hit the floor, and I keep up the way you keep up with weather, mostly by watching where it's headed."));
children.push(note("If you pick this one, the ropes anecdote later under “Soft in the middle” tells the same story and would need a trim — same offer as above."));

children.push(label("Alternative B — “The forecast” (extends the weather metaphor you already use for her):"));
children.push(P("I don't describe Faith so much as forecast her. She is a small, bright weather system: running flat out from the moment her feet hit the floor, headed wherever the biggest thing is, the sun, the black holes, the next thing to climb. I have met a lot of people, and not one of them with Faith's engine. You don't steer weather and you don't really steer Faith; you catch her early, turn her toward the bright side, and watch the storm decide not to arrive. Carefree, wandering, fireball. I just call it the forecast."));
children.push(note("This one still names the three words, but as a landing rather than a scaffold. It leans on metaphors already on her page (“you can watch the weather change in her,” the bright side, the cosmos)."));

// ================================================================ SECTION 3
currentSection = "s3";
children.push(new Paragraph({ pageBreakBefore: true, children: [] }));
children.push(H1("Section 3 — Home page pillar cards"));
children.push(note("Two options per card, 30–50 words each, all first-person and built from facts already on the site. One deliberate omission: the fewer-than-fifty statistic stays out of the Rare Disease card because the hero directly above it already says it — the home page shouldn't say it twice."));

children.push(H2("Card 1 — Family & Stories"));
children.push(label("Current: “Life's greatest joy comes from the people we love. Discover the stories of Patience, Daniel, Faith, and the extended family that makes me whole.”"));
children.push(label("Option A:"));
children.push(P("Three kids I was told I'd never have, and the eight family lines that meet in them, traced back to the 1600s on a couple of branches. Patience, Daniel, and Faith each get their own page here. So do the ancestors."));
children.push(label("Option B:"));
children.push(P("Since the kitchen let me go I've been writing the family down: the kids' stories, Melanie's lines and mine, eight in all. I want it on the page while the people who remember it are still here to ask."));

children.push(H2("Card 2 — Rare Disease & BYR"));
children.push(label("Current: “Hajdu-Cheney Syndrome shaped how I think about rare conditions. I built Bare Your Rare so patients with ultra-rare diseases could tell their stories together — that's where the deeper writing lives.”"));
children.push(label("Option A:"));
children.push(P("When I went looking for someone writing honestly about a life with Hajdu-Cheney, I found crickets. So I built Bare Your Rare, where people with ultra-rare diseases tell their stories together. The deeper rare-disease writing lives over there."));
children.push(label("Option B:"));
children.push(P("Hajdu-Cheney took the kitchen from me and handed back time, and a fair share of that time became Bare Your Rare: my writing project on this disease in particular and rare disease in general. The deeper writing lives there, not here."));

children.push(H2("Card 3 — Community & Service"));
children.push(label("Current: “Giving back matters. I volunteer with Grande Prairie Residential Society to provide accessible housing in our community.”"));
children.push(label("Option A:"));
children.push(P("I sit on the board of the Grande Prairie Residential Society, which provides accessible housing here in Grande Prairie. My hands are better with a keyboard than a hammer these days, so the Society's website is one of the ways I contribute."));
children.push(label("Option B:"));
children.push(P("Grande Prairie has been my town since 1999, and the Residential Society is one way I give some of that back: accessible housing for the people here who need it. I sit on the board, and I built their website too."));

// ================================================================ SECTION 4
currentSection = "s4";
children.push(new Paragraph({ pageBreakBefore: true, children: [] }));
children.push(H1("Section 4 — Notes for Thomas"));

const notes = [
  "The lead: I read “though for the last and my only semester” as meaning you taught exactly one semester, and rewrote it as “taught a semester at the local college, my first and only.” I also left “I apprenticed a couple chefs” untouched, reading it as you training apprentice chefs. [YOUR WORDS NEEDED: if it actually means you apprenticed UNDER a couple of chefs, tell me and I'll flip the phrasing.]",
  "The Daniel sentence borrows the construction from /thomas (“carrying the boy who would become…”) but keeps your “surprised” and “handsome boy” so the two pages tell the same moment in different words.",
  "Stockpot and mileage: /about now keeps only the white-knuckled saute pan, which is the one detail unique to this page. The thirty-pound stockpot, the fifty-pound potato box, and the twelve-miles-a-day figure remain on /hcs and /thomas, which now own them outright.",
  "The rare-cases statistic is gone from /about, replaced with a pointer to /hcs. The home-page hero also says “fewer than fifty” — I left that alone (different page, and it's doing real work there), and kept the stat out of the new pillar-card options so the home page never says it twice.",
  "The “autosomal dominant, which is the polite way of saying” joke turns out not to be on /about at all — it duplicates between /hcs and /thomas. Both pages are out of scope for this pass, so this is flagged for a future decision: which of the two keeps the joke.",
  "Three more word-for-word duplications I spotted that were NOT on the review's list — left verbatim on /about, your call whether to vary them later: (a) “apart for a decade … three kids in five years” (/about and /hcs); (b) “Since I left the kitchen I've used a lot of that returned time putting the family history together — back to the 1600s” (/about, /hcs, and nearly /thomas); (c) “I spec the design, the voice, the editorial moves, and Claude writes them out” (/about and /hcs).",
  "“Township71” appeared once without the space on /about; standardized to “Township 71” to match the rest of the page and site.",
  "Small grammar repairs rode along inside [CHANGED] passages only: the comma splice in “I wish I knew it before everyone around me did, still, I'm grateful…” and “I wish I would have stopped” → “I wish I had stopped sooner.” Meaning untouched.",
  "Em-dashes: I added none. Every em-dash left in Section 1 sits inside a verbatim paragraph of yours.",
  "The girls' alternative openings reuse scenes from later in each page (Patience's 7:55 routine in Option B; Faith's playground ropes in Option A). If you choose either, the later paragraph telling the same scene needs a one-sentence trim so the page doesn't repeat itself — say the word and I'll do that pass.",
  "Section 2 keeps both girls' existing H3 headings; none of the alternatives require a heading change.",
  "This draft covers prose only. Figure captions, image choices, alt text, and the rot13 email block on /about are untouched.",
];
for (const n of notes) children.push(noteItem(n));

// ================================================================ DOCUMENT
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal", next: "Normal",
        run: { size: 40, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 0, after: 240 } } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 280, after: 200 }, outlineLevel: 0,
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "999999", space: 2 } } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 240, after: 140 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: "notes",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 480, hanging: 360 } } } }] },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    children,
  }],
});

const outPath = path.join(__dirname, "About-Page-Text.docx");
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outPath, buffer);
  console.log("Wrote " + outPath);
  console.log("Word counts (all text incl. labels/notes):");
  console.log("  Section 1: " + wordCounts.s1);
  console.log("  Section 2: " + wordCounts.s2);
  console.log("  Section 3: " + wordCounts.s3);
  console.log("  Section 4: " + wordCounts.s4);
});
