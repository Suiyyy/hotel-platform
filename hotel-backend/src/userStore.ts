import { redis } from './redis.js'
import type { IUser } from './types/hotel.js'

export async function getAllUsers(): Promise<IUser[]> {
  const keys = await redis.keys('user:*')
  if (keys.length === 0) return []
  const values = await redis.mget(...keys)
  return values
    .filter((v: string | null): v is string => v !== null)
    .map((v: string) => JSON.parse(v) as IUser)
}

export async function findUserByUsername(username: string): Promise<IUser | undefined> {
  const val = await redis.get(`user:${username}`)
  return val ? (JSON.parse(val) as IUser) : undefined
}

export async function createUser(username: string, password: string, role: IUser['role']): Promise<IUser> {
  const newUser: IUser = {
    id: Date.now().toString(),
    username,
    password,
    role
  }
  await redis.set(`user:${username}`, JSON.stringify(newUser))
  return newUser
}
