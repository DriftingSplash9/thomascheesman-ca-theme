"""
Build a per-kid "photo stories" xlsx with an embedded thumbnail of every
gallery photo, plus blank columns for Thomas to write a story per photo and
flag which to sprinkle into the page prose.

One sheet per kid -> three .xlsx files in C:\\Users\\thoma\\Desktop\\Kids-Photo-Stories\\.
"""
import os, re, io, sys
import requests
from PIL import Image
from openpyxl import Workbook
from openpyxl.drawing.image import Image as XLImage
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.utils import get_column_letter

BASE = "https://thomascheesman.ca"
THEME = r"C:\Users\thoma\Desktop\tc-ventures-child-theme"
OUT_DIR = r"C:\Users\thoma\Desktop\Kids-Photo-Stories"
THUMB_DIR = os.path.join(OUT_DIR, "_thumbs")
THUMB_MAX = 150  # px, longest edge

os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(THUMB_DIR, exist_ok=True)

KIDS = {
    "Patience": "inc/gallery-patience.php",
    "Daniel":   "inc/gallery-daniel.php",
    "Faith":    "inc/gallery-faith.php",
}

ENTRY_RE = re.compile(r"'url'\s*=>\s*'([^']+)'\s*,\s*'year'\s*=>\s*(\d+)")

def parse_gallery(path):
    with open(path, "r", encoding="utf-8") as fh:
        txt = fh.read()
    return [(m.group(1), int(m.group(2))) for m in ENTRY_RE.finditer(txt)]

def url_candidates(url):
    """Primary url first, then -scaled-stripped, then -e<digits>-stripped."""
    cands = [url]
    if "-scaled" in url:
        cands.append(url.replace("-scaled", ""))
    stripped = re.sub(r"-e\d+", "", url)
    if stripped != url:
        cands.append(stripped)
    seen, out = set(), []
    for c in cands:
        if c not in seen:
            seen.add(c); out.append(c)
    return out

import time
SESSION = requests.Session()

def fetch(url):
    # (connect, read) timeouts so a stalled socket can't hang the whole run.
    # Retry on transient throttling (429/5xx) with backoff; only a real 404
    # moves on to the next candidate URL.
    for cand in url_candidates(url):
        for attempt in range(4):
            try:
                r = SESSION.get(BASE + cand, timeout=(6, 20))
                if r.status_code == 200 and r.content:
                    return r.content
                if r.status_code == 404:
                    break  # genuinely absent — try next candidate stem
                time.sleep(0.6 * (attempt + 1))  # transient — back off + retry
            except Exception:
                time.sleep(0.6 * (attempt + 1))
    return None

def make_thumb(content, key):
    try:
        im = Image.open(io.BytesIO(content)).convert("RGB")
    except Exception:
        return None
    im.thumbnail((THUMB_MAX, THUMB_MAX))
    p = os.path.join(THUMB_DIR, key + ".png")
    im.save(p, "PNG")
    return p, im.size

# styling
HEAD_FILL = PatternFill("solid", fgColor="2E2A24")
HEAD_FONT = Font(name="Arial", bold=True, color="FFFFFF", size=11)
CELL_FONT = Font(name="Arial", size=10)
WRAP = Alignment(wrap_text=True, vertical="top")
CENTER = Alignment(horizontal="center", vertical="center")
thin = Side(style="thin", color="D9D2C5")
BORDER = Border(left=thin, right=thin, top=thin, bottom=thin)

HEADERS = ["Photo", "#", "Year", "File", "Story / what's happening here", "Sprinkle into the writing? (Y/N)"]
WIDTHS = [24, 5, 7, 30, 60, 18]

for kid, rel in KIDS.items():
    out = os.path.join(OUT_DIR, f"{kid.lower()}-photo-stories.xlsx")
    if os.path.exists(out):
        print(f"SKIP {kid} (already built: {out})", flush=True)
        continue
    entries = parse_gallery(os.path.join(THEME, rel))
    wb = Workbook()
    ws = wb.active
    ws.title = kid
    ws.sheet_view.showGridLines = False

    for c, (h, w) in enumerate(zip(HEADERS, WIDTHS), start=1):
        col = get_column_letter(c)
        ws.column_dimensions[col].width = w
        cell = ws.cell(row=1, column=c, value=h)
        cell.fill = HEAD_FILL; cell.font = HEAD_FONT
        cell.alignment = Alignment(wrap_text=True, vertical="center", horizontal="center")
        cell.border = BORDER
    ws.row_dimensions[1].height = 30
    ws.freeze_panes = "A2"

    ok = miss = 0
    for i, (url, year) in enumerate(entries, start=1):
        row = i + 1
        fname = url.rsplit("/", 1)[-1]
        ws.row_dimensions[row].height = 118
        # text cells
        ws.cell(row=row, column=2, value=i).alignment = CENTER
        ws.cell(row=row, column=3, value=year).alignment = CENTER
        fc = ws.cell(row=row, column=4, value=fname); fc.font = CELL_FONT; fc.alignment = WRAP
        for c in range(1, 7):
            ws.cell(row=row, column=c).border = BORDER
            if c in (5, 6):
                ws.cell(row=row, column=c).alignment = WRAP
        if fname.lower().endswith((".mp4", ".mov", ".webm", ".m4v")):
            vc = ws.cell(row=row, column=1, value="▶ Video")
            vc.font = Font(name="Arial", size=10, color="555555")
            vc.alignment = CENTER
            continue
        content = fetch(url)
        if content:
            res = make_thumb(content, f"{kid}_{i}")
            if res:
                p, (w, h) = res
                img = XLImage(p)
                # nudge inside the cell
                ws.add_image(img, f"A{row}")
                ok += 1
            else:
                ws.cell(row=row, column=1, value="(decode failed)").font = CELL_FONT
                miss += 1
        else:
            ws.cell(row=row, column=1, value="IMAGE NOT FOUND").font = Font(name="Arial", size=9, color="B00000")
            miss += 1
        if i % 25 == 0:
            print(f"  {kid}: {i}/{len(entries)} (ok {ok}, miss {miss})", flush=True)

    out = os.path.join(OUT_DIR, f"{kid.lower()}-photo-stories.xlsx")
    wb.save(out)
    print(f"SAVED {out}  ({ok} thumbs, {miss} missing)", flush=True)

print("DONE")
