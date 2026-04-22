/* ===========================
   AcheiDoc — Módulo de Auth
   =========================== */

var Auth = (function () {
  var SESSION_KEY = 'acheidoc_user';

  function getUser() {
    try {
      var data = localStorage.getItem(SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  function isLoggedIn() {
    var user = getUser();
    return !!(user && user.role === 'utilizador');
  }

  function login(userData) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = 'index.html';
  }

  function requireAuth() {
    if (!isLoggedIn()) {
      // Usar apenas o caminho relativo (sem origem) para o redirect
      var pathParts = window.location.pathname.substring(1);
      var currentPage = (pathParts || 'index.html') + window.location.search;
      window.location.href = 'login.html?redirect=' + encodeURIComponent(currentPage);
    }
  }

  return {
    getUser: getUser,
    isLoggedIn: isLoggedIn,
    login: login,
    logout: logout,
    requireAuth: requireAuth
  };
})();
