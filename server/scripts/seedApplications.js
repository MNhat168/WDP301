import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import CVProfile from '../models/CVProfile.js';
import Role from '../models/Role.js';

dotenv.config();

const seedApplications = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get job seeker role
    const jobSeekerRole = await Role.findOne({ roleName: 'ROLE_JOBSEEKER' });
    if (!jobSeekerRole) {
      console.error('Job seeker role not found! Please run initRoles.js first');
      return;
    }

    // Get job seekers, jobs, and CV profiles
    const jobSeekers = await User.find({ roleId: jobSeekerRole._id });
    const jobs = await Job.find({ status: 'active' });
    const cvProfiles = await CVProfile.find({});

    if (jobSeekers.length === 0) {
      console.error('No job seekers found! Please run seedUsers.js first');
      return;
    }

    if (jobs.length === 0) {
      console.error('No jobs found! Please run seedJobs.js first');
      return;
    }

    if (cvProfiles.length === 0) {
      console.error('No CV profiles found! Please run seedCVProfiles.js first');
      return;
    }

    // Clear existing applications
    await Application.deleteMany({});
    console.log('Cleared existing applications');

    const applications = [];
    const statuses = ['pending', 'accepted', 'rejected', 'withdrawn', 'interview_scheduled'];
    const interviewStatuses = ['pending_selection', 'scheduled', 'completed', 'cancelled'];

    // Create applications - each job seeker applies to 2-5 random jobs
    for (const jobSeeker of jobSeekers) {
      const cvProfile = cvProfiles.find(cv => cv.userId.toString() === jobSeeker._id.toString());
      
      if (!cvProfile) {
        console.log(`No CV profile found for user ${jobSeeker.email}, skipping...`);
        continue;
      }

      // Random number of applications per job seeker (2-5)
      const numApplications = Math.floor(Math.random() * 4) + 2;
      
      // Shuffle jobs and take first numApplications
      const shuffledJobs = jobs.sort(() => 0.5 - Math.random());
      const jobsToApplyTo = shuffledJobs.slice(0, numApplications);

      for (const job of jobsToApplyTo) {
        const applicationDate = new Date(
          Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000 // Random date within last 30 days
        );

        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        const application = {
          jobId: job._id,
          userId: jobSeeker._id,
          cvProfileId: cvProfile._id,
          applicationDate: applicationDate,
          status: status
        };

        // Add interview details if status is interview_scheduled
        if (status === 'interview_scheduled') {
          const interviewDate = new Date(applicationDate);
          interviewDate.setDate(interviewDate.getDate() + Math.floor(Math.random() * 14) + 1); // 1-14 days after application

          application.interview = {
            scheduledSlot: {
              date: interviewDate,
              time: `${Math.floor(Math.random() * 8) + 9}:00` // 9:00 to 16:00
            },
            note: 'Technical interview and culture fit assessment',
            status: interviewStatuses[Math.floor(Math.random() * interviewStatuses.length)]
          };
        }

        applications.push(application);

        // Update job applicant count
        await Job.findByIdAndUpdate(job._id, { $inc: { applicantCount: 1 } });
      }
    }

    // Insert applications
    const insertedApplications = await Application.insertMany(applications);
    console.log(`Successfully seeded ${insertedApplications.length} job applications`);

    // Display summary
    console.log('\n📝 APPLICATIONS SUMMARY:');
    console.log('┌─────────────────────────────┬─────────────────────────────────────┬──────────────┬─────────────┐');
    console.log('│ Applicant Name              │ Job Title                           │ Status       │ Date        │');
    console.log('├─────────────────────────────┼─────────────────────────────────────┼──────────────┼─────────────┤');
    
    for (const app of insertedApplications.slice(0, 15)) { // Show first 15 applications
      const user = await User.findById(app.userId);
      const job = await Job.findById(app.jobId);
      const fullName = `${user.firstName} ${user.lastName}`;
      const dateStr = app.applicationDate.toISOString().split('T')[0];
      console.log(`│ ${fullName.padEnd(27)} │ ${job.title.padEnd(35)} │ ${app.status.padEnd(12)} │ ${dateStr.padEnd(11)} │`);
    }
    
    console.log('└─────────────────────────────┴─────────────────────────────────────┴──────────────┴─────────────┘');
    
    if (insertedApplications.length > 15) {
      console.log(`... and ${insertedApplications.length - 15} more applications`);
    }

    // Statistics
    const statusCounts = {};
    statuses.forEach(status => {
      statusCounts[status] = insertedApplications.filter(app => app.status === status).length;
    });

    const interviewApplications = insertedApplications.filter(app => app.status === 'interview_scheduled').length;

    console.log('\n📊 APPLICATION STATISTICS:');
    console.log(`Total Applications: ${insertedApplications.length}`);
    console.log(`Pending: ${statusCounts.pending}`);
    console.log(`Accepted: ${statusCounts.accepted}`);
    console.log(`Rejected: ${statusCounts.rejected}`);
    console.log(`Withdrawn: ${statusCounts.withdrawn}`);
    console.log(`Interview Scheduled: ${statusCounts.interview_scheduled}`);

    // Update user analytics
    for (const jobSeeker of jobSeekers) {
      const userApplications = insertedApplications.filter(
        app => app.userId.toString() === jobSeeker._id.toString()
      );
      
      if (userApplications.length > 0) {
        await User.findByIdAndUpdate(jobSeeker._id, {
          $inc: {
            'analytics.jobApplications': userApplications.length,
            'usageLimits.monthlyApplications': userApplications.length
          },
          $set: {
            'analytics.lastActivityDate': new Date()
          }
        });
      }
    }

    console.log('\n✅ Updated user analytics with application counts');

  } catch (error) {
    console.error('Error seeding applications:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    console.log('Application seeding completed successfully!');
  }
};

// Run the seeding
seedApplications(); 