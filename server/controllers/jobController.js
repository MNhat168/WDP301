import Job from '../models/Job.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import CompanyProfile from '../models/CompanyProfile.js';
import asyncHandler from 'express-async-handler';
import UsageTracker from '../services/usageTracker.js';

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

  // Text search functionality - search by title using regex (like LIKE in SQL)
  if (keyword) {
    searchQuery.title = new RegExp(keyword, 'i');
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
        .sort({
          'premiumFeatures.isFeatured': -1, // Featured jobs first
          'premiumFeatures.isSponsored': -1, // Then sponsored jobs
          createdAt: -1 // Then by creation date
        })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('companyId', 'companyName address url'),
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

// Get job details with view tracking
const getJobDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

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

    // Track job view if user is authenticated
    if (req.user) {
      await UsageTracker.trackAction(
        req.user._id,
        'job_view',
        { jobId: id, companyId: job.companyId._id },
        req
      );
    }

    // Track job view (increment analytics)
    await job.incrementView();

    // Check if user has premium features to see additional data
    let responseData = job.toObject();

    if (req.user) {
      const user = await User.findById(req.user._id);
      const subscription = await user.getActiveSubscription();
      const isPremium = subscription && ['premium', 'enterprise'].includes(subscription.packageType);

      if (isPremium && subscription?.features_config?.canSeeJobViewers) {
        responseData.analytics = job.analytics;
      }
    }

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Get job details successfully',
      result: responseData
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
    // Check subscription limits and track usage
    const usageResult = await UsageTracker.trackAction(
      _id,
      'job_application',
      { jobId: id },
      req
    );

    if (!usageResult.success) {
      return res.status(403).json({
        status: false,
        code: 403,
        message: usageResult.reason,
        result: {
          currentUsage: usageResult.limitInfo.currentUsage,
          limit: usageResult.limitInfo.limit,
          remaining: usageResult.limitInfo.remaining,
          upgradeRequired: usageResult.upgradeRequired,
          currentTier: usageResult.currentTier
        }
      });
    }

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

    // Track job view
    await UsageTracker.trackAction(
      _id,
      'job_view',
      { jobId: id, action: 'application_submitted' },
      req
    );

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Application submitted successfully',
      result: {
        message: 'Application submitted successfully',
        remainingApplications: usageResult.limitInfo.isUnlimited ? 'unlimited' : usageResult.limitInfo.remaining
      }
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


// Add job to favorites
const addFavoriteJob = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { _id } = req.user;
  try {
    // Check subscription limits and track usage
    const usageResult = await UsageTracker.trackAction(
      _id,
      'add_favorite',
      { jobId: id },
      req
    );

    if (!usageResult.success) {
      return res.status(403).json({
        status: false,
        code: 403,
        message: usageResult.reason,
        result: {
          currentUsage: usageResult.limitInfo.currentUsage,
          limit: usageResult.limitInfo.limit,
          remaining: usageResult.limitInfo.remaining,
          upgradeRequired: usageResult.upgradeRequired,
          currentTier: usageResult.currentTier
        }
      });
    }

    const user = await User.findById(_id);
    await user.addFavoriteJob(id);

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Job added to favorites',
      result: {
        message: 'Job added to favorites',
        remainingFavorites: usageResult.limitInfo.isUnlimited ? 'unlimited' : usageResult.limitInfo.remaining
      }
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

    // Track removal (doesn't count against limits)
    await UsageTracker.trackAction(
      _id,
      'remove_favorite',
      { jobId: id },
      req
    );

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Job removed from favorites',
      result: {
        message: 'Job removed from favorites',
        currentFavorites: user.favoriteJobs.length
      }
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
    minSalary,
    maxSalary,
    experience,
    education,
    skills,
    deadline,
    companyId,
    categoryId,
    // Premium features
    isFeatured = false,
    isSponsored = false,
    isUrgentHiring = false,
    featuredDuration = 30
  } = req.body;

  try {
    // Check subscription limits and track usage
    const usageResult = await UsageTracker.trackAction(
      _id,
      'job_posting',
      {
        companyId,
        jobType,
        isFeatured,
        isSponsored,
        isUrgentHiring
      },
      req
    );

    if (!usageResult.success) {
      return res.status(403).json({
        status: false,
        code: 403,
        message: usageResult.reason,
        result: {
          currentUsage: usageResult.limitInfo?.currentUsage || 0,
          limit: usageResult.limitInfo?.limit || 0,
          remaining: usageResult.limitInfo?.remaining || 0,
          upgradeRequired: usageResult.upgradeRequired,
          currentTier: usageResult.currentTier || 'free'
        }
      });
    }

    // Validate required fields
    if (!title || !description || !location || !jobType || !minSalary || !maxSalary || !deadline || !companyId || !categoryId) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: 'Missing required fields',
        result: 'Please provide: title, description, location, jobType, salary, deadline, companyId, categoryId'
      });
    }

    // Get user and subscription for feature validation
    const user = await User.findById(_id);
    const subscription = await user.getActiveSubscription();

    // Create new job
    const newJob = new Job({
      title,
      description,
      requirements,
      benefits,
      location,
      jobType,
      minSalary,
      maxSalary,
      experience,
      education,
      skills: skills || [],
      deadline: new Date(deadline),
      companyId,
      categoryId,
      createdBy: _id,
      status: 'pending',
      premiumFeatures: {
        isFeatured: isFeatured && subscription?.features_config?.canPostFeaturedJobs,
        isSponsored: isSponsored && subscription?.features_config?.canPostFeaturedJobs,
        isUrgentHiring: isUrgentHiring && subscription?.features_config?.canPostFeaturedJobs,
        featuredUntil: isFeatured ? new Date(Date.now() + featuredDuration * 24 * 60 * 60 * 1000) : null
      }
    });

    const savedJob = await newJob.save();

    // Track featured job posting separately if applicable
    if (isFeatured && subscription?.features_config?.canPostFeaturedJobs) {
      await UsageTracker.trackAction(
        _id,
        'featured_job_post',
        { jobId: savedJob._id },
        req
      );
    }

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Job created successfully',
      result: {
        job: savedJob,
        remainingPostings: usageResult.limitInfo.isUnlimited ? 'unlimited' : usageResult.limitInfo.remaining
      }
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

