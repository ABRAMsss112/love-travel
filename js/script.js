document.addEventListener('DOMContentLoaded', () => {
  // ── Slider ───────────────────────────────────────────────
  const slides = document.querySelectorAll('.slide');
  const leftArrow = document.querySelector('.left-arrow');
  const rightArrow = document.querySelector('.right-arrow');

  if (slides.length && leftArrow && rightArrow) {
    let currentIndex = 0;

    const showSlide = (index) => {
      slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
    };

    const nextSlide = () => {
      currentIndex = (currentIndex + 1) % slides.length;
      showSlide(currentIndex);
    };

    const prevSlide = () => {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      showSlide(currentIndex);
    };

    rightArrow.addEventListener('click', nextSlide);
    leftArrow.addEventListener('click', prevSlide);
    setInterval(nextSlide, 5000);
  }

  // ── Burger menu ──────────────────────────────────────────
  const hamMenu = document.querySelector('.ham-menu');
  const offScreenMenu = document.querySelector('.off-screen-menu');

  if (hamMenu && offScreenMenu) {
    hamMenu.addEventListener('click', () => {
      hamMenu.classList.toggle('active');
      offScreenMenu.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (
        offScreenMenu.classList.contains('active') &&
        !offScreenMenu.contains(e.target) &&
        !hamMenu.contains(e.target)
      ) {
        hamMenu.classList.remove('active');
        offScreenMenu.classList.remove('active');
      }
    });
  }

  // ── Reviews ──────────────────────────────────────────────
  const reviewsEl = document.getElementById('reviews');
  if (reviewsEl) {
    fetch('/api/reviews')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => renderReviews(data))
      .catch(() => {
        // Fallback to local JSON if backend not running
        fetch('data/products.json')
          .then((r) => r.json())
          .then((d) => renderReviews(d.reviews))
          .catch(() => {
            reviewsEl.innerHTML = '<p>Не вдалося завантажити відгуки.</p>';
          });
      });
  }

  // ── Modal ────────────────────────────────────────────────
  const modalBtn = document.getElementById('modalBtn');
  const searchModal = document.getElementById('searchModal');
  const closeModalBtn = document.getElementById('closeModal');
  const tourSearchForm = document.getElementById('tourSearchForm');

  if (modalBtn && searchModal) {
    modalBtn.addEventListener('click', () => {
      searchModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    });

    closeModalBtn?.addEventListener('click', closeSearchModal);
    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) closeSearchModal();
    });
    tourSearchForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      closeSearchModal();
    });
  }

  function closeSearchModal() {
    searchModal.style.display = 'none';
    document.body.style.overflow = '';
  }
});

// ── Render reviews ───────────────────────────────────────
function renderReviews(reviews) {
  const container = document.getElementById('reviews');
  if (!container || !Array.isArray(reviews)) return;

  container.innerHTML = reviews
    .map(
      (r) => `
    <section class="travel_experience_card">
      <p>${r.text}</p>
      <section class="travel_experience_profile">
        <img src="${r.image}" alt="${r.name}">
        <div>
          <h2>${r.name}</h2>
          <h2 class="experience_town">${r.city}</h2>
        </div>
      </section>
    </section>`
    )
    .join('');
}

document.addEventListener('DOMContentLoaded', () => {
    loadReviews();
});

async function loadReviews() {
    const reviewsContainer = document.getElementById('reviews');
    if (!reviewsContainer) return;

    try {
        const res = await fetch('/api/reviews');
        if (!res.ok) throw new Error('Не вдалося завантажити відгуки');
        
        let reviews = await res.json();

        // ФІКС: Розвертаємо відгуки (нові зверху) і беремо рівно 3 штуки
        reviews = reviews.reverse().slice(0, 3);

        if (reviews.length === 0) {
            reviewsContainer.innerHTML = '<p style="text-align:center; width:100%;">Відгуків поки немає.</p>';
            return;
        }

        reviewsContainer.innerHTML = reviews.map(review => `
            <div class="review_card" style="background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); display: flex; flex-direction: column; gap: 15px; width: 100%; max-width: 350px;">
                <div class="stars" style="color: #FFC107; font-size: 20px; letter-spacing: 2px;">
                    ${'★'.repeat(Math.round(review.rating))}${'☆'.repeat(5 - Math.round(review.rating))}
                </div>
                <p style="font-style: italic; color: #6E6E6E; line-height: 1.6; flex-grow: 1;">"${review.text}"</p>
                <div class="reviewer_info" style="display: flex; align-items: center; gap: 15px; border-top: 1px solid #eee; padding-top: 15px;">
                    <img src="img/${review.image || 'avatar.png'}" alt="${review.name}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;">
                    <div>
                        <h4 style="margin: 0; font-family: 'Poppins', sans-serif; font-size: 16px; color: #333;">${review.name}</h4>
                        <p style="margin: 0; font-size: 13px; color: #888;">${review.city}</p>
                    </div>
                </div>
            </div>
        `).join('');

        reviewsContainer.style.display = 'flex';
        reviewsContainer.style.gap = '30px';
        reviewsContainer.style.flexWrap = 'wrap';
        reviewsContainer.style.justifyContent = 'center';

    } catch (err) {
        console.error(err);
    }
}