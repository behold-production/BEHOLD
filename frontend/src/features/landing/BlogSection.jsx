import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowRight, Sparkles } from 'lucide-react';
import ApiService from '../../shared/services/api';
import { DEFAULT_BLOGS_DATA } from '../blog/defaultBlogsData';

const BlogSection = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState(DEFAULT_BLOGS_DATA);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await ApiService.getBlogs({ limit: 3 });
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setBlogs(res.data);
        }
      } catch (err) {
        console.warn('Using fallback default blog data for landing section:', err);
      }
    };
    fetchBlogs();
  }, []);

  const handleOpenBlog = (slug) => {
    navigate(`/blog/${slug}`);
  };

  const handleOpenAllBlogs = () => {
    navigate('/blog');
  };

  return (
    <section className="py-16 md:py-24 bg-slate-50 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 right-0 h-[500px] pointer-events-none z-0">
        <div className="absolute -top-40 right-0 w-[600px] h-[600px] bg-brand/5 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-4">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-slate-900 leading-tight">
              Latest From <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-[#00a3cc]">Behold Aspire</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed font-medium">
              Research-backed career roadmaps, stream selection strategies, and psychological guidance authored by CIGI mentors.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAllBlogs}
            className="group inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-brand/30 text-slate-900 font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 cursor-pointer shrink-0"
          >
            <span>Explore All Articles</span>
            <ArrowRight className="w-4 h-4 text-brand group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Blog Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogs.slice(0, 3).map((post) => (
            <article
              key={post._id || post.slug}
              onClick={() => handleOpenBlog(post.slug)}
              className="group relative bg-white border border-slate-200/60 hover:border-brand/30 rounded-[24px] overflow-hidden transition-all duration-500 flex flex-col cursor-pointer shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/60 hover:-translate-y-2 h-full"
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              {/* Cover Image Container */}
              <div className="relative h-60 w-full overflow-hidden bg-slate-100 shrink-0">
                <img
                  src={post.coverImage || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80'}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

                {/* Category Badge */}
                <span className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-md border border-white/50 text-brand text-[10px] font-black tracking-widest uppercase shadow-sm">
                  {post.category || 'Career Guidance'}
                </span>

                {/* Read Time */}
                <div className="absolute bottom-4 right-4 flex items-center gap-1.5 text-[10px] font-bold text-slate-800 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/50 shadow-sm uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-brand" />
                  <span>{post.readTime || '5 min read'}</span>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6 relative z-10">
                <div className="space-y-4">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-brand transition-colors line-clamp-2 leading-tight tracking-tight">
                    {post.title}
                  </h3>
                  <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed font-medium">
                    {post.excerpt}
                  </p>
                </div>

                {/* Author & Read Action */}
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
      </div>
    </section>
  );
};

export default BlogSection;
