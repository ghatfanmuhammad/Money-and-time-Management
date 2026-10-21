'use strict';
/* Memuat file browser (config, utils, parser) ke server tanpa mengubahnya.
   File di js/ ditulis untuk browser, jadi dijalankan di ruang Node terpisah lewat vm.
   Dengan begitu aturan baca catatan hanya ada di satu tempat: js/parser.js. */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const akar = path.join(__dirname, '..', 'js');
const kode = ['config.js', 'utils.js', 'parser.js']
  .map((f) => fs.readFileSync(path.join(akar, f), 'utf8')).join('\n');

module.exports = vm.runInNewContext(
  kode + '\n({ bacaCatatan, uid, hariIni, rupiah, KATEGORI, TEMA })', {});
