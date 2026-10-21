'use strict';
/* Potongan tampilan yang dipakai di banyak halaman.
   Fungsi yang mengembalikan teks HTML dipakai dengan cara: elemen.innerHTML = fungsi(...). */

/* ----- Pesan singkat di bawah layar ----- */
let timerToast;
function toast(pesan) {
  const el = $('#toast');
  el.textContent = pesan;
  el.classList.add('tampil');
  clearTimeout(timerToast);
  timerToast = setTimeout(() => el.classList.remove('tampil'), 3600);
}

/* ----- Ikon kategori (jalur SVG, ukuran 24x24) ----- */
const IKON = {
  Makan: 'M5 11h14a7 7 0 0 1-14 0zM9 6c0 1.5 1 1.5 1 3M14 6c0 1.5 1 1.5 1 3',
  Jajan: 'M5 9h12v5a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5zM17 10h1.5a2.5 2.5 0 0 1 0 5H17',
  Transport: 'M4 16l2-6h12l2 6zM7 16v3M17 16v3',
  Belanja: 'M6 8h12l-1 12H7zM9 8a3 3 0 0 1 6 0',
  Kuliah: 'M6 4h9l3 3v13H6zM9 12h6M9 16h6',
  Tagihan: 'M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM11 18h2',
  Hiburan: 'M5 7h14v10H5zM10 10l4 2-4 2z',
  Kesehatan: 'M12 5v14M5 12h14',
  Lainnya: 'M6 12h.01M12 12h.01M18 12h.01',
  Pemasukan: 'M7 17L17 7M9 7h8v8',
  Koreksi: 'M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4',
  Plus: 'M12 5v14M5 12h14',
  Minus: 'M5 12h14',
  Keluar: 'M17 7L7 17M15 17H7V9',
  Target: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  Centang: 'M5 12l5 5 9-10',
  Filter: 'M4 7h16M7 12h10M10 17h4',
  Cari: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
};
function ikon(nama) {
  return `<svg class="ikon" viewBox="0 0 24 24" aria-hidden="true"><path d="${IKON[nama] || IKON.Lainnya}"/></svg>`;
}

/* ----- Kepala halaman: judul, keterangan, tombol di kanan ----- */
const kepala = (judul, sub, aksi = '') =>
  `<header class="kepala"><div><h1>${judul}</h1><p class="sub">${sub}</p></div>
   <div class="kepala-aksi">${aksi}</div></header>`;

function warnaBar(persen) { return persen >= 100 ? 'bahaya' : persen >= 80 ? 'warn' : ''; }

/* ----- Lencana perubahan, misalnya "naik 8%".
   baikJikaNaik: true untuk pemasukan, false untuk pengeluaran. ----- */
function lencanaDelta(sekarang, sebelumnya, baikJikaNaik) {
  const persen = selisihPersen(sekarang, sebelumnya);
  if (persen === null) return '';
  if (persen === 0) return '<span class="delta netral">sama</span>';
  const baik = (persen > 0) === baikJikaNaik;
  return `<span class="delta ${baik ? 'baik' : 'buruk'}">${persen > 0 ? '&uarr;' : '&darr;'} ${Math.abs(persen)}%</span>`;
}

/* ----- Satu baris kegiatan (Beranda dan Jadwal) ----- */
function barisKeg(k) {
  const selesai = k.status === 'selesai';
  return `<div class="keg ${selesai ? 'selesai' : ''}">
    <div class="keg-atas">
      <input type="checkbox" ${selesai ? 'checked' : ''} data-aksi="centang" data-id="${k.id}" aria-label="Tandai selesai: ${esc(k.nama)}">
      <button class="titik ${k.prioritas}" data-aksi="prioritas" data-id="${k.id}"
        title="Prioritas ${NAMA_PRIORITAS[k.prioritas].toLowerCase()} (klik untuk ganti)"
        aria-label="Prioritas ${NAMA_PRIORITAS[k.prioritas].toLowerCase()}, klik untuk ganti"></button>
      <button class="nama" data-aksi="editKeg" data-id="${k.id}" title="Klik untuk ubah">${esc(k.nama)}</button>
    </div>
    <div class="keg-bawah">
      <span>${k.jam || '--:--'}</span>
      <button class="pil ${k.status}" data-aksi="status" data-id="${k.id}" title="Klik untuk ganti status">${NAMA_STATUS[k.status]}</button>
      <button class="x" data-aksi="hapusKeg" data-id="${k.id}" aria-label="Hapus kegiatan ${esc(k.nama)}" title="Hapus">&times;</button>
    </div>
  </div>`;
}

