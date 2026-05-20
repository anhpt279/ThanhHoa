import User from './models/User.js';
import Flower from './models/Flower.js';
import UserFlower from './models/UserFlower.js';

const SAMPLE_FLOWERS = [
  'Hồng Ecuador',
  'Juliet',
  'Spirit of Freedom',
  'David Austin',
  'Peace',
  'Double Delight',
];

export async function seedDatabase({ force = false } = {}) {
  const userCount = await User.countDocuments();
  if (userCount > 0 && !force) {
    return false;
  }

  if (force) {
    await UserFlower.deleteMany({});
    await User.deleteMany({});
    await Flower.deleteMany({});
  }

  const memberA = await User.create({
    username: 'member_a',
    password: '123456',
    displayName: 'Thành viên A',
    phone: '0901234567',
    zaloName: 'A Zalo',
    role: 'member',
  });

  const memberB = await User.create({
    username: 'member_b',
    password: '123456',
    displayName: 'Thành viên B',
    role: 'member',
  });

  await User.create({
    username: 'admin',
    password: 'admin123',
    displayName: 'Quản trị viên',
    role: 'admin',
    phone: '',
  });

  const flowers = {};
  for (const name of SAMPLE_FLOWERS) {
    const f = await Flower.create({ flowerName: name });
    flowers[name] = f;
  }

  await UserFlower.create([
    { userId: memberA._id, flowerId: flowers.Juliet._id, quantity: 3, type: 'owning', note: '' },
    { userId: memberA._id, flowerId: flowers['Spirit of Freedom']._id, quantity: 1, type: 'owning' },
    { userId: memberB._id, flowerId: flowers.Juliet._id, quantity: 1, type: 'owning' },
    { userId: memberA._id, customName: 'Gốc tầm xuân', type: 'root_stock', note: '' },
    { userId: memberA._id, flowerId: flowers['David Austin']._id, type: 'waiting_graft', note: 'Chờ mùa' },
  ]);

  return true;
}

/** Production (Atlas): tạo admin + danh mục hoa mẫu nếu DB còn trống — không xóa dữ liệu có sẵn */
export async function ensureProductionDefaults() {
  let created = false;

  const hasAdmin = await User.exists({ username: 'admin' });
  if (!hasAdmin) {
    await User.create({
      username: 'admin',
      password: 'admin123',
      displayName: 'Quản trị viên',
      role: 'admin',
      phone: '',
    });
    console.log(JSON.stringify({ level: 'info', step: 'ensure_admin_created' }));
    created = true;
  }

  const flowerCount = await Flower.countDocuments();
  if (flowerCount === 0) {
    for (const name of SAMPLE_FLOWERS) {
      await Flower.create({ flowerName: name });
    }
    console.log(JSON.stringify({ level: 'info', step: 'ensure_flowers_created', count: SAMPLE_FLOWERS.length }));
    created = true;
  }

  return created;
}
