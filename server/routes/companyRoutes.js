import express from 'express';
import {
  searchCompanies,
  getCompanyDetails,
  getAllCompanies,
  getCompanyJobs
} from '../controllers/companyController.js';

const router = express.Router();

// Public routes
router.get('/search', searchCompanies);
router.get('/', getAllCompanies);
router.get('/:id', getCompanyDetails);
router.get('/:id/jobs', getCompanyJobs);

export default router; 