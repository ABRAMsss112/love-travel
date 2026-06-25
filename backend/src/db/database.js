const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// База створюється в тимчасовій папці сервера Render (це безкоштовно)
const dbPath = '/tmp/tour_greece.db';
const db = new Database(dbPath, { verbose: console.log });

console.log(`🗄️ SQLite базу підключено за безкоштовним шляхом: ${dbPath}`);

// Створюємо таблиці, якщо їх немає
db.exec(`
  CREATE TABLE IF NOT EXISTS tours (
    id TEXT PRIMARY KEY,
    title TEXT,
    location TEXT,
    duration INTEGER,
    price REAL,
    oldPrice REAL,
    image TEXT,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    name TEXT,
    text TEXT,
    rating INTEGER,
    avatar TEXT
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    tourId TEXT,
    clientName TEXT,
    clientPhone TEXT,
    date TEXT,
    createdAt TEXT
  );
`);

// Автоматично наповнюємо базу турами з JSON, якщо вона порожня
try {
  const toursCount = db.prepare('SELECT COUNT(*) as count FROM tours').get().count;
  
  if (toursCount === 0) {
    console.log('🌱 База порожня. Запускаємо автоматичний сідінг турів...');
    
    // Шлях до твого файлу tours.json всередині папки backend
    const jsonPath = path.join(__dirname, '../data/tours.json'); 
    
    if (fs.existsSync(jsonPath)) {
      const toursData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      
      const insertTours = db.transaction((tours) => {
        const stmt = db.prepare(`
          INSERT INTO tours (id, title, location, duration, price, oldPrice, image, description)
          VALUES (@id, @title, @location, @duration, @price, @oldPrice, @image, @description)
        `);
        for (const tour of tours) {
          stmt.run(tour);
        }
      });
      
      insertTours(toursData);
      console.log('✅ Сідінг турів успішно завершено!');
    } else {
      console.log('⚠️ Файл tours.json не знайдено за шляхом: ' + jsonPath);
    }
  }
} catch (err) {
  console.error('❌ Помилка під час ініціалізації/сідінгу бази:', err);
}

// Експортуємо ОБ'ЄКТ БАЗИ, щоб методи .prepare() працювали в роутах
module.exports = db;