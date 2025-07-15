import Subscription from '../models/Subscription.js';
import UserSubscription from '../models/UserSubscription.js';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// Get all available subscription plans
const getSubscriptionPlans = asyncHandler(async (req, res) => {
  const { userType = 'jobSeeker' } = req.query;
  
  try {
    const plans = await Subscription.find({ isActive: true }).sort({ basePrice: 1 });
    
    // Format plans for specific user type
    const formattedPlans = plans.map(plan => ({
      _id: plan._id,
      packageName: plan.packageName,
      description: plan.description,
      packageType: plan.packageType,
      pricing: plan.pricing[userType],
      limits: plan.limits[userType],
      features: plan.features,
      features_config: plan.features_config,
      promotions: plan.promotions,
      isPopular: plan.packageType === 'premium' // Mark premium as popular
    }));

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Get subscription plans successfully',
      result: formattedPlans
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'Get subscription plans failed',
      result: error.message
    });
  }
});

// Get user's current subscription
const getUserSubscription = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  
  try {
    const userSubscription = await UserSubscription.findActiveByUserId(_id)
      .populate('subscriptionId');
    
    if (!userSubscription) {
      return res.status(200).json({
        status: true,
        code: 200,
        message: 'No active subscription found',
        result: {
          hasSubscription: false,
          packageType: 'free',
          usageStats: {
            jobPostingsUsed: 0,
            applicationsUsed: 0
          }
        }
      });
    }

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Get user subscription successfully',
      result: {
        hasSubscription: true,
        subscription: userSubscription,
        usageStats: userSubscription.usageStats,
        remainingDays: userSubscription.daysRemaining,
        features: userSubscription.subscriptionId.features_config
      }
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'Get user subscription failed',
      result: error.message
    });
  }
});

// Subscribe to a plan
const subscribeToPlan = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { 
    subscriptionId, 
    paymentMethod = 'stripe',
    billingPeriod = 'monthly' // monthly or yearly
  } = req.body;
  
  try {
    const subscription = await Subscription.findById(subscriptionId);
    
    if (!subscription || !subscription.isActive) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: 'Subscription plan not found or inactive',
        result: 'Invalid subscription plan'
      });
    }
    
    const user = await User.findById(_id);
    
    // Check if user already has active subscription
    const existingSubscription = await UserSubscription.findActiveByUserId(_id);
    if (existingSubscription) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: 'User already has an active subscription',
        result: 'Please cancel current subscription first'
      });
    }
    
    // Calculate pricing based on billing period
    const userRole = await user.populate('roleId');
    const userType = userRole.roleId.name === 'ROLE_EMPLOYEE' ? 'employer' : 'jobSeeker';
    const price = billingPeriod === 'yearly' 
      ? subscription.pricing[userType].yearly 
      : subscription.pricing[userType].monthly;
    
    // Create new user subscription
    const newUserSubscription = new UserSubscription({
      userId: _id,
      subscriptionId: subscriptionId,
      packageType: subscription.packageType,
      status: 'trial', // Start with trial, will be activated after payment
      paidAmount: price,
      paymentMethod: paymentMethod,
      expiryDate: new Date(Date.now() + (billingPeriod === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000),
      billing: {
        paymentStatus: 'pending',
        nextPaymentDate: new Date(Date.now() + (billingPeriod === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000)
      }
    });
    
    await newUserSubscription.save();
    
    // Update user premium features
    if (subscription.packageType !== 'free') {
      user.premiumFeatures = {
        hasUnlimitedApplications: subscription.features_config.canApplyUnlimited,
        hasPriorityListing: subscription.features_config.hasPriorityListing,
        canSeeJobViewers: subscription.features_config.canSeeJobViewers,
        hasAdvancedFilters: subscription.features_config.hasAdvancedFilters,
        canDirectMessage: subscription.features_config.canDirectMessage
      };
      await user.save();
    }

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Subscription created successfully',
      result: {
        subscription: newUserSubscription,
        paymentRequired: price > 0,
        amount: price,
        paymentMethod: paymentMethod
      }
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'Subscribe to plan failed',
      result: error.message
    });
  }
});

// Upgrade subscription
const upgradeSubscription = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { subscriptionId, paymentMethod = 'stripe' } = req.body;
  
  try {
    const newSubscription = await Subscription.findById(subscriptionId);
    const currentUserSubscription = await UserSubscription.findActiveByUserId(_id);
    
    if (!currentUserSubscription) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: 'No active subscription to upgrade',
        result: 'Please subscribe first'
      });
    }
    
    if (!newSubscription || !newSubscription.isActive) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: 'Target subscription plan not found',
        result: 'Invalid subscription plan'
      });
    }
    
    // Upgrade the subscription
    await currentUserSubscription.upgradeSubscription(newSubscription.packageType, {
      billing: { paymentMethod: paymentMethod },
      paidAmount: newSubscription.basePrice
    });
    
    // Update user premium features
    const user = await User.findById(_id);
    user.premiumFeatures = {
      hasUnlimitedApplications: newSubscription.features_config.canApplyUnlimited,
      hasPriorityListing: newSubscription.features_config.hasPriorityListing,
      canSeeJobViewers: newSubscription.features_config.canSeeJobViewers,
      hasAdvancedFilters: newSubscription.features_config.hasAdvancedFilters,
      canDirectMessage: newSubscription.features_config.canDirectMessage
    };
    await user.save();

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Subscription upgraded successfully',
      result: currentUserSubscription
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'Upgrade subscription failed',
      result: error.message
    });
  }
});

