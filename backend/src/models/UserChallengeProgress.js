const mongoose = require('mongoose');

const userChallengeProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'WeeklyChallenge', required: true },
  solvedProblems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
  wrongAttempts: { type: Number, default: 0 },
  timeTaken: { type: Number, default: 0 },
  score: { type: Number, default: 0 }
}, { timestamps: true });

userChallengeProgressSchema.index({ userId: 1, challengeId: 1 }, { unique: true });
userChallengeProgressSchema.index({ challengeId: 1, score: -1, timeTaken: 1 });

module.exports = mongoose.model('UserChallengeProgress', userChallengeProgressSchema);
