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

      if (!(typeof Api !== 'undefined' && Api.agenteAuth && Api.agenteAuth.login)) {
        if (errorMsg) {
          errorMsg.textContent = 'Serviço de autenticação de agente indisponível. Verifique a API.';
          errorMsg.classList.remove('hidden');
        }
        if (btnEntrar) {
          btnEntrar.disabled = false;
          btnEntrar.textContent = 'Entrar';
        }
        return;
      }

      try {
        var response = await Api.agenteAuth.login(email, senha);
        var agenteApi = response && response.agente ? response.agente : null;
        var tokenApi = response && response.token ? response.token : null;

        if (!agenteApi || !tokenApi) {
          throw new Error('Resposta inválida do servidor de autenticação.');
        }

        sessionStorage.setItem('agenteLogado', JSON.stringify(agenteApi));
        Api.setToken(tokenApi);
        window.location.href = 'dashboard.html';
      } catch (apiErr) {
        if (errorMsg) {
          errorMsg.textContent = apiErr && apiErr.message ? apiErr.message : 'Falha no login do agente.';
          errorMsg.classList.remove('hidden');
        }
        if (btnEntrar) {
          btnEntrar.disabled = false;
          btnEntrar.textContent = 'Entrar';
        }
      }
    });
  }
})();
