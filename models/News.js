import mongoose from 'mongoose';

const NewsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug:  { type: String, required: true, unique: true, index: true },
  excerpt: String,
  body: String,                      // optional legacy body
  listingImage: String,
  status: { type: String, enum: ['draft','published'], default: 'published' },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],

  // 🔑 page-builder style blocks (allow any shape)
  blocks: { type: Array, default: [] },
}, { timestamps: true });

export default mongoose.models.News || mongoose.model('News', NewsSchema);