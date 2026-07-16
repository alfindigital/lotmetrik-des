# DES Explorer v2 — Lotmetrik

Alat data gratis: telusuri Daftar Efek Syariah OJK 2016-2026. Statis, tanpa server, tanpa biaya. Brand: Lotmetrik (flat data-terminal, teal=naik, merah=turun).

## Isi folder (yang di-deploy)
- `index.html` — halaman utama + seluruh gaya (design system lotmetrik).
- `app.js` — logika (chart, timeline periode, pelacak saham, fakta, modal).
- `data.js` — data resmi OJK 21 rilis (diverifikasi).
- `og.png` — gambar preview saat link dibagikan.
- `favicon.svg` — ikon tab.

Cukup 5 file. Tanpa build, tanpa npm.

## Deploy — LIVE via GitHub (otomatis)
Situs ini sudah live di **https://des.lotmetrik.my.id**.
- Repo: `alfindigital/lotmetrik-des` → auto-deploy ke Netlify tiap `git push`.
- Cara update: edit file → `git commit` → `git push`. Netlify build & publish sendiri. **Nol drag-drop.**
- Cache-buster: tiap ubah `app.js`/`data.js`, naikkan `?v=NNN` di tag `<script>` `index.html` biar user tidak kena file basi.

## Update data DES (tiap 6 bulan, manual)
Yang berubah utama cuma `data.js`. `index.html` & `app.js` tidak disentuh.
1. OJK terbit rilis baru → kasih file Excel-nya ke Claude (skill `des-flow`).
2. Claude regenerasi `data.js` (parse Excel → bitstring). Tidak bisa diedit tangan (850 saham × 21 periode).
3. Ganti `data.js`. Chart, timeline, tracker, fakta ikut update **otomatis** dari data.
4. **PENTING (angka statis yang TIDAK auto-update)** — kalau puncak/awal/terakhir/jumlah rilis berubah, samakan manual di `index.html`:
   - `<meta name="description">` dan `og:description` / `twitter:description` (ada literal `307 jadi 688 lalu 622`).
   - `og:image:alt` (menyebut 307 / 688 / 622).
   - `og.png` — gambar preview perlu digambar ulang kalau puncak/terakhir berubah.
   Ini satu-satunya teks yang crawler baca tapi JS tidak bisa perbarui.
5. Naikkan cache-buster `?v=NNN`, lalu `git push`.

## Ganti handle / disclaimer
- Handle IG ada di footer `index.html` (`@lotmetrik`). Sudah benar sesuai brand.
- Disclaimer POJK di footer adalah copy terkunci brand. Jangan diubah.

---
Lotmetrik · Tiap lot, ada datanya. Sumber: file resmi OJK (Daftar Efek Syariah). Edukasi, bukan rekomendasi investasi.
