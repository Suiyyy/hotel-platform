import type { IHotel } from '../types/hotel'

const DEFAULT_BASE_URL = 'http://localhost:3001'
const TOKEN_KEY = 'auth_token'

function getBaseUrl(): string {
  return (import.meta?.env?.VITE_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '')
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string> || {})
  }

  const res = await fetch(`${getBaseUrl()}${path}`, { ...options, headers })
  if (!res.ok) {
    const json = await res.json().catch(() => null) as { message?: string } | null
    throw new Error(json?.message || `HTTP ${res.status} ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

// ==================== Auth ====================

interface IAuthResponse {
  user: { id: string; username: string; role: 'admin' | 'user' }
  token: string
}

export async function loginApi(username: string, password: string): Promise<IAuthResponse> {
  return request<IAuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  })
}

export async function registerApi(username: string, password: string, role: string): Promise<IAuthResponse> {
  return request<IAuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password, role })
  })
}

// ==================== Hotels ====================

export async function fetchHotels(): Promise<IHotel[]> {
  return request<IHotel[]>('/hotels')
}

export async function fetchMyHotels(): Promise<IHotel[]> {
  return request<IHotel[]>('/hotels/mine')
}

export async function createHotel(hotel: Partial<IHotel>): Promise<IHotel> {
  return request<IHotel>('/hotels', { method: 'POST', body: JSON.stringify(hotel) })
}

export async function patchHotel(id: string, patch: Partial<IHotel>): Promise<IHotel> {
  return request<IHotel>(`/hotels/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(patch) })
}

export async function deleteHotel(id: string): Promise<IHotel> {
  return request<IHotel>(`/hotels/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function restoreHotel(id: string): Promise<IHotel> {
  return request<IHotel>(`/hotels/${encodeURIComponent(id)}/restore`, { method: 'PATCH' })
}
