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
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold font-serif tracking-tight text-neon-blue-deep">
            Latest From <span className="text-gold">Behold Aspire</span>
          </h2>
          <p className="text-sm sm:text-base text-ink-soft max-w-xl leading-relaxed font-sans">
            Research-backed career roadmaps, stream selection strategies, and psychological guidance authored by CIGI mentors.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAllBlogs}
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-sm bg-neon-blue-deep hover:bg-neon-blue-mid text-white font-semibold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 shadow-sm hover:scale-105 active:scale-95 border-none cursor-pointer shrink-0 active:translate-y-[1px]"
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
            className="group bg-white rounded-md overflow-hidden transition-all duration-500 flex flex-col cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(6,14,32,0.12)] hover:-translate-y-1.5 h-full border border-line/40"
          >
            {/* Cover Image Container */}
            <div className="relative h-56 w-full overflow-hidden bg-paper shrink-0">
              <img
                src={post.coverImage || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80'}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neon-blue-deep/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Category Badge */}
              <span className="absolute top-4 left-4 px-3 py-1.5 rounded-sm bg-white/95 backdrop-blur-md text-neon-blue-deep text-[10px] font-bold font-mono tracking-wider uppercase shadow-sm">
                {post.category || 'Career Guidance'}
              </span>

              {/* Read Time */}
              <div className="absolute bottom-4 right-4 flex items-center gap-1.5 text-[10px] font-bold text-white bg-neon-blue-deep/90 backdrop-blur-md px-3 py-1.5 rounded-sm shadow-sm uppercase tracking-wider font-mono">
                <Clock className="w-3.5 h-3.5 text-gold-soft" />
                <span>{post.readTime || '5 min read'}</span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-7 flex-1 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <h3 className="text-xl sm:text-2xl font-semibold font-serif text-neon-blue-deep group-hover:text-neon-blue-mid transition-colors line-clamp-2 leading-snug">
                  {post.title}
                </h3>
                <p className="text-sm text-ink-soft line-clamp-3 leading-relaxed font-sans">
                  {post.excerpt}
                </p>
              </div>

              {/* Author & Read Action */}
              <div className="pt-5 border-t border-line/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neon-blue-deep/5 border border-neon-blue-deep/10 flex items-center justify-center text-neon-blue-deep font-bold text-sm overflow-hidden shrink-0 shadow-inner">
                    {post.author?.avatar ? (
                      <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{(post.author?.name || 'B')[0]}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neon-blue-deep line-clamp-1 font-sans">
                      {post.author?.name || 'Editorial Team'}
                    </h4>
                    <p className="text-[10px] text-ink-soft line-clamp-1 font-sans uppercase tracking-widest mt-0.5 font-semibold">
                      {post.author?.role || 'Senior Mentor'}
                    </p>
                  </div>
                </div>

                <div className="text-[11px] font-bold text-neon-blue-deep flex items-center gap-1.5 group-hover:translate-x-2 transition-transform duration-300 font-mono uppercase bg-neon-blue-deep/5 px-3 py-1.5 rounded-sm group-hover:bg-gold/20 group-hover:text-gold-soft">
                  <span>Read</span>
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
