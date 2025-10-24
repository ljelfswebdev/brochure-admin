// models/Page.js
import mongoose from 'mongoose';

const LinkSchema = new mongoose.Schema(
  { text: String, url: String },
  { _id: false }
);

const BannerSlideSchema = new mongoose.Schema(
  {
    image: String,
    subtitle: String,
    title: String,
    text: String,
    link: { type: LinkSchema, default: undefined },
  },
  { _id: false }
);

const FaqSchema = new mongoose.Schema(
  { question: String, answer: String },
  { _id: false }
);

const ImagesItemSchema = new mongoose.Schema(
  {
    image: String,
    title: String,
    text: String,
    link: { type: LinkSchema, default: undefined },
  },
  { _id: false }
);

const BlockSchema = new mongoose.Schema(
  {
    // common
    type: { type: String, required: true },

    // banner
    size: { type: String, enum: ['large', 'medium', 'small'], default: undefined },
    slides: { type: [BannerSlideSchema], default: undefined },

    // text-image
    title: String,
    text: String,
    image: String,
    layout: { type: String, enum: ['text-left', 'text-right', 'full'], default: undefined },
    fullWidthPosition: { type: String, enum: ['none', 'top', 'bottom'], default: undefined },

    // parallax
    link: { type: LinkSchema, default: undefined },

    // faqs
    faqs: { type: [FaqSchema], default: undefined },

    // images-section
    items: { type: [ImagesItemSchema], default: undefined },
  },
  { _id: false }
);

const PageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    protected: { type: Boolean, default: false },
    protectedBanners: {
      top: { type: Object, default: null },
      bottom: { type: Object, default: null },
    },
    blocks: { type: [BlockSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Page || mongoose.model('Page', PageSchema);