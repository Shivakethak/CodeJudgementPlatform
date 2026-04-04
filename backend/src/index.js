require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const hpp = require('hpp');
const http = require('http');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { redisClient } = require('./config/redis');
const { initSocketServer, getIo } = require('./realtime/socketServer');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const { sanitizeRequest } = require('./middlewares/sanitize');
const logger = require('./utils/logger');
const WeeklyChallenge = require('./models/WeeklyChallenge');

const authRoutes = require('./routes/auth');
const problemRoutes = require('./routes/problems');
const submissionRoutes = require('./routes/submissions');
const userRoutes = require('./routes/users');
const challengeRoutes = require('./routes/challenges');
const studyPlanRoutes = require('./routes/studyPlans');
const discussRoutes = require('./routes/discuss');
const exploreRoutes = require('./routes/explore');
const mockInterviewRoutes = require('./routes/mockInterview');

const app = express();
const server = http.createServer(app);
initSocketServer(server);

app.use(cors({ origin: process.env.SOCKET_ORIGIN || true }));
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(sanitizeRequest);
app.use(hpp());
app.use(morgan('dev'));
app.disable('x-powered-by');

// Connect to DB
connectDB().then(() => {
  logger.info({ event: 'db.connected', message: 'DB Connection successful' });
});

// Health check
app.get('/health', async (req, res) => {
  const mongoState = mongoose.connection.readyState;
  const redisState = redisClient.status;
  res.status(200).json({
    status: mongoState === 1 && redisState === 'ready' ? 'OK' : 'DEGRADED',
    service: 'backend',
    uptime: process.uptime(),
    mongoState,
    redisState,
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/study-plans', studyPlanRoutes);
app.use('/api/discuss', discussRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/api/mock-interview', mockInterviewRoutes);

app.use(notFound);
app.use(errorHandler);

setInterval(async () => {
  try {
    const io = getIo();
    if (!io) return;
    const now = new Date();
    const live = await WeeklyChallenge.find({
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).select('_id endDate').lean();

    for (const challenge of live) {
      const remainingMs = Math.max(new Date(challenge.endDate).getTime() - now.getTime(), 0);
      const cid = challenge._id.toString();
      io.to(`challenge:${cid}`).emit('contest:timer', {
        challengeId: cid,
        remainingMs,
        serverTime: now.toISOString(),
      });
      io.to(`challenge:${cid}`).emit('contest:status', {
        challengeId: cid,
        status: remainingMs > 0 ? 'running' : 'ended',
      });
    }
  } catch (error) {
    logger.warn({ event: 'contest.timer.broadcast.failed', message: error.message });
  }
}, 2000);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info({ event: 'server.started', message: `Backend Server running on port ${PORT}` });
});
