import serverless from 'serverless-http';
import { createApp } from '../server/src/app.js';
import { connectDB } from '../server/src/config/db.js';

export const config = {
  maxDuration: 60,
};

const app = createApp();
const handler = serverless(app);

export default async function vercelHandler(req, res) {
  try {
    await connectDB();
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
