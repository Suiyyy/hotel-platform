import express from 'express';
import cors from 'cors';
import { getAllHotels, setAllHotels } from './store.mjs';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/hotels', async (req, res, next) => {
  try {
    const hotels = await getAllHotels();
    res.json(hotels);
  } catch (e) {
    next(e);
  }
});

app.get('/hotels/public', async (req, res, next) => {
  try {
    const hotels = await getAllHotels();
    res.json(hotels.filter(h => h.status === 'approved' && h.isOnline));
  } catch (e) {
    next(e);
  }
});

app.post('/hotels', async (req, res, next) => {
  try {
    const payload = req.body ?? {};
    const now = new Date().toISOString();
    const hotels = await getAllHotels();
    const newHotel = {
      ...payload,
      id: Date.now().toString(),
      createTime: now,
      updateTime: now,
      status: 'pending',
      isOnline: false,
      rejectReason: ''
    };
    const nextHotels = [...hotels, newHotel];
    await setAllHotels(nextHotels);
    res.status(201).json(newHotel);
  } catch (e) {
    next(e);
  }
});

app.patch('/hotels/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const patch = req.body ?? {};
    const hotels = await getAllHotels();
    const index = hotels.findIndex(h => h.id === id);
    if (index === -1) return res.status(404).json({ message: 'not_found' });
    const updated = { ...hotels[index], ...patch, updateTime: new Date().toISOString() };
    const nextHotels = hotels.slice();
    nextHotels[index] = updated;
    await setAllHotels(nextHotels);
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ message: 'internal_error' });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[hotel-backend] listening on http://localhost:${PORT}`);
});

