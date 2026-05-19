import serverless from 'serverless-http';
import { createApp } from '../server/src/app.js';
import { connectDB } from '../server/src/config/db.js';

/** Vercel: tăng timeout (Hobby tối đa 10s, Pro tối đa 60s) */
export const config = {
  maxDuration: 60,
};

const app = createApp();
const handler = serverless(app);

/** Kết nối DB ngay khi cold start (song song với load module) */
const dbReady = connectDB().catch((err) => {
  console.error('[API] DB init failed:', err.message);
  globalThis.__dbInitError = err;
});

async function ensureReady() {
  if (globalThis.__dbInitError) throw globalThis.__dbInitError;
  await dbReady;
}

export default async function vercelHandler(req, res) {
  try {
    await ensureReady();
    return handler(req, res);
  } catch (err) {
    console.error('[API]', err.message);
    if (!res.headersSent) {
      res.status(500).json({
        message: err.message || 'Lỗi server',
      });
    }
  }
}
