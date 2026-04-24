/* ===========================
   AcheiDoc — Ponto de Entrega JS
   =========================== */

(function () {
  var params = new URLSearchParams(window.location.search);
  var docId = params.get('id');
  var codigo = params.get('codigo');
  var pontoNome = params.get('pontoNome') || '';
  var pontoEndereco = params.get('pontoEndereco') || '';
  var pontoHorario = params.get('pontoHorario') || '';
  var pontoTelefone = params.get('pontoTelefone') || '';
  var pontoAgente = params.get('pontoAgente') || '';
  var errorBox = document.getElementById('codigoDisplay');

  // Mostrar código de resgate
  if (codigo) {
    var codigoEl = document.getElementById('codigoDisplay');
    if (codigoEl) codigoEl.textContent = codigo;
  }

  var mapText = document.getElementById('mapText');
  var btnLigar = document.getElementById('btnLigar');

  if (docId && typeof Api !== 'undefined' && Api.pontosEntrega && Api.pontosEntrega.byDocumento) {
    Api.pontosEntrega.byDocumento(docId).then(function (response) {
      var documento = response && response.documento ? response.documento : null;
      var ponto = response && response.ponto_entrega ? response.ponto_entrega : null;
      if (!documento || !documento.codigo_resgate || !ponto || !ponto.nome || !ponto.endereco || !ponto.telefone) {
        throw new Error('Dados de levantamento indisponíveis.');
      }

      setEl('codigoDisplay', documento.codigo_resgate);
      setEl('pontoNome', ponto.nome);
      setEl('pontoEndereco', ponto.endereco);
      setEl('pontoHorario', ponto.horario || '-');
      setEl('pontoTelefone', ponto.telefone);
      setEl('pontoAgente', ponto.agente_nome || '-');
      if (mapText) mapText.textContent = 'Mapa — ' + ponto.endereco;
      if (btnLigar) btnLigar.href = 'tel:' + String(ponto.telefone).replace(/\s/g, '');
    }).catch(function (err) {
      renderError(err && err.message ? err.message : 'Falha ao carregar dados do ponto de entrega.');
    });
    return;
  }

  if (codigo && pontoNome && pontoEndereco && pontoTelefone) {
    setEl('codigoDisplay', codigo);
    setEl('pontoNome', pontoNome);
    setEl('pontoEndereco', pontoEndereco);
    setEl('pontoHorario', pontoHorario || '-');
    setEl('pontoTelefone', pontoTelefone);
    setEl('pontoAgente', pontoAgente || '-');
    if (mapText) mapText.textContent = 'Mapa — ' + pontoEndereco;
    if (btnLigar) btnLigar.href = 'tel:' + pontoTelefone.replace(/\s/g, '');
    return;
  }

  renderError('Dados reais do ponto de entrega não foram fornecidos.');

  function setEl(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function renderError(message) {
    setEl('pontoNome', 'Indisponível');
    setEl('pontoEndereco', message);
    setEl('pontoHorario', '-');
    setEl('pontoTelefone', '-');
    setEl('pontoAgente', '-');
    if (mapText) mapText.textContent = message;
    if (btnLigar) btnLigar.removeAttribute('href');
  }
})();
