import asyncHandler from 'express-async-handler';
import UsageTracker from '../services/usageTracker.js';
import Usage from '../models/Usage.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// Get user's detailed usage statistics
const getUserUsageStats = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { startDate, endDate, action } = req.query;

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: 'User not found'
      });
    }

    // Set default date range (current month)
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();

    // Get usage statistics
    const usageStats = await UsageTracker.getUserUsageStats(_id, start, end);
    
    // Get subscription info
    const subscription = await user.getActiveSubscription();
    const subscriptionTier = subscription ? subscription.packageType : 'free';

    // Get current limits for each action
    const actionLimits = {};
    const commonActions = ['job_application', 'add_favorite', 'job_posting', 'profile_view', 'cv_download'];
    
    for (const actionType of commonActions) {
      const limits = UsageTracker.getActionLimits(subscription, actionType);
      const currentUsage = await UsageTracker.getCurrentUsage(_id, actionType, UsageTracker.getBillingPeriod(subscription));
      
      actionLimits[actionType] = {
        used: currentUsage,
        limit: limits.limit,
        remaining: limits.isUnlimited ? -1 : Math.max(0, limits.limit - currentUsage),
        isUnlimited: limits.isUnlimited,
        percentage: limits.isUnlimited ? 0 : Math.min(100, (currentUsage / limits.limit) * 100)
      };
    }

    // Get recent usage logs
    const recentLogs = await Usage.find({
      userId: _id,
      timestamp: { $gte: start, $lte: end },
      ...(action && { action })
    })
    .sort({ timestamp: -1 })
    .limit(50)
    .select('action status timestamp actionDetails limitInfo subscriptionTier');

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Usage statistics retrieved successfully',
      result: {
        period: { start, end },
        subscriptionTier,
        usageStats,
        actionLimits,
        recentLogs,
        summary: {
          totalActions: Object.values(usageStats).reduce((sum, stat) => sum + stat.total, 0),
          successfulActions: Object.values(usageStats).reduce((sum, stat) => sum + stat.successful, 0),
          blockedActions: Object.values(usageStats).reduce((sum, stat) => sum + stat.blocked, 0)
        }
      }
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      code: 500,
      message: 'Failed to get usage statistics',
      result: error.message
    });
  }
});

// Check if user can perform a specific action
const checkActionPermission = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { action } = req.params;

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: 'User not found'
      });
    }

    const subscription = await user.getActiveSubscription();
    const billingPeriod = UsageTracker.getBillingPeriod(subscription);
    
    // Check limits without actually tracking the action
    const limitCheck = await UsageTracker.checkActionLimit(user, subscription, action, billingPeriod);

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Permission check completed',
      result: {
        action,
        allowed: limitCheck.allowed,
        reason: limitCheck.reason || 'Action permitted',
        limitInfo: limitCheck.limitInfo,
        subscriptionTier: subscription ? subscription.packageType : 'free',
        upgradeRequired: !limitCheck.allowed
      }
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      code: 500,
      message: 'Failed to check permissions',
      result: error.message
    });
  }
});

// Get usage analytics for admin dashboard
const getSystemUsageAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate, tier, action } = req.query;

  try {
    // Set default date range (last 30 days)
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Build match criteria
    const matchCriteria = {
      timestamp: { $gte: start, $lte: end }
    };
    
    if (tier) matchCriteria.subscriptionTier = tier;
    if (action) matchCriteria.action = action;

    // Get comprehensive analytics
    const analytics = await UsageTracker.getSystemUsageAnalytics(start, end);

    // Get additional metrics
    const [totalUsers, totalActions, conversionStats] = await Promise.all([
      // Total unique users in period
      Usage.distinct('userId', matchCriteria).then(users => users.length),
      
      // Total actions in period
      Usage.countDocuments(matchCriteria),
      
      // Conversion stats (blocked to successful)
      Usage.aggregate([
        { $match: matchCriteria },
        {
          $group: {
            _id: '$subscriptionTier',
            totalAttempts: { $sum: 1 },
            successfulActions: {
              $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
            },
            blockedActions: {
              $sum: { $cond: [{ $eq: ['$status', 'blocked'] }, 1, 0] }
            }
          }
        },
        {
          $project: {
            tier: '$_id',
            totalAttempts: 1,
            successfulActions: 1,
            blockedActions: 1,
            successRate: {
              $multiply: [
                { $divide: ['$successfulActions', '$totalAttempts'] },
                100
              ]
            }
          }
        }
      ])
    ]);

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'System analytics retrieved successfully',
      result: {
        period: { start, end },
        overview: {
          totalUsers,
          totalActions,
          avgActionsPerUser: totalUsers > 0 ? Math.round(totalActions / totalUsers) : 0
        },
        analytics,
        conversionStats,
        filters: { tier, action }
      }
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      code: 500,
      message: 'Failed to get system analytics',
      result: error.message
    });
  }
});

