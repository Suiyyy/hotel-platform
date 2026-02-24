import Taro from '@tarojs/taro';

const DEFAULT_BASE_URL = 'http://localhost:3001';

function getBaseUrl() {
  const envBase =
    process.env.TARO_APP_API_BASE_URL ||
    process.env.API_BASE_URL ||
    DEFAULT_BASE_URL;
  return envBase.replace(/\/+$/, '');
}

async function request(path, options = {}) {
  const url = `${getBaseUrl()}${path}`;

  if (process.env.TARO_ENV === 'weapp') {
    const res = await Taro.request({
      url,
      method: options.method || 'GET',
      data: options.body ? JSON.parse(options.body) : undefined,
      header: { 'Content-Type': 'application/json', ...(options.headers || {}) }
    });
    if (res.statusCode >= 200 && res.statusCode < 300) return res.data;
    throw new Error(`HTTP ${res.statusCode}`);
  }

  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchPublicHotels() {
  return request('/hotels/public');
}

