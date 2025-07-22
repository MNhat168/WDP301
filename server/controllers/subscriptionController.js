import Subscription from '../models/Subscription.js';
import UserSubscription from '../models/UserSubscription.js';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';
import paypalClient from '../config/paypalClient.js';
import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

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
    paymentMethod = 'paypal',
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
    
    // Calculate pricing based on billing period
    const userRole = await user.populate('roleId');
    const userType = userRole.roleId.name === 'ROLE_EMPLOYEE' ? 'employer' : 'jobSeeker';
    const price = billingPeriod === 'yearly' 
      ? subscription.pricing[userType].yearly 
      : subscription.pricing[userType].monthly;
    
    // Check if user already has active subscription
    const existingSubscription = await UserSubscription.findActiveByUserId(_id);
    
    if (existingSubscription) {
      // User wants to change/upgrade subscription
      console.log('User has existing subscription, upgrading...');
      
      // If it's the same plan, just return success
      if (existingSubscription.subscriptionId.toString() === subscriptionId) {
        return res.status(200).json({
          status: true,
          code: 200,
          message: 'You already have this subscription plan',
          result: {
            subscription: existingSubscription,
            paymentRequired: false
          }
        });
      }
      
      // If it's a trial or free subscription (price = 0), activate immediately
      if (paymentMethod === 'trial' || price === 0) {
        const trialDuration = subscription.promotions?.freeTrialDays || 30;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + trialDuration);
        
        // Update existing subscription
        existingSubscription.subscriptionId = subscriptionId;
        existingSubscription.packageType = subscription.packageType;
        existingSubscription.status = price === 0 ? 'active' : 'trial';
        existingSubscription.paidAmount = 0;
        existingSubscription.paymentMethod = 'trial';
        existingSubscription.expiryDate = expiryDate;
        existingSubscription.billing.paymentStatus = price === 0 ? 'paid' : 'trial';
        
        await existingSubscription.save();
        
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
          message: price === 0 ? 'Subscription changed successfully' : 'Trial subscription activated successfully',
          result: {
            subscription: existingSubscription,
            trialDays: price === 0 ? 0 : trialDuration
          }
        });
      }
      
      // For paid upgrades, create PayPal payment URL
      const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
      request.prefer('return=representation');
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: subscriptionId,
            amount: {
              currency_code: 'USD',
              value: price.toString()
            },
            description: `EasyJob ${subscription.packageName} Subscription Upgrade`
          }
        ],
        application_context: {
          return_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/payment-callback`,
          cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/packages`
        }
      });

      const createOrderResponse = await paypalClient.client().execute(request);
      const approvalUrl = createOrderResponse.result.links.find(link => link.rel === 'approve')?.href;
      const orderId = createOrderResponse.result.id;

      if (!approvalUrl) {
        throw new Error('Failed to create PayPal order or get approval URL');
      }
      
      // Update existing subscription to pending for upgrade
      existingSubscription.subscriptionId = subscriptionId;
      existingSubscription.packageType = subscription.packageType;
      existingSubscription.status = 'pending';
      existingSubscription.paidAmount = price;
      existingSubscription.paymentMethod = paymentMethod;
      existingSubscription.billing.paymentStatus = 'pending';
      existingSubscription.billing.paypalOrderId = orderId;
      
      await existingSubscription.save();

      return res.status(200).json({
        status: true,
        code: 200,
        message: 'PayPal payment order created for subscription upgrade',
        result: {
          subscription: existingSubscription,
          paymentRequired: true,
          paymentUrl: approvalUrl,
          amount: price,
          paymentMethod: paymentMethod,
          billingPeriod: billingPeriod,
          isUpgrade: true,
          orderId: orderId
        }
      });
    }
    
    // User doesn't have subscription, create new one
    console.log('User has no subscription, creating new...');
    
    // If it's a trial subscription (price = 0), activate immediately
    if (paymentMethod === 'trial' || price === 0) {
      const trialDuration = subscription.promotions?.freeTrialDays || 30;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + trialDuration);
      
      const newUserSubscription = new UserSubscription({
        userId: _id,
        subscriptionId: subscriptionId,
        packageType: subscription.packageType,
        status: price === 0 ? 'active' : 'trial',
        paidAmount: 0,
        paymentMethod: 'trial',
        expiryDate: expiryDate,
        billing: {
          paymentStatus: price === 0 ? 'paid' : 'trial'
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
        message: price === 0 ? 'Subscription activated successfully' : 'Trial subscription activated successfully',
        result: {
          subscription: newUserSubscription,
          trialDays: price === 0 ? 0 : trialDuration
        }
      });
    }
    
    // For paid subscriptions, create PayPal payment URL
    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: subscriptionId,
          amount: {
            currency_code: 'USD',
            value: price.toString()
          },
          description: `EasyJob ${subscription.packageName} Subscription`
        }
      ],
      application_context: {
        return_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/payment-callback`,
        cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/packages`
      }
    });

    const createOrderResponse = await paypalClient.client().execute(request);
    const approvalUrl = createOrderResponse.result.links.find(link => link.rel === 'approve')?.href;
    const orderId = createOrderResponse.result.id;

    if (!approvalUrl) {
      throw new Error('Failed to create PayPal order or get approval URL');
    }
    
    // Create pending subscription
    const newUserSubscription = new UserSubscription({
      userId: _id,
      subscriptionId: subscriptionId,
      packageType: subscription.packageType,
      status: 'pending', // Will be activated after payment confirmation
      paidAmount: price,
      paymentMethod: paymentMethod,
      expiryDate: new Date(Date.now() + (billingPeriod === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000),
      billing: {
        paymentStatus: 'pending',
        paypalOrderId: orderId,
        nextPaymentDate: new Date(Date.now() + (billingPeriod === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000)
      }
    });
    
    await newUserSubscription.save();

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'PayPal payment order created successfully',
      result: {
        subscription: newUserSubscription,
        paymentRequired: true,
        paymentUrl: approvalUrl,
        amount: price,
        paymentMethod: paymentMethod,
        billingPeriod: billingPeriod,
        orderId: orderId
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
  const { subscriptionId, paymentMethod = 'paypal' } = req.body;
  
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

// Ensure user has default free subscription
const ensureDefaultSubscription = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  
  try {
    // Check if user already has any subscription
    const existingSubscription = await UserSubscription.findOne({ userId: _id });
    
    if (existingSubscription) {
      return res.status(200).json({
        status: true,
        code: 200,
        message: 'User already has subscription',
        result: existingSubscription
      });
    }
    
    // Create free subscription
    const freePackage = await Subscription.findOne({ packageType: 'free', isActive: true });
    
    if (!freePackage) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: 'Free package not found',
        result: 'No free plan available'
      });
    }
    
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);
    
    const freeSubscription = new UserSubscription({
      userId: _id,
      subscriptionId: freePackage._id,
      startDate: new Date(),
      expiryDate: expiry,
      status: 'active',
      packageType: 'free',
      paidAmount: 0,
      paymentMethod: 'free',
      billing: {
        paymentStatus: 'paid'
      }
    });
    
    await freeSubscription.save();
    
    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Default free subscription created',
      result: freeSubscription
    });
    
  } catch (error) {
    return res.status(500).json({
      status: false,
      code: 500,
      message: 'Failed to ensure default subscription',
      result: error.message
    });
  }
});

// Get billing history for current user
const getBillingHistory = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  
  try {
    const history = await UserSubscription.find({ userId: _id })
      .populate('subscriptionId', 'packageName packageType basePrice')
      .sort({ createdAt: -1 })
      .limit(10);

    const formattedHistory = history.map(item => ({
      id: item._id,
      planName: item.subscriptionId?.packageName || 'Unknown Plan',
      planType: item.subscriptionId?.packageType || 'unknown',
      amount: item.paidAmount || 0,
      status: item.status,
      paymentMethod: item.paymentMethod,
      paymentDate: item.billing?.lastPaymentDate || item.createdAt,
      nextPaymentDate: item.billing?.nextPaymentDate,
      startDate: item.startDate || item.createdAt,
      expiryDate: item.expiryDate,
      description: `${item.subscriptionId?.packageName || 'Subscription'} - ${item.status}`
    }));

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Billing history retrieved successfully',
      result: formattedHistory
    });
  } catch (error) {
    console.error('Get billing history error:', error);
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'Get billing history failed',
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
  getSubscriptionAnalytics,
  ensureDefaultSubscription,
  getBillingHistory
}; 