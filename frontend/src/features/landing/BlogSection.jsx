import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import ApiService from '../../services/api';
import { ScrollDot } from '../../components/common/BrandDot';
import { getImageUrl } from '../../utils/formatters';
import defaultBlogImage from '../../assets/luxury_clinic_room.png';

const BlogSection = () => {  const navigate = useNavigate();
  const [blogs, setBlogs] = useState(() => {
    try {
      const cached = localStorage.getItem('behold_blogs_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) { }
    return [];
  });
  const [loading, setLoading] = useState(() => blogs.length === 0);
  const [currentPage, setCurrentPage] = useState(1);
  const blogScrollRef = useRef(null);
  const itemsPerPage = 3;

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        if (blogs.length === 0) setLoading(true);
        const res = await ApiService.getBlogs({ limit: 12 });
        if (res?.data && Array.isArray(res.data)) {
          setBlogs(res.data);
          localStorage.setItem('behold_blogs_cache', JSON.stringify(res.data));
        }      } catch (err) {
        console.warn('Failed to fetch blogs for landing section:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const handleOpenBlog = (slug) => {
    navigate(`/blog/${slug}`);
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

  return (
    <section id="blog" className="py-16 sm:py-24 bg-transparent border-b border-surface-200 reveal-on-scroll">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10 reveal-on-scroll">
          <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-[#00c9d6] tracking-widest uppercase mb-3">
            <span className="w-5 h-px bg-[#00c9d6]/60 inline-block" />
            Latest Insights
            <span className="w-5 h-px bg-[#00c9d6]/60 inline-block" />
          </span>
          <h2 id="blog-title" className="text-3xl sm:text-4xl md:text-5xl font-sans font-semibold text-[#0f172a] mb-4 tracking-tight leading-tight">
            Guidance for Your Journey<span className="text-[#00c9d6] drop-shadow-[0_0_8px_rgba(0,201,214,0.6)] font-semibold">.</span>
          </h2>
          <p className="text-sm sm:text-base text-surface-600 max-w-xl mx-auto leading-relaxed font-medium mb-6">
            Research-backed articles, student guides, and mental health resources from our clinical team.
          </p>
          <button
            onClick={handleOpenAllBlogs}
            className="px-6 py-2.5 bg-[#0f172a] hover:bg-[#00c9d6] hover:text-slate-950 text-white font-semibold text-xs tracking-wider rounded-full transition-all border-none cursor-pointer shadow-sm hover-scale-btn"
          >
            Explore All Articles
          </button>
        </div>

        {/* Mobile Scroll Controls (<768px) */}
        <div className="flex md:hidden items-center justify-end px-1 mb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollBlogs('left')}
              className="w-8 h-8 rounded-full bg-[#0f172a] text-white flex items-center justify-center border border-[#00e5ff]/30 active:scale-95 transition-all p-0 shadow-2xs"
              aria-label="Previous Article"
            >
              <ChevronLeft className="w-4 h-4 text-[#00e5ff]" />
            </button>
            <button
              onClick={() => scrollBlogs('right')}
              className="w-8 h-8 rounded-full bg-[#0f172a] text-white flex items-center justify-center border border-[#00e5ff]/30 active:scale-95 transition-all p-0 shadow-2xs"
              aria-label="Next Article"
            >
              <ChevronRight className="w-4 h-4 text-[#00e5ff]" />
            </button>
          </div>
        </div>

        {/* Blog Cards Grid / Mobile Horizontal Carousel */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-surface-200 rounded-xl overflow-hidden shadow-xs flex flex-col h-96">
                <div className="shimmer h-56 w-full shrink-0" />
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="shimmer h-4 w-3/4 rounded-md" />
                    <div className="shimmer h-3 w-full rounded-md" />
                    <div className="shimmer h-3 w-5/6 rounded-md" />
                  </div>
                  <div className="pt-4 border-t border-surface-100 flex items-center justify-between">
                    <div className="shimmer h-3 w-20 rounded-md" />
                    <div className="shimmer h-3 w-24 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-surface-200 shadow-xs">
            <h3 className="text-xl font-semibold text-[#0f172a] mb-2">No Articles Found</h3>
            <p className="text-surface-600 font-normal text-sm max-w-md mx-auto">Check back soon for new insights and research articles.</p>
          </div>
        ) : (
          <div
            ref={blogScrollRef}
            id="blog-grid"
            className="flex md:grid overflow-x-auto md:overflow-x-visible snap-x snap-mandatory md:snap-none scrollbar-none md:grid-cols-3 gap-8 pb-4"
          >
            {paginatedBlogs.map((post) => (
            <article
              key={post._id || post.slug}
              onClick={() => handleOpenBlog(post.slug)}
              className="group relative bg-white border border-surface-200 hover:border-[#00e5ff] rounded-xl overflow-hidden transition-all duration-300 flex flex-col cursor-pointer shadow-xs hover:shadow-md h-full shrink-0 w-full snap-start snap-always md:w-auto md:max-w-none"
            >
              {/* Cover Image Container */}
              <div className="relative h-56 w-full overflow-hidden bg-surface-100 shrink-0">
                <img
                  src={post.coverImage ? getImageUrl(post.coverImage) : defaultBlogImage}
                  alt={post.title}
                  onError={(e) => { e.target.onerror = null; e.target.src = defaultBlogImage; }}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/50 to-transparent opacity-50 group-hover:opacity-30 transition-opacity duration-300" />
                {/* Category Badge */}
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm text-[#0f172a] text-[10px] font-semibold tracking-wider border border-surface-200">
                  {post.category || 'Career Guidance'}
                </span>

                {/* Read Time */}
                <div className="absolute bottom-4 right-4 flex items-center gap-1 text-[10px] font-semibold text-[#0f172a] bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full border border-surface-200">
                  <Clock className="w-3 h-3 text-[#00e5ff]" />
                  <span>{post.readTime || '5 min read'}</span>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-[#0f172a] group-hover:text-[#00e5ff] transition-colors line-clamp-2 leading-snug font-sans">
                    {post.title}
                  </h3>
                  <p className="text-xs text-surface-600 line-clamp-3 leading-relaxed font-normal">
                    {post.excerpt}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="pt-4 border-t border-surface-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#0f172a] group-hover:text-[#00e5ff] transition-colors flex items-center gap-1">
                    Read Article →
                  </span>
                  <span className="text-[11px] text-surface-500">{post.author?.name || 'Editorial Team'}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
        )}

        {/* Pagination (>=768px) */}
        {totalPages > 1 && (
          <div className="hidden md:flex items-center justify-center gap-2 pt-12">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous Page"
              className={`w-8 h-8 rounded-full text-sm font-semibold transition-all cursor-pointer border flex items-center justify-center ${currentPage === 1
                ? 'border-surface-200 text-surface-400 bg-surface-100 cursor-not-allowed'
                : 'border-[#0f172a] bg-[#0f172a] text-white hover:bg-[#1e293b]'
                }`}
            >
              ‹
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`w-8 h-8 rounded-full text-xs font-semibold transition-all cursor-pointer border flex items-center justify-center ${currentPage === num
                  ? 'bg-[#0f172a] text-white border-[#00e5ff] shadow-xs'
                  : 'bg-white text-[#0f172a] border-surface-200 hover:border-[#00e5ff]'
                  }`}
              >
                {num}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next Page"
              className={`w-8 h-8 rounded-full text-sm font-semibold transition-all cursor-pointer border flex items-center justify-center ${currentPage === totalPages
                ? 'border-surface-200 text-surface-400 bg-surface-100 cursor-not-allowed'
                : 'border-[#0f172a] bg-[#0f172a] text-white hover:bg-[#1e293b]'
                }`}
            >
              ›
            </button>
          </div>
        )}

      </div>
    </section>
  );
};

export default BlogSection;
