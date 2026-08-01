const Blog = require('../models/Blog');

// Helper to generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

class BlogController {
  // GET /api/blogs (Public - published only)
  static async getPublishedBlogs(req, res) {
    try {
      const { category, search, limit = 50 } = req.query;
      const query = { isPublished: true };

      if (category && category !== 'All') {
        query.category = category;
      }

      if (search && search.trim() !== '') {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [
          { title: regex },
          { excerpt: regex },
          { category: regex },
          { tags: regex }
        ];
      }

      const blogs = await Blog.find(query)
        .sort({ publishedAt: -1, createdAt: -1 })
        .limit(parseInt(limit, 10));

      res.status(200).json({ success: true, count: blogs.length, data: blogs });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /api/blogs/:slug (Public - single blog)
  static async getBlogBySlug(req, res) {
    try {
      const { slug } = req.params;

      let blog = await Blog.findOne({ slug });
      if (!blog && slug.match(/^[0-9a-fA-F]{24}$/)) {
        blog = await Blog.findById(slug);
      }

      if (!blog) {
        return res.status(404).json({ success: false, message: 'Blog post not found' });
      }

      res.status(200).json({ success: true, data: blog });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /api/blogs/admin/all (Admin - all blogs including draft)
  static async getAllBlogsAdmin(req, res) {
    try {
      const blogs = await Blog.find().sort({ createdAt: -1 });
      res.status(200).json({ success: true, count: blogs.length, data: blogs });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // POST /api/blogs (Admin create)
  static async createBlog(req, res) {
    try {
      const {
        title,
        slug,
        excerpt,
        content,
        coverImage,
        category,
        tags,
        authorName,
        authorRole,
        authorAvatar,
        readTime,
        isPublished
      } = req.body;

      if (!title || !content) {
        return res.status(400).json({ success: false, message: 'Title and content are required' });
      }

      const postSlug = slug && slug.trim() ? generateSlug(slug) : generateSlug(title);

      // Check if slug already exists
      const existing = await Blog.findOne({ slug: postSlug });
      const finalSlug = existing ? `${postSlug}-${Date.now().toString().slice(-4)}` : postSlug;

      let finalCoverImage = coverImage || '';
      if (req.file && req.file.path) {
        finalCoverImage = req.file.path;
      }

      const tagArray = Array.isArray(tags)
        ? tags
        : typeof tags === 'string'
        ? tags.split(',').map(t => t.trim()).filter(Boolean)
        : [];

      const newBlog = await Blog.create({
        title: title.trim(),
        slug: finalSlug,
        excerpt: excerpt || title,
        content,
        coverImage: finalCoverImage,
        category: category || 'Career Guidance',
        tags: tagArray,
        author: {
          name: authorName || 'Behold Aspire Editorial Team',
          role: authorRole || 'Senior Career Counsellor',
          avatar: authorAvatar || ''
        },
        readTime: readTime || '5 min read',
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
        publishedAt: new Date()
      });

      res.status(201).json({ success: true, data: newBlog });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // PUT /api/blogs/:id (Admin update)
  static async updateBlog(req, res) {
    try {
      const { id } = req.params;
      const blog = await Blog.findById(id);

      if (!blog) {
        return res.status(404).json({ success: false, message: 'Blog post not found' });
      }

      const {
        title,
        slug,
        excerpt,
        content,
        coverImage,
        category,
        tags,
        authorName,
        authorRole,
        authorAvatar,
        readTime,
        isPublished
      } = req.body;

      if (title) blog.title = title.trim();
      if (slug && slug.trim()) {
        const newSlug = generateSlug(slug);
        if (newSlug !== blog.slug) {
          const existing = await Blog.findOne({ slug: newSlug, _id: { $ne: id } });
          blog.slug = existing ? `${newSlug}-${Date.now().toString().slice(-4)}` : newSlug;
        }
      }
      if (excerpt !== undefined) blog.excerpt = excerpt;
      if (content !== undefined) blog.content = content;
      if (category !== undefined) blog.category = category;
      if (readTime !== undefined) blog.readTime = readTime;
      if (isPublished !== undefined) blog.isPublished = String(isPublished) === 'true' || isPublished === true;

      if (coverImage !== undefined) blog.coverImage = coverImage;
      if (req.file && req.file.path) {
        blog.coverImage = req.file.path;
      }

      if (tags !== undefined) {
        blog.tags = Array.isArray(tags)
          ? tags
          : typeof tags === 'string'
          ? tags.split(',').map(t => t.trim()).filter(Boolean)
          : blog.tags;
      }

      if (authorName !== undefined) blog.author.name = authorName;
      if (authorRole !== undefined) blog.author.role = authorRole;
      if (authorAvatar !== undefined) blog.author.avatar = authorAvatar;

      await blog.save();

      res.status(200).json({ success: true, data: blog });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // DELETE /api/blogs/:id (Admin delete)
  static async deleteBlog(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Blog.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Blog post not found' });
      }
      res.status(200).json({ success: true, message: 'Blog post deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = BlogController;
