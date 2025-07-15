import express from 'express';
import {
  applyToJob,
  withdrawApplication,
  getApplicationStatus,
  getUserApplications
} from '../controllers/applicationController.js';
import { verifyAccessToken } from '../middlewares/verifyToken.js';

const router = express.Router();

router.use(verifyAccessToken);
router.post('/', applyToJob);
router.delete('/:id', withdrawApplication);
router.get('/status/:jobId', getApplicationStatus);
router.get('/my-applications', getUserApplications);

export default router;   