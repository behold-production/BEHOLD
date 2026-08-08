import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, ArrowRight, BookOpen, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import ApiService from '../../services/api';
import greenTexture from '../../assets/greygreen.png';
import { getImageUrl } from '../../utils/formatters';
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
    <div className="min-h-screen flex flex-col text-slate-900 pt-24 pb-20 relative overflow-hidden select-none">
      {/* Seamless Smooth Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={greenTexture}
          alt=""
          className="w-full h-full object-cover object-center opacity-40 [mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)]"
        />
      </div>

      {/* Hero Header Section */}
      <section className="relative z-10 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 reveal-on-scroll">
        <div className="max-w-5xl mx-auto text-center space-y-5">
          <span className="text-xs font-bold tracking-widest text-[#00c9d6] flex items-center justify-center gap-1.5 mb-1">
            BEHOLD INSIGHTS & RESEARCH
          </span>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-sans font-bold tracking-tight text-slate-900 max-w-4xl mx-auto leading-none">
            Scientific Insights For <span className="text-slate-900">Future Leaders</span><span className="text-[#00c9d6] drop-shadow-[0_0_8px_rgba(0,201,214,0.6)] font-bold">.</span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            In-depth career roadmaps, stream selection psychology, C-DAT research, and parenting frameworks authored by CIGI mentors.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-8 max-w-2xl mx-auto relative">
            <div className="relative flex items-center bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-full shadow-md focus-within:border-[#00c9d6] focus-within:ring-2 focus-within:ring-[#00c9d6]/20 transition-all p-1.5">
              <Search className="w-5 h-5 text-slate-400 absolute left-5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search articles, streams, or guidance topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-32 py-3 bg-transparent text-slate-900 placeholder-slate-400 text-sm font-medium outline-none"
              />
              <button
                type="submit"
                className="absolute right-2 top-1.5 bottom-1.5 px-6 rounded-full bg-[#0f172a] hover:bg-[#00c9d6] hover:text-slate-950 text-white font-bold text-xs tracking-wider transition-all cursor-pointer shadow-sm hover-scale-btn border-none flex items-center justify-center gap-1.5"
              >
                Search
              </button>
            </div>
          </form>

          {/* Category Pill Tabs */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-2.5">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wider transition-all duration-300 cursor-pointer border ${
                    active
                      ? 'bg-[#0f172a] text-white border-[#00c9d6] shadow-md scale-105'
                      : 'bg-white/90 text-slate-700 border-slate-200 hover:border-[#00c9d6] hover:text-slate-950'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Blog Grid Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative z-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white/90 border border-slate-200 rounded-2xl overflow-hidden shadow-md flex flex-col h-96">
                <div className="shimmer h-56 w-full shrink-0" />
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
          <div className="text-center py-20 bg-white/95 rounded-2xl border border-slate-200 shadow-md max-w-2xl mx-auto p-8 reveal-on-scroll">
            <div className="w-16 h-16 bg-[#00c9d6]/10 text-[#007078] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#00c9d6]/20">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">No Articles Found</h3>
            <p className="text-slate-600 font-medium text-sm max-w-md mx-auto">Try adjusting your category filter or search keywords to find what you're looking for.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              {blogs.slice((currentPage - 1) * 6, currentPage * 6).map((post, idx) => {
                const delayClass = idx === 0 ? 'reveal-delay-1' : idx === 1 ? 'reveal-delay-2' : idx === 2 ? 'reveal-delay-3' : 'reveal-delay-4';
                return (
                  <article
                    key={post._id || post.slug}
                    onClick={() => handleOpenBlog(post.slug)}
                    className={`group relative bg-white/95 backdrop-blur-md border border-slate-200/90 hover:border-[#00c9d6]/80 rounded-2xl overflow-hidden transition-all duration-500 flex flex-col justify-between cursor-pointer shadow-md hover-scale-card h-full reveal-on-scroll reveal-scale-in ${delayClass}`}
                  >
                    {/* Cover Image */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900 shrink-0">
                      <img
                        src={post.coverImage ? getImageUrl(post.coverImage) : defaultBlogImage}
                        alt={post.title}
                        onError={(e) => { e.target.onerror = null; e.target.src = defaultBlogImage; }}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent opacity-80" />

                      <span className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-[#0f172a]/90 backdrop-blur-md text-white border border-[#00c9d6]/40 text-[10px] font-bold tracking-wider shadow-md">
                        {post.category || 'Career Guidance'}
                      </span>

                      <div className="absolute bottom-4 right-4 flex items-center gap-1.5 text-[10px] font-bold text-slate-900 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200 shadow-sm tracking-wider">
                        <Clock className="w-3.5 h-3.5 text-[#007078]" />
                        <span>{post.readTime || '5 min read'}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-5">
                      <div className="space-y-3">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#007078] transition-colors leading-snug tracking-tight line-clamp-2">
                          {post.title}
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed font-normal">
                          {post.excerpt}
                        </p>
                      </div>

                      {/* Author & CTA Row */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#0f172a] text-[#00c9d6] border border-[#00c9d6]/30 flex items-center justify-center font-bold text-xs overflow-hidden shrink-0 shadow-sm">
                            {post.author?.avatar ? (
                              <img src={getImageUrl(post.author.avatar)} alt={post.author.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{(post.author?.name || 'B')[0]}</span>
                            )}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                              {post.author?.name || 'BEHOLD Editorial'}
                            </h4>
                            <p className="text-[10px] text-slate-500 font-semibold tracking-wider line-clamp-1">
                              {post.author?.role || 'Senior Mentor'}
                            </p>
                          </div>
                        </div>

                        <div className="text-[11px] font-bold text-[#007078] flex items-center gap-1.5 tracking-wider group-hover:translate-x-1 transition-transform shrink-0">
                          <span>Read</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination Bar */}
            {Math.ceil(blogs.length / 6) > 1 && (
              <div className="flex items-center justify-center gap-2 pt-12">
                <button
                  onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                  disabled={currentPage === 1}
                  aria-label="Previous Page"
                  className={`w-10 h-10 rounded-full text-sm font-bold transition-all cursor-pointer border flex items-center justify-center hover-scale-btn ${
                    currentPage === 1
                      ? 'border-slate-200 text-slate-400 bg-slate-100 cursor-not-allowed'
                      : 'border-slate-900 bg-[#0f172a] text-white hover:bg-[#00c9d6] hover:text-slate-950'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4 text-[#00c9d6]" />
                </button>

                {Array.from({ length: Math.ceil(blogs.length / 6) }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => { setCurrentPage(num); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                    className={`w-10 h-10 rounded-full text-xs font-bold transition-all cursor-pointer border flex items-center justify-center hover-scale-btn ${
                      currentPage === num
                        ? 'bg-[#0f172a] text-white border-[#00c9d6] shadow-md scale-105'
                        : 'bg-white text-slate-900 border-slate-200 hover:border-[#00c9d6]'
                    }`}
                  >
                    {num}
                  </button>
                ))}

                <button
                  onClick={() => { setCurrentPage(p => Math.min(Math.ceil(blogs.length / 6), p + 1)); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                  disabled={currentPage === Math.ceil(blogs.length / 6)}
                  aria-label="Next Page"
                  className={`w-10 h-10 rounded-full text-sm font-bold transition-all cursor-pointer border flex items-center justify-center hover-scale-btn ${
                    currentPage === Math.ceil(blogs.length / 6)
                      ? 'border-slate-200 text-slate-400 bg-slate-100 cursor-not-allowed'
                      : 'border-slate-900 bg-[#0f172a] text-white hover:bg-[#00c9d6] hover:text-slate-950'
                  }`}
                >
                  <ChevronRight className="w-4 h-4 text-[#00c9d6]" />
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
