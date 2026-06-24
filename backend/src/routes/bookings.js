const express = require('express');
const db = require('../db/database');

const router = express.Router();

// Створюємо таблицю bookings, якщо її ще не існує
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tour TEXT NOT NULL,
      date TEXT NOT NULL,
      price TEXT NOT NULL,
      client_name TEXT NOT NULL,
      client_phone TEXT NOT NULL,
      client_email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
} catch (err) {
  console.error('Помилка створення таблиці bookings:', err);
}

// POST /api/bookings (Зберегти нове замовлення від клієнта)
router.post('/', (req, res) => {
  try {
    const { tour, date, price, client_name, client_phone, client_email } = req.body;

    // Перевіряємо, чи є обов'язкові дані
    if (!tour || !date || !client_name || !client_phone) {
      return res.status(400).json({ error: 'Заповніть всі обов\'язкові поля' });
    }

    // Записуємо в базу
    const insert = db.prepare(`
      INSERT INTO bookings (tour, date, price, client_name, client_phone, client_email)
      VALUES (@tour, @date, @price, @client_name, @client_phone, @client_email)
    `);

    const result = insert.run({
      tour, 
      date, 
      price, 
      client_name, 
      client_phone, 
      client_email: client_email || '' // якщо email порожній, записуємо порожній рядок
    });

    res.status(201).json({ success: true, booking_id: result.lastInsertRowid });
  } catch (err) {
    console.error('Помилка збереження бронювання:', err);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// GET /api/bookings (Для тебе, щоб ти міг бачити всі замовлення)
router.get('/', (_req, res) => {
  try {
    // Дістаємо всі замовлення, найновіші будуть зверху
    const bookings = db.prepare('SELECT * FROM bookings ORDER BY created_at DESC').all();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

module.exports = router;