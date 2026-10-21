'use strict';
/* Perhitungan dari data S. Fungsi di sini hanya membaca data, tidak mengubahnya. */

// Saldo = saldo awal + semua pemasukan - semua pengeluaran (koreksi ikut dihitung)
function hitungSaldo() {
  return S.saldoAwal + S.transaksi.reduce((a, t) => a + (t.jenis === 'masuk' ? t.nominal : -t.nominal), 0);
}

// Saldo pada akhir tanggal tertentu
function saldoSampai(tgl) {
  return S.saldoAwal + S.transaksi.filter((t) => t.tanggal <= tgl)
    .reduce((a, t) => a + (t.jenis === 'masuk' ? t.nominal : -t.nominal), 0);
}

// Rentang bulan yang memuat tanggal h, dan rentang pembandingnya di bulan lalu
// (sejak tanggal 1 sampai hari yang sama, supaya perbandingannya adil).
function rentangBulan(h) {
  const d = dariTanggal(h), y = d.getFullYear(), m = d.getMonth();
  const akhirLalu = fmtTanggal(new Date(y, m, 0));
  const awalLalu = fmtTanggal(new Date(y, m - 1, 1));
  const sampaiLalu = tambahHari(awalLalu, d.getDate() - 1);
  return {
    awal: fmtTanggal(new Date(y, m, 1)), akhir: fmtTanggal(new Date(y, m + 1, 0)),
    awalLalu, akhirLalu, sampaiLalu: sampaiLalu > akhirLalu ? akhirLalu : sampaiLalu,
    hari: new Date(y, m + 1, 0).getDate(),
  };
}

// Pengeluaran 7 hari terakhir (berakhir hari ini), dipecah antara kategori terbesar dan sisanya
function dataHarian7() {
  const h = hariIni();
  const hari = daftarHari(tambahHari(h, -6), h);
  const totalKat = {};
  const baris = hari.map((tgl) => {
    const kat = {};
    S.transaksi
      .filter((t) => t.tanggal === tgl && t.jenis === 'keluar' && t.kategori !== 'Koreksi')
      .forEach((t) => {
        kat[t.kategori] = (kat[t.kategori] || 0) + t.nominal;
        totalKat[t.kategori] = (totalKat[t.kategori] || 0) + t.nominal;
      });
    return { tgl, kat, total: Object.values(kat).reduce((a, b) => a + b, 0) };
  });
  const teratas = Object.entries(totalKat).sort((a, b) => b[1] - a[1])[0];
  return { baris, kategori: teratas ? teratas[0] : null };
}

// Jumlah transaksi satu jenis yang lolos `syarat`.
// Koreksi saldo tidak dihitung sebagai pemasukan atau pengeluaran.
function totalDi(syarat, jenis) {
  return S.transaksi
    .filter((t) => t.jenis === jenis && t.kategori !== 'Koreksi' && syarat(t))
    .reduce((a, t) => a + t.nominal, 0);
}

function totalAntara(jenis, dari, sampai) {
  return totalDi((t) => t.tanggal >= dari && t.tanggal <= sampai, jenis);
}

function terpakaiKategori(kat, dari, sampai) {
  return totalDi((t) => t.kategori === kat && t.tanggal >= dari && t.tanggal <= sampai, 'keluar');
}

// Pengeluaran per kategori dalam satu rentang, urut dari yang terbesar: [[kategori, jumlah], ...]
function pengeluaranPerKategori(dari, sampai) {
  const hasil = {};
  S.transaksi
    .filter((t) => t.jenis === 'keluar' && t.kategori !== 'Koreksi' && t.tanggal >= dari && t.tanggal <= sampai)
    .forEach((t) => { hasil[t.kategori] = (hasil[t.kategori] || 0) + t.nominal; });
  return Object.entries(hasil).sort((a, b) => b[1] - a[1]);
}

// Batas dan pemakaian anggaran, hanya untuk kategori yang punya batas
function ringkasBudget(dari, sampai) {
  let batas = 0, terpakai = 0;
  for (const kat of KATEGORI) {
    const b = S.anggaran[kat] || 0;
    if (b > 0) { batas += b; terpakai += terpakaiKategori(kat, dari, sampai); }
  }
  return { batas, terpakai };
}

// Perubahan dalam persen. Mengembalikan null kalau pembandingnya 0.
function selisihPersen(sekarang, sebelumnya) {
  if (!sebelumnya) return null;
  return Math.round((sekarang - sebelumnya) / sebelumnya * 100);
}

// Kegiatan dalam rentang tanggal, urut berdasarkan tanggal lalu jam
function kegiatanDi(dari, sampai) {
  return S.kegiatan
    .filter((k) => k.tanggal >= dari && k.tanggal <= sampai)
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal) || urutJam(a, b));
}

// Kegiatan belum selesai yang paling dekat, mulai dari hari ini
function kegiatanBerikutnya() {
  const h = hariIni();
  return S.kegiatan
    .filter((k) => k.status !== 'selesai' && k.tanggal >= h)
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal) || urutJam(a, b))[0] || null;
}

// Data peta panas: 5 minggu terakhir, tiap sel = pengeluaran satu hari.
// Hari yang belum terjadi diberi depan: true.
function dataPetaPanas() {
  const h = hariIni();
  const awal = tambahHari(awalMinggu(h), -28);
  const minggu = [];
  let maks = 0;
  for (let w = 0; w < 5; w++) {
    const mulai = tambahHari(awal, w * 7);
    const sel = daftarHari(mulai, tambahHari(mulai, 6)).map((tgl) => {
      const depan = tgl > h;
      const nilai = depan ? 0 : totalAntara('keluar', tgl, tgl);
      if (nilai > maks) maks = nilai;
      return { tgl, nilai, depan };
    });
    minggu.push({ mulai, sel });
  }
  return { minggu, maks };
}
