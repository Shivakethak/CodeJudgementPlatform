const express = require('express');
const router = express.Router();
const { listPlans, getPlanBySlug, updatePlanProgress } = require('../controllers/studyPlanController');
const { protect, optionalAuth } = require('../middlewares/auth');

router.get('/', optionalAuth, listPlans);
router.get('/:slug', getPlanBySlug);
router.put('/:slug/progress', protect, updatePlanProgress);

module.exports = router;
