import mongoose from 'mongoose';
const BlockSchema = new mongoose.Schema({
  type: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { _id: false });

const NewsSchema = new mongoose.Schema({
  title: String,
  slug: { type: String, unique: true, index: true },
  blocks: [BlockSchema],
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  listingImage: String
}, { timestamps: true });

export default mongoose.models.News || mongoose.model('News', NewsSchema);
