import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    displayName: { type: String, required: true, trim: true },
    phone: { type: String, default: '' },
    facebook: { type: String, default: '' },
    zaloName: { type: String, default: '' },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    lastUpdatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Tìm kiếm: GET /api/users?q, GET /api/search/members
userSchema.index(
  { displayName: 'text', phone: 'text', zaloName: 'text' },
  { name: 'user_search_text', default_language: 'none' }
);
userSchema.index({ displayName: 1 });

export default mongoose.model('User', userSchema);
