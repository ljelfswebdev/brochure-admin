const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, index: true },
  passwordHash: String,
  role: { type: String, enum: ['admin','editor','viewer'], default: 'admin' },
}, { timestamps: true });
module.exports = schema;
