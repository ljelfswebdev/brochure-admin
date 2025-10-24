import mongoose from 'mongoose';
const MenuItemSchema = new mongoose.Schema({
  label: String,
  url: String,
  target: String,
}, { _id: false });

const MenuSchema = new mongoose.Schema({
  key: { type: String, unique: true, index: true }, // e.g. 'header', 'footer'
  items: [MenuItemSchema],
}, { timestamps: true });

export default mongoose.models.Menu || mongoose.model('Menu', MenuSchema);
