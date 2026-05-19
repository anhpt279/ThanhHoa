import User from '../models/User.js';

export async function touchUserUpdated(userId) {
  await User.findByIdAndUpdate(userId, { lastUpdatedAt: new Date() });
}
