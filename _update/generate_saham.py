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
    runs = 0
    prev = "0"
    for ch in bits:
        if ch == "1" and prev == "0":
            runs += 1
        prev = ch
    enters = runs - (1 if bits[0] == "1" else 0)
    exits = 0
    for i in range(1, N):
        if bits[i] == "0" and bits[i - 1] == "1":
            exits += 1

    si = since_index(bits)
    since = short_label(meta[si]["date"])
    last = meta[-1]
    first_y = meta[0]["date"].split()[-1]
    last_y = last["date"].split()[-1]
    url = f"{SITE}/saham/{code.lower()}"
    dash = f"{SITE}/#t={code}"

    survivor = count == N
    newcomer = count == 1 and in_now
    one_hit = count == 1 and not in_now
    comeback = runs >= 2

    chips = []
    if survivor:
        chips.append(f'<span class="chip star">Setia {N}/{N}</span>')
    elif newcomer:
        chips.append('<span class="chip">Pendatang baru</span>')
    elif one_hit:
        chips.append('<span class="chip out">Sekali lewat</span>')
    elif comeback:
        chips.append(f'<span class="chip">Comeback {runs} babak</span>')
    chips_html = ("<div class=\"chips\">" + "".join(chips) + "</div>") if chips else ""

    dots = []
    on_periods = []
    for i in range(N):
        on = bits[i] == "1"
        lab = short_label(meta[i]["date"])
        ph = "P1" if "_P1" in meta[i]["key"] else "P2"
        tip = f"{lab} {ph}: {'ada' if on else 'tidak'}"
        dots.append(
            f'<span class="dot{" on" if on else ""}" title="{esc(tip)}"></span>'
        )
        if on:
            on_periods.append(f"{lab} {ph}")
    dots_html = "".join(dots)
    period_txt = ", ".join(on_periods) if on_periods else "tidak pernah masuk dalam rentang data"
    aria_dots = (
        f"{code} ada di daftar pada: {', '.join(on_periods)}"
        if on_periods
        else f"{code} tidak pernah ada di daftar dalam rentang data"
    )

    if in_now:
        verdict = "ADA"
        verdict_cls = "in"
        status_line = f"Di dalam sejak {esc(since)} · rilis terbaru {esc(short_label(last['date']))}"
        og_desc = (
            f"{code} ({name}) ADA di Daftar Efek Syariah OJK "
            f"per {last['date']}. Jejak {count}/{N} rilis · Lotmetrik."
        )
        caveat = ""
    else:
        verdict = "TIDAK ada"
        verdict_cls = "out"
        status_line = f"Di luar sejak {esc(since)} · rilis terbaru {esc(short_label(last['date']))}"
        og_desc = (
            f"{code} ({name}) TIDAK ada di Daftar Efek Syariah OJK "
            f"per {last['date']}. Jejak {count}/{N} rilis · Lotmetrik."
        )
        caveat = (
            '<p class="caveat"><b>Keluar DES bukan delisting</b> dan bukan berarti sahamnya jelek — '
            "hanya tidak lolos saringan syariah pada rilis itu.</p>"
        )

    share_text = (
        f"{code} ({name}) di Daftar Efek Syariah OJK: "
        f"{'ADA' if in_now else 'TIDAK ada'}, muncul {count}/{N} rilis. "
        f"Via @lotmetrik · edukasi, bukan rekomendasi."
    )
    title = f"Apakah {code} syariah? · DES OJK {last_y} · Lotmetrik"
    h1 = f"Apakah {esc(code)} masuk Daftar Efek Syariah?"
    vic = (
        "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.4' "
        "stroke-linecap='round' stroke-linejoin='round'><path d='M5 13l4 4L19 7'/></svg>"
        if in_now
        else "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.4' "
        "stroke-linecap='round'><path d='M6 6l12 12M18 6L6 18'/></svg>"
    )

    ld = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": title,
        "url": url,
        "description": og_desc,
        "isPartOf": {"@type": "WebSite", "name": "DES Dashboard", "url": SITE + "/"},
        "about": {"@type": "Corporation", "name": name, "tickerSymbol": code},
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
:root{{--navy:#0B1F3A;--teal:#0F9488;--teal-text:#0D7A70;--teal-soft:rgba(20,184,166,.12);
  --red:#DC2626;--red-text:#B91C1C;--red-soft:rgba(239,68,68,.10);
  --amber:#D97706;--amber-soft:rgba(245,158,11,.14);
  --off:#F5F7FA;--muted:#5F7186;--secondary:#44566B;--border:#D7DEE7;--border-strong:#B9C4D2;--white:#fff;--surface:#fff;--surface-2:#F5F7FA;
  --mono:'JetBrains Mono',ui-monospace,Menlo,Consolas,monospace;
  --sans:'Plus Jakarta Sans',ui-sans-serif,system-ui,sans-serif}}
