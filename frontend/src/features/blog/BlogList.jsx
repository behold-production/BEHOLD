import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, ArrowRight, BookOpen, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 pt-24 pb-20 selection:bg-brand selection:text-white">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 right-0 h-[500px] overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand/10 blur-[120px] rounded-full opacity-60" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      {/* Hero Header */}
      <section className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter text-slate-900 max-w-4xl mx-auto leading-[1.1]">
            Scientific Insights For <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-[#00a3cc]">Future Leaders</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            In-depth career roadmaps, stream selection psychology, C-DAT research, and parenting frameworks authored by CIGI mentors.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-10 max-w-2xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand/10 to-brand/0 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative flex items-center bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl focus-within:border-brand/40 transition-all p-1.5">
              <Search className="w-5 h-5 text-slate-400 absolute left-5" />
              <input
                type="text"
                placeholder="Search articles, streams, or guidance topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-32 py-4 bg-transparent text-slate-900 placeholder-slate-400 text-sm font-medium outline-none"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 px-6 rounded-xl bg-brand hover:bg-[#00d0e6] text-white font-black text-xs uppercase tracking-widest transition-all shadow-md shadow-brand/20 cursor-pointer border-none flex items-center gap-2"
              >
                Search
              </button>
            </div>
          </form>

          {/* Category Pill Tabs */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-3">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer border backdrop-blur-md ${
                    active
                      ? 'bg-brand text-white border-brand shadow-[0_0_15px_rgba(0,229,255,0.2)] scale-105'
                      : 'bg-white/80 text-slate-500 border-slate-200 hover:border-brand/30 hover:text-slate-900 hover:bg-white'
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
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full relative z-10">
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="w-12 h-12 border-4 border-zinc-800 border-t-brand rounded-full animate-spin"></div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-24 bg-white/60 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-xl max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-brand/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-brand opacity-90" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3">No Articles Found</h3>
            <p className="text-slate-500 font-medium max-w-md mx-auto">Try adjusting your category filter or search keywords to find what you're looking for.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((post) => (
              <article
                key={post._id || post.slug}
                onClick={() => handleOpenBlog(post.slug)}
                className="group relative bg-white border border-slate-200/60 hover:border-brand/30 rounded-[24px] overflow-hidden transition-all duration-500 flex flex-col cursor-pointer shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/60 hover:-translate-y-2 h-full"
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Cover Image */}
                <div className="relative h-60 w-full overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src={post.coverImage || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80'}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

                  <span className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-md border border-white/50 text-brand text-[10px] font-black tracking-widest uppercase shadow-sm">
                    {post.category || 'Career Guidance'}
                  </span>

                  <div className="absolute bottom-4 right-4 flex items-center gap-1.5 text-[10px] font-bold text-slate-800 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/50 shadow-sm uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-brand" />
                    <span>{post.readTime || '5 min read'}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6 relative z-10">
                  <div className="space-y-4">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-brand transition-colors line-clamp-2 leading-tight tracking-tight">
                      {post.title}
                    </h2>
                    <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed font-medium">
                      {post.excerpt}
                    </p>
                  </div>

                  {/* Author */}
                  <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand/5 border border-brand/10 flex items-center justify-center text-brand font-black text-sm overflow-hidden shrink-0 shadow-sm">
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
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider line-clamp-1 mt-0.5">
                          {post.author?.role || 'Senior Mentor'}
                        </p>
                      </div>
                    </div>

                    <div className="text-[11px] font-black text-brand flex items-center gap-1.5 group-hover:translate-x-1.5 transition-transform uppercase tracking-widest bg-brand/5 px-3 py-1.5 rounded-md group-hover:bg-brand/10">
                      <span>Read</span>
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
