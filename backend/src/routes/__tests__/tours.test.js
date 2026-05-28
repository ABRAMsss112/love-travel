// Mock the db singleton BEFORE requiring the router
jest.mock('../../db/database', () => {
  const Database = require('better-sqlite3');
  const migrate = require('../../db/migrate');
  const mockDb = new Database(':memory:');
  migrate(mockDb);
  mockDb.prepare(`
    INSERT INTO tours (id, title, destination, type, duration, price, originalPrice, rating, image, label, labelColor, location, description, includes)
    VALUES (1, 'Test Tour', 'Греція', 'Пляжний', 7, 1200, 1500, 4.8, 'img/test.png', 'Sale', '#fff', 'Афіни', 'Опис туру', '["Переліт","Готель"]')
  `).run();
  return mockDb;
});

const request = require('supertest');
const express = require('express');

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
