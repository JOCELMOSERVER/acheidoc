/* ===========================
   AcheiDoc — Auto Blur
   Desfocagem automática de áreas sensíveis
   =========================== */

var AutoBlur = (function () {

  var MODELS_URL = '/models';

  var DOC_TEMPLATES = {
    'Bilhete de Identidade': [
      { label: 'Número de BI',   x: 0.55, y: 0.18, w: 0.40, h: 0.10 },
      { label: 'NIF',            x: 0.55, y: 0.30, w: 0.40, h: 0.10 },
      { label: 'Assinatura',     x: 0.55, y: 0.82, w: 0.40, h: 0.12 }
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

          onProgress('A identificar zonas sensíveis do documento...');
          var templates = DOC_TEMPLATES[docTipo] || [];
          templates.forEach(function(t) {
            var rx = Math.round(t.x * W);
            var ry = Math.round(t.y * H);
            var rw = Math.round(t.w * W);
            var rh = Math.round(t.h * H);
            blurRegionOnCanvas(ctx, canvas, rx, ry, rw, rh, 18);
            regions.push({ label: t.label, x: rx, y: ry, w: rw, h: rh });
          });

          onProgress('A detectar rosto no documento...');

          var facePromise;
          if (typeof faceapi !== 'undefined' && _modelsLoaded) {
            facePromise = faceapi.detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.4 }))
              .then(function(detections) {
                detections.forEach(function(det) {
                  var box = det.box;
                  var padding = Math.round(box.width * 0.12);
                  var fx = Math.max(0, Math.round(box.x) - padding);
                  var fy = Math.max(0, Math.round(box.y) - padding);
                  var fw = Math.min(W - fx, Math.round(box.width) + padding * 2);
                  var fh = Math.min(H - fy, Math.round(box.height) + padding * 2);
                  blurRegionOnCanvas(ctx, canvas, fx, fy, fw, fh, 22);
                  regions.push({ label: 'Rosto detectado', x: fx, y: fy, w: fw, h: fh });
                });
              })
              .catch(function() {});
          } else {
            facePromise = Promise.resolve();
          }

          facePromise.then(function() {
            onProgress('A finalizar...');
            var blurredDataUrl = canvas.toDataURL('image/jpeg', 0.88);
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
