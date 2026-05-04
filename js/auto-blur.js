/* ===========================
   Encontra já — Auto Blur
   Desfocagem automática de áreas sensíveis
   =========================== */

var AutoBlur = (function () {

  var MODELS_URL = '/models';
  var TEMPLATE_BLUR_PX = 18;
  var FACE_BLUR_PX = 22;
  var OUTPUT_JPEG_QUALITY = 0.88;
  var FACE_DETECTION_INPUT_SIZE = 320;
  var FACE_DETECTION_THRESHOLD = 0.4;
  var MODELS_LOAD_TIMEOUT_MS = 10000;
  var CARD_BRIGHTNESS_THRESHOLD = 180;   // pixels acima deste valor são considerados parte do cartão
  var MIN_BRIGHT_POINTS_FOR_DETECTION = 50; // mínimo de pontos claros para confiar na deteção
  var MIN_BLUR_WIDTH = 4;               // largura mínima de blur (pixels) para valer a pena aplicar

  // Coordenadas relativas ao cartão detetado (não à imagem completa).
  // keepStartFrac: fração da largura da zona a manter visível no início
  // keepEndFrac:   fração da largura da zona a manter visível no fim
  var DOC_TEMPLATES = {
    'Bilhete de Identidade': [
      // Nome — linha 1: manter primeiro nome (≈25%) e último nome (≈25%), desfocar meio
      { label: 'Nome (linha 1 — nomes do meio)',
        x: 0.01, y: 0.31, w: 0.56, h: 0.07,
        keepStartFrac: 0.25, keepEndFrac: 0.25 },

      // Nome — linha 2: desfocar tudo exceto o último nome (≈28%)
      { label: 'Nome (linha 2 — nomes do meio)',
        x: 0.01, y: 0.38, w: 0.56, h: 0.07,
        keepStartFrac: 0.00, keepEndFrac: 0.28 },

      // Filiação — Pai (linha 2): manter último nome (≈35%), desfocar nomes do meio
      { label: 'Pai (nomes do meio)',
        x: 0.01, y: 0.55, w: 0.56, h: 0.065,
        keepStartFrac: 0.00, keepEndFrac: 0.35 },

      // Filiação — Mãe: manter primeiro (≈18%) e último nome (≈30%)
      { label: 'Mãe (nomes do meio)',
        x: 0.01, y: 0.695, w: 0.56, h: 0.065,
        keepStartFrac: 0.18, keepEndFrac: 0.30 },

      // Número BI — manter 4 primeiros (≈28.5%) e 4 últimos (≈21.5%), desfocar meio
      { label: 'Número BI (dígitos do meio)',
        x: 0.01, y: 0.80, w: 0.52, h: 0.065,
        keepStartFrac: 0.285, keepEndFrac: 0.215 },

      // Assinatura — blur total
      { label: 'Assinatura',
        x: 0.55, y: 0.72, w: 0.38, h: 0.10 }
    ],
    'Passaporte': [
      { label: 'Número',         x: 0.50, y: 0.14, w: 0.45, h: 0.10 },
      { label: 'Código MRZ',     x: 0.00, y: 0.84, w: 1.00, h: 0.16 }
    ],
    'Carta de Condução': [
      { label: 'Número de licença', x: 0.50, y: 0.20, w: 0.45, h: 0.10 },
      { label: 'Assinatura',        x: 0.50, y: 0.80, w: 0.45, h: 0.12 }
    ],
    'Cartão Bancário': [
      { label: 'Número do cartão',  x: 0.00, y: 0.50, w: 1.00, h: 0.14 },
      { label: 'Data / CVV',        x: 0.55, y: 0.66, w: 0.40, h: 0.12 }
    ],
    'Cartão de Estudante': [
      { label: 'Número de estudante', x: 0.50, y: 0.28, w: 0.45, h: 0.10 }
    ]
  };

  var _modelsLoaded = false;
  var _loading = false;

  function loadModels() {
    if (_modelsLoaded) return Promise.resolve();
    if (_loading) return new Promise(function(resolve) {
      var check = setInterval(function() {
        if (_modelsLoaded) { clearInterval(check); resolve(); }
      }, 100);
      setTimeout(function() {
        clearInterval(check);
        _modelsLoaded = true;
        _loading = false;
        resolve();
      }, MODELS_LOAD_TIMEOUT_MS);
    });
    _loading = true;
    if (typeof faceapi === 'undefined') {
      _modelsLoaded = true;
      _loading = false;
      return Promise.resolve();
    }
    return faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_URL)
      .then(function() {
        _modelsLoaded = true;
        _loading = false;
      })
      .catch(function() {
        _modelsLoaded = true;
        _loading = false;
      });
  }

  /**
   * Deteta a bounding box do cartão na foto analisando pixels claros/brancos.
   * Retorna {x, y, w, h} em pixéis absolutos do canvas.
   */
  function detectCardBounds(canvas, ctx) {
    var W = canvas.width, H = canvas.height;
    var imageData = ctx.getImageData(0, 0, W, H);
    var data = imageData.data;

    // Amostrar pixels em grid e encontrar a região mais clara (cartão branco/creme)
    var step = Math.max(4, Math.floor(Math.min(W, H) / 80));
    var brightPoints = [];

    for (var y = 0; y < H; y += step) {
      for (var x = 0; x < W; x += step) {
        var i = (y * W + x) * 4;
        var r = data[i], g = data[i + 1], b = data[i + 2];
        var brightness = (r + g + b) / 3;
        if (brightness > CARD_BRIGHTNESS_THRESHOLD) {
          brightPoints.push({ x: x, y: y });
        }
      }
    }

    if (brightPoints.length < MIN_BRIGHT_POINTS_FOR_DETECTION) {
      // Fallback: assumir que o cartão está centrado e ocupa ~80% da imagem
      var margin = 0.10;
      return { x: W * margin, y: H * margin, w: W * (1 - margin * 2), h: H * (1 - margin * 2) };
    }

    // Calcular bounding box dos pontos claros
    var minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;
    brightPoints.forEach(function(p) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    });

    // Margem de segurança pequena
    var padX = step * 2, padY = step * 2;
    var cardX = Math.max(0, minX - padX);
    var cardY = Math.max(0, minY - padY);
    return {
      x: cardX,
      y: cardY,
      w: Math.min(W - cardX, maxX - minX + padX * 2),
      h: Math.min(H - cardY, maxY - minY + padY * 2)
    };
  }

  function blurRegionOnCanvas(ctx, srcCanvas, x, y, w, h, blurPx) {
    blurPx = blurPx || 16;
    if (w <= 0 || h <= 0) return;
    var tmp = document.createElement('canvas');
    tmp.width = w; tmp.height = h;
    var tc = tmp.getContext('2d');
    tc.drawImage(srcCanvas, x, y, w, h, 0, 0, w, h);
    ctx.save();
    ctx.filter = 'blur(' + blurPx + 'px)';
    ctx.drawImage(tmp, x, y, w, h);
    ctx.drawImage(tmp, x, y, w, h);
    ctx.drawImage(tmp, x, y, w, h);
    ctx.filter = 'none';
    ctx.restore();
  }

  /**
   * Processa a imagem e devolve:
   * {
   *   blurredDataUrl: string,
   *   regions: [{label, x, y, w, h}]
   * }
   */
  function process(dataUrl, docTipo, onProgress) {
    onProgress = onProgress || function(){};
    onProgress('A carregar modelos de IA...');

    return loadModels().then(function() {
      return new Promise(function(resolve, reject) {
        var img = new Image();
        img.onload = function() {
          var W = img.naturalWidth, H = img.naturalHeight;

          var canvas = document.createElement('canvas');
          canvas.width = W; canvas.height = H;
          var ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, W, H);

          var regions = [];

          // Detetar a bounding box do cartão na foto
          var card = detectCardBounds(canvas, ctx);

          onProgress('A identificar zonas sensíveis do documento...');
          var templates = DOC_TEMPLATES[docTipo] || [];
          templates.forEach(function(t) {
            // Coordenadas relativas ao cartão detetado
            var rx = Math.round(card.x + t.x * card.w);
            var ry = Math.round(card.y + t.y * card.h);
            var rw = Math.round(t.w * card.w);
            var rh = Math.round(t.h * card.h);

            var blurStartFrac = t.keepStartFrac || 0;
            var blurEndFrac   = t.keepEndFrac   || 0;
            var blurX = rx + Math.round(blurStartFrac * rw);
            var blurW = Math.round((1 - blurStartFrac - blurEndFrac) * rw);

            if (blurW > MIN_BLUR_WIDTH) {
              blurRegionOnCanvas(ctx, canvas, blurX, ry, blurW, rh, TEMPLATE_BLUR_PX);
            } else {
              blurRegionOnCanvas(ctx, canvas, rx, ry, rw, rh, TEMPLATE_BLUR_PX);
            }
            regions.push({ label: t.label, x: rx, y: ry, w: rw, h: rh });
          });

          onProgress('A detectar rosto no documento...');

          var facePromise;
          if (typeof faceapi !== 'undefined' && _modelsLoaded) {
            facePromise = faceapi.detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions({ inputSize: FACE_DETECTION_INPUT_SIZE, scoreThreshold: FACE_DETECTION_THRESHOLD }))
              .then(function(detections) {
                detections.forEach(function(det) {
                  var box = det.box;
                  var padding = Math.round(box.width * 0.12);
                  var fx = Math.max(0, Math.round(box.x) - padding);
                  var fy = Math.max(0, Math.round(box.y) - padding);
                  var fw = Math.min(W - fx, Math.round(box.width) + padding * 2);
                  var fh = Math.min(H - fy, Math.round(box.height) + padding * 2);
                  blurRegionOnCanvas(ctx, canvas, fx, fy, fw, fh, FACE_BLUR_PX);
                  regions.push({ label: 'Rosto detectado', x: fx, y: fy, w: fw, h: fh });
                });
              })
              .catch(function() {});
          } else {
            facePromise = Promise.resolve();
          }

          facePromise.then(function() {
            onProgress('A finalizar...');
            var blurredDataUrl = canvas.toDataURL('image/jpeg', OUTPUT_JPEG_QUALITY);
            resolve({ blurredDataUrl: blurredDataUrl, regions: regions });
          });
        };
        img.onerror = function() { reject(new Error('Não foi possível carregar a imagem.')); };
        img.src = dataUrl;
      });
    });
  }

  return { process: process };
})();

