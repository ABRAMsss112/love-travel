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
