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