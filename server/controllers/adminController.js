import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Job from '../models/Job.js';
import CompanyProfile from '../models/CompanyProfile.js';
import Application from '../models/Application.js';
import Role from '../models/Role.js';

// Get dashboard statistics
export const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    // Get role IDs
    const adminRole = await Role.findOne({ roleName: 'ROLE_ADMIN' });
    const employerRole = await Role.findOne({ roleName: 'ROLE_EMPLOYEE' });
    const jobSeekerRole = await Role.findOne({ roleName: 'ROLE_JOBSEEKER' });

    // Total counts
    const totalUsers = await User.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalCompanies = await CompanyProfile.countDocuments();

    // Account status counts
    const activeAccounts = await User.countDocuments({ 
      status: 'active',
      isBlocked: false 
    });
    const bannedAccounts = await User.countDocuments({ 
      isBlocked: true 
    });

    res.status(200).json({
      status: true,
      totalUsers,
      totalJobs,
      totalCompanies,
      activeAccounts,
      bannedAccounts
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      status: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
});

// Get monthly jobs statistics
export const getMonthlyJobsStats = asyncHandler(async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    
    const monthlyStats = await Job.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          countJob: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          countJob: 1
        }
      },
      {
        $sort: { month: 1 }
      }
    ]);

    // Fill missing months with 0
    const fullYearStats = [];
    for (let month = 1; month <= 12; month++) {
      const existingStat = monthlyStats.find(stat => stat.month === month);
      fullYearStats.push({
        month,
        countJob: existingStat ? existingStat.countJob : 0
      });
    }

    res.status(200).json(fullYearStats);

  } catch (error) {
    console.error('Error fetching monthly jobs stats:', error);
    res.status(500).json({
      status: false,
      message: 'Error fetching monthly jobs statistics',
      error: error.message
    });
  }
});

// Get top 5 jobs with most applications
export const getTopJobs = asyncHandler(async (req, res) => {
  try {
    const topJobs = await Job.aggregate([
      {
        $lookup: {
          from: 'applications',
          localField: '_id',
          foreignField: 'jobId',
          as: 'applications'
        }
      },
      {
        $addFields: {
          ApplyCount: { $size: '$applications' }
        }
      },
      {
        $project: {
          Title: '$title',
          Location: '$location',
          Salary: {
            $cond: {
              if: { $and: ['$minSalary', '$maxSalary'] },
              then: {
                $concat: [
                  { $toString: '$minSalary' },
                  ' - ',
                  { $toString: '$maxSalary' },
                  ' VND'
                ]
              },
              else: {
                $cond: {
                  if: '$minSalary',
                  then: {
                    $concat: [
                      'From ',
                      { $toString: '$minSalary' },
                      ' VND'
                    ]
                  },
                  else: 'Negotiable'
                }
              }
            }
          },
          ApplyCount: 1
        }
      },
      {
        $sort: { ApplyCount: -1 }
      },
      {
        $limit: 5
      }
    ]);

    res.status(200).json(topJobs);

  } catch (error) {
    console.error('Error fetching top jobs:', error);
    res.status(500).json({
      status: false,
      message: 'Error fetching top jobs',
      error: error.message
    });
  }
});

// Additional admin analytics endpoints

// Get user growth statistics
export const getUserGrowthStats = asyncHandler(async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          newUsers: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          newUsers: 1
        }
      },
      {
        $sort: { month: 1 }
      }
    ]);

    res.status(200).json(userGrowth);

  } catch (error) {
    console.error('Error fetching user growth stats:', error);
    res.status(500).json({
      status: false,
      message: 'Error fetching user growth statistics',
      error: error.message
    });
  }
});

// Get application statistics
export const getApplicationStats = asyncHandler(async (req, res) => {
  try {
    const totalApplications = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({ status: 'pending' });
    const acceptedApplications = await Application.countDocuments({ status: 'accepted' });
    const rejectedApplications = await Application.countDocuments({ status: 'rejected' });

    res.status(200).json({
      status: true,
      totalApplications,
      pendingApplications,
      acceptedApplications,
      rejectedApplications
    });

  } catch (error) {
    console.error('Error fetching application stats:', error);
    res.status(500).json({
      status: false,
      message: 'Error fetching application statistics',
      error: error.message
    });
  }
}); 