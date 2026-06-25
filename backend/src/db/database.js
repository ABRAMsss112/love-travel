const Database = require('better-sqlite3');
const path = require('path');

// База створиться в системній папці сервера, де писати можна БЕЗКОШТОВНО
const dbPath = '/tmp/tour_greece.db';
const db = new Database(dbPath, { verbose: console.log });

console.log(`🗄️ SQLite базу підключено за безкоштовним шляхом: ${dbPath}`);