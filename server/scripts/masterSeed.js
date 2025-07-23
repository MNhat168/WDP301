import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const runScript = (scriptName) => {
  console.log(`\n🚀 Running ${scriptName}...`);
  console.log('='.repeat(50));
  
  try {
    const scriptPath = join(__dirname, scriptName);
    execSync(`node ${scriptPath}`, { stdio: 'inherit' });
    console.log(`✅ ${scriptName} completed successfully`);
  } catch (error) {
    console.error(`❌ ${scriptName} failed:`, error.message);
    throw error;
  }
};

const masterSeed = async () => {
  console.log('🌱 MASTER SEED SCRIPT');
  console.log('====================');
  console.log('This script will seed your database with comprehensive dummy data');
  console.log('⚠️  WARNING: This will clear all existing data!');
  
  try {
    // Connect to check database connection
    console.log('\n🔗 Checking database connection...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connection successful');
    await mongoose.disconnect();

    const scripts = [
      'initRoles.js',
      'initSubscriptions.js', 
      'seedCategories.js',
      'seedUsers.js',
      'seedCompanies.js',
      'seedJobs.js',
      'seedCVProfiles.js',
      'seedApplications.js'
    ];

    console.log('\n📋 Seeding Order:');
    scripts.forEach((script, index) => {
      console.log(`${index + 1}. ${script}`);
    });

    console.log('\n⏱️  Estimated time: 2-3 minutes');
    console.log('\n🚀 Starting seeding process...');

    const startTime = Date.now();

    // Run all scripts in order
    for (const script of scripts) {
      runScript(script);
    }

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    console.log('\n' + '='.repeat(70));
    console.log('🎉 MASTER SEED COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(70));
    console.log(`⏱️  Total time: ${duration} seconds`);
    
    console.log('\n📊 SEEDED DATA SUMMARY:');
    console.log('├─ Roles: Admin, Employee, Job Seeker');
    console.log('├─ Subscription Plans: Free, Basic, Premium, Enterprise');
    console.log('├─ Categories: 150+ job categories');
    console.log('├─ Users: 15+ users including admin');
    console.log('├─ Companies: 5 company profiles');
    console.log('├─ Jobs: 20+ job postings');
    console.log('├─ CV Profiles: Complete profiles for job seekers');
    console.log('└─ Applications: Job applications with various statuses');

    console.log('\n🔑 ADMIN ACCESS:');
    console.log('Email: admin@easyjob.com');
    console.log('Password: admin');

    console.log('\n🔑 TEST USERS:');
    console.log('All other users have password: password123');
    
    console.log('\n✨ Your EasyJob platform is now ready for testing!');

  } catch (error) {
    console.error('\n❌ MASTER SEED FAILED:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your MongoDB connection string in .env');
    console.log('2. Ensure MongoDB is running');
    console.log('3. Check file permissions');
    console.log('4. Run individual scripts to identify the issue');
    process.exit(1);
  }
};

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Process interrupted by user');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('\n❌ Uncaught Exception:', error);
  process.exit(1);
});

// Run the master seed
masterSeed(); 