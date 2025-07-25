import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Subscription from '../models/Subscription.js';

dotenv.config();

const subscriptionPlans = [
  // FREE PLAN
  {
    packageName: 'Free Plan',
    description: 'Basic features for job seekers and employers',
    packageType: 'free',
    basePrice: 0,
    pricing: {
      jobSeeker: {
        monthly: 0,
        yearly: 0,
        discount: 0
      },
      employer: {
        monthly: 0,
        yearly: 0,
        discount: 0
      }
    },
    limits: {
      jobSeeker: {
        monthlyApplications: 5,
        favoriteJobs: 10,
        cvProfiles: 1,
        jobAlerts: 3
      },
      employer: {
        monthlyJobPostings: 2,
        featuredJobs: 0,
        candidateDatabase: false,
        analyticsAccess: false
      }
    },
    features: [
      'Basic job search',
      'Apply to jobs (limited)',
      'Save favorite jobs (limited)',
      'Basic company profile',
      'Email support'
    ],
    features_config: {
      // Job Seeker Features
      canApplyUnlimited: false,
      hasPriorityListing: false,
      canSeeJobViewers: false,
      hasAdvancedFilters: false,
      canDirectMessage: false,
      hasJobAlerts: false,
      hasCVAnalytics: false,
      hasMultipleCVTemplates: false,
      
      // Employer Features
      canPostJobs: true,
      canViewApplications: true,
      canAccessAnalytics: false,
      canUseAdvancedSearch: false,
      prioritySupport: false,
      canPostFeaturedJobs: false,
      canAccessCandidateDatabase: false,
      hasBulkJobPosting: false,
      hasCompanyAnalytics: false,
      hasAPIAccess: false
    },
    promotions: {
      isOnSale: false,
      freeTrialDays: 0
    }
  },

  // BASIC PLAN
  {
    packageName: 'Basic Plan',
    description: 'Essential features for serious job seekers and small companies',
    packageType: 'basic',
    basePrice: 49,
    pricing: {
      jobSeeker: {
        monthly: 9.99,
        yearly: 99.99,
        discount: 17 // 17% discount for yearly
      },
      employer: {
        monthly: 49,
        yearly: 490,
        discount: 17
      }
    },
    limits: {
      jobSeeker: {
        monthlyApplications: 20,
        favoriteJobs: 50,
        cvProfiles: 3,
        jobAlerts: 10
      },
      employer: {
        monthlyJobPostings: 10,
        featuredJobs: 2,
        candidateDatabase: false,
        analyticsAccess: true
      }
    },
    features: [
      'All Free features',
      'Increased application limits',
      'More favorite jobs',
      'Job alerts',
      'Basic analytics',
      'Priority email support'
    ],
    features_config: {
      // Job Seeker Features
      canApplyUnlimited: false,
      hasPriorityListing: true,
      canSeeJobViewers: false,
      hasAdvancedFilters: true,
      canDirectMessage: false,
      hasJobAlerts: true,
      hasCVAnalytics: true,
      hasMultipleCVTemplates: true,
      
      // Employer Features
      canPostJobs: true,
      canViewApplications: true,
      canAccessAnalytics: true,
      canUseAdvancedSearch: true,
      prioritySupport: false,
      canPostFeaturedJobs: true,
      canAccessCandidateDatabase: false,
      hasBulkJobPosting: false,
      hasCompanyAnalytics: true,
      hasAPIAccess: false
    },
    promotions: {
      isOnSale: false,
      freeTrialDays: 7
    }
  },

  // PREMIUM PLAN
  {
    packageName: 'Premium Plan',
    description: 'Advanced features for professional job seekers and growing companies',
    packageType: 'premium',
    basePrice: 149,
    pricing: {
      jobSeeker: {
        monthly: 19.99,
        yearly: 199.99,
        discount: 17
      },
      employer: {
        monthly: 149,
        yearly: 1490,
        discount: 17
      }
    },
    limits: {
      jobSeeker: {
        monthlyApplications: -1, // unlimited
        favoriteJobs: -1, // unlimited
        cvProfiles: 10,
        jobAlerts: -1 // unlimited
      },
      employer: {
        monthlyJobPostings: 50,
        featuredJobs: 10,
        candidateDatabase: true,
        analyticsAccess: true
      }
    },
    features: [
      'All Basic features',
      'Unlimited job applications',
      'Unlimited favorite jobs',
      'Advanced job filters',
      'Direct messaging with employers',
      'CV analytics and insights',
      'Multiple CV templates',
      'Featured job postings',
      'Candidate database access',
      'Priority support'
    ],
    features_config: {
      // Job Seeker Features
      canApplyUnlimited: true,
      hasPriorityListing: true,
      canSeeJobViewers: true,
      hasAdvancedFilters: true,
      canDirectMessage: true,
      hasJobAlerts: true,
      hasCVAnalytics: true,
      hasMultipleCVTemplates: true,
      
      // Employer Features
      canPostJobs: true,
      canViewApplications: true,
      canAccessAnalytics: true,
      canUseAdvancedSearch: true,
      prioritySupport: true,
      canPostFeaturedJobs: true,
      canAccessCandidateDatabase: true,
      hasBulkJobPosting: true,
      hasCompanyAnalytics: true,
      hasAPIAccess: false
    },
    promotions: {
      isOnSale: true,
      saleDiscount: 20,
      saleEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      freeTrialDays: 14
    }
  },

  // ENTERPRISE PLAN
  {
    packageName: 'Enterprise Plan',
    description: 'Complete solution for large enterprises and recruitment agencies',
    packageType: 'enterprise',
    basePrice: 499,
    pricing: {
      jobSeeker: {
        monthly: 49.99,
        yearly: 499.99,
        discount: 17
      },
      employer: {
        monthly: 499,
        yearly: 4990,
        discount: 17
      }
    },
    limits: {
      jobSeeker: {
        monthlyApplications: -1, // unlimited
        favoriteJobs: -1, // unlimited
        cvProfiles: -1, // unlimited
        jobAlerts: -1 // unlimited
      },
      employer: {
        monthlyJobPostings: -1, // unlimited
        featuredJobs: -1, // unlimited
        candidateDatabase: true,
        analyticsAccess: true
      }
    },
    features: [
      'All Premium features',
      'Unlimited everything',
      'White-label solution',
      'API access',
      'Custom integrations',
      'Dedicated account manager',
      'Advanced analytics & reporting',
      'Bulk operations',
      'Custom branding',
      '24/7 priority support'
    ],
    features_config: {
      // Job Seeker Features
      canApplyUnlimited: true,
      hasPriorityListing: true,
      canSeeJobViewers: true,
      hasAdvancedFilters: true,
      canDirectMessage: true,
      hasJobAlerts: true,
      hasCVAnalytics: true,
      hasMultipleCVTemplates: true,
      
      // Employer Features
      canPostJobs: true,
      canViewApplications: true,
      canAccessAnalytics: true,
      canUseAdvancedSearch: true,
      prioritySupport: true,
      canPostFeaturedJobs: true,
      canAccessCandidateDatabase: true,
      hasBulkJobPosting: true,
      hasCompanyAnalytics: true,
      hasAPIAccess: true
    },
    promotions: {
      isOnSale: false,
      freeTrialDays: 30
    }
  }
];

