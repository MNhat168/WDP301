import User from '../models/User.js';
import Usage from '../models/Usage.js';

class UsageTracker {
  /**
   * Track user action and update usage statistics
   */
  static async trackAction(userId, action, actionDetails = {}, req = null) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const billingPeriod = this.getBillingPeriod(user.subscription);
      
      // Check if action is within limits
      const limitCheck = await this.checkActionLimit(user, user.subscription, action, billingPeriod);
      
      if (!limitCheck.allowed) {
        return {
          success: false,
          allowed: false,
          reason: limitCheck.reason,
          limit: limitCheck.limit,
          current: limitCheck.current
        };
      }

      // Record the action
      const usage = new Usage({
        userId,
        action,
        actionDetails,
        billingPeriod,
        timestamp: new Date(),
        ipAddress: req?.ip || null,
        userAgent: req?.headers?.['user-agent'] || null
      });

      await usage.save();

      return {
        success: true,
        allowed: true,
        usage: usage
      };
    } catch (error) {
      console.error('Error tracking action:', error);
      return {
        success: false,
        allowed: false,
        error: error.message
      };
    }
  }

  /**
   * Get user usage statistics
   */
  static async getUserUsageStats(userId, start = null, end = null) {
    try {
      const query = { userId };
      
      if (start && end) {
        query.timestamp = {
          $gte: new Date(start),
          $lte: new Date(end)
        };
      }

      const usage = await Usage.find(query);
      
      const stats = {};
      usage.forEach(record => {
        if (!stats[record.action]) {
          stats[record.action] = 0;
        }
        stats[record.action]++;
      });

      return stats;
    } catch (error) {
      console.error('Error getting user usage stats:', error);
      return {};
    }
  }

  /**
   * Get current usage for a specific action
   */
  static async getCurrentUsage(userId, actionType, billingPeriod) {
    try {
      const usage = await Usage.find({
        userId,
        action: actionType,
        billingPeriod
      });

      return usage.length;
    } catch (error) {
      console.error('Error getting current usage:', error);
      return 0;
    }
  }

  /**
   * Get action limits based on subscription
   */
  static getActionLimits(subscription, actionType) {
    const limits = {
      free: {
        job_application: 5,
        add_favorite: 10,
        search_jobs: 50,
        view_job_details: 20
      },
      basic: {
        job_application: 20,
        add_favorite: 50,
        search_jobs: 200,
        view_job_details: 100
      },
      premium: {
        job_application: 100,
        add_favorite: 200,
        search_jobs: 1000,
        view_job_details: 500
      }
    };

    return limits[subscription]?.[actionType] || 0;
  }

  /**
   * Get billing period for subscription
   */
  static getBillingPeriod(subscription) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // Monthly billing period
    return `${year}-${String(month + 1).padStart(2, '0')}`;
  }

  static async checkActionLimit(user, subscription, action, billingPeriod) {
    try {
      const limit = this.getActionLimits(subscription, action);
      const current = await this.getCurrentUsage(user._id, action, billingPeriod);

      return {
        allowed: current < limit,
        limit,
        current,
        remaining: limit - current,
        reason: current >= limit ? 'Limit exceeded' : null
      };
    } catch (error) {
      console.error('Error checking action limit:', error);
      return {
        allowed: false,
        limit: 0,
        current: 0,
        remaining: 0,
        reason: 'Error checking limits'
      };
    }
  }

  /**
   * Get system usage analytics
   */
  static async getSystemUsageAnalytics(start, end) {
    try {
      const query = {};
      if (start && end) {
        query.timestamp = {
          $gte: new Date(start),
          $lte: new Date(end)
        };
      }

      const usage = await Usage.find(query);
      
      const analytics = {
        totalActions: usage.length,
        actionsByType: {},
        actionsByUser: {},
        actionsByDate: {}
      };

      usage.forEach(record => {
        // Actions by type
        if (!analytics.actionsByType[record.action]) {
          analytics.actionsByType[record.action] = 0;
        }
        analytics.actionsByType[record.action]++;

        // Actions by user
        if (!analytics.actionsByUser[record.userId]) {
          analytics.actionsByUser[record.userId] = 0;
        }
        analytics.actionsByUser[record.userId]++;

        // Actions by date
        const date = record.timestamp.toISOString().split('T')[0];
        if (!analytics.actionsByDate[date]) {
          analytics.actionsByDate[date] = 0;
        }
        analytics.actionsByDate[date]++;
      });

      return analytics;
    } catch (error) {
      console.error('Error getting system usage analytics:', error);
      return {
        totalActions: 0,
        actionsByType: {},
        actionsByUser: {},
        actionsByDate: {}
      };
    }
  }

  /**
   * Sync user data for specific actions
   */
  static async syncUserData(userId, action, data) {
    try {
      // Remove existing usage records for this action and user
      await Usage.deleteMany({ userId, action });

      // Create new usage records based on actual data
      const usageRecords = data.map(item => ({
        userId,
        action,
        actionDetails: { itemId: item._id || item.id },
        billingPeriod: this.getBillingPeriod('free'), // Default billing period
        timestamp: new Date()
      }));

      if (usageRecords.length > 0) {
        await Usage.insertMany(usageRecords);
      }

      return { success: true, synced: usageRecords.length };
    } catch (error) {
      console.error('Error syncing user data:', error);
      return { success: false, error: error.message };
    }
  }
}

export default UsageTracker; 