const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const Performance = require('../models/Performance');
const Student = require('../models/Student');
const { auth, authorizeAdminLike } = require('../middleware/auth');
const { buildStudentPayload, calculateTotalScore, extractPredictionPayload } = require('../utils/scoring');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

// Get my performances (student/faculty)
router.get('/my-performances', auth, async (req, res) => {
  try {
    const performances = await Performance.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ performances });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add performance (student/faculty)
router.post('/performance', auth, async (req, res) => {
  try {
    const payload = extractPredictionPayload(req.body);
    const data = {
      ...payload,
      studentId: req.body.studentId || req.user.email,
      studentName: req.body.studentName || req.user.name,
      registerNo: req.body.registerNo || '',
      department: req.body.department || '',
      yearOrSemester: req.body.yearOrSemester || '',
      totalScore: calculateTotalScore(payload),
      userId: req.user._id,
    };

    const perf = await Performance.create(data);
    res.status(201).json({ performance: perf });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Import CSV (admin/faculty only)
router.post('/import-csv', auth, authorizeAdminLike, upload.single('csv'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Please upload a CSV file.' });
      return;
    }

    const results = [];
    fs.createReadStream(path.resolve(req.file.path))
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        for (const row of results) {
          const studentPayload = buildStudentPayload({
            studentName: row.studentName || row.name,
            registerNo: row.registerNo || row.studentId,
            email: row.email,
            department: row.department,
            yearOrSemester: row.yearOrSemester || row.semester || row.year,
            examScore: row.examScore,
            assignmentScore: row.assignmentScore,
            seminarScore: row.seminarScore,
            projectScore: row.projectScore,
            sportsScore: row.sportsScore,
            hackathonScore: row.hackathonScore,
            attendance: row.attendance,
          });

          await Student.findOneAndUpdate(
            { registerNo: studentPayload.registerNo },
            {
              ...studentPayload,
              createdBy: req.user._id,
              updatedBy: req.user._id,
            },
            {
              new: true,
              upsert: true,
              setDefaultsOnInsert: true,
              runValidators: true,
            }
          );
        }

        fs.unlinkSync(req.file.path);
        res.json({ imported: results.length });
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

