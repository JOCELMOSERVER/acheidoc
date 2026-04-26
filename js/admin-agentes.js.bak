/* ===========================
   AcheiDoc — Admin Agentes JS
   =========================== */

(function () {
  var adminLogado = JSON.parse(sessionStorage.getItem('adminLogado') || 'null');
  if (!adminLogado) {
    window.location.href = 'login.html';
    return;
  }

  setEl('adminNome', adminLogado.nome);

  var agentes = [];
  var filtroAtual = 'TODOS';
  var tabela = document.getElementById('tabelaAgentes');
  var formContainer = document.getElementById('formContainer');
  var btnCriarAgente = document.getElementById('btnCriarAgente');
  var btnCancelar = document.getElementById('btnCancelar');
  var formNovoAgente = document.getElementById('formNovoAgente');

  bindFiltros();
  bindLogout();
  bindFormCriarAgente();

  function getPontoNome(pontoId) {
    var agente = agentes.find(function (item) { return String(item.pontoId) === String(pontoId); });
    if (agente && agente.pontoNome) return agente.pontoNome;
    return pontoId ? 'Ponto ' + pontoId : '—';
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
        var agentId = btn.getAttribute('data-id');
        toggleAgentStatus(agentId);
      });
    });

    tabela.querySelectorAll('.btn-agent-points-plus').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var agentId = btn.getAttribute('data-id');
        changeAgentPoints(agentId, 10);
      });
    });

    tabela.querySelectorAll('.btn-agent-points-minus').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var agentId = btn.getAttribute('data-id');
        changeAgentPoints(agentId, -10);
      });
    });
  }

  async function toggleAgentStatus(agentId) {
    var alvo = agentes.find(function (a) { return String(a.id) === String(agentId); });
    if (!alvo) return;

    var nextStatus = alvo.status === 'ATIVO' ? 'INATIVO' : 'ATIVO';

    if (!(typeof Api !== 'undefined' && Api.adminAgentes && Api.adminAgentes.updateStatus)) {
      alert('API de agentes indisponível.');
      return;
    }

    try {
      await Api.adminAgentes.updateStatus(agentId, nextStatus);
      agentes = agentes.map(function (a) {
        if (String(a.id) !== String(agentId)) return a;
        return Object.assign({}, a, { status: nextStatus });
      });
      renderResumo();
      renderTabela(filtroAtual);
    } catch (apiErr) {
      alert(apiErr && apiErr.message ? apiErr.message : 'Falha ao actualizar estado do agente.');
    }
  }

  async function changeAgentPoints(agentId, delta) {
    if (!(typeof Api !== 'undefined' && Api.adminAgentes && Api.adminAgentes.addPontos)) {
      alert('API de agentes indisponível.');
      return;
    }

    try {
      await Api.adminAgentes.addPontos(agentId, delta);
      agentes = agentes.map(function (a) {
        if (String(a.id) !== String(agentId)) return a;
        var nextPoints = Number(a.pontos || 0) + delta;
        return Object.assign({}, a, { pontos: Math.max(0, nextPoints) });
      });
      renderResumo();
      renderTabela(filtroAtual);
    } catch (apiErr) {
      alert(apiErr && apiErr.message ? apiErr.message : 'Falha ao alterar pontos do agente.');
    }
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

  function bindFormCriarAgente() {
    if (btnCriarAgente) {
      btnCriarAgente.addEventListener('click', function () {
        if (formContainer) formContainer.classList.remove('hidden');
        if (formNovoAgente) formNovoAgente.reset();
      });
    }

    if (btnCancelar) {
      btnCancelar.addEventListener('click', function () {
        if (formContainer) formContainer.classList.add('hidden');
      });
    }

    if (formNovoAgente) {
      formNovoAgente.addEventListener('submit', async function (e) {
        e.preventDefault();

        var nome = document.getElementById('inputNome').value.trim();
        var email = document.getElementById('inputEmail').value.trim();
        var telefone = document.getElementById('inputTelefone').value.trim();
        var pontoId = document.getElementById('inputPontoId').value.trim();

        if (!nome || !email || !telefone) {
          alert('Por favor, preencha os campos obrigatórios (Nome, Email, Telefone).');
          return;
        }

        if (!(typeof Api !== 'undefined' && Api.adminAgentes && Api.adminAgentes.create)) {
          alert('API de criação de agentes indisponível.');
          return;
        }

        try {
          btnCriarAgente.disabled = true;
          var payload = {
            nome: nome,
            email: email,
            telefone: telefone
          };
          if (pontoId) payload.ponto_id = pontoId;

          var response = await Api.adminAgentes.create(payload);

          if (response && response.agente) {
            agentes.push(Object.assign({}, response.agente, {
              ultimaActividade: (response.agente.criado_em || '').slice(0, 10) || new Date().toISOString().slice(0, 10),
              pontoId: response.agente.ponto_id || response.agente.pontoId || null,
              pontoNome: response.agente.ponto_nome || response.agente.pontoNome || null
            }));
            renderResumo();
            renderTabela(filtroAtual);
            formNovoAgente.reset();
            if (formContainer) formContainer.classList.add('hidden');
            alert('Agente criado com sucesso!');
          }
        } catch (err) {
          alert(err && err.message ? err.message : 'Falha ao criar agente.');
        } finally {
          btnCriarAgente.disabled = false;
        }
      });
    }
  }

  (async function init() {
    if (!(typeof Api !== 'undefined' && Api.adminAgentes && Api.adminAgentes.list)) {
      alert('API de agentes indisponível.');
      return;
    }

    try {
      var response = await Api.adminAgentes.list({ page: 1, limit: 200 });
      agentes = (response && response.agentes ? response.agentes : []).map(function (a) {
        return Object.assign({}, a, {
          ultimaActividade: (a.criado_em || '').slice(0, 10) || new Date().toISOString().slice(0, 10),
          pontoId: a.ponto_id || a.pontoId || null,
          pontoNome: a.ponto_nome || a.pontoNome || null
        });
      });
      renderResumo();
      renderTabela(filtroAtual);
    } catch (apiErr) {
      alert(apiErr && apiErr.message ? apiErr.message : 'Falha ao carregar agentes.');
    }
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
