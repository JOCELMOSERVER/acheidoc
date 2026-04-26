/* ===========================
   AcheiDoc — Home JS
   =========================== */

(function () {
  // ── Contadores animados ──
  function animateCounter(el, target, duration) {
    if (!el) return;
    if (el._counterTimer) {
      clearInterval(el._counterTimer);
      el._counterTimer = null;
    }

    var start = 0;
    var safeTarget = Math.max(0, Number(target) || 0);
    var increment = safeTarget / (duration / 16);
    el._counterTimer = setInterval(function () {
      start += increment;
      if (start >= safeTarget) {
        start = safeTarget;
        clearInterval(el._counterTimer);
        el._counterTimer = null;
      }
      el.textContent = Math.floor(start).toLocaleString('pt-AO');
    }, 16);
  }

  var counters = document.querySelectorAll('[data-counter]');
  if (counters.length > 0) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var target = parseInt(el.getAttribute('data-counter'), 10);
          animateCounter(el, target, 1500);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(function (c) { observer.observe(c); });
  }

  function setCounterValue(el, value) {
    if (!el) return;
    var safeValue = Math.max(0, Number(value) || 0);
    el.setAttribute('data-counter', String(safeValue));
    animateCounter(el, safeValue, 900);
  }

  function setCounterUnknown(el) {
    if (!el) return;
    if (el._counterTimer) {
      clearInterval(el._counterTimer);
      el._counterTimer = null;
    }
    el.removeAttribute('data-counter');
    el.textContent = '—';
  }

  function extractTotal(response, arrayKey) {
    if (!response || typeof response !== 'object') return null;

    var directKeys = ['total', 'count', 'total_count', 'totalItems', 'total_items'];
    for (var i = 0; i < directKeys.length; i++) {
      var val = response[directKeys[i]];
      if (typeof val === 'number' && Number.isFinite(val)) return val;
    }

    var containers = ['paginacao', 'pagination', 'meta'];
    for (var j = 0; j < containers.length; j++) {
      var container = response[containers[j]];
      if (container && typeof container === 'object') {
        for (var k = 0; k < directKeys.length; k++) {
          var nestedVal = container[directKeys[k]];
          if (typeof nestedVal === 'number' && Number.isFinite(nestedVal)) return nestedVal;
        }
      }
    }

    if (arrayKey && Array.isArray(response[arrayKey])) {
      return response[arrayKey].length;
    }

    return null;
  }

  async function loadRealStats() {
    var statDocsTotal = document.getElementById('statDocsTotal');
    var statDocsEntregues = document.getElementById('statDocsEntregues');
    var statUsersTotal = document.getElementById('statUsersTotal');
    var statPontosEntrega = document.getElementById('statPontosEntrega');

    if (!(statDocsTotal || statDocsEntregues || statUsersTotal || statPontosEntrega)) return;
    if (typeof Api === 'undefined') return;

    try {
      var docsResp = null;
      var pontosResp = null;
      var usersResp = null;

      if (Api.documentos && Api.documentos.list) {
        docsResp = await Api.documentos.list({ page: 1, limit: 10000 });
      }

      if (Api.pontosEntrega && Api.pontosEntrega.list) {
        pontosResp = await Api.pontosEntrega.list();
      }

      if (Api.adminUtilizadores && Api.adminUtilizadores.list) {
        try {
          usersResp = await Api.adminUtilizadores.list({ page: 1, limit: 1 });
        } catch (err) {
          usersResp = null;
        }
      }

      var docs = docsResp && Array.isArray(docsResp.documentos) ? docsResp.documentos : [];
      var docsTotal = extractTotal(docsResp, 'documentos');
      if (docsTotal === null) docsTotal = docs.length;

      var docsEntregues = docs.filter(function (d) {
        return String((d && d.status) || '').toUpperCase() === 'ENTREGUE';
      }).length;

      var pontosTotal = extractTotal(pontosResp, 'pontos');
      if (pontosTotal === null) {
        pontosTotal = pontosResp && Array.isArray(pontosResp.pontos) ? pontosResp.pontos.length : 0;
      }

      var usersTotal = extractTotal(usersResp, 'utilizadores');

      setCounterValue(statDocsTotal, docsTotal);
      setCounterValue(statDocsEntregues, docsEntregues);
      setCounterValue(statPontosEntrega, pontosTotal);

      if (usersTotal === null) {
        if (usersResp && Array.isArray(usersResp.utilizadores)) {
          setCounterValue(statUsersTotal, usersResp.utilizadores.length);
        } else {
          setCounterUnknown(statUsersTotal);
        }
      } else {
        setCounterValue(statUsersTotal, usersTotal);
      }
    } catch (err) {
      setCounterUnknown(statDocsTotal);
      setCounterUnknown(statDocsEntregues);
      setCounterUnknown(statUsersTotal);
      setCounterUnknown(statPontosEntrega);
    }
  }

  loadRealStats();

  // ── Documentos recentes ──
  var recentGrid = document.getElementById('recentDocs');

  function toLegacyDoc(item) {
    if (!item || !item.id || !item.tipo || !item.nome_proprietario || !item.provincia || !item.data_publicacao) {
      return null;
    }

    return {
      id: item.id,
      tipo: item.tipo,
      nomeParcial: item.nome_proprietario,
      foto: item.foto_url,
      localParcial: item.provincia,
      dataCriacao: String(item.data_publicacao).slice(0, 10),
      status: item.status
    };
  }

  (async function loadRecentDocs() {
    if (!recentGrid) return;

    if (!(typeof Api !== 'undefined' && Api.documentos && Api.documentos.list)) {
      recentGrid.innerHTML = '<p class="text-gray">API de documentos indisponível.</p>';
      return;
    }

    try {
      var response = await Api.documentos.list({ limit: 4, page: 1 });
      var apiDocs = (response && response.documentos ? response.documentos : []).map(toLegacyDoc).filter(Boolean);
      recentGrid.innerHTML = apiDocs.map(function (d) { return buildDocCard(d, ''); }).join('');
    } catch (apiErr) {
      recentGrid.innerHTML = '<p class="text-gray">Não foi possível carregar documentos recentes.</p>';
    }
  })();

  // ── Busca rápida ──
  var quickSearchForm = document.getElementById('quickSearchForm');
  if (quickSearchForm) {
    quickSearchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = document.getElementById('quickSearchInput').value.trim();
      if (q) {
        window.location.href = 'buscar.html?q=' + encodeURIComponent(q);
      } else {
        window.location.href = 'buscar.html';
      }
    });
  }
})();
