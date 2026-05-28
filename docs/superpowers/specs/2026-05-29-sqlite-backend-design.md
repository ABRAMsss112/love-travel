# SQLite Backend — Design Spec
**Date:** 2026-05-29  
**Project:** Tour Greece — travel agency website  
**Scope:** Replace JSON-file data layer with local SQLite database

---

## 1. Goal

Migrate the existing Express backend from reading flat JSON files to a proper local SQLite database using `better-sqlite3`. All existing API endpoints remain URL-compatible so the frontend requires zero changes.

---

## 2. Architecture

### File structure changes

```
backend/
├── src/
│   ├── db/
│   │   ├── database.js      ← singleton SQLite connection
│   │   ├── migrate.js       ← CREATE TABLE IF NOT EXISTS (idempotent)
│   │   └── seed.js          ← populate from JSON on first run (if tables empty)
│   ├── routes/
│   │   ├── tours.js         ← updated: reads from DB
│   │   ├── reviews.js       ← updated: reads from DB
│   │   ├── contact.js       ← updated: saves submissions to DB
│   │   └── search.js        ← updated: SQL query
│   └── server.js            ← minor: call migrate+seed before app.listen
├── data/
│   ├── tours.json           ← kept as seed source (not deleted)
│   └── reviews.json         ← kept as seed source (not deleted)
└── tour_greece.db           ← SQLite file, auto-created on first run
```

### Startup sequence

```
server.js starts
  → migrate.js   runs CREATE TABLE IF NOT EXISTS (safe to re-run)
  → seed.js      inserts data only if tables are empty
  → app.listen() server ready
```

---

## 3. Database Schema

### `tours`
```sql
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
  includes      TEXT   -- JSON array serialized as string, e.g. '["Переліт","Готель"]'
);
```

### `reviews`
```sql
CREATE TABLE IF NOT EXISTS reviews (
  id     INTEGER PRIMARY KEY,
  text   TEXT NOT NULL,
  name   TEXT NOT NULL,
  city   TEXT,
  image  TEXT,
  rating INTEGER
);
```

### `contact_submissions`
```sql
CREATE TABLE IF NOT EXISTS contact_submissions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT,
  message    TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
```

---

## 4. API Endpoints

All existing URLs preserved — no frontend changes needed.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/tours` | All tours. Optional filters: `?destination=` `?type=` |
| `GET` | `/api/tours/:id` | Single tour by ID |
| `GET` | `/api/reviews` | All reviews |
| `GET` | `/api/search?q=&destination=&type=` | Full-text search across tours |
| `POST` | `/api/contact` | Save contact form submission to DB |
| `GET` | `/api/contact/submissions` | List all contact submissions (dev use) |

---

## 5. Key Implementation Details

### `db/database.js` — singleton
```js
const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, '../../tour_greece.db'));
db.pragma('journal_mode = WAL'); // better concurrent reads
module.exports = db;
```

### `db/migrate.js` — idempotent schema
Runs `CREATE TABLE IF NOT EXISTS` for all three tables. Safe to call on every server start.

### `db/seed.js` — one-time data load
Checks `SELECT COUNT(*) FROM tours`. If 0, reads `data/tours.json` and inserts all records using a prepared statement in a transaction. Same for reviews. Contact submissions start empty.

### Route updates
- `tours.js` / `reviews.js`: replace `fs.readFileSync` + JSON parse with `db.prepare('SELECT ...').all()`
- `search.js`: replace array filter with SQL `WHERE title LIKE ? OR destination LIKE ?`
- `contact.js`: add `db.prepare('INSERT INTO contact_submissions ...').run(data)` after validation

---

## 6. Dependencies

Add to `backend/package.json`:
```json
"better-sqlite3": "^9.4.3"
```

No other new dependencies.

---

## 7. Error Handling

- **DB connection failure** → server exits on startup with clear error message
- **SELECT errors** → return `[]` (empty array), log error server-side
- **INSERT errors** → return `500` with `{ error: 'Failed to save' }`
- **Validation errors** → existing `express-validator` logic unchanged

---

## 8. Out of Scope

- Admin UI / dashboard
- Authentication / authorization
- Email sending (existing nodemailer logic stays as-is)
- Production deployment / cloud DB migration
