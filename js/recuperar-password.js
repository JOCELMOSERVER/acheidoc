/* ===========================
   Encontra já — Recuperar Password (Utilizador)
   =========================== */

(function () {

  var form = document.getElementById('formRecuperar');
  var alertErro = document.getElementById('alertErro');
  var alertOk = document.getElementById('alertOk');

  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    hideAlerts();

    var validacao = validateIdentityAndPassword();
    if (!validacao.ok) {
      return showErro(validacao.msg);
    }

    if (!(typeof Api !== 'undefined' && Api.auth && Api.auth.recover)) {
      return showErro('Serviço de recuperação indisponível. Verifique a API.');
    }

    try {
      await Api.auth.recover(validacao.email);
      await Api.auth.resetPassword(validacao.email, validacao.novaSenha);
      showOk('Palavra-passe actualizada com sucesso.');
      form.reset();

      setTimeout(function () {
        window.location.href = 'login.html';
      }, 1200);
    } catch (apiErr) {
      return showErro(apiErr && apiErr.message ? apiErr.message : 'Erro ao recuperar password no servidor.');
    }
  });

  function validateIdentityAndPassword() {
    var email = val('inputEmail').toLowerCase();
    var novaSenha = val('inputNovaSenha');
    var confirmar = val('inputConfirmarSenha');

    if (!email || !novaSenha || !confirmar) {
      return { ok: false, msg: 'Preencha todos os campos.' };
    }
    if (novaSenha.length < 4) {
      return { ok: false, msg: 'A nova palavra-passe deve ter pelo menos 4 caracteres.' };
    }
    if (novaSenha !== confirmar) {
      return { ok: false, msg: 'A confirmação da palavra-passe não coincide.' };
    }

    return { ok: true, email: email, novaSenha: novaSenha };
  }

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function showErro(msg) {
    if (alertErro) {
      alertErro.textContent = msg;
      alertErro.classList.remove('hidden');
    }
  }

  function showOk(msg) {
    if (alertOk) {
      alertOk.textContent = msg;
      alertOk.classList.remove('hidden');
    }
  }

  function hideAlerts() {
    if (alertErro) alertErro.classList.add('hidden');
    if (alertOk) alertOk.classList.add('hidden');
  }
})();
