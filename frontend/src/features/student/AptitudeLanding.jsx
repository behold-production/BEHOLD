import React from 'react';

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
    <div className="w-full bg-white min-h-screen pt-24 pb-16 text-slate-900 border-b border-slate-100">
      <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-12 flex flex-col items-center text-center">
        
        <div className="w-full">
          <div className="mb-3">
            <span className="inline-block px-3 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-bold">
              CIGI Differential Aptitude Test
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
            Know Yourself
          </h1>
          
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-10 max-w-2xl mx-auto font-normal">
            Our C-DAT assessment, developed in partnership with CIGI, maps your natural strengths across reasoning, language, and numerical ability. It provides a data-driven foundation to discover the right career path tailored to your unique capabilities.
          </p>

          {/* Main Teaser Hook Card */}
          <div className="bg-slate-50 rounded-xl p-8 sm:p-10 max-w-3xl mx-auto border border-slate-200 text-left mb-12 shadow-xs">
            <span className="inline-block px-2.5 py-0.5 rounded-md bg-black text-white text-[10px] font-bold uppercase tracking-wider mb-3">
              Teaser Assessment
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              Begin Your Journey
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6 max-w-xl">
              Take a sample test to experience the scientific format and see how our psychologists evaluate core competencies before full registration.
            </p>

            <button
              onClick={handleProceed}
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-black text-white font-bold rounded-lg transition-colors shadow-xs border-none cursor-pointer text-sm"
            >
              Try a Sample Test
            </button>
          </div>

          {/* Separate Linked Operations */}
          <div className="max-w-3xl mx-auto text-left">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 text-center">
              Explore Detailed Aptitude & Mentorship Services
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={handleDetailedCdat}
                className="bg-white p-6 rounded-xl border border-slate-200 hover:border-slate-400 transition-all shadow-xs cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md inline-block mb-3">
                    Full C-DAT Test
                  </span>
                  <h5 className="font-bold text-slate-900 text-base mb-1">Detailed Explanation & Pricing</h5>
                  <p className="text-xs text-slate-500 leading-relaxed">Complete registration, group codes, and comprehensive psychometric evaluation packages.</p>
                </div>
              </div>

              <div
                onClick={handleCounsellorAssign}
                className="bg-white p-6 rounded-xl border border-slate-200 hover:border-slate-400 transition-all shadow-xs cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md inline-block mb-3">
                    Expert Assignment
                  </span>
                  <h5 className="font-bold text-slate-900 text-base mb-1">Counsellor & Mentor Assignment</h5>
                  <p className="text-xs text-slate-500 leading-relaxed">Connect directly with certified career mentors and clinical psychologists for personalized roadmaps.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
        
      </div>
    </div>
  );
}
