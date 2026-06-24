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
const bookingsRouter = require('./routes/bookings');

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
app.use('/api/bookings', bookingsRouter);

// ── Health check ──────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 handler ───────────────────────────────────────────
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ── SPA fallback (serve index.html for non-API routes) ───
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../../index.html'));
});

// ── Start ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Tour Greece server running at http://localhost:${PORT}`);
});
