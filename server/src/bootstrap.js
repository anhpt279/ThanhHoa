import { connectDB } from './config/db.js';
import { seedDatabase } from './seedData.js';
import User from './models/User.js';
import Flower from './models/Flower.js';
import UserFlower from './models/UserFlower.js';

let bootstrapped = false;

export async function bootstrap() {
  if (bootstrapped) return;
  await connectDB();

  await Promise.all([User.syncIndexes(), Flower.syncIndexes(), UserFlower.syncIndexes()]);

  if (process.env.VERCEL !== '1' && process.env.AUTO_SEED !== 'false') {
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
  }

  bootstrapped = true;
}
