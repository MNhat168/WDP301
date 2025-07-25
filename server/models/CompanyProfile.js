import mongoose from 'mongoose';

const companyProfileSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  jobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
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

const CompanyProfile = mongoose.model('CompanyProfile', companyProfileSchema);

export default CompanyProfile;