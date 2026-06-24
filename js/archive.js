document.addEventListener('DOMContentLoaded', () => {
  // ── Burger menu ──────────────────────────────────────────
  const hamMenu = document.querySelector('.ham-menu');
  const offScreenMenu = document.querySelector('.off-screen-menu');

  if (hamMenu && offScreenMenu) {
    hamMenu.addEventListener('click', () => {
      hamMenu.classList.toggle('active');
      offScreenMenu.classList.toggle('active');
    });
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

  // ── Search modal ─────────────────────────────────────────
  const modalBtn = document.getElementById('modalBtn');
  const searchModal = document.getElementById('searchModal');
  const closeModalBtn = document.getElementById('closeModal');
  const tourSearchForm = document.getElementById('tourSearchForm');

  if (modalBtn && searchModal) {
    modalBtn.addEventListener('click', () => {
      searchModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    });
    closeModalBtn?.addEventListener('click', closeSearch);
    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) closeSearch();
    });
    tourSearchForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      closeSearch();
    });
  }

  function closeSearch() {
    if (searchModal) {
      searchModal.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  // ── Завантаження турів ──────────────────────────────────
  loadTours();
});

async function loadTours() {
  const urlParams = new URLSearchParams(window.location.search);
  // Шукаємо наш новий контейнер по ID
  const container = document.getElementById('toursContainer');
  if (!container) return;

  const apiParams = new URLSearchParams();
  if (urlParams.get('q')) apiParams.set('q', urlParams.get('q'));
  if (urlParams.get('destination')) apiParams.set('destination', urlParams.get('destination'));
  if (urlParams.get('type')) apiParams.set('type', urlParams.get('type'));
  if (urlParams.get('maxDuration')) apiParams.set('maxDuration', urlParams.get('maxDuration'));

  const hasFilters = apiParams.toString().length > 0;
  // Якщо є фільтри - смикаємо пошук, якщо немає - беремо всі тури
  const url = hasFilters ? `/api/search?${apiParams.toString()}` : '/api/tours';

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const tours = hasFilters ? data.results : data;

    if (!tours || tours.length === 0) {
      container.innerHTML = '<p style="text-align:center;padding:40px;color:#6E6E6E;width:100%;">Турів не знайдено. Спробуйте змінити параметри пошуку.</p>';
      return;
    }

    // ВАЖЛИВО: Тепер ми ЗАВЖДИ генеруємо і вставляємо HTML-картки з бази!
    container.innerHTML = tours.map(renderTourCard).join('');
    
  } catch (err) {
    console.warn('Помилка завантаження:', err.message);
    container.innerHTML = '<p style="text-align:center;padding:40px;color:red;width:100%;">Помилка сервера. Перевірте, чи запущено бекенд.</p>';
  }
}

function renderTourCard(tour) {
  const label = tour.label
    ? `<span class="sale_label" style="background:${tour.labelColor || '#1BBC9B'}">${tour.label}</span>`
    : '';

  const originalPrice = (tour.originalPrice || tour.old_price)
    ? `<p class="crossed_out_txt">$${tour.originalPrice || tour.old_price}</p>`
    : '';

  return `
    <section class="card_item">
      ${label}
      <img src="img/${tour.image_name || tour.image || 'default.jpg'}" alt="${tour.title}" style="width:100%;height:250px;object-fit:cover;" loading="lazy">
      <section class="card_item_info">
        <div class="card_time_destination">
          <div class="duration">
            <img src="img/clock_time_destination.png" alt="duration" class="clock">
            <p>${tour.duration} днів</p>
          </div>
          <div class="icons">
            <img src="img/gray_star.png" alt="rating" class="clock" style="height:16px;">
            <p style="font-weight:400;font-size:14px;color:#6E6E6E;">${tour.rating || '5.0'}</p>
          </div>
        </div>
        <div class="card_title">
          <h2>${tour.title}</h2>
          <div class="location_info">
            <img src="img/gray_location.png" alt="location">
            <p style="font-weight:400;font-size:14px;color:#6E6E6E;">${tour.destination || tour.location}</p>
          </div>
          <div class="line" style="height:1px;background:#F1F1F1;margin:10px 0;"></div>
          <p style="font-weight:400;font-size:14px;color:#6E6E6E;">${tour.description || tour.short_desc || 'Відкрийте для себе незабутні враження!'}</p>
          <div class="line" style="height:1px;background:#F1F1F1;margin:10px 0;"></div>
          <div class="card_footer_main">
            <!-- Кнопка тепер веде на правильний ID -->
            <button class="card_details_btn" onclick="window.location.href='single_tour.html?id=${tour.id}'">
              Детальніше
            </button>
            <div class="card_price">
              ${originalPrice}
              <h2>$${tour.price}</h2>
              <p class="price_from" style="font-size:12px;">/ особу</p>
            </div>
          </div>
        </div>
      </section>
    </section>`;
}