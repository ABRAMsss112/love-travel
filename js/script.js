document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    const leftArrow = document.querySelector('.left-arrow');
    const rightArrow = document.querySelector('.right-arrow');
    let currentIndex = 0;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % slides.length;
        showSlide(currentIndex);
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        showSlide(currentIndex);
    }

    rightArrow.addEventListener('click', nextSlide);
    leftArrow.addEventListener('click', prevSlide);

    setInterval(nextSlide, 5000);
});

const hamMenu = document.querySelector(".ham-menu");

const offScreenMenu = document.querySelector(".off-screen-menu");

hamMenu.addEventListener("click", () => {
    hamMenu.classList.toggle("active");
    offScreenMenu.classList.toggle("active");
});

document.addEventListener('DOMContentLoaded', () => {
    fetch('data/products.json') 
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => renderReviews(data.reviews))
      .catch(error => {
        console.error('Error loading reviews:', error);
        document.getElementById('reviews').innerHTML = '<p>Failed to load reviews.</p>';
      });
  });
  
  function renderReviews(reviews) {
    const reviewsContainer = document.getElementById('reviews');
    reviewsContainer.innerHTML = ''; 
  
    reviews.forEach(review => {
      const reviewCard = `
        <section class="travel_experience_card">
          <p>${review.text}</p>
          <section class="travel_experience_profile">
            <img src="${review.image}" alt="profile">
            <div>
              <h2>${review.name}</h2>
              <h2 class="experience_town">${review.city}</h2>
            </div>
          </section>
        </section>
      `;
      reviewsContainer.innerHTML += reviewCard;
    });
  }

  const modalBtn = document.getElementById("modalBtn");
const searchModal = document.getElementById("searchModal");
const closeModal = document.getElementById("closeModal");
const tourSearchForm = document.getElementById("tourSearchForm");

// Відкрити модалку
modalBtn.addEventListener("click", () => {
  searchModal.style.display = "flex";
  document.body.style.overflow = "hidden"; // блокуємо скрол
});

// Закрити модалку кнопкою Х
closeModal.addEventListener("click", () => {
  searchModal.style.display = "none";
  document.body.style.overflow = "";
});

// Закрити по miss click
searchModal.addEventListener("click", (e) => {
  if (e.target === searchModal) {
    searchModal.style.display = "none";
    document.body.style.overflow = "";
  }
});

// Кнопка "Шукати" — просто закриває модалку
tourSearchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  searchModal.style.display = "none";
  document.body.style.overflow = "";
});
  