/* ===========================
   AcheiDoc — Cadastro JS
   =========================== */

(function () {
  // Se já estiver logado, redirecionar
  if (Auth.isLoggedIn()) {
    window.location.href = 'index.html';
    return;
  }

  var form = document.getElementById('formCadastro');
  var senhaInput = document.getElementById('senhaCadastro');
  var confirmarInput = document.getElementById('confirmarSenha');
  var forcaBar = document.getElementById('forcaSenhaBar');
  var forcaText = document.getElementById('forcaSenhaText');
  var errorEl = document.getElementById('errorCadastro');
  var successEl = document.getElementById('successCadastro');

  // Indicador de força da senha
  if (senhaInput) {
    senhaInput.addEventListener('input', function () {
      var val = senhaInput.value;
      var score = 0;
      if (val.length >= 6) score++;
      if (val.length >= 10) score++;
      if (/[A-Z]/.test(val)) score++;
      if (/[0-9]/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;

      var niveis = ['', 'Fraca', 'Razoável', 'Média', 'Boa', 'Forte'];
      var cores = ['', '#DC2626', '#D97706', '#D97706', '#16A34A', '#15803D'];

      if (forcaBar) {
        forcaBar.style.width = (score * 20) + '%';
        forcaBar.style.background = cores[score] || '#E5E7EB';
      }
      if (forcaText) {
        forcaText.textContent = val ? niveis[score] || '' : '';
        forcaText.style.color = cores[score] || '';
      }
    });
  }

  // Validar confirmação de senha em tempo real
  if (confirmarInput) {
    confirmarInput.addEventListener('input', function () {
      if (confirmarInput.value && senhaInput && confirmarInput.value !== senhaInput.value) {
        confirmarInput.setCustomValidity('As senhas não coincidem');
      } else {
        confirmarInput.setCustomValidity('');
      }
    });
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (errorEl) errorEl.classList.add('hidden');
      if (successEl) successEl.classList.add('hidden');

      var nome = document.getElementById('nomeCadastro').value.trim();
      var email = document.getElementById('emailCadastro').value.trim();
      var senha = senhaInput ? senhaInput.value : '';
      var confirmar = confirmarInput ? confirmarInput.value : '';

      if (senha !== confirmar) {
        if (errorEl) {
          errorEl.textContent = 'As senhas não coincidem.';
          errorEl.classList.remove('hidden');
        }
        return;
      }

      // Verificar se email já existe (comparação case-insensitive)
      var existe = (typeof UTILIZADORES !== 'undefined')
        ? UTILIZADORES.find(function (u) { return u.email.toLowerCase() === email.toLowerCase(); })
        : false;

      if (existe) {
        if (errorEl) {
          errorEl.textContent = 'Este email já está registado. Faça login.';
          errorEl.classList.remove('hidden');
        }
        return;
      }

      // Criar novo utilizador
      var novoId = (typeof UTILIZADORES !== 'undefined') ? UTILIZADORES.length + 1 : 1;
      var novoUser = { id: novoId, nome: nome, email: email, senha: senha, role: 'utilizador', pontos: 0 };

      if (typeof UTILIZADORES !== 'undefined') {
        UTILIZADORES.push(novoUser);
      }

      // Fazer login automaticamente
      Auth.login({ id: novoUser.id, nome: novoUser.nome, email: novoUser.email, role: 'utilizador', pontos: 0 });

      if (successEl) {
        successEl.textContent = 'Conta criada com sucesso! A redirecionar...';
        successEl.classList.remove('hidden');
      }

      setTimeout(function () {
        window.location.href = 'index.html';
      }, 1200);
    });
  }
})();
