import fs from 'node:fs/promises';
import path from 'node:path';

const dataFile = path.resolve(process.cwd(), 'data', 'hotels.json');

let writeChain = Promise.resolve();

async function readJson() {
  try {
    const text = await fs.readFile(dataFile, 'utf8');
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object') return { hotels: [] };
    if (!Array.isArray(parsed.hotels)) return { hotels: [] };
    return parsed;
  } catch (error) {
    if (error && error.code === 'ENOENT') return { hotels: [] };
    throw error;
  }
}

async function writeJson(next) {
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(next, null, 2), 'utf8');
}

export async function getAllHotels() {
  const db = await readJson();
  return db.hotels;
}

export async function setAllHotels(hotels) {
  writeChain = writeChain.then(async () => {
    const next = { hotels };
    await writeJson(next);
  });
  await writeChain;
}

