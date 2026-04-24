/* ===========================
   AcheiDoc — Login JS
   =========================== */

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

  setTimeout(async function () {
    if (!(typeof Api !== 'undefined' && Api.auth && Api.auth.login)) {
      alertaErro.textContent = 'Serviço de autenticação indisponível. Verifique a API.';
      alertaErro.style.display = 'block';
      btnEntrar.textContent = 'Entrar';
      btnEntrar.disabled = false;
      return;
    }

    try {
      var response = await Api.auth.login(email, senha);
      var userApi = response && response.utilizador ? response.utilizador : null;
      var tokenApi = response && response.token ? response.token : null;

      if (!userApi || !tokenApi) {
        throw new Error('Resposta inválida do servidor de autenticação.');
      }

      var sessaoApi = Object.assign({}, userApi, { role: 'utilizador' });
      Auth.login(sessaoApi, tokenApi);
      alertaSucesso.textContent = 'Login realizado com sucesso. A redirecionar...';
      alertaSucesso.style.display = 'block';

      const params = new URLSearchParams(window.location.search);
      const redirectParam = params.get('redirect');
      const safeRedirect = (redirectParam && /^(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.html$/.test(redirectParam))
        ? redirectParam
        : null;

      setTimeout(function () {
        window.location.href = safeRedirect || 'index.html';
      }, 900);
    } catch (apiErr) {
      alertaErro.textContent = apiErr && apiErr.message ? apiErr.message : 'Email ou senha incorretos.';
      alertaErro.style.display = 'block';
      btnEntrar.textContent = 'Entrar';
      btnEntrar.disabled = false;
    }
  }, 1000);
});

// Toggle password visibility
document.getElementById('btnTogglePassword').addEventListener('click', function () {
  const input = document.getElementById('inputSenha');
  input.type = input.type === 'password' ? 'text' : 'password';
  this.textContent = input.type === 'password' ? 'Ver' : 'Ocultar';
});
