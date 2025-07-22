import express from 'express';
import { verifyAccessToken, isAdmin } from '../middlewares/verifyToken.js';
import {
  getUserUsageStats,
  checkActionPermission,
  getSystemUsageAnalytics,
  getUserActionHistory,
  getUserUsageTrends,
  resetUserUsage
} from '../controllers/usageController.js';

const router = express.Router();

// All routes require authentication
router.use(verifyAccessToken);

// User-specific usage endpoints
router.get('/stats', getUserUsageStats);
router.get('/check/:action', checkActionPermission);
router.get('/history', getUserActionHistory);
router.get('/trends', getUserUsageTrends);

// Admin-only endpoints
router.get('/admin/analytics', isAdmin, getSystemUsageAnalytics);
router.post('/admin/reset/:userId', isAdmin, resetUserUsage);

export default router; 