'use strict';
/* Halaman Kotak masuk: catatan cepat yang kategorinya tidak dikenali.
   Pilih kategorinya di sini, lalu catatan dipindah ke daftar transaksi. */

function vInbox() {
  const isi = S.inbox.length
    ? S.inbox.map((i) => `<div class="baris-inbox" data-inbox="${i.id}">
        <div class="kecil">Pesan: "${esc(i.teks)}"</div>
        <div><b>${esc(i.ket)}</b> &middot; ${rupiah(i.nominal)} &middot; ${tglPendek(i.tanggal)}</div>
        <div class="kontrol">
          <select aria-label="Pilih kategori untuk ${esc(i.ket)}">${KATEGORI.map((k) => `<option>${k}</option>`).join('')}</select>
          <button class="btn primer mini" data-aksi="inboxCatat" data-id="${i.id}">Catat</button>
          <button class="btn mini hapus" data-aksi="inboxHapus" data-id="${i.id}">Buang</button>
        </div></div>`).join('')
    : '<p class="kosong">Kotak masuk kosong. Catatan yang kategorinya tidak dikenali akan muncul di sini.</p>';
  return `${kepala('Kotak masuk', 'Catatan yang butuh konfirmasi kategori')}
    <div class="kartu">${isi}</div>
    <p class="kecil" style="margin-top:14px">Pesan Telegram yang kategorinya tidak jelas juga masuk ke sini
      sebelum jadi transaksi.</p>`;
}
