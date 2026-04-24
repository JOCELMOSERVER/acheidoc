/* ===========================
   AcheiDoc — Admin Login JS
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

      if (!(typeof Api !== 'undefined' && Api.adminAuth && Api.adminAuth.login)) {
        if (errorMsg) {
          errorMsg.textContent = 'Serviço de autenticação admin indisponível. Verifique a API.';
          errorMsg.classList.remove('hidden');
        }
        if (btnEntrar) {
          btnEntrar.disabled = false;
          btnEntrar.textContent = 'Entrar';
        }
        return;
      }

      try {
        var response = await Api.adminAuth.login(email, senha);
        var adminApi = response && response.admin ? response.admin : null;
        var tokenApi = response && response.token ? response.token : null;

        if (!adminApi || !tokenApi) {
          throw new Error('Resposta inválida do servidor de autenticação.');
        }

        sessionStorage.setItem('adminLogado', JSON.stringify(adminApi));
        Api.setToken(tokenApi);
        window.location.href = 'dashboard.html';
      } catch (apiErr) {
        if (errorMsg) {
          errorMsg.textContent = apiErr && apiErr.message ? apiErr.message : 'Falha no login do administrador.';
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
