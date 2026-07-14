import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, ExternalLink, Eye, EyeOff, BookOpen, Clock, Tag, User, Sparkles, Check, X, AlertCircle } from 'lucide-react';
import ApiService from '../../../../shared/services/api';
import { toast } from 'react-hot-toast';

export default function BlogManagementTab() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Career Guidance',
    excerpt: '',
    readTime: '5 min read',
    coverImage: '',
    authorName: 'Behold Aspire Editorial Team',
    authorRole: 'Senior Career Counsellor & Mentor',
    authorAvatar: '',
    tags: '',
    content: '',
    isPublished: true
  });

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getAllBlogsAdmin();
      if (res?.data && Array.isArray(res.data)) {
        setBlogs(res.data);
      }
    } catch (err) {
      console.error('Error fetching admin blogs:', err);
      toast.error('Failed to fetch blog articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleOpenModal = (blog = null) => {
    if (blog) {
      setEditingBlog(blog);
      setFormData({
        title: blog.title || '',
        slug: blog.slug || '',
        category: blog.category || 'Career Guidance',
        excerpt: blog.excerpt || '',
        readTime: blog.readTime || '5 min read',
        coverImage: blog.coverImage || '',
        authorName: blog.author?.name || 'Behold Aspire Editorial Team',
        authorRole: blog.author?.role || 'Senior Career Counsellor & Mentor',
        authorAvatar: blog.author?.avatar || '',
        tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : blog.tags || '',
        content: blog.content || '',
        isPublished: blog.isPublished !== undefined ? blog.isPublished : true
      });
    } else {
      setEditingBlog(null);
      setFormData({
        title: '',
        slug: '',
        category: 'Career Guidance',
        excerpt: '',
        readTime: '5 min read',
        coverImage: '',
        authorName: 'Behold Aspire Editorial Team',
        authorRole: 'Senior Career Counsellor & Mentor',
        authorAvatar: '',
        tags: '',
        content: `<h2>Introduction</h2>\n<p>Write your introduction here...</p>\n\n<h3>Key Takeaways</h3>\n<ul>\n  <li>First takeaway</li>\n  <li>Second takeaway</li>\n</ul>`,
        isPublished: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBlog(null);
  };

  const handleTitleChange = (e) => {
    const val = e.target.value;
    const autoSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    setFormData(prev => ({
      ...prev,
      title: val,
      // If creating new post and user hasn't explicitly customized slug, auto-fill it
      slug: !editingBlog ? autoSlug : prev.slug
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please enter both Title and Article Content');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('slug', formData.slug);
      payload.append('category', formData.category);
      payload.append('excerpt', formData.excerpt);
      payload.append('readTime', formData.readTime);
      payload.append('coverImage', formData.coverImage);
      payload.append('authorName', formData.authorName);
      payload.append('authorRole', formData.authorRole);
      payload.append('authorAvatar', formData.authorAvatar);
      payload.append('tags', formData.tags);
      payload.append('content', formData.content);
      payload.append('isPublished', formData.isPublished);

      if (editingBlog) {
        const res = await ApiService.updateBlog(editingBlog._id, payload);
        if (res?.success) {
          toast.success('Article updated successfully!');
          fetchBlogs();
          handleCloseModal();
        } else {
          toast.error(res?.message || 'Failed to update article');
        }
      } else {
        const res = await ApiService.createBlog(payload);
        if (res?.success) {
          toast.success('New article published successfully!');
          fetchBlogs();
          handleCloseModal();
        } else {
          toast.error(res?.message || 'Failed to create article');
        }
      }
    } catch (err) {
      console.error('Error saving blog:', err);
      toast.error('An error occurred while saving the article');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async (blog) => {
    try {
      const payload = new FormData();
      payload.append('isPublished', !blog.isPublished);
      const res = await ApiService.updateBlog(blog._id, payload);
      if (res?.success) {
        toast.success(`Article ${!blog.isPublished ? 'Published' : 'Unpublished'}`);
        setBlogs(prev => prev.map(b => b._id === blog._id ? { ...b, isPublished: !blog.isPublished } : b));
      }
    } catch (err) {
      toast.error('Failed to toggle publication state');
    }
  };

  const handleDeleteBlog = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    try {
      const res = await ApiService.deleteBlog(id);
      if (res?.success) {
        toast.success('Article deleted successfully');
        setBlogs(prev => prev.filter(b => b._id !== id));
      }
    } catch (err) {
      toast.error('Failed to delete article');
    }
  };

  // Filtered blogs
  const filteredBlogs = blogs.filter((post) => {
    const matchesSearch =
      !searchQuery ||
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.slug?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === 'All' || post.category === categoryFilter;

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Published' ? post.isPublished : !post.isPublished);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categoriesList = ['All', ...new Set(blogs.map(b => b.category).filter(Boolean))];

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-xs font-black tracking-widest uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>EDITORIAL CONTROL</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-header text-white">
            Blog & Articles Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Create, edit, format, and publish expert career guidance and aptitude articles for Behold Aspire.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#00E5FF] hover:bg-[#2ef1ff] text-[#0a121e] font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,229,255,0.2)] hover:scale-105 active:scale-95 cursor-pointer border-none shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Write New Article</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search title, slug or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#00E5FF] text-white placeholder-slate-500 text-xs font-medium outline-none transition-colors"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end overflow-x-auto">
          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-semibold outline-none cursor-pointer"
          >
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>Category: {cat}</option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-semibold outline-none cursor-pointer"
          >
            <option value="All">Status: All</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-3 border-[#00E5FF] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white mb-1">No Articles Found</h4>
            <p className="text-xs text-slate-400">Click "+ Write New Article" above to publish your first post.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[11px] font-black uppercase tracking-wider">
                  <th className="py-4 px-5">Article</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Author</th>
                  <th className="py-4 px-4">Read Time</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredBlogs.map((post) => (
                  <tr key={post._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 rounded-lg bg-slate-950 overflow-hidden shrink-0 border border-slate-800">
                          <img
                            src={post.coverImage || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&auto=format&fit=crop&q=80'}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="max-w-xs">
                          <h4 className="font-bold text-white line-clamp-1">{post.title}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">/blog/{post.slug}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-block px-2.5 py-1.5 rounded-md bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-[11px] font-bold leading-tight whitespace-nowrap">
                        {post.category || 'Career Guidance'}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-200">{post.author?.name || 'Editorial Team'}</div>
                      <div className="text-[10px] text-slate-400">{post.author?.role || 'Mentor'}</div>
                    </td>

                    <td className="py-4 px-4 text-slate-300 font-medium">
                      {post.readTime || '5 min read'}
                    </td>

                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleTogglePublish(post)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer border transition-all ${
                          post.isPublished
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                            : 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25'
                        }`}
                      >
                        {post.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{post.isPublished ? 'Published' : 'Draft'}</span>
                      </button>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <button
                          onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                          title="Preview Live Article"
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenModal(post)}
                          title="Edit Article"
                          className="p-2 rounded-lg bg-[#00E5FF]/15 hover:bg-[#00E5FF] text-[#00E5FF] hover:text-[#0a121e] transition-all cursor-pointer border border-[#00E5FF]/30"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteBlog(post._id, post.title)}
                          title="Delete Article"
                          className="p-2 rounded-lg bg-red-500/15 hover:bg-red-600 text-red-400 hover:text-white transition-all cursor-pointer border border-red-500/30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/60">
              <h3 className="text-lg font-black font-header text-white flex items-center gap-2">
                {editingBlog ? <Edit className="w-5 h-5 text-[#00E5FF]" /> : <Plus className="w-5 h-5 text-[#00E5FF]" />}
                <span>{editingBlog ? 'Edit Article' : 'Write New Article'}</span>
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer border-none bg-transparent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Title & Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Top Career Options After 12th"
                    value={formData.title}
                    onChange={handleTitleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#00E5FF] text-white text-xs font-medium outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    SEO Slug URL *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. top-career-options-after-12th"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#00E5FF] text-white text-xs font-mono outline-none"
                  />
                </div>
              </div>

              {/* Category, Read Time, Published Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Career Guidance / Aptitude"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#00E5FF] text-white text-xs font-medium outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Reading Time
                  </label>
                  <input
                    type="text"
                    placeholder="5 min read"
                    value={formData.readTime}
                    onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#00E5FF] text-white text-xs font-medium outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Published Status
                  </label>
                  <select
                    value={formData.isPublished ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.value === 'true' })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#00E5FF] text-white text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="true">Published (Live immediately)</option>
                    <option value="false">Draft (Hidden from public)</option>
                  </select>
                </div>
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Cover Image URL
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#00E5FF] text-white text-xs font-mono outline-none"
                />
              </div>

              {/* Excerpt / Summary */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Article Summary / Excerpt *
                </label>
                <textarea
                  rows="2"
                  required
                  placeholder="Brief summary shown on homepage and listing cards..."
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#00E5FF] text-white text-xs font-medium outline-none"
                />
              </div>

              {/* Author Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#00E5FF] text-white text-xs font-medium outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Author Role
                  </label>
                  <input
                    type="text"
                    value={formData.authorRole}
                    onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#00E5FF] text-white text-xs font-medium outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Author Avatar URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.authorAvatar}
                    onChange={(e) => setFormData({ ...formData, authorAvatar: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#00E5FF] text-white text-xs font-mono outline-none"
                  />
                </div>
              </div>

              {/* Full Article Content */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Article Content (HTML / Markdown supported) *
                </label>
                <textarea
                  rows="8"
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your rich HTML or structured text paragraphs..."
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-[#00E5FF] text-white text-xs font-mono outline-none leading-relaxed"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer border-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#00E5FF] hover:bg-[#2bf0ff] text-[#0a121e] font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] cursor-pointer border-none disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingBlog ? 'Save Changes' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
