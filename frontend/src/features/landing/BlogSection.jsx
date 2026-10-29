import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';
import ApiService from '../../services/api';
import SectionHeading from './SectionHeading';

export default function BlogSection({ siteSettings = {} }) {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
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
              image: b.coverImage || b.image || null,
              date: b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
            }));
            setBlogs(mapped);
          } else {
            setBlogs([]);
          }
        })
        .catch(() => { if (isMounted) setBlogs([]); })
        .finally(() => { if (isMounted) setLoading(false); });
    } else {
      setLoading(false);
    }
    return () => { isMounted = false; };
  }, [showBlogs]);

  if (!showBlogs) return null;
  if (!loading && blogs.length === 0) return null;

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
      className="relative w-full overflow-hidden bg-white py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Insights"
          title={siteSettings.blogSectionTitle || 'Latest Articles'}
          description={siteSettings.blogSectionSub || undefined}
        />

        {loading ? (
          <div className="mt-9 grid grid-cols-1 gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item}>
                <div className="aspect-[16/10] w-full animate-pulse rounded-xl bg-[#F1EAD9]" />
                <div className="mt-4 h-2.5 w-1/4 animate-pulse rounded bg-[#F1EAD9]" />
                <div className="mt-3 h-4 w-5/6 animate-pulse rounded bg-[#F1EAD9]" />
                <div className="mt-2 h-3 w-full animate-pulse rounded bg-[#F1EAD9]" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-9 grid grid-cols-1 gap-5 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {blogs.slice(0, 3).map((post) => (
              <article
                key={post.id}
                onClick={() => handleOpenBlog(post.slug)}
                className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-[#E6DFD0] bg-[#FBF8F1] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0E7490]/45 hover:shadow-[0_18px_36px_-28px_rgba(14,17,17,0.5)]"
              >
                <div className="aspect-[16/10] w-full overflow-hidden bg-[#EDF5F7]">
                  {post.image ? (
                    <img
                      src={post.image}
                      alt={post.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#EAF4F7] to-[#F1EAD9]">
                      <span className="text-3xl font-semibold text-[#0E7490]/40">{post.category.charAt(0)}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.1em]">
                    <span className="rounded-full bg-white px-2.5 py-1 text-[#0B5C73]">{post.category}</span>
                    <span className="inline-flex items-center gap-1 text-[#8B9593]">
                      <Calendar className="h-3 w-3" />
                      {post.date}
                    </span>
                  </div>

                  <h3 className="mt-3 line-clamp-2 text-[15px] font-semibold leading-snug text-[#0E1111] transition-colors group-hover:text-[#0E7490] sm:text-base">
                    {post.title}
                  </h3>

                  {post.excerpt && (
                    <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-[#55605F]">
                      {post.excerpt}
                    </p>
                  )}

                  <span className="mt-4 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#0E7490]">
                    Read Article
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-10 text-center sm:mt-12">
          <button
            type="button"
            onClick={handleOpenAll}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0E1111] px-6 py-3 text-xs font-semibold text-white transition-colors duration-200 hover:bg-[#0E7490] cursor-pointer border-none sm:text-sm"
          >
            Show All
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
