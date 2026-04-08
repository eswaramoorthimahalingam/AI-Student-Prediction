const CATEGORY_ORDER = ['High', 'Medium', 'Low', 'Critical'];

export const CATEGORY_COLORS = {
  High: '#1f7a4c',
  Medium: '#c96d29',
  Low: '#127475',
  Critical: '#ba3a31',
};

export const RISK_COLORS = {
  'Low Risk': '#1f7a4c',
  'Moderate Risk': '#c96d29',
  'High Risk': '#ba3a31',
  'Awaiting Prediction': '#127475',
};

export const ACTIVITY_CONFIG = [
  { id: 'overall', label: 'Overall Activity', color: '#127475' },
  { id: 'academics', label: 'Academics', color: '#143642' },
  { id: 'project', label: 'Projects', color: '#c96d29' },
  { id: 'seminar', label: 'Seminars', color: '#6c7a89' },
  { id: 'sports', label: 'Sports', color: '#1f7a4c' },
  { id: 'hackathon', label: 'Hackathons', color: '#0f766e' },
];

const SCORE_BANDS = [
  { label: '0-49', min: 0, max: 49 },
  { label: '50-59', min: 50, max: 59 },
  { label: '60-69', min: 60, max: 69 },
  { label: '70-79', min: 70, max: 79 },
  { label: '80-89', min: 80, max: 89 },
  { label: '90-100', min: 90, max: 100 },
];

const safeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const round = (value, precision = 1) => Number(safeNumber(value).toFixed(precision));

const normalizeActivityValue = (value, max = 100) => {
  if (!max) {
    return 0;
  }

  return round((safeNumber(value) / max) * 100);
};

const extractLevelNumber = (value) => {
  if (!value) {
    return 0;
  }

  const match = String(value).match(/\d+/);
  return match ? Number(match[0]) : 0;
};

export const formatLevelLabel = (value) => {
  if (!value) {
    return 'Not assigned';
  }

  const raw = String(value).trim();
  if (!raw) {
    return 'Not assigned';
  }

  if (/semester/i.test(raw)) {
    return raw.replace(/\s+/g, ' ');
  }

  if (/year/i.test(raw)) {
    return raw.replace(/\s+/g, ' ');
  }

  const levelNumber = extractLevelNumber(raw);
  if (levelNumber > 0) {
    return `Level ${levelNumber}`;
  }

  return raw;
};

export const getStudentDisplayName = (student) => student?.studentName || student?.name || 'Student';

export const getStudentRegisterNo = (student) => student?.registerNo || student?.studentId || 'No register number';

export const getStudentRiskLevel = (student) => student?.lastPrediction?.riskLevel || 'Awaiting Prediction';

export const getStudentPredictedScore = (student) =>
  round(student?.lastPrediction?.predictedScore ?? student?.predictedScore ?? student?.totalScore ?? 0);

export const getStudentCategory = (student) => {
  const score = getStudentPredictedScore(student);

  if (score >= 85) {
    return 'High';
  }

  if (score >= 70) {
    return 'Medium';
  }

  if (score >= 60) {
    return 'Low';
  }

  return 'Critical';
};

export const getActivityScore = (student, activityId) => {
  const academics = round((safeNumber(student.examScore) + safeNumber(student.assignmentScore)) / 2);
  const project = round(student.projectScore);
  const seminar = round(student.seminarScore);
  const sports = normalizeActivityValue(student.sportsScore, 50);
  const hackathon = normalizeActivityValue(student.hackathonScore, 50);
  const overallActivity = round((academics + project + seminar + sports + hackathon + safeNumber(student.attendance)) / 6);

  switch (activityId) {
    case 'academics':
      return academics;
    case 'project':
      return project;
    case 'seminar':
      return seminar;
    case 'sports':
      return sports;
    case 'hackathon':
      return hackathon;
    default:
      return overallActivity;
  }
};

export const buildStudentInsights = (students = []) => {
  const baseRecords = students.map((student) => ({
    ...student,
    predictedScore: getStudentPredictedScore(student),
    category: getStudentCategory(student),
    riskLevel: getStudentRiskLevel(student),
    levelNumber: extractLevelNumber(student.yearOrSemester),
    levelLabel: formatLevelLabel(student.yearOrSemester),
    activityScores: Object.fromEntries(ACTIVITY_CONFIG.map((activity) => [activity.id, getActivityScore(student, activity.id)])),
  }));

  const rankedByScore = [...baseRecords].sort((left, right) => {
    if (right.predictedScore !== left.predictedScore) {
      return right.predictedScore - left.predictedScore;
    }

    return safeNumber(right.totalScore) - safeNumber(left.totalScore);
  });

  const departmentRanks = {};

  baseRecords.forEach((student) => {
    const departmentRecords = rankedByScore.filter((record) => record.department === student.department);
    departmentRanks[student._id] = departmentRecords.findIndex((record) => record._id === student._id) + 1;
  });

  return rankedByScore.map((student, index) => ({
    ...student,
    rank: index + 1,
    percentile: students.length ? round(((students.length - index - 1) / students.length) * 100) : 0,
    departmentRank: departmentRanks[student._id] || 0,
  }));
};

