"""Build daniel-new-media.xlsx — a describe-me sheet for the two fresh
Daniel media folders. Embeds a thumbnail per file (video rows get a poster
frame via ffmpeg), pulls an EXIF/metadata date where possible, and leaves
Story + Sprinkle columns blank for Thomas. Photos AND videos both included."""
import os, io, subprocess, sys
from PIL import Image, ExifTags
import pillow_heif
from openpyxl import Workbook
from openpyxl.drawing.image import Image as XLImage
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side

pillow_heif.register_heif_opener()

DL = r"C:\Users\thoma\Downloads"
FOLDERS = ["Photos-3-001 (11)", "Photos-3-001 (12)"]
OUT = r"C:\Users\thoma\Desktop\Kids-Photo-Stories\daniel-new-media.xlsx"
THUMBS = r"C:\Users\thoma\Desktop\Kids-Photo-Stories\_thumbs_daniel_new"
FFMPEG = os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\WinGet\Links\ffmpeg.exe")
FFPROBE = os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\WinGet\Links\ffprobe.exe")
os.makedirs(THUMBS, exist_ok=True)

IMG_EXT = {".jpg", ".jpeg", ".png", ".heic", ".gif"}
VID_EXT = {".mp4", ".mov", ".m4v"}
THUMB_MAX = 260

NAVY, NAVY2, GOLD, CREAM, WHITE, INK = "1F3B5C", "2E4F73", "E8C766", "FBF3E0", "FFFFFF", "20303F"
FONT = "Arial"

def exif_date(path):
    try:
        im = Image.open(path)
        ex = im.getexif()
        for tag, val in ex.items():
            if ExifTags.TAGS.get(tag) == "DateTimeOriginal" and val:
                return str(val).split(" ")[0].replace(":", "-")
        for tag, val in ex.items():
            if ExifTags.TAGS.get(tag) == "DateTime" and val:
                return str(val).split(" ")[0].replace(":", "-")
    except Exception:
        pass
    return ""

def vid_meta(path):
    """(date, duration_str) from ffprobe."""
    date, dur = "", ""
    try:
        out = subprocess.run([FFPROBE, "-v", "error", "-show_entries",
            "format=duration:format_tags=creation_time", "-of", "default=nw=1", path],
            capture_output=True, text=True, timeout=30).stdout
        for line in out.splitlines():
            if line.startswith("duration="):
                try: dur = f"{float(line.split('=')[1]):.0f}s"
                except Exception: pass
            if line.startswith("TAG:creation_time=") or line.startswith("creation_time="):
                date = line.split("=", 1)[1][:10]
    except Exception:
        pass
    return date, dur

def make_thumb(path, ext, idx):
    """Return path to a JPG thumbnail (<=THUMB_MAX px) or None."""
    tp = os.path.join(THUMBS, f"thumb_{idx:03d}.jpg")
    try:
        if ext in VID_EXT:
            # grab a frame ~0.5s in; fall back to first frame
            r = subprocess.run([FFMPEG, "-y", "-ss", "0.5", "-i", path,
                "-frames:v", "1", "-vf", f"scale='min({THUMB_MAX},iw)':-2", tp],
                capture_output=True, timeout=60)
            if not os.path.exists(tp) or os.path.getsize(tp) == 0:
                subprocess.run([FFMPEG, "-y", "-i", path, "-frames:v", "1",
                    "-vf", f"scale='min({THUMB_MAX},iw)':-2", tp],
                    capture_output=True, timeout=60)
            return tp if os.path.exists(tp) and os.path.getsize(tp) else None
        else:
            im = Image.open(path)
            if im.mode in ("RGBA", "P", "LA"):
                im = im.convert("RGB")
            im.thumbnail((THUMB_MAX, THUMB_MAX))
            im.save(tp, "JPEG", quality=85)
            return tp
    except Exception as e:
        print("  thumb fail:", os.path.basename(path), e)
        return None

# gather files
items = []
for folder in FOLDERS:
    fdir = os.path.join(DL, folder)
    for name in sorted(os.listdir(fdir)):
        ext = os.path.splitext(name)[1].lower()
        if ext in IMG_EXT or ext in VID_EXT:
            items.append((folder, name, os.path.join(fdir, name), ext))

