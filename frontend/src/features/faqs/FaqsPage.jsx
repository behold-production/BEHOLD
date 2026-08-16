import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, HelpCircle, Search, X, MessageSquare, ArrowRight, ShieldCheck, Sparkles, Minus, Plus } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 text-slate-900 selection:bg-[#00c9d6] selection:text-slate-950 font-sans">
      <SEO 
        title="Frequently Asked Questions & Support" 
        description="Find answers to common questions about BEHOLD's professional online therapy, career aptitude assessments, and mental wellbeing support."
        canonicalUrl="https://www.behold.co.in/faqs"
      />
      <Navbar />

      {/* Header Section */}
      <section className="relative py-12 sm:py-16 pt-24 sm:pt-28 border-b border-slate-200/80 bg-white overflow-hidden">
        {/* Background Accent Image */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <img
            src={shadeGreenBg}
            alt=""
            className="w-full h-full object-cover object-center [mask-image:linear-gradient(to_bottom,black_20%,transparent_100%)]"
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00c9d6]/10 text-[#008b94] font-bold text-[11px] uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Help & Support Center
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Frequently Asked <span className="text-[#00c9d6]">Questions</span>
          </h1>

          <p className="mt-3 text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Whatever’s on your mind, we’re here to help you understand what comes next.
          </p>

          {/* Search Box */}
          <div className="mt-6 sm:mt-8 max-w-xl mx-auto relative">
            <div className="relative flex items-center bg-white rounded-2xl border border-slate-200 shadow-md focus-within:border-[#00c9d6] focus-within:ring-2 focus-within:ring-[#00c9d6]/20 transition-all duration-200">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search questions or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-3.5 text-sm sm:text-base font-medium text-slate-800 placeholder-slate-400 bg-transparent outline-none border-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
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
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
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
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-8 h-8 border-3 border-[#00c9d6] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="text-center py-12 px-6 bg-white rounded-3xl border border-dashed border-slate-300 shadow-xs my-4">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <HelpCircle className="w-6 h-6 text-[#00c9d6]" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">No matching questions found</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto mb-4">
              Try adjusting your search terms or view all questions.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }}
              className="px-4 py-2 bg-slate-900 hover:bg-[#00c9d6] hover:text-slate-950 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer"
            >
              Reset Search
            </button>
          </div>
        ) : (
          <div className="space-y-3.5 sm:space-y-4">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={faq.id || idx}
                  className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-sm transition-all duration-200"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer border-none bg-transparent hover:bg-slate-50/50 transition-colors"
                  >
                    <span className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                      {faq.question}
                    </span>
                    <span className="shrink-0 w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:text-slate-900 transition-colors">
                      {isOpen ? <Minus className="w-4 h-4 text-[#00c9d6]" /> : <Plus className="w-4 h-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100 font-medium animate-fade-in">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* CTA Card */}
        <div className="mt-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden shadow-xl border border-slate-700/50">
          <div className="absolute right-0 top-0 w-48 h-48 bg-[#00c9d6]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-1 z-10">
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center justify-center sm:justify-start gap-2">
              <MessageSquare className="w-5 h-5 text-[#00c9d6]" /> Still have questions?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md font-normal leading-relaxed">
              Can't find the answer you're looking for? Speak directly with our support team or book a consultation today.
            </p>
          </div>

          <button
            onClick={() => navigate('/#inquiry')}
            className="z-10 shrink-0 px-6 py-3 bg-[#00c9d6] hover:bg-[#00b2be] text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer whitespace-nowrap hover-scale-btn"
          >
            Contact Support Desk <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
