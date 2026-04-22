/* ===========================
   AcheiDoc — Agente Validar JS
   =========================== */

(function () {
  // Verificar login
  var agenteLogado = JSON.parse(sessionStorage.getItem('agenteLogado') || 'null');
  if (!agenteLogado) {
    window.location.href = 'login.html';
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var docIdParam = params.get('id');

  // Pré-preencher ID do documento se vier da URL
  var codigoInput = document.getElementById('codigoInput');

  // Botão validar
  var btnValidar = document.getElementById('btnValidar');
  var errorMsg = document.getElementById('errorMsg');
  var checklistSection = document.getElementById('checklistSection');
  var btnAutorizar = document.getElementById('btnAutorizar');
  var confirmSection = document.getElementById('confirmSection');
  var btnConfirmar = document.getElementById('btnConfirmar');
  var successSection = document.getElementById('successSection');

  var checklist = [
    document.getElementById('check1'),
    document.getElementById('check2'),
    document.getElementById('check3')
  ];

  var docValidado = null;

  if (btnValidar) {
    btnValidar.addEventListener('click', function () {
      var codigo = codigoInput ? codigoInput.value.trim().toUpperCase() : '';

      if (!codigo) {
        showError('Por favor, insira o código de resgate.');
        return;
      }

      if (errorMsg) errorMsg.classList.add('hidden');
      if (checklistSection) checklistSection.classList.add('hidden');

      // Verificar código
      if (typeof CODIGOS_RESGATE === 'undefined') return;

      var docIdEncontrado = null;
      Object.keys(CODIGOS_RESGATE).forEach(function (key) {
        if (CODIGOS_RESGATE[key] === codigo) {
          docIdEncontrado = key;
        }
      });

      if (!docIdEncontrado) {
        showError('❌ Código inválido. Verifique e tente novamente.');
        return;
      }

      docValidado = DOCUMENTOS ? DOCUMENTOS.find(function (d) { return d.id === docIdEncontrado; }) : null;

      // Animar checklist
      if (checklistSection) checklistSection.classList.remove('hidden');
      animarChecklist();
    });
  }

  function animarChecklist() {
    checklist.forEach(function (el) {
      if (el) {
        el.querySelector('.check-icon').className = 'check-icon pending';
        el.querySelector('.check-icon').textContent = '○';
      }
    });

    var delays = [400, 900, 1400];
    checklist.forEach(function (el, i) {
      if (!el) return;
      setTimeout(function () {
        el.querySelector('.check-icon').className = 'check-icon success';
        el.querySelector('.check-icon').textContent = '✓';
      }, delays[i]);
    });

    setTimeout(function () {
      if (btnAutorizar) btnAutorizar.classList.remove('hidden');
    }, 1800);
  }

  if (btnAutorizar) {
    btnAutorizar.addEventListener('click', function () {
      if (confirmSection) {
        confirmSection.classList.remove('hidden');
        // Mostrar detalhes do documento
        if (docValidado) {
          var el = document.getElementById('docValidadoInfo');
          if (el) {
            el.innerHTML = `
              <div class="alert alert-info">
                <strong>${docValidado.tipo}</strong> — ${docValidado.nomeParcial}
              </div>`;
          }
        }
      }
    });
  }

  if (btnConfirmar) {
    btnConfirmar.addEventListener('click', function () {
      btnConfirmar.disabled = true;
      btnConfirmar.innerHTML = '<span class="spinner"></span> A registar...';

      setTimeout(function () {
        if (confirmSection) confirmSection.classList.add('hidden');
        if (checklistSection) checklistSection.classList.add('hidden');
        if (successSection) successSection.classList.remove('hidden');
      }, 1000);
    });
  }

  function showError(msg) {
    if (errorMsg) {
      errorMsg.textContent = msg;
      errorMsg.classList.remove('hidden');
    }
    if (checklistSection) checklistSection.classList.add('hidden');
    if (btnAutorizar) btnAutorizar.classList.add('hidden');
    if (confirmSection) confirmSection.classList.add('hidden');
  }
})();
