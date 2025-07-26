import Application from '../models/Application.js';
import Job from '../models/Job.js';
import CVProfile from '../models/CVProfile.js';
import CompanyProfile from '../models/CompanyProfile.js';
import sendMail from '../config/sendMail.js';
import AIMatchingService from '../services/aiMatchingService.js';

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

    // Get job details for AI analysis
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
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

    // Trigger AI analysis in background (non-blocking)
    setImmediate(async () => {
      try {
        console.log(`🤖 Starting AI analysis for application ${application._id}`);
        const matchResult = await AIMatchingService.calculateMatchScore(cvProfile, job);

        if (matchResult.success) {
          matchResult.analysis.overallRecommendation =
            matchResult.analysis.overallRecommendation || 'consider';

          await Application.findByIdAndUpdate(application._id, {
            aiAnalysis: matchResult.analysis
          });
        } else {
          console.log(`⚠️ AI analysis failed for application ${application._id}, using fallback score: ${matchResult.fallbackScore}`);
          // Use fallback scoring
          const fallbackAnalysis = {
            matchScore: matchResult.fallbackScore,
            explanation: 'AI analysis failed, using rule-based fallback scoring',
            skillsMatch: { matched: [], missing: [], additional: [] },
            experienceMatch: { score: 50, explanation: 'Could not analyze with AI' },
            educationMatch: { score: 50, explanation: 'Could not analyze with AI' },
            overallRecommendation: 'consider',
            analyzedAt: new Date(),
            aiModel: 'fallback'
          };

          await Application.findByIdAndUpdate(application._id, {
            aiAnalysis: fallbackAnalysis
          });
        }
      } catch (error) {
        console.error(`❌ Error in background AI analysis for application ${application._id}:`, error);

        // Save basic fallback analysis even if error occurs
        try {
          const basicFallback = {
            matchScore: 50,
            explanation: 'AI analysis encountered an error, basic fallback applied',
            skillsMatch: { matched: [], missing: [], additional: [] },
            experienceMatch: { score: 50, explanation: 'Error in analysis' },
            educationMatch: { score: 50, explanation: 'Error in analysis' },
            overallRecommendation: 'consider',
            analyzedAt: new Date(),
            aiModel: 'error-fallback'
          };

          await Application.findByIdAndUpdate(application._id, {
            aiAnalysis: basicFallback
          });
        } catch (fallbackError) {
          console.error(`Failed to save fallback analysis:`, fallbackError);
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully! AI analysis is being processed in the background.',
      data: {
        application: {
          id: application._id,
          jobId: application.jobId,
          applicationDate: application.applicationDate,
          status: application.status
        },
        aiAnalysisStatus: 'processing'
      }
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

// Get all applications for a specific job (for employers)
export const getApplicationsByJobId = async (req, res) => {
  const { jobId } = req.params;
  const employerId = req.user._id;

  try {
    const companyProfile = await CompanyProfile.findOne({ userId: employerId });
    if (!companyProfile) {
      return res.status(403).json({
        success: false,
        message: 'No company profile found for this user'
      });
    }

    const job = await Job.findOne({ _id: jobId, companyId: companyProfile._id });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or unauthorized access'
      });
    }

    const applications = await Application.find({ jobId })
      .populate('userId', 'firstName lastName email')
      .populate('cvProfileId');

    res.json({
      success: true,
      applications: applications || [],
      jobDetails: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
};

export const scheduleInterview = async (req, res) => {
  const { id } = req.params;
  const { availableSlots, note } = req.body;
  const employerId = req.user._id;

  try {
    const companyProfile = await CompanyProfile.findOne({ userId: employerId });
    if (!companyProfile) {
      return res.status(403).json({
        success: false,
        message: 'No company profile found for this user'
      });
    }

    const application = await Application.findById(id)
      .populate('jobId', 'companyId title')
      .populate('userId', 'email fullName');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Check authorization
    if (application.jobId.companyId.toString() !== companyProfile._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Save interview details with available slots
    application.interview = {
      availableSlots: availableSlots.map(slot => ({
        date: slot.date,
        timeSlots: slot.timeSlots,
        selected: false // Candidate hasn't selected yet
      })),
      note: note || '',
      status: 'pending_selection' // New status for when candidate needs to select
    };
    await application.save();

    // Format available slots for email
    const slotsHtml = availableSlots.map(slot => {
      const dateStr = new Date(slot.date).toLocaleDateString();
      const timesStr = slot.timeSlots.join(', ');
      return `<li><strong>${dateStr}</strong>: ${timesStr}</li>`;
    }).join('');

    // Send email to candidate
    const emailContent = `
      <h3>Interview Invitation</h3>
      <p>Congratulations! Your application for <strong>${application.jobId.title}</strong> has been accepted!</p>
      
      <p><strong>Available Interview Slots:</strong></p>
      <ul>
        ${slotsHtml}
      </ul>
      
      <p>Please reply to this email with your preferred date and time slot.</p>
      
      ${note ? `<p><strong>Additional Notes:</strong> ${note}</p>` : ''}
      
      <p>Best regards,<br>${companyProfile.companyName}</p>
    `;

    await sendMail({
      email: application.userId.email,
      html: emailContent,
      type: 'interview_schedule'
    });

    res.json({
      success: true,
      message: 'Interview invitation sent successfully',
      application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to schedule interview',
      error: error.message
    });
  }
};


export const scheduleBulkInterview = async (req, res) => {
  const { applicationIds, availableSlots, note } = req.body;
  const employerId = req.user._id;

  try {
    const companyProfile = await CompanyProfile.findOne({ userId: employerId });
    if (!companyProfile) {
      return res.status(403).json({
        success: false,
        message: 'No company profile found for this user'
      });
    }

    const sampleApp = await Application.findById(applicationIds[0]);
    if (!sampleApp) {
      return res.status(404).json({
        success: false,
        message: 'Applications not found'
      });
    }
    const jobId = sampleApp.jobId;

    const job = await Job.findOne({
      _id: jobId,
      companyId: companyProfile._id
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or unauthorized access'
      });
    }

    const applications = await Application.find({
      _id: { $in: applicationIds },
      status: 'pending',
      jobId
    }).populate('userId', 'email firstName lastName');

    if (applications.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No pending applications for this job'
      });
    }

    // Update applications and send emails
    const updatePromises = applications.map(app => {
      return new Promise(async (resolve) => {
        try {
          // Update application to interview_scheduled
          app.status = 'interview_scheduled';
          app.interview = {
            availableSlots,
            note
          };
          await app.save();

          const slotsHtml = availableSlots.map(slot => {
            const dateStr = new Date(slot.date).toLocaleDateString();
            const timesStr = slot.timeSlots.join(', ');
            return `<li><strong>${dateStr}</strong>: ${timesStr}</li>`;
          }).join('');

          // Send interview notice email
          const emailContent = `
            <h3>Interview Invitation</h3>
            <p>Your application for <strong>${job.title}</strong> at <strong>${companyProfile.companyName}</strong> has been accepted!</p>
            
            <p><strong>Available Interview Slots:</strong></p>
            <ul>
              ${slotsHtml}
            </ul>
            
            <p>Please reply to this email with your preferred date and time slot.</p>
            
            ${note ? `<p><strong>Additional Notes:</strong> ${note}</p>` : ''}
            
            <p>Best regards,<br>${companyProfile.companyName}</p>
          `;

          await sendMail({
            email: app.userId.email,
            html: emailContent,
            type: 'interview_schedule'
          });

          resolve(true);
        } catch (error) {
          console.error(`Error processing application ${app._id}:`, error);
          resolve(false);
        }
      });
    });

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: `Interview scheduled for ${applications.length} applicants`,
      scheduledCount: applications.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to schedule bulk interview',
      error: error.message
    });
  }
};

