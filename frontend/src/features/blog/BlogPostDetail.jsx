import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Copy, Check, MessageCircle, BookOpen, Send, Sparkles, Tag } from 'lucide-react';
import ApiService from '../../services/api';
import greenTexture from '../../assets/greygreen.png';
import { getImageUrl, formatBlogContent } from '../../utils/formatters';
import defaultBlogImage from '../../assets/luxury_clinic_room.png';
import SEO from '../../components/common/SEO';

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
          const allRes = await ApiService.getBlogs({ limit: 4 });
          if (allRes?.data && Array.isArray(allRes.data)) {
            setRelatedBlogs(allRes.data.filter(b => b.slug !== slug).slice(0, 3));
          }
        }
      } catch (err) {
        console.warn('Failed to load blog detail:', err);
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

  const handleShareTelegram = () => {
    const text = encodeURIComponent(`Check out this insightful article on Behold Aspire: "${post?.title}"`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const handleBack = () => {
    navigate('/blog');
  };

  const bgLayer = (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <img
        src={greenTexture}
        alt=""
        className="w-full h-full object-cover object-center opacity-45 [mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)]"
      />
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-surface-900 pt-28 pb-16 relative overflow-hidden">
        {bgLayer}
        <div className="w-10 h-10 border-3 border-[#0f172a] border-t-[#00e5ff] rounded-full animate-spin relative z-10"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <>
        <SEO title="Article Not Found" noindex={true} />
        <div className="min-h-screen flex flex-col justify-center items-center text-center px-4 text-surface-900 pt-28 pb-16 relative overflow-hidden">
          {bgLayer}
          <div className="relative z-10 flex flex-col items-center">
            <BookOpen className="w-14 h-14 text-[#0f172a] mb-4 opacity-75" />
            <h1 className="text-2xl font-semibold mb-2 uppercase tracking-wide">Article Not Found</h1>
            <p className="text-surface-600 mb-6 text-sm">The article you are looking for may have been moved or unpublished.</p>
            <button
              type="button"
              onClick={handleBack}
              className="px-7 py-3 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-semibold text-xs uppercase tracking-widest cursor-pointer border border-[#00e5ff]/30 shadow-xs transition-all"
            >
              Back to All Articles
            </button>
          </div>
        </div>
      </>
    );
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": typeof window !== 'undefined' ? window.location.href : ""
    },
    "headline": post.title,
    "image": [
      post.coverImage ? getImageUrl(post.coverImage) : defaultBlogImage
    ],
    "datePublished": new Date(post.createdAt || post.date).toISOString(),
    "dateModified": new Date(post.updatedAt || post.createdAt || post.date).toISOString(),
    "author": {
      "@type": "Person",
      "name": post.author?.name || post.authorName || 'Behold Aspire Editor'
    },
    "publisher": {
      "@type": "Organization",
      "name": "Behold Aspire",
      "logo": {
        "@type": "ImageObject",
        "url": typeof window !== 'undefined' ? window.location.origin + "/favicon.ico" : ""
      }
    }
  };

  return (
    <>
      <SEO 
        title={post.title} 
        description={post.excerpt || (post.content?.substring(0, 150)?.replace(/<[^>]+>/g, '') + '...')} 
        keywords={[post.primaryKeyword, ...(post.secondaryKeywords || []), ...(post.tags || [])].filter(Boolean).join(', ')}
        canonicalUrl={typeof window !== 'undefined' ? window.location.href : undefined}
        schema={schema}
      />
      <div className="min-h-screen flex flex-col text-slate-900 pt-28 pb-20 selection:bg-[#0f172a] selection:text-[#00c9d6] relative overflow-hidden select-none">
      {bgLayer}
      <main className="flex-1 relative z-10">
        <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 reveal-on-scroll">

          {/* Back Button */}
          <button
            type="button"
            onClick={handleBack}
            className="group inline-flex items-center gap-2 text-[11px] font-semibold tracking-widest text-slate-500 hover:text-slate-900 mb-10 transition-all cursor-pointer bg-transparent border-none p-0 uppercase"
          >
            <span className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-[#00c9d6]/15 flex items-center justify-center transition-colors">
              <ArrowLeft className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#00c9d6] transition-colors" />
            </span>
            Back to All Articles
          </button>

          {/* Category & Read Time */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="px-4 py-1.5 rounded-xl bg-[#0f172a] text-white text-[10px] font-semibold tracking-widest uppercase shadow-sm">
              {post.category || 'Career Guidance'}
            </span>
            <div className="h-4 w-px bg-slate-300"></div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 tracking-wider">
              <Clock className="w-3.5 h-3.5 text-[#007078]" />
              <span>{post.readTime || '5 min read'}</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-[2.85rem] font-semibold tracking-tight text-slate-900 leading-[1.15] mb-8">
            {post.title}
          </h1>

          {/* Author & Share Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5 mb-10 border-b border-slate-200/80">

            {/* Author */}
            <div className="flex items-center gap-3 shrink-0">
              {post.author?.avatar ? (
                <img
                  src={getImageUrl(post.author.avatar)}
                  alt={post.author?.name}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 shadow-sm"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0f172a] to-[#1e3a5f] text-[#00c9d6] flex items-center justify-center font-semibold text-sm shrink-0 shadow-sm">
                  {(post.author?.name || 'B').charAt(0)}
                </div>
              )}
              <div>
                <h3 className="text-[13px] font-semibold text-slate-900 tracking-wide leading-tight">
                  {post.author?.name || 'BEHOLD Editorial Team'}
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase mt-0.5">
                  {post.author?.role || 'Senior Career Counsellor & Mentor'}
                </p>
              </div>
            </div>

            {/* Share Buttons — single row, no wrap */}
            <div className="flex items-center gap-1.5 flex-nowrap overflow-x-auto scrollbar-none pb-0.5">
              <span className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase mr-0.5 shrink-0 hidden sm:block">Share</span>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366] text-[#1a9c4c] hover:text-white text-[10px] font-semibold transition-all cursor-pointer border border-[#25D366]/30 hover:border-[#25D366] hover-scale-btn shrink-0"
              >
                <MessageCircle className="w-3 h-3" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleShareTelegram}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0088cc]/10 hover:bg-[#0088cc] text-[#0077b3] hover:text-white text-[10px] font-semibold transition-all cursor-pointer border border-[#0088cc]/30 hover:border-[#0088cc] hover-scale-btn shrink-0"
              >
                <Send className="w-3 h-3" />
                <span>Telegram</span>
              </button>

              <button
                type="button"
                onClick={handleShareLinkedIn}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0077b5]/10 hover:bg-[#0077b5] text-[#005c8f] hover:text-white text-[10px] font-semibold transition-all cursor-pointer border border-[#0077b5]/30 hover:border-[#0077b5] hover-scale-btn shrink-0"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span>LinkedIn</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-semibold transition-all cursor-pointer border border-slate-200 hover-scale-btn shrink-0"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Cover Image */}
          <div className="mb-12 rounded-2xl overflow-hidden border border-slate-200/90 shadow-md bg-slate-950 relative group flex items-center justify-center">
            <img
              src={post.coverImage ? getImageUrl(post.coverImage) : defaultBlogImage}
              alt={post.title}
              onError={(e) => { e.target.onerror = null; e.target.src = defaultBlogImage; }}
              className="w-full h-auto max-h-[500px] object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>

          {/* Article Excerpt Banner */}
          {post.excerpt && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white/90 backdrop-blur-md border-l-4 border-[#00c9d6] border border-slate-200/80 mb-12 shadow-sm">
              <p className="text-base sm:text-lg text-slate-800 font-medium leading-relaxed italic">
                "{post.excerpt}"
              </p>
            </div>
          )}

          {/* Rich Content Body */}
          <div
            className="prose max-w-none text-slate-800 text-base sm:text-lg leading-relaxed space-y-6 [&_h2]:text-2xl [&_h2]:sm:text-3xl [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:tracking-tight [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-slate-900 [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-2"
            dangerouslySetInnerHTML={{ __html: formatBlogContent(post.content) }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-slate-200 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 tracking-wider mr-2">Topics:</span>
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-[10px] font-semibold tracking-wider text-slate-900 shadow-2xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Primary Focus Keyword & Secondary Keywords */}
          {(post.primaryKeyword || (post.secondaryKeywords && post.secondaryKeywords.length > 0)) && (
            <div className="mt-8 p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#00c9d6]" />
                <span>Focus Keywords & Key Topics</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {post.primaryKeyword && (
                  <span className="px-3.5 py-1.5 rounded-full bg-[#0f172a] text-white text-[11px] font-bold tracking-wide flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-[#00e5ff] animate-pulse"></span>
                    Primary: {post.primaryKeyword}
                  </span>
                )}
                {post.secondaryKeywords && post.secondaryKeywords.map((sk, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 text-[10px] font-semibold tracking-wide">
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Related Articles Section */}
        {relatedBlogs.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-16 border-t border-slate-200 reveal-on-scroll">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 mb-8">
              More Insights From BEHOLD<span className="text-[#00c9d6] drop-shadow-[0_0_8px_rgba(0,201,214,0.6)] font-semibold">.</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBlogs.map((item, idx) => (
                <div
                  key={item.slug}
                  onClick={() => navigate(`/blog/${item.slug}`)}
                  className={`bg-white/95 backdrop-blur-md hover:bg-white border border-slate-200/90 hover:border-[#00c9d6]/80 rounded-2xl p-6 cursor-pointer transition-all duration-300 space-y-3 shadow-md hover-scale-card group reveal-on-scroll reveal-scale-in reveal-delay-${idx + 1}`}
                >
                  <span className="text-[10px] font-semibold text-[#007078] tracking-wider block">
                    {item.category}
                  </span>
                  <h3 className="text-base font-semibold text-slate-900 group-hover:text-[#007078] transition-colors line-clamp-2 leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">{item.excerpt}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
    </>
  );
};

export default BlogPostDetail;
