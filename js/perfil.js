/* ===========================
   AcheiDoc — Perfil do Utilizador
   =========================== */

(function () {
  // Redirecionar se não logado
  Auth.requireAuth();

  var user = Auth.getUser();
  if (!user) return;

  // Preencher campos com dados da sessão
  var elNome = document.getElementById('perfilNome');
  var elEmail = document.getElementById('perfilEmail');
  var elTelefone = document.getElementById('perfilTelefone');
  var elMunicipio = document.getElementById('perfilMunicipio');

  if (elNome) elNome.value = user.nome || '';
  if (elEmail) elEmail.value = user.email || '';
  if (elTelefone) elTelefone.value = user.telefone || '';
  if (elMunicipio) elMunicipio.value = user.municipio || '';

  // Mostrar estatísticas
  var elPontos = document.getElementById('statPontos');
  var elPublicados = document.getElementById('statPublicados');
  var elResgatados = document.getElementById('statResgatados');

  if (elPontos) elPontos.textContent = user.pontos || 0;
  if (elPublicados) elPublicados.textContent = user.documentosPublicados || 0;
  if (elResgatados) elResgatados.textContent = user.documentosResgatados || 0;

  // Tentar carregar dados adicionais via API
  if (typeof Api !== 'undefined' && Api.utilizadores && typeof Api.utilizadores.perfil === 'function') {
    Api.utilizadores.perfil().then(function (data) {
      if (!data) return;
      if (elNome && data.nome) elNome.value = data.nome;
      if (elEmail && data.email) elEmail.value = data.email;
      if (elTelefone && data.telefone) elTelefone.value = data.telefone;
      if (elMunicipio && data.municipio) elMunicipio.value = data.municipio;
      if (elPontos && data.pontos !== undefined) elPontos.textContent = data.pontos;
      if (elPublicados && data.documentosPublicados !== undefined) elPublicados.textContent = data.documentosPublicados;
      if (elResgatados && data.documentosResgatados !== undefined) elResgatados.textContent = data.documentosResgatados;
    }).catch(function () {
      // Ignorar erro — usa dados da sessão
    });
  }

  // Mostrar mensagem de notificação
  function showNotice(elId, msg, type) {
    var el = document.getElementById(elId);
    if (!el) return;
    el.textContent = msg;
    el.className = 'alert alert-' + (type || 'info');
    el.classList.remove('hidden');
    setTimeout(function () { el.classList.add('hidden'); }, 4000);
  }

  // Guardar alterações do perfil
  var btnGuardar = document.getElementById('btnGuardarPerfil');
  if (btnGuardar) {
    btnGuardar.addEventListener('click', function () {
      var nome = elNome ? elNome.value.trim() : '';
      var telefone = elTelefone ? elTelefone.value.trim() : '';
      var municipio = elMunicipio ? elMunicipio.value : '';

      if (!nome) {
        showNotice('perfilNotice', 'O nome é obrigatório.', 'error');
        return;
      }

      btnGuardar.disabled = true;
      btnGuardar.textContent = 'A guardar...';

      if (typeof Api !== 'undefined' && Api.utilizadores && typeof Api.utilizadores.atualizar === 'function') {
        Api.utilizadores.atualizar({ nome: nome, telefone: telefone, municipio: municipio })
          .then(function (data) {
            // Atualizar sessão com novos dados
            var updated = Object.assign({}, user, { nome: nome, telefone: telefone, municipio: municipio });
            Auth.login(updated, null);
            showNotice('perfilNotice', 'Perfil atualizado com sucesso!', 'success');
          })
          .catch(function (err) {
            showNotice('perfilNotice', (err && err.message) || 'Erro ao guardar o perfil.', 'error');
          })
          .finally(function () {
            btnGuardar.disabled = false;
            btnGuardar.textContent = 'Guardar alterações';
          });
      } else {
        // Atualizar apenas localmente se API não disponível
        var updated = Object.assign({}, user, { nome: nome, telefone: telefone, municipio: municipio });
        Auth.login(updated, null);
        showNotice('perfilNotice', 'Perfil atualizado localmente.', 'success');
        btnGuardar.disabled = false;
        btnGuardar.textContent = 'Guardar alterações';
      }
    });
  }

  // Alterar password
  var btnAlterarPassword = document.getElementById('btnAlterarPassword');
  if (btnAlterarPassword) {
    btnAlterarPassword.addEventListener('click', function () {
      var passwordAtual = document.getElementById('passwordAtual');
      var passwordNova = document.getElementById('passwordNova');
      var passwordConfirmar = document.getElementById('passwordConfirmar');

      var atual = passwordAtual ? passwordAtual.value : '';
      var nova = passwordNova ? passwordNova.value : '';
      var confirmar = passwordConfirmar ? passwordConfirmar.value : '';

      if (!atual || !nova || !confirmar) {
        showNotice('passwordNotice', 'Preencha todos os campos de password.', 'error');
        return;
      }

      if (nova !== confirmar) {
        showNotice('passwordNotice', 'A nova password e a confirmação não coincidem.', 'error');
        return;
      }

      if (nova.length < 6) {
        showNotice('passwordNotice', 'A nova password deve ter pelo menos 6 caracteres.', 'error');
        return;
      }

      btnAlterarPassword.disabled = true;
      btnAlterarPassword.textContent = 'A alterar...';

      if (typeof Api !== 'undefined' && Api.utilizadores && typeof Api.utilizadores.alterarPassword === 'function') {
        Api.utilizadores.alterarPassword({ passwordAtual: atual, passwordNova: nova })
          .then(function () {
            showNotice('passwordNotice', 'Password alterada com sucesso!', 'success');
            if (passwordAtual) passwordAtual.value = '';
            if (passwordNova) passwordNova.value = '';
            if (passwordConfirmar) passwordConfirmar.value = '';
          })
          .catch(function (err) {
            showNotice('passwordNotice', (err && err.message) || 'Erro ao alterar a password.', 'error');
          })
          .finally(function () {
            btnAlterarPassword.disabled = false;
            btnAlterarPassword.textContent = 'Alterar Password';
          });
      } else {
        showNotice('passwordNotice', 'Funcionalidade de alteração de password não disponível.', 'error');
        btnAlterarPassword.disabled = false;
        btnAlterarPassword.textContent = 'Alterar Password';
      }
    });
  }
})();
