/**
 * build-heritage-image-prompts-docx.js
 *
 * Generates period image-generation prompt docs (for Grok Imagine) for the
 * image-light heritage stories — Rycroft and Steinke — into the Heritage
 * research folder. Mirrors the format of McIver-Image-Prompts.md and the
 * Verboom-Image-Prompts.docx already produced.
 *
 * Run: node build-heritage-image-prompts-docx.js
 */

const fs = require("fs");
const path = require("path");
const docx = require("C:/Users/thoma/AppData/Roaming/npm/node_modules/docx");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  LevelFormat, BorderStyle,
} = docx;

const OUT_DIR = "C:/Users/thoma/Desktop/Heritage research";

const SHARED_STYLE =
  "Shared style: period-accurate, documentary, emotionally restrained; muted/desaturated " +
  "palette, soft natural light, fine film-grain or aged-print texture. No text, no captions, " +
  "no watermarks, no modern objects, no recognizable real faces. Historically correct clothing, " +
  "architecture, and landscape for the stated date and place.";

// ---- docx helpers --------------------------------------------------------
function buildPromptDoc({ title, intro, rules, plates, footer, outName }) {
  const children = [];
  children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(title)] }));
  children.push(new Paragraph({ spacing: { after: 160 }, children: [new TextRun({ text: intro, italics: true })] }));

  children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Shared style (paste into every prompt)")] }));
  children.push(new Paragraph({
    spacing: { after: 200 },
    border: { left: { style: BorderStyle.SINGLE, size: 18, color: "8a8a8a", space: 12 } },
    indent: { left: 240 },
    children: [new TextRun({ text: SHARED_STYLE, italics: true })],
  }));

  children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Rules of thumb")] }));
  rules.forEach((r) => children.push(new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 80 },
    children: [new TextRun(r)],
  })));

  children.push(new Paragraph({
    spacing: { before: 120, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "bbbbbb", space: 4 } },
    children: [new TextRun("")],
  }));

  plates.forEach(([h, pr]) => {
    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 260, after: 80 },
      children: [new TextRun(h)],
    }));
    children.push(new Paragraph({ spacing: { after: 200 }, children: [new TextRun(pr)] }));
  });

  children.push(new Paragraph({
    spacing: { before: 240 },
    border: { top: { style: BorderStyle.SINGLE, size: 6, color: "bbbbbb", space: 8 } },
    children: [new TextRun({ text: footer, italics: true })],
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
        page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
      },
      children,
    }],
  });

  return Packer.toBuffer(doc).then((buf) => {
    const out = path.join(OUT_DIR, outName);
    fs.writeFileSync(out, buf);
    console.log("Wrote", out, "(" + buf.length + " bytes)");
  });
}

