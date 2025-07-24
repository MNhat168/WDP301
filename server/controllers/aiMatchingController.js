import asyncHandler from 'express-async-handler';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import CompanyProfile from '../models/CompanyProfile.js';
import AIMatchingService from '../services/aiMatchingService.js';

// Calculate AI match score for a specific application
const calculateApplicationScore = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;
  
  try {
    // Get application with populated data
    const application = await Application.findById(applicationId)
      .populate('jobId')
      .populate('cvProfileId')
      .populate('userId', 'firstName lastName email');

    if (!application) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: 'Application not found',
        result: null
      });
    }

    // Check if user has permission to access this application
    const userId = req.user._id;
    const isOwner = application.userId._id.toString() === userId.toString();
    
    // Check if user is employer of the job
    let isEmployer = false;
    if (!isOwner) {
      const companyProfile = await CompanyProfile.findOne({ userId });
      isEmployer = companyProfile && 
                  application.jobId.companyId.toString() === companyProfile._id.toString();
    }

    if (!isOwner && !isEmployer && req.user.role !== 'ROLE_ADMIN') {
      return res.status(403).json({
        status: false,
        code: 403,
        message: 'Unauthorized to access this application analysis',
        result: null
      });
    }

    // Calculate AI match score
    const matchResult = await AIMatchingService.calculateMatchScore(
      application.cvProfileId,
      application.jobId
    );

    if (matchResult.success) {
      // Update application with AI analysis
      application.aiAnalysis = matchResult.analysis;
      await application.save();

      return res.status(200).json({
        status: true,
        code: 200,
        message: 'AI match score calculated successfully',
        result: {
          applicationId: application._id,
          aiAnalysis: application.aiAnalysis,
          candidateInfo: {
            name: `${application.userId.firstName} ${application.userId.lastName}`,
            email: application.userId.email
          },
          jobInfo: {
            title: application.jobId.title,
            company: application.jobId.companyId
          }
        }
      });
    } else {
      // Use fallback score if AI analysis failed
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

      application.aiAnalysis = fallbackAnalysis;
      await application.save();

      return res.status(200).json({
        status: true,
        code: 200,
        message: 'Fallback match score calculated (AI service unavailable)',
        result: {
          applicationId: application._id,
          aiAnalysis: application.aiAnalysis,
          error: matchResult.error
        }
      });
    }

  } catch (error) {
    return res.status(500).json({
      status: false,
      code: 500,
      message: 'Failed to calculate match score',
      result: error.message
    });
  }
});

