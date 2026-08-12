import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, ArrowRight, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import ApiService from '../../services/api';
import greenTexture from '../../assets/greygreen.png';
import { getImageUrl } from '../../utils/formatters';
import defaultBlogImage from '../../assets/luxury_clinic_room.png';
import SEO from '../../components/common/SEO';

const CATEGORIES = [
  'All',
  'Mental Wellbeing',
  'Therapy & Relationships',
  'Emotional Health',
  'Parenting & Education',
  'Personal Growth'
];

const POSTS_PER_PAGE = 6;

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

  const totalPages = Math.ceil(blogs.length / POSTS_PER_PAGE);
  const paginatedBlogs = blogs.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  const goToPage = (p) => {
    setCurrentPage(Math.min(Math.max(1, p), totalPages));
    window.scrollTo({ top: 280, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <>
      <SEO
        title="Insights & Research"
        description="Explore thoughtful, evidence-informed insights on mental wellbeing, therapy, relationships, emotional health, parenting, and personal growth."
        canonicalUrl={typeof window !== 'undefined' ? window.location.origin + '/blog' : undefined}
      />
      <div className="min-h-screen flex flex-col text-slate-900 pt-20 pb-16 relative overflow-hidden select-none">

        {/* Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src={greenTexture}
            alt=""
            className="w-full h-full object-cover object-center opacity-40 [mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)]"
          />
        </div>

        {/* Hero Header */}
        <section className="relative z-10 pt-6 pb-6 sm:pt-10 sm:pb-8 px-4 sm:px-6 lg:px-8 reveal-on-scroll">
          <div className="max-w-4xl mx-auto text-center">

            <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold text-[#00c9d6] tracking-widest uppercase mb-4">
              <span className="w-5 h-px bg-[#00c9d6]/60 inline-block" />
              Behold Insights &amp; Research
              <span className="w-5 h-px bg-[#00c9d6]/60 inline-block" />
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black tracking-tight text-slate-900 leading-[1.15] mb-4">
              Understanding What Matters<span className="text-[#00c9d6] drop-shadow-[0_0_10px_rgba(0,201,214,0.5)]">.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium mb-7">
              Evidence-informed insights on mental wellbeing, therapy, relationships, and personal growth — to help you understand yourself better.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto">
              <div className="relative flex items-center bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-sm focus-within:border-[#00c9d6] focus-within:ring-2 focus-within:ring-[#00c9d6]/20 transition-all overflow-hidden">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none shrink-0" />
                <input
                  type="text"
                  placeholder="Search articles or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-transparent text-slate-900 placeholder-slate-400 text-sm font-medium outline-none"
                />
                <button
                  type="submit"
                  className="shrink-0 m-1.5 px-5 py-2 rounded-xl bg-[#0f172a] hover:bg-[#00c9d6] hover:text-slate-950 text-white font-bold text-xs tracking-wider transition-all cursor-pointer border-none flex items-center gap-1.5 hover-scale-btn"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Category Pills */}
            <div className="mt-5 flex flex-wrap justify-center items-center gap-2">
              {CATEGORIES.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-xl text-[11px] font-bold tracking-wider transition-all duration-200 cursor-pointer border ${
                      active
                        ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-sm'
                        : 'bg-white/90 text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="border-t border-slate-200/70 mb-7" />
        </div>

        {/* Blog Grid */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-96">
                  <div className="shimmer h-52 w-full shrink-0" />
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="shimmer h-4 w-3/4 rounded-md" />
                      <div className="shimmer h-3 w-full rounded-md" />
                      <div className="shimmer h-3 w-5/6 rounded-md" />
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="shimmer h-3 w-20 rounded-md" />
                      <div className="shimmer h-3 w-16 rounded-md" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-lg mx-auto p-10 reveal-on-scroll">
              <div className="w-14 h-14 bg-[#00c9d6]/10 text-[#007078] rounded-2xl flex items-center justify-center mx-auto mb-5 border border-[#00c9d6]/20">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2 tracking-tight">No Articles Found</h3>
              <p className="text-slate-500 font-medium text-sm">Try a different category or keyword to explore more articles.</p>
            </div>
          ) : (
            <>
              {/* Result info */}
              <p className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase mb-5">
                {blogs.length} Article{blogs.length !== 1 ? 's' : ''} · Page {currentPage} of {totalPages || 1}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 items-stretch">
                {paginatedBlogs.map((post, idx) => {
                  const delayClass = idx === 0 ? 'reveal-delay-1' : idx === 1 ? 'reveal-delay-2' : idx === 2 ? 'reveal-delay-3' : 'reveal-delay-4';
                  return (
                    <article
                      key={post._id || post.slug}
                      onClick={() => handleOpenBlog(post.slug)}
                      className={`group bg-white border border-slate-200/80 hover:border-[#00c9d6]/60 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col cursor-pointer shadow-sm hover:shadow-md h-full reveal-on-scroll reveal-scale-in ${delayClass}`}
                    >
                      {/* Cover Image */}
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 shrink-0">
                        <img
                          src={post.coverImage ? getImageUrl(post.coverImage) : defaultBlogImage}
                          alt={post.title}
                          onError={(e) => { e.target.onerror = null; e.target.src = defaultBlogImage; }}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent" />

                        <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-xl bg-[#0f172a]/90 backdrop-blur-sm text-white border border-white/10 text-[10px] font-black tracking-widest uppercase">
                          {post.category || 'Career Guidance'}
                        </span>

                        <div className="absolute bottom-3.5 right-3.5 flex items-center gap-1 text-[10px] font-bold text-slate-900 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-xl shadow-sm">
                          <Clock className="w-3 h-3 text-[#007078]" />
                          <span>{post.readTime || '5 min'}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4">
                        <div className="space-y-2">
                          <h2 className="text-base sm:text-[17px] font-black text-slate-900 group-hover:text-[#007078] transition-colors leading-snug tracking-tight line-clamp-2">
                            {post.title}
                          </h2>
                          <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed font-normal">
                            {post.excerpt}
                          </p>
                        </div>

                        {/* Author & CTA */}
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0f172a] to-[#1e3a5f] text-[#00c9d6] flex items-center justify-center font-black text-xs overflow-hidden shrink-0">
                              {post.author?.avatar ? (
                                <img src={getImageUrl(post.author.avatar)} alt={post.author.name} className="w-full h-full object-cover" />
                              ) : (
                                <span>{(post.author?.name || 'B')[0]}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 truncate leading-tight">
                                {post.author?.name || 'BEHOLD Editorial'}
                              </h4>
                              <p className="text-[10px] text-slate-400 font-semibold tracking-wider truncate">
                                {post.author?.role || 'Senior Mentor'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-[11px] font-bold text-[#007078] group-hover:text-[#00c9d6] group-hover:translate-x-0.5 transition-all shrink-0">
                            <span>Read</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 pt-12">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Previous Page"
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border font-bold transition-all hover-scale-btn ${
                      currentPage === 1
                        ? 'border-slate-200 text-slate-300 bg-white cursor-not-allowed'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-[#0f172a] hover:text-white hover:border-[#0f172a] cursor-pointer'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {getPageNumbers().map((num) => (
                    <button
                      key={num}
                      onClick={() => goToPage(num)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center border text-xs font-bold transition-all cursor-pointer hover-scale-btn ${
                        currentPage === num
                          ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-900'
                      }`}
                    >
                      {num}
                    </button>
                  ))}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="w-9 h-9 flex items-center justify-center text-slate-400 text-xs font-bold select-none">…</span>
                      <button
                        onClick={() => goToPage(totalPages)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center border text-xs font-bold bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-900 cursor-pointer hover-scale-btn"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Next Page"
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border font-bold transition-all hover-scale-btn ${
                      currentPage === totalPages
                        ? 'border-slate-200 text-slate-300 bg-white cursor-not-allowed'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-[#0f172a] hover:text-white hover:border-[#0f172a] cursor-pointer'
                    }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
};

export default BlogList;
