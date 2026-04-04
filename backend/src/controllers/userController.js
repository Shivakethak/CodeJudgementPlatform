const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const User = require('../models/User');
const WeeklyChallenge = require('../models/WeeklyChallenge');
const UserChallengeProgress = require('../models/UserChallengeProgress');

exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const acceptedSubmissions = await Submission.find({
      userId,
      verdict: 'Accepted'
    });

    const solvedProblemIds = [...new Set(acceptedSubmissions.map(s => s.problemId.toString()))];

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

    const totalEasy = await Problem.countDocuments({ difficulty: 'Easy' });
    const totalMedium = await Problem.countDocuments({ difficulty: 'Medium' });
    const totalHard = await Problem.countDocuments({ difficulty: 'Hard' });

    res.json({
      stats,
      solvedProblemIds,
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

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { displayName, tagline } = req.body || {};
    const updates = {};
    if (displayName !== undefined) {
      updates.displayName = String(displayName).trim().slice(0, 80);
    }
    if (tagline !== undefined) {
      updates.tagline = String(tagline).trim().slice(0, 160);
    }
    if (!Object.keys(updates).length) {
      return res.status(400).json({ message: 'Nothing to update' });
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const submissions = await Submission.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('problemId', 'title difficulty')
      .lean();

    const accepted = await Submission.find({ userId, verdict: 'Accepted' }).distinct('problemId');

    const byMonth = await Submission.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' }, d: { $dayOfMonth: '$createdAt' } },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      user,
      recentSubmissions: submissions,
      solvedCount: accepted.length,
      activityByDay: byMonth.slice(0, 60)
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('favoriteProblemIds').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    const problems = await Problem.find({ _id: { $in: user.favoriteProblemIds || [] } })
      .select('title difficulty topics stats companies')
      .lean();
    const enriched = problems.map(problemSummary);
    res.json(enriched);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.addFavorite = async (req, res) => {
  try {
    const { problemId } = req.params;
    if (!(await Problem.exists({ _id: problemId }))) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    await User.updateOne(
      { _id: req.user.id },
      { $addToSet: { favoriteProblemIds: problemId } }
    );
    const user = await User.findById(req.user.id).select('favoriteProblemIds').lean();
    res.json({ favoriteProblemIds: user.favoriteProblemIds });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const { problemId } = req.params;
    await User.updateOne(
      { _id: req.user.id },
      { $pull: { favoriteProblemIds: problemId } }
    );
    const user = await User.findById(req.user.id).select('favoriteProblemIds').lean();
    res.json({ favoriteProblemIds: user.favoriteProblemIds });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

function problemSummary(p) {
  const total = p.stats?.totalSubmissions || 0;
  const acc = p.stats?.acceptedSubmissions || 0;
  const acceptance = total > 0 ? Math.round((acc / total) * 100) : 52;
  return {
    ...p,
    acceptanceRate: acceptance
  };
}

exports.getSidebarSummary = async (req, res) => {
  try {
    const now = new Date();
    const challenge = await WeeklyChallenge.findOne({
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).select('_id title endDate problems').lean();

    let weekly = null;
    if (challenge && challenge.problems?.length) {
      const total = challenge.problems.length;
      let solved = 0;
      if (req.user?.id) {
        const accepted = await Submission.find({
          userId: req.user.id,
          verdict: 'Accepted',
          problemId: { $in: challenge.problems }
        }).distinct('problemId');
        solved = accepted.length;
      }
      weekly = {
        challengeId: challenge._id,
        title: challenge.title,
        solved,
        total,
        endsAt: challenge.endDate
      };
    }

    const user = req.user?.id ? await User.findById(req.user.id).select('streak').lean() : null;

    const trending = await Problem.aggregate([
      { $match: { companies: { $exists: true, $ne: [] } } },
      { $unwind: '$companies' },
      { $group: { _id: '$companies', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);

    const calendarMonth = {
      year: now.getFullYear(),
      month: now.getMonth(),
      streakDays: user?.streak?.count || 0,
      lastActive: user?.streak?.lastAcceptedDate || null
    };

    res.json({
      weekly,
      trendingCompanies: trending.map(t => ({ name: t._id, count: t.count })),
      calendar: calendarMonth
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
