import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../modules/identity/models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/strada?directConnection=true');
    console.log('Connected to DB for seeding...');

    await User.deleteMany({});

    const hashedAdminPassword = await bcrypt.hash('Admin123!', 10);
    const hashedAgentPassword = await bcrypt.hash('Agent123!', 10);
    const hashedUserPassword = await bcrypt.hash('User123!', 10);

    const users = [
      {
        fullName: 'Admin User',
        email: 'admin@strada.com',
        password: hashedAdminPassword,
        role: 'admin'
      },
      {
        fullName: 'Agent User',
        email: 'agent@strada.com',
        password: hashedAgentPassword,
        role: 'agent'
      },
      {
        fullName: 'Normal User',
        email: 'user@strada.com',
        password: hashedUserPassword,
        role: 'passenger'
      }
    ];

    await User.insertMany(users);
    console.log('Database seeded successfully with Admin, Agent, and Passenger!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedUsers();