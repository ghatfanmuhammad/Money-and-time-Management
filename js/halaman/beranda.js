'use strict';
/* Halaman Beranda: ringkasan hari ini, minggu ini, dan bulan ini.
   Isi dari atas ke bawah: sapaan, kartu saldo dan angka utama, grafik 7 hari,
   batas bulanan, jadwal hari ini, aktivitas terbaru, peta panas, papan jadwal.
   Letak tiap kartu diatur lewat grid-area di css/halaman.css (.dash). */

function sapaan() {
  const jam = new Date().getHours();
  return jam < 11 ? 'pagi' : jam < 15 ? 'siang' : jam < 18 ? 'sore' : 'malam';
}

/* Kartu angka kecil: judul dan ikon bulat di atas, angka besar di bawah */
function kartuKecil({ area, kelas = '', judul, ikonNama, angka, kaki = '' }) {
  return `<section class="kpi-k ${kelas}" style="grid-area:${area}">
    <div class="kpi-atas"><span>${judul}</span><span class="lingkar">${ikon(ikonNama)}</span></div>
    <div class="kpi-bawah"><div class="angka-besar">${angka}</div><div class="kpi-kaki">${kaki}</div></div>
  </section>`;
}

/* Pesan peringatan: kategori yang paling dekat dengan batas mingguannya */
function peringatanBudget(sen, min) {
  let tertinggi = null;
  for (const kat of KATEGORI) {
    const batas = S.anggaran[kat] || 0;
    if (!batas) continue;
    const persen = Math.round(terpakaiKategori(kat, sen, min) / batas * 100);
    if (!tertinggi || persen > tertinggi.persen) tertinggi = { kat, persen };
  }
  if (!tertinggi) return `<div class="pesan ok">Belum ada batas. Atur di <a href="#anggaran">Anggaran</a>.</div>`;
  if (tertinggi.persen >= 100) return `<div class="pesan bahaya">${esc(tertinggi.kat)} sudah lewat batas minggu ini (${tertinggi.persen}%).</div>`;
  if (tertinggi.persen >= 50) return `<div class="pesan ${tertinggi.persen >= 80 ? 'bahaya' : 'warn'}">${esc(tertinggi.kat)} sudah ${tertinggi.persen}% dari batas minggu ini.</div>`;
  return `<div class="pesan ok">Pengeluaran minggu ini masih aman.</div>`;
}

/* Tabel aktivitas terbaru: transaksi dan catatan di Kotak masuk, yang terbaru di atas.
   `kata` menyaring berdasarkan keterangan atau kategori. */
function htmlAktivitas() {
  const kata = UI.cariAktivitas.trim().toLowerCase();
  const baris = [
    ...S.transaksi.map((t) => ({
      tanggal: t.tanggal, waktu: t.dibuat, ket: t.ket, kat: t.kategori, jenis: t.jenis, nominal: t.nominal,
      sumber: { cepat: 'Catat cepat', telegram: 'Telegram' }[t.sumber] || 'Manual', menunggu: false,
    })),
    ...S.inbox.map((i) => ({
      tanggal: i.tanggal, waktu: 0, ket: i.ket, kat: 'Belum ada', jenis: i.jenis, nominal: i.nominal,
      sumber: 'Catat cepat', menunggu: true,
    })),
  ]
    .filter((b) => !kata || b.ket.toLowerCase().includes(kata) || b.kat.toLowerCase().includes(kata))
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal) || (b.waktu || 0) - (a.waktu || 0))
    .slice(0, 6);

  if (!baris.length) return `<p class="kosong">${kata ? 'Tidak ada transaksi yang cocok.' : 'Belum ada transaksi. Coba ketik di kolom catat cepat.'}</p>`;

  return baris.map((b) => `<div class="tabel-baris" role="row">
      <div class="sel-ket"><span class="ikon-putih">${ikon(b.menunggu ? 'Plus' : b.kat)}</span>
        <div><b>${esc(b.ket)}</b><small>${b.sumber}</small></div></div>
      <span class="sel-kat">${esc(b.kat)}</span>
      <b class="sel-jml ${b.jenis === 'masuk' ? 'plus' : 'minus'}">${b.jenis === 'masuk' ? '+' : '-'}${rupiah(b.nominal)}</b>
      <span class="sel-status">${b.menunggu
        ? '<a href="#inbox"><i class="bulat warn"></i>Menunggu kategori</a>'
        : '<i class="bulat ok"></i>Tercatat'}</span>
      <span class="sel-tgl">${tglLengkap(b.tanggal, b.waktu)}</span>
    </div>`).join('');
}

