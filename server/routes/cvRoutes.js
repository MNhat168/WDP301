import express from 'express';
import multer from 'multer';
import {
  initializeCVProfile,
  getCVProfile,
  updateCVProfile,
  uploadCertificationFiles,
  deleteCertificationFile,
  getCVProfileCompletion,
  deleteCVProfile,
  addCertification,
  deleteCertification
} from '../controllers/cvController.js';

const router = express.Router();

// Configure multer for file uploads (in memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 5 // Maximum 5 files per request
  },
  fileFilter: (req, file, cb) => {
    // Only allow PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Initialize CV Profile (for new users)
router.post('/initialize', initializeCVProfile);

// Get CV Profile by user ID
router.get('/user/:userId', getCVProfile);

// Update CV Profile
router.put('/user/:userId', updateCVProfile);

// Add certification (without files)
router.post('/user/:userId/certifications', addCertification);

// Upload certification files
router.post('/user/:userId/certifications/upload', 
  upload.array('certificationFiles', 5), 
  uploadCertificationFiles
);

// Delete certification file
router.delete('/user/:userId/certifications/:certificationId/files/:filePublicId', 
  deleteCertificationFile
);

// Delete entire certification
router.delete('/user/:userId/certifications/:certificationId', 
  deleteCertification
);

// Get CV Profile completion status
router.get('/user/:userId/completion', getCVProfileCompletion);

// Delete CV Profile
router.delete('/user/:userId', deleteCVProfile);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 10MB per file.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 5 files allowed per upload.'
      });
    }
  }
  
  if (error.message === 'Only PDF files are allowed') {
    return res.status(400).json({
      success: false,
      message: 'Only PDF files are allowed for certifications.'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'File upload error',
    error: error.message
  });
});

export default router;