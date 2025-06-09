const mongoose = require('mongoose');
const Schema = mongoose.Schema; 

const SubscriptionSchema = new Schema({
  packageName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  features: [{
    type: String,
    trim: true
  }],
  duration: {
    type: Number, 
    required: true,
    default: 365 
  },
  packageType: {
    type: String,
    enum: ['basic', 'premium', 'enterprise'],
    required: true,
    unique: true
  },
  maxJobPostings: {
    type: Number,
    default: 5
  },
  maxApplications: {
    type: Number,
    default: 10
  },
  isActive: {
    type: Boolean,
    default: true
  },
  features_config: {
    canPostJobs: {
      type: Boolean,
      default: true
    },
    canViewApplications: {
      type: Boolean,
      default: true
    },
    canAccessAnalytics: {
      type: Boolean,
      default: false
    },
    canUseAdvancedSearch: {
      type: Boolean,
      default: false
    },
    prioritySupport: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

SubscriptionSchema.index({ packageType: 1, isActive: 1 });
SubscriptionSchema.index({ packageType: 1 });

module.exports = mongoose.model('Subscription', SubscriptionSchema);