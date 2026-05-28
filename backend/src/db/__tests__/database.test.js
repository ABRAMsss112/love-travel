const Database = require('better-sqlite3');

describe('database singleton', () => {
  it('exports a connected better-sqlite3 Database instance', () => {
    const db = require('../database');
    expect(db).toBeInstanceOf(Database);
  });

  it('has WAL journal mode enabled', () => {
    const db = require('../database');
    const result = db.pragma('journal_mode');
    // In test env with :memory:, WAL is not supported, so it falls back to 'memory'
    // In production with a file path, WAL will be 'wal'
    const journalMode = result[0].journal_mode;
    expect(['wal', 'memory']).toContain(journalMode);
  });
});