export const updateApplicationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const employerId = req.user._id;

  try {
    const companyProfile = await CompanyProfile.findOne({ userId: employerId });
    if (!companyProfile) {
      return res.status(403).json({
        success: false,
        message: 'No company profile found for this user'
      });
    }

    const application = await Application.findById(id)
      .populate('jobId', 'companyId title')
      .populate('userId', 'email fullName');

    if (application.jobId.companyId.toString() !== companyProfile._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this application'
      });
    }

    // Send acceptance email if status is changing to "accepted"
    if (status === 'accepted') {
      await sendMail({
        email: application.userId.email,
        subject: `Congratulations! You've been accepted for ${application.jobId.title}`,
        html: `
          <h3>Job Offer Acceptance</h3>
          <p>Congratulations! Your application for <strong>${application.jobId.title}</strong> at <strong>${companyProfile.companyName}</strong> has been accepted!</p>
          
          <p>We're excited to welcome you to our team. Please expect further communication from our HR department regarding your onboarding process.</p>
          
          <p>Best regards,<br>${companyProfile.companyName}</p>
        `,
        type: 'application_accepted'
      });
    }

    application.status = status;
    await application.save();
    if (status === 'accepted') {
      const job = await Job.findById(application.jobId);
      if (job) {
        job.applicantCount = Math.max(0, job.applicantCount - 1);
        const now = new Date();
        if (job.applicantCount === 0 || (job.endDate && new Date(job.endDate) < now)) {
          job.status = 'inactive';
        }
        await job.save();
      }
    }
    res.json({
      success: true,
      message: `Application ${status} successfully`,
      application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message
    });
  }
};