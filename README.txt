KASIRNUSA - WEBSITE KASIR DIGITAL UMKM
======================================

ISI FOLDER
----------
1. index.html  : Struktur halaman website.
2. style.css   : Desain dan tata letak website.
3. script.js   : Fitur interaktif, perhitungan, dan penyimpanan data.

CARA MENJALANKAN
----------------
1. Ekstrak folder ZIP.
2. Buka folder KasirNusa-HTML-CSS-JS di Visual Studio Code.
3. Buka file index.html.
4. Klik kanan pada index.html lalu pilih Open with Live Server.
   Alternatif: klik dua kali index.html untuk membukanya di browser.

FITUR
-----
- Dashboard ringkasan penjualan.
- Kasir dan keranjang belanja.
- Perhitungan total dan kembalian otomatis.
- Pengelolaan produk (tambah, edit, hapus).
- Kategori dan filter produk.
- Stok otomatis berkurang setelah transaksi selesai.
- Riwayat transaksi dan cetak struk.
- Laporan omzet, keuntungan, dan produk terlaris.
- Ekspor riwayat dan laporan ke CSV.
- Data tersimpan di LocalStorage browser.

PENERAPAN MATEMATIKA DISKRIT (TEPAT DUA MATERI)
------------------------------------------------
1. HIMPUNAN:
   - script.js menggunakan Set pada fungsi getCategorySet() untuk
     membentuk himpunan kategori unik dari data produk.
   - Fungsi getProductsByCategory() menampilkan anggota himpunan produk
     berdasarkan kategori yang dipilih.

2. FUNGSI:
   - hitungSubtotal(harga, jumlah)
   - hitungTotal(items)
   - hitungKembalian(uangDiterima, total)
   - hitungKeuntungan(items)
   Fungsi-fungsi tersebut memetakan input menjadi hasil perhitungan
   transaksi secara konsisten.

CATATAN
-------
- Website ini adalah prototipe frontend dan tidak memerlukan server.
- Data disimpan pada browser/perangkat yang digunakan. Jangan menghapus
  data situs/browser apabila ingin mempertahankan data transaksi.
- Pembayaran hanya simulasi; tidak terhubung ke bank atau payment gateway.
- Untuk penggunaan bisnis sungguhan, dibutuhkan backend, database,
  autentikasi pengguna, backup, dan integrasi pembayaran.
- File script.js adalah JavaScript, bukan bahasa Java.
