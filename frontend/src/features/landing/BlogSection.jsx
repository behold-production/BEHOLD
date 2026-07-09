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
    <section className="py-16 md:py-24 bg-transparent max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-header tracking-tight text-slate-900">
            Latest From <span className="text-[#00A3B8]">Behold Aspire</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
            Research-backed career roadmaps, stream selection strategies, and psychological guidance authored by CIGI mentors.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAllBlogs}
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-[#00E5FF] text-white hover:text-slate-900 font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 shadow-md hover:scale-105 active:scale-95 border-none cursor-pointer shrink-0"
        >
          <span>Explore All Articles</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {blogs.slice(0, 6).map((post) => (
          <article
            key={post._id || post.slug}
            onClick={() => handleOpenBlog(post.slug)}
            className="group bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#00E5FF] rounded-2xl overflow-hidden transition-all duration-300 flex flex-col cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1.5 h-full"
          >
            {/* Cover Image Container */}
            <div className="relative h-52 w-full overflow-hidden bg-slate-100 shrink-0">
              <img
                src={post.coverImage || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80'}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Category Badge */}
              <span className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-white/95 backdrop-blur-md border border-slate-200 text-[#008899] text-[11px] font-black tracking-wider uppercase shadow-sm">
                {post.category || 'Career Guidance'}
              </span>

              {/* Read Time */}
              <div className="absolute bottom-3 right-4 flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md border border-slate-200 shadow-xs">
                <Clock className="w-3.5 h-3.5 text-[#00A3B8]" />
                <span>{post.readTime || '5 min read'}</span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <h3 className="text-lg sm:text-xl font-bold font-header text-slate-900 group-hover:text-[#008899] transition-colors line-clamp-2 leading-snug">
                  {post.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              {/* Author & Read Action */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#00E5FF]/20 border border-[#00A3B8] flex items-center justify-center text-[#008899] font-bold text-xs overflow-hidden shrink-0">
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
    </section>
  );
};

export default BlogSection;
