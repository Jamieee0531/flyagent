const BASE = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8080';

async function request(path, { token, method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export function registerUser(email, password, displayName) {
  return request('/api/auth/register', {
    method: 'POST',
    body: { email, password, displayName },
  });
}

export function loginUser(email, password) {
  return request('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function getProfile(token) {
  return request('/api/user/profile', { token });
}

export function updateProfile(token, data) {
  return request('/api/user/profile', { token, method: 'PUT', body: data });
}

export function listTravelPlans(token) {
  return request('/api/travel-plans', { token });
}

export function getTravelPlan(token, id) {
  return request(`/api/travel-plans/${id}`, { token });
}

export function createTravelPlan(token, plan) {
  return request('/api/travel-plans', { token, method: 'POST', body: plan });
}

export function updateTravelPlan(token, id, data) {
  return request(`/api/travel-plans/${id}`, { token, method: 'PUT', body: data });
}

export function deleteTravelPlan(token, id) {
  return request(`/api/travel-plans/${id}`, { token, method: 'DELETE' });
}
