/* ===========================
   AcheiDoc — Publicar JS
   =========================== */

(function () {
  Auth.requireAuth();

  var currentStep = 1;
  var totalSteps = 3;
  var formData = {};

  var steps = [
    document.getElementById('step1'),
    document.getElementById('step2'),
    document.getElementById('step3')
  ];

  var stepCircles = document.querySelectorAll('.step-circle');
  var stepLabels = document.querySelectorAll('.step-label');
  var stepLines = document.querySelectorAll('.step-line');

  function showStep(n) {
    steps.forEach(function (s, i) {
      if (!s) return;
      s.classList.toggle('hidden', i + 1 !== n);
    });

    stepCircles.forEach(function (c, i) {
      c.classList.remove('active', 'done');
      if (i + 1 < n) c.classList.add('done');
      else if (i + 1 === n) c.classList.add('active');
    });

    stepLabels.forEach(function (l, i) {
      l.classList.remove('active', 'done');
      if (i + 1 < n) l.classList.add('done');
      else if (i + 1 === n) l.classList.add('active');
    });

    stepLines.forEach(function (l, i) {
      l.classList.toggle('done', i + 1 < n);
    });

    currentStep = n;
  }

  // Passo 1 → 2
  var btnNext1 = document.getElementById('btnNext1');
  if (btnNext1) {
    btnNext1.addEventListener('click', function () {
      var tipo = document.getElementById('tipoDoc') ? document.getElementById('tipoDoc').value : '';
      var nome = document.getElementById('nomeDoc') ? document.getElementById('nomeDoc').value.trim() : '';
      var descricao = document.getElementById('descricaoDoc') ? document.getElementById('descricaoDoc').value.trim() : '';

      if (!tipo || !nome) {
        alert('Por favor, preencha o tipo e o nome que aparece no documento.');
        return;
      }

      formData.tipo = tipo;
      formData.nome = nome;
      formData.descricao = descricao;
      showStep(2);
    });
  }

  // Passo 2 → 1
  var btnPrev2 = document.getElementById('btnPrev2');
  if (btnPrev2) {
    btnPrev2.addEventListener('click', function () { showStep(1); });
  }

  // Passo 2 → 3
  var btnNext2 = document.getElementById('btnNext2');
  if (btnNext2) {
    btnNext2.addEventListener('click', function () {
      var local = document.getElementById('localDoc') ? document.getElementById('localDoc').value.trim() : '';
      var municipio = document.getElementById('municipioDoc') ? document.getElementById('municipioDoc').value : '';

      if (!local || !municipio) {
        alert('Por favor, preencha o local onde foi encontrado e o município.');
        return;
      }

      formData.local = local;
      formData.municipio = municipio;

      // Preencher revisão
      buildReview();
      showStep(3);
    });
  }

  // Passo 3 → 2
  var btnPrev3 = document.getElementById('btnPrev3');
  if (btnPrev3) {
    btnPrev3.addEventListener('click', function () { showStep(2); });
  }

  // Upload da foto com preview
  var fotoInput = document.getElementById('fotoInput');
  var fotoPreview = document.getElementById('fotoPreview');
  var fotoPreviewImg = document.getElementById('fotoPreviewImg');

  if (fotoInput && fotoPreview && fotoPreviewImg) {
    fotoInput.addEventListener('change', function () {
      var file = fotoInput.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function (e) {
        fotoPreviewImg.src = e.target.result;
        fotoPreview.classList.remove('hidden');
        formData.fotoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // Preencher resumo
  function buildReview() {
    setEl('reviewTipo', formData.tipo || '');
    setEl('reviewNome', formData.nome ? mascaraNome(formData.nome) : '');
    setEl('reviewDescricao', formData.descricao || '');
    setEl('reviewLocal', formData.local ? (formData.local + ', ' + (formData.municipio || '')) : '');
  }

  function mascaraNome(nome) {
    var parts = nome.trim().split(' ');
    return parts.map(function (p, i) {
      if (i === 0) return p;
      if (p.length <= 1) return p + '*';
      return p[0] + '*'.repeat(p.length - 1);
    }).join(' ');
  }

  // Publicar
  var btnPublicar = document.getElementById('btnPublicar');
  var formContainer = document.getElementById('formContainer');
  var successContainer = document.getElementById('successContainer');
  var newDocId = document.getElementById('newDocId');
  var recomendadoPontoNome = document.getElementById('recomendadoPontoNome');
  var recomendadoAgente = document.getElementById('recomendadoAgente');
  var recomendadoEndereco = document.getElementById('recomendadoEndereco');
  var recomendadoHorario = document.getElementById('recomendadoHorario');
  var recomendadoTelefone = document.getElementById('recomendadoTelefone');
  var chaveEntregaCode = document.getElementById('chaveEntregaCode');
  var btnCopiarChaveEntrega = document.getElementById('btnCopiarChaveEntrega');

  if (btnPublicar) {
    btnPublicar.addEventListener('click', async function () {
      btnPublicar.disabled = true;
      btnPublicar.innerHTML = '<span class="spinner"></span> A publicar...';

      setTimeout(async function () {
        var id = '';
        var ponto = null;
        var chaveEntrega = '';

        if (!(typeof Api !== 'undefined' && Api.documentos && Api.documentos.createWithFile)) {
          alert('API de documentos indisponível.');
          btnPublicar.disabled = false;
          btnPublicar.textContent = 'Publicar Documento';
          return;
        }

        try {
          var formDataAPI = new FormData();
          formDataAPI.append('tipo', formData.tipo);
          formDataAPI.append('nome_proprietario', formData.nome);
          formDataAPI.append('morada', formData.local);
          formDataAPI.append('provincia', formData.municipio);
          
          if (fotoInput && fotoInput.files && fotoInput.files[0]) {
            formDataAPI.append('foto', fotoInput.files[0]);
          }

          var response = await Api.documentos.createWithFile(formDataAPI);

          if (response && response.documento && response.documento.id) {
            id = response.documento.id;
          }

          if (response && response.chave_entrega) {
            chaveEntrega = response.chave_entrega;
          } else if (response && response.documento && response.documento.chave_entrega) {
            chaveEntrega = response.documento.chave_entrega;
          }

          if (response && response.ponto_entrega) {
            ponto = response.ponto_entrega;
          }

          if (!id || !chaveEntrega || !ponto || !ponto.nome || !ponto.endereco || !ponto.telefone) {
            throw new Error('Resposta incompleta do servidor ao publicar documento.');
          }
        } catch (apiErr) {
          alert(apiErr && apiErr.message ? apiErr.message : 'Falha ao publicar no servidor.');
          btnPublicar.disabled = false;
          btnPublicar.textContent = 'Publicar Documento';
          return;
        }

        setEl('recomendadoPontoNome', ponto.nome);
        setEl('recomendadoAgente', 'Agente responsável: ' + (ponto.agente_nome || ponto.agente || ''));
        setEl('recomendadoEndereco', ponto.endereco);
        setEl('recomendadoHorario', 'Horário: ' + ponto.horario);
        setEl('recomendadoTelefone', 'Telefone: ' + ponto.telefone);

        if (formContainer) formContainer.classList.add('hidden');
        if (successContainer) successContainer.classList.remove('hidden');
        if (newDocId) newDocId.textContent = id;
        if (chaveEntregaCode) chaveEntregaCode.textContent = chaveEntrega;
      }, 1500);
    });
  }

  if (btnCopiarChaveEntrega) {
    btnCopiarChaveEntrega.addEventListener('click', function () {
      if (!chaveEntregaCode || !chaveEntregaCode.textContent) return;
      if (!navigator.clipboard) {
        alert('Cópia indisponível neste navegador.');
        return;
      }
      navigator.clipboard.writeText(chaveEntregaCode.textContent).then(function () {
        btnCopiarChaveEntrega.textContent = 'Copiado';
        setTimeout(function () { btnCopiarChaveEntrega.textContent = 'Copiar'; }, 1500);
      });
    });
  }

  function setEl(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  // Iniciar no passo 1
  showStep(1);
})();
