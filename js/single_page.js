function updateCount(type, change) {
    const countElement = document.getElementById(`${type}_count`);

    let currentCount = parseInt(countElement.textContent);
    currentCount += change;

    if (currentCount < 0) currentCount = 0;
    countElement.textContent = currentCount;
}

const hamMenu = document.querySelector(".ham-menu");

const offScreenMenu = document.querySelector(".off-screen-menu");

hamMenu.addEventListener("click", () => {
    hamMenu.classList.toggle("active");
    offScreenMenu.classList.toggle("active");
});