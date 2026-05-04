/* ===========================
   Encontra já — Autenticação
   =========================== */

const Auth = {
  // Guardar utilizador na sessão (localStorage)
  login(utilizador, token) {
    localStorage.setItem('acheidoc_user', JSON.stringify(utilizador));
    if (token && typeof Api !== 'undefined' && Api.setToken) {
      Api.setToken(token);
    }
  },

  // Remover sessão
  logout() {
    localStorage.removeItem('acheidoc_user');
    if (typeof Api !== 'undefined' && Api.clearToken) {
      Api.clearToken();
    }
    window.location.href = 'index.html';
  },

  // Obter utilizador logado
  getUser() {
    const data = localStorage.getItem('acheidoc_user');
    return data ? JSON.parse(data) : null;
  },

  // Verificar se está logado
  isLoggedIn() {
    return !!localStorage.getItem('acheidoc_user');
  },

  // Redirecionar para login se não estiver logado
  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
    }
  },

  // Redirecionar para home se já estiver logado
  redirectIfLoggedIn() {
    if (this.isLoggedIn()) {
      window.location.href = 'index.html';
    }
  }
};
