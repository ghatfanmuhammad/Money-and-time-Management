'use strict';
/* Tes untuk pembaca catat cepat (js/parser.js).
   Jalankan dengan:  node tests/parser.test.js
   Tidak perlu memasang apa pun, hanya butuh Node.js. */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

// File di js/ ditulis untuk browser, jadi dimuat ke ruang Node terpisah lewat vm.
const akar = path.join(__dirname, '..', 'js');
const kode = ['config.js', 'utils.js', 'parser.js']
  .map((f) => fs.readFileSync(path.join(akar, f), 'utf8')).join('\n');
const { bacaNominal, tebakKategori, bacaCatatan, hariIni, tambahHari } =
  vm.runInNewContext(kode + '\n({ bacaNominal, tebakKategori, bacaCatatan, hariIni, tambahHari })', {});

let lulus = 0, gagal = 0;
function uji(nama, fungsi) {
  try { fungsi(); lulus++; console.log('  ok   ' + nama); }
  catch (e) { gagal++; console.log('  GAGAL ' + nama + '\n       ' + e.message.split('\n')[0]); }
}

console.log('bacaNominal');
uji('angka polos', () => assert.strictEqual(bacaNominal('geprek 15000').nilai, 15000));
uji('titik ribuan', () => assert.strictEqual(bacaNominal('bakso 20.000').nilai, 20000));
uji('rb', () => assert.strictEqual(bacaNominal('kopi 12rb').nilai, 12000));
uji('k', () => assert.strictEqual(bacaNominal('ojek 10k').nilai, 10000));
uji('jt dengan koma', () => assert.strictEqual(bacaNominal('tf ortu 1,5jt').nilai, 1500000));
uji('tanpa angka', () => assert.strictEqual(bacaNominal('makan siang'), null));

console.log('tebakKategori');
uji('Makan', () => assert.strictEqual(tebakKategori('geprek'), 'Makan'));
uji('Jajan', () => assert.strictEqual(tebakKategori('es teh'), 'Jajan'));
uji('Transport', () => assert.strictEqual(tebakKategori('ojek'), 'Transport'));
uji('kata tidak dikenal', () => assert.strictEqual(tebakKategori('xyz'), null));
uji('tidak cocok di tengah kata', () => assert.strictEqual(tebakKategori('kesatu'), null));

console.log('bacaCatatan');
uji('pengeluaran biasa', () => {
  const h = bacaCatatan('geprek 15000');
  assert.deepStrictEqual([h.tipe, h.jenis, h.nominal, h.kategori, h.ket], ['transaksi', 'keluar', 15000, 'Makan', 'Geprek']);
});
uji('tanda plus = pemasukan', () => {
  const h = bacaCatatan('+500000 uang saku');
  assert.deepStrictEqual([h.jenis, h.nominal, h.kategori], ['masuk', 500000, 'Pemasukan']);
});
uji('kata tf = pemasukan', () => {
  const h = bacaCatatan('tf ortu 1,5jt');
  assert.deepStrictEqual([h.jenis, h.nominal], ['masuk', 1500000]);
});
uji('"tf ke" = pengeluaran', () => assert.strictEqual(bacaCatatan('tf ke budi 50000').jenis, 'keluar'));
uji('kata bayar = pengeluaran', () => assert.strictEqual(bacaCatatan('bayar kos dapat 300000').jenis, 'keluar'));
uji('tanda minus = pengeluaran', () => assert.strictEqual(bacaCatatan('-20000 gaji teman').jenis, 'keluar'));
uji('kemarin', () => assert.strictEqual(bacaCatatan('kemarin ojek 10k').tanggal, tambahHari(hariIni(), -1)));
uji('tanggal default hari ini', () => assert.strictEqual(bacaCatatan('kopi 12rb').tanggal, hariIni()));
uji('koreksi saldo', () => {
  const h = bacaCatatan('saldo 250000');
  assert.deepStrictEqual([h.tipe, h.nominal], ['saldo', 250000]);
});
uji('kategori tidak dikenal -> null', () => assert.strictEqual(bacaCatatan('xyz 5000').kategori, null));
uji('tanpa angka -> null', () => assert.strictEqual(bacaCatatan('beli nasi'), null));
uji('kosong -> null', () => assert.strictEqual(bacaCatatan('   '), null));
uji('nominal nol -> null', () => assert.strictEqual(bacaCatatan('kopi 0'), null));

console.log(`\n${lulus} lulus, ${gagal} gagal`);
process.exit(gagal ? 1 : 0);
