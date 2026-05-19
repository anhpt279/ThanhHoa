import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer = null;

function needsMemoryDb(uri) {
  if (process.env.USE_MEMORY_DB === 'true') return true;
  if (!uri) return true;
  return uri.includes('<db_password>');
}

export async function connectDB() {
  let uri = process.env.MONGODB_URI;

  if (needsMemoryDb(uri)) {
    console.warn('[DB] Dùng MongoDB in-memory (dev). Để dùng Atlas: sửa MONGODB_URI trong server/.env');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri('hoi_choi_hoa');
  }

  await mongoose.connect(uri);
  console.log('MongoDB connected');
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
