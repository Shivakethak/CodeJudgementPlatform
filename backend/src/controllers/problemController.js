const Problem = require('../models/Problem');

exports.getProblems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Construct filter object
    const filter = {};
    if (req.query.difficulty && req.query.difficulty !== 'All') {
      filter.difficulty = req.query.difficulty;
    }
    if (req.query.topic && req.query.topic !== 'All') {
      filter.topics = req.query.topic;
    }
    if (req.query.company && req.query.company !== 'All') {
      filter.companies = req.query.company;
    }
    if (req.query.search) {
      filter.title = { $regex: req.query.search, $options: 'i' };
    }

    const problems = await Problem.find(filter)
      .select('-testCases -templates -solution') // hide internal metadata for list
      .skip(skip)
      .limit(limit);
      
    const total = await Problem.countDocuments(filter);
    
    res.json({
      problems,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProblems: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (problem) {
      // Don't send hidden test cases to the frontend to prevent cheating
      const problemObj = problem.toObject();
      problemObj.testCases = problemObj.testCases.filter(tc => !tc.isHidden);
      res.json(problemObj);
    } else {
      res.status(404).json({ message: 'Problem not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
