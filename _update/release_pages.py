# -*- coding: utf-8 -*-
"""Generator hub /rilis/ dan satu halaman SEO untuk setiap rilis DES OJK."""
from __future__ import annotations

import json
import os
import re
from html import escape

SITE = "https://des.lotmetrik.my.id"
OJK_URL = (
    "https://ojk.go.id/id/kanal/syariah/data-dan-statistik/"
    "daftar-efek-syariah/"
)

MONTH_ID = {
    "Jan": "Januari",
    "Feb": "Februari",
    "Mar": "Maret",
    "Apr": "April",
    "Mei": "Mei",
    "May": "Mei",
    "Jun": "Juni",
    "Jul": "Juli",
    "Agu": "Agustus",
    "Aug": "Agustus",
    "Sep": "September",
    "Okt": "Oktober",
    "Oct": "Oktober",
    "Nov": "November",
    "Des": "Desember",
    "Dec": "Desember",
}
MONTH_SLUG = {key: value.lower() for key, value in MONTH_ID.items()}
MONTH_NUM = {
    "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", "Mei": "05",
    "May": "05", "Jun": "06", "Jul": "07", "Agu": "08", "Aug": "08",
    "Sep": "09", "Okt": "10", "Oct": "10", "Nov": "11", "Des": "12",
    "Dec": "12",
}
PUBLIC_RELEASE_OVERRIDES = {
    # Permintaan owner untuk nama publik rilis terbaru. Tanggal efektif resmi
    # tetap ditampilkan dari data.js, yaitu 1 Juni 2026.
    "2026_P1": {"month": "Juli", "slug": "rilis-juli-2026"},
}


def short_label(date: str) -> str:
    parts = date.split()
    if len(parts) != 3:
        return date
    return f"{MONTH_ID.get(parts[1], parts[1])} {parts[2]}"


def iso_date(date: str) -> str:
    parts = date.split()
    if len(parts) != 3 or parts[1] not in MONTH_NUM:
        return date
    return f"{parts[2]}-{MONTH_NUM[parts[1]]}-{parts[0].zfill(2)}"


def release_slug(meta_item: dict) -> str:
    override = PUBLIC_RELEASE_OVERRIDES.get(meta_item.get("key", ""))
    if override:
        return override["slug"]
    parts = meta_item["date"].split()
    if len(parts) != 3:
        return "rilis-" + meta_item["key"].lower().replace("_", "-")
    month = MONTH_SLUG.get(parts[1], parts[1].lower())
    return f"rilis-{month}-{parts[2]}"


def release_url(meta_item: dict) -> str:
    return f"/rilis/{release_slug(meta_item)}"


def public_label(meta_item: dict) -> str:
    override = PUBLIC_RELEASE_OVERRIDES.get(meta_item.get("key", ""))
    if not override:
        return short_label(meta_item["date"])
    year = meta_item["date"].split()[-1]
    return f"{override['month']} {year}"


def release_records(meta: list, present: dict[str, str]) -> list[dict]:
    """Turunkan anggota, masuk, dan keluar untuk semua rilis."""
    records: list[dict] = []
    previous: set[str] = set()
    for index, item in enumerate(meta):
        members = sorted(
            code for code, bits in present.items()
            if index < len(bits) and bits[index] == "1"
        )
        current = set(members)
        entered = sorted(current - previous) if index else members
        exited = sorted(previous - current) if index else []
        records.append(
            {
                "index": index,
                "meta": item,
                "slug": release_slug(item),
                "url": release_url(item),
                "members": members,
                "entered": entered,
                "exited": exited,
                "baseline": index == 0,
            }
        )
        previous = current
    return records


