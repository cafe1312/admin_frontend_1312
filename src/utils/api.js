const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000/api`;

const api = {
  getToken: () => localStorage.getItem('1312_admin_token'),
  
  setToken: (token) => localStorage.setItem('1312_admin_token', token),
  
  clearToken: () => {
    localStorage.removeItem('1312_admin_token');
    localStorage.removeItem('1312_admin_user');
  },

  getHeaders: () => {
    const headers = { 'Content-Type': 'application/json' };
    const token = api.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  get: async (url) => {
    const res = await fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      headers: api.getHeaders(),
    });
    if (res.status === 401) {
      api.clearToken();
      window.location.href = '/login';
      return { success: false, message: 'Session expired' };
    }
    return res.json();
  },

  post: async (url, body) => {
    const res = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: api.getHeaders(),
      body: JSON.stringify(body),
    });
    if (res.status === 401) {
      api.clearToken();
      window.location.href = '/login';
      return { success: false, message: 'Session expired' };
    }
    return res.json();
  },

  put: async (url, body) => {
    const res = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: api.getHeaders(),
      body: JSON.stringify(body),
    });
    if (res.status === 401) {
      api.clearToken();
      window.location.href = '/login';
      return { success: false, message: 'Session expired' };
    }
    return res.json();
  },

  delete: async (url) => {
    const res = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers: api.getHeaders(),
    });
    if (res.status === 401) {
      api.clearToken();
      window.location.href = '/login';
      return { success: false, message: 'Session expired' };
    }
    return res.json();
  },
};

export default api;
