const mongoose = require('mongoose');

const discussPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  authorLabel: { type: String, default: 'Community' },
  tags: { type: [String], default: [] },
  votes: { type: Number, default: 0 },
  replyCount: { type: Number, default: 0 },
  pinned: { type: Boolean, default: false }
}, { timestamps: true });

discussPostSchema.index({ createdAt: -1 });
module.exports = mongoose.model('DiscussPost', discussPostSchema);
