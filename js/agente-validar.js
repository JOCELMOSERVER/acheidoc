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
  var documentos = typeof getDocumentosData === 'function' ? getDocumentosData() : DOCUMENTOS;

  if (docIdParam && Array.isArray(documentos)) {
    var docSelecionado = documentos.find(function (d) { return d.id === docIdParam; }) || null;
    if (docSelecionado && docResumoCard && docResumoInfo) {
      docResumoCard.classList.remove('hidden');
      docResumoInfo.innerHTML = `
        <strong>${docSelecionado.id}</strong><br>
        ${docSelecionado.tipo} — ${docSelecionado.nomeParcial}<br>
        Encontrador: ${docSelecionado.encontradoPor || '—'}
      `;
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
    btnReceber.addEventListener('click', function () {
      var chave = chaveEntregaInput ? chaveEntregaInput.value.trim().toUpperCase() : '';

      if (!chave) {
        showReceiveError('Por favor, insira a chave de entrega apresentada pelo encontrador.');
        return;
      }

      if (receberErrorMsg) receberErrorMsg.classList.add('hidden');
      if (receberChecklistSection) receberChecklistSection.classList.add('hidden');

      if (typeof CHAVES_ENTREGA === 'undefined' || !Array.isArray(documentos)) return;

      var docIdEncontrado = null;
      Object.keys(CHAVES_ENTREGA).forEach(function (key) {
        if (CHAVES_ENTREGA[key] === chave) {
          docIdEncontrado = key;
        }
      });

      if (!docIdEncontrado || (docIdParam && docIdEncontrado !== docIdParam)) {
        showReceiveError('Chave de entrega inválida para este documento.');
        return;
      }

      docRecebido = documentos.find(function (d) { return d.id === docIdEncontrado; }) || null;
      if (!docRecebido) {
        showReceiveError('Documento não encontrado para a chave informada.');
        return;
      }

      if (receberChecklistSection) receberChecklistSection.classList.remove('hidden');
      animarRecepcao();
    });
  }

  if (btnValidar) {
    btnValidar.addEventListener('click', function () {
      var codigo = codigoInput ? codigoInput.value.trim().toUpperCase() : '';

      if (!codigo) {
        showError('Por favor, insira o código de resgate.');
        return;
      }

      if (errorMsg) errorMsg.classList.add('hidden');
      if (checklistSection) checklistSection.classList.add('hidden');

      // Verificar código
      if (typeof CODIGOS_RESGATE === 'undefined') return;

      var docIdEncontrado = null;
      Object.keys(CODIGOS_RESGATE).forEach(function (key) {
        if (CODIGOS_RESGATE[key] === codigo) {
          docIdEncontrado = key;
        }
      });

      if (!docIdEncontrado) {
        showError('Código inválido. Verifique e tente novamente.');
        return;
      }

      docValidado = Array.isArray(documentos) ? documentos.find(function (d) { return d.id === docIdEncontrado; }) : null;

      // Animar checklist
      if (checklistSection) checklistSection.classList.remove('hidden');
      animarChecklist();
    });
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

      setTimeout(function () {
        docRecebido = updateDocumentoById(docRecebido.id, {
          status: 'DISPONIVEL_LEVANTAMENTO'
        }) || docRecebido;
        if (receberChecklistSection) receberChecklistSection.classList.add('hidden');
        if (receberSuccessSection) receberSuccessSection.classList.remove('hidden');
        if (receberSuccessInfo) {
          receberSuccessInfo.textContent = docRecebido.id + ' pronto para ser levantado pelo dono no ponto.';
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

      setTimeout(function () {
        if (docValidado) {
          docValidado = updateDocumentoById(docValidado.id, {
            status: 'ENTREGUE'
          }) || docValidado;
        }
        if (confirmSection) confirmSection.classList.add('hidden');
        if (checklistSection) checklistSection.classList.add('hidden');
        if (successSection) successSection.classList.remove('hidden');
      }, 1000);
    });
  }

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
