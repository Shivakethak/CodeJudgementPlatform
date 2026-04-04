const express = require('express');
const router = express.Router();
const { getExplore } = require('../controllers/exploreController');

router.get('/', getExplore);

module.exports = router;
