const express = require('express');
const router = express.Router();
const { getPack } = require('../controllers/mockInterviewController');

router.get('/pack', getPack);

module.exports = router;
