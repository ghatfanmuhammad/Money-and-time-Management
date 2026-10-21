'use strict';
/* Semua yang terjadi saat pengguna berinteraksi: klik tombol, mengisi kolom, menyeret kartu.

   Cara kerjanya: tombol di HTML diberi atribut data-aksi="nama". Satu pendengar klik
   di bawah mencari fungsi bernama sama di objek AKSI, menjalankannya, lalu menggambar
   ulang halaman. Kalau fungsinya mengembalikan false, halaman tidak digambar ulang. */

/* ----- Catat cepat: teks -> transaksi ----- */
function catatCepat(teks) {
  const h = bacaCatatan(teks);
  if (!h) { toast('Belum terbaca. Contoh: geprek 15000'); return false; }

  if (h.tipe === 'saldo') { koreksiSaldo(h.nominal); return true; }

  if (h.kategori) {
    tambahTransaksi({ tanggal: h.tanggal, jenis: h.jenis, nominal: h.nominal,
      kategori: h.kategori, ket: h.ket, sumber: 'cepat' });
    toast(`Dicatat: ${h.ket} ${rupiah(h.nominal)} (${h.kategori}). Saldo ${rupiah(hitungSaldo())}`);
  } else {
    // Kategori tidak dikenali: simpan di Kotak masuk untuk dipilih manual
    S.inbox.push({ id: uid(), tanggal: h.tanggal, jenis: h.jenis, nominal: h.nominal, ket: h.ket, teks: teks.trim() });
    simpan();
    toast('Kategori belum jelas, cek di Kotak masuk');
  }
  return true;
}

