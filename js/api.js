/* ===========================
   AcheiDoc — API Client
   =========================== */

(function () {
  var DEFAULT_API_BASE = 'https://acheidoc-api.onrender.com';

  function normalizeBaseUrl(rawBase) {
    var base = String(rawBase || DEFAULT_API_BASE).trim().replace(/\/+$/, '');
    // Endpoints below already include "/api/..."; strip a trailing "/api" to avoid "/api/api" URLs.
    base = base.replace(/\/api$/i, '');
    return base;
  }

  var API_BASE = normalizeBaseUrl(window.ACHEIDOC_API_BASE || localStorage.getItem('acheidoc_api_base') || DEFAULT_API_BASE);

  function buildUrl(path) {
    var normalizedPath = String(path || '');
    if (normalizedPath.charAt(0) !== '/') normalizedPath = '/' + normalizedPath;
    return API_BASE + normalizedPath;
  }

  function getToken() {
    var raw = localStorage.getItem('acheidoc_auth_token');
    return raw ? String(raw) : '';
  }

  function setToken(token) {
    if (token) {
      localStorage.setItem('acheidoc_auth_token', token);
    }
  }

  function clearToken() {
    localStorage.removeItem('acheidoc_auth_token');
  }

  async function request(path, options) {
    var opts = options || {};
    var headers = Object.assign({}, opts.headers || {});
    if (!headers['Content-Type'] && opts.body && !(opts.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (!opts.skipAuth) {
      var token = getToken();
      if (token) headers.Authorization = 'Bearer ' + token;
    }

    var response = await fetch(buildUrl(path), Object.assign({}, opts, { headers: headers }));
    var data = null;

    try {
      data = await response.json();
    } catch (err) {
      data = null;
    }

    if (!response.ok) {
      var msg = data && data.erro ? data.erro : 'Erro ao comunicar com o servidor.';
      var apiError = new Error(msg);
      apiError.status = response.status;
      apiError.payload = data;
      throw apiError;
    }

    return data;
  }

  window.Api = {
    baseUrl: API_BASE,
    getToken: getToken,
    setToken: setToken,
    clearToken: clearToken,
    request: request,

    health: function () {
      return request('/api/health', { method: 'GET', skipAuth: true });
    },

    stats: {
      summary: function () {
        return request('/api/stats', { method: 'GET', skipAuth: true });
      }
    },

    auth: {
      login: function (email, password) {
        return request('/api/auth/login', {
          method: 'POST',
          skipAuth: true,
          body: JSON.stringify({ email: email, password: password })
        });
      },
      register: function (payload) {
        return request('/api/auth/register', {
          method: 'POST',
          skipAuth: true,
          body: JSON.stringify(payload)
        });
      },
      recover: function (email) {
        return request('/api/auth/recover', {
          method: 'POST',
          skipAuth: true,
          body: JSON.stringify({ email: email })
        });
      },
      resetPassword: function (email, novaPassword) {
        return request('/api/auth/reset-password', {
          method: 'POST',
          skipAuth: true,
          body: JSON.stringify({ email: email, novaPassword: novaPassword })
        });
      }
    },

    agenteAuth: {
      login: function (email, password) {
        return request('/api/agente/auth/login', {
          method: 'POST',
          skipAuth: true,
          body: JSON.stringify({ email: email, password: password })
        });
      },
      recover: function (email) {
        return request('/api/agente/auth/recover', {
          method: 'POST',
          skipAuth: true,
          body: JSON.stringify({ email: email })
        });
      },
      resetPassword: function (email, novaPassword) {
        return request('/api/agente/auth/reset-password', {
          method: 'POST',
          skipAuth: true,
          body: JSON.stringify({ email: email, novaPassword: novaPassword })
        });
      }
    },

    adminAuth: {
      login: function (email, password) {
        return request('/api/admin/auth/login', {
          method: 'POST',
          skipAuth: true,
          body: JSON.stringify({ email: email, password: password })
        });
      },
      recover: function (email) {
        return request('/api/admin/auth/recover', {
          method: 'POST',
          skipAuth: true,
          body: JSON.stringify({ email: email })
        });
      },
      resetPassword: function (email, novaPassword) {
        return request('/api/admin/auth/reset-password', {
          method: 'POST',
          skipAuth: true,
          body: JSON.stringify({ email: email, novaPassword: novaPassword })
        });
      }
    },

    documentos: {
      list: function (query) {
        var qs = query ? ('?' + new URLSearchParams(query).toString()) : '';
        return request('/api/documentos' + qs, { method: 'GET', skipAuth: true });
      },
      detail: function (id) {
        return request('/api/documentos/' + encodeURIComponent(id), { method: 'GET' });
      },
      myList: function (query) {
        var qs = query ? ('?' + new URLSearchParams(query).toString()) : '';
        return request('/api/documentos/meus' + qs, { method: 'GET' });
      },
      create: function (payload) {
        return request('/api/documentos', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },
      createWithFile: function (formData) {
        return request('/api/documentos', {
          method: 'POST',
          body: formData
        });
      },
      adminList: function (query) {
        var qs = query ? ('?' + new URLSearchParams(query).toString()) : '';
        return request('/api/documentos/admin/todos' + qs, { method: 'GET' });
      },
      adminDetail: function (id) {
        return request('/api/documentos/admin/' + encodeURIComponent(id), { method: 'GET' });
      },
      adminReview: function (id, payload) {
        return request('/api/documentos/admin/' + encodeURIComponent(id), {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
      },
      agenteLista: function (query) {
        var qs = query ? ('?' + new URLSearchParams(query).toString()) : '';
        return request('/api/documentos/agente/lista' + qs, { method: 'GET' });
      },
      agenteByCodigo: function (codigo) {
        return request('/api/documentos/agente/codigo/' + encodeURIComponent(codigo), { method: 'GET' });
      },
      agenteUpdate: function (id, status) {
        return request('/api/documentos/agente/' + encodeURIComponent(id), {
          method: 'PATCH',
          body: JSON.stringify({ status: status })
        });
      }
    },

    pagamentos: {
      create: function (payload) {
        return request('/api/pagamentos', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },
      adminList: function (query) {
        var qs = query ? ('?' + new URLSearchParams(query).toString()) : '';
        return request('/api/pagamentos/admin' + qs, { method: 'GET' });
      },
      adminConfirmar: function (id) {
        return request('/api/pagamentos/admin/' + encodeURIComponent(id) + '/confirmar', {
          method: 'PATCH'
        });
      },
      adminRejeitar: function (id) {
        return request('/api/pagamentos/admin/' + encodeURIComponent(id) + '/rejeitar', {
          method: 'PATCH'
        });
      }
    },

    pontosEntrega: {
      list: function () {
        return request('/api/pontos-entrega', { method: 'GET', skipAuth: true });
      },
      nearest: function (query) {
        var qs = query ? ('?' + new URLSearchParams(query).toString()) : '';
        return request('/api/pontos-entrega/nearest' + qs, { method: 'GET', skipAuth: true });
      },
      byDocumento: function (id) {
        return request('/api/pontos-entrega/documento/' + encodeURIComponent(id), { method: 'GET', skipAuth: true });
      },
      create: function (payload) {
        return request('/api/pontos-entrega', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
    },

    recompensas: {
      summary: function () {
        return request('/api/recompensas', { method: 'GET' });
      },
      redeem: function (beneficioCodigo) {
        return request('/api/recompensas/resgatar', {
          method: 'POST',
          body: JSON.stringify({ beneficio_codigo: beneficioCodigo })
        });
      }
    },

    utilizadores: {
      perfil: function () {
        return request('/api/utilizadores/perfil', { method: 'GET' });
      },
      atualizar: function (payload) {
        return request('/api/utilizadores/perfil', {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
      },
      alterarPassword: function (payload) {
        return request('/api/utilizadores/password', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
    },

    adminUtilizadores: {
      list: function (query) {
        var qs = query ? ('?' + new URLSearchParams(query).toString()) : '';
        return request('/api/admin/utilizadores' + qs, { method: 'GET' });
      },
      updateStatus: function (id, status) {
        return request('/api/admin/utilizadores/' + encodeURIComponent(id) + '/status', {
          method: 'PATCH',
          body: JSON.stringify({ status: status })
        });
      },
      addPontos: function (id, delta) {
        return request('/api/admin/utilizadores/' + encodeURIComponent(id) + '/pontos', {
          method: 'PATCH',
          body: JSON.stringify({ delta: delta })
        });
      }
    },

    adminAgentes: {
      list: function (query) {
        var qs = query ? ('?' + new URLSearchParams(query).toString()) : '';
        return request('/api/admin/agentes' + qs, { method: 'GET' });
      },
      updateStatus: function (id, status) {
        return request('/api/admin/agentes/' + encodeURIComponent(id) + '/status', {
          method: 'PATCH',
          body: JSON.stringify({ status: status })
        });
      },
      addPontos: function (id, delta) {
        return request('/api/admin/agentes/' + encodeURIComponent(id) + '/pontos', {
          method: 'PATCH',
          body: JSON.stringify({ delta: delta })
        });
      },
      create: function (payload) {
        return request('/api/admin/agentes', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
    }
  };
})();
