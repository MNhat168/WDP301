const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  roleId: {
    type: Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  message: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  phoneNumber: {
    type: Number
  },
  dateOfBirth: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("User", UserSchema);
