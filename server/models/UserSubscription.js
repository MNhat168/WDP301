import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const UserSubscriptionSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  subscriptionId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Subscription', 
    required: true 
  },
  startDate: { 
    type: Date, 
    default: Date.now, 
    required: true 
  },
  expiryDate: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['active', 'expired', 'cancelled', 'trial'], 
    default: 'trial' 
  },
  paidAmount: { 
    type: Number, 
    default: 0 
  },
  paymentMethod: { 
    type: String 
  },
  autoRenew: { 
    type: Boolean, 
    default: false 
  },
  cancellationReason: { 
    type: String 
  },
  cancellationDate: { 
    type: Date 
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
  billing: {
    customerStripeId: String,
    subscriptionStripeId: String,
    lastPaymentDate: Date,
    nextPaymentDate: Date,
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    }
  },
  packageType: {
    type: String,
    enum: ['basic', 'premium', 'enterprise'],
    required: true
  }
}, { 
  timestamps: true 
});

// Indexes
UserSubscriptionSchema.index({ userId: 1, status: 1 });
UserSubscriptionSchema.index({ subscriptionId: 1 });
UserSubscriptionSchema.index({ expiryDate: 1 });
UserSubscriptionSchema.index({ status: 1, expiryDate: 1 });
UserSubscriptionSchema.index({ packageType: 1, status: 1 });

// Virtual properties
UserSubscriptionSchema.virtual('isActive').get(function() {
  return this.status === 'active' && this.expiryDate > new Date();
});

UserSubscriptionSchema.virtual('daysRemaining').get(function() {
  if (this.status !== 'active') return 0;
  const today = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

UserSubscriptionSchema.virtual('isExpired').get(function() {
  return this.expiryDate < new Date();
});

UserSubscriptionSchema.virtual('isTrialPeriod').get(function() {
  return this.status === 'trial';
});

// Instance methods for subscription limits and usage
UserSubscriptionSchema.methods.canPostJob = function() {
  if (!this.isActive) return false;
  
  const limits = {
    basic: 5,
    premium: 20,
    enterprise: -1 // unlimited
  };
  
  const limit = limits[this.packageType];
  return limit === -1 || this.usageStats.jobPostingsUsed < limit;
};

UserSubscriptionSchema.methods.canApplyToJob = function() {
  if (!this.isActive) return false;
  
  const limits = {
    basic: 10,
    premium: 50,
    enterprise: -1 // unlimited
  };
  
  const limit = limits[this.packageType];
  return limit === -1 || this.usageStats.applicationsUsed < limit;
};

UserSubscriptionSchema.methods.getRemainingJobPostings = function() {
  const limits = {
    basic: 5,
    premium: 20,
    enterprise: -1
  };
  
  const limit = limits[this.packageType];
  if (limit === -1) return -1; 
  
  return Math.max(0, limit - this.usageStats.jobPostingsUsed);
};

UserSubscriptionSchema.methods.getRemainingApplications = function() {
  const limits = {
    basic: 10,
    premium: 50,
    enterprise: -1
  };
  
  const limit = limits[this.packageType];
  if (limit === -1) return -1; 
  
  return Math.max(0, limit - this.usageStats.applicationsUsed);
};

UserSubscriptionSchema.methods.incrementJobPostings = function() {
  this.usageStats.jobPostingsUsed++;
  this.usageStats.lastUsedDate = new Date();
  return this.save();
};

UserSubscriptionSchema.methods.incrementApplications = function() {
  this.usageStats.applicationsUsed++;
  this.usageStats.lastUsedDate = new Date();
  return this.save();
};

UserSubscriptionSchema.methods.resetUsageStats = function() {
  this.usageStats.jobPostingsUsed = 0;
  this.usageStats.applicationsUsed = 0;
  this.usageStats.lastUsedDate = new Date();
  return this.save();
};

UserSubscriptionSchema.methods.upgradeSubscription = function(newPackageType, subscriptionData = {}) {
  this.packageType = newPackageType;
  this.status = 'active';
  this.startDate = new Date();
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  this.expiryDate = expiryDate;
  if (subscriptionData.billing) {
    this.billing = {
      ...this.billing,
      ...subscriptionData.billing,
      lastPaymentDate: new Date()
    };
  }
  
  if (subscriptionData.paidAmount) {
    this.paidAmount = subscriptionData.paidAmount;
  }
  
  if (subscriptionData.paymentMethod) {
    this.paymentMethod = subscriptionData.paymentMethod;
  }
  
  this.usageStats.jobPostingsUsed = 0;
  this.usageStats.applicationsUsed = 0;
  
  return this.save();
};

UserSubscriptionSchema.methods.cancelSubscription = function(reason, refundAmount = 0) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancellationDate = new Date();
  this.autoRenew = false;
  
  if (refundAmount > 0) {
    this.billing.paymentStatus = 'refunded';
  }
  
  return this.save();
};

UserSubscriptionSchema.methods.renewSubscription = function(paymentData = {}) {
  if (this.status === 'cancelled') {
    throw new Error('Cannot renew cancelled subscription');
  }
  const newExpiryDate = new Date(this.expiryDate);
  newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
  this.expiryDate = newExpiryDate;
  this.status = 'active';

  if (paymentData.paidAmount) {
    this.paidAmount += paymentData.paidAmount;
  }
  
  if (paymentData.billing) {
    this.billing = {
      ...this.billing,
      ...paymentData.billing,
      lastPaymentDate: new Date()
    };
  }
  
  return this.save();
};

UserSubscriptionSchema.methods.pauseSubscription = function(reason) {
  if (this.status === 'active') {
    this.status = 'paused';
    this.cancellationReason = reason;
    this.autoRenew = false;
  }
  return this.save();
};

UserSubscriptionSchema.methods.resumeSubscription = function() {
  if (this.status === 'paused' && !this.isExpired) {
    this.status = 'active';
    this.cancellationReason = undefined;
  }
  return this.save();
};

UserSubscriptionSchema.statics.findActiveByUserId = function(userId) {
  return this.findOne({ 
    userId: userId, 
    status: 'active',
    expiryDate: { $gt: new Date() }
  }).populate('subscriptionId');
};

UserSubscriptionSchema.statics.findByUserId = function(userId) {
  return this.find({ userId: userId })
    .populate('subscriptionId')
    .sort({ createdAt: -1 });
};

UserSubscriptionSchema.statics.findExpiring = function(days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    status: 'active',
    expiryDate: { 
      $gte: new Date(), 
      $lte: futureDate 
    },
    autoRenew: false
  }).populate('userId subscriptionId');
};

UserSubscriptionSchema.pre('save', function(next) {
  if (this.expiryDate < new Date() && this.status === 'active') {
    this.status = 'expired';
  }
  next();
});

UserSubscriptionSchema.pre('save', function(next) {
  if (this.autoRenew && this.status === 'active') {
    this.billing.nextPaymentDate = new Date(this.expiryDate);
  }
  next();
});

export default mongoose.model('UserSubscription', UserSubscriptionSchema);