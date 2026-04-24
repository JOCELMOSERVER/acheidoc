/* ===========================
   AcheiDoc — Admin Agentes JS
   =========================== */

(function () {
  var STORAGE_KEY = 'acheidoc_admin_agentes';
  var adminLogado = JSON.parse(sessionStorage.getItem('adminLogado') || 'null');
  if (!adminLogado) {
    window.location.href = 'login.html';
    return;
  }

  setEl('adminNome', adminLogado.nome);

  var agentes = loadAgentes();
  var filtroAtual = 'TODOS';
  var tabela = document.getElementById('tabelaAgentes');

  renderResumo();
  renderTabela('TODOS');
  bindFiltros();
  bindLogout();

  function loadAgentes() {
    var saved = safeParse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved) && saved.length) return saved;

    var base = Array.isArray(AGENTES) ? AGENTES : [];
    var seeded = base.map(function (a) {
      return Object.assign({}, a, {
        status: a.status || 'ATIVO',
        ultimaActividade: a.ultimaActividade || new Date().toISOString().split('T')[0]
      });
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  function saveAgentes() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(agentes));
  }

  function getPontoNome(pontoId) {
    if (!Array.isArray(PONTOS_ENTREGA)) return '—';
    var ponto = PONTOS_ENTREGA.find(function (p) { return p.id === pontoId; });
    return ponto ? ponto.nome : '—';
  }

  function renderResumo() {
    var ativos = 0;
    var inativos = 0;
    var pontosAtribuidos = 0;

    agentes.forEach(function (a) {
      if (a.status === 'ATIVO') ativos++;
      else inativos++;
      if (a.pontoId) pontosAtribuidos++;
    });

    setEl('countTotalAgentes', agentes.length);
    setEl('countAgentesAtivos', ativos);
    setEl('countAgentesInativos', inativos);
    setEl('countAgentesPontos', pontosAtribuidos);
  }

  function renderTabela(filtro) {
    if (!tabela) return;

    var lista = filtro === 'TODOS'
      ? agentes
      : agentes.filter(function (a) { return a.status === filtro; });

    if (!lista.length) {
      tabela.innerHTML = '<tr><td colspan="8" class="text-center" style="padding:2rem; color:var(--text-gray);">Nenhum agente encontrado.</td></tr>';
      return;
    }

    tabela.innerHTML = lista.map(function (a) {
      var isAtivo = a.status === 'ATIVO';
      var statusClass = isAtivo ? 'badge-entregue' : 'badge-rejeitado';
      var statusLabel = isAtivo ? 'Activo' : 'Inactivo';
      var acaoLabel = isAtivo ? 'Desactivar' : 'Activar';
      var acaoClass = isAtivo ? 'btn-danger' : 'btn-success';

      return '<tr>' +
        '<td><code>' + a.id + '</code></td>' +
        '<td>' + (a.nome || '—') + '</td>' +
        '<td>' + (a.email || '—') + '</td>' +
        '<td>' + getPontoNome(a.pontoId) + '</td>' +
        '<td>' + Number(a.pontos || 0) + '</td>' +
        '<td>' + formatDate(a.ultimaActividade) + '</td>' +
        '<td><span class="badge ' + statusClass + '">' + statusLabel + '</span></td>' +
        '<td><div style="display:flex; gap:0.35rem; flex-wrap:wrap;">' +
        '<button class="btn btn-sm btn-outline btn-agent-points-plus" data-id="' + a.id + '">+10</button>' +
        '<button class="btn btn-sm btn-outline btn-agent-points-minus" data-id="' + a.id + '">-10</button>' +
        '<button class="btn btn-sm ' + acaoClass + ' btn-toggle-agent" data-id="' + a.id + '">' + acaoLabel + '</button>' +
        '</div></td>' +
        '</tr>';
    }).join('');

    tabela.querySelectorAll('.btn-toggle-agent').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var agentId = Number(btn.getAttribute('data-id'));
        toggleAgentStatus(agentId);
      });
    });

    tabela.querySelectorAll('.btn-agent-points-plus').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var agentId = Number(btn.getAttribute('data-id'));
        changeAgentPoints(agentId, 10);
      });
    });

    tabela.querySelectorAll('.btn-agent-points-minus').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var agentId = Number(btn.getAttribute('data-id'));
        changeAgentPoints(agentId, -10);
      });
    });
  }

  function toggleAgentStatus(agentId) {
    agentes = agentes.map(function (a) {
      if (a.id !== agentId) return a;
      var nextStatus = a.status === 'ATIVO' ? 'INATIVO' : 'ATIVO';
      return Object.assign({}, a, {
        status: nextStatus,
        ultimaActividade: new Date().toISOString().split('T')[0]
      });
    });

    saveAgentes();

    var sessaoAgente = safeParse(sessionStorage.getItem('agenteLogado'));
    if (sessaoAgente && sessaoAgente.id === agentId) {
      var actual = agentes.find(function (a) { return a.id === agentId; });
      if (actual && actual.status === 'INATIVO') {
        sessionStorage.removeItem('agenteLogado');
      }
    }

    renderResumo();
    renderTabela(filtroAtual);
  }

  function changeAgentPoints(agentId, delta) {
    agentes = agentes.map(function (a) {
      if (a.id !== agentId) return a;
      var nextPoints = Number(a.pontos || 0) + delta;
      return Object.assign({}, a, {
        pontos: Math.max(0, nextPoints),
        ultimaActividade: new Date().toISOString().split('T')[0]
      });
    });

    saveAgentes();
    renderResumo();
    renderTabela(filtroAtual);
  }

  function bindFiltros() {
    document.querySelectorAll('.filter-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.filter-tab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        filtroAtual = tab.getAttribute('data-filter') || 'TODOS';
        renderTabela(filtroAtual);
      });
    });
  }

  function bindLogout() {
    var btnLogout = document.getElementById('btnLogout');
    if (!btnLogout) return;
    btnLogout.addEventListener('click', function () {
      sessionStorage.removeItem('adminLogado');
      window.location.href = 'login.html';
    });
  }

  function setEl(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function safeParse(raw) {
    try { return raw ? JSON.parse(raw) : null; }
    catch (e) { return null; }
  }
})();
