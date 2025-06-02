const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CVProfileSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skills: {
    type: String
  },
  experience: {
    type: String
  },
  description: {
    type: String
  },
  education: {
    type: String
  },
  certifications: {
    type: String
  },
  linkUrl: {
    type: String,
    trim: true
  },
  number: {
    type: Number
  },
  avatar: {
    type: String,
    trim: true
  },
  linkPdf: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CVProfile', CVProfileSchema);