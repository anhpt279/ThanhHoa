import { Router } from 'express';
import User from '../models/User.js';
import Flower from '../models/Flower.js';
import UserFlower from '../models/UserFlower.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.use(authRequired);

router.get('/', async (req, res) => {
  try {
    const [totalMembers, flowerTypeCount, recentMembers, popularFlowers] = await Promise.all([
      User.countDocuments(),
      Flower.countDocuments(),
      User.find()
        .sort({ lastUpdatedAt: -1 })
        .limit(5)
        .select('displayName lastUpdatedAt role'),
      UserFlower.aggregate([
        { $match: { type: 'owning', flowerId: { $ne: null } } },
        {
          $group: {
            _id: '$flowerId',
            totalQuantity: { $sum: '$quantity' },
            holderCount: { $sum: 1 },
          },
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'flowers',
            localField: '_id',
            foreignField: '_id',
            as: 'flower',
          },
        },
        { $unwind: '$flower' },
        {
          $project: {
            flowerName: '$flower.flowerName',
            totalQuantity: 1,
            holderCount: 1,
          },
        },
      ]),
    ]);

    res.json({
      totalMembers,
      flowerTypeCount,
      recentMembers,
      popularFlowers,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
