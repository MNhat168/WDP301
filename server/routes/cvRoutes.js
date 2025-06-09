import express from 'express';
import { verifyAccessToken } from '../middlewares/verifyToken.js';

import {
  createCV,
  getUserCVs,
  getCVDetails,
  updateCV,
  setDefaultCV,
  deleteCV,
  uploadCVFile
} from '../controllers/cvController.js';

const router = express.Router();

// All routes are protected
router.use(verifyAccessToken);

router.post('/', createCV);
router.get('/', getUserCVs);
router.get('/:id', getCVDetails);
router.put('/:id', updateCV);
router.patch('/:id/default', setDefaultCV);
router.delete('/:id', deleteCV);
// router.post('/:id/upload', upload.single('cv'), uploadCVFile);

export default router; 