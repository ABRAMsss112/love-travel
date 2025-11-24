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