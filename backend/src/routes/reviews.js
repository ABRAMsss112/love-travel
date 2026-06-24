const express = require('express');
const db = require('../db/database');

const router = express.Router();

// GET /api/reviews (Отримати всі відгуки)
router.get('/', (_req, res) => {
  try {
    const reviews = db.prepare('SELECT * FROM reviews').all();
    res.json(reviews);
  } catch (err) {
    console.error('Failed to load reviews:', err);
    res.status(500).json({ error: 'Failed to load reviews' });
  }
});

// POST /api/reviews (Додати новий відгук)
router.post('/', (req, res) => {
  try {
    const { name, city, rating, text } = req.body;

    // Перевірка, чи всі поля заповнені
    if (!name || !city || !rating || !text) {
      return res.status(400).json({ error: 'Всі поля обов\'язкові' });
    }

    // Записуємо в базу
    const insert = db.prepare(`
      INSERT INTO reviews (text, name, city, image, rating)
      VALUES (@text, @name, @city, @image, @rating)
    `);

    // Картинку передаємо порожньою, фронтенд сам підставить avatar.png
    const result = insert.run({
      text,
      name,
      city,
      image: '', 
      rating: Number(rating)
    });

    res.status(201).json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    console.error('Failed to save review:', err);
    res.status(500).json({ error: 'Failed to save review' });
  }
});

module.exports = router;