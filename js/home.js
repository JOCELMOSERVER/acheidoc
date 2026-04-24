/* ===========================
   AcheiDoc — Home JS
   =========================== */

(function () {
  // ── Contadores animados ──
  function animateCounter(el, target, duration) {
    var start = 0;
    var increment = target / (duration / 16);
    var timer = setInterval(function () {
      start += increment;
      if (start >= target) {
        start = target;
        clearInterval(timer);
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

  // ── Documentos recentes ──
  var recentGrid = document.getElementById('recentDocs');

  function toLegacyDoc(item) {
    return {
      id: item.id,
      tipo: item.tipo,
      nomeParcial: item.nome_proprietario || 'Proprietário',
      foto: item.foto_url || createDocMockImage(item.tipo || 'Documento', '#dbeafe', '#bfdbfe'),
      localParcial: item.provincia || 'Luanda',
      dataCriacao: item.data_publicacao ? String(item.data_publicacao).slice(0, 10) : new Date().toISOString().slice(0, 10),
      status: item.status || 'PUBLICADO'
    };
  }

  (async function loadRecentDocs() {
    if (!recentGrid) return;

    if (typeof Api !== 'undefined' && Api.documentos && Api.documentos.list) {
      try {
        var response = await Api.documentos.list({ limit: 4, page: 1 });
        var apiDocs = (response && response.documentos ? response.documentos : []).map(toLegacyDoc);
        recentGrid.innerHTML = apiDocs.map(function (d) { return buildDocCard(d, ''); }).join('');
        return;
      } catch (apiErr) {
        // fallback local
      }
    }

    var documentos = typeof getDocumentosData === 'function' ? getDocumentosData() : DOCUMENTOS;
    if (!Array.isArray(documentos)) return;
    var publicados = documentos.filter(function (d) { return d.status === 'PUBLICADO'; }).slice(0, 4);
    if (publicados.length === 0) {
      publicados = documentos.slice(0, 4);
    }
    recentGrid.innerHTML = publicados.map(function (d) { return buildDocCard(d, ''); }).join('');
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