export const buildDepartmentChartData = (students = []) => {
  const byDepartment = students.reduce((accumulator, student) => {
    const key = student.department || 'Unassigned';
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});

  return Object.entries(byDepartment)
    .map(([department, count]) => ({ department, count }))
    .sort((left, right) => right.count - left.count);
};

export const buildRiskDistributionData = (students = []) => {
  const seeds = ['Low Risk', 'Moderate Risk', 'High Risk', 'Awaiting Prediction'];
  const counts = seeds.reduce((accumulator, label) => ({ ...accumulator, [label]: 0 }), {});

  students.forEach((student) => {
    counts[getStudentRiskLevel(student)] = (counts[getStudentRiskLevel(student)] || 0) + 1;
  });

  return seeds.map((label) => ({
    label,
    value: counts[label] || 0,
    color: RISK_COLORS[label],
  }));
};

export const buildCategoryDistributionData = (students = []) =>
  CATEGORY_ORDER.map((label) => ({
    label,
    value: students.filter((student) => getStudentCategory(student) === label).length,
    color: CATEGORY_COLORS[label],
  }));

export const buildScoreBandData = (students = []) =>
  SCORE_BANDS.map((band) => ({
    label: band.label,
    count: students.filter((student) => {
      const score = getStudentPredictedScore(student);
      return score >= band.min && score <= band.max;
    }).length,
  }));

export const buildAttendanceScatterData = (students = []) =>
  students.map((student) => ({
    name: getStudentDisplayName(student),
    registerNo: getStudentRegisterNo(student),
    score: getStudentPredictedScore(student),
    attendance: round(student.attendance),
    category: getStudentCategory(student),
  }));

export const buildActivityAverageData = (students = []) =>
  ACTIVITY_CONFIG.map((activity) => ({
    id: activity.id,
    label: activity.label,
    color: activity.color,
    average: students.length
      ? round(students.reduce((sum, student) => sum + getActivityScore(student, activity.id), 0) / students.length)
      : 0,
  }));

export const buildLevelTrendData = (students = []) => {
  const grouped = students.reduce((accumulator, student) => {
    const levelKey = student.levelNumber || extractLevelNumber(student.yearOrSemester) || 0;
    const key = String(levelKey || '0');

    if (!accumulator[key]) {
      accumulator[key] = {
        label: student.levelLabel || formatLevelLabel(student.yearOrSemester),
        levelNumber: levelKey,
        scores: [],
      };
    }

    accumulator[key].scores.push(getStudentPredictedScore(student));
    return accumulator;
  }, {});

  return Object.values(grouped)
    .sort((left, right) => left.levelNumber - right.levelNumber)
    .map((entry) => ({
      label: entry.label || 'Not assigned',
      averageScore: entry.scores.length ? round(entry.scores.reduce((sum, value) => sum + value, 0) / entry.scores.length) : 0,
      count: entry.scores.length,
    }));
};

export const buildDepartmentActivityData = (students = []) => {
  const departments = [...new Set(students.map((student) => student.department || 'Unassigned'))];

  return departments.map((department) => {
    const departmentStudents = students.filter((student) => (student.department || 'Unassigned') === department);
    return {
      department,
      academics: departmentStudents.length
        ? round(departmentStudents.reduce((sum, student) => sum + getActivityScore(student, 'academics'), 0) / departmentStudents.length)
        : 0,
      project: departmentStudents.length
        ? round(departmentStudents.reduce((sum, student) => sum + getActivityScore(student, 'project'), 0) / departmentStudents.length)
        : 0,
      seminar: departmentStudents.length
        ? round(departmentStudents.reduce((sum, student) => sum + getActivityScore(student, 'seminar'), 0) / departmentStudents.length)
        : 0,
      sports: departmentStudents.length
        ? round(departmentStudents.reduce((sum, student) => sum + getActivityScore(student, 'sports'), 0) / departmentStudents.length)
        : 0,
      hackathon: departmentStudents.length
        ? round(departmentStudents.reduce((sum, student) => sum + getActivityScore(student, 'hackathon'), 0) / departmentStudents.length)
        : 0,
    };
  });
};

