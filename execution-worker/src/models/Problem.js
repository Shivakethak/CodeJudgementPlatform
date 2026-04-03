const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
  isHidden: { type: Boolean, default: false }
});

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
  constraints: { type: [String], default: [] },
  examples: [{
    input: { type: String },
    output: { type: String },
    explanation: { type: String }
  }],
  testCases: [testCaseSchema],
  templates: {
    python: { type: String },
    java: { type: String },
    cpp: { type: String },
    c: { type: String },
    javascript: { type: String }
  },
  isPremium: { type: Boolean, default: false },
  solution: {
    code: { type: String },
    explanation: { type: String },
    timeComplexity: { type: String },
    spaceComplexity: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model('Problem', problemSchema);
