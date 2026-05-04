/* ===========================
   Encontra já — Admin Pontos de Entrega JS
   =========================== */

(function () {
  var adminLogado = JSON.parse(sessionStorage.getItem('adminLogado') || 'null');
  if (!adminLogado) {
    window.location.href = 'login.html';
    return;
  }

  var pontos = [];
  var formContainer = document.getElementById('formContainer');
  var tabelaBody = document.getElementById('tabelaBody');
  var btnCriarPonto = document.getElementById('btnCriarPonto');
  var btnCancelar = document.getElementById('btnCancelar');
  var formNovoPonto = document.getElementById('formNovoPonto');

  function renderTabela() {
    if (!tabelaBody) return;
    if (!pontos.length) {
      tabelaBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--text-gray);">Nenhum ponto de entrega registado.</td></tr>';
      return;
    }

    tabelaBody.innerHTML = pontos.map(function (p) {
      return '<tr style="border-bottom:1px solid var(--border);">' +
        '<td style="padding:0.75rem;"><strong>' + (p.nome || '') + '</strong></td>' +
        '<td style="padding:0.75rem;">' + ((p.municipio || '') + (p.provincia ? ', ' + p.provincia : '')) + '</td>' +
        '<td style="padding:0.75rem;"><a href="tel:' + (p.telefone || '') + '" style="color:var(--primary);">' + (p.telefone || '') + '</a></td>' +
        '<td style="padding:0.75rem;">' + (p.horario || '') + '</td>' +
        '<td style="padding:0.75rem;"><small><code>' + (p.id ? p.id.slice(0, 8) : '') + '</code></small></td>' +
        '</tr>';
    }).join('');
  }

  if (btnCriarPonto) {
    btnCriarPonto.addEventListener('click', function () {
      if (formContainer) formContainer.classList.remove('hidden');
      if (formNovoPonto) formNovoPonto.reset();
    });
  }

  if (btnCancelar) {
    btnCancelar.addEventListener('click', function () {
      if (formContainer) formContainer.classList.add('hidden');
    });
  }

  if (formNovoPonto) {
    formNovoPonto.addEventListener('submit', async function (e) {
      e.preventDefault();

      var nome = document.getElementById('inputNome').value.trim();
      var endereco = document.getElementById('inputEndereco').value.trim();
      var provincia = document.getElementById('inputProvincia').value.trim();
      var municipio = document.getElementById('inputMunicipio').value.trim();
      var horario = document.getElementById('inputHorario').value.trim();
      var telefone = document.getElementById('inputTelefone').value.trim();

      if (!nome || !endereco || !provincia || !municipio || !horario || !telefone) {
        alert('Por favor, preencha todos os campos.');
        return;
      }

      if (!(typeof Api !== 'undefined' && Api.pontosEntrega && Api.pontosEntrega.create)) {
        alert('API de pontos de entrega indisponível.');
        return;
      }

      try {
        btnCriarPonto.disabled = true;
        var response = await Api.pontosEntrega.create({
          nome: nome,
          endereco: endereco,
          provincia: provincia,
          municipio: municipio,
          horario: horario,
          telefone: telefone
        });

        if (response && response.ponto_entrega) {
          pontos.push(response.ponto_entrega);
          renderTabela();
          formNovoPonto.reset();
          if (formContainer) formContainer.classList.add('hidden');
          alert('Ponto de entrega criado com sucesso!');
        }
      } catch (err) {
        alert(err && err.message ? err.message : 'Falha ao criar ponto de entrega.');
      } finally {
        btnCriarPonto.disabled = false;
      }
    });
  }

  (async function loadPontos() {
    if (!(typeof Api !== 'undefined' && Api.pontosEntrega && Api.pontosEntrega.list)) {
      if (tabelaBody) {
        tabelaBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--danger);">API indisponível.</td></tr>';
      }
      return;
    }

    try {
      var response = await Api.pontosEntrega.list();
      pontos = response && Array.isArray(response.pontos) ? response.pontos : [];
      renderTabela();
    } catch (err) {
      if (tabelaBody) {
        tabelaBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--danger);">Falha ao carregar pontos de entrega.</td></tr>';
      }
    }
  })();

  // Logout
  var btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', function () {
      sessionStorage.removeItem('adminLogado');
      if (typeof Api !== 'undefined' && Api.clearToken) Api.clearToken();
      window.location.href = 'login.html';
    });
  }
})();
