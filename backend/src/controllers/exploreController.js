const Problem = require('../models/Problem');
const DiscussPost = require('../models/DiscussPost');
const WeeklyChallenge = require('../models/WeeklyChallenge');
const StudyPlan = require('../models/StudyPlan');

const STUDY_CARD_ORDER = ['top-interview-150', 'leetcode-75', 'sql-50'];

exports.getExplore = async (req, res) => {
  try {
    const [easy, medium, hard, topics, upcoming, rawPlans] = await Promise.all([
      Problem.countDocuments({ difficulty: 'Easy' }),
      Problem.countDocuments({ difficulty: 'Medium' }),
      Problem.countDocuments({ difficulty: 'Hard' }),
      Problem.distinct('topics'),
      WeeklyChallenge.find({ startDate: { $gt: new Date() } })
        .sort({ startDate: 1 })
        .limit(3)
        .select('title startDate endDate slug kind')
        .lean(),
      StudyPlan.find().select('slug title description problems').lean()
    ]);

    const discussCount = await DiscussPost.countDocuments();

    const sortedPlans = [...rawPlans].sort((a, b) => {
      const ia = STUDY_CARD_ORDER.indexOf(a.slug);
      const ib = STUDY_CARD_ORDER.indexOf(b.slug);
      if (ia === -1 && ib === -1) return String(a.title).localeCompare(String(b.title));
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });

    const accents = ['#f59e0b', '#22c55e', '#3b82f6', '#ec4899'];
    const studyCards = sortedPlans.map((p, i) => {
      const count = Array.isArray(p.problems) ? p.problems.length : 0;
      return {
        kind: 'study',
        title: p.title,
        href: `/study/${p.slug}`,
        accent: accents[i % accents.length],
        count,
        blurb: (p.description || '').replace(/\s+/g, ' ').trim().slice(0, 140)
      };
    });

    const cards = [
      ...studyCards,
      {
        kind: 'contest',
        title: 'Weekly contest',
        href: '/challenges',
        accent: '#f59e0b',
        count: null,
        blurb: 'Timed rounds with live rank and penalty-aware scoring.'
      },
      {
        kind: 'mock',
        title: 'Mock interview',
        href: '/mock-interview',
        accent: '#a855f7',
        count: null,
        blurb: 'Mixed topics — a short set of problems in one sitting.'
      }
    ];

    res.json({
      counts: { easy, medium, hard, total: easy + medium + hard },
      topics: topics.filter(Boolean).slice(0, 24),
      discussThreads: discussCount,
      upcomingContests: upcoming,
      cards
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
