const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  cart: { type: Array, default: [] },
  address: { type: Array, default: [] }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;