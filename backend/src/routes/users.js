const express = require('express');
const router = express.Router();
const {
  getUserStats,
  getMe,
  getProfile,
  updateProfile,
  getFavorites,
  addFavorite,
  removeFavorite,
  getSidebarSummary
} = require('../controllers/userController');
const { protect, optionalAuth } = require('../middlewares/auth');

router.get('/stats', protect, getUserStats);
router.get('/me', protect, getMe);
router.get('/profile', protect, getProfile);
router.patch('/profile', protect, updateProfile);
router.get('/favorites', protect, getFavorites);
router.post('/favorites/:problemId', protect, addFavorite);
router.delete('/favorites/:problemId', protect, removeFavorite);
router.get('/sidebar-summary', optionalAuth, getSidebarSummary);

module.exports = router;
