const PREDICTION_FIELDS = [
  'examScore',
  'assignmentScore',
  'seminarScore',
  'projectScore',
  'sportsScore',
  'hackathonScore',
  'attendance',
];

const REQUIRED_STUDENT_FIELDS = ['studentName', 'registerNo', 'department', 'yearOrSemester'];

const parseNumericField = (value, fieldName) => {
  const parsedValue = Number(value);

  if (Number.isNaN(parsedValue)) {
    throw new Error(`${fieldName} must be a valid number.`);
  }

  return parsedValue;
};

const extractPredictionPayload = (source) => {
  const payload = {};

  for (const field of PREDICTION_FIELDS) {
    payload[field] = parseNumericField(source[field], field);
  }

  return payload;
};

const calculateTotalScore = ({
  examScore,
  assignmentScore,
  seminarScore,
  projectScore,
  sportsScore,
  hackathonScore,
}) => {
  const total =
    examScore * 0.4 +
    assignmentScore * 0.2 +
    projectScore * 0.2 +
    seminarScore * 0.1 +
    (sportsScore + hackathonScore) * 0.1;

  return Number(total.toFixed(2));
};

const buildStudentPayload = (source) => {
  for (const field of REQUIRED_STUDENT_FIELDS) {
    if (!source[field] || String(source[field]).trim() === '') {
      throw new Error(`${field} is required.`);
    }
  }

  const predictionPayload = extractPredictionPayload(source);

  return {
    studentName: String(source.studentName).trim(),
    registerNo: String(source.registerNo).trim(),
    email: source.email ? String(source.email).toLowerCase().trim() : '',
    department: String(source.department).trim(),
    yearOrSemester: String(source.yearOrSemester).trim(),
    ...predictionPayload,
    totalScore: calculateTotalScore(predictionPayload),
  };
};

const getRiskLevel = ({ predictedScore, pass }) => {
  if (!pass || predictedScore < 60) {
    return 'High Risk';
  }

  if (predictedScore < 75) {
    return 'Moderate Risk';
  }

  return 'Low Risk';
};

module.exports = {
  PREDICTION_FIELDS,
  buildStudentPayload,
  calculateTotalScore,
  extractPredictionPayload,
  getRiskLevel,
};
