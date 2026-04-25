/* ===========================
   AcheiDoc — Ponto de Entrega JS
   =========================== */

(function () {
  var params = new URLSearchParams(window.location.search);
  var docId = params.get('id');
  var codigo = params.get('codigo');
  var pontoNome = params.get('pontoNome') || '';
  var pontoEndereco = params.get('pontoEndereco') || '';
  var pontoHorario = params.get('pontoHorario') || '';
  var pontoTelefone = params.get('pontoTelefone') || '';
  var pontoAgente = params.get('pontoAgente') || '';

  var btnLigar = document.getElementById('btnLigar');

  // Coordenadas padrão de Luanda
  var DEFAULT_LAT = -8.8368;
  var DEFAULT_LNG = 13.2343;
  var map = null;
  var marker = null;

  function initMap(lat, lng, label) {
    var mapEl = document.getElementById('map');
    if (!mapEl || typeof L === 'undefined') return;

    if (map) {
      map.setView([lat, lng], 15);
      if (marker) marker.setLatLng([lat, lng]).bindPopup(label).openPopup();
      return;
    }

    map = L.map('map').setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(map);

    var icon = L.divIcon({
      html: '<div style="background:var(--primary,#2563eb);color:#fff;width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);"><span style="transform:rotate(45deg);font-size:18px;">📦</span></div>',
      className: '',
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36]
    });

    marker = L.marker([lat, lng], { icon: icon }).addTo(map);
    marker.bindPopup('<strong>' + label + '</strong>').openPopup();
  }

  function geocodeAndInit(address, label) {
    var query = encodeURIComponent(address + ', Angola');
    fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + query, {
      headers: { 'Accept-Language': 'pt' }
    })
      .then(function (r) { return r.json(); })
      .then(function (results) {
        if (results && results.length > 0) {
          initMap(parseFloat(results[0].lat), parseFloat(results[0].lon), label);
        } else {
          initMap(DEFAULT_LAT, DEFAULT_LNG, label + ' (localização aproximada)');
        }
      })
      .catch(function () {
        initMap(DEFAULT_LAT, DEFAULT_LNG, label);
      });
  }

  function applyData(codigoResgate, nome, endereco, horario, telefone, agente) {
    setEl('codigoDisplay', codigoResgate);
    setEl('pontoNome', nome);
    setEl('pontoEndereco', endereco);
    setEl('pontoHorario', horario || '-');
    setEl('pontoTelefone', telefone);
    setEl('pontoAgente', agente || '-');
    if (btnLigar) btnLigar.href = 'tel:' + String(telefone).replace(/\s/g, '');
    geocodeAndInit(endereco, nome);
  }

  if (docId && typeof Api !== 'undefined' && Api.pontosEntrega && Api.pontosEntrega.byDocumento) {
    Api.pontosEntrega.byDocumento(docId).then(function (response) {
      var documento = response && response.documento ? response.documento : null;
      var ponto = response && response.ponto_entrega ? response.ponto_entrega : null;
      if (!documento || !documento.codigo_resgate || !ponto || !ponto.nome || !ponto.endereco || !ponto.telefone) {
        throw new Error('Dados de levantamento indisponíveis.');
      }
      applyData(documento.codigo_resgate, ponto.nome, ponto.endereco, ponto.horario, ponto.telefone, ponto.agente_nome);
    }).catch(function (err) {
      renderError(err && err.message ? err.message : 'Falha ao carregar dados do ponto de entrega.');
    });
    return;
  }

  if (codigo && pontoNome && pontoEndereco && pontoTelefone) {
    applyData(codigo, pontoNome, pontoEndereco, pontoHorario, pontoTelefone, pontoAgente);
    return;
  }

  renderError('Dados reais do ponto de entrega não foram fornecidos.');
  initMap(DEFAULT_LAT, DEFAULT_LNG, 'Luanda, Angola');

  function setEl(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function renderError(message) {
    setEl('pontoNome', 'Indisponível');
    setEl('pontoEndereco', message);
    setEl('pontoHorario', '-');
    setEl('pontoTelefone', '-');
    setEl('pontoAgente', '-');
    if (btnLigar) btnLigar.removeAttribute('href');
  }
})();