// Cancel subscription
const cancelSubscription = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { reason } = req.body;
  
  try {
    const userSubscription = await UserSubscription.findActiveByUserId(_id);
    
    if (!userSubscription) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: 'No active subscription found',
        result: 'No subscription to cancel'
      });
    }
    
    // Cancel the subscription
    userSubscription.status = 'cancelled';
    userSubscription.cancellationDate = new Date();
    userSubscription.cancellationReason = reason;
    userSubscription.autoRenew = false;
    
    await userSubscription.save();
    
    // Reset user premium features
    const user = await User.findById(_id);
    user.premiumFeatures = {
      hasUnlimitedApplications: false,
      hasPriorityListing: false,
      canSeeJobViewers: false,
      hasAdvancedFilters: false,
      canDirectMessage: false
    };
    await user.save();

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Subscription cancelled successfully',
      result: 'Your subscription has been cancelled'
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'Cancel subscription failed',
      result: error.message
    });
  }
});

// Get user usage statistics
const getUserUsageStats = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  
  try {
    const user = await User.findById(_id);
    const subscription = await UserSubscription.findActiveByUserId(_id);
    
    // Import models for counting actual records
    const Application = (await import('../models/Application.js')).default;
    const Job = (await import('../models/Job.js')).default;
    const CompanyProfile = (await import('../models/CompanyProfile.js')).default;

    // Count actual applications from database
    const actualApplicationCount = await Application.countDocuments({ userId: _id });
    
    // Count actual job postings (if employer)
    let actualJobPostingCount = 0;
    const companyProfile = await CompanyProfile.findOne({ userId: _id });
    if (companyProfile) {
      actualJobPostingCount = await Job.countDocuments({ companyId: companyProfile._id });
    }

    const stats = {
      user: {
        ...user.getUsageStats(),
        actualCounts: {
          applications: actualApplicationCount,
          jobPostings: actualJobPostingCount,
          favoriteJobs: user.favoriteJobs.length
        }
      },
      subscription: subscription ? {
        packageType: subscription.packageType,
        status: subscription.status,
        daysRemaining: subscription.daysRemaining,
        isActive: subscription.isActive,
        applications: {
          used: subscription.usageStats.applicationsUsed,
          actual: actualApplicationCount,
          limit: subscription.packageType === 'enterprise' ? -1 : 
            (subscription.packageType === 'premium' ? 50 : 
             subscription.packageType === 'basic' ? 10 : 0),
          remaining: subscription.getRemainingApplications(),
          canApply: subscription.canApplyToJob(),
          needsSync: subscription.usageStats.applicationsUsed !== actualApplicationCount
        },
        jobPostings: {
          used: subscription.usageStats.jobPostingsUsed,
          actual: actualJobPostingCount,
          limit: subscription.packageType === 'enterprise' ? -1 : 
            (subscription.packageType === 'premium' ? 20 : 
             subscription.packageType === 'basic' ? 5 : 0),
          remaining: subscription.getRemainingJobPostings(),
          canPost: subscription.canPostJob(),
          needsSync: subscription.usageStats.jobPostingsUsed !== actualJobPostingCount
        },
        features: {
          hasUnlimitedApplications: subscription.packageType === 'enterprise',
          hasPriorityListing: ['premium', 'enterprise'].includes(subscription.packageType),
          canSeeJobViewers: ['premium', 'enterprise'].includes(subscription.packageType),
          hasAdvancedFilters: ['premium', 'enterprise'].includes(subscription.packageType),
          canDirectMessage: ['premium', 'enterprise'].includes(subscription.packageType)
        },
        usageStats: subscription.usageStats,
        lastUsed: subscription.usageStats.lastUsedDate
      } : {
        packageType: 'free',
        status: 'none',
        daysRemaining: 0,
        isActive: false,
        applications: {
          used: user.usageLimits.monthlyApplications,
          actual: actualApplicationCount,
          limit: 5, // Free tier limit
          remaining: Math.max(0, 5 - user.usageLimits.monthlyApplications),
          canApply: user.usageLimits.monthlyApplications < 5,
          needsSync: user.usageLimits.monthlyApplications !== actualApplicationCount
        },
        jobPostings: {
          used: 0,
          actual: actualJobPostingCount,
          limit: 0, // Free users can't post jobs
          remaining: 0,
          canPost: false,
          needsSync: false
        },
        features: {
          hasUnlimitedApplications: false,
          hasPriorityListing: false,
          canSeeJobViewers: false,
          hasAdvancedFilters: false,
          canDirectMessage: false
        },
        lastUsed: user.usageLimits.lastResetDate
      },
      analytics: {
        profileViews: user.analytics.profileViews,
        cvDownloads: user.analytics.cvDownloads,
        totalJobApplications: user.analytics.jobApplications,
        lastActivity: user.analytics.lastActivityDate,
        monthlyViews: user.analytics.monthlyViews
      },
      syncStatus: {
        needsApplicationSync: subscription ? 
          subscription.usageStats.applicationsUsed !== actualApplicationCount :
          user.usageLimits.monthlyApplications !== actualApplicationCount,
        needsJobPostingSync: subscription ? 
          subscription.usageStats.jobPostingsUsed !== actualJobPostingCount : false,
        lastSyncRecommended: subscription ? 
          subscription.usageStats.applicationsUsed !== actualApplicationCount ||
          subscription.usageStats.jobPostingsUsed !== actualJobPostingCount :
          user.usageLimits.monthlyApplications !== actualApplicationCount
      }
    };

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Get user usage stats successfully',
      result: stats
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'Get user usage stats failed',
      result: error.message
    });
  }
});

