import { Router } from 'express';
import UserFlower, { FLOWER_TYPES } from '../models/UserFlower.js';
import { authRequired } from '../middleware/auth.js';
import { touchUserUpdated } from '../utils/touchUser.js';

const router = Router();

router.use(authRequired);

function canEditUser(req, targetUserId) {
  return req.user.role === 'admin' || req.user.id === targetUserId;
}

router.get('/user/:userId', async (req, res) => {
  try {
    if (!canEditUser(req, req.params.userId)) {
      return res.status(403).json({ message: 'Không có quyền' });
    }
    const items = await UserFlower.find({ userId: req.params.userId })
      .populate('flowerId', 'flowerName')
      .sort({ type: 1, createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { userId, flowerId, customName, quantity, type, note } = req.body;
    const targetUserId = userId || req.user.id;

    if (!canEditUser(req, targetUserId)) {
      return res.status(403).json({ message: 'Không có quyền' });
    }
    if (!FLOWER_TYPES.includes(type)) {
      return res.status(400).json({ message: 'Loại dữ liệu không hợp lệ' });
    }

    if (type === 'root_stock') {
      if (!customName?.trim()) {
        return res.status(400).json({ message: 'Cần tên gốc' });
      }
    } else if (!flowerId) {
      return res.status(400).json({ message: 'Cần chọn loại hoa' });
    }

    const item = await UserFlower.create({
      userId: targetUserId,
      flowerId: type === 'root_stock' ? null : flowerId,
      customName: type === 'root_stock' ? customName.trim() : '',
      quantity: type === 'owning' ? (quantity ?? 1) : 1,
      type,
      note: note || '',
    });

    await touchUserUpdated(targetUserId);
    const populated = await UserFlower.findById(item._id).populate('flowerId', 'flowerName');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await UserFlower.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Không tìm thấy' });
    if (!canEditUser(req, item.userId.toString())) {
      return res.status(403).json({ message: 'Không có quyền' });
    }

    const { flowerId, customName, quantity, note } = req.body;
    if (item.type === 'root_stock') {
      if (customName !== undefined) item.customName = customName.trim();
    } else if (flowerId !== undefined) {
      item.flowerId = flowerId;
    }
    if (item.type === 'owning' && quantity !== undefined) item.quantity = quantity;
    if (note !== undefined) item.note = note;

    await item.save();
    await touchUserUpdated(item.userId);
    const populated = await UserFlower.findById(item._id).populate('flowerId', 'flowerName');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await UserFlower.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Không tìm thấy' });
    if (!canEditUser(req, item.userId.toString())) {
      return res.status(403).json({ message: 'Không có quyền' });
    }
    await item.deleteOne();
    await touchUserUpdated(item.userId);
    res.json({ message: 'Đã xóa' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
