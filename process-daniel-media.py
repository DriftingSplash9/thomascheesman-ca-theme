"""Process the two new Daniel media folders:
  - photos  -> convert HEIC->JPG, optimize (<=1600px, q82) into assets/img/daniel/
  - videos  -> re-encode to web H.264 mp4 (<=1280px, faststart) into a staging
               folder for Thomas to upload to WP Media.
Filenames become clean slugs per the mapping below."""
import os, subprocess
from PIL import Image
import pillow_heif
pillow_heif.register_heif_opener()

DL = r"C:\Users\thoma\Downloads"
THEME_IMG = r"C:\Users\thoma\Desktop\tc-ventures-child-theme\assets\img\daniel"
VID_OUT = r"C:\Users\thoma\Desktop\Kids-Photo-Stories\daniel-videos-for-wp"
FFMPEG = os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\WinGet\Links\ffmpeg.exe")
os.makedirs(THEME_IMG, exist_ok=True)
os.makedirs(VID_OUT, exist_ok=True)

F11 = os.path.join(DL, "Photos-3-001 (11)")
F12 = os.path.join(DL, "Photos-3-001 (12)")

# (source_path, slug, kind)
PHOTOS = [
    (os.path.join(F11, "10153843742968708.jpg"), "held-by-big-sister"),
    (os.path.join(F11, "10153947862868708.jpg"), "first-birthday-charlie-brown"),
    (os.path.join(F11, "10154213379958708.jpg"), "daniel-little"),
    (os.path.join(F11, "10160534052093708.jpg"), "reading-together"),
    (os.path.join(F11, "10160551155358708.jpg"), "the-elegant-son"),
    (os.path.join(F11, "10161373421533708.jpg"), "bubble-party"),
    (os.path.join(F11, "10163567556153708.jpg"), "helping-with-chores"),
    (os.path.join(F11, "IMG_0578.HEIC"),         "daniel-and-allister"),
    (os.path.join(F11, "IMG_1499.JPG"),          "daniel-and-lucas"),
    (os.path.join(F11, "IMG_1927.HEIC"),         "terry-fator"),
    (os.path.join(F11, "IMG_2665.JPG"),          "off-to-school-2025"),
    (os.path.join(F11, "IMG_5481.HEIC"),         "daniel-and-poppy"),
    (os.path.join(F11, "IMG_8866.HEIC"),         "selfie-with-mom"),
]
VIDEOS = [
    (os.path.join(F11, "IMG_4049.MOV"),          "boxing-instructors-beatdown"),
    (os.path.join(F12, "10157349855823708.mp4"), "rocking-out-to-acdc"),
    (os.path.join(F12, "IMG_4117.MOV"),          "boxing-tooth-pick"),
    (os.path.join(F12, "IMG_6187.MOV"),          "elmo-video-1"),
    (os.path.join(F12, "IMG_6306.MOV"),          "elmo-video-2"),
    (os.path.join(F12, "IMG_7615.MOV"),          "the-ten-dollar-train"),
]

MAXPX = 1600
print("== PHOTOS ==")
for src, slug in PHOTOS:
    dst = os.path.join(THEME_IMG, slug + ".jpg")
    im = Image.open(src)
    im = im.convert("RGB")
    im.thumbnail((MAXPX, MAXPX))
    im.save(dst, "JPEG", quality=82, optimize=True)
    kb = os.path.getsize(dst) // 1024
    print(f"  {os.path.basename(src):30s} -> {slug}.jpg  ({im.width}x{im.height}, {kb}KB)")

print("== VIDEOS ==")
for src, slug in VIDEOS:
    dst = os.path.join(VID_OUT, slug + ".mp4")
    subprocess.run([FFMPEG, "-y", "-i", src,
        "-c:v", "libx264", "-profile:v", "high", "-crf", "24", "-preset", "slow",
        "-pix_fmt", "yuv420p",
        "-vf", "scale='min(1280,iw)':'min(1280,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2",
        "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", dst],
        capture_output=True)
    if os.path.exists(dst) and os.path.getsize(dst):
        mb = os.path.getsize(dst) / 1048576
        print(f"  {os.path.basename(src):24s} -> {slug}.mp4  ({mb:.1f}MB)")
    else:
        print(f"  FAILED: {os.path.basename(src)}")

print("\nphotos ->", THEME_IMG)
print("videos ->", VID_OUT)
