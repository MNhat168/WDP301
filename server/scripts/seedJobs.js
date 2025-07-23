import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from '../models/Job.js';
import CompanyProfile from '../models/CompanyProfile.js';
import Category from '../models/Category.js';

dotenv.config();

const seedJobs = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get companies and categories
    const companies = await CompanyProfile.find({ status: 'active' });
    const categories = await Category.find({});

    if (companies.length === 0) {
      console.error('No companies found! Please run seedCompanies.js first');
      return;
    }

    if (categories.length === 0) {
      console.error('No categories found! Please run seedCategories.js first');
      return;
    }

    // Clear existing jobs
    await Job.deleteMany({});
    console.log('Cleared existing jobs');

    // Helper function to get random category
    const getRandomCategory = () => categories[Math.floor(Math.random() * categories.length)];
    
    // Helper function to get random company
    const getRandomCompany = () => companies[Math.floor(Math.random() * companies.length)];

    const jobTemplates = [
      {
        title: 'Senior Backend Developer',
        description: `We are looking for a Senior Backend Developer to join our team. 

Responsibilities:
• Design and develop scalable backend systems
• Write clean, maintainable code using Node.js/Java/Python
• Work with databases (MongoDB, PostgreSQL)
• Implement RESTful APIs and microservices
• Collaborate with frontend developers and DevOps team
• Participate in code reviews and technical discussions

Requirements:
• 3+ years of backend development experience
• Strong knowledge of server-side technologies
• Experience with cloud platforms (AWS, Azure, GCP)
• Understanding of database design and optimization
• Familiarity with Docker and containerization
• Good communication skills in English`,
        experienceYears: 3,
        location: 'Ho Chi Minh City',
        minSalary: 1500,
        maxSalary: 3000,
        status: 'active',
        state: 'Ho Chi Minh',
        premiumFeatures: {
          isFeatured: true,
          isUrgentHiring: false,
          featuredUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      },
      {
        title: 'Frontend React Developer',
        description: `Join our frontend team to build amazing user interfaces!

Responsibilities:
• Develop responsive web applications using React.js
• Implement modern UI/UX designs
• Optimize applications for maximum speed and scalability
• Collaborate with backend developers to integrate APIs
• Write unit tests and maintain code quality
• Stay updated with latest frontend technologies

Requirements:
• 2+ years of React.js experience
• Strong knowledge of HTML, CSS, JavaScript
• Experience with Redux, React Router
• Familiar with modern build tools (Webpack, Vite)
• Understanding of RESTful APIs
• Experience with Git version control`,
        experienceYears: 2,
        location: 'Ha Noi',
        minSalary: 1000,
        maxSalary: 2200,
        status: 'active',
        state: 'Ha Noi'
      },
      {
        title: 'DevOps Engineer',
        description: `We need a DevOps Engineer to manage our infrastructure and deployment pipeline.

Responsibilities:
• Design and maintain CI/CD pipelines
• Manage cloud infrastructure (AWS/Azure)
• Implement monitoring and logging solutions
• Automate deployment processes
• Ensure system security and performance
• Troubleshoot production issues

Requirements:
• 2+ years of DevOps experience
• Experience with Docker, Kubernetes
• Knowledge of cloud platforms
• Familiar with monitoring tools (Prometheus, Grafana)
• Scripting skills (Bash, Python)
• Understanding of infrastructure as code`,
        experienceYears: 2,
        location: 'Da Nang',
        minSalary: 1200,
        maxSalary: 2500,
        status: 'active',
        state: 'Da Nang',
        premiumFeatures: {
          isSponsored: true,
          isUrgentHiring: true
        }
      },
      {
        title: 'UI/UX Designer',
        description: `Creative UI/UX Designer wanted to create beautiful and functional designs.

Responsibilities:
• Design user interfaces for web and mobile applications
• Create wireframes, prototypes, and mockups
• Conduct user research and usability testing
• Collaborate with developers to implement designs
• Maintain design systems and guidelines
• Present design concepts to stakeholders

Requirements:
• 2+ years of UI/UX design experience
• Proficiency in Figma, Sketch, Adobe Creative Suite
• Strong portfolio showcasing design skills
• Understanding of user-centered design principles
• Knowledge of HTML/CSS basics
• Excellent communication and presentation skills`,
        experienceYears: 2,
        location: 'Ho Chi Minh City',
        minSalary: 800,
        maxSalary: 1800,
        status: 'active',
        state: 'Ho Chi Minh'
      },
      {
        title: 'Data Scientist',
        description: `Data Scientist position to analyze large datasets and build ML models.

Responsibilities:
• Analyze complex datasets to extract business insights
• Build and deploy machine learning models
• Create data visualizations and reports
• Collaborate with business teams to understand requirements
• Clean and preprocess data for analysis
• Stay updated with latest data science techniques

Requirements:
• 2+ years of data science experience
• Strong knowledge of Python/R
• Experience with ML libraries (scikit-learn, TensorFlow)
• SQL and database knowledge
• Statistics and mathematics background
• Experience with data visualization tools`,
        experienceYears: 2,
        location: 'Ho Chi Minh City',
        minSalary: 1300,
        maxSalary: 2800,
        status: 'active',
        state: 'Ho Chi Minh'
      },
      {
        title: 'Project Manager',
        description: `Experienced Project Manager to lead software development projects.

Responsibilities:
• Plan and execute software development projects
• Coordinate between different teams and stakeholders
• Manage project timelines and budgets
• Facilitate agile ceremonies (standups, retrospectives)
• Track project progress and report to management
• Identify and mitigate project risks

Requirements:
• 3+ years of project management experience
• Experience with Agile/Scrum methodologies
• Strong leadership and communication skills
• PMP or Scrum Master certification preferred
• Experience in software development projects
• Proficiency in project management tools`,
        experienceYears: 3,
        location: 'Ha Noi',
        minSalary: 1400,
        maxSalary: 2600,
        status: 'active',
        state: 'Ha Noi'
      },
      {
        title: 'Mobile App Developer (React Native)',
        description: `React Native developer to build cross-platform mobile applications.

Responsibilities:
• Develop mobile applications using React Native
• Implement native features and APIs
• Optimize app performance and user experience
• Test applications on different devices and platforms
• Collaborate with designers and backend developers
• Publish apps to App Store and Google Play

Requirements:
• 2+ years of React Native experience
• Knowledge of iOS and Android development
• Experience with native modules and APIs
• Understanding of mobile UI/UX principles
• Familiar with app deployment processes
• Strong problem-solving skills`,
        experienceYears: 2,
        location: 'Da Nang',
        minSalary: 1100,
        maxSalary: 2300,
        status: 'active',
        state: 'Da Nang'
      },
      {
        title: 'Quality Assurance Engineer',
        description: `QA Engineer to ensure software quality through comprehensive testing.

Responsibilities:
• Design and execute test plans and test cases
• Perform manual and automated testing
• Identify, document, and track bugs
• Collaborate with development team on bug fixes
• Implement test automation frameworks
• Ensure product quality before release

Requirements:
• 2+ years of QA testing experience
• Knowledge of testing methodologies
• Experience with automation tools (Selenium, Cypress)
• Understanding of API testing
• Strong attention to detail
• Good analytical and problem-solving skills`,
        experienceYears: 2,
        location: 'Ho Chi Minh City',
        minSalary: 900,
        maxSalary: 1900,
        status: 'active',
        state: 'Ho Chi Minh'
      },
      {
        title: 'Digital Marketing Specialist',
        description: `Digital Marketing Specialist to drive online marketing campaigns.

Responsibilities:
• Plan and execute digital marketing campaigns
• Manage social media accounts and content
• Optimize websites for search engines (SEO)
• Run paid advertising campaigns (Google Ads, Facebook Ads)
• Analyze marketing metrics and ROI
• Create engaging content for various platforms

Requirements:
• 2+ years of digital marketing experience
• Knowledge of SEO, SEM, social media marketing
• Experience with analytics tools (Google Analytics)
• Content creation and copywriting skills
• Understanding of marketing automation
• Creative thinking and analytical mindset`,
        experienceYears: 2,
        location: 'Ha Noi',
        minSalary: 700,
        maxSalary: 1500,
        status: 'active',
        state: 'Ha Noi'
      },
      {
        title: 'Business Analyst',
        description: `Business Analyst to bridge the gap between business and technology.

Responsibilities:
• Analyze business processes and requirements
• Document functional and technical specifications
• Work with stakeholders to gather requirements
• Facilitate meetings and workshops
• Create process flows and use cases
• Support system implementation and testing

Requirements:
• 2+ years of business analysis experience
• Strong analytical and problem-solving skills
• Experience with requirement gathering techniques
• Knowledge of business process modeling
• Excellent communication and documentation skills
• Understanding of software development lifecycle`,
        experienceYears: 2,
        location: 'Da Nang',
        minSalary: 1000,
        maxSalary: 2000,
        status: 'active',
        state: 'Da Nang'
      }
    ];

    // Create jobs by assigning random companies and categories
    const jobs = [];
    const now = new Date();
    
    for (let i = 0; i < jobTemplates.length; i++) {
      const template = jobTemplates[i];
      const company = i < companies.length ? companies[i] : getRandomCompany();
      const category = getRandomCategory();
      
      // Create end date (30-90 days from now)
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 60) + 30);
      
      jobs.push({
        ...template,
        companyId: company._id,
        categoryId: category._id,
        endDate: endDate,
        startDate: now,
        applicantCount: Math.floor(Math.random() * 15), // Random applicant count
        analytics: {
          totalViews: Math.floor(Math.random() * 100) + 20,
          weeklyViews: Math.floor(Math.random() * 30) + 5,
          clickThroughRate: Math.random() * 10 + 2,
          applicationRate: Math.random() * 20 + 5,
          lastViewedDate: new Date(now - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000)
        }
      });
    }

    // Create additional jobs with variations
    for (let i = 0; i < 10; i++) {
      const baseTemplate = jobTemplates[Math.floor(Math.random() * jobTemplates.length)];
      const company = getRandomCompany();
      const category = getRandomCategory();
      
      const variations = [
        'Junior', 'Senior', 'Lead', 'Principal', 'Associate', 
        'Mid-level', 'Entry-level', 'Experienced'
      ];
      
      const randomVariation = variations[Math.floor(Math.random() * variations.length)];
      
      jobs.push({
        ...baseTemplate,
        title: `${randomVariation} ${baseTemplate.title}`,
        companyId: company._id,
        categoryId: category._id,
        minSalary: baseTemplate.minSalary + Math.floor(Math.random() * 500),
        maxSalary: baseTemplate.maxSalary + Math.floor(Math.random() * 1000),
        endDate: new Date(now.getTime() + Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000),
        applicantCount: Math.floor(Math.random() * 25),
        analytics: {
          totalViews: Math.floor(Math.random() * 150) + 10,
          weeklyViews: Math.floor(Math.random() * 40) + 3,
          clickThroughRate: Math.random() * 15 + 1,
          applicationRate: Math.random() * 25 + 3,
          lastViewedDate: new Date(now - Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000)
        }
      });
    }

    // Insert jobs
    const insertedJobs = await Job.insertMany(jobs);
    console.log(`Successfully seeded ${insertedJobs.length} jobs`);

    // Update company profiles with job references
    for (const job of insertedJobs) {
      await CompanyProfile.findByIdAndUpdate(
        job.companyId,
        { $push: { jobs: job._id } }
      );
    }

    // Display summary
    console.log('\n💼 JOBS SUMMARY:');
    console.log('┌─────────────────────────────────────┬─────────────────────────┬─────────────┬────────────┐');
    console.log('│ Job Title                           │ Company                 │ Location    │ Salary     │');
    console.log('├─────────────────────────────────────┼─────────────────────────┼─────────────┼────────────┤');
    
    for (const job of insertedJobs.slice(0, 15)) { // Show first 15 jobs
      const company = await CompanyProfile.findById(job.companyId);
      const salaryRange = `$${job.minSalary}-${job.maxSalary}`;
      console.log(`│ ${job.title.padEnd(35)} │ ${company.companyName.padEnd(23)} │ ${job.location.padEnd(11)} │ ${salaryRange.padEnd(10)} │`);
    }
    
    console.log('└─────────────────────────────────────┴─────────────────────────┴─────────────┴────────────┘');
    
    if (insertedJobs.length > 15) {
      console.log(`... and ${insertedJobs.length - 15} more jobs`);
    }

    // Status summary
    const featuredJobs = insertedJobs.filter(job => job.premiumFeatures?.isFeatured).length;
    const urgentJobs = insertedJobs.filter(job => job.premiumFeatures?.isUrgentHiring).length;
    const sponsoredJobs = insertedJobs.filter(job => job.premiumFeatures?.isSponsored).length;

    console.log('\n📊 JOB STATISTICS:');
    console.log(`Total Jobs: ${insertedJobs.length}`);
    console.log(`Featured Jobs: ${featuredJobs}`);
    console.log(`Urgent Hiring: ${urgentJobs}`);
    console.log(`Sponsored Jobs: ${sponsoredJobs}`);

  } catch (error) {
    console.error('Error seeding jobs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    console.log('Job seeding completed successfully!');
  }
};

// Run the seeding
seedJobs(); 