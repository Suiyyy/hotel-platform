import type { IHotel } from '../types/hotel'

const DEFAULT_BASE_URL = 'http://localhost:3001'

function getBaseUrl(): string {
  return (import.meta?.env?.VITE_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '')
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status} ${res.statusText}${text ? `: ${text}` : ''}`)
  }
  return res.json() as Promise<T>
}

export async function fetchHotels(): Promise<IHotel[]> {
  return request<IHotel[]>('/hotels')
}

export async function createHotel(hotel: Partial<IHotel>): Promise<IHotel> {
  return request<IHotel>('/hotels', { method: 'POST', body: JSON.stringify(hotel) })
}

export async function patchHotel(id: string, patch: Partial<IHotel>): Promise<IHotel> {
  return request<IHotel>(`/hotels/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(patch) })
}
