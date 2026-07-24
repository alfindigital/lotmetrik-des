# -*- coding: utf-8 -*-
"""
build_data.py — Regenerasi data.js dari Excel OJK + samakan angka statis di index.html.

Baca SEMUA file di _update/ojk_excel/ (nama wajib: DES_<TAHUN>_P<1|2>_KEP<NO>.xlsx),
hitung ulang seluruh matriks kehadiran saham, tulis ../data.js, lalu perbarui angka
statis di ../index.html (deskripsi share, jumlah rilis, rentang tahun) dan naikkan
cache-buster (?v=NNN). Rilis lama memakai tanggal & nomor SK dari data.js yang ada;
rilis BARU diturunkan otomatis dari nama file (SK) + pola P1=Jun / P2=Des.

Jalankan:  python _update/build_data.py
Butuh:     pip install openpyxl
"""
import os, re, sys, json, glob

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
EXCEL_DIR = os.path.join(HERE, "ojk_excel")
DATA_JS = os.path.join(ROOT, "data.js")
INDEX = os.path.join(ROOT, "index.html")
sys.path.insert(0, HERE)
from parse_des import des_map, key_of   # parser OJK-excel yang sudah teruji

BLN = {"1": "Jun", "2": "Des"}   # tanggal efektif default: P1 pertengahan tahun, P2 akhir tahun


def die(msg):
    print("\n[GAGAL] " + msg)
    sys.exit(1)


def kep_from_filename(path, key):
    m = re.search(r'_KEP(\d+)', os.path.basename(path))
    return f"KEP-{m.group(1)}/D.04/{key[:4]}" if m else ""


def load_existing_meta():
    """key -> {date, kep} dari data.js lama, supaya rilis lama tetap persis akurat."""
    if not os.path.exists(DATA_JS):
        return {}
    raw = open(DATA_JS, encoding="utf-8").read()
    try:
        raw = raw[raw.index("{"): raw.rindex("}") + 1]
        d = json.loads(raw)
        return {m["key"]: {"date": m.get("date"), "kep": m.get("kep")} for m in d["meta"]}
    except Exception:
        print("[WARN] data.js ADA tapi tidak bisa dibaca — tanggal/nomor SK rilis lama akan di-reset dari nama file.")
        print("       Kalau ini tidak disengaja, batalkan (tutup jendela) dan minta bantuan sebelum lanjut.")
        return {}


