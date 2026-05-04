/* ===========================
   AcheiDoc — Admin Relatórios
   =========================== */

(function () {
  var adminLogado = null;
  try { adminLogado = JSON.parse(sessionStorage.getItem('adminLogado') || 'null'); } catch (e) {}
  if (!adminLogado) { window.location.href = '../login.html'; return; }

  var adminNomeEl = document.getElementById('adminNome');
  if (adminNomeEl) adminNomeEl.textContent = adminLogado.nome || adminLogado.email || 'Admin';

  // Logout
  var btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', function () {
      sessionStorage.removeItem('adminLogado');
      window.location.href = '../login.html';
    });
  }

  function setEl(id, v) {
    var el = document.getElementById(id);
    if (el) el.textContent = v;
  }

  function statusLabel(s) {
    var map = {
      'PENDENTE': 'Pendente',
      'APROVADO': 'Aprovado',
      'RECUSADO': 'Recusado',
      'NO_PONTO': 'No ponto',
      'DISPONIVEL_PAGAMENTO': 'Aguarda pagamento',
      'DISPONIVEL_LEVANTAMENTO': 'Disponível levantamento',
      'ENTREGUE': 'Entregue',
      'CANCELADO': 'Cancelado'
    };
    return map[s] || s;
  }

  // Carregar documentos
  if (typeof Api !== 'undefined' && Api.documentos && Api.documentos.list) {
    Api.documentos.list({ page: 1, limit: 200 }).then(function (response) {
      var docs = (response && response.documentos) ? response.documentos : [];

      // Sumário
      setEl('relTotalDocs', docs.length);
      var entregues = docs.filter(function (d) { return d.status === 'ENTREGUE'; }).length;
      setEl('relTotalEntregues', entregues);

      // Documentos por status
      var counts = {};
      docs.forEach(function (d) {
        counts[d.status] = (counts[d.status] || 0) + 1;
      });
      var statusBody = document.getElementById('statusTableBody');
      if (statusBody) {
        if (Object.keys(counts).length === 0) {
          statusBody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:var(--text-gray); padding:1.5rem;">Sem dados</td></tr>';
        } else {
          statusBody.innerHTML = Object.keys(counts).map(function (s) {
            var pct = docs.length > 0 ? Math.round((counts[s] / docs.length) * 100) : 0;
            return '<tr><td>' + statusLabel(s) + '</td><td><strong>' + counts[s] + '</strong></td><td>' + pct + '%</td></tr>';
          }).join('');
        }
      }

      // Actividade recente (últimos 10)
      var recentBody = document.getElementById('recentActivityBody');
      if (recentBody) {
        var recent = docs.slice(0, 10);
        if (recent.length === 0) {
          recentBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-gray); padding:1.5rem;">Sem actividade</td></tr>';
        } else {
          recentBody.innerHTML = recent.map(function (d) {
            var data = String(d.data_publicacao || '').slice(0, 10);
            var nome = String(d.nome_proprietario || '').slice(0, 20);
            return '<tr>' +
              '<td style="font-family:monospace; font-size:0.85rem;">' + (d.id || '—') + '</td>' +
              '<td>' + (d.tipo || '—') + '</td>' +
              '<td>' + nome + '</td>' +
              '<td><span class="badge badge-' + (d.status || '').toLowerCase().replace(/_/g, '-') + '">' + statusLabel(d.status) + '</span></td>' +
              '<td>' + data + '</td>' +
              '</tr>';
          }).join('');
        }
      }
    }).catch(function () {
      setEl('relTotalDocs', '—');
      setEl('relTotalEntregues', '—');
      var statusBody = document.getElementById('statusTableBody');
      if (statusBody) statusBody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:var(--text-gray); padding:1.5rem;">Erro ao carregar dados</td></tr>';
      var recentBody = document.getElementById('recentActivityBody');
      if (recentBody) recentBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-gray); padding:1.5rem;">Erro ao carregar dados</td></tr>';
    });

    // Pagamentos
    if (Api.pagamentos && Api.pagamentos.adminList) {
      Api.pagamentos.adminList({ page: 1, limit: 100 }).then(function (response) {
        var pags = (response && response.pagamentos) ? response.pagamentos : [];
        setEl('relTotalPagamentos', pags.length);
      }).catch(function () { setEl('relTotalPagamentos', '—'); });
    } else {
      setEl('relTotalPagamentos', '—');
    }

    // Agentes
    if (Api.adminAgentes && Api.adminAgentes.list) {
      Api.adminAgentes.list({ page: 1, limit: 100 }).then(function (response) {
        var agentes = (response && response.agentes) ? response.agentes : [];
        var ativos = agentes.filter(function (a) {
          return a.ativo || a.status === 'ATIVO' || a.status === 'ativo';
        }).length;
        setEl('relAgentesAtivos', ativos || agentes.length);

        var topBody = document.getElementById('topAgentesBody');
        if (topBody) {
          var top = agentes.slice(0, 10);
          if (top.length === 0) {
            topBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-gray); padding:1.5rem;">Sem agentes</td></tr>';
          } else {
            topBody.innerHTML = top.map(function (a, i) {
              return '<tr>' +
                '<td><strong>' + (i + 1) + '</strong></td>' +
                '<td>' + (a.nome || a.name || '—') + '</td>' +
                '<td>' + (a.ponto_entrega || a.ponto || '—') + '</td>' +
                '<td>' + (a.entregas || a.total_entregas || '0') + '</td>' +
                '<td><strong>' + (a.pontos || '0') + '</strong></td>' +
                '</tr>';
            }).join('');
          }
        }
      }).catch(function () {
        setEl('relAgentesAtivos', '—');
        var topBody = document.getElementById('topAgentesBody');
        if (topBody) topBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-gray); padding:1.5rem;">Sem dados</td></tr>';
      });
    } else {
      setEl('relAgentesAtivos', '—');
      var topBody = document.getElementById('topAgentesBody');
      if (topBody) topBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-gray); padding:1.5rem;">Sem dados</td></tr>';
    }
  } else {
    setEl('relTotalDocs', '—');
    setEl('relTotalEntregues', '—');
    setEl('relTotalPagamentos', '—');
    setEl('relAgentesAtivos', '—');
  }
})();
