document.addEventListener('DOMContentLoaded', () => {
    // ── 1. Твоє Бургер-меню ───────────────────────────────────────
    const hamMenu = document.querySelector(".ham-menu");
    const offScreenMenu = document.querySelector(".off-screen-menu");

    if (hamMenu && offScreenMenu) {
        hamMenu.addEventListener("click", () => {
            hamMenu.classList.toggle("active");
            offScreenMenu.classList.toggle("active");
        });
    }

    // ── 2. Завантаження даних туру з API ──────────────────────────
    loadSingleTour();
});

// Глобальна змінна для базової ціни (щоб калькулятор міг її брати)
let baseTourPrice = 0; 

async function loadSingleTour() {
    // Витягуємо ID туру з URL (наприклад, ?id=5)
    const urlParams = new URLSearchParams(window.location.search);
    const tourId = urlParams.get('id');

    if (!tourId) {
        console.warn('ID туру не знайдено в URL. Завантажується статична сторінка.');
        return; 
    }

    try {
        // Робимо запит до твого бекенду (tours.js)
        const res = await fetch(`/api/tours/${tourId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const tour = await res.json();

        // Підставляємо дані туру в HTML
        // (Переконайся, що в single_tour.html у тебе є ці id)
        
        const titleEl = document.getElementById('tourTitle');
        if (titleEl) titleEl.textContent = tour.title;

        const locationEl = document.getElementById('tourLocation');
        if (locationEl) locationEl.textContent = tour.destination || tour.location;

        const durationEl = document.getElementById('tourDuration');
        if (durationEl) durationEl.textContent = `${tour.duration} днів`;

        const descEl = document.getElementById('tourDescription');
        if (descEl) descEl.textContent = tour.description || tour.short_desc;

        // Оновлюємо ціни
        baseTourPrice = tour.price;
        
        const priceBig = document.querySelector('.price-big');
        if (priceBig) priceBig.textContent = `$ ${tour.price}`;

        const priceOld = document.getElementById('priceOld');
        if (priceOld && (tour.originalPrice || tour.old_price)) {
            priceOld.textContent = `$ ${tour.originalPrice || tour.old_price}`;
        }

        // Оновлюємо картинку в Hero-секції (якщо потрібно)
        const heroSlide = document.querySelector('.hero-slide');
        if (heroSlide && tour.image) {
            heroSlide.style.backgroundImage = `url('img/${tour.image_name || tour.image}')`;
        }

        // Запускаємо перерахунок калькулятора з новою ціною
        updateTotal();

    } catch (err) {
        console.error('Помилка завантаження туру:', err);
    }
}

// ── 3. Твій лічильник (прокачаний) ──────────────────────────────
function updateCount(type, change) {
    const countElement = document.getElementById(`${type}_count`);
    if (!countElement) return;

    let currentCount = parseInt(countElement.textContent);
    currentCount += change;

    // Дорослі не можуть бути менше 1, діти - менше 0
    if (type === 'adults' && currentCount < 1) currentCount = 1;
    if (type === 'children' && currentCount < 0) currentCount = 0;
    
    countElement.textContent = currentCount;

    // Викликаємо перерахунок фінальної суми при кожному кліку
    updateTotal();
}

// Функція для перерахунку загальної суми бронювання
function updateTotal() {
    const adultsCount = parseInt(document.getElementById('adults_count')?.textContent || 1);
    const childrenCount = parseInt(document.getElementById('children_count')?.textContent || 0);
    
    // Припустимо, дитячий квиток коштує 50% від дорослого (можеш змінити логіку)
    const childPrice = baseTourPrice * 0.5; 

    // Додаткові послуги (страховки)
    const healthIns = document.getElementById('healthIns')?.checked ? 220 : 0;
    const medIns = document.getElementById('medIns')?.checked ? 45 : 0;
    const extrasTotal = healthIns + medIns;

    const adultTotal = adultsCount * baseTourPrice;
    const childTotal = childrenCount * childPrice;
    const sum = adultTotal + childTotal + extrasTotal;

    // Виводимо суми в DOM
    if (document.getElementById('totalAdults')) document.getElementById('totalAdults').textContent = `$ ${adultTotal}`;
    if (document.getElementById('totalChildren')) document.getElementById('totalChildren').textContent = `$ ${childTotal}`;
    if (document.getElementById('totalExtras')) document.getElementById('totalExtras').textContent = `$ ${extrasTotal}`;
    if (document.getElementById('totalSum')) document.getElementById('totalSum').textContent = `$ ${sum}`;
    if (document.getElementById('bookBtnPrice')) document.getElementById('bookBtnPrice').textContent = sum;
}

// Вішаємо подію на чекбокси страховок, щоб вони теж міняли ціну
document.getElementById('healthIns')?.addEventListener('change', updateTotal);
document.getElementById('medIns')?.addEventListener('change', updateTotal);