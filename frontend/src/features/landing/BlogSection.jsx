import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, ArrowUpRight, BookOpen } from 'lucide-react';
import ApiService from '../../services/api';
import { getImageUrl } from '../../utils/formatters';
import defaultBlogImage from '../../assets/luxury_clinic_room.png';

export default function BlogSection({ siteSettings = {} }) {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const blogScrollRef = useRef(null);
  const itemsPerPage = 3;

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

  if (!showBlogs) return null;

  const handleOpenBlog = (slug) => {
    if (slug) navigate(`/blog/${slug}`);
    else navigate('/blog');
  };

  const handleOpenAllBlogs = () => {
    navigate('/blog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollBlogs = (direction) => {
    if (blogScrollRef.current) {
      const container = blogScrollRef.current;
      const cards = container.children;
      if (!cards || cards.length === 0) return;

      const firstCardWidth = cards[0].offsetWidth;
      const gap = 24;
      const step = firstCardWidth + gap;

      const currentIndex = Math.round(container.scrollLeft / step);
      const targetIndex = direction === 'right'
        ? Math.min(currentIndex + 1, cards.length - 1)
        : Math.max(currentIndex - 1, 0);

      container.scrollTo({
        left: targetIndex * step,
        behavior: 'smooth'
      });
    }
  };

  const totalPages = Math.ceil(blogs.length / itemsPerPage);
  const paginatedBlogs = blogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const heading = siteSettings?.blogSectionTitle || 'Guidance for Your Journey';
  const subtitle = siteSettings?.blogSectionDesc || 'Research-backed articles, mental health insights, and therapeutic resources from our clinical team.';
  const tag = siteSettings?.blogSectionSub || 'Latest Insights & Articles';

  return (
    <section id="blog" aria-labelledby="bh-home-blog-title" className="py-20 sm:py-28 bg-[#fbfaf6] border-b border-slate-200/80 reveal-on-scroll">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center mb-12 reveal-on-scroll">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold text-teal-700 tracking-widest uppercase mb-3">
            <span className="w-5 h-px bg-teal-600/40 inline-block" />
            {tag}
            <span className="w-5 h-px bg-teal-600/40 inline-block" />
          </span>
          <h2 id="bh-home-blog-title" className="text-3xl sm:text-4xl md:text-5xl font-sans font-semibold text-slate-900 mb-4 tracking-tight leading-tight">
            {heading}<span className="text-[#0d827f]">.</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed font-normal mb-7">
            {subtitle}
          </p>
          <button
            type="button"
            onClick={handleOpenAllBlogs}
            className="px-6 py-2.5 bg-slate-900 hover:bg-[#0d827f] text-white font-semibold text-xs tracking-wider rounded-lg transition-all border-none cursor-pointer shadow-xs inline-flex items-center gap-2"
          >
            <span>Explore All Articles</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-teal-300" />
          </button>
        </div>

        {/* Mobile Scroll Controls (<768px) */}
        {blogs.length > 1 && (
          <div className="flex md:hidden items-center justify-end px-1 mb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollBlogs('left')}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center active:scale-95 transition-all p-0 shadow-2xs cursor-pointer hover:border-slate-300"
                aria-label="Previous Article"
              >
                <ChevronLeft className="w-4 h-4 text-slate-700" />
              </button>
              <button
                type="button"
                onClick={() => scrollBlogs('right')}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center active:scale-95 transition-all p-0 shadow-2xs cursor-pointer hover:border-slate-300"
                aria-label="Next Article"
              >
                <ChevronRight className="w-4 h-4 text-slate-700" />
              </button>
            </div>
          </div>
        )}

        {/* Blog Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs flex flex-col h-96">
                <div className="shimmer h-52 w-full shrink-0" />
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="shimmer h-4 w-3/4 rounded-md" />
                    <div className="shimmer h-3 w-full rounded-md" />
                    <div className="shimmer h-3 w-5/6 rounded-md" />
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="shimmer h-3 w-20 rounded-md" />
                    <div className="shimmer h-3 w-24 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-dashed border-slate-200 shadow-xs max-w-lg mx-auto p-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center mx-auto">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Articles Published Yet</h3>
            <p className="text-slate-500 text-xs leading-relaxed max-w-xs mx-auto">
              Clinical insights, mental health guides, and student articles will be published here soon.
            </p>
          </div>
        ) : (
          <div
            ref={blogScrollRef}
            id="blog-grid"
            className="flex md:grid overflow-x-auto md:overflow-x-visible snap-x snap-mandatory md:snap-none scrollbar-none md:grid-cols-3 gap-6 sm:gap-8 pb-4"
          >
            {paginatedBlogs.map((post) => (
              <article
                key={post._id || post.slug}
                onClick={() => handleOpenBlog(post.slug || post._id)}
                className="group relative bg-white border border-slate-200 hover:border-[#0d827f] rounded-lg overflow-hidden transition-all duration-200 flex flex-col cursor-pointer shadow-xs hover:shadow-md h-full shrink-0 w-full snap-start snap-always md:w-auto md:max-w-none text-left"
              >
                {/* Cover Image */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src={post.coverImage ? getImageUrl(post.coverImage) : (defaultBlogImage?.src || defaultBlogImage)}
                    alt={post.title}
                    loading="lazy"
                    onError={(e) => { e.target.onerror = null; e.target.src = defaultBlogImage?.src || defaultBlogImage; }}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-300" />
                  
                  {post.category && (
                    <span className="absolute top-3.5 left-3.5 px-2.5 py-0.5 rounded-md bg-white/95 backdrop-blur-xs text-slate-900 text-[10px] font-bold tracking-wider border border-slate-200 shadow-2xs">
                      {post.category}
                    </span>
                  )}

                  {post.readTime && (
                    <div className="absolute bottom-3.5 right-3.5 flex items-center gap-1 text-[10px] font-semibold text-slate-800 bg-white/95 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                      <Clock className="w-3 h-3 text-teal-600" />
                      <span>{post.readTime}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h3>
                    {(post.excerpt || post.snippet || post.summary) && (
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-normal">
                        {post.excerpt || post.snippet || post.summary}
                      </p>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">
                    <span className="flex items-center gap-1">
                      <span>Read Article</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      {post.author?.name || 'Editorial Team'}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination (>=768px) */}
        {totalPages > 1 && (
          <div className="hidden md:flex items-center justify-center gap-2 pt-10">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous Page"
              className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all cursor-pointer border flex items-center justify-center ${
                currentPage === 1
                  ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed'
                  : 'border-slate-300 bg-white text-slate-800 hover:border-slate-900 hover:bg-slate-50'
              }`}
            >
              ‹
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setCurrentPage(num)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer border flex items-center justify-center ${
                  currentPage === num
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                }`}
              >
                {num}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next Page"
              className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all cursor-pointer border flex items-center justify-center ${
                currentPage === totalPages
                  ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed'
                  : 'border-slate-300 bg-white text-slate-800 hover:border-slate-900 hover:bg-slate-50'
              }`}
            >
              ›
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
