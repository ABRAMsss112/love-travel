const slider = document.getElementById("slider");
const sliderValue = document.getElementById("sliderValue");

slider.oninput = function() {
    sliderValue.textContent = `$${this.value}`;
}

const hamMenu = document.querySelector(".ham-menu");

const offScreenMenu = document.querySelector(".off-screen-menu");

hamMenu.addEventListener("click", () => {
    hamMenu.classList.toggle("active");
    offScreenMenu.classList.toggle("active");
});