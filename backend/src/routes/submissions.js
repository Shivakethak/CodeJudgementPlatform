const express = require('express');
const router = express.Router();
const { runCode, submitCode, getSubmission, getUserSubmissions, notifySubmissionUpdate } = require('../controllers/submissionController');
const { protect, optionalAuth } = require('../middlewares/auth');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

// Rate limiting for submissions to prevent spam
const submitLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 6, // limit each IP to 6 requests per windowMs
  message: { message: 'Too many submissions, please try again after a minute' }
});

const runLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 15,
  message: { message: 'Too many runs, please try again after a minute' }
});

const submissionPayloadValidation = [
  body('problemId').isMongoId(),
  body('language').isIn(['python', 'java', 'cpp', 'c', 'javascript', 'sql']),
  body('code').isString().isLength({ min: 1, max: 50000 }),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Invalid input', errors: errors.array() });
  }
  next();
};

router.post('/run', optionalAuth, runLimiter, submissionPayloadValidation, validate, runCode);
router.post('/submit', protect, submitLimiter, submissionPayloadValidation, validate, submitCode);
router.get('/history', protect, getUserSubmissions);
router.get('/status/:id', optionalAuth, getSubmission);
router.post('/internal/:submissionId', notifySubmissionUpdate);
router.post('/internal/:submissionId/:challengeId', notifySubmissionUpdate);

module.exports = router;
