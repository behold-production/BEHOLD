import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import ApiService from '../../shared/services/api';

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
    <section id="faqs" className="py-16 sm:py-24 bg-white border-b border-gray-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-bold tracking-widest uppercase text-gray-400 block mb-3">
            Frequently Asked Questions
          </span>
          <h2 id="faq-title" className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4 tracking-tight leading-tight">
            Everything You Need to Know.
          </h2>
          <p className="text-sm sm:text-base text-gray-600 font-normal max-w-xl mx-auto leading-relaxed">
            We've answered the most common questions about our counseling model, C-DAT assessments, and mentorship programs.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {displayFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-lg border transition-all duration-200 overflow-hidden ${isOpen ? 'border-gray-900 bg-gray-50/50 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 cursor-pointer bg-transparent border-none"
                >
                  <span className={`font-bold text-base leading-snug ${isOpen ? 'text-gray-900' : 'text-gray-800'}`}>
                    {faq.question}
                  </span>
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-all ${isOpen ? 'bg-gray-900 text-white rotate-180' : 'bg-gray-100 text-gray-500'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>
                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{ maxHeight: isOpen ? '400px' : '0px' }}
                >
                  <div className="px-6 pb-6 text-gray-600 leading-relaxed text-sm sm:text-base border-t border-gray-200 pt-4 font-normal">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 text-center">
          <p className="text-gray-600 mb-4 text-sm font-normal">Still have questions?</p>
          <button
            onClick={() => {
              const el = document.getElementById('inquiry');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="px-8 py-3 bg-gray-900 hover:bg-black text-white font-semibold text-sm rounded-md transition border-none cursor-pointer shadow-sm"
          >
            Contact Our Team
          </button>
        </div>

      </div>
    </section>
  );
}
