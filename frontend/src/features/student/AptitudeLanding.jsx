import React from 'react';
import { motion } from 'framer-motion';
import { ScrollDot, renderTitleWithFullstopDot } from '../../shared/components/BrandDot';

export default function AptitudeLanding({ setView }) {
  const handleProceed = () => {
    window.spaNavigate?.('/sample-test');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDetailedCdat = () => {
    window.spaNavigate?.('/booking?service=cdat');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCounsellorAssign = () => {
    window.spaNavigate?.('/booking?service=career');
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
          <div className="mb-3">
            <span className="font-mono text-[12px] tracking-[0.2em] uppercase text-[#00E5FF] font-bold">
              CIGI Differential Aptitude Test
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-neon-blue-deep mb-6 leading-[1.1] tracking-tight flex items-center justify-center flex-wrap">
            {renderTitleWithFullstopDot('Know Yourself', 'journey-card', 'Scroll to Begin ↓', 'md')}
          </h1>
          
          <p className="text-ink-soft text-base sm:text-lg leading-relaxed mb-10 max-w-2xl mx-auto font-normal">
            Our C-DAT assessment, developed in partnership with CIGI, maps your natural strengths across reasoning, language, and numerical ability. It provides a data-driven foundation to discover the right career path tailored to your unique capabilities.
          </p>

          {/* Main Teaser Hook Card */}
          <div id="journey-card" className="bg-white rounded-lg shadow-xl p-8 sm:p-10 max-w-3xl mx-auto border border-[#E9EDE4] text-left mb-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-full blur-2xl -translate-y-12 translate-x-12 pointer-events-none" />
            <h3 className="text-2xl font-serif font-semibold text-neon-blue-deep mb-3">
              Begin Your Journey
            </h3>
            <p className="text-ink-soft text-sm leading-relaxed mb-6 max-w-xl">
              Take a sample test to experience the scientific format and see how our psychologists evaluate core competencies before full registration.
            </p>

            <button
              onClick={handleProceed}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 bg-[#00E5FF] hover:bg-[#00B3CC] text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg border-none cursor-pointer text-sm"
            >
              Try a Sample Test
            </button>
          </div>

          {/* Separate Linked Operations (As specified in Developer Brief Item 4.3) */}
          <div className="max-w-3xl mx-auto text-left">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 text-center">
              Explore Detailed Aptitude & Mentorship Services
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={handleDetailedCdat}
                className="bg-white p-5 rounded-lg border border-gray-200/80 hover:border-[#00E5FF] transition-all shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">Full C-DAT Test</span>
                  </div>
                  <h5 className="font-bold text-gray-900 text-base mb-1">Detailed Explanation & Pricing</h5>
                  <p className="text-xs text-gray-500 leading-relaxed">Complete registration, group codes, and comprehensive psychometric evaluation packages.</p>
                </div>
              </div>

              <div
                onClick={handleCounsellorAssign}
                className="bg-white p-5 rounded-lg border border-gray-200/80 hover:border-[#00E5FF] transition-all shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-md">Expert Assignment</span>
                  </div>
                  <h5 className="font-bold text-gray-900 text-base mb-1">Counsellor & Mentor Assignment</h5>
                  <p className="text-xs text-gray-500 leading-relaxed">Connect directly with certified career mentors and clinical psychologists for personalized roadmaps.</p>
                </div>
              </div>
            </div>
          </div>

        </motion.div>
        
      </div>
    </div>
  );
}
