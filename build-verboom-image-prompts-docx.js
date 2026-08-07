/**
 * build-verboom-image-prompts-docx.js
 *
 * Generates "Verboom-Image-Prompts.docx" into the Heritage research folder —
 * a set of period image-generation prompts for Grok Imagine, one archival set
 * for the Verboom records page (Suzanna's deep Dutch line, nested under the
 * Lakemans). Mirrors the format of McIver-Image-Prompts.md.
 *
 * Run: node build-verboom-image-prompts-docx.js
 */

const fs = require("fs");
const path = require("path");
const docx = require("C:/Users/thoma/AppData/Roaming/npm/node_modules/docx");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  LevelFormat, BorderStyle,
} = docx;

const OUT = path.join(
  "C:/Users/thoma/Desktop/Heritage research",
  "Verboom-Image-Prompts.docx"
);

// ---- helpers -------------------------------------------------------------
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const P  = (t, opts = {}) => new Paragraph({
  spacing: { after: 160 },
  children: [new TextRun({ text: t, italics: !!opts.italic })],
});
const BULLET = (t) => new Paragraph({
  numbering: { reference: "bullets", level: 0 },
  spacing: { after: 80 },
  children: [new TextRun(t)],
});
// A plate: bold filename/spec heading, then the prompt as its own paragraph.
const PLATE = (heading, prompt) => ([
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 80 },
    children: [new TextRun(heading)],
  }),
  new Paragraph({ spacing: { after: 200 }, children: [new TextRun(prompt)] }),
]);

const SHARED_STYLE =
  "Shared style: period-accurate, documentary, emotionally restrained; muted/desaturated " +
  "palette, soft natural light, fine film-grain or aged-print texture. Low-Countries waterland " +
  "— flat horizons, immense skies, canals, dikes and polders. No text, no captions, no " +
  "watermarks, no modern objects, no recognizable real faces. Historically correct Dutch " +
  "clothing, architecture, and landscape for the stated date.";

const plates = [
  ["1 — Hero · verboom-hero-kinderdijk-waterland.jpg  (16:9 · aged photograph)",
   "The Dutch waterland of the Alblasserwaard near Kinderdijk, on the Beneden-Merwede southeast " +
   "of Rotterdam, around 1880. A vast flat polder under an immense grey-blue sky; a row of brick " +
   "windmills with great canvas-clad sails turning along a dead-straight drainage canal; willow-" +
   "lined banks, reed beds and water-meadows lying below sea level; a single low farmhouse in the " +
   "distance. The old Dutch war against water, held to a draw. Aged photograph, desaturated greens " +
   "and slate-greys, water-flat light, soft grain."],

  ["2 — verboom-sliedrecht-dredgers.jpg  (3:2 landscape · muted oil painting)",
   "The Sliedrecht riverside on the Beneden-Merwede, southeast of Rotterdam, around 1840. " +
   "Labouring men in rough wool jackets and wooden clogs working the river's edge: sinking great " +
   "willow-and-stone fascine mattresses to armour a dike, and dredging mud from a shipping channel " +
   "with hand scoops and a horse-worked barge, deepening it against the flood. Wet, cold, dignified " +
   "toil on the front line of the war with the water. Muted oil painting in the manner of the " +
   "19th-century Dutch Hague School — low earthy browns, grey river, heavy overcast sky."],

  ["3 — verboom-ter-aar-barbershop.jpg  (3:2 landscape · aged photograph)",
   "A modest village tailor-and-barber's shop on the Kerkweg in Ter Aar, a canal village south of " +
   "Amsterdam, around 1918. A single room serving both trades (kleermaker en kapper): a barber's " +
   "chair before a wall mirror with a leather razor-strop, and beside it a tailor's table heaped " +
   "with dark woollen cloth, shears, chalk and a tape measure. Through the small-paned window, a " +
   "quiet brick street running along a canal. Aged photograph, warm sepia tones, soft grain, the " +
   "still light of an early-20th-century interior."],

  ["4 — verboom-brugwachter-ter-aar.jpg  (3:2 landscape · aged photograph)",
   "A small wooden Dutch drawbridge (ophaalbrug) over a canal at Ter Aar, around 1900, with its " +
   "bridge-keeper — a brugwachter in a peaked cap and dark working clothes — standing by the raised " +
   "counterweight beam as a laden sailing barge waits to pass through. A keeper's brick hut, a " +
   "cobbled towpath, and flat polder stretching beyond. Quiet, orderly, working. Aged photograph, " +
   "muted greens and browns, fine grain."],

  ["5 — verboom-haarlemmermeer-drained.jpg  (3:2 landscape · muted oil painting)",
   "The Haarlemmermeer just after it was pumped dry, around 1855 — a lake turned to land. A vast " +
   "expanse of raw, wet black peat and clay stretching to a ruler-straight horizon, ribboned with " +
   "brand-new drainage ditches; on the encircling ring-dike a great brick steam pumping-station " +
   "with a tall smoking chimney (the Cruquius engine); and the first incomer settlers breaking the " +
   "new ground with a horse and plough. Empty, hopeful, and below sea level. Muted oil painting, " +
   "cold silvery light, browns and greys under an enormous sky."],

  ["6 — verboom-petten-dijkwerker.jpg  (3:2 landscape · muted oil painting)",
   "The North Sea dune coast at Petten in Noord-Holland, around 1828. A crew of dike-workers " +
   "(dijkwerkers) in rough clothes and clogs reinforcing the long grass-and-stone sea-dike against " +
   "the surf — barrowing earth, laying stone and brushwood; marram-grassed dunes rising behind " +
   "them, a cold pewter sea breaking ahead, and a low village with a tiny shopfront (winkel) " +
   "sheltering behind the dike. Hard, wind-blown coastal labour. Muted oil painting in the Hague " +
   "School manner — grey-green, sand and slate tones, a scoured sky."],

  ["7 — verboom-goeree-overflakkee-island.jpg  (3:2 landscape · aged photograph)",
   "The flat farming-and-fishing island of Goeree-Overflakkee in the South Holland river delta, " +
   "around 1870. A high green sea-dike curving along a tidal creek where a wooden fishing smack " +
   "lies grounded at low tide; behind the dike, ruler-flat wheat and flax fields, a low brick " +
   "village with a slender church tower, and island folk in plain dark Sunday clothes. Wide delta " +
   "light where sea and farmland meet. Aged photograph, muted greens and tidal greys, soft grain."],

  ["8 — verboom-the-needle-carried.jpg  (3:2 landscape · aged photograph) — optional closer",
   "A quiet still-life on a worn wooden table, around 1940, lit by soft window light: a pair of " +
   "well-used tailor's shears, a needle and thimble, a wound bobbin of dark thread, and a neatly " +
   "folded length of dark wool cloth. No people. The trade — the needle and shears — that Suzanna " +
   "Verboom carried out of Ter Aar and into the family. Aged photograph, warm muted tones, soft " +
   "shadow, fine grain."],
];

