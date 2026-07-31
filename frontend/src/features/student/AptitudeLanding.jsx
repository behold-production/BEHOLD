import React from 'react';
import greenTexture from '../../assets/clarity_bg.png';

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
    <div 
      className="w-full min-h-screen pt-28 pb-20 text-surface-900 border-b border-surface-200"
      style={{
        backgroundImage: `url(${greenTexture})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#d4f8fc'
      }}
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-12 flex flex-col items-center text-center">
        
        <div className="w-full">
          <div className="mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#00e5ff] flex items-center justify-center gap-1.5">

              CIGI DIFFERENTIAL APTITUDE TEST
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-sans font-black uppercase text-[#0f172a] mb-6 leading-none tracking-tight">
            KNOW YOURSELF<span className="text-[#00e5ff] drop-shadow-[0_0_8px_rgba(0,229,255,0.8)] font-black">.</span>
          </h1>
          
          <p className="text-surface-600 text-base sm:text-lg leading-relaxed mb-12 max-w-2xl mx-auto font-normal">
            Our C-DAT assessment, developed in partnership with CIGI, maps your natural strengths across reasoning, language, and numerical ability. It provides a data-driven foundation to discover the right career path.
          </p>

          {/* Main Teaser Hook Card */}
          <div className="bg-[#0f172a] text-white rounded-xl p-8 sm:p-12 max-w-3xl mx-auto border border-[#00e5ff]/30 text-left mb-14 shadow-lg">
            <span className="inline-block px-3.5 py-1.5 rounded-full bg-[#00e5ff] text-[#0f172a] text-[10px] font-extrabold uppercase tracking-widest mb-4">
              Teaser Assessment
            </span>
            <h3 className="text-2xl sm:text-3xl font-sans font-black uppercase text-white mb-3">
              Begin Your Journey
            </h3>
            <p className="text-surface-300 text-xs sm:text-sm leading-relaxed mb-8 max-w-xl font-normal">
              Take a sample test to experience the scientific format and see how our psychologists evaluate core competencies before full registration.
            </p>

            <button
              onClick={handleProceed}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#00e5ff] hover:bg-[#00cce6] text-[#0f172a] font-bold text-xs uppercase tracking-widest rounded-full transition-all shadow-md border-none cursor-pointer"
            >
              Try a Sample Test ›
            </button>
          </div>

          {/* Separate Linked Operations */}
          <div className="max-w-3xl mx-auto text-left">
            <h4 className="text-xs font-bold uppercase tracking-widest text-surface-500 mb-6 text-center">
              Explore Detailed Aptitude & Mentorship Services
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div
                onClick={handleDetailedCdat}
                className="bg-white p-7 rounded-xl border border-surface-200 hover:border-[#00e5ff] transition-all shadow-xs cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#0f172a] bg-surface-100 px-3 py-1 rounded-full border border-surface-200 inline-block mb-4">
                    Full C-DAT Test
                  </span>
                  <h5 className="font-bold uppercase text-[#0f172a] group-hover:text-[#00e5ff] transition-colors text-base mb-2 font-sans">Detailed Explanation & Pricing</h5>
                  <p className="text-xs text-surface-600 leading-relaxed">Complete registration, group codes, and comprehensive psychometric evaluation packages.</p>
                </div>
              </div>

              <div
                onClick={handleCounsellorAssign}
                className="bg-white p-7 rounded-xl border border-surface-200 hover:border-[#00e5ff] transition-all shadow-xs cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#0f172a] bg-surface-100 px-3 py-1 rounded-full border border-surface-200 inline-block mb-4">
                    Expert Assignment
                  </span>
                  <h5 className="font-bold uppercase text-[#0f172a] group-hover:text-[#00e5ff] transition-colors text-base mb-2 font-sans">Counsellor & Mentor Assignment</h5>
                  <p className="text-xs text-surface-600 leading-relaxed">Connect directly with certified career mentors and clinical psychologists for personalized roadmaps.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
        
      </div>
    </div>
  );
}
