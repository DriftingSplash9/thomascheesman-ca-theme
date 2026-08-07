#!/usr/bin/env python3
"""
wire-heritage-images.py  (one-time helper)

Copies the selected Grok period plates from Heritage research/Thomasito-photos
into the repo theme assets (assets/img/heritage/{line}/), records their
dimensions in _image-dims.json, and injects AI-tagged <figure> entries into the
{line}-images.json image-maps for Verboom, Rycroft, and Steinke. Existing real
photos are preserved (figures are appended, never replaced).

Run: python wire-heritage-images.py
"""
import json, os, shutil
from PIL import Image

REPO = os.path.dirname(os.path.abspath(__file__))
HR   = r"C:\Users\thoma\Desktop\Heritage research"
SRC  = os.path.join(HR, "Thomasito-photos")
DIMS = os.path.join(HR, "_image-dims.json")
TAG  = " *(AI-generated period illustration.)*"

# (line, source-substring, dest-filename, images.json key, float, alt, caption-without-tag)
W = [
 # ---- VERBOOM (8) ----
 ("verboom","kinderdijk","verboom-kinderdijk-waterland.jpg","The line behind the needle","right",
  "A row of Dutch windmills draining flat polder land along a canal",
  "Windmills draining the polders along a canal — the Dutch war on water the riverside Verbooms were born into."),
 ("verboom","ter-aar-barbershop","verboom-ter-aar-barbershop.jpg","The line behind the needle","left",
  "Interior of an early-twentieth-century Dutch village tailor and barber shop",
  "A village tailor-and-barber’s shop like the one on the Kerkweg in Ter Aar — the trade behind Suzanna’s needle."),
 ("verboom","sliedrecht-dredgers","verboom-sliedrecht-dredgers.jpg","The riverside Verbooms — Ter Aar back to Sliedrecht","right",
  "Labourers dredging a river and building a dike on the Dutch riverside, 1800s",
  "Sliedrecht rivermen sinking willow-and-stone mattresses and dredging the Merwede — the front line of the war with the water."),
 ("verboom","brugwachter","verboom-brugwachter-ter-aar.jpg","The riverside Verbooms — Ter Aar back to Sliedrecht","left",
  "A Dutch canal drawbridge with its bridge-keeper, around 1900",
  "A Dutch drawbridge and its keeper — the brugwachter’s trade Pieter Verboom worked at Ter Aar."),
 ("verboom","haarlemmermeer","verboom-haarlemmermeer-drained.jpg","Suzanna's mother — the Vriesmans and Hoflands of the northern polders","right",
  "The newly drained Haarlemmermeer polder with a steam pumping station, 1850s",
  "The Haarlemmermeer, a lake pumped dry in 1852 and thrown open to settlers — the new polder Leentje Vriesman’s people came south to farm."),
 ("verboom","petten-dijkwerker","verboom-petten-dijkwerker.jpg","Suzanna's mother — the Vriesmans and Hoflands of the northern polders","left",
  "Dike-workers reinforcing a North Sea sea-dike in the dunes, early 1800s",
  "Dike-workers reinforcing the North Sea sea-dike at Petten — the dijkwerker’s trade on Suzanna's mother’s side."),
 ("verboom","goeree-overflakkee","verboom-goeree-overflakkee-island.jpg","The island side — the Grevenstuks and Tiggelmans of Goeree-Overflakkee","right",
  "A flat Dutch delta island of dikes, fields and a fishing creek, 1800s",
  "The flat farming-and-fishing island of Goeree-Overflakkee — the delta world of the Grevenstuks and Tiggelmans."),
 ("verboom","the-needle-carried","verboom-the-needle-carried.jpg","Where the Verbooms meet the Lakemans","right",
  "A still life of tailor’s shears, needle, thimble and folded dark cloth",
  "Shears, needle, thimble and a fold of dark cloth — the tailor’s trade Suzanna carried out of Ter Aar and into the family."),

 # ---- STEINKE (4 new; keeps the 2 real WP photos in Ch3/Ch4) ----
 ("steinke","russian-poland-village","steinke-russian-poland-village.jpg","Prologue","right",
  "A German Lutheran farm village on the flat central-Polish plain, 1800s",
  "A German Lutheran farming village in central Poland under the Russian Empire — the world Michał Steinke was born into."),
 ("steinke","ossowka-wedding","steinke-ossowka-wedding.jpg","Chapter One","right",
  "Interior of a plain rural Lutheran chapel, winter, 1850s",
  "A plain village Lutheran chapel — the kind where Michał and Euphrosine married at Ossowka in 1858."),
 ("steinke","emerson-manitoba","steinke-emerson-manitoba-homestead.jpg","Chapter Two","right",
  "A sod-and-log homestead breaking new prairie ground in Manitoba, 1890s",
  "A first sod-and-log homestead on the southern Manitoba prairie — where Edward broke his first Canadian ground."),
 ("steinke","webster-peace-farm","steinke-webster-peace-farm.jpg","Chapter Three","left",
  "A log homestead against spruce bush under a northern prairie sky, 1930s",
  "A homestead in the Peace Country bush near Webster — the last farmable ground the family came to rest on."),

 # ---- RYCROFT (5 new; keeps the 3 real archival photos in Ch2/Ch4/Ch5) ----
 ("rycroft","honolulu-harbour","rycroft-honolulu-harbour.jpg","Prologue","right",
  "A Hawaiian Kingdom-era harbour with sailing ships, wharves and a green mountain ridge",
  "The Honolulu waterfront in the Kingdom of Hawai’i — the island world Robert Henry Rycroft reached after the Civil War."),
 ("rycroft","leeds-backstreet","rycroft-leeds-backstreet.jpg","Chapter One","right",
  "A soot-blackened back-to-back terrace street in Victorian industrial Leeds",
  "A back-to-back street in industrial Leeds — the Yorkshire mill city the Rycrofts left."),
 ("rycroft","puna-coffee","rycroft-puna-coffee-lava.jpg","Chapter Two","left",
  "A pioneer coffee plantation on dark volcanic soil in Hawaii, 1890s",
  "A coffee plantation cut from the lava-country of Puna on the Big Island — the frontier Robert Henry Sr. opened."),
 ("rycroft","town-of-rycroft","rycroft-town-of-rycroft.jpg","Chapter Three","right",
  "A small prairie town with a grain elevator and dirt main street, 1920s",
  "The prairie town of Rycroft, Alberta — the family name become a place on the map."),
 ("rycroft","the-hat-draw","rycroft-the-hat-draw.jpg","Chapter Three","left",
  "Four men at a lamplit table drawing folded paper slips from a hat, 1920",
  "Four pioneers drawing the new district’s name from a hat in 1920 — the slip said Rycroft."),
]

