'use strict';
/* Penyimpanan di SQLite (modul bawaan Node, tidak perlu memasang apa pun).
   Seluruh data aplikasi (objek S di web) disimpan sebagai satu dokumen JSON.
   Kolom `rev` naik setiap kali dokumen berubah. Web dan bot memakainya untuk
   mendeteksi perubahan dari pihak lain, supaya tidak saling menimpa. */

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const folder = path.join(__dirname, 'data');
fs.mkdirSync(folder, { recursive: true });

const db = new DatabaseSync(path.join(folder, 'hidupku.db'));
db.exec(`CREATE TABLE IF NOT EXISTS dokumen (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  rev INTEGER NOT NULL,
  isi TEXT NOT NULL
)`);

const qBaca = db.prepare('SELECT rev, isi FROM dokumen WHERE id = 1');
const qTulis = db.prepare(`INSERT INTO dokumen (id, rev, isi) VALUES (1, ?, ?)
  ON CONFLICT(id) DO UPDATE SET rev = excluded.rev, isi = excluded.isi`);

// {rev, data}. Kalau belum ada dokumen: {rev: 0, data: null}
function baca() {
  const r = qBaca.get();
  return r ? { rev: r.rev, data: JSON.parse(r.isi) } : { rev: 0, data: null };
}

// Menulis hanya kalau pemanggil memegang rev terbaru. Mengembalikan rev baru, atau null kalau basi.
function tulis(revLama, data) {
  const sekarang = baca();
  if (sekarang.rev !== revLama) return null;
  qTulis.run(sekarang.rev + 1, JSON.stringify(data));
  return sekarang.rev + 1;
}

module.exports = { baca, tulis };