def _social_html() -> str:
    return """
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
  <a class="soc" href="https://x.com/lotmetrik" rel="noopener" target="_blank" aria-label="X Lotmetrik" title="X">
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 2.8h3.2l-7 8 8.2 10.4h-6.3l-4.9-6.3-5.6 6.3H2l7.3-8.3L1.4 2.8h6.4l4.6 5.9 5.2-5.9zm-1.1 16.5h1.8L7.3 4.6H5.4l11.1 14.7z"/></svg>
  </a>
  <a class="soc" href="https://www.youtube.com/@lotmetrik" rel="noopener" target="_blank" aria-label="YouTube Lotmetrik" title="YouTube">
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.5 7.2a3 3 0 0 0-2.1-2.1C18.6 4.6 12 4.6 12 4.6s-6.6 0-8.4.5A3 3 0 0 0 1.5 7.2C1 9 1 12 1 12s0 3 .5 4.8a3 3 0 0 0 2.1 2.1c1.8.5 8.4.5 8.4.5s6.6 0 8.4-.5a3 3 0 0 0 2.1-2.1c.5-1.8.5-4.8.5-4.8s0-3-.5-4.8zM9.8 15.4V8.6l5.9 3.4-5.9 3.4z"/></svg>
  </a>
</span>
""".strip()


def _base_css() -> str:
    return """
:root{--navy:#0B1F3A;--teal:#0F9488;--teal-text:#0D7A70;--teal-soft:rgba(20,184,166,.12);
--red:#DC2626;--red-text:#B91C1C;--red-soft:rgba(239,68,68,.10);--amber:#D97706;
--off:#F5F7FA;--muted:#5F7186;--secondary:#44566B;--border:#D7DEE7;--surface:#fff;
--mono:'JetBrains Mono',ui-monospace,Menlo,Consolas,monospace;
--sans:'Plus Jakarta Sans',ui-sans-serif,system-ui,sans-serif}
[data-theme="terminal"]{--off:#0B1F3A;--surface:#122A4A;--navy:#F5F7FA;--muted:#B9C4D2;
--secondary:#EAEEF3;--border:#284B76;--teal:#2DD4BF;--teal-text:#5EEAD4;
--teal-soft:rgba(45,212,191,.18);--red:#FCA5A5;--red-text:#FCA5A5;--red-soft:rgba(248,113,113,.18)}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;font-family:var(--sans);background:var(--off);color:var(--navy);line-height:1.5}
a{color:var(--teal);font-weight:600;text-decoration:none}
a:hover{text-decoration:underline}
:focus{outline:none}:focus-visible{outline:2px solid var(--teal-text);outline-offset:3px}
.wrap{width:100%;max-width:1180px;margin:0 auto;padding:18px 18px 28px}
.top{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:20px}
.brand{display:inline-flex;gap:10px;align-items:center;color:inherit;text-decoration:none}
.brand:hover{text-decoration:none}
.brand-ic{width:36px;height:36px;border-radius:8px;background:#0B1F3A;display:grid;place-items:center;border:1px solid var(--border)}
.brand-ic svg{width:22px;height:22px}.wm{display:block;font-size:13px;font-weight:800}.by{display:block;font-size:11px;color:var(--muted);font-weight:600}
.nav-act{display:flex;align-items:center;gap:8px}.icon-btn{width:36px;height:36px;border:1px solid var(--border);border-radius:8px;background:var(--surface);color:var(--navy);display:grid;place-items:center}
.icon-btn svg{width:18px;height:18px}.pg-top{display:flex;align-items:center;gap:12px;margin-bottom:16px}
.pg-back{width:36px;height:36px;flex:none;border:1px solid var(--border);border-radius:8px;background:var(--surface);color:var(--navy);display:grid;place-items:center}
.pg-back svg{width:18px;height:18px}h1{font-size:clamp(1.35rem,4vw,1.8rem);line-height:1.2;letter-spacing:-.035em;margin:0}
.lead{font-size:14px;color:var(--secondary);margin:0 0 12px}.caveat{font-size:12.5px;color:var(--muted);margin:0 0 18px}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin:0 0 18px}
.stat{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:12px}
.sv{display:block;font-family:var(--mono);font-size:1.45rem;font-weight:800;line-height:1}.sv.up{color:var(--teal-text)}.sv.down{color:var(--red-text)}
.sl{display:block;font-size:11px;color:var(--muted);font-weight:600;margin-top:5px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}
.box{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px;min-width:0}
.box h2{font-size:13px;margin:0 0 10px;font-weight:800}.box.in h2{color:var(--teal-text)}.box.out h2{color:var(--red-text)}
.count{font-family:var(--mono);color:var(--muted);margin-left:5px}.links{display:flex;flex-wrap:wrap;gap:7px}
.tk{font-family:var(--mono);font-size:12px;font-weight:700;padding:5px 9px;border-radius:7px;border:1px solid var(--border);background:var(--off);color:var(--navy)}
.in .tk{color:var(--teal-text);border-color:rgba(15,148,136,.35)}.out .tk{color:var(--red-text);border-color:rgba(220,38,38,.28)}
details{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:18px}
summary{cursor:pointer;font-weight:800;font-size:13px}details .links{margin-top:12px}
.period-nav{display:flex;justify-content:space-between;gap:10px;margin:4px 0 18px}.period-nav a{padding:8px 11px;border:1px solid var(--border);border-radius:8px;background:var(--surface);font-size:12px}
.timeline{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:0 0 20px}
.release-card{display:flex;align-items:center;gap:12px;background:var(--surface);border:1px solid var(--border);border-radius:11px;padding:12px;color:inherit}
.release-card:hover{text-decoration:none;border-color:var(--teal)}.release-card .date{font-weight:800;min-width:112px}.release-card .total{font-family:var(--mono);font-weight:800}
.release-card .delta{margin-left:auto;font-family:var(--mono);font-size:11px;color:var(--muted)}
.foot{margin-top:22px;padding-top:10px;border-top:1px solid var(--border);font-size:12px;color:var(--muted);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.foot-social{display:inline-flex;gap:6px;margin-left:auto}.soc{display:inline-grid;place-items:center;width:28px;height:28px;border-radius:6px;border:1px solid var(--border);color:var(--muted);background:var(--surface)}
.soc svg{width:14px;height:14px}
@media(max-width:720px){.grid,.timeline{grid-template-columns:1fr}.stats{grid-template-columns:1fr}.release-card .date{min-width:100px}}
""".strip()


