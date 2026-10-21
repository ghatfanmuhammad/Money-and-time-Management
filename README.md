# Hidupku

Aplikasi web pribadi untuk mengatur jadwal mingguan dan keuangan di satu tempat. Dibuat dengan HTML, CSS, dan JavaScript biasa, tanpa framework dan tanpa instalasi. Data tersimpan di browser (localStorage), jadi aplikasi bisa dipakai tanpa internet.

Proyek ini dibuat sebagai latihan belajar web. Kode sengaja dipecah ke banyak file kecil dengan komentar berbahasa Indonesia supaya mudah dibaca dari atas ke bawah.

## Yang bisa dilakukan

- Mencatat pengeluaran dan pemasukan dengan satu baris teks, misalnya `geprek 15000`.
- Melihat saldo, pengeluaran per kategori, dan sisa budget minggu ini.
- Mengatur kegiatan per minggu, dalam tampilan kartu per hari atau papan Kanban (Belum, Proses, Selesai).
- Melihat pola pengeluaran 5 minggu terakhir lewat peta panas.
- Menetapkan batas pengeluaran mingguan per kategori.
- Membuat cadangan data ke file JSON dan memulihkannya.
- Memilih 4 warna aksen dan mode terang atau gelap.

## Cara menjalankan

1. Ekstrak folder ini.
2. Klik dua kali `index.html`. Browser (Chrome, Edge, Firefox, atau Safari versi terbaru) akan membukanya.

Saat pertama dibuka, aplikasi berisi data contoh. Hapus lewat tombol "Hapus data contoh" di Beranda kalau ingin mulai dari kosong.

Kalau lebih suka membukanya lewat alamat lokal, jalankan `python3 -m http.server 8000` di dalam folder ini lalu buka `http://localhost:8000`. Cara ini tidak wajib.

## Catat lewat Telegram

Server kecil di folder `server/` menyimpan data di SQLite dan menjalankan bot Telegram. Pesan yang kamu kirim ke bot dibaca dengan `bacaCatatan()` yang sama seperti kolom catat cepat, lalu langsung muncul di web. Butuh Node.js 22.13 atau lebih baru. Tidak ada paket yang perlu dipasang.

Menyiapkan bot (sekali saja):

1. Di Telegram, chat ke `@BotFather`, kirim `/newbot`, ikuti langkahnya. Salin token yang diberikan.
2. Salin `server/.env.example` menjadi `server/.env`, isi `TELEGRAM_TOKEN=` dengan token tadi.
3. Jalankan `npm start` (atau `node server/server.js`), lalu buka `http://localhost:3000`. Buka web sekali dulu supaya datanya tersimpan di server.
4. Kirim pesan apa saja ke bot kamu. Bot membalas dengan ID Telegram-mu. Isi `TELEGRAM_ALLOWED_ID=` di `server/.env` dengan ID itu, lalu jalankan ulang server. Setelah itu bot hanya menerima pesan dari akunmu.

Pemakaian: kirim `geprek 15000`, `+500000 uang saku`, dan seterusnya, sama seperti di tabel "Catat cepat". Catatan yang kategorinya tidak dikenali masuk ke Kotak masuk di web. Perintah lain: `/saldo` dan `/hari`.

Hal yang perlu diketahui:

- Bot hanya bekerja selagi `npm start` berjalan di komputer ini dan komputer tersambung internet. Pesan yang dikirim saat server mati akan diproses begitu server menyala lagi (Telegram menyimpannya sekitar 24 jam).
- Web harus dibuka lewat `http://localhost:3000` supaya tersambung ke server. Kalau `index.html` dibuka langsung dari folder, aplikasi memakai data di browser saja dan tidak ikut menerima catatan dari bot.
- Web memeriksa perubahan dari bot tiap 4 detik. Kalau kamu sedang mengetik di kolom isian, halaman tidak diperbarui sampai kolom itu ditinggalkan.
- Server hanya menerima koneksi dari komputer ini dan API-nya belum memakai login. Jangan dibuka ke internet tanpa menambah login.
- `server/.env` berisi token bot dan `server/data/hidupku.db` berisi seluruh datamu. Jangan dibagikan.

