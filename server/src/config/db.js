import mongoose from 'mongoose';

/** Cache kết nối — dùng global để tái sử dụng trong serverless */
if (!globalThis.mongooseCache) {
  globalThis.mongooseCache = { conn: null, promise: null };
}
const cache = globalThis.mongooseCache;

let memoryServer = null;

function isConnected() {
  // Kiểm tra cache và mongoose connection state
  return cache.conn && mongoose.connection.readyState === 1;
}

function needsMemoryDb(uri) {
  if (process.env.VERCEL === '1') return false;
  if (process.env.USE_MEMORY_DB === 'true') return true;
  if (!uri) return true;
  return uri.includes('<db_password>');
}

function getMongooseOptions() {
  // GIẢM TIMEOUT để không bị treo quá lâu
  return {
    bufferCommands: false,
    maxPoolSize: 1,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 5000,  // 5 giây - nếu lâu hơn là fail nhanh
    connectTimeoutMS: 5000,           // 5 giây
    socketTimeoutMS: 10000,           // 10 giây
    family: 4,                        // Ưu tiên IPv4 (tránh DNS issue)
  };
}

async function resolveMongoUri() {
  let uri = process.env.MONGODB_URI;

  // TRÊN VERCEL: bắt buộc phải có MONGODB_URI
  if (process.env.VERCEL === '1') {
    if (!uri || uri.includes('<db_password>') || uri.includes('db_password')) {
      throw new Error(
        '[DB] MONGODB_URI không hợp lệ hoặc chưa được cấu hình đúng trên Vercel Environment Variables.'
      );
    }
    console.log('[DB] Using MongoDB Atlas on Vercel');
    return uri;
  }

  // LOCAL DEVELOPMENT
  if (needsMemoryDb(uri)) {
    console.warn('[DB] Dùng MongoDB in-memory (dev). Để dùng Atlas: sửa MONGODB_URI trong .env');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    if (!memoryServer) {
      memoryServer = await MongoMemoryServer.create();
    }
    return memoryServer.getUri('hoi_choi_hoa');
  }

  return uri;
}

export async function connectDB() {
  console.log('[DB] connectDB() called, checking connection...');
  
  // Nếu đã có kết nối thì dùng lại
  if (isConnected()) {
    console.log('[DB] Reusing existing connection');
    return cache.conn;
  }

  // Reset cache nếu connection bị broken
  if (cache.conn && mongoose.connection.readyState !== 1) {
    console.log('[DB] Connection broken, resetting cache');
    cache.conn = null;
    cache.promise = null;
  }

  // Nếu chưa có promise kết nối, tạo mới
  if (!cache.promise) {
    const uri = await resolveMongoUri();
    console.log('[DB] Creating new connection to:', uri.substring(0, 50) + '...');
    
    const options = getMongooseOptions();
    
    cache.promise = mongoose
      .connect(uri, options)
      .then((instance) => {
        console.log('[DB] ✅ Connected successfully to MongoDB!');
        cache.conn = instance;
        return instance;
      })
      .catch((err) => {
        console.error('[DB] ❌ Connection failed:', err.message);
        console.error('[DB] Full error:', err);
        cache.promise = null;
        cache.conn = null;
        throw err;
      });
  } else {
    console.log('[DB] Waiting for existing connection promise...');
  }

  try {
    const result = await cache.promise;
    console.log('[DB] Connection promise resolved');
    return result;
  } catch (error) {
    console.error('[DB] Error awaiting connection promise:', error);
    throw error;
  }
}

export async function disconnectDB() {
  if (isConnected()) {
    await mongoose.disconnect();
  }
  cache.conn = null;
  cache.promise = null;

  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}