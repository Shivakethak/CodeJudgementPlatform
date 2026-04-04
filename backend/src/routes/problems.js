const express = require('express');
const router = express.Router();
const { getProblems, getProblemById, getInterviewCompanies } = require('../controllers/problemController');

router.get('/interview/companies', getInterviewCompanies);
router.get('/', getProblems);
router.get('/:id', getProblemById);

module.exports = router;
