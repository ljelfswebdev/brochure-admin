// models/Settings.js
import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema(
  {
    contactNumber: String,
    emailAddress: String,
    socials: {
      facebook: String,
      instagram: String,
      linkedIn: String,
      tiktok: String,
      x: String,
      youtube: String,
    },
    // ✅ add this:
    homepageSlug: String, // e.g. 'home' or any page slug
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);