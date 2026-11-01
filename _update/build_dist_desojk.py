# -*- coding: utf-8 -*-
"""
build_dist_desojk.py — Rakit folder ../dist (daftar putih) untuk deploy desojk.web.id di Cloudflare Pages.
Hanya file publik yang ikut; dokumen internal, _update/, dan folder arsip tidak pernah ter-upload.
Jalankan dari root repo:  python _update/build_dist_desojk.py
Deploy (butuh izin owner):  npx wrangler@4 pages deploy dist --project-name desojk-web-id --branch main --commit-dirty=true
"""
import os
import shutil
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DIST = os.path.join(ROOT, "dist")

FILES = [
    "index.html", "404.html", "app.js", "data.js", "funnel.js", "share.js", "analytics.js", "desojk.css",
    "favicon.svg", "favicon-96.png", "apple-touch-icon.png", "og.png", "robots.txt", "sitemap.xml", "_headers",
]
DIRS = ["saham", "rilis"]


def cf_redirects(src: str) -> str:
    """_redirects versi Cloudflare Pages.
    - Baris paksa Netlify (`404!`) dibuang: file internal memang tidak ada di dist.
    - Rewrite 200 ke `:x.html` (/saham/:code, /rilis/:slug) dibuang: Cloudflare Pages sudah melayani URL
      tanpa .html sendiri, dan rewrite ke .html memicu redirect 308 ke dirinya sendiri (loop, terbukti 2 Nov 2026)."""
    out = []
    for line in src.splitlines():
        rule = line.split()
        if len(rule) >= 3 and rule[2].endswith("!"):
            continue
        if len(rule) >= 3 and rule[2] == "200" and ":" in rule[0] and rule[1].endswith(".html"):
            continue
        out.append(line)
    return "\n".join(out).rstrip() + "\n"


def clear_dist() -> None:
    """Kosongkan isi dist tanpa menghapus foldernya: di Windows folder kosong kadang dikunci proses lain
    (rmtree gagal WinError 5), sedangkan file di dalamnya tetap bisa dihapus."""
    for top, dirs, files in os.walk(DIST, topdown=False):
        for name in files:
            os.remove(os.path.join(top, name))
        for name in dirs:
            try:
                os.rmdir(os.path.join(top, name))
            except OSError:
                pass


def main() -> None:
    os.makedirs(DIST, exist_ok=True)
    clear_dist()
    for name in FILES:
        src = os.path.join(ROOT, name)
        if not os.path.isfile(src):
            sys.exit(f"[GAGAL] file publik hilang: {name}")
        shutil.copy2(src, os.path.join(DIST, name))
    for name in DIRS:
        shutil.copytree(os.path.join(ROOT, name), os.path.join(DIST, name), dirs_exist_ok=True)
    with open(os.path.join(ROOT, "_redirects"), encoding="utf-8") as f:
        red = cf_redirects(f.read())
    with open(os.path.join(DIST, "_redirects"), "w", encoding="utf-8", newline="\n") as f:
        f.write(red)

    total = sum(len(fs) for _, _, fs in os.walk(DIST))
    leaked = [p for p in ("AGENTS.md", "HANDOFF.md", "_update", "update.bat", ".git") if os.path.exists(os.path.join(DIST, p))]
    if leaked:
        sys.exit(f"[GAGAL] file internal ikut ke dist: {leaked}")
    print(f"[OK] dist siap: {total} file, {red.count(chr(10))} baris _redirects")


if __name__ == "__main__":
    main()
