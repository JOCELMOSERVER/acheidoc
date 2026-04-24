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

      if (typeof Api !== 'undefined' && Api.adminAuth && Api.adminAuth.login) {
        try {
          var response = await Api.adminAuth.login(email, senha);
          var adminApi = response && response.admin ? response.admin : null;
          var tokenApi = response && response.token ? response.token : null;

          if (adminApi && tokenApi) {
            sessionStorage.setItem('adminLogado', JSON.stringify(adminApi));
            Api.setToken(tokenApi);
            window.location.href = 'dashboard.html';
            return;
          }
        } catch (apiErr) {
          if (errorMsg) {
            errorMsg.textContent = apiErr && apiErr.message ? apiErr.message : 'Falha no login do administrador.';
            errorMsg.classList.remove('hidden');
          }
          if (btnEntrar) {
            btnEntrar.disabled = false;
            btnEntrar.textContent = 'Entrar';
          }
          return;
        }
      }

      if (typeof ADMIN === 'undefined') return;

      var pwdOverrides = {};
      try {
        pwdOverrides = JSON.parse(localStorage.getItem('acheidoc_password_overrides_admin') || '{}') || {};
      } catch (err) {
        pwdOverrides = {};
      }

      var admin = ADMIN.find(function (a) {
        if (a.email !== email) return false;
        var senhaReal = pwdOverrides[String(a.email || '').toLowerCase()] || a.senha;
        return senhaReal === senha;
      });

      if (!admin) {
        if (errorMsg) { errorMsg.textContent = 'Credenciais inválidas. Tente novamente.'; errorMsg.classList.remove('hidden'); }
        return;
      }

      sessionStorage.setItem('adminLogado', JSON.stringify(admin));

      setTimeout(function () {
        window.location.href = 'dashboard.html';
      }, 800);
    });
  }
})();
