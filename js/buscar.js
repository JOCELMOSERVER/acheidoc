/* ===========================
   AcheiDoc — Buscar JS
   =========================== */

(function () {
  // Busca é pública — não requer autenticação

  var searchInput  = document.getElementById('searchInput');
  var tipoSelect   = document.getElementById('tipoSelect');
  var localSelect  = document.getElementById('localSelect');
  var filterBtn    = document.getElementById('filterBtn');
  var resultsGrid  = document.getElementById('resultsGrid');
  var resultsCount = document.getElementById('resultsCount');
  var emptyState   = document.getElementById('emptyState');

  // Pré-preencher com parâmetro ?q=
  var params = new URLSearchParams(window.location.search);
  var qParam = params.get('q');
  if (qParam && searchInput) {
    searchInput.value = qParam;
  }

  function showEmpty() {
    if (resultsGrid)  resultsGrid.innerHTML = '';
    if (emptyState)   emptyState.style.display = 'block';
    if (resultsCount) resultsCount.textContent = '0 resultados';
  }

  function renderResults(docs) {
    if (!resultsGrid) return;

    if (docs.length === 0) {
      showEmpty();
      return;
    }

    // Tem resultados — esconder estado vazio e mostrar grid
    if (emptyState) emptyState.style.display = 'none';
    resultsGrid.innerHTML = docs.map(function (d) { return buildDocCard(d, ''); }).join('');
    if (resultsCount) resultsCount.textContent = docs.length + ' resultado(s) encontrado(s)';
  }

  function toLegacyDoc(item) {
    if (!item || !item.id || !item.tipo || !item.nome_proprietario || !item.provincia || !item.data_publicacao) {
      return null;
    }

    var rawStatus = item.status;
    var hasCodigoResgate = !!String(item.codigo_resgate || '').trim();
    var visualStatus = rawStatus;
    if (rawStatus === 'DISPONIVEL_LEVANTAMENTO' && !hasCodigoResgate) {
      visualStatus = 'DISPONIVEL_PAGAMENTO';
    }

    return {
      id: item.id,
      tipo: item.tipo,
      nomeParcial: item.nome_proprietario,
      foto: item.foto_url,
      localParcial: item.provincia,
      localEncontrado: item.provincia,
      dataCriacao: String(item.data_publicacao).slice(0, 10),
      status: visualStatus
    };
  }

  async function applyFilters() {
    var text  = (searchInput ? searchInput.value.trim().toLowerCase() : '');
    var tipo  = (tipoSelect  ? tipoSelect.value  : '');
    var local = (localSelect ? localSelect.value : '');

    if (!(typeof Api !== 'undefined' && Api.documentos && Api.documentos.list)) {
      showEmpty();
      return;
    }

    var documentos = null;
    try {
      var response = await Api.documentos.list({
        search: text  || '',
        tipo:   tipo  || '',
        provincia: local || '',
        page:  1,
        limit: 50
      });
      documentos = (response && response.documentos ? response.documentos : []).map(toLegacyDoc).filter(Boolean);
    } catch (apiErr) {
      showEmpty();
      return;
    }

    if (!Array.isArray(documentos)) return;

    var filtered = documentos.filter(function (d) {
      var matchText = !text ||
        String(d.nomeParcial   || '').toLowerCase().includes(text) ||
        String(d.tipo          || '').toLowerCase().includes(text) ||
        String(d.localParcial  || '').toLowerCase().includes(text);

      var matchTipo  = !tipo  || d.tipo === tipo;

      var matchLocal = !local ||
        String(d.localParcial    || '').toLowerCase().includes(local.toLowerCase()) ||
        String(d.localEncontrado || '').toLowerCase().includes(local.toLowerCase());

      return matchText && matchTipo && matchLocal;
    });

    renderResults(filtered);
  }

  if (filterBtn) {
    filterBtn.addEventListener('click', function (e) {
      e.preventDefault();
      applyFilters();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); applyFilters(); }
    });
  }

  // Executar filtros iniciais
  applyFilters();
})();
