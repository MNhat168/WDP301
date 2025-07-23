import express from 'express';
import { verifyAccessToken, isAdmin } from '../middlewares/verifyToken.js';
import {
  getDashboardStats,
  getMonthlyJobsStats,
  getTopJobs,
  getUserGrowthStats,
  getApplicationStats
} from '../controllers/adminController.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(verifyAccessToken);
router.use(isAdmin);

// Dashboard endpoints
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/monthly-jobs', getMonthlyJobsStats);
router.get('/dashboard/top-jobs', getTopJobs);

// Additional analytics endpoints
router.get('/dashboard/user-growth', getUserGrowthStats);
router.get('/dashboard/applications', getApplicationStats);

export default router; 