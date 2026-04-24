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
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var email = emailInput ? emailInput.value.trim() : '';
      var senha = senhaInput ? senhaInput.value : '';

      if (errorMsg) errorMsg.classList.add('hidden');

      if (!email || !senha) {
        if (errorMsg) { errorMsg.textContent = 'Preencha o email e a senha.'; errorMsg.classList.remove('hidden'); }
        return;
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
