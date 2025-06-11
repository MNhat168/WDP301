import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
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
    type: mongoose.Schema.Types.ObjectId,
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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    favoriteDate: {
      type: Date,
      default: Date.now
    }
  }],
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        // Regex for Vietnamese phone numbers
        // Format: 0xx-xxx-xxxx or +84xx-xxx-xxxx
        return /^(\+84|0)(3|5|7|8|9)([0-9]{8})$/.test(v);
      },
      message: props => `${props.value} is not a valid Vietnamese phone number!`
    }
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  refreshToken: {
    type: String
  },
  otp: {
    type: String
  },
  otpExpire: {
    type: Date
  },
  images: {
    type: String
  }
}, {
  timestamps: true
});

userSchema.index({ email: 1 });
userSchema.index({ roleId: 1 });
userSchema.index({ status: 1 });
userSchema.index({ 'favoriteJobs.jobId': 1 });
userSchema.index({ 'favoriteJobs.favoriteDate': -1 });

userSchema.methods.getActiveSubscription = async function() {
  const UserSubscription = require('./UserSubscription');
  return await UserSubscription.findActiveByUserId(this._id);
};

userSchema.methods.getAllSubscriptions = async function() {
  const UserSubscription = require('./UserSubscription');
  return await UserSubscription.findByUserId(this._id);
};

userSchema.methods.hasActiveSubscription = async function() {
  const subscription = await this.getActiveSubscription();
  return !!subscription;
};

userSchema.methods.canPostJob = async function() {
  const subscription = await this.getActiveSubscription();
  return subscription ? subscription.canPostJob() : false;
};

userSchema.methods.canApplyToJob = async function() {
  const subscription = await this.getActiveSubscription();
  return subscription ? subscription.canApplyToJob() : false;
};

userSchema.methods.incrementJobPostings = async function() {
  const subscription = await this.getActiveSubscription();
  if (!subscription) {
    throw new Error('No active subscription found');
  }
  return await subscription.incrementJobPostings();
};

userSchema.methods.incrementApplications = async function() {
  const subscription = await this.getActiveSubscription();
  if (!subscription) {
    throw new Error('No active subscription found');
  }
  return await subscription.incrementApplications();
};

userSchema.methods.addFavoriteJob = function(jobId) {
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

userSchema.methods.removeFavoriteJob = function(jobId) {
  const initialLength = this.favoriteJobs.length;
  this.favoriteJobs = this.favoriteJobs.filter(
    fav => fav.jobId.toString() !== jobId.toString()
  );
  
  if (this.favoriteJobs.length === initialLength) {
    throw new Error('Job not found in favorites');
  }
  
  return this.save();
};

userSchema.methods.isFavoriteJob = function(jobId) {
  return this.favoriteJobs.some(
    fav => fav.jobId.toString() === jobId.toString()
  );
};

userSchema.methods.getFavoriteJobIds = function() {
  return this.favoriteJobs.map(fav => fav.jobId);
};

userSchema.methods.getFavoriteJobsCount = function() {
  return this.favoriteJobs.length;
};

userSchema.methods.getFavoriteJobsSortedByDate = function(ascending = false) {
  const sorted = [...this.favoriteJobs].sort((a, b) => {
    return ascending ? 
      new Date(a.favoriteDate) - new Date(b.favoriteDate) :
      new Date(b.favoriteDate) - new Date(a.favoriteDate);
  });
  return sorted;
};

userSchema.methods.clearAllFavorites = function() {
  this.favoriteJobs = [];
  return this.save();
};

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = bcrypt.genSaltSync(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.isCorrectPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.createOtp = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  return otp;
};

userSchema.methods.verifyOtp = function(otp) {
  return this.otp === otp && this.otpExpire > Date.now();
};

const User = mongoose.model('User', userSchema);

export default User;