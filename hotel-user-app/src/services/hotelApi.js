import Taro from '@tarojs/taro'

const DEFAULT_BASE_URL = 'http://localhost:3001'

function getBaseUrl() {
  // 浏览器环境中没有process对象，直接返回默认URL
  return DEFAULT_BASE_URL.replace(/\/+$/, '')
}

async function request(path, options = {}) {
  const url = `${getBaseUrl()}${path}`

  // 检查是否在浏览器环境中
  if (typeof window !== 'undefined') {
    // 浏览器环境使用fetch
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  } else {
    // 非浏览器环境使用Taro.request
    const res = await Taro.request({
      url,
      method: (options.method || 'GET'),
      data: options.body ? JSON.parse(options.body) : undefined,
      header: { 'Content-Type': 'application/json', ...(options.headers || {}) }
    })
    if (res.statusCode >= 200 && res.statusCode < 300) return res.data
    throw new Error(`HTTP ${res.statusCode}`)
  }
}

export async function fetchPublicHotels() {
  console.log('调用fetchPublicHotels...')
  const res = await request('/hotels/public')
  console.log('API响应:', res)
  const result = Array.isArray(res) ? res : (res.data || [])
  console.log('返回结果:', result)
  return result
}

export async function aiSearch(query) {
  return request('/ai/search', {
    method: 'POST',
    body: JSON.stringify({ query }),
  })
}

export function resolveImageUrl(url) {
  if (!url) return ''
  return url.startsWith('/') ? `${getBaseUrl()}${url}` : url
}

export async function fetchPublicHotelsPaged(query = {}) {
  const params = new URLSearchParams()
  if (query.keyword) params.set('keyword', query.keyword)
  if (query.sort) params.set('sort', query.sort)
  if (query.order) params.set('order', query.order)
  if (query.page) params.set('page', String(query.page))
  if (query.pageSize) params.set('pageSize', String(query.pageSize))
  const qs = params.toString()
  return request(`/hotels/public${qs ? `?${qs}` : ''}`)
}

export { getBaseUrl }
