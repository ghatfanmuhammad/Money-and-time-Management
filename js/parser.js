'use strict';
/* Pembaca catat cepat.
   Mengubah teks bebas menjadi data transaksi. Fungsi di file ini tidak menyentuh
   halaman maupun localStorage, jadi bisa dipakai ulang di server (misalnya untuk bot)
   dan diuji lewat tests/parser.test.js.

   Contoh yang dipahami:
     geprek 15000        -> pengeluaran Rp15.000, kategori Makan
     kopi 12rb           -> pengeluaran Rp12.000, kategori Jajan
     +500000 uang saku   -> pemasukan Rp500.000
     tf ortu 1,5jt       -> pemasukan Rp1.500.000
     kemarin ojek 10k    -> pengeluaran dengan tanggal kemarin
     saldo 250000        -> koreksi saldo menjadi Rp250.000 */

// Mencari angka terakhir di teks. Mengerti rb / ribu / k / jt / juta.
function bacaNominal(teks) {
  const re = /(\d[\d.,]*)\s*(rb|ribu|k|jt|juta)?(?![a-z0-9])/gi;
  let m, terakhir = null;
  while ((m = re.exec(teks)) !== null) terakhir = m;
  if (!terakhir) return null;

  const angka = terakhir[1].replace(/[.,]+$/, '');
  const satuan = (terakhir[2] || '').toLowerCase();
  let nilai;
  if (satuan) {
    nilai = parseFloat(angka.replace(',', '.'));                  // "1,5jt" -> 1.5
    nilai *= (satuan === 'jt' || satuan === 'juta') ? 1e6 : 1e3;
  } else {
    nilai = parseInt(angka.replace(/[.,]/g, ''), 10);             // "15.000" -> 15000
  }
  if (!Number.isFinite(nilai)) return null;
  return { nilai: Math.round(nilai), teks: terakhir[0], indeks: terakhir.index };
}

// Menebak kategori dari kata kunci di config.js. Mengembalikan null kalau tidak ada yang cocok.
function tebakKategori(teks) {
  const t = teks.toLowerCase();
  for (const [kategori, daftar] of Object.entries(KATA_KUNCI)) {
    for (const kata of daftar) {
      if (new RegExp('(^|[^a-z])' + kata + '([^a-z]|$)').test(t)) return kategori;
    }
  }
  return null;
}

// Hasil: null (tidak terbaca), {tipe:'saldo', nominal}, atau
// {tipe:'transaksi', tanggal, jenis, nominal, ket, kategori}
function bacaCatatan(asli) {
  let teks = asli.trim();
  if (!teks) return null;

  // "saldo 250000" = koreksi saldo
  const sal = teks.match(/^saldo\s+(.+)$/i);
  if (sal) {
    const n = bacaNominal(sal[1]);
    return n && n.nilai >= 0 ? { tipe: 'saldo', nominal: n.nilai } : null;
  }

  let tanggal = hariIni();
  if (/\bkemarin\b/i.test(teks)) {
    tanggal = tambahHari(tanggal, -1);
    teks = teks.replace(/\bkemarin\b/ig, ' ');
  }

  const n = bacaNominal(teks);
  if (!n || n.nilai <= 0) return null;

  const plus = /(^|\s)\+\s*\d/.test(teks);
  const minus = /(^|\s)-\s*\d/.test(teks);

  // Keterangan = teks tanpa angka dan tanpa tanda + / -
  let ket = (teks.slice(0, n.indeks) + ' ' + teks.slice(n.indeks + n.teks.length))
    .replace(/(^|\s)[+-](?=\s|$)/g, ' ').replace(/\s+/g, ' ').trim();

  // Pemasukan atau pengeluaran? Tanda + / - menang, lalu kata kunci.
  const kataMasuk = /\b(tf|transfer|terima|diterima|gaji|uang saku|kiriman|dapat|bonus|cashback|masuk|income|honor|beasiswa)\b/i;
  const kataKeluar = /\b(tf|transfer)\s+(ke|buat|untuk)\b|\b(bayar|beli)\b/i;
  let jenis = 'keluar';
  if (plus) jenis = 'masuk';
  else if (!minus && kataMasuk.test(ket) && !kataKeluar.test(ket)) jenis = 'masuk';

  const kategori = jenis === 'masuk' ? 'Pemasukan' : tebakKategori(ket);
  if (!ket) ket = jenis === 'masuk' ? 'Pemasukan' : 'Pengeluaran';
  ket = ket.charAt(0).toUpperCase() + ket.slice(1);

  return { tipe: 'transaksi', tanggal, jenis, nominal: n.nilai, ket, kategori };
}