## Halaman

| Halaman | Isi |
|---|---|
| Beranda | Saldo, pemasukan dan pengeluaran minggu ini, sisa budget, kegiatan hari ini, pengeluaran per kategori, peta panas, papan jadwal, transaksi terbaru |
| Jadwal | Kegiatan Senin sampai Minggu, bisa pindah minggu. Tampilan kartu per hari atau papan Kanban |
| Keuangan | Tambah, ubah, hapus transaksi. Filter berdasarkan bulan, jenis, kategori, dan kata kunci. Koreksi saldo |
| Anggaran | Batas pengeluaran mingguan per kategori. Bar berubah kuning di 80% dan merah saat lewat batas |
| Laporan | Pengeluaran per kategori dan per hari, serta grafik saldo harian untuk 7 hari terakhir, bulan ini, atau bulan lalu |
| Kotak masuk | Catatan cepat yang kategorinya tidak dikenali, menunggu kamu memilih kategori |
| Pengaturan | Warna aksen, mode gelap, saldo awal, cadangan data |

## Catat cepat

Ketik di kolom paling atas, lalu tekan Enter.

| Ketik | Hasil |
|---|---|
| `geprek 15000` | Pengeluaran Rp15.000, kategori Makan |
| `kopi 12rb` | Pengeluaran Rp12.000, kategori Jajan |
| `ojek 10k` | Pengeluaran Rp10.000, kategori Transport |
| `+500000 uang saku` | Pemasukan Rp500.000 |
| `tf ortu 1,5jt` | Pemasukan Rp1.500.000 |
| `kemarin bakso 20000` | Pengeluaran dengan tanggal kemarin |
| `saldo 250000` | Koreksi saldo menjadi Rp250.000 |

Aturan yang dipakai:

- `rb` dan `k` berarti ribu, `jt` berarti juta. Koma dibaca sebagai desimal (`1,5jt` = 1.500.000).
- Awalan `+` berarti pemasukan, awalan `-` berarti pengeluaran.
- Kata `tf`, `transfer`, `gaji`, `kiriman`, `dapat`, dan `masuk` dianggap pemasukan. `tf ke ...` dan `bayar ...` dianggap pengeluaran.
- Kategori ditebak dari kata kunci. Kalau tidak ada yang cocok, catatan masuk ke Kotak masuk, tidak ditolak.
- Koreksi saldo dicatat sebagai selisih antara saldo di aplikasi dan angka yang kamu ketik. Koreksi ikut menghitung saldo, tetapi tidak dihitung sebagai pemasukan atau pengeluaran di laporan.

## Struktur folder

```
hidupku/
├── index.html            kerangka halaman: menu, kolom catat cepat, jendela form
├── css/
│   ├── dasar.css         warna, tema, mode gelap, gaya huruf
│   ├── tata-letak.css    bingkai aplikasi, menu samping, grid, tampilan HP
│   ├── komponen.css      kartu, tombol, bar, lencana, form, jendela
│   └── halaman.css       gaya khusus tiap halaman
├── js/
│   ├── config.js         kategori, kata kunci, nama hari, tema
│   ├── utils.js          tanggal, format rupiah, pengaman teks
│   ├── data.js           objek data S, simpan dan muat, data contoh
│   ├── hitung.js         saldo, total, budget, data peta panas
│   ├── parser.js         pembaca catat cepat (tidak menyentuh halaman)
│   ├── ui.js             potongan tampilan bersama: baris kegiatan, papan, peta panas
│   ├── dialog.js         jendela form tambah dan ubah
│   ├── halaman/          satu file per halaman
│   │   ├── beranda.js
│   │   ├── jadwal.js
│   │   ├── keuangan.js
│   │   ├── anggaran.js
│   │   ├── laporan.js
│   │   ├── inbox.js
│   │   └── pengaturan.js
│   ├── aksi.js           semua klik, isian, dan seret-lepas
│   └── app.js            memilih halaman dan menggambarnya (dimuat terakhir)
├── server/
│   ├── server.js         server HTTP: menyajikan web, API data, menjalankan bot
│   ├── db.js             penyimpanan SQLite (satu dokumen JSON + nomor versi)
│   ├── telegram.js       bot Telegram (long polling)
│   ├── catat.js          pesan teks -> perubahan data
│   ├── parser-bersama.js memuat js/parser.js ke server tanpa menyalinnya
│   └── .env.example      contoh pengaturan token bot
└── tests/
    ├── parser.test.js    tes pembaca catat cepat
    └── catat.test.js     tes penerapan pesan ke data (sisi server)
```

