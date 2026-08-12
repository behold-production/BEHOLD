import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ChevronDown, HelpCircle, FileText } from 'lucide-react';
import ApiService from '../../services/api';
import greyGreenBg from '../../assets/greygreen.png';

export default function FaqBlogSection() {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [loadingFaqs, setLoadingFaqs] = useState(true);
  const [loadingBlogs, setLoadingBlogs] = useState(true);

  useEffect(() => {
    // Fetch FAQs from API
    ApiService.getFaqs()
      .then((res) => {
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setFaqs(res.data.slice(0, 3));
        } else {
          setFaqs([]);
        }
      })
      .catch((err) => {
        console.warn('Failed to load FAQs:', err);
        setFaqs([]);
      })
      .finally(() => setLoadingFaqs(false));

    // Fetch Blogs from API
    ApiService.getBlogs({ limit: 4 })
      .then((res) => {
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setBlogs(res.data.slice(0, 2));
        } else {
          setBlogs([]);
        }
      })
      .catch((err) => {
        console.warn('Failed to load Blogs:', err);
        setBlogs([]);
      })
      .finally(() => setLoadingBlogs(false));
  }, []);

  return (
    <section
      id="faqs-blogs"
      className="relative w-full flex items-center justify-center py-20 sm:py-24 px-5 sm:px-10 lg:px-16 overflow-hidden text-[#0f172a]"
    >
      {/* Background Image with smooth mask-image fade (no cutout lines) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={greyGreenBg}
          alt=""
          className="w-full h-full object-cover object-center opacity-55 [mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)]"
        />
      </div>
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-stretch">
        
        {/* LEFT COLUMN: FAQs */}
        <div className="w-full flex flex-col justify-between h-full reveal-on-scroll reveal-slide-left">
          
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6 h-12 border-b border-slate-200/80 pb-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-sans text-slate-900">
              FAQs<span className="text-[#00c9d6]">.</span>
            </h2>
            <button
              onClick={() => navigate('/faqs')}
              className="text-xs text-slate-700 hover:text-[#00c9d6] font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <span>View All FAQs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* FAQ Cards */}
          <div className="flex flex-col gap-4 flex-1 justify-between">
            {loadingFaqs ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="w-full rounded-2xl p-6 bg-white/70 border border-slate-200 flex flex-col gap-3 flex-1">
                  <div className="shimmer h-5 w-3/4 rounded-md" />
                  <div className="shimmer h-3 w-full rounded-md" />
                  <div className="shimmer h-3 w-5/6 rounded-md" />
                </div>
              ))
            ) : faqs.length === 0 ? (
              <div className="w-full flex-1 min-h-[260px] border border-dashed border-slate-300 rounded-2xl p-8 bg-white/60 backdrop-blur-xs flex flex-col items-center justify-center text-center space-y-3 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-[#00c9d6]/10 text-[#00c9d6] flex items-center justify-center">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-sans">No FAQs Listed</h3>
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
                    className={`w-full border border-slate-200/90 hover:border-[#00c9d6] rounded-2xl p-5 sm:p-6 bg-white/80 backdrop-blur-md transition-all duration-200 cursor-pointer flex flex-col justify-center group shadow-xs flex-1 ${
                      isExpanded ? 'bg-white border-[#00c9d6]/80 ring-2 ring-[#00c9d6]/10' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-base sm:text-lg font-bold font-sans text-slate-900 group-hover:text-[#00c9d6] transition-colors leading-snug">
                        {faq.question}
                      </h3>
                      <div className={`w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-[#00c9d6]/10 text-[#00c9d6]' : ''}`}>
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
        </div>

        {/* RIGHT COLUMN: BLOGS */}
        <div className="w-full flex flex-col justify-between h-full reveal-on-scroll reveal-slide-right reveal-delay-2">
          
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6 h-12 border-b border-slate-200/80 pb-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-sans text-slate-900">
              Blogs<span className="text-[#00c9d6]">.</span>
            </h2>
            <button
              onClick={() => navigate('/blog')}
              className="text-xs text-slate-700 hover:text-[#00c9d6] font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <span>Explore Blogs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Blog Cards */}
          <div className="flex flex-col gap-4 flex-1 justify-between">
            {loadingBlogs ? (
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
                <div className="w-12 h-12 rounded-full bg-[#00c9d6]/10 text-[#00c9d6] flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-sans">No Articles Published</h3>
                <p className="text-xs text-slate-600 max-w-xs leading-relaxed font-normal">
                  Articles and guidance posts will be published here soon!
                </p>
              </div>
            ) : (
              blogs.map((post, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate(post.slug ? `/blog/${post.slug}` : '/blog')}
                  className="border border-slate-200/90 hover:border-[#00c9d6] rounded-2xl p-5 sm:p-6 bg-white/80 backdrop-blur-md transition-all duration-200 cursor-pointer flex flex-col justify-between flex-1 group shadow-xs"
                >
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-[#00c9d6] block">
                      {(post.readTime || '6 min read').toLowerCase()} &middot; {(post.category || 'Career Guidance')}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold font-sans text-slate-900 group-hover:text-[#00c9d6] transition-colors leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed font-normal">
                      {post.excerpt || post.snippet || post.summary || 'Explore expert insights and guidance from the Behold team.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 group-hover:text-[#00c9d6] transition-colors pt-3">
                    <span>Read Article</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
