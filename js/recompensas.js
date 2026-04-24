/* ===========================
   AcheiDoc — Recompensas JS
   =========================== */

(function () {
  Auth.requireAuth();

  var totalPontos = 0;
  var metaPontos = 500;

  var pontosEl = document.getElementById('totalPontos');
  var progressBar = document.getElementById('pontosProgress');
  var progressLabel = document.getElementById('progressLabel');
  var historicoEl = document.getElementById('historicoTabela');
  loadRecompensas();

  // Modal de resgate
  var btnResgatar = document.getElementById('btnResgatar');
  var modalOverlay = document.getElementById('modalResgatar');
  var btnFecharModal = document.getElementById('btnFecharModal');
  var btnConfirmarResgate = document.getElementById('btnConfirmarResgate');
  var beneficioSelect = document.getElementById('beneficioSelect');

  if (btnResgatar && modalOverlay) {
    btnResgatar.addEventListener('click', function () {
      modalOverlay.classList.add('active');
    });
  }

  if (btnFecharModal && modalOverlay) {
    btnFecharModal.addEventListener('click', function () {
      modalOverlay.classList.remove('active');
    });
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) modalOverlay.classList.remove('active');
    });
  }

  if (btnConfirmarResgate) {
    btnConfirmarResgate.addEventListener('click', async function () {
      var beneficio = beneficioSelect ? beneficioSelect.options[beneficioSelect.selectedIndex].text : '';
      var codigoBeneficio = beneficioSelect ? beneficioSelect.value : '';
      var custo = beneficioSelect ? parseInt(beneficioSelect.options[beneficioSelect.selectedIndex].getAttribute('data-pontos') || '0', 10) : 0;

      if (custo > totalPontos) {
        alert('Pontos insuficientes para este benefício.');
        return;
      }

      if (!(typeof Api !== 'undefined' && Api.recompensas && Api.recompensas.redeem)) {
        alert('API de recompensas indisponível.');
        return;
      }

      btnConfirmarResgate.disabled = true;
      btnConfirmarResgate.textContent = 'A processar...';

      try {
        var response = await Api.recompensas.redeem(codigoBeneficio);
        if (response && response.utilizador) {
          totalPontos = Number(response.utilizador.pontos || 0);
          syncUserPoints(totalPontos);
          renderResumo();
          await loadRecompensas();
        }
        if (modalOverlay) modalOverlay.classList.remove('active');
        alert('Resgate solicitado: ' + beneficio + '.');
      } catch (err) {
        alert(err && err.message ? err.message : 'Falha ao solicitar resgate.');
      } finally {
        btnConfirmarResgate.disabled = false;
        btnConfirmarResgate.textContent = 'Confirmar Resgate';
      }
    });
  }

  async function loadRecompensas() {
    if (!(typeof Api !== 'undefined' && Api.recompensas && Api.recompensas.summary)) {
      renderHistorico([]);
      return;
    }

    try {
      var response = await Api.recompensas.summary();
      if (response && response.utilizador) {
        totalPontos = Number(response.utilizador.pontos || 0);
        syncUserPoints(totalPontos);
      }
      renderResumo();
      renderBeneficios(response && response.beneficios ? response.beneficios : []);
      renderHistorico(response && response.historico ? response.historico : []);
    } catch (err) {
      renderHistorico([]);
    }
  }

  function renderResumo() {
    if (pontosEl) pontosEl.textContent = totalPontos;
    if (progressBar) {
      var pct = Math.min((totalPontos / metaPontos) * 100, 100);
      progressBar.style.width = pct + '%';
    }
    if (progressLabel) {
      progressLabel.textContent = totalPontos + ' / ' + metaPontos + ' pts para o próximo nível';
    }
  }

  function renderBeneficios(beneficios) {
    if (!beneficioSelect || !beneficios.length) return;
    beneficioSelect.innerHTML = beneficios.map(function (beneficio) {
      return '<option value="' + beneficio.codigo + '" data-pontos="' + beneficio.pontos + '">' +
        beneficio.pontos + ' pts — ' + beneficio.nome + '</option>';
    }).join('');
  }

  function renderHistorico(historico) {
    if (!historicoEl) return;
    if (!historico.length) {
      historicoEl.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:1.5rem;color:var(--text-gray);">Sem histórico de pontos disponível.</td></tr>';
      return;
    }

    historicoEl.innerHTML = historico.map(function (item) {
      var positivo = Number(item.pontos || 0) > 0;
      var docCell = item.doc_id
        ? '<a href="detalhes.html?id=' + encodeURIComponent(item.doc_id) + '">' + item.doc_id + '</a>'
        : '—';
      return '<tr>' +
        '<td>' + formatDate(item.data) + '</td>' +
        '<td>' + (item.acao || '—') + '</td>' +
        '<td>' + docCell + '</td>' +
        '<td style="color:' + (positivo ? 'var(--success)' : 'var(--danger)') + '; font-weight:700;">' +
        (positivo ? '+' : '') + Number(item.pontos || 0) + ' pts</td>' +
        '</tr>';
    }).join('');
  }

  function syncUserPoints(points) {
    var user = typeof Auth !== 'undefined' && typeof Auth.getUser === 'function' ? Auth.getUser() : null;
    if (!user) return;
    user.pontos = points;
    localStorage.setItem('acheidoc_user', JSON.stringify(user));
  }

  function formatDate(dateStr) {
    var date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('pt-PT');
  }
})();
