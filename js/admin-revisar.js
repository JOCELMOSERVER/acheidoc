/* ===========================
   AcheiDoc — Admin Revisar JS
   =========================== */

(function () {
  var adminLogado = JSON.parse(sessionStorage.getItem('adminLogado') || 'null');
  if (!adminLogado) {
    window.location.href = 'login.html';
    return;
  }

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

  // Preencher dados
  var docFoto = document.getElementById('docFoto');
  if (docFoto) docFoto.src = doc.foto;

  setEl('docId', doc.id);
  setEl('docData', formatDate(doc.dataCriacao));
  setEl('docTipo', doc.tipo);
  setEl('docNome', doc.nomeParcial);
  setEl('docLocal', doc.localParcial);

  var riscoBadge = document.getElementById('riscoBadge');
  if (riscoBadge) {
    riscoBadge.textContent = getRiscoLabel(doc.risco);
    riscoBadge.className = 'badge ' + getRiscoBadgeClass(doc.risco);
  }

  // Indicador de risco na análise IA
  var iaRisco = document.getElementById('iaRisco');
  if (iaRisco) {
    iaRisco.textContent = getRiscoLabel(doc.risco);
    iaRisco.className = 'badge ' + getRiscoBadgeClass(doc.risco);
  }

  // Botão Aprovar
  var btnAprovar = document.getElementById('btnAprovar');
  if (btnAprovar) {
    btnAprovar.addEventListener('click', function () {
      if (confirm('Confirmar aprovação e publicação do documento ' + doc.id + '?')) {
        doc.status = 'PUBLICADO';
        showSuccessMsg('✅ Documento ' + doc.id + ' aprovado e publicado!', 'success');
        disableActions();
      }
    });
  }

  // Botão Rejeitar
  var btnRejeitar = document.getElementById('btnRejeitar');
  if (btnRejeitar) {
    btnRejeitar.addEventListener('click', function () {
      if (confirm('Confirmar rejeição do documento ' + doc.id + '?')) {
        doc.status = 'REJEITADO';
        showSuccessMsg('❌ Documento ' + doc.id + ' rejeitado.', 'danger');
        disableActions();
      }
    });
  }

  // Botão Corrigir
  var btnCorrigir = document.getElementById('btnCorrigir');
  var corrigirSection = document.getElementById('corrigirSection');
  var btnSalvarCorrecao = document.getElementById('btnSalvarCorrecao');

  if (btnCorrigir && corrigirSection) {
    btnCorrigir.addEventListener('click', function () {
      corrigirSection.classList.toggle('hidden');
    });
  }

  if (btnSalvarCorrecao) {
    btnSalvarCorrecao.addEventListener('click', function () {
      var obs = document.getElementById('obsCorrecao');
      var text = obs ? obs.value.trim() : '';
      if (!text) {
        alert('Por favor, escreva a observação de correcção.');
        return;
      }
      showSuccessMsg('✏️ Correcção registada para o documento ' + doc.id, 'warning');
      if (corrigirSection) corrigirSection.classList.add('hidden');
    });
  }

  function showSuccessMsg(msg, type) {
    var el = document.getElementById('actionResult');
    if (el) {
      el.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
      el.classList.remove('hidden');
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function disableActions() {
    [document.getElementById('btnAprovar'), document.getElementById('btnRejeitar'), document.getElementById('btnCorrigir')].forEach(function (b) {
      if (b) b.disabled = true;
    });
  }

  function showNotFound() {
    var c = document.getElementById('mainContent');
    if (c) c.innerHTML = `<div class="empty-state"><div class="empty-icon">📄</div><h3>Documento não encontrado</h3><p><a href="dashboard.html" class="btn btn-primary mt-3">← Voltar ao Dashboard</a></p></div>`;
  }

  function setEl(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }
})();
