function migrate(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tours (
      id            INTEGER PRIMARY KEY,
      title         TEXT NOT NULL,
      destination   TEXT NOT NULL,
      type          TEXT NOT NULL,
      duration      INTEGER NOT NULL,
      price         REAL NOT NULL,
      originalPrice REAL,
      rating        REAL,
      image         TEXT,
      label         TEXT,
      labelColor    TEXT,
      location      TEXT,
      description   TEXT,
      includes      TEXT
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id     INTEGER PRIMARY KEY,
      text   TEXT NOT NULL,
      name   TEXT NOT NULL,
      city   TEXT,
      image  TEXT,
      rating INTEGER
    );

    CREATE TABLE IF NOT EXISTS contact_submissions (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      email      TEXT NOT NULL,
      phone      TEXT,
      message    TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

module.exports = migrate;
