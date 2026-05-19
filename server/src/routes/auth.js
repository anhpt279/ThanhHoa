import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
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
    const exists = await User.findOne({ username: normalizedUsername });
    if (exists) {
      return res.status(400).json({ message: 'Tên đăng nhập đã được sử dụng' });
    }

    const user = await User.create({
      username: normalizedUsername,
      password,
      displayName: displayName.trim(),
      phone: phone?.trim() || '',
      facebook: facebook?.trim() || '',
      zaloName: zaloName?.trim() || '',
      role: 'member',
    });

    const token = jwt.sign(
      { id: user._id, role: user.role, displayName: user.displayName },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, user });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Tên đăng nhập đã được sử dụng' });
    }
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập tên đăng nhập và mật khẩu' });
    }
    const user = await User.findOne({ username: username.trim().toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Sai tên đăng nhập hoặc mật khẩu' });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role, displayName: user.displayName },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
