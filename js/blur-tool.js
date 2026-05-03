/* ===========================
   AcheiDoc — Blur Tool
   Ferramenta de desfocagem de áreas sensíveis
   =========================== */

var BlurTool = (function () {

  var modal, canvas, ctx, img, rects, isDrawing, startX, startY, currentRect;
  var _callback = null;

  function createModal() {
    if (document.getElementById('blurToolModal')) return;

    var el = document.createElement('div');
    el.id = 'blurToolModal';
    el.style.cssText = 'display:none; position:fixed; inset:0; z-index:9999; background:rgba(0,0,0,0.92); flex-direction:column; align-items:center; justify-content:flex-start; overflow-y:auto;';
    el.innerHTML = [
      '<div style="width:100%; max-width:800px; padding:1rem; box-sizing:border-box;">',
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">',
          '<h2 style="color:white; font-size:1.1rem; font-weight:700; margin:0;">🔲 Desfocar áreas sensíveis</h2>',
          '<button id="blurToolClose" style="background:transparent; border:none; color:white; font-size:1.5rem; cursor:pointer; padding:0 0.5rem;">✕</button>',
        '</div>',
        '<p style="color:#D1D5DB; font-size:0.875rem; margin:0 0 0.75rem;">Arraste rectângulos sobre as áreas que pretende desfocar (número de BI, foto, NIF, assinatura, etc.).</p>',
        '<div style="position:relative; background:#111; border-radius:8px; overflow:hidden; touch-action:none; cursor:crosshair;">',
          '<canvas id="blurToolCanvas" style="display:block; max-width:100%; height:auto;"></canvas>',
        '</div>',
        '<div style="display:flex; gap:0.75rem; justify-content:center; margin-top:1rem; flex-wrap:wrap;">',
          '<button id="blurToolUndo" class="btn btn-outline" style="color:white; border-color:#6B7280;">↩ Desfazer último</button>',
          '<button id="blurToolClear" class="btn btn-outline" style="color:white; border-color:#6B7280;">🗑 Limpar tudo</button>',
          '<button id="blurToolApply" class="btn btn-success">✅ Aplicar Desfocagem</button>',
          '<button id="blurToolCancel" class="btn btn-outline" style="color:white; border-color:#6B7280;">Cancelar</button>',
        '</div>',
        '<p id="blurToolHint" style="color:#9CA3AF; font-size:0.8rem; text-align:center; margin-top:0.5rem;">Nenhuma área seleccionada ainda.</p>',
      '</div>'
    ].join('');
    document.body.appendChild(el);
    modal = el;

    canvas = document.getElementById('blurToolCanvas');
    ctx = canvas.getContext('2d');

    // Eventos de desenho (mouse)
    canvas.addEventListener('mousedown', onPointerDown);
    canvas.addEventListener('mousemove', onPointerMove);
    canvas.addEventListener('mouseup', onPointerUp);
    canvas.addEventListener('mouseleave', onPointerUp);

    // Eventos de desenho (touch)
    canvas.addEventListener('touchstart', function(e){ e.preventDefault(); onPointerDown(e.touches[0]); }, { passive: false });
    canvas.addEventListener('touchmove', function(e){ e.preventDefault(); onPointerMove(e.touches[0]); }, { passive: false });
    canvas.addEventListener('touchend', function(e){ e.preventDefault(); onPointerUp(); }, { passive: false });

    document.getElementById('blurToolClose').addEventListener('click', close);
    document.getElementById('blurToolCancel').addEventListener('click', close);
    document.getElementById('blurToolUndo').addEventListener('click', undo);
    document.getElementById('blurToolClear').addEventListener('click', clearAll);
    document.getElementById('blurToolApply').addEventListener('click', apply);
  }

  function getCanvasPos(e) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  function onPointerDown(e) {
    var pos = getCanvasPos(e);
    isDrawing = true;
    startX = pos.x; startY = pos.y;
    currentRect = { x: startX, y: startY, w: 0, h: 0 };
  }

  function onPointerMove(e) {
    if (!isDrawing) return;
    var pos = getCanvasPos(e);
    currentRect.w = pos.x - startX;
    currentRect.h = pos.y - startY;
    render();
  }

  function onPointerUp() {
    if (!isDrawing) return;
    isDrawing = false;
    if (Math.abs(currentRect.w) > 8 && Math.abs(currentRect.h) > 8) {
      // normalizar para sempre ter w/h positivos
      rects.push({
        x: currentRect.w < 0 ? currentRect.x + currentRect.w : currentRect.x,
        y: currentRect.h < 0 ? currentRect.y + currentRect.h : currentRect.y,
        w: Math.abs(currentRect.w),
        h: Math.abs(currentRect.h)
      });
    }
    currentRect = null;
    render();
    updateHint();
  }

  function render() {
    // 1. Desenhar imagem original
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // 2. Aplicar blur em cada rectângulo guardado
    rects.forEach(function(r) {
      applyBlurRect(r.x, r.y, r.w, r.h);
    });

    // 3. Rectângulo actual (a ser desenhado)
    if (isDrawing && currentRect) {
      applyBlurRect(
        currentRect.w < 0 ? currentRect.x + currentRect.w : currentRect.x,
        currentRect.h < 0 ? currentRect.y + currentRect.h : currentRect.y,
        Math.abs(currentRect.w),
        Math.abs(currentRect.h)
      );
      // Borda a tracejado para mostrar selecção activa
      ctx.save();
      ctx.strokeStyle = '#FCD34D';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(
        currentRect.w < 0 ? currentRect.x + currentRect.w : currentRect.x,
        currentRect.h < 0 ? currentRect.y + currentRect.h : currentRect.y,
        Math.abs(currentRect.w),
        Math.abs(currentRect.h)
      );
      ctx.restore();
    }

    // 4. Borda de cada rectângulo guardado
    rects.forEach(function(r, i) {
      ctx.save();
      ctx.strokeStyle = 'rgba(239,68,68,0.7)';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.strokeRect(r.x, r.y, r.w, r.h);
      ctx.fillStyle = 'rgba(239,68,68,0.15)';
      ctx.fillRect(r.x, r.y, r.w, r.h);
      // número da zona
      ctx.fillStyle = '#EF4444';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(String(i + 1), r.x + 4, r.y + 16);
      ctx.restore();
    });
  }

  // Aplica blur real usando um canvas auxiliar offscreen
  function applyBlurRect(x, y, w, h) {
    if (w <= 0 || h <= 0) return;
    // Extrair a região da imagem original
    var tmp = document.createElement('canvas');
    tmp.width = w; tmp.height = h;
    var tc = tmp.getContext('2d');
    tc.drawImage(img, x, y, w, h, 0, 0, w, h);
    // Aplicar blur no contexto principal usando filter
    ctx.save();
    ctx.filter = 'blur(14px)';
    // Desenhar a região várias vezes para intensificar o blur
    for (var i = 0; i < 3; i++) {
      ctx.drawImage(tmp, x, y, w, h);
    }
    ctx.filter = 'none';
    ctx.restore();
  }

  function undo() {
    if (rects.length > 0) { rects.pop(); render(); updateHint(); }
  }

  function clearAll() {
    rects = []; render(); updateHint();
  }

  function updateHint() {
    var hint = document.getElementById('blurToolHint');
    if (!hint) return;
    hint.textContent = rects.length === 0
      ? 'Nenhuma área seleccionada ainda.'
      : rects.length + ' área(s) marcada(s) para desfocar.';
  }

  function apply() {
    if (rects.length === 0) {
      if (confirm('Não marcou nenhuma área. Quer aplicar sem desfocagem?')) {
        close();
        if (_callback) _callback(null); // null = sem alteração
      }
      return;
    }
    // Gerar imagem final sem as bordas vermelhas
    var finalCanvas = document.createElement('canvas');
    finalCanvas.width = canvas.width;
    finalCanvas.height = canvas.height;
    var fc = finalCanvas.getContext('2d');
    // Imagem original
    fc.drawImage(img, 0, 0, finalCanvas.width, finalCanvas.height);
    // Aplicar blur em cada zona (sem bordas)
    rects.forEach(function(r) {
      var tmp = document.createElement('canvas');
      tmp.width = r.w; tmp.height = r.h;
      var tc = tmp.getContext('2d');
      tc.drawImage(img, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h);
      fc.save();
      fc.filter = 'blur(14px)';
      for (var i = 0; i < 3; i++) fc.drawImage(tmp, r.x, r.y, r.w, r.h);
      fc.filter = 'none';
      fc.restore();
    });
    var resultDataUrl = finalCanvas.toDataURL('image/jpeg', 0.90);
    close();
    if (_callback) _callback(resultDataUrl);
  }

  function close() {
    if (modal) modal.style.display = 'none';
    isDrawing = false; currentRect = null;
  }

  function open(dataUrl, callback) {
    _callback = callback;
    createModal();
    rects = []; isDrawing = false; currentRect = null;

    img = new Image();
    img.onload = function() {
      // Definir tamanho do canvas igual à imagem (max 1200px largura)
      var maxW = 1200;
      var w = Math.min(img.naturalWidth, maxW);
      var h = Math.round(img.naturalHeight * (w / img.naturalWidth));
      canvas.width = w; canvas.height = h;
      render();
      updateHint();
    };
    img.src = dataUrl;

    modal.style.display = 'flex';
  }

  return { open: open };
})();
