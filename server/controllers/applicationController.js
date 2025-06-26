import Application from '../models/Application.js';
import Job from '../models/Job.js';
import CVProfile from '../models/CVProfile.js';

export const applyToJob = async (req, res) => {
  const { jobId } = req.body;
  const userId = req.user._id;

  try {
    const cvProfile = await CVProfile.findOne({ userId });
    if (!cvProfile || !cvProfile.isComplete) {
      return res.status(400).json({
        success: false,
        message: 'Complete your CV profile before applying'
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
      $inc: { applicantCount: -1 }
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