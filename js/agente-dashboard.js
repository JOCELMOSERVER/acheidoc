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

  setEl('agentePonto', agenteLogado.pontoNome || '');

  setEl('agentePontos', agenteLogado.pontos || 0);
  setEl('agentePontosMes', '0 pts');

  // Documentos aguardando recepção física pelo agente (PUBLICADO)
  var docsReceberBody = document.getElementById('docsReceberBody');

  // Documentos no ponto a aguardar pagamento do dono (AGUARDANDO_ENTREGA)
  var docsNoPontoBody = document.getElementById('docsNoPontoBody');

  // Documentos prontos para entrega ao dono (DISPONIVEL_LEVANTAMENTO)
  var tabelaBody = document.getElementById('docsTabelaBody');
  var dashboardNotice = document.getElementById('agentDashboardNotice');

  // Pesquisar documento
  var searchInput = document.getElementById('searchDoc');
  var searchBtn = document.getElementById('btnSearchDoc');
  var searchResult = document.getElementById('searchResult');

  function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
  }

  function normalizeCode(value) {
    return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  if (searchBtn && searchInput && searchResult) {
    searchBtn.addEventListener('click', async function () {
      var q = normalizeText(searchInput.value);
      var qCode = normalizeCode(searchInput.value);
      if (!q) return;

      var found = documentos.find(function (d) {
        return normalizeText(d.id) === q ||
          normalizeCode(d.id) === qCode ||
          normalizeCode(d.codigoResgate) === qCode ||
          normalizeCode(d.chaveEntrega) === qCode ||
          normalizeText(d.nomeParcial).includes(q) ||
          normalizeText(d.nomeCompleto).includes(q);
      });

      if (!found && qCode && typeof Api !== 'undefined' && Api.documentos && Api.documentos.agenteByCodigo) {
        try {
          var response = await Api.documentos.agenteByCodigo(qCode);
          if (response && response.documento) {
            found = toLegacyDoc(response.documento);
            if (!documentos.find(function (d) { return d.id === found.id; })) {
              documentos.push(found);
              renderTabelas();
            }
          }
        } catch (err) {
          found = null;
        }
      }

      if (found) {
        var actionHtml = '';
        if (found.status === 'PUBLICADO') {
          actionHtml = `<a href="validar.html?id=${found.id}&flow=receber" class="btn btn-primary btn-sm">Receber no ponto</a>`;
        } else if (found.status === 'DISPONIVEL_LEVANTAMENTO') {
          actionHtml = `<a href="validar.html?id=${found.id}&flow=entregar" class="btn btn-success btn-sm">Entregar ao dono</a>`;
        } else if (found.status === 'AGUARDANDO_ENTREGA') {
          actionHtml = `<span class="badge badge-aguardando">No ponto — a aguardar pagamento do dono</span>`;
        }
        searchResult.innerHTML = buildDocCard(found, '../') + (actionHtml ? `
          <div style="margin-top:0.75rem; display:flex; justify-content:flex-end;">${actionHtml}</div>` : '');
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
      nomeParcial: item.nome_proprietario || '',
      nomeCompleto: item.nome_proprietario || '',
      status: item.status || '',
      dataCriacao: (item.criado_em || item.data_publicacao || '').slice(0, 10),
      encontradoPor: item.publicado_por_nome || '',
      codigoResgate: item.codigo_resgate || '',
      chaveEntrega: item.chave_entrega || ''
    };
  }

  function renderTabelas() {
    var docsReceberCount = documentos.filter(function (d) { return d.status === 'PUBLICADO'; }).length;
    var docsEntregarCount = documentos.filter(function (d) { return d.status === 'DISPONIVEL_LEVANTAMENTO'; }).length;
    var currentMonth = new Date().toISOString().slice(0, 7);
    var pontosMes = documentos.filter(function (d) {
      return d.status === 'ENTREGUE' && String(d.dataCriacao || '').slice(0, 7) === currentMonth;
    }).length * 30;
    setEl('totalReceber', docsReceberCount);
    setEl('totalDocs', docsEntregarCount);
    setEl('agentePontosMes', pontosMes + ' pts');

    if (docsReceberBody) {
      var docsReceber = documentos.filter(function (d) { return d.status === 'PUBLICADO'; });
      if (!docsReceber.length) {
        docsReceberBody.innerHTML = '<tr><td colspan="8" class="text-center" style="padding: 2rem; color: var(--text-gray);">Nenhum documento pendente de recepção.</td></tr>';
      } else {
        docsReceberBody.innerHTML = docsReceber.map(function (d) {
          return '<tr>' +
            '<td><code>' + d.id + '</code></td>' +
            '<td>' + d.tipo + '</td>' +
            '<td>' + d.nomeParcial + '</td>' +
            '<td>' + (d.encontradoPor || '') + '</td>' +
            '<td><code style="white-space:nowrap; font-size:0.8rem;">' + (d.chaveEntrega || '') + '</code></td>' +
            '<td><span class="badge ' + getStatusBadgeClass(d.status) + '">' + getStatusLabel(d.status) + '</span></td>' +
            '<td>' + formatDate(d.dataCriacao) + '</td>' +
            '<td><a href="validar.html?id=' + d.id + '&flow=receber" class="btn btn-primary btn-sm">Receber documento</a></td>' +
            '</tr>';
        }).join('');
      }
    }

    if (docsNoPontoBody) {
      var docsNoPonto = documentos.filter(function (d) { return d.status === 'AGUARDANDO_ENTREGA'; });
      if (!docsNoPonto.length) {
        docsNoPontoBody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding: 2rem; color: var(--text-gray);">Nenhum documento aguarda pagamento do dono.</td></tr>';
      } else {
        docsNoPontoBody.innerHTML = docsNoPonto.map(function (d) {
          return '<tr>' +
            '<td><code>' + d.id + '</code></td>' +
            '<td>' + d.tipo + '</td>' +
            '<td>' + d.nomeParcial + '</td>' +
            '<td><code style="white-space:nowrap; font-size:0.8rem;">' + (d.chaveEntrega || '') + '</code></td>' +
            '<td><span class="badge badge-aguardando">A aguardar pagamento</span></td>' +
            '<td>' + formatDate(d.dataCriacao) + '</td>' +
            '</tr>';
        }).join('');
      }
    }

    if (tabelaBody) {
      var docsEntregar = documentos.filter(function (d) { return d.status === 'DISPONIVEL_LEVANTAMENTO'; });
      if (!docsEntregar.length) {
        tabelaBody.innerHTML = '<tr><td colspan="7" class="text-center" style="padding: 2rem; color: var(--text-gray);">Nenhum documento pronto para entrega.</td></tr>';
      } else {
        tabelaBody.innerHTML = docsEntregar.map(function (d) {
          return '<tr>' +
            '<td><code>' + d.id + '</code></td>' +
            '<td>' + d.tipo + '</td>' +
            '<td>' + d.nomeParcial + '</td>' +
            '<td><code style="white-space:nowrap; font-size:0.8rem;">' + (d.codigoResgate || '') + '</code></td>' +
            '<td><span class="badge ' + getStatusBadgeClass(d.status) + '">' + getStatusLabel(d.status) + '</span></td>' +
            '<td>' + formatDate(d.dataCriacao) + '</td>' +
            '<td><a href="validar.html?id=' + d.id + '&flow=entregar" class="btn btn-success btn-sm">Entregar ao dono</a></td>' +
            '</tr>';
        }).join('');
      }
    }
  }

  async function loadDocumentos() {
    if (dashboardNotice && !agenteLogado.pontoId) {
      dashboardNotice.textContent = 'Este agente ainda não tem ponto de entrega atribuído. Sem essa atribuição, o dashboard não consegue listar documentos do ponto.';
      dashboardNotice.classList.remove('hidden');
    }

    if (!(typeof Api !== 'undefined' && Api.documentos && Api.documentos.agenteLista)) {
      alert('API de documentos indisponível.');
      return;
    }

    try {
      var response = await Api.documentos.agenteLista();
      documentos = (response && response.documentos ? response.documentos : []).map(toLegacyDoc);
      renderTabelas();
    } catch (apiErr) {
      alert(apiErr && apiErr.message ? apiErr.message : 'Falha ao carregar documentos.');
    }
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
