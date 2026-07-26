import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, ArrowRight, BookOpen, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import ApiService from '../../shared/services/api';
import { DEFAULT_BLOGS_DATA } from './defaultBlogsData';

const CATEGORIES = [
  'All',
  'Career Guidance',
  'Aptitude Assessment',
  'Psychological Wellbeing',
  'Parenting & Education'
];

const BlogList = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState(DEFAULT_BLOGS_DATA);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  const fetchBlogs = async () => {
    setLoading(true);
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
        let filtered = DEFAULT_BLOGS_DATA;
        if (selectedCategory && selectedCategory !== 'All') {
          filtered = filtered.filter(b => b.category === selectedCategory);
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(b => b.title.toLowerCase().includes(q) || b.excerpt.toLowerCase().includes(q));
        }
        setBlogs(filtered);
      }
    } catch (err) {
      console.warn('Using local fallback blog list:', err);
      let filtered = DEFAULT_BLOGS_DATA;
      if (selectedCategory && selectedCategory !== 'All') {
        filtered = filtered.filter(b => b.category === selectedCategory);
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(b => b.title.toLowerCase().includes(q) || b.excerpt.toLowerCase().includes(q));
      }
      setBlogs(filtered);
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
    <div className="min-h-screen flex flex-col bg-[#f7f4ef] text-[#1c1514] pt-24 pb-20 border-b border-[#e2dad2]">
      
      {/* Hero Header */}
      <section className="relative z-10 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#7c7069] block mb-1">
            BEHOLD INSIGHTS & RESEARCH
          </span>

          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-sans font-black uppercase tracking-tight text-[#1c1514] max-w-4xl mx-auto leading-[0.98]">
            Scientific Insights For <span className="text-[#2b211e]">Future Leaders</span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-[#6e635e] max-w-2xl mx-auto leading-relaxed font-normal">
            In-depth career roadmaps, stream selection psychology, C-DAT research, and parenting frameworks authored by CIGI mentors.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-8 max-w-2xl mx-auto relative">
            <div className="relative flex items-center bg-white border border-[#d6cecb] rounded-full shadow-xs focus-within:border-[#1c1514] transition-all p-1.5">
              <Search className="w-5 h-5 text-[#8a7e77] absolute left-5" />
              <input
                type="text"
                placeholder="Search articles, streams, or guidance topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-32 py-3 bg-transparent text-[#1c1514] placeholder-[#8a7e77] text-sm font-medium outline-none"
              />
              <button
                type="submit"
                className="absolute right-2 top-1.5 bottom-1.5 px-6 rounded-full bg-[#2b211e] hover:bg-[#1c1514] text-[#f7f4ef] font-bold text-xs uppercase tracking-widest transition-all cursor-pointer border-none flex items-center gap-2"
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
                      ? 'bg-[#2b211e] text-[#f7f4ef] border-[#2b211e] shadow-xs'
                      : 'bg-white/90 text-[#6e635e] border-[#d8d0c7] hover:border-[#1c1514] hover:text-[#1c1514]'
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
          <div className="flex justify-center items-center py-24">
            <div className="w-8 h-8 border-2 border-[#2b211e] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#d6cecb] shadow-xs max-w-2xl mx-auto p-8">
            <div className="w-16 h-16 bg-[#eae4dc] rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-[#2b211e]" />
            </div>
            <h3 className="text-xl font-bold text-[#1c1514] mb-2 uppercase">No Articles Found</h3>
            <p className="text-[#6e635e] font-normal text-sm max-w-md mx-auto">Try adjusting your category filter or search keywords to find what you're looking for.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              {blogs.slice((currentPage - 1) * 6, currentPage * 6).map((post) => (
                <article
                  key={post._id || post.slug}
                  onClick={() => handleOpenBlog(post.slug)}
                  className="group relative bg-white border border-[#d6cecb] hover:border-[#1c1514] rounded-2xl overflow-hidden transition-all duration-300 flex flex-col cursor-pointer shadow-xs hover:shadow-md h-full justify-between"
                >
                  {/* Cover Image */}
                  <div className="relative h-56 w-full overflow-hidden bg-[#eae4dc] shrink-0">
                    <img
                      src={post.coverImage || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80'}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1c1514]/50 to-transparent opacity-50" />

                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#1c1514] text-[#f7f4ef] text-[10px] font-bold tracking-widest uppercase shadow-xs">
                      {post.category || 'Career Guidance'}
                    </span>

                    <div className="absolute bottom-4 right-4 flex items-center gap-1.5 text-[10px] font-bold text-[#1c1514] bg-white/95 backdrop-blur-md px-3 py-1 rounded-full border border-[#d8d0c7] shadow-xs uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5 text-[#2b211e]" />
                      <span>{post.readTime || '5 min read'}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      <h2 className="text-lg sm:text-xl font-bold text-[#1c1514] group-hover:text-[#2b211e] transition-colors line-clamp-2 leading-tight tracking-tight">
                        {post.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-[#6e635e] line-clamp-3 leading-relaxed font-normal">
                        {post.excerpt}
                      </p>
                    </div>

                    {/* Author */}
                    <div className="pt-5 border-t border-[#eae4dc] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#eae4dc] border border-[#d8d0c7] flex items-center justify-center text-[#1c1514] font-bold text-xs overflow-hidden shrink-0 shadow-xs">
                          {post.author?.avatar ? (
                            <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{(post.author?.name || 'B')[0]}</span>
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#1c1514] line-clamp-1">
                            {post.author?.name || 'Editorial Team'}
                          </h4>
                          <p className="text-[10px] text-[#7c7069] font-medium uppercase tracking-wider line-clamp-1">
                            {post.author?.role || 'Senior Mentor'}
                          </p>
                        </div>
                      </div>

                      <div className="text-[11px] font-bold text-[#1c1514] flex items-center gap-1 group-hover:translate-x-1 transition-transform uppercase tracking-widest">
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
                      ? 'border-[#d8d0c7] text-[#a39891] bg-[#ebe5df] cursor-not-allowed'
                      : 'border-[#2b211e] bg-[#2b211e] text-[#f7f4ef] hover:bg-[#1c1514]'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: Math.ceil(blogs.length / 6) }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => { setCurrentPage(num); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                    className={`w-9 h-9 rounded-full text-xs font-bold transition-all cursor-pointer border flex items-center justify-center ${
                      currentPage === num
                        ? 'bg-[#2b211e] text-[#f7f4ef] border-[#2b211e] shadow-xs'
                        : 'bg-white text-[#2b211e] border-[#d8d0c7] hover:border-[#1c1514]'
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
                      ? 'border-[#d8d0c7] text-[#a39891] bg-[#ebe5df] cursor-not-allowed'
                      : 'border-[#2b211e] bg-[#2b211e] text-[#f7f4ef] hover:bg-[#1c1514]'
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
  );
};

export default BlogList;
