'use strict';
/* Bot Telegram dengan long polling: server yang bertanya ke Telegram "ada pesan baru?",
   jadi tidak perlu alamat publik, HTTPS, atau webhook. Cukup komputer yang tersambung internet. */

const db = require('./db');
const { terapkanCatatan, ringkasSaldo, ringkasHari } = require('./catat');

const BANTUAN = `Kirim catatan seperti di web:
geprek 15000
kopi 12rb
+500000 uang saku
kemarin bakso 20000
saldo 250000

Perintah: /saldo, /hari`;

function mulaiBot({ token, izinId, log = console.log }) {
  const panggil = async (metode, badan) => {
    const r = await fetch(`https://api.telegram.org/bot${token}/${metode}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(badan),
    });
    const j = await r.json();
    if (!j.ok) throw new Error(j.description || 'Telegram menolak permintaan');
    return j.result;
  };
  const balas = (chatId, teks) => panggil('sendMessage', { chat_id: chatId, text: teks });

  // Mengubah data lewat db: baca dokumen terbaru, ubah, tulis kembali dengan rev yang sama.
  function ubahData(fungsi) {
    const { rev, data } = db.baca();
    if (!data) return { balasan: 'Data belum siap. Buka web Hidupku sekali dulu, lalu coba lagi.' };
    const hasil = fungsi(data);
    if (hasil.berubah && db.tulis(rev, data) === null) return { balasan: 'Server sedang sibuk, kirim ulang.' };
    return hasil;
  }

  async function tangani(update) {
    const pesan = update.message;
    if (!pesan || !pesan.chat) return;
    const chatId = String(pesan.chat.id);

    if (!izinId) {
      await balas(chatId, `ID Telegram kamu: ${chatId}\nIsi TELEGRAM_ALLOWED_ID=${chatId} di server/.env lalu jalankan ulang server.`);
      return;
    }
    if (chatId !== izinId) return; // orang lain diabaikan

    const teks = (pesan.text || '').trim();
    if (!teks) { await balas(chatId, 'Kirim teks, contoh: geprek 15000'); return; }

    const perintah = teks.startsWith('/') ? teks.split(/[\s@]/)[0].toLowerCase() : null;
    let balasan;
    if (perintah === '/start' || perintah === '/bantuan') balasan = BANTUAN;
    else if (perintah === '/saldo') balasan = ubahData((S) => ({ balasan: ringkasSaldo(S), berubah: false })).balasan;
    else if (perintah === '/hari') balasan = ubahData((S) => ({ balasan: ringkasHari(S), berubah: false })).balasan;
    else if (perintah) balasan = 'Perintah tidak dikenal. Ketik /bantuan';
    else balasan = ubahData((S) => terapkanCatatan(S, teks)).balasan;

    await balas(chatId, balasan);
  }

  async function putar() {
    let offset = 0;
    for (;;) {
      try {
        const daftar = await panggil('getUpdates', { offset, timeout: 30, allowed_updates: ['message'] });
        for (const u of daftar) {
          offset = u.update_id + 1;
          try { await tangani(u); } catch (e) { log('Bot: gagal memproses pesan: ' + e.message); }
        }
      } catch (e) {
        log('Bot: gagal mengambil pesan, coba lagi 5 detik: ' + e.message);
        await new Promise((r) => setTimeout(r, 5000));
      }
    }
  }

  putar();
}

module.exports = { mulaiBot };
