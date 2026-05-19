import express from 'express';
import cors from 'cors';
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

  app.get('/api/health', (_, res) => res.json({ ok: true }));

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/flowers', flowerRoutes);
  app.use('/api/user-flowers', userFlowerRoutes);
  app.use('/api/search', searchRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  return app;
}