export const buildDepartmentRiskHeatmap = (students = []) => {
  const departments = [...new Set(students.map((student) => student.department || 'Unassigned'))].sort();

  return departments.map((department) => {
    const departmentStudents = students.filter((student) => (student.department || 'Unassigned') === department);
    return {
      department,
      total: departmentStudents.length,
      counts: ['Low Risk', 'Moderate Risk', 'High Risk', 'Awaiting Prediction'].reduce(
        (accumulator, label) => ({
          ...accumulator,
          [label]: departmentStudents.filter((student) => getStudentRiskLevel(student) === label).length,
        }),
        {}
      ),
    };
  });
};

export const buildStudentComparison = (student, students = []) => {
  const departmentStudents = students.filter((record) => record.department === student.department);
  const overallAverage = students.length
    ? round(students.reduce((sum, record) => sum + getStudentPredictedScore(record), 0) / students.length)
    : 0;
  const departmentAverage = departmentStudents.length
    ? round(departmentStudents.reduce((sum, record) => sum + getStudentPredictedScore(record), 0) / departmentStudents.length)
    : 0;

  return [
    { label: 'Student Score', value: getStudentPredictedScore(student), color: '#127475' },
    { label: 'Department Avg', value: departmentAverage, color: '#c96d29' },
    { label: 'Overall Avg', value: overallAverage, color: '#143642' },
  ];
};

export const buildStudentRadarData = (student) => [
  { metric: 'Exam', value: round(student.examScore), full: 100 },
  { metric: 'Assignment', value: round(student.assignmentScore), full: 100 },
  { metric: 'Project', value: round(student.projectScore), full: 100 },
  { metric: 'Seminar', value: round(student.seminarScore), full: 100 },
  { metric: 'Attendance', value: round(student.attendance), full: 100 },
  { metric: 'Activities', value: round((normalizeActivityValue(student.sportsScore, 50) + normalizeActivityValue(student.hackathonScore, 50)) / 2), full: 100 },
];

export const buildStudentBarData = (student) => [
  { label: 'Exam', value: round(student.examScore), color: '#143642' },
  { label: 'Assignments', value: round(student.assignmentScore), color: '#127475' },
  { label: 'Project', value: round(student.projectScore), color: '#c96d29' },
  { label: 'Seminar', value: round(student.seminarScore), color: '#6c7a89' },
  { label: 'Sports', value: normalizeActivityValue(student.sportsScore, 50), color: '#1f7a4c' },
  { label: 'Hackathon', value: normalizeActivityValue(student.hackathonScore, 50), color: '#0f766e' },
];

export const buildStudentPredictionHistory = (student, predictions = []) =>
  predictions
    .filter((prediction) => {
      const predictionStudentId =
        typeof prediction.student === 'string' ? prediction.student : prediction.student?._id;
      return predictionStudentId === student._id || prediction.registerNo === student.registerNo;
    })
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));

export const buildAdminSummaryCards = (students = [], predictions = []) => {
  const predictedCount = students.filter((student) => Boolean(student.lastPrediction?.createdAt)).length;
  const averageScore = students.length
    ? round(students.reduce((sum, student) => sum + getStudentPredictedScore(student), 0) / students.length)
    : 0;
  const highRiskCount = students.filter((student) => getStudentRiskLevel(student) === 'High Risk').length;

  return [
    {
      label: 'Student Records',
      value: students.length,
      caption: 'Live student records available for CRUD and prediction.',
    },
    {
      label: 'Average Live Score',
      value: averageScore,
      caption: 'Latest predicted score or weighted score when prediction is pending.',
    },
    {
      label: 'Predictions Logged',
      value: predictions.length,
      caption: 'Prediction runs stored in the audit history.',
    },
    {
      label: 'High-Risk Students',
      value: highRiskCount,
      caption: 'Students currently marked high risk by the live model.',
    },
    {
      label: 'Prediction Coverage',
      value: students.length ? `${Math.round((predictedCount / students.length) * 100)}%` : '0%',
      caption: 'Share of student records that already have a saved prediction.',
    },
    {
      label: 'Departments Tracked',
      value: new Set(students.map((student) => student.department)).size,
      caption: 'Departments represented in the live student registry.',
    },
  ];
};

