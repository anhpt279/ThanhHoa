import 'dotenv/config';
import { createApp } from './app.js';
import { bootstrap } from './bootstrap.js';

const PORT = process.env.PORT || 5000;
const app = createApp();

async function start() {
  await bootstrap();
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

start().catch((err) => {
  console.error('\n[SERVER] Failed to start:', err.message);
  console.error('[SERVER] Fix server/.env then save — server will auto-restart.\n');
  process.exit(1);
});
