import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const JobSchema = new Schema({
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'CompanyProfile',
    required: true
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  experienceYears: {
    type: Number,
    min: 0
  },
  location: {
    type: String,
    trim: true
  },
  salary: {
    type: Number,
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending'
  },
  endDate: {
    type: Date
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  applicantCount: {
    type: Number,
    default: 0,
    min: 0
  },
  state: {
    type: String,
    trim: true
  },
  // Premium job features for employers
  premiumFeatures: {
    isFeatured: {
      type: Boolean,
      default: false
    },
    isSponsored: {
      type: Boolean,
      default: false
    },
    isUrgentHiring: {
      type: Boolean,
      default: false
    },
    highlightColor: {
      type: String,
      default: null
    },
    socialMediaBoost: {
      type: Boolean,
      default: false
    },
    featuredUntil: {
      type: Date,
      default: null
    }
  },
  // Job analytics
  analytics: {
    totalViews: {
      type: Number,
      default: 0
    },
    weeklyViews: {
      type: Number,
      default: 0
    },
    clickThroughRate: {
      type: Number,
      default: 0
    },
    applicationRate: {
      type: Number,
      default: 0
    },
    lastViewedDate: {
      type: Date
    },
    viewHistory: [{
      date: Date,
      views: Number
    }]
  }
}, {
  timestamps: true
});

// Job schema methods for analytics
JobSchema.methods.incrementView = function() {
  this.analytics.totalViews++;
  this.analytics.weeklyViews++;
  this.analytics.lastViewedDate = new Date();
  
  // Update daily view history
  const today = new Date().toDateString();
  const todayView = this.analytics.viewHistory.find(
    view => view.date.toDateString() === today
  );
  
  if (todayView) {
    todayView.views++;
  } else {
    this.analytics.viewHistory.push({
      date: new Date(),
      views: 1
    });
  }
  
  return this.save();
};

JobSchema.methods.calculateApplicationRate = function() {
  if (this.analytics.totalViews === 0) return 0;
  return (this.applicantCount / this.analytics.totalViews * 100).toFixed(2);
};

JobSchema.methods.isFeaturedActive = function() {
  if (!this.premiumFeatures.isFeatured) return false;
  if (!this.premiumFeatures.featuredUntil) return true;
  return new Date() < this.premiumFeatures.featuredUntil;
};

JobSchema.methods.makeFeatured = function(duration = 30) {
  this.premiumFeatures.isFeatured = true;
  const featuredUntil = new Date();
  featuredUntil.setDate(featuredUntil.getDate() + duration);
  this.premiumFeatures.featuredUntil = featuredUntil;
  return this.save();
};

JobSchema.methods.removeFeatured = function() {
  this.premiumFeatures.isFeatured = false;
  this.premiumFeatures.featuredUntil = null;
  return this.save();
};

// Indexes for better performance
JobSchema.index({ 'premiumFeatures.isFeatured': 1, status: 1 });
JobSchema.index({ 'premiumFeatures.isSponsored': 1, status: 1 });
JobSchema.index({ createdAt: -1 });
JobSchema.index({ 'analytics.totalViews': -1 });

const Job = mongoose.model('Job', JobSchema);

export default Job;