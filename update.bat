@echo off
setlocal
cd /d "%~dp0"
echo ============================================
echo    UPDATE DES DASHBOARD  (des.lotmetrik.my.id)
echo ============================================
echo.
echo Sebelum lanjut, pastikan file Excel OJK terbaru sudah kamu taruh di:
echo    _update\ojk_excel\
echo Nama file WAJIB: DES_TAHUN_Pn_KEPno.xlsx
echo    contoh rilis akhir 2026 SK no.60 -^> DES_2026_P2_KEP60.xlsx
echo    (P1 = rilis pertengahan tahun, P2 = rilis akhir tahun)
echo.
echo CATATAN: langkah publish butuh login GitHub yang sudah tersimpan di PC ini.
echo Kalau muncul jendela login GitHub, ikuti saja (cukup sekali seumur PC).
echo.
pause

set "PY=python"
where python >nul 2>nul || set "PY=C:\Python314\python.exe"

echo.
echo [1/4] Menghitung ulang data...
"%PY%" _update\build_data.py
if errorlevel 1 goto :err

echo.
echo [2/4] Menggambar ulang gambar preview (og.png)...
"%PY%" _update\render_og.py
if errorlevel 1 goto :err

echo.
echo [3/4] (halaman SEO per saham sudah digenerate di langkah 1)
echo.

echo [4/4] Publish ke GitHub (Netlify akan deploy otomatis)...
git add data.js index.html og.png sitemap.xml saham _update\ojk_excel
git diff --cached --quiet
if not errorlevel 1 (
  echo Tidak ada perubahan data - tidak ada yang perlu di-publish.
  goto :done
)
git commit -m "Update data DES"
if errorlevel 1 goto :err
git push
if errorlevel 1 goto :err

:done
echo.
echo ============================================
echo    SELESAI. Buka https://des.lotmetrik.my.id
echo    (tekan Ctrl+Shift+R kalau masih tampil angka lama)
echo ============================================
pause
exit /b 0

:err
echo.
echo ============================================
echo    GAGAL - baca pesan error di atas.
echo    Kalau soal "format Excel berubah", minta bantuan (AI/dev).
echo    Kalau soal login GitHub: buka github.com, login, lalu coba lagi.
echo ============================================
pause
exit /b 1
