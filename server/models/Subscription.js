import mongoose from 'mongoose';
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
  // Pricing for different user types
  pricing: {
    jobSeeker: {
      monthly: { type: Number, default: 0 },
      yearly: { type: Number, default: 0 },
      discount: { type: Number, default: 0 } // percentage
    },
    employer: {
      monthly: { type: Number, default: 0 },
      yearly: { type: Number, default: 0 },
      discount: { type: Number, default: 0 }
    }
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
    enum: ['free', 'basic', 'premium', 'enterprise'],
    required: true,
    unique: true
  },
  // Limits for different user types
  limits: {
    jobSeeker: {
      monthlyApplications: { type: Number, default: 5 },
      favoriteJobs: { type: Number, default: 10 },
      cvProfiles: { type: Number, default: 1 },
      jobAlerts: { type: Number, default: 3 }
    },
    employer: {
      monthlyJobPostings: { type: Number, default: 5 },
      featuredJobs: { type: Number, default: 0 },
      candidateDatabase: { type: Boolean, default: false },
      analyticsAccess: { type: Boolean, default: false }
    }
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
    // Job Seeker Features
    canApplyUnlimited: {
      type: Boolean,
      default: false
    },
    hasPriorityListing: {
      type: Boolean,
      default: false
    },
    canSeeJobViewers: {
      type: Boolean,
      default: false
    },
    hasAdvancedFilters: {
      type: Boolean,
      default: false
    },
    canDirectMessage: {
      type: Boolean,
      default: false
    },
    hasJobAlerts: {
      type: Boolean,
      default: false
    },
    hasCVAnalytics: {
      type: Boolean,
      default: false
    },
    hasMultipleCVTemplates: {
      type: Boolean,
      default: false
    },
    
    // Employer Features
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
    },
    canPostFeaturedJobs: {
      type: Boolean,
      default: false
    },
    canAccessCandidateDatabase: {
      type: Boolean,
      default: false
    },
    hasBulkJobPosting: {
      type: Boolean,
      default: false
    },
    hasCompanyAnalytics: {
      type: Boolean,
      default: false
    },
    hasAPIAccess: {
      type: Boolean,
      default: false
    }
  },
  // Special offers and promotions
  promotions: {
    isOnSale: { type: Boolean, default: false },
    saleDiscount: { type: Number, default: 0 },
    saleEndsAt: { type: Date },
    freeTrialDays: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

SubscriptionSchema.index({ packageType: 1, isActive: 1 });
SubscriptionSchema.index({ packageType: 1 });

export default mongoose.model('Subscription', SubscriptionSchema);