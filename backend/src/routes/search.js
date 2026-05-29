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
 *
 * Note: SQLite's lower() and LIKE do not handle Unicode/Cyrillic case folding.
 * Numeric and exact-match filters are applied in SQL; the keyword filter (q)
 * and locale-sensitive text filters are applied in JavaScript.
 */
router.get('/', (req, res) => {
  try {
    const { q, destination, type, minPrice, maxPrice, maxDuration } = req.query;

    let sql = 'SELECT * FROM tours WHERE 1=1';
    const params = [];

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

    let tours = db.prepare(sql).all(...params).map(parseTour);

    // Apply text filters in JS to support Unicode/Cyrillic case-insensitive matching
    if (q) {
      const keyword = q.toLowerCase();
      tours = tours.filter(
        (t) =>
          t.title.toLowerCase().includes(keyword) ||
          t.destination.toLowerCase().includes(keyword) ||
          (t.description && t.description.toLowerCase().includes(keyword))
      );
    }
    if (destination) {
      const dest = destination.toLowerCase();
      tours = tours.filter((t) => t.destination.toLowerCase().includes(dest));
    }
    if (type) {
      const tp = type.toLowerCase();
      tours = tours.filter((t) => t.type.toLowerCase().includes(tp));
    }

    res.json({ results: tours, total: tours.length });
  } catch {
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;