def find_src(sub):
    sub=sub.lower()
    hits=[f for f in os.listdir(SRC) if sub in f.lower()]
    if len(hits)!=1:
        raise SystemExit(f"source match for '{sub}' = {hits} (need exactly 1)")
    return os.path.join(SRC, hits[0])

dims=json.load(open(DIMS, encoding="utf-8"))
maps={}  # line -> (path, data)
def load_map(line):
    if line not in maps:
        p=os.path.join(HR, f"{line}s-images.json")
        maps[line]=(p, json.load(open(p, encoding="utf-8")))
    return maps[line][1]

copied=0
for line, sub, dest, key, flt, alt, cap in W:
    # 1. copy + rename into the theme asset folder
    folder=os.path.join(REPO, "assets","img","heritage", line)
    os.makedirs(folder, exist_ok=True)
    dst=os.path.join(folder, dest)
    shutil.copyfile(find_src(sub), dst)
    copied+=1
    # 2. dims
    with Image.open(dst) as im: w,h=im.size
    themepath=f"theme/assets/img/heritage/{line}/{dest}"
    dims[themepath]={"w":w,"h":h}
    # 3. inject figure into images.json (append; never duplicate; create key if missing)
    data=load_map(line)
    node=data.setdefault(key, {})
    figs=node.setdefault("figures", [])
    if not any(f.get("path")==themepath for f in figs):
        figs.append({"path":themepath,"alt":alt,"caption":cap+TAG,"float":flt})

json.dump(dims, open(DIMS,"w",encoding="utf-8"), ensure_ascii=False, indent=2)
for line,(p,data) in maps.items():
    json.dump(data, open(p,"w",encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"updated {os.path.basename(p)}")
print(f"copied {copied} images into assets/img/heritage/{{verboom,steinke,rycroft}}/")
