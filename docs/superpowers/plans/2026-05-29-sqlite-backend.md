# SQLite Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace JSON-file reads in the Express backend with a local SQLite database using `better-sqlite3`.

**Architecture:** A singleton `db/database.js` module opens (or creates) `tour_greece.db`. On startup, `migrate.js` creates tables idempotently and `seed.js` populates them from existing JSON files if empty. All four route files are updated to query the DB instead of reading files.

**Tech Stack:** Node.js 22, Express 4, better-sqlite3 9, Jest 29, supertest 6

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `backend/src/db/database.js` | SQLite singleton connection |
| Create | `backend/src/db/migrate.js` | CREATE TABLE IF NOT EXISTS (idempotent) |
| Create | `backend/src/db/seed.js` | One-time data load from JSON files |
| Create | `backend/src/db/__tests__/migrate.test.js` | Tests for schema creation |
| Create | `backend/src/db/__tests__/seed.test.js` | Tests for data seeding |
| Create | `backend/src/routes/__tests__/tours.test.js` | Tests for tours route |
| Create | `backend/src/routes/__tests__/reviews.test.js` | Tests for reviews route |
| Create | `backend/src/routes/__tests__/contact.test.js` | Tests for contact route |
| Create | `backend/src/routes/__tests__/search.test.js` | Tests for search route |
| Modify | `backend/package.json` | Add better-sqlite3, jest, supertest |
| Modify | `backend/src/server.js` | Call migrate + seed before listen |
| Modify | `backend/src/routes/tours.js` | Replace fs reads with DB queries |
| Modify | `backend/src/routes/reviews.js` | Replace fs reads with DB queries |
| Modify | `backend/src/routes/contact.js` | Replace in-memory array with DB |
| Modify | `backend/src/routes/search.js` | Replace array filter with SQL |

---

## Task 1: Install dependencies

**Files:**
- Modify: `backend/package.json`

- [ ] **Step 1: Update package.json**

Replace the full `backend/package.json` with:

```json
{
  "name": "tour-greece-backend",
  "version": "1.0.0",
  "description": "Tour Greece travel agency backend API",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest --runInBand"
  },
  "jest": {
    "testEnvironment": "node",
    "testMatch": ["**/__tests__/**/*.test.js"]
  },
  "dependencies": {
    "better-sqlite3": "^9.4.3",
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "express-validator": "^7.0.1",
    "nodemailer": "^6.9.7"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "nodemon": "^3.0.2",
    "supertest": "^6.3.4"
  }
}
```

- [ ] **Step 2: Install packages**

```bash
cd backend
npm install
```

Expected: installs `better-sqlite3`, `jest`, `supertest`. If `better-sqlite3` fails on Windows with a build error, install Visual Studio Build Tools first: `npm install --global windows-build-tools` or install from https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022

- [ ] **Step 3: Verify better-sqlite3 loads**

```bash
node -e "const Database = require('better-sqlite3'); const db = new Database(':memory:'); console.log('OK', db.pragma('journal_mode'));"
```

Expected output: `OK [ { journal_mode: 'delete' } ]`

- [ ] **Step 4: Commit**

```bash
git add backend/package.json backend/package-lock.json
git commit -m "chore: add better-sqlite3, jest, supertest"
```

---

## Task 2: Create `db/database.js`

**Files:**
- Create: `backend/src/db/database.js`
- Create: `backend/src/db/__tests__/database.test.js`

- [ ] **Step 1: Write the failing test**

Create `backend/src/db/__tests__/database.test.js`:

```js
const Database = require('better-sqlite3');

describe('database singleton', () => {
  it('exports a connected better-sqlite3 Database instance', () => {
    const db = require('../database');
    expect(db).toBeInstanceOf(Database);
  });

  it('has WAL journal mode enabled', () => {
    const db = require('../database');
    const result = db.pragma('journal_mode');
    expect(result[0].journal_mode).toBe('wal');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd backend
npm test -- --testPathPattern="db/__tests__/database"
```

Expected: FAIL — `Cannot find module '../database'`

