require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'brochure';

const User = require('../models/User.cjs');

(async () => {
  try {
    if (!uri) throw new Error('MONGODB_URI missing');
    await mongoose.connect(uri, { dbName });
    const name = process.env.ADMIN_NAME || 'Site Admin';
    const email = process.env.ADMIN_EMAIL || 'admin@localhost.test';
    const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
    const hash = await bcrypt.hash(password, 10);
    const update = { name, email, role: 'admin', passwordHash: hash };
    const user = await mongoose.model('User', require('../models/User.schema')).findOneAndUpdate(
      { email },
      update,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log('Admin upserted:', user.email);
    console.log('Login password:', password);
    await mongoose.disconnect();
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
