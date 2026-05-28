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
  } catch (err) {
    console.error('Failed to save contact submission:', err);
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
  } catch (err) {
    console.error('Failed to load submissions:', err);
    res.status(500).json({ error: 'Failed to load submissions' });
  }
});

module.exports = router;
