import mongoose from 'mongoose';
const AuditSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: String,
  entity: String,
  entityId: String,
  data: mongoose.Schema.Types.Mixed
}, { timestamps: true });
export default mongoose.models.Audit || mongoose.model('Audit', AuditSchema);
