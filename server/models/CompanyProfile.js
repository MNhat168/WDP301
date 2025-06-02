const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CompanyProfileSchema = new Schema({
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  aboutUs: {
    type: String
  },
  address: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  },
  url: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CompanyProfile', CompanyProfileSchema);