// Batch analyze all applications for a job
const batchAnalyzeJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const { forceReanalyze = false } = req.body;
  
  try {
    // Verify employer permission
    const companyProfile = await CompanyProfile.findOne({ userId: req.user._id });
    if (!companyProfile && req.user.role !== 'ROLE_ADMIN') {
      return res.status(403).json({
        status: false,
        code: 403,
        message: 'Only employers can analyze job applications',
        result: null
      });
    }

    // Get job and verify ownership
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: 'Job not found',
        result: null
      });
    }

    if (companyProfile && job.companyId.toString() !== companyProfile._id.toString()) {
      return res.status(403).json({
        status: false,
        code: 403,
        message: 'Unauthorized to analyze this job\'s applications',
        result: null
      });
    }

    // Get all applications for this job
    const applications = await Application.find({ jobId })
      .populate('cvProfileId')
      .populate('userId', 'firstName lastName email');

    if (applications.length === 0) {
      return res.status(200).json({
        status: true,
        code: 200,
        message: 'No applications found for this job',
        result: {
          jobId,
          totalApplications: 0,
          analyzedApplications: 0,
          results: []
        }
      });
    }

    // Filter applications that need analysis
    const applicationsToAnalyze = forceReanalyze ? 
      applications : 
      applications.filter(app => !app.aiAnalysis || !app.aiAnalysis.matchScore);

    let analyzedCount = 0;
    const results = [];

    // Process applications in batches to avoid overwhelming the AI service
    const BATCH_SIZE = 5;
    for (let i = 0; i < applicationsToAnalyze.length; i += BATCH_SIZE) {
      const batch = applicationsToAnalyze.slice(i, i + BATCH_SIZE);
      
      const batchPromises = batch.map(async (application) => {
        try {
          const matchResult = await AIMatchingService.calculateMatchScore(
            application.cvProfileId,
            job
          );

          if (matchResult.success) {
            application.aiAnalysis = matchResult.analysis;
            await application.save();
            analyzedCount++;

            return {
              applicationId: application._id,
              userId: application.userId._id,
              candidateName: `${application.userId.firstName} ${application.userId.lastName}`,
              matchScore: matchResult.analysis.matchScore,
              recommendation: matchResult.analysis.overallRecommendation,
              status: 'success'
            };
          } else {
            // Fallback analysis
            const fallbackAnalysis = {
              matchScore: matchResult.fallbackScore,
              explanation: 'AI analysis failed, using fallback',
              skillsMatch: { matched: [], missing: [], additional: [] },
              experienceMatch: { score: 50, explanation: 'Fallback score' },
              educationMatch: { score: 50, explanation: 'Fallback score' },
              overallRecommendation: 'consider',
              analyzedAt: new Date(),
              aiModel: 'fallback'
            };

            application.aiAnalysis = fallbackAnalysis;
            await application.save();
            analyzedCount++;

            return {
              applicationId: application._id,
              userId: application.userId._id,
              candidateName: `${application.userId.firstName} ${application.userId.lastName}`,
              matchScore: matchResult.fallbackScore,
              recommendation: 'consider',
              status: 'fallback',
              error: matchResult.error
            };
          }
        } catch (error) {
          console.error(`Error analyzing application ${application._id}:`, error);
          return {
            applicationId: application._id,
            userId: application.userId._id,
            candidateName: `${application.userId.firstName} ${application.userId.lastName}`,
            status: 'error',
            error: error.message
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Add small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < applicationsToAnalyze.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return res.status(200).json({
      status: true,
      code: 200,
      message: `Batch analysis completed. ${analyzedCount}/${applicationsToAnalyze.length} applications analyzed`,
      result: {
        jobId,
        jobTitle: job.title,
        totalApplications: applications.length,
        analyzedApplications: analyzedCount,
        skippedApplications: applications.length - applicationsToAnalyze.length,
        results: results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
      }
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      code: 500,
      message: 'Failed to batch analyze applications',
      result: error.message
    });
  }
});

// Get top 5 candidates for a job
const getTopCandidates = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const { limit = 5, includeDetails = true } = req.query;
  
  try {
    // Verify employer permission
    const companyProfile = await CompanyProfile.findOne({ userId: req.user._id });
    if (!companyProfile && req.user.role !== 'ROLE_ADMIN') {
      return res.status(403).json({
        status: false,
        code: 403,
        message: 'Only employers can view top candidates',
        result: null
      });
    }

    // Get job and verify ownership
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: 'Job not found',
        result: null
      });
    }

    if (companyProfile && job.companyId.toString() !== companyProfile._id.toString()) {
      return res.status(403).json({
        status: false,
        code: 403,
        message: 'Unauthorized to view this job\'s candidates',
        result: null
      });
    }

    // Get applications with AI analysis
    const applications = await Application.find({ 
      jobId,
      'aiAnalysis.matchScore': { $exists: true, $ne: null }
    })
    .populate('userId', 'firstName lastName email phone city')
    .populate('cvProfileId', 'summary skills workExperience education')
    .sort({ 'aiAnalysis.matchScore': -1 })
    .limit(parseInt(limit));

    if (applications.length === 0) {
      return res.status(200).json({
        status: true,
        code: 200,
        message: 'No analyzed applications found. Run batch analysis first.',
        result: {
          jobId,
          jobTitle: job.title,
          topCandidates: [],
          message: 'No candidates have been analyzed yet'
        }
      });
    }

    // Use AI service to get enhanced candidate analysis
    const topCandidatesResult = await AIMatchingService.getTopCandidates(applications, parseInt(limit));

    if (topCandidatesResult.success) {
      // Enhance with user details if requested
      const enhancedCandidates = includeDetails === 'true' ? 
        await Promise.all(topCandidatesResult.topCandidates.map(async (candidate) => {
          const application = applications.find(app => app._id.toString() === candidate.applicationId.toString());
          return {
            ...candidate,
            candidateDetails: {
              name: `${application.userId.firstName} ${application.userId.lastName}`,
              email: application.userId.email,
              phone: application.userId.phone,
              city: application.userId.city,
              summary: application.cvProfileId.summary,
              totalSkills: application.cvProfileId.skills.length,
              totalExperience: application.cvProfileId.workExperience.length,
              applicationDate: application.applicationDate,
              status: application.status
            },
            aiAnalysis: application.aiAnalysis
          };
        })) : topCandidatesResult.topCandidates;

      return res.status(200).json({
        status: true,
        code: 200,
        message: 'Top candidates retrieved successfully',
        result: {
          jobId,
          jobTitle: job.title,
          topCandidates: enhancedCandidates,
          totalAnalyzed: topCandidatesResult.totalAnalyzed,
          analysisDate: topCandidatesResult.analysisDate
        }
      });
    } else {
      return res.status(500).json({
        status: false,
        code: 500,
        message: 'Failed to analyze top candidates',
        result: topCandidatesResult.error
      });
    }

  } catch (error) {
    return res.status(500).json({
      status: false,
      code: 500,
      message: 'Failed to get top candidates',
      result: error.message
    });
  }
});

