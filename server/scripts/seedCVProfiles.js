import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CVProfile from '../models/CVProfile.js';
import User from '../models/User.js';
import Role from '../models/Role.js';

dotenv.config();

const seedCVProfiles = async () => {
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

    // Get all job seeker users
    const jobSeekers = await User.find({ roleId: jobSeekerRole._id });
    if (jobSeekers.length === 0) {
      console.error('No job seeker users found! Please run seedUsers.js first');
      return;
    }

    // Clear existing CV profiles
    await CVProfile.deleteMany({});
    console.log('Cleared existing CV profiles');

    const cvTemplates = [
      {
        summary: 'Experienced software developer with 5+ years in full-stack development. Passionate about building scalable web applications and learning new technologies.',
        workExperience: [
          {
            company: 'ABC Tech Solutions',
            position: 'Senior Software Developer',
            startDate: new Date('2021-01-01'),
            endDate: new Date('2023-12-31'),
            description: 'Led development of microservices architecture, mentored junior developers, and improved system performance by 40%.',
            isCurrent: false
          },
          {
            company: 'XYZ Startup',
            position: 'Full-stack Developer',
            startDate: new Date('2019-06-01'),
            endDate: new Date('2020-12-31'),
            description: 'Developed React/Node.js applications, implemented CI/CD pipelines, and collaborated with cross-functional teams.',
            isCurrent: false
          }
        ],
        education: [
          {
            institution: 'Ho Chi Minh University of Technology',
            degree: 'Bachelor of Science',
            fieldOfStudy: 'Computer Science',
            startDate: new Date('2015-09-01'),
            endDate: new Date('2019-06-30'),
            gpa: 3.7
          }
        ],
        skills: [
          { skillName: 'JavaScript', level: 'expert', yearsOfExperience: 5 },
          { skillName: 'React.js', level: 'expert', yearsOfExperience: 4 },
          { skillName: 'Node.js', level: 'advanced', yearsOfExperience: 4 },
          { skillName: 'MongoDB', level: 'advanced', yearsOfExperience: 3 },
          { skillName: 'AWS', level: 'intermediate', yearsOfExperience: 2 }
        ],
        languages: [
          { language: 'Vietnamese', proficiency: 'native' },
          { language: 'English', proficiency: 'fluent' }
        ],
        visibility: 'public'
      },
      {
        summary: 'Creative UI/UX designer with strong background in user-centered design and modern design principles. Experienced in creating intuitive digital experiences.',
        workExperience: [
          {
            company: 'Design Studio Pro',
            position: 'UI/UX Designer',
            startDate: new Date('2020-03-01'),
            endDate: new Date('2024-01-01'),
            description: 'Designed user interfaces for mobile and web applications, conducted user research, and collaborated with development teams.',
            isCurrent: true
          }
        ],
        education: [
          {
            institution: 'Vietnam National University',
            degree: 'Bachelor of Arts',
            fieldOfStudy: 'Graphic Design',
            startDate: new Date('2016-09-01'),
            endDate: new Date('2020-06-30'),
            gpa: 3.5
          }
        ],
        skills: [
          { skillName: 'Figma', level: 'expert', yearsOfExperience: 4 },
          { skillName: 'Adobe Creative Suite', level: 'advanced', yearsOfExperience: 5 },
          { skillName: 'Sketch', level: 'advanced', yearsOfExperience: 3 },
          { skillName: 'Prototyping', level: 'advanced', yearsOfExperience: 4 },
          { skillName: 'User Research', level: 'intermediate', yearsOfExperience: 2 }
        ],
        languages: [
          { language: 'Vietnamese', proficiency: 'native' },
          { language: 'English', proficiency: 'conversational' }
        ],
        visibility: 'employers_only'
      },
      {
        summary: 'Data scientist with expertise in machine learning and statistical analysis. Passionate about extracting insights from complex datasets to drive business decisions.',
        workExperience: [
          {
            company: 'Analytics Corp',
            position: 'Data Scientist',
            startDate: new Date('2021-08-01'),
            endDate: new Date('2024-01-01'),
            description: 'Built predictive models, analyzed customer behavior data, and presented insights to stakeholders.',
            isCurrent: true
          },
          {
            company: 'Research Institute',
            position: 'Data Analyst Intern',
            startDate: new Date('2020-06-01'),
            endDate: new Date('2020-12-31'),
            description: 'Performed statistical analysis on research data and created data visualizations.',
            isCurrent: false
          }
        ],
        education: [
          {
            institution: 'University of Science Ho Chi Minh City',
            degree: 'Master of Science',
            fieldOfStudy: 'Data Science',
            startDate: new Date('2019-09-01'),
            endDate: new Date('2021-06-30'),
            gpa: 3.8
          },
          {
            institution: 'University of Science Ho Chi Minh City',
            degree: 'Bachelor of Science',
            fieldOfStudy: 'Mathematics',
            startDate: new Date('2015-09-01'),
            endDate: new Date('2019-06-30'),
            gpa: 3.6
          }
        ],
        skills: [
          { skillName: 'Python', level: 'expert', yearsOfExperience: 4 },
          { skillName: 'R', level: 'advanced', yearsOfExperience: 3 },
          { skillName: 'Machine Learning', level: 'advanced', yearsOfExperience: 3 },
          { skillName: 'SQL', level: 'advanced', yearsOfExperience: 4 },
          { skillName: 'Tableau', level: 'intermediate', yearsOfExperience: 2 }
        ],
        languages: [
          { language: 'Vietnamese', proficiency: 'native' },
          { language: 'English', proficiency: 'fluent' }
        ],
        certifications: [
          {
            name: 'Google Cloud Professional Data Engineer',
            issuer: 'Google Cloud',
            issueDate: new Date('2022-03-15'),
            expiryDate: new Date('2024-03-15'),
            credentialId: 'GCP-PDE-2022-001'
          }
        ],
        visibility: 'public'
      },
      {
        summary: 'Marketing professional with digital marketing expertise and strong analytical skills. Experienced in campaign management and brand development.',
        workExperience: [
          {
            company: 'Marketing Solutions',
            position: 'Digital Marketing Specialist',
            startDate: new Date('2020-01-01'),
            endDate: new Date('2024-01-01'),
            description: 'Managed social media campaigns, optimized SEO strategies, and analyzed marketing metrics.',
            isCurrent: true
          }
        ],
        education: [
          {
            institution: 'Foreign Trade University',
            degree: 'Bachelor of Business Administration',
            fieldOfStudy: 'Marketing',
            startDate: new Date('2016-09-01'),
            endDate: new Date('2020-06-30'),
            gpa: 3.4
          }
        ],
        skills: [
          { skillName: 'Digital Marketing', level: 'advanced', yearsOfExperience: 4 },
          { skillName: 'Google Analytics', level: 'advanced', yearsOfExperience: 4 },
          { skillName: 'SEO/SEM', level: 'advanced', yearsOfExperience: 3 },
          { skillName: 'Social Media Marketing', level: 'expert', yearsOfExperience: 4 },
          { skillName: 'Content Creation', level: 'advanced', yearsOfExperience: 4 }
        ],
        languages: [
          { language: 'Vietnamese', proficiency: 'native' },
          { language: 'English', proficiency: 'fluent' },
          { language: 'Chinese', proficiency: 'basic' }
        ],
        visibility: 'employers_only'
      },
      {
        summary: 'Fresh graduate in computer science with strong foundation in programming and eager to start career in software development.',
        workExperience: [
          {
            company: 'Tech Company XYZ',
            position: 'Software Developer Intern',
            startDate: new Date('2023-06-01'),
            endDate: new Date('2023-12-31'),
            description: 'Assisted in developing web applications, wrote unit tests, and participated in code reviews.',
            isCurrent: false
          }
        ],
        education: [
          {
            institution: 'Can Tho University',
            degree: 'Bachelor of Science',
            fieldOfStudy: 'Computer Science',
            startDate: new Date('2019-09-01'),
            endDate: new Date('2023-06-30'),
            gpa: 3.2
          }
        ],
        skills: [
          { skillName: 'Java', level: 'intermediate', yearsOfExperience: 2 },
          { skillName: 'HTML/CSS', level: 'intermediate', yearsOfExperience: 2 },
          { skillName: 'JavaScript', level: 'beginner', yearsOfExperience: 1 },
          { skillName: 'Git', level: 'intermediate', yearsOfExperience: 2 }
        ],
        languages: [
          { language: 'Vietnamese', proficiency: 'native' },
          { language: 'English', proficiency: 'conversational' }
        ],
        visibility: 'public'
      }
    ];

    // Create CV profiles for job seekers
    const cvProfiles = [];
    
    for (let i = 0; i < Math.min(cvTemplates.length, jobSeekers.length); i++) {
      cvProfiles.push({
        ...cvTemplates[i],
        userId: jobSeekers[i]._id,
        phoneNumber: jobSeekers[i].phone,
        description: cvTemplates[i].summary,
        isComplete: true,
        lastUpdated: new Date()
      });
    }

    // Create additional basic CV profiles for remaining job seekers
    for (let i = cvTemplates.length; i < jobSeekers.length; i++) {
      const user = jobSeekers[i];
      cvProfiles.push({
        userId: user._id,
        phoneNumber: user.phone,
        description: `Professional looking for opportunities in technology and innovation.`,
        summary: `Motivated individual with strong learning ability and passion for technology.`,
        workExperience: [],
        education: [
          {
            institution: 'Local University',
            degree: 'Bachelor',
            fieldOfStudy: 'Information Technology',
            startDate: new Date('2018-09-01'),
            endDate: new Date('2022-06-30'),
            gpa: 3.0
          }
        ],
        skills: [
          { skillName: 'Communication', level: 'advanced', yearsOfExperience: 2 },
          { skillName: 'Teamwork', level: 'advanced', yearsOfExperience: 2 },
          { skillName: 'Problem Solving', level: 'intermediate', yearsOfExperience: 1 }
        ],
        languages: [
          { language: 'Vietnamese', proficiency: 'native' },
          { language: 'English', proficiency: 'basic' }
        ],
        certifications: [],
        visibility: 'employers_only',
        isComplete: false,
        lastUpdated: new Date()
      });
    }

    // Insert CV profiles
    const insertedProfiles = await CVProfile.insertMany(cvProfiles);
    console.log(`Successfully seeded ${insertedProfiles.length} CV profiles`);

    // Display summary
    console.log('\n📄 CV PROFILES SUMMARY:');
    console.log('┌─────────────────────────────┬─────────────────────┬──────────────┬─────────────┐');
    console.log('│ Owner Name                  │ Email               │ Complete     │ Visibility  │');
    console.log('├─────────────────────────────┼─────────────────────┼──────────────┼─────────────┤');
    
    for (const profile of insertedProfiles) {
      const user = await User.findById(profile.userId);
      const fullName = `${user.firstName} ${user.lastName}`;
      const isComplete = profile.isComplete ? 'Yes' : 'No';
      console.log(`│ ${fullName.padEnd(27)} │ ${user.email.padEnd(19)} │ ${isComplete.padEnd(12)} │ ${profile.visibility.padEnd(11)} │`);
    }
    
    console.log('└─────────────────────────────┴─────────────────────┴──────────────┴─────────────┘');

    // Statistics
    const completeProfiles = insertedProfiles.filter(p => p.isComplete).length;
    const publicProfiles = insertedProfiles.filter(p => p.visibility === 'public').length;
    const employerOnlyProfiles = insertedProfiles.filter(p => p.visibility === 'employers_only').length;

    console.log('\n📊 CV STATISTICS:');
    console.log(`Total CV Profiles: ${insertedProfiles.length}`);
    console.log(`Complete Profiles: ${completeProfiles}`);
    console.log(`Public Profiles: ${publicProfiles}`);
    console.log(`Employer-Only Profiles: ${employerOnlyProfiles}`);

  } catch (error) {
    console.error('Error seeding CV profiles:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    console.log('CV profile seeding completed successfully!');
  }
};

// Run the seeding
seedCVProfiles(); 