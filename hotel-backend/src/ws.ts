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

function broadcast(data: Record<string, unknown>): void {
  if (!wss) return
  const msg = JSON.stringify(data)
  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === 1) client.send(msg)
  })
}

export function broadcastPriceUpdate(hotelId: string, newPrice: number): void {
  broadcast({
    type: 'PRICE_UPDATE',
    hotelId,
    newPrice,
    timestamp: new Date().toISOString()
  })
}

export function broadcastNewHotel(hotel: { id: string; nameCn: string; merchantId?: string }): void {
  broadcast({
    type: 'NEW_HOTEL',
    hotelId: hotel.id,
    hotelName: hotel.nameCn,
    timestamp: new Date().toISOString()
  })
}

export function broadcastAuditResult(hotel: { id: string; nameCn: string; status: string; rejectReason?: string }): void {
  broadcast({
    type: 'AUDIT_RESULT',
    hotelId: hotel.id,
    hotelName: hotel.nameCn,
    status: hotel.status,
    rejectReason: hotel.rejectReason || '',
    timestamp: new Date().toISOString()
  })
}
