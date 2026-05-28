const path = require('path');
const fs = require('fs');

function seed(db) {
  const toursCount = db.prepare('SELECT COUNT(*) as c FROM tours').get().c;
  if (toursCount === 0) {
    const toursData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../data/tours.json'), 'utf-8')
    ).tours;

    const insertTour = db.prepare(`
      INSERT INTO tours
        (id, title, destination, type, duration, price, originalPrice,
         rating, image, label, labelColor, location, description, includes)
      VALUES
        (@id, @title, @destination, @type, @duration, @price, @originalPrice,
         @rating, @image, @label, @labelColor, @location, @description, @includes)
    `);

    const insertTours = db.transaction((tours) => {
      for (const tour of tours) {
        insertTour.run({
          ...tour,
          includes: JSON.stringify(tour.includes || []),
        });
      }
    });

    insertTours(toursData);
    console.log(`🌱 Seeded ${toursData.length} tours`);
  }

  const reviewsCount = db.prepare('SELECT COUNT(*) as c FROM reviews').get().c;
  if (reviewsCount === 0) {
    const reviewsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../data/reviews.json'), 'utf-8')
    ).reviews;

    const insertReview = db.prepare(`
      INSERT INTO reviews (id, text, name, city, image, rating)
      VALUES (@id, @text, @name, @city, @image, @rating)
    `);

    const insertReviews = db.transaction((reviews) => {
      for (const review of reviews) insertReview.run(review);
    });

    insertReviews(reviewsData);
    console.log(`🌱 Seeded ${reviewsData.length} reviews`);
  }
}

module.exports = seed;
