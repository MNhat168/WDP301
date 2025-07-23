import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CompanyProfile from '../models/CompanyProfile.js';
import User from '../models/User.js';
import Role from '../models/Role.js';

dotenv.config();

const seedCompanies = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get employer role
    const employerRole = await Role.findOne({ roleName: 'ROLE_EMPLOYEE' });
    if (!employerRole) {
      console.error('Employer role not found! Please run initRoles.js first');
      return;
    }

    // Get all employer users
    const employers = await User.find({ roleId: employerRole._id });
    if (employers.length === 0) {
      console.error('No employer users found! Please run seedUsers.js first');
      return;
    }

    // Clear existing company profiles
    await CompanyProfile.deleteMany({});
    console.log('Cleared existing company profiles');

    const companies = [
      {
        companyName: 'TechCorp Vietnam',
        aboutUs: 'Leading technology company specializing in software development, AI, and cloud solutions. We are committed to innovation and excellence in delivering cutting-edge technology solutions for businesses worldwide.',
        address: '123 Nguyen Hue Street, District 1, Ho Chi Minh City',
        url: 'https://techcorp.vn',
        status: 'active'
      },
      {
        companyName: 'Innovation Labs',
        aboutUs: 'We are a research and development company focused on emerging technologies including blockchain, IoT, and machine learning. Our mission is to transform ideas into reality.',
        address: '456 Ba Trieu Street, Hoan Kiem District, Ha Noi',
        url: 'https://innovationlabs.vn',
        status: 'active'
      },
      {
        companyName: 'Startup Hub',
        aboutUs: 'A dynamic startup incubator and accelerator helping entrepreneurs build successful companies. We provide funding, mentorship, and resources for innovative startups.',
        address: '789 Tran Phu Street, Hai Chau District, Da Nang',
        url: 'https://startuphub.vn',
        status: 'active'
      },
      {
        companyName: 'Digital Agency Solutions',
        aboutUs: 'Full-service digital marketing agency providing web development, SEO, social media marketing, and digital strategy consulting for businesses of all sizes.',
        address: '321 Le Loi Street, District 3, Ho Chi Minh City',
        url: 'https://digitalagency.vn',
        status: 'active'
      },
      {
        companyName: 'E-commerce Platform Inc',
        aboutUs: 'Leading e-commerce platform provider in Southeast Asia. We help businesses create, manage, and scale their online stores with our comprehensive platform and services.',
        address: '654 Vo Van Tan Street, District 3, Ho Chi Minh City',
        url: 'https://ecommerce.vn',
        status: 'active'
      }
    ];

    // Assign companies to employers
    const companyProfiles = [];
    for (let i = 0; i < Math.min(companies.length, employers.length); i++) {
      companyProfiles.push({
        ...companies[i],
        userId: employers[i]._id,
        jobs: [] // Will be populated when jobs are seeded
      });
    }

    // Insert company profiles
    const insertedCompanies = await CompanyProfile.insertMany(companyProfiles);
    console.log(`Successfully seeded ${insertedCompanies.length} company profiles`);

    // Display summary
    console.log('\n🏢 COMPANY PROFILES:');
    console.log('┌───────────────────────────────┬─────────────────────────────────────┬──────────────┐');
    console.log('│ Company Name                  │ Owner Email                         │ Status       │');
    console.log('├───────────────────────────────┼─────────────────────────────────────┼──────────────┤');
    
    for (const company of insertedCompanies) {
      const owner = await User.findById(company.userId);
      console.log(`│ ${company.companyName.padEnd(29)} │ ${owner.email.padEnd(35)} │ ${company.status.padEnd(12)} │`);
    }
    
    console.log('└───────────────────────────────┴─────────────────────────────────────┴──────────────┘');

  } catch (error) {
    console.error('Error seeding company profiles:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    console.log('Company seeding completed successfully!');
  }
};

// Run the seeding
seedCompanies(); 