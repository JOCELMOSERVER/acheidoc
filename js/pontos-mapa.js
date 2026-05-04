/* ===========================
   Encontra já - Pontos no Mapa JS
   =========================== */

(function () {
  var mapFrame = document.getElementById('mapFrame');
  var mapContainer = document.getElementById('map');
  var statusEl = document.getElementById('mapStatus');
  var listaEl = document.getElementById('pontosLista');

  function setStatus(message, kind) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = 'alert ' + (kind || 'alert-info');
  }

  if (!mapFrame && mapContainer && mapContainer.tagName === 'DIV') {
    var iframe = document.createElement('iframe');
    iframe.id = 'mapFrame';
    iframe.title = 'Mapa de pontos de entrega';
    iframe.src = 'https://www.google.com/maps?q=Luanda,Angola&output=embed';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = '0';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    mapContainer.innerHTML = '';
    mapContainer.appendChild(iframe);
    mapFrame = iframe;
  }

  if (!mapFrame) {
    setStatus('Mapa indisponível nesta página.', 'alert-danger');
    return;
  }

  function buildMapUrl(query) {
    return 'https://www.google.com/maps?q=' + encodeURIComponent(String(query || 'Luanda, Angola')) + '&output=embed';
  }

  function focusPointOnMap(ponto) {
    var target = [ponto.nome, ponto.endereco, ponto.municipio, ponto.provincia, 'Angola'].filter(Boolean).join(', ');
    mapFrame.src = buildMapUrl(target);
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function buildList(pontos) {
    if (!listaEl) return;
    if (!pontos.length) {
      listaEl.innerHTML = '<div class="empty-state"><div class="empty-icon">Sem pontos</div><h3>Nenhum ponto activo encontrado</h3></div>';
      return;
    }

    listaEl.innerHTML = pontos.map(function (ponto, index) {
      var nome = escapeHtml(ponto.nome || 'Ponto de Entrega');
      var endereco = escapeHtml(ponto.endereco || '-');
      var horario = escapeHtml(ponto.horario || '-');
      var telefone = escapeHtml(ponto.telefone || '-');
      var agente = escapeHtml(ponto.agente_nome || '-');
      var telHref = String(ponto.telefone || '').replace(/\s/g, '');

      return '' +
        '<div class="card ponto-item" data-index="' + index + '" style="padding:1rem; margin-bottom:0.8rem; border-left:4px solid var(--primary); cursor:pointer;">' +
        '  <div style="display:flex; justify-content:space-between; gap:1rem; align-items:flex-start; flex-wrap:wrap;">' +
        '    <div>' +
        '      <div style="font-size:1rem; font-weight:700; margin-bottom:0.2rem;">' + nome + '</div>' +
        '      <div style="color:var(--text-gray); margin-bottom:0.35rem;">' + endereco + '</div>' +
        '      <div style="font-size:0.92rem;"><strong>Horário:</strong> ' + horario + '</div>' +
        '      <div style="font-size:0.92rem;"><strong>Agente:</strong> ' + agente + '</div>' +
        '    </div>' +
        '    <div style="text-align:right; min-width:150px; display:flex; flex-direction:column; gap:0.45rem; align-items:flex-end;">' +
        '      <div style="font-size:0.92rem; margin-bottom:0.5rem;"><strong>Tel:</strong> ' + telefone + '</div>' +
        '      <button class="btn btn-primary btn-sm" type="button">Ver no mapa</button>' +
        (telHref ? '      <a class="btn btn-outline btn-sm" href="tel:' + escapeHtml(telHref) + '">Ligar</a>' : '') +
        '    </div>' +
        '  </div>' +
        '</div>';
    }).join('');

    listaEl.querySelectorAll('.ponto-item').forEach(function (item) {
      item.addEventListener('click', function () {
        var idx = Number(item.getAttribute('data-index'));
        if (Number.isNaN(idx) || !pontos[idx]) return;
        focusPointOnMap(pontos[idx]);
      });
    });
  }

  async function loadPontos() {
    if (!(typeof Api !== 'undefined' && Api.pontosEntrega && Api.pontosEntrega.list)) {
      setStatus('API de pontos de entrega indisponível.', 'alert-danger');
      return;
    }

    try {
      var response = await Api.pontosEntrega.list();
      var pontos = response && Array.isArray(response.pontos) ? response.pontos : [];
      buildList(pontos);

      if (!pontos.length) {
        setStatus('Nenhum ponto activo disponível no momento.', 'alert-warning');
        mapFrame.src = buildMapUrl('Luanda, Angola');
        return;
      }

      focusPointOnMap(pontos[0]);
      setStatus(pontos.length + ' ponto(s) carregado(s). Clique em "Ver no mapa" para focar cada ponto.', 'alert-success');
    } catch (err) {
      setStatus(err && err.message ? err.message : 'Falha ao carregar pontos de entrega.', 'alert-danger');
    }
  }

  loadPontos();
})();
