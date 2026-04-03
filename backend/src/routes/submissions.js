const express = require('express');
const router = express.Router();
const { runCode, submitCode, getSubmission, getUserSubmissions } = require('../controllers/submissionController');
const { protect, optionalAuth } = require('../middlewares/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for submissions to prevent spam
const submitLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  message: { message: 'Too many submissions, please try again after a minute' }
});

router.post('/run', optionalAuth, submitLimiter, runCode);
router.post('/submit', protect, submitLimiter, submitCode);
router.get('/history', protect, getUserSubmissions);
router.get('/status/:id', optionalAuth, getSubmission);

module.exports = router;
