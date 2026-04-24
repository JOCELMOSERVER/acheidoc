/* ===========================
   AcheiDoc — Login JS
   =========================== */

// Submit do formulário
document.getElementById('formLogin').addEventListener('submit', function (e) {
  e.preventDefault();

  const email = document.getElementById('inputEmail').value.trim();
  const senha = document.getElementById('inputSenha').value;
  const btnEntrar = document.getElementById('btnEntrar');
  const alertaErro = document.getElementById('alertaErro');
  const alertaSucesso = document.getElementById('alertaSucesso');

  // Loading
  btnEntrar.textContent = 'A entrar...';
  btnEntrar.disabled = true;
  alertaErro.style.display = 'none';
  alertaSucesso.style.display = 'none';

  setTimeout(function () {
    var utilizadoresGeridos = [];
    try {
      var fromStorage = JSON.parse(localStorage.getItem('acheidoc_admin_utilizadores') || 'null');
      utilizadoresGeridos = Array.isArray(fromStorage) && fromStorage.length ? fromStorage : UTILIZADORES;
    } catch (err) {
      utilizadoresGeridos = UTILIZADORES;
    }

    var pwdOverrides = {};
    try {
      pwdOverrides = JSON.parse(localStorage.getItem('acheidoc_password_overrides_utilizadores') || '{}') || {};
    } catch (err) {
      pwdOverrides = {};
    }

    var utilizadorEncontrado = utilizadoresGeridos.find(function (u) {
      if (u.email !== email) return false;
      var senhaReal = pwdOverrides[String(u.email || '').toLowerCase()] || u.senha;
      return senhaReal === senha;
    });

    // Bloquear tentativas de login institucional nesta página
    var isAgente = AGENTES.find(function (a) { return a.email === email; });
    var isAdmin = ADMIN.find(function (a) { return a.email === email; });

    if (utilizadorEncontrado) {
      if (utilizadorEncontrado.status === 'BLOQUEADO') {
        alertaErro.textContent = 'A sua conta está bloqueada. Contacte o suporte da plataforma.';
        alertaErro.style.display = 'block';
        btnEntrar.textContent = 'Entrar';
        btnEntrar.disabled = false;
        return;
      }

      var sessao = Object.assign({}, utilizadorEncontrado, { role: 'utilizador' });
      Auth.login(sessao);
      alertaSucesso.textContent = 'Login realizado com sucesso. A redirecionar...';
      alertaSucesso.style.display = 'block';

      // Verificar redirect param — apenas permitir caminhos relativos seguros (.html)
      const params = new URLSearchParams(window.location.search);
      const redirectParam = params.get('redirect');
      const safeRedirect = (redirectParam && /^(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.html$/.test(redirectParam))
        ? redirectParam
        : null;

      setTimeout(function () {
        window.location.href = safeRedirect || 'index.html';
      }, 1000);
    } else if (isAgente || isAdmin) {
      alertaErro.textContent = 'Use o portal específico no final desta página (Agente ou Admin).';
      alertaErro.style.display = 'block';
      btnEntrar.textContent = 'Entrar';
      btnEntrar.disabled = false;
    } else {
      alertaErro.textContent = 'Email ou senha incorrectos. Tente novamente.';
      alertaErro.style.display = 'block';
      btnEntrar.textContent = 'Entrar';
      btnEntrar.disabled = false;
    }
  }, 1000);
});

// Toggle password visibility
document.getElementById('btnTogglePassword').addEventListener('click', function () {
  const input = document.getElementById('inputSenha');
  input.type = input.type === 'password' ? 'text' : 'password';
  this.textContent = input.type === 'password' ? 'Ver' : 'Ocultar';
});
