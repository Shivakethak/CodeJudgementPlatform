const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const { submissionQueue } = require('../config/queue');
const axios = require('axios');

exports.runCode = async (req, res) => {
  try {
    const { problemId, language, code } = req.body;
    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    // For run code, we only use visible test cases
    const testCases = problem.testCases.filter(tc => !tc.isHidden);

    // Synchronous execution using worker's HTTP API
    const response = await axios.post(`http://worker:4000/api/worker/execute`, {
      language,
      code,
      testCases
    });

    res.json(response.data);
  } catch (error) {
    if (error.response && error.response.data) {
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({ message: error.message });
  }
};

exports.submitCode = async (req, res) => {
  try {
    const { problemId, language, code } = req.body;
    
    // Create pending submission
    const submission = await Submission.create({
      userId: req.user.id,
      problemId,
      language,
      code,
      status: 'Pending'
    });

    // Enqueue job via BullMQ
    await submissionQueue.add('execute-submission', {
      submissionId: submission._id,
      problemId,
      language,
      code
    });

    res.status(201).json({
      message: 'Submission queued successfully',
      jobId: submission._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    
    res.json({ submission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ userId: req.user.id })
                                        .sort({ createdAt: -1 })
                                        .populate('problemId', 'title');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
