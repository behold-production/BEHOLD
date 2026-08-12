import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import ApiService from '../../services/api';
import greenTexture from '../../assets/greygreen.png';

export default function Faq({ siteSettings }) {
  const settings = siteSettings || JSON.parse(localStorage.getItem('behold_site_settings') || '{}');
  const enableAptitude = settings.enableAptitude !== false;
  const [openIndex, setOpenIndex] = useState(null);
  const [faqs, setFaqs] = useState(() => {
    try {
      const cached = localStorage.getItem('behold_faqs_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) { }
    return [];
  });
  const [loading, setLoading] = useState(() => faqs.length === 0);

  useEffect(() => {
    if (faqs.length === 0) setLoading(true);
    ApiService.getFaqs()
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setFaqs(res.data);
          localStorage.setItem('behold_faqs_cache', JSON.stringify(res.data));
        } else {
          setFaqs([]);
        }
      })
      .catch((err) => {
        console.error('Failed to load FAQs', err);
        setFaqs([]);
      })
      .finally(() => setLoading(false));

    const handler = async () => {
      const res = await ApiService.getFaqs().catch(() => ({}));
      if (res.success && Array.isArray(res.data)) {
        setFaqs(res.data);
        if (res.data.length > 0) {
          localStorage.setItem('behold_faqs_cache', JSON.stringify(res.data));
        }
      }
    };
    window.addEventListener('behold_faqs_updated', handler);
    return () => window.removeEventListener('behold_faqs_updated', handler);
  }, []);

  const displayFaqs = enableAptitude
    ? faqs
    : faqs.filter(f => !f.question?.toLowerCase().includes('c-dat') && !f.question?.toLowerCase().includes('aptitude'));

  return (
    <section id="faqs" className="py-20 sm:py-28 bg-transparent text-surface-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold text-[#00c9d6] tracking-widest uppercase mb-2">
            <span className="w-5 h-px bg-[#00c9d6]/60 inline-block" />
            {settings.faqSectionSub || 'FREQUENTLY ASKED QUESTIONS'}
            <span className="w-5 h-px bg-[#00c9d6]/60 inline-block" />
          </span>
          <h2 id="faq-title" className="text-3xl sm:text-5xl font-sans font-bold uppercase text-[#0f172a] mb-3 tracking-tight leading-none">
            {settings.faqSectionTitle || 'Everything You Need to Know'}
            <span className="text-[#00e5ff] drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]">.</span>
          </h2>
          <p className="text-sm sm:text-base text-surface-600 font-normal max-w-xl mx-auto leading-relaxed">
            {settings.faqSectionDesc || "Whatever’s on your mind, we’re here to help you understand what comes next."}
          </p>
        </div>

        {/* Accordion */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border border-surface-200 bg-white px-6 py-5 flex items-center justify-between gap-4">
                <div className="shimmer h-4 w-3/4 rounded-md" />
                <div className="shimmer w-8 h-8 rounded-full shrink-0" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {displayFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-xl border transition-all duration-300 overflow-hidden ${isOpen ? 'border-[#00e5ff] bg-white shadow-sm' : 'border-surface-200 bg-white hover:border-[#00e5ff]'}`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 cursor-pointer bg-transparent border-none"
                  >
                    <span className={`font-bold text-sm sm:text-base leading-snug ${isOpen ? 'text-[#00e5ff]' : 'text-[#0f172a]'}`}>
                      {faq.question}
                    </span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${isOpen ? 'bg-[#0f172a] text-[#00e5ff] rotate-180 border border-[#00e5ff]/40' : 'bg-surface-100 text-[#0f172a]'}`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{ maxHeight: isOpen ? '400px' : '0px' }}
                  >
                    <div className="px-6 pb-6 text-surface-600 leading-relaxed text-xs sm:text-sm border-t border-surface-100 pt-4 font-normal">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-surface-600 mb-4 text-xs sm:text-sm font-normal">Still have questions?</p>
          <button
            onClick={() => {
              const el = document.getElementById('inquiry');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="px-7 py-3 bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all border border-[#00e5ff]/30 cursor-pointer shadow-xs"
          >
            Contact Our Team
          </button>
        </div>

      </div>
    </section>
  );
}
