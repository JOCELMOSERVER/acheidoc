/* ===========================
   AcheiDoc — Meus Achados JS
   =========================== */

(function () {
  Auth.requireAuth();

  var tabelaBody = document.getElementById('achadosTabela');
  var filterTabs = document.querySelectorAll('.filter-tab');
  var filtroAtual = '';
  var docs = [];

  function getStatusBadgeClass(status) {
    if (status === 'PUBLICADO') return 'badge-entregue';
    if (status === 'PENDENTE') return 'badge-aguardando';
    if (status === 'ENTREGUE') return 'badge-entregue';
    if (status === 'REJEITADO') return 'badge-rejeitado';
    return 'badge-pendente';
  }

  function getStatusLabel(status) {
    if (status === 'AGUARDANDO_ENTREGA') return 'Aguardando Entrega';
    if (status === 'DISPONIVEL_LEVANTAMENTO') return 'No ponto';
    if (status === 'CORRECAO_SOLICITADA') return 'Correcao Solicitada';
    return status || 'PENDENTE';
  }

  function formatDate(dateStr) {
    if (!dateStr) return '-';
    var date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('pt-PT');
  }

  function toLegacyDoc(d) {
    return {
      id: d.id,
      tipo: d.tipo,
      nomeParcial: d.nome_proprietario || 'Proprietario',
      chaveEntrega: d.chave_entrega || '',
      status: d.status || 'PENDENTE',
      dataCriacao: (d.criado_em || d.data_publicacao || '').slice(0, 10)
    };
  }

  function renderTabela() {
    if (!tabelaBody) return;

    var lista = docs.filter(function (d) {
      return !filtroAtual || d.status === filtroAtual;
    });

    if (!lista.length) {
      tabelaBody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:2rem;color:var(--text-gray);">Nenhum achado encontrado.</td></tr>';
      return;
    }

    tabelaBody.innerHTML = lista.map(function (d) {
      var pontos = d.status === 'ENTREGUE' ? '+60 pts' : (d.status === 'AGUARDANDO_ENTREGA' || d.status === 'DISPONIVEL_LEVANTAMENTO') ? '+10 pts' : '-';
      var cor = pontos !== '-' ? 'color:var(--success); font-weight:700;' : '';
      return '<tr>' +
        '<td><code>' + d.id + '</code></td>' +
        '<td>' + d.tipo + '</td>' +
        '<td>' + d.nomeParcial + '</td>' +
        '<td><code style="white-space:nowrap; font-size:0.8rem;">' + d.chaveEntrega + '</code></td>' +
        '<td><span class="badge ' + getStatusBadgeClass(d.status) + '">' + getStatusLabel(d.status) + '</span></td>' +
        '<td>' + formatDate(d.dataCriacao) + '</td>' +
        '<td style="' + cor + '">' + pontos + '</td>' +
        '<td><a href="detalhes.html?id=' + encodeURIComponent(d.id) + '" class="btn btn-outline btn-sm">Ver</a></td>' +
        '</tr>';
    }).join('');
  }

  async function loadDocs() {
    if (!(typeof Api !== 'undefined' && Api.documentos && Api.documentos.myList)) {
      if (tabelaBody) {
        tabelaBody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--danger);">API de documentos indisponivel.</td></tr>';
      }
      return;
    }

    try {
      var response = await Api.documentos.myList({ page: 1, limit: 200 });
      docs = (response && response.documentos ? response.documentos : []).map(toLegacyDoc);
      renderTabela();
    } catch (err) {
      if (tabelaBody) {
        tabelaBody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--danger);">Falha ao carregar seus documentos.</td></tr>';
      }
    }
  }

  filterTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      filterTabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      filtroAtual = tab.getAttribute('data-filter') || '';
      renderTabela();
    });
  });

  loadDocs();
})();
