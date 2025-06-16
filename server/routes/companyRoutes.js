import express from 'express';
import {
  searchCompanies,
  getCompanyDetails,
  getAllCompanies,
  getCompanyJobs,
  createCompanyProfile,
  getMyCompanyProfile,
  updateCompanyProfile
} from '../controllers/companyController.js';
import { verifyAccessToken } from '../middlewares/verifyToken.js';

const router = express.Router();

// Public routes
router.get('/search', searchCompanies);
router.get('/', getAllCompanies);

// Protected Routes (require authentication)
router.use(verifyAccessToken);

router.post('/', createCompanyProfile);
// This route must come before /:id to avoid "my-profile" being treated as an ID
router.get('/my-profile', getMyCompanyProfile);
router.put('/:id', updateCompanyProfile);

// Public routes that need to be last
router.get('/:id', getCompanyDetails);
router.get('/:id/jobs', getCompanyJobs);

export default router; 