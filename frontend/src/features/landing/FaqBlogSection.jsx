import React, { useState, useEffect } from 'react';
import greenTexture from '../../assets/green_watercolor_texture.png';
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
      className="relative min-h-[90vh] w-full flex items-center justify-center py-20 px-4 sm:px-8 lg:px-16 overflow-hidden text-white"
      style={{
        backgroundImage: `url(${greenTexture})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#86ad66'
      }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-[2px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch justify-between gap-12 lg:gap-16">
        
        {/* LEFT COLUMN: FAQ'S */}
        <div className="flex-1 w-full flex flex-col justify-between space-y-6">
          
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <h2 className="font-['Cormorant_Garamond',serif] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-widest text-white uppercase drop-shadow-md">
              FAQ'S
            </h2>
            <button
              onClick={() => navigate('/faqs')}
              className="text-xs text-white/80 hover:text-white underline font-medium flex items-center gap-1 transition cursor-pointer"
            >
              View All FAQs
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3 FAQ Pill Cards */}
          <div className="flex flex-col gap-5 flex-1 justify-between">
            {faqs.map((faq, idx) => {
              const isExpanded = expandedIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className={`w-full border-2 border-white/80 rounded-[28px] p-5 sm:p-6 bg-white/10 backdrop-blur-xs hover:bg-white/20 transition-all duration-300 cursor-pointer flex flex-col justify-between group shadow-lg ${
                    isExpanded ? 'bg-white/25 border-white' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-['Cormorant_Garamond',serif] text-xl sm:text-2xl font-bold text-white group-hover:text-emerald-100 transition leading-snug">
                      {faq.question}
                    </h3>
                    <div className={`w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-white/40' : ''}`}>
                      <ChevronDown className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <p className={`text-xs sm:text-sm text-white/90 font-light leading-relaxed pt-2 transition-all duration-300 ${isExpanded ? 'block' : 'line-clamp-2'}`}>
                    {faq.answer || faq.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: BLOGS */}
        <div className="flex-1 w-full flex flex-col justify-between space-y-6">
          
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <h2 className="font-['Cormorant_Garamond',serif] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-widest text-white uppercase drop-shadow-md">
              BLOGS
            </h2>
            <button
              onClick={() => navigate('/blog')}
              className="text-xs text-white/80 hover:text-white underline font-medium flex items-center gap-1 transition cursor-pointer"
            >
              Explore Blogs
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 2 Tall Blog Cards Stacked Vertically to match Left Height perfectly */}
          <div className="flex flex-col gap-5 flex-1 justify-between">
            {blogs.map((post, idx) => (
              <div
                key={idx}
                onClick={() => navigate(post.slug ? `/blog/${post.slug}` : '/blog')}
                className="border-2 border-white/80 rounded-[28px] p-6 sm:p-7 bg-white/10 backdrop-blur-xs hover:bg-white/20 transition-all duration-300 cursor-pointer flex flex-col justify-between flex-1 group shadow-lg min-h-[210px]"
              >
                <div className="space-y-3">
                  <span className="text-[11px] font-bold text-emerald-100 uppercase tracking-widest block">
                    {post.readTime || '6 MIN READ'} &middot; {post.category || 'CAREER GUIDANCE'}
                  </span>
                  <h3 className="font-['Cormorant_Garamond',serif] text-2xl sm:text-3xl font-bold text-white group-hover:text-emerald-100 transition leading-tight">
                    {post.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/80 line-clamp-3 leading-relaxed font-light">
                    {post.excerpt || post.snippet || post.summary || 'Explore expert insights and guidance from Behold team.'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-white group-hover:translate-x-1 transition-transform pt-3">
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
