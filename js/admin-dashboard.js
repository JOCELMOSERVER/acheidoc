/* ===========================
   AcheiDoc — Admin Dashboard JS
   =========================== */

(function () {
  var adminLogado = JSON.parse(sessionStorage.getItem('adminLogado') || 'null');
  if (!adminLogado) {
    window.location.href = 'login.html';
    return;
  }

  setEl('adminNome', adminLogado.nome);

  var filtroAtual = 'TODOS';
  var documentos = [];

  // Tabela
  var tabelaBody = document.getElementById('tabelaBody');

  function toLegacyDoc(item) {
    return {
      id: item.id,
      tipo: item.tipo,
      nomeParcial: item.nome_proprietario || 'Proprietário',
      risco: item.risco || 'MEDIO',
      dataCriacao: (item.criado_em || item.data_publicacao || '').slice(0, 10),
      status: item.status || 'PENDENTE'
    };
  }

  function renderResumo() {
    var contagemAlto = 0;
    var contagemMedio = 0;
    var contagemBaixo = 0;
    var aprovados = 0;

    documentos.forEach(function (d) {
      if (d.risco === 'ALTO') contagemAlto++;
      else if (d.risco === 'MEDIO') contagemMedio++;
      else if (d.risco === 'BAIXO') contagemBaixo++;
      if (d.status === 'PUBLICADO') aprovados++;
    });

    setEl('countAlto', contagemAlto);
    setEl('countMedio', contagemMedio);
    setEl('countBaixo', contagemBaixo);
    setEl('countAprovados', aprovados);
  }

  function renderTabela(filtro) {
    if (!tabelaBody || !Array.isArray(documentos)) return;

    var docs = documentos.filter(function (d) {
      if (filtro === 'TODOS') return true;
      return d.risco === filtro;
    });

    if (docs.length === 0) {
      tabelaBody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding:2rem; color:var(--text-gray);">Nenhum documento encontrado.</td></tr>`;
      return;
    }

    tabelaBody.innerHTML = docs.map(function (d) {
      var riscoClass = d.risco === 'ALTO' ? 'risco-alto' : d.risco === 'MEDIO' ? 'risco-medio' : '';
      return `
        <tr class="${riscoClass}">
          <td><code>${d.id}</code></td>
          <td>${d.tipo}</td>
          <td>${d.nomeParcial}</td>
          <td><span class="badge ${getRiscoBadgeClass(d.risco)}">${getRiscoLabel(d.risco)}</span></td>
          <td>${formatDate(d.dataCriacao)}</td>
          <td><span class="badge ${getStatusBadgeClass(d.status)}">${getStatusLabel(d.status)}</span></td>
          <td>
            <a href="revisar.html?id=${d.id}" class="btn btn-primary btn-sm">Revisar</a>
          </td>
        </tr>`;
    }).join('');
  }

  // Tabs de filtro
  var filterTabs = document.querySelectorAll('.filter-tab');
  filterTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      filterTabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      filtroAtual = tab.getAttribute('data-filter') || 'TODOS';
      renderTabela(filtroAtual);
    });
  });

  // Logout
  var btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', function () {
      sessionStorage.removeItem('adminLogado');
      window.location.href = 'login.html';
    });
  }

  async function loadData() {
    if (typeof Api !== 'undefined' && Api.documentos && Api.documentos.adminList) {
      try {
        var response = await Api.documentos.adminList({ page: 1, limit: 200 });
        documentos = (response && response.documentos ? response.documentos : []).map(toLegacyDoc);
        renderResumo();
        renderTabela(filtroAtual);
        return;
      } catch (apiErr) {
        // fallback local
      }
    }

    documentos = typeof getDocumentosData === 'function' ? getDocumentosData() : DOCUMENTOS;
    if (!Array.isArray(documentos)) documentos = [];
    renderResumo();
    renderTabela(filtroAtual);
  }

  loadData();

  function setEl(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }
})();
