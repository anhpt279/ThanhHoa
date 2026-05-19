import mongoose from 'mongoose';

let memoryServer = null;
const globalCache = globalThis;

function needsMemoryDb(uri) {
  if (process.env.VERCEL === '1') return false;
  if (process.env.USE_MEMORY_DB === 'true') return true;
  if (!uri) return true;
  return uri.includes('<db_password>');
}

function getMongooseOptions() {
  if (process.env.VERCEL !== '1') return {};

  return {
    bufferCommands: false,
    maxPoolSize: 1,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
    socketTimeoutMS: 15000,
  };
}

export async function connectDB() {
  if (globalCache.mongoose?.conn?.readyState === 1) {
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
    globalCache.mongoose.promise = mongoose
      .connect(uri, getMongooseOptions())
      .then((conn) => {
        console.log('MongoDB connected');
        return conn;
      })
      .catch((err) => {
        globalCache.mongoose.promise = null;
        throw err;
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
