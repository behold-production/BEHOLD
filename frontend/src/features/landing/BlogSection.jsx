import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, Calendar } from 'lucide-react';
import ApiService from '../../services/api';

const defaultArticles = [
  {
    id: 'art-1',
    slug: 'mindful-habits-anxiety-relief',
    title: 'Mindful Breathing: Regulating Your Nervous System in Minutes',
    category: 'Mindfulness & Care',
    excerpt: 'Discover the physiological connection between breathwork and vagus nerve activation to swiftly ease sudden panic and chronic overwhelm.',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    date: 'Oct 24, 2026',
    readTime: '5 min read',
  },
  {
    id: 'art-2',
    slug: 'navigating-career-crossroads-with-confidence',
    title: 'Navigating Career Transitions: Aligning Purpose With Capability',
    category: 'Career Guidance',
    excerpt: 'How psychological profiling and self-discovery unlock authentic motivation when you feel stagnant in your professional life.',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80',
    date: 'Oct 20, 2026',
    readTime: '6 min read',
  },
];

export default function BlogSection({ siteSettings = {} }) {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState(defaultArticles);
  const showBlogs = siteSettings?.enableBlog !== false;

  useEffect(() => {
    let isMounted = true;
    if (showBlogs) {
      ApiService.getBlogs({ limit: 6 })
        .then((res) => {
          if (!isMounted) return;
          if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
            const mapped = res.data.map((b, idx) => ({
              id: b._id || b.id || `blog-${idx}`,
              slug: b.slug || b._id,
              title: b.title,
              category: b.category || 'Mindfulness & Care',
              excerpt: b.excerpt || b.summary || (typeof b.content === 'string' ? b.content.substring(0, 140) + '...' : ''),
              image: b.coverImage || b.image || defaultArticles[idx % defaultArticles.length].image,
              date: b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
              readTime: b.readTime || '5 min read',
            }));
            setBlogs(mapped);
          }
        })
        .catch(() => {});
    }
    return () => { isMounted = false; };
  }, [showBlogs]);

  if (!showBlogs) return null;

  const handleOpenBlog = (slug) => {
    if (slug) navigate(`/blog/${slug}`);
    else navigate('/blog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAll = () => {
    navigate('/blog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section
      id="blog"
      aria-labelledby="bh-journal-heading"
      className="relative py-20 sm:py-28 bg-[#fbf9f5] text-[#1c2826] overflow-hidden scroll-mt-20 border-t border-[#ece6dc]"
    >
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header: Left terracotta eyebrow, Right serif heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-14 pb-4 border-b border-[#ece6dc]">
          <div>
            <span className="text-[#b85438] text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase block">
              Journal &amp; Insights
            </span>
          </div>
          <div>
            <h2
              id="bh-journal-heading"
              className="font-serif-hero text-2xl sm:text-3xl md:text-4xl font-normal text-[#1c2826] tracking-tight leading-snug"
            >
              A Journal for Mindful Living
            </h2>
          </div>
        </div>

        {/* 2-Column Magazine Grid matching Mockup */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
          {blogs.slice(0, 2).map((post) => (
            <article
              key={post.id}
              onClick={() => handleOpenBlog(post.slug)}
              className="group cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Image */}
                <div className="w-full h-56 sm:h-64 rounded-2xl sm:rounded-3xl overflow-hidden mb-4 sm:mb-5 bg-[#f4eee6] border border-[#ede7de]">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>

                {/* Category & Meta */}
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-bold text-[#b85438] uppercase tracking-wider">
                    {post.category}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] text-[#5c6b66] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{post.readTime}</span>
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-serif-hero text-xl sm:text-2xl font-semibold text-[#1c2826] group-hover:text-[#b85438] transition-colors leading-snug mb-2 sm:mb-3">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-xs sm:text-sm text-[#5c6b66] leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>
              </div>

              {/* Read More Link */}
              <div className="pt-4 mt-4 border-t border-[#ede7de] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1c2826] group-hover:text-[#b85438] transition-colors inline-flex items-center gap-1.5">
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="text-[11px] text-[#5c6b66]">{post.date}</span>
              </div>
            </article>
          ))}
        </div>

        {/* View All Articles Pill */}
        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={handleOpenAll}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold bg-white hover:bg-[#f6f2ec] text-[#1c2826] border border-[#ede7de] shadow-2xs transition-colors cursor-pointer"
          >
            <span>Explore All Journal Entries</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
