/* ===========================
   AcheiDoc — Agente Validar JS
   =========================== */

(function () {
  // Verificar login
  var agenteLogado = JSON.parse(sessionStorage.getItem('agenteLogado') || 'null');
  if (!agenteLogado) {
    window.location.href = 'login.html';
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var docIdParam = params.get('id');
  var flowParam = params.get('flow') || '';

  // Inputs dos dois fluxos
  var codigoInput = document.getElementById('codigoInput');
  var chaveEntregaInput = document.getElementById('chaveEntregaInput');

  var receberCard = document.getElementById('receberCard');
  var entregarCard = document.getElementById('entregarCard');
  var docResumoCard = document.getElementById('docResumoCard');
  var docResumoInfo = document.getElementById('docResumoInfo');

  var receberErrorMsg = document.getElementById('receberErrorMsg');
  var btnReceber = document.getElementById('btnReceber');
  var receberChecklistSection = document.getElementById('receberChecklistSection');
  var btnConfirmarRecepcao = document.getElementById('btnConfirmarRecepcao');
  var receberSuccessSection = document.getElementById('receberSuccessSection');
  var receberSuccessInfo = document.getElementById('receberSuccessInfo');

  // Botão validar
  var btnValidar = document.getElementById('btnValidar');
  var errorMsg = document.getElementById('errorMsg');
  var checklistSection = document.getElementById('checklistSection');
  var btnAutorizar = document.getElementById('btnAutorizar');
  var confirmSection = document.getElementById('confirmSection');
  var btnConfirmar = document.getElementById('btnConfirmar');
  var successSection = document.getElementById('successSection');

  var checklist = [
    document.getElementById('check1'),
    document.getElementById('check2'),
    document.getElementById('check3')
  ];

  var receiveChecklist = [
    document.getElementById('receiveCheck1'),
    document.getElementById('receiveCheck2'),
    document.getElementById('receiveCheck3')
  ];

  var docValidado = null;
  var docRecebido = null;
  var documentos = [];
  var docsLoaded = false;
  var apiMode = typeof Api !== 'undefined' && Api.documentos && Api.documentos.agenteUpdate;

  function normalizeCode(value) {
    return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  function sanitizeCode(value) {
    return String(value || '').trim().toUpperCase();
  }

  function renderResumoDoc(docSelecionado) {
    if (docSelecionado && docResumoCard && docResumoInfo) {
      docResumoCard.classList.remove('hidden');
      docResumoInfo.innerHTML =
        '<strong>' + docSelecionado.id + '</strong><br>' +
        docSelecionado.tipo + ' — ' + docSelecionado.nomeParcial + '<br>' +
        'Encontrador: ' + (docSelecionado.encontradoPor || '');
    }
  }

  if (flowParam === 'receber' && receberCard && entregarCard) {
    receberCard.style.borderLeft = '4px solid var(--primary)';
    entregarCard.classList.add('hidden');
  } else if (flowParam === 'entregar' && receberCard && entregarCard) {
    entregarCard.style.borderLeft = '4px solid var(--primary)';
    receberCard.classList.add('hidden');
  }

  if (btnReceber) {
    btnReceber.addEventListener('click', async function () {
      var chaveRaw = chaveEntregaInput ? sanitizeCode(chaveEntregaInput.value) : '';

      if (!chaveRaw) {
        showReceiveError('Por favor, insira a chave de entrega apresentada pelo encontrador.');
        return;
      }

      if (receberErrorMsg) receberErrorMsg.classList.add('hidden');
      if (receberChecklistSection) receberChecklistSection.classList.add('hidden');

      if (!apiMode) {
        showReceiveError('API de validação indisponível.');
        return;
      }

      docRecebido = await findDocByChaveEntregaApi(chaveRaw);
      if (!docRecebido) {
        showReceiveError('Documento não encontrado para esta chave de entrega.');
        return;
      }

      if (receberChecklistSection) receberChecklistSection.classList.remove('hidden');
      animarRecepcao();
    });
  }

  if (btnValidar) {
    btnValidar.addEventListener('click', async function () {
      var codigoRaw = codigoInput ? sanitizeCode(codigoInput.value) : '';

      if (!codigoRaw) {
        showError('Por favor, insira o código de resgate.');
        return;
      }

      if (errorMsg) errorMsg.classList.add('hidden');
      if (checklistSection) checklistSection.classList.add('hidden');

      if (!apiMode) {
        showError('API de validação indisponível.');
        return;
      }

      docValidado = await findDocByCodigoApi(codigoRaw);
      if (!docValidado) {
        showError('Documento não encontrado para este código de resgate.');
        return;
      }

      if (checklistSection) checklistSection.classList.remove('hidden');
      animarChecklist();
    });
  }

  async function findDocByCodigoApi(codigo) {
    if (!(apiMode && Api.documentos && Api.documentos.agenteByCodigo)) return null;

    var rawCode = sanitizeCode(codigo);
    var normalizedCode = normalizeCode(codigo);
    var candidates = [rawCode];
    if (normalizedCode && normalizedCode !== rawCode) {
      candidates.push(normalizedCode);
    }

    for (var i = 0; i < candidates.length; i++) {
      var candidate = candidates[i];
      if (!candidate) continue;

      try {
        var response = await Api.documentos.agenteByCodigo(candidate);
        var doc = response && response.documento ? toLegacyDoc(response.documento) : null;
        if (!doc || !doc.id) continue;

        var exists = documentos.find(function (d) { return d.id === doc.id; });
        if (!exists) documentos.push(doc);

        return doc;
      } catch (err) {
        // Try the next candidate format before failing.
      }
    }

    return null;
  }

  async function findDocByChaveEntregaApi(chave) {
    if (!(apiMode && Api.documentos && Api.documentos.agenteLista)) return null;

    var chaveNormalizada = normalizeCode(chave);
    if (!chaveNormalizada) return null;

    try {
      if (!docsLoaded) {
        var response = await Api.documentos.agenteLista();
        documentos = (response && response.documentos ? response.documentos : []).map(toLegacyDoc).filter(function (d) {
          return d.id && d.tipo && d.nomeParcial;
        });
        docsLoaded = true;
      }

      return documentos.find(function (d) {
        return normalizeCode(d.chaveEntrega) === chaveNormalizada;
      }) || null;
    } catch (err) {
      return null;
    }
  }

  function animarRecepcao() {
    receiveChecklist.forEach(function (el) {
      if (el) {
        el.querySelector('.check-icon').className = 'check-icon pending';
        el.querySelector('.check-icon').textContent = String(receiveChecklist.indexOf(el) + 1);
      }
    });

    var delays = [350, 800, 1250];
    receiveChecklist.forEach(function (el, i) {
      if (!el) return;
      setTimeout(function () {
        el.querySelector('.check-icon').className = 'check-icon success';
        el.querySelector('.check-icon').textContent = 'OK';
      }, delays[i]);
    });

    setTimeout(function () {
      if (btnConfirmarRecepcao) btnConfirmarRecepcao.classList.remove('hidden');
    }, 1600);
  }

  function animarChecklist() {
    checklist.forEach(function (el) {
      if (el) {
        el.querySelector('.check-icon').className = 'check-icon pending';
        el.querySelector('.check-icon').textContent = String(checklist.indexOf(el) + 1);
      }
    });

    var delays = [400, 900, 1400];
    checklist.forEach(function (el, i) {
      if (!el) return;
      setTimeout(function () {
        el.querySelector('.check-icon').className = 'check-icon success';
        el.querySelector('.check-icon').textContent = 'OK';
      }, delays[i]);
    });

    setTimeout(function () {
      if (btnAutorizar) btnAutorizar.classList.remove('hidden');
    }, 1800);
  }

  if (btnConfirmarRecepcao) {
    btnConfirmarRecepcao.addEventListener('click', function () {
      if (!docRecebido) return;

      btnConfirmarRecepcao.disabled = true;
      btnConfirmarRecepcao.innerHTML = '<span class="spinner"></span> A registar...';

      setTimeout(async function () {
        try {
          await Api.documentos.agenteUpdate(docRecebido.id, 'AGUARDANDO_ENTREGA');
          docRecebido.status = 'AGUARDANDO_ENTREGA';
        } catch (apiErr) {
          showReceiveError(apiErr && apiErr.message ? apiErr.message : 'Falha ao registar recepção.');
          btnConfirmarRecepcao.disabled = false;
          btnConfirmarRecepcao.textContent = 'Confirmar recepção';
          return;
        }
        if (receberChecklistSection) receberChecklistSection.classList.add('hidden');
        if (receberSuccessSection) receberSuccessSection.classList.remove('hidden');
        if (receberSuccessInfo) {
          receberSuccessInfo.textContent = docRecebido.id + ' registado no ponto. O dono pode agora pesquisar e pagar para levantar o documento.';
        }
      }, 1000);
    });
  }

  if (btnAutorizar) {
    btnAutorizar.addEventListener('click', function () {
      if (confirmSection) {
        confirmSection.classList.remove('hidden');
        // Mostrar detalhes do documento
        if (docValidado) {
          var el = document.getElementById('docValidadoInfo');
          if (el) {
            el.innerHTML = `
              <div class="alert alert-info">
                <strong>${docValidado.tipo}</strong> — ${docValidado.nomeParcial}
              </div>`;
          }
        }
      }
    });
  }

  if (btnConfirmar) {
    btnConfirmar.addEventListener('click', function () {
      btnConfirmar.disabled = true;
      btnConfirmar.innerHTML = '<span class="spinner"></span> A registar...';

      setTimeout(async function () {
        try {
          if (docValidado) {
            await Api.documentos.agenteUpdate(docValidado.id, 'ENTREGUE');
            docValidado.status = 'ENTREGUE';
          }
        } catch (apiErr) {
          showError(apiErr && apiErr.message ? apiErr.message : 'Falha ao confirmar entrega.');
          btnConfirmar.disabled = false;
          btnConfirmar.textContent = 'Confirmar entrega';
          return;
        }
        if (confirmSection) confirmSection.classList.add('hidden');
        if (checklistSection) checklistSection.classList.add('hidden');
        if (successSection) successSection.classList.remove('hidden');
      }, 1000);
    });
  }

  function toLegacyDoc(item) {
    return {
      id: item.id,
      tipo: item.tipo,
      nomeParcial: item.nome_proprietario,
      status: item.status,
      encontradoPor: item.publicado_por_nome,
      codigoResgate: item.codigo_resgate,
      chaveEntrega: item.chave_entrega
    };
  }

  async function loadDocumentos() {
    if (!(apiMode && Api.documentos.agenteLista)) {
      showError('API de documentos indisponível.');
      return false;
    }

    try {
      var response = await Api.documentos.agenteLista();
      documentos = (response && response.documentos ? response.documentos : []).map(toLegacyDoc).filter(function (d) {
        return d.id && d.tipo && d.nomeParcial;
      });
      docsLoaded = true;
      return true;
    } catch (err) {
      showError(err && err.message ? err.message : 'Falha ao carregar documentos.');
      return false;
    }
  }

  (async function initData() {
    var loaded = await loadDocumentos();
    if (!loaded) return;

    if (docIdParam && Array.isArray(documentos)) {
      var docSelecionado = documentos.find(function (d) { return d.id === docIdParam; }) || null;
      renderResumoDoc(docSelecionado);
    }
  })();

  function showError(msg) {
    if (errorMsg) {
      errorMsg.textContent = msg;
      errorMsg.classList.remove('hidden');
    }
    if (checklistSection) checklistSection.classList.add('hidden');
    if (btnAutorizar) btnAutorizar.classList.add('hidden');
    if (confirmSection) confirmSection.classList.add('hidden');
  }

  function showReceiveError(msg) {
    if (receberErrorMsg) {
      receberErrorMsg.textContent = msg;
      receberErrorMsg.classList.remove('hidden');
    }
    if (receberChecklistSection) receberChecklistSection.classList.add('hidden');
    if (btnConfirmarRecepcao) btnConfirmarRecepcao.classList.add('hidden');
  }
})();
