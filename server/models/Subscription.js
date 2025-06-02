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
    default: 30
  },
  packageType: {
    type: String,
    enum: ['basic', 'premium', 'enterprise'],
    required: true
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
  
  subscribers: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    purchaseDate: {
      type: Date,
      default: Date.now
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    expiryDate: {
      type: Date,
      required: true
    },
    paidAmount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'paypal', 'bank_transfer', 'free_trial'],
      default: 'credit_card'
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled', 'suspended', 'trial'],
      default: 'active'
    },
    autoRenew: {
      type: Boolean,
      default: false
    },
    usageStats: {
      jobPostingsUsed: {
        type: Number,
        default: 0
      },
      applicationsUsed: {
        type: Number,
        default: 0
      },
      lastUsedDate: {
        type: Date
      }
    },
    cancellationReason: {
      type: String,
      trim: true
    },
    cancellationDate: {
      type: Date
    }
  }]
}, {
  timestamps: true
});

SubscriptionSchema.index({ packageType: 1, isActive: 1 });
SubscriptionSchema.index({ 'subscribers.userId': 1 });
SubscriptionSchema.index({ 'subscribers.status': 1 });
SubscriptionSchema.index({ 'subscribers.expiryDate': 1 });
SubscriptionSchema.index({ 'subscribers.userId': 1, 'subscribers.status': 1 });

module.exports = mongoose.model('Subscription', SubscriptionSchema)