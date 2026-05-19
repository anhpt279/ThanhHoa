import mongoose from 'mongoose';

const flowerSchema = new mongoose.Schema(
  {
    flowerName: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model('Flower', flowerSchema);
