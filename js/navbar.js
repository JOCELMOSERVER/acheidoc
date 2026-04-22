/* ===========================
   AcheiDoc — Navbar JS
   =========================== */

(function () {
  var user = (typeof Auth !== 'undefined') ? Auth.getUser() : null;

  // ── Estado da navbar: visitante vs logado ──
  var navLinksVisitante = document.getElementById('navLinksVisitante');
  var navLinksLogado = document.getElementById('navLinksLogado');
  var navBtnsVisitante = document.getElementById('navBtnsVisitante');
  var navBtnsLogado = document.getElementById('navBtnsLogado');
  var mobileLinksVisitante = document.getElementById('mobileLinksVisitante');
  var mobileLinksLogado = document.getElementById('mobileLinksLogado');
  var mobileBtnsVisitante = document.getElementById('mobileBtnsVisitante');
  var mobileBtnsLogado = document.getElementById('mobileBtnsLogado');

  if (user && user.role === 'utilizador') {
    // Mostrar links de logado
    if (navLinksVisitante) navLinksVisitante.classList.add('hidden');
    if (navLinksLogado) navLinksLogado.classList.remove('hidden');
    if (navBtnsVisitante) navBtnsVisitante.style.display = 'none';
    if (navBtnsLogado) navBtnsLogado.classList.remove('hidden');
    if (mobileLinksVisitante) mobileLinksVisitante.classList.add('hidden');
    if (mobileLinksLogado) mobileLinksLogado.classList.remove('hidden');
    if (mobileBtnsVisitante) mobileBtnsVisitante.style.display = 'none';
    if (mobileBtnsLogado) mobileBtnsLogado.classList.remove('hidden');

    // Preencher nome e pontos na navbar
    var primeiroNome = user.nome ? user.nome.split(' ')[0] : '';
    var pontos = user.pontos || 0;

    ['nomeNavbar', 'nomeNavbarMobile'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = primeiroNome;
    });
    ['pontosNavbar', 'pontosNavbarMobile'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = pontos;
    });

    // Dropdown do utilizador
    var userMenuBtn = document.getElementById('userMenuBtn');
    var userMenuDropdown = document.getElementById('userMenuDropdown');
    if (userMenuBtn && userMenuDropdown) {
      userMenuBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        userMenuBtn.classList.toggle('open');
        userMenuDropdown.classList.toggle('open');
      });
      document.addEventListener('click', function () {
        userMenuBtn.classList.remove('open');
        userMenuDropdown.classList.remove('open');
      });
    }

    // Botão sair
    ['btnSair', 'btnSairMobile'].forEach(function (id) {
      var btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          if (typeof Auth !== 'undefined') Auth.logout();
        });
      }
    });
  }

  // ── Dropdown Agente/Admin ──
  var loginBtn = document.getElementById('loginBtn');
  var loginDropdown = document.getElementById('loginDropdown');

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

  // ── Hambúrguer ──
  var toggle = document.getElementById('navbarToggle');
  var mobileMenu = document.getElementById('navbarMobile');

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      toggle.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
  }

  // ── Marcar link ativo ──
  var currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-links a, .navbar-mobile a').forEach(function (link) {
    var href = link.getAttribute('href') || '';
    var hrefPage = href.split('/').pop();
    if (hrefPage === currentPath && !href.startsWith('#')) {
      link.classList.add('active');
    }
  });
})();
