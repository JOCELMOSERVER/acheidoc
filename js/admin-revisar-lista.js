/* ===========================
   AcheiDoc — Admin Revisar Lista JS
   =========================== */

(function () {
  var adminLogado = JSON.parse(sessionStorage.getItem('adminLogado') || 'null');
  if (!adminLogado) {
    window.location.href = 'login.html';
    return;
  }

  var documentos = [];
  var filtroAtual = 'PENDENTE';
  var tabelaBody = document.getElementById('tabelaBody');

  function toLegacyDoc(item) {
    return {
      id: item.id,
      tipo: item.tipo,
      nomeParcial: item.nome_proprietario || 'Proprietário',
      localParcial: item.provincia || 'Luanda',
      risco: item.risco || 'MEDIO',
      status: item.status || 'PENDENTE',
      dataCriacao: (item.criado_em || item.data_publicacao || '').slice(0, 10)
    };
  }

  function renderTabela() {
    if (!tabelaBody) return;

    var filtered = documentos.filter(function (d) {
      if (filtroAtual === 'TODOS') return true;
      return d.status === filtroAtual;
    });

    if (!filtered.length) {
      tabelaBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-gray);">Nenhum documento encontrado.</td></tr>';
      return;
    }

    tabelaBody.innerHTML = filtered.map(function (d) {
      var riscoClass = (typeof getRiscoBadgeClass !== 'undefined') ? getRiscoBadgeClass(d.risco) : 'badge-pendente';
      var riscoLabel = (typeof getRiscoLabel !== 'undefined') ? getRiscoLabel(d.risco) : d.risco;
      var dataFormatada = (typeof formatDate !== 'undefined') ? formatDate(d.dataCriacao) : d.dataCriacao;
      
      return '<tr style="border-bottom:1px solid var(--border);">' +
        '<td style="padding:0.75rem;"><code>' + d.id.slice(0, 8) + '</code></td>' +
        '<td style="padding:0.75rem;">' + d.tipo + '</td>' +
        '<td style="padding:0.75rem;">' + d.nomeParcial + '</td>' +
        '<td style="padding:0.75rem;">' + d.localParcial + '</td>' +
        '<td style="padding:0.75rem;"><span class="badge ' + riscoClass + '">' + riscoLabel + '</span></td>' +
        '<td style="padding:0.75rem;">' + dataFormatada + '</td>' +
        '<td style="padding:0.75rem;"><a href="revisar.html?id=' + encodeURIComponent(d.id) + '" class="btn btn-primary btn-sm">Revisar</a></td>' +
        '</tr>';
    }).join('');
  }

  function bindFiltros() {
    document.querySelectorAll('.filter-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.filter-tab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        filtroAtual = tab.getAttribute('data-filter') || 'PENDENTE';
        renderTabela();
      });
    });
  }

  function bindLogout() {
    var btnLogout = document.getElementById('btnLogout');
    if (!btnLogout) return;
    btnLogout.addEventListener('click', function () {
      sessionStorage.removeItem('adminLogado');
      if (typeof Api !== 'undefined' && Api.clearToken) Api.clearToken();
      window.location.href = 'login.html';
    });
  }

  (async function loadDocumentos() {
    if (!(typeof Api !== 'undefined' && Api.documentos && Api.documentos.adminList)) {
      if (tabelaBody) {
        tabelaBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--danger);">API de documentos indisponível.</td></tr>';
      }
      return;
    }

    try {
      // Debug: log that we're loading
      console.log('Loading documents from API...');
      
      var response = await Api.documentos.adminList({ page: 1, limit: 1000 });
      
      // Debug: log the response
      console.log('API Response:', response);
      
      // Parse documents
      var rawDocs = response && response.documentos ? response.documentos : [];
      if (!Array.isArray(rawDocs)) {
        rawDocs = [];
      }
      
      documentos = rawDocs.map(toLegacyDoc);
      console.log('Parsed documents:', documentos);
      
      renderTabela();
    } catch (err) {
      console.error('Error loading documents:', err);
      if (tabelaBody) {
        var errorMsg = err && err.message ? err.message : 'Falha ao carregar documentos';
        if (err && err.status) {
          errorMsg += ' (HTTP ' + err.status + ')';
        }
        tabelaBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--danger);">' + errorMsg + '</td></tr>';
      }
    }
  })();

  bindFiltros();
  bindLogout();
})();
