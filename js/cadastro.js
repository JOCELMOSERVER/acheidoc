/* ===========================
   AcheiDoc — Cadastro JS
   =========================== */

Auth.redirectIfLoggedIn();

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
  icone.textContent = this.value === senha ? '✅' : '❌';
});

function calcularForcaSenha(senha) {
  if (senha.length < 4) return { nivel: 'fraca', texto: '🔴 Senha fraca' };
  if (senha.length < 8) return { nivel: 'media', texto: '🟡 Senha média' };
  return { nivel: 'forte', texto: '🟢 Senha forte' };
}

// Submit
document.getElementById('formCadastro').addEventListener('submit', function (e) {
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
    alerta.textContent = '❌ As senhas não coincidem.';
    alerta.style.display = 'block';
    return;
  }
  if (!termos) {
    alerta.textContent = '❌ Deve aceitar os Termos e Condições.';
    alerta.style.display = 'block';
    return;
  }
  if (UTILIZADORES.find(function (u) { return u.email === email; })) {
    alerta.textContent = '❌ Este email já está registado.';
    alerta.style.display = 'block';
    return;
  }

  // Criar utilizador
  const novoUtilizador = {
    id: UTILIZADORES.length + 1,
    nome: nome,
    email: email,
    telefone: telefone,
    municipio: municipio,
    senha: senha,
    dataCadastro: new Date().toISOString().split('T')[0],
    pontos: 0,
    role: 'utilizador',
    documentosPublicados: [],
    documentosResgatados: []
  };

  UTILIZADORES.push(novoUtilizador);
  Auth.login(novoUtilizador);

  // Mostrar sucesso
  document.getElementById('formCadastro').style.display = 'none';
  document.getElementById('sucessoCadastro').style.display = 'block';
  document.getElementById('nomeBoasVindas').textContent = nome;
});

// Toggle password visibility
document.getElementById('btnTogglePasswordCadastro').addEventListener('click', function () {
  const input = document.getElementById('inputSenha');
  input.type = input.type === 'password' ? 'text' : 'password';
});
