import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import ApiService from '../../shared/services/api';
import { DEFAULT_BLOGS_DATA } from '../blog/defaultBlogsData';
import { ScrollDot } from '../../shared/components/BrandDot';

const BlogSection = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState(DEFAULT_BLOGS_DATA);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await ApiService.getBlogs({ limit: 12 });
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

  const totalPages = Math.ceil(blogs.length / itemsPerPage);
  const paginatedBlogs = blogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <section id="blog" className="py-16 sm:py-24 bg-[#f7f4ef] border-b border-[#e2dad2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-bold tracking-widest uppercase text-[#7c7069] block mb-3">
            Latest Insights
          </span>
          <h2 id="blog-title" className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold text-[#1c1514] mb-4 tracking-tight leading-tight uppercase">
            Guidance for Your Journey.
          </h2>
          <p className="text-sm sm:text-base text-[#6e635e] max-w-xl mx-auto leading-relaxed font-normal mb-8">
            Research-backed articles, student guides, and mental health resources from our clinical team.
          </p>
          <button
            onClick={handleOpenAllBlogs}
            className="px-6 py-2.5 bg-[#2b211e] hover:bg-[#1c1514] text-[#f7f4ef] font-bold text-xs uppercase tracking-widest rounded-full transition-all shadow-xs border-none cursor-pointer"
          >
            Explore All Articles
          </button>
        </div>

        {/* Blog Cards Grid */}
        <div id="blog-grid" className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {paginatedBlogs.map((post) => (
            <article
              key={post._id || post.slug}
              onClick={() => handleOpenBlog(post.slug)}
              className="group relative bg-white border border-[#d6cecb] hover:border-[#2b211e] rounded-xl overflow-hidden transition-all duration-300 flex flex-col cursor-pointer shadow-xs hover:shadow-md h-full"
            >
              {/* Cover Image Container */}
              <div className="relative h-56 w-full overflow-hidden bg-[#eae4dc] shrink-0">
                <img
                  src={post.coverImage || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80'}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1c1514]/40 to-transparent opacity-40 group-hover:opacity-20 transition-opacity duration-300" />

                {/* Category Badge */}
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm text-[#1c1514] text-[10px] font-bold tracking-wider uppercase border border-[#d8d0c7]">
                  {post.category || 'Career Guidance'}
                </span>

                {/* Read Time */}
                <div className="absolute bottom-4 right-4 flex items-center gap-1 text-[10px] font-semibold text-[#1c1514] bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full border border-[#d8d0c7] uppercase">
                  <Clock className="w-3 h-3 text-[#7c7069]" />
                  <span>{post.readTime || '5 min read'}</span>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-[#1c1514] group-hover:text-[#2b211e] transition-colors line-clamp-2 leading-snug font-sans uppercase">
                    {post.title}
                  </h3>
                  <p className="text-xs text-[#6e635e] line-clamp-3 leading-relaxed font-normal">
                    {post.excerpt}
                  </p>
                </div>

                {/* Author Info & Read Action */}
                <div className="pt-4 border-t border-[#d6cecb] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#eae4dc] border border-[#d8d0c7] flex items-center justify-center text-[#1c1514] font-bold text-xs overflow-hidden shrink-0">
                      {post.author?.avatar ? (
                        <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{(post.author?.name || 'B')[0]}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#1c1514] truncate">
                        {post.author?.name || 'Editorial Team'}
                      </h4>
                      <p className="text-[10px] text-[#7c7069] font-normal truncate">
                        {post.author?.role || 'Senior Mentor'}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-xs font-bold uppercase tracking-widest text-[#2b211e] group-hover:underline">
                    Read ›
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-12">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous Page"
              className={`w-8 h-8 rounded-full text-sm font-bold transition-all cursor-pointer border flex items-center justify-center ${currentPage === 1
                ? 'border-[#d8d0c7] text-[#a39891] bg-[#ebe5df] cursor-not-allowed'
                : 'border-[#2b211e] bg-[#2b211e] text-[#f7f4ef] hover:bg-[#1c1514]'
                }`}
            >
              ‹
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`w-8 h-8 rounded-full text-xs font-bold transition-all cursor-pointer border flex items-center justify-center ${currentPage === num
                  ? 'bg-[#2b211e] text-[#f7f4ef] border-[#2b211e] shadow-xs'
                  : 'bg-white text-[#2b211e] border-[#d8d0c7] hover:border-[#1c1514]'
                  }`}
              >
                {num}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next Page"
              className={`w-8 h-8 rounded-full text-sm font-bold transition-all cursor-pointer border flex items-center justify-center ${currentPage === totalPages
                ? 'border-[#d8d0c7] text-[#a39891] bg-[#ebe5df] cursor-not-allowed'
                : 'border-[#2b211e] bg-[#2b211e] text-[#f7f4ef] hover:bg-[#1c1514]'
                }`}
            >
              ›
            </button>
          </div>
        )}

      </div>
    </section>
  );
};

export default BlogSection;
