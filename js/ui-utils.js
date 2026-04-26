/* ===========================
   AcheiDoc — UI Utils
   =========================== */

(function () {
  function getStatusLabel(status) {
    var map = {
      PENDENTE: 'Pendente',
      CORRECAO_SOLICITADA: 'Correcao Solicitada',
      PUBLICADO: 'Publicado',
      AGUARDANDO_ENTREGA: 'Aguardando Entrega',
      DISPONIVEL_LEVANTAMENTO: 'Disponivel p/ Levantamento',
      ENTREGUE: 'Entregue',
      REJEITADO: 'Rejeitado'
    };
    return map[status] || status || '';
  }

  function getStatusBadgeClass(status) {
    var map = {
      PENDENTE: 'badge-pendente',
      CORRECAO_SOLICITADA: 'badge-aguardando',
      PUBLICADO: 'badge-publicado',
      AGUARDANDO_ENTREGA: 'badge-aguardando',
      DISPONIVEL_LEVANTAMENTO: 'badge-disponivel',
      ENTREGUE: 'badge-entregue',
      REJEITADO: 'badge-rejeitado'
    };
    return map[status] || 'badge-pendente';
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    var date = new Date(String(dateStr));
    if (Number.isNaN(date.getTime())) {
      date = new Date(String(dateStr) + 'T00:00:00');
    }
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('pt-AO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function buildDocCard(doc, basePath) {
    var d = doc || {};
    var statusClass = getStatusBadgeClass(d.status);
    var statusLabel = getStatusLabel(d.status);
    var detalhesUrl = (basePath || '') + 'detalhes.html?id=' + encodeURIComponent(d.id || '');
    return '' +
      '<div class="card-doc">' +
      '  <div class="card-doc-img">' +
      '    <img src="' + (d.foto || '') + '" alt="' + (d.tipo || 'Documento') + '" loading="lazy">' +
      '    <div class="card-doc-watermark"><span>Marca D\'Água</span></div>' +
      '  </div>' +
      '  <div class="card-doc-body">' +
      '    <div class="card-doc-title">' + (d.tipo || '') + '</div>' +
      '    <div class="card-doc-meta">👤 ' + (d.nomeParcial || '') + '</div>' +
      '    <div class="card-doc-meta">📍 ' + (d.localParcial || '') + '</div>' +
      '    <div class="card-doc-meta">📅 ' + formatDate(d.dataCriacao) + '</div>' +
      '  </div>' +
      '  <div class="card-doc-footer">' +
      '    <span class="badge ' + statusClass + '">' + statusLabel + '</span>' +
      '    <a href="' + detalhesUrl + '" class="btn btn-primary btn-sm">Ver Detalhes</a>' +
      '  </div>' +
      '</div>';
  }

  window.getStatusLabel = getStatusLabel;
  window.getStatusBadgeClass = getStatusBadgeClass;
  window.formatDate = formatDate;
  window.buildDocCard = buildDocCard;
})();
// Add Risco label and badge functions if not exists
if (typeof window.getRiscoLabel === 'undefined') {
  window.getRiscoLabel = function(risco) {
    var map = {
      BAIXO: 'Baixo',
      MEDIO: 'Médio',
      ALTO: 'Alto'
    };
    return map[risco] || risco || '';
  };
}

if (typeof window.getRiscoBadgeClass === 'undefined') {
  window.getRiscoBadgeClass = function(risco) {
    var map = {
      BAIXO: 'badge-entregue',
      MEDIO: 'badge-aguardando',
      ALTO: 'badge-rejeitado'
    };
    return map[risco] || 'badge-pendente';
  };
}
