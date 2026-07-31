import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import ApiService from '../../shared/services/api';
import { DEFAULT_BLOGS_DATA } from '../blog/defaultBlogsData';

const beholdDefaultFaqs = [
  {
    author: 'Sarina Gwan',
    question: 'What is the C-DAT aptitude assessment?',
    answer: "The C-DAT (Career Domain Aptitude Test) is a scientific evaluation that identifies a student's natural aptitude domains — helping match them with ideal university programs and career paths."
  },
  {
    author: 'Dominico Pascal',
    question: 'Who can book a counseling session with Behold?',
    answer: 'Behold serves students from Class 8 onwards, parents, and young professionals seeking career clarity. Sessions are available in-person (Kerala), doorstep visits, and online video calls.'
  },
  {
    author: 'Katrianne Schulz',
    question: 'How does doorstep counseling work?',
    answer: 'Our trained counselors visit your home at a scheduled time, ensuring maximum comfort and emotional privacy for sensitive topics like academic pressure and stream selection.'
  }
];

export default function FaqBlogSection() {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState(beholdDefaultFaqs);
  const [blogs, setBlogs] = useState(DEFAULT_BLOGS_DATA.slice(0, 2));
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    // Fetch FAQs from API
    ApiService.getFaqs()
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const apiFaqs = res.data.slice(0, 3).map((f, i) => ({
            ...f,
            author: beholdDefaultFaqs[i]?.author || 'Student FAQ'
          }));
          setFaqs(apiFaqs);
        }
      })
      .catch((err) => console.warn('Using default FAQs:', err));

    // Fetch Blogs from API
    ApiService.getBlogs({ limit: 4 })
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setBlogs(res.data.slice(0, 2));
        }
      })
      .catch((err) => console.warn('Using default Blogs:', err));
  }, []);

  return (
    <section
      id="faqs-blogs"
      className="relative w-full flex items-center justify-center py-20 sm:py-24 px-5 sm:px-10 lg:px-16 overflow-hidden text-[#0f172a] bg-transparent"
    >
      {/* Background Overlay */}

      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-stretch">
        
        {/* LEFT COLUMN: FAQ'S */}
        <div className="w-full flex flex-col justify-between h-full">
          
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6 h-12">
            <h2 className="font-['Cormorant_Garamond',serif] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-widest text-[#0f172a] uppercase drop-shadow-md leading-none">
              FAQ'S
            </h2>
            <button
              onClick={() => navigate('/faqs')}
              className="text-xs text-[#0f172a]/90 hover:text-[#0f172a] underline font-medium flex items-center gap-1 transition cursor-pointer"
            >
              View All FAQs
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3 FAQ Outline Cards (Perfect Height Balance) */}
          <div className="flex flex-col gap-5 flex-1 justify-between">
            {faqs.map((faq, idx) => {
              const isExpanded = expandedIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className={`w-full border-2 border-[#0f172a]/20 rounded-xl p-6 sm:p-7 bg-white/10 backdrop-blur-xs hover:bg-white/20 transition-all duration-300 cursor-pointer flex flex-col justify-center group shadow-lg flex-1 ${
                    isExpanded ? 'bg-white/25 border-[#0f172a]/40' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-['Cormorant_Garamond',serif] text-xl sm:text-2xl font-bold text-[#0f172a] group-hover:text-emerald-100 transition leading-snug">
                      {faq.question}
                    </h3>
                    <div className={`w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-white/40' : ''}`}>
                      <ChevronDown className="w-4 h-4 text-[#0f172a]" />
                    </div>
                  </div>

                  <p className={`text-xs sm:text-sm text-[#0f172a]/90 font-light leading-relaxed transition-all duration-300 ${isExpanded ? 'pt-3 block' : 'pt-2 line-clamp-2'}`}>
                    {faq.answer || faq.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: BLOGS */}
        <div className="w-full flex flex-col justify-between h-full">
          
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6 h-12">
            <h2 className="font-['Cormorant_Garamond',serif] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-widest text-[#0f172a] uppercase drop-shadow-md leading-none">
              BLOGS
            </h2>
            <button
              onClick={() => navigate('/blog')}
              className="text-xs text-[#0f172a]/90 hover:text-[#0f172a] underline font-medium flex items-center gap-1 transition cursor-pointer"
            >
              Explore Blogs
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 2 Tall Blog Cards Stacked Vertically (Pixel-Perfect Alignment with FAQ Column) */}
          <div className="flex flex-col gap-5 flex-1 justify-between">
            {blogs.map((post, idx) => (
              <div
                key={idx}
                onClick={() => navigate(post.slug ? `/blog/${post.slug}` : '/blog')}
                className="border-2 border-[#0f172a]/20 rounded-xl p-6 sm:p-7 bg-white/10 backdrop-blur-xs hover:bg-white/20 transition-all duration-300 cursor-pointer flex flex-col justify-between flex-1 group shadow-lg"
              >
                <div className="space-y-3">
                  <span className="text-[11px] font-bold text-emerald-100 uppercase tracking-widest block">
                    {post.readTime || '6 MIN READ'} &middot; {post.category || 'CAREER GUIDANCE'}
                  </span>
                  <h3 className="font-['Cormorant_Garamond',serif] text-2xl sm:text-3xl font-bold text-[#0f172a] group-hover:text-emerald-100 transition leading-tight">
                    {post.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#0f172a]/85 line-clamp-3 leading-relaxed font-light">
                    {post.excerpt || post.snippet || post.summary || 'Explore expert insights and guidance from Behold team.'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0f172a] group-hover:translate-x-1 transition-transform pt-4">
                  <span className="underline">Read Article</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
