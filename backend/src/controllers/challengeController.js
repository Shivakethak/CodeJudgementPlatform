const WeeklyChallenge = require('../models/WeeklyChallenge');
const UserChallengeProgress = require('../models/UserChallengeProgress');
const cacheService = require('../services/cacheService');

exports.listContests = async (req, res) => {
  try {
    const now = new Date();
    const challenges = await WeeklyChallenge.find()
      .sort({ startDate: -1 })
      .limit(40)
      .select('title description slug kind startDate endDate problems penaltyPerWrong')
      .lean();

    const counts = await UserChallengeProgress.aggregate([
      { $group: { _id: '$challengeId', participants: { $sum: 1 } } }
    ]);
    const countMap = Object.fromEntries(counts.map(c => [c._id.toString(), c.participants]));

    const payload = challenges.map(c => ({
      ...c,
      isLive: new Date(c.startDate) <= now && now <= new Date(c.endDate),
      participantCount: countMap[c._id.toString()] || 0,
      problemCount: Array.isArray(c.problems) ? c.problems.length : 0
    }));

    res.json(payload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCurrentChallenge = async (req, res) => {
  try {
    const now = new Date();
    const challenge = await WeeklyChallenge.findOne({
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).populate('problems', 'title difficulty isPremium');

    if (!challenge) {
      return res.status(404).json({ message: 'No active challenge found' });
    }

    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getChallengeById = async (req, res) => {
  try {
    const challenge = await WeeklyChallenge.findById(req.params.id)
      .populate('problems', 'title difficulty isPremium');

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.joinChallenge = async (req, res) => {
  try {
    const challengeId = req.params.id;
    const userId = req.user.id;

    const challenge = await WeeklyChallenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    let progress = await UserChallengeProgress.findOne({ userId, challengeId });
    if (progress) {
      return res.status(400).json({ message: 'Already joined this challenge' });
    }

    progress = await UserChallengeProgress.create({
      userId,
      challengeId,
      solvedProblems: [],
      wrongAttempts: 0,
      timeTaken: 0,
      score: 0
    });

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const challengeId = req.params.id;
    const cacheKey = cacheService.key.challengeLeaderboard(challengeId);
    const cached = await cacheService.getJSON(cacheKey);
    if (cached) return res.json(cached);

    const leaderboard = await UserChallengeProgress.find({ challengeId })
      .populate('userId', 'email')
      .sort({ score: -1, timeTaken: 1 })
      .limit(100)
      .lean();

    await cacheService.setJSON(cacheKey, leaderboard, 60);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
