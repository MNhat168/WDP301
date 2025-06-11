import express from 'express';
import { verifyAccessToken, isEmployee } from '../middlewares/verifyToken.js';
import {
  getAllJobs,
  getJobDetails,
  applyForJob,
  getJobsByCompany,
  getAppliedJobs,
  updateApplicationStatus,
  getFavoriteJobs,
  addFavoriteJob,
  removeFavoriteJob,
  createJob
} from '../controllers/jobController.js';

const router = express.Router();

// Public routes
router.get('/', getAllJobs);
router.get('/:id', getJobDetails);
router.get('/company/:companyId', getJobsByCompany);

// Protected routes
router.use(verifyAccessToken);

// Employee only routes
router.post('/create', createJob);

// All authenticated user routes
router.post('/:id/apply', applyForJob);
router.get('/applied', getAppliedJobs);
router.patch('/:id/applications/:userId', updateApplicationStatus);
router.get('/favorites', getFavoriteJobs);
router.post('/:id/favorite', addFavoriteJob);
router.delete('/:id/favorite', removeFavoriteJob);

export default router; 