import { Router } from 'express';
import User from '../models/User.js';
import UserFlower from '../models/UserFlower.js';
import { authRequired, adminOnly } from '../middleware/auth.js';

const router = Router();

router.use(authRequired);

router.get('/', adminOnly, async (req, res) => {
  try {
    const { q } = req.query;
    const filter = q
      ? {
          $or: [
            { displayName: { $regex: q, $options: 'i' } },
            { phone: { $regex: q, $options: 'i' } },
            { zaloName: { $regex: q, $options: 'i' } },
          ],
        }
      : {};
    const users = await User.find(filter).sort({ displayName: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Không có quyền xem' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy thành viên' });

    const items = await UserFlower.find({ userId: user._id })
      .populate('flowerId', 'flowerName')
      .sort({ type: 1, createdAt: -1 });

    const grouped = {
      owning: items.filter((i) => i.type === 'owning'),
      root_stock: items.filter((i) => i.type === 'root_stock'),
      waiting_graft: items.filter((i) => i.type === 'waiting_graft'),
    };

    res.json({ user, flowers: grouped });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', adminOnly, async (req, res) => {
  try {
    const { username, password, displayName, phone, facebook, zaloName, role } = req.body;
    if (!username || !password || !displayName) {
      return res.status(400).json({ message: 'Cần username, mật khẩu và tên hiển thị' });
    }
    const user = await User.create({
      username: username.trim().toLowerCase(),
      password,
      displayName: displayName.trim(),
      phone: phone || '',
      facebook: facebook || '',
      zaloName: zaloName || '',
      role: role || 'member',
    });
    res.status(201).json(user);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
    }
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Chỉ được sửa hồ sơ của mình' });
    }

    const { displayName, phone, facebook, zaloName, password, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy' });

    if (displayName !== undefined) user.displayName = displayName.trim();
    if (phone !== undefined) user.phone = phone;
    if (facebook !== undefined) user.facebook = facebook;
    if (zaloName !== undefined) user.zaloName = zaloName;
    if (password) user.password = password;
    if (isAdmin && role !== undefined) user.role = role;

    user.lastUpdatedAt = new Date();
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', adminOnly, async (req, res) => {
  try {
    await UserFlower.deleteMany({ userId: req.params.id });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa thành viên' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