function vBeranda() {
  const h = hariIni(), sen = awalMinggu(h), min = tambahHari(sen, 6);
  const bln = rentangBulan(h);

  /* Angka bulan ini, dibandingkan dengan periode yang sama bulan lalu */
  const saldo = hitungSaldo();
  const deltaSaldo = lencanaDelta(saldo, saldoSampai(bln.akhirLalu), true);
  const masuk = totalAntara('masuk', bln.awal, h), masukLalu = totalAntara('masuk', bln.awalLalu, bln.sampaiLalu);
  const keluar = totalAntara('keluar', bln.awal, h), keluarLalu = totalAntara('keluar', bln.awalLalu, bln.sampaiLalu);
  const banding = 'title="Dibanding periode yang sama bulan lalu"';

  /* Kategori teratas bulan ini */
  const teratas = pengeluaranPerKategori(bln.awal, bln.akhir).slice(0, 3);
  const ubinKat = teratas.map(([kat, jumlah]) => {
    const batas = Math.round((S.anggaran[kat] || 0) * bln.hari / 7);
    return `<div class="ubin-kat"><b>${esc(kat)}</b><strong>${rupiah(jumlah)}</strong>
      <small>${batas ? Math.round(jumlah / batas * 100) + '% dari batas' : 'Tanpa batas'}</small></div>`;
  }).join('') || '<p class="kosong kecil">Belum ada pengeluaran bulan ini.</p>';

  /* Sisa budget minggu ini */
  const { batas, terpakai } = ringkasBudget(sen, min);
  const kartuBudget = batas
    ? kartuKecil({ area: 'budget', judul: 'Sisa budget minggu ini', ikonNama: 'Target',
      angka: terpakai > batas ? 'Lewat ' + rupiah(terpakai - batas) : rupiah(batas - terpakai),
      kaki: `<span class="kecil">dari ${rupiah(batas)}</span>` })
    : kartuKecil({ area: 'budget', judul: 'Sisa budget minggu ini', ikonNama: 'Target', angka: '-',
      kaki: '<span class="kecil">Atur di <a href="#anggaran">Anggaran</a></span>' });

  /* Kegiatan hari ini */
  const kegHariIni = kegiatanDi(h, h);
  const selesaiHariIni = kegHariIni.filter((k) => k.status === 'selesai').length;
  const persenKeg = kegHariIni.length ? Math.round(selesaiHariIni / kegHariIni.length * 100) : 0;
  const barisJadwal = kegHariIni.map((k) => `<div class="cek ${k.status === 'selesai' ? 'selesai' : ''}">
      <input type="checkbox" ${k.status === 'selesai' ? 'checked' : ''} data-aksi="centang" data-id="${k.id}" aria-label="Tandai selesai: ${esc(k.nama)}">
      <span class="jam">${(k.jam || '--:--').replace(':', '.')}</span>
      <button class="nama" data-aksi="editKeg" data-id="${k.id}" title="Klik untuk ubah">${esc(k.nama)}</button>
      <button class="titik ${k.prioritas}" data-aksi="prioritas" data-id="${k.id}"
        title="Prioritas ${NAMA_PRIORITAS[k.prioritas].toLowerCase()} (klik untuk ganti)"
        aria-label="Prioritas ${NAMA_PRIORITAS[k.prioritas].toLowerCase()}, klik untuk ganti"></button>
    </div>`).join('');

  /* Batas pengeluaran bulanan: dari batas mingguan di Anggaran, dikali jumlah hari / 7 */
  const dataBulan = ringkasBudget(bln.awal, bln.akhir);
  const batasBulan = Math.round(dataBulan.batas * bln.hari / 7);
  const persenBulan = batasBulan ? Math.round(dataBulan.terpakai / batasBulan * 100) : 0;
  const kartuBatas = batasBulan
    ? `<div class="bar besar ${warnaBar(persenBulan)}"><i style="width:${Math.min(100, persenBulan)}%"></i></div>
       <div class="baris-batas"><span><b>${rupiah(dataBulan.terpakai)}</b> terpakai</span><span>dari ${rupiah(batasBulan)}</span></div>`
    : '<p class="kosong">Belum ada batas. Atur di <a href="#anggaran">Anggaran</a>.</p>';

  const kegMinggu = kegiatanDi(sen, min);

  return `
    ${S.contoh ? `<div class="banner"><span>Ini data contoh supaya tampilannya terisi. Hapus kalau mau mulai dari kosong.</span>
      <button class="btn mini" data-aksi="hapusContoh">Hapus data contoh</button></div>` : ''}
    ${S.inbox.length ? `<div class="banner"><span>${S.inbox.length} catatan menunggu kategori.</span>
      <a class="btn mini" href="#inbox">Buka Kotak masuk</a></div>` : ''}

    ${kepala(`Selamat ${sapaan()}, ${esc(PROFIL.nama.split(' ')[0])}`,
      `Pantau jadwal dan keuanganmu hari ini. ${tglPanjang(h)}.`,
      `<button class="btn primer" data-aksi="tambahKeg" data-tgl="${h}">+ Kegiatan</button>`)}

    <div class="dash">
      <section class="kartu k-saldo" style="grid-area:saldo">
        <div class="label">Total saldo</div>
        <div class="saldo-besar ${saldo < 0 ? 'minus' : ''}">${rupiah(saldo)}</div>
        <div class="kpi-kaki">${deltaSaldo}<span class="kecil">${deltaSaldo ? 'dari bulan lalu' : 'Saldo awal ' + rupiah(S.saldoAwal)}</span></div>
        <div class="aksi-saldo">
          <button class="btn gelap besar" data-aksi="tambahTrx" data-jenis="masuk">${ikon('Plus')} Pemasukan</button>
          <button class="btn besar" data-aksi="tambahTrx" data-jenis="keluar">${ikon('Minus')} Pengeluaran</button>
        </div>
        <div class="panel-kat">
          <div class="panel-judul"><b>Kategori teratas</b><span>bulan ini</span></div>
          <div class="ubin-baris">${ubinKat}</div>
        </div>
      </section>

      ${kartuKecil({ area: 'masuk', kelas: 'sorot', judul: 'Pemasukan', ikonNama: 'Pemasukan', angka: rupiah(masuk),
        kaki: `<span ${banding}>${lencanaDelta(masuk, masukLalu, true)}</span><span class="kecil">bulan ini</span>` })}
      ${kartuKecil({ area: 'keluar', judul: 'Pengeluaran', ikonNama: 'Keluar', angka: rupiah(keluar),
        kaki: `<span ${banding}>${lencanaDelta(keluar, keluarLalu, false)}</span><span class="kecil">bulan ini</span>` })}
      ${kartuBudget}
      ${kartuKecil({ area: 'keg', judul: 'Kegiatan hari ini', ikonNama: 'Centang',
        angka: `${selesaiHariIni} dari ${kegHariIni.length}`,
        kaki: kegHariIni.length ? `<span class="delta baik">${persenKeg}% selesai</span>` : '<span class="kecil">Belum ada kegiatan</span>' })}

      <section class="kartu k-grafik" style="grid-area:chart">
        <h2>7 hari terakhir</h2>
        <p class="sub-kartu">Ke mana uangmu pergi, per hari dan per kategori</p>
        ${grafikHarian()}
      </section>

      <section class="kartu" style="grid-area:batas">
        <h2>Batas pengeluaran bulanan</h2>
        <p class="sub-kartu">Dihitung dari batas mingguan di Anggaran, hanya untuk kategori yang punya batas</p>
        ${kartuBatas}
        ${peringatanBudget(sen, min)}
      </section>

      <section class="kartu" style="grid-area:jadwal">
        <div class="judul-baris"><h2>Jadwal hari ini</h2><span class="kecil">${selesaiHariIni} dari ${kegHariIni.length} selesai</span></div>
        <div class="daftar-cek">${barisJadwal || '<p class="kosong">Belum ada kegiatan hari ini.</p>'}</div>
        ${kegHariIni.length ? `<div class="bar gelap"><i style="width:${persenKeg}%"></i></div>` : ''}
        <button class="tambah" data-aksi="tambahKeg" data-tgl="${h}">+ Tambah kegiatan</button>
      </section>

      <section class="kartu k-aktiv" style="grid-area:aktiv">
        <div class="judul-baris">
          <h2>Aktivitas terbaru</h2>
          <div class="alat">
            <label class="cari-kotak">${ikon('Cari')}
              <input type="search" data-cari-aktivitas placeholder="Cari transaksi" value="${esc(UI.cariAktivitas)}" aria-label="Cari transaksi"></label>
            <a class="btn pil-btn" href="#keuangan">${ikon('Filter')} Semua</a>
          </div>
        </div>
        <div class="tabel" role="table">
          <div class="tabel-kepala" role="row"><span>Keterangan</span><span>Kategori</span><span>Jumlah</span><span>Status</span><span>Tanggal</span></div>
          <div id="daftarAktivitas">${htmlAktivitas()}</div>
        </div>
      </section>

      <section class="kartu" style="grid-area:panas"><h2>Pola 5 minggu</h2>
        <p class="sub-kartu">Pengeluaran tiap hari, dalam ribu rupiah (jt = juta)</p>${petaPanas()}</section>

      <section class="kartu" style="grid-area:papan"><h2>Papan jadwal</h2>
        <p class="sub-kartu">Seret kartu ke kolom lain, atau pakai tombol di kartu, untuk mengganti status</p>
        <div class="papan-gulir">${papanKegiatan(kegMinggu)}</div></section>
    </div>`;
}
