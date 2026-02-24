const DEFAULT_BASE_URL = 'http://localhost:3001';

function getBaseUrl() {
  return (import.meta?.env?.VITE_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
}

async function request(path, options) {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText}${text ? `: ${text}` : ''}`);
  }
  return res.json();
}

export async function fetchHotels() {
  return request('/hotels');
}

export async function createHotel(hotel) {
  return request('/hotels', { method: 'POST', body: JSON.stringify(hotel) });
}

export async function patchHotel(id, patch) {
  return request(`/hotels/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(patch) });
}

