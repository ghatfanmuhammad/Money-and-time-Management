'use strict';
/* Menerapkan satu pesan teks ke data S, dengan aturan yang sama seperti kolom catat cepat di web.
   Fungsi ini tidak menyentuh database maupun Telegram, jadi mudah diuji. */

const { bacaCatatan, uid, hariIni, rupiah } = require('./parser-bersama');

const jumlah = (daftar) => daftar.reduce((a, t) => a + t.nominal, 0);

function hitungSaldo(S) {
  return S.saldoAwal + S.transaksi.reduce((a, t) => a + (t.jenis === 'masuk' ? t.nominal : -t.nominal), 0);
}

function tambahTransaksi(S, t) {
  S.transaksi.push({ id: uid(), sumber: 'telegram', dibuat: Date.now(), ...t });
}

// Hasil: {balasan, berubah}. `berubah` true kalau S dimodifikasi dan perlu disimpan.
function terapkanCatatan(S, teks) {
  const h = bacaCatatan(teks);
  if (!h) return { balasan: 'Belum terbaca. Contoh: geprek 15000', berubah: false };

  if (h.tipe === 'saldo') {
    const selisih = h.nominal - hitungSaldo(S);
    if (selisih === 0) return { balasan: 'Saldo sudah sama dengan ' + rupiah(h.nominal), berubah: false };
    tambahTransaksi(S, { tanggal: hariIni(), jenis: selisih > 0 ? 'masuk' : 'keluar',
      nominal: Math.abs(selisih), kategori: 'Koreksi', ket: 'Koreksi saldo' });
    return { balasan: 'Saldo dikoreksi menjadi ' + rupiah(h.nominal), berubah: true };
  }

  if (h.kategori) {
    tambahTransaksi(S, { tanggal: h.tanggal, jenis: h.jenis, nominal: h.nominal, kategori: h.kategori, ket: h.ket });
    return { balasan: `Dicatat: ${h.ket} ${rupiah(h.nominal)} (${h.kategori}). Saldo ${rupiah(hitungSaldo(S))}`, berubah: true };
  }

  // Kategori tidak dikenali: simpan di Kotak masuk untuk dipilih di web
  S.inbox.push({ id: uid(), tanggal: h.tanggal, jenis: h.jenis, nominal: h.nominal, ket: h.ket, teks: teks.trim() });
  return { balasan: `Disimpan di Kotak masuk: ${h.ket} ${rupiah(h.nominal)}. Pilih kategorinya di web.`, berubah: true };
}

function ringkasSaldo(S) {
  return 'Saldo: ' + rupiah(hitungSaldo(S));
}

function ringkasHari(S) {
  const h = hariIni();
  const hariItu = S.transaksi.filter((t) => t.tanggal === h && t.kategori !== 'Koreksi');
  const keluar = hariItu.filter((t) => t.jenis === 'keluar');
  const masuk = hariItu.filter((t) => t.jenis === 'masuk');
  const baris = [`Hari ini: keluar ${rupiah(jumlah(keluar))}, masuk ${rupiah(jumlah(masuk))}`];
  keluar.forEach((t) => baris.push(`- ${t.ket} ${rupiah(t.nominal)} (${t.kategori})`));
  baris.push(ringkasSaldo(S));
  return baris.join('\n');
}

module.exports = { terapkanCatatan, ringkasSaldo, ringkasHari, hitungSaldo };
