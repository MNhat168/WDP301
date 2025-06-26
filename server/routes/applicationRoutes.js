import express from 'express';
import {
  applyToJob,
  withdrawApplication,
  getApplicationStatus
} from '../controllers/applicationController.js';
import { verifyAccessToken } from '../middlewares/verifyToken.js';

const router = express.Router();

router.use(verifyAccessToken);
router.post('/', applyToJob);
router.delete('/:id', withdrawApplication);
router.get('/status/:jobId', getApplicationStatus);

export default router;