const express = require('express');
const db = require('../db/database');

const router = express.Router();

// GET /api/reviews
router.get('/', (_req, res) => {
  try {
    const reviews = db.prepare('SELECT * FROM reviews').all();
    res.json(reviews);
  } catch (err) {
    console.error('Failed to load reviews:', err);
    res.status(500).json({ error: 'Failed to load reviews' });
  }
});

module.exports = router;
