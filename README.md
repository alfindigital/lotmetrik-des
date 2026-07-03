# DES Explorer v2 — Lotmetrik

Alat data gratis: telusuri Daftar Efek Syariah OJK 2016-2026. Statis, tanpa server, tanpa biaya. Brand: Lotmetrik (flat data-terminal, teal=naik, merah=turun).

## Isi folder (yang di-deploy)
- `index.html` — halaman utama + seluruh gaya (design system lotmetrik).
- `app.js` — logika (chart, timeline periode, pelacak saham, fakta, modal).
- `data.js` — data resmi OJK 21 rilis (diverifikasi).
- `og.png` — gambar preview saat link dibagikan.
- `favicon.svg` — ikon tab.

Cukup 5 file. Tanpa build, tanpa npm.

## Deploy (pilih SATU, gratis)
### Netlify Drop (paling gampang)
1. Buka `https://app.netlify.com/drop`
2. Seret folder `des-flow-tool-v2` ke kotak. Selesai, dapat link.

### Cloudflare Pages / Vercel
Upload isi folder (5 file). Framework preset: **Other** (ini statis).

## Custom domain lotmetrik.my.id
Kalau v1 sudah di Netlify dan kamu mau v2 gantiin di domain yang sama, cukup re-deploy folder ini ke situs Netlify yang sama (drag ulang / Deploys > Drag and drop). Domain ikut otomatis.

Untuk pasang `lotmetrik.my.id` (atau subdomain, mis. `des.lotmetrik.my.id`):
1. Netlify > situs kamu > **Domain management** > **Add a domain** > ketik domainnya.
2. Netlify kasih target DNS. Buka panel domain `.my.id` kamu, tambahkan:
   - Domain utama `lotmetrik.my.id` → `A` record ke IP Netlify (mis. `75.2.60.5`), atau ganti nameserver ke Netlify DNS.
   - Subdomain (mis. `des`) → `CNAME` ke `namasitus.netlify.app`.
3. Tunggu propagasi (menit-jam). HTTPS otomatis dari Netlify (gratis).

Catatan: brand constants menyebut domain utama `lotmetrik.com`. Kalau nanti pindah ke .com, langkahnya sama.

## Update data DES (tiap 6 bulan, manual)
Yang berubah cuma `data.js`. `index.html` & `app.js` tidak disentuh.
1. OJK terbit rilis baru → kasih file Excel-nya ke Claude (skill `des-flow`).
2. Claude regenerasi `data.js` (parse Excel → bitstring). Ini tidak bisa diedit tangan (850 saham × 21 periode).
3. Ganti `data.js`, re-deploy (drag ulang folder). Chart, timeline, tracker, fakta ikut update otomatis.

## Ganti handle / disclaimer
- Handle IG ada di footer `index.html` (`@lotmetrik`). Sudah benar sesuai brand.
- Disclaimer POJK di footer adalah copy terkunci brand. Jangan diubah.

---
Lotmetrik · Tiap lot, ada datanya. Sumber: file resmi OJK (Daftar Efek Syariah). Edukasi, bukan rekomendasi investasi.
