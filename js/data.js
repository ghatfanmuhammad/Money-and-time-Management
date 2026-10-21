'use strict';
/* Data aplikasi.
   Semua data ada di satu objek bernama S dan disimpan ke localStorage.
   Alur dasarnya: data berubah -> simpan() -> render() menggambar ulang halaman. */

const DESAIN = 2; // naik kalau tampilan berubah besar, supaya tema bawaan dipakai sekali

function bawaan() {
  let gelap = false;
  try { gelap = matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) { /* abaikan */ }
  return {
    saldoAwal: 0,
    transaksi: [],  // {id, tanggal, jenis:'masuk'|'keluar', nominal, kategori, ket, sumber, dibuat}
    kegiatan: [],   // {id, tanggal, jam, nama, prioritas, status, dibuat}
    inbox: [],      // catatan cepat yang kategorinya belum jelas
    anggaran: { Makan: 150000, Jajan: 50000, Transport: 50000, Belanja: 50000, Kuliah: 50000,
      Tagihan: 0, Hiburan: 30000, Kesehatan: 0, Lainnya: 0 }, // batas per minggu, 0 = tanpa batas
    tema: TEMA[0].id,
    mode: gelap ? 'gelap' : 'terang',
    contoh: false,  // true = sedang memakai data contoh
    desain: DESAIN,
  };
}

// Melengkapi data mentah (dari localStorage atau server) dengan nilai bawaan
function siapkan(mentah) {
  const s = Object.assign(bawaan(), mentah);
  if (!TEMA.some((t) => t.id === s.tema)) s.tema = TEMA[0].id; // tema dari versi lama
  if (s.desain !== DESAIN) { s.tema = TEMA[0].id; s.desain = DESAIN; } // tampilan baru: mulai dari tema bawaan
  return s;
}

function muat() {
  try {
    const mentah = localStorage.getItem(KUNCI);
    if (mentah) return siapkan(JSON.parse(mentah));
  } catch (e) { /* data rusak atau localStorage diblokir: mulai dari data contoh */ }
  return dataContoh();
}

// Menyimpan ke localStorage (cadangan di browser) dan, kalau tersambung, ke server (js/sinkron.js)
function simpan() {
  try { localStorage.setItem(KUNCI, JSON.stringify(S)); }
  catch (e) { if (!SERVER.aktif) toast('Data tidak bisa disimpan. Cek pengaturan browser.'); }
  kirimKeServer();
}

/* Data contoh supaya tampilan langsung terisi saat pertama dibuka.
   Isinya: 5 minggu pengeluaran (untuk peta panas) dan jadwal minggu ini. */
