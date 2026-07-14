import React from 'react';
import { motion } from 'framer-motion';

export default function AptitudeLanding({ setView }) {
  const handleProceed = () => {
    window.spaNavigate?.('/sample-test');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full bg-[#FAF8F5] min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-12 flex flex-col items-center text-center">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full"
        >
          <span className="font-mono text-[12px] tracking-[0.2em] uppercase text-[#C89B3C] font-bold block mb-4">
            CIGI Differential Aptitude Test
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-neon-blue-deep mb-8 leading-[1.1] tracking-tight">
            Know Yourself.
          </h1>
          
          <p className="text-ink-soft text-base sm:text-lg leading-relaxed mb-12 max-w-2xl mx-auto">
            Our C-DAT assessment, developed in partnership with CIGI, maps your natural strengths across reasoning, language, and numerical ability. It provides a data-driven foundation to discover the right career path tailored to your unique capabilities.
          </p>

          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 max-w-3xl mx-auto border border-[#E9EDE4] text-left">
            <h3 className="text-2xl font-serif font-semibold text-neon-blue-deep mb-4">
              Begin Your Journey
            </h3>
            <p className="text-ink-soft text-sm mb-8">
              Take a sample test to understand the format and see how we map your core competencies.
            </p>

            <button
              onClick={handleProceed}
              className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-4 bg-[#C89B3C] hover:bg-[#D4A373] text-white font-semibold rounded-full transition-all shadow-md hover:shadow-lg border-none cursor-pointer"
            >
              Try a Sample Test
            </button>
          </div>
        </motion.div>
        
      </div>
    </div>
  );
}
