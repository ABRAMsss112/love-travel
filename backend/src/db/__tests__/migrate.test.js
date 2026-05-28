const Database = require('better-sqlite3');
const migrate = require('../migrate');

describe('migrate', () => {
  let db;

  beforeEach(() => {
    db = new Database(':memory:');
    migrate(db);
  });

  afterEach(() => db.close());

  const tableExists = (db, name) =>
    !!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(name);

  it('creates the tours table', () => {
    expect(tableExists(db, 'tours')).toBe(true);
  });

  it('creates the reviews table', () => {
    expect(tableExists(db, 'reviews')).toBe(true);
  });

  it('creates the contact_submissions table', () => {
    expect(tableExists(db, 'contact_submissions')).toBe(true);
  });

  it('is idempotent — running twice does not throw', () => {
    expect(() => migrate(db)).not.toThrow();
  });
});
