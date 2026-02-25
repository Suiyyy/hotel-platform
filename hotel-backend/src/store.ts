import { redis } from './redis.js'
import type { IHotel } from './types/hotel.js'

export async function getAllHotels(): Promise<IHotel[]> {
  const keys = await redis.keys('hotel:*')
  if (keys.length === 0) return []
  const values = await redis.mget(...keys)
  return values
    .filter((v: string | null): v is string => v !== null)
    .map((v: string) => JSON.parse(v) as IHotel)
}

export async function getHotel(id: string): Promise<IHotel | null> {
  const val = await redis.get(`hotel:${id}`)
  return val ? (JSON.parse(val) as IHotel) : null
}

export async function saveHotel(hotel: IHotel): Promise<void> {
  await redis.set(`hotel:${hotel.id}`, JSON.stringify(hotel))
}

export async function setAllHotels(hotels: IHotel[]): Promise<void> {
  const oldKeys = await redis.keys('hotel:*')
  const pipeline = redis.pipeline()
  if (oldKeys.length > 0) {
    pipeline.del(...oldKeys)
  }
  for (const hotel of hotels) {
    pipeline.set(`hotel:${hotel.id}`, JSON.stringify(hotel))
  }
  await pipeline.exec()
}
