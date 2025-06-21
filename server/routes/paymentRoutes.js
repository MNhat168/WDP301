import express from 'express';
import { verifyAccessToken } from '../middlewares/verifyToken.js';
import {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
  activateFreeTrial
} from '../controllers/paymentController.js';

const router = express.Router();

// All payment routes require authentication
router.use(verifyAccessToken);

// Payment processing
router.post('/create-intent', createPaymentIntent);
router.post('/confirm', confirmPayment);
router.get('/history', getPaymentHistory);
router.post('/activate-trial', activateFreeTrial);

export default router; 