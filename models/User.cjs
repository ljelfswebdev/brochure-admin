const mongoose = require('mongoose');
const schema = require('./User.schema');
module.exports = mongoose.models.User || mongoose.model('User', schema);
