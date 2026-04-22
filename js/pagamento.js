/* ===========================
   AcheiDoc — Pagamento JS
   =========================== */

(function () {
  var params = new URLSearchParams(window.location.search);
  var docId = params.get('id');

  var doc = null;
  if (docId && typeof DOCUMENTOS !== 'undefined') {
    doc = DOCUMENTOS.find(function (d) { return d.id === docId; });
  }

  // Exibir valor da taxa
  if (doc) {
    var taxaEl = document.getElementById('taxaValor');
    if (taxaEl) taxaEl.textContent = doc.taxaKz.toLocaleString('pt-AO') + ' Kz';

    var docTipoEl = document.getElementById('pagDocTipo');
    if (docTipoEl) docTipoEl.textContent = doc.tipo;

    var docNomeEl = document.getElementById('pagDocNome');
    if (docNomeEl) docNomeEl.textContent = doc.nomeParcial;
  }

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
    btnConfirmar.addEventListener('click', function () {
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

      setTimeout(function () {
        showSuccess();
      }, 2000);
    });
  }

  function showSuccess() {
    if (paymentForm) paymentForm.classList.add('hidden');
    if (successSection) successSection.classList.remove('hidden');

    // Código de resgate
    var codigoEl = document.getElementById('codigoResgate');
    var codigo = '';
    if (docId && typeof CODIGOS_RESGATE !== 'undefined' && CODIGOS_RESGATE[docId]) {
      codigo = CODIGOS_RESGATE[docId];
    } else {
      // Gerar código aleatório
      codigo = Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    if (codigoEl) codigoEl.textContent = codigo;

    // Ponto de entrega
    if (doc && typeof PONTOS_ENTREGA !== 'undefined') {
      var ponto = PONTOS_ENTREGA.find(function (p) { return p.id === doc.pontoEntregaId; });
      if (ponto) {
        setEl('successPontoNome', ponto.nome);
        setEl('successPontoEndereco', ponto.endereco);
        setEl('successPontoHorario', ponto.horario);
        setEl('successPontoTel', ponto.telefone);
      }
    }

    // Botão ver instruções
    var btnInstrucoes = document.getElementById('btnInstrucoes');
    if (btnInstrucoes) {
      btnInstrucoes.addEventListener('click', function () {
        var url = 'ponto-entrega.html';
        if (docId) {
          var codigo = codigoEl ? codigoEl.textContent : '';
          url += '?id=' + encodeURIComponent(docId) + '&codigo=' + encodeURIComponent(codigo);
        }
        window.location.assign(url);
      });
    }

    // Botão copiar código
    var btnCopiar = document.getElementById('btnCopiarCodigo');
    if (btnCopiar && codigoEl) {
      btnCopiar.addEventListener('click', function () {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(codigoEl.textContent).then(function () {
            btnCopiar.textContent = '✅ Copiado!';
            setTimeout(function () { btnCopiar.textContent = '📋 Copiar Código'; }, 2000);
          });
        } else {
          // Fallback
          var ta = document.createElement('textarea');
          ta.value = codigoEl.textContent;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          btnCopiar.textContent = '✅ Copiado!';
          setTimeout(function () { btnCopiar.textContent = '📋 Copiar Código'; }, 2000);
        }
      });
    }
  }

  function setEl(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }
})();
