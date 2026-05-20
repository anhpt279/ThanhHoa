import UserFlower from '../models/UserFlower.js';
import { escapeRegex } from './escapeRegex.js';

export async function findDuplicateUserFlower({ userId, type, flowerId, customName, excludeId }) {
  const base = {
    userId,
    type,
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  };

  if (type === 'root_stock') {
    const name = customName?.trim();
    if (!name) return null;
    return UserFlower.findOne({
      ...base,
      customName: { $regex: new RegExp(`^${escapeRegex(name)}$`, 'i') },
    });
  }

  if (!flowerId) return null;

  return UserFlower.findOne({
    ...base,
    flowerId,
  });
}

export async function assertNoDuplicateUserFlower(params) {
  const dup = await findDuplicateUserFlower(params);
  if (!dup) return;

  if (params.type === 'root_stock') {
    throw new Error('Loại gốc này đã có trong danh sách');
  }
  throw new Error('Loại hoa này đã có trong danh sách');
}
