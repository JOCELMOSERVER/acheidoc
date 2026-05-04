/* ===========================
   AcheiDoc — Publicar JS
   =========================== */

(function () {
  Auth.requireAuth();

  var currentStep = 1;
  var totalSteps = 3;
  var formData = {};
  var extraDocIndex = 0;

  var docTypeOptions = [
    'Bilhete de Identidade',
    'Carta de Condução',
    'Passaporte',
    'Cartão Bancário',
    'Cartão de Estudante',
    'Outro'
  ];

  var steps = [
    document.getElementById('step1'),
    document.getElementById('step2'),
    document.getElementById('step3')
  ];

  var stepCircles = document.querySelectorAll('.step-circle');
  var stepLabels = document.querySelectorAll('.step-label');
  var stepLines = document.querySelectorAll('.step-line');

  var multiDocsToggle = document.getElementById('multiDocsToggle');
  var multiDocsSection = document.getElementById('multiDocsSection');
  var extraDocsContainer = document.getElementById('extraDocsContainer');
  var btnAddExtraDoc = document.getElementById('btnAddExtraDoc');

  function getTipoOptionsHtml(selectedValue) {
    return '<option value="">Seleccione o tipo...</option>' + docTypeOptions.map(function (tipo) {
      return '<option value="' + tipo + '"' + (selectedValue === tipo ? ' selected' : '') + '>' + tipo + '</option>';
    }).join('');
  }

  function createExtraDocRow(initialData) {
    if (!extraDocsContainer) return;

    extraDocIndex += 1;
    var row = document.createElement('div');
    row.className = 'card mb-2';
    row.setAttribute('data-extra-doc-id', String(extraDocIndex));
    row.style.padding = '1rem';
    row.style.boxShadow = 'none';
    row.style.border = '1px solid var(--border)';

    var initialTipo = initialData && initialData.tipo ? initialData.tipo : '';
    var initialNome = initialData && initialData.nome ? initialData.nome : '';

    row.innerHTML =
      '<div style="display:grid; grid-template-columns: 1fr 1fr auto; gap:0.6rem; align-items:end;">' +
      '  <div>' +
      '    <label class="form-label">Tipo *</label>' +
      '    <select class="form-select extra-doc-tipo">' + getTipoOptionsHtml(initialTipo) + '</select>' +
      '  </div>' +
      '  <div>' +
      '    <label class="form-label">Nome no documento *</label>' +
      '    <input type="text" class="form-input extra-doc-nome" value="' + initialNome.replace(/"/g, '&quot;') + '" placeholder="Ex: Carlos Alberto Ferreira">' +
      '  </div>' +
      '  <button type="button" class="btn btn-danger btn-sm btn-remove-extra-doc">Remover</button>' +
      '</div>';

    extraDocsContainer.appendChild(row);

    var btnRemove = row.querySelector('.btn-remove-extra-doc');
    if (btnRemove) {
      btnRemove.addEventListener('click', function () {
        row.remove();
      });
    }
  }

  function collectExtraDocs() {
    if (!(multiDocsToggle && multiDocsToggle.checked && extraDocsContainer)) return [];

    var rows = Array.prototype.slice.call(extraDocsContainer.querySelectorAll('[data-extra-doc-id]'));
    var extras = [];

    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var tipoEl = row.querySelector('.extra-doc-tipo');
      var nomeEl = row.querySelector('.extra-doc-nome');
      var tipo = tipoEl ? String(tipoEl.value || '').trim() : '';
      var nome = nomeEl ? String(nomeEl.value || '').trim() : '';

      if (!tipo || !nome) {
        return { error: 'Preencha tipo e nome em todos os documentos adicionais.' };
      }

      extras.push({ tipo: tipo, nome: nome });
    }

    return extras;
  }

  if (multiDocsToggle && multiDocsSection) {
    multiDocsToggle.addEventListener('change', function () {
      multiDocsSection.classList.toggle('hidden', !multiDocsToggle.checked);
      if (multiDocsToggle.checked && extraDocsContainer && !extraDocsContainer.children.length) {
        createExtraDocRow();
      }
      if (!multiDocsToggle.checked && extraDocsContainer) {
        extraDocsContainer.innerHTML = '';
      }
    });
  }

  if (btnAddExtraDoc) {
    btnAddExtraDoc.addEventListener('click', function () {
      createExtraDocRow();
    });
  }

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

      var extras = collectExtraDocs();
      if (extras && extras.error) {
        alert(extras.error);
        return;
      }
      formData.extraDocs = Array.isArray(extras) ? extras : [];

      showStep(2);
    });
  }

  // ── DETECÇÃO DE DISPOSITIVO ──
  function isMobileDevice() {
    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
      ('ontouchstart' in window && navigator.maxTouchPoints > 0 && window.innerWidth <= 1024);
  }

  var cameraBlock       = document.getElementById('cameraBlock');
  var uploadBlock       = document.getElementById('uploadBlock');
  var cameraStart       = document.getElementById('cameraStart');
  var cameraLive        = document.getElementById('cameraLive');
  var cameraVideo       = document.getElementById('cameraVideo');
  var cameraCanvas      = document.getElementById('cameraCanvas');
  var btnAbrirCamera    = document.getElementById('btnAbrirCamera');
  var btnCapturar       = document.getElementById('btnCapturar');
  var btnCancelarCamera = document.getElementById('btnCancelarCamera');
  var fotoFileInput     = document.getElementById('fotoFileInput');
  var blurProcessing    = document.getElementById('blurProcessing');
  var blurStatus        = document.getElementById('blurStatus');
  var fotoPreviewWrap   = document.getElementById('fotoPreviewWrap');
  var fotoPreviewImg    = document.getElementById('fotoPreviewImg');
  var blurRegionLabels  = document.getElementById('blurRegionLabels');
  var btnNovaFoto       = document.getElementById('btnNovaFoto');
  var fotoHint          = document.getElementById('fotoHint');
  var cameraStream      = null;

  // Inicializar modo correcto
  (function initFotoMode() {
    if (isMobileDevice()) {
      if (cameraBlock) cameraBlock.style.display = '';
      if (uploadBlock) uploadBlock.style.display = 'none';
      if (fotoHint) fotoHint.textContent = 'Apenas fotos tiradas na hora são aceites.';
    } else {
      if (cameraBlock) cameraBlock.style.display = 'none';
      if (uploadBlock) uploadBlock.style.display = '';
      if (fotoHint) fotoHint.textContent = 'Formatos aceites: JPG, PNG, WEBP. Tamanho máximo: 10 MB.';
    }
  })();

  function stopCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach(function(t) { t.stop(); });
      cameraStream = null;
    }
    if (cameraVideo) cameraVideo.srcObject = null;
  }

  function openCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('O seu browser não suporta acesso à câmara. Use o Chrome ou Safari actualizados.');
      return;
    }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then(function(stream) {
        cameraStream = stream;
        cameraVideo.srcObject = stream;
        cameraStart.style.display = 'none';
        cameraLive.style.display = '';
        fotoPreviewWrap.style.display = 'none';
      })
      .catch(function(err) {
        var msg = 'Não foi possível aceder à câmara.';
        if (err.name === 'NotAllowedError') msg = 'Permissão de câmara negada. Active nas definições do browser.';
        else if (err.name === 'NotFoundError') msg = 'Nenhuma câmara encontrada neste dispositivo.';
        alert(msg);
      });
  }

  function capturePhoto() {
    if (!cameraVideo || !cameraCanvas) return;
    var w = cameraVideo.videoWidth;
    var h = cameraVideo.videoHeight;
    if (!w || !h) { alert('Aguarde a câmara inicializar.'); return; }
    cameraCanvas.width = w;
    cameraCanvas.height = h;
    cameraCanvas.getContext('2d').drawImage(cameraVideo, 0, 0, w, h);
    var dataUrl = cameraCanvas.toDataURL('image/jpeg', 0.88);
    stopCamera();
    if (cameraLive) cameraLive.style.display = 'none';
    processAndShowFoto(dataUrl);
  }

  function dataURLtoBlob(dataURL) {
    var arr = dataURL.split(',');
    var mime = arr[0].match(/:(.*?);/)[1];
    var bstr = atob(arr[1]);
    var n = bstr.length;
    var u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
  }

  // ── PROCESSAMENTO AUTOMÁTICO ──
  function processAndShowFoto(originalDataUrl) {
    if (uploadBlock) uploadBlock.style.display = 'none';
    if (cameraBlock) cameraBlock.style.display = 'none';
    if (blurProcessing) blurProcessing.style.display = '';
    if (fotoPreviewWrap) fotoPreviewWrap.style.display = 'none';

    var docTipo = formData.tipo || 'Outro';

    AutoBlur.process(originalDataUrl, docTipo, function(statusMsg) {
      if (blurStatus) blurStatus.textContent = statusMsg;
    }).then(function(result) {
      formData.fotoDataUrl = result.blurredDataUrl;
      formData.fotoBlob = dataURLtoBlob(result.blurredDataUrl);
      formData.fotoOriginalDataUrl = originalDataUrl;

      if (fotoPreviewImg) fotoPreviewImg.src = result.blurredDataUrl;

      if (blurRegionLabels) {
        if (result.regions && result.regions.length > 0) {
          blurRegionLabels.innerHTML = '<p style="font-size:0.85rem; color:var(--text-gray); margin-bottom:0.4rem;">Zonas com protecção aplicada:</p>' +
            result.regions.map(function(r) {
              return '<span style="display:inline-block; background:#F3F4F6; border:1px solid var(--border); border-radius:20px; font-size:0.78rem; padding:3px 10px; margin:2px;">' + r.label + '</span>';
            }).join(' ');
        } else {
          blurRegionLabels.innerHTML = '<p style="font-size:0.85rem; color:var(--text-gray);">Nenhuma zona protegida identificada.</p>';
        }
      }

      if (blurProcessing) blurProcessing.style.display = 'none';
      if (fotoPreviewWrap) fotoPreviewWrap.style.display = '';
    }).catch(function() {
      formData.fotoDataUrl = originalDataUrl;
      formData.fotoBlob = dataURLtoBlob(originalDataUrl);
      if (fotoPreviewImg) fotoPreviewImg.src = originalDataUrl;
      if (blurRegionLabels) blurRegionLabels.innerHTML = '<p style="font-size:0.85rem; color:var(--warning);">A protecção da imagem não foi aplicada. Verifique a qualidade da foto.</p>';
      if (blurProcessing) blurProcessing.style.display = 'none';
      if (fotoPreviewWrap) fotoPreviewWrap.style.display = '';
    });
  }

  if (btnAbrirCamera) btnAbrirCamera.addEventListener('click', openCamera);
  if (cameraStart) cameraStart.addEventListener('click', function(e) {
    if (e.target !== btnAbrirCamera) openCamera();
  });
  if (btnCapturar) btnCapturar.addEventListener('click', capturePhoto);
  if (btnCancelarCamera) btnCancelarCamera.addEventListener('click', function() {
    stopCamera();
    cameraLive.style.display = 'none';
    cameraStart.style.display = '';
  });

  // ── UPLOAD (desktop) ──
  if (fotoFileInput) {
    fotoFileInput.addEventListener('change', function() {
      var file = fotoFileInput.files[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) { alert('Ficheiro demasiado grande. Máximo 10 MB.'); fotoFileInput.value = ''; return; }
      var reader = new FileReader();
      reader.onload = function(e) { processAndShowFoto(e.target.result); };
      reader.readAsDataURL(file);
    });
  }

  if (btnNovaFoto) btnNovaFoto.addEventListener('click', function() {
    formData.fotoDataUrl = null;
    formData.fotoBlob = null;
    formData.fotoOriginalDataUrl = null;
    if (fotoPreviewWrap) fotoPreviewWrap.style.display = 'none';
    if (fotoPreviewImg) fotoPreviewImg.src = '';
    if (blurRegionLabels) blurRegionLabels.innerHTML = '';
    if (isMobileDevice()) {
      if (cameraBlock) cameraBlock.style.display = '';
      if (cameraStart) cameraStart.style.display = '';
      openCamera();
    } else {
      if (uploadBlock) uploadBlock.style.display = '';
      if (fotoFileInput) fotoFileInput.value = '';
    }
  });

  // Passo 2 → 1 (parar câmara ao sair do passo 2)
  var btnPrev2 = document.getElementById('btnPrev2');
  if (btnPrev2) btnPrev2.addEventListener('click', function() { stopCamera(); showStep(1); });

  // Passo 2 → 3
  var btnNext2 = document.getElementById('btnNext2');
  if (btnNext2) {
    btnNext2.addEventListener('click', function () {
      var local = document.getElementById('localDoc') ? document.getElementById('localDoc').value.trim() : '';
      var municipio = document.getElementById('municipioDoc') ? document.getElementById('municipioDoc').value : '';

      if (!formData.fotoBlob) {
        alert('Por favor, adicione uma foto do documento antes de avançar.');
        return;
      }
      if (!local || !municipio) {
        alert('Por favor, preencha o local onde foi encontrado e o município.');
        return;
      }
      formData.local = local;
      formData.municipio = municipio;
      buildReview();
      showStep(3);
    });
  }

  // Passo 3 → 2
  var btnPrev3 = document.getElementById('btnPrev3');
  if (btnPrev3) {
    btnPrev3.addEventListener('click', function () { showStep(2); });
  }

  // Preencher resumo
  function buildReview() {
    setEl('reviewTipo', formData.tipo || '');
    setEl('reviewNome', formData.nome ? mascaraNome(formData.nome) : '');
    setEl('reviewDescricao', formData.descricao || '');
    setEl('reviewLocal', formData.local ? (formData.local + ', ' + (formData.municipio || '')) : '');

    var reviewExtras = document.getElementById('reviewExtras');
    if (reviewExtras) {
      if (formData.extraDocs && formData.extraDocs.length) {
        reviewExtras.textContent = formData.extraDocs.map(function (item) {
          return item.tipo + ' - ' + mascaraNome(item.nome);
        }).join(' | ');
      } else {
        reviewExtras.textContent = 'Nenhum';
      }
    }
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
  var newDocIdsMore = document.getElementById('newDocIdsMore');
  var chaveEntregaCode = document.getElementById('chaveEntregaCode');
  var btnCopiarChaveEntrega = document.getElementById('btnCopiarChaveEntrega');

  if (btnPublicar) {
    btnPublicar.addEventListener('click', async function () {
      btnPublicar.disabled = true;
      btnPublicar.innerHTML = '<span class="spinner"></span> A publicar...';

      setTimeout(async function () {
        var ids = [];
        var ponto = null;
        var chaveEntrega = '';

        var docsToPublish = [{ tipo: formData.tipo, nome: formData.nome }];
        if (Array.isArray(formData.extraDocs) && formData.extraDocs.length) {
          docsToPublish = docsToPublish.concat(formData.extraDocs);
        }

        if (!(typeof Api !== 'undefined' && Api.documentos && Api.documentos.createWithFile)) {
          alert('API de documentos indisponível.');
          btnPublicar.disabled = false;
          btnPublicar.textContent = 'Publicar Documento';
          return;
        }

        try {
          for (var i = 0; i < docsToPublish.length; i++) {
            var doc = docsToPublish[i];
            var formDataAPI = new FormData();
            formDataAPI.append('tipo', doc.tipo);
            formDataAPI.append('nome_proprietario', doc.nome);
            formDataAPI.append('morada', formData.local);
            formDataAPI.append('provincia', formData.municipio);

            if (formData.fotoBlob) {
              formDataAPI.append('foto', formData.fotoBlob, 'foto-documento.jpg');
            }

            var response = await Api.documentos.createWithFile(formDataAPI);
            var id = response && response.documento && response.documento.id ? response.documento.id : '';
            if (!id) throw new Error('Resposta incompleta do servidor ao publicar documento.');
            ids.push(id);

            if (i === 0) {
              if (response && response.chave_entrega) {
                chaveEntrega = response.chave_entrega;
              } else if (response && response.documento && response.documento.chave_entrega) {
                chaveEntrega = response.documento.chave_entrega;
              }

              if (response && response.ponto_entrega) {
                ponto = response.ponto_entrega;
              }

              if (!chaveEntrega || !ponto || !ponto.nome || !ponto.endereco || !ponto.telefone) {
                throw new Error('Resposta incompleta do servidor ao publicar documento.');
              }
            }
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
        if (newDocId) newDocId.textContent = ids[0] || '—';
        if (newDocIdsMore) {
          if (ids.length > 1) {
            newDocIdsMore.textContent = 'Mais IDs: ' + ids.slice(1).join(', ');
            newDocIdsMore.classList.remove('hidden');
          } else {
            newDocIdsMore.classList.add('hidden');
            newDocIdsMore.textContent = '';
          }
        }
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