[data-theme="terminal"]{{--off:#0B1F3A;--white:#122A4A;--surface:#122A4A;--surface-2:#0E2643;--navy:#F5F7FA;
  --muted:#8A99AD;--secondary:#B9C4D2;--border:#1B3A60;--border-strong:#284B76;
  --teal:#2DD4BF;--teal-text:#2DD4BF;--teal-soft:rgba(45,212,191,.14);
  --red:#F87171;--red-text:#F87171;--red-soft:rgba(248,113,113,.14);
  --amber:#FBBF24;--amber-soft:rgba(251,191,36,.16)}}
*{{box-sizing:border-box}}
body{{margin:0;font-family:var(--sans);background:var(--off);color:var(--navy);
  -webkit-font-smoothing:antialiased;line-height:1.5}}
a{{color:var(--teal);font-weight:600;text-decoration:none}}
a:hover{{text-decoration:underline}}
.wrap{{max-width:640px;margin:0 auto;padding:18px 16px 52px}}
.brand{{display:inline-flex;align-items:center;gap:10px;margin-bottom:22px;color:inherit;text-decoration:none}}
.brand:hover{{text-decoration:none}}
.brand-ic{{width:36px;height:36px;border-radius:8px;background:#0B1F3A;display:grid;place-items:center;flex:none;border:1px solid var(--border)}}
.brand-ic svg{{width:22px;height:22px}}
.wm{{display:block;font-weight:800;font-size:15px;letter-spacing:-.02em}}
.by{{display:block;font-size:11px;font-weight:600;color:var(--muted);letter-spacing:.04em;text-transform:lowercase}}
h1{{font-size:clamp(1.3rem,4vw,1.65rem);letter-spacing:-.03em;line-height:1.15;margin:0 0 8px;font-weight:800}}
.name{{font-size:14.5px;color:var(--muted);margin:0 0 16px}}
.verdict{{display:flex;gap:12px;align-items:center;padding:14px 14px;border-radius:12px;border:1px solid;
  margin-bottom:12px}}
.verdict.in{{background:var(--teal-soft);border-color:rgba(15,148,136,.35);color:var(--teal-text)}}
.verdict.out{{background:var(--red-soft);border-color:rgba(220,38,38,.28);color:var(--red-text)}}
.vic{{flex:none;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:var(--surface)}}
.vic svg{{width:20px;height:20px}}
.vbody{{flex:1;min-width:0}}
.vmain{{font-size:1.1rem;font-weight:800;letter-spacing:-.01em;line-height:1.18}}
.vmain .mono{{font-family:var(--mono)}}
.vsub{{font-size:12px;color:var(--secondary);margin-top:3px;line-height:1.4}}
.actions{{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 14px}}
.btn{{appearance:none;border:1px solid var(--border-strong);background:var(--surface);color:var(--navy);
  font:inherit;font-weight:700;font-size:13.5px;padding:10px 14px;border-radius:8px;cursor:pointer}}
.btn:hover{{border-color:var(--teal);color:var(--teal)}}
.btn-go{{background:var(--teal);border-color:var(--teal);color:#fff}}
.btn-go:hover{{filter:brightness(.95);color:#fff;text-decoration:none}}
[data-theme="terminal"] .btn-go{{color:#0B1F3A}}
.caveat{{font-size:13px;color:var(--secondary);background:var(--surface);border:1px solid var(--border);
  border-radius:10px;padding:11px 13px;margin:0 0 14px;line-height:1.45}}
.caveat b{{color:var(--navy)}}
.chips{{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 10px}}
.chip{{display:inline-flex;font-family:var(--mono);font-size:11px;font-weight:700;letter-spacing:.03em;
  padding:4px 9px;border-radius:999px;background:var(--teal-soft);color:var(--teal-text)}}
.chip.out{{background:var(--red-soft);color:var(--red-text)}}
.chip.star{{background:var(--amber-soft);color:var(--amber)}}
.dots{{display:flex;flex-wrap:wrap;gap:5px;margin:0 0 16px}}
.dot{{width:10px;height:10px;border-radius:3px;background:var(--border-strong)}}
.dot.on{{background:var(--teal)}}
.dot-cap{{font-size:11.5px;color:var(--muted);margin:-8px 0 16px}}
.stats{{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px}}
.stat{{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:12px}}
.stat .v{{font-family:var(--mono);font-weight:700;font-size:1.35rem;letter-spacing:-.02em;line-height:1}}
.stat .k{{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);font-weight:600;margin-top:5px}}
.box{{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px 16px;margin-bottom:16px}}
.box h2{{font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin:0 0 8px;font-weight:700}}
.box p{{margin:0;font-size:13.5px;color:var(--navy);line-height:1.45}}
.note{{font-size:12.5px;color:var(--muted);margin-top:8px;line-height:1.45}}
.foot{{margin-top:26px;padding-top:16px;border-top:1px solid var(--border);font-size:12.5px;color:var(--muted)}}
.foot-cta{{margin:0 0 10px;font-size:13px;color:var(--secondary)}}
.foot-cta a{{font-weight:700}}
@media(max-width:420px){{.actions .btn{{flex:1;text-align:center}}}}
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
    <span class="vic" aria-hidden="true">{vic}</span>
    <div class="vbody">
      <div class="vmain"><span class="mono">{esc(code)}</span> {esc(verdict)} di Daftar Efek Syariah</div>
      <div class="vsub">{status_line} · {esc(last["kep"])}</div>
    </div>
  </div>

  {caveat}
  {chips_html}

  <div class="dots" role="img" aria-label="{esc(aria_dots)}">{dots_html}</div>
  <p class="dot-cap">{N} rilis · titik hijau = ada di DES</p>

  <div class="stats" aria-label="Ringkasan jejak">
    <div class="stat"><div class="v">{count}<span style="font-size:.85rem;color:var(--muted)">/{N}</span></div><div class="k">Muncul</div></div>
    <div class="stat"><div class="v" style="color:var(--teal)">{enters}</div><div class="k">Kali masuk</div></div>
    <div class="stat"><div class="v" style="color:var(--red)">{exits}</div><div class="k">Kali keluar</div></div>
  </div>

  <div class="box">
    <h2>Periode hadir</h2>
    <p>{esc(period_txt)}.</p>
  </div>

  <div class="actions">
    <button type="button" class="btn" id="shareBtn" data-url="{url}" data-text="{esc(share_text)}">Bagikan</button>
    <a class="btn btn-go" href="{dash}">Jejak di dashboard</a>
  </div>

  <p class="note">Data historis tidak menjamin status berikutnya. Selalu verifikasi ke
  <a href="https://ojk.go.id/id/kanal/syariah/data-dan-statistik/daftar-efek-syariah/" rel="noopener" target="_blank">sumber resmi OJK</a>
  · <a href="/#panduan">Panduan</a> · ikuti <a href="https://t.me/lotmetrik" rel="noopener" target="_blank">@lotmetrik</a>.</p>

  <div class="foot">
    <p class="foot-cta">Alat gratis Lotmetrik · kabar rilis DES di <a href="https://t.me/lotmetrik" rel="noopener" target="_blank">Telegram @lotmetrik</a></p>
    © {esc(last_y)} <a href="https://lotmetrik.my.id/" rel="noopener" target="_blank">Lotmetrik</a>
    · Data DES OJK {esc(first_y)}–{esc(last_y)} ({N} rilis)
    · Edukasi, bukan rekomendasi
  </div>
</div>
<script src="/share.js" defer></script>
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
