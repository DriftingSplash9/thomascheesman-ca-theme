#!/usr/bin/env python3
"""
Back Quarter PWA icon generator.

Draws the orange buggy on the dry-olive prairie in the game's palette —
sky, rolling field, a dirt track and the roll-caged buggy — then writes
the PWA icon set. Supersampled 4x and downsampled (LANCZOS) for clean
edges. Re-run after a palette change:  python assets/pwa/make-icons.py

Outputs (assets/pwa/):
  icon-192.png            192  purpose "any"
  icon-512.png            512  purpose "any"
  icon-maskable-512.png   512  purpose "maskable" (art in the inner safe zone)
  apple-touch-icon.png    180  iOS home screen
"""
import os
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
SS = 4  # supersample

# palette — straight off the game world
SKY_TOP   = (150, 194, 226)
SKY_HORIZ = (206, 214, 196)
FIELD     = (116, 128, 63)
FIELD_LO  = (92, 104, 50)
DIRT      = (169, 120, 74)
DIRT_DK   = (140, 96, 58)
SUN       = (255, 220, 150)
ORANGE    = (203, 86, 44)
ORANGE_DK = (168, 66, 32)
CREAM     = (224, 221, 208)
TIRE      = (26, 22, 20)
RIM       = (150, 150, 150)
CAGE      = (40, 34, 30)
GLASS     = (255, 200, 110)


def rounded(draw, box, r, fill):
    draw.rounded_rectangle(box, radius=r, fill=fill)


def draw_scene(size, margin):
    """size px, art inset by `margin` fraction (maskable safe zone)."""
    S = size * SS
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # full-bleed rounded background so masking never clips to emptiness
    corner = int(S * 0.20)
    # sky gradient
    horizon = int(S * 0.56)
    for y in range(0, horizon):
        t = y / horizon
        c = tuple(int(SKY_TOP[i] + (SKY_HORIZ[i] - SKY_TOP[i]) * t) for i in range(3))
        d.line([(0, y), (S, y)], fill=c)
    # field
    d.rectangle([0, horizon, S, S], fill=FIELD)
    # a rolling hill line + darker lower field
    d.pieslice([int(-S*0.3), int(S*0.34), int(S*0.7), int(S*0.9)], 180, 360, fill=FIELD_LO)
    d.pieslice([int(S*0.5), int(S*0.4), int(S*1.35), int(S*1.0)], 180, 360, fill=FIELD)

    # sun, upper right (kept off the extreme corner for maskable)
    sr = int(S * 0.10)
    d.ellipse([int(S*0.70), int(S*0.14), int(S*0.70)+2*sr, int(S*0.14)+2*sr], fill=SUN)

    # dirt track sweeping across the foreground
    d.polygon([(0, int(S*0.86)), (S, int(S*0.72)), (S, int(S*0.90)), (0, S)], fill=DIRT)
    d.polygon([(0, int(S*0.93)), (S, int(S*0.82)), (S, int(S*0.90)), (0, S)], fill=DIRT_DK)

    # ---- the buggy, centred in the safe zone ----
    cx = S * 0.50
    cy = S * 0.60
    u = S * (0.34 - margin)           # unit scale, shrinks for maskable margin
    bw = u * 2.0
    bh = u * 0.72

    # shadow
    d.ellipse([cx - bw*0.6, cy + bh*0.75, cx + bw*0.6, cy + bh*1.15],
              fill=(30, 34, 20, 120))

    # wheels
    wr = u * 0.5
    for wx in (cx - bw*0.42, cx + bw*0.42):
        d.ellipse([wx - wr, cy + bh*0.2 - wr, wx + wr, cy + bh*0.2 + wr], fill=TIRE)
        d.ellipse([wx - wr*0.42, cy + bh*0.2 - wr*0.42,
                   wx + wr*0.42, cy + bh*0.2 + wr*0.42], fill=RIM)

    # body
    rounded(d, [cx - bw*0.5, cy - bh*0.35, cx + bw*0.5, cy + bh*0.4],
            int(u*0.28), ORANGE)
    # lower shade
    rounded(d, [cx - bw*0.5, cy + bh*0.05, cx + bw*0.5, cy + bh*0.4],
            int(u*0.22), ORANGE_DK)
    # cream stripe
    d.rectangle([cx - bw*0.5, cy - bh*0.02, cx + bw*0.5, cy + bh*0.08], fill=CREAM)

    # roll cage (two arcs + top bar)
    cw = int(u * 0.14)
    d.arc([cx - bw*0.34, cy - bh*1.05, cx - bw*0.02, cy - bh*0.1],
          200, 340, fill=CAGE, width=cw)
    d.arc([cx + bw*0.02, cy - bh*1.05, cx + bw*0.34, cy - bh*0.1],
          200, 340, fill=CAGE, width=cw)
    d.line([(cx - bw*0.18, cy - bh*0.95), (cx + bw*0.18, cy - bh*0.95)],
           fill=CAGE, width=cw)

    # headlight
    d.ellipse([cx + bw*0.4, cy - bh*0.12, cx + bw*0.52, cy + bh*0.06], fill=GLASS)

    # mask everything to the rounded square
    mask = Image.new("L", (S, S), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, S, S], radius=corner, fill=255)
    img.putalpha(mask)

    return img.resize((size, size), Image.LANCZOS)


def flatten(img, bg=(150, 194, 226)):
    """iOS wants an opaque square (it rounds corners itself)."""
    out = Image.new("RGB", img.size, bg)
    out.paste(img, (0, 0), img)
    return out


def main():
    # standard "any" icons — art fills the tile
    for sz in (192, 512):
        draw_scene(sz, margin=0.0).save(os.path.join(HERE, f"icon-{sz}.png"))
    # maskable — pull the art into the inner 80% safe zone
    draw_scene(512, margin=0.06).save(os.path.join(HERE, "icon-maskable-512.png"))
    # apple touch icon — opaque, iOS masks it
    flatten(draw_scene(180, margin=0.0)).save(os.path.join(HERE, "apple-touch-icon.png"))
    print("wrote icon-192, icon-512, icon-maskable-512, apple-touch-icon to", HERE)


if __name__ == "__main__":
    main()
