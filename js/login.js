/* ===========================
   AcheiDoc — Login JS
   =========================== */

(function () {
  // Se já estiver logado, redirecionar
  if (Auth.isLoggedIn()) {
    window.location.href = 'index.html';
    return;
  }

  // Tabs
  var tabs = document.querySelectorAll('.login-tab');
  var panels = document.querySelectorAll('.login-panel');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); });
      panels.forEach(function (p) { p.classList.add('hidden'); });
      tab.classList.add('active');
      var target = document.getElementById(tab.getAttribute('data-panel'));
      if (target) target.classList.remove('hidden');
    });
  });

  // Formulário utilizador
  var formUtilizador = document.getElementById('formUtilizador');
  if (formUtilizador) {
    formUtilizador.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = document.getElementById('emailUtilizador').value.trim();
      var senha = document.getElementById('senhaUtilizador').value;
      var errorEl = document.getElementById('errorUtilizador');

      var user = (typeof UTILIZADORES !== 'undefined')
        ? UTILIZADORES.find(function (u) { return u.email.toLowerCase() === email.toLowerCase() && u.senha === senha; })
        : null;

      if (user) {
        Auth.login({ id: user.id, nome: user.nome, email: user.email, role: 'utilizador', pontos: user.pontos });
        var params = new URLSearchParams(window.location.search);
        var redirect = params.get('redirect');
        // Validar redirect: apenas caminhos relativos sem protocolo
        var safePath = (redirect && /^[^:]*$/.test(redirect) && redirect.startsWith('/') === false && redirect.indexOf('//') === -1)
          ? redirect
          : 'index.html';
        window.location.href = safePath;
      } else {
        errorEl.textContent = 'Email ou senha incorrectos. Verifique os dados e tente novamente.';
        errorEl.classList.remove('hidden');
      }
    });
  }
})();
