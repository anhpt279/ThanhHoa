import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { newReqId } from '../utils/perfLog.js';

const MEMORY_DB_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../.mongo-memory'
);

if (!globalThis.mongooseCache) {
  globalThis.mongooseCache = { conn: null, promise: null };
}
const cache = globalThis.mongooseCache;

let memoryServer = null;

function dbLog(step, extra = {}) {
  console.log(JSON.stringify({ level: 'info', scope: 'db', step, ...extra }));
}

function isConnected() {
  return cache.conn && mongoose.connection.readyState === 1;
}

function needsMemoryDb(uri) {
  if (process.env.VERCEL === '1') return false;
  if (process.env.USE_MEMORY_DB === 'true') return true;
  if (!uri) return true;
  return uri.includes('<db_password>');
}

function formatMongoError(err) {
  const msg = err?.message || '';
  if (msg.includes('bad auth') || msg.includes('authentication failed')) {
    return (
      'MongoDB từ chối đăng nhập (bad auth). ' +
      'Kiểm tra lại username/password trong MONGODB_URI trên Vercel (hoặc server/.env). ' +
      'Nếu mật khẩu có ký tự đặc biệt (@, #, %, /...) phải URL-encode. ' +
      'Trên Atlas: Database Access → user anhpt279_db_user → Edit → Reset Password → copy URI mới.'
    );
  }
  if (msg.includes('ENOTFOUND') || msg.includes('querySrv')) {
    return 'Không kết nối được cluster MongoDB. Kiểm tra MONGODB_URI và mạng.';
  }
  return msg;
}

function getMongooseOptions() {
  return {
    bufferCommands: false,
    maxPoolSize: 1,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 4000,
    connectTimeoutMS: 4000,
    socketTimeoutMS: 8000,
    family: 4,
  };
}

async function resolveMongoUri() {
  const uri = process.env.MONGODB_URI;

  if (process.env.VERCEL === '1') {
    if (!uri || uri.includes('<db_password>') || uri.includes('db_password')) {
      throw new Error('MONGODB_URI không hợp lệ trên Vercel Environment Variables');
    }
    dbLog('resolve_uri', { target: 'atlas', host: uri.match(/@([^/]+)/)?.[1] || 'unknown' });
    return uri;
  }

  if (needsMemoryDb(uri)) {
    dbLog('resolve_uri', { target: 'memory' });
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    if (!memoryServer) {
      const t = Date.now();
      fs.mkdirSync(MEMORY_DB_PATH, { recursive: true });
      memoryServer = await MongoMemoryServer.create({
        instance: {
          dbPath: MEMORY_DB_PATH,
          storageEngine: 'wiredTiger',
        },
      });
      dbLog('memory_server_ready', { ms: Date.now() - t, dbPath: MEMORY_DB_PATH });
    }
    return memoryServer.getUri('hoi_choi_hoa');
  }

  dbLog('resolve_uri', { target: 'atlas_local' });
  return uri;
}

export async function connectDB(parentReqId) {
  const reqId = parentReqId || newReqId();
  const t0 = Date.now();

  dbLog('connect_start', {
    reqId,
    vercel: process.env.VERCEL === '1',
    readyState: mongoose.connection.readyState,
    hasCacheConn: Boolean(cache.conn),
    hasCachePromise: Boolean(cache.promise),
  });

  if (isConnected()) {
    dbLog('connect_reuse', { reqId, ms: Date.now() - t0 });
    return cache.conn;
  }

  if (cache.conn && mongoose.connection.readyState !== 1) {
    dbLog('connect_reset_broken', { reqId, readyState: mongoose.connection.readyState });
    cache.conn = null;
    cache.promise = null;
  }

  if (cache.promise) {
    dbLog('connect_await_promise', { reqId });
    try {
      const result = await cache.promise;
      dbLog('connect_promise_ok', { reqId, ms: Date.now() - t0 });
      return result;
    } catch (err) {
      dbLog('connect_promise_fail', { reqId, ms: Date.now() - t0, message: err.message });
      throw err;
    }
  }

  const uri = await resolveMongoUri();
  const options = getMongooseOptions();

  dbLog('mongoose_connect_start', { reqId, ms: Date.now() - t0 });

  cache.promise = mongoose
    .connect(uri, options)
    .then((instance) => {
      dbLog('mongoose_connect_ok', { reqId, ms: Date.now() - t0, readyState: mongoose.connection.readyState });
      cache.conn = instance;
      return instance;
    })
    .catch((err) => {
      const friendly = formatMongoError(err);
      dbLog('mongoose_connect_fail', {
        reqId,
        ms: Date.now() - t0,
        message: err.message,
        friendly,
        name: err.name,
        code: err.code,
      });
      cache.promise = null;
      cache.conn = null;
      const e = new Error(friendly);
      e.cause = err;
      throw e;
    });

  return cache.promise;
}

export async function pingDB(parentReqId) {
  const reqId = parentReqId || newReqId();
  const t0 = Date.now();
  await connectDB(reqId);
  await mongoose.connection.db.admin().ping();
  dbLog('ping_ok', { reqId, ms: Date.now() - t0 });
  return { ok: true, ms: Date.now() - t0 };
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
