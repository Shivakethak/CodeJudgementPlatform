const express = require('express');
const router = express.Router();
const { listPosts, createPost } = require('../controllers/discussController');
const { protect } = require('../middlewares/auth');
const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Invalid input', errors: errors.array() });
  }
  next();
};

router.get('/', listPosts);
router.post(
  '/',
  protect,
  body('title').isString().isLength({ min: 3, max: 200 }),
  body('body').isString().isLength({ min: 10, max: 20000 }),
  validate,
  createPost
);

module.exports = router;
