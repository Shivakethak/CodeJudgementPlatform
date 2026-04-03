const WeeklyChallenge = require('../models/WeeklyChallenge');
const UserChallengeProgress = require('../models/UserChallengeProgress');

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

    // Check if progress already exists
    let progress = await UserChallengeProgress.findOne({ userId, challengeId });
    if (progress) {
      return res.status(400).json({ message: 'Already joined this challenge' });
    }

    progress = await UserChallengeProgress.create({
      userId,
      challengeId,
      solvedProblems: [],
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
    // Rank users based on Problems solved descending, time taken ascending
    const leaderboard = await UserChallengeProgress.find({ challengeId })
      .populate('userId', 'email')
      .sort({ score: -1, timeTaken: 1 })
      .limit(50); // Get top 50
    
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Internal API to increment scores whenever a user gets a Submission "Accepted"
exports.incrementChallengeProgress = async (userId, problemId, executionTime) => {
    try {
      const now = new Date();
      // Check if problem belongs to the active challenge
      const activeChallenge = await WeeklyChallenge.findOne({
          startDate: { $lte: now },
          endDate: { $gte: now },
          problems: problemId
      });

      if (activeChallenge) {
          // Update the user's progress if they have joined
          const progress = await UserChallengeProgress.findOne({ userId, challengeId: activeChallenge._id });
          
          if (progress && !progress.solvedProblems.includes(problemId)) {
              progress.solvedProblems.push(problemId);
              progress.score += 10; // each problem is 10 points
              progress.timeTaken += executionTime;
              await progress.save();
          }
      }
    } catch (err) {
      console.error("Failed to increment challenge progress: ", err.message);
    }
};
