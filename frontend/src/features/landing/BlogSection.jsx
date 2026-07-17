import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import ApiService from '../../shared/services/api';
import { DEFAULT_BLOGS_DATA } from '../blog/defaultBlogsData';
import { ScrollDot, renderTitleWithFullstopDot } from '../../shared/components/BrandDot';

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-16 md:py-24 bg-slate-50 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 right-0 h-[500px] pointer-events-none z-0">
        <div className="absolute -top-40 right-0 w-[600px] h-[600px] bg-brand/5 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-baseline gap-1 mb-4">
            <span className="text-sm font-bold tracking-widest uppercase text-blue-600">Our Knowledge Base</span>
            <ScrollDot nextId="blog-grid" label="Scroll to Articles ↓" size="xs" inlineText={true} />
          </div>
          <h2 id="blog-title" className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-slate-900 leading-tight mb-4 flex items-center justify-center flex-wrap">
            {renderTitleWithFullstopDot('Latest From Behold Aspire', 'blog-grid', 'Scroll to Articles ↓', 'md')}
          </h2>
          <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium mb-8">
            Research-backed career roadmaps, stream selection strategies, and psychological guidance authored by CIGI mentors.
          </p>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleOpenAllBlogs}
              className="px-8 py-3.5 rounded-xl bg-gray-900 hover:bg-blue-600 text-white font-bold text-sm transition-all shadow-md hover:shadow-lg border-none cursor-pointer flex items-center justify-center"
            >
              Explore All Articles
            </button>
          </div>
        </div>

        {/* Blog Cards Grid */}
        <div id="blog-grid" className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogs.slice(0, 3).map((post) => (
            <article
              key={post._id || post.slug}
              onClick={() => handleOpenBlog(post.slug)}
              className="group relative bg-white border border-slate-200/60 hover:border-blue-300/80 rounded-[24px] overflow-hidden transition-all duration-500 flex flex-col cursor-pointer shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/60 hover:-translate-y-2 h-full"
            >
              {/* Cover Image Container */}
              <div className="relative h-60 w-full overflow-hidden bg-slate-100 shrink-0">
                <img
                  src={post.coverImage || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80'}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

                {/* Category Badge */}
                <span className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-md border border-white/50 text-blue-600 text-[10px] font-black tracking-widest uppercase shadow-sm">
                  {post.category || 'Career Guidance'}
                </span>

                {/* Read Time */}
                <div className="absolute bottom-4 right-4 flex items-center gap-1.5 text-[10px] font-bold text-slate-800 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/50 shadow-sm uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>{post.readTime || '5 min read'}</span>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6 relative z-10">
                <div className="space-y-4">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight tracking-tight">
                    {post.title}
                  </h3>
                  <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed font-medium">
                    {post.excerpt}
                  </p>
                </div>

                {/* Author Info & Read Action */}
                <div className="pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-black text-sm overflow-hidden shrink-0 shadow-sm">
                      {post.author?.avatar ? (
                        <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{(post.author?.name || 'B')[0]}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {post.author?.name || 'Editorial Team'}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate mt-0.5">
                        {post.author?.role || 'Senior Mentor'}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-xs font-bold text-blue-600 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white transition-all px-3.5 py-1.5 rounded-lg">
                    Read
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
