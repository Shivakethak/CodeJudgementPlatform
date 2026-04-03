const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const User = require('../models/User');

exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Step 1: Get all accepted submissions for this user
    // We only care about distinct problems solved.
    const acceptedSubmissions = await Submission.find({ 
      userId, 
      verdict: 'Accepted' 
    });

    const solvedProblemIds = [...new Set(acceptedSubmissions.map(s => s.problemId.toString()))];

    // Step 2: Grab the difficulties of these solved problems
    const solvedProblems = await Problem.find({
      _id: { $in: solvedProblemIds }
    });

    const stats = {
      easy: 0,
      medium: 0,
      hard: 0,
      totalSolved: solvedProblems.length,
      isPremiumStatus: user.isPremiumStatus
    };

    solvedProblems.forEach(p => {
      if (p.difficulty === 'Easy') stats.easy++;
      if (p.difficulty === 'Medium') stats.medium++;
      if (p.difficulty === 'Hard') stats.hard++;
    });

    // Step 3: Get total counts universally to calculate percentages
    const totalEasy = await Problem.countDocuments({ difficulty: 'Easy' });
    const totalMedium = await Problem.countDocuments({ difficulty: 'Medium' });
    const totalHard = await Problem.countDocuments({ difficulty: 'Hard' });

    res.json({
      stats,
      totals: {
        easy: totalEasy,
        medium: totalMedium,
        hard: totalHard,
        all: totalEasy + totalMedium + totalHard
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
