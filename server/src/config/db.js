import mongoose from 'mongoose';

let memoryServer = null;

const globalCache = globalThis;

function needsMemoryDb(uri) {
  if (process.env.VERCEL === '1') return false;
  if (process.env.USE_MEMORY_DB === 'true') return true;
  if (!uri) return true;
  return uri.includes('<db_password>');
}

export async function connectDB() {
  if (globalCache.mongoose?.conn) {
    return globalCache.mongoose.conn;
  }

  let uri = process.env.MONGODB_URI;

  if (process.env.VERCEL === '1') {
    if (!uri || uri.includes('<db_password>')) {
      throw new Error(
        'Thiếu MONGODB_URI trên Vercel. Vào Project Settings → Environment Variables và thêm connection string MongoDB Atlas.'
      );
    }
  } else if (needsMemoryDb(uri)) {
    console.warn('[DB] Dùng MongoDB in-memory (dev). Để dùng Atlas: sửa MONGODB_URI trong server/.env');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri('hoi_choi_hoa');
  }

  if (!globalCache.mongoose) {
    globalCache.mongoose = { conn: null, promise: null };
  }

  if (!globalCache.mongoose.promise) {
    globalCache.mongoose.promise = mongoose.connect(uri).then((conn) => {
      console.log('MongoDB connected');
      return conn;
    });
  }

  globalCache.mongoose.conn = await globalCache.mongoose.promise;
  return globalCache.mongoose.conn;
}

export async function disconnectDB() {
  if (globalCache.mongoose?.conn) {
    await mongoose.disconnect();
    globalCache.mongoose = { conn: null, promise: null };
  }
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
