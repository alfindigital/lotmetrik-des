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
pause

set "PY=python"
where python >nul 2>nul || set "PY=C:\Python314\python.exe"

echo.
echo [1/3] Menghitung ulang data...
"%PY%" _update\build_data.py
if errorlevel 1 goto :err

echo.
echo [2/3] Menggambar ulang gambar preview (og.png)...
"%PY%" _update\render_og.py
if errorlevel 1 goto :err

echo.
echo [3/3] Publish ke GitHub (Netlify akan deploy otomatis)...
git add -A
git commit -m "Update data DES"
git push
if errorlevel 1 goto :err

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
echo    Kalau soal "format Excel berubah", minta bantuan (Claude/dev).
echo ============================================
pause
exit /b 1
