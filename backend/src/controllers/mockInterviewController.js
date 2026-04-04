const Problem = require('../models/Problem');

exports.getPack = async (req, res) => {
  try {
    const problems = await Problem.aggregate([
      { $match: { isPremium: false } },
      { $sample: { size: 5 } },
      { $project: { title: 1, difficulty: 1, topics: 1 } }
    ]);
    res.json({ problems, durationMinutes: 45 });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
