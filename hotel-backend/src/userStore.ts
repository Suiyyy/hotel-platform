import fs from 'node:fs/promises'
import path from 'node:path'
import type { IUser, IUserDatabase } from './types/hotel.js'

const dataFile = path.resolve(process.cwd(), 'data', 'users.json')

let writeChain: Promise<void> = Promise.resolve()

const defaultUsers: IUser[] = [
  { id: '1', username: 'admin', password: '123456', role: 'admin' },
  { id: '2', username: 'user', password: '123456', role: 'user' }
]

async function readJson(): Promise<IUserDatabase> {
  try {
    const text = await fs.readFile(dataFile, 'utf8')
    const parsed = JSON.parse(text) as unknown
    if (!parsed || typeof parsed !== 'object') return { users: defaultUsers }
    if (!Array.isArray((parsed as IUserDatabase).users)) return { users: defaultUsers }
    return parsed as IUserDatabase
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return { users: defaultUsers }
    }
    throw error
  }
}

async function writeJson(next: IUserDatabase): Promise<void> {
  await fs.mkdir(path.dirname(dataFile), { recursive: true })
  await fs.writeFile(dataFile, JSON.stringify(next, null, 2), 'utf8')
}

export async function getAllUsers(): Promise<IUser[]> {
  const db = await readJson()
  return db.users
}

export async function setAllUsers(users: IUser[]): Promise<void> {
  writeChain = writeChain.then(async () => {
    await writeJson({ users })
  })
  await writeChain
}

export async function findUserByUsername(username: string): Promise<IUser | undefined> {
  const users = await getAllUsers()
  return users.find(u => u.username === username)
}

export async function createUser(username: string, password: string, role: IUser['role']): Promise<IUser> {
  const users = await getAllUsers()
  const newUser: IUser = {
    id: Date.now().toString(),
    username,
    password,
    role
  }
  await setAllUsers([...users, newUser])
  return newUser
}
