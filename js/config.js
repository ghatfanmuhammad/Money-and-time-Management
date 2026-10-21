'use strict';
/* Konstanta aplikasi.
   Mau tambah kategori atau kata kunci catat cepat? Ubah di file ini. */

const KUNCI = 'hidupku_v1'; // nama tempat data di localStorage

const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const HARI_PENDEK = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];   // urutan getDay()
const HARI_SENIN = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];    // urutan tampil, mulai Senin
const NAMA_BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli',
  'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const BULAN_PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

// Kategori pengeluaran. "Pemasukan" dan "Koreksi" adalah kategori khusus.
const KATEGORI = ['Makan', 'Jajan', 'Transport', 'Belanja', 'Kuliah', 'Tagihan', 'Hiburan', 'Kesehatan', 'Lainnya'];

// Kata kunci untuk menebak kategori dari catatan cepat.
// Contoh: tambahkan 'mixue' ke daftar Jajan kalau belum ada.
const KATA_KUNCI = {
  Makan: ['geprek', 'nasi', 'ayam', 'makan', 'bakso', 'mie', 'mi', 'soto', 'warteg', 'sate', 'lauk',
    'sarapan', 'kantin', 'pecel', 'gado', 'lele', 'siomay', 'katsu', 'martabak'],
  Jajan: ['kopi', 'boba', 'es', 'teh', 'snack', 'cemilan', 'jajan', 'minum', 'roti', 'gorengan',
    'cilok', 'seblak', 'donat', 'susu', 'mixue'],
  Transport: ['ojek', 'gojek', 'grab', 'bensin', 'parkir', 'angkot', 'krl', 'bus', 'tol', 'ojol',
    'maxim', 'kereta', 'travel'],
  Belanja: ['belanja', 'shopee', 'tokopedia', 'baju', 'sabun', 'skincare', 'indomaret', 'alfamart',
    'sampo', 'sepatu'],
  Kuliah: ['fotokopi', 'fotocopy', 'print', 'buku', 'ukt', 'spp', 'kuliah', 'alat tulis', 'materai'],
  Tagihan: ['kuota', 'pulsa', 'listrik', 'wifi', 'kos', 'kost', 'token'],
  Hiburan: ['nonton', 'game', 'netflix', 'spotify', 'topup', 'top up', 'bioskop', 'konser'],
  Kesehatan: ['obat', 'dokter', 'apotek', 'vitamin', 'klinik'],
};

// Status dan prioritas kegiatan. Urutannya dipakai saat klik untuk berganti.
const URUT_STATUS = ['belum', 'proses', 'selesai'];
const NAMA_STATUS = { belum: 'Belum', proses: 'Proses', selesai: 'Selesai' };
const URUT_PRIORITAS = ['tinggi', 'sedang', 'rendah'];
const NAMA_PRIORITAS = { tinggi: 'Tinggi', sedang: 'Sedang', rendah: 'Rendah' };

// Nama yang tampil di sapaan dan profil di bilah atas.
const PROFIL = { nama: 'Yusla Hakimah', email: 'yusla.hakimah@gmail.com' };

// Tema warna. Nilai warna lengkapnya ada di css/dasar.css. Tema pertama adalah bawaan.
const TEMA = [
  { id: 'jingga', nama: 'Jingga', warna: '#d1430e' },
  { id: 'ungu', nama: 'Ungu', warna: '#6b4fcf' },
  { id: 'hijau', nama: 'Hijau', warna: '#2f7d4f' },
  { id: 'biru', nama: 'Biru', warna: '#2f6db3' },
];
