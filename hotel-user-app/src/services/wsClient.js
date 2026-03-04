let ws = null
const listeners = new Set()

const DEFAULT_WS_URL = 'ws://localhost:3001'

function getWsUrl() {
  const envBase =
    process.env.TARO_APP_WS_URL ||
    process.env.WS_URL ||
    DEFAULT_WS_URL
  return envBase.replace(/\/+$/, '')
}

export function connectWs() {
  if (ws && ws.readyState === WebSocket.OPEN) return

  try {
    ws = new WebSocket(getWsUrl())

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        if (msg.type === 'PRICE_UPDATE') {
          listeners.forEach(fn => fn(msg.hotelId, msg.newPrice))
        }
      } catch {
        // ignore malformed messages
      }
    }

    ws.onclose = () => {
      setTimeout(() => {
        if (listeners.size > 0) connectWs()
      }, 3000)
    }

    ws.onerror = () => {
      ws?.close()
    }
  } catch {
    // WebSocket not available
  }
}

export function disconnectWs() {
  if (ws) {
    ws.close()
    ws = null
  }
}

export function onPriceUpdate(handler) {
  listeners.add(handler)
  if (listeners.size === 1) connectWs()
  return () => {
    listeners.delete(handler)
    if (listeners.size === 0) disconnectWs()
  }
}