def _head(title: str, desc: str, canonical: str, ld: dict) -> str:
    return f"""<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<script src="/analytics.js" defer></script>
<title>{escape(title)}</title>
<meta name="description" content="{escape(desc)}">
<meta name="theme-color" content="#0B1F3A">
<link rel="canonical" href="{canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Lotmetrik">
<meta property="og:url" content="{canonical}">
<meta property="og:title" content="{escape(title)}">
<meta property="og:description" content="{escape(desc)}">
<meta property="og:image" content="{SITE}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Arsip Daftar Efek Syariah OJK oleh Lotmetrik">
<meta property="og:locale" content="id_ID">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{escape(title)}">
<meta name="twitter:description" content="{escape(desc)}">
<meta name="twitter:image" content="{SITE}/og.png">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@600;700&display=swap">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>"""


def _brand_header(back_href: str = "/") -> str:
    return f"""<div class="top">
  <a class="brand" href="/">
    <span class="brand-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><circle cx="10.5" cy="12.5" r="7.2" fill="#2DD4BF"/><circle cx="13.8" cy="10.4" r="6" fill="#0B1F3A"/><path d="M17.4 6.8L17.9 8.1L19.2 8.6L17.9 9.1L17.4 10.4L16.9 9.1L15.6 8.6L16.9 8.1Z" fill="#FBBF24"/></svg></span>
    <span><span class="wm">Daftar Efek Syariah</span><span class="by">by @lotmetrik</span></span>
  </a>
  <div class="nav-act"><a class="icon-btn" href="/#panduan" aria-label="Panduan &amp; sumber" title="Panduan"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/></svg></a></div>
</div>
<div class="pg-top">
  <a class="pg-back" href="{back_href}" aria-label="Kembali" title="Kembali"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 18l-6-6 6-6"/></svg></a>"""


