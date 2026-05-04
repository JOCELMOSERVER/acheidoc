/* ===========================
   Encontra já — Navbar JS
   =========================== */

(function () {
  // Hamburger toggle
  const toggle = document.getElementById('navbarToggle');
  const mobileMenu = document.getElementById('navbarMobile');
  const loginBtn = document.getElementById('loginBtn');
  const loginDropdown = document.getElementById('loginDropdown');

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.toggle('open');
      toggle.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  // Pesquisa mobile
  const mobileSearchBtn = document.getElementById('mobileSearchBtn');
  const mobileSearchInput = document.getElementById('mobileSearchInput');
  if (mobileSearchBtn && mobileSearchInput) {
    mobileSearchBtn.addEventListener('click', function () {
      const q = mobileSearchInput.value.trim();
      if (q) {
        window.location.href = 'buscar.html?q=' + encodeURIComponent(q);
      }
    });
    mobileSearchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        mobileSearchBtn.click();
      }
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
    const mobileNavLogin = document.getElementById('mobileNavLogin');
    const mobileNavUser = document.getElementById('mobileNavUser');

    if (user && user.role === 'utilizador') {
      // Mostrar links protegidos (desktop)
      var linkBuscar = document.getElementById('linkBuscar');
      var linkPublicar = document.getElementById('linkPublicar');
      var linkRecompensas = document.getElementById('linkRecompensas');
      if (linkBuscar) linkBuscar.style.display = '';
      if (linkPublicar) linkPublicar.style.display = '';
      if (linkRecompensas) linkRecompensas.style.display = '';

      // Mostrar links protegidos (mobile)
      var mobileLinkBuscar = document.getElementById('mobileLinkBuscar');
      var mobileLinkPublicar = document.getElementById('mobileLinkPublicar');
      var mobileLinkRecompensas = document.getElementById('mobileLinkRecompensas');
      if (mobileLinkBuscar) mobileLinkBuscar.style.display = '';
      if (mobileLinkPublicar) mobileLinkPublicar.style.display = '';
      if (mobileLinkRecompensas) mobileLinkRecompensas.style.display = '';

      // Desktop
      if (navLogin) navLogin.style.display = 'none';
      // Mobile
      if (mobileNavLogin) mobileNavLogin.style.display = 'none';

      // Construir menu mobile do utilizador
      if (mobileNavUser) {
        mobileNavUser.style.display = 'block';
        var mUserLabel = document.createElement('div');
        mUserLabel.style.cssText = 'padding:8px 14px;font-weight:600;color:var(--text-dark);font-size:0.95rem;';
        mUserLabel.textContent = user.nome.split(' ')[0] + '  ' + user.pontos + ' pts';
        var mLinkPerfil = document.createElement('a');
        mLinkPerfil.href = 'perfil.html';
        mLinkPerfil.textContent = 'O Meu Perfil';
        var mLinkAchados = document.createElement('a');
        mLinkAchados.href = 'meus-achados.html';
        mLinkAchados.textContent = 'Meus achados';
        var mLinkRecomp = document.createElement('a');
        mLinkRecomp.href = 'recompensas.html';
        mLinkRecomp.textContent = 'Recompensas';
        var mLinkSair = document.createElement('a');
        mLinkSair.href = '#';
        mLinkSair.textContent = 'Sair';
        mLinkSair.addEventListener('click', function (e) { e.preventDefault(); Auth.logout(); });
        mobileNavUser.appendChild(mUserLabel);
        mobileNavUser.appendChild(mLinkPerfil);
        mobileNavUser.appendChild(mLinkAchados);
        mobileNavUser.appendChild(mLinkRecomp);
        mobileNavUser.appendChild(mLinkSair);
      }

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
        avatar.textContent = user.nome.trim().charAt(0).toUpperCase();

        var nome = document.createElement('span');
        nome.className = 'nav-user-nome';
        nome.textContent = user.nome.split(' ')[0];

        var pontos = document.createElement('span');
        pontos.className = 'nav-user-pontos';
        pontos.textContent = user.pontos + ' pts';

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

        var linkPerfil = document.createElement('a');
        linkPerfil.href = 'perfil.html';
        linkPerfil.textContent = 'O Meu Perfil';

        var linkAchados = document.createElement('a');
        linkAchados.href = 'meus-achados.html';
        linkAchados.textContent = 'Meus achados';

        var linkRecompensas = document.createElement('a');
        linkRecompensas.href = 'recompensas.html';
        linkRecompensas.textContent = 'Recompensas';

        var hr = document.createElement('hr');

        var linkSair = document.createElement('a');
        linkSair.href = '#';
        linkSair.className = 'link-danger';
        linkSair.textContent = 'Sair';
        linkSair.addEventListener('click', function (e) {
          e.preventDefault();
          Auth.logout();
        });

        dropdown.appendChild(linkPerfil);
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
