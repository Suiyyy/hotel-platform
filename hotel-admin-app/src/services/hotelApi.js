const DEFAULT_BASE_URL = 'http://localhost:3001'
const TOKEN_KEY = 'auth_token'

export function getBaseUrl() {
  return (import.meta?.env?.VITE_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '')
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  }

  const res = await fetch(`${getBaseUrl()}${path}`, { ...options, headers })
  if (!res.ok) {
    const json = await res.json().catch(() => null)
    throw new Error(json?.message || `HTTP ${res.status} ${res.statusText}`)
  }
  return res.json()
}

export async function loginApi(username, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  })
}

export async function registerApi(username, password, role) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password, role })
  })
}

export async function fetchHotels() {
  return request('/hotels')
}

export async function fetchMyHotels() {
  return request('/hotels/mine')
}

export async function createHotel(hotel) {
  return request('/hotels', { method: 'POST', body: JSON.stringify(hotel) })
}

export async function patchHotel(id, patch) {
  return request(`/hotels/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(patch) })
}

export async function deleteHotel(id) {
  return request(`/hotels/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function restoreHotel(id) {
  return request(`/hotels/${encodeURIComponent(id)}/restore`, { method: 'PATCH' })
}

export async function aiPolish(text) {
  return request('/ai/polish', {
    method: 'POST',
    body: JSON.stringify({ text })
  })
}
