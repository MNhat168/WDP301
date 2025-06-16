import Job from '../models/Job.js';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// Get all jobs with search and filter options
const getAllJobs = asyncHandler(async (req, res) => {
  const { 
    // Search parameters
    keyword, 
    
    // Filter parameters
    location, 
    jobType, 
    minSalary, 
    maxSalary, 
    experience, 
    education, 
    skills,
    
    // Pagination
    page = 1, 
    limit = 10 
  } = req.query;
  
  // Base query - only active jobs
  const searchQuery = { status: 'active' };

  // Text search functionality
  if (keyword) {
    searchQuery.$text = { $search: keyword };
  }

  // Location filter
  if (location) {
    searchQuery.location = new RegExp(location, 'i');
  }

  // Job type filter
  if (jobType) {
    searchQuery.jobType = jobType;
  }

  // Salary range filter
  if (minSalary || maxSalary) {
    searchQuery.salary = {};
    if (minSalary) searchQuery.salary.min = { $gte: parseInt(minSalary) };
    if (maxSalary) searchQuery.salary.max = { $lte: parseInt(maxSalary) };
  }

  // Experience filter
  if (experience) {
    searchQuery.experience = experience;
  }

  // Education filter
  if (education) {
    searchQuery.education = education;
  }

  // Skills filter
  if (skills) {
    const skillsArray = Array.isArray(skills) ? skills : skills.split(',');
    searchQuery.skills = { $in: skillsArray };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    const [jobs, total] = await Promise.all([
      Job.find(searchQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Job.countDocuments(searchQuery)
    ]);

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Get all jobs successfully',
      result: jobs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalJobs: total,
        hasNextPage: skip + parseInt(limit) < total,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'Get all jobs failed',
      result: error.message
    });
  }
});

// Get job details
const getJobDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Validate ObjectId format
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'Invalid job ID format',
      result: 'Job ID must be a valid ObjectId'
    });
  }
  
  try {
    const job = await Job.findById(id)
      .populate('companyId', 'companyName address url')
      .populate('categoryId', 'name');

    if (!job) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: 'Job not found',
        result: 'Job not found'
      });
    }

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Get job details successfully',
      result: job
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'Get job details failed',
      result: error.message
    });
  }
});

// Apply for a job
const applyForJob = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { cv } = req.body;
  const { _id } = req.user;

  try {
    const job = await Job.findById(id);
    
    if (!job) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: 'Job not found',
        result: 'Job not found'
      });
    }

    if (job.status !== 'active') {
      return res.status(400).json({
        status: false,
        code: 400,
        message: 'This job is no longer accepting applications',
        result: 'Job is not active'
      });
    }

    const existingApplication = job.applications.find(
      app => app.user.toString() === _id.toString()
    );

    if (existingApplication) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: 'You have already applied for this job',
        result: 'Already applied'
      });
    }

    job.applications.push({
      user: _id,
      cv
    });

    await job.save();

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Application submitted successfully',
      result: 'Application submitted successfully'
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'Apply for job failed',
      result: error.message
    });
  }
});

// Get jobs by company
export const getJobsByCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.companyId);
  
  if (!company) {
    return res.status(200).json({
      status: company ? true : false,
      code: company ? 200 : 400,
      message: company ? 'Company not found' : 'Company not found',
      result: company ? company : 'Something went wrong!!!!',
    })
  }

  const jobs = await Job.find({ company: company._id, status: 'active' })
    .sort({ createdAt: -1 });

  return res.status(200).json({
    status: jobs ? true : false,
    code: jobs ? 200 : 400,
    message: jobs ? 'Get jobs by company successfully' : 'Get jobs by company failed',
    result: jobs ? jobs : 'Something went wrong!!!!',
  })
});

// Get applied jobs for a user
const getAppliedJobs = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  try {
    const jobs = await Job.find({
      'applications.user': _id
    }).sort({ 'applications.appliedDate': -1 });

    const appliedJobs = jobs.map(job => {
      const application = job.applications.find(
        app => app.user.toString() === _id.toString()
      );
      return {
        ...job.toObject(),
        application
      };
    });

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Get applied jobs successfully',
      result: appliedJobs
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'Get applied jobs failed',
      result: error.message
    });
  }
});

// Update application status (for company)
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const job = await Job.findById(req.params.id);

  if (!job) {
    return res.status(200).json({
      status: job ? true : false,
      code: job ? 200 : 400,
      message: job ? 'Job not found' : 'Job not found',
      result: job ? job : 'Something went wrong!!!!',
    })
  }

  await job.updateApplicationStatus(req.params.userId, status);
  return res.status(200).json({
    status: job ? true : false,
    code: job ? 200 : 400,
    message: job ? 'Application status updated successfully' : 'Application status updated failed',
    result: job ? job : 'Something went wrong!!!!',
  })
});

// Get favorite jobs
const getFavoriteJobs = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  try {
    const user = await User.findById(_id).populate('favoriteJobs.jobId');
    const favoriteJobs = user.favoriteJobs.map(fav => ({
      ...fav.jobId.toObject(),
      favoriteDate: fav.favoriteDate
    }));

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Get favorite jobs successfully',
      result: favoriteJobs
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'Get favorite jobs failed',
      result: error.message
    });
  }
});

// Add job to favorites
const addFavoriteJob = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { _id } = req.user;

  try {
    const user = await User.findById(_id);
    await user.addFavoriteJob(id);

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Job added to favorites',
      result: 'Job added to favorites'
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'Add favorite job failed',
      result: error.message
    });
  }
});

// Remove job from favorites
const removeFavoriteJob = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { _id } = req.user;

  try {
    const user = await User.findById(_id);
    await user.removeFavoriteJob(id);

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Job removed from favorites',
      result: 'Job removed from favorites'
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'Remove favorite job failed',
      result: error.message
    });
  }
});

// Create a new job (for ROLE_EMPLOYEE only)
const createJob = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const {
    title,
    description,
    requirements,
    benefits,
    location,
    jobType,
    salary,
    experience,
    education,
    skills,
    deadline,
    companyId,
    categoryId
  } = req.body;

  try {
    // Validate required fields
    if (!title || !description || !location || !jobType || !salary || !deadline || !companyId || !categoryId) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: 'Missing required fields',
        result: 'Please provide: title, description, location, jobType, salary, deadline, companyId, categoryId'
      });
    }

    // Create new job
    const newJob = new Job({
      title,
      description,
      requirements,
      benefits,
      location,
      jobType,
      salary,
      experience,
      education,
      skills: skills || [],
      deadline: new Date(deadline),
      companyId,
      categoryId,
      createdBy: _id,
      status: 'pending'
    });

    const savedJob = await newJob.save();

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Job created successfully',
      result: savedJob
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'Create job failed',
      result: error.message
    });
  }
});

export {
  getAllJobs,
  getJobDetails,
  applyForJob,
  getAppliedJobs,
  getFavoriteJobs,
  addFavoriteJob,
  removeFavoriteJob,
  createJob
}; 