def _ticker_links(codes: list[str], names: dict) -> str:
    if not codes:
        return '<p class="caveat">Tidak ada.</p>'
    return '<div class="links">' + "".join(
        f'<a class="tk" href="/saham/{code.lower()}" title="{escape(names.get(code) or code)}">{escape(code)}</a>'
        for code in codes
    ) + "</div>"


def _footer(year: str) -> str:
    return f"""<div class="foot">
  <span>© {escape(year)} <a href="https://lotmetrik.my.id/" rel="noopener" target="_blank">Lotmetrik</a> · Sumber: <a href="{OJK_URL}" rel="noopener" target="_blank">DES OJK</a></span>
  {_social_html()}
</div>"""


def release_page_html(
    record: dict,
    records: list[dict],
    names: dict,
    cache_version: str,
) -> str:
    item = record["meta"]
    index = record["index"]
    label = public_label(item)
    effective_label = short_label(item["date"])
    year = item["date"].split()[-1]
    total = len(record["members"])
    canonical = SITE + record["url"]
    if record["baseline"]:
        title = f"Daftar Efek Syariah {label}: {total} saham · OJK"
        desc = (
            f"Daftar Efek Syariah OJK {label} memuat {total} saham. "
            f"Lihat daftar kode saham lengkap berdasarkan {item['kep']}."
        )
        lead = (
            f"Ini adalah rilis pertama dalam arsip Lotmetrik. "
            f"Daftar berlaku {item['date']} berdasarkan {item['kep']} dan memuat {total} saham."
        )
    else:
        title = (
            f"Daftar Efek Syariah {label}: {len(record['entered'])} masuk, "
            f"{len(record['exited'])} keluar · OJK"
        )
        desc = (
            f"DES OJK {label}: total {total} saham, {len(record['entered'])} masuk, "
            f"{len(record['exited'])} keluar. Daftar kode lengkap dan jejak tiap emiten."
        )
        lead = (
            f"Rilis publik {label} ini berlaku efektif {item['date']} berdasarkan {item['kep']}. "
            f"Dibanding rilis sebelumnya, {len(record['entered'])} saham masuk dan "
            f"{len(record['exited'])} saham keluar."
        )

    item_list = [
        {
            "@type": "ListItem",
            "position": position,
            "url": f"{SITE}/saham/{code.lower()}",
            "name": f"{code} - {names.get(code) or code}",
        }
        for position, code in enumerate(record["members"], start=1)
    ]
    ld = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "CollectionPage",
                "name": title,
                "url": canonical,
                "description": desc,
                "inLanguage": "id-ID",
                "dateModified": iso_date(item["date"]),
                "isPartOf": {"@type": "WebSite", "name": "Daftar Efek Syariah", "url": SITE + "/"},
                "mainEntity": {
                    "@type": "ItemList",
                    "numberOfItems": total,
                    "itemListElement": item_list,
                },
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Daftar Efek Syariah", "item": SITE + "/"},
                    {"@type": "ListItem", "position": 2, "name": "Arsip rilis", "item": SITE + "/rilis/"},
                    {"@type": "ListItem", "position": 3, "name": label, "item": canonical},
                ],
            },
        ],
    }

    prev_link = (
        f'<a href="{records[index - 1]["url"]}">← {public_label(records[index - 1]["meta"])}</a>'
        if index > 0 else "<span></span>"
    )
    next_link = (
        f'<a href="{records[index + 1]["url"]}">{public_label(records[index + 1]["meta"])} →</a>'
        if index + 1 < len(records) else '<a href="/rilis/">Semua rilis →</a>'
    )
    if record["baseline"]:
        movement_html = f"""<section class="box in">
  <h2>Daftar saham pada rilis pertama <span class="count">{total}</span></h2>
  {_ticker_links(record["members"], names)}
</section>"""
        members_html = ""
    else:
        movement_html = f"""<div class="grid">
  <section class="box out"><h2>Keluar <span class="count">{len(record["exited"])}</span></h2>{_ticker_links(record["exited"], names)}</section>
  <section class="box in"><h2>Masuk <span class="count">{len(record["entered"])}</span></h2>{_ticker_links(record["entered"], names)}</section>
</div>"""
        members_html = f"""<details>
  <summary>Lihat semua {total} saham di DES {escape(label)}</summary>
  {_ticker_links(record["members"], names)}
</details>"""

    return f"""<!doctype html>
<html lang="id">
<head>
{_head(title, desc, canonical, ld)}
<style>{_base_css()}</style>
</head>
<body>
<div class="wrap">
  {_brand_header("/rilis/")}
    <div><h1>Daftar Efek Syariah OJK {escape(label)}</h1></div>
  </div>
  <p class="lead">{escape(lead)}</p>
  <p class="caveat"><b>Tanggal efektif resmi OJK:</b> {escape(effective_label)}. Nama URL mengikuti nama publik rilis dan tidak mengubah tanggal keputusan OJK.</p>
  <p class="caveat">Keluar dari DES bukan berarti delisting. Status dapat berubah pada rilis berikutnya. Data edukasi, bukan rekomendasi beli/jual.</p>
  <div class="stats">
    <div class="stat"><span class="sv">{total}</span><span class="sl">saham dalam daftar</span></div>
    <div class="stat"><span class="sv up">{len(record["entered"]) if not record["baseline"] else 0}</span><span class="sl">masuk dari rilis sebelumnya</span></div>
    <div class="stat"><span class="sv down">{len(record["exited"])}</span><span class="sl">keluar dari rilis sebelumnya</span></div>
  </div>
  {movement_html}
  {members_html}
  <nav class="period-nav" aria-label="Navigasi rilis">{prev_link}{next_link}</nav>
  {_footer(year)}
</div>
<script src="/share.js?v={cache_version}" defer></script>
</body>
</html>
"""


