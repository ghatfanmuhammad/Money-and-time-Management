'use strict';
/* Halaman Pengaturan: tema, mode gelap, saldo awal, cadangan data. */

function vPengaturan() {
  return `${kepala('Pengaturan', 'Tampilan, saldo awal, dan data')}
    <div class="tumpuk">
      <div class="kartu"><h2>Warna aksen</h2><div class="warna-tema">
        ${TEMA.map((t) => `<button class="${S.tema === t.id ? 'pilih' : ''}" data-aksi="tema" data-tema="${t.id}" aria-pressed="${S.tema === t.id}">
          <i style="background:${t.warna}"></i>${t.nama}</button>`).join('')}</div>

        <h2 style="margin-top:18px">Mode tampilan</h2><div class="warna-tema">
          <button class="${S.mode === 'terang' ? 'pilih' : ''}" data-aksi="mode" data-mode="terang" aria-pressed="${S.mode === 'terang'}">Terang</button>
          <button class="${S.mode === 'gelap' ? 'pilih' : ''}" data-aksi="mode" data-mode="gelap" aria-pressed="${S.mode === 'gelap'}">Gelap</button></div></div>

      <div class="kartu"><h2>Saldo awal</h2>
        <p class="kecil" style="margin-top:0">Uang yang kamu punya sebelum mulai mencatat. Saldo = saldo awal + pemasukan - pengeluaran.
          Kalau saldo di aplikasi berbeda dengan di rekening, pakai tombol Koreksi saldo di halaman Keuangan.</p>
        <label>Saldo awal (Rp)<input type="number" data-saldo-awal value="${S.saldoAwal}" step="1000"></label></div>

      <div class="kartu"><h2>Data</h2>
        <p class="kecil" style="margin-top:0">Data tersimpan di browser komputer ini (localStorage). Buat cadangan secara berkala,
          terutama sebelum membersihkan data browser.</p>
        <div class="kepala-aksi">
          <button class="btn" data-aksi="ekspor">Unduh cadangan (.json)</button>
          <button class="btn" data-aksi="impor">Pulihkan dari cadangan</button>
          <button class="btn" data-aksi="isiContoh">Isi data contoh</button>
          <button class="btn hapus" data-aksi="hapusSemua">Hapus semua data</button></div></div>

      <div class="kartu"><h2>Format catat cepat</h2>
        <ul class="daftar-info">
          <li><code>geprek 15000</code> pengeluaran, kategori ditebak dari kata kunci (Makan)</li>
          <li><code>kopi 12rb</code>, <code>ojek 10k</code>, <code>laptop 2jt</code>: rb dan k berarti ribu, jt berarti juta</li>
          <li><code>+500000 uang saku</code> atau <code>tf dari ortu 500rb</code>: pemasukan</li>
          <li><code>kemarin bakso 20000</code>: dicatat dengan tanggal kemarin</li>
          <li><code>saldo 250000</code>: koreksi saldo agar sama dengan saldo sebenarnya</li>
          <li>Kata kunci kategori bisa ditambah di <code>js/config.js</code>, bagian <code>KATA_KUNCI</code></li>
        </ul></div>
    </div>`;
}
