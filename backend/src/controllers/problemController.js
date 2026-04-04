const Problem = require('../models/Problem');
const cacheService = require('../services/cacheService');

function enrichProblemListItem(p, indexOffset) {
  const total = p.stats?.totalSubmissions || 0;
  const acc = p.stats?.acceptedSubmissions || 0;
  const acceptanceRate = total > 0 ? Math.round((acc / total) * 100) : null;
  return {
    ...p,
    index: indexOffset,
    acceptanceRate: acceptanceRate ?? 48
  };
}

exports.getProblems = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;

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

    const cacheKey = cacheService.key.problemList({ ...filter, page, limit });
    const cached = await cacheService.getJSON(cacheKey);
    if (cached) return res.json(cached);

    const problems = await Problem.find(filter)
      .select('-testCases -templates -solution')
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Problem.countDocuments(filter);

    const enriched = problems.map((p, i) => enrichProblemListItem(p, skip + i + 1));

    const payload = {
      problems: enriched,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProblems: total
    };

    await cacheService.setJSON(cacheKey, payload, 120);
    res.json(payload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProblemById = async (req, res) => {
  try {
    const cacheKey = cacheService.key.problemDetail(req.params.id);
    const cached = await cacheService.getJSON(cacheKey);
    if (cached) return res.json(cached);

    const problem = await Problem.findById(req.params.id).lean();
    if (problem) {
      const problemObj = { ...problem };
      problemObj.testCases = (problemObj.testCases || []).filter(tc => !tc.isHidden);
      await cacheService.setJSON(cacheKey, problemObj, 300);
      res.json(problemObj);
    } else {
      res.status(404).json({ message: 'Problem not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getInterviewCompanies = async (req, res) => {
  try {
    const rows = await Problem.aggregate([
      { $match: { companies: { $exists: true, $ne: [] } } },
      { $unwind: '$companies' },
      { $group: { _id: '$companies', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 40 }
    ]);
    res.json(rows.map(r => ({ name: r._id, count: r.count })));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
