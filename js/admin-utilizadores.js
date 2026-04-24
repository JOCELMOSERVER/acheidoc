/* ===========================
   AcheiDoc — Admin Utilizadores JS
   =========================== */

(function () {
  var STORAGE_KEY = 'acheidoc_admin_utilizadores';
  var adminLogado = JSON.parse(sessionStorage.getItem('adminLogado') || 'null');
  if (!adminLogado) {
    window.location.href = 'login.html';
    return;
  }

  setEl('adminNome', adminLogado.nome);

  var utilizadores = [];
  var filtroAtual = 'TODOS';
  var tabela = document.getElementById('tabelaUtilizadores');

  bindFiltros();
  bindLogout();

  function loadUtilizadoresLocal() {
    var saved = safeParse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved) && saved.length) return saved;

    var base = Array.isArray(UTILIZADORES) ? UTILIZADORES : [];
    var seeded = base.map(function (u) {
      return Object.assign({}, u, { status: u.status || 'ATIVO' });
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  function saveUtilizadores() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(utilizadores));
  }

  function renderResumo() {
    var ativos = 0;
    var bloqueados = 0;
    var pontos = 0;

    utilizadores.forEach(function (u) {
      if (u.status === 'BLOQUEADO') bloqueados++;
      else ativos++;
      pontos += Number(u.pontos || 0);
    });

    setEl('countTotalUsers', utilizadores.length);
    setEl('countUsersAtivos', ativos);
    setEl('countUsersBloqueados', bloqueados);
    setEl('countUsersPontos', pontos);
  }

  function renderTabela(filtro) {
    if (!tabela) return;

    var lista = filtro === 'TODOS'
      ? utilizadores
      : utilizadores.filter(function (u) { return u.status === filtro; });

    if (!lista.length) {
      tabela.innerHTML = '<tr><td colspan="8" class="text-center" style="padding:2rem; color:var(--text-gray);">Nenhum utilizador encontrado.</td></tr>';
      return;
    }

    tabela.innerHTML = lista.map(function (u) {
      var isBlocked = u.status === 'BLOQUEADO';
      var statusClass = isBlocked ? 'badge-rejeitado' : 'badge-entregue';
      var statusLabel = isBlocked ? 'Bloqueado' : 'Activo';
      var acaoLabel = isBlocked ? 'Desbloquear' : 'Bloquear';
      var acaoClass = isBlocked ? 'btn-success' : 'btn-danger';

      return '<tr>' +
        '<td><code>' + u.id + '</code></td>' +
        '<td>' + (u.nome || '—') + '</td>' +
        '<td>' + (u.email || '—') + '</td>' +
        '<td>' + (u.telefone || '—') + '</td>' +
        '<td>' + (u.municipio || '—') + '</td>' +
        '<td><span class="badge ' + statusClass + '">' + statusLabel + '</span></td>' +
        '<td>' + Number(u.pontos || 0) + '</td>' +
        '<td><div style="display:flex; gap:0.35rem; flex-wrap:wrap;">' +
        '<button class="btn btn-sm btn-outline btn-points-plus" data-id="' + u.id + '">+10</button>' +
        '<button class="btn btn-sm btn-outline btn-points-minus" data-id="' + u.id + '">-10</button>' +
        '<button class="btn btn-sm ' + acaoClass + ' btn-toggle-user" data-id="' + u.id + '">' + acaoLabel + '</button>' +
        '</div></td>' +
        '</tr>';
    }).join('');

    tabela.querySelectorAll('.btn-toggle-user').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var userId = btn.getAttribute('data-id');
        toggleUserStatus(userId);
      });
    });

    tabela.querySelectorAll('.btn-points-plus').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var userId = btn.getAttribute('data-id');
        changeUserPoints(userId, 10);
      });
    });

    tabela.querySelectorAll('.btn-points-minus').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var userId = btn.getAttribute('data-id');
        changeUserPoints(userId, -10);
      });
    });
  }

  async function toggleUserStatus(userId) {
    var alvo = utilizadores.find(function (u) { return String(u.id) === String(userId); });
    if (!alvo) return;

    var nextStatus = alvo.status === 'BLOQUEADO' ? 'ATIVO' : 'BLOQUEADO';

    if (typeof Api !== 'undefined' && Api.adminUtilizadores && Api.adminUtilizadores.updateStatus) {
      try {
        await Api.adminUtilizadores.updateStatus(userId, nextStatus);
      } catch (apiErr) {
        alert(apiErr && apiErr.message ? apiErr.message : 'Falha ao actualizar estado do utilizador.');
        return;
      }
    }

    utilizadores = utilizadores.map(function (u) {
      if (String(u.id) !== String(userId)) return u;
      return Object.assign({}, u, { status: nextStatus });
    });

    saveUtilizadores();
    renderResumo();
    renderTabela(filtroAtual);
  }

  async function changeUserPoints(userId, delta) {
    if (typeof Api !== 'undefined' && Api.adminUtilizadores && Api.adminUtilizadores.addPontos) {
      try {
        await Api.adminUtilizadores.addPontos(userId, delta);
      } catch (apiErr) {
        alert(apiErr && apiErr.message ? apiErr.message : 'Falha ao alterar pontos do utilizador.');
        return;
      }
    }

    utilizadores = utilizadores.map(function (u) {
      if (String(u.id) !== String(userId)) return u;
      var nextPoints = Number(u.pontos || 0) + delta;
      return Object.assign({}, u, { pontos: Math.max(0, nextPoints) });
    });

    saveUtilizadores();
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
      if (typeof Api !== 'undefined' && Api.clearToken) Api.clearToken();
      window.location.href = 'login.html';
    });
  }

  (async function init() {
    if (typeof Api !== 'undefined' && Api.adminUtilizadores && Api.adminUtilizadores.list) {
      try {
        var response = await Api.adminUtilizadores.list({ page: 1, limit: 200 });
        utilizadores = (response && response.utilizadores ? response.utilizadores : []).map(function (u) {
          return Object.assign({}, u, {
            municipio: u.municipio || u.provincia || '—',
            status: u.status || 'ATIVO'
          });
        });
        renderResumo();
        renderTabela(filtroAtual);
        return;
      } catch (apiErr) {
        // fallback local
      }
    }

    utilizadores = loadUtilizadoresLocal();
    renderResumo();
    renderTabela(filtroAtual);
  })();

  function setEl(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function safeParse(raw) {
    try { return raw ? JSON.parse(raw) : null; }
    catch (e) { return null; }
  }
})();
