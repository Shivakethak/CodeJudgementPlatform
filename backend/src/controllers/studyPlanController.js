const StudyPlan = require('../models/StudyPlan');
const User = require('../models/User');
const Submission = require('../models/Submission');
const cacheService = require('../services/cacheService');

exports.listPlans = async (req, res) => {
  try {
    const plans = await StudyPlan.find().select('slug title description problems').lean();
    const userId = req.user?.id;
    let user = null;
    if (userId) {
      user = await User.findById(userId).select('studyPlanProgress').lean();
    }
    const payload = await Promise.all(plans.map(async (p) => {
      const total = p.problems?.length || 0;
      let solved = 0;
      let lastId = null;
      if (userId && p.problems?.length) {
        const accepted = await Submission.find({
          userId,
          verdict: 'Accepted',
          problemId: { $in: p.problems }
        }).distinct('problemId');
        solved = accepted.length;
        let slot = null;
        if (user?.studyPlanProgress instanceof Map) {
          slot = user.studyPlanProgress.get(p.slug);
        } else if (user?.studyPlanProgress && typeof user.studyPlanProgress === 'object') {
          slot = user.studyPlanProgress[p.slug];
        }
        lastId = slot?.lastProblemId || null;
      }
      return {
        slug: p.slug,
        title: p.title,
        description: p.description,
        total,
        solved,
        lastProblemId: lastId
      };
    }));
    res.json(payload);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getPlanBySlug = async (req, res) => {
  try {
    const cacheKey = `studyplan:${req.params.slug}`;
    const cached = await cacheService.getJSON(cacheKey);
    if (cached) return res.json(cached);

    const plan = await StudyPlan.findOne({ slug: req.params.slug })
      .populate('problems', 'title difficulty topics stats companies isPremium')
      .lean();
    if (!plan) return res.status(404).json({ message: 'Study plan not found' });

    const problems = (plan.problems || []).map((p) => {
      const total = p.stats?.totalSubmissions || 0;
      const acc = p.stats?.acceptedSubmissions || 0;
      const acceptanceRate = total > 0 ? Math.round((acc / total) * 100) : 50;
      return { ...p, acceptanceRate };
    });

    const payload = { ...plan, problems };
    await cacheService.setJSON(cacheKey, payload, 300);
    res.json(payload);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.updatePlanProgress = async (req, res) => {
  try {
    const { slug } = req.params;
    const { lastProblemId } = req.body;
    const plan = await StudyPlan.findOne({ slug }).select('_id').lean();
    if (!plan) return res.status(404).json({ message: 'Study plan not found' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.studyPlanProgress) user.studyPlanProgress = new Map();
    const prev = user.studyPlanProgress.get(slug) || { solvedIds: [] };
    prev.lastProblemId = lastProblemId;
    user.studyPlanProgress.set(slug, prev);
    await user.save();

    await cacheService.del(`studyplan:${slug}`);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
