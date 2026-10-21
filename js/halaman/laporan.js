'use strict';
/* Halaman Laporan: pengeluaran per kategori, per hari, dan grafik saldo harian. */

// Rentang tanggal sesuai pilihan periode: [dari, sampai]
function rentangLaporan() {
  const h = hariIni(), d = dariTanggal(h);
  if (UI.periode === 'bulanini') return [fmtTanggal(new Date(d.getFullYear(), d.getMonth(), 1)), h];
  if (UI.periode === 'bulanlalu') {
    return [fmtTanggal(new Date(d.getFullYear(), d.getMonth() - 1, 1)), fmtTanggal(new Date(d.getFullYear(), d.getMonth(), 0))];
  }
  return [tambahHari(h, -6), h];
}

// Grafik garis saldo di akhir tiap hari. Garis dan area digambar di SVG (dilebarkan mengikuti kartu),
// sedangkan angka dan tanggal ditulis sebagai HTML supaya ukuran hurufnya tetap 12px.
function grafikSaldo(hari) {
  // Tanpa transaksi di periode ini, saldo tidak berubah dan grafiknya tidak bermakna
  if (!S.transaksi.some((t) => t.tanggal >= hari[0] && t.tanggal <= hari[hari.length - 1])) {
    return '<p class="kosong">Belum ada transaksi di periode ini, jadi belum ada perubahan saldo untuk digambar.</p>';
  }
  const W = 600, H = 170, PY = 10;
  const titik = hari.map((d) => ({ d, v: saldoSampai(d) }));
  const nilai = titik.map((p) => p.v);
  const terendah = Math.min(...nilai), tertinggi = Math.max(...nilai); // dipakai untuk label
  // Skala: kalau saldo datar, rentangnya dilebarkan supaya garis di tengah.
  // Nilai ini hanya untuk menggambar dan tidak pernah ditulis sebagai label.
  const bawah = terendah === tertinggi ? terendah - 1 : terendah;
  const atas = terendah === tertinggi ? tertinggi + 1 : tertinggi;

  const x = (i) => (titik.length < 2 ? W / 2 : i * W / (titik.length - 1));
  const y = (v) => H - PY - (v - bawah) * (H - 2 * PY) / (atas - bawah);
  const garis = titik.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ');
  const area = `${garis} L${x(titik.length - 1).toFixed(1)},${H} L${x(0).toFixed(1)},${H} Z`;

  const info = terendah === tertinggi
    ? `<span>Saldo tetap <b>${rupiah(tertinggi)}</b></span>`
    : `<span>Tertinggi <b>${rupiah(tertinggi)}</b></span><span>Terendah <b>${rupiah(terendah)}</b></span>`;
  return `<div class="grafik-info">${info}</div>
    <svg class="grafik" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img"
      aria-label="Grafik saldo harian, dari ${rupiah(titik[0].v)} menjadi ${rupiah(titik[titik.length - 1].v)}">
      <path class="area-saldo" d="${area}"/><path class="garis-saldo" d="${garis}"/>
    </svg>
    <div class="grafik-tanggal"><span>${tglPendek(hari[0])}</span><span>${tglPendek(hari[hari.length - 1])}</span></div>`;
}

function vLaporan() {
  const [dari, sampai] = rentangLaporan();
  const hari = daftarHari(dari, sampai);
  const masuk = totalAntara('masuk', dari, sampai), keluar = totalAntara('keluar', dari, sampai);

  const urut = pengeluaranPerKategori(dari, sampai);
  const maks = urut.length ? urut[0][1] : 1;

  const harian = hari.map((d) => ({ d, v: totalAntara('keluar', d, d) }));
  const maksHari = Math.max(1, ...harian.map((x) => x.v));
  const rata = hari.length ? keluar / hari.length : 0;
  const pilih = (v, nama) => `<option value="${v}" ${UI.periode === v ? 'selected' : ''}>${nama}</option>`;

  // Angka tanggal di bawah batang: semua kalau sedikit, kelipatan 5 kalau banyak
  const tglBatang = (d) => {
    const tgl = dariTanggal(d).getDate();
    return hari.length <= 10 || tgl % 5 === 0 ? tgl : '';
  };

  return `
    ${kepala('Laporan', `${tglPendek(dari)} - ${tglPendek(sampai)}`,
      `<select data-periode style="width:auto;margin:0" aria-label="Periode">
        ${pilih('7hari', '7 hari terakhir')}${pilih('bulanini', 'Bulan ini')}${pilih('bulanlalu', 'Bulan lalu')}</select>`)}
    <div class="grid-ringkas">
      <div class="kartu"><div class="label">Pemasukan</div><div class="angka plus">${rupiah(masuk)}</div></div>
      <div class="kartu"><div class="label">Pengeluaran</div><div class="angka minus">${rupiah(keluar)}</div></div>
      <div class="kartu"><div class="label">Rata-rata per hari</div><div class="angka">${rupiah(rata)}</div>
        <div class="kecil">${urut.length ? 'Terbesar: ' + urut[0][0] : 'Belum ada pengeluaran'}</div></div>
    </div>
    <div class="baris-dua">
      <div class="kartu"><h2>Pengeluaran per kategori</h2>
        ${urut.length ? urut.map(([k, v]) => `<div class="batang-h"><span>${k}</span>
          <div class="bar"><i style="width:${Math.round(v / maks * 100)}%"></i></div>
          <b>${rupiah(v)}</b></div>`).join('') : '<p class="kosong">Belum ada pengeluaran di periode ini.</p>'}</div>
      <div class="kartu"><h2>Pengeluaran per hari</h2>
        <div class="batang-v">${harian.map((x) => `<div class="kolom-v" title="${tglPendek(x.d)}: ${rupiah(x.v)}">
          ${x.v ? `<i style="height:${Math.round(x.v / maksHari * 100)}%"></i>` : ''}<span>${tglBatang(x.d)}</span></div>`).join('')}</div></div>
    </div>
    <div class="kartu" style="margin-top:14px"><h2>Saldo harian</h2>${grafikSaldo(hari)}</div>`;
}
