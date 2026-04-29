/**
 * src/api.js
 * Central API client — all components import from here.
 * Automatically attaches the JWT token from localStorage.
 */

const BASE = 'http://localhost:5000/api';

// ── Token helpers ─────────────────────────────────────────────────────────────
export const getToken  = ()        => localStorage.getItem('cf_token');
export const setToken  = (token)   => localStorage.setItem('cf_token', token);
export const clearToken = ()       => localStorage.removeItem('cf_token');

export const getUser   = ()        => {
  try { return JSON.parse(localStorage.getItem('cf_user')); } catch { return null; }
};
export const setUser   = (user)    => localStorage.setItem('cf_user', JSON.stringify(user));
export const clearUser = ()        => localStorage.removeItem('cf_user');

// ── Core fetch wrapper ────────────────────────────────────────────────────────
const req = async (method, path, body) => {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: async (email, password) => {
    const data = await req('POST', '/auth/login', { email, password });
    setToken(data.token);
    setUser(data.user);
    return data;
  },
  register: async (payload) => {
    const data = await req('POST', '/auth/register', payload);
    setToken(data.token);
    setUser(data.user);
    return data;
  },
  me: () => req('GET', '/auth/me'),
  logout: () => { clearToken(); clearUser(); },
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersAPI = {
  list:   (params = {}) => req('GET', `/users?${new URLSearchParams(params)}`),
  get:    (id)          => req('GET', `/users/${id}`),
  update: (id, body)    => req('PUT', `/users/${id}`, body),
  delete: (id)          => req('DELETE', `/users/${id}`),
  drivers: ()           => req('GET', '/users/drivers'),
};

// ── Drivers ───────────────────────────────────────────────────────────────────
export const driversAPI = {
  list:           ()       => req('GET', '/drivers'),
  me:             ()       => req('GET', '/drivers/me'),
  updateLocation: (coords) => req('PATCH', '/drivers/me/location', coords),
  updateStatus:   (status) => req('PATCH', '/drivers/me/status', { status }),
  get:            (id)     => req('GET', `/drivers/${id}`),
  update:         (id, b)  => req('PUT', `/drivers/${id}`, b),
};

// ── Shipments ─────────────────────────────────────────────────────────────────
export const shipmentsAPI = {
  list:           (params = {}) => req('GET', `/shipments?${new URLSearchParams(params)}`),
  get:            (id)          => req('GET', `/shipments/${id}`),
  create:         (body)        => req('POST', '/shipments', body),
  update:         (id, body)    => req('PUT', `/shipments/${id}`, body),
  updateLocation: (id, coords)  => req('PATCH', `/shipments/${id}/location`, coords),
  delete:         (id)          => req('DELETE', `/shipments/${id}`),
};
