import 'dotenv/config';
import { connectDB, disconnectDB } from './config/db.js';
import { seedDatabase } from './seedData.js';

async function seed() {
  await connectDB();
  await seedDatabase({ force: true });
  console.log('Seed completed!');
  console.log('Admin: admin / admin123');
  console.log('Member: member_a / 123456, member_b / 123456');
  await disconnectDB();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
