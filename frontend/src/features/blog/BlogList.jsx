import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, ArrowRight, BookOpen, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import ApiService from '../../shared/services/api';
import greenTexture from '../../assets/greygreen.png';
import { getImageUrl } from '../../shared/utils/formatters';
import defaultBlogImage from '../../assets/luxury_clinic_room.png';

const CATEGORIES = [
  'All',
  'Career Guidance',
  'Aptitude Assessment',
  'Psychological Wellbeing',
  'Parenting & Education'
];

const BlogList = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  const fetchBlogs = async () => {
    if (blogs.length === 0) setLoading(true);
    try {
      const params = {};
      if (selectedCategory && selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      const res = await ApiService.getBlogs(params);
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setBlogs(res.data);
      } else {
        setBlogs([]);
      }
    } catch (err) {
      console.warn('Failed to fetch blogs:', err);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBlogs();
  };

  const handleOpenBlog = (slug) => {
    navigate(`/blog/${slug}`);
  };

  return (
    <div className="min-h-screen flex flex-col text-surface-900 pt-24 pb-20 relative">
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={greenTexture}
          alt=""
          className="w-full h-full object-cover object-center opacity-20"
        />
        <div className="absolute inset-0 bg-white/70" />
      </div>

      {/* Hero Header */}
      <section className="relative z-10 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#00e5ff] flex items-center justify-center gap-1.5 mb-1">

            BEHOLD INSIGHTS & RESEARCH
          </span>

          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-sans font-black uppercase tracking-tight text-[#0f172a] max-w-4xl mx-auto leading-[0.98]">
            Scientific Insights For <span className="text-[#0f172a]">Future Leaders</span><span className="text-[#00e5ff] drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]">.</span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-surface-600 max-w-2xl mx-auto leading-relaxed font-normal">
            In-depth career roadmaps, stream selection psychology, C-DAT research, and parenting frameworks authored by CIGI mentors.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-8 max-w-2xl mx-auto relative">
            <div className="relative flex items-center bg-white border border-surface-200 rounded-full shadow-xs focus-within:border-[#00e5ff] transition-all p-1.5">
              <Search className="w-5 h-5 text-surface-400 absolute left-5" />
              <input
                type="text"
                placeholder="Search articles, streams, or guidance topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-32 py-3 bg-transparent text-[#0f172a] placeholder-surface-400 text-sm font-medium outline-none"
              />
              <button
                type="submit"
                className="absolute right-2 top-1.5 bottom-1.5 px-6 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs uppercase tracking-widest transition-all cursor-pointer border border-[#00e5ff]/30 flex items-center gap-2"
              >
                Search
              </button>
            </div>
          </form>

          {/* Category Pill Tabs */}
          <div className="mt-10 flex flex-wrap justify-center items-center gap-2.5">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                    active
                      ? 'bg-[#0f172a] text-white border-[#00e5ff] shadow-xs'
                      : 'bg-surface-50 text-surface-600 border-surface-200 hover:border-[#00e5ff] hover:text-[#0f172a]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Blog Grid */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative z-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
          <div className="text-center py-20 bg-white rounded-xl border border-surface-200 shadow-xs max-w-2xl mx-auto p-8">
            <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-[#0f172a]" />
            </div>
            <h3 className="text-xl font-bold text-[#0f172a] mb-2 uppercase">No Articles Found</h3>
            <p className="text-surface-600 font-normal text-sm max-w-md mx-auto">Try adjusting your category filter or search keywords to find what you're looking for.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              {blogs.slice((currentPage - 1) * 6, currentPage * 6).map((post) => (
                <article
                  key={post._id || post.slug}
                  onClick={() => handleOpenBlog(post.slug)}
                  className="group relative bg-white border border-surface-200 hover:border-[#00e5ff] rounded-xl overflow-hidden transition-all duration-300 flex flex-col cursor-pointer shadow-xs hover:shadow-md h-full justify-between"
                >
                  {/* Cover Image */}
                  <div className="relative h-56 w-full overflow-hidden bg-surface-100 shrink-0">
                    <img
                      src={post.coverImage ? getImageUrl(post.coverImage) : defaultBlogImage}
                      alt={post.title}
                      onError={(e) => { e.target.onerror = null; e.target.src = defaultBlogImage; }}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/60 to-transparent opacity-60" />

                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#0f172a] text-white border border-[#00e5ff]/30 text-[10px] font-bold tracking-widest uppercase shadow-xs">
                      {post.category || 'Career Guidance'}
                    </span>

                    <div className="absolute bottom-4 right-4 flex items-center gap-1.5 text-[10px] font-bold text-[#0f172a] bg-white/95 backdrop-blur-md px-3 py-1 rounded-full border border-surface-200 shadow-xs uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5 text-[#00e5ff]" />
                      <span>{post.readTime || '5 min read'}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      <h2 className="text-lg sm:text-xl font-bold text-[#0f172a] group-hover:text-[#00e5ff] transition-colors line-clamp-2 leading-tight tracking-tight">
                        {post.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-surface-600 line-clamp-3 leading-relaxed font-normal">
                        {post.excerpt}
                      </p>
                    </div>

                    {/* Author */}
                    <div className="pt-5 border-t border-surface-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#0f172a] text-[#00e5ff] border border-[#00e5ff]/30 flex items-center justify-center font-bold text-xs overflow-hidden shrink-0 shadow-xs">
                          {post.author?.avatar ? (
                            <img src={getImageUrl(post.author.avatar)} alt={post.author.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{(post.author?.name || 'B')[0]}</span>
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#0f172a] line-clamp-1">
                            {post.author?.name || 'Editorial Team'}
                          </h4>
                          <p className="text-[10px] text-surface-500 font-medium uppercase tracking-wider line-clamp-1">
                            {post.author?.role || 'Senior Mentor'}
                          </p>
                        </div>
                      </div>

                      <div className="text-[11px] font-bold text-[#00e5ff] flex items-center gap-1 group-hover:translate-x-1 transition-transform uppercase tracking-widest">
                        <span>Read</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination Bar */}
            {Math.ceil(blogs.length / 6) > 1 && (
              <div className="flex items-center justify-center gap-2 pt-12">
                <button
                  onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                  disabled={currentPage === 1}
                  aria-label="Previous Page"
                  className={`w-9 h-9 rounded-full text-sm font-bold transition-all cursor-pointer border flex items-center justify-center ${
                    currentPage === 1
                      ? 'border-surface-200 text-surface-400 bg-surface-100 cursor-not-allowed'
                      : 'border-[#0f172a] bg-[#0f172a] text-white hover:bg-[#1e293b]'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4 text-[#00e5ff]" />
                </button>

                {Array.from({ length: Math.ceil(blogs.length / 6) }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => { setCurrentPage(num); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                    className={`w-9 h-9 rounded-full text-xs font-bold transition-all cursor-pointer border flex items-center justify-center ${
                      currentPage === num
                        ? 'bg-[#0f172a] text-white border-[#00e5ff] shadow-xs'
                        : 'bg-white text-[#0f172a] border-surface-200 hover:border-[#00e5ff]'
                    }`}
                  >
                    {num}
                  </button>
                ))}

                <button
                  onClick={() => { setCurrentPage(p => Math.min(Math.ceil(blogs.length / 6), p + 1)); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                  disabled={currentPage === Math.ceil(blogs.length / 6)}
                  aria-label="Next Page"
                  className={`w-9 h-9 rounded-full text-sm font-bold transition-all cursor-pointer border flex items-center justify-center ${
                    currentPage === Math.ceil(blogs.length / 6)
                      ? 'border-surface-200 text-surface-400 bg-surface-100 cursor-not-allowed'
                      : 'border-[#0f172a] bg-[#0f172a] text-white hover:bg-[#1e293b]'
                  }`}
                >
                  <ChevronRight className="w-4 h-4 text-[#00e5ff]" />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default BlogList;