// Get user's action history with pagination
const getUserActionHistory = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { 
    page = 1, 
    limit = 20, 
    action, 
    status, 
    startDate, 
    endDate 
  } = req.query;

  try {
    // Build query
    const query = { userId: new mongoose.Types.ObjectId(_id) };
    
    if (action) query.action = action;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      Usage.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('actionDetails.jobId', 'title companyId')
        .populate('actionDetails.companyId', 'companyName'),
      
      Usage.countDocuments(query)
    ]);

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Action history retrieved successfully',
      result: {
        logs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalRecords: total,
          hasNextPage: skip + parseInt(limit) < total,
          hasPrevPage: parseInt(page) > 1
        },
        filters: { action, status, startDate, endDate }
      }
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      code: 500,
      message: 'Failed to get action history',
      result: error.message
    });
  }
});

// Get usage trends for user
const getUserUsageTrends = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { period = 'monthly', action } = req.query;

  try {
    // Calculate date range based on period
    const now = new Date();
    let startDate, groupFormat;
    
    switch (period) {
      case 'daily':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
        groupFormat = '%Y-%m-%d';
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000); // Last 12 weeks
        groupFormat = '%Y-%U'; // Year-Week
        break;
      case 'monthly':
      default:
        startDate = new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000); // Last 12 months
        groupFormat = '%Y-%m';
        break;
    }

    const matchCriteria = {
      userId: new mongoose.Types.ObjectId(_id),
      timestamp: { $gte: startDate, $lte: now }
    };

    if (action) matchCriteria.action = action;

    const trends = await Usage.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: {
            period: { $dateToString: { format: groupFormat, date: '$timestamp' } },
            action: '$action',
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: {
            period: '$_id.period',
            action: '$_id.action'
          },
          successful: {
            $sum: { $cond: [{ $eq: ['$_id.status', 'success'] }, '$count', 0] }
          },
          blocked: {
            $sum: { $cond: [{ $eq: ['$_id.status', 'blocked'] }, '$count', 0] }
          },
          total: { $sum: '$count' }
        }
      },
      {
        $group: {
          _id: '$_id.period',
          actions: {
            $push: {
              action: '$_id.action',
              successful: '$successful',
              blocked: '$blocked',
              total: '$total'
            }
          },
          totalActions: { $sum: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Usage trends retrieved successfully',
      result: {
        period,
        dateRange: { startDate, endDate: now },
        trends,
        actionFilter: action
      }
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      code: 500,
      message: 'Failed to get usage trends',
      result: error.message
    });
  }
});

// Reset user's monthly usage (admin only)
const resetUserUsage = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { resetType = 'monthly' } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: 'User not found'
      });
    }

    // Reset user usage limits
    if (resetType === 'monthly') {
      await user.resetMonthlyLimits();
      
      // Reset subscription usage stats if applicable
      const subscription = await user.getActiveSubscription();
      if (subscription) {
        await subscription.resetUsageStats();
      }
    }

    return res.status(200).json({
      status: true,
      code: 200,
      message: `User usage reset successfully (${resetType})`,
      result: {
        userId,
        resetType,
        resetDate: new Date()
      }
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      code: 500,
      message: 'Failed to reset user usage',
      result: error.message
    });
  }
});

export {
  getUserUsageStats,
  checkActionPermission,
  getSystemUsageAnalytics,
  getUserActionHistory,
  getUserUsageTrends,
  resetUserUsage
}; 