/* ----- Papan Kanban: tiga kolom Belum, Proses, Selesai -----
   Kartu bisa diseret antar kolom (lihat aksi.js), atau pakai tombol "Ke ..." di kartu. */
function kartuPapan(k) {
  const berikut = URUT_STATUS[(URUT_STATUS.indexOf(k.status) + 1) % 3];
  const hari = HARI_PENDEK[dariTanggal(k.tanggal).getDay()];
  return `<div class="kartu-papan" draggable="true" data-id="${k.id}">
    <div class="papan-atas"><span class="tag">${hari}, ${tglPendek(k.tanggal)}</span>
      <button class="x" data-aksi="hapusKeg" data-id="${k.id}" aria-label="Hapus kegiatan ${esc(k.nama)}">&times;</button></div>
    <button class="judul-papan" data-aksi="editKeg" data-id="${k.id}">${esc(k.nama)}</button>
    <div class="papan-bawah">
      <span>${k.jam || '--:--'}</span>
      <span class="prioritas"><i class="titik ${k.prioritas}"></i>${NAMA_PRIORITAS[k.prioritas]}</span>
    </div>
    <button class="pindah" data-aksi="status" data-id="${k.id}">Ke ${NAMA_STATUS[berikut]} &rsaquo;</button>
  </div>`;
}

function papanKegiatan(daftar) {
  return `<div class="papan">${URUT_STATUS.map((st) => {
    const isi = daftar.filter((k) => k.status === st);
    return `<div class="kolom-papan ${st}" data-status="${st}">
      <h3>${NAMA_STATUS[st]} <span class="jumlah">${isi.length}</span></h3>
      ${isi.map(kartuPapan).join('') || '<p class="kosong kecil">Kosong</p>'}
    </div>`;
  }).join('')}</div>`;
}

/* ----- Satu baris transaksi ----- */
function barisTrx(t, denganAksi) {
  const tanda = t.jenis === 'masuk' ? '+' : '-';
  const aksi = denganAksi ? `<div class="trx-aksi">
      ${t.kategori === 'Koreksi' ? '' : `<button class="btn mini" data-aksi="editTrx" data-id="${t.id}">Ubah</button>`}
      <button class="btn mini hapus" data-aksi="hapusTrx" data-id="${t.id}">Hapus</button></div>` : '';
  return `<div class="trx">
    <span class="tgl">${tglPendek(t.tanggal)}</span>
    <div><div class="ket">${esc(t.ket)}</div>
      <span class="chip">${esc(t.kategori)}</span>${t.sumber === 'cepat' ? '<span class="chip abu">catat cepat</span>' : ''}${t.sumber === 'telegram' ? '<span class="chip abu">Telegram</span>' : ''}
      ${aksi}</div>
    <b class="${t.jenis === 'masuk' ? 'plus' : 'minus'}">${tanda}${rupiah(t.nominal)}</b>
  </div>`;
}

/* ----- Grafik batang pengeluaran 7 hari terakhir.
   Tiap batang dibagi dua: kategori terbesar (gelap) dan sisanya (bergaris). ----- */
