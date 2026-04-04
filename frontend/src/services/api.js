import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
});

function readStoredToken() {
  try {
    const raw = localStorage.getItem('userInfo');
    if (!raw) return null;
    const u = JSON.parse(raw);
    return u?.token && u.token !== 'undefined' ? u.token : null;
  } catch {
    return null;
  }
}

api.interceptors.request.use((config) => {
  const token = readStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const url = err.config?.url || '';
    if (status === 401 && !url.includes('/auth/login') && !url.includes('/auth/register')) {
      localStorage.removeItem('userInfo');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login?reason=session';
      }
    }
    return Promise.reject(err);
  }
);

export const authHeaders = (token) =>
  token && token !== 'undefined' ? { Authorization: `Bearer ${token}` } : {};

export default api;
