const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // No two users can have the same email
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  role: {
    type: String,
    enum: ['tourist', 'guide'],
    default: 'tourist',
    index: true,
  },
}, {
  timestamps: true // Automatically adds 'createdAt' and 'updatedAt' fields
});

const User = mongoose.model('User', userSchema);

module.exports = User;