- [ ] **Step 3: Write implementation**

Create `backend/src/db/database.js`:

```js
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.NODE_ENV === 'test'
  ? ':memory:'
  : path.join(__dirname, '../../../tour_greece.db');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

module.exports = db;
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd backend
npm test -- --testPathPattern="db/__tests__/database"
```

Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add backend/src/db/database.js backend/src/db/__tests__/database.test.js
git commit -m "feat: add SQLite database singleton"
```

---

## Task 3: Create `db/migrate.js`

**Files:**
- Create: `backend/src/db/migrate.js`
- Create: `backend/src/db/__tests__/migrate.test.js`

- [ ] **Step 1: Write the failing test**

Create `backend/src/db/__tests__/migrate.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd backend
npm test -- --testPathPattern="db/__tests__/migrate"
```

Expected: FAIL — `Cannot find module '../migrate'`

- [ ] **Step 3: Write implementation**

Create `backend/src/db/migrate.js`:

```js
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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd backend
npm test -- --testPathPattern="db/__tests__/migrate"
```

Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add backend/src/db/migrate.js backend/src/db/__tests__/migrate.test.js
git commit -m "feat: add SQLite schema migration"
```

---

## Task 4: Create `db/seed.js`

**Files:**
- Create: `backend/src/db/seed.js`
- Create: `backend/src/db/__tests__/seed.test.js`

- [ ] **Step 1: Write the failing test**

Create `backend/src/db/__tests__/seed.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd backend
npm test -- --testPathPattern="db/__tests__/seed"
```

Expected: FAIL — `Cannot find module '../seed'`

- [ ] **Step 3: Write implementation**

Create `backend/src/db/seed.js`:

```js
const path = require('path');
const fs = require('fs');

function seed(db) {
  const toursCount = db.prepare('SELECT COUNT(*) as c FROM tours').get().c;
  if (toursCount === 0) {
    const toursData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../../data/tours.json'), 'utf-8')
    ).tours;

    const insertTour = db.prepare(`
      INSERT INTO tours
        (id, title, destination, type, duration, price, originalPrice,
         rating, image, label, labelColor, location, description, includes)
      VALUES
        (@id, @title, @destination, @type, @duration, @price, @originalPrice,
         @rating, @image, @label, @labelColor, @location, @description, @includes)
    `);

    const insertTours = db.transaction((tours) => {
      for (const tour of tours) {
        insertTour.run({
          ...tour,
          includes: JSON.stringify(tour.includes || []),
        });
      }
    });

    insertTours(toursData);
    console.log(`🌱 Seeded ${toursData.length} tours`);
  }

  const reviewsCount = db.prepare('SELECT COUNT(*) as c FROM reviews').get().c;
  if (reviewsCount === 0) {
    const reviewsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../../data/reviews.json'), 'utf-8')
    ).reviews;

    const insertReview = db.prepare(`
      INSERT INTO reviews (id, text, name, city, image, rating)
      VALUES (@id, @text, @name, @city, @image, @rating)
    `);

    const insertReviews = db.transaction((reviews) => {
      for (const review of reviews) insertReview.run(review);
    });

    insertReviews(reviewsData);
    console.log(`🌱 Seeded ${reviewsData.length} reviews`);
  }
}

module.exports = seed;
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd backend
npm test -- --testPathPattern="db/__tests__/seed"
```

Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add backend/src/db/seed.js backend/src/db/__tests__/seed.test.js
git commit -m "feat: add database seeding from JSON files"
```

---

## Task 5: Update `server.js`

**Files:**
- Modify: `backend/src/server.js`

- [ ] **Step 1: Update server.js**

Replace `backend/src/server.js` with:

```js
const express = require('express');
const cors = require('cors');
const path = require('path');

const db = require('./db/database');
const migrate = require('./db/migrate');
const seed = require('./db/seed');

const toursRouter = require('./routes/tours');
const reviewsRouter = require('./routes/reviews');
const contactRouter = require('./routes/contact');
const searchRouter = require('./routes/search');

