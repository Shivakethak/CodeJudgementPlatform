const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  isPremiumStatus: { type: Boolean, default: false },
  tokens: { type: Number, default: 100 },
  favoriteProblemIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
  streak: {
    count: { type: Number, default: 0 },
    lastAcceptedDate: { type: Date, default: null }
  },
  studyPlanProgress: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