`js/sinkron.js` menyambungkan web ke server. Kalau server tidak ada, web memakai localStorage seperti sebelumnya.

File JavaScript dimuat dari `index.html` dengan urutan tertentu. File yang dipakai file lain harus dimuat lebih dulu, jadi kalau menambah file baru, tambahkan `<script>`-nya di tempat yang sesuai.

## Cara kerja kodenya

Alurnya selalu sama:

1. Pengguna mengklik sesuatu. Tombol di HTML punya atribut `data-aksi="nama"`.
2. Satu pendengar klik di `aksi.js` mencari fungsi bernama sama di objek `AKSI` dan menjalankannya.
3. Fungsi itu mengubah data `S` lalu memanggil `simpan()` untuk menulis ke localStorage.
4. `render()` di `app.js` membuat ulang HTML halaman yang sedang dibuka dari data terbaru.

Tiap halaman adalah fungsi (`vBeranda`, `vJadwal`, dan seterusnya) yang mengembalikan teks HTML. Tidak ada library, jadi untuk memahami satu halaman cukup membaca satu file di `js/halaman/`.

## Mengubah sesuai kebutuhan

| Mau mengubah | Buka | Bagian |
|---|---|---|
| Menambah kategori pengeluaran | `js/config.js` | `KATEGORI`, lalu `anggaran` di `bawaan()` pada `js/data.js` |
| Menambah kata kunci kategori | `js/config.js` | `KATA_KUNCI` |
| Mengganti warna | `css/dasar.css` | `:root` dan `[data-tema="..."]` |
| Menambah tema warna | `css/dasar.css` dan `js/config.js` | satu baris `[data-tema]` dan satu entri `TEMA` |
| Mengubah cara teks dibaca | `js/parser.js` | `bacaCatatan()` |
| Menambah halaman | `js/halaman/`, `js/app.js`, `index.html` | file baru, daftar `HALAMAN`, menu dan `<script>` |

## Menjalankan tes

Tes mencakup pembaca catat cepat (aturan yang paling mudah salah) dan penerapan pesan ke data di server. Butuh Node.js:

```
npm test
```

## Soal data

- Data tersimpan di browser pada komputer ini, bukan di internet.
- Data tidak ikut pindah ke HP atau komputer lain, dan hilang kalau data situs browser dibersihkan.
- Buat cadangan lewat Pengaturan, "Unduh cadangan (.json)", dan pulihkan lewat tombol di sebelahnya.
- Membuka `index.html` dari folder yang berbeda atau lewat alamat yang berbeda (misalnya dari `file://` lalu `localhost`) dianggap browser sebagai situs berbeda, jadi datanya terpisah.

## Rencana pengembangan

Belum dikerjakan, urutannya dari yang paling dekat:

1. Memasang server di layanan hosting (dengan login), supaya web bisa dibuka dari HP dan laptop, dan bot tetap hidup tanpa komputer menyala.
2. Bot WhatsApp lewat WhatsApp Business Cloud API, dengan alur yang sama seperti bot Telegram. Syarat dan biayanya perlu dicek di dokumentasi resmi Meta.
3. Login, kalau webnya dipublikasikan (wajib sebelum server dibuka ke internet).

`js/parser.js` sengaja dibuat tanpa ketergantungan pada halaman atau localStorage. Hanya `config.js` dan fungsi tanggal di `utils.js` yang ikut dibutuhkan, jadi file itu bisa dipindah ke server nanti.
