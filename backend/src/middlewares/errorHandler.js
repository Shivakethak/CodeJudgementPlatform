const logger = require('../utils/logger');

const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Not Found - ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    statusCode,
  });

  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    statusCode,
  });
};

module.exports = { notFound, errorHandler };
