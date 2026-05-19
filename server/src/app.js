import express from 'express';
import cors from 'cors';
import { connectDB, pingDB } from './config/db.js';
import { newReqId, createRequestLogger } from './utils/perfLog.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import flowerRoutes from './routes/flowers.js';
import userFlowerRoutes from './routes/userFlowers.js';
import searchRoutes from './routes/search.js';
import dashboardRoutes from './routes/dashboard.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use((req, res, next) => {
    const reqId = req.headers['x-request-id'] || newReqId();
    req.reqId = reqId;
    req.log = createRequestLogger(reqId);

    req.log.info('http_in', {
      method: req.method,
      path: req.url,
      vercel: process.env.VERCEL === '1',
      region: process.env.VERCEL_REGION,
    });

    res.on('finish', () => {
      req.log.info('http_out', {
        method: req.method,
        path: req.url,
        status: res.statusCode,
      });
    });

    next();
  });

  app.get('/api/health', async (req, res) => {
    const t0 = Date.now();
    try {
      await pingDB(req.reqId);
      res.json({
        ok: true,
        db: 'connected',
        ms: Date.now() - t0,
        reqId: req.reqId,
      });
    } catch (err) {
      res.status(503).json({
        ok: false,
        db: 'error',
        message: err.message,
        ms: Date.now() - t0,
        reqId: req.reqId,
      });
    }
  });

  /** Một lần connect DB / request — tránh gọi trùng ở handler + route */
  app.use(async (req, res, next) => {
    if (req.method === 'GET' && req.url.startsWith('/api/health')) {
      return next();
    }
    try {
      const t0 = Date.now();
      await connectDB(req.reqId);
      req.log.info('middleware_db_ready', { ms: Date.now() - t0 });
      next();
    } catch (err) {
      req.log.error('middleware_db_fail', err);
      res.status(503).json({
        message: err.message,
        reqId: req.reqId,
      });
    }
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/flowers', flowerRoutes);
  app.use('/api/user-flowers', userFlowerRoutes);
  app.use('/api/search', searchRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  return app;
}
