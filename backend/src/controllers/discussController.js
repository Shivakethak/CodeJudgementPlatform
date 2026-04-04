const DiscussPost = require('../models/DiscussPost');

exports.listPosts = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 15, 1), 50);
    const tag = req.query.tag;
    const filter = tag ? { tags: tag } : {};
    const [items, total] = await Promise.all([
      DiscussPost.find(filter)
        .sort({ pinned: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      DiscussPost.countDocuments(filter)
    ]);
    res.json({
      posts: items,
      page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { title, body, tags } = req.body;
    const post = await DiscussPost.create({
      title,
      body,
      tags: Array.isArray(tags) ? tags : [],
      authorLabel: (req.user?.email || 'user').split('@')[0]
    });
    res.status(201).json(post);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
