const { redisClient } = require('../config/redis');

const DEFAULT_TTL = 120;

const key = {
  problemList: (params) => `problems:list:${JSON.stringify(params)}`,
  problemDetail: (problemId) => `problems:detail:${problemId}`,
  challengeLeaderboard: (challengeId) => `challenge:${challengeId}:leaderboard`,
};

const getJSON = async (cacheKey) => {
  const data = await redisClient.get(cacheKey);
  return data ? JSON.parse(data) : null;
};

const setJSON = async (cacheKey, value, ttlSeconds = DEFAULT_TTL) => {
  await redisClient.set(cacheKey, JSON.stringify(value), 'EX', ttlSeconds);
};

const del = async (cacheKey) => {
  await redisClient.del(cacheKey);
};

module.exports = {
  key,
  getJSON,
  setJSON,
  del,
  DEFAULT_TTL,
};
