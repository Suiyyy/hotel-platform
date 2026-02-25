type PriceUpdateHandler = (hotelId: string, newPrice: number) => void

let ws: WebSocket | null = null
const listeners = new Set<PriceUpdateHandler>()

const DEFAULT_WS_URL = 'ws://localhost:3001'

function getWsUrl(): string {
  const envBase =
    process.env.TARO_APP_WS_URL ||
    process.env.WS_URL ||
    DEFAULT_WS_URL
  return envBase.replace(/\/+$/, '')
}

export function connectWs(): void {
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
      // 自动重连（3秒后）
      setTimeout(() => {
        if (listeners.size > 0) connectWs()
      }, 3000)
    }

    ws.onerror = () => {
      ws?.close()
    }
  } catch {
    // WebSocket 不可用（如小程序端需用 Taro.connectSocket）
  }
}

export function disconnectWs(): void {
  if (ws) {
    ws.close()
    ws = null
  }
}

export function onPriceUpdate(handler: PriceUpdateHandler): () => void {
  listeners.add(handler)
  if (listeners.size === 1) connectWs()
  return () => {
    listeners.delete(handler)
    if (listeners.size === 0) disconnectWs()
  }
}
