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

    survivor = count == N
    newcomer = count == 1 and in_now
    one_hit = count == 1 and not in_now
    comeback = runs >= 2

    chips = []
    if survivor:
        chips.append('<span class="chip star">Setia</span>')
    elif newcomer:
        chips.append('<span class="chip">Pendatang baru</span>')
    elif one_hit:
        chips.append('<span class="chip out">1 Time</span>')
    elif comeback:
        chips.append(f'<span class="chip">Comeback {runs} babak</span>')
    chips_html = ('<div class="chips">' + "".join(chips) + "</div>") if chips else ""

    dots = []
    on_periods = []
    for i in range(N):
        on = bits[i] == "1"
        lab = short_label(meta[i]["date"])
        tip = f"{lab}: {'ada' if on else 'tidak'}"
        dots.append(
            f'<span class="dot{" on" if on else ""}" title="{esc(tip)}"></span>'
        )
        if on:
            on_periods.append(lab)
    dots_html = "".join(dots)
    aria_dots = (
        f"{code} ada di daftar pada: {', '.join(on_periods)}"
        if on_periods
        else f"{code} tidak pernah ada di daftar dalam rentang data"
    )

    if in_now:
        verdict = "SYARIAH"
        verdict_cls = "in"
        status_line = f"Di daftar sejak {esc(since)}"
        status_word = "syariah"
        og_desc = (
            f"{code} ({name}) SYARIAH di Daftar Efek Syariah OJK. Cek jejak di Lotmetrik."
        )
    else:
        verdict = "TIDAK SYARIAH"
        verdict_cls = "out"
        status_line = f"Di luar daftar sejak {esc(since)}"
        status_word = "tidak syariah"
        og_desc = (
            f"{code} ({name}) TIDAK SYARIAH di Daftar Efek Syariah OJK. Cek jejak di Lotmetrik."
        )

    first_period = short_label(meta[0]["date"])
    last_period = short_label(meta[-1]["date"])
    if count == 0:
        seo_blurb = (
            f"{code} ({name}) belum pernah tercatat dalam Daftar Efek Syariah (DES) OJK "
            f"pada rentang data dari {first_period} hingga {last_period}. "
            f"Riwayat kehadiran di daftar ini membantu melihat status syariah emiten "
            f"di pasar modal Indonesia. Status terkini: {status_word}."
        )
    else:
        first_on = on_periods[0]
        last_on = on_periods[-1]
        seo_blurb = (
            f"{code} ({name}) tercatat dalam Daftar Efek Syariah (DES) OJK pada "
            f"{count} periode hadir dari {first_on} hingga {last_on}. "
            f"Riwayat kehadiran ini membantu melihat konsistensi status syariah emiten "
            f"di pasar modal Indonesia. Status terkini: {status_word}."
        )

    share_text = (
        f"{code} ({name}) {'SYARIAH' if in_now else 'TIDAK SYARIAH'} "
        f"di Daftar Efek Syariah OJK. Via @lotmetrik."
    )
    title = f"Apakah {code} syariah? · DES OJK · Lotmetrik"
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
        "isPartOf": {"@type": "WebSite", "name": "Daftar Efek Syariah", "url": SITE + "/"},
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
  --off:#F5F7FA;--muted:#5F7186;--secondary:#44566B;--border:#D7DEE7;--border-strong:#B9C4D2;--white:#fff;--surface:#fff;
  --mono:'JetBrains Mono',ui-monospace,Menlo,Consolas,monospace;
  --sans:'Plus Jakarta Sans',ui-sans-serif,system-ui,sans-serif}}
