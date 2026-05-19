import mongoose from 'mongoose';

export const FLOWER_TYPES = ['owning', 'root_stock', 'waiting_graft'];

const userFlowerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    flowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flower', default: null },
    customName: { type: String, default: '' },
    quantity: { type: Number, default: 1, min: 0 },
    type: { type: String, enum: FLOWER_TYPES, required: true },
    note: { type: String, default: '' },
  },
  { timestamps: true }
);

userFlowerSchema.index({ userId: 1, type: 1 });
userFlowerSchema.index({ flowerId: 1, type: 1 });

export default mongoose.model('UserFlower', userFlowerSchema);
