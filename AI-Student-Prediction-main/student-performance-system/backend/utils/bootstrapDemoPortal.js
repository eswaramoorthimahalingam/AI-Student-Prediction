const User = require('../models/User');
const Student = require('../models/Student');
const { calculateTotalScore } = require('./scoring');

const demoAccounts = [
  {
    name: 'System Admin',
    email: 'admin@studentai.local',
    password: 'Admin@123',
    role: 'admin',
  },
  {
    name: 'Portal User',
    email: 'user@studentai.local',
    password: 'User@123',
    role: 'user',
  },
];

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
    attendance: 94,
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
    attendance: 90,
  },
  {
    studentName: 'Naveen Prakash',
    registerNo: 'AIDS24011',
    email: 'naveen.prakash@example.com',
    department: 'AI & DS',
    yearOrSemester: 'Semester 5',
    examScore: 61,
    assignmentScore: 66,
    seminarScore: 58,
    projectScore: 64,
    sportsScore: 8,
    hackathonScore: 10,
    attendance: 71,
  },
];

const shouldBootstrapDemoPortal = () => {
  if (process.env.ENABLE_DEMO_BOOTSTRAP === 'true') {
    return true;
  }

  if (process.env.DISABLE_DEMO_BOOTSTRAP === 'true') {
    return false;
  }

  return process.env.NODE_ENV !== 'production';
};

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

const bootstrapDemoPortal = async () => {
  if (!shouldBootstrapDemoPortal()) {
    return;
  }

  const [adminUser] = await Promise.all(demoAccounts.map((account) => ensureUser(account)));

  for (const student of demoStudents) {
    await Student.findOneAndUpdate(
      { registerNo: student.registerNo },
      {
        ...student,
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

  console.log('Demo portal accounts ready.');
  console.log('Admin login: admin@studentai.local / Admin@123');
  console.log('User login: user@studentai.local / User@123');
};

module.exports = {
  bootstrapDemoPortal,
};
