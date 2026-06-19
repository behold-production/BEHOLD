import React, { useState, useEffect } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import ApiService from '../services/api';

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
              className="bg-white border border-zinc-200 rounded-xl p-3 sm:p-4 md:p-5 shadow-[0_4px_20px_-6px_rgba(9,14,26,0.18),0_2px_10px_-2px_rgba(0,209,209,0.06)] hover:shadow-[0_8px_30px_-6px_rgba(9,14,26,0.28),0_4px_16px_-3px_rgba(0,209,209,0.15)] transition-all duration-500"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full min-h-[40px] text-left font-medium text-zinc-900 flex items-start justify-between hover:text-zinc-900 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 rounded-md"
                aria-expanded={isOpen}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-colors mt-0.5 ${
                    isOpen ? 'bg-zinc-900 text-brand' : 'bg-zinc-100 text-zinc-900'
                  }`}>
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm md:text-base font-header font-bold capitalize tracking-wide leading-tight pt-1">{faq.question}</span>
                </div>
                <ChevronDown 
                  className={`w-5 h-5 text-zinc-400 shrink-0 transition-transform duration-500 mt-1.5 ${
                    isOpen ? 'rotate-180 text-zinc-900' : ''
                  }`} 
                />
              </button>
              
              <div 
                className={`transition-all duration-500 ease-out overflow-hidden ${
                  isOpen ? 'max-h-60 opacity-100 mt-4 pt-4 border-t border-zinc-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-zinc-650 text-xs md:text-sm font-light leading-relaxed pl-12">
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
