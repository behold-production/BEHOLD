import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import ApiService from '../../shared/services/api';
import { ScrollDot, renderTitleWithFullstopDot } from '../../shared/components/BrandDot';

const defaultFaqs = [
  {
    question: 'What is the C-DAT aptitude assessment?',
    answer: "The C-DAT (Career Domain Aptitude Test) is a scientifically designed evaluation that identifies a student's natural aptitude domains — helping match them with the most suitable university programs and career paths aligned to their innate strengths.",
  },
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
    answer: 'No special preparation is required. We recommend having recent academic records available. For C-DAT sessions, students complete the online test before the counselor interprets results and builds a personalized career roadmap.',
  },
  {
    question: 'Do you provide support after the initial session?',
    answer: 'Absolutely. Our extended mentorship model includes follow-up reviews, goal tracking, and parent guidance sessions to ensure students stay on course and achieve their long-term academic and career milestones.',
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(0);
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

  const displayFaqs = faqs.length > 0 ? faqs.slice(0, 6) : defaultFaqs;

  return (
    <section id="faqs" className="py-14 bg-white">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-baseline gap-1 mb-4">
            <span className="text-sm font-bold tracking-widest uppercase text-blue-600">
              Frequently Asked Questions
            </span>
            <ScrollDot nextId="inquiry-title" label="Scroll to Inquiry ↓" size="xs" inlineText={true} />
          </div>
          <h2 id="faq-title" className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight flex items-center justify-center flex-wrap">
            {renderTitleWithFullstopDot('Everything You Need To Know', 'inquiry-title', 'Scroll to Inquiry ↓', 'md')}
          </h2>
          <p className="text-xl text-gray-500 leading-relaxed">
            We've answered the most common questions about our counseling model, C-DAT assessments, and mentorship programs.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {displayFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${isOpen ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 cursor-pointer bg-transparent border-none"
                >
                  <span className={`font-bold text-base leading-snug ${isOpen ? 'text-blue-700' : 'text-gray-900'}`}>
                    {faq.question}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${isOpen ? 'bg-blue-600 text-white rotate-180' : 'bg-gray-100 text-gray-500'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>
                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{ maxHeight: isOpen ? '400px' : '0px' }}
                >
                  <div className="px-6 pb-6 text-gray-600 leading-relaxed text-base border-t border-blue-100 pt-4">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 mb-4 font-medium">Still have questions?</p>
          <button
            onClick={() => {
              const el = document.getElementById('inquiry');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition border-none cursor-pointer shadow-lg shadow-blue-100"
          >
            Contact Our Team
          </button>
        </div>

      </div>
    </section>
  );
}
