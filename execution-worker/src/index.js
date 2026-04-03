require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Worker } = require('bullmq');
const Redis = require('ioredis');
const Submission = require('./models/Submission');
const Problem = require('./models/Problem');
const { executeCode } = require('./executor');

const app = express();
app.use(cors());
app.use(express.json());

// DB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/codejudge')
  .then(() => console.log('Worker connected to MongoDB'))
  .catch(err => console.error(err));

// Redis connection for BullMQ
const redisConnection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
});

// BullMQ Worker for background submissions
const worker = new Worker('submissions', async job => {
  const { submissionId, problemId, language, code } = job.data;
  console.log(`Processing submission ${submissionId}...`);

  try {
    const submission = await Submission.findById(submissionId);
    if (!submission) throw new Error('Submission not found');

    submission.status = 'Running';
    await submission.save();

    const problem = await Problem.findById(problemId);
    if (!problem) throw new Error('Problem not found');

    // Run against all test cases
    const result = await executeCode(language, code, problem.testCases);

    submission.status = 'Completed';
    submission.verdict = result.verdict;
    submission.executionTime = result.executionTime;
    submission.testCaseResults = result.testCaseResults;
    await submission.save();
    
    // Update Leaderboard immediately upon accepted solution
    if (result.verdict === 'Accepted') {
      const WeeklyChallenge = require('./models/WeeklyChallenge');
      const UserChallengeProgress = require('./models/UserChallengeProgress');
      const now = new Date();
      
      const activeChallenge = await WeeklyChallenge.findOne({
          startDate: { $lte: now },
          endDate: { $gte: now },
          problems: problemId
      });

      if (activeChallenge) {
          const progress = await UserChallengeProgress.findOne({ 
            userId: submission.userId, 
            challengeId: activeChallenge._id 
          });
          
          if (progress && !progress.solvedProblems.includes(problemId)) {
              progress.solvedProblems.push(problemId);
              progress.score += 10;
              progress.timeTaken += result.executionTime;
              await progress.save();
          }
      }
    }
    
    console.log(`Submission ${submissionId} finished: ${result.verdict}`);
  } catch (error) {
    console.error(`Error processing job ${job.id}:`, error.message);
    const errSubmission = await Submission.findById(submissionId);
    if (errSubmission) {
      errSubmission.status = 'Completed';
      errSubmission.verdict = 'System Error';
      await errSubmission.save();
    }
  }
}, { connection: redisConnection });

const { exec } = require('child_process');

// Pre-pull images needed for execution
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

// Express Server for direct Run triggers & health
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
