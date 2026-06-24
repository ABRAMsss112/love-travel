document.addEventListener('DOMContentLoaded', () => {
    // Знаходимо нашу кнопку пошуку
    const headerSearchBtn = document.getElementById('headerSearchBtn');

    if (headerSearchBtn) {
        headerSearchBtn.addEventListener('click', () => {
            // Збираємо те, що ввів/обрав користувач
            const keyword = document.getElementById('headerKeyword').value.trim();
            const destination = document.getElementById('headerDestination').value;
            const type = document.getElementById('headerType').value;

            // Створюємо спеціальний об'єкт для формування посилання
            const params = new URLSearchParams();

            // Якщо поле не порожнє, додаємо його до параметрів
            if (keyword) params.append('q', keyword);
            if (destination) params.append('destination', destination);
            if (type) params.append('type', type);

            // Перевіряємо, чи є хоч якісь параметри
            if (params.toString()) {
                // Перекидаємо на архів ІЗ параметрами
                window.location.href = `archive.html?${params.toString()}`;
            } else {
                // Якщо нічого не вибрали, просто переходимо на архів (покаже всі тури)
                window.location.href = 'archive.html';
            }
        });
    }
});