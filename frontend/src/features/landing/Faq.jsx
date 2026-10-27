import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ArrowUpRight, HelpCircle } from 'lucide-react';
import ApiService from '../../services/api';
import greyGreenBg from '../../assets/greygreen.png';

export default function Faq({ siteSettings }) {
  const navigate = useNavigate();
  const settings = siteSettings || {};
  const showFaqs = settings.enableFaq !== false;
  const enableAptitude = settings.enableAptitude !== false;
  const [openIndex, setOpenIndex] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [faqError, setFaqError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadFaqs = (forceRefresh = false) => {
      setLoading(true);
      return ApiService.getFaqs(forceRefresh)
        .then((res) => {
          if (res?.success && Array.isArray(res.data)) {
            if (isMounted) {
              setFaqs(res.data);
              setFaqError('');
            }
          } else {
            if (isMounted) setFaqs([]);
          }
        })
        .catch((err) => {
          console.error('Failed to load FAQs', err);
          if (isMounted) setFaqError('FAQs are temporarily unavailable.');
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    };

    if (showFaqs) {
      loadFaqs(true);
    } else {
      setLoading(false);
    }

    const handler = () => loadFaqs(true);
    window.addEventListener('behold_faqs_updated', handler);
    return () => {
      isMounted = false;
      window.removeEventListener('behold_faqs_updated', handler);
    };
  }, [showFaqs]);

  if (!showFaqs) return null;

  const displayFaqs = (enableAptitude
    ? faqs
    : faqs.filter(f => !f.question?.toLowerCase().includes('c-dat') && !f.question?.toLowerCase().includes('aptitude'))
  ).slice(0, 6);

  return (
    <section id="faqs" aria-labelledby="faq-title" className="relative py-20 sm:py-28 bg-[#fffefa] text-slate-900 border-b border-slate-200/80 overflow-hidden">
      {/* Soft background fade */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={greyGreenBg?.src || greyGreenBg}
          alt=""
          className="w-full h-full object-cover object-center opacity-35 [mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)]"
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold text-teal-700 tracking-widest uppercase mb-3">
            <span className="w-5 h-px bg-teal-600/40 inline-block" />
            {settings.faqSectionSub || 'Frequently Asked Questions'}
            <span className="w-5 h-px bg-teal-600/40 inline-block" />
          </span>
          <h2 id="faq-title" className="text-3xl sm:text-4xl md:text-5xl font-sans font-semibold text-slate-900 mb-4 tracking-tight leading-tight">
            {settings.faqSectionTitle || 'Everything You Need to Know'}<span className="text-[#0d827f]">.</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-normal max-w-xl mx-auto leading-relaxed mb-6">
            {settings.faqSectionDesc || "Whatever’s on your mind, we’re here to help you understand what comes next."}
          </p>
          <button
            type="button"
            onClick={() => {
              navigate('/faqs');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs tracking-wider rounded-lg transition-all border border-slate-200 hover:border-slate-300 cursor-pointer shadow-2xs inline-flex items-center gap-2"
          >
            <span>Browse Full FAQ Directory</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-teal-700" />
          </button>
        </div>

        {/* Accordion list */}
        {loading ? (
          <div className="space-y-3.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-lg border border-slate-200 bg-white/90 px-6 py-5 flex items-center justify-between gap-4 shadow-2xs">
                <div className="shimmer h-4 w-3/4 rounded-md" />
                <div className="shimmer w-7 h-7 rounded-md shrink-0" />
              </div>
            ))}
          </div>
        ) : displayFaqs.length === 0 ? (
          <div className="text-center py-12 bg-white/90 rounded-lg border border-dashed border-slate-200 p-8 space-y-3 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center mx-auto">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Questions Listed</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Have questions? Reach out directly to our team below.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={faq._id || idx}
                  className={`rounded-lg border transition-all duration-200 overflow-hidden bg-white/95 backdrop-blur-xs ${
                    isOpen
                      ? 'border-[#0d827f] shadow-xs ring-1 ring-[#0d827f]/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full text-left px-5 sm:px-6 py-4.5 flex items-center justify-between gap-4 cursor-pointer bg-transparent border-none focus-visible:outline-none"
                  >
                    <span className={`font-semibold text-sm sm:text-base leading-snug transition-colors ${isOpen ? 'text-[#0d827f]' : 'text-slate-900'}`}>
                      {faq.question}
                    </span>
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? 'bg-teal-50 text-teal-800 rotate-180 border border-teal-200' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 text-slate-600 leading-relaxed text-xs sm:text-sm border-t border-slate-100 pt-3.5 font-normal">
                      {faq.answer || faq.text}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-slate-500 mb-3 text-xs sm:text-sm font-normal">Still have a specific question?</p>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('inquiry');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white font-semibold text-xs tracking-wider rounded-lg transition-all border border-slate-900 cursor-pointer shadow-xs inline-flex items-center gap-1.5"
          >
            Contact Our Team
          </button>
        </div>

      </div>
    </section>
  );
}
