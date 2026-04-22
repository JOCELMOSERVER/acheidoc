/* ===========================
   AcheiDoc — Ponto de Entrega JS
   =========================== */

(function () {
  var params = new URLSearchParams(window.location.search);
  var docId = params.get('id');
  var codigo = params.get('codigo');

  // Mostrar código de resgate
  if (codigo) {
    var codigoEl = document.getElementById('codigoDisplay');
    if (codigoEl) codigoEl.textContent = codigo;
  }

  // Ponto de entrega
  if (docId && typeof DOCUMENTOS !== 'undefined' && typeof PONTOS_ENTREGA !== 'undefined') {
    var doc = DOCUMENTOS.find(function (d) { return d.id === docId; });
    if (doc) {
      var ponto = PONTOS_ENTREGA.find(function (p) { return p.id === doc.pontoEntregaId; });
      if (ponto) {
        setEl('pontoNome', ponto.nome);
        setEl('pontoEndereco', ponto.endereco);
        setEl('pontoHorario', ponto.horario);
        setEl('pontoTelefone', ponto.telefone);
        setEl('pontoAgente', ponto.agente);

        var mapText = document.getElementById('mapText');
        if (mapText) mapText.textContent = 'Mapa — ' + ponto.endereco;

        var btnLigar = document.getElementById('btnLigar');
        if (btnLigar) {
          btnLigar.href = 'tel:' + ponto.telefone.replace(/\s/g, '');
        }
      }
    }
  } else {
    // Padrão: primeiro ponto de entrega
    if (typeof PONTOS_ENTREGA !== 'undefined' && PONTOS_ENTREGA.length > 0) {
      var ponto = PONTOS_ENTREGA[0];
      setEl('pontoNome', ponto.nome);
      setEl('pontoEndereco', ponto.endereco);
      setEl('pontoHorario', ponto.horario);
      setEl('pontoTelefone', ponto.telefone);
      setEl('pontoAgente', ponto.agente);

      var mapText = document.getElementById('mapText');
      if (mapText) mapText.textContent = 'Mapa — ' + ponto.endereco;

      var btnLigar = document.getElementById('btnLigar');
      if (btnLigar) {
        btnLigar.href = 'tel:' + ponto.telefone.replace(/\s/g, '');
      }
    }
  }

  function setEl(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }
})();
