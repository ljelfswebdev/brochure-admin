import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, index: true },
  passwordHash: String,
  role: { type: String, enum: ['admin','editor','viewer'], default: 'admin' },
}, { timestamps: true });

UserSchema.methods.verifyPassword = function (password) {
  return bcrypt.compare(password, this.passwordHash || '');
};

export default mongoose.models.User || mongoose.model('User', UserSchema);
