/* ===========================
   AcheiDoc — Login Agente JS
   =========================== */

(function () {
  var form = document.getElementById('loginForm');
  var emailInput = document.getElementById('emailInput');
  var senhaInput = document.getElementById('senhaInput');
  var errorMsg = document.getElementById('errorMsg');
  var btnEntrar = document.getElementById('btnEntrar');

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      var email = emailInput ? emailInput.value.trim() : '';
      var senha = senhaInput ? senhaInput.value : '';

      if (errorMsg) errorMsg.classList.add('hidden');

      if (!email || !senha) {
        if (errorMsg) { errorMsg.textContent = 'Preencha o email e a senha.'; errorMsg.classList.remove('hidden'); }
        return;
      }

      if (btnEntrar) {
        btnEntrar.disabled = true;
        btnEntrar.innerHTML = '<span class="spinner"></span> A entrar...';
      }

      if (typeof Api !== 'undefined' && Api.agenteAuth && Api.agenteAuth.login) {
        try {
          var response = await Api.agenteAuth.login(email, senha);
          var agenteApi = response && response.agente ? response.agente : null;
          var tokenApi = response && response.token ? response.token : null;

          if (agenteApi && tokenApi) {
            sessionStorage.setItem('agenteLogado', JSON.stringify(agenteApi));
            Api.setToken(tokenApi);
            window.location.href = 'dashboard.html';
            return;
          }
        } catch (apiErr) {
          if (errorMsg) {
            errorMsg.textContent = apiErr && apiErr.message ? apiErr.message : 'Falha no login do agente.';
            errorMsg.classList.remove('hidden');
          }
          if (btnEntrar) {
            btnEntrar.disabled = false;
            btnEntrar.textContent = 'Entrar';
          }
          return;
        }
      }

      if (typeof AGENTES === 'undefined') return;

      var agentesGeridos = [];
      try {
        var fromStorage = JSON.parse(localStorage.getItem('acheidoc_admin_agentes') || 'null');
        agentesGeridos = Array.isArray(fromStorage) && fromStorage.length ? fromStorage : AGENTES;
      } catch (err) {
        agentesGeridos = AGENTES;
      }

      var pwdOverrides = {};
      try {
        pwdOverrides = JSON.parse(localStorage.getItem('acheidoc_password_overrides_agentes') || '{}') || {};
      } catch (err) {
        pwdOverrides = {};
      }

      var agente = agentesGeridos.find(function (a) {
        if (a.email !== email) return false;
        var senhaReal = pwdOverrides[String(a.email || '').toLowerCase()] || a.senha;
        return senhaReal === senha;
      });

      if (!agente) {
        if (errorMsg) { errorMsg.textContent = 'Email ou senha incorrectos. Tente novamente.'; errorMsg.classList.remove('hidden'); }
        return;
      }

      if (agente.status === 'INATIVO') {
        if (errorMsg) { errorMsg.textContent = 'A sua conta de agente está inactiva. Contacte o administrador.'; errorMsg.classList.remove('hidden'); }
        return;
      }

      // Salvar sessão
      sessionStorage.setItem('agenteLogado', JSON.stringify(agente));

      if (btnEntrar) {
        btnEntrar.disabled = true;
        btnEntrar.innerHTML = '<span class="spinner"></span> A entrar...';
      }

      setTimeout(function () {
        window.location.href = 'dashboard.html';
      }, 800);
    });
  }
})();
