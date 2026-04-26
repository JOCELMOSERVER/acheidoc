/* ===========================
   AcheiDoc — Admin Revisar JS
   =========================== */

(function () {
  var adminLogado = JSON.parse(sessionStorage.getItem('adminLogado') || 'null');
  if (!adminLogado) {
    window.location.href = 'login.html';
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var docId = params.get('id');
  var doc = null;

  if (!docId) {
    showNotFound();
    return;
  }

  function toLegacyDoc(item) {
    if (!item || !item.id || !item.tipo || !item.nome_proprietario || !item.provincia || !item.criado_em) {
      return null;
    }

    return {
      id: item.id,
      tipo: item.tipo,
      nomeParcial: item.nome_proprietario,
      localParcial: item.provincia,
      foto: item.foto_url,
      risco: item.risco,
      status: item.status,
      dataCriacao: (item.criado_em || item.data_publicacao || '').slice(0, 10)
    };
  }

  function preencherDados() {
    if (!doc) return;
    var docFoto = document.getElementById('docFoto');
    if (docFoto) docFoto.src = doc.foto;

    setEl('docId', doc.id);
    setEl('docData', formatDate(doc.dataCriacao));
    setEl('docTipo', doc.tipo);
    setEl('docNome', doc.nomeParcial);
    setEl('docLocal', doc.localParcial);

    var riscoBadge = document.getElementById('riscoBadge');
    if (riscoBadge) {
      riscoBadge.textContent = getRiscoLabel(doc.risco);
      riscoBadge.className = 'badge ' + getRiscoBadgeClass(doc.risco);
    }

    var iaRisco = document.getElementById('iaRisco');
    if (iaRisco) {
      iaRisco.textContent = getRiscoLabel(doc.risco);
      iaRisco.className = 'badge ' + getRiscoBadgeClass(doc.risco);
    }
  }

  async function aplicarRevisao(status, observacao) {
    if (!(typeof Api !== 'undefined' && Api.documentos && Api.documentos.adminReview)) {
      throw new Error('API de revisão indisponível.');
    }

    var response = await Api.documentos.adminReview(doc.id, {
      status: status,
      observacao_correcao: observacao || null
    });
    if (response && response.documento) {
      doc = toLegacyDoc(response.documento);
    }
  }

  // Botão Aprovar
  var btnAprovar = document.getElementById('btnAprovar');
  if (btnAprovar) {
    btnAprovar.addEventListener('click', async function () {
      if (confirm('Confirmar aprovação e publicação do documento ' + doc.id + '?')) {
        try {
          await aplicarRevisao('PUBLICADO', '');
          showSuccessMsg('Documento ' + doc.id + ' aprovado e publicado.', 'success');
          disableActions();
        } catch (err) {
          showSuccessMsg(err && err.message ? err.message : 'Falha ao aprovar documento.', 'danger');
        }
      }
    });
  }

  // Botão Rejeitar
  var btnRejeitar = document.getElementById('btnRejeitar');
  if (btnRejeitar) {
    btnRejeitar.addEventListener('click', async function () {
      if (confirm('Confirmar rejeição do documento ' + doc.id + '?')) {
        try {
          await aplicarRevisao('REJEITADO', null);
          showSuccessMsg('Documento ' + doc.id + ' rejeitado.', 'danger');
          disableActions();
        } catch (err) {
          showSuccessMsg(err && err.message ? err.message : 'Falha ao rejeitar documento.', 'danger');
        }
      }
    });
  }

  // Botão Corrigir
  var btnCorrigir = document.getElementById('btnCorrigir');
  var corrigirSection = document.getElementById('corrigirSection');
  var btnSalvarCorrecao = document.getElementById('btnSalvarCorrecao');

  if (btnCorrigir && corrigirSection) {
    btnCorrigir.addEventListener('click', function () {
      corrigirSection.classList.toggle('hidden');
    });
  }

  if (btnSalvarCorrecao) {
    btnSalvarCorrecao.addEventListener('click', async function () {
      var obs = document.getElementById('obsCorrecao');
      var text = obs ? obs.value.trim() : '';
      if (!text) {
        alert('Por favor, escreva a observação de correcção.');
        return;
      }
      try {
        await aplicarRevisao('CORRECAO_SOLICITADA', text);
        showSuccessMsg('Correcção registada para o documento ' + doc.id + '.', 'warning');
        if (corrigirSection) corrigirSection.classList.add('hidden');
        disableActions();
      } catch (err) {
        showSuccessMsg(err && err.message ? err.message : 'Falha ao pedir correcção.', 'danger');
      }
    });
  }

  (async function loadDocumento() {
    if (!(typeof Api !== 'undefined' && Api.documentos && Api.documentos.adminDetail)) {
      showNotFound();
      return;
    }

    try {
      var response = await Api.documentos.adminDetail(docId);
      doc = response && response.documento ? toLegacyDoc(response.documento) : null;
      if (!doc) {
        showNotFound();
        return;
      }
      preencherDados();
    } catch (err) {
      showNotFound();
    }
  })();

  function showSuccessMsg(msg, type) {
    var el = document.getElementById('actionResult');
    if (el) {
      el.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
      el.classList.remove('hidden');
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function disableActions() {
    [document.getElementById('btnAprovar'), document.getElementById('btnRejeitar'), document.getElementById('btnCorrigir')].forEach(function (b) {
      if (b) b.disabled = true;
    });
  }

  function showNotFound() {
    var c = document.getElementById('mainContent');
    if (c) c.innerHTML = `<div class="empty-state"><div class="empty-icon">Sem registo</div><h3>Documento não encontrado</h3><p><a href="dashboard.html" class="btn btn-primary mt-3">← Voltar ao Dashboard</a></p></div>`;
  }

  function setEl(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }
})();