// ---- RYCROFT -------------------------------------------------------------
const RYCROFT = {
  outName: "Rycroft-Image-Prompts.docx",
  title: "The Rycrofts — period image-generation prompts",
  intro:
    "Nine plates for the Rycroft long-read — the family that reached from a Leeds back-street to " +
    "Honolulu and home again to the Peace Country. Written to cohere as one archival set across " +
    "three worlds: industrial Yorkshire, the Hawaiian Kingdom, and the Alberta frontier. Generate, " +
    "upload to WP Media, then send me the URLs and I'll wire the rycroft-images.json chapter→figure mapping.",
  rules: [
    "Medium by era: pre-photographic scenes (before ~1860) = muted Victorian-era oil painting; " +
      "~1860 onward = aged photograph (sepia / early colour); the Civil War plate in aged black-and-white.",
    "Aspect ratio: the hero at 16:9; the chapter plates at 3:2 landscape. Author at the stated ratio " +
      "— we never crop (hard rule: contain, never cover).",
    "Filenames below are suggestions; WP assigns the final URLs on upload. Send me those and I'll map them.",
  ],
  plates: [
    ["1 — Hero · rycroft-hero-honolulu-harbour.jpg  (16:9 · aged photograph)",
     "The Honolulu waterfront in the Kingdom of Hawaii, around 1875. A busy Pacific harbour town: " +
     "tall sailing ships and an early steamer at the wharves, low wooden and coral-block buildings " +
     "along Fort Street, coconut palms, and the green Koolau ridge rising behind; island and settler " +
     "townspeople in period dress. Warm, bright, and very far from England. Aged photograph, warm " +
     "muted tones, soft grain."],

    ["2 — rycroft-leeds-backstreet.jpg  (3:2 landscape · muted oil painting)",
     "A back-to-back street in industrial Leeds, in the West Riding of Yorkshire, around 1850. " +
     "Soot-blackened brick terraces crammed along a cobbled lane; flax-mill and dye-works chimneys " +
     "pouring brown smoke into a low sky; the river Aire running foul behind; working people in worn " +
     "wool and clogs. The hard engine-room of the Victorian world. Muted oil painting, sooty browns " +
     "and greys, smoke-dimmed light."],

    ["3 — rycroft-civil-war-cavalry.jpg  (3:2 landscape · aged black-and-white photograph)",
     "A Union cavalry column on the march in the American Civil War, around 1863. Mounted troopers " +
     "in dusty uniforms with carbines and sabres riding a rutted country road; horses, dust, a " +
     "split-rail fence and bare trees; no faces clearly identifiable. The improbable saddle a Leeds " +
     "emigrant boy found himself in. Aged black-and-white photograph, high grain, low contrast, the " +
     "look of a wet-plate field photo."],

    ["4 — rycroft-puna-coffee-lava.jpg  (3:2 landscape · aged photograph)",
     "The Puna district on the island of Hawaii, around 1890. A pioneer plantation cut from " +
     "lava-country: rows of young coffee on dark volcanic soil, a wooden coffee mill and a sawmill " +
     "among native forest, cattle grazing rough clearings, and far below a schooner standing off a " +
     "black-rock landing. Frontier in the tropics. Aged photograph, warm green and basalt-black " +
     "tones, soft grain."],

    ["5 — rycroft-honolulu-soda-works.jpg  (3:2 landscape · aged photograph)",
     "A small soda-works and bottling shop on a Honolulu street, around 1900 (the Fountain Soda " +
     "Works). A modest works stacked with crates of glass bottles, a horse-dray for deliveries, men " +
     "in shirtsleeves and aprons, a dusty street with telegraph poles and palms. The trade that put " +
     "the family's name on a Honolulu street. Aged photograph, warm sepia, fine grain."],

    ["6 — rycroft-larvik-quay.jpg  (3:2 landscape · aged photograph)",
     "The harbour at Larvik on the Vestfold coast of southern Norway, around 1885 — a sailing, " +
     "whaling, and timber port. A wooden barque at a stone quay, stacks of sawn timber, gabled wooden " +
     "houses climbing the hill behind, cold blue fjord light, dockworkers in heavy wool. The " +
     "seafaring world that orphaned Helene Thommessen. Aged photograph, cool desaturated blues and " +
     "timber-browns, soft grain."],

    ["7 — rycroft-peace-river-homestead.jpg  (3:2 landscape · aged photograph)",
     "A first homestead on the Spirit River frontier of the Peace Country, northern Alberta, around " +
     "1913. A sod-and-log house and a half-cleared quarter-section ringed by spruce bush, a team " +
     "breaking new ground, a wagon and a few cattle, an immense northern sky, the nearest railhead " +
     "days away. The cold opposite of the islands. Aged photograph, cool earth-tones, big sky, grain."],

    ["8 — rycroft-the-hat-draw.jpg  (3:2 landscape · aged photograph)",
     "A plain wooden meeting-room in a Peace Country pioneer settlement, 1920. Four men in work-worn " +
     "suits gathered at a table by lamplight, folded paper slips and a hat between them — the moment " +
     "a new district is given its name. Quiet, ordinary, historic. Aged photograph, warm lamplit " +
     "interior, soft grain. (No legible text on the slips.)"],

    ["9 — rycroft-town-of-rycroft.jpg  (3:2 landscape · aged photograph)",
     "The new prairie town of Rycroft, Alberta, around 1928 — a wooden grain elevator and a rail " +
     "siding beside a wide dirt main street, false-front stores, a few early automobiles and horse " +
     "teams, telegraph poles marching to a flat horizon. A family name become a place on the map. " +
     "Aged photograph, warm muted tones, big western sky, soft grain."],
  ],
  footer:
    "Real family photos layer over these plates where we have them (the Hawaiian generation is " +
    "unusually well-photographed). Chapter map: Leeds (2) · the Civil War reach (3) · Puna coffee (4) " +
    "· the Honolulu soda works and Rycroft Street (5) · Helene's Larvik (6) · the Peace River " +
    "homestead (7) · the 1920 hat-draw that named the town (8) · the town of Rycroft (9); the hero " +
    "sets the Hawaiian Kingdom the family reached.",
};

