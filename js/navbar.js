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

        function toggleUserMenu() {
          var dropdown = document.getElementById('userDropdown');
          if (dropdown) {
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
          }
        }

        // Build using DOM methods to avoid XSS
        var info = document.createElement('div');
        info.className = 'nav-user-info';
        info.addEventListener('click', toggleUserMenu);

        var avatar = document.createElement('span');
        avatar.className = 'nav-user-avatar';
        avatar.textContent = '👤';

        var nome = document.createElement('span');
        nome.className = 'nav-user-nome';
        nome.textContent = user.nome.split(' ')[0];

        var pontos = document.createElement('span');
        pontos.className = 'nav-user-pontos';
        pontos.textContent = '⭐ ' + user.pontos + ' pts';

        var arrow = document.createElement('span');
        arrow.textContent = '▼';

        info.appendChild(avatar);
        info.appendChild(nome);
        info.appendChild(pontos);
        info.appendChild(arrow);

        var dropdown = document.createElement('div');
        dropdown.className = 'nav-user-dropdown';
        dropdown.id = 'userDropdown';
        dropdown.style.display = 'none';

        var linkAchados = document.createElement('a');
        linkAchados.href = 'meus-achados.html';
        linkAchados.textContent = '📋 Meus Achados';

        var linkRecompensas = document.createElement('a');
        linkRecompensas.href = 'recompensas.html';
        linkRecompensas.textContent = '🏆 Recompensas';

        var hr = document.createElement('hr');

        var linkSair = document.createElement('a');
        linkSair.href = '#';
        linkSair.className = 'link-danger';
        linkSair.textContent = '🚪 Sair';
        linkSair.addEventListener('click', function (e) {
          e.preventDefault();
          Auth.logout();
        });

        dropdown.appendChild(linkAchados);
        dropdown.appendChild(linkRecompensas);
        dropdown.appendChild(hr);
        dropdown.appendChild(linkSair);

        navUser.appendChild(info);
        navUser.appendChild(dropdown);
      }
    }
  }
})();
