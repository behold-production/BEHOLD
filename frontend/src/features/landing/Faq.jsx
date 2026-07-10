import React, { useState, useEffect } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import ApiService from '../../shared/services/api';

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(0); // first item open by default like Prime Star
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await ApiService.getFaqs();
        if (res.success && res.data) {
          setFaqs(res.data);
        }
      } catch (err) {
        console.error('Failed to load FAQs', err);
      }
    };
    fetchFaqs();

    const handleUpdate = () => fetchFaqs();
    window.addEventListener('behold_faqs_updated', handleUpdate);
    return () => window.removeEventListener('behold_faqs_updated', handleUpdate);
  }, []);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const displayFaqs = faqs.length > 0 ? faqs.slice(0, 6) : [
    { question: 'What is the C-DAT aptitude assessment?', answer: 'The C-DAT (Career Domain Aptitude Test) is a scientifically designed evaluation that identifies a student\'s natural aptitude domains — helping match them with the most suitable university programs and career paths aligned to their innate strengths.' },
    { question: 'Who can book a counseling session with Behold?', answer: 'Behold serves students from Class 8 onwards, parents, and young professionals seeking career clarity. Our sessions are available in-person (Kerala), doorstep visits, and online via video call — making expert guidance accessible everywhere.' },
    { question: 'How does doorstep counseling work?', answer: 'Our trained counselors visit your home at a scheduled time. This ensures maximum comfort and emotional privacy for the student, especially important for sensitive topics like academic pressure, stream selection, and personal goal setting.' },
    { question: 'What documents or preparation is needed before a session?', answer: 'No special preparation is required. We recommend having recent academic records available. For C-DAT sessions, students complete the online test before the counselor interprets results and builds a personalized career roadmap.' },
    { question: 'Do you provide support after the initial session?', answer: 'Absolutely. Our extended mentorship model includes follow-up reviews, goal tracking, and parent guidance sessions to ensure students stay on course and achieve their long-term academic and career milestones.' },
  ];

  return (
    <motion.section
      id="faqs"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      className="py-10 md:py-28 bg-white overflow-hidden"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-[#00E5FF] block mb-3">
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-[46px] font-normal text-slate-900 mb-4 leading-[1.18] tracking-tight">
            Everything You Need To Know
          </h2>
          <p className="text-gray-600 text-sm sm:text-[15px] max-w-3xl mx-auto leading-relaxed font-normal">
            We've answered the most common questions about our counseling model, C-DAT assessments,
            session formats, and mentorship programs to help you get started with confidence.
          </p>
        </div>

        {/* Accordion Items */}
        <div className="space-y-4 sm:space-y-5">
          {displayFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="border border-gray-200/80 rounded-[8px] overflow-hidden bg-white shadow-sm hover:shadow transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className={`w-full text-left px-6 sm:px-8 py-5 sm:py-6 font-bold text-base sm:text-lg text-slate-900 flex justify-between items-center focus:outline-none transition-colors duration-200 cursor-pointer ${isOpen ? 'bg-[#00E5FF]/5' : 'bg-white hover:bg-gray-50/60'}`}
                  aria-expanded={isOpen}
                >
                  <span className="pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-700 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#00E5FF]' : ''}`}
                  />
                </button>
                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{ maxHeight: isOpen ? '300px' : '0px' }}
                >
                  <div className="px-6 pb-6 pt-4 sm:px-8 sm:pb-7 text-xs sm:text-sm text-gray-600 leading-relaxed font-normal border-t border-gray-100">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        {faqs.length > 6 && (
          <div className="flex justify-center mt-10">
            <button
              type="button"
              onClick={() => {
                window.spaNavigate?.('/faqs');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-[#00E5FF] hover:text-slate-900 text-white font-bold text-sm rounded-xl transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg border-none"
            >
              <span>View All FAQs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </motion.section>
  );
}
