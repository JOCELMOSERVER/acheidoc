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
        formData.fotoUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // Preencher resumo
  function buildReview() {
    setEl('reviewTipo', formData.tipo || '—');
    setEl('reviewNome', formData.nome ? mascaraNome(formData.nome) : '—');
    setEl('reviewDescricao', formData.descricao || '—');
    setEl('reviewLocal', formData.local ? (formData.local + ', ' + (formData.municipio || '')) : '—');
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

  if (btnPublicar) {
    btnPublicar.addEventListener('click', async function () {
      btnPublicar.disabled = true;
      btnPublicar.innerHTML = '<span class="spinner"></span> A publicar...';

      setTimeout(async function () {
        var id = 'DOC-2026-' + String(Math.floor(Math.random() * 999999)).padStart(6, '0');
        var ponto = getNearestPoint(formData.municipio);
        var utilizador = typeof Auth !== 'undefined' && typeof Auth.getUser === 'function'
          ? Auth.getUser()
          : null;

        if (typeof Api !== 'undefined' && Api.documentos && Api.documentos.create) {
          try {
            var response = await Api.documentos.create({
              tipo: formData.tipo,
              nome_proprietario: formData.nome,
              morada: formData.local,
              provincia: formData.municipio,
              foto_url: formData.fotoUrl || null
            });

            if (response && response.documento && response.documento.id) {
              id = response.documento.id;
            }
          } catch (apiErr) {
            alert(apiErr && apiErr.message ? apiErr.message : 'Falha ao publicar no servidor.');
            btnPublicar.disabled = false;
            btnPublicar.textContent = 'Publicar Documento';
            return;
          }
        } else if (typeof getDocumentosData === 'function' && typeof saveDocumentosData === 'function') {
          var documentos = getDocumentosData();
          documentos.unshift({
            id: id,
            tipo: formData.tipo,
            nomeCompleto: formData.nome,
            nomeParcial: mascaraNome(formData.nome),
            foto: formData.fotoUrl || createDocMockImage(formData.tipo || 'Documento', '#dbeafe', '#bfdbfe'),
            localEncontrado: formData.local + ', ' + formData.municipio,
            localParcial: formData.local + ', ' + formData.municipio,
            dataCriacao: new Date().toISOString().split('T')[0],
            status: 'PENDENTE',
            risco: 'MEDIO',
            taxaKz: 500,
            pontoEntregaId: ponto.id || 1,
            encontradoPor: utilizador && utilizador.nome ? utilizador.nome : 'Utilizador AcheiDoc',
            contactoEncontrador: utilizador && utilizador.telefone ? utilizador.telefone : '+244 000 000 000'
          });
          saveDocumentosData(documentos);
        }

        setEl('recomendadoPontoNome', ponto.nome);
        setEl('recomendadoAgente', 'Agente responsável: ' + ponto.agente);
        setEl('recomendadoEndereco', ponto.endereco);
        setEl('recomendadoHorario', 'Horário: ' + ponto.horario);
        setEl('recomendadoTelefone', 'Telefone: ' + ponto.telefone);

        if (formContainer) formContainer.classList.add('hidden');
        if (successContainer) successContainer.classList.remove('hidden');
        if (newDocId) newDocId.textContent = id;
      }, 1500);
    });
  }

  function normalizeText(value) {
    return (value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function getNearestPoint(municipio) {
    if (!Array.isArray(PONTOS_ENTREGA) || PONTOS_ENTREGA.length === 0) {
      return {
        nome: 'Ponto de entrega a definir',
        agente: 'Equipa AcheiDoc',
        endereco: 'Confirme no suporte o ponto disponível.',
        horario: 'Seg–Sex: 08h–17h',
        telefone: '+244 000 000 000'
      };
    }

    var municipioNorm = normalizeText(municipio);
    var pontoExato = PONTOS_ENTREGA.find(function (p) {
      var nomeNorm = normalizeText(p.nome);
      var enderecoNorm = normalizeText(p.endereco);
      return nomeNorm.includes(municipioNorm) || enderecoNorm.includes(municipioNorm);
    });

    if (pontoExato) return pontoExato;
    return PONTOS_ENTREGA[0];
  }

  function setEl(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  // Iniciar no passo 1
  showStep(1);
})();
