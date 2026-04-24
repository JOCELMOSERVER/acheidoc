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
  var documentos = typeof getDocumentosData === 'function' ? getDocumentosData() : DOCUMENTOS;
  if (recentGrid && Array.isArray(documentos)) {
    var publicados = documentos.filter(function (d) { return d.status === 'PUBLICADO'; }).slice(0, 4);
    if (publicados.length === 0) {
      publicados = documentos.slice(0, 4);
    }
    recentGrid.innerHTML = publicados.map(function (d) { return buildDocCard(d, ''); }).join('');
  }

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
