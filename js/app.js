'use strict';
/* Titik awal aplikasi: memilih halaman lewat alamat (#beranda, #jadwal, ...)
   dan menggambar halaman itu. File ini dimuat paling akhir. */

const HALAMAN = {
  beranda: vBeranda, jadwal: vJadwal, keuangan: vKeuangan, anggaran: vAnggaran,
  laporan: vLaporan, inbox: vInbox, pengaturan: vPengaturan,
};

/* Menggambar ulang halaman yang sedang dibuka, beserta menu samping */
function render() {
  document.documentElement.dataset.tema = S.tema;
  document.documentElement.dataset.mode = S.mode;
  if (!HALAMAN[UI.hal]) UI.hal = 'beranda';

  // Menu, ikon kotak masuk, dan profil di bilah atas
  document.querySelectorAll('a[data-hal]').forEach((a) => {
    const aktif = a.dataset.hal === UI.hal;
    a.classList.toggle('aktif', aktif);
    if (aktif) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });

  // Tombol terang dan gelap di sisi kiri
  document.querySelectorAll('.rail [data-mode]').forEach((b) => {
    const aktif = b.dataset.mode === S.mode;
    b.classList.toggle('aktif', aktif);
    b.setAttribute('aria-pressed', aktif);
  });

  // Header hanya menampilkan nama. Email ada di tooltip.
  $('#profilNama').textContent = PROFIL.nama;
  $('#profil').title = `Pengaturan (${PROFIL.email})`;
  $('#profil').setAttribute('aria-label', `Pengaturan, ${PROFIL.nama}`);
  $('#avatar').textContent = PROFIL.nama[0];

  const lencana = $('#lencanaInbox');
  lencana.textContent = S.inbox.length;
  lencana.hidden = !S.inbox.length;
  $('a[href="#inbox"]').setAttribute('aria-label',
    S.inbox.length ? `Kotak masuk, ${S.inbox.length} catatan menunggu` : 'Kotak masuk');

  $('#halaman').innerHTML = HALAMAN[UI.hal]();
}

function bacaAlamat() {
  UI.hal = location.hash.slice(1) || 'beranda';
  render();
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', bacaAlamat);

// Ambil data dari server dulu (kalau ada), baru gambar halaman
hubungkanServer().then(bacaAlamat);
