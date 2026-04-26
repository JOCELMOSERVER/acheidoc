/* ===========================
   AcheiDoc - Pontos no Mapa JS
   =========================== */

(function () {
  var DEFAULT_LAT = -8.8368;
  var DEFAULT_LNG = 13.2343;

  var mapEl = document.getElementById('map');
  var statusEl = document.getElementById('mapStatus');
  var listaEl = document.getElementById('pontosLista');

  function setStatus(message, kind) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = 'alert ' + (kind || 'alert-info');
  }

  if (!mapEl) {
    setStatus('Mapa indisponível nesta página.', 'alert-danger');
    return;
  }

  if (typeof L === 'undefined') {
    setStatus('Não foi possível carregar o mapa. Verifique a ligação e tente novamente.', 'alert-danger');
    return;
  }

  var map = L.map('map').setView([DEFAULT_LAT, DEFAULT_LNG], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  }).addTo(map);

  var pointsLayer = L.featureGroup().addTo(map);

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

    listaEl.innerHTML = pontos.map(function (ponto) {
      var nome = escapeHtml(ponto.nome || 'Ponto de Entrega');
      var endereco = escapeHtml(ponto.endereco || '-');
      var horario = escapeHtml(ponto.horario || '-');
      var telefone = escapeHtml(ponto.telefone || '-');
      var agente = escapeHtml(ponto.agente_nome || '-');
      var telHref = String(ponto.telefone || '').replace(/\s/g, '');

      return '' +
        '<div class="card" style="padding:1rem; margin-bottom:0.8rem; border-left:4px solid var(--primary);">' +
        '  <div style="display:flex; justify-content:space-between; gap:1rem; align-items:flex-start; flex-wrap:wrap;">' +
        '    <div>' +
        '      <div style="font-size:1rem; font-weight:700; margin-bottom:0.2rem;">' + nome + '</div>' +
        '      <div style="color:var(--text-gray); margin-bottom:0.35rem;">' + endereco + '</div>' +
        '      <div style="font-size:0.92rem;"><strong>Horário:</strong> ' + horario + '</div>' +
        '      <div style="font-size:0.92rem;"><strong>Agente:</strong> ' + agente + '</div>' +
        '    </div>' +
        '    <div style="text-align:right; min-width:150px;">' +
        '      <div style="font-size:0.92rem; margin-bottom:0.5rem;"><strong>Tel:</strong> ' + telefone + '</div>' +
        (telHref ? '      <a class="btn btn-outline btn-sm" href="tel:' + escapeHtml(telHref) + '">Ligar</a>' : '') +
        '    </div>' +
        '  </div>' +
        '</div>';
    }).join('');
  }

  function addMarker(ponto, lat, lng) {
    var nome = ponto.nome || 'Ponto de Entrega';
    var endereco = ponto.endereco || '-';
    var horario = ponto.horario || '-';
    var telefone = ponto.telefone || '-';

    var popup =
      '<strong>' + escapeHtml(nome) + '</strong><br>' +
      escapeHtml(endereco) + '<br>' +
      '<small>Horário: ' + escapeHtml(horario) + '</small><br>' +
      '<small>Tel: ' + escapeHtml(telefone) + '</small>';

    L.marker([lat, lng]).addTo(pointsLayer).bindPopup(popup);
  }

  function geocodeAddress(address) {
    var query = encodeURIComponent(String(address || '') + ', Angola');
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timeoutId = controller ? setTimeout(function () { controller.abort(); }, 5000) : null;

    return fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + query, {
      headers: { 'Accept-Language': 'pt' },
      signal: controller ? controller.signal : undefined
    })
      .then(function (r) { return r.json(); })
      .then(function (rows) {
        if (timeoutId) clearTimeout(timeoutId);
        if (!rows || !rows.length) return null;
        return {
          lat: parseFloat(rows[0].lat),
          lng: parseFloat(rows[0].lon)
        };
      })
      .catch(function () {
        if (timeoutId) clearTimeout(timeoutId);
        return null;
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
        map.setView([DEFAULT_LAT, DEFAULT_LNG], 11);
        return;
      }

      setStatus('A localizar ' + pontos.length + ' ponto(s) no mapa...', 'alert-info');
      pointsLayer.clearLayers();

      var geocoded = await Promise.all(pontos.map(function (ponto) {
        return geocodeAddress(ponto.endereco || ponto.nome || 'Luanda');
      }));

      var resolvedCount = 0;
      for (var i = 0; i < pontos.length; i++) {
        var ponto = pontos[i];
        var geo = geocoded[i];
        if (geo && Number.isFinite(geo.lat) && Number.isFinite(geo.lng)) {
          addMarker(ponto, geo.lat, geo.lng);
          resolvedCount += 1;
        } else {
          addMarker(ponto, DEFAULT_LAT, DEFAULT_LNG);
        }
      }

      if (pointsLayer.getLayers().length > 0) {
        map.fitBounds(pointsLayer.getBounds().pad(0.25));
      }

      if (resolvedCount === pontos.length) {
        setStatus(pontos.length + ' ponto(s) carregado(s) com sucesso.', 'alert-success');
      } else {
        setStatus(pontos.length + ' ponto(s) carregado(s). Alguns estão em localização aproximada.', 'alert-warning');
      }
    } catch (err) {
      setStatus(err && err.message ? err.message : 'Falha ao carregar pontos de entrega.', 'alert-danger');
    }
  }

  loadPontos();
})();
