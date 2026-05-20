import Flower from '../models/Flower.js';
import { escapeRegex } from './escapeRegex.js';

export async function findDuplicateFlowerName(name, excludeId) {
  const trimmed = name?.trim();
  if (!trimmed) return null;

  return Flower.findOne({
    flowerName: { $regex: `^${escapeRegex(trimmed)}$`, $options: 'i' },
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  })
    .select('flowerName')
    .lean();
}

export async function assertNoDuplicateFlowerName(name, excludeId) {
  const dup = await findDuplicateFlowerName(name, excludeId);
  if (dup) {
    const err = new Error('Loại hoa đã tồn tại');
    err.status = 400;
    throw err;
  }
}
