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
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var email = emailInput ? emailInput.value.trim() : '';
      var senha = senhaInput ? senhaInput.value : '';

      if (errorMsg) errorMsg.classList.add('hidden');

      if (!email || !senha) {
        if (errorMsg) { errorMsg.textContent = 'Preencha o email e a senha.'; errorMsg.classList.remove('hidden'); }
        return;
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
