# DES Dashboard — Release Playbook (tiap rilis OJK, ~2x/tahun)

Rilis DES cuma keluar **sekitar 2x setahun** (pertengahan & akhir tahun) — ini satu-satunya
momen traffic organik. Rilis berikutnya diperkirakan **≈ Des 2026**. Jalankan checklist ini
di hari SK (KEP) baru terbit. Situs = static, deploy lewat `git push` (Netlify auto-deploy).

## H-7 (siap-siap)
- [ ] Pantau OJK: <https://ojk.go.id/id/kanal/syariah/data-dan-statistik/daftar-efek-syariah/>
- [ ] Draft carousel IG @lotmetrik dari data lama (pakai tombol **Salin caption** + **Unduh CSV** di situs).

## H+0 (hari KEP terbit) — urut
1. [ ] Unduh Excel DES terbaru dari OJK (ini sumber resmi; WAJIB dari OJK, bukan pihak ketiga).
2. [ ] Regenerasi `data.js` (kasih Excel ke Claude / `parse_des.py`). Pastikan log rekonsiliasi **tidak ada "!!MISMATCH"**.
3. [ ] Timpa `data.js` di `des-flow-tool-v2/`. JANGAN edit tangan (850 saham × N rilis).
4. [ ] **Samakan angka STATIS di `index.html`** (JavaScript tidak bisa update ini, crawler baca ini):
   - `<title>`, `meta description`, `og:description`, `twitter:description`, `og:image:alt`
   - Literal cerita **"307 / 688 / 622"** → sesuaikan kalau awal/puncak/terakhir berubah.
   - **"21 rilis"** di JSON-LD + teks → naikkan kalau jumlah rilis bertambah.
5. [ ] Gambar ulang OG: `python _render_og_desdash.py` (angka auto dari `data.js`).
6. [ ] Naikkan cache-buster `?v=NNN` di **2** tag `<script>` di `index.html`.
7. [ ] Cek cepat di browser lokal: angka Kini/Puncak, lacak 1 saham (verdict ADA/TIDAK), buka Panduan.
8. [ ] `git add -A && git commit && git push` → Netlify auto-deploy.
9. [ ] Verifikasi live: buka **des.lotmetrik.my.id**, hard-refresh (Ctrl+Shift+R).
10. [ ] Broadcast ke Telegram **@lotmetrik** + posting carousel IG "X saham keluar DES <bulan tahun>".
11. [ ] (Opsional) Re-scrape preview link di Facebook Sharing Debugger / Twitter Card Validator biar og.png baru kebaca.

## Catatan
- **Kriteria syariah saat ini = POJK 8/2025** (utang berbasis bunga → 33% bertahap 10 th; pendapatan non-halal < 5%, berlaku ~Apr 2026). Kalau OJK ubah lagi, koreksi `buildPanduan()` di `app.js`.
- Semua angka on-page dihitung ulang otomatis dari `data.js` — kecuali literal statis di langkah 4.
- **Jangan pernah** janji "prediksi/skor keluar". Data ini cuma riwayat kehadiran (matriks 0/1), **tanpa** rasio keuangan/sektor/harga.
- v1 lama (celebrated-choux) sudah 301-redirect ke sini — abaikan, jangan di-update.
