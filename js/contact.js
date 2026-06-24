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

  // ── Contact form → POST /api/contact ─────────────────────
  const contactForm = document.querySelector('.contact');
  const nameInput = document.querySelector('.contact_form_input_name');
  const emailInput = document.querySelector('.contact_form_input_email');
  const messageInput = document.querySelector('.contact_form_textarea');
  const submitBtn = contactForm?.querySelector('button');

  if (contactForm && submitBtn) {
    // Live email validation
    const emailError = document.createElement('p');
    emailError.style.cssText = 'color:red;font-size:13px;margin-top:-10px;display:none';
    emailInput?.insertAdjacentElement('afterend', emailError);

    emailInput?.addEventListener('input', () => {
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value);
      emailError.textContent = valid ? '' : 'Введіть правильний email';
      emailError.style.display = valid ? 'none' : 'block';
    });

    // Submit
    submitBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      const name = nameInput?.value.trim();
      const email = emailInput?.value.trim();
      const message = messageInput?.value.trim();

      if (!name || !email || !message) {
        showNotification("Будь ласка, заповніть усі поля", 'error');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showNotification('Введіть правильний email', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Надсилаємо...';

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, message }),
        });
        const data = await res.json();

        if (res.ok) {
          showNotification(data.message, 'success');
          nameInput.value = '';
          emailInput.value = '';
          messageInput.value = '';
        } else {
          const msgs = data.errors?.map((e) => e.msg).join(', ') || 'Помилка відправки';
          showNotification(msgs, 'error');
        }
      } catch {
        showNotification('Помилка з\'єднання з сервером', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Надіслати';
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
    searchModal.style.display = 'none';
    document.body.style.overflow = '';
  }
});

// ── Notification helper ───────────────────────────────────
function showNotification(text, type = 'success') {
  const existing = document.getElementById('toast-notification');
  existing?.remove();

  const toast = document.createElement('div');
  toast.id = 'toast-notification';
  toast.textContent = text;
  toast.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    padding: 16px 24px;
    border-radius: 8px;
    color: white;
    font-size: 15px;
    font-weight: 500;
    z-index: 99999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    background: ${type === 'success' ? '#1BBC9B' : '#F76570'};
    animation: slideIn 0.3s ease;
  `;

  const style = document.createElement('style');
  style.textContent = '@keyframes slideIn{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}';
  document.head.appendChild(style);

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}
