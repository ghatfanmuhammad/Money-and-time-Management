'use strict';
/* Halaman Jadwal mingguan.
   Dua tampilan: kartu per hari (Senin sampai Minggu) atau papan Kanban per status. */

function vJadwal() {
  const sen = UI.minggu, min = tambahHari(sen, 6), h = hariIni();
  const d1 = dariTanggal(sen), d2 = dariTanggal(min);
  const rentang = `${d1.getDate()} ${BULAN_PENDEK[d1.getMonth()]} - ${d2.getDate()} ${BULAN_PENDEK[d2.getMonth()]} ${d2.getFullYear()}`;
  const semua = kegiatanDi(sen, min);
  const sel = semua.filter((k) => k.status === 'selesai').length;
  const papan = UI.tampilJadwal === 'papan';

  const kartuHari = () => daftarHari(sen, min).map((tgl) => {
    const keg = S.kegiatan.filter((k) => k.tanggal === tgl).sort(urutJam);
    const s = keg.filter((k) => k.status === 'selesai').length;
    const persen = keg.length ? Math.round(s / keg.length * 100) : 0;
    const d = dariTanggal(tgl);
    return `<article class="hari ${tgl === h ? 'hariini' : ''}">
      <div class="hari-kepala">
        <div><b>${NAMA_HARI[d.getDay()]}</b><small>${tglPendek(tgl)}</small></div>
        ${tgl === h ? '<span class="tanda-hariini">HARI INI</span>' : ''}
      </div>
      ${keg.length ? keg.map(barisKeg).join('') : '<p class="kosong" style="padding:8px 12px;margin:0">Belum ada kegiatan</p>'}
      <button class="tambah" data-aksi="tambahKeg" data-tgl="${tgl}">+ Tambah</button>
      <div class="hari-kaki"><div class="bar"><i style="width:${persen}%"></i></div><span>${s}/${keg.length}</span></div>
    </article>`;
  }).join('');

  const petunjuk = papan
    ? 'Seret kartu ke kolom lain, atau pakai tombol di kartu, untuk mengganti status. Klik judul kartu untuk mengubahnya.'
    : 'Klik kotak untuk menandai selesai, titik warna untuk mengganti prioritas (merah tinggi, kuning sedang, hijau rendah), label status untuk mengganti Belum, Proses, atau Selesai, dan nama kegiatan untuk mengubahnya.';

  return `
    ${kepala('Jadwal mingguan', `${rentang} &middot; ${sel} dari ${semua.length} kegiatan selesai`,
      `<div class="pilih-tampil" role="group" aria-label="Tampilan jadwal">
         <button class="btn ${papan ? '' : 'aktif'}" data-aksi="tampilJadwal" data-v="hari" aria-pressed="${!papan}">Per hari</button>
         <button class="btn ${papan ? 'aktif' : ''}" data-aksi="tampilJadwal" data-v="papan" aria-pressed="${papan}">Papan</button></div>
       <button class="btn" data-aksi="mingguPrev" aria-label="Minggu sebelumnya">&lsaquo;</button>
       <button class="btn" data-aksi="mingguIni">Minggu ini</button>
       <button class="btn" data-aksi="mingguNext" aria-label="Minggu berikutnya">&rsaquo;</button>
       <button class="btn" data-aksi="resetMinggu">Atur ulang status</button>`)}
    <p class="kecil" style="margin:-6px 0 14px">${petunjuk}</p>
    ${papan ? `<div class="kartu">${papanKegiatan(semua)}</div>` : `<div class="minggu">${kartuHari()}</div>`}`;
}
