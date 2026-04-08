const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null },
    studentName: { type: String, default: '', trim: true },
    registerNo: { type: String, default: '', trim: true },
    department: { type: String, default: '', trim: true },
    yearOrSemester: { type: String, default: '', trim: true },
    input: {
      examScore: { type: Number, required: true },
      assignmentScore: { type: Number, required: true },
      seminarScore: { type: Number, required: true },
      projectScore: { type: Number, required: true },
      sportsScore: { type: Number, required: true },
      hackathonScore: { type: Number, required: true },
      attendance: { type: Number, required: true },
      totalScore: { type: Number, required: true },
    },
    predictedScore: { type: Number, required: true },
    pass: { type: Boolean, required: true },
    riskLevel: { type: String, required: true },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prediction', PredictionSchema);
