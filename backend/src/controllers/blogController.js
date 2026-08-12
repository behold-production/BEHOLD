const StorageService = require('../services/storageService');
const cloudinary = require('../config/cloudinary');
const { uploadToCloudinary } = require('../utils/cloudinaryHelper');

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
      let blogs = await StorageService.findAll('blogs', { isPublished: true });

      if (category && category !== 'All') {
        blogs = blogs.filter((b) => b.category === category);
      }

      if (search && search.trim() !== '') {
        const lowerSearch = search.trim().toLowerCase();
        blogs = blogs.filter(
          (b) =>
            b.title?.toLowerCase().includes(lowerSearch) ||
            b.excerpt?.toLowerCase().includes(lowerSearch) ||
            b.category?.toLowerCase().includes(lowerSearch) ||
            (b.tags && b.tags.some((t) => t.toLowerCase().includes(lowerSearch)))
        );
      }

      // Sort by publishedAt/createdAt descending
      blogs.sort((a, b) => {
        const dateA = new Date(a.publishedAt || a.createdAt || 0);
        const dateB = new Date(b.publishedAt || b.createdAt || 0);
        return dateB - dateA;
      });

      const parsedLimit = Number.parseInt(limit, 10);
      if (Number.isFinite(parsedLimit) && parsedLimit > 0) {
        blogs = blogs.slice(0, parsedLimit);
      }

      res.status(200).json({ success: true, count: blogs.length, data: blogs });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /api/blogs/:slug (Public - single blog)
  static async getBlogBySlug(req, res) {
    try {
      const { slug } = req.params;

      let blog = await StorageService.findOne('blogs', { slug });
      if (!blog) {
        // Fallback check if id was passed instead of slug
        blog = await StorageService.findById('blogs', slug);
      }

      if (!blog) {
        return res.status(404).json({ success: false, message: 'Blog post not found' });
      }

      if (!blog.isPublished) {
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
      const blogs = await StorageService.findAll('blogs');
      blogs.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });
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
        coverImage, // might be a string if no file uploaded
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
      if (!postSlug) {
        return res.status(400).json({ success: false, message: 'Title must contain letters or numbers' });
      }

      // Check if slug already exists
      const existing = await StorageService.findOne('blogs', { slug: postSlug });
      const finalSlug = existing ? `${postSlug}-${Date.now().toString().slice(-4)}` : postSlug;

      let finalCoverImage = coverImage || '';
      let coverImagePublicId = '';

      // Upload to Cloudinary if file provided
      if (req.file) {
        const uploadResult = await uploadToCloudinary(req.file.buffer);
        finalCoverImage = uploadResult.secure_url;
        coverImagePublicId = uploadResult.public_id;
      }

      const tagArray = Array.isArray(tags)
        ? tags
        : typeof tags === 'string'
        ? tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      const newBlogData = {
        title: title.trim(),
        slug: finalSlug,
        excerpt: excerpt || title,
        content,
        coverImage: finalCoverImage,
        coverImagePublicId,
        category: category || 'Career Guidance',
        tags: tagArray,
        author: {
          name: authorName || 'Behold Aspire Editorial Team',
          role: authorRole || 'Senior Career Counsellor',
          avatar: authorAvatar || ''
        },
        readTime: readTime || '5 min read',
        isPublished: isPublished !== undefined ? String(isPublished) === 'true' || isPublished === true : true,
        publishedAt: new Date()
      };

      const newBlog = await StorageService.create('blogs', newBlogData);

      res.status(201).json({ success: true, data: newBlog });
    } catch (error) {
      console.error('[Create Blog Error]', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // PUT /api/blogs/:id (Admin update)
  static async updateBlog(req, res) {
    try {
      const { id } = req.params;
      let blog = await StorageService.findById('blogs', id);
      if (!blog) {
        blog = await StorageService.findOne('blogs', { _id: id });
      }
      if (!blog) {
        blog = await StorageService.findOne('blogs', { slug: id });
      }

      if (!blog) {
        return res.status(404).json({ success: false, message: 'Blog post not found' });
      }

      const {
        title,
        slug,
        excerpt,
        content,
        coverImage, // fallback if no file
        category,
        tags,
        authorName,
        authorRole,
        authorAvatar,
        readTime,
        isPublished
      } = req.body;

      const updates = {};

      if (title) updates.title = title.trim();
      if (slug && slug.trim()) {
        const newSlug = generateSlug(slug);
        if (!newSlug) {
          return res.status(400).json({ success: false, message: 'Slug must contain letters or numbers' });
        }
        if (newSlug !== blog.slug) {
          const existing = await StorageService.findOne('blogs', { slug: newSlug });
          updates.slug = existing && (existing.id !== id && existing._id !== id) ? `${newSlug}-${Date.now().toString().slice(-4)}` : newSlug;
        }
      }
      
      if (excerpt !== undefined) updates.excerpt = excerpt;
      if (content !== undefined) updates.content = content;
      if (category !== undefined) updates.category = category;
      if (readTime !== undefined) updates.readTime = readTime;
      if (isPublished !== undefined) updates.isPublished = String(isPublished) === 'true' || isPublished === true;

      // Handle Image Update
      if (req.file) {
        // Delete old from Cloudinary
        if (blog.coverImagePublicId) {
          try {
            await cloudinary.uploader.destroy(blog.coverImagePublicId);
          } catch (err) {
            console.error('[Cloudinary Delete Blog Image Error]:', err);
          }
        }
        // Upload new
        const uploadResult = await uploadToCloudinary(req.file.buffer);
        updates.coverImage = uploadResult.secure_url;
        updates.coverImagePublicId = uploadResult.public_id;
      } else if (coverImage !== undefined) {
        updates.coverImage = coverImage;
      }

      if (tags !== undefined) {
        updates.tags = Array.isArray(tags)
          ? tags
          : typeof tags === 'string'
          ? tags.split(',').map((t) => t.trim()).filter(Boolean)
          : blog.tags;
      }

      if (authorName !== undefined || authorRole !== undefined || authorAvatar !== undefined) {
        updates.author = { ...blog.author };
        if (authorName !== undefined) updates.author.name = authorName;
        if (authorRole !== undefined) updates.author.role = authorRole;
        if (authorAvatar !== undefined) updates.author.avatar = authorAvatar;
      }

      const targetId = blog._id || blog.id || id;
      const updatedBlog = await StorageService.update('blogs', targetId, updates);

      res.status(200).json({ success: true, data: updatedBlog });
    } catch (error) {
      console.error('[Update Blog Error]', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // DELETE /api/blogs/:id (Admin delete)
  static async deleteBlog(req, res) {
    try {
      const { id } = req.params;
      let blog = await StorageService.findById('blogs', id);
      if (!blog) {
        blog = await StorageService.findOne('blogs', { _id: id });
      }
      if (!blog) {
        blog = await StorageService.findOne('blogs', { slug: id });
      }

      if (!blog) {
        return res.status(404).json({ success: false, message: 'Blog post not found' });
      }

      if (blog.coverImagePublicId) {
        try {
          await cloudinary.uploader.destroy(blog.coverImagePublicId);
        } catch (err) {
          console.error('[Cloudinary Delete Blog Image Error]:', err);
        }
      }

      const deleted = await StorageService.delete('blogs', id);
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
