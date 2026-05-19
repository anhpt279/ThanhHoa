import serverless from 'serverless-http';
import { createApp } from '../server/src/app.js';
import { connectDB } from '../server/src/config/db.js';
import { newReqId, createRequestLogger } from '../server/src/utils/perfLog.js';

export const config = {
  maxDuration: 60,
};

const app = createApp();
const handler = serverless(app);

export default async function vercelHandler(req, res) {
  const reqId = req.headers['x-request-id'] || newReqId();
  const log = createRequestLogger(reqId);

  log.info('vercel_invoke', {
    method: req.method,
    url: req.url,
    vercel: process.env.VERCEL === '1',
    region: process.env.VERCEL_REGION,
    hasMongoUri: Boolean(process.env.MONGODB_URI),
    hasJwtSecret: Boolean(process.env.JWT_SECRET),
  });

  try {
    const tDb = Date.now();
    await connectDB(reqId);
    log.info('vercel_db_ready', { ms: Date.now() - tDb });

    const tHandler = Date.now();
    const result = await handler(req, res);
    log.info('vercel_handler_done', { ms: Date.now() - tHandler });
    return result;
  } catch (err) {
    log.error('vercel_invoke_fail', err);
    if (!res.headersSent) {
      res.status(500).json({
        message: err.message || 'Lỗi server',
        reqId,
      });
    }
  }
}
