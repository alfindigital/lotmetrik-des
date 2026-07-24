# DES Dashboard (des.lotmetrik.my.id) — Panduan Agent

> Pemilik project adalah NON-CODER. Jelaskan dalam Bahasa Indonesia santai, langkah "ketik ini", tanpa jargon. Laporkan hasil dengan jujur (kalau gagal bilang gagal), verifikasi sebelum klaim selesai.

## Status aktif (24 Jul 2026)
- **IDE aktif = Cursor.** Owner lanjut semua edit (fitur, UI/UX, responsive, security, sync) dari chat Cursor di folder ini.
- **Sinkron terverifikasi:** lokal `main` = `origin/main` = commit `aad69b0`, live cache `?v=247`. Tiap ubah JS/CSS/data → naikkan `?v=` di 2 tag script, `git push` → Netlify.
- Standar produk: **gratis lead magnet**, bukan one-time sale. Roast/audit ulang sudah dikerjakan di Cursor 24 Jul 2026.

## Apa ini
Web freebie data Daftar Efek Syariah (DES) OJK 2016–2026, brand **Lotmetrik**. Versi **v2.4.3 LIVE** di https://des.lotmetrik.my.id. GRATIS permanen (lead magnet) — **JANGAN pernah dipagari/paywall** (keputusan tertulis owner; data sudah publik + terindeks price:0).

## Konteks lengkap
**Baca `../HANDOFF.md`** (di folder induk `Claude Migrasi/DES/`) untuk sejarah lengkap, arsitektur, integrasi, dan rencana ke depan.

## Deploy & repo
- Repo: **`alfindigital/lotmetrik-des`** (GitHub, publik). **`git push` ke `main` = auto-deploy Netlify** (site `lotmetrikdes`, domain via Cloudflare DNS). Jangan deploy cara lain.
- v1 lama (folder saudara `des-flow-tool`, repo `alfindigital/des-flow-v1`) sudah **301-redirect** ke domain ini. Jangan digarap lagi, jangan hapus (redirect-nya hidup dari situ).

## Struktur penting
- Situs statis tanpa build: `index.html` (semua CSS inline) + `app.js` (semua logika) + `data.js` (data 21 rilis, 850 saham, bitstring). Zero dependency.
- **Cache busting `?v=N` di 2 tag `<script>` — WAJIB naikkan tiap ubah app.js/data.js/CSS.**
- `_update/` = kit update mandiri per semester: `parse_des.py` + `build_data.py` + `render_og.py` + 21 Excel OJK (`ojk_excel/`) + font OFL (`fonts/`). Dua pemicu:
  1. **`update.bat`** (double-click di PC), atau
  2. **upload Excel ke `_update/ojk_excel/` via GitHub web** → GitHub Actions (`.github/workflows/update-des.yml`) auto-regen + deploy (terbukti ~12 detik).
  Baca `_update/CARA-UPDATE.md`. Nama file Excel WAJIB: `DES_YYYY_Pn_KEPnn.xlsx`.
- `RELEASE-PLAYBOOK.md` = checklist hari-H rilis OJK (~29 Mei & ~29 Nov).
- Reminder rilis = **Cloudflare Worker `des-reminder`** (folder saudara `des-reminder-worker/`, BUKAN di repo ini; cron `0 0 29 5,11 *` → Telegram @desidx_bot). GitHub cron TIDAK dipakai (auto-disable 60 hari).

## Aturan WAJIB (jangan dilanggar)
- Kriteria syariah di Panduan = **POJK 8/2025** (utang bunga →33% bertahap, non-halal <5% sejak ~Apr 2026). JANGAN kembalikan ke angka lama 45%/10% (POJK 35/2017 sudah dicabut).
- **Verdict banner** di tracker ("X ADA/TIDAK ada di Daftar Efek Syariah · sejak <rilis>") = fitur inti, jangan dihilangkan.
- Provenance: CSV per-periode pakai tanggal + nomor KEP periode itu (csvSource(p)); teks share bawa "edukasi, bukan rekomendasi". Chart TIDAK pakai watermark (dihapus di v2.4.3 atas permintaan owner — jangan ditambahkan lagi).
- TIDAK ada: lede/tagline di home, tombol (i) di sebelah Lacak, seksi "Fakta dekade", "Alat gratis lain" di Panduan, panah dropdown di kotak cari — semua sengaja dihapus v2.4.3, jangan dikembalikan.
- Header: logo bulan-sabit+bintang, "DES Dashboard" dengan "by lotmetrik" DITUMPUK di bawahnya.
- Panduan = halaman penuh `#panduan`, layout 2 kolom kartu.
- Data: semua angka dihitung dari `data.js`. Jangan ubah data tanpa regenerasi dari Excel OJK asli (via `_update/`). `build_data.py` punya gate rekonsiliasi — kalau "TIDAK COCOK", berhenti, jangan dipaksa.
- Angka statis yang TIDAK auto-update dari JS: meta description / og:description / og:image:alt ("307 jadi 688 lalu 622"), JSON-LD "21 rilis" — `build_data.py` sudah menyamakan otomatis saat update; jangan edit manual asal-asalan.
- Jangan menambah klaim/opini/prediksi syariah; situs hanya menampilkan data resmi OJK. Banned words brand: cuan/pasti naik/beli sekarang/target price/dijamin.
- Footer & Panduan punya link Telegram t.me/lotmetrik + link OJK — pertahankan.
- Warna dikunci: teal = naik/masuk, merah = turun/keluar. Semua angka font mono.
