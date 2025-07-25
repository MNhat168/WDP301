import express from 'express';
import { verifyAccessToken, } from '../middlewares/verifyToken.js';
import {
  getSubscriptionPlans,
  getUserSubscription,
  subscribeToPlan,
  upgradeSubscription,
  cancelSubscription,
  getUserUsageStats,
  syncUserCounters,
  getSubscriptionAnalytics,
  ensureDefaultSubscription,
  getBillingHistory,
  createSubscription,
  updateSubscription,
  deleteSubscription
} from '../controllers/subscriptionController.js';

const router = express.Router();

// Public routes
router.get('/plans', getSubscriptionPlans);

// Protected routes - require authentication
router.use(verifyAccessToken);

// User subscription management
router.get('/my-subscription', getUserSubscription);
router.get('/usage-stats', getUserUsageStats);
router.get('/billing-history', getBillingHistory);
router.post('/sync-counters', syncUserCounters);
router.post('/subscribe', subscribeToPlan);
router.post('/ensure-default', ensureDefaultSubscription);
router.patch('/upgrade', upgradeSubscription);
router.patch('/cancel', cancelSubscription);

// Admin only routes
router.get('/analytics', getSubscriptionAnalytics);
router.post('/admin',  createSubscription);
router.put('/admin/:id',  updateSubscription);
router.delete('/admin/:id',  deleteSubscription);

export default router; 