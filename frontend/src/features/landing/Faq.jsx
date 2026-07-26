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

  const displayFaqs = faqs.length > 0 ? faqs.slice(0, 6) : defaultFaqs;

  return (
    <section id="faqs" className="py-20 sm:py-28 bg-[#f7f4ef] text-[#1c1514] border-b border-[#e2dad2]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-xs font-bold tracking-widest uppercase text-[#7c7069] block mb-2">
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 id="faq-title" className="text-3xl sm:text-5xl font-sans font-bold uppercase text-[#1c1514] mb-3 tracking-tight leading-none">
            Everything You Need to Know.
          </h2>
          <p className="text-sm sm:text-base text-[#6e635e] font-normal max-w-xl mx-auto leading-relaxed">
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
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen ? 'border-[#1c1514] bg-white shadow-sm' : 'border-[#d6cecb] bg-white hover:border-[#1c1514]'}`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 cursor-pointer bg-transparent border-none"
                >
                  <span className={`font-bold text-sm sm:text-base leading-snug ${isOpen ? 'text-[#1c1514]' : 'text-[#1c1514]'}`}>
                    {faq.question}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${isOpen ? 'bg-[#2b211e] text-[#f7f4ef] rotate-180' : 'bg-[#eae4dc] text-[#1c1514]'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>
                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{ maxHeight: isOpen ? '400px' : '0px' }}
                >
                  <div className="px-6 pb-6 text-[#6e635e] leading-relaxed text-xs sm:text-sm border-t border-[#eae4dc] pt-4 font-normal">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-[#6e635e] mb-4 text-xs sm:text-sm font-normal">Still have questions?</p>
          <button
            onClick={() => {
              const el = document.getElementById('inquiry');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="px-7 py-3 bg-[#2b211e] hover:bg-[#1c1514] text-[#f7f4ef] font-bold text-xs uppercase tracking-widest rounded-full transition-all border-none cursor-pointer shadow-xs"
          >
            Contact Our Team
          </button>
        </div>

      </div>
    </section>
  );
}
