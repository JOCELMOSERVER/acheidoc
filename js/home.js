/* ===========================
   AcheiDoc — Home JS
   =========================== */

(function () {
  var user = (typeof Auth !== 'undefined') ? Auth.getUser() : null;

  // ── Dois estados: visitante / logado ──
  var secaoVisitante = document.getElementById('secaoVisitante');
  var secaoLogado = document.getElementById('secaoLogado');

  if (user && user.role === 'utilizador') {
    // Utilizador logado: mostrar dashboard
    if (secaoVisitante) secaoVisitante.style.display = 'none';
    if (secaoLogado) secaoLogado.style.display = 'block';

    // Preencher nome e pontos
    var nomeEl = document.getElementById('nomeUtilizador');
    if (nomeEl) nomeEl.textContent = user.nome.split(' ')[0];

    var pontosEl = document.getElementById('pontosUtilizador');
    if (pontosEl) pontosEl.textContent = (user.pontos || 0).toLocaleString('pt-AO');

    // Renderizar documentos recentes
    renderizarDocumentosRecentes();

    // Busca rápida
    var quickSearchForm = document.getElementById('quickSearchForm');
    if (quickSearchForm) {
      quickSearchForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var q = document.getElementById('quickSearchInput').value.trim();
        window.location.href = q ? 'buscar.html?q=' + encodeURIComponent(q) : 'buscar.html';
      });
    }
  } else {
    // Visitante: mostrar landing page
    if (secaoVisitante) secaoVisitante.style.display = 'block';
    if (secaoLogado) secaoLogado.style.display = 'none';

    // Animação de contadores para estatísticas
    iniciarContadores();
  }

  function renderizarDocumentosRecentes() {
    var recentGrid = document.getElementById('recentDocs');
    if (recentGrid && typeof DOCUMENTOS !== 'undefined') {
      var publicados = DOCUMENTOS.filter(function (d) { return d.status === 'PUBLICADO'; }).slice(0, 4);
      if (publicados.length === 0) publicados = DOCUMENTOS.slice(0, 4);
      recentGrid.innerHTML = publicados.map(function (d) { return buildDocCard(d, ''); }).join('');
    }
  }

  function iniciarContadores() {
    var counters = document.querySelectorAll('[data-counter]');
    if (counters.length === 0) return;

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
})();