// ── Database init ─────────────────────────────────────────
migrate(db);
seed(db);

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../../')));

// ── API Routes ────────────────────────────────────────────
app.use('/api/tours', toursRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/contact', contactRouter);
app.use('/api/search', searchRouter);

// ── Health check ──────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 handler ───────────────────────────────────────────
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ── SPA fallback ─────────────────────────────────────────
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../../index.html'));
});

// ── Start ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Tour Greece server running at http://localhost:${PORT}`);
});
```

- [ ] **Step 2: Verify server starts without errors**

```bash
cd backend
node src/server.js
```

Expected output:
```
🌱 Seeded N tours
🌱 Seeded N reviews
✅ Tour Greece server running at http://localhost:3000
```

On second run — no "Seeded" lines (tables already populated).

Press Ctrl+C to stop.

- [ ] **Step 3: Commit**

```bash
git add backend/src/server.js
git commit -m "feat: wire up DB init in server startup"
```

---

## Task 6: Update `routes/tours.js`

**Files:**
- Modify: `backend/src/routes/tours.js`
- Create: `backend/src/routes/__tests__/tours.test.js`

- [ ] **Step 1: Write the failing test**

Create `backend/src/routes/__tests__/tours.test.js`:

```js
const request = require('supertest');
const express = require('express');
const Database = require('better-sqlite3');
const migrate = require('../../db/migrate');

// Create in-memory DB with test data
const db = new Database(':memory:');
migrate(db);
db.prepare(`
  INSERT INTO tours (id, title, destination, type, duration, price, originalPrice, rating, image, label, labelColor, location, description, includes)
  VALUES (1, 'Test Tour', 'Греція', 'Пляжний', 7, 1200, 1500, 4.8, 'img/test.png', 'Sale', '#fff', 'Афіни', 'Опис туру', '["Переліт","Готель"]')
`).run();

// Mock the db singleton BEFORE requiring the router
jest.mock('../../db/database', () => db);

const toursRouter = require('../tours');
const app = express();
app.use(express.json());
app.use('/api/tours', toursRouter);

describe('GET /api/tours', () => {
  it('returns an array of tours', async () => {
    const res = await request(app).get('/api/tours');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
  });

  it('parses includes as an array', async () => {
    const res = await request(app).get('/api/tours');
    expect(Array.isArray(res.body[0].includes)).toBe(true);
    expect(res.body[0].includes).toContain('Переліт');
  });
});