export const buildStudentManagementCards = (students = []) => {
  const averageScore = students.length
    ? round(students.reduce((sum, student) => sum + getStudentPredictedScore(student), 0) / students.length)
    : 0;
  const highRiskCount = students.filter((student) => getStudentRiskLevel(student) === 'High Risk').length;
  const pendingPredictionCount = students.filter((student) => !student.lastPrediction?.createdAt).length;

  return [
    {
      label: 'Records in View',
      value: students.length,
      caption: 'Students matching the current management filters.',
    },
    {
      label: 'Average Score',
      value: averageScore,
      caption: 'Live score across the visible student list.',
    },
    {
      label: 'High Risk',
      value: highRiskCount,
      caption: 'Students needing intervention first.',
    },
    {
      label: 'Awaiting Prediction',
      value: pendingPredictionCount,
      caption: 'Records that still need a first model run.',
    },
  ];
};

const PERSONAL_RISK_ORDER = ['Low Risk', 'Moderate Risk', 'High Risk'];

export const buildUserPredictionTrendData = (predictions = []) =>
  [...predictions]
    .sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt))
    .map((prediction, index) => ({
      label: new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short' }).format(new Date(prediction.createdAt)),
      run: index + 1,
      predictedScore: round(prediction.predictedScore),
      weightedScore: round(prediction.input?.totalScore),
      riskLevel: prediction.riskLevel || 'Moderate Risk',
    }));

export const buildUserRiskMixData = (predictions = []) => {
  const counts = PERSONAL_RISK_ORDER.reduce((accumulator, label) => ({ ...accumulator, [label]: 0 }), {});

  predictions.forEach((prediction) => {
    if (counts[prediction.riskLevel] !== undefined) {
      counts[prediction.riskLevel] += 1;
    }
  });

  return PERSONAL_RISK_ORDER.map((label) => ({
    label,
    value: counts[label],
    color: RISK_COLORS[label],
  }));
};

export const buildUserPerformanceCompositionData = (performances = []) => {
  if (!performances.length) {
    return [
      { label: 'Exam', value: 0, color: '#143642' },
      { label: 'Assignments', value: 0, color: '#127475' },
      { label: 'Project', value: 0, color: '#c96d29' },
      { label: 'Seminar', value: 0, color: '#6c7a89' },
      { label: 'Attendance', value: 0, color: '#1f7a4c' },
      { label: 'Activities', value: 0, color: '#0f766e' },
    ];
  }

  const totals = performances.reduce(
    (accumulator, performance) => ({
      examScore: accumulator.examScore + safeNumber(performance.examScore),
      assignmentScore: accumulator.assignmentScore + safeNumber(performance.assignmentScore),
      projectScore: accumulator.projectScore + safeNumber(performance.projectScore),
      seminarScore: accumulator.seminarScore + safeNumber(performance.seminarScore),
      attendance: accumulator.attendance + safeNumber(performance.attendance),
      activities:
        accumulator.activities +
        round((normalizeActivityValue(performance.sportsScore, 50) + normalizeActivityValue(performance.hackathonScore, 50)) / 2),
    }),
    {
      examScore: 0,
      assignmentScore: 0,
      projectScore: 0,
      seminarScore: 0,
      attendance: 0,
      activities: 0,
    }
  );

  const divisor = performances.length;

  return [
    { label: 'Exam', value: round(totals.examScore / divisor), color: '#143642' },
    { label: 'Assignments', value: round(totals.assignmentScore / divisor), color: '#127475' },
    { label: 'Project', value: round(totals.projectScore / divisor), color: '#c96d29' },
    { label: 'Seminar', value: round(totals.seminarScore / divisor), color: '#6c7a89' },
    { label: 'Attendance', value: round(totals.attendance / divisor), color: '#1f7a4c' },
    { label: 'Activities', value: round(totals.activities / divisor), color: '#0f766e' },
  ];
};

export const buildUserScoreComparisonData = (predictions = [], performances = []) => {
  const averagePredicted = predictions.length
    ? round(predictions.reduce((sum, prediction) => sum + safeNumber(prediction.predictedScore), 0) / predictions.length)
    : 0;
  const averageWeightedInput = predictions.length
    ? round(predictions.reduce((sum, prediction) => sum + safeNumber(prediction.input?.totalScore), 0) / predictions.length)
    : performances.length
      ? round(performances.reduce((sum, performance) => sum + safeNumber(performance.totalScore), 0) / performances.length)
      : 0;
  const bestPrediction = predictions.length
    ? round(Math.max(...predictions.map((prediction) => safeNumber(prediction.predictedScore))))
    : 0;

  return [
    { label: 'Average Predicted', value: averagePredicted, color: '#127475' },
    { label: 'Average Weighted', value: averageWeightedInput, color: '#c96d29' },
    { label: 'Best Prediction', value: bestPrediction, color: '#143642' },
  ];
};
