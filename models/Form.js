// models/Form.js
import mongoose from 'mongoose';

const FieldSchema = new mongoose.Schema({
  label: String,
  type: { type: String, enum: ['text', 'textarea', 'select'], default: 'text' },
  placeholder: String,
  options: { type: [String], default: undefined },
}, { _id: false });

const RowSchema = new mongoose.Schema({
  columns: { type: Number, enum: [1, 2], default: 1 },
  fields: { type: [FieldSchema], default: [] },
}, { _id: false });

const FormSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  rows: { type: [RowSchema], default: [] },

  autoReply: {
    enabled:   { type: Boolean, default: false },
    subject:   { type: String, default: '' },
    message:   { type: String, default: '' },
    fromName:  { type: String, default: '' },
    fromEmail: { type: String, default: '' },
  },

}, { timestamps: true });

export default mongoose.models.Form || mongoose.model('Form', FormSchema);