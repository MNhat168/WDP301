import express from 'express';
import { verifyAccessToken, isAdmin, isEmployee } from '../middlewares/verifyToken.js';
import {
  calculateApplicationScore,
  batchAnalyzeJob,
  getTopCandidates,
  getApplicationAnalysis,
  getJobAnalyticsSummary
} from '../controllers/aiMatchingController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyAccessToken);

// Calculate AI match score for a specific application
// Can be accessed by application owner, employer, or admin
router.post('/applications/:applicationId/analyze', calculateApplicationScore);

// Get detailed AI analysis for an application
// Can be accessed by application owner, employer, or admin
router.get('/applications/:applicationId/analysis', getApplicationAnalysis);

// Employer-only routes (and admin)
// Batch analyze all applications for a job
router.post('/jobs/:jobId/batch-analyze', batchAnalyzeJob);

// Get top candidates for a job (sorted by AI score)
router.get('/jobs/:jobId/top-candidates', getTopCandidates);

// Get job analytics summary (dashboard view)
router.get('/jobs/:jobId/analytics', getJobAnalyticsSummary);

export default router; 