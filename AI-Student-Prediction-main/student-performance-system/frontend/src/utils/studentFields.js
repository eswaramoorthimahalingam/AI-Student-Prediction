export const scoreFieldConfig = [
  {
    name: 'examScore',
    label: 'Exam Score',
    helper: 'Main written examination score.',
    min: 0,
    max: 100,
    step: 1,
  },
  {
    name: 'assignmentScore',
    label: 'Assignment Score',
    helper: 'Internal assignment and coursework score.',
    min: 0,
    max: 100,
    step: 1,
  },
  {
    name: 'seminarScore',
    label: 'Seminar Score',
    helper: 'Seminar presentation contribution.',
    min: 0,
    max: 100,
    step: 1,
  },
  {
    name: 'projectScore',
    label: 'Project Score',
    helper: 'Project evaluation performance.',
    min: 0,
    max: 100,
    step: 1,
  },
  {
    name: 'sportsScore',
    label: 'Sports Score',
    helper: 'Sports and extracurricular activity score.',
    min: 0,
    max: 50,
    step: 1,
  },
  {
    name: 'hackathonScore',
    label: 'Hackathon Score',
    helper: 'Hackathon and innovation participation score.',
    min: 0,
    max: 50,
    step: 1,
  },
  {
    name: 'attendance',
    label: 'Attendance',
    helper: 'Attendance percentage.',
    min: 0,
    max: 100,
    step: 1,
  },
];

export const studentFormDefaults = {
  studentName: '',
  registerNo: '',
  email: '',
  department: '',
  yearOrSemester: '',
  examScore: 72,
  assignmentScore: 76,
  seminarScore: 70,
  projectScore: 82,
  sportsScore: 20,
  hackathonScore: 18,
  attendance: 88,
};

export const predictorDefaults = {
  ...studentFormDefaults,
};

export const calculateTotalScore = (values) => {
  const examScore = Number(values.examScore || 0);
  const assignmentScore = Number(values.assignmentScore || 0);
  const seminarScore = Number(values.seminarScore || 0);
  const projectScore = Number(values.projectScore || 0);
  const sportsScore = Number(values.sportsScore || 0);
  const hackathonScore = Number(values.hackathonScore || 0);

  return (
    examScore * 0.4 +
    assignmentScore * 0.2 +
    projectScore * 0.2 +
    seminarScore * 0.1 +
    (sportsScore + hackathonScore) * 0.1
  );
};

export const normalizeStudentPayload = (values) => {
  const payload = {
    studentName: values.studentName.trim(),
    registerNo: values.registerNo.trim(),
    email: values.email.trim(),
    department: values.department.trim(),
    yearOrSemester: values.yearOrSemester.trim(),
  };

  scoreFieldConfig.forEach((field) => {
    payload[field.name] = Number(values[field.name]);
  });

  return payload;
};
