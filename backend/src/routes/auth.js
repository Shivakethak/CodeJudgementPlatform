const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: { message: 'Too many auth requests, try again later' },
});

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);

module.exports = router;
