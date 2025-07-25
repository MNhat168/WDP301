import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Role from '../models/Role.js';

dotenv.config();

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get roles
    const adminRole = await Role.findOne({ roleName: 'ROLE_ADMIN' });
    const employerRole = await Role.findOne({ roleName: 'ROLE_EMPLOYEE' });
    const jobSeekerRole = await Role.findOne({ roleName: 'ROLE_JOBSEEKER' });

    if (!adminRole || !employerRole || !jobSeekerRole) {
      console.error('Roles not found! Please run initRoles.js first');
      return;
    }

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Hash password for admin
    const hashedAdminPassword = await bcrypt.hash('admin', 10);
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = [
      // Admin User
      {
        firstName: 'Admin',
        lastName: 'System',
        email: 'admin@easyjob.com',
        password: hashedAdminPassword,
        roleId: adminRole._id,
        username: 'admin',
        phone: '0901234567',
        isActive: true,
        status: 'active',
        city: 'Ho Chi Minh City',
        premiumFeatures: {
          hasUnlimitedApplications: true,
          hasPriorityListing: true,
          canSeeJobViewers: true,
          hasAdvancedFilters: true,
          canDirectMessage: true
        }
      },

      // Job Seekers
      {
        firstName: 'Nguyen',
        lastName: 'Van A',
        email: 'nguyenvana@gmail.com',
        password: hashedPassword,
        roleId: jobSeekerRole._id,
        username: 'nguyenvana',
        phone: '0912345678',
        isActive: true,
        status: 'active',
        city: 'Ho Chi Minh City',
        dateOfBirth: new Date('1995-03-15'),
        analytics: {
          profileViews: 25,
          cvDownloads: 8,
          jobApplications: 12,
          lastActivityDate: new Date(),
          monthlyViews: [
            { month: '2024-1', year: 2024, views: 10 },
            { month: '2024-2', year: 2024, views: 15 }
          ]
        }
      },
      {
        firstName: 'Tran',
        lastName: 'Thi B',
        email: 'tranthib@gmail.com',
        password: hashedPassword,
        roleId: jobSeekerRole._id,
        username: 'tranthib',
        phone: '0923456789',
        isActive: true,
        status: 'active',
        city: 'Ha Noi',
        dateOfBirth: new Date('1992-07-22'),
        analytics: {
          profileViews: 18,
          cvDownloads: 5,
          jobApplications: 8,
          lastActivityDate: new Date()
        }
      },
      {
        firstName: 'Le',
        lastName: 'Van C',
        email: 'levanc@gmail.com',
        password: hashedPassword,
        roleId: jobSeekerRole._id,
        username: 'levanc',
        phone: '0934567890',
        isActive: true,
        status: 'active',
        city: 'Da Nang',
        dateOfBirth: new Date('1988-11-30'),
        premiumFeatures: {
          hasUnlimitedApplications: true,
          hasPriorityListing: true,
          canSeeJobViewers: true,
          hasAdvancedFilters: true,
          canDirectMessage: true
        }
      },
      {
        firstName: 'Pham',
        lastName: 'Thi D',
        email: 'phamthid@gmail.com',
        password: hashedPassword,
        roleId: jobSeekerRole._id,
        username: 'phamthid',
        phone: '0945678901',
        isActive: true,
        status: 'active',
        city: 'Can Tho',
        dateOfBirth: new Date('1996-05-18')
      },
      {
        firstName: 'Hoang',
        lastName: 'Van E',
        email: 'hoangvane@gmail.com',
        password: hashedPassword,
        roleId: jobSeekerRole._id,
        username: 'hoangvane',
        phone: '0956789012',
        isActive: true,
        status: 'active',
        city: 'Hai Phong',
        dateOfBirth: new Date('1993-12-08')
      },

      // Employers
      {
        firstName: 'Tech',
        lastName: 'Corp CEO',
        email: 'ceo@techcorp.vn',
        password: hashedPassword,
        roleId: employerRole._id,
        username: 'techcorp_ceo',
        phone: '0967890123',
        isActive: true,
        status: 'active',
        city: 'Ho Chi Minh City',
        premiumFeatures: {
          hasUnlimitedApplications: true,
          hasPriorityListing: true,
          canSeeJobViewers: true,
          hasAdvancedFilters: true,
          canDirectMessage: true
        }
      },
      {
        firstName: 'Innovation',
        lastName: 'Labs HR',
        email: 'hr@innovationlabs.vn',
        password: hashedPassword,
        roleId: employerRole._id,
        username: 'innovation_hr',
        phone: '0978901234',
        isActive: true,
        status: 'active',
        city: 'Ha Noi'
      },
      {
        firstName: 'Startup',
        lastName: 'Hub Founder',
        email: 'founder@startuphub.vn',
        password: hashedPassword,
        roleId: employerRole._id,
        username: 'startup_founder',
        phone: '0989012345',
        isActive: true,
        status: 'active',
        city: 'Da Nang'
      },
      {
        firstName: 'Digital',
        lastName: 'Agency Manager',
        email: 'manager@digitalagency.vn',
        password: hashedPassword,
        roleId: employerRole._id,
        username: 'digital_manager',
        phone: '0990123456',
        isActive: true,
        status: 'active',
        city: 'Ho Chi Minh City'
      },
      {
        firstName: 'E-commerce',
        lastName: 'Platform HR',
        email: 'hr@ecommerce.vn',
        password: hashedPassword,
        roleId: employerRole._id,
        username: 'ecommerce_hr',
        phone: '0901234568',
        isActive: true,
        status: 'active',
        city: 'Ho Chi Minh City'
      },

      // More Job Seekers
      {
        firstName: 'Vo',
        lastName: 'Thi F',
        email: 'vothif@gmail.com',
        password: hashedPassword,
        roleId: jobSeekerRole._id,
        username: 'vothif',
        phone: '0912345679',
        isActive: true,
        status: 'active',
        city: 'Nha Trang',
        dateOfBirth: new Date('1994-08-25')
      },
      {
        firstName: 'Dang',
        lastName: 'Van G',
        email: 'dangvang@gmail.com',
        password: hashedPassword,
        roleId: jobSeekerRole._id,
        username: 'dangvang',
        phone: '0923456780',
        isActive: true,
        status: 'active',
        city: 'Vung Tau',
        dateOfBirth: new Date('1991-02-14')
      },
      {
        firstName: 'Bui',
        lastName: 'Thi H',
        email: 'buithih@gmail.com',
        password: hashedPassword,
        roleId: jobSeekerRole._id,
        username: 'buithih',
        phone: '0934567891',
        isActive: true,
        status: 'active',
        city: 'Hue',
        dateOfBirth: new Date('1997-09-03')
      },
      {
        firstName: 'Do',
        lastName: 'Van I',
        email: 'dovani@gmail.com',
        password: hashedPassword,
        roleId: jobSeekerRole._id,
        username: 'dovani',
        phone: '0945678902',
        isActive: true,
        status: 'active',
        city: 'Quy Nhon',
        dateOfBirth: new Date('1989-06-12')
      },
      {
        firstName: 'Ngo',
        lastName: 'Thi J',
        email: 'ngothij@gmail.com',
        password: hashedPassword,
        roleId: jobSeekerRole._id,
        username: 'ngothij',
        phone: '0956789013',
        isActive: true,
        status: 'active',
        city: 'Bien Hoa',
        dateOfBirth: new Date('1990-10-28')
      }
    ];

    // Insert users
    const insertedUsers = await User.insertMany(users);
    console.log(`Successfully seeded ${insertedUsers.length} users`);

    // Display summary
    console.log('\n👥 USER SUMMARY:');
    console.log('┌─────────────────┬─────────────────────────┬───────────────┐');
    console.log('│ Role            │ Email                   │ Username      │');
    console.log('├─────────────────┼─────────────────────────┼───────────────┤');
    
    for (const user of insertedUsers) {
      const role = await Role.findById(user.roleId);
      const roleDisplay = role.roleName.replace('ROLE_', '').toLowerCase();
      console.log(`│ ${roleDisplay.padEnd(15)} │ ${user.email.padEnd(23)} │ ${user.username.padEnd(13)} │`);
    }
    
    console.log('└─────────────────┴─────────────────────────┴───────────────┘');

    console.log('\n🔑 ADMIN CREDENTIALS:');
    console.log('Email: admin@easyjob.com');
    console.log('Password: admin');
    console.log('Username: admin');

    console.log('\n🔑 OTHER USER CREDENTIALS:');
    console.log('Password for all other users: password123');

  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    console.log('User seeding completed successfully!');
  }
};

// Run the seeding
seedUsers(); 