import express from 'express';
import { verifyAccessToken, isEmployee } from '../middlewares/verifyToken.js';
import {
  getAllJobs,
  getJobDetails,
  applyForJob,
  getJobsByCompany,
  getAppliedJobs,
  updateApplicationStatus,
  addFavoriteJob,
  removeFavoriteJob,
  createJob
} from '../controllers/jobController.js';

const router = express.Router();

// Public routes - specific routes first to avoid conflicts
router.get('/', getAllJobs);
router.get('/:id', getJobDetails);
router.get('/company/:companyId', getJobsByCompany);

// Protected routes
router.use(verifyAccessToken);

// All authenticated user routes
router.get('/applied', getAppliedJobs);

// Employee only routes
router.post('/create', createJob);

// Routes with :id parameter should come after more specific routes
router.post('/:id/apply', applyForJob);
router.patch('/:id/applications/:userId', updateApplicationStatus);
router.post('/:id/favorite', addFavoriteJob);
router.delete('/:id/favorite', removeFavoriteJob);

export default router; 