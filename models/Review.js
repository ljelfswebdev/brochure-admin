import mongoose from 'mongoose';
const ReviewSchema = new mongoose.Schema({
  title: String,
  text: String,
}, { timestamps: true });
export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
