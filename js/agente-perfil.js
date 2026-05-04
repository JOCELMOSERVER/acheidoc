/* ===========================
   AcheiDoc — Perfil do Agente
   =========================== */

(function () {
  var agenteLogado = null;
  try { agenteLogado = JSON.parse(sessionStorage.getItem('agenteLogado') || 'null'); } catch (e) {}
  if (!agenteLogado) { window.location.href = '../login.html'; return; }

  // Preencher dados do agente
  var nome = agenteLogado.nome || agenteLogado.name || '';
  var email = agenteLogado.email || '';
  var ponto = agenteLogado.ponto_entrega || agenteLogado.ponto || '—';
  var pontos = agenteLogado.pontos || 0;

  var avatarEl = document.getElementById('agenteAvatar');
  if (avatarEl && nome) avatarEl.textContent = nome.charAt(0).toUpperCase();

  function setEl(id, v) {
    var el = document.getElementById(id);
    if (el) el.textContent = v;
  }

  setEl('perfilNome', nome || '—');
  setEl('perfilEmail', email || '—');
  setEl('perfilPonto', ponto);
  setEl('perfilPontos', pontos + ' pts');

  var editNomeEl = document.getElementById('editNome');
  if (editNomeEl) editNomeEl.value = nome;

  // Carregar estatísticas via API
  if (typeof Api !== 'undefined' && Api.agente && Api.agente.stats) {
    Api.agente.stats(agenteLogado.id).then(function (data) {
      if (!data) return;
      var s = data.stats || data;
      setEl('statRecebidos', s.recebidos || s.documentos_recebidos || '0');
      setEl('statEntregues', s.entregues || s.documentos_entregues || '0');
      setEl('statPontosMes', (s.pontos_mes || s.pontos_este_mes || '0') + ' pts');
    }).catch(function () {
      setEl('statRecebidos', '0');
      setEl('statEntregues', '0');
      setEl('statPontosMes', '0 pts');
    });
  } else {
    setEl('statRecebidos', '0');
    setEl('statEntregues', '0');
    setEl('statPontosMes', '0 pts');
  }

  // Logout
  var btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', function () {
      sessionStorage.removeItem('agenteLogado');
      window.location.href = '../login.html';
    });
  }

  // Editar perfil
  var editForm = document.getElementById('editPerfilForm');
  if (editForm) {
    editForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var errEl = document.getElementById('editErrorMsg');
      var sucEl = document.getElementById('editSuccessMsg');
      if (errEl) { errEl.textContent = ''; errEl.classList.add('hidden'); }
      if (sucEl) sucEl.classList.add('hidden');

      var novaSenha = (document.getElementById('editNovaSenha') || {}).value || '';
      var confirmar = (document.getElementById('editConfirmarSenha') || {}).value || '';

      if (novaSenha && novaSenha !== confirmar) {
        if (errEl) { errEl.textContent = 'As senhas não coincidem.'; errEl.classList.remove('hidden'); }
        return;
      }

      if (novaSenha && novaSenha.length < 6) {
        if (errEl) { errEl.textContent = 'A nova senha deve ter pelo menos 6 caracteres.'; errEl.classList.remove('hidden'); }
        return;
      }

      var novoNome = (document.getElementById('editNome') || {}).value || '';
      var novoTelefone = (document.getElementById('editTelefone') || {}).value || '';

      if (novoNome.trim()) {
        agenteLogado.nome = novoNome.trim();
        try { sessionStorage.setItem('agenteLogado', JSON.stringify(agenteLogado)); } catch (err) {}
        setEl('perfilNome', agenteLogado.nome);
        if (avatarEl) avatarEl.textContent = agenteLogado.nome.charAt(0).toUpperCase();
      }

      if (novoTelefone.trim()) {
        agenteLogado.telefone = novoTelefone.trim();
        try { sessionStorage.setItem('agenteLogado', JSON.stringify(agenteLogado)); } catch (err) {}
      }

      // Tentar actualizar via API
      if (typeof Api !== 'undefined' && Api.agente && Api.agente.atualizar) {
        var payload = { nome: novoNome.trim() };
        if (novoTelefone.trim()) payload.telefone = novoTelefone.trim();
        if (novaSenha) {
          payload.senhaAtual = (document.getElementById('editSenhaAtual') || {}).value || '';
          payload.novaSenha = novaSenha;
        }
        Api.agente.atualizar(agenteLogado.id, payload)
          .then(function () {
            if (sucEl) sucEl.classList.remove('hidden');
            setTimeout(function () { if (sucEl) sucEl.classList.add('hidden'); }, 3000);
          })
          .catch(function (err) {
            if (errEl) {
              errEl.textContent = (err && err.message) || 'Erro ao guardar alterações.';
              errEl.classList.remove('hidden');
            }
          });
      } else {
        if (sucEl) sucEl.classList.remove('hidden');
        setTimeout(function () { if (sucEl) sucEl.classList.add('hidden'); }, 3000);
      }
    });
  }
})();
