import express from 'express';
import { verifyAccessToken } from '../middlewares/verifyToken.js';
import {
  searchJobs,
  getJobDetails,
  applyForJob,
  getJobsByCompany,
  getAppliedJobs,
  updateApplicationStatus,
  getFavoriteJobs,
  addFavoriteJob,
  removeFavoriteJob
} from '../controllers/jobController.js';

const router = express.Router();

// Public routes
router.get('/search', searchJobs);
router.get('/:id', getJobDetails);
router.get('/company/:companyId', getJobsByCompany);

// Protected routes
router.use(verifyAccessToken);
router.post('/:id/apply', applyForJob);
router.get('/applied', getAppliedJobs);
router.patch('/:id/applications/:userId', updateApplicationStatus);
router.get('/favorites', getFavoriteJobs);
router.post('/:id/favorite', addFavoriteJob);
router.delete('/:id/favorite', removeFavoriteJob);

export default router; 