function grafikHarian() {
  const { baris, kategori } = dataHarian7();
  const maks = Math.max(...baris.map((b) => b.total));

  // Sumbu tegak: langkah dipilih supaya paling banyak 4 garis
  const langkah = [5e3, 1e4, 25e3, 5e4, 1e5, 25e4, 5e5, 1e6, 25e5, 5e6]
    .find((l) => Math.ceil(maks / l) <= 4) || 1e7;
  const garis = Math.max(1, Math.ceil(maks / langkah));
  const puncak = garis * langkah;
  const label = Array.from({ length: garis + 1 }, (_, i) => (garis - i) * langkah);

  const kolom = baris.map((b) => {
    const bagian = kategori ? (b.kat[kategori] || 0) : 0;
    const lain = b.total - bagian;
    const hari = HARI_PENDEK[dariTanggal(b.tgl).getDay()];
    return `<div class="kol-h ${b.tgl === hariIni() ? 'hariini' : ''}">
      <div class="batang-h2" style="height:${b.total / puncak * 100}%" title="${hari}, ${tglPendek(b.tgl)}: ${rupiah(b.total)}">
        ${lain ? `<i class="lain" style="flex:${lain}"></i>` : ''}${bagian ? `<i class="utama-seg" style="flex:${bagian}"></i>` : ''}
      </div>
      <span>${hari}</span></div>`;
  }).join('');

  const ringkas = maks > 0
    ? `Pengeluaran harian 7 hari terakhir. Tertinggi ${rupiah(maks)}.`
    : 'Pengeluaran harian 7 hari terakhir. Belum ada pengeluaran.';

  return `<div class="grafik-harian">
      <div class="grafik-kepala"><b>Pengeluaran</b>
        <span class="legenda-g">${kategori ? `<i class="utama-seg"></i>${esc(kategori)}` : ''}<i class="lain"></i>${kategori ? 'Lainnya' : 'Pengeluaran'}</span></div>
      <div class="plot" role="img" aria-label="${ringkas}">
        <div class="sumbu-y">${label.map((n) => `<span>${n ? rupiahRingkas(n) : '0'}</span>`).join('')}</div>
        <div class="area-plot" style="--garis-n:${garis}">${kolom}</div>
      </div>
    </div>`;
}

/* ----- Peta panas pengeluaran: 5 minggu x 7 hari, isi sel dalam ribuan rupiah ----- */
function petaPanas() {
  const { minggu, maks } = dataPetaPanas();
  const h = hariIni();
  let tglMaks = null;
  minggu.forEach((m) => m.sel.forEach((s) => { if (s.nilai === maks && maks > 0) tglMaks = s.tgl; }));

  const label = maks > 0
    ? `Peta panas pengeluaran harian, 5 minggu terakhir. Tertinggi ${rupiah(maks)} pada ${tglPendek(tglMaks)}.`
    : 'Peta panas pengeluaran harian, 5 minggu terakhir. Belum ada pengeluaran.';

  const baris = minggu.map((m) => `<span class="minggu-ke">${tglPendek(m.mulai)}</span>` + m.sel.map((s) => {
    const tingkat = s.depan ? 'depan' : s.nilai === 0 ? 'l0' : 'l' + Math.min(5, Math.max(1, Math.ceil(s.nilai / maks * 5)));
    // Dalam ribuan; mulai 1 juta ditulis "25jt" supaya muat di sel
    const isi = s.depan || s.nilai === 0 ? '' : s.nilai >= 1e6 ? Math.round(s.nilai / 1e6) + 'jt' : Math.max(1, Math.round(s.nilai / 1000));
    const judul = s.depan ? 'belum terjadi' : rupiah(s.nilai);
    return `<div class="sel-panas ${tingkat} ${s.tgl === h ? 'hariini' : ''}" title="${tglPendek(s.tgl)}: ${judul}">${isi}</div>`;
  }).join('')).join('');

  return `<div class="panas" role="img" aria-label="${label}">
      <span></span>${HARI_SENIN.map((x) => `<span class="nama-hari">${x}</span>`).join('')}${baris}
    </div>
    <div class="legenda">Sedikit
      <i class="sel-panas l1"></i><i class="sel-panas l2"></i><i class="sel-panas l3"></i><i class="sel-panas l4"></i><i class="sel-panas l5"></i>
      Banyak</div>`;
}
