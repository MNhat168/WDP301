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
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  favoriteJobs: [{
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    favoriteDate: {
      type: Date,
      default: Date.now
    }
  }],
}, {
  timestamps: true
});

UserSchema.index({ email: 1 });
UserSchema.index({ roleId: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ 'favoriteJobs.jobId': 1 });
UserSchema.index({ 'favoriteJobs.favoriteDate': -1 });
UserSchema.methods.getActiveSubscription = async function() {
  const UserSubscription = require('./UserSubscription');
  return await UserSubscription.findActiveByUserId(this._id);
};

UserSchema.methods.getAllSubscriptions = async function() {
  const UserSubscription = require('./UserSubscription');
  return await UserSubscription.findByUserId(this._id);
};

UserSchema.methods.hasActiveSubscription = async function() {
  const subscription = await this.getActiveSubscription();
  return !!subscription;
};

UserSchema.methods.canPostJob = async function() {
  const subscription = await this.getActiveSubscription();
  return subscription ? subscription.canPostJob() : false;
};

UserSchema.methods.canApplyToJob = async function() {
  const subscription = await this.getActiveSubscription();
  return subscription ? subscription.canApplyToJob() : false;
};

UserSchema.methods.incrementJobPostings = async function() {
  const subscription = await this.getActiveSubscription();
  if (!subscription) {
    throw new Error('No active subscription found');
  }
  return await subscription.incrementJobPostings();
};

UserSchema.methods.incrementApplications = async function() {
  const subscription = await this.getActiveSubscription();
  if (!subscription) {
    throw new Error('No active subscription found');
  }
  return await subscription.incrementApplications();
};
UserSchema.methods.addFavoriteJob = function(jobId) {
  const existingFavorite = this.favoriteJobs.find(
    fav => fav.jobId.toString() === jobId.toString()
  );
  
  if (existingFavorite) {
    throw new Error('Job is already in favorites');
  }
  
  this.favoriteJobs.push({
    jobId: jobId,
    favoriteDate: new Date()
  });
  
  return this.save();
};

UserSchema.methods.removeFavoriteJob = function(jobId) {
  const initialLength = this.favoriteJobs.length;
  this.favoriteJobs = this.favoriteJobs.filter(
    fav => fav.jobId.toString() !== jobId.toString()
  );
  
  if (this.favoriteJobs.length === initialLength) {
    throw new Error('Job not found in favorites');
  }
  
  return this.save();
};

UserSchema.methods.isFavoriteJob = function(jobId) {
  return this.favoriteJobs.some(
    fav => fav.jobId.toString() === jobId.toString()
  );
};

UserSchema.methods.getFavoriteJobIds = function() {
  return this.favoriteJobs.map(fav => fav.jobId);
};

UserSchema.methods.getFavoriteJobsCount = function() {
  return this.favoriteJobs.length;
};

UserSchema.methods.getFavoriteJobsSortedByDate = function(ascending = false) {
  const sorted = [...this.favoriteJobs].sort((a, b) => {
    return ascending ? 
      new Date(a.favoriteDate) - new Date(b.favoriteDate) :
      new Date(b.favoriteDate) - new Date(a.favoriteDate);
  });
  return sorted;
};

UserSchema.methods.clearAllFavorites = function() {
  this.favoriteJobs = [];
  return this.save();
};

UserSchema.pre('save', function(next) {
  next();
});

module.exports = mongoose.model("User", UserSchema);