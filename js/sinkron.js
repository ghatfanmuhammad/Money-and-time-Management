'use strict';
/* Sinkronisasi dengan server (server/server.js).
   Kalau web dibuka lewat http://localhost:3000, data utama ada di server supaya bot Telegram
   bisa menulis ke data yang sama. Kalau dibuka langsung dari file (file://) atau server mati,
   aplikasi tetap jalan dengan localStorage seperti biasa.

   Aturannya: setiap simpan() mengirim seluruh S ke server bersama nomor versi (rev).
   Kalau versi di server sudah lebih baru (misalnya bot baru mencatat sesuatu), server menolak
   dan web memakai data terbaru dari server. */

const SERVER = { aktif: false, rev: 0, jalan: false, antre: false };

// Dipanggil sekali saat aplikasi dimulai. Mengembalikan true kalau tersambung ke server.
async function hubungkanServer() {
  if (location.protocol !== 'http:' && location.protocol !== 'https:') return false;
  try {
    const r = await fetch('/api/data', { cache: 'no-store' });
    if (!r.ok) return false;
    const { rev, data } = await r.json();
    SERVER.aktif = true;
    SERVER.rev = rev;
    if (data) S = siapkan(data);
    else await kirimKeServer(); // server masih kosong: unggah data yang ada di browser ini
    setInterval(periksaPerubahan, 4000);
    return true;
  } catch (e) { return false; }
}

async function kirimKeServer() {
  if (!SERVER.aktif) return;
  if (SERVER.jalan) { SERVER.antre = true; return; } // sedang mengirim: kirim lagi setelah selesai
  SERVER.jalan = true;
  try {
    do {
      SERVER.antre = false;
      const r = await fetch('/api/data', { method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rev: SERVER.rev, data: S }) });
      const j = await r.json();
      if (r.status === 409) { // ada perubahan lain (bot): pakai data server
        SERVER.rev = j.rev; S = siapkan(j.data); SERVER.antre = false;
        render(); toast('Data diperbarui dari server. Ulangi perubahan terakhir kalau belum terlihat.');
      } else if (r.ok) SERVER.rev = j.rev;
      else throw new Error('server');
    } while (SERVER.antre);
  } catch (e) { toast('Server tidak terjangkau. Perubahan hanya tersimpan di browser ini.'); }
  finally { SERVER.jalan = false; }
}

// Menarik perubahan dari bot tanpa mengganggu yang sedang diketik atau dibuka
async function periksaPerubahan() {
  if (SERVER.jalan || document.hidden) return;
  const el = document.activeElement;
  if ((el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) || (typeof DLG !== 'undefined' && DLG.open)) return;
  try {
    const { rev } = await (await fetch('/api/rev', { cache: 'no-store' })).json();
    if (rev === SERVER.rev) return;
    const d = await (await fetch('/api/data', { cache: 'no-store' })).json();
    if (SERVER.jalan || !d.data) return;
    SERVER.rev = d.rev; S = siapkan(d.data); render();
  } catch (e) { /* server mati sebentar: coba lagi nanti */ }
}
