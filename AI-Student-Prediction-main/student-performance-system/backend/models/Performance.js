const mongoose = require('mongoose');

const PerformanceSchema = new mongoose.Schema({
  studentId: { type: String, required: true, trim: true },
  studentName: { type: String, default: '', trim: true },
  registerNo: { type: String, default: '', trim: true },
  department: { type: String, default: '', trim: true },
  yearOrSemester: { type: String, default: '', trim: true },
  examScore: { type: Number, required: true, min: 0 },
  assignmentScore: { type: Number, required: true, min: 0 },
  seminarScore: { type: Number, required: true, min: 0 },
  projectScore: { type: Number, required: true, min: 0 },
  sportsScore: { type: Number, required: true, min: 0 },
  hackathonScore: { type: Number, required: true, min: 0 },
  attendance: { type: Number, required: true, min: 0, max: 100 },
  totalScore: { type: Number, default: 0 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Performance', PerformanceSchema);

