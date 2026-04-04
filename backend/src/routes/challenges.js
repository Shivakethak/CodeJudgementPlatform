const express = require('express');
const router = express.Router();
const {
  listContests,
  getCurrentChallenge,
  getChallengeById,
  joinChallenge,
  getLeaderboard
} = require('../controllers/challengeController');
const { protect } = require('../middlewares/auth');

router.get('/current', getCurrentChallenge);
router.get('/', listContests);
router.get('/:id', getChallengeById);
router.post('/:id/join', protect, joinChallenge);
router.get('/:id/leaderboard', getLeaderboard);

module.exports = router;
