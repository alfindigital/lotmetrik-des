# Cara update DES sendiri (tiap ~6 bulan, tanpa perlu Claude)

Data DES cuma berubah **~2x setahun** (pertengahan & akhir tahun). Tiap OJK terbit rilis
baru, kamu tinggal kasih 1 file Excel — semua angka, grafik, verdict, dan gambar preview
**hitung ulang sendiri**. Ada **2 cara**, pilih yang cocok.

---

## Yang kamu butuhkan tiap rilis (sama untuk kedua cara)

1. **Unduh Excel DES terbaru dari OJK**
   → <https://ojk.go.id/id/kanal/syariah/data-dan-statistik/daftar-efek-syariah/>
   → cari rilis terbaru, unduh file Excel (.xlsx) daftar sahamnya.

2. **Ganti nama file-nya** jadi format ini (PENTING, ini yang dibaca sistem):

   ```
   DES_<TAHUN>_P<1 atau 2>_KEP<NOMOR SK>.xlsx
   ```

   - **TAHUN** = tahun rilis, mis. `2026`
   - **P1** = rilis **pertengahan** tahun (biasanya efektif 1 Jun) · **P2** = rilis **akhir** tahun (biasanya 1 Des)
   - **NOMOR SK** = angka di nomor Keputusan (KEP) OJK. Contoh SK `KEP-60/D.04/2026` → tulis `KEP60`.

   Contoh nama yang benar: **`DES_2026_P2_KEP60.xlsx`**

> Nomor SK ada di pengumuman OJK (judulnya "Keputusan ... tentang Daftar Efek Syariah").
> Tanggal efektif diisi otomatis (P1=1 Jun, P2=1 Des). Kalau SK-nya kebetulan pakai tanggal
> beda (jarang), lihat catatan di bawah.

---

## CARA 1 — Lewat komputer (double-click)

Paling cepat, semua di PC kamu.

1. Taruh file Excel (yang sudah diganti nama) ke folder:
   `des-flow-tool-v2\_update\ojk_excel\`
2. **Double-click `update.bat`** (ada di folder `des-flow-tool-v2`).
3. Ikuti layar → ketik apa saja saat diminta "pause" → biarkan jalan.
4. Kalau muncul **"SELESAI"**, buka <https://des.lotmetrik.my.id> (Ctrl+Shift+R). Beres.

Kalau muncul **"GAGAL"**, baca pesan merahnya. Biasanya karena nama file salah — betulkan, ulangi.

*(Butuh: Python + Git sudah terpasang di PC — sudah ada. Kalau `git push` minta login sekali,
ikuti popup browser-nya, cukup sekali seumur PC.)*

---

## CARA 2 — Lewat browser (GitHub, tanpa PC)

Kalau PC-mu lagi mati / kamu di HP. Robot GitHub yang kerja.

1. Buka repo: <https://github.com/alfindigital/lotmetrik-des>
2. Masuk folder **`_update/ojk_excel`**.
3. Klik **"Add file" → "Upload files"**, seret file Excel (yang sudah diganti nama), lalu
   **"Commit changes"**.
4. Selesai. Robot (**GitHub Actions**) otomatis: hitung ulang data + gambar og.png + publish.
   Netlify deploy sendiri ~1–2 menit. Cek tab **"Actions"** di repo kalau mau lihat prosesnya
   (centang hijau = sukses).

---

## Setelah update (opsional tapi bagus)

- Posting IG @lotmetrik: "X saham keluar DES [bulan tahun]".
- Kirim kabar ke channel Telegram @lotmetrik.
- (Kalau share link lama masih tampil angka lama) refresh preview di
  [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) — tempel URL, "Scrape Again".

---

## Catatan penting

- **Yang berubah cuma `data.js`, `index.html`, `og.png`** — otomatis. Kamu tidak menyentuh kode.
- **Rilis lama tidak berubah.** Tanggal & nomor SK rilis-rilis sebelumnya diambil dari data
  yang sudah ada; cuma rilis BARU yang ditambah.
- **Kalau tanggal efektif SK OJK tidak standar** (bukan 1 Jun / 1 Des): jalankan sekali dulu,
  lalu buka `data.js`, cari rilis baru itu, ganti `"date":"1 Des 2026"` ke tanggal yang benar,
  simpan, jalankan `update.bat` lagi (atau upload ulang).
- **Satu-satunya yang bisa bikin gagal:** kalau OJK mengubah **format/susunan kolom** file
  Excel-nya (jarang — stabil bertahun-tahun). Kalau kejadian, script berhenti dan bilang
  "format Excel berubah". Saat itu perlu 1x tambal parser (`_update/parse_des.py`) — minta
  bantuan dev/Claude sekali, setelah itu lanjut mandiri lagi.

## Isi folder `_update/`
- `ojk_excel/` — arsip semua Excel OJK (jangan hapus yang lama; tambah yang baru).
- `parse_des.py` — pembaca Excel OJK (teruji, tangani kuirk formatnya).
- `build_data.py` — hitung ulang → `data.js` + sinkron angka di `index.html` + naikkan cache.
- `render_og.py` — gambar ulang `og.png` (pakai font di `fonts/`, jalan di Windows & Linux).
- `fonts/` — Plus Jakarta Sans + JetBrains Mono (open-source, sama seperti font situs).
