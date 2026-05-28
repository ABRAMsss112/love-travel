// Mock the db singleton BEFORE requiring the router
jest.mock('../../db/database', () => {
  const Database = require('better-sqlite3');
  const migrate = require('../../db/migrate');
  const mockDb = new Database(':memory:');
  migrate(mockDb);
  return mockDb;
});

const request = require('supertest');
const express = require('express');

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

    // Verify it was saved to the database
    const db = require('../../db/database');
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
