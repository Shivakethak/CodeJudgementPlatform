const mongoose = require('mongoose');

const MockInterviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
  timeTaken: { type: Number, default: 0 }, // seconds elapsed tracking
  score: { type: Number, default: 0 }, // correctly solved test cases or count
  maxScore: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('MockInterview', MockInterviewSchema);
