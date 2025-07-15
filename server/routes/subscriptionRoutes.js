import express from 'express';
import { verifyAccessToken, isAdmin } from '../middlewares/verifyToken.js';
import {
  getSubscriptionPlans,
  getUserSubscription,
  subscribeToPlan,
  upgradeSubscription,
  cancelSubscription,
  getUserUsageStats,
  syncUserCounters,
  getSubscriptionAnalytics
} from '../controllers/subscriptionController.js';

const router = express.Router();

// Public routes
router.get('/plans', getSubscriptionPlans);

// Protected routes - require authentication
router.use(verifyAccessToken);

// User subscription management
router.get('/my-subscription', getUserSubscription);
router.get('/usage-stats', getUserUsageStats);
router.post('/sync-counters', syncUserCounters);
router.post('/subscribe', subscribeToPlan);
router.patch('/upgrade', upgradeSubscription);
router.patch('/cancel', cancelSubscription);

// Admin only routes
router.get('/analytics', isAdmin, getSubscriptionAnalytics);

export default router; 