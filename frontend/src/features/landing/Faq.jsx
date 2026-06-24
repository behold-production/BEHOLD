import React, { useState, useEffect } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import ApiService from '../../shared/services/api';

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(null);
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await ApiService.getFaqs();
        if (res.success && res.data) {
          setFaqs(res.data);
        }
      } catch (err) {
        console.error("Failed to load FAQs", err);
      }
    };

    fetchFaqs();

    const handleUpdate = () => {
      fetchFaqs();
    };

    window.addEventListener('behold_faqs_updated', handleUpdate);
    return () => {
      window.removeEventListener('behold_faqs_updated', handleUpdate);
    };
  }, []);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faqs" className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12 text-zinc-900 text-left select-none relative overflow-hidden">
      <style>{`
        .faq-neon-card {
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .faq-neon-card-active {
          border-color: #10b981 !important;
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.4), inset 0 0 8px rgba(16, 185, 129, 0.1) !important;
          background: rgba(16, 185, 129, 0.01) !important;
          transform: translateY(-2px);
        }
        .faq-neon-card-hover:hover:not(.faq-neon-card-active) {
          border-color: rgba(16, 185, 129, 0.5) !important;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.2) !important;
          transform: translateY(-1px);
        }
      `}</style>
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 w-[250px] h-[250px] bg-brand/10 rounded-lg glow-glow pointer-events-none" />

      {/* Section Header */}
      <div className="mb-6 md:mb-12 space-y-4 text-center">
        <span className="text-xs bg-zinc-900 text-white px-3.5 py-1 rounded-md capitalize  font-semibold w-fit mx-auto block">
          clarity desk
        </span>
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-header font-black tracking-tight text-zinc-900 leading-tight capitalize">
          Frequently Asked
        </h2>
        <p className="text-zinc-600 font-sans text-xs sm:text-sm md:text-base font-light max-w-xl mx-auto">
          Explore key information about the BEHOLD mentorship model, deliverables, and student tracking scopes.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-4 sm:space-y-6">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div 
              key={idx} 
              className={`bg-white border-[1.5px] border-[#0b1424] rounded-xl sm:rounded-2xl py-2.5 px-4 shadow-dark-blue-sm transition-all duration-500 faq-neon-card faq-neon-card-hover ${
                isOpen ? 'faq-neon-card-active' : ''
              }`}
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full min-h-[32px] text-left font-medium text-zinc-900 flex items-center justify-between hover:text-zinc-900 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 rounded-md"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                    isOpen ? 'bg-zinc-900 text-brand' : 'bg-zinc-100 text-zinc-900'
                  }`}>
                    <HelpCircle className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs sm:text-sm md:text-base font-header font-bold capitalize tracking-wide leading-tight">{faq.question}</span>
                </div>
                <ChevronDown 
                  className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-500 ${
                    isOpen ? 'rotate-180 text-zinc-900' : ''
                  }`} 
                />
              </button>
              
              <div 
                className={`transition-all duration-500 ease-out overflow-hidden ${
                  isOpen ? 'max-h-60 opacity-100 mt-2.5 pt-2.5 border-t border-zinc-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-zinc-650 text-xs md:text-sm font-light leading-relaxed pl-10">
                  {faq.answer}
                </p>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}
