import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ChevronDown, HelpCircle, FileText } from 'lucide-react';
import ApiService from '../../services/api';
import greyGreenBg from '../../assets/greygreen.png';
import { getImageUrl } from '../../utils/formatters';

export default function FaqBlogSection({ siteSettings = {} }) {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [loadingFaqs, setLoadingFaqs] = useState(true);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [faqError, setFaqError] = useState('');
  const [blogError, setBlogError] = useState('');
  const showFaqs = siteSettings.enableFaq !== false;
  const showBlogs = siteSettings.enableBlog !== false;

  useEffect(() => {
    let isMounted = true;
    const loadFaqs = (forceRefresh = false) => {
      setLoadingFaqs(true);
      return ApiService.getFaqs(forceRefresh)
      .then((res) => {
        if (!res?.success || !Array.isArray(res.data)) throw new Error(res?.message || 'FAQs could not be loaded.');
        if (isMounted) {
          setFaqs(res.data.slice(0, 3));
          setFaqError('');
        }
      })
      .catch((err) => {
        console.error('Failed to load public FAQs.', err);
        if (isMounted) setFaqError('FAQs are temporarily unavailable. Please try again shortly.');
      })
      .finally(() => {
        if (isMounted) setLoadingFaqs(false);
      });
    };

    const loadBlogs = (forceRefresh = false) => {
      setLoadingBlogs(true);
      return ApiService.getBlogs({ limit: 4 }, forceRefresh)
      .then((res) => {
        if (!res?.success || !Array.isArray(res.data)) throw new Error(res?.message || 'Articles could not be loaded.');
        if (isMounted) {
          setBlogs(res.data.filter((post) => post?.title).slice(0, 2));
          setBlogError('');
        }
      })
      .catch((err) => {
        console.error('Failed to load public articles.', err);
        if (isMounted) setBlogError('Articles are temporarily unavailable. Please try again shortly.');
      })
      .finally(() => {
        if (isMounted) setLoadingBlogs(false);
      });
    };

    if (showFaqs) loadFaqs(true);
    else setLoadingFaqs(false);
    if (showBlogs) loadBlogs(true);
    else setLoadingBlogs(false);

    const handleFaqUpdate = () => loadFaqs(true);
    const handleBlogUpdate = () => loadBlogs(true);
    window.addEventListener('behold_faqs_updated', handleFaqUpdate);
    window.addEventListener('behold_blogs_updated', handleBlogUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('behold_faqs_updated', handleFaqUpdate);
      window.removeEventListener('behold_blogs_updated', handleBlogUpdate);
    };
  }, [showFaqs, showBlogs]);

  if (!showFaqs && !showBlogs) return null;
  const columns = 'grid-cols-1';

  return (
    <section
      id="faqs-blogs"
      className="relative w-full flex items-center justify-center py-20 sm:py-24 px-5 sm:px-10 lg:px-16 overflow-hidden text-[#0f172a]"
    >
      {/* Background Image with smooth mask-image fade (no cutout lines) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={greyGreenBg?.src || greyGreenBg}
          alt=""
          className="w-full h-full object-cover object-center opacity-55 [mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)]"
        />
      </div>
      <div className={`relative z-10 w-full max-w-7xl mx-auto grid ${columns} gap-10 lg:gap-14 items-stretch`}>
        
        {/* LEFT COLUMN: FAQs */}
        {showFaqs && <section id="faqs" aria-labelledby="bh-home-faq-title" className="w-full flex flex-col justify-between h-full reveal-on-scroll reveal-slide-left">
          
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6 h-12 border-b border-slate-200/80 pb-3">
            <div className="min-w-0">
              {siteSettings.faqSectionSub && <span className="mb-1 block text-[9px] font-bold uppercase tracking-[.14em] text-teal-700">{siteSettings.faqSectionSub}</span>}
              <h2 id="bh-home-faq-title" className="text-2xl sm:text-3xl font-semibold tracking-tight font-sans text-slate-900">
                {siteSettings.faqSectionTitle || 'FAQs'}<span className="text-[#b85438]">.</span>
              </h2>
            </div>
            <button
              onClick={() => navigate('/faqs')}
              className="text-xs text-slate-700 hover:text-[#b85438] font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <span>View All FAQs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {siteSettings.faqSectionDesc && <p className="bh-faq-description">{siteSettings.faqSectionDesc}</p>}

          {/* FAQ Cards */}
          <div className="flex flex-col gap-4 flex-1 justify-between">
            {faqError ? (
              <div className="w-full flex-1 min-h-[260px] border border-dashed border-slate-300 rounded-2xl p-8 bg-white/60 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#b85438]/10 text-[#b85438] flex items-center justify-center"><HelpCircle className="w-6 h-6" /></div>
                <h3 className="text-base font-semibold text-slate-900">FAQs unavailable</h3>
                <p className="text-xs text-slate-600 max-w-xs">{faqError}</p>
                <button type="button" onClick={() => ApiService.getFaqs(true).then((res) => {
                  if (!res?.success || !Array.isArray(res.data)) throw new Error(res?.message || 'FAQs could not be loaded.');
                  setFaqs(res.data.slice(0, 3));
                  setFaqError('');
                }).catch((error) => {
                  console.error('Failed to retry FAQ loading.', error);
                  setFaqError('FAQs are temporarily unavailable. Please try again shortly.');
                })} className="bh-text-button">Try again</button>
              </div>
            ) : loadingFaqs ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="w-full rounded-2xl p-6 bg-white/70 border border-slate-200 flex flex-col gap-3 flex-1">
                  <div className="shimmer h-5 w-3/4 rounded-md" />
                  <div className="shimmer h-3 w-full rounded-md" />
                  <div className="shimmer h-3 w-5/6 rounded-md" />
                </div>
              ))
            ) : faqs.length === 0 ? (
              <div className="w-full flex-1 min-h-[260px] border border-dashed border-slate-300 rounded-2xl p-8 bg-white/60 backdrop-blur-xs flex flex-col items-center justify-center text-center space-y-3 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-[#b85438]/10 text-[#b85438] flex items-center justify-center">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 font-sans">No FAQs Listed</h3>
                <p className="text-xs text-slate-600 max-w-xs leading-relaxed font-normal">
                  Check back soon or send us a message through our contact section!
                </p>
              </div>
            ) : (
              faqs.map((faq, idx) => {
                const isExpanded = expandedIndex === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                    className={`w-full border border-slate-200/90 hover:border-[#b85438] rounded-2xl p-5 sm:p-6 bg-white/80 backdrop-blur-md transition-all duration-200 cursor-pointer flex flex-col justify-center group shadow-xs flex-1 ${
                      isExpanded ? 'bg-white border-[#b85438]/80 ring-2 ring-[#b85438]/10' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-base sm:text-lg font-semibold font-sans text-slate-900 group-hover:text-[#b85438] transition-colors leading-snug">
                        {faq.question}
                      </h3>
                      <div className={`w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-[#b85438]/10 text-[#b85438]' : ''}`}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                    <p className={`text-xs sm:text-sm text-slate-600 font-normal leading-relaxed transition-all duration-300 ${isExpanded ? 'pt-3 block' : 'pt-2 line-clamp-2'}`}>
                      {faq.answer || faq.text}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </section>}

        {/* RIGHT COLUMN: BLOGS */}
        {showBlogs && <section id="blog" aria-labelledby="bh-home-blog-title" className="w-full flex flex-col justify-between h-full reveal-on-scroll reveal-slide-right reveal-delay-2">
          
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6 h-12 border-b border-slate-200/80 pb-3">
            <div className="min-w-0">
              {siteSettings.blogSectionSub && <span className="mb-1 block text-[9px] font-bold uppercase tracking-[.14em] text-teal-700">{siteSettings.blogSectionSub}</span>}
              <h2 id="bh-home-blog-title" className="text-2xl sm:text-3xl font-semibold tracking-tight font-sans text-slate-900">
                {siteSettings.blogSectionTitle || 'Blogs'}<span className="text-[#b85438]">.</span>
              </h2>
            </div>
            <button
              onClick={() => navigate('/blog')}
              className="text-xs text-slate-700 hover:text-[#b85438] font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <span>Explore Blogs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Blog Cards */}
          <div className="flex flex-col gap-4 flex-1 justify-between">
            {blogError ? (
              <div className="w-full flex-1 min-h-[260px] border border-dashed border-slate-300 rounded-2xl p-8 bg-white/60 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#b85438]/10 text-[#b85438] flex items-center justify-center"><FileText className="w-6 h-6" /></div>
                <h3 className="text-base font-semibold text-slate-900">Articles unavailable</h3>
                <p className="text-xs text-slate-600 max-w-xs">{blogError}</p>
                <button type="button" onClick={() => ApiService.getBlogs({ limit: 4 }, true).then((res) => {
                  if (!res?.success || !Array.isArray(res.data)) throw new Error(res?.message || 'Articles could not be loaded.');
                  setBlogs(res.data.filter((post) => post?.title).slice(0, 2));
                  setBlogError('');
                }).catch((error) => {
                  console.error('Failed to retry article loading.', error);
                  setBlogError('Articles are temporarily unavailable. Please try again shortly.');
                })} className="bh-text-button">Try again</button>
              </div>
            ) : loadingBlogs ? (
              [1, 2].map((i) => (
                <div key={i} className="w-full rounded-2xl p-6 bg-white/70 border border-slate-200 flex flex-col gap-3 flex-1">
                  <div className="shimmer h-3 w-1/3 rounded-full" />
                  <div className="shimmer h-6 w-5/6 rounded-md" />
                  <div className="shimmer h-3 w-full rounded-md" />
                  <div className="shimmer h-3 w-4/5 rounded-md" />
                  <div className="shimmer h-3 w-1/4 rounded-md mt-2" />
                </div>
              ))
            ) : blogs.length === 0 ? (
              <div className="w-full flex-1 min-h-[260px] border border-dashed border-slate-300 rounded-2xl p-8 bg-white/60 backdrop-blur-xs flex flex-col items-center justify-center text-center space-y-3 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-[#b85438]/10 text-[#b85438] flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 font-sans">No Articles Published</h3>
                <p className="text-xs text-slate-600 max-w-xs leading-relaxed font-normal">
                  Articles and guidance posts will be published here soon!
                </p>
              </div>
            ) : (
              blogs.map((post, idx) => (
                <button
                  key={post._id || post.slug || idx}
                  type="button"
                  className={`bh-home-blog-card group${post.coverImage ? ' has-image' : ''}`}
                  onClick={() => navigate(post.slug ? `/blog/${post.slug}` : '/blog')}
                >
                  {post.coverImage && (
                    <img
                      src={getImageUrl(post.coverImage)}
                      alt={post.title}
                      loading="lazy"
                      onError={(event) => { event.currentTarget.style.display = 'none'; }}
                    />
                  )}
                  <div className="bh-home-blog-card-content">
                    <div className="space-y-2">
                      {(post.readTime || post.category) && <span className="bh-home-blog-meta">
                        {[post.readTime, post.category].filter(Boolean).join(' · ')}
                      </span>}
                      <h3>{post.title}</h3>
                      {(post.excerpt || post.snippet || post.summary) && <p>
                        {post.excerpt || post.snippet || post.summary}
                      </p>}
                    </div>
                    <span className="bh-home-blog-link">
                      <span>Read Article</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

        </section>}

      </div>
    </section>
  );
}
