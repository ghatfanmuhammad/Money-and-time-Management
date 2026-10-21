'use strict';
/* Jendela form untuk tambah dan ubah kegiatan, transaksi, serta koreksi saldo.
   Semuanya memakai satu elemen <dialog id="dlg"> lewat bukaForm(). */

const DLG = $('#dlg');

function bukaForm({ judul, isi, tombol = 'Simpan', siap, onSimpan }) {
  $('#dlgJudul').textContent = judul;
  $('#dlgIsi').innerHTML = isi;
  $('#dlgOk').textContent = tombol;
  const frm = $('#frm');
  frm.onsubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(frm));
    if (onSimpan(data) !== false) DLG.close(); // return false = form tetap terbuka
  };
  DLG.showModal();
  if (siap) siap(frm);
  const pertama = frm.querySelector('input:not([type="radio"]), select');
  if (pertama) pertama.focus();
}

function dialogKegiatan(k, tanggal) {
  const baru = !k;
  const d = k || { tanggal: tanggal || hariIni(), jam: '', nama: '', prioritas: 'sedang', status: 'belum' };
  bukaForm({
    judul: baru ? 'Tambah kegiatan' : 'Ubah kegiatan',
    isi: `<label>Nama kegiatan<input name="nama" type="text" maxlength="80" required value="${esc(d.nama)}" placeholder="Contoh: Kuliah statistik"></label>
      <label>Tanggal<input name="tanggal" type="date" required value="${d.tanggal}"></label>
      <label>Jam (boleh kosong)<input name="jam" type="time" value="${d.jam}"></label>
      <label>Prioritas<select name="prioritas">${URUT_PRIORITAS.map((p) =>
        `<option value="${p}" ${d.prioritas === p ? 'selected' : ''}>${NAMA_PRIORITAS[p]}</option>`).join('')}</select></label>
      <label>Status<select name="status">${URUT_STATUS.map((s) =>
        `<option value="${s}" ${d.status === s ? 'selected' : ''}>${NAMA_STATUS[s]}</option>`).join('')}</select></label>`,
    onSimpan: (f) => {
      const nama = f.nama.trim();
      if (!nama) { toast('Nama kegiatan wajib diisi'); return false; }
      const isi = { nama, tanggal: f.tanggal, jam: f.jam, prioritas: f.prioritas, status: f.status };
      if (baru) S.kegiatan.push({ id: uid(), dibuat: Date.now(), ...isi });
      else Object.assign(k, isi);
      simpan(); render();
    },
  });
}

function dialogTrx(t, jenisAwal) {
  const baru = !t;
  const d = t || { jenis: jenisAwal || 'keluar', tanggal: hariIni(), nominal: '', kategori: 'Makan', ket: '' };
  bukaForm({
    judul: baru ? 'Tambah transaksi' : 'Ubah transaksi',
    isi: `<div class="pilih-jenis">
        <label><input type="radio" name="jenis" value="keluar" ${d.jenis === 'keluar' ? 'checked' : ''}> Pengeluaran</label>
        <label><input type="radio" name="jenis" value="masuk" ${d.jenis === 'masuk' ? 'checked' : ''}> Pemasukan</label></div>
      <label>Nominal (Rp)<input name="nominal" type="number" min="1" step="any" required value="${d.nominal}"></label>
      <label>Keterangan<input name="ket" type="text" maxlength="60" value="${esc(d.ket)}" placeholder="Contoh: Geprek"></label>
      <label>Tanggal<input name="tanggal" type="date" required value="${d.tanggal}"></label>
      <label id="labelKat">Kategori<select name="kategori">${KATEGORI.map((k) =>
        `<option ${d.kategori === k ? 'selected' : ''}>${k}</option>`).join('')}</select></label>`,
    siap: (frm) => {
      // Kategori hanya perlu dipilih untuk pengeluaran
      const atur = () => { $('#labelKat').hidden = frm.elements.jenis.value === 'masuk'; };
      frm.querySelectorAll('input[name="jenis"]').forEach((r) => r.addEventListener('change', atur));
      atur();
    },
    onSimpan: (f) => {
      const nominal = Math.round(Number(f.nominal));
      if (!(nominal > 0)) { toast('Nominal harus lebih dari 0'); return false; }
      const kategori = f.jenis === 'masuk' ? 'Pemasukan' : f.kategori;
      const isi = { jenis: f.jenis, nominal, tanggal: f.tanggal, kategori, ket: f.ket.trim() || kategori };
      if (baru) tambahTransaksi(isi); else { Object.assign(t, isi); simpan(); }
      render();
    },
  });
}

function dialogKoreksi() {
  bukaForm({
    judul: 'Koreksi saldo',
    isi: `<p class="kecil" style="margin:0">Saldo di aplikasi: <b>${rupiah(hitungSaldo())}</b>. Isi saldo yang sebenarnya,
      dan selisihnya dicatat otomatis sebagai koreksi.</p>
      <label>Saldo sebenarnya (Rp)<input name="saldo" type="number" step="any" required value="${hitungSaldo()}"></label>`,
    onSimpan: (f) => {
      const n = Math.round(Number(f.saldo));
      if (!Number.isFinite(n)) { toast('Isi angka saldo'); return false; }
      koreksiSaldo(n); render();
    },
  });
}
