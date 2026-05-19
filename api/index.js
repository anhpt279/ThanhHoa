import serverless from 'serverless-http';
import { createApp } from '../server/src/app.js';
import { connectDB } from '../server/src/config/db.js';

const app = createApp();
const handler = serverless(app);

let ready = false;

async function ensureReady() {
  if (!ready) {
    await connectDB();
    ready = true;
  }
}

export default async function vercelHandler(req, res) {
  try {
    await ensureReady();
    return handler(req, res);
  } catch (err) {
    console.error('[API]', err.message);
    res.status(500).json({
      message: err.message || 'Lỗi server',
    });
  }
}
