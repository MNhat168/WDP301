import CV from '../models/CVProfile.js';
import asyncHandler from 'express-async-handler';

// Create new CV
export const createCV = asyncHandler(async (req, res) => {
  const cvData = {
    ...req.body,
    user: req.user._id
  };

  const cv = await CV.create(cvData);
  return res.status(200).json({
    status: cv ? true : false,
    code: cv ? 200 : 400,
    message: cv ? 'Create CV successfully' : 'Create CV failed',
    result: cv ? cv : 'Something went wrong!!!!',
  })
});

// Get user's CVs
export const getUserCVs = asyncHandler(async (req, res) => {
  const cvs = await CV.getUserCVs(req.user._id);
  return res.status(200).json({
    status: cvs ? true : false,
    code: cvs ? 200 : 400,
    message: cvs ? 'Get user CVs successfully' : 'Get user CVs failed',
    result: cvs ? cvs : 'Something went wrong!!!!',
  })
});

// Get CV details
export const getCVDetails = asyncHandler(async (req, res) => {
  const cv = await CV.findById(req.params.id);

  if (!cv) {
    return res.status(200).json({
      status: cv ? true : false,
      code: cv ? 200 : 400,
      message: cv ? 'CV not found' : 'CV not found',
      result: cv ? cv : 'Something went wrong!!!!',
    })
  }

  if (cv.user.toString() !== req.user._id.toString()) {
    return res.status(200).json({
      status: cv ? true : false,
      code: cv ? 200 : 400,
      message: cv ? 'Not authorized to access this CV' : 'Not authorized to access this CV',
      result: cv ? cv : 'Something went wrong!!!!',
    })
  }

  return res.status(200).json({
    status: cv ? true : false,
    code: cv ? 200 : 400,
    message: cv ? 'Get CV details successfully' : 'Get CV details failed',
    result: cv ? cv : 'Something went wrong!!!!',
  })
});

// Update CV
export const updateCV = asyncHandler(async (req, res) => {
  const cv = await CV.findById(req.params.id);

  if (!cv) {
    return res.status(200).json({
      status: cv ? true : false,
      code: cv ? 200 : 400,
      message: cv ? 'CV not found' : 'CV not found',
      result: cv ? cv : 'Something went wrong!!!!',
    })
  }

  if (cv.user.toString() !== req.user._id.toString()) {
    return res.status(200).json({
      status: cv ? true : false,
      code: cv ? 200 : 400,
      message: cv ? 'Not authorized to update this CV' : 'Not authorized to update this CV',
      result: cv ? cv : 'Something went wrong!!!!',
    })
  }

  Object.assign(cv, req.body);
  await cv.save();

  return res.status(200).json({
    status: cv ? true : false,
    code: cv ? 200 : 400,
    message: cv ? 'Update CV successfully' : 'Update CV failed',
    result: cv ? cv : 'Something went wrong!!!!',
  })
});

// Set CV as default
export const setDefaultCV = asyncHandler(async (req, res) => {
  const cv = await CV.findById(req.params.id);

  if (!cv) {
    return res.status(200).json({
      status: cv ? true : false,
      code: cv ? 200 : 400,
      message: cv ? 'CV not found' : 'CV not found',
      result: cv ? cv : 'Something went wrong!!!!',
    })
  }

  if (cv.user.toString() !== req.user._id.toString()) {
    return res.status(200).json({
      status: cv ? true : false,
      code: cv ? 200 : 400,
      message: cv ? 'Not authorized to update this CV' : 'Not authorized to update this CV',
      result: cv ? cv : 'Something went wrong!!!!',
    })
  }

  await cv.setAsDefault();
  return res.status(200).json({
    status: cv ? true : false,
    code: cv ? 200 : 400,
    message: cv ? 'CV set as default successfully' : 'CV set as default failed',
    result: cv ? cv : 'Something went wrong!!!!',
  })
});

// Delete CV
export const deleteCV = asyncHandler(async (req, res) => {
  const cv = await CV.findById(req.params.id);

  if (!cv) {
    return res.status(200).json({
      status: cv ? true : false,
      code: cv ? 200 : 400,
      message: cv ? 'CV not found' : 'CV not found',
      result: cv ? cv : 'Something went wrong!!!!',
    })
  }

  if (cv.user.toString() !== req.user._id.toString()) {
    return res.status(200).json({
      status: cv ? true : false,
      code: cv ? 200 : 400,
      message: cv ? 'Not authorized to delete this CV' : 'Not authorized to delete this CV',
      result: cv ? cv : 'Something went wrong!!!!',
    })
  }

  await cv.deleteOne();
  return res.status(200).json({
    status: cv ? true : false,
    code: cv ? 200 : 400,
    message: cv ? 'CV deleted successfully' : 'CV deleted failed',
    result: cv ? cv : 'Something went wrong!!!!',
  })
});

// Upload CV file
export const uploadCVFile = asyncHandler(async (req, res) => {
  const cv = await CV.findById(req.params.id);

  if (!cv) {
    return res.status(200).json({
      status: cv ? true : false,
      code: cv ? 200 : 400,
      message: cv ? 'CV not found' : 'CV not found',
      result: cv ? cv : 'Something went wrong!!!!',
    })
  }

  if (cv.user.toString() !== req.user._id.toString()) {
    return res.status(200).json({
      status: cv ? true : false,
      code: cv ? 200 : 400,
      message: cv ? 'Not authorized to update this CV' : 'Not authorized to update this CV',
      result: cv ? cv : 'Something went wrong!!!!',
    })
  }

  if (!req.file) {
    return res.status(200).json({
      status: cv ? true : false,
      code: cv ? 200 : 400,
      message: cv ? 'No file uploaded' : 'No file uploaded',
      result: cv ? cv : 'Something went wrong!!!!',
    })
  }

  cv.fileUrl = req.file.path;
  await cv.save();

  return res.status(200).json({
    status: cv ? true : false,
    code: cv ? 200 : 400,
    message: cv ? 'CV file uploaded successfully' : 'CV file uploaded failed',
    result: cv ? cv : 'Something went wrong!!!!',
  })
}); 