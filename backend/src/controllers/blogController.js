const Blog = require('../models/Blog');

// Helper to generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

// Seed default blog posts if none exist
const DEFAULT_BLOGS = [
  {
    title: 'Top 10 High-Growth Career Options After 12th in India (2026 Edition)',
    slug: 'top-10-career-options-after-12th-india',
    category: 'Career Guidance',
    excerpt: 'Explore emerging career pathways in AI, Bio-informatics, Green Energy, Design, and Strategic Management tailored for Kerala students.',
    readTime: '6 min read',
    isPublished: true,
    author: {
      name: 'Dr. Arun Varma',
      role: 'Lead Career Mentor & CIGI Specialist',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
    },
    coverImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000&auto=format&fit=crop&q=80',
    tags: ['After 12th', 'Career Roadmap', 'New Age Careers'],
    content: `
<h2>Why Traditional Careers Are Transforming</h2>
<p>In today's rapidly evolving job landscape, students completing Class 12 face more choices than ever before. While engineering and medicine remain respected avenues, interdisciplinary fields combining technology, design, and analytical thinking are emerging as top recruiters.</p>
<h3>1. Artificial Intelligence & Data Analytics</h3>
<p>Data is the new oil. From fintech to healthcare, organisations rely on data scientists and AI engineers to make predictive decisions.</p>
<h3>2. UX/UI & Product Design</h3>
<p>Every business lives on mobile screens. User experience designers bridge human psychology and digital interfaces.</p>
<h3>3. Environmental Strategy & Green Tech</h3>
<p>With global climate mandates, sustainability officers and renewable energy specialists are in high demand.</p>
<h2>How Scientific Aptitude Assessment Helps</h2>
<p>Choosing a path solely based on peer pressure or trends often leads to career burnout. At Behold Aspire, our C-DAT battery measures numerical, spatial, and verbal reasoning alongside emotional aptitude to map your true potential.</p>
`
  },
  {
    title: 'Why Scientific Aptitude Testing Beats Guesswork in Stream Selection',
    slug: 'why-scientific-aptitude-testing-beats-guesswork',
    category: 'Aptitude Assessment',
    excerpt: 'Discover how psychometric evaluations and C-DAT cognitive batteries uncover hidden student strengths between classes 8 and 10.',
    readTime: '5 min read',
    isPublished: true,
    author: {
      name: 'Meera Nair',
      role: 'Senior Psychologist & Counsellor',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'
    },
    coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1000&auto=format&fit=crop&q=80',
    tags: ['Aptitude Test', 'Stream Selection', 'CIGI Assessment'],
    content: `
<h2>The Dilemma of Class 10: Science, Commerce, or Humanities?</h2>
<p>One of the most defining moments in an Indian student's life is selecting their plus-two stream. Unfortunately, many decisions are driven by academic marks alone—assuming 90%+ automatically means Science.</p>
<h3>The Difference Between Ability and Interest</h3>
<p>Interest fluctuates over time, whereas underlying cognitive aptitude remains relatively consistent. A student might enjoy watching legal dramas (interest) but possess exceptional logical-mathematical speed suited for computational economics (aptitude).</p>
<h2>How Behold Aspire Maps Your Strengths</h2>
<p>Our multi-dimensional aptitude testing assesses verbal reasoning, numerical computation, abstract spatial ability, and emotional resilience to build a holistic career report.</p>
`
  },
  {
    title: 'Managing Exam Anxiety & Building Academic Resilience',
    slug: 'managing-exam-anxiety-building-academic-resilience',
    category: 'Psychological Wellbeing',
    excerpt: 'Evidence-based mindfulness, structured revision cycles, and parent-student communication strategies for board exam success.',
    readTime: '4 min read',
    isPublished: true,
    author: {
      name: 'Rev. Dr. Thomas K.',
      role: 'Principal Mentor & Educational Psychologist',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
    },
    coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1000&auto=format&fit=crop&q=80',
    tags: ['Exam Stress', 'Mental Health', 'Parenting'],
    content: `
<h2>Understanding Exam Stress</h2>
<p>Moderate stress can enhance alertness, but excessive anxiety impairs memory recall and problem-solving speed during critical examinations.</p>
<h3>1. The 50-10 Focus Protocol</h3>
<p>Study in focused 50-minute blocks followed by a complete 10-minute digital detox break. Walking or light stretching restores oxygen flow to the prefrontal cortex.</p>
<h3>2. Role of Supportive Parents</h3>
<p>Parents should focus on praising effort rather than outcome. A calm home atmosphere directly elevates student self-esteem.</p>
`
  }
];

class BlogController {
  // Ensure default blogs exist
  static async seedDefaultBlogs() {
    try {
      const count = await Blog.countDocuments();
      if (count === 0) {
        await Blog.insertMany(DEFAULT_BLOGS);
        console.log('✅ Seeded 3 default Behold Aspire blog posts successfully');
      }
    } catch (err) {
      console.error('Error seeding default blogs:', err.message);
    }
  }

  // GET /api/blogs (Public - published only)
  static async getPublishedBlogs(req, res) {
    try {
      await BlogController.seedDefaultBlogs();
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
      await BlogController.seedDefaultBlogs();
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
      await BlogController.seedDefaultBlogs();
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
      if (isPublished !== undefined) blog.isPublished = Boolean(isPublished);

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
