// Mock the db singleton BEFORE requiring the router
jest.mock('../../db/database', () => {
  const Database = require('better-sqlite3');
  const migrate = require('../../db/migrate');
  const mockDb = new Database(':memory:');
  migrate(mockDb);
  mockDb.prepare(`
    INSERT INTO reviews (id, text, name, city, image, rating)
    VALUES (1, 'Чудовий тур!', 'Ольга', 'Київ', 'img/avatar.png', 5)
  `).run();
  return mockDb;
});

const request = require('supertest');
const express = require('express');

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
