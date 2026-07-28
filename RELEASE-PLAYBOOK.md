# DES Dashboard — Release Playbook (tiap rilis OJK, ~2×/tahun)

Rilis DES periodik OJK: **akhir Mei** (efektif ~1 Juni) dan **akhir November** (efektif ~1 Desember).
Ini momen traffic organik. Situs static; publish = `update.bat` atau upload Excel ke GitHub.

**Sumber langkah update yang benar:** `_update/CARA-UPDATE.md` + `update.bat`.
Dokumen ini = checklist hari-H (update + promosi). Jangan edit `data.js` / `index.html` manual.

---

## H-7 (siap-siap)

- [ ] Pantau OJK: https://ojk.go.id/id/kanal/syariah/data-dan-statistik/daftar-efek-syariah/
- [ ] Siapkan draf konten IG/TikTok/Telegram (pakai kit `_socmed\` atau angka dari situs setelah update)
- [ ] Catat di kalender pribadi: window update (tidak ada bot reminder lagi)

## H+0 (hari KEP terbit) — urut

### A. Update data (wajib, ~2 menit)

1. [ ] Unduh Excel DES terbaru dari OJK (sumber resmi saja).
2. [ ] Rename: `DES_TAHUN_Pn_KEPno.xlsx`  
   Contoh: `DES_2026_P2_KEP60.xlsx` (P1 = tengah tahun, P2 = akhir tahun).
3. [ ] Pilih satu:
   - **PC:** taruh file di `des-flow-tool-v2\_update\ojk_excel\` → double-click **`update.bat`** → tunggu SELESAI.
   - **HP/browser:** GitHub `lotmetrik-des` → `_update/ojk_excel` → Upload files → commit (Actions mengerjakan sisanya).
4. [ ] Script otomatis: `data.js`, halaman `/saham/` + `/rilis/`, sitemap, og.png, cache `?v=`, commit + push → Netlify deploy.
5. [ ] Verifikasi live: https://des.lotmetrik.my.id → **Ctrl+Shift+R**. Cek angka Kini, 1 saham di tracker, 1 halaman `/saham/KODE`.

Kalau **GAGAL**: baca pesan error. Nama file salah = betulkan. Format Excel OJK berubah = minta bantuan AI/dev (`parse_des.py`).

### B. Promosi (funnel brand Lotmetrik)

6. [ ] Posting IG @lotmetrik: "X saham keluar / masuk DES [bulan tahun]" (+ kartu dari `_socmed\out\` bila ada).
7. [ ] Posting TikTok @lotmetrik (carousel / short) — arahkan ke situs atau Telegram.
8. [ ] Broadcast channel Telegram **https://t.me/lotmetrik** (ini funnel utama situs: popup → Telegram).
9. [ ] (Opsional) Refresh preview OG: [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) → Scrape Again.

---

## Catatan tetap

- Kriteria Panduan = **POJK 8/2025** (utang bunga → 33% bertahap; non-halal < 5%).
- Angka on-page dihitung dari `data.js` oleh `build_data.py` — jangan timpa tangan.
- Jangan janji prediksi/skor keluar DES. Data = riwayat kehadiran saja.
- Reminder Cloudflare Worker **sudah dimatikan** (bot dihapus). Andalkan kalender + pantau OJK.
- Halaman SEO `/saham/` (850) + `/rilis/` biarkan; ikut ter-regen tiap update.

## Link cepat

| Apa | URL |
|---|---|
| Situs | https://des.lotmetrik.my.id |
| Repo | https://github.com/alfindigital/lotmetrik-des |
| Cara update detail | `_update/CARA-UPDATE.md` |
| Telegram funnel | https://t.me/lotmetrik |
| OJK DES | https://ojk.go.id/id/kanal/syariah/data-dan-statistik/daftar-efek-syariah/ |