[data-theme="terminal"]{{--off:#0B1F3A;--white:#122A4A;--surface:#122A4A;--navy:#F5F7FA;
  --muted:#8A99AD;--secondary:#B9C4D2;--border:#1B3A60;--border-strong:#284B76;
  --teal:#2DD4BF;--teal-text:#2DD4BF;--teal-soft:rgba(45,212,191,.14);
  --red:#F87171;--red-text:#F87171;--red-soft:rgba(248,113,113,.14);
  --amber:#FBBF24;--amber-soft:rgba(251,191,36,.16)}}
*{{box-sizing:border-box}}
html,body{{height:100%}}
body{{margin:0;min-height:100vh;display:flex;flex-direction:column;font-family:var(--sans);background:var(--off);color:var(--navy);
  -webkit-font-smoothing:antialiased;line-height:1.5}}
a{{color:var(--teal);font-weight:600;text-decoration:none}}
a:hover{{text-decoration:underline}}
.wrap{{flex:1;display:flex;flex-direction:column;width:100%;max-width:560px;margin:0 auto;padding:18px 16px 24px;box-sizing:border-box}}
.top{{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:22px}}
.brand{{display:inline-flex;align-items:center;gap:10px;color:inherit;text-decoration:none;min-width:0}}
.brand:hover{{text-decoration:none}}
.brand-ic{{width:36px;height:36px;border-radius:8px;background:#0B1F3A;display:grid;place-items:center;flex:none;border:1px solid var(--border)}}
.brand-ic svg{{width:22px;height:22px}}
.wm{{display:block;font-weight:800;font-size:13px;letter-spacing:-.02em;line-height:1.15}}
.by{{display:block;font-size:11px;font-weight:600;color:var(--muted);letter-spacing:.04em;text-transform:lowercase}}
.back{{flex:none;width:36px;height:36px;border-radius:8px;border:1px solid var(--border);background:var(--surface);color:var(--secondary);
  display:grid;place-items:center;text-decoration:none}}
.back:hover{{border-color:var(--teal);color:var(--teal);text-decoration:none}}
.back svg{{width:18px;height:18px;display:block}}
h1{{font-size:clamp(1.25rem,4vw,1.55rem);letter-spacing:-.03em;line-height:1.2;margin:0 0 6px;font-weight:800}}
.name{{font-size:14px;color:var(--muted);margin:0 0 18px}}
.verdict{{display:flex;gap:12px;align-items:flex-start;padding:14px;border-radius:12px;border:1px solid;margin:0 0 14px}}
.verdict.in{{background:var(--teal-soft);border-color:rgba(15,148,136,.35);color:var(--teal-text)}}
.verdict.out{{background:var(--red-soft);border-color:rgba(220,38,38,.28);color:var(--red-text)}}
.vic{{flex:none;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:var(--surface)}}
.vic svg{{width:20px;height:20px}}
.vbody{{flex:1;min-width:0}}
.vmain{{font-size:1.2rem;font-weight:800;letter-spacing:-.01em;line-height:1.2}}
.vmain .mono{{font-family:var(--mono)}}
.vsub{{font-size:12.5px;color:var(--secondary);margin-top:4px;line-height:1.4}}
.chips{{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 12px}}
.chip{{display:inline-flex;font-family:var(--mono);font-size:11px;font-weight:700;letter-spacing:.03em;
  padding:4px 9px;border-radius:999px;background:var(--teal-soft);color:var(--teal-text)}}
.chip.out{{background:var(--red-soft);color:var(--red-text)}}
.chip.star{{background:var(--amber-soft);color:var(--amber)}}
.dots{{display:flex;width:100%;gap:3px;margin:0 0 14px}}
.dot{{flex:1;min-width:0;height:16px;border-radius:4px;background:var(--border-strong)}}
.dot.on{{background:var(--teal)}}
.stats-line{{display:grid;grid-template-columns:repeat(3,1fr);width:100%;gap:8px;margin:0 0 16px}}
.stat{{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:10px 12px;display:flex;flex-direction:column;gap:2px;text-align:left}}
.stat .sv{{font-family:var(--mono);font-size:1.35rem;font-weight:800;line-height:1;letter-spacing:-.02em;color:var(--navy)}}
.stat .sv.up{{color:var(--teal-text)}}
.stat .sv.down{{color:var(--red-text)}}
.stat .sl{{font-size:11.5px;color:var(--muted);font-weight:600}}
.actions{{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 14px}}
.btn{{appearance:none;border:1px solid var(--border-strong);background:var(--surface);color:var(--navy);
  font:inherit;font-weight:700;font-size:13.5px;padding:10px 14px;border-radius:8px;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center}}
.btn:hover{{border-color:var(--teal);color:var(--teal);text-decoration:none}}
.note{{font-size:12.5px;color:var(--muted);margin:0 0 10px;line-height:1.45}}
.box{{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:12px 14px;margin:0 0 12px}}
.box p{{margin:0;font-size:13.5px;color:var(--secondary);line-height:1.55}}
.foot{{margin-top:auto;padding-top:14px;border-top:1px solid var(--border);font-size:12px;color:var(--muted);
  display:flex;flex-wrap:wrap;gap:10px 12px;align-items:center;justify-content:space-between}}
.foot-meta{{display:inline-flex;flex-wrap:wrap;align-items:center;gap:5px 10px}}
.foot-social{{display:inline-flex;gap:6px;margin-left:auto}}
.foot .soc{{display:inline-grid;place-items:center;width:28px;height:28px;border-radius:6px;border:1px solid var(--border);color:var(--muted);background:var(--surface);text-decoration:none}}
.foot .soc:hover{{color:var(--teal);border-color:var(--teal);text-decoration:none}}
.foot .soc svg{{width:14px;height:14px}}
.foot .sep{{opacity:.45}}
@media(max-width:420px){{.actions .btn{{flex:1;justify-content:center}}}}
</style>
</head>
<body>
<div class="wrap">
  <div class="top">
    <a class="brand" href="/">
      <span class="brand-ic" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <circle cx="10.5" cy="12.5" r="7.2" fill="#2DD4BF"/>
          <circle cx="13.8" cy="10.4" r="6" fill="#0B1F3A"/>
          <path d="M17.4 6.8L17.9 8.1L19.2 8.6L17.9 9.1L17.4 10.4L16.9 9.1L15.6 8.6L16.9 8.1Z" fill="#FBBF24"/>
        </svg>
      </span>
      <span><span class="wm">Daftar Efek Syariah</span><span class="by">by lotmetrik</span></span>
    </a>
    <a class="back" href="/" aria-label="Kembali ke dashboard" title="Kembali ke dashboard">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
    </a>
  </div>

  <h1>{h1}</h1>
  <p class="name">{esc(name)}</p>

  <div class="verdict {verdict_cls}">
    <span class="vic" aria-hidden="true">{vic}</span>
    <div class="vbody">
      <div class="vmain"><span class="mono">{esc(code)}</span> {esc(verdict)}</div>
      <div class="vsub">{status_line}</div>
    </div>
  </div>

  {chips_html}
  <div class="dots" role="img" aria-label="{esc(aria_dots)}">{dots_html}</div>
  <div class="stats-line" aria-label="Ringkasan jejak">
    <div class="stat"><span class="sv">{count}/{N}</span><span class="sl">muncul</span></div>
    <div class="stat"><span class="sv up">{enters}</span><span class="sl">masuk</span></div>
    <div class="stat"><span class="sv down">{exits}</span><span class="sl">keluar</span></div>
  </div>

  <div class="actions">
    <button type="button" class="btn" id="shareBtn" data-url="{url}" data-text="{esc(share_text)}">Bagikan</button>
  </div>

  <div class="box"><p>{esc(seo_blurb)}</p></div>
  <p class="note">Data historis tidak menjamin status berikutnya.</p>

  <div class="foot">
    <div class="foot-meta">
      <span>© {esc(last_y)} <a href="https://lotmetrik.my.id/" rel="noopener" target="_blank">Lotmetrik</a></span>
      <span class="sep">·</span>
      <span>Sumber: <a href="https://ojk.go.id/id/kanal/syariah/data-dan-statistik/daftar-efek-syariah/" rel="noopener" target="_blank">DES OJK</a></span>
      <span class="sep">·</span>
      <a href="/#panduan">Panduan</a>
    </div>
    <span class="foot-social" aria-label="Sosial Lotmetrik">
      <a class="soc" href="https://instagram.com/lotmetrik" rel="noopener" target="_blank" aria-label="Instagram Lotmetrik" title="Instagram">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
      </a>
      <a class="soc" href="https://t.me/lotmetrik" rel="noopener" target="_blank" aria-label="Telegram Lotmetrik" title="Telegram">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.5 4.3L2.8 11.5c-1.3.5-1.3 1.2-.2 1.5l4.8 1.5 1.8 5.6c.2.7.4.9 1 .9.6 0 .8-.3 1.1-.6l2.7-2.6 5.6 4.1c1 .6 1.8.3 2-.9l3.5-16.5c.4-1.5-.5-2.1-1.6-1.7zM9.3 14.7l-.2 3.3 1.1-2.2 8.7-7.8c.3-.3 0-.4-.4-.2L9.3 14.7z"/></svg>
      </a>
      <a class="soc" href="https://tiktok.com/@lotmetrik" rel="noopener" target="_blank" aria-label="TikTok Lotmetrik" title="TikTok">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.278 4.278 0 0 1-1.62-3.52h-3.18v13.44a2.83 2.83 0 1 1-2.4-2.8V10.2a6.16 6.16 0 0 0-.96-.07 6.06 6.06 0 1 0 5.04 10.36 6.04 6.04 0 0 0 1.12-3.52V8.36a8.13 8.13 0 0 0 4.76 1.53V6.7a4.77 4.77 0 0 1-2.76-.01z"/></svg>
      </a>
    </span>
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
