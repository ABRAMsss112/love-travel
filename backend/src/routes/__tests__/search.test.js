// Mock the db singleton BEFORE requiring the router
jest.mock('../../db/database', () => {
  const Database = require('better-sqlite3');
  const migrate = require('../../db/migrate');
  const db = new Database(':memory:');
  migrate(db);

  const insertTour = db.prepare(`
    INSERT INTO tours (id, title, destination, type, duration, price, originalPrice, rating, image, label, labelColor, location, description, includes)
    VALUES (@id, @title, @destination, @type, @duration, @price, @originalPrice, @rating, @image, @label, @labelColor, @location, @description, @includes)
  `);

  insertTour.run({ id: 1, title: 'Санторіні', destination: 'Греція', type: 'Пляжний', duration: 7, price: 1200, originalPrice: 1500, rating: 4.8, image: '', label: '', labelColor: '', location: 'Греція', description: 'Острів мрій', includes: '[]' });
  insertTour.run({ id: 2, title: 'Бангкок', destination: 'Таїланд', type: 'Екскурсійний', duration: 10, price: 980, originalPrice: null, rating: 4.6, image: '', label: '', labelColor: '', location: 'Таїланд', description: 'Місто контрастів', includes: '[]' });

  return db;
});

const request = require('supertest');
const express = require('express');

const searchRouter = require('../search');
const app = express();
app.use(express.json());
app.use('/api/search', searchRouter);

describe('GET /api/search', () => {
  it('returns all tours when no params given', async () => {
    const res = await request(app).get('/api/search');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
  });

  it('filters by keyword q', async () => {
    const res = await request(app).get('/api/search?q=' + encodeURIComponent('греція'));
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.results[0].title).toBe('Санторіні');
  });

  it('filters by destination', async () => {
    const res = await request(app).get('/api/search?destination=' + encodeURIComponent('Таїланд'));
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.results[0].title).toBe('Бангкок');
  });

  it('filters by maxPrice', async () => {
    const res = await request(app).get('/api/search?maxPrice=1000');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.results[0].price).toBeLessThanOrEqual(1000);
  });

  it('filters by maxDuration', async () => {
    const res = await request(app).get('/api/search?maxDuration=8');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.results[0].duration).toBeLessThanOrEqual(8);
  });
});
