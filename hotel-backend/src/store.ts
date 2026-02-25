import fs from 'node:fs/promises'
import path from 'node:path'
import type { IHotel, IHotelDatabase } from './types/hotel.js'

const dataFile = path.resolve(process.cwd(), 'data', 'hotels.json')

let writeChain: Promise<void> = Promise.resolve()

async function readJson(): Promise<IHotelDatabase> {
  try {
    const text = await fs.readFile(dataFile, 'utf8')
    const parsed = JSON.parse(text) as unknown
    if (!parsed || typeof parsed !== 'object') return { hotels: [] }
    if (!Array.isArray((parsed as IHotelDatabase).hotels)) return { hotels: [] }
    return parsed as IHotelDatabase
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return { hotels: [] }
    }
    throw error
  }
}

async function writeJson(next: IHotelDatabase): Promise<void> {
  await fs.mkdir(path.dirname(dataFile), { recursive: true })
  await fs.writeFile(dataFile, JSON.stringify(next, null, 2), 'utf8')
}

export async function getAllHotels(): Promise<IHotel[]> {
  const db = await readJson()
  return db.hotels
}

export async function setAllHotels(hotels: IHotel[]): Promise<void> {
  writeChain = writeChain.then(async () => {
    const next: IHotelDatabase = { hotels }
    await writeJson(next)
  })
  await writeChain
}
