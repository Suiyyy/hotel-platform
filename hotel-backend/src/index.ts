import express, { type Request, type Response, type NextFunction } from 'express'
import cors from 'cors'
import { getAllHotels, setAllHotels } from './store.js'
import { findUserByUsername, createUser } from './userStore.js'
import { generateToken, authMiddleware } from './middleware/auth.js'
import { validateHotelCreate, validateHotelPatch } from './middleware/validate.js'
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

app.get('/hotels/public', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const hotels = await getAllHotels()
    res.json(hotels.filter((h: IHotel) => h.status === 'approved' && h.isOnline))
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
    const hotels = await getAllHotels()
    const newHotel: IHotel = {
      ...payload as IHotel,
      id: Date.now().toString(),
      createTime: now,
      updateTime: now,
      status: 'pending',
      isOnline: false,
      rejectReason: ''
    }
    const nextHotels = [...hotels, newHotel]
    await setAllHotels(nextHotels)
    res.status(201).json(newHotel)
  } catch (e) {
    next(e)
  }
})

app.patch('/hotels/:id', validateHotelPatch, async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const patch = (req.body ?? {}) as Partial<IHotel>
    const hotels = await getAllHotels()
    const index = hotels.findIndex((h: IHotel) => h.id === id)
    if (index === -1) {
      res.status(404).json({ message: 'not_found' })
      return
    }
    const updated: IHotel = { ...hotels[index], ...patch, updateTime: new Date().toISOString() }
    const nextHotels = hotels.slice()
    nextHotels[index] = updated
    await setAllHotels(nextHotels)
    res.json(updated)
  } catch (e) {
    next(e)
  }
})

// ==================== Error Handler ====================

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err)
  res.status(500).json({ message: 'internal_error' })
})

app.listen(PORT, () => {
  console.log(`[hotel-backend] listening on http://localhost:${PORT}`)
})
