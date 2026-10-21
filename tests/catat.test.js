'use strict';
/* Tes untuk server/catat.js: pesan teks -> perubahan data S.
   Jalankan dengan:  node tests/catat.test.js */

const assert = require('assert');
const { terapkanCatatan, hitungSaldo, ringkasHari } = require('../server/catat');

let lulus = 0, gagal = 0;
function uji(nama, fungsi) {
  try { fungsi(); lulus++; console.log('  ok   ' + nama); }
  catch (e) { gagal++; console.log('  GAGAL ' + nama + '\n       ' + e.message.split('\n')[0]); }
}
const kosong = () => ({ saldoAwal: 100000, transaksi: [], kegiatan: [], inbox: [] });

uji('pengeluaran tercatat dengan sumber telegram', () => {
  const S = kosong();
  const h = terapkanCatatan(S, 'geprek 15000');
  assert.strictEqual(h.berubah, true);
  assert.strictEqual(S.transaksi.length, 1);
  assert.strictEqual(S.transaksi[0].kategori, 'Makan');
  assert.strictEqual(S.transaksi[0].sumber, 'telegram');
  assert.strictEqual(hitungSaldo(S), 85000);
});
uji('pemasukan menambah saldo', () => {
  const S = kosong();
  terapkanCatatan(S, '+50000 uang saku');
  assert.strictEqual(hitungSaldo(S), 150000);
});
uji('kategori tidak dikenal masuk Kotak masuk', () => {
  const S = kosong();
  const h = terapkanCatatan(S, 'zzz 5000');
  assert.strictEqual(h.berubah, true);
  assert.strictEqual(S.transaksi.length, 0);
  assert.strictEqual(S.inbox.length, 1);
});
uji('teks tak terbaca tidak mengubah data', () => {
  const S = kosong();
  assert.strictEqual(terapkanCatatan(S, 'halo').berubah, false);
  assert.strictEqual(S.transaksi.length + S.inbox.length, 0);
});
uji('koreksi saldo', () => {
  const S = kosong();
  terapkanCatatan(S, 'saldo 70000');
  assert.strictEqual(hitungSaldo(S), 70000);
  assert.strictEqual(S.transaksi[0].kategori, 'Koreksi');
});
uji('koreksi ke saldo yang sama tidak mengubah', () => {
  const S = kosong();
  assert.strictEqual(terapkanCatatan(S, 'saldo 100000').berubah, false);
});
uji('ringkasan hari ini memuat pengeluaran', () => {
  const S = kosong();
  terapkanCatatan(S, 'kopi 12rb');
  assert.ok(ringkasHari(S).includes('Kopi'));
});

console.log(`\n${lulus} lulus, ${gagal} gagal`);
process.exit(gagal ? 1 : 0);
