const mongoose = require('mongoose');

const weeklyChallengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  problems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }]
}, { timestamps: true });

module.exports = mongoose.model('WeeklyChallenge', weeklyChallengeSchema);
