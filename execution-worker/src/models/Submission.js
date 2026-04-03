const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  language: { type: String, required: true },
  code: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Running', 'Completed'], default: 'Pending' },
  verdict: { type: String, default: null },
  executionTime: { type: Number, default: 0 },
  memory: { type: Number, default: 0 },
  testCaseResults: [{
    passed: Boolean,
    expectedOutput: String,
    actualOutput: String,
    error: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
