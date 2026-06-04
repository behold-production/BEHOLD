import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    question: "What is the advantage of hiring a consultant instead of doing it in-house?",
    answer: "Professional counselling and mentorship provide students with scientifically backed assessments, unbiased guidance, emotional support, and expert career planning that schools and parents may not always be able to offer consistently."
  },
  {
    question: "What kind of deliverables are to be expected?",
    answer: "Students receive detailed aptitude reports, career recommendations, counselling sessions, mentorship support, progress tracking, and personalized growth strategies."
  },
  {
    question: "How long will the project take and how long until results can be measured?",
    answer: "Student growth and clarity begin from the early counselling stages, while long-term confidence, decision-making ability, and emotional development continue progressively through mentorship and guidance."
  }
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faqs" className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-20 text-zinc-900 text-left select-none relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 w-[250px] h-[250px] bg-brand/10 rounded-lg glow-glow pointer-events-none" />

      {/* Section Header */}
      <div className="mb-6 md:mb-12 space-y-4 text-center">
        <span className="text-[10px] bg-zinc-900 text-white px-3.5 py-1 rounded-md uppercase tracking-wider font-extrabold w-fit mx-auto block">
          clarity desk
        </span>
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-header font-black tracking-tight text-zinc-900 leading-tight uppercase">
          Frequently Asked
        </h2>
        <p className="text-zinc-600 font-sans text-xs sm:text-sm md:text-base font-light max-w-xl mx-auto">
          Explore key information about the BEHOLD mentorship model, deliverables, and student tracking scopes.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-4 sm:space-y-6">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div 
              key={idx} 
              className="bg-white border border-zinc-200 rounded-lg p-4 sm:p-6 md:p-8 shadow-xs hover:shadow-md transition-all duration-500"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full text-left font-medium text-zinc-900 flex items-start justify-between hover:text-zinc-900 transition cursor-pointer focus:outline-none"
                aria-expanded={isOpen}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-colors mt-0.5 ${
                    isOpen ? 'bg-zinc-900 text-brand' : 'bg-zinc-100 text-zinc-900'
                  }`}>
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm md:text-base font-header font-bold uppercase tracking-wide leading-tight pt-1">{faq.question}</span>
                </div>
                <ChevronDown 
                  className={`w-5 h-5 text-zinc-400 shrink-0 transition-transform duration-500 mt-1.5 ${
                    isOpen ? 'rotate-180 text-zinc-900' : ''
                  }`} 
                />
              </button>
              
              <div 
                className={`transition-all duration-500 ease-out overflow-hidden ${
                  isOpen ? 'max-h-60 opacity-100 mt-6 pt-6 border-t border-zinc-100' : 'max-h-0 opacity-0'
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
