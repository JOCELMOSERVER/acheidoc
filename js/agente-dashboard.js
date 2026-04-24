/* ===========================
   AcheiDoc — Agente Dashboard JS
   =========================== */

(function () {
  // Verificar login do agente
  var agenteLogado = JSON.parse(sessionStorage.getItem('agenteLogado') || 'null');
  if (!agenteLogado) {
    window.location.href = 'login.html';
    return;
  }

  // Cabeçalho
  setEl('agenteNome', agenteLogado.nome);
  var documentos = [];

  if (typeof PONTOS_ENTREGA !== 'undefined') {
    var ponto = PONTOS_ENTREGA.find(function (p) { return p.id === agenteLogado.pontoId; });
    if (ponto) {
      setEl('agentePonto', ponto.nome);
    }
  }

  setEl('agentePontos', agenteLogado.pontos || 0);
  setEl('agentePontosMes', '+120 pts');

  // Documentos aguardando recepção física pelo agente
  var docsReceberBody = document.getElementById('docsReceberBody');

  // Documentos no ponto prontos para entrega ao dono
  var tabelaBody = document.getElementById('docsTabelaBody');

  // Pesquisar documento
  var searchInput = document.getElementById('searchDoc');
  var searchBtn = document.getElementById('btnSearchDoc');
  var searchResult = document.getElementById('searchResult');

  if (searchBtn && searchInput && searchResult) {
    searchBtn.addEventListener('click', function () {
      var q = searchInput.value.trim().toLowerCase();
      if (!q) return;

      var found = documentos.find(function (d) {
        return String(d.id || '').toLowerCase() === q ||
          String(d.nomeParcial || '').toLowerCase().includes(q) ||
          String(d.nomeCompleto || '').toLowerCase().includes(q);
      });

      if (found) {
        var flow = found.status === 'PUBLICADO' ? 'receber' : 'entregar';
        var actionLabel = found.status === 'PUBLICADO' ? 'Receber no ponto' : 'Validar entrega';
        searchResult.innerHTML = buildDocCard(found, '../') + `
          <div style="margin-top:0.75rem; display:flex; justify-content:flex-end;">
            <a href="validar.html?id=${found.id}&flow=${flow}" class="btn btn-primary btn-sm">${actionLabel}</a>
          </div>`;
        searchResult.classList.remove('hidden');
      } else {
        searchResult.innerHTML = `<div class="alert alert-danger">Documento não encontrado.</div>`;
        searchResult.classList.remove('hidden');
      }
    });

    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') searchBtn.click();
    });
  }

  function toLegacyDoc(item) {
    return {
      id: item.id,
      tipo: item.tipo,
      nomeParcial: item.nome_proprietario || 'Proprietário',
      nomeCompleto: item.nome_proprietario || 'Proprietário',
      status: item.status || 'PENDENTE',
      dataCriacao: (item.criado_em || item.data_publicacao || '').slice(0, 10),
      encontradoPor: item.publicado_por_nome || 'Utilizador'
    };
  }

  function renderTabelas() {
    if (docsReceberBody) {
      var docsReceber = documentos.filter(function (d) { return d.status === 'PUBLICADO'; });
      if (!docsReceber.length) {
        docsReceberBody.innerHTML = '<tr><td colspan="7" class="text-center" style="padding: 2rem; color: var(--text-gray);">Nenhum documento pendente de recepção.</td></tr>';
      } else {
        docsReceberBody.innerHTML = docsReceber.map(function (d) {
          return '<tr>' +
            '<td><code>' + d.id + '</code></td>' +
            '<td>' + d.tipo + '</td>' +
            '<td>' + d.nomeParcial + '</td>' +
            '<td>' + (d.encontradoPor || '—') + '</td>' +
            '<td><span class="badge ' + getStatusBadgeClass(d.status) + '">' + getStatusLabel(d.status) + '</span></td>' +
            '<td>' + formatDate(d.dataCriacao) + '</td>' +
            '<td><a href="validar.html?id=' + d.id + '&flow=receber" class="btn btn-primary btn-sm">Receber documento</a></td>' +
            '</tr>';
        }).join('');
      }
    }

    if (tabelaBody) {
      var docsEntregar = documentos.filter(function (d) { return d.status === 'DISPONIVEL_LEVANTAMENTO'; });
      if (!docsEntregar.length) {
        tabelaBody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding: 2rem; color: var(--text-gray);">Nenhum documento pronto para entrega.</td></tr>';
      } else {
        tabelaBody.innerHTML = docsEntregar.map(function (d) {
          return '<tr>' +
            '<td><code>' + d.id + '</code></td>' +
            '<td>' + d.tipo + '</td>' +
            '<td>' + d.nomeParcial + '</td>' +
            '<td><span class="badge ' + getStatusBadgeClass(d.status) + '">' + getStatusLabel(d.status) + '</span></td>' +
            '<td>' + formatDate(d.dataCriacao) + '</td>' +
            '<td><a href="validar.html?id=' + d.id + '&flow=entregar" class="btn btn-success btn-sm">Entregar ao dono</a></td>' +
            '</tr>';
        }).join('');
      }
    }
  }

  async function loadDocumentos() {
    if (typeof Api !== 'undefined' && Api.documentos && Api.documentos.agenteLista) {
      try {
        var response = await Api.documentos.agenteLista();
        documentos = (response && response.documentos ? response.documentos : []).map(toLegacyDoc);
        renderTabelas();
        return;
      } catch (apiErr) {
        // fallback local
      }
    }

    documentos = typeof getDocumentosData === 'function' ? getDocumentosData() : DOCUMENTOS;
    if (!Array.isArray(documentos)) documentos = [];
    renderTabelas();
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

  loadDocumentos();

  function setEl(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }
})();
