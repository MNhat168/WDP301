import Job from '../models/Job.js';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// Search and filter jobs
const searchJobs = asyncHandler(async (req, res) => {
  const { keyword, location, jobType, minSalary, maxSalary, experience, education, skills, page = 1, limit = 10 } = req.query;
  
  const searchQuery = { status: 'active' };

  if (keyword) {
    searchQuery.$text = { $search: keyword };
  }

  if (location) {
    searchQuery.location = new RegExp(location, 'i');
  }

  if (jobType) {
    searchQuery.jobType = jobType;
  }

  if (minSalary || maxSalary) {
    searchQuery.salary = {};
    if (minSalary) searchQuery.salary.$gte = minSalary;
    if (maxSalary) searchQuery.salary.$lte = maxSalary;
  }

  if (experience) {
    searchQuery.experience = experience;
  }

  if (education) {
    searchQuery.education = education;
  }

  if (skills && skills.length > 0) {
    searchQuery.skills = { $in: skills };
  }

  const skip = (page - 1) * limit;

  try {
    const [jobs, total] = await Promise.all([
      Job.find(searchQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Job.countDocuments(searchQuery)
    ]);

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Get jobs successfully',
      result: {
        jobs,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'Get jobs failed',
      result: error.message
    });
  }
});

// Get job details
const getJobDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  try {
    const job = await Job.findById(id);

    return res.status(200).json({
      status: job ? true : false,
      code: job ? 200 : 404,
      message: job ? 'Get job details successfully' : 'Job not found',
      result: job ? job : 'Job not found'
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

export {
  searchJobs,
  getJobDetails,
  applyForJob,
  getAppliedJobs,
  getFavoriteJobs,
  addFavoriteJob,
  removeFavoriteJob
}; 