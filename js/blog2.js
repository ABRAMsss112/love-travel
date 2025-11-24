const hamMenu = document.querySelector(".ham-menu");

const offScreenMenu = document.querySelector(".off-screen-menu");

hamMenu.addEventListener("click", () => {
  hamMenu.classList.toggle("active");
  offScreenMenu.classList.toggle("active");
});

document.addEventListener("DOMContentLoaded", () => {
  fetch('data/blog2.json')
    .then(response => response.json())
    .then(data => renderUserReport(data.reports));
});

function renderUserReport(reports) {
  const reportSection = document.querySelector(".user_report");

  if (!reports || reports.length === 0) {
    reportSection.innerHTML = "<p>No reviews available.</p>";
    return;
  }

  reportSection.innerHTML = "";

  reports.forEach(report => {
    const reportHTML = `
      <p class="user_report_info">
        ${report.text}
      </p>
      <div class="user">
        <img src="${report.avatar}" alt="User avatar" width="50" height="50">
        <div class="user_info">
          <h2>${report.name}</h2>
          <p>${report.city}</p>
        </div>
      </div>
    `;

    reportSection.innerHTML += reportHTML;
  });
}
