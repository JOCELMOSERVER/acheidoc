/* ===========================
   AcheiDoc — Detalhes JS
   =========================== */

(function () {
  var params = new URLSearchParams(window.location.search);
  var docId = params.get('id');

  if (!docId || typeof DOCUMENTOS === 'undefined') {
    showNotFound();
    return;
  }

  var doc = DOCUMENTOS.find(function (d) { return d.id === docId; });
  if (!doc) {
    showNotFound();
    return;
  }

  // Foto
  var fotoEl = document.getElementById('docFoto');
  if (fotoEl) fotoEl.src = doc.foto;

  // Info
  setEl('docTipo', doc.tipo);
  setEl('docNomeParcial', doc.nomeParcial);
  setEl('docLocalParcial', doc.localParcial);
  setEl('docData', formatDate(doc.dataCriacao));
  setEl('docId', doc.id);
  setEl('docTaxa', doc.taxaKz.toLocaleString('pt-AO') + ' Kz');

  // Badge de status
  var badgeEl = document.getElementById('docStatusBadge');
  if (badgeEl) {
    badgeEl.textContent = getStatusLabel(doc.status);
    badgeEl.className = 'badge ' + getStatusBadgeClass(doc.status);
  }

  // Botão resgatar — verificar autenticação antes de ir para pagamento
  var btnResgatar = document.getElementById('btnResgatar');
  if (btnResgatar) {
    btnResgatar.textContent = 'Resgatar Documento — ' + doc.taxaKz.toLocaleString('pt-AO') + ' Kz';
    btnResgatar.addEventListener('click', function () {
      if (typeof Auth !== 'undefined' && !Auth.isLoggedIn()) {
        window.location.href = 'login.html?redirect=' + encodeURIComponent('pagamento.html?id=' + encodeURIComponent(doc.id));
        return;
      }
      window.location.href = 'pagamento.html?id=' + encodeURIComponent(doc.id);
    });

    // Desabilitar se já entregue
    if (doc.status === 'ENTREGUE') {
      btnResgatar.disabled = true;
      btnResgatar.textContent = '✅ Documento já entregue';
      btnResgatar.classList.remove('btn-success');
      btnResgatar.classList.add('btn-neutral');
    }
  }

  // Título da página
  document.title = doc.tipo + ' — AcheiDoc';

  function setEl(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function showNotFound() {
    var content = document.getElementById('docContent');
    if (content) {
      content.innerHTML = `
        <div class="empty-state" style="padding: 4rem">
          <div class="empty-icon">📄</div>
          <h3>Documento não encontrado</h3>
          <p>O documento que procura não existe ou foi removido.</p>
          <a href="buscar.html" class="btn btn-primary mt-3">← Voltar à Busca</a>
        </div>`;
    }
  }
})();
