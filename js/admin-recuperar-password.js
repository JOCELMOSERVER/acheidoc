/* ===========================
   AcheiDoc — Recuperar Password (Admin)
   =========================== */

(function () {
  var form = document.getElementById('formRecuperar');
  var errorMsg = document.getElementById('errorMsg');
  var okMsg = document.getElementById('okMsg');

  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    hideAlerts();

    var validacao = validateIdentityAndPassword();
    if (!validacao.ok) return showError(validacao.msg);

    if (!(typeof Api !== 'undefined' && Api.adminAuth && Api.adminAuth.recover)) {
      return showError('Serviço de recuperação admin indisponível. Verifique a API.');
    }

    try {
      await Api.adminAuth.recover(validacao.email);
      await Api.adminAuth.resetPassword(validacao.email, validacao.novaSenha);
      showOk('Password actualizada com sucesso.');
      form.reset();
      setTimeout(function () {
        window.location.href = 'login.html';
      }, 1200);
    } catch (apiErr) {
      return showError(apiErr && apiErr.message ? apiErr.message : 'Erro ao recuperar password do admin.');
    }
  });

  function validateIdentityAndPassword() {
    var email = getVal('emailInput').toLowerCase();
    var novaSenha = getVal('novaSenhaInput');
    var confirmar = getVal('confirmarSenhaInput');

    if (!email || !novaSenha || !confirmar) {
      return { ok: false, msg: 'Preencha todos os campos.' };
    }
    if (novaSenha.length < 6) {
      return { ok: false, msg: 'A nova password do admin deve ter pelo menos 6 caracteres.' };
    }
    if (novaSenha !== confirmar) {
      return { ok: false, msg: 'A confirmação da password não coincide.' };
    }

    return { ok: true, email: email, novaSenha: novaSenha };
  }

  function getVal(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function showError(msg) {
    if (!errorMsg) return;
    errorMsg.textContent = msg;
    errorMsg.classList.remove('hidden');
  }

  function showOk(msg) {
    if (!okMsg) return;
    okMsg.textContent = msg;
    okMsg.classList.remove('hidden');
  }

  function hideAlerts() {
    if (errorMsg) errorMsg.classList.add('hidden');
    if (okMsg) okMsg.classList.add('hidden');
  }

})();
