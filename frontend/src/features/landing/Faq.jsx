import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, ArrowRight } from 'lucide-react';
import ApiService from '../../services/api';

const defaultFaqs = [
  {
    id: 'faq-1',
    question: 'How do I know which clinical psychologist is right for me?',
    answer: 'You can explore our team by their focus areas—such as anxiety, depression, trauma, career guidance, or adolescent support. You can also book a general consultation and our team will thoughtfully match you with the specialist best suited to your needs.',
  },
  {
    id: 'faq-2',
    question: 'Are online therapy sessions as effective as in-person visits?',
    answer: 'Yes. Extensive clinical research demonstrates that online cognitive and psychological counseling achieves identical therapeutic outcomes to in-person sessions, with added privacy and convenience.',
  },
  {
    id: 'faq-3',
    question: 'How is client privacy and confidentiality protected?',
    answer: 'BEHOLD adheres to strict clinical psychology ethical guidelines and data protection protocols. All sessions, notes, and records are 100% confidential and end-to-end encrypted.',
  },
  {
    id: 'faq-4',
    question: 'What happens during my very first consultation session?',
    answer: 'Your first session is a gentle, pressure-free sanctuary to share what brings you to therapy. Your psychologist will listen attentively, understand your goals, and formulate a collaborative care plan at your pace.',
  },
  {
    id: 'faq-5',
    question: 'Can I reschedule or cancel my booked appointment?',
    answer: 'Yes. You can cancel your appointment up to 24 hours prior to the scheduled start time for a 100% full refund. Rescheduling is completely free of charge up to 12 hours before your session directly through your account or WhatsApp support.',
  },
  {
    id: 'faq-6',
    question: 'What is the duration and fee structure of a session?',
    answer: 'We offer an Introductory Consultation (30 Minutes, ₹499) for first-time assessment and rapport building, and a Standard Comprehensive Session (60 Minutes, ₹899) for in-depth therapeutic interventions with no hidden fees.',
  },
];

export default function Faq({ siteSettings }) {
  const navigate = useNavigate();
  const settings = siteSettings || {};
  const showFaqs = settings.enableFaq !== false;
  const [openIndex, setOpenIndex] = useState(0); // first item open by default like in mockup
  const [faqs, setFaqs] = useState(defaultFaqs);

  useEffect(() => {
    let isMounted = true;
    if (showFaqs) {
      ApiService.getFaqs()
        .then((res) => {
          if (!isMounted) return;
          if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
            setFaqs(res.data);
          }
        })
        .catch(() => {});
    }
    return () => { isMounted = false; };
  }, [showFaqs]);

  if (!showFaqs) return null;

  const toggleIndex = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faqs"
      aria-labelledby="bh-faq-heading"
      className="relative py-20 sm:py-28 bg-[#fbf9f5] text-[#1c2826] overflow-hidden scroll-mt-20 border-t border-[#ece6dc]"
    >
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header: Left terracotta eyebrow, Right serif heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12 pb-4 border-b border-[#ece6dc]">
          <div>
            <span className="text-[#b85438] text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase block">
              FAQ
            </span>
          </div>
          <div>
            <h2
              id="bh-faq-heading"
              className="font-serif-hero text-2xl sm:text-3xl md:text-4xl font-normal text-[#1c2826] tracking-tight leading-snug"
            >
              Frequently Asked Questions
            </h2>
          </div>
        </div>

        {/* Accordion Stack matching mockup */}
        <div className="flex flex-col gap-2.5 sm:gap-3">
          {faqs.slice(0, 7).map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={item._id || item.id || idx}
                className={`rounded-md transition-all duration-200 border ${
                  isOpen
                    ? 'bg-white border-[#b85438]/40 shadow-xs'
                    : 'bg-white/80 hover:bg-white border-[#ede7de]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleIndex(idx)}
                  className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4 text-left cursor-pointer border-none bg-transparent"
                >
                  <span className="font-serif-hero text-base sm:text-lg font-medium text-[#1c2826] pr-2">
                    {item.question}
                  </span>
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-sm flex items-center justify-center shrink-0 transition-colors duration-200 ${
                      isOpen
                        ? 'bg-[#b85438] text-white'
                        : 'bg-[#f6f2ec] text-[#1c2826] group-hover:bg-[#ede7de]'
                    }`}
                  >
                    {isOpen ? (
                      <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-xs sm:text-sm text-[#5c6b66] leading-relaxed border-t border-[#f4ede4] pt-3">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Directory Link */}
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => {
              navigate('/faqs');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#b85438] hover:text-[#9e432c] transition-colors cursor-pointer bg-transparent border-none p-0"
          >
            <span>Have more questions? Browse all FAQs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
