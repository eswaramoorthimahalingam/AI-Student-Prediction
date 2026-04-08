const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
const { calculateTotalScore } = require('../utils/scoring');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studentDB';

const demoStudents = [
  {
    studentName: 'Aarav Kumar',
    registerNo: 'CSE24001',
    email: 'aarav.kumar@example.com',
    department: 'Computer Science',
    yearOrSemester: 'Semester 6',
    examScore: 88,
    assignmentScore: 84,
    seminarScore: 79,
    projectScore: 91,
    sportsScore: 22,
    hackathonScore: 28,
  },
  {
    studentName: 'Diya Raman',
    registerNo: 'IT24008',
    email: 'diya.raman@example.com',
    department: 'Information Technology',
    yearOrSemester: 'Semester 4',
    examScore: 72,
    assignmentScore: 74,
    seminarScore: 70,
    projectScore: 76,
    sportsScore: 18,
    hackathonScore: 16,
  },
];

const ensureUser = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    existingUser.name = name;
    existingUser.role = role;
    existingUser.password = password;
    await existingUser.save();
    return existingUser;
  }

  return User.create({ name, email, password, role });
};

const seed = async () => {
  await mongoose.connect(MONGODB_URI);

  const adminUser = await ensureUser({
    name: 'System Admin',
    email: 'admin@studentai.local',
    password: 'Admin@123',
    role: 'admin',
  });

  await ensureUser({
    name: 'Portal User',
    email: 'user@studentai.local',
    password: 'User@123',
    role: 'user',
  });

  for (const student of demoStudents) {
    await Student.findOneAndUpdate(
      { registerNo: student.registerNo },
      {
        ...student,
        attendance: student.attendance || 90,
        totalScore: calculateTotalScore(student),
        createdBy: adminUser._id,
        updatedBy: adminUser._id,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      }
    );
  }

  console.log('Demo data seeded successfully.');
  console.log('Admin: admin@studentai.local / Admin@123');
  console.log('User: user@studentai.local / User@123');
  await mongoose.disconnect();
};

seed().catch(async (error) => {
  console.error('Failed to seed demo data:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});
