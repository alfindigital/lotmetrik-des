# -*- coding: utf-8 -*-
"""
generate_saham.py — Buat halaman SEO /saham/KODE.html dari data.js + sitemap.xml.

Setiap saham unik dapat 1 halaman statis (jawab "apakah KODE syariah?" untuk Google).
Dipanggil otomatis dari build_data.py / update.bat / GitHub Action.

Jalankan:  python _update/generate_saham.py
"""
from __future__ import annotations

import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DATA_JS = os.path.join(ROOT, "data.js")
SAHAM_DIR = os.path.join(ROOT, "saham")
SITEMAP = os.path.join(ROOT, "sitemap.xml")
SITE = "https://des.lotmetrik.my.id"


def die(msg: str) -> None:
    print("\n[GAGAL] " + msg)
    sys.exit(1)


def esc(s: str) -> str:
    return (
        str(s)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def load_des() -> dict:
    if not os.path.exists(DATA_JS):
        die(f"data.js tidak ada di {DATA_JS}")
    raw = open(DATA_JS, encoding="utf-8").read()
    try:
        return json.loads(raw[raw.index("{") : raw.rindex("}") + 1])
    except Exception as e:
        die(f"data.js tidak bisa dibaca: {e}")


def short_label(date: str) -> str:
    # "1 Jun 2026" -> "Jun 2026"
    p = date.split()
    return f"{p[1]} {p[2]}" if len(p) >= 3 else date


def since_index(bits: str) -> int:
    """Indeks rilis pertama status terkini (blok akhir yang sama)."""
    cur = bits[-1]
    i = len(bits) - 1
    while i > 0 and bits[i - 1] == cur:
        i -= 1
    return i


def page_html(code: str, name: str, bits: str, meta: list) -> str:
    N = len(meta)
    in_now = bits[-1] == "1"
    count = bits.count("1")
    enters = exits = 0
    for i in range(1, N):
        if bits[i] == "1" and bits[i - 1] == "0":
            enters += 1
        if bits[i] == "0" and bits[i - 1] == "1":
            exits += 1
    if bits[0] == "1":
        # babak pertama tidak dihitung "masuk" di dashboard (enters = runs - 1 if started in)
        runs = 0
        prev = "0"
        for ch in bits:
            if ch == "1" and prev == "0":
                runs += 1
            prev = ch
        enters = runs - 1

    si = since_index(bits)
    since = short_label(meta[si]["date"])
    last = meta[-1]
    first_y = meta[0]["date"].split()[-1]
    last_y = last["date"].split()[-1]
    url = f"{SITE}/saham/{code.lower()}"
    dash = f"{SITE}/#t={code}"

    if in_now:
        verdict = "ADA"
        verdict_cls = "in"
        lead = f"<b>{esc(code)}</b> saat ini <b>ADA</b> di Daftar Efek Syariah OJK."
        status_line = f"Di dalam sejak {esc(since)} · rilis terbaru {esc(short_label(last['date']))}"
        og_desc = (
            f"{code} ({name}) ADA di Daftar Efek Syariah OJK "
            f"per {last['date']}. Jejak {count}/{N} rilis · Lotmetrik."
        )
    else:
        verdict = "TIDAK ada"
        verdict_cls = "out"
        lead = f"<b>{esc(code)}</b> saat ini <b>TIDAK ada</b> di Daftar Efek Syariah OJK."
        status_line = f"Di luar sejak {esc(since)} · rilis terbaru {esc(short_label(last['date']))}"
        og_desc = (
            f"{code} ({name}) TIDAK ada di Daftar Efek Syariah OJK "
            f"per {last['date']}. Jejak {count}/{N} rilis · Lotmetrik."
        )

    title = f"Apakah {code} syariah? · DES OJK {last_y} · Lotmetrik"
    h1 = f"Apakah {esc(code)} masuk Daftar Efek Syariah?"

    # ringkas titik timeline (teks, untuk crawler)
    on_periods = [
        short_label(meta[i]["date"]) for i in range(N) if bits[i] == "1"
    ]
    period_txt = ", ".join(on_periods) if on_periods else "tidak pernah masuk dalam rentang data"

    ld = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": title,
        "url": url,
        "description": og_desc,
        "isPartOf": {"@type": "WebSite", "name": "DES Dashboard", "url": SITE + "/"},
        "about": {
            "@type": "Corporation",
            "name": name,
            "tickerSymbol": code,
        },
        "dateModified": last["date"],
    }

    return f"""<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{esc(title)}</title>
<meta name="description" content="{esc(og_desc)}">
<meta name="theme-color" content="#0B1F3A">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Lotmetrik">
<meta property="og:url" content="{url}">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(og_desc)}">
<meta property="og:image" content="{SITE}/og.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{esc(title)}">
<meta name="twitter:description" content="{esc(og_desc)}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@600;700&display=swap">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
<style>
:root{{--navy:#0B1F3A;--teal:#0F9488;--teal-soft:rgba(15,148,136,.12);--red:#DC2626;--red-soft:rgba(220,38,38,.10);
  --off:#F5F7FA;--muted:#5F7186;--border:#D7DEE7;--white:#fff}}
*{{box-sizing:border-box}}
body{{margin:0;font-family:'Plus Jakarta Sans',system-ui,sans-serif;background:var(--off);color:var(--navy);
  -webkit-font-smoothing:antialiased;line-height:1.5}}
a{{color:var(--teal);font-weight:600;text-decoration:none}}
a:hover{{text-decoration:underline}}
.wrap{{max-width:640px;margin:0 auto;padding:20px 18px 48px}}
.brand{{display:inline-flex;align-items:center;gap:10px;margin-bottom:28px;color:inherit;text-decoration:none}}
.brand:hover{{text-decoration:none}}
.brand-ic{{width:36px;height:36px;border-radius:8px;background:var(--navy);display:grid;place-items:center;flex:none}}
.brand-ic svg{{width:22px;height:22px}}
.wm{{display:block;font-weight:800;font-size:15px;letter-spacing:-.02em}}
.by{{display:block;font-size:11px;font-weight:600;color:var(--muted);letter-spacing:.04em;text-transform:lowercase}}
h1{{font-size:clamp(1.35rem,4vw,1.75rem);letter-spacing:-.03em;line-height:1.15;margin:0 0 18px}}
.verdict{{display:flex;gap:14px;align-items:flex-start;padding:16px 16px;border-radius:12px;border:1px solid var(--border);
  background:var(--white);margin-bottom:18px}}
.verdict.in{{background:var(--teal-soft);border-color:rgba(15,148,136,.35)}}
.verdict.out{{background:var(--red-soft);border-color:rgba(220,38,38,.28)}}
.vic{{flex:none;width:40px;height:40px;border-radius:10px;display:grid;place-items:center;color:#fff}}
.verdict.in .vic{{background:var(--teal)}}
.verdict.out .vic{{background:var(--red)}}
.vic svg{{width:22px;height:22px}}
.vmain{{font-size:1.15rem;font-weight:800;letter-spacing:-.02em}}
.vmain .mono{{font-family:'JetBrains Mono',monospace}}
.vsub{{font-size:13.5px;color:var(--muted);margin-top:4px}}
.name{{font-size:15px;color:var(--muted);margin:0 0 20px}}
.stats{{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:22px}}
.stat{{background:var(--white);border:1px solid var(--border);border-radius:10px;padding:12px}}
.stat .v{{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:1.35rem;letter-spacing:-.02em}}
.stat .k{{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);font-weight:600;margin-top:4px}}
.box{{background:var(--white);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:18px}}
.box h2{{font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin:0 0 8px}}
.box p{{margin:0;font-size:14px;color:var(--navy)}}
.cta{{display:inline-block;background:var(--teal);color:#fff!important;font-weight:700;padding:12px 18px;
  border-radius:8px;text-decoration:none!important;margin-top:4px}}
.cta:hover{{filter:brightness(.95);text-decoration:none!important}}
.note{{font-size:12.5px;color:var(--muted);margin-top:22px;line-height:1.45}}
.foot{{margin-top:28px;padding-top:16px;border-top:1px solid var(--border);font-size:12.5px;color:var(--muted)}}
@media(max-width:420px){{.stats{{grid-template-columns:1fr 1fr 1fr}}}}
</style>
</head>
<body>
<div class="wrap">
  <a class="brand" href="/">
    <span class="brand-ic" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="10.6" cy="12" r="8" fill="#2DD4BF"/>
        <circle cx="14.7" cy="9.3" r="7" fill="#0B1F3A"/>
        <path d="M16.9 11.6L17.6 13.5L19.5 14.2L17.6 14.9L16.9 16.8L16.2 14.9L14.3 14.2L16.2 13.5Z" fill="#F59E0B"/>
      </svg>
    </span>
    <span><span class="wm">DES Dashboard</span><span class="by">by lotmetrik</span></span>
  </a>

  <h1>{h1}</h1>
  <p class="name">{esc(name)}</p>

  <div class="verdict {verdict_cls}">
    <span class="vic" aria-hidden="true">{"<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'><path d='M5 13l4 4L19 7'/></svg>" if in_now else "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.4' stroke-linecap='round'><path d='M6 6l12 12M18 6L6 18'/></svg>"}</span>
    <div>
      <div class="vmain"><span class="mono">{esc(code)}</span> {esc(verdict)} di Daftar Efek Syariah</div>
      <div class="vsub">{esc(status_line)}</div>
    </div>
  </div>

  <p>{lead} Sumber: OJK ({esc(last["kep"])}).</p>

  <div class="stats" aria-label="Ringkasan jejak">
    <div class="stat"><div class="v">{count}<span style="font-size:.85rem;color:var(--muted)">/{N}</span></div><div class="k">Muncul</div></div>
    <div class="stat"><div class="v" style="color:var(--teal)">{enters}</div><div class="k">Kali masuk</div></div>
    <div class="stat"><div class="v" style="color:var(--red)">{exits}</div><div class="k">Kali keluar</div></div>
  </div>

  <div class="box">
    <h2>Periode hadir</h2>
    <p>{esc(period_txt)}.</p>
  </div>

  <a class="cta" href="{dash}">Lihat jejak lengkap di dashboard</a>

  <p class="note">Keluar DES bukan delisting dan bukan penilaian jelek — artinya tidak lolos saringan syariah pada rilis itu.
  Data historis tidak menjamin status berikutnya. Selalu verifikasi ke <a href="https://ojk.go.id/id/kanal/syariah/data-dan-statistik/daftar-efek-syariah/" rel="noopener" target="_blank">sumber resmi OJK</a>.</p>

  <div class="foot">
    © {esc(last_y)} <a href="https://lotmetrik.my.id/" rel="noopener" target="_blank">Lotmetrik</a>
    · Data DES OJK {esc(first_y)}–{esc(last_y)} ({N} rilis)
    · Edukasi, bukan rekomendasi
    · <a href="/#panduan">Panduan</a>
  </div>
</div>
</body>
</html>
"""


