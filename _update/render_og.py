# -*- coding: utf-8 -*-
"""
render_og.py — Gambar ulang ../og.png (1200x630) dari ../data.js.
Pakai font open-source yang dibundel (_update/fonts), jadi jalan di Windows & Linux.
Jalankan:  python _update/render_og.py   (butuh: pip install pillow)
"""
import os, re, json
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
FDIR = os.path.join(HERE, "fonts")

raw = open(os.path.join(ROOT, "data.js"), encoding="utf-8").read()
DES = json.loads(raw[raw.index("{"): raw.rindex("}") + 1])
totals = [m["total"] for m in DES["meta"]]
N = len(totals)
peak_i = max(range(N), key=lambda i: totals[i])
uniq = len(DES["present"])

S = 2
W, H = 1200 * S, 630 * S
def font(name, size): return ImageFont.truetype(os.path.join(FDIR, name), size * S)
sans  = lambda s: font("PlusJakartaSans-Regular.ttf", s)
sansb = lambda s: font("PlusJakartaSans-ExtraBold.ttf", s)
mono  = lambda s: font("JetBrainsMono-Regular.ttf", s)
monob = lambda s: font("JetBrainsMono-Bold.ttf", s)

NAVY = (11, 31, 58); NAVY950 = (6, 18, 31); INK = (245, 247, 250); MUT = (138, 153, 173)
TEAL = (45, 212, 191); AMBER = (251, 191, 36); RED = (248, 113, 113); GRID = (18, 42, 74); SLATE = (95, 113, 134)

img = Image.new("RGB", (W, H), NAVY); d = ImageDraw.Draw(img)
M = 64 * S

def tracked(draw, xy, text, fnt, fill, track):
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=fnt, fill=fill); x += draw.textlength(ch, font=fnt) + track
    return x

# eyebrow
tracked(d, (M, 48 * S), "DAFTAR EFEK SYARIAH · IDX · 2016–" + DES["meta"][-1]["date"].split()[-1], monob(18), TEAL, 2 * S)
# title
d.text((M, 80 * S), "DES Dashboard", font=sansb(62), fill=INK)
tw = d.textlength("DES Dashboard", font=sansb(62))
d.text((M + tw + 18 * S, 108 * S), "by lotmetrik", font=monob(20), fill=MUT)
# sub
d.text((M, 158 * S), "Saham yang masuk & keluar daftar syariah OJK, tiap rilis.", font=sans(25), fill=MUT)

# ---- chart panel ----
cx0, cy0, cx1, cy1 = M, 214 * S, W - M, 522 * S
d.rounded_rectangle([cx0, cy0, cx1, cy1], radius=10 * S, fill=NAVY950, outline=(27, 58, 96), width=S)
px0, py0, px1, py1 = cx0 + 30 * S, cy0 + 34 * S, cx1 - 30 * S, cy1 - 30 * S
for gx in range(px0, px1, 40 * S): d.line([gx, py0, gx, py1], fill=GRID, width=1)
for gy in range(py0, py1, 34 * S): d.line([px0, gy, px1, gy], fill=GRID, width=1)
ymin, ymax = 280, max(720, peak_i and totals[peak_i] + 20)
X = lambda i: px0 + (px1 - px0) * (i / (N - 1))
Y = lambda v: py0 + (py1 - py0) * (1 - (v - ymin) / (ymax - ymin))
pts = [(X(i), Y(totals[i])) for i in range(N)]
poly = pts + [(pts[-1][0], py1), (pts[0][0], py1)]
fill_img = Image.new("RGBA", img.size, (0, 0, 0, 0)); fd = ImageDraw.Draw(fill_img)
fd.polygon(poly, fill=(45, 212, 191, 28)); img = Image.alpha_composite(img.convert("RGBA"), fill_img).convert("RGB"); d = ImageDraw.Draw(img)
for i in range(1, N):
    d.line([pts[i - 1], pts[i]], fill=(RED if i > peak_i else TEAL), width=3 * S)
d.text((px0 + 4 * S, py0 + 4 * S), "@lotmetrik", font=monob(15), fill=(45, 212, 191), anchor="la")
for i in range(N):
    r, col = 2.6 * S, TEAL
    if i == 0: col = INK
    if i == peak_i: r, col = 6 * S, AMBER
    if i == N - 1: r, col = 6 * S, RED
    d.ellipse([pts[i][0] - r, pts[i][1] - r, pts[i][0] + r, pts[i][1] + r], fill=col)
def lbl(i, col, dy): d.text((pts[i][0], pts[i][1] + dy), str(totals[i]), font=monob(30), fill=col, anchor="mm")
lbl(0, INK, -34 * S); lbl(peak_i, AMBER, -34 * S); lbl(N - 1, RED, 30 * S)

# ---- footer ----
fy = 558 * S
d.text((M, fy), "lot", font=sansb(30), fill=INK)
xw = M + d.textlength("lot", font=sansb(30))
d.text((xw, fy), "metrik", font=sansb(30), fill=TEAL); xw += d.textlength("metrik", font=sansb(30))
d.text((xw + 14 * S, fy + 6 * S), "Tiap lot, ada datanya.", font=mono(19), fill=SLATE)
stamp = "Sumber: OJK · des.lotmetrik.my.id"
sw = d.textlength(stamp, font=mono(19))
d.text((W - M - sw, fy + 6 * S), stamp, font=mono(19), fill=SLATE)

img = img.resize((1200, 630), Image.LANCZOS)
out = os.path.join(ROOT, "og.png")
img.save(out, "PNG")
print("og.png ditulis:", os.path.getsize(out), "bytes (Kini=%d Puncak=%d rilis=%d)" % (totals[-1], totals[peak_i], N))
