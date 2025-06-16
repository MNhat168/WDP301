import Company from '../models/CompanyProfile.js';
import Job from '../models/Job.js';
import asyncHandler from 'express-async-handler';

// Search and filter companies
export const searchCompanies = asyncHandler(async (req, res) => {
  const result = await Company.searchCompanies(req.query);
  return res.status(200).json({
    status: result ? true : false,
    code: result ? 200 : 400,
    message: result ? 'Search companies successfully' : 'Search companies failed',
    result: result ? result : 'Something went wrong!!!!',
  })
});

// Get company details
export const getCompanyDetails = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id)
    .populate('jobs');

  if (!company) {
    return res.status(200).json({
      status: company ? true : false,
      code: company ? 200 : 400,
      message: company ? 'Company not found' : 'Company not found',
      result: company ? company : 'Something went wrong!!!!',
    })
  }

  return res.status(200).json({
    status: company ? true : false,
    code: company ? 200 : 400,
    message: company ? 'Get company details successfully' : 'Get company details failed',
    result: company ? company : 'Something went wrong!!!!',
  })
});

// Get all companies
export const getAllCompanies = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const [companies, total] = await Promise.all([
    Company.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Company.countDocuments({ status: 'active' })
  ]);

  return res.status(200).json({
    status: companies ? true : false,
    code: companies ? 200 : 400,
    message: companies ? 'Get all companies successfully' : 'Get all companies failed',
    result: companies ? companies : 'Something went wrong!!!!',
  });
});

// Get jobs by company
export const getCompanyJobs = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);
  
  if (!company) {
    return res.status(200).json({
      status: company ? true : false,
      code: company ? 200 : 400,
      message: company ? 'Company not found' : 'Company not found',
      result: company ? company : 'Something went wrong!!!!',
    })
  }

  const jobs = await Job.find({ 
    company: company._id,
    status: 'active'
  })
  .sort({ createdAt: -1 });

  return res.status(200).json({
    status: jobs ? true : false,
    code: jobs ? 200 : 400,
    message: jobs ? 'Get jobs by company successfully' : 'Get jobs by company failed',
    result: jobs ? jobs : 'Something went wrong!!!!',
  })
});

// Create a new company profile
export const createCompanyProfile = asyncHandler(async (req, res) => {
  const { companyName, aboutUs, address, url } = req.body;
  console.log(req.body)
  const userId = req.user._id;

  if (!companyName) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'Company name is required'
    });
  }
  
  const existingProfile = await Company.findOne({ userId });
  if (existingProfile) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'User already has a company profile'
    });
  }

  const newProfile = await Company.create({
    userId,
    companyName,
    aboutUs,
    address,
    url
  });

  return res.status(201).json({
    status: true,
    code: 201,
    message: 'Company profile created successfully',
    result: newProfile
  });
});

// Get the company profile of the currently logged-in user
export const getMyCompanyProfile = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({
      status: false,
      code: 401,
      message: 'Authentication error: User ID could not be determined from token.'
    });
  }

  const userId = req.user._id;
  const profile = await Company.findOne({ userId });

  if (!profile) {
    return res.status(404).json({
      status: false,
      code: 404,
      message: 'Company profile not found for this user'
    });
  }

  return res.status(200).json({
    status: true,
    code: 200,
    message: 'Get my company profile successfully',
    result: profile
  });
});

// Update a company profile
export const updateCompanyProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const { companyName, aboutUs, address, url, status } = req.body;

  const profile = await Company.findById(id);

  if (!profile) {
    return res.status(404).json({ 
      status: false, 
      code: 404, 
      message: 'Company profile not found' 
    });
  }

  // Ensure the user owns the profile or is an admin
  if (profile.userId.toString() !== userId.toString() && req.user.role !== 'ROLE_ADMIN') {
    return res.status(403).json({ 
      status: false, 
      code: 403, 
      message: 'You are not authorized to update this profile' 
    });
  }

  // Update fields
  profile.companyName = companyName || profile.companyName;
  profile.aboutUs = aboutUs || profile.aboutUs;
  profile.address = address || profile.address;
  profile.url = url || profile.url;
  
  if (req.user.role === 'ROLE_ADMIN') {
    profile.status = status || profile.status;
  }

  const updatedProfile = await profile.save();

  return res.status(200).json({
    status: true,
    code: 200,
    message: 'Company profile updated successfully',
    result: updatedProfile
  });
}); 