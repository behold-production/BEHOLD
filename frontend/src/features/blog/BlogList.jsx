import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, ArrowRight, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import ApiService from '../../services/api';
import greenTexture from '../../assets/greygreen.png';
import { getImageUrl } from '../../utils/formatters';
import defaultBlogImage from '../../assets/luxury_clinic_room.png';
import SEO from '../../components/common/SEO';
import { trackSearch, trackViewContent } from '../../utils/metaPixel';


const POSTS_PER_PAGE = 6;

const BlogList = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [allCategories, setAllCategories] = useState(['All']);

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
        // Build dynamic category list from actual blog data (like admin side)
        const cats = ['All', ...new Set(res.data.map(b => b.category).filter(Boolean))];
        setAllCategories(cats);
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
    if (searchQuery.trim()) {
      trackSearch({
        search_string: searchQuery.trim(),
        content_category: selectedCategory || 'All'
      });
    }
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

  const blogListSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "BEHOLD Mental Wellbeing & Psychology Articles",
    "description": "Explore thoughtful, evidence-informed insights on mental wellbeing, therapy, relationships, emotional health, parenting, and personal growth.",
    "url": "https://www.behold.co.in/blog",
    "publisher": {
      "@type": "Organization",
      "name": "BEHOLD",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.behold.co.in/favicon.png"
      }
    }
  };

  return (
    <>
      <SEO
        title="Insights & Research | Mental Wellbeing & Psychology Blog"
        description="Explore thoughtful, evidence-informed insights on mental wellbeing, therapy, relationships, emotional health, parenting, and personal growth."
        keywords="psychology blog, mental health articles, therapy insights, emotional wellbeing, parenting guidance, self care tips, BEHOLD blog"
        canonicalUrl="https://www.behold.co.in/blog"
        schema={blogListSchema}
      />
      <div className="min-h-screen flex flex-col bg-[#fbf8f1] text-[#0e1111] pt-20 pb-16 relative overflow-hidden select-none">

        {/* Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src={greenTexture?.src || greenTexture}
            alt=""
            className="w-full h-full object-cover object-center opacity-40 [mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)]"
          />
        </div>

        {/* Hero Header */}
        <section className="relative z-10 pt-6 pb-6 sm:pt-10 sm:pb-8 px-4 sm:px-6 lg:px-8 reveal-on-scroll">
          <div className="max-w-4xl mx-auto text-center">

            <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-[#0e7490] tracking-widest uppercase mb-4">
              <span className="w-5 h-px bg-[#0e7490]/60 inline-block" />
              Behold Insights &amp; Research
              <span className="w-5 h-px bg-[#0e7490]/60 inline-block" />
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-tight text-[#0e1111] leading-[1.15] mb-4">
              Understanding What Matters<span className="text-[#0e7490] drop-shadow-[0_0_10px_rgba(14,116,144,0.5)]">.</span>
            </h1>

            <p className="text-sm sm:text-base text-[#55605f] max-w-2xl mx-auto leading-relaxed font-medium mb-7">
              Evidence-informed insights on mental wellbeing, therapy, relationships, and personal growth — to help you understand yourself better.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto">
              <div className="relative flex items-center bg-white/95 backdrop-blur-md border border-[#e6dfd0] rounded-md shadow-sm focus-within:border-[#0e7490] focus-within:ring-2 focus-within:ring-[#0e7490]/20 transition-all overflow-hidden">
                <Search className="w-4 h-4 text-[#7c8785] absolute left-4 pointer-events-none shrink-0" />
                <input
                  type="text"
                  placeholder="Search articles or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-transparent text-[#0e1111] placeholder-[#9aa29f] text-sm font-medium outline-none"
                />
                <button
                  type="submit"
                  className="shrink-0 m-1.5 px-5 py-2 rounded-md bg-[#0e1111] hover:bg-[#0e7490] hover:text-white text-white font-semibold text-xs tracking-wider transition-all cursor-pointer border-none flex items-center gap-1.5 hover-scale-btn"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Category Pills - dynamically from blog data with smooth horizontal scroll on mobile */}
            <div className="mt-5 flex items-center gap-2 overflow-x-auto scrollbar-none py-1.5 px-1 sm:flex-wrap sm:justify-center max-w-full">
              {allCategories.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-md text-[11px] font-bold tracking-wider transition-all duration-200 cursor-pointer border whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-[#0e1111] text-white border-[#0e1111] shadow-sm'
                        : 'bg-white/90 text-[#3c4747] border-[#e6dfd0] hover:border-[#0e7490] hover:text-[#0e1111]'
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
          <div className="border-t border-[#e6dfd0] mb-7" />
        </div>

        {/* Blog Grid */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white border border-[#e6dfd0] rounded-md overflow-hidden shadow-sm flex flex-col h-96">
                  <div className="shimmer h-52 w-full shrink-0" />
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="shimmer h-4 w-3/4 rounded-md" />
                      <div className="shimmer h-3 w-full rounded-md" />
                      <div className="shimmer h-3 w-5/6 rounded-md" />
                    </div>
                    <div className="pt-4 border-t border-[#e6dfd0] flex items-center justify-between">
                      <div className="shimmer h-3 w-20 rounded-md" />
                      <div className="shimmer h-3 w-16 rounded-md" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-md border border-[#e6dfd0] shadow-sm max-w-lg mx-auto p-10 reveal-on-scroll">
              <div className="w-14 h-14 bg-[#0e7490]/10 text-[#0e7490] rounded-md flex items-center justify-center mx-auto mb-5 border border-[#0e7490]/20">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-semibold text-[#0e1111] mb-2 tracking-tight">No Articles Found</h3>
              <p className="text-[#55605f] font-medium text-sm">Try a different category or keyword to explore more articles.</p>
            </div>
          ) : (
            <>
              {/* Result info */}
              <p className="text-[11px] font-semibold text-[#7c8785] tracking-wider uppercase mb-5">
                {blogs.length} Article{blogs.length !== 1 ? 's' : ''} · Page {currentPage} of {totalPages || 1}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 items-stretch">
                {paginatedBlogs.map((post, idx) => {
                  const delayClass = idx === 0 ? 'reveal-delay-1' : idx === 1 ? 'reveal-delay-2' : idx === 2 ? 'reveal-delay-3' : 'reveal-delay-4';
                  const authorName = (typeof post.author === 'object' ? post.author?.name : post.author) || 'BEHOLD Editorial';
                  const authorRole = (typeof post.author === 'object' ? post.author?.role : null) || 'Senior Mentor';
                  const authorAvatar = typeof post.author === 'object' ? post.author?.avatar : null;
                  return (
                    <article
                      key={post._id || post.slug}
                      onClick={() => handleOpenBlog(post.slug)}
                      className={`group bg-white border border-[#e6dfd0] hover:border-[#0e7490]/60 rounded-md overflow-hidden transition-all duration-300 flex flex-col cursor-pointer shadow-sm hover:shadow-md h-full reveal-on-scroll reveal-scale-in ${delayClass}`}
                    >
                      {/* Cover Image */}
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#f1eadc] shrink-0">
                        <img
                          src={post.coverImage ? getImageUrl(post.coverImage) : (defaultBlogImage?.src || defaultBlogImage)}
                          alt={post.title}
                          onError={(e) => { e.target.onerror = null; e.target.src = defaultBlogImage?.src || defaultBlogImage; }}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0e1111]/75 via-[#0e1111]/10 to-transparent" />

                        <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-md bg-[#0e1111]/90 backdrop-blur-sm text-white border border-white/10 text-[10px] font-semibold tracking-widest uppercase">
                          {post.category || 'Career Guidance'}
                        </span>

                        <div className="absolute bottom-3.5 right-3.5 flex items-center gap-1 text-[10px] font-semibold text-[#0e1111] bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm">
                          <Clock className="w-3 h-3 text-[#0e7490]" />
                          <span>{post.readTime || '5 min'}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4">
                        <div className="space-y-2">
                          <h2 className="text-base sm:text-[17px] font-semibold text-[#0e1111] group-hover:text-[#0e7490] transition-colors leading-snug tracking-tight line-clamp-2">
                            {post.title}
                          </h2>
                          <p className="text-xs sm:text-sm text-[#55605f] line-clamp-2 leading-relaxed font-normal">
                            {post.excerpt}
                          </p>
                        </div>

                        {/* Author & CTA */}
                        <div className="pt-4 border-t border-[#e6dfd0] flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#0e1111] to-[#0e7490] text-[#0e7490] flex items-center justify-center font-semibold text-xs overflow-hidden shrink-0">
                              {authorAvatar ? (
                                <img src={getImageUrl(authorAvatar)} alt={authorName} className="w-full h-full object-cover" />
                              ) : (
                                <span>{authorName.charAt(0).toUpperCase() || 'B'}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-semibold text-[#0e1111] truncate leading-tight">
                                {authorName}
                              </h4>
                              <p className="text-[10px] text-[#7c8785] font-semibold tracking-wider truncate">
                                {authorRole}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#0e7490] group-hover:text-[#0e7490] group-hover:translate-x-0.5 transition-all shrink-0">
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
                    className={`w-9 h-9 rounded-md flex items-center justify-center border font-semibold transition-all hover-scale-btn ${
                      currentPage === 1
                        ? 'border-[#e6dfd0] text-[#bdb6a6] bg-white cursor-not-allowed'
                        : 'border-[#e6dfd0] bg-white text-[#55605f] hover:bg-[#0e7490] hover:text-white hover:border-[#0e7490] cursor-pointer'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {getPageNumbers().map((num) => (
                    <button
                      key={num}
                      onClick={() => goToPage(num)}
                      className={`w-9 h-9 rounded-md flex items-center justify-center border text-xs font-semibold transition-all cursor-pointer hover-scale-btn ${
                        currentPage === num
                          ? 'bg-[#0e1111] text-white border-[#0e1111] shadow-sm'
                          : 'bg-white text-[#55605f] border-[#e6dfd0] hover:border-[#0e7490] hover:text-[#0e1111]'
                      }`}
                    >
                      {num}
                    </button>
                  ))}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="w-9 h-9 flex items-center justify-center text-[#7c8785] text-xs font-semibold select-none">…</span>
                      <button
                        onClick={() => goToPage(totalPages)}
                        className="w-9 h-9 rounded-md flex items-center justify-center border text-xs font-semibold bg-white text-[#55605f] border-[#e6dfd0] hover:border-[#0e7490] hover:text-[#0e1111] cursor-pointer hover-scale-btn"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Next Page"
                    className={`w-9 h-9 rounded-md flex items-center justify-center border font-semibold transition-all hover-scale-btn ${
                      currentPage === totalPages
                        ? 'border-[#e6dfd0] text-[#bdb6a6] bg-white cursor-not-allowed'
                        : 'border-[#e6dfd0] bg-white text-[#55605f] hover:bg-[#0e7490] hover:text-white hover:border-[#0e7490] cursor-pointer'
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
