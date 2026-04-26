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

  var viewedCounters = new WeakSet();
  var counters = document.querySelectorAll('[data-counter]');
  if (counters.length > 0) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var target = parseInt(el.getAttribute('data-counter'), 10);
          viewedCounters.add(el);
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

    if (viewedCounters.has(el)) {
      animateCounter(el, safeValue, 900);
    }
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

  function countUniquePublishers(documentos) {
    if (!Array.isArray(documentos) || !documentos.length) return 0;
    var keys = ['publicado_por_id', 'utilizador_id', 'user_id', 'publicado_por_email', 'publicado_por_nome'];
    var set = new Set();

    documentos.forEach(function (d) {
      for (var i = 0; i < keys.length; i++) {
        var v = d ? d[keys[i]] : null;
        if (v !== null && v !== undefined && String(v).trim() !== '') {
          set.add(String(v));
          return;
        }
      }
    });

    return set.size;
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
        docsResp = await Api.documentos.list({ page: 1, limit: 500 });
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
      if (usersTotal === null) {
        usersTotal = countUniquePublishers(docs);
      }

      setCounterValue(statDocsTotal, docsTotal);
      setCounterValue(statDocsEntregues, docsEntregues);
      setCounterValue(statUsersTotal, usersTotal);
      setCounterValue(statPontosEntrega, pontosTotal);
    } catch (err) {
      // Mantém zeros quando a API não estiver disponível.
    }
  }

  loadRealStats();

  // ── Documentos recentes ──
  var recentGrid = document.getElementById('recentDocs');

  function defaultDocImage() {
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="480"><rect width="100%" height="100%" fill="%23e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="28" fill="%236b7280">Documento</text></svg>';
  }

  function toLegacyDoc(item) {
    return {
      id: item.id,
      tipo: item.tipo,
      nomeParcial: item.nome_proprietario || 'Proprietário',
      foto: item.foto_url || defaultDocImage(),
      localParcial: item.provincia || 'Luanda',
      dataCriacao: item.data_publicacao ? String(item.data_publicacao).slice(0, 10) : new Date().toISOString().slice(0, 10),
      status: item.status || 'PUBLICADO'
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
      var apiDocs = (response && response.documentos ? response.documentos : []).map(toLegacyDoc);
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
