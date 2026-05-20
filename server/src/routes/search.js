import { Router } from 'express';
import User from '../models/User.js';
import Flower from '../models/Flower.js';
import { escapeRegex } from '../utils/escapeRegex.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();
const SEARCH_CACHE_SEC = 30;

router.use(authRequired);

function setSearchCache(res) {
  res.set('Cache-Control', `private, max-age=${SEARCH_CACHE_SEC}`);
}

async function findFlowerByName(term) {
  const exact = await Flower.findOne({ flowerName: term }).select('flowerName').lean();
  if (exact) return exact;

  return Flower.findOne({
    flowerName: { $regex: `^${escapeRegex(term)}$`, $options: 'i' },
  })
    .select('flowerName')
    .lean();
}

router.get('/members', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q?.trim()) return res.json([]);

    setSearchCache(res);

    const term = escapeRegex(q.trim());
    const users = await User.find({
      displayName: { $regex: term, $options: 'i' },
    })
      .select('displayName phone facebook zaloName lastUpdatedAt')
      .sort({ displayName: 1 })
      .limit(50)
      .lean();

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/flowers', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q?.trim()) return res.json({ flower: null, holders: [] });

    setSearchCache(res);

    const term = q.trim();
    const flower = await findFlowerByName(term);
    if (!flower) {
      return res.json({
        flower: null,
        holders: [],
        message: 'Không tìm thấy loại hoa trong danh mục',
      });
    }

    const rows = await Flower.aggregate([
      { $match: { _id: flower._id } },
      {
        $lookup: {
          from: 'userflowers',
          let: { flowerId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$flowerId', '$$flowerId'] },
                    { $eq: ['$type', 'owning'] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'user',
              },
            },
            { $unwind: '$user' },
            {
              $project: {
                quantity: 1,
                note: 1,
                user: {
                  _id: '$user._id',
                  displayName: '$user.displayName',
                  phone: '$user.phone',
                  zaloName: '$user.zaloName',
                },
              },
            },
          ],
          as: 'holderRows',
        },
      },
      { $project: { flowerName: 1, holderRows: 1 } },
    ]);

    const holderRows = rows[0]?.holderRows ?? [];
    const holders = holderRows
      .map((row) => ({
        user: row.user,
        quantity: row.quantity,
        note: row.note,
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
