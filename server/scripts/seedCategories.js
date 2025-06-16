import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category.js';

dotenv.config();

const jobCategories = [
  // Technology & IT
  { categoryName: 'Software Development' },
  { categoryName: 'Web Development' },
  { categoryName: 'Mobile App Development' },
  { categoryName: 'Data Science' },
  { categoryName: 'Machine Learning' },
  { categoryName: 'Artificial Intelligence' },
  { categoryName: 'DevOps' },
  { categoryName: 'Cloud Computing' },
  { categoryName: 'Cybersecurity' },
  { categoryName: 'Database Administration' },
  { categoryName: 'Network Administration' },
  { categoryName: 'IT Support' },
  { categoryName: 'System Administration' },
  { categoryName: 'Quality Assurance' },
  { categoryName: 'UI/UX Design' },
  { categoryName: 'Product Management' },
  { categoryName: 'Technical Writing' },
  { categoryName: 'Game Development' },
  { categoryName: 'Blockchain Development' },
  { categoryName: 'IoT Development' },

  // Engineering
  { categoryName: 'Mechanical Engineering' },
  { categoryName: 'Electrical Engineering' },
  { categoryName: 'Civil Engineering' },
  { categoryName: 'Chemical Engineering' },
  { categoryName: 'Aerospace Engineering' },
  { categoryName: 'Industrial Engineering' },
  { categoryName: 'Biomedical Engineering' },
  { categoryName: 'Environmental Engineering' },
  { categoryName: 'Structural Engineering' },
  { categoryName: 'Automotive Engineering' },

  // Healthcare
  { categoryName: 'Nursing' },
  { categoryName: 'Medical Doctor' },
  { categoryName: 'Pharmacy' },
  { categoryName: 'Physiotherapy' },
  { categoryName: 'Dentistry' },
  { categoryName: 'Medical Technology' },
  { categoryName: 'Healthcare Administration' },
  { categoryName: 'Mental Health' },
  { categoryName: 'Veterinary' },
  { categoryName: 'Medical Research' },

  // Finance & Accounting
  { categoryName: 'Accounting' },
  { categoryName: 'Financial Analysis' },
  { categoryName: 'Investment Banking' },
  { categoryName: 'Risk Management' },
  { categoryName: 'Auditing' },
  { categoryName: 'Tax Consulting' },
  { categoryName: 'Insurance' },
  { categoryName: 'Financial Planning' },
  { categoryName: 'Banking' },
  { categoryName: 'Treasury Management' },

  // Sales & Marketing
  { categoryName: 'Digital Marketing' },
  { categoryName: 'Content Marketing' },
  { categoryName: 'Social Media Marketing' },
  { categoryName: 'SEO/SEM' },
  { categoryName: 'Sales Representative' },
  { categoryName: 'Business Development' },
  { categoryName: 'Account Management' },
  { categoryName: 'Market Research' },
  { categoryName: 'Brand Management' },
  { categoryName: 'Public Relations' },
  { categoryName: 'Event Marketing' },
  { categoryName: 'Email Marketing' },

  // Education
  { categoryName: 'Teaching' },
  { categoryName: 'Educational Administration' },
  { categoryName: 'Curriculum Development' },
  { categoryName: 'Training & Development' },
  { categoryName: 'Academic Research' },
  { categoryName: 'Educational Technology' },
  { categoryName: 'Student Services' },
  { categoryName: 'Online Education' },

  // Human Resources
  { categoryName: 'HR Generalist' },
  { categoryName: 'Recruitment' },
  { categoryName: 'Talent Acquisition' },
  { categoryName: 'HR Business Partner' },
  { categoryName: 'Compensation & Benefits' },
  { categoryName: 'Employee Relations' },
  { categoryName: 'Learning & Development' },
  { categoryName: 'HR Analytics' },

  // Design & Creative
  { categoryName: 'Graphic Design' },
  { categoryName: 'Web Design' },
  { categoryName: 'Interior Design' },
  { categoryName: 'Fashion Design' },
  { categoryName: 'Animation' },
  { categoryName: 'Video Production' },
  { categoryName: 'Photography' },
  { categoryName: 'Architecture' },
  { categoryName: 'Industrial Design' },
  { categoryName: 'Creative Writing' },

  // Manufacturing & Operations
  { categoryName: 'Manufacturing' },
  { categoryName: 'Quality Control' },
  { categoryName: 'Supply Chain' },
  { categoryName: 'Logistics' },
  { categoryName: 'Operations Management' },
  { categoryName: 'Production Planning' },
  { categoryName: 'Warehouse Management' },
  { categoryName: 'Procurement' },

  // Customer Service
  { categoryName: 'Customer Support' },
  { categoryName: 'Technical Support' },
  { categoryName: 'Customer Success' },
  { categoryName: 'Call Center' },
  { categoryName: 'Help Desk' },

  // Legal
  { categoryName: 'Corporate Law' },
  { categoryName: 'Criminal Law' },
  { categoryName: 'Employment Law' },
  { categoryName: 'Intellectual Property' },
  { categoryName: 'Contract Law' },
  { categoryName: 'Legal Research' },
  { categoryName: 'Paralegal' },

  // Agriculture & Environment
  { categoryName: 'Agriculture' },
  { categoryName: 'Environmental Science' },
  { categoryName: 'Forestry' },
  { categoryName: 'Sustainability' },
  { categoryName: 'Renewable Energy' },

  // Transportation & Logistics
  { categoryName: 'Transportation' },
  { categoryName: 'Delivery Services' },
  { categoryName: 'Freight Management' },
  { categoryName: 'Fleet Management' },

  // Hospitality & Tourism
  { categoryName: 'Hotel Management' },
  { categoryName: 'Restaurant Management' },
  { categoryName: 'Tourism' },
  { categoryName: 'Event Planning' },
  { categoryName: 'Travel Services' },

  // Media & Communications
  { categoryName: 'Journalism' },
  { categoryName: 'Broadcasting' },
  { categoryName: 'Communications' },
  { categoryName: 'Publishing' },
  { categoryName: 'Social Media Management' },

  // Construction & Real Estate
  { categoryName: 'Construction Management' },
  { categoryName: 'Real Estate' },
  { categoryName: 'Property Management' },
  { categoryName: 'Architecture & Planning' },

  // Retail & E-commerce
  { categoryName: 'Retail Management' },
  { categoryName: 'E-commerce' },
  { categoryName: 'Merchandising' },
  { categoryName: 'Store Operations' },

  // Government & Non-profit
  { categoryName: 'Government Administration' },
  { categoryName: 'Non-profit Management' },
  { categoryName: 'Public Policy' },
  { categoryName: 'Social Work' },

  // Consulting
  { categoryName: 'Management Consulting' },
  { categoryName: 'IT Consulting' },
  { categoryName: 'Strategy Consulting' },
  { categoryName: 'Business Consulting' },

  // Research & Development
  { categoryName: 'Research & Development' },
  { categoryName: 'Scientific Research' },
  { categoryName: 'Product Development' },
  { categoryName: 'Innovation Management' },

  // Entry Level & Internships
  { categoryName: 'Entry Level' },
  { categoryName: 'Internships' },
  { categoryName: 'Graduate Programs' },
  { categoryName: 'Part-time Jobs' },
  { categoryName: 'Remote Work' },
  { categoryName: 'Freelance' },
  { categoryName: 'Contract Work' },

  // Executive & Leadership
  { categoryName: 'Executive Leadership' },
  { categoryName: 'CEO/CTO/CFO' },
  { categoryName: 'Director Level' },
  { categoryName: 'Vice President' },
  { categoryName: 'General Management' }
];

const seedCategories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Insert job categories
    const categories = await Category.insertMany(jobCategories);
    console.log(`Successfully seeded ${categories.length} job categories`);

    // Display some of the created categories
    console.log('\nSample categories created:');
    categories.slice(0, 10).forEach((category, index) => {
      console.log(`${index + 1}. ${category.categoryName}`);
    });
    
    if (categories.length > 10) {
      console.log(`... and ${categories.length - 10} more categories`);
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    console.log('Category seeding completed successfully!');

  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

// Run the seeding
seedCategories(); 