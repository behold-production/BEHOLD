import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Copy, Check, MessageCircle, BookOpen } from 'lucide-react';
import ApiService from '../../shared/services/api';
import { DEFAULT_BLOGS_DATA } from './defaultBlogsData';

const BlogPostDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [relatedBlogs, setRelatedBlogs] = useState([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const fetchPost = async () => {
      setLoading(true);
      try {
        const res = await ApiService.getBlogBySlug(slug);
        if (res?.data) {
          setPost(res.data);
          const allRes = await ApiService.getBlogs({ limit: 3 });
          if (allRes?.data && Array.isArray(allRes.data)) {
            setRelatedBlogs(allRes.data.filter(b => b.slug !== slug).slice(0, 3));
          }
        } else {
          const localMatch = DEFAULT_BLOGS_DATA.find(b => b.slug === slug);
          if (localMatch) {
            setPost(localMatch);
            setRelatedBlogs(DEFAULT_BLOGS_DATA.filter(b => b.slug !== slug).slice(0, 3));
          }
        }
      } catch (err) {
        console.warn('Using local fallback for blog detail:', err);
        const localMatch = DEFAULT_BLOGS_DATA.find(b => b.slug === slug);
        if (localMatch) {
          setPost(localMatch);
          setRelatedBlogs(DEFAULT_BLOGS_DATA.filter(b => b.slug !== slug).slice(0, 3));
        }
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchPost();
  }, [slug]);

  useEffect(() => {
    if (post) {
      document.title = `${post.title} | Behold Aspire`;
    } else {
      document.title = 'Behold Aspire | Student Career Guidance & Aptitude Testing';
    }
  }, [post]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Check out this insightful article on Behold Aspire: "${post?.title}"\n${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleBack = () => {
    navigate('/blog');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50 text-slate-900 pt-28 pb-16">
        <div className="w-10 h-10 border-4 border-[#00A8FF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-center px-4 bg-slate-50 text-slate-900 pt-28 pb-16">
        <BookOpen className="w-14 h-14 text-[#00A8FF] mb-4 opacity-75" />
        <h1 className="text-2xl font-bold mb-2">Article Not Found</h1>
        <p className="text-slate-500 mb-6">The article you are looking for may have been moved or unpublished.</p>
        <button
          type="button"
          onClick={handleBack}
          className="px-6 py-3 rounded-lg bg-slate-900 hover:bg-[#00A8FF] text-white font-black text-xs uppercase tracking-wider cursor-pointer border-none shadow-md"
        >
          ← Back to All Articles
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 pt-28 pb-20 selection:bg-[#00E5FF] selection:text-slate-900">
      <main className="flex-1">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#00A8FF] hover:text-slate-900 mb-8 transition-colors cursor-pointer bg-transparent border-none p-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Articles</span>
          </button>

          {/* Category & Read Time */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3.5 py-1 rounded-lg bg-white border border-slate-200 text-[#00A8FF] text-xs font-black tracking-widest uppercase shadow-xs">
              {post.category || 'Career Guidance'}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <Clock className="w-3.5 h-3.5 text-[#00A8FF]" />
              <span>{post.readTime || '5 min read'}</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-header tracking-tight text-slate-900 leading-tight mb-6">
            {post.title}
          </h1>

          {/* Author & Share Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 mb-8 border-b border-slate-200">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#00E5FF]/20 border-2 border-[#00A8FF] flex items-center justify-center text-[#00A8FF] font-bold text-base overflow-hidden shrink-0">
                {post.author?.avatar ? (
                  <img src={post.author.avatar} alt={post.author?.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{(post.author?.name || 'B')[0]}</span>
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {post.author?.name || 'Behold Aspire Editorial Team'}
                </h3>
                <p className="text-xs text-slate-500">
                  {post.author?.role || 'Senior Career Counsellor & Mentor'}
                </p>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366] text-[#1D9A4A] hover:text-white border border-[#25D366]/30 text-xs font-bold transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Share WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200 shadow-xs"
              >
                {copied ? <Check className="w-4 h-4 text-[#00A8FF]" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="mb-10 rounded-lg overflow-hidden border border-slate-200 shadow-lg bg-white">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-auto max-h-[460px] object-cover"
              />
            </div>
          )}

          {/* Article Excerpt Banner */}
          {post.excerpt && (
            <div className="p-6 rounded-lg bg-white border-l-4 border-[#00A8FF] border border-slate-200 mb-10 shadow-sm">
              <p className="text-base sm:text-lg text-slate-800 font-medium italic leading-relaxed">
                {post.excerpt}
              </p>
            </div>
          )}

          {/* Rich Content Body */}
          <div
            className="prose max-w-none text-slate-700 text-base sm:text-lg leading-relaxed space-y-6 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-[#00A8FF] [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-2"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-slate-200 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-2">Topics:</span>
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 shadow-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </article>

        {/* Related Articles Section */}
        {relatedBlogs.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-16 border-t border-slate-200">
            <h2 className="text-2xl sm:text-3xl font-black font-header text-slate-900 mb-8">
              More Insights From <span className="text-[#00A8FF]">Behold Aspire</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBlogs.map((item) => (
                <div
                  key={item.slug}
                  onClick={() => navigate(`/blog/${item.slug}`)}
                  className="bg-white hover:bg-slate-100/60 border border-slate-200 hover:border-[#00A8FF] rounded-lg p-5 cursor-pointer transition-all duration-300 space-y-3 shadow-sm"
                >
                  <span className="text-[10px] font-black text-[#00A8FF] uppercase tracking-wider">
                    {item.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 hover:text-[#00A8FF] transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{item.excerpt}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default BlogPostDetail;