wb = Workbook(); ws = wb.active
ws.title = "Daniel — new media"
ws.sheet_view.showGridLines = False
thin = Side(style="thin", color="D9C9A3")
border = Border(left=thin, right=thin, top=thin, bottom=thin)

widths = {"A": 40, "B": 5, "C": 16, "D": 26, "E": 16, "F": 13, "G": 50, "H": 14}
for c, w in widths.items():
    ws.column_dimensions[c].width = w

ws.merge_cells("A1:H1")
t = ws["A1"]; t.value = "Daniel — new photos & videos to describe"
t.font = Font(name=FONT, size=16, bold=True, color=WHITE)
t.fill = PatternFill("solid", fgColor=NAVY)
t.alignment = Alignment(horizontal="left", vertical="center", indent=1)
ws.row_dimensions[1].height = 32

ws.merge_cells("A2:H2")
s = ws["A2"]
s.value = ("Write what's happening in 'Story', mark 'Y' under Sprinkle for the ones to feature. "
           "Video rows show a poster frame. All of these will go on Daniel's page.")
s.font = Font(name=FONT, size=10, italic=True, color=INK)
s.fill = PatternFill("solid", fgColor=GOLD)
s.alignment = Alignment(horizontal="left", vertical="center", indent=1)
ws.row_dimensions[2].height = 22

hdr = ["Thumbnail", "#", "Folder", "File", "Type", "Date (guess)",
       "Story / what's happening here", "Sprinkle? (Y/N)"]
for i, label in enumerate(hdr, start=1):
    c = ws.cell(row=3, column=i, value=label)
    c.font = Font(name=FONT, size=11, bold=True, color=WHITE)
    c.fill = PatternFill("solid", fgColor=NAVY)
    c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    c.border = border
ws.row_dimensions[3].height = 24
ws.freeze_panes = "A4"

row = 4
for idx, (folder, name, path, ext) in enumerate(items, start=1):
    is_vid = ext in VID_EXT
    if is_vid:
        date, dur = vid_meta(path)
        typ = f"Video {dur}".strip()
    else:
        date, typ = exif_date(path), "Photo"
    fill = CREAM if idx % 2 else WHITE

    ws.cell(row=row, column=2, value=idx).alignment = Alignment(horizontal="center", vertical="center")
    ws.cell(row=row, column=3, value=folder.replace("Photos-3-001 ", "")).alignment = Alignment(horizontal="center", vertical="center")
    ws.cell(row=row, column=4, value=name).alignment = Alignment(horizontal="left", vertical="center", wrap_text=True, indent=1)
    tc = ws.cell(row=row, column=5, value=typ)
    tc.alignment = Alignment(horizontal="center", vertical="center")
    tc.font = Font(name=FONT, size=10, bold=is_vid, color=("9A3412" if is_vid else INK))
    ws.cell(row=row, column=6, value=date).alignment = Alignment(horizontal="center", vertical="center")
    ws.cell(row=row, column=7, value="").alignment = Alignment(horizontal="left", vertical="center", wrap_text=True, indent=1)
    ws.cell(row=row, column=8, value="").alignment = Alignment(horizontal="center", vertical="center")

    for col in range(2, 9):
        cell = ws.cell(row=row, column=col)
        cell.fill = PatternFill("solid", fgColor=fill)
        cell.border = border
        if col != 5:
            cell.font = cell.font.copy(name=FONT, size=10)

    tp = make_thumb(path, ext, idx)
    ws.row_dimensions[row].height = 205  # ~260px + padding
    a = ws.cell(row=row, column=1); a.fill = PatternFill("solid", fgColor=fill); a.border = border
    if tp:
        xim = XLImage(tp)
        xim.anchor = f"A{row}"
        ws.add_image(xim)
    else:
        a.value = "(no preview)"
        a.alignment = Alignment(horizontal="center", vertical="center")
    row += 1

wb.save(OUT)
print(f"saved: {OUT}")
print(f"rows: {len(items)} ({sum(1 for i in items if i[3] in VID_EXT)} video, {sum(1 for i in items if i[3] in IMG_EXT)} photo)")
