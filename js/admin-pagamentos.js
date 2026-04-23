/* ===========================
   AcheiDoc — Admin Pagamentos JS
   PayPay: Entidade + Referência
   =========================== */

(function () {
  /* ── Auth ── */
  var adminLogado = JSON.parse(sessionStorage.getItem('adminLogado') || 'null');
  if (!adminLogado) {
    window.location.href = 'login.html';
    return;
  }
  setEl('adminNome', adminLogado.nome);

  /* ── Dados ── */
  var pagamentos = typeof PAGAMENTOS !== 'undefined' ? PAGAMENTOS.slice() : [];
  var filtroAtual = 'TODOS';

  /* ── Resumo ── */
  function calcularResumo() {
    var pendentes = 0, pagos = 0, receita = 0;
    pagamentos.forEach(function (p) {
      if (p.status === 'PENDENTE') pendentes++;
      if (p.status === 'PAGO') { pagos++; receita += p.valor; }
    });
    setEl('countPendentes', pendentes);
    setEl('countPagos', pagos);
    setEl('totalReceita', receita.toLocaleString('pt-AO') + ' Kz');
    setEl('entidadeDisplay', typeof PAYPAY_ENTIDADE !== 'undefined' ? PAYPAY_ENTIDADE : '00282');
  }

  calcularResumo();

  /* ── Tabela ── */
  var tabelaBody = document.getElementById('tabelaPagamentos');

  function renderTabela(filtro) {
    if (!tabelaBody) return;
    var lista = filtro === 'TODOS'
      ? pagamentos
      : pagamentos.filter(function (p) { return p.status === filtro; });

    if (lista.length === 0) {
      tabelaBody.innerHTML = '<tr><td colspan="9" class="text-center" style="padding:2rem; color:var(--text-gray);">Nenhum pagamento encontrado.</td></tr>';
      return;
    }

    tabelaBody.innerHTML = lista.map(function (p) {
      var badgeCls = p.status === 'PAGO'
        ? 'badge-success'
        : p.status === 'PENDENTE'
          ? 'badge-warning'
          : 'badge-danger';
      var statusLabel = p.status === 'PAGO' ? 'Pago'
        : p.status === 'PENDENTE' ? 'Pendente' : 'Cancelado';

      var acaoBtns = '';
      if (p.status === 'PENDENTE') {
        acaoBtns = '<button class="btn btn-success btn-sm btn-confirmar" data-id="' + p.id + '">Confirmar pago</button>';
      } else if (p.status === 'PAGO') {
        acaoBtns = '<span style="color:var(--text-gray); font-size:0.85rem;">' + (p.dataPagamento || '—') + '</span>';
      } else {
        acaoBtns = '<span style="color:var(--text-gray); font-size:0.85rem;">—</span>';
      }

      return '<tr>' +
        '<td><code style="font-size:0.8rem;">' + p.id + '</code></td>' +
        '<td><code style="font-size:0.8rem;">' + p.docId + '</code></td>' +
        '<td style="max-width:160px; word-break:break-word;">' + p.utilizador + '</td>' +
        '<td><span style="font-weight:700; color:#312E81; letter-spacing:0.08em;">' + p.entidade + '</span></td>' +
        '<td><span style="font-weight:600; color:#7C3AED; letter-spacing:0.05em;">' + p.referencia + '</span></td>' +
        '<td><strong>' + p.valor.toLocaleString('pt-AO') + ' Kz</strong></td>' +
        '<td><span class="badge ' + badgeCls + '">' + statusLabel + '</span></td>' +
        '<td>' + p.dataCriacao + '</td>' +
        '<td>' + acaoBtns + '</td>' +
        '</tr>';
    }).join('');

    /* Botões de confirmar */
    tabelaBody.querySelectorAll('.btn-confirmar').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var pid = btn.getAttribute('data-id');
        abrirModal(pid);
      });
    });
  }

  /* ── Filtros ── */
  document.querySelectorAll('.filter-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.filter-tab').forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      filtroAtual = tab.getAttribute('data-filter') || 'TODOS';
      renderTabela(filtroAtual);
    });
  });

  /* ── Modal: confirmar pagamento ── */
  var modal = document.getElementById('modalConfirmar');
  var pagamentoSelecionadoId = null;

  function abrirModal(pid) {
    var p = pagamentos.find(function (x) { return x.id === pid; });
    if (!p) return;
    pagamentoSelecionadoId = pid;

    setEl('modalEntidade', p.entidade);
    setEl('modalReferencia', p.referencia);
    setEl('modalValor', p.valor.toLocaleString('pt-AO') + ' Kz');
    setEl('modalPagId', p.id);
    setEl('modalDocId', p.docId);
    setEl('modalUtilizador', p.utilizador);
    setEl('modalTipoDoc', p.tipoDoc);

    var resultEl = document.getElementById('modalResult');
    if (resultEl) resultEl.classList.add('hidden');

    var btnConf = document.getElementById('btnModalConfirmar');
    if (btnConf) {
      btnConf.disabled = false;
      btnConf.textContent = 'Confirmar pago';
    }

    if (modal) modal.classList.remove('hidden');
  }

  function fecharModal() {
    if (modal) modal.classList.add('hidden');
    pagamentoSelecionadoId = null;
  }

  var btnModalConfirmar = document.getElementById('btnModalConfirmar');
  if (btnModalConfirmar) {
    btnModalConfirmar.addEventListener('click', function () {
      if (!pagamentoSelecionadoId) return;
      btnModalConfirmar.disabled = true;
      btnModalConfirmar.innerHTML = '<span class="spinner"></span> A registar...';

      setTimeout(function () {
        /* Actualizar o objecto na lista em memória */
        var p = pagamentos.find(function (x) { return x.id === pagamentoSelecionadoId; });
        if (p) {
          p.status = 'PAGO';
          p.dataPagamento = new Date().toISOString().split('T')[0];
        }

        /* Feedback no modal */
        var resultEl = document.getElementById('modalResult');
        if (resultEl) {
          resultEl.className = 'alert alert-success';
          resultEl.textContent = 'Pagamento confirmado com sucesso. O processo de resgate foi desbloqueado.';
        }

        btnModalConfirmar.textContent = 'Confirmado';

        /* Re-renderizar tabela e resumo */
        calcularResumo();
        renderTabela(filtroAtual);

        /* Fechar modal após 2 s */
        setTimeout(fecharModal, 2000);
      }, 1200);
    });
  }

  var btnModalCancelar = document.getElementById('btnModalCancelar');
  if (btnModalCancelar) {
    btnModalCancelar.addEventListener('click', fecharModal);
  }

  /* Fechar ao clicar fora do card */
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) fecharModal();
    });
  }

  /* ── Logout ── */
  var btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', function () {
      sessionStorage.removeItem('adminLogado');
      window.location.href = 'login.html';
    });
  }

  /* ── Render inicial ── */
  renderTabela('TODOS');

  /* ── Helpers ── */
  function setEl(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }
})();
