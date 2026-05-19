import mongoose from 'mongoose';

/**
 * Cache MongoDB cho Serverless (Vercel).
 * Dùng global — mỗi lambda instance giữ 1 kết nối khi còn "warm".
 * @see https://github.com/vercel/next.js/blob/canary/examples/with-mongodb-mongoose
 */
const globalForMongoose = globalThis;

if (!globalForMongoose.mongoose) {
  globalForMongoose.mongoose = { conn: null, promise: null };
}

const cached = globalForMongoose.mongoose;

let memoryServer = null;

function isConnected() {
  return mongoose.connection.readyState === 1;
}

function needsMemoryDb(uri) {
  if (process.env.VERCEL === '1') return false;
  if (process.env.USE_MEMORY_DB === 'true') return true;
  if (!uri) return true;
  return uri.includes('<db_password>');
}

function getMongooseOptions() {
  const base = {
    bufferCommands: false,
    maxPoolSize: 1,
  };

  if (process.env.VERCEL === '1') {
    return {
      ...base,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      socketTimeoutMS: 15000,
    };
  }

  return base;
}

async function resolveMongoUri() {
  const uri = process.env.MONGODB_URI;

  if (process.env.VERCEL === '1') {
    if (!uri || uri.includes('<db_password>')) {
      throw new Error(
        'Thiếu MONGODB_URI trên Vercel. Vào Project Settings → Environment Variables và thêm connection string MongoDB Atlas.'
      );
    }
    return uri;
  }

  if (needsMemoryDb(uri)) {
    console.warn('[DB] Dùng MongoDB in-memory (dev). Để dùng Atlas: sửa MONGODB_URI trong server/.env');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    if (!memoryServer) {
      memoryServer = await MongoMemoryServer.create();
    }
    return memoryServer.getUri('hoi_choi_hoa');
  }

  return uri;
}

async function createConnection() {
  const uri = await resolveMongoUri();
  await mongoose.connect(uri, getMongooseOptions());
  console.log('MongoDB connected');
  return mongoose;
}

export async function connectDB() {
  if (cached.conn && isConnected()) {
    return cached.conn;
  }

  if (cached.promise) {
    return cached.promise;
  }

  if (!isConnected()) {
    cached.conn = null;
  }

  cached.promise = createConnection()
    .then((instance) => {
      cached.conn = instance;
      return instance;
    })
    .catch((err) => {
      cached.promise = null;
      cached.conn = null;
      throw err;
    });

  return cached.promise;
}

export async function disconnectDB() {
  if (isConnected()) {
    await mongoose.disconnect();
  }
  cached.conn = null;
  cached.promise = null;

  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
