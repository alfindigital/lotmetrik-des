# -*- coding: utf-8 -*-
"""Hub page /saham/ — dipanggil dari generate_saham.main()."""
from __future__ import annotations

import json

SITE = "https://des.lotmetrik.my.id"
CACHE_V = "299"


def esc(s: str) -> str:
    return (
        str(s)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def build_saham_index(
    *,
    last_lab: str,
    last_y: str,
    lastmod: str,
    entered: list[str],
    exited: list[str],
    total_now: int,
    latest_release_url: str,
) -> str:
    url = f"{SITE}/saham/"
    title = "Cek status saham di Daftar Efek Syariah · Lotmetrik"
    desc = (
        f"Cari jejak masuk-keluar saham di Daftar Efek Syariah OJK. "
        f"Rilis {last_lab}: {len(entered)} masuk, {len(exited)} keluar, total {total_now} efek."
    )
    samples_out = "".join(
        f'<a class="tk" href="/saham/{c.lower()}">{esc(c)}</a>' for c in exited[:12]
    )
    samples_in = "".join(
        f'<a class="tk in" href="/saham/{c.lower()}">{esc(c)}</a>' for c in entered[:12]
    )
    social = """
    <span class="foot-social" aria-label="Sosial Lotmetrik">
      <a class="soc" href="https://instagram.com/lotmetrik" rel="noopener" target="_blank" aria-label="Instagram Lotmetrik" title="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg></a>
      <a class="soc" href="https://t.me/lotmetrik" rel="noopener" target="_blank" aria-label="Telegram Lotmetrik" title="Telegram"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.5 4.3L2.8 11.5c-1.3.5-1.3 1.2-.2 1.5l4.8 1.5 1.8 5.6c.2.7.4.9 1 .9.6 0 .8-.3 1.1-.6l2.7-2.6 5.6 4.1c1 .6 1.8.3 2-.9l3.5-16.5c.4-1.5-.5-2.1-1.6-1.7z"/></svg></a>
      <a class="soc" href="https://tiktok.com/@lotmetrik" rel="noopener" target="_blank" aria-label="TikTok Lotmetrik" title="TikTok"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.278 4.278 0 0 1-1.62-3.52h-3.18v13.44a2.83 2.83 0 1 1-2.4-2.8V10.2a6.16 6.16 0 1 0 5.04 10.36 6.04 6.04 0 0 0 1.12-3.52V8.36a8.13 8.13 0 0 0 4.76 1.53V6.7a4.77 4.77 0 0 1-2.76-.01z"/></svg></a>
      <a class="soc" href="https://x.com/lotmetrik" rel="noopener" target="_blank" aria-label="X Lotmetrik" title="X"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 2.8h3.2l-7 8 8.2 10.4h-6.3l-4.9-6.3-5.6 6.3H2l7.3-8.3L1.4 2.8h6.4l4.6 5.9 5.2-5.9zm-1.1 16.5h1.8L7.3 4.6H5.4l11.1 14.7z"/></svg></a>
      <a class="soc" href="https://www.youtube.com/@lotmetrik" rel="noopener" target="_blank" aria-label="YouTube Lotmetrik" title="YouTube"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.5 7.2a3 3 0 0 0-2.1-2.1C18.6 4.6 12 4.6 12 4.6s-6.6 0-8.4.5A3 3 0 0 0 1.5 7.2C1 9 1 12 1 12s0 3 .5 4.8a3 3 0 0 0 2.1 2.1c1.8.5 8.4.5 8.4.5s6.6 0 8.4-.5a3 3 0 0 0 2.1-2.1c.5-1.8.5-4.8.5-4.8s0-3-.5-4.8zM9.8 15.4V8.6l5.9 3.4-5.9 3.4z"/></svg></a>
    </span>
    """.strip()
    ld = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "CollectionPage",
                "name": title,
                "url": url,
                "description": desc,
                "inLanguage": "id-ID",
                "isPartOf": {"@type": "WebSite", "name": "Daftar Efek Syariah", "url": SITE + "/"},
                "dateModified": lastmod,
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Daftar Efek Syariah", "item": SITE + "/"},
                    {"@type": "ListItem", "position": 2, "name": "Saham", "item": url},
                ],
            },
        ],
    }
    return f"""<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<script src="/analytics.js"></script>
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<meta name="theme-color" content="#0B1F3A">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Lotmetrik">
<meta property="og:url" content="{url}">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:image" content="{SITE}/og.png">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@600;700&display=swap">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
<style>
:root{{--navy:#0B1F3A;--teal:#0F9488;--teal-text:#0D7A70;--red-text:#B91C1C;--off:#F5F7FA;--muted:#5F7186;
  --secondary:#44566B;--border:#D7DEE7;--surface:#fff;
  --mono:'JetBrains Mono',ui-monospace,Menlo,Consolas,monospace;
  --sans:'Plus Jakarta Sans',ui-sans-serif,system-ui,sans-serif}}
[data-theme="terminal"]{{--off:#0B1F3A;--surface:#122A4A;--navy:#F5F7FA;--muted:#B9C4D2;--secondary:#EAEEF3;
  --border:#284B76;--teal:#2DD4BF;--teal-text:#5EEAD4;--red-text:#FCA5A5}}
*{{box-sizing:border-box}}
body{{margin:0;min-height:100vh;font-family:var(--sans);background:var(--off);color:var(--navy);line-height:1.5}}
a{{color:var(--teal);font-weight:600;text-decoration:none}}
a:hover{{text-decoration:underline}}
.wrap{{max-width:1180px;margin:0 auto;padding:18px 18px 28px}}
.top{{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}}
.brand{{display:inline-flex;gap:10px;align-items:center;color:inherit;text-decoration:none}}
.brand-ic{{width:36px;height:36px;border-radius:8px;background:#0B1F3A;display:grid;place-items:center;border:1px solid var(--border)}}
.brand-ic svg{{width:22px;height:22px}}
.wm{{display:block;font-weight:800;font-size:13px}}
.by{{display:block;font-size:11px;color:var(--muted);font-weight:600}}
h1{{font-size:clamp(1.25rem,4vw,1.55rem);letter-spacing:-.03em;margin:0 0 12px;font-weight:800}}
.lead{{font-size:13.5px;color:var(--secondary);margin:0 0 10px}}
.caveat{{font-size:12.5px;color:var(--muted);margin:0 0 16px}}
.cta{{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 18px}}
.btn{{display:inline-flex;align-items:center;padding:10px 16px;border-radius:8px;border:1px solid var(--border);
  background:var(--surface);color:var(--navy);font-weight:700;font-size:13.5px;text-decoration:none}}
.btn:hover{{border-color:var(--teal);color:var(--teal);text-decoration:none}}
.btn.p{{background:var(--teal);border-color:var(--teal);color:#fff}}
.btn.p:hover{{filter:brightness(.95);color:#fff}}
.box{{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px;margin:0 0 12px}}
.box h2{{font-size:13px;margin:0 0 10px;font-weight:800}}
.links{{display:flex;flex-wrap:wrap;gap:8px}}
.tk{{font-family:var(--mono);font-size:12.5px;font-weight:700;padding:6px 10px;border-radius:8px;
  border:1px solid rgba(220,38,38,.28);color:var(--red-text);background:var(--off);text-decoration:none}}
.tk.in{{border-color:rgba(15,148,136,.35);color:var(--teal-text)}}
.tk:hover{{border-color:var(--teal);color:var(--teal);text-decoration:none}}
.foot{{margin-top:22px;padding-top:10px;border-top:1px solid var(--border);font-size:12px;color:var(--muted);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}}
.foot-social{{display:inline-flex;gap:6px;margin-left:auto}}
.soc{{display:inline-grid;place-items:center;width:28px;height:28px;border-radius:6px;border:1px solid var(--border);color:var(--muted);background:var(--surface)}}
.soc svg{{width:14px;height:14px}}
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
      <span><span class="wm">Daftar Efek Syariah</span><span class="by">by @lotmetrik</span></span>
    </a>
  </div>
  <h1>Cek status saham di Daftar Efek Syariah</h1>
  <p class="lead">Ada 850 halaman jejak per emiten. Ketik kode saham di dashboard, atau buka daftar masuk/keluar rilis terbaru.</p>
  <p class="caveat">Data rilis {esc(last_lab)}: {total_now} efek syariah, {len(entered)} masuk, {len(exited)} keluar. Edukasi berbasis data, bukan rekomendasi beli/jual.</p>
  <div class="cta">
    <a class="btn p" href="/#lacak">Cari kode saham di dashboard</a>
    <a class="btn" href="{latest_release_url}">Lihat masuk &amp; keluar rilis terbaru</a>
  </div>
  <section class="box">
    <h2>Contoh saham keluar di rilis terbaru</h2>
    <div class="links">{samples_out}</div>
  </section>
  <section class="box">
    <h2>Contoh saham masuk di rilis terbaru</h2>
    <div class="links">{samples_in}</div>
  </section>
  <div class="foot"><span>© {esc(last_y)} <a href="https://lotmetrik.my.id/" rel="noopener" target="_blank">Lotmetrik</a>
    · Sumber: <a href="https://ojk.go.id/id/kanal/syariah/data-dan-statistik/daftar-efek-syariah/" rel="noopener" target="_blank">DES OJK</a></span>
    {social}</div>
</div>
<script src="/share.js?v={CACHE_V}" defer></script>
</body>
</html>
"""
