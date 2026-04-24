/* ===========================
   AcheiDoc — Recuperar Password (Agente)
   =========================== */

(function () {
  var STORAGE_AGENTS = 'acheidoc_admin_agentes';
  var STORAGE_PWD = 'acheidoc_password_overrides_agentes';

  var form = document.getElementById('formRecuperar');
  var errorMsg = document.getElementById('errorMsg');
  var okMsg = document.getElementById('okMsg');

  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    hideAlerts();

    var validacao = validateIdentityAndPassword();
    if (!validacao.ok) return showError(validacao.msg);

    if (typeof Api !== 'undefined' && Api.agenteAuth && Api.agenteAuth.recover) {
      try {
        await Api.agenteAuth.recover(validacao.email);
        var otp = window.prompt('Introduza o código OTP enviado para o email:');
        if (!otp) return showError('Código OTP obrigatório.');
        await Api.agenteAuth.resetPassword(validacao.email, otp.trim(), validacao.novaSenha);
        showOk('Password actualizada com sucesso.');
        form.reset();
        setTimeout(function () {
          window.location.href = 'login.html';
        }, 1200);
        return;
      } catch (apiErr) {
        return showError(apiErr && apiErr.message ? apiErr.message : 'Erro ao recuperar password do agente.');
      }
    }

    var overrides = safeParse(localStorage.getItem(STORAGE_PWD)) || {};
    overrides[validacao.email] = validacao.novaSenha;
    localStorage.setItem(STORAGE_PWD, JSON.stringify(overrides));

    showOk('Email enviado para ' + validacao.email + ' com a nova password.');
    form.reset();
    setTimeout(function () {
      window.location.href = 'login.html';
    }, 1200);
  });

  function validateIdentityAndPassword() {
    var email = getVal('emailInput').toLowerCase();
    var novaSenha = getVal('novaSenhaInput');
    var confirmar = getVal('confirmarSenhaInput');

    if (!email || !novaSenha || !confirmar) {
      return { ok: false, msg: 'Preencha todos os campos.' };
    }
    if (novaSenha.length < 4) {
      return { ok: false, msg: 'A nova password deve ter pelo menos 4 caracteres.' };
    }
    if (novaSenha !== confirmar) {
      return { ok: false, msg: 'A confirmação da password não coincide.' };
    }

    var agentes = getAgentes();
    var agente = agentes.find(function (a) { return String(a.email || '').toLowerCase() === email; });
    if (!agente) {
      return { ok: false, msg: 'Email de agente não encontrado.' };
    }

    return { ok: true, email: email, novaSenha: novaSenha };
  }

  function getAgentes() {
    var fromAdmin = safeParse(localStorage.getItem(STORAGE_AGENTS));
    if (Array.isArray(fromAdmin) && fromAdmin.length) return fromAdmin;
    return Array.isArray(AGENTES) ? AGENTES : [];
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

  function safeParse(raw) {
    try { return raw ? JSON.parse(raw) : null; }
    catch (e) { return null; }
  }
})();
