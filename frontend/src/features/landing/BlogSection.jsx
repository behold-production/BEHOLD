import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import ApiService from '../../shared/services/api';
import { DEFAULT_BLOGS_DATA } from '../blog/defaultBlogsData';
import { ScrollDot } from '../../shared/components/BrandDot';

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
    <section id="blog" className="py-16 sm:py-24 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-bold tracking-widest uppercase text-gray-400 block mb-3">
            Latest Insights
          </span>
          <h2 id="blog-title" className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4 tracking-tight leading-tight">
            Guidance for Your Journey.
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto leading-relaxed font-normal mb-8">
            Research-backed articles, student guides, and mental health resources from our clinical team.
          </p>
          <button
            onClick={handleOpenAllBlogs}
            className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white font-semibold text-xs rounded-md transition border-none cursor-pointer shadow-sm"
          >
            Explore All Articles
          </button>
        </div>

        {/* Blog Cards Grid */}
        <div id="blog-grid" className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogs.slice(0, 3).map((post) => (
            <article
              key={post._id || post.slug}
              onClick={() => handleOpenBlog(post.slug)}
              className="group relative bg-white border border-gray-200 hover:border-gray-300 rounded-lg overflow-hidden transition-all duration-300 flex flex-col cursor-pointer shadow-sm hover:shadow-md h-full"
            >
              {/* Cover Image Container */}
              <div className="relative h-56 w-full overflow-hidden bg-gray-100 shrink-0">
                <img
                  src={post.coverImage || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80'}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent opacity-40 group-hover:opacity-20 transition-opacity duration-300" />

                {/* Category Badge */}
                <span className="absolute top-4 left-4 px-2.5 py-1 rounded bg-white/95 backdrop-blur-sm text-gray-900 text-[10px] font-bold tracking-wider uppercase shadow-sm">
                  {post.category || 'Career Guidance'}
                </span>

                {/* Read Time */}
                <div className="absolute bottom-4 right-4 flex items-center gap-1 text-[10px] font-semibold text-gray-700 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded border border-gray-200/50 shadow-sm uppercase">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span>{post.readTime || '5 min read'}</span>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <h3 className="text-xl font-serif font-bold text-gray-900 group-hover:text-black transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed font-normal">
                    {post.excerpt}
                  </p>
                </div>

                {/* Author Info & Read Action */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-900 font-bold text-xs overflow-hidden shrink-0">
                      {post.author?.avatar ? (
                        <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{(post.author?.name || 'B')[0]}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate">
                        {post.author?.name || 'Editorial Team'}
                      </h4>
                      <p className="text-[10px] text-gray-500 font-normal truncate">
                        {post.author?.role || 'Senior Mentor'}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-xs font-semibold text-gray-900 group-hover:underline">
                    Read →
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
