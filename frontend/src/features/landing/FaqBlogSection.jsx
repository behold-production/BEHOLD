import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, HelpCircle, FileText, ArrowUpRight } from 'lucide-react';
import ApiService from '../../services/api';

export default function FaqBlogSection() {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [loadingFaqs, setLoadingFaqs] = useState(true);
  const [loadingBlogs, setLoadingBlogs] = useState(true);

  useEffect(() => {
    ApiService.getFaqs()
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setFaqs(res.data.slice(0, 4));
        } else {
          setFaqs([]);
        }
      })
      .catch((err) => console.warn('Failed to load FAQs:', err))
      .finally(() => setLoadingFaqs(false));

    ApiService.getBlogs({ limit: 4 })
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setBlogs(res.data.slice(0, 3));
        } else {
          setBlogs([]);
        }
      })
      .catch((err) => console.warn('Failed to load Blogs:', err))
      .finally(() => setLoadingBlogs(false));
  }, []);

  return (
    <section id="faqs-blogs" className="relative w-full py-24 sm:py-32 px-6 bg-white overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
        
        {/* LEFT: FAQs */}
        <div className="flex flex-col h-full w-full">
          <div className="mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
              Common <span className="text-[#00e5ff]">Questions.</span>
            </h2>
            <p className="text-slate-500 font-medium text-sm sm:text-base max-w-sm">
              Everything you need to know about the product and billing.
            </p>
          </div>

          <div className="flex flex-col gap-3 flex-1">
            {loadingFaqs ? (
              [1, 2, 3].map(i => (
                <div key={i} className="w-full h-16 rounded-2xl bg-slate-50 border border-slate-100 animate-pulse" />
              ))
            ) : faqs.length === 0 ? (
               <div className="w-full flex-1 min-h-[200px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center p-8 bg-slate-50">
                 <div className="w-12 h-12 rounded-full bg-[#00e5ff]/10 text-[#00e5ff] flex items-center justify-center mb-4">
                   <HelpCircle className="w-6 h-6" />
                 </div>
                 <h3 className="text-lg font-bold text-slate-900">No FAQs Listed</h3>
               </div>
            ) : (
              faqs.map((faq, idx) => {
                const isExpanded = expandedIndex === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                    className={`w-full border rounded-2xl p-5 sm:p-6 transition-all duration-300 cursor-pointer overflow-hidden ${
                      isExpanded 
                        ? 'bg-slate-50 border-slate-200 shadow-sm relative' 
                        : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                    }`}
                  >
                    {isExpanded && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00e5ff] rounded-l-2xl" />}
                    
                    <div className="flex items-center justify-between gap-4">
                      <h3 className={`text-base sm:text-lg font-bold transition-colors ${isExpanded ? 'text-[#00e5ff]' : 'text-slate-900'}`}>
                        {faq.question}
                      </h3>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${isExpanded ? 'bg-[#00e5ff] text-white rotate-180' : 'bg-slate-100 text-slate-400'}`}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                    <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden">
                        <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                          {faq.answer || faq.text}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <button 
            onClick={() => navigate('/faqs')}
            className="mt-8 text-sm font-bold text-slate-900 flex items-center gap-2 hover:text-[#00e5ff] transition-colors self-start cursor-pointer"
          >
            View all FAQs <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* RIGHT: BLOGS */}
        <div className="flex flex-col h-full w-full">
          <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
                Latest <span className="text-[#00e5ff]">Insights.</span>
              </h2>
              <p className="text-slate-500 font-medium text-sm sm:text-base max-w-sm">
                Expert knowledge and guidance from our team.
              </p>
            </div>
            <button 
              onClick={() => navigate('/blog')}
              className="hidden sm:flex text-sm font-bold text-slate-900 items-center gap-2 hover:text-[#00e5ff] transition-colors cursor-pointer whitespace-nowrap"
            >
              Explore Blog <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-6 flex-1">
            {loadingBlogs ? (
              [1, 2, 3].map(i => (
                <div key={i} className="w-full flex items-center gap-6 animate-pulse">
                  <div className="w-32 h-24 rounded-2xl bg-slate-100 shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="w-1/4 h-3 bg-slate-100 rounded-full" />
                    <div className="w-full h-4 bg-slate-100 rounded-full" />
                    <div className="w-2/3 h-4 bg-slate-100 rounded-full" />
                  </div>
                </div>
              ))
            ) : blogs.length === 0 ? (
               <div className="w-full flex-1 min-h-[200px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center p-8 bg-slate-50">
                 <div className="w-12 h-12 rounded-full bg-[#00e5ff]/10 text-[#00e5ff] flex items-center justify-center mb-4">
                   <FileText className="w-6 h-6" />
                 </div>
                 <h3 className="text-lg font-bold text-slate-900">No Articles Yet</h3>
               </div>
            ) : (
              blogs.map((post, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate(post.slug ? `/blog/${post.slug}` : '/blog')}
                  className="group flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 cursor-pointer p-3 sm:p-4 -mx-4 rounded-2xl hover:bg-slate-50 transition-colors"
                >
                  <div className="w-full sm:w-32 h-40 sm:h-24 rounded-2xl bg-slate-100 shrink-0 overflow-hidden relative shadow-sm">
                    {post.coverImage || post.image ? (
                      <img src={post.coverImage || post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#00e5ff]/20 to-[#00b2be]/5" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#00e5ff]">
                      {post.category || 'Mental Health'}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-[#00e5ff] transition-colors leading-tight line-clamp-2">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors pt-1">
                      <span>Read Article</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 group-hover:text-[#00e5ff] transition-all" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <button 
            onClick={() => navigate('/blog')}
            className="sm:hidden mt-8 text-sm font-bold text-slate-900 flex items-center gap-2 hover:text-[#00e5ff] transition-colors self-start cursor-pointer"
          >
            Explore Blog <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
}
