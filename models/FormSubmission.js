// models/FormSubmission.js
import mongoose from 'mongoose';

const FormSubmissionSchema = new mongoose.Schema({
  key: { type: String, index: true },         // form key, e.g. 'contact'
  email: { type: String, index: true },       // extracted from submission
  name: { type: String },                     // extracted from submission
  data: { type: Object, default: {} },        // full submitted payload (label:value map)
}, { timestamps: true });

export default mongoose.models.FormSubmission || mongoose.model('FormSubmission', FormSubmissionSchema);