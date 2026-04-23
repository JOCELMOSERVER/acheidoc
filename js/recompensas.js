/* ===========================
   AcheiDoc — Recompensas JS
   =========================== */

(function () {
  // Pontos do utilizador (simulados)
  var totalPontos = 350;
  var metaPontos = 500;

  // Exibir pontos
  var pontosEl = document.getElementById('totalPontos');
  if (pontosEl) pontosEl.textContent = totalPontos;

  // Barra de progresso
  var progressBar = document.getElementById('pontosProgress');
  if (progressBar) {
    var pct = Math.min((totalPontos / metaPontos) * 100, 100);
    progressBar.style.width = pct + '%';
  }

  var progressLabel = document.getElementById('progressLabel');
  if (progressLabel) {
    progressLabel.textContent = totalPontos + ' / ' + metaPontos + ' pts para o próximo nível';
  }

  // Histórico
  var historicoEl = document.getElementById('historicoTabela');
  if (historicoEl && typeof HISTORICO_PONTOS !== 'undefined') {
    historicoEl.innerHTML = HISTORICO_PONTOS.map(function (h) {
      var positivo = h.pontos > 0;
      return `
        <tr>
          <td>${formatDate(h.data)}</td>
          <td>${h.acao}</td>
          <td><a href="detalhes.html?id=${h.docId}">${h.docId}</a></td>
          <td style="color: ${positivo ? 'var(--success)' : 'var(--danger)'}; font-weight: 700;">
            ${positivo ? '+' : ''}${h.pontos} pts
          </td>
        </tr>`;
    }).join('');
  }

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
    btnConfirmarResgate.addEventListener('click', function () {
      var beneficio = beneficioSelect ? beneficioSelect.options[beneficioSelect.selectedIndex].text : '';
      var custo = beneficioSelect ? parseInt(beneficioSelect.value, 10) : 0;

      if (custo > totalPontos) {
        alert('Pontos insuficientes para este benefício.');
        return;
      }

      if (modalOverlay) modalOverlay.classList.remove('active');
      alert('Resgate solicitado: ' + beneficio + '. O pedido será processado em até 24 horas.');
    });
  }
})();
