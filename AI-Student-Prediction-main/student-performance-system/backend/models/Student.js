const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  studentName: { type: String, required: true, trim: true },
  registerNo: { type: String, required: true, trim: true, unique: true },
  email: { type: String, trim: true, lowercase: true, default: '' },
  department: { type: String, required: true, trim: true },
  yearOrSemester: { type: String, required: true, trim: true },
  examScore: { type: Number, required: true, min: 0 },
  assignmentScore: { type: Number, required: true, min: 0 },
  seminarScore: { type: Number, required: true, min: 0 },
  projectScore: { type: Number, required: true, min: 0 },
  sportsScore: { type: Number, required: true, min: 0 },
  hackathonScore: { type: Number, required: true, min: 0 },
  attendance: { type: Number, required: true, min: 0, max: 100 },
  totalScore: { type: Number, default: 0 },
  lastPrediction: {
    predictedScore: { type: Number, default: null },
    pass: { type: Boolean, default: null },
    riskLevel: { type: String, default: '' },
    createdAt: { type: Date, default: null },
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);

