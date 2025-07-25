import express from 'express';
import { 
  getEmployerJobs,
  getEmployerJobDetails,
  updateEmployerJob,
  createJob
} from '../controllers/jobController.js';
import { verifyAccessToken, isEmployee } from '../middlewares/verifyToken.js';

const router = express.Router();

router.use(verifyAccessToken, isEmployee);

router.get('/', getEmployerJobs);
router.post('/create', createJob);
router.get('/:id', getEmployerJobDetails);
router.put('/:id', updateEmployerJob);

export default router;