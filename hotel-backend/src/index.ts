import express, { type Request, type Response, type NextFunction } from 'express'
import cors from 'cors'
import { getAllHotels, setAllHotels } from './store.js'
import type { IHotel } from './types/hotel.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '2mb' }))

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001

app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true })
})

app.get('/hotels', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const hotels = await getAllHotels()
    res.json(hotels)
  } catch (e) {
    next(e)
  }
})

app.get('/hotels/public', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const hotels = await getAllHotels()
    res.json(hotels.filter((h: IHotel) => h.status === 'approved' && h.isOnline))
  } catch (e) {
    next(e)
  }
})

app.post('/hotels', async (req: Request, res: Response, next: NextFunction) => {
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

app.patch('/hotels/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
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

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err)
  res.status(500).json({ message: 'internal_error' })
})

app.listen(PORT, () => {
  console.log(`[hotel-backend] listening on http://localhost:${PORT}`)
})
