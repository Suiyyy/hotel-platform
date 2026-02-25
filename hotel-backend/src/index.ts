import http from 'node:http'
import express, { type Request, type Response, type NextFunction } from 'express'
import cors from 'cors'
import { initRedis } from './redis.js'
import { getAllHotels, getHotel, saveHotel } from './store.js'
import { findUserByUsername, createUser } from './userStore.js'
import { generateToken, authMiddleware } from './middleware/auth.js'
import { validateHotelCreate, validateHotelPatch } from './middleware/validate.js'
import { setupWebSocket, broadcastPriceUpdate } from './ws.js'
import { parseSearchIntent, aiSearchHotels } from './ai.js'
import type { IHotel } from './types/hotel.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '2mb' }))

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001

// ==================== Health ====================

app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true })
})

// ==================== Auth ====================

app.post('/auth/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password, role } = req.body as { username?: string; password?: string; role?: string }

    if (!username || username.length < 3) {
      res.status(400).json({ message: '用户名至少3个字符' })
      return
    }
    if (!password || password.length < 6) {
      res.status(400).json({ message: '密码至少6个字符' })
      return
    }
    if (role !== 'admin' && role !== 'user') {
      res.status(400).json({ message: '角色必须是 admin 或 user' })
      return
    }

    const existing = await findUserByUsername(username)
    if (existing) {
      res.status(409).json({ message: '用户名已存在' })
      return
    }

    const user = await createUser(username, password, role)
    const token = generateToken({ userId: user.id, username: user.username, role: user.role })

    res.status(201).json({
      user: { id: user.id, username: user.username, role: user.role },
      token
    })
  } catch (e) {
    next(e)
  }
})

app.post('/auth/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body as { username?: string; password?: string }

    if (!username || !password) {
      res.status(400).json({ message: '请输入用户名和密码' })
      return
    }

    const user = await findUserByUsername(username)
    if (!user || user.password !== password) {
      res.status(401).json({ message: '用户名或密码错误' })
      return
    }

    const token = generateToken({ userId: user.id, username: user.username, role: user.role })

    res.json({
      user: { id: user.id, username: user.username, role: user.role },
      token
    })
  } catch (e) {
    next(e)
  }
})

// ==================== Hotels (public) ====================

app.get('/hotels/public', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hotels = await getAllHotels()
    let filtered = hotels.filter((h: IHotel) => h.status === 'approved' && h.isOnline)

    // Keyword filter
    const keyword = (req.query.keyword as string || '').trim().toLowerCase()
    if (keyword) {
      filtered = filtered.filter(h =>
        h.nameCn.toLowerCase().includes(keyword) ||
        h.address.toLowerCase().includes(keyword) ||
        (h.nameEn && h.nameEn.toLowerCase().includes(keyword))
      )
    }

    // Sort
    const sort = req.query.sort as string || 'price'
    const order = req.query.order as string || 'asc'
    const sortKey = (['price', 'rating', 'distance', 'star'].includes(sort) ? sort : 'price') as keyof IHotel
    filtered.sort((a, b) => {
      const va = a[sortKey] as number
      const vb = b[sortKey] as number
      return order === 'desc' ? vb - va : va - vb
    })

    // Pagination
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const pageSize = Math.max(1, Math.min(50, parseInt(req.query.pageSize as string) || 10))
    const total = filtered.length
    const data = filtered.slice((page - 1) * pageSize, page * pageSize)

    res.json({ data, total, page, pageSize })
  } catch (e) {
    next(e)
  }
})

// ==================== Hotels (admin/merchant) ====================

app.get('/hotels', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const hotels = await getAllHotels()
    res.json(hotels)
  } catch (e) {
    next(e)
  }
})

app.get('/hotels/mine', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hotels = await getAllHotels()
    res.json(hotels.filter((h: IHotel) => h.merchantId === req.user!.userId))
  } catch (e) {
    next(e)
  }
})

app.post('/hotels', validateHotelCreate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = (req.body ?? {}) as Partial<IHotel>
    const now = new Date().toISOString()
    const newHotel: IHotel = {
      ...payload as IHotel,
      id: Date.now().toString(),
      merchantId: req.user?.userId,
      createTime: now,
      updateTime: now,
      status: 'pending',
      isOnline: false,
      rejectReason: ''
    }
    await saveHotel(newHotel)
    res.status(201).json(newHotel)
  } catch (e) {
    next(e)
  }
})

app.patch('/hotels/:id', validateHotelPatch, async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const patch = (req.body ?? {}) as Partial<IHotel>
    const existing = await getHotel(id)
    if (!existing) {
      res.status(404).json({ message: 'not_found' })
      return
    }
    const updated: IHotel = { ...existing, ...patch, updateTime: new Date().toISOString() }
    await saveHotel(updated)

    // Broadcast price update via WebSocket
    if (patch.price !== undefined && patch.price !== existing.price) {
      broadcastPriceUpdate(id, updated.price)
    }

    res.json(updated)
  } catch (e) {
    next(e)
  }
})

// ==================== Soft Delete & Restore ====================

app.delete('/hotels/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const existing = await getHotel(id)
    if (!existing) {
      res.status(404).json({ message: 'not_found' })
      return
    }
    const updated: IHotel = { ...existing, isOnline: false, updateTime: new Date().toISOString() }
    await saveHotel(updated)
    res.json(updated)
  } catch (e) {
    next(e)
  }
})

app.patch('/hotels/:id/restore', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const existing = await getHotel(id)
    if (!existing) {
      res.status(404).json({ message: 'not_found' })
      return
    }
    if (existing.status !== 'approved') {
      res.status(400).json({ message: '仅已通过审核的酒店可以恢复上线' })
      return
    }
    const updated: IHotel = { ...existing, isOnline: true, updateTime: new Date().toISOString() }
    await saveHotel(updated)
    res.json(updated)
  } catch (e) {
    next(e)
  }
})

// ==================== AI Search ====================

app.post('/ai/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query, page, pageSize } = req.body as { query?: string; page?: number; pageSize?: number }
    if (!query || !query.trim()) {
      res.status(400).json({ message: '请输入搜索描述' })
      return
    }

    const { intent, fallback } = await parseSearchIntent(query.trim())
    const result = await aiSearchHotels(intent, page || 1, pageSize || 10, fallback)

    res.json(result)
  } catch (e) {
    next(e)
  }
})

// ==================== Error Handler ====================

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err)
  res.status(500).json({ message: 'internal_error' })
})

const server = http.createServer(app)
setupWebSocket(server)

// 先连接 Redis 并加载初始数据，再启动 HTTP 服务
initRedis()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`[hotel-backend] listening on http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('[redis] init failed:', err)
    process.exit(1)
  })