// ---- STEINKE -------------------------------------------------------------
const STEINKE = {
  outName: "Steinke-Image-Prompts.docx",
  title: "The Steinkes — period image-generation prompts",
  intro:
    "Seven plates for the Steinke records page — Bette's line, German Lutheran farmers who held out " +
    "(durchhalten) across two empires and an ocean; nested under the Rycroft spoke. Written to cohere " +
    "as one archival set. Generate, upload to WP Media, then send me the URLs and I'll wire the " +
    "steinke-images.json chapter→figure mapping — the page currently carries three images.",
  rules: [
    "Medium by era: pre-photographic scenes (before ~1860) = muted oil painting; ~1860 onward = aged " +
      "photograph (sepia / early black-and-white).",
    "Aspect ratio: the hero at 16:9; the chapter plates at 3:2 landscape. Author at the stated ratio " +
      "— we never crop (hard rule: contain, never cover).",
    "Filenames below are suggestions; WP assigns the final URLs on upload. Send me those and I'll map them.",
  ],
  plates: [
    ["1 — Hero · steinke-hero-russian-poland-village.jpg  (16:9 · muted oil painting)",
     "A German Lutheran farming village in the flat country of central Poland under the Russian " +
     "Empire, around 1858. Thatched and timber farmhouses along a muddy lane, a small whitewashed " +
     "Lutheran church with a modest steeple, ploughed fields running to a low grey horizon, a " +
     "horse-cart and farm folk in plain peasant wool. A colonist community holding its ground between " +
     "empires. Muted oil painting, earthy browns and greys, a broad dim sky."],

    ["2 — steinke-ossowka-wedding.jpg  (3:2 landscape · muted oil painting)",
     "The interior of a plain village Lutheran chapel in central Poland, winter 1858 — a modest " +
     "wedding. A widower farmer and a young bride before a simple altar and a black-robed Lutheran " +
     "pastor, a few family in heavy winter wool, candlelight on whitewashed walls, no ornament. " +
     "Sober, hopeful, austere. Muted oil painting, warm candlelight against cold tones, soft brushwork."],

    ["3 — steinke-hamburg-emigrants.jpg  (3:2 landscape · aged photograph)",
     "An emigrant departure from the port of Hamburg, around 1891. German-Lutheran families with " +
     "wooden trunks and bundles crowding a quay beside a steam-and-sail emigrant ship, figures at the " +
     "rail, a grey northern harbour. The youngest sons crossing first. Aged photograph, cold " +
     "desaturated tones, soft grain, a faint blur of motion."],

    ["4 — steinke-emerson-manitoba-homestead.jpg  (3:2 landscape · aged photograph)",
     "A first homestead near Emerson on the southern Manitoba prairie, around 1893. A small " +
     "sod-and-log house on raw flat grassland near the rail line, a breaking-plough and a team " +
     "turning the first furrows, a young couple and a child outside, an enormous prairie sky. " +
     "Beginning again on empty land. Aged photograph, dusty warm earth-tones, a wide flat horizon, grain."],

    ["5 — steinke-wetaskiwin-settlement.jpg  (3:2 landscape · aged photograph)",
     "A Volhynian-German Lutheran farm settlement near Wetaskiwin, central Alberta, around 1910. A " +
     "grown farmstead — log house, barn, fenced fields, livestock — and a large family in plain " +
     "Sunday clothes posed stiffly outside, many children. Endurance turning into a foothold. Aged " +
     "photograph, warm muted tones, soft grain."],

    ["6 — steinke-prairie-lutheran-cemetery.jpg  (3:2 landscape · aged photograph)",
     "A small German-Lutheran burying-ground on the open prairie, around 1915 — a plain white wooden " +
     "church and a fenced graveyard under an immense sky, several small low headstones among the " +
     "grass. The graves a farm family met and held the line past. Quiet and dignified, not bleak. " +
     "Aged photograph, pale grass and weathered-wood tones, soft grain."],

    ["7 — steinke-webster-peace-farm.jpg  (3:2 landscape · aged photograph)",
     "A homestead in the Webster district west of Sexsmith, in the Peace Country of northern Alberta, " +
     "around 1931 — the last farmable ground the prairies offered. A working farm of log buildings " +
     "and broken fields against spruce bush and a great northern sky, a father and his grown sons at " +
     "the work, teams and a few cattle. The clan pulled together again at the end of the road. Aged " +
     "photograph, cool earth-tones, big sky, grain."],
  ],
  footer:
    "Real family photos layer over these plates where we have them. Chapter map: the Russian-Poland " +
    "root (hero, 1) · the 1858 Ossowka marriage (2) · the Hamburg crossing (3) · the Emerson, " +
    "Manitoba homestead (4) · the Wetaskiwin settlement (5) · the prairie Lutheran ground at Teepee " +
    "Creek (6) · the Webster farm in the Peace (7).",
};

Promise.all([buildPromptDoc(RYCROFT), buildPromptDoc(STEINKE)])
  .then(() => console.log("Done."))
  .catch((e) => { console.error(e); process.exit(1); });
