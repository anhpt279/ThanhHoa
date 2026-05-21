import mongoose from 'mongoose';

const flowerSchema = new mongoose.Schema(
  {
    flowerName: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

// Tìm kiếm: GET /api/flowers?q, GET /api/search/flowers
flowerSchema.index({ flowerName: 'text' }, { name: 'flower_search_text', default_language: 'none' });

export default mongoose.model('Flower', flowerSchema);
