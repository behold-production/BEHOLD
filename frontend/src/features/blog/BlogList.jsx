import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, ArrowRight, BookOpen } from 'lucide-react';
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

  useEffect(() => {
    document.title = 'Career Guidance & Student Articles | Behold Aspire';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 pt-28 pb-20 selection:bg-[#00E5FF] selection:text-slate-900">
      {/* Hero Header */}
      <section className="relative py-12 sm:py-16 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-header tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
            Scientific Insights For <span className="text-[#008899]">Future Leaders</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            In-depth career roadmaps, stream selection psychology, C-DAT research, and parenting frameworks authored by CIGI mentors.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-8 max-w-xl mx-auto">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search articles, streams, or guidance topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-28 py-4 rounded-2xl bg-white border border-slate-200 focus:border-[#008899] text-slate-900 placeholder-slate-400 text-sm font-medium outline-none shadow-md transition-all"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-4" />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 px-5 rounded-xl bg-slate-900 hover:bg-[#008899] text-white font-black text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer border-none"
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
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    active
                      ? 'bg-[#008899] text-white border-[#008899] shadow-md scale-105 font-black'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-[#008899] hover:text-slate-900'
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
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="w-10 h-10 border-4 border-[#008899] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <BookOpen className="w-12 h-12 text-[#008899] mx-auto mb-4 opacity-75" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Articles Found</h3>
            <p className="text-sm text-slate-500">Try adjusting your category filter or search keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((post) => (
              <article
                key={post._id || post.slug}
                onClick={() => handleOpenBlog(post.slug)}
                className="group bg-white hover:bg-slate-50/50 border border-slate-200 hover:border-[#008899] rounded-2xl overflow-hidden transition-all duration-300 flex flex-col cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1.5 h-full"
              >
                {/* Cover Image */}
                <div className="relative h-56 w-full overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src={post.coverImage || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80'}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  <span className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-white/95 backdrop-blur-md border border-slate-200 text-[#008899] text-[11px] font-black tracking-wider uppercase shadow-sm">
                    {post.category || 'Career Guidance'}
                  </span>

                  <div className="absolute bottom-3 right-4 flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md border border-slate-200 shadow-xs">
                    <Clock className="w-3.5 h-3.5 text-[#008899]" />
                    <span>{post.readTime || '5 min read'}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <h2 className="text-xl font-bold font-header text-slate-900 group-hover:text-[#008899] transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h2>
                    <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>

                  {/* Author */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#00E5FF]/20 border border-[#008899] flex items-center justify-center text-[#008899] font-bold text-sm overflow-hidden shrink-0">
                        {post.author?.avatar ? (
                          <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{(post.author?.name || 'B')[0]}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                          {post.author?.name || 'Editorial Team'}
                        </h4>
                        <p className="text-[10px] text-slate-500 line-clamp-1">
                          {post.author?.role || 'Senior Mentor'}
                        </p>
                      </div>
                    </div>

                    <div className="text-xs font-black text-[#008899] flex items-center gap-1 group-hover:translate-x-1.5 transition-transform">
                      <span>Read Article</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default BlogList;
