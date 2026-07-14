import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, HelpCircle, ArrowLeft, Search, Sparkles } from 'lucide-react';
import Navbar from '../../shared/components/Navbar';
import Footer from '../../shared/components/Footer';
import ApiService from '../../shared/services/api';

export default function FaqsPage() {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'Frequently Asked Questions & Support | Behold Aspire';

    const fetchFaqs = async () => {
      setLoading(true);
      try {
        const res = await ApiService.getFaqs();
        if (res.success && res.data) {
          setFaqs(res.data);
        }
      } catch (err) {
        console.error('Failed to load FAQs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredFaqs = faqs.filter((f) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (f.question && f.question.toLowerCase().includes(q)) ||
      (f.answer && f.answer.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 pt-28 pb-20 selection:bg-[#00E5FF] selection:text-slate-900">
      <Navbar />

      {/* Header */}
      <section className="relative py-12 sm:py-16 border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#008899] hover:text-slate-900 mb-6 transition-colors cursor-pointer bg-transparent border-none p-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E5FF]/15 border border-[#00E5FF]/40 text-[#008899] text-xs font-black tracking-widest uppercase mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CLARITY DESK & KNOWLEDGE BASE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-header tracking-tight text-slate-900 leading-tight">
            Frequently Asked <span className="text-[#008899]">Questions</span>
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Complete answers regarding Behold Aspire assessment models, stream selections, counselling procedures, and lifetime support.
          </p>

          {/* Search Box */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <input
              type="text"
              placeholder="Search questions or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white border border-slate-200 focus:border-[#008899] text-slate-900 placeholder-slate-400 text-sm font-medium outline-none shadow-md transition-all"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </section>

      {/* Main FAQs Accordion List */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-[#008899] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <HelpCircle className="w-12 h-12 text-[#008899] mx-auto mb-3 opacity-70" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">No questions found</h3>
            <p className="text-sm text-slate-500">Try searching for a different keyword.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className={`bg-white rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 ${
                    isOpen ? 'ring-1 ring-[#008899]/30 border-[#008899]' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-6 text-left flex items-center justify-between cursor-pointer focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                          isOpen
                            ? 'bg-[#008899] text-white border-[#008899]'
                            : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}
                      >
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <span className="font-header font-bold text-base sm:text-lg text-slate-900">
                        {faq.question}
                      </span>
                    </div>
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-transform duration-300 ${
                        isOpen
                          ? 'rotate-180 bg-slate-900 text-[#00E5FF] border-slate-900'
                          : 'bg-white text-slate-400 border-slate-200'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  <div
                    className={`transition-all duration-300 overflow-hidden ${
                      isOpen ? 'max-h-96 opacity-100 border-t border-slate-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="text-slate-600 font-normal leading-relaxed text-sm sm:text-base p-6 pt-4 ml-0 sm:ml-12">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
