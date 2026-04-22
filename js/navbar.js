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

  // Login dropdown (agente/admin fallback, used when navUser is not present)
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

  // Mostrar utilizador logado na navbar
  if (typeof Auth !== 'undefined') {
    const user = Auth.getUser();
    const navLogin = document.getElementById('navLogin');
    const navUser = document.getElementById('navUser');

    if (user && user.role === 'utilizador') {
      if (navLogin) navLogin.style.display = 'none';
      if (navUser) {
        navUser.style.display = 'flex';
        navUser.innerHTML =
          '<div class="nav-user-info" onclick="toggleUserMenu()">' +
            '<span class="nav-user-avatar">👤</span>' +
            '<span class="nav-user-nome">' + user.nome.split(' ')[0] + '</span>' +
            '<span class="nav-user-pontos">⭐ ' + user.pontos + ' pts</span>' +
            '<span>▼</span>' +
          '</div>' +
          '<div class="nav-user-dropdown" id="userDropdown" style="display:none">' +
            '<a href="meus-achados.html">📋 Meus Achados</a>' +
            '<a href="recompensas.html">🏆 Recompensas</a>' +
            '<hr>' +
            '<a href="#" onclick="Auth.logout()" class="link-danger">🚪 Sair</a>' +
          '</div>';
      }
    }
  }
})();

function toggleUserMenu() {
  const dropdown = document.getElementById('userDropdown');
  if (dropdown) {
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  }
}
