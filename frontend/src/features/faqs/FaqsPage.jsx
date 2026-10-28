import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, HelpCircle, Search, X, MessageSquare, ArrowRight, ShieldCheck, Sparkles, Minus, Plus } from 'lucide-react';
import ApiService from '../../services/api';
import shadeGreenBg from '../../assets/greygreen.png';
import SEO from '../../components/common/SEO';

const DEFAULT_FAQS = [
  {
    category: 'Therapy & Sessions',
    question: "How does BEHOLD's therapy work?",
    answer: "BEHOLD connects you with certified psychologists and mental health experts for online video consultations, offline clinic visits, or doorstep sessions based on your preferences. You can choose an expert, pick a convenient time, and get personalized support."
  },
  {
    category: 'Services',
    question: 'What kind of support does BEHOLD provide?',
    answer: 'We offer individual psychological counselling, career guidance, anxiety & stress management, depression support, aptitude assessment, and relationship wellbeing sessions.'
  },
  {
    category: 'General',
    question: "Who can use BEHOLD's services?",
    answer: 'Our services are designed for students, young professionals, adults, and families seeking professional guidance, emotional support, or personal development.'
  },
  {
    category: 'General',
    question: 'What is BEHOLD?',
    answer: 'BEHOLD is a holistic mental health and career aptitude platform committed to providing accessible, empathetic, and confidential psychological support.'
  },
  {
    category: 'Privacy',
    question: 'Are my therapy sessions private and confidential?',
    answer: 'Yes, absolutely. All sessions and personal data are strictly confidential and protected by professional psychological ethics and secure data standards.'
  },
  {
    category: 'Therapy & Sessions',
    question: 'How do I book a session with a psychologist?',
    answer: 'Simply click "Meet Our Experts", select a psychologist whose specialization matches your needs, pick an available date & time slot, and complete your booking in under 2 minutes.'
  }
];

