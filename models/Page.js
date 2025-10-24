// models/Page.js
import mongoose from 'mongoose';

const LinkSchema = new mongoose.Schema({
  text: String,
  url: String,
}, { _id: false });

const BannerSlideSchema = new mongoose.Schema({
  image: String,
  subtitle: String,
  title: String,
  text: String,
  link: { type: LinkSchema, default: undefined },
}, { _id: false });

const BannerDataSchema = new mongoose.Schema({
  size: { type: String, enum: ['large', 'medium', 'small'], default: 'large' },
  slides: { type: [BannerSlideSchema], default: [] },
}, { _id: false });

const PageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug:  { type: String, required: true, unique: true, index: true },
  blocks: { type: Array, default: [] },

  // NEW: protected mode + dedicated banners
  protected: { type: Boolean, default: false },
  protectedBanners: {
    top:    { type: BannerDataSchema, default: undefined },
    bottom: { type: BannerDataSchema, default: undefined },
  },
}, { timestamps: true });

export default mongoose.models.Page || mongoose.model('Page', PageSchema);