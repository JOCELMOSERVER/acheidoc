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

  var tabelaBody = document.getElementById('historicoBody');

  function renderHistorico(lista) {
    if (!tabelaBody) return;
    tabelaBody.innerHTML = lista.map(function (h) {
      var positivo = Number(h.pontos || 0) > 0;
      return '<tr>' +
        '<td>' + formatDate(h.data) + '</td>' +
        '<td>' + h.docId + '</td>' +
        '<td>' + (h.tipoDoc || getTipoDoc(h.docId)) + '</td>' +
        '<td>' + h.acao + '</td>' +
        '<td style="font-weight:700; color: ' + (positivo ? 'var(--success)' : 'var(--danger)') + ';">' +
        (positivo ? '+' : '') + h.pontos +
        '</td>' +
        '</tr>';
    }).join('');

    var total = lista.reduce(function (acc, h) { return acc + Number(h.pontos || 0); }, 0);
    setEl('totalPontosHistorico', total + ' pts');
  }

  (async function loadHistorico() {
    if (typeof Api !== 'undefined' && Api.documentos && Api.documentos.agenteLista) {
      try {
        var response = await Api.documentos.agenteLista({ status: 'ENTREGUE' });
        var listaApi = (response && response.documentos ? response.documentos : []).map(function (d) {
          return {
            data: (d.criado_em || d.data_publicacao || '').slice(0, 10),
            docId: d.id,
            tipoDoc: d.tipo,
            acao: 'Entrega confirmada ao dono',
            pontos: 10
          };
        });
        renderHistorico(listaApi);
        return;
      } catch (err) {
        // fallback local
      }
    }

    if (typeof HISTORICO_PONTOS !== 'undefined') {
      renderHistorico(HISTORICO_PONTOS);
    }
  })();

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
      if (typeof Api !== 'undefined' && Api.clearToken) Api.clearToken();
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
