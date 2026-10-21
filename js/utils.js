'use strict';
/* Alat bantu kecil: tanggal, format rupiah, pengaman teks.
   File ini tidak menyentuh data aplikasi maupun halaman. */

const $ = (selektor, akar = document) => akar.querySelector(selektor);

// Mengamankan teks dari pengguna sebelum dimasukkan ke HTML
const esc = (s) => String(s ?? '').replace(/[&<>"']/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const pad = (n) => String(n).padStart(2, '0');

/* ----- Tanggal -----
   Tanggal disimpan sebagai teks "2026-10-19" supaya mudah dibandingkan dan diurutkan. */
function fmtTanggal(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function dariTanggal(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
function hariIni() { return fmtTanggal(new Date()); }
function tambahHari(s, n) { const d = dariTanggal(s); d.setDate(d.getDate() + n); return fmtTanggal(d); }

// Senin dari minggu yang memuat tanggal s
function awalMinggu(s) {
  const d = dariTanggal(s);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return fmtTanggal(d);
}
function tglPendek(s) { const d = dariTanggal(s); return `${d.getDate()} ${BULAN_PENDEK[d.getMonth()]}`; }
function tglPanjang(s) {
  const d = dariTanggal(s);
  return `${NAMA_HARI[d.getDay()]}, ${d.getDate()} ${NAMA_BULAN[d.getMonth()]} ${d.getFullYear()}`;
}
// "20 Okt 2026" dan, kalau jamnya diketahui, "20 Okt 2026, 12.40"
function tglLengkap(s, waktu) {
  const d = dariTanggal(s);
  const teks = `${d.getDate()} ${BULAN_PENDEK[d.getMonth()]} ${d.getFullYear()}`;
  if (!waktu) return teks;
  const w = new Date(waktu);
  return `${teks}, ${pad(w.getHours())}.${pad(w.getMinutes())}`;
}
function daftarHari(dari, sampai) {
  const hasil = [];
  for (let t = dari; t <= sampai; t = tambahHari(t, 1)) hasil.push(t);
  return hasil;
}

/* ----- Uang ----- */
function rupiah(n) {
  const teks = Math.round(Math.abs(n)).toLocaleString('id-ID');
  return (n < 0 ? '-' : '') + 'Rp' + teks;
}

// Angka pendek untuk sumbu grafik: 25000 -> "25rb", 1500000 -> "1,5jt"
function rupiahRingkas(n) {
  if (n >= 1e6) return String(n / 1e6).replace('.', ',') + 'jt';
  if (n >= 1e3) return String(n / 1e3).replace('.', ',') + 'rb';
  return String(n);
}

/* ----- Pengurutan ----- */
const urutJam = (a, b) => (a.jam || '99:99').localeCompare(b.jam || '99:99');
const urutTrx = (a, b) => b.tanggal.localeCompare(a.tanggal) || (b.dibuat || 0) - (a.dibuat || 0);