def write_sitemap(codes: list[str]) -> None:
    urls = [f"  <url>\n    <loc>{SITE}/</loc>\n    <changefreq>monthly</changefreq>\n    <priority>1.0</priority>\n  </url>"]
    for c in codes:
        urls.append(
            f"  <url>\n    <loc>{SITE}/saham/{c.lower()}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>"
        )
    body = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(urls)
        + "\n</urlset>\n"
    )
    open(SITEMAP, "w", encoding="utf-8", newline="\n").write(body)


def main() -> None:
    des = load_des()
    meta = des["meta"]
    names = des.get("names") or {}
    present = des["present"]
    codes = sorted(present.keys())
    if not codes:
        die("data.js tidak punya saham.")

    os.makedirs(SAHAM_DIR, exist_ok=True)
    # Hapus file lama (jangan rmtree folder — di Windows sering PermissionError / case-fold).
    for old in os.listdir(SAHAM_DIR):
        if old.lower().endswith(".html"):
            try:
                os.remove(os.path.join(SAHAM_DIR, old))
            except OSError as e:
                print(f"[WARN] gagal hapus {old}: {e}")

    for code in codes:
        bits = present[code]
        if len(bits) != len(meta):
            die(f"Panjang bitstring {code} ({len(bits)}) ≠ jumlah rilis ({len(meta)})")
        name = names.get(code) or code
        html = page_html(code, name, bits, meta)
        path = os.path.join(SAHAM_DIR, f"{code.lower()}.html")
        open(path, "w", encoding="utf-8", newline="\n").write(html)

    write_sitemap(codes)
    print(f"[OK] {len(codes)} halaman di saham/ + sitemap.xml ({len(codes) + 1} URL)")


if __name__ == "__main__":
    main()
