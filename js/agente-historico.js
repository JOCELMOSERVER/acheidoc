/* ===========================
   AcheiDoc — Agente Histórico JS
   =========================== */

(function () {
  // Verificar login
  var agenteLogado = JSON.parse(sessionStorage.getItem('agenteLogado') || 'null');
  if (!agenteLogado) {
    window.location.href = 'login.html';
    return;
  }

  setEl('agenteNome', agenteLogado.nome);

  // Renderizar histórico
  var tabelaBody = document.getElementById('historicoBody');
  if (tabelaBody && typeof HISTORICO_PONTOS !== 'undefined') {
    tabelaBody.innerHTML = HISTORICO_PONTOS.map(function (h) {
      var positivo = h.pontos > 0;
      return `
        <tr>
          <td>${formatDate(h.data)}</td>
          <td>${h.docId}</td>
          <td>${getTipoDoc(h.docId)}</td>
          <td>${h.acao}</td>
          <td style="font-weight:700; color: ${positivo ? 'var(--success)' : 'var(--danger)'};">
            ${positivo ? '+' : ''}${h.pontos}
          </td>
        </tr>`;
    }).join('');

    // Total
    var total = HISTORICO_PONTOS.reduce(function (acc, h) { return acc + h.pontos; }, 0);
    setEl('totalPontosHistorico', total + ' pts');
  }

  // Filtro por mês
  var mesSelect = document.getElementById('mesSelect');
  if (mesSelect) {
    mesSelect.addEventListener('change', function () {
      // Simulação do filtro: sem efeito real nos dados mock
      alert('Filtro por mês: ' + (mesSelect.value || 'Todos os meses'));
    });
  }

  // Exportar (simulado)
  var btnExportar = document.getElementById('btnExportar');
  if (btnExportar) {
    btnExportar.addEventListener('click', function () {
      alert('Exportação iniciada. O ficheiro CSV será gerado em breve.');
    });
  }

  // Logout
  var btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', function () {
      sessionStorage.removeItem('agenteLogado');
      window.location.href = 'login.html';
    });
  }

  function getTipoDoc(docId) {
    if (typeof DOCUMENTOS === 'undefined') return '—';
    var doc = DOCUMENTOS.find(function (d) { return d.id === docId; });
    return doc ? doc.tipo : '—';
  }

  function setEl(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }
})();