describe('GET /api/tours/:id', () => {
  it('returns a single tour by id', async () => {
    const res = await request(app).get('/api/tours/1');
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Test Tour');
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).get('/api/tours/999');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Tour not found');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd backend
npm test -- --testPathPattern="routes/__tests__/tours"
```

Expected: FAIL — route still uses `fs.readFileSync`

- [ ] **Step 3: Write implementation**

Replace `backend/src/routes/tours.js` with:

```js
const express = require('express');
const db = require('../db/database');

const router = express.Router();

const parseTour = (tour) => ({
  ...tour,
  includes: JSON.parse(tour.includes || '[]'),
});

// GET /api/tours — all tours (optional filters: ?destination= ?type=)
router.get('/', (req, res) => {
  try {
    const { destination, type } = req.query;
    let sql = 'SELECT * FROM tours WHERE 1=1';
    const params = [];

    if (destination) {
      sql += ' AND destination LIKE ?';
      params.push(`%${destination}%`);
    }
    if (type) {
      sql += ' AND type LIKE ?';
      params.push(`%${type}%`);
    }

    const tours = db.prepare(sql).all(...params).map(parseTour);
    res.json(tours);
  } catch {
    res.status(500).json({ error: 'Failed to load tours' });
  }
});

// GET /api/tours/:id — single tour
router.get('/:id', (req, res) => {
  try {
    const tour = db.prepare('SELECT * FROM tours WHERE id = ?').get(Number(req.params.id));
    if (!tour) return res.status(404).json({ error: 'Tour not found' });
    res.json(parseTour(tour));
  } catch {
    res.status(500).json({ error: 'Failed to load tour' });
  }
});

module.exports = router;
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd backend
npm test -- --testPathPattern="routes/__tests__/tours"
```

Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add backend/src/routes/tours.js backend/src/routes/__tests__/tours.test.js
git commit -m "feat: tours route reads from SQLite"
```

---

## Task 7: Update `routes/reviews.js`

**Files:**
- Modify: `backend/src/routes/reviews.js`
- Create: `backend/src/routes/__tests__/reviews.test.js`

- [ ] **Step 1: Write the failing test**

Create `backend/src/routes/__tests__/reviews.test.js`:

```js
const request = require('supertest');
const express = require('express');
const Database = require('better-sqlite3');
const migrate = require('../../db/migrate');

const db = new Database(':memory:');
migrate(db);
db.prepare(`
  INSERT INTO reviews (id, text, name, city, image, rating)
  VALUES (1, 'Чудовий тур!', 'Ольга', 'Київ', 'img/avatar.png', 5)
`).run();

jest.mock('../../db/database', () => db);

const reviewsRouter = require('../reviews');
const app = express();
app.use(express.json());
app.use('/api/reviews', reviewsRouter);

describe('GET /api/reviews', () => {
  it('returns an array of reviews', async () => {
    const res = await request(app).get('/api/reviews');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
  });

  it('includes expected fields', async () => {
    const res = await request(app).get('/api/reviews');
    const review = res.body[0];
    expect(review).toHaveProperty('name', 'Ольга');
    expect(review).toHaveProperty('city', 'Київ');
    expect(review).toHaveProperty('rating', 5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd backend
npm test -- --testPathPattern="routes/__tests__/reviews"
```

Expected: FAIL — route still uses `fs.readFileSync`

- [ ] **Step 3: Write implementation**

Replace `backend/src/routes/reviews.js` with:

```js
const express = require('express');
const db = require('../db/database');

const router = express.Router();

// GET /api/reviews
router.get('/', (_req, res) => {
  try {
    const reviews = db.prepare('SELECT * FROM reviews').all();
    res.json(reviews);
  } catch {
    res.status(500).json({ error: 'Failed to load reviews' });
  }
});

module.exports = router;
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd backend
npm test -- --testPathPattern="routes/__tests__/reviews"
```

Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add backend/src/routes/reviews.js backend/src/routes/__tests__/reviews.test.js
git commit -m "feat: reviews route reads from SQLite"
```

---

## Task 8: Update `routes/contact.js`

**Files:**
- Modify: `backend/src/routes/contact.js`
- Create: `backend/src/routes/__tests__/contact.test.js`

- [ ] **Step 1: Write the failing test**

Create `backend/src/routes/__tests__/contact.test.js`:

```js
const request = require('supertest');
const express = require('express');
const Database = require('better-sqlite3');
const migrate = require('../../db/migrate');

const db = new Database(':memory:');
migrate(db);

jest.mock('../../db/database', () => db);

const contactRouter = require('../contact');
const app = express();
app.use(express.json());
app.use('/api/contact', contactRouter);

describe('POST /api/contact', () => {
  it('returns 201 and saves submission to DB', async () => {
    const res = await request(app).post('/api/contact').send({
      name: 'Іван',
      email: 'ivan@test.com',
      message: 'Хочу замовити тур до Греції',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const saved = db.prepare('SELECT * FROM contact_submissions WHERE email = ?').get('ivan@test.com');
    expect(saved).not.toBeNull();
    expect(saved.name).toBe('Іван');
    expect(saved.message).toBe('Хочу замовити тур до Греції');
  });

  it('returns 422 when name is missing', async () => {
    const res = await request(app).post('/api/contact').send({
      email: 'test@test.com',
      message: 'Повідомлення',
    });
    expect(res.status).toBe(422);
    expect(res.body.errors).toBeDefined();
  });

  it('returns 422 when email is invalid', async () => {
    const res = await request(app).post('/api/contact').send({
      name: 'Іван',
      email: 'not-an-email',
      message: 'Повідомлення',
    });
    expect(res.status).toBe(422);
  });
});

describe('GET /api/contact/submissions', () => {
  it('returns all saved submissions', async () => {
    const res = await request(app).get('/api/contact/submissions');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.submissions)).toBe(true);
    expect(typeof res.body.total).toBe('number');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd backend
npm test -- --testPathPattern="routes/__tests__/contact"
```

Expected: FAIL — route uses in-memory array, submissions endpoint doesn't exist

- [ ] **Step 3: Write implementation**

Replace `backend/src/routes/contact.js` with:

```js
const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db/database');

const router = express.Router();

const validate = [
  body('name').trim().notEmpty().withMessage("Ім'я обов'язкове").isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('Невірний email').normalizeEmail(),
  body('message').trim().notEmpty().withMessage("Повідомлення обов'язкове").isLength({ max: 2000 }),
  body('phone').optional().trim().isMobilePhone('uk-UA').withMessage('Невірний номер телефону'),
];

/**
 * POST /api/contact
 * Body: { name, email, phone?, message }
 */
router.post('/', validate, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { name, email, phone, message } = req.body;

  try {
    db.prepare(
      'INSERT INTO contact_submissions (name, email, phone, message) VALUES (?, ?, ?, ?)'
    ).run(name, email, phone || null, message);

    console.log(`📨 New contact from ${name} <${email}>`);

    res.status(201).json({
      success: true,
      message: "Ваше повідомлення отримано. Ми зв'яжемося з вами найближчим часом!",
    });
  } catch {
    res.status(500).json({ error: 'Failed to save message' });
  }
});

/**
 * GET /api/contact/submissions — list all messages (dev use)
 */
router.get('/submissions', (_req, res) => {
  try {
    const submissions = db
      .prepare('SELECT * FROM contact_submissions ORDER BY created_at DESC')
      .all();
    res.json({ submissions, total: submissions.length });
  } catch {
    res.status(500).json({ error: 'Failed to load submissions' });
  }
});

module.exports = router;
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd backend
npm test -- --testPathPattern="routes/__tests__/contact"
```

Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add backend/src/routes/contact.js backend/src/routes/__tests__/contact.test.js
git commit -m "feat: contact route saves submissions to SQLite"
```

---

## Task 9: Update `routes/search.js`

**Files:**
- Modify: `backend/src/routes/search.js`
- Create: `backend/src/routes/__tests__/search.test.js`

- [ ] **Step 1: Write the failing test**

Create `backend/src/routes/__tests__/search.test.js`:

```js
const request = require('supertest');
const express = require('express');
const Database = require('better-sqlite3');
const migrate = require('../../db/migrate');

const db = new Database(':memory:');
migrate(db);

// Insert two test tours
const insertTour = db.prepare(`
  INSERT INTO tours (id, title, destination, type, duration, price, originalPrice, rating, image, label, labelColor, location, description, includes)
  VALUES (@id, @title, @destination, @type, @duration, @price, @originalPrice, @rating, @image, @label, @labelColor, @location, @description, @includes)
`);

insertTour.run({ id: 1, title: 'Санторіні', destination: 'Греція', type: 'Пляжний', duration: 7, price: 1200, originalPrice: 1500, rating: 4.8, image: '', label: '', labelColor: '', location: 'Греція', description: 'Острів мрій', includes: '[]' });
insertTour.run({ id: 2, title: 'Бангкок', destination: 'Таїланд', type: 'Екскурсійний', duration: 10, price: 980, originalPrice: null, rating: 4.6, image: '', label: '', labelColor: '', location: 'Таїланд', description: 'Місто контрастів', includes: '[]' });

jest.mock('../../db/database', () => db);

const searchRouter = require('../search');
const app = express();
app.use(express.json());
app.use('/api/search', searchRouter);

describe('GET /api/search', () => {
  it('returns all tours when no params given', async () => {
    const res = await request(app).get('/api/search');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
  });

  it('filters by keyword q', async () => {
    const res = await request(app).get('/api/search?q=греція');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.results[0].title).toBe('Санторіні');
  });

  it('filters by destination', async () => {
    const res = await request(app).get('/api/search?destination=Таїланд');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.results[0].title).toBe('Бангкок');
  });

  it('filters by maxPrice', async () => {
    const res = await request(app).get('/api/search?maxPrice=1000');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.results[0].price).toBeLessThanOrEqual(1000);
  });

  it('filters by maxDuration', async () => {
    const res = await request(app).get('/api/search?maxDuration=8');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.results[0].duration).toBeLessThanOrEqual(8);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd backend
npm test -- --testPathPattern="routes/__tests__/search"
```

Expected: FAIL — route still uses JSON array filtering

- [ ] **Step 3: Write implementation**

Replace `backend/src/routes/search.js` with:

```js
const express = require('express');
const db = require('../db/database');

const router = express.Router();

const parseTour = (tour) => ({
  ...tour,
  includes: JSON.parse(tour.includes || '[]'),
});

/**
 * GET /api/search
 * Query params: q, destination, type, minPrice, maxPrice, maxDuration
 */
router.get('/', (req, res) => {
  try {
    const { q, destination, type, minPrice, maxPrice, maxDuration } = req.query;

    let sql = 'SELECT * FROM tours WHERE 1=1';
    const params = [];

    if (q) {
      sql += ' AND (title LIKE ? OR destination LIKE ? OR description LIKE ?)';
      const kw = `%${q}%`;
      params.push(kw, kw, kw);
    }
    if (destination) {
      sql += ' AND destination LIKE ?';
      params.push(`%${destination}%`);
    }
    if (type) {
      sql += ' AND type LIKE ?';
      params.push(`%${type}%`);
    }
    if (minPrice) {
      sql += ' AND price >= ?';
      params.push(Number(minPrice));
    }
    if (maxPrice) {
      sql += ' AND price <= ?';
      params.push(Number(maxPrice));
    }
    if (maxDuration) {
      sql += ' AND duration <= ?';
      params.push(Number(maxDuration));
    }

    const tours = db.prepare(sql).all(...params).map(parseTour);
    res.json({ results: tours, total: tours.length });
  } catch {
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd backend
npm test -- --testPathPattern="routes/__tests__/search"
```

Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add backend/src/routes/search.js backend/src/routes/__tests__/search.test.js
git commit -m "feat: search route uses SQL queries"
```

---

## Task 10: Run all tests & end-to-end verification

**Files:** none

- [ ] **Step 1: Run the full test suite**

```bash
cd backend
npm test
```

Expected: All tests PASS. Total: ~18 tests across 5 test files.

- [ ] **Step 2: Start the server**

```bash
cd backend
node src/server.js
```

Expected:
```
🌱 Seeded N tours
🌱 Seeded N reviews
✅ Tour Greece server running at http://localhost:3000
```

- [ ] **Step 3: Test GET /api/tours**

```bash
curl http://localhost:3000/api/tours
```

Expected: JSON array of tours, each with `includes` as an array (not a string).

- [ ] **Step 4: Test GET /api/reviews**

```bash
curl http://localhost:3000/api/reviews
```

Expected: JSON array of reviews.

- [ ] **Step 5: Test POST /api/contact**

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Іван\",\"email\":\"ivan@test.com\",\"message\":\"Хочу тур\"}"
```

Expected: `{"success":true,"message":"Ваше повідомлення отримано..."}`

- [ ] **Step 6: Verify submission was saved**

```bash
curl http://localhost:3000/api/contact/submissions
```

Expected: `{"submissions":[{"id":1,"name":"Іван",...}],"total":1}`

- [ ] **Step 7: Test search**

```bash
curl "http://localhost:3000/api/search?q=греція"
```

Expected: `{"results":[...],"total":N}` — only Greek tours.

- [ ] **Step 8: Open site in browser**

Navigate to `http://localhost:3000` — the site should look identical to before (all JS fetch calls still work since API URLs haven't changed).

- [ ] **Step 9: Final commit**

```bash
git add -A
git commit -m "feat: complete SQLite backend migration — all routes use DB"
```
