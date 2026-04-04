const { Queue } = require('bullmq');
const { redisClient } = require('./redis');

const redisConnection = redisClient;

const submissionQueue = new Queue('submissions', { connection: redisConnection });

module.exports = { submissionQueue, redisConnection };
