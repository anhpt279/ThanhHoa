import { Router } from 'express';
import User from '../models/User.js';
import Flower from '../models/Flower.js';
import UserFlower from '../models/UserFlower.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.use(authRequired);

router.get('/members', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q?.trim()) return res.json([]);
    const users = await User.find({
      displayName: { $regex: q.trim(), $options: 'i' },
    })
      .select('displayName phone facebook zaloName lastUpdatedAt')
      .sort({ displayName: 1 })
      .limit(50);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/flowers', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q?.trim()) return res.json({ flower: null, holders: [] });

    const flower = await Flower.findOne({
      flowerName: { $regex: `^${q.trim()}$`, $options: 'i' },
    });
    if (!flower) {
      return res.json({ flower: null, holders: [], message: 'Không tìm thấy loại hoa trong danh mục' });
    }

    const items = await UserFlower.find({
      flowerId: flower._id,
      type: 'owning',
    }).populate('userId', 'displayName phone zaloName');

    const holders = items
      .filter((i) => i.userId)
      .map((i) => ({
        user: i.userId,
        quantity: i.quantity,
        note: i.note,
      }))
      .sort((a, b) => b.quantity - a.quantity);

    const totalQuantity = holders.reduce((sum, h) => sum + h.quantity, 0);

    res.json({
      flower,
      holders,
      totalQuantity,
      holderCount: holders.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
