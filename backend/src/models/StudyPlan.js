const mongoose = require('mongoose');

const StudyPlanSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true }, // e.g., 'top-150', 'leetcode-75', 'sql-50'
  title: { type: String, required: true },
  description: { type: String },
  problems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }]
});

module.exports = mongoose.model('StudyPlan', StudyPlanSchema);