def main():
    files = sorted(glob.glob(os.path.join(EXCEL_DIR, "*.xlsx")), key=key_of)
    if not files:
        die(f"Tidak ada file .xlsx di {EXCEL_DIR}\n       Taruh file OJK di sana dulu (nama: DES_2026_P2_KEP60.xlsx).")

    maps, kepf = {}, {}
    for f in files:
        k = key_of(f)
        if not re.match(r'^\d{4}_P[12]$', k):
            die(f"Nama file salah: {os.path.basename(f)}\n       Harus: DES_<TAHUN>_P<1atau2>_KEP<NOMOR>.xlsx (mis. DES_2026_P2_KEP60.xlsx)")
        maps[k] = des_map(f)
        kepf[k] = kep_from_filename(f, k)
        if not maps[k]:
            die(f"File {os.path.basename(f)} tidak menghasilkan satu pun kode saham 4-huruf.\n       Kemungkinan format Excel OJK berubah — perlu penyesuaian parser.")

    order = sorted(maps, key=lambda k: (int(k[:4]), k[-1]))

    # ---- validasi rekonsiliasi (prev + masuk - keluar == cur) : WAJIB lolos ----
    ok = True
    print("rilis      total   masuk/keluar")
    for i, k in enumerate(order):
        cur = set(maps[k])
        if i == 0:
            print(f"{k:10s}{len(cur):>6d}   (baseline)")
            continue
        prev = set(maps[order[i - 1]])
        mk, kl = cur - prev, prev - cur
        good = (len(prev) + len(mk) - len(kl) == len(cur))
        ok = ok and good
        print(f"{k:10s}{len(cur):>6d}   +{len(mk)}/-{len(kl)}  {'OK' if good else '!! TIDAK COCOK'}")
    if not ok:
        die("Rekonsiliasi masuk/keluar tidak cocok. Cek file Excel (mungkin salah/ganda/format berubah). Tidak menulis apa pun.")

    names = {}
    for k in order:
        for c, nm in maps[k].items():
            if nm:
                names[c] = nm
    union = sorted(set().union(*[set(maps[k]) for k in order]))
    present = {c: "".join("1" if c in maps[k] else "0" for k in order) for c in union}

    existing = load_existing_meta()
    if existing and len(order) < len(existing):
        die(f"Rilis yang terbaca ({len(order)}) LEBIH SEDIKIT dari data sebelumnya ({len(existing)}).\n"
            f"       JANGAN hapus file Excel lama dari _update/ojk_excel/ — semua rilis historis harus tetap ada. Tidak menulis apa pun.")
    meta = []
    for k in order:
        total = len(maps[k])
        if k in existing and existing[k].get("date") and existing[k].get("kep"):
            date, kep = existing[k]["date"], existing[k]["kep"]
        else:
            date = f"1 {BLN[k[-1]]} {k[:4]}"
            kep = kepf[k]
            print(f"  + RILIS BARU {k}: date='{date}', kep='{kep}'")
            print(f"    (kalau tanggal efektif di SK OJK beda, edit field 'date' rilis ini di data.js lalu jalankan lagi)")
        meta.append({"key": k, "date": date, "kep": kep, "total": total})

    # ---- tulis data.js ----
    header = ("/* Lotmetrik · DES Dashboard data · sumber resmi OJK (Daftar Efek Syariah) "
              + order[0][:4] + "-" + order[-1][:4] + " · des.lotmetrik.my.id */\n")
    body = "window.DES=" + json.dumps({"meta": meta, "names": names, "present": present}, ensure_ascii=False) + ";\n"
    open(DATA_JS, "w", encoding="utf-8", newline="\n").write(header + body)

    first, last = meta[0]["total"], meta[-1]["total"]
    peak = max(m["total"] for m in meta)
    N = len(meta)
    yEnd = order[-1][:4]

    # ---- samakan angka statis di index.html (yang tak bisa di-update JS) ----
    html = open(INDEX, encoding="utf-8").read()
    before = html
    subs = [
        (r'\d+ jadi \d+ lalu \d+', f'{first} jadi {peak} lalu {last}'),          # og:description
        (r'dari \d+ ke puncak \d+ lalu \d+', f'dari {first} ke puncak {peak} lalu {last}'),  # og:image:alt
        (r'Riwayat \d+ rilis', f'Riwayat {N} rilis'),                             # JSON-LD
        (r'2016([–\-/])20\d\d', r'2016\g<1>' + yEnd),                        # rentang tahun (en-dash/hyphen/slash)
    ]
    for pat, rep in subs:
        html = re.sub(pat, rep, html)
    # naikkan cache-buster data.js & app.js
    vs = [int(v) for v in re.findall(r'\.js\?v=(\d+)', html)]
    newv = (max(vs) + 1) if vs else 1
    html = re.sub(r'(\.js)\?v=\d+', r'\g<1>?v=' + str(newv), html)
    open(INDEX, "w", encoding="utf-8", newline="\n").write(html)

    print(f"\n[OK] data.js ditulis: {N} rilis · {len(union)} saham unik.")
    print(f"     Kini={last}  Puncak={peak}  Awal={first}  · index.html cache ?v={newv}")

    # ---- halaman SEO per saham + sitemap ----
    from generate_saham import main as gen_saham
    gen_saham()

    print("     og.png belum digambar ulang — jalankan: python _update/render_og.py")


if __name__ == "__main__":
    main()
