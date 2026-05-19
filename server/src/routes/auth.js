import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authRequired } from '../middleware/auth.js';
import { connectDB } from '../config/db.js';

const router = Router();

router.post('/register', async (req, res) => {
  const log = req.log;
  try {
    log.info('register_start');
    await connectDB(req.reqId);

    const { username, password, displayName, phone, facebook, zaloName } = req.body;

    if (!username?.trim() || !password || !displayName?.trim()) {
      return res.status(400).json({
        message: 'Vui lòng nhập tên đăng nhập, mật khẩu và tên hiển thị',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu tối thiểu 6 ký tự' });
    }

    const normalizedUsername = username.trim().toLowerCase();

    const tFind = Date.now();
    const exists = await User.findOne({ username: normalizedUsername }).lean();
    log.info('register_find_user', { ms: Date.now() - tFind, found: Boolean(exists) });

    if (exists) {
      return res.status(400).json({ message: 'Tên đăng nhập đã được sử dụng' });
    }

    const tCreate = Date.now();
    const user = await User.create({
      username: normalizedUsername,
      password,
      displayName: displayName.trim(),
      phone: phone?.trim() || '',
      facebook: facebook?.trim() || '',
      zaloName: zaloName?.trim() || '',
      role: 'member',
    });
    log.info('register_create_user', { ms: Date.now() - tCreate });

    if (!process.env.JWT_SECRET) {
      throw new Error('Thiếu JWT_SECRET trên server');
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, displayName: user.displayName },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    log.info('register_done', { userId: String(user._id) });
    res.status(201).json({ token, user });
  } catch (err) {
    log.error('register_fail', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Tên đăng nhập đã được sử dụng' });
    }
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  const log = req.log;

  try {
    log.info('login_start', { hasBody: Boolean(req.body) });

    const tDb = Date.now();
    await connectDB(req.reqId);
    log.info('login_db_ready', { ms: Date.now() - tDb });

    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập tên đăng nhập và mật khẩu' });
    }

    const normalized = username.trim().toLowerCase();
    log.info('login_find_user_start', { username: normalized });

    const tFind = Date.now();
    const user = await User.findOne({ username: normalized });
    log.info('login_find_user_done', {
      ms: Date.now() - tFind,
      found: Boolean(user),
    });

    if (!user) {
      return res.status(401).json({ message: 'Sai tên đăng nhập hoặc mật khẩu' });
    }

    const tBcrypt = Date.now();
    const passwordOk = await user.comparePassword(password);
    log.info('login_bcrypt_done', { ms: Date.now() - tBcrypt, ok: passwordOk });

    if (!passwordOk) {
      return res.status(401).json({ message: 'Sai tên đăng nhập hoặc mật khẩu' });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('Thiếu JWT_SECRET trên Vercel Environment Variables');
    }

    const tJwt = Date.now();
    const token = jwt.sign(
      { id: user._id, role: user.role, displayName: user.displayName },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    log.info('login_jwt_done', { ms: Date.now() - tJwt });

    log.info('login_success', { userId: String(user._id), role: user.role });
    res.json({ token, user });
  } catch (err) {
    log.error('login_fail', err);
    res.status(500).json({
      message: err.message,
      reqId: req.reqId,
    });
  }
});

router.get('/me', authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
