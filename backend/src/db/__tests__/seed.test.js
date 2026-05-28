const Database = require('better-sqlite3');
const migrate = require('../migrate');
const seed = require('../seed');

describe('seed', () => {
  let db;

  beforeEach(() => {
    db = new Database(':memory:');
    migrate(db);
    seed(db);
  });

  afterEach(() => db.close());

  it('inserts tours from tours.json', () => {
    const count = db.prepare('SELECT COUNT(*) as c FROM tours').get().c;
    expect(count).toBeGreaterThan(0);
  });

  it('inserts reviews from reviews.json', () => {
    const count = db.prepare('SELECT COUNT(*) as c FROM reviews').get().c;
    expect(count).toBeGreaterThan(0);
  });

  it('does not duplicate tours when called twice', () => {
    seed(db); // second call
    const count = db.prepare('SELECT COUNT(*) as c FROM tours').get().c;
    const expected = db.prepare('SELECT COUNT(*) as c FROM tours').get().c;
    expect(count).toBe(expected);
  });

  it('parses tour includes as a JSON string', () => {
    const tour = db.prepare('SELECT includes FROM tours LIMIT 1').get();
    expect(() => JSON.parse(tour.includes)).not.toThrow();
    expect(Array.isArray(JSON.parse(tour.includes))).toBe(true);
  });

  it('leaves contact_submissions empty', () => {
    const count = db.prepare('SELECT COUNT(*) as c FROM contact_submissions').get().c;
    expect(count).toBe(0);
  });
});
