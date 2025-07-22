import mongoose from 'mongoose';
import dotenv from 'dotenv';
import UsageTracker from '../services/usageTracker.js';
import User from '../models/User.js';
import UserSubscription from '../models/UserSubscription.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for usage reset job');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Reset monthly usage for all users
const resetMonthlyUsage = async () => {
  try {
    console.log('Starting monthly usage reset...');
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Reset free tier users
    const freeUsersResult = await User.updateMany(
      { 
        'usageLimits.lastResetDate': { $lt: startOfMonth },
        $or: [
          { 'usageLimits.monthlyApplications': { $gt: 0 } },
          { 'usageLimits.favoritesCount': { $gt: 10 } }
        ]
      },
      {
        $set: {
          'usageLimits.monthlyApplications': 0,
          'usageLimits.lastResetDate': new Date()
        }
      }
    );

    console.log(`Reset usage for ${freeUsersResult.modifiedCount} free tier users`);

    // Reset subscription users whose billing cycle has renewed
    const subscriptionsToReset = await UserSubscription.find({
      status: 'active',
      'usageStats.lastUsedDate': { $exists: true }
    });

    let subscriptionResetCount = 0;
    for (const subscription of subscriptionsToReset) {
      const billingPeriod = UsageTracker.getBillingPeriod(subscription);
      const now = new Date();
      
      // Check if we're in a new billing cycle
      if (now >= billingPeriod.endDate) {
        await subscription.resetUsageStats();
        subscriptionResetCount++;
      }
    }

    console.log(`Reset usage for ${subscriptionResetCount} subscription users`);

    // Clean up old usage logs (keep only last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const UsageLog = (await import('../models/UsageLog.js')).default;
    const cleanupResult = await UsageLog.deleteMany({
      timestamp: { $lt: sixMonthsAgo }
    });

    console.log(`Cleaned up ${cleanupResult.deletedCount} old usage log entries`);

    console.log('Monthly usage reset completed successfully');
    return {
      freeUsersReset: freeUsersResult.modifiedCount,
      subscriptionUsersReset: subscriptionResetCount,
      oldLogsDeleted: cleanupResult.deletedCount
    };

  } catch (error) {
    console.error('Error during monthly usage reset:', error);
    throw error;
  }
};

// Sync usage stats from actual data (repair function)
const syncUsageStats = async () => {
  try {
    console.log('Starting usage stats sync...');
    
    const Job = (await import('../models/Job.js')).default;
    
    // Get all users
    const users = await User.find({});
    let syncedCount = 0;

    for (const user of users) {
      try {
        // Count actual applications
        const actualApplications = await Job.countDocuments({
          'applications.user': user._id,
          'applications.appliedDate': {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        });

        // Count actual job postings
        const actualJobPostings = await Job.countDocuments({
          createdBy: user._id,
          createdAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        });

        // Update user stats
        user.usageLimits.monthlyApplications = actualApplications;
        user.analytics.jobApplications = await Job.countDocuments({
          'applications.user': user._id
        });
        await user.save();

        // Update subscription stats if exists
        const subscription = await user.getActiveSubscription();
        if (subscription) {
          subscription.usageStats.applicationsUsed = actualApplications;
          subscription.usageStats.jobPostingsUsed = actualJobPostings;
          await subscription.save();
        }

        syncedCount++;
      } catch (userError) {
        console.error(`Error syncing user ${user._id}:`, userError);
      }
    }

    console.log(`Synced usage stats for ${syncedCount} users`);
    return { syncedUsers: syncedCount };

  } catch (error) {
    console.error('Error during usage stats sync:', error);
    throw error;
  }
};

// Generate usage report
const generateUsageReport = async () => {
  try {
    console.log('Generating usage report...');
    
    const UsageLog = (await import('../models/UsageLog.js')).default;
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    // Get monthly statistics
    const monthlyStats = await UsageLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: {
            tier: '$subscriptionTier',
            action: '$action',
            status: '$status'
          },
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $group: {
          _id: '$_id.tier',
          actions: {
            $push: {
              action: '$_id.action',
              status: '$_id.status',
              count: '$count',
              uniqueUsers: { $size: '$uniqueUsers' }
            }
          },
          totalActions: { $sum: '$count' },
          totalUniqueUsers: { $addToSet: '$uniqueUsers' }
        }
      },
      {
        $project: {
          tier: '$_id',
          actions: 1,
          totalActions: 1,
          totalUniqueUsers: { $size: { $reduce: {
            input: '$totalUniqueUsers',
            initialValue: [],
            in: { $setUnion: ['$$value', '$$this'] }
          }}}
        }
      }
    ]);

    const report = {
      period: {
        start: startOfMonth,
        end: endOfMonth
      },
      stats: monthlyStats,
      generatedAt: new Date()
    };

    console.log('Usage Report:', JSON.stringify(report, null, 2));
    return report;

  } catch (error) {
    console.error('Error generating usage report:', error);
    throw error;
  }
};

// Main execution
const main = async () => {
  const action = process.argv[2] || 'reset';
  
  try {
    await connectDB();
    
    switch (action) {
      case 'reset':
        await resetMonthlyUsage();
        break;
      case 'sync':
        await syncUsageStats();
        break;
      case 'report':
        await generateUsageReport();
        break;
      default:
        console.log('Available actions: reset, sync, report');
        break;
    }
    
  } catch (error) {
    console.error('Script execution failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { resetMonthlyUsage, syncUsageStats, generateUsageReport }; 