// Get AI analysis for a specific application (detailed view)
const getApplicationAnalysis = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;
  
  try {
    const application = await Application.findById(applicationId)
      .populate('jobId', 'title description companyId')
      .populate('cvProfileId')
      .populate('userId', 'firstName lastName email');

    if (!application) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: 'Application not found',
        result: null
      });
    }

    // Check permissions
    const userId = req.user._id;
    const isOwner = application.userId._id.toString() === userId.toString();
    
    let isEmployer = false;
    if (!isOwner) {
      const companyProfile = await CompanyProfile.findOne({ userId });
      isEmployer = companyProfile && 
                  application.jobId.companyId.toString() === companyProfile._id.toString();
    }

    if (!isOwner && !isEmployer && req.user.role !== 'ROLE_ADMIN') {
      return res.status(403).json({
        status: false,
        code: 403,
        message: 'Unauthorized to view this analysis',
        result: null
      });
    }

    if (!application.aiAnalysis || !application.aiAnalysis.matchScore) {
      return res.status(200).json({
        status: true,
        code: 200,
        message: 'No AI analysis available for this application',
        result: {
          applicationId: application._id,
          hasAnalysis: false,
          message: 'Run AI analysis to get detailed insights'
        }
      });
    }

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'AI analysis retrieved successfully',
      result: {
        applicationId: application._id,
        hasAnalysis: true,
        candidate: {
          name: `${application.userId.firstName} ${application.userId.lastName}`,
          email: application.userId.email
        },
        job: {
          title: application.jobId.title
        },
        aiAnalysis: application.aiAnalysis,
        applicationStatus: application.status,
        applicationDate: application.applicationDate
      }
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      code: 500,
      message: 'Failed to get application analysis',
      result: error.message
    });
  }
});

// Get AI analysis summary for employer dashboard
const getJobAnalyticsSummary = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  
  try {
    // Verify employer permission
    const companyProfile = await CompanyProfile.findOne({ userId: req.user._id });
    if (!companyProfile && req.user.role !== 'ROLE_ADMIN') {
      return res.status(403).json({
        status: false,
        code: 403,
        message: 'Only employers can view job analytics',
        result: null
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: 'Job not found',
        result: null
      });
    }

    if (companyProfile && job.companyId.toString() !== companyProfile._id.toString()) {
      return res.status(403).json({
        status: false,
        code: 403,
        message: 'Unauthorized to view this job\'s analytics',
        result: null
      });
    }

    // Aggregate AI analysis data
    const applications = await Application.find({ jobId });
    const analyzedApplications = applications.filter(app => app.aiAnalysis && app.aiAnalysis.matchScore);

    const summary = {
      jobId,
      jobTitle: job.title,
      totalApplications: applications.length,
      analyzedApplications: analyzedApplications.length,
      unanalyzedApplications: applications.length - analyzedApplications.length,
      averageMatchScore: 0,
      scoreDistribution: {
        excellent: 0,    // 80-100
        good: 0,         // 60-79
        average: 0,      // 40-59
        poor: 0          // 0-39
      },
      recommendationBreakdown: {
        highly_recommended: 0,
        recommended: 0,
        consider: 0,
        not_recommended: 0
      },
      topCandidatesPreview: []
    };

    if (analyzedApplications.length > 0) {
      // Calculate average score
      const totalScore = analyzedApplications.reduce((sum, app) => sum + app.aiAnalysis.matchScore, 0);
      summary.averageMatchScore = Math.round(totalScore / analyzedApplications.length);

      // Score distribution
      analyzedApplications.forEach(app => {
        const score = app.aiAnalysis.matchScore;
        if (score >= 80) summary.scoreDistribution.excellent++;
        else if (score >= 60) summary.scoreDistribution.good++;
        else if (score >= 40) summary.scoreDistribution.average++;
        else summary.scoreDistribution.poor++;

        // Recommendation breakdown
        const rec = app.aiAnalysis.overallRecommendation;
        if (summary.recommendationBreakdown[rec] !== undefined) {
          summary.recommendationBreakdown[rec]++;
        }
      });

      // Top 3 candidates preview
      const topCandidates = analyzedApplications
        .sort((a, b) => b.aiAnalysis.matchScore - a.aiAnalysis.matchScore)
        .slice(0, 3);

      summary.topCandidatesPreview = await Promise.all(
        topCandidates.map(async (app) => {
          const user = await app.populate('userId', 'firstName lastName');
          return {
            applicationId: app._id,
            candidateName: `${user.userId.firstName} ${user.userId.lastName}`,
            matchScore: app.aiAnalysis.matchScore,
            recommendation: app.aiAnalysis.overallRecommendation
          };
        })
      );
    }

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Job analytics summary retrieved successfully',
      result: summary
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      code: 500,
      message: 'Failed to get job analytics summary',
      result: error.message
    });
  }
});

export {
  calculateApplicationScore,
  batchAnalyzeJob,
  getTopCandidates,
  getApplicationAnalysis,
  getJobAnalyticsSummary
}; 