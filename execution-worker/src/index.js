require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Worker } = require('bullmq');
const Redis = require('ioredis');
const Submission = require('./models/Submission');
const Problem = require('./models/Problem');
const WeeklyChallenge = require('./models/WeeklyChallenge');
const UserChallengeProgress = require('./models/UserChallengeProgress');
const User = require('./models/User');
const { executeCode } = require('./executor');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/codejudge')
  .then(() => console.log('Worker connected to MongoDB'))
  .catch(err => console.error(err));

const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

const updateStreakAndTokens = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const lastRaw = user.streak?.lastAcceptedDate ? new Date(user.streak.lastAcceptedDate) : null;
  let last = lastRaw ? new Date(lastRaw) : null;
  if (last) last.setUTCHours(0, 0, 0, 0);
  const dayMs = 86400000;
  if (!last) {
    user.streak = { count: 1, lastAcceptedDate: new Date() };
  } else if (today.getTime() === last.getTime()) {
    user.streak = user.streak || { count: 0 };
    user.streak.lastAcceptedDate = new Date();
  } else if (today.getTime() - last.getTime() === dayMs) {
    user.streak = user.streak || { count: 0 };
    user.streak.count = (user.streak.count || 0) + 1;
    user.streak.lastAcceptedDate = new Date();
  } else if (today.getTime() - last.getTime() > dayMs) {
    user.streak = { count: 1, lastAcceptedDate: new Date() };
  }
  user.tokens = (user.tokens || 0) + 3;
  await user.save();
};

const worker = new Worker('submissions', async job => {
  const { submissionId, problemId, language, code } = job.data;
  const start = Date.now();
  console.log(JSON.stringify({ event: 'submission.processing', submissionId }));

  try {
    const submission = await Submission.findById(submissionId);
    if (!submission) throw new Error('Submission not found');

    submission.status = 'Running';
    await submission.save();

    const problem = await Problem.findById(problemId);
    if (!problem) throw new Error('Problem not found');

    const result = await executeCode(language, code, problem.testCases);

    submission.status = 'Completed';
    submission.verdict = result.verdict;
    submission.executionTime = result.executionTime;
    submission.testCaseResults = result.testCaseResults;
    await submission.save();

    await Problem.updateOne(
      { _id: problemId },
      {
        $inc: {
          'stats.totalSubmissions': 1,
          ...(result.verdict === 'Accepted' ? { 'stats.acceptedSubmissions': 1 } : {}),
        }
      }
    );

    if (result.verdict === 'Accepted') {
      await updateStreakAndTokens(submission.userId);
    }

    const now = new Date();
    const activeChallenges = await WeeklyChallenge.find({
      startDate: { $lte: now },
      endDate: { $gte: now },
      problems: problemId,
    }).lean();

    const notifiedChallengeIds = new Set();
    const pidStr = problemId.toString();

    for (const ch of activeChallenges) {
      const progress = await UserChallengeProgress.findOne({
        userId: submission.userId,
        challengeId: ch._id,
      });
      if (!progress) continue;

      const inSolved = progress.solvedProblems.some(id => id.toString() === pidStr);

      if (result.verdict === 'Accepted' && !inSolved) {
        progress.solvedProblems.push(problemId);
        progress.timeTaken += result.executionTime || 0;
      } else if (result.verdict !== 'Accepted' && !inSolved) {
        progress.wrongAttempts = (progress.wrongAttempts || 0) + 1;
      }

      const penalty = typeof ch.penaltyPerWrong === 'number' ? ch.penaltyPerWrong : 1;
      progress.score = Math.max(
        0,
        progress.solvedProblems.length - penalty * (progress.wrongAttempts || 0)
      );
      await progress.save();
      notifiedChallengeIds.add(ch._id.toString());
    }

    const backendBase = process.env.BACKEND_URL || 'http://localhost:5000';
    const internalKey = process.env.INTERNAL_API_KEY || '';

    if (notifiedChallengeIds.size === 0) {
      await axios.post(
        `${backendBase}/api/submissions/internal/${submissionId}`,
        {},
        { headers: { 'x-internal-api-key': internalKey } }
      );
    } else {
      for (const cid of notifiedChallengeIds) {
        await axios.post(
          `${backendBase}/api/submissions/internal/${submissionId}/${cid}`,
          {},
          { headers: { 'x-internal-api-key': internalKey } }
        );
      }
    }

    console.log(JSON.stringify({
      event: 'submission.completed',
      submissionId,
      verdict: result.verdict,
      executionMs: Date.now() - start,
    }));
  } catch (error) {
    console.error(JSON.stringify({ event: 'submission.error', jobId: job.id, message: error.message }));
    const errSubmission = await Submission.findById(submissionId);
    if (errSubmission) {
      errSubmission.status = 'Completed';
      errSubmission.verdict = 'System Error';
      await errSubmission.save();
    }
  }
}, { connection: redisConnection });

const { exec } = require('child_process');

const REQUIRED_IMAGES = ['python:3.10-alpine', 'node:18-alpine', 'eclipse-temurin:17-alpine', 'gcc:latest'];
const pullImages = () => {
  console.log('Pre-pulling required Docker images...');
  REQUIRED_IMAGES.forEach(img => {
    exec(`docker pull ${img}`, (error, stdout) => {
      if (error) console.error(`Failed to pull ${img}:`, error.message);
      else console.log(`Successfully acquired ${img}`);
    });
  });
};

pullImages();

worker.on('ready', () => console.log('BullMQ Worker ready to process jobs'));

app.post('/api/worker/execute', async (req, res) => {
  try {
    const { language, code, testCases } = req.body;
    const result = await executeCode(language, code, testCases);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => res.status(200).json({ status: 'OK', service: 'execution-worker' }));

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Execution Worker HTTP server running on port ${PORT}`);
});