/* ----- Daftar aksi ----- */
const AKSI = {
  // kegiatan
  centang: (el) => { const k = cariKeg(el.dataset.id); k.status = k.status === 'selesai' ? 'belum' : 'selesai'; simpan(); },
  status: (el) => { const k = cariKeg(el.dataset.id); k.status = URUT_STATUS[(URUT_STATUS.indexOf(k.status) + 1) % 3]; simpan(); },
  prioritas: (el) => { const k = cariKeg(el.dataset.id); k.prioritas = URUT_PRIORITAS[(URUT_PRIORITAS.indexOf(k.prioritas) + 1) % 3]; simpan(); },
  tambahKeg: (el) => { dialogKegiatan(null, el.dataset.tgl); return false; },
  editKeg: (el) => { dialogKegiatan(cariKeg(el.dataset.id)); return false; },
  hapusKeg: (el) => {
    if (!confirm('Hapus kegiatan ini?')) return false;
    S.kegiatan = S.kegiatan.filter((k) => k.id !== el.dataset.id); simpan();
  },

  // halaman jadwal
  tampilJadwal: (el) => { UI.tampilJadwal = el.dataset.v; },
  mingguPrev: () => { UI.minggu = tambahHari(UI.minggu, -7); },
  mingguNext: () => { UI.minggu = tambahHari(UI.minggu, 7); },
  mingguIni: () => { UI.minggu = awalMinggu(hariIni()); },
  resetMinggu: () => {
    if (!confirm('Kembalikan semua status kegiatan minggu ini menjadi "Belum"?')) return false;
    const a = UI.minggu, b = tambahHari(a, 6);
    S.kegiatan.forEach((k) => { if (k.tanggal >= a && k.tanggal <= b) k.status = 'belum'; });
    simpan();
  },

  // transaksi
  tambahTrx: (el) => { dialogTrx(null, el.dataset.jenis); return false; },
  editTrx: (el) => { dialogTrx(cariTrx(el.dataset.id)); return false; },
  hapusTrx: (el) => {
    if (!confirm('Hapus transaksi ini? Saldo ikut berubah.')) return false;
    S.transaksi = S.transaksi.filter((t) => t.id !== el.dataset.id); simpan();
  },
  koreksi: () => { dialogKoreksi(); return false; },

  // kotak masuk
  inboxCatat: (el) => {
    const baris = el.closest('[data-inbox]');
    const i = S.inbox.find((x) => x.id === el.dataset.id);
    tambahTransaksi({ tanggal: i.tanggal, jenis: i.jenis, nominal: i.nominal,
      kategori: baris.querySelector('select').value, ket: i.ket, sumber: 'cepat' });
    S.inbox = S.inbox.filter((x) => x.id !== i.id); simpan();
    toast('Dicatat. Saldo ' + rupiah(hitungSaldo()));
  },
  inboxHapus: (el) => { S.inbox = S.inbox.filter((x) => x.id !== el.dataset.id); simpan(); },

  // bilah atas
  fokusCatat: () => { window.scrollTo(0, 0); $('#inputCatat').focus(); return false; },

  // pengaturan
  tema: (el) => { S.tema = el.dataset.tema; simpan(); },
  mode: (el) => { S.mode = el.dataset.mode; simpan(); },
  hapusContoh: () => {
    if (!confirm('Hapus semua data contoh dan mulai dari kosong?')) return false;
    S = Object.assign(bawaan(), { tema: S.tema, mode: S.mode }); simpan();
  },
  isiContoh: () => {
    if (!confirm('Ganti semua data dengan data contoh?')) return false;
    S = Object.assign(dataContoh(), { tema: S.tema, mode: S.mode }); simpan();
  },
  hapusSemua: () => {
    if (!confirm('Hapus SEMUA data? Tindakan ini tidak bisa dibatalkan.')) return false;
    S = Object.assign(bawaan(), { tema: S.tema, mode: S.mode, contoh: false }); simpan();
  },
  ekspor: () => {
    const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `hidupku-cadangan-${hariIni()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    return false;
  },
  impor: () => { $('#berkasImpor').click(); return false; },
  tutupDlg: () => { DLG.close(); return false; },
};

/* Satu pendengar klik untuk semua tombol ber-data-aksi */
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-aksi]');
  if (!el || !AKSI[el.dataset.aksi]) return;
  if (AKSI[el.dataset.aksi](el, e) !== false) render();
});

/* ----- Isian: filter keuangan, batas anggaran, saldo awal, periode laporan ----- */
function ubahIsian(e) {
  const el = e.target;
  if (el.dataset.filter) {
    UI[el.dataset.filter] = el.value;
    const daftar = $('#daftarTrx');
    if (daftar) daftar.innerHTML = htmlDaftarTrx(); // hanya daftar yang digambar ulang
  } else if (el.dataset.batas && e.type === 'change') {
    // Isian tampil dengan titik ribuan ("150.000"), disimpan sebagai angka murni
    S.anggaran[el.dataset.batas] = parseInt(el.value.replace(/\D/g, ''), 10) || 0;
    simpan();
    const sen = awalMinggu(hariIni());
    el.closest('[data-baris]').outerHTML = barisAnggaran(el.dataset.batas, sen, tambahHari(sen, 6));
  } else if (el.dataset.periode !== undefined) {
    UI.periode = el.value; render();
  } else if (el.dataset.saldoAwal !== undefined && e.type === 'change') {
    S.saldoAwal = Math.round(Number(el.value)) || 0; simpan();
    toast('Saldo awal diperbarui. Saldo sekarang ' + rupiah(hitungSaldo()));
  }
}
document.addEventListener('change', ubahIsian);
document.addEventListener('input', (e) => {
  if (e.target.dataset.filter === 'cari') ubahIsian(e);
  if (e.target.dataset.cariAktivitas !== undefined) { // tabel aktivitas di Beranda
    UI.cariAktivitas = e.target.value;
    $('#daftarAktivitas').innerHTML = htmlAktivitas();
  }
});

/* ----- Kolom catat cepat ----- */
$('#formCatat').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = $('#inputCatat');
  if (catatCepat(input.value)) { input.value = ''; render(); }
});

/* ----- Impor cadangan ----- */
$('#berkasImpor').addEventListener('change', (e) => {
  const berkas = e.target.files[0];
  if (!berkas) return;
  const baca = new FileReader();
  baca.onload = () => {
    try {
      const data = JSON.parse(baca.result);
      if (!Array.isArray(data.transaksi) || !Array.isArray(data.kegiatan)) throw new Error('format');
      S = Object.assign(bawaan(), data, { contoh: false });
      if (!TEMA.some((t) => t.id === S.tema)) S.tema = TEMA[0].id;
      simpan(); render(); toast('Cadangan berhasil dipulihkan');
    } catch (err) { toast('File cadangan tidak valid'); }
  };
  baca.readAsText(berkas);
  e.target.value = '';
});

/* ----- Seret dan lepas kartu di papan jadwal ----- */
let kartuDiseret = null;
const kolomDi = (e) => e.target.closest && e.target.closest('.kolom-papan');

document.addEventListener('dragstart', (e) => {
  const kartu = e.target.closest && e.target.closest('.kartu-papan');
  if (!kartu) return;
  kartuDiseret = kartu.dataset.id;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', kartuDiseret);
  kartu.classList.add('diseret');
});
document.addEventListener('dragend', () => {
  kartuDiseret = null;
  document.querySelectorAll('.diseret, .sasaran').forEach((el) => el.classList.remove('diseret', 'sasaran'));
});
document.addEventListener('dragover', (e) => {
  const kolom = kolomDi(e);
  if (!kolom || !kartuDiseret) return;
  e.preventDefault(); // tanpa ini browser tidak mengizinkan drop
  kolom.classList.add('sasaran');
});
document.addEventListener('dragleave', (e) => {
  const kolom = kolomDi(e);
  if (kolom && !kolom.contains(e.relatedTarget)) kolom.classList.remove('sasaran');
});
document.addEventListener('drop', (e) => {
  const kolom = kolomDi(e);
  if (!kolom || !kartuDiseret) return;
  e.preventDefault();
  const k = cariKeg(kartuDiseret);
  if (k && k.status !== kolom.dataset.status) { k.status = kolom.dataset.status; simpan(); }
  render();
});
