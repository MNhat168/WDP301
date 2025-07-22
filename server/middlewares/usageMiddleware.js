import UsageTracker from '../services/usageTracker.js';

// Middleware to track specific actions automatically
export const trackUsage = (action, getActionDetails = null) => {
  return async (req, res, next) => {
    // Only track for authenticated users
    if (!req.user || !req.user._id) {
      return next();
    }

    try {
      // Get action details if function provided
      const actionDetails = getActionDetails ? getActionDetails(req) : {};
      
      // Track the action
      const result = await UsageTracker.trackAction(
        req.user._id,
        action,
        actionDetails,
        req
      );

      // If action is blocked, return error immediately
      if (!result.success && result.blocked) {
        return res.status(403).json({
          status: false,
          code: 403,
          message: result.reason,
          result: {
            action,
            currentUsage: result.limitInfo.currentUsage,
            limit: result.limitInfo.limit,
            remaining: result.limitInfo.remaining,
            upgradeRequired: result.upgradeRequired,
            currentTier: result.currentTier
          }
        });
      }

      // Attach usage result to request for use in controller
      req.usageResult = result;
      next();

    } catch (error) {
      console.error('Usage tracking error:', error);
      // Don't block the request if tracking fails
      next();
    }
  };
};

// Middleware to check subscription limits without tracking
export const checkLimit = (action) => {
  return async (req, res, next) => {
    if (!req.user || !req.user._id) {
      return next();
    }

    try {
      const User = (await import('../models/User.js')).default;
      const user = await User.findById(req.user._id);
      const subscription = await user.getActiveSubscription();
      const billingPeriod = UsageTracker.getBillingPeriod(subscription);
      
      const limitCheck = await UsageTracker.checkActionLimit(user, subscription, action, billingPeriod);

      if (!limitCheck.allowed) {
        return res.status(403).json({
          status: false,
          code: 403,
          message: limitCheck.reason,
          result: {
            action,
            currentUsage: limitCheck.limitInfo.currentUsage,
            limit: limitCheck.limitInfo.limit,
            remaining: limitCheck.limitInfo.remaining,
            upgradeRequired: true,
            currentTier: subscription ? subscription.packageType : 'free'
          }
        });
      }

      req.limitCheck = limitCheck;
      next();

    } catch (error) {
      console.error('Limit check error:', error);
      next();
    }
  };
};

// Middleware to track profile views
export const trackProfileView = trackUsage('profile_view', (req) => ({
  profileId: req.params.id || req.params.userId,
  source: req.headers['x-source'] || 'direct'
}));

// Middleware to track CV downloads
export const trackCVDownload = trackUsage('cv_download', (req) => ({
  cvId: req.params.id || req.params.cvId,
  downloadType: req.query.type || 'view'
}));

// Middleware to track search filter usage
export const trackSearchFilter = trackUsage('search_filter', (req) => ({
  searchQuery: req.query.keyword,
  filtersUsed: Object.keys(req.query).filter(key => 
    ['location', 'jobType', 'minSalary', 'maxSalary', 'experience', 'education', 'skills'].includes(key)
  ),
  resultCount: null // Will be filled by controller
}));

// Middleware to enforce subscription features
export const requireSubscriptionFeature = (featureName) => {
  return async (req, res, next) => {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        status: false,
        code: 401,
        message: 'Authentication required'
      });
    }

    try {
      const User = (await import('../models/User.js')).default;
      const user = await User.findById(req.user._id);
      const subscription = await user.getActiveSubscription();

      // Check if user has the required feature
      const hasFeature = subscription && subscription.features_config && subscription.features_config[featureName];

      if (!hasFeature) {
        return res.status(403).json({
          status: false,
          code: 403,
          message: `This feature requires a premium subscription`,
          result: {
            requiredFeature: featureName,
            currentTier: subscription ? subscription.packageType : 'free',
            upgradeRequired: true
          }
        });
      }

      next();

    } catch (error) {
      console.error('Feature check error:', error);
      return res.status(500).json({
        status: false,
        code: 500,
        message: 'Failed to verify subscription features'
      });
    }
  };
};

// Pre-built middleware for common features
export const requirePremiumFeatures = {
  advancedFilters: requireSubscriptionFeature('hasAdvancedFilters'),
  seeJobViewers: requireSubscriptionFeature('canSeeJobViewers'),
  directMessage: requireSubscriptionFeature('canDirectMessage'),
  cvAnalytics: requireSubscriptionFeature('hasCVAnalytics'),
  featuredJobs: requireSubscriptionFeature('canPostFeaturedJobs'),
  candidateDatabase: requireSubscriptionFeature('canAccessCandidateDatabase'),
  companyAnalytics: requireSubscriptionFeature('hasCompanyAnalytics'),
  bulkJobPosting: requireSubscriptionFeature('hasBulkJobPosting'),
  apiAccess: requireSubscriptionFeature('hasAPIAccess')
};

// Middleware to log usage without enforcement (for analytics)
export const logUsage = (action, getActionDetails = null) => {
  return async (req, res, next) => {
    // Store the original res.json to intercept response
    const originalJson = res.json;
    
    res.json = function(data) {
      // Call original json method
      originalJson.call(this, data);
      
      // Log usage after successful response (don't wait)
      if (req.user && req.user._id && res.statusCode < 400) {
        setImmediate(async () => {
          try {
            const actionDetails = getActionDetails ? getActionDetails(req, data) : {};
            await UsageTracker.trackAction(req.user._id, action, actionDetails, req);
          } catch (error) {
            console.error('Background usage logging error:', error);
          }
        });
      }
    };
    
    next();
  };
}; 