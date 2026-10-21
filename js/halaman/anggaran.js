'use strict';
/* Halaman Anggaran: batas pengeluaran per minggu untuk tiap kategori. */

// Satu baris kategori. Dipisah supaya bisa digambar ulang sendiri saat batasnya diubah.
function barisAnggaran(kat, dari, sampai) {
  const batas = S.anggaran[kat] || 0;
  const pakai = terpakaiKategori(kat, dari, sampai);
  const persen = batas ? Math.min(100, Math.round(pakai / batas * 100)) : 0;
  const info = batas
    ? (pakai > batas ? `<span class="minus">Lewat ${rupiah(pakai - batas)}</span>` : `Sisa ${rupiah(batas - pakai)}`)
    : 'Tanpa batas';
  return `<div class="baris-anggaran" data-baris="${kat}">
    <div><b>${kat}</b><div class="kecil">${rupiah(pakai)} terpakai &middot; ${info}</div></div>
    <input type="text" inputmode="numeric" autocomplete="off" value="${batas.toLocaleString('id-ID')}" data-batas="${kat}" aria-label="Batas mingguan ${kat} (Rp)">
    <div class="bar ${batas ? warnaBar(persen) : 'tanpa'}" ${batas ? '' : 'aria-hidden="true"'}><i style="width:${persen}%"></i></div>
  </div>`;
}

function vAnggaran() {
  const sen = awalMinggu(hariIni()), min = tambahHari(sen, 6);
  const { batas, terpakai } = ringkasBudget(sen, min);
  return `
    ${kepala('Anggaran', `Minggu ${tglPendek(sen)} - ${tglPendek(min)} &middot; ${batas ? rupiah(terpakai) + ' dari ' + rupiah(batas) : 'belum ada batas'}`)}
    <div class="kartu"><p class="kecil" style="margin-top:0">Isi batas pengeluaran per minggu untuk tiap kategori.
      Isi 0 kalau tidak ingin dibatasi. Bar berubah kuning di 80% dan merah saat lewat batas.</p>
      ${KATEGORI.map((k) => barisAnggaran(k, sen, min)).join('')}</div>`;
}
