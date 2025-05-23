// models/User.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /[^@]+@[^@]+\.[^@]+/,
    trim: true,
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
},
  {
    timestamps: true,  
    versionKey: false,
  }
);

module.exports = mongoose.model('User', UserSchema);