function dataContoh() {
  const s = bawaan();
  s.contoh = true;
  s.saldoAwal = 300000;
  const h = hariIni(), sen = awalMinggu(h), t0 = Date.now();

  // `dibuat` diberi jam yang berbeda-beda supaya daftar transaksi terlihat wajar
  const T = (selisih, jenis, nominal, kategori, ket) => {
    const n = s.transaksi.length, tgl = tambahHari(h, selisih);
    const jam = 8 + (n * 3) % 12, menit = (n * 17) % 60;
    s.transaksi.push({ id: uid(), tanggal: tgl, jenis, nominal, kategori, ket,
      sumber: n % 3 === 0 ? 'cepat' : 'web', dibuat: dariTanggal(tgl).getTime() + (jam * 60 + menit) * 60000 });
  };

  // minggu ini dan kemarin-kemarin
  T(0, 'keluar', 15000, 'Makan', 'Geprek');
  T(0, 'keluar', 12000, 'Jajan', 'Kopi susu');
  T(-1, 'keluar', 25000, 'Makan', 'Nasi ayam');
  T(-1, 'keluar', 10000, 'Transport', 'Ojek');
  T(-2, 'masuk', 500000, 'Pemasukan', 'Uang saku');
  T(-2, 'keluar', 30000, 'Kuliah', 'Fotokopi modul');
  T(-3, 'keluar', 20000, 'Makan', 'Bakso');
  T(-4, 'keluar', 50000, 'Tagihan', 'Kuota');
  T(-5, 'keluar', 18000, 'Jajan', 'Boba');
  T(-6, 'keluar', 22000, 'Makan', 'Warteg');

  // minggu-minggu sebelumnya: pola sederhana yang berulang
  const pola = [['Makan', 15000, 'Makan siang'], ['Jajan', 12000, 'Kopi'], ['Transport', 10000, 'Ojek'],
    ['Makan', 22000, 'Warteg'], ['Kuliah', 30000, 'Fotokopi'], ['Jajan', 18000, 'Boba'], ['Makan', 25000, 'Nasi ayam']];
  for (let i = 7; i <= 34; i++) {
    if (i % 5 === 0) continue; // beberapa hari tanpa pengeluaran
    const p = pola[i % pola.length];
    T(-i, 'keluar', p[1] + (i % 3) * 3000, p[0], p[2]);
  }
  T(-16, 'masuk', 500000, 'Pemasukan', 'Uang saku');
  T(-30, 'masuk', 500000, 'Pemasukan', 'Uang saku');

  const K = (hr, jam, nama, prioritas, status) => s.kegiatan.push({
    id: uid(), tanggal: tambahHari(sen, hr), jam, nama, prioritas, status, dibuat: t0 + s.kegiatan.length });
  K(0, '06:00', 'Olahraga pagi', 'rendah', 'selesai');
  K(0, '08:00', 'Kuliah pengantar bisnis', 'tinggi', 'selesai');
  K(0, '13:00', 'Rapat organisasi', 'sedang', 'proses');
  K(0, '19:30', 'Kerjakan tugas kelompok', 'tinggi', 'belum');
  K(1, '09:00', 'Kuliah statistik', 'tinggi', 'belum');
  K(1, '15:30', 'Belajar HTML dan CSS', 'sedang', 'proses');
  K(1, '20:00', 'Cuci baju', 'rendah', 'belum');
  K(2, '10:00', 'Praktikum', 'tinggi', 'belum');
  K(2, '16:00', 'Bimbingan dosen', 'sedang', 'belum');
  K(3, '08:00', 'Kuliah manajemen', 'tinggi', 'belum');
  K(3, '19:00', 'Latihan web hari ke-1', 'sedang', 'belum');
  K(4, '14:00', 'Belanja bulanan', 'rendah', 'belum');
  K(5, '09:00', 'Kerja bakti kos', 'rendah', 'belum');
  K(6, '10:00', 'Rencana minggu depan', 'sedang', 'belum');
  return s;
}

let S = muat(); // data utama

// Keadaan tampilan. Tidak disimpan, kembali ke awal saat halaman dimuat ulang.
const UI = {
  hal: 'beranda',
  minggu: awalMinggu(hariIni()), // minggu yang dibuka di halaman Jadwal
  tampilJadwal: 'hari',          // 'hari' atau 'papan'
  bulan: hariIni().slice(0, 7), jenis: '', kat: '', cari: '', // filter halaman Keuangan
  periode: '7hari',              // periode halaman Laporan
  cariAktivitas: '',             // kata cari di tabel aktivitas Beranda
};

/* ----- Perubahan data ----- */
function tambahTransaksi(t) {
  S.transaksi.push({ id: uid(), sumber: 'web', dibuat: Date.now(), ...t });
  simpan();
}

function koreksiSaldo(target) {
  const selisih = target - hitungSaldo();
  if (selisih === 0) { toast('Saldo sudah sama dengan ' + rupiah(target)); return; }
  tambahTransaksi({
    tanggal: hariIni(), jenis: selisih > 0 ? 'masuk' : 'keluar', nominal: Math.abs(selisih),
    kategori: 'Koreksi', ket: 'Koreksi saldo',
  });
  toast('Saldo dikoreksi menjadi ' + rupiah(target));
}

const cariKeg = (id) => S.kegiatan.find((k) => k.id === id);
const cariTrx = (id) => S.transaksi.find((t) => t.id === id);
