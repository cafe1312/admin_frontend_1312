const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

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
    return res.json();
  },

  post: async (url, body) => {
    const res = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: api.getHeaders(),
      body: JSON.stringify(body),
    });
    return res.json();
  },

  put: async (url, body) => {
    const res = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: api.getHeaders(),
      body: JSON.stringify(body),
    });
    return res.json();
  },

  delete: async (url) => {
    const res = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers: api.getHeaders(),
    });
    return res.json();
  },
};

export default api;