const initSubscriptions = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing subscriptions
    await Subscription.deleteMany({});
    console.log('Cleared existing subscription plans');

    // Insert new subscription plans
    const insertedPlans = await Subscription.insertMany(subscriptionPlans);
    console.log(`Inserted ${insertedPlans.length} subscription plans:`);
    
    insertedPlans.forEach(plan => {
      console.log(`- ${plan.packageName} (${plan.packageType}): $${plan.basePrice}`);
    });

    console.log('\n✅ Subscription plans initialized successfully!');
    
    // Display pricing summary
    console.log('\n📊 PRICING SUMMARY:');
    console.log('┌─────────────┬─────────────────┬─────────────────┐');
    console.log('│ Plan        │ Job Seeker      │ Employer        │');
    console.log('├─────────────┼─────────────────┼─────────────────┤');
    
    insertedPlans.forEach(plan => {
      const jsMonthly = plan.pricing.jobSeeker.monthly === 0 ? 'Free' : `$${plan.pricing.jobSeeker.monthly}/mo`;
      const empMonthly = plan.pricing.employer.monthly === 0 ? 'Free' : `$${plan.pricing.employer.monthly}/mo`;
      console.log(`│ ${plan.packageType.padEnd(11)} │ ${jsMonthly.padEnd(15)} │ ${empMonthly.padEnd(15)} │`);
    });
    
    console.log('└─────────────┴─────────────────┴─────────────────┘');

  } catch (error) {
    console.error('Error initializing subscription plans:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the initialization
initSubscriptions(); 