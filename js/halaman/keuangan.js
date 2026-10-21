'use strict';
/* Halaman Keuangan: daftar transaksi dengan filter, tambah, ubah, hapus, dan koreksi saldo. */

function saringTrx() {
  const cari = UI.cari.toLowerCase();
  return S.transaksi.filter((t) =>
    (!UI.bulan || t.tanggal.startsWith(UI.bulan)) &&
    (!UI.jenis || t.jenis === UI.jenis) &&
    (!UI.kat || t.kategori === UI.kat) &&
    (!cari || (t.ket + ' ' + t.kategori).toLowerCase().includes(cari))
  ).sort(urutTrx);
}

// Dipisah dari vKeuangan supaya mengetik di kolom cari hanya menggambar ulang daftarnya
function htmlDaftarTrx() {
  const daftar = saringTrx();
  if (!daftar.length) return '<p class="kosong">Tidak ada transaksi yang cocok.</p>';
  return `<p class="kecil" style="margin:0 0 4px">${daftar.length} transaksi</p>` + daftar.map((t) => barisTrx(t, true)).join('');
}

function vKeuangan() {
  const bulanIni = hariIni().slice(0, 7);
  const masuk = totalDi((t) => t.tanggal.startsWith(bulanIni), 'masuk');
  const keluar = totalDi((t) => t.tanggal.startsWith(bulanIni), 'keluar');
  const saldo = hitungSaldo();

  // Pilihan bulan: 12 bulan terakhir
  const d = new Date(); d.setDate(1);
  let opsiBulan = '<option value="">Semua bulan</option>';
  for (let i = 0; i < 12; i++) {
    const v = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
    opsiBulan += `<option value="${v}" ${UI.bulan === v ? 'selected' : ''}>${NAMA_BULAN[d.getMonth()]} ${d.getFullYear()}</option>`;
    d.setMonth(d.getMonth() - 1);
  }
  const semuaKat = ['Pemasukan', ...KATEGORI, 'Koreksi'];

  return `
    ${kepala('Keuangan', 'Catat uang masuk dan keluar',
      `<button class="btn primer" data-aksi="tambahTrx" data-jenis="keluar">+ Pengeluaran</button>
       <button class="btn" data-aksi="tambahTrx" data-jenis="masuk">+ Pemasukan</button>
       <button class="btn" data-aksi="koreksi">Koreksi saldo</button>`)}
    <div class="grid-ringkas">
      <div class="kartu"><div class="label">Saldo</div><div class="angka ${saldo < 0 ? 'minus' : ''}">${rupiah(saldo)}</div></div>
      <div class="kartu"><div class="label">Pemasukan bulan ini</div><div class="angka plus">${rupiah(masuk)}</div></div>
      <div class="kartu"><div class="label">Pengeluaran bulan ini</div><div class="angka minus">${rupiah(keluar)}</div></div>
    </div>
    <div class="kartu">
      <div class="saring">
        <select data-filter="bulan" aria-label="Bulan" autocomplete="off">${opsiBulan}</select>
        <select data-filter="jenis" aria-label="Jenis" autocomplete="off">
          <option value="" ${UI.jenis === '' ? 'selected' : ''}>Semua jenis</option>
          <option value="keluar" ${UI.jenis === 'keluar' ? 'selected' : ''}>Pengeluaran</option>
          <option value="masuk" ${UI.jenis === 'masuk' ? 'selected' : ''}>Pemasukan</option></select>
        <select data-filter="kat" aria-label="Kategori" autocomplete="off">
          <option value="" ${UI.kat === '' ? 'selected' : ''}>Semua kategori</option>
          ${semuaKat.map((k) => `<option value="${k}" ${UI.kat === k ? 'selected' : ''}>${k}</option>`).join('')}</select>
        <input type="text" data-filter="cari" placeholder="Cari..." value="${esc(UI.cari)}" aria-label="Cari" autocomplete="off">
      </div>
      <div id="daftarTrx">${htmlDaftarTrx()}</div>
    </div>`;
}
