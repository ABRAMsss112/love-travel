const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.NODE_ENV === 'test'
  ? ':memory:'
  : path.join(__dirname, '../../../tour_greece.db');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

module.exports = db;
