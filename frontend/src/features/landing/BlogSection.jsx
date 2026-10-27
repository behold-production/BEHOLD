import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowRight, ArrowUpRight, BookOpen, User, Calendar, Sparkles } from 'lucide-react';
import ApiService from '../../services/api';
import { getImageUrl } from '../../utils/formatters';
import defaultBlogImage from '../../assets/luxury_clinic_room.png';

export default function BlogSection({ siteSettings = {} }) {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const showBlogs = siteSettings?.enableBlog !== false;

  useEffect(() => {
    let isMounted = true;
    const fetchBlogs = async (forceRefresh = false) => {
      try {
        const res = await ApiService.getBlogs({ limit: 12 }, forceRefresh);
        if (res?.data && Array.isArray(res.data)) {
          if (isMounted) setBlogs(res.data.filter((b) => b?.title));
        } else {
          if (isMounted) setBlogs([]);
        }
      } catch (err) {
        console.warn('Failed to fetch blogs for landing section:', err);
        if (isMounted) setBlogs([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (showBlogs) {
      fetchBlogs(true);
    } else {
      setLoading(false);
    }

    const handleUpdate = () => fetchBlogs(true);
    window.addEventListener('behold_blogs_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('behold_blogs_updated', handleUpdate);
    };
  }, [showBlogs]);

  const categories = useMemo(() => {
    const set = new Set();
    blogs.forEach((b) => {
      if (b.category && typeof b.category === 'string') set.add(b.category.trim());
    });
    return ['All', ...Array.from(set)];
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    if (selectedCategory === 'All') return blogs;
    return blogs.filter((b) => b.category?.toLowerCase() === selectedCategory.toLowerCase());
  }, [blogs, selectedCategory]);

  if (!showBlogs) return null;

  const handleOpenBlog = (slug) => {
    if (slug) navigate(`/blog/${slug}`);
    else navigate('/blog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAllBlogs = () => {
    navigate('/blog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const heading = siteSettings?.blogSectionTitle || 'Guidance for Your Journey';
  const subtitle = siteSettings?.blogSectionDesc || 'Research-backed articles, mental health insights, and therapeutic resources from our clinical team.';
  const tag = siteSettings?.blogSectionSub || 'Latest Insights & Articles';

  const featuredPost = filteredBlogs[0];
  const secondaryPosts = filteredBlogs.slice(1, 7);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <section
      id="blog"
      aria-labelledby="bh-home-blog-title"
      className="py-16 sm:py-24 bg-[#faf9f5] border-b border-slate-200/80 scroll-mt-20 select-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-14">
          <div className="max-w-2xl text-left">
            <span className="inline-flex items-center gap-2 text-[11px] font-bold text-teal-700 tracking-widest uppercase mb-3">
              <span className="w-5 h-px bg-teal-600/40 inline-block" />
              {tag}
            </span>
            <h2
              id="bh-home-blog-title"
              className="text-3xl sm:text-4xl md:text-5xl font-sans font-semibold text-slate-900 tracking-tight leading-tight"
            >
              {heading}<span className="text-[#0d827f]">.</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              {subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleOpenAllBlogs}
              className="px-5 py-2.5 bg-white hover:bg-slate-900 hover:text-white text-slate-900 font-semibold text-xs tracking-wider rounded-lg transition-all border border-slate-300 shadow-2xs inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Explore All Articles</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-teal-600" />
            </button>
          </div>
        </div>

        {/* Category Filter Chips */}
        {categories.length > 2 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none text-left">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Content Loading State */}
        {loading ? (
          <div className="space-y-6">
            <div className="h-72 w-full rounded-xl bg-slate-200 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 rounded-xl bg-slate-200 animate-pulse" />
              ))}
            </div>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200 p-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center mx-auto">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Articles In This Category</h3>
            <p className="text-slate-500 text-xs leading-relaxed max-w-xs mx-auto">
              Please check back soon or switch categories to explore other clinical publications.
            </p>
          </div>
        ) : (
          <div className="space-y-8">

            {/* Featured Article Spotlight Card */}
            {featuredPost && (
              <article
                onClick={() => handleOpenBlog(featuredPost.slug || featuredPost._id)}
                className="group relative bg-white border border-slate-200 hover:border-teal-500/60 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 cursor-pointer text-left"
              >
                {/* Featured Cover Image */}
                <div className="lg:col-span-7 relative h-64 sm:h-80 lg:h-full min-h-[260px] overflow-hidden bg-slate-100">
                  <img
                    src={featuredPost.coverImage ? getImageUrl(featuredPost.coverImage) : (defaultBlogImage?.src || defaultBlogImage)}
                    alt={featuredPost.title}
                    loading="lazy"
                    onError={(e) => { e.target.onerror = null; e.target.src = defaultBlogImage?.src || defaultBlogImage; }}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />

                  {/* Spotlight Badge */}
                  <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-900/90 backdrop-blur-xs text-white text-[11px] font-bold tracking-wider border border-white/20 shadow-xs">
                    <Sparkles className="w-3 h-3 text-[#00e5ff]" />
                    Featured Editorial
                  </span>

                  {featuredPost.category && (
                    <span className="absolute bottom-4 left-4 px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-xs text-slate-900 text-[10px] font-bold tracking-wider border border-slate-200">
                      {featuredPost.category}
                    </span>
                  )}
                </div>

                {/* Featured Text Content */}
                <div className="lg:col-span-5 p-6 sm:p-8 md:p-10 flex flex-col justify-between bg-white">
                  <div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-3 font-medium">
                      {featuredPost.createdAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-teal-600" />
                          {formatDate(featuredPost.createdAt)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        {featuredPost.readTime || '5 min read'}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-900 group-hover:text-teal-700 transition-colors leading-snug line-clamp-3">
                      {featuredPost.title}
                    </h3>

                    <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 font-normal">
                      {featuredPost.excerpt}
                    </p>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-teal-100/70 text-teal-800 flex items-center justify-center text-xs font-bold uppercase">
                        {(featuredPost.author || 'B').charAt(0)}
                      </div>
                      <span className="text-xs font-semibold text-slate-800">
                        {featuredPost.author || 'BEHOLD Editorial'}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 group-hover:text-teal-900 transition-colors">
                      Read Article
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </article>
            )}

            {/* Remaining Articles 3-Column Magazine Grid */}
            {secondaryPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                {secondaryPosts.map((post) => (
                  <article
                    key={post._id || post.slug}
                    onClick={() => handleOpenBlog(post.slug || post._id)}
                    className="group bg-white border border-slate-200 hover:border-teal-500/50 rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer text-left"
                  >
                    <div>
                      {/* Card Cover Image */}
                      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                        <img
                          src={post.coverImage ? getImageUrl(post.coverImage) : (defaultBlogImage?.src || defaultBlogImage)}
                          alt={post.title}
                          loading="lazy"
                          onError={(e) => { e.target.onerror = null; e.target.src = defaultBlogImage?.src || defaultBlogImage; }}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent opacity-60 group-hover:opacity-20 transition-opacity" />

                        {post.category && (
                          <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-md bg-white/95 backdrop-blur-xs text-slate-900 text-[10px] font-bold tracking-wider border border-slate-200">
                            {post.category}
                          </span>
                        )}

                        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-xs text-slate-800 text-[10px] font-semibold border border-slate-200">
                          <Clock className="w-3 h-3 text-teal-600" />
                          {post.readTime || '4 min'}
                        </span>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 sm:p-6 space-y-2.5">
                        <span className="text-[11px] text-slate-400 font-medium block">
                          {formatDate(post.createdAt)}
                        </span>
                        <h4 className="text-base sm:text-lg font-semibold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-2 leading-snug">
                          {post.title}
                        </h4>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                          {post.excerpt}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-bold uppercase">
                          {(post.author || 'B').charAt(0)}
                        </div>
                        <span className="text-xs text-slate-700 font-medium truncate max-w-[130px]">
                          {post.author || 'BEHOLD Editorial'}
                        </span>
                      </div>

                      <span className="text-xs font-bold text-teal-700 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        Read
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}

          </div>
        )}

      </div>
    </section>
  );
}
