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

document.addEventListener("DOMContentLoaded", () => {
    fetch('data/prices.json')
    .then(response => response.json())
    .then(data => renderTravelOffer(data.offers));
});

function renderTravelOffer(offers) {
    const travelOfferSection = document.querySelector(".travel_offer");

    if (!offers || offers.length === 0) {
        travelOfferSection.innerHTML = "<p>No offers available at the moment.</p>";
        return;
    }

    travelOfferSection.innerHTML = "";

    offers.forEach(offer => {
        const offerHTML = `
            <img src="${offer.image}" alt="Travel Offer Image" width="690" height="650">
            <section class="travel_info">
                <div class="sale">
                <p>${offer.sale_label}</p>
            </div>
            <h1>
                ${offer.title.replace(
                offer.highlighted_text,
                `<span class="text_white"><span class="text_green">${offer.highlighted_text}</span></span>`
            )}
            </h1>
            <div class="travel_price_label">
                <h2 class="travel_price crossed_out_txt">$ ${offer.original_price}</h2>
                <h2 class="travel_price">$ ${offer.discounted_price}</h2>
            </div>
            <p>${offer.description}</p>
            <div class="travel_icons">
                ${offer.icons
                .map(
                    icon =>
                    `<img src="${icon.icon}" alt="Icon"><p>${icon.text}</p>`
                )
                .join("")}
            </div>
            <section class="user">
            <img src="${offer.user.avatar}" alt="User Avatar" width="100" height="100">
            <div class="user_info">
                <h2>${offer.user.name}</h2>
                <p>${offer.user.position}</p>
            </div>
        </section>
    </section>
    `;

        travelOfferSection.innerHTML += offerHTML;
    });
}
