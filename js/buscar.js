/* ===========================
   AcheiDoc — Buscar JS
   =========================== */

(function () {
  Auth.requireAuth();

  var searchInput = document.getElementById('searchInput');
  var tipoSelect = document.getElementById('tipoSelect');
  var localSelect = document.getElementById('localSelect');
  var filterBtn = document.getElementById('filterBtn');
  var resultsGrid = document.getElementById('resultsGrid');
  var resultsCount = document.getElementById('resultsCount');

  // Pré-preencher com parâmetro ?q=
  var params = new URLSearchParams(window.location.search);
  var qParam = params.get('q');
  if (qParam && searchInput) {
    searchInput.value = qParam;
  }

  function renderResults(docs) {
    if (!resultsGrid) return;
    if (docs.length === 0) {
      resultsGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1">
          <div class="empty-icon">Sem resultados</div>
          <h3>Nenhum documento encontrado</h3>
          <p>Tente ajustar os filtros ou pesquise por outro nome/tipo.</p>
        </div>`;
      if (resultsCount) resultsCount.textContent = '0 resultados';
      return;
    }
    resultsGrid.innerHTML = docs.map(function (d) { return buildDocCard(d, ''); }).join('');
    if (resultsCount) resultsCount.textContent = docs.length + ' resultado(s) encontrado(s)';
  }

  function applyFilters() {
    if (typeof DOCUMENTOS === 'undefined') return;

    var text = (searchInput ? searchInput.value.trim().toLowerCase() : '');
    var tipo = (tipoSelect ? tipoSelect.value : '');
    var local = (localSelect ? localSelect.value : '');

    var filtered = DOCUMENTOS.filter(function (d) {
      var matchText = !text ||
        d.nomeParcial.toLowerCase().includes(text) ||
        d.tipo.toLowerCase().includes(text) ||
        d.localParcial.toLowerCase().includes(text);

      var matchTipo = !tipo || d.tipo === tipo;

      var matchLocal = !local ||
        d.localParcial.toLowerCase().includes(local.toLowerCase()) ||
        d.localEncontrado.toLowerCase().includes(local.toLowerCase());

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
