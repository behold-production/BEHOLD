const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    coverImage: { type: String, default: '' },
    category: { type: String, default: 'Career Guidance', trim: true },
    tags: [{ type: String }],
    author: {
      name: { type: String, default: 'Behold Aspire Editorial Team' },
      role: { type: String, default: 'Senior Career Counsellor' },
      avatar: { type: String, default: '' }
    },
    readTime: { type: String, default: '5 min read' },
    isPublished: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' }
  },
  { timestamps: true }
);

// Index for search queries and slug lookup
blogSchema.index({ slug: 1 });
blogSchema.index({ title: 'text', excerpt: 'text', content: 'text', category: 'text' });

module.exports = mongoose.model('Blog', blogSchema);
