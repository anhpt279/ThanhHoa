/** Trên Vercel: cùng domain → /api. Local dev: Vite proxy. Override: VITE_API_URL */
const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') || '/api';

function getToken() {
  return localStorage.getItem('token');
}

export async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const hadSession = Boolean(getToken());
    const isLoginAttempt = /^\/auth\/(login|register)$/.test(path);
    if (res.status === 401 && hadSession && !isLoginAttempt) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw new Error(data.message || 'Có lỗi xảy ra');
  }
  return data;
}
