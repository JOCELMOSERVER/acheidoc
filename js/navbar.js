/* ===========================
   AcheiDoc — Navbar JS
   =========================== */

(function () {
  // Hamburger toggle
  const toggle = document.getElementById('navbarToggle');
  const mobileMenu = document.getElementById('navbarMobile');
  const loginBtn = document.getElementById('loginBtn');
  const loginDropdown = document.getElementById('loginDropdown');

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      toggle.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
  }

  // Login dropdown
  if (loginBtn && loginDropdown) {
    loginBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      loginBtn.classList.toggle('open');
      loginDropdown.classList.toggle('open');
    });

    document.addEventListener('click', function () {
      loginBtn.classList.remove('open');
      loginDropdown.classList.remove('open');
    });
  }

  // Marcar link ativo
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-links a, .navbar-mobile a').forEach(function (link) {
    const href = link.getAttribute('href') || '';
    const hrefPage = href.split('/').pop();
    if (hrefPage === currentPath) {
      link.classList.add('active');
    }
  });
})();
