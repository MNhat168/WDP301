import Application from '../models/Application.js';
import Job from '../models/Job.js';
import CVProfile from '../models/CVProfile.js';

export const applyToJob = async (req, res) => {
  const { jobId } = req.body;
  const userId = req.user._id;

  try {
    let cvProfile = await CVProfile.findOne({ userId });
    
    // If CV profile doesn't exist, create one
    if (!cvProfile) {
      cvProfile = new CVProfile({
        userId,
        description: '',
        phoneNumber: '',
        summary: '',
        workExperience: [],
        education: [],
        skills: [],
        languages: [],
        certifications: [],
        visibility: 'employers_only'
      });
      await cvProfile.save();
    }

    // Check if CV profile has minimum required information for job application
    // Only require skills - other fields are optional
    if (!cvProfile.skills || cvProfile.skills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please add at least one skill to your CV profile before applying to jobs',
        missingFields: ['Skills'],
        completionPercentage: cvProfile.completionPercentage
      });
    }

    // Check for existing application
    const existingApplication = await Application.findOne({ jobId, userId });
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this job'
      });
    }

    // Create new application
    const application = await Application.create({
      jobId,
      userId,
      cvProfileId: cvProfile._id
    });

    // Update job applicant count
    await Job.findByIdAndUpdate(jobId, {
      $inc: { applicantCount: 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: error.message
    });
  }
};

export const withdrawApplication = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  try {
    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Verify ownership
    if (application.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to withdraw this application'
      });
    }

    // Delete application and update job count
    await Application.deleteOne({ _id: id });
    await Job.findByIdAndUpdate(application.jobId, {
      $inc: { applicantCount: 1 }
    });

    res.json({
      success: true,
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to withdraw application',
      error: error.message
    });
  }
};

export const getApplicationStatus = async (req, res) => {
  const { jobId } = req.params;
  const userId = req.user._id;

  try {
    const application = await Application.findOne({ jobId, userId });
    if (!application) {
      return res.json({
        hasApplied: false,
        applicationId: null,
        testCompleted: false,
        questionExist: false
      });
    }

    res.json({
      hasApplied: true,
      applicationId: application._id,
      testCompleted: false, // Add actual test status later
      questionExist: false  // Add actual question status later
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get application status',
      error: error.message
    });
  }
};

// Get all applications for the current user
export const getUserApplications = async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10, status } = req.query;

  try {
    // Build query filter
    const filter = { userId };
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get applications with job details
    const applications = await Application.find(filter)
      .populate({
        path: 'jobId',
        select: 'title companyId location minSalary maxSalary status createdAt premiumFeatures',
        populate: {
          path: 'companyId',
          select: 'companyName address url status'
        }
      })
      .populate('cvProfileId', 'summary completionPercentage')
      .sort({ applicationDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalApplications = await Application.countDocuments(filter);
    const totalPages = Math.ceil(totalApplications / parseInt(limit));

    // Group applications by status for summary
    const statusSummary = await Application.aggregate([
      { $match: { userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const summary = statusSummary.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        applications,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalApplications,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        },
        summary: {
          total: totalApplications,
          pending: summary.pending || 0,
          accepted: summary.accepted || 0,
          rejected: summary.rejected || 0,
          withdrawn: summary.withdrawn || 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get user applications',
      error: error.message
    });
  }
};