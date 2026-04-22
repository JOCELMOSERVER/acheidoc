/* ===========================
   AcheiDoc — Login JS
   =========================== */

// Redirecionar se já logado
Auth.redirectIfLoggedIn();

let tabActual = 'utilizador';

// Tabs
document.querySelectorAll('.auth-tab').forEach(function (tab) {
  tab.addEventListener('click', function () {
    document.querySelectorAll('.auth-tab').forEach(function (t) { t.classList.remove('active'); });
    tab.classList.add('active');
    tabActual = tab.dataset.tab;

    // Atualizar credenciais de teste
    const creds = document.getElementById('credenciaisTeste');
    if (tabActual === 'utilizador') {
      creds.innerHTML = '<p>🧪 <strong>Teste:</strong> carlos@gmail.com / 1234</p>';
      creds.style.display = 'block';
    } else if (tabActual === 'agente') {
      creds.innerHTML = '<p>🧪 <strong>Teste:</strong> agente@acheidoc.ao / 1234</p>';
      creds.style.display = 'block';
    } else {
      creds.innerHTML = '<p>🧪 <strong>Teste:</strong> admin@acheidoc.ao / admin123</p>';
      creds.style.display = 'block';
    }
  });
});

// Submit do formulário
document.getElementById('formLogin').addEventListener('submit', function (e) {
  e.preventDefault();

  const email = document.getElementById('inputEmail').value.trim();
  const senha = document.getElementById('inputSenha').value;
  const btnEntrar = document.getElementById('btnEntrar');
  const alertaErro = document.getElementById('alertaErro');
  const alertaSucesso = document.getElementById('alertaSucesso');

  // Loading
  btnEntrar.textContent = 'A entrar...';
  btnEntrar.disabled = true;
  alertaErro.style.display = 'none';
  alertaSucesso.style.display = 'none';

  setTimeout(function () {
    let utilizadorEncontrado = null;
    let redirecionarPara = 'index.html';

    if (tabActual === 'utilizador') {
      utilizadorEncontrado = UTILIZADORES.find(function (u) { return u.email === email && u.senha === senha; });
      redirecionarPara = 'index.html';
    } else if (tabActual === 'agente') {
      utilizadorEncontrado = AGENTES.find(function (a) { return a.email === email && a.senha === senha; });
      if (utilizadorEncontrado) utilizadorEncontrado.role = 'agente';
      redirecionarPara = 'agente/dashboard.html';
    } else if (tabActual === 'admin') {
      if (email === 'admin@acheidoc.ao' && senha === 'admin123') {
        utilizadorEncontrado = { id: 99, nome: 'Administrador', email: email, role: 'admin' };
        redirecionarPara = 'admin/dashboard.html';
      }
    }

    if (utilizadorEncontrado) {
      if (!utilizadorEncontrado.role) utilizadorEncontrado.role = 'utilizador';
      Auth.login(utilizadorEncontrado);
      alertaSucesso.textContent = '✅ Login realizado com sucesso! A redirecionar...';
      alertaSucesso.style.display = 'block';

      // Verificar redirect param (validar para evitar redireccionamentos externos)
      const params = new URLSearchParams(window.location.search);
      const redirectParam = params.get('redirect');
      const safeRedirect = redirectParam && /^[^/:][^:]*$/.test(redirectParam) ? redirectParam : null;

      setTimeout(function () {
        window.location.href = safeRedirect || redirecionarPara;
      }, 1000);
    } else {
      alertaErro.textContent = '❌ Email ou senha incorrectos. Tente novamente.';
      alertaErro.style.display = 'block';
      btnEntrar.textContent = 'Entrar';
      btnEntrar.disabled = false;
    }
  }, 1000);
});

// Toggle password visibility
function togglePassword() {
  const input = document.getElementById('inputSenha');
  input.type = input.type === 'password' ? 'text' : 'password';
}
