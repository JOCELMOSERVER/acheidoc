/* ===========================
   AcheiDoc — Pagamento JS
   =========================== */

(function () {
  Auth.requireAuth();

  var params = new URLSearchParams(window.location.search);
  var docId = params.get('id');
  var utilizadorLogado = typeof Auth !== 'undefined' && typeof Auth.getUser === 'function'
    ? Auth.getUser()
    : null;

  var doc = null;

  function defaultDocImage() {
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="480"><rect width="100%" height="100%" fill="%23e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="28" fill="%236b7280">Documento</text></svg>';
  }

  function toLegacyDoc(item) {
    return {
      id: item.id,
      tipo: item.tipo,
      nomeParcial: item.nome_proprietario || 'Proprietário',
      foto: item.foto_url || defaultDocImage(),
      localParcial: item.provincia || 'Luanda',
      dataCriacao: item.data_publicacao ? String(item.data_publicacao).slice(0, 10) : new Date().toISOString().slice(0, 10),
      status: item.status || 'PUBLICADO',
      taxaKz: 500,
      pontoEntregaId: 1
    };
  }

  function renderDocPagamento() {
    if (!doc) return;
    var taxaEl = document.getElementById('taxaValor');
    if (taxaEl) taxaEl.textContent = doc.taxaKz.toLocaleString('pt-AO') + ' Kz';

    var docTipoEl = document.getElementById('pagDocTipo');
    if (docTipoEl) docTipoEl.textContent = doc.tipo;

    var docNomeEl = document.getElementById('pagDocNome');
    if (docNomeEl) docNomeEl.textContent = doc.nomeParcial;
  }

  (async function loadDoc() {
    if (!docId) return;

    if (!(typeof Api !== 'undefined' && Api.documentos && Api.documentos.detail)) {
      alert('API de documentos indisponível.');
      return;
    }

    try {
      var response = await Api.documentos.detail(docId);
      doc = response && response.documento ? toLegacyDoc(response.documento) : null;
      renderDocPagamento();
    } catch (apiErr) {
      alert('Não foi possível carregar os dados do documento.');
    }
  })();

  // Seleção do método de pagamento
  var methodBtns = document.querySelectorAll('.payment-method-btn');
  var phoneGroup = document.getElementById('phoneGroup');
  var selectedMethod = null;

  methodBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      methodBtns.forEach(function (b) { b.classList.remove('selected'); });
      btn.classList.add('selected');
      selectedMethod = btn.getAttribute('data-method');
      if (phoneGroup) phoneGroup.classList.remove('hidden');

      var phoneLabel = document.getElementById('phoneLabel');
      if (phoneLabel) {
        phoneLabel.textContent = selectedMethod === 'multicaixa'
          ? 'Número Multicaixa Express'
          : 'Número Unitel Money';
      }
    });
  });

  // Confirmar pagamento
  var btnConfirmar = document.getElementById('btnConfirmar');
  var paymentForm = document.getElementById('paymentForm');
  var successSection = document.getElementById('successSection');

  if (btnConfirmar) {
    btnConfirmar.addEventListener('click', async function () {
      if (!selectedMethod) {
        alert('Por favor, seleccione um método de pagamento.');
        return;
      }

      var phoneInput = document.getElementById('phoneInput');
      var phone = phoneInput ? phoneInput.value.trim() : '';
      if (!phone) {
        alert('Por favor, insira o número de telefone.');
        return;
      }

      btnConfirmar.disabled = true;
      btnConfirmar.innerHTML = '<span class="spinner"></span> A processar...';

      setTimeout(async function () {
        var pagamentoCriado = await registarPagamento(phone);
        if (!pagamentoCriado) {
          btnConfirmar.disabled = false;
          btnConfirmar.textContent = 'Confirmar pagamento';
          return;
        }
        showSuccess(pagamentoCriado);
      }, 2000);
    });
  }

  async function registarPagamento(phone) {
    if (!doc) return false;

    if (!(typeof Api !== 'undefined' && Api.pagamentos && Api.pagamentos.create)) {
      alert('API de pagamentos indisponível.');
      return false;
    }

    try {
      return await Api.pagamentos.create({
        doc_id: doc.id,
        telefone: phone,
        valor: doc.taxaKz
      });
    } catch (apiErr) {
      alert(apiErr && apiErr.message ? apiErr.message : 'Falha ao registar pagamento no servidor.');
      return null;
    }
  }

  function showSuccess(payload) {
    if (paymentForm) paymentForm.classList.add('hidden');
    if (successSection) successSection.classList.remove('hidden');

    // Código de resgate
    var codigoEl = document.getElementById('codigoResgate');
    var pagamento = payload && payload.pagamento ? payload.pagamento : null;
    var pontoEntrega = payload && payload.ponto_entrega ? payload.ponto_entrega : null;
    var codigo = payload && payload.codigo_resgate ? String(payload.codigo_resgate) : '';
    if (!pagamento || !codigo || !pontoEntrega || !pontoEntrega.nome || !pontoEntrega.endereco || !pontoEntrega.telefone) {
      alert('Pagamento registado, mas o servidor não devolveu os dados de levantamento necessários.');
      window.location.reload();
      return;
    }
    if (codigoEl) codigoEl.textContent = codigo;

    // Ponto de entrega
    var pontoNome = pontoEntrega.nome;
    var pontoEndereco = pontoEntrega.endereco;
    var pontoHorario = pontoEntrega.horario || '-';
    var pontoTel = pontoEntrega.telefone;
    var pontoAgente = pontoEntrega.agente_nome || '-';

    setEl('successPontoNome', pontoNome);
    setEl('successPontoEndereco', pontoEndereco);
    setEl('successPontoHorario', pontoHorario);
    setEl('successPontoTel', pontoTel);

    // Botão ver instruções
    var btnInstrucoes = document.getElementById('btnInstrucoes');
    if (btnInstrucoes) {
      btnInstrucoes.addEventListener('click', function () {
        var codigoAtual = codigoEl ? codigoEl.textContent : '';
        var qs = new URLSearchParams({
          id: docId || '',
          codigo: codigoAtual,
          pontoNome: pontoNome,
          pontoEndereco: pontoEndereco,
          pontoHorario: pontoHorario,
          pontoTelefone: pontoTel,
          pontoAgente: pontoAgente
        }).toString();
        window.location.assign('ponto-entrega.html?' + qs);
      });
    }

    // Botão copiar código
    var btnCopiar = document.getElementById('btnCopiarCodigo');
    if (btnCopiar && codigoEl) {
      btnCopiar.addEventListener('click', function () {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(codigoEl.textContent).then(function () {
            btnCopiar.textContent = 'Código copiado';
            setTimeout(function () { btnCopiar.textContent = 'Copiar código'; }, 2000);
          });
        } else {
          // Fallback
          var ta = document.createElement('textarea');
          ta.value = codigoEl.textContent;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          btnCopiar.textContent = 'Código copiado';
          setTimeout(function () { btnCopiar.textContent = 'Copiar código'; }, 2000);
        }
      });
    }
  }

  function setEl(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }
})();
