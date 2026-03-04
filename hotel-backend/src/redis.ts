import { Redis } from 'ioredis'
import fs from 'node:fs/promises'
import path from 'node:path'
import type { IHotel, IHotelDatabase, IUser } from './types/hotel.js'

export const redis = new Redis({
  host: '127.0.0.1',
  port: 6379,
  lazyConnect: true
})

const defaultUsers: IUser[] = [
  { id: '1', username: 'admin', password: '123456', role: 'admin' },
  { id: '2', username: 'user', password: '123456', role: 'user' },
  { id: '3', username: 'test1', password: '123456', role: 'user' }
]

export async function initRedis(): Promise<void> {
  await redis.connect()
  console.log('[redis] connected')

  // 如果 Redis 中已有数据则跳过初始化
  const existingKeys = await redis.keys('hotel:*')
  if (existingKeys.length > 0) {
    console.log(`[redis] already has ${existingKeys.length} hotels, skip seeding`)
    return
  }

  // 从 JSON 文件加载酒店初始数据
  const hotelsFile = path.resolve(process.cwd(), 'data', 'hotels.json')
  try {
    const text = await fs.readFile(hotelsFile, 'utf8')
    const db = JSON.parse(text) as IHotelDatabase
    if (Array.isArray(db.hotels) && db.hotels.length > 0) {
      const pipeline = redis.pipeline()
      for (const hotel of db.hotels) {
        pipeline.set(`hotel:${hotel.id}`, JSON.stringify(hotel))
      }
      await pipeline.exec()
      console.log(`[redis] seeded ${db.hotels.length} hotels from JSON`)
    }
  } catch {
    console.log('[redis] no hotels.json found, starting empty')
  }

  // 初始化默认用户
  const existingUsers = await redis.keys('user:*')
  if (existingUsers.length === 0) {
    const pipeline = redis.pipeline()
    for (const user of defaultUsers) {
      pipeline.set(`user:${user.username}`, JSON.stringify(user))
    }
    await pipeline.exec()
    console.log(`[redis] seeded ${defaultUsers.length} default users`)
  }
}
