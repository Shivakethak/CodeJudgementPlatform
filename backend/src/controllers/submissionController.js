const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const UserChallengeProgress = require('../models/UserChallengeProgress');
const { submissionQueue } = require('../config/queue');
const axios = require('axios');
const cacheService = require('../services/cacheService');
const { getIo } = require('../realtime/socketServer');
const logger = require('../utils/logger');

const WORKER_URL = process.env.WORKER_URL || 'http://worker:4000';

exports.runCode = async (req, res) => {
  try {
    const requestStart = Date.now();
    const { problemId, language, code } = req.body;
    const problem = await Problem.findById(problemId).lean();
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    // For run code, we only use visible test cases
    const testCases = problem.testCases.filter(tc => !tc.isHidden);

    // Synchronous execution using worker's HTTP API
    const response = await axios.post(`${WORKER_URL}/api/worker/execute`, {
      language,
      code,
      testCases
    });

    logger.info({
      event: 'submission.run',
      problemId,
      language,
      executionMs: Date.now() - requestStart,
    });
    res.json(response.data);
  } catch (error) {
    if (error.response && error.response.data) {
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({ message: error.message });
  }
};

exports.submitCode = async (req, res) => {
  try {
    const { problemId, language, code } = req.body;
    const validProblem = await Problem.exists({ _id: problemId });
    if (!validProblem) return res.status(404).json({ message: 'Problem not found' });
    if (typeof code !== 'string' || code.length < 1 || code.length > 50000) {
      return res.status(400).json({ message: 'Invalid code payload' });
    }
    if (!['python', 'java', 'cpp', 'c', 'javascript', 'sql'].includes(language)) {
      return res.status(400).json({ message: 'Unsupported language' });
    }

    // Create pending submission
    const submission = await Submission.create({
      userId: req.user.id,
      problemId,
      language,
      code,
      status: 'Pending'
    });

    // Enqueue job via BullMQ
    await submissionQueue.add('execute-submission', {
      submissionId: submission._id,
      problemId,
      language,
      code
    });

    const io = getIo();
    if (io) {
      io.to(`user:${req.user.id}`).emit('submission:running', {
        submissionId: submission._id,
        problemId,
        status: 'Pending',
      });
    }

    logger.info({
      event: 'submission.queued',
      submissionId: submission._id.toString(),
      userId: req.user.id,
      problemId,
    });

    res.status(201).json({
      message: 'Submission queued successfully',
      jobId: submission._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id).lean();
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    
    res.json({ submission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserSubmissions = async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip = Math.max(parseInt(req.query.skip, 10) || 0, 0);
    const query = { userId: req.user.id };
    if (req.query.problemId) query.problemId = req.query.problemId;

    const submissions = await Submission.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('problemId', 'title')
      .lean();
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.notifySubmissionUpdate = async (req, res) => {
  try {
    if (req.headers['x-internal-api-key'] !== process.env.INTERNAL_API_KEY) {
      return res.status(401).json({ message: 'Unauthorized internal request' });
    }

    const { submissionId, challengeId } = req.params;
    const submission = await Submission.findById(submissionId).lean();
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    const io = getIo();
    if (io) {
      io.to(`user:${submission.userId.toString()}`).emit('submission:completed', {
        submissionId,
        submission,
      });
      if (challengeId) {
        await cacheService.del(cacheService.key.challengeLeaderboard(challengeId));
        const leaderboard = await UserChallengeProgress.find({ challengeId })
          .populate('userId', 'email')
          .sort({ score: -1, timeTaken: 1 })
          .limit(50)
          .lean();
        io.to(`challenge:${challengeId}`).emit('leaderboard:updated', {
          challengeId,
          leaderboard,
        });
      }
    }

    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
