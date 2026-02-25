import { WebSocketServer, type WebSocket } from 'ws'
import type { Server } from 'node:http'

let wss: WebSocketServer | null = null

export interface IPriceUpdateMessage {
  type: 'PRICE_UPDATE'
  hotelId: string
  newPrice: number
  timestamp: string
}

export function setupWebSocket(server: Server): WebSocketServer {
  wss = new WebSocketServer({ server })

  wss.on('connection', (ws: WebSocket) => {
    ws.send(JSON.stringify({ type: 'CONNECTED', message: '已连接实时价格推送' }))
  })

  return wss
}

export function broadcastPriceUpdate(hotelId: string, newPrice: number): void {
  if (!wss) return

  const message: IPriceUpdateMessage = {
    type: 'PRICE_UPDATE',
    hotelId,
    newPrice,
    timestamp: new Date().toISOString()
  }

  const data = JSON.stringify(message)

  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === 1) {
      client.send(data)
    }
  })
}
