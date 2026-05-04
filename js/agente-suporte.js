/* ===========================
   Encontra já — Agente Suporte
   =========================== */

(function () {
  // Verificar login do agente
  if (!sessionStorage.getItem('agenteLogado')) {
    window.location.href = 'login.html';
    return;
  }

  // Logout
  var btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', function () {
      sessionStorage.removeItem('agenteLogado');
      if (typeof Api !== 'undefined' && Api.clearToken) Api.clearToken();
      window.location.href = 'login.html';
    });
  }

  // Toggle menu mobile
  var toggle = document.getElementById('navbarToggle');
  var mobileMenu = document.getElementById('navbarMobile');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      toggle.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
  }

  // Marcar link ativo
  var currentPath = window.location.pathname.split('/').pop() || 'suporte.html';
  document.querySelectorAll('.navbar-links a, .navbar-mobile a').forEach(function (link) {
    var href = link.getAttribute('href') || '';
    var hrefPage = href.split('/').pop();
    if (hrefPage === currentPath) {
      link.classList.add('active');
    }
  });
})();
