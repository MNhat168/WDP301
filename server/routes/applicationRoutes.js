import express from 'express';
import {
  applyToJob,
  withdrawApplication,
  getApplicationStatus,
  getUserApplications,
  getApplicationsByJobId,
  updateApplicationStatus,
  scheduleBulkInterview  
} from '../controllers/applicationController.js';
import { verifyAccessToken } from '../middlewares/verifyToken.js';

const router = express.Router();

router.use(verifyAccessToken);
router.post('/', applyToJob);
router.patch('/schedule-bulk', scheduleBulkInterview); 
router.delete('/:id', withdrawApplication);
router.get('/status/:jobId', getApplicationStatus);
router.get('/my-applications', getUserApplications);
router.get('/job/:jobId', getApplicationsByJobId);
router.patch('/:id/status', updateApplicationStatus);

export default router;