def hub_page_html(records: list[dict], cache_version: str) -> str:
    first = records[0]
    last = records[-1]
    first_year = first["meta"]["date"].split()[-1]
    year = last["meta"]["date"].split()[-1]
    canonical = SITE + "/rilis/"
    title = f"Arsip Daftar Efek Syariah OJK {first_year}-{year} · Lotmetrik"
    desc = (
        f"Arsip {len(records)} rilis Daftar Efek Syariah OJK dari "
        f"{public_label(first['meta'])} sampai {public_label(last['meta'])}. "
        "Lihat saham masuk, keluar, dan daftar lengkap tiap rilis."
    )
    cards = []
    for record in reversed(records):
        label = public_label(record["meta"])
        if record["baseline"]:
            delta = "rilis awal"
        else:
            delta = f"+{len(record['entered'])} / -{len(record['exited'])}"
        cards.append(
            f'<a class="release-card" href="{record["url"]}">'
            f'<span class="date">{escape(label)}</span>'
            f'<span class="total">{len(record["members"])}</span>'
            f'<span class="delta">{delta}</span></a>'
        )
    ld = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "CollectionPage",
                "name": title,
                "url": canonical,
                "description": desc,
                "inLanguage": "id-ID",
                "dateModified": iso_date(last["meta"]["date"]),
                "isPartOf": {"@type": "WebSite", "name": "Daftar Efek Syariah", "url": SITE + "/"},
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Daftar Efek Syariah", "item": SITE + "/"},
                    {"@type": "ListItem", "position": 2, "name": "Arsip rilis", "item": canonical},
                ],
            },
        ],
    }
    return f"""<!doctype html>
<html lang="id">
<head>
{_head(title, desc, canonical, ld)}
<style>{_base_css()}</style>
</head>
<body>
<div class="wrap">
  {_brand_header("/")}
    <div><h1>Arsip rilis Daftar Efek Syariah OJK</h1></div>
  </div>
  <p class="lead">{escape(desc)}</p>
  <p class="caveat">Pilih periode untuk melihat daftar lengkap, saham masuk, dan saham keluar. Angka memakai basis ticker saham dari dokumen resmi OJK.</p>
  <div class="timeline">{"".join(cards)}</div>
  {_footer(year)}
</div>
<script src="/share.js?v={cache_version}" defer></script>
</body>
</html>
"""


