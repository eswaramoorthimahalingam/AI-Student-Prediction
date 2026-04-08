const express = require('express');
const Student = require('../models/Student');
const { auth, authorizeAdminLike } = require('../middleware/auth');
const { buildStudentPayload } = require('../utils/scoring');

const router = express.Router();

router.get('/', auth, authorizeAdminLike, async (req, res) => {
  try {
    const { search = '', department = '' } = req.query;
    const query = {};

    if (department) {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { registerNo: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await Student.find(query)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email role');

    res.json({ students });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', auth, authorizeAdminLike, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('createdBy', 'name email role');
    if (!student) {
      res.status(404).json({ error: 'Student record not found.' });
      return;
    }

    res.json({ student });
  } catch (error) {
    res.status(400).json({ error: 'Invalid student id.' });
  }
});

router.post('/', auth, authorizeAdminLike, async (req, res) => {
  try {
    const studentPayload = buildStudentPayload(req.body);

    const existingStudent = await Student.findOne({ registerNo: studentPayload.registerNo });
    if (existingStudent) {
      res.status(409).json({ error: 'A student with this register number already exists.' });
      return;
    }

    const student = await Student.create({
      ...studentPayload,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    res.status(201).json({ student });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', auth, authorizeAdminLike, async (req, res) => {
  try {
    const studentPayload = buildStudentPayload(req.body);

    const duplicateStudent = await Student.findOne({
      registerNo: studentPayload.registerNo,
      _id: { $ne: req.params.id },
    });

    if (duplicateStudent) {
      res.status(409).json({ error: 'Another student already uses this register number.' });
      return;
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      {
        ...studentPayload,
        updatedBy: req.user._id,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!student) {
      res.status(404).json({ error: 'Student record not found.' });
      return;
    }

    res.json({ student });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Unable to update student.' });
  }
});

router.delete('/:id', auth, authorizeAdminLike, async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      res.status(404).json({ error: 'Student record not found.' });
      return;
    }

    res.json({ message: 'Student record deleted successfully.' });
  } catch (error) {
    res.status(400).json({ error: 'Invalid student id.' });
  }
});

module.exports = router;