// Sync user counters with actual database records  
const syncUserCounters = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  
  try {
    const user = await User.findById(_id);
    const subscription = await UserSubscription.findActiveByUserId(_id);
    
    // Import models for counting
    const Application = (await import('../models/Application.js')).default;
    const Job = (await import('../models/Job.js')).default;
    const CompanyProfile = (await import('../models/CompanyProfile.js')).default;

    // Count actual records
    const actualApplicationCount = await Application.countDocuments({ userId: _id });
    let actualJobPostingCount = 0;
    
    const companyProfile = await CompanyProfile.findOne({ userId: _id });
    if (companyProfile) {
      actualJobPostingCount = await Job.countDocuments({ companyId: companyProfile._id });
    }

    let syncResult = {
      userId: _id,
      actualCounts: {
        applications: actualApplicationCount,
        jobPostings: actualJobPostingCount
      }
    };

    if (subscription) {
      // Update subscription counters
      const oldAppCount = subscription.usageStats.applicationsUsed;
      const oldJobCount = subscription.usageStats.jobPostingsUsed;
      
      subscription.usageStats.applicationsUsed = actualApplicationCount;
      subscription.usageStats.jobPostingsUsed = actualJobPostingCount;
      subscription.usageStats.lastUsedDate = new Date();
      
      await subscription.save();
      
      syncResult.subscription = {
        packageType: subscription.packageType,
        applications: {
          oldCount: oldAppCount,
          newCount: actualApplicationCount,
          synced: true
        },
        jobPostings: {
          oldCount: oldJobCount,
          newCount: actualJobPostingCount,
          synced: true
        }
      };
    } else {
      // Update free tier user counters
      const oldAppCount = user.usageLimits.monthlyApplications;
      const oldAnalyticsCount = user.analytics.jobApplications;
      
      user.usageLimits.monthlyApplications = actualApplicationCount;
      user.analytics.jobApplications = actualApplicationCount;
      
      await user.save();
      
      syncResult.freeTier = {
        applications: {
          oldMonthlyCount: oldAppCount,
          oldAnalyticsCount: oldAnalyticsCount,
          newCount: actualApplicationCount,
          synced: true
        }
      };
    }

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'User counters synced successfully',
      result: syncResult
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      code: 500,
      message: 'Failed to sync user counters',
      error: error.message
    });
  }
});

// Admin: Get subscription analytics
const getSubscriptionAnalytics = asyncHandler(async (req, res) => {
  try {
    const analytics = await UserSubscription.aggregate([
      {
        $group: {
          _id: '$packageType',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$paidAmount' },
          activeUsers: {
            $sum: {
              $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
            }
          }
        }
      }
    ]);
    
    const totalUsers = await UserSubscription.countDocuments();
    const activeSubscriptions = await UserSubscription.countDocuments({ status: 'active' });
    
    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Get subscription analytics successfully',
      result: {
        planAnalytics: analytics,
        totalUsers,
        activeSubscriptions,
        conversionRate: totalUsers > 0 ? (activeSubscriptions / totalUsers * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'Get subscription analytics failed',
      result: error.message
    });
  }
});

export {
  getSubscriptionPlans,
  getUserSubscription,
  subscribeToPlan,
  upgradeSubscription,
  cancelSubscription,
  getUserUsageStats,
  syncUserCounters,
  getSubscriptionAnalytics
}; 