export default function FaqsPage() {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState(DEFAULT_FAQS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [openIndex, setOpenIndex] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const fetchFaqs = async () => {
      setLoading(true);
      try {
        const res = await ApiService.getFaqs();
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setFaqs(res.data);
        }
      } catch (err) {
        console.warn('Using default FAQs fallback', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const categories = ['ALL', ...new Set(faqs.map((f) => f.category).filter(Boolean))];

  const filteredFaqs = faqs.filter((f) => {
    if (selectedCategory !== 'ALL' && f.category && f.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const qMatch = f.question && f.question.toLowerCase().includes(q);
      const aMatch = f.answer && f.answer.toLowerCase().includes(q);
      return qMatch || aMatch;
    }
    return true;
  });

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.slice(0, 10).map((f) => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.answer
      }
    }))
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf9f5] text-[#1c2826] selection:bg-[#b85438]/20 selection:text-[#1c2826]">
      <SEO 
        title="Frequently Asked Questions & Support | Online Therapy & Counselling" 
        description="Find answers to common questions about BEHOLD's professional online therapy, career aptitude assessments, and mental wellbeing support."
        keywords="therapy faqs, online counselling questions, psychologist consultation FAQ, mental health support answers, BEHOLD faqs"
        canonicalUrl="https://www.behold.co.in/faqs"
        schema={faqSchema}
      />

      {/* Header Section */}
      <section className="relative py-14 sm:py-20 pt-24 sm:pt-32 border-b border-[#ede7de] bg-[#fbf9f5] overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          {/* Breadcrumbs */}
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-[#5c6b66] mb-4">
            <button
              onClick={() => navigate('/')}
              className="hover:text-[#b85438] transition-colors cursor-pointer bg-transparent border-none p-0"
            >
              Home
            </button>
            <span className="text-[#ede7de]">/</span>
            <span className="text-[#1c2826] font-semibold">FAQs & Help</span>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#b85438]/10 text-[#b85438] font-semibold text-xs tracking-wider uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Support & FAQs
          </span>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight text-[#1c2826] leading-tight">
            Frequently Asked <span className="italic font-normal text-[#b85438]">Questions</span>
          </h1>

          <p className="mt-3 text-sm sm:text-base md:text-lg text-[#5c6b66] max-w-2xl mx-auto leading-relaxed font-normal">
            Whatever’s on your mind, we’re here to help you understand your consultation and care.
          </p>

          {/* Search Box */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <div className="relative flex items-center bg-white rounded-full border border-[#ede7de] shadow-sm focus-within:border-[#b85438] focus-within:ring-4 focus-within:ring-[#b85438]/10 transition-all duration-200">
              <Search className="w-5 h-5 text-[#5c6b66] absolute left-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search questions or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 text-sm sm:text-base font-normal text-[#1c2826] placeholder-[#5c6b66]/60 bg-transparent outline-none border-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 p-1 rounded-full text-[#5c6b66] hover:text-[#1c2826] hover:bg-[#ede7de] transition cursor-pointer border-none bg-transparent"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filters (Horizontal Scroll on Mobile) */}
          {categories.length > 2 && (
            <div className="mt-6 flex items-center justify-center gap-2 overflow-x-auto scrollbar-none py-1 px-2 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#b85438] text-white shadow-sm'
                      : 'bg-white hover:bg-[#ede7de]/40 text-[#1c2826] border border-[#ede7de]'
                  }`}
                >
                  {cat === 'ALL' ? 'All Questions' : cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Main FAQs Accordion List */}
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16 w-full">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-8 h-8 border-3 border-[#b85438] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="text-center py-12 px-6 bg-white rounded-3xl border border-[#ede7de] shadow-xs my-4">
            <div className="w-12 h-12 bg-[#faf5f0] rounded-full flex items-center justify-center mx-auto mb-3">
              <HelpCircle className="w-6 h-6 text-[#b85438]" />
            </div>
            <h3 className="text-base font-serif font-bold text-[#1c2826] mb-1">No matching questions found</h3>
            <p className="text-xs sm:text-sm text-[#5c6b66] max-w-xs mx-auto mb-4">
              Try adjusting your search terms or view all questions.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }}
              className="px-5 py-2.5 bg-[#1c2826] hover:bg-[#b85438] text-white font-medium text-xs rounded-full transition shadow-sm cursor-pointer border-none"
            >
              Reset Search
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={faq.id || idx}
                  className="bg-white border border-[#ede7de] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs hover:border-[#b85438]/40 transition-all duration-200"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 cursor-pointer border-none bg-transparent hover:bg-[#faf5f0]/50 transition-colors"
                  >
                    <span className="font-medium text-[#1c2826] text-sm sm:text-base leading-snug">
                      {faq.question}
                    </span>
                    <span className="shrink-0 w-8 h-8 rounded-full bg-[#fbf9f5] border border-[#ede7de] flex items-center justify-center text-[#5c6b66] transition-colors">
                      {isOpen ? <Minus className="w-4 h-4 text-[#b85438]" /> : <Plus className="w-4 h-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 text-[#5c6b66] text-xs sm:text-sm leading-relaxed border-t border-[#ede7de] font-normal animate-fade-in">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* CTA Card */}
        <div className="mt-12 bg-[#1c2826] rounded-3xl p-6 sm:p-10 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden shadow-xl border border-[#ede7de]/10">
          <div className="space-y-1.5 z-10">
            <h3 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-white flex items-center justify-center sm:justify-start gap-2">
              <MessageSquare className="w-5 h-5 text-[#b85438]" /> Still have questions?
            </h3>
            <p className="text-xs sm:text-sm text-[#ede7de]/80 max-w-md font-normal leading-relaxed">
              Can't find the answer you're looking for? Speak directly with our support team or book a consultation today.
            </p>
          </div>

          <button
            onClick={() => navigate('/#inquiry')}
            className="z-10 shrink-0 px-7 py-3.5 bg-[#b85438] hover:bg-[#a0462e] text-white font-medium text-xs sm:text-sm rounded-full transition shadow-md flex items-center gap-2 cursor-pointer whitespace-nowrap border-none"
          >
            Contact Support Desk <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
}
