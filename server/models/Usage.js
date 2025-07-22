import mongoose from 'mongoose';

const usageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'job_application',
      'add_favorite',
      'search_jobs',
      'view_job_details',
      'create_cv',
      'update_profile',
      'send_message',
      'view_company_profile'
    ]
  },
  actionDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  billingPeriod: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
usageSchema.index({ userId: 1, action: 1, billingPeriod: 1 });
usageSchema.index({ userId: 1, timestamp: 1 });

const Usage = mongoose.model('Usage', usageSchema);

export default Usage; 