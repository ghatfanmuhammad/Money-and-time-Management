'use strict';
/* Server Hidupku: menyajikan web, menyimpan data di SQLite, dan menjalankan bot Telegram.
   Jalankan dengan:  node server/server.js   (atau npm start)
   Hanya menerima koneksi dari komputer ini (127.0.0.1) karena API-nya belum memakai login. */

const fs = require('fs');
const path = require('path');
const http = require('http');
const db = require('./db');
const { mulaiBot } = require('./telegram');

// Membaca server/.env (format KUNCI=nilai per baris) tanpa pustaka tambahan
try {
  for (const baris of fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split(/\r?\n/)) {
    const m = baris.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m && !baris.trim().startsWith('#') && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
} catch (e) { /* tanpa .env: bot tidak dijalankan */ }

const PORT = Number(process.env.PORT) || 3000;
const AKAR = path.join(__dirname, '..');
const JENIS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8' };

const kirimJson = (res, kode, isi) => {
  res.writeHead(kode, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(isi));
};

function bacaBadan(req) {
  return new Promise((selesai, gagal) => {
    let isi = '';
    req.on('data', (b) => {
      isi += b;
      if (isi.length > 10e6) { gagal(new Error('terlalu besar')); req.destroy(); }
    });
    req.on('end', () => selesai(isi));
    req.on('error', gagal);
  });
}

async function api(req, res, url) {
  if (url.pathname === '/api/rev' && req.method === 'GET') return kirimJson(res, 200, { rev: db.baca().rev });
  if (url.pathname === '/api/data' && req.method === 'GET') return kirimJson(res, 200, db.baca());
  if (url.pathname === '/api/data' && req.method === 'PUT') {
    let badan;
    try { badan = JSON.parse(await bacaBadan(req)); } catch (e) { return kirimJson(res, 400, { galat: 'JSON tidak valid' }); }
    const data = badan.data;
    if (!data || !Array.isArray(data.transaksi) || !Array.isArray(data.kegiatan) || !Array.isArray(data.inbox)) {
      return kirimJson(res, 400, { galat: 'format data tidak dikenali' });
    }
    const rev = db.tulis(badan.rev, data);
    if (rev === null) return kirimJson(res, 409, db.baca()); // ada perubahan lain (misalnya dari bot)
    return kirimJson(res, 200, { rev });
  }
  kirimJson(res, 404, { galat: 'tidak ada' });
}

// Hanya index.html, css/, dan js/ yang boleh diakses. server/ (termasuk .env dan database) tertutup.
function statis(req, res, url) {
  let rel = decodeURIComponent(url.pathname);
  if (rel === '/') rel = '/index.html';
  const boleh = rel === '/index.html' || /^\/(css|js)\/[\w./-]+$/.test(rel);
  const berkas = path.join(AKAR, rel);
  if (!boleh || rel.includes('..') || !berkas.startsWith(AKAR + path.sep)) { res.writeHead(404); return res.end('Tidak ada'); }
  fs.readFile(berkas, (err, isi) => {
    if (err) { res.writeHead(404); return res.end('Tidak ada'); }
    res.writeHead(200, { 'Content-Type': JENIS[path.extname(berkas)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(isi);
  });
}

const server = http.createServer((req, res) => {
  // Tolak Host selain localhost, supaya situs lain tidak bisa memakai API lewat DNS rebinding
  if (!/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(req.headers.host || '')) { res.writeHead(403); return res.end(); }
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname.startsWith('/api/')) {
    api(req, res, url).catch((e) => { console.error(e); kirimJson(res, 500, { galat: 'server' }); });
  } else if (req.method === 'GET') {
    statis(req, res, url);
  } else {
    res.writeHead(405); res.end();
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Hidupku berjalan di http://localhost:${PORT}`);
  const token = process.env.TELEGRAM_TOKEN;
  if (!token) return console.log('Bot Telegram mati: isi TELEGRAM_TOKEN di server/.env (lihat README).');
  mulaiBot({ token, izinId: (process.env.TELEGRAM_ALLOWED_ID || '').trim() });
  console.log(process.env.TELEGRAM_ALLOWED_ID
    ? 'Bot Telegram aktif.'
    : 'Bot Telegram aktif tetapi belum ada TELEGRAM_ALLOWED_ID: kirim pesan apa saja ke bot untuk melihat ID kamu.');
});
