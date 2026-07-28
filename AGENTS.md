# Dashboard Daftar Efek Syariah (des.lotmetrik.my.id) — Panduan Agent

> Pemilik project adalah NON-CODER. Jelaskan dalam Bahasa Indonesia santai, langkah "ketik ini", tanpa jargon. Laporkan hasil dengan jujur (kalau gagal bilang gagal), verifikasi sebelum klaim selesai.

## Status aktif (26 Jul 2026)
- **Folder proyek (Desktop):** `C:\Users\GEEKOM A8\Desktop\DES Daftar Efek Syariah\` - situs di subfolder `des-flow-tool-v2\`. HANDOFF lengkap di `..\HANDOFF.md`.
- **Versi:** v2.5 (dashboard + 850 halaman `/saham/KODE` + arsip `/rilis/` dan satu halaman untuk tiap rilis). Cache `?v=295`.
- **Sinkron:** `git push` ke `main` = auto-deploy Netlify. Tiap ubah JS/CSS/data → naikkan `?v=` di 2 tag script `index.html`.
- Standar produk: **gratis lead magnet**, bukan one-time sale. JANGAN paywall.

## Apa ini
Web freebie data Daftar Efek Syariah (DES) OJK 2016–2026, brand **Lotmetrik**. LIVE di https://des.lotmetrik.my.id.

## Deploy & repo
- Repo situs: **`alfindigital/lotmetrik-des`** (publik). Push `main` → Netlify site `lotmetrikdes`.
- Repo arsip: **`alfindigital/des`** (Excel + otomasi). Folder induk lokal adalah git arsip ini.
- v1 lama (`des-flow-tool`, repo `des-flow-v1`) = 301 redirect. Jangan digarap / jangan hapus.

## Struktur penting
- Statis tanpa build: `index.html` + `app.js` + `data.js`. Zero dependency runtime.
- **`saham/`** = 850 halaman SEO (DIGENERATE). **JANGAN edit manual** - ubah `_update/generate_saham.py`, lalu `python _update/generate_saham.py`.
- **`rilis/`** = hub arsip + satu halaman SEO per rilis (DIGENERATE). Ubah `_update/release_pages.py`, lalu jalankan `python _update/generate_saham.py`.
- **Rilis terbaru:** canonical `/rilis/rilis-juli-2026`; alias `/rilis-terbaru`, `/rilis-juli-2026`, `/rilis/juni-2026`, dan `/rilis/rilis-juni-2026` diarahkan 301.
- `share.js` = Bagikan + theme di halaman saham/rilis.
- `analytics.js` = GA4 (`G-KJVN9Z014V`) + Microsoft Clarity (`xrvlyaao2k`). **Jangan pakai inline `<script>`** — CSP `script-src 'self'` + daftar putih memblokir inline. Domain pihak ketiga wajib didaftarkan di `_headers`.
- `_update/` = kit update semester: `parse_des.py`, `build_data.py` (panggil generator), `generate_saham.py`, `render_og.py`, `ojk_excel/`, `fonts/`.
- Pemicu update: `update.bat` ATAU upload Excel ke `_update/ojk_excel/` via GitHub web → Actions.
- Reminder Cloudflare Worker `des-reminder` **DIMATIKAN 28 Jul 2026** (bot Telegram dihapus). Update pakai kalender + OJK.
- Funnel brand: popup Telegram `t.me/lotmetrik` (`funnel.js`) — muncul setelah 5 detik, auto-tutup 5 detik / bisa disilang. Satu kali per sesi browser.
- `_socmed/` di folder induk = kit gambar sosmed **LOKAL SAJA** (sengaja tidak di-git).

## Aturan WAJIB (jangan dilanggar)
- Kriteria Panduan = **POJK 8/2025** (utang bunga →33% bertahap, non-halal <5%). JANGAN kembalikan ke 45%/10%.
- Verdict banner di tracker = fitur inti. Tombol **Profil KODE** mengarah ke `/saham/kode`. Daftar masuk/keluar dashboard = link crawlable ke `/saham/` (klik biasa tetap buka tracker).
- Halaman saham: blok **saham senasib / rilis terbaru** + link ke halaman canonical rilis terbaru wajib dipertahankan (SEO internal linking).
- Copy: **tanpa em-dash**; "agar" bukan "biar"; bulan ditulis penuh; verdict evergreen (tanpa "sejak Jun 2026" yang basi).
- Provenance: CSV pakai tanggal+KEP periode; share bawa disclaimer edukasi. Chart TANPA watermark.
- TIDAK ada (sengaja dihapus): lede home, tombol (i) Lacak, Fakta dekade, Alat gratis lain, panah dropdown search.
- Header: logo bulan-sabit+bintang, "by lotmetrik" ditumpuk di bawah judul.
- Data hanya dari `data.js` / Excel OJK. Gate rekonsiliasi di `build_data.py` — kalau TIDAK COCOK, berhenti.
- Banned words: cuan/pasti naik/beli sekarang/target price/dijamin.
- Warna: teal = naik/masuk, merah = turun/keluar. Angka font mono.
- `/saham/` = hub berbrand (`saham/index.html`, ikut di-regen). JANGAN redirect `/saham/` ke `/` di `_redirects` (Netlify pernah nyasar ke ticker HOME).
- `generate_saham.py` pakai f-string dengan CSS/JS: kurung kurawal literal digandakan `{{ }}`. Hati-hati saat edit template.
