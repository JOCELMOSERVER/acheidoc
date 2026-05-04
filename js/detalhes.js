/* ===========================
   Encontra já — Detalhes JS
   =========================== */

(function () {
  var params = new URLSearchParams(window.location.search);
  var docId = params.get('id');
  if (!docId) {
    showNotFound();
    return;
  }

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
      status: item.status,
      codigoResgate: item.codigo_resgate || '',
      taxaKz: 500
    };
  }

  function renderDoc(doc) {
    var fotoEl = document.getElementById('docFoto');
    if (fotoEl) fotoEl.src = doc.foto;

    setEl('docTipo', doc.tipo);
    setEl('docNomeParcial', doc.nomeParcial);
    setEl('docLocalParcial', doc.localParcial);
    setEl('docData', formatDate(doc.dataCriacao));
    setEl('docId', doc.id);
    setEl('docTaxa', doc.taxaKz.toLocaleString('pt-AO') + ' Kz');

    var badgeEl = document.getElementById('docStatusBadge');
    if (badgeEl) {
      badgeEl.textContent = getStatusLabel(doc.status);
      badgeEl.className = 'badge ' + getStatusBadgeClass(doc.status);
    }

    var btnResgatar = document.getElementById('btnResgatar');
    if (btnResgatar) {
      btnResgatar.textContent = 'Resgatar Documento — ' + doc.taxaKz.toLocaleString('pt-AO') + ' Kz';
      btnResgatar.addEventListener('click', function () {
        window.location.href = 'pagamento.html?id=' + doc.id;
      });

      if (doc.status === 'AGUARDANDO_ENTREGA') {
        btnResgatar.textContent = 'Documento no ponto — Pagar e levantar — ' + doc.taxaKz.toLocaleString('pt-AO') + ' Kz';
      } else if (doc.status === 'DISPONIVEL_LEVANTAMENTO') {
        var jaTemCodigoResgate = !!String(doc.codigoResgate || '').trim();
        if (jaTemCodigoResgate) {
          btnResgatar.disabled = true;
          btnResgatar.textContent = 'Pagamento confirmado — Dirija-se ao ponto de entrega';
          btnResgatar.classList.remove('btn-success');
          btnResgatar.classList.add('btn-neutral');
        } else {
          btnResgatar.textContent = 'Documento no ponto — Pagar e levantar — ' + doc.taxaKz.toLocaleString('pt-AO') + ' Kz';
        }
      } else if (doc.status === 'ENTREGUE') {
        btnResgatar.disabled = true;
        btnResgatar.textContent = 'Documento já entregue';
        btnResgatar.classList.remove('btn-success');
        btnResgatar.classList.add('btn-neutral');
      }
    }

    document.title = doc.tipo + ' — Encontra já';
  }

  (async function loadDoc() {
    if (!(typeof Api !== 'undefined' && Api.documentos && Api.documentos.detail)) {
      showNotFound();
      return;
    }

    try {
      var response = await Api.documentos.detail(docId);
      var apiDoc = response && response.documento ? toLegacyDoc(response.documento) : null;
      if (!apiDoc) {
        showNotFound();
        return;
      }
      renderDoc(apiDoc);
    } catch (apiErr) {
      showNotFound();
    }
  })();

  function setEl(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function showNotFound() {
    var content = document.getElementById('docContent');
    if (content) {
      content.innerHTML = `
        <div class="empty-state" style="padding: 4rem">
          <div class="empty-icon">Sem registo</div>
          <h3>Documento não encontrado</h3>
          <p>O documento que procura não existe ou foi removido.</p>
          <a href="buscar.html" class="btn btn-primary mt-3">← Voltar à Busca</a>
        </div>`;
    }
  }
})();
