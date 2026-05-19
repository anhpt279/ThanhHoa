import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { seedDatabase } from './seedData.js';
import User from './models/User.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import flowerRoutes from './routes/flowers.js';
import userFlowerRoutes from './routes/userFlowers.js';
import searchRoutes from './routes/search.js';
import dashboardRoutes from './routes/dashboard.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/flowers', flowerRoutes);
app.use('/api/user-flowers', userFlowerRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/dashboard', dashboardRoutes);

async function start() {
  await connectDB();

  const seeded = await seedDatabase();
  if (seeded) {
    console.log('[DB] Đã tạo dữ liệu mẫu — admin / admin123');
  } else {
    const hasAdmin = await User.exists({ username: 'admin' });
    if (!hasAdmin) {
      await seedDatabase({ force: true });
      console.log('[DB] Đã tạo tài khoản admin / admin123');
    }
  }

  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

start().catch((err) => {
  console.error('\n[SERVER] Failed to start:', err.message);
  console.error('[SERVER] Fix server/.env then save — server will auto-restart.\n');
  process.exit(1);
});
