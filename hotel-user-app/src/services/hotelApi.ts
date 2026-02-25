import Taro from '@tarojs/taro'
import type { IHotel } from '../types/hotel'

const DEFAULT_BASE_URL = 'http://localhost:3001'

function getBaseUrl(): string {
  const envBase =
    process.env.TARO_APP_API_BASE_URL ||
    process.env.API_BASE_URL ||
    DEFAULT_BASE_URL
  return envBase.replace(/\/+$/, '')
}

interface RequestOptions {
  method?: string
  body?: string
  headers?: Record<string, string>
}

async function request<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = `${getBaseUrl()}${path}`

  if (process.env.TARO_ENV === 'weapp') {
    const res = await Taro.request({
      url,
      method: (options.method || 'GET') as any,
      data: options.body ? JSON.parse(options.body) : undefined,
      header: { 'Content-Type': 'application/json', ...(options.headers || {}) }
    })
    if (res.statusCode >= 200 && res.statusCode < 300) return res.data as T
    throw new Error(`HTTP ${res.statusCode}`)
  }

  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function fetchPublicHotels(): Promise<IHotel[]> {
  return request<IHotel[]>('/hotels/public')
}

export interface IPagedResult {
  data: IHotel[]
  total: number
  page: number
  pageSize: number
}

export interface IPublicHotelsQuery {
  keyword?: string
  sort?: 'price' | 'rating' | 'distance' | 'star'
  order?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

export interface IAiSearchResult {
  data: IHotel[]
  total: number
  filters: Record<string, any>
  fallback: boolean
}

export async function aiSearch(query: string): Promise<IAiSearchResult> {
  return request<IAiSearchResult>('/ai/search', {
    method: 'POST',
    body: JSON.stringify({ query }),
  })
}

export async function fetchPublicHotelsPaged(query: IPublicHotelsQuery = {}): Promise<IPagedResult> {
  const params = new URLSearchParams()
  if (query.keyword) params.set('keyword', query.keyword)
  if (query.sort) params.set('sort', query.sort)
  if (query.order) params.set('order', query.order)
  if (query.page) params.set('page', String(query.page))
  if (query.pageSize) params.set('pageSize', String(query.pageSize))

  const qs = params.toString()
  return request<IPagedResult>(`/hotels/public${qs ? `?${qs}` : ''}`)
}
