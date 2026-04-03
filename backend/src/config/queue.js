const { Queue } = require('bullmq');
const Redis = require('ioredis');

const redisConnection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
});

const submissionQueue = new Queue('submissions', { connection: redisConnection });

module.exports = { submissionQueue, redisConnection };
