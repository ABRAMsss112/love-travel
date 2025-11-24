const hamMenu = document.querySelector(".ham-menu");

const offScreenMenu = document.querySelector(".off-screen-menu");

hamMenu.addEventListener("click", () => {
    hamMenu.classList.toggle("active");
    offScreenMenu.classList.toggle("active");
});

document.addEventListener('DOMContentLoaded', function () {
    const emailInput = document.querySelector('.contact_form_input_email');
    const submitButton = document.querySelector('.contact button');
    const errorMessage = document.createElement('p');

    errorMessage.style.color = 'red';
    errorMessage.style.fontSize = '14px';
    errorMessage.style.marginTop = '-10px';
    errorMessage.style.display = 'none';
    emailInput.insertAdjacentElement('afterend', errorMessage);

    emailInput.addEventListener('input', function () {
        const emailValue = emailInput.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(emailValue)) {
            errorMessage.textContent = 'Please enter a valid email address.';
            errorMessage.style.display = 'block';
        } else {
            errorMessage.style.display = 'none';
        }
    });

    submitButton.addEventListener('click', function (event) {
        if (errorMessage.style.display === 'block') {
            event.preventDefault();
            alert('Fix the email field before submitting!');
        }
    });
});

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
