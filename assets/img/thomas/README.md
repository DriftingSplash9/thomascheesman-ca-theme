# /assets/img/thomas — images for the Thomas long-read (page-thomas.php)

Optimized JPGs (max ~1600px, q82) referenced by `page-thomas.php`. The
committed set is generated from Thomas's source pool; the large unoptimized
originals are NOT committed. Credits for reused Wikimedia images are in
`IMAGE-CREDITS.md` (same folder).

## Inline figures (committed)

| File | Where | Source / credit |
|---|---|---|
| `thomas.jpg` | Hero | Thomas |
| `turner-valley-gas-plant.jpg` | CH2 | jasonwoodhead23, CC BY 2.0 |
| `tv-drilling.jpg` | CH2 | Provincial Archives of Alberta (no known restrictions) |
| `three-sisters.jpg` | CH2 | Jakub Fryš, CC BY-SA 4.0 |
| `dad-bike.jpg` | CH2 | Thomas (learning to ride, with Martin) |
| `candy-cane-farm.jpg` | CH3 | Thomas |
| `mustang.jpg` | Mustang fold | Thomas |
| `frac-pump.jpg` | CH4 | Joshua Doubek, CC BY-SA 3.0 |
| `sagd-conoco.jpg` | CH4 | jasonwoodhead23, CC BY 2.0 |
| `aunty-uncle.jpg` | CH4 | Thomas (Aunty Eleanor & Uncle George) |
| `keg-me.jpg` | CH4 | Thomas |
| `gprc.jpg` | CH6 | Rr parker, CC BY-SA 3.0 |
| `kids-robson.jpg` | CH6 gallery | Thomas (kids at Mount Robson) |
| `wedding.jpg` | CH6 | Thomas |
| `tara-and-i.jpg` | CH5 houseboat fold | Thomas |
| `acadia-to-edmonton.jpg` | CH7 fold | Thomas |
| `three-kids.jpg` | CH9 | Thomas |

## Gallery (committed) — `g-*.jpg`

`g-3yo`, `g-family-1999`, `g-grad`, `g-little-smokey`, `g-kittens`,
`g-kegashuk`, `g-shushwap`, `g-cousins`, `g-father`, `g-shadow`,
`g-dusty`, `g-mary`, `g-mom-kids`, `g-edmonton`, `g-me`.

## To add more

Drop a source image in, then optimize it to a slug name (the build used PIL:
`thumbnail(1600px)`, JPG q82, `contain` never `cover`). Add inline via
`tc_thomas_fig()` or append to the `$thomas_gallery` array in `page-thomas.php`.