def generate_release_pages(
    root: str,
    meta: list,
    present: dict[str, str],
    names: dict,
    cache_version: str,
) -> list[dict]:
    output_dir = os.path.join(root, "rilis")
    os.makedirs(output_dir, exist_ok=True)
    for old in os.listdir(output_dir):
        if old.lower().endswith(".html"):
            os.remove(os.path.join(output_dir, old))

    records = release_records(meta, present)
    for record in records:
        path = os.path.join(output_dir, f"{record['slug']}.html")
        with open(path, "w", encoding="utf-8", newline="\n") as file:
            file.write(release_page_html(record, records, names, cache_version))

    with open(os.path.join(output_dir, "index.html"), "w", encoding="utf-8", newline="\n") as file:
        file.write(hub_page_html(records, cache_version))
    return records


def write_redirects(root: str, meta: list) -> None:
    """Tulis routing Netlify; /rilis-terbaru selalu mengikuti data terbaru."""
    latest_canonical = release_url(meta[-1]) if meta else "/rilis/"
    legacy_aliases = []
    seen_aliases = set()
    for item in meta:
        canonical = release_url(item)
        old_slug = legacy_slug(item)
        old_urls = [f"/rilis/{old_slug}", f"/rilis/rilis-{old_slug}"]
        for old_url in old_urls:
            if old_url != canonical and old_url not in seen_aliases:
                legacy_aliases.append(
                    f"{old_url:<34} {canonical:<34} 301"
                )
                seen_aliases.add(old_url)

    public_aliases = [
        f"{('/' + release_slug(item)):<34} {release_url(item):<34} 301"
        for item in meta
    ]

    body = f"""# Block internal tooling / docs from public HTTP (security hygiene)
# Trailing ! = force even when the static file exists on disk
# PENTING: baris ini WAJIB tetap di sini, bukan cuma di file _redirects manual -
# write_redirects() menulis ulang SELURUH file tiap generate_saham.py jalan,
# jadi kalau baris ini dihapus dari SINI, ia hilang lagi di regen berikutnya.
/update.bat              /404.html   404!
/_update/*               /404.html   404!
/AGENTS.md               /404.html   404!
/CLAUDE.md               /404.html   404!
/RELEASE-PLAYBOOK.md     /404.html   404!

# Pretty URLs (tanpa unicode di komentar - aman untuk parser Netlify)
# /saham/ dan /rilis/ dilayani oleh index.html di folder masing-masing
/saham/:code          /saham/:code.html          200
{chr(10).join(legacy_aliases)}
{chr(10).join(public_aliases)}
/rilis-terbaru        {latest_canonical:<34} 301
/rilis-terbaru.html   {latest_canonical:<34} 301
/rilis/:slug          /rilis/:slug.html          200
"""
    with open(os.path.join(root, "_redirects"), "w", encoding="utf-8", newline="\n") as file:
        file.write(body)


def cache_version_from_index(root: str, fallback: str = "1") -> str:
    path = os.path.join(root, "index.html")
    try:
        text = open(path, encoding="utf-8").read()
        versions = [int(value) for value in re.findall(r"\.js\?v=(\d+)", text)]
        return str(max(versions)) if versions else fallback
    except OSError:
        return fallback


def legacy_slug(meta_item: dict) -> str:
    """Slug lama tanpa prefix rilis-, untuk 301 dan migrasi SEO."""
    parts = meta_item["date"].split()
    if len(parts) != 3:
        return meta_item["key"].lower().replace("_", "-")
    month = MONTH_SLUG.get(parts[1], parts[1].lower())
    return f"{month}-{parts[2]}"