// ---- assemble ------------------------------------------------------------
const children = [];
children.push(H1("The Verbooms — period image-generation prompts"));
children.push(P(
  "Eight plates for the Verboom records page (Suzanna's deep Dutch line, nested under the Lakeman " +
  "spoke). Written to cohere as one archival set. Generate, upload to WP Media, then send me the " +
  "URLs and I'll wire the verboom-images.json chapter→figure mapping — the page currently carries " +
  "just one image.", { italic: true }
));

children.push(H2("Shared style (paste into every prompt)"));
children.push(new Paragraph({
  spacing: { after: 200 },
  border: { left: { style: BorderStyle.SINGLE, size: 18, color: "8a8a8a", space: 12 } },
  indent: { left: 240 },
  children: [new TextRun({ text: SHARED_STYLE, italics: true })],
}));

children.push(H2("Rules of thumb"));
children.push(BULLET(
  "Medium by era: pre-photographic scenes (before ~1860) = muted oil painting in the manner of " +
  "the 19th-century Dutch Hague School; ~1860 onward = aged photograph (sepia / early black-and-white)."
));
children.push(BULLET(
  "Aspect ratio: the hero at 16:9; the chapter plates at 3:2 landscape. Author at the stated ratio " +
  "— we never crop (hard rule: contain, never cover)."
));
children.push(BULLET(
  "Filenames below are suggestions; WP assigns the final URLs on upload. Send me those and I'll map them."
));

children.push(new Paragraph({
  spacing: { before: 120, after: 120 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "bbbbbb", space: 4 } },
  children: [new TextRun("")],
}));

plates.forEach(([h, pr]) => PLATE(h, pr).forEach((p) => children.push(p)));

children.push(new Paragraph({
  spacing: { before: 240 },
  border: { top: { style: BorderStyle.SINGLE, size: 6, color: "bbbbbb", space: 8 } },
  children: [new TextRun({
    text: "Real family photos layer over these period plates wherever we have them. The story's " +
      "five sections map onto plates 2–7 (riverside Verbooms · the Ter Aar trade · the bridge-keeper · " +
      "the drained Haarlemmermeer · the Petten dike-coast · the Goeree-Overflakkee island side); the " +
      "hero sets the waterland, and plate 8 is an optional still-life closer for where the line meets " +
      "the Lakemans.",
    italics: true,
  })],
}));

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Georgia", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 34, bold: true, font: "Georgia", color: "1f1f1f" },
        paragraph: { spacing: { after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Georgia", color: "2a2a2a" },
        paragraph: { spacing: { before: 220, after: 100 }, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 540, hanging: 260 } } } }] },
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

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUT, buf);
  console.log("Wrote", OUT, "(" + buf.length + " bytes)");
});
