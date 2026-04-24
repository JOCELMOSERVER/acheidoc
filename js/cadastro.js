/* ===========================
   AcheiDoc — Cadastro JS
   =========================== */

// Validação em tempo real da senha
document.getElementById('inputSenha').addEventListener('input', function () {
  const forca = calcularForcaSenha(this.value);
  const indicador = document.getElementById('forcaSenha');
  indicador.className = 'forca-senha forca-' + forca.nivel;
  indicador.textContent = forca.texto;
});

// Validação confirmar senha em tempo real
document.getElementById('inputConfirmarSenha').addEventListener('input', function () {
  const senha = document.getElementById('inputSenha').value;
  const icone = document.getElementById('iconConfirmar');
  icone.textContent = this.value === senha ? 'Corresponde' : 'Diferente';
});

function calcularForcaSenha(senha) {
  if (senha.length < 4) return { nivel: 'fraca', texto: 'Senha fraca' };
  if (senha.length < 8) return { nivel: 'media', texto: 'Senha média' };
  return { nivel: 'forte', texto: 'Senha forte' };
}

// Submit
document.getElementById('formCadastro').addEventListener('submit', async function (e) {
  e.preventDefault();

  const nome = document.getElementById('inputNome').value.trim();
  const email = document.getElementById('inputEmail').value.trim();
  const telefone = document.getElementById('inputTelefone').value.trim();
  const municipio = document.getElementById('inputMunicipio').value;
  const senha = document.getElementById('inputSenha').value;
  const confirmarSenha = document.getElementById('inputConfirmarSenha').value;
  const termos = document.getElementById('checkTermos').checked;

  const alerta = document.getElementById('alertaErro');
  alerta.style.display = 'none';

  // Validações
  if (senha !== confirmarSenha) {
    alerta.textContent = 'As senhas não coincidem.';
    alerta.style.display = 'block';
    return;
  }
  if (!termos) {
    alerta.textContent = 'Deve aceitar os Termos e Condições.';
    alerta.style.display = 'block';
    return;
  }
  if (!(typeof Api !== 'undefined' && Api.auth && Api.auth.register)) {
    alerta.textContent = 'Serviço de cadastro indisponível. Verifique a API.';
    alerta.style.display = 'block';
    return;
  }

  // Tentar fluxo real da API (registo + verificação OTP)
  try {
    await Api.auth.register({
      nome: nome,
      email: email,
      telefone: telefone,
      password: senha
    });

    var otp = window.prompt('Introduza o código OTP enviado para o seu email:');
    if (!otp) {
      alerta.textContent = 'Código OTP obrigatório para concluir o cadastro.';
      alerta.style.display = 'block';
      return;
    }

    var verifyResp = await Api.auth.verifyEmail(email, otp.trim());
    var tokenApi = verifyResp && verifyResp.token ? verifyResp.token : null;
    var userApi = verifyResp && verifyResp.utilizador ? verifyResp.utilizador : null;

    if (!userApi || !tokenApi) {
      throw new Error('Resposta inválida do servidor no cadastro.');
    }

    Auth.login(Object.assign({}, userApi, { role: 'utilizador' }), tokenApi);
    document.getElementById('formCadastro').style.display = 'none';
    document.getElementById('sucessoCadastro').style.display = 'block';
    document.getElementById('nomeBoasVindas').textContent = nome;
  } catch (apiErr) {
    alerta.textContent = apiErr && apiErr.message ? apiErr.message : 'Não foi possível concluir o cadastro online.';
    alerta.style.display = 'block';
  }
});

// Toggle password visibility
document.getElementById('btnTogglePasswordCadastro').addEventListener('click', function () {
  const input = document.getElementById('inputSenha');
  input.type = input.type === 'password' ? 'text' : 'password';
  this.textContent = input.type === 'password' ? 'Ver' : 'Ocultar';
});
