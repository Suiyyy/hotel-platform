import type { Request, Response, NextFunction } from 'express'
import type { IAuthPayload } from '../types/hotel.js'

// Simple token: base64 encoded JSON payload (demo only, not for production)
export function generateToken(payload: IAuthPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

export function parseToken(token: string): IAuthPayload | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8')
    const parsed = JSON.parse(decoded) as IAuthPayload
    if (parsed.userId && parsed.username && parsed.role) {
      return parsed
    }
    return null
  } catch {
    return null
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: IAuthPayload
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: '未登录' })
    return
  }

  const token = authHeader.slice(7)
  const payload = parseToken(token)
  if (!payload) {
    res.status(401).json({ message: 'token 无效' })
    return
  }

  req.user = payload
  next()
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: '未登录' })
      return
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: '权限不足' })
      return
    }
    next()
  }
}
