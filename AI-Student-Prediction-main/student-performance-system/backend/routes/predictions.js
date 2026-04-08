const express = require('express');
const Student = require('../models/Student');
const Performance = require('../models/Performance');
const Prediction = require('../models/Prediction');
const { auth, optionalAuth, isAdminLike } = require('../middleware/auth');
const { calculateTotalScore, extractPredictionPayload, getRiskLevel } = require('../utils/scoring');
const { predictWithModel } = require('../utils/aiClient');

const router = express.Router();

router.get('/leaderboard', async (_req, res) => {
  try {
    const students = await Student.find({})
      .sort({ totalScore: -1, updatedAt: -1 })
      .limit(10)
      .select('studentName registerNo department totalScore examScore projectScore attendance');

    if (students.length > 0) {
      res.json({ records: students });
      return;
    }

    const legacyPerformances = await Performance.find({})
      .sort({ totalScore: -1, createdAt: -1 })
      .limit(10)
      .select('studentName registerNo department totalScore examScore projectScore attendance');

    res.json({ records: legacyPerformances });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/predict', optionalAuth, async (req, res) => {
  try {
    let sourceRecord = null;
    let payload = null;

    if (req.body.studentId) {
      if (!req.user) {
        res.status(401).json({ error: 'Please login to predict a stored student record.' });
        return;
      }

      if (!isAdminLike(req.user.role)) {
        res.status(403).json({ error: 'Only admins can predict stored student records.' });
        return;
      }

      sourceRecord = await Student.findById(req.body.studentId);
      if (!sourceRecord) {
        res.status(404).json({ error: 'Student record not found.' });
        return;
      }

      payload = extractPredictionPayload(sourceRecord);
    } else {
      payload = extractPredictionPayload(req.body);
    }

    const totalScore = calculateTotalScore(payload);
    const modelResult = await predictWithModel(payload);
    const predictionResult = {
      predictedScore: Number(modelResult.predictedScore.toFixed(2)),
      pass: Boolean(modelResult.pass),
    };
    const riskLevel = getRiskLevel(predictionResult);

    let savedPrediction = null;

    if (req.user) {
      savedPrediction = await Prediction.create({
        student: sourceRecord?._id || null,
        studentName: sourceRecord?.studentName || req.body.studentName || req.user.name || '',
        registerNo: sourceRecord?.registerNo || req.body.registerNo || '',
        department: sourceRecord?.department || req.body.department || '',
        yearOrSemester: sourceRecord?.yearOrSemester || req.body.yearOrSemester || '',
        input: {
          ...payload,
          totalScore,
        },
        predictedScore: predictionResult.predictedScore,
        pass: predictionResult.pass,
        riskLevel,
        generatedBy: req.user._id,
      });
    }

    if (sourceRecord) {
      sourceRecord.lastPrediction = {
        predictedScore: predictionResult.predictedScore,
        pass: predictionResult.pass,
        riskLevel,
        createdAt: new Date(),
      };
      await sourceRecord.save();
    }

    res.json({
      predictedScore: predictionResult.predictedScore,
      pass: predictionResult.pass,
      riskLevel,
      totalScore,
      predictionId: savedPrediction?._id || null,
      student: sourceRecord
        ? {
            id: sourceRecord._id,
            studentName: sourceRecord.studentName,
            registerNo: sourceRecord.registerNo,
            department: sourceRecord.department,
            yearOrSemester: sourceRecord.yearOrSemester,
          }
        : null,
    });
  } catch (error) {
    const message = error.response?.data?.error || error.message || 'Prediction failed.';
    res.status(500).json({ error: message });
  }
});

router.get('/predictions/history', auth, async (req, res) => {
  try {
    const query = ['admin', 'faculty'].includes(req.user.role) ? {} : { generatedBy: req.user._id };
    const predictions = await Prediction.find(query)
      .sort({ createdAt: -1 })
      .populate('generatedBy', 'name email role')
      .populate('student', 'studentName registerNo department yearOrSemester');

    res.json({ predictions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
