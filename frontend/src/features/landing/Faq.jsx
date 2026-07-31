import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import ApiService from '../../shared/services/api';
import greenTexture from '../../assets/clarity_bg.png';

const cdatFaq = {
  question: 'What is the C-DAT aptitude assessment?',
  answer: "The C-DAT (Career Domain Aptitude Test) is a scientifically designed evaluation that identifies a student's natural aptitude domains — helping match them with the most suitable university programs and career paths aligned to their innate strengths.",
};

const defaultFaqs = [
  cdatFaq,
  {
    question: 'Who can book a counseling session with Behold?',
    answer: 'Behold serves students from Class 8 onwards, parents, and young professionals seeking career clarity. Our sessions are available in-person (Kerala), doorstep visits, and online via video call — making expert guidance accessible everywhere.',
  },
  {
    question: 'How does doorstep counseling work?',
    answer: 'Our trained counselors visit your home at a scheduled time. This ensures maximum comfort and emotional privacy for the student, especially important for sensitive topics like academic pressure, stream selection, and personal goal setting.',
  },
  {
    question: 'What documents or preparation is needed before a session?',
    answer: 'No special preparation is required. We recommend having recent academic records available. Our counselors will guide you through every step during your first session.',
  },
  {
    question: 'Do you provide support after the initial session?',
    answer: 'Absolutely. Our extended mentorship model includes follow-up reviews, goal tracking, and parent guidance sessions to ensure students stay on course and achieve their long-term academic and career milestones.',
  },
];

export default function Faq({ siteSettings }) {
  const settings = siteSettings || JSON.parse(localStorage.getItem('behold_site_settings') || '{}');
  const enableAptitude = settings.enableAptitude !== false;
  const [openIndex, setOpenIndex] = useState(null);
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    ApiService.getFaqs()
      .then(res => { if (res.success && res.data?.length > 0) setFaqs(res.data); })
      .catch(() => {});
    const handler = async () => {
      const res = await ApiService.getFaqs().catch(() => ({}));
      if (res.success && res.data) setFaqs(res.data);
    };
    window.addEventListener('behold_faqs_updated', handler);
    return () => window.removeEventListener('behold_faqs_updated', handler);
  }, []);

  // When aptitude is disabled, filter out the C-DAT FAQ from defaults
  const filteredDefaultFaqs = enableAptitude
    ? defaultFaqs
    : defaultFaqs.filter(f => f !== cdatFaq);

  const displayFaqs = faqs.length > 0
    ? (enableAptitude ? faqs : faqs.filter(f => !f.question?.toLowerCase().includes('c-dat') && !f.question?.toLowerCase().includes('aptitude')))
    : filteredDefaultFaqs;

  return (
    <section id="faqs" className="py-20 sm:py-28 bg-transparent text-surface-900 border-b border-surface-200"
      style={{
        backgroundImage: `url(${greenTexture})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#d4f8fc'
      }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-xs font-bold tracking-widest uppercase text-[#00e5ff] flex items-center justify-center gap-1.5 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]" />
            {settings.faqSectionSub || 'FREQUENTLY ASKED QUESTIONS'}
          </span>
          <h2 id="faq-title" className="text-3xl sm:text-5xl font-sans font-bold uppercase text-[#0f172a] mb-3 tracking-tight leading-none">
            {settings.faqSectionTitle || 'Everything You Need to Know'}
            <span className="text-[#00e5ff] drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]">.</span>
          </h2>
          <p className="text-sm sm:text-base text-surface-600 font-normal max-w-xl mx-auto leading-relaxed">
            {settings.faqSectionDesc || (enableAptitude
              ? "We've answered the most common questions about our counseling model, C-DAT assessments, and mentorship programs."
              : "We've answered the most common questions about our career mentoring and psychological counselling programs."
            )}
          </p>
        </div>

        {/* Accordion */}
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
