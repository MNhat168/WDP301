import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Role from '../models/Role.js';

dotenv.config();

const defaultRoles = [
  {
    roleName: 'ROLE_ADMIN',
    description: 'Administrator role with full access',
  },
  {
    roleName: 'ROLE_EMPLOYEE',
    description: 'Company employee role for posting jobs and managing applications',
  },
  {
    roleName: 'ROLE_JOBSEEKER',
    description: 'Job seeker role for applying to jobs and managing profile',
  }
];

const initializeRoles = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing roles
    await Role.deleteMany({});
    console.log('Cleared existing roles');

    // Insert default roles
    const roles = await Role.insertMany(defaultRoles);
    console.log('Default roles initialized:', roles);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('Error initializing roles:', error);
    process.exit(1);
  }
};

// Run the initialization
initializeRoles(); 