// Get jobs for logged-in employer
const getEmployerJobs = asyncHandler(async (req, res) => {
  try {
    // Get company profile of logged-in employer
    const companyProfile = await CompanyProfile.findOne({ userId: req.user._id });

    if (!companyProfile) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: 'Company profile not found',
        result: 'Create a company profile first'
      });
    }

    const jobs = await Job.find({ companyId: companyProfile._id })
      .populate('companyId', 'companyName address url')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Get employer jobs successfully',
      result: jobs
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'Get employer jobs failed',
      result: error.message
    });
  }
});

// Get job details for employer
const getEmployerJobDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    // Get company profile
    const companyProfile = await CompanyProfile.findOne({ userId: req.user._id });

    if (!companyProfile) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: 'Company profile not found',
        result: 'Create a company profile first'
      });
    }

    const job = await Job.findOne({
      _id: id,
      companyId: companyProfile._id
    }).populate('companyId', 'companyName address url');

    if (!job) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: 'Job not found or unauthorized',
        result: 'Job does not belong to your company'
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

// Get favorite status of a job for the current user
const getFavoriteStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { _id } = req.user;


  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: 'User not found',
        result: 'User not found'
      });
    }
    const isFavorite = user.favoriteJobs.some(fav => fav.jobId.toString() === id);
    return res.status(200).json({
      status: isFavorite,
      code: 200,
      message: isFavorite ? 'Job is in favorites' : 'Job is not in favorites',
      result: isFavorite
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

// Update job (employer only)
const updateEmployerJob = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = {
    ...req.body,
    minSalary: req.body.minSalary,
    maxSalary: req.body.maxSalary
  };

  try {
    // Get company profile
    const companyProfile = await CompanyProfile.findOne({ userId: req.user._id });

    if (!companyProfile) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: 'Company profile not found',
        result: 'Create a company profile first'
      });
    }

    const job = await Job.findOneAndUpdate(
      { _id: id, companyId: companyProfile._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: 'Job not found or unauthorized',
        result: 'Job does not belong to your company'
      });
    }

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Job updated successfully',
      result: job
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'Update job failed',
      result: error.message
    });
  }
});

const getPendingJobs = asyncHandler(async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'pending' })
      .populate('companyId', 'companyName userId')
      .sort({ createdAt: -1 });
    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Pending jobs fetched successfully',
      result: jobs
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'Failed to fetch pending jobs',
      result: error.message
    });
  }
});

const updateJobStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const job = await Job.findById(id).populate('companyId', 'userId');

    if (!job) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: 'Job not found'
      });
    }

    job.status = status;
    await job.save();

    if (job.companyId && job.companyId.userId) {
      const notification = new Notification({
        userId: job.companyId.userId,
        message: `Your job "${job.title}" has been ${status}`,
        type: 'system'
      });
      await notification.save();
    }

    return res.status(200).json({
      status: true,
      code: 200,
      message: `Job ${status} successfully`,
      result: job
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'Failed to update job status',
      message: 'Get favorite status failed',
      result: error.message
    });
  }
});

export {
  getAllJobs,
  getJobDetails,
  applyForJob,
  getAppliedJobs,
  addFavoriteJob,
  removeFavoriteJob,
  createJob,
  getEmployerJobs,
  getEmployerJobDetails,
  updateEmployerJob,
  getPendingJobs,
  updateJobStatus,
  getFavoriteStatus
}; 