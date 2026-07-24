# Dashboard Daftar Efek Syariah — Lotmetrik

Alat data gratis: telusuri Daftar Efek Syariah OJK 2016–2026.
Live: **https://des.lotmetrik.my.id** · Brand: Lotmetrik (teal = naik/masuk, merah = turun/keluar).

**Gratis permanen** (lead magnet). Bukan produk berbayar.

## Isi yang di-deploy
- `index.html` — halaman + CSS
- `app.js` — logika (chart, timeline, tracker + verdict, Panduan, modal)
- `data.js` — 21 rilis OJK (bitstring; JANGAN edit tangan)
- `og.png`, favicon, `robots.txt`, `sitemap.xml`
- `404.html` — halaman error branded
- `_headers` — header keamanan dasar Netlify

Tanpa build, tanpa npm. `git push` ke `main` = auto-deploy Netlify.

## Update data DES (tiap ~6 bulan — mandiri, tanpa AI)
Lihat panduan non-coder: **`_update/CARA-UPDATE.md`**.

Ringkas:
1. Unduh Excel DES terbaru dari OJK.
2. Rename: `DES_YYYY_Pn_KEPnn.xlsx` (P1 = tengah tahun, P2 = akhir tahun).
3. Salah satu:
   - **PC:** taruh di `_update/ojk_excel/` → double-click `update.bat`
   - **Browser:** upload file itu ke folder yang sama di GitHub → Actions regen + deploy
4. Script otomatis: regenerasi `data.js`, **850 halaman `/saham/KODE`**, `sitemap.xml`, samakan angka meta, gambar ulang `og.png`, naikkan `?v=`.
5. Cek live (Ctrl+Shift+R). Contoh halaman: https://des.lotmetrik.my.id/saham/ASII

Checklist hari-H: `RELEASE-PLAYBOOK.md`. Reminder Telegram otomatis 29 Mei & 29 Nov (Cloudflare Worker).

## Aturan agent / AI
Baca **`AGENTS.md`** (dan `../HANDOFF.md` di folder induk) sebelum mengubah apa pun.

## Cache
Tiap ubah `app.js` / `data.js` / CSS di `index.html` → naikkan `?v=NNN` di **kedua** tag `<script>`.

---
Lotmetrik · Sumber: OJK Daftar Efek Syariah. Edukasi, bukan rekomendasi investasi.
