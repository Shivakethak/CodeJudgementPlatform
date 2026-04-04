const mongoose = require('mongoose');

const weeklyChallengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  slug: { type: String, default: '' },
  kind: { type: String, enum: ['weekly', 'contest'], default: 'weekly' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  problems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
  penaltyPerWrong: { type: Number, default: 1, min: 0 }
}, { timestamps: true });

module.exports = mongoose.model('WeeklyChallenge', weeklyChallengeSchema);
