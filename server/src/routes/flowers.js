import { Router } from 'express';
import Flower from '../models/Flower.js';
import { escapeRegex } from '../utils/escapeRegex.js';
import { assertNoDuplicateFlowerName } from '../utils/flowerDuplicate.js';
import { authRequired, adminOnly } from '../middleware/auth.js';

const router = Router();

router.use(authRequired);

router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    const filter = q?.trim()
      ? { flowerName: { $regex: escapeRegex(q.trim()), $options: 'i' } }
      : {};
    const flowers = await Flower.find(filter).sort({ flowerName: 1 }).limit(30).lean();
    res.json(flowers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', adminOnly, async (req, res) => {
  try {
    const { flowerName } = req.body;
    if (!flowerName?.trim()) {
      return res.status(400).json({ message: 'Tên hoa không được trống' });
    }
    await assertNoDuplicateFlowerName(flowerName);
    const flower = await Flower.create({ flowerName: flowerName.trim() });
    res.status(201).json(flower);
  } catch (err) {
    if (err.status === 400 || err.code === 11000) {
      return res.status(400).json({ message: 'Loại hoa đã tồn tại' });
    }
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', adminOnly, async (req, res) => {
  try {
    const trimmed = req.body.flowerName?.trim();
    if (!trimmed) {
      return res.status(400).json({ message: 'Tên hoa không được trống' });
    }
    await assertNoDuplicateFlowerName(trimmed, req.params.id);
    const flower = await Flower.findByIdAndUpdate(
      req.params.id,
      { flowerName: trimmed },
      { new: true, runValidators: true }
    );
    if (!flower) return res.status(404).json({ message: 'Không tìm thấy' });
    res.json(flower);
  } catch (err) {
    if (err.status === 400 || err.code === 11000) {
      return res.status(400).json({ message: 'Loại hoa đã tồn tại' });
    }
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', adminOnly, async (req, res) => {
  try {
    await Flower.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa loại hoa' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
