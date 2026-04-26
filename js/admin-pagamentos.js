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
  var pagamentos = [];
  var filtroAtual = 'TODOS';

  function normStatus(v) {
    if (v === 'AGUARDANDO') return 'PENDENTE';
    return v || 'PENDENTE';
  }

  function toLegacyPagamento(p) {
    return {
      id: p.id,
      docId: p.doc_id || p.docId,
      utilizador: p.utilizador_nome || p.utilizador || 'Cliente',
      tipoDoc: p.tipo || p.tipoDoc || 'Documento',
      entidade: p.entidade || '00282',
      referencia: p.referencia || '',
      valor: Number(p.valor || 0),
      status: normStatus(p.status),
      dataCriacao: (p.criado_em || p.dataCriacao || '').slice(0, 10),
      dataPagamento: (p.confirmado_em || p.dataPagamento || '').slice(0, 10)
    };
  }

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
    setEl('entidadeDisplay', '00282');
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
        ? 'badge-entregue'
        : p.status === 'PENDENTE'
          ? 'badge-aguardando'
          : 'badge-rejeitado';
      var statusLabel = p.status === 'PAGO' ? 'Pago'
        : p.status === 'PENDENTE' ? 'Pendente' : 'Cancelado';

      var acaoBtns = '';
      if (p.status === 'PENDENTE') {
        acaoBtns = '<button class="btn btn-success btn-sm btn-confirmar" data-id="' + p.id + '">Confirmar pago</button>';
      } else if (p.status === 'PAGO') {
        acaoBtns = '<span style="color:var(--text-gray); font-size:0.85rem;">' + (p.dataPagamento || '') + '</span>';
      } else {
        acaoBtns = '<span style="color:var(--text-gray); font-size:0.85rem;"></span>';
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

      setTimeout(async function () {
        try {
          if (!(typeof Api !== 'undefined' && Api.pagamentos && Api.pagamentos.adminConfirmar)) {
            throw new Error('API de pagamentos indisponível.');
          }
          var response = await Api.pagamentos.adminConfirmar(pagamentoSelecionadoId);
          if (response && response.pagamento) {
            var updated = toLegacyPagamento(response.pagamento);
            pagamentos = pagamentos.map(function (item) {
              return item.id === updated.id ? updated : item;
            });
          }
        } catch (apiErr) {
          var failEl = document.getElementById('modalResult');
          if (failEl) {
            failEl.className = 'alert alert-danger';
            failEl.textContent = apiErr && apiErr.message ? apiErr.message : 'Falha ao confirmar pagamento.';
            failEl.classList.remove('hidden');
          }
          btnModalConfirmar.disabled = false;
          btnModalConfirmar.textContent = 'Confirmar pago';
          return;
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
  async function loadPagamentos() {
    if (!(typeof Api !== 'undefined' && Api.pagamentos && Api.pagamentos.adminList)) {
      alert('API de pagamentos indisponível.');
      return;
    }

    try {
      var response = await Api.pagamentos.adminList({ page: 1, limit: 200 });
      pagamentos = (response && response.pagamentos ? response.pagamentos : []).map(toLegacyPagamento);
      calcularResumo();
      renderTabela(filtroAtual);
    } catch (apiErr) {
      alert(apiErr && apiErr.message ? apiErr.message : 'Falha ao carregar pagamentos.');
    }
  }

  loadPagamentos();

  /* ── Helpers ── */
  function setEl(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }
})();
