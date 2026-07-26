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
    <div className="w-full bg-[#f7f4ef] min-h-screen pt-28 pb-20 text-[#1c1514] border-b border-[#e2dad2]">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-12 flex flex-col items-center text-center">
        
        <div className="w-full">
          <div className="mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#7c7069]">
              CIGI DIFFERENTIAL APTITUDE TEST
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-sans font-black uppercase text-[#1c1514] mb-6 leading-none tracking-tight">
            KNOW YOURSELF
          </h1>
          
          <p className="text-[#6e635e] text-base sm:text-lg leading-relaxed mb-12 max-w-2xl mx-auto font-normal">
            Our C-DAT assessment, developed in partnership with CIGI, maps your natural strengths across reasoning, language, and numerical ability. It provides a data-driven foundation to discover the right career path.
          </p>

          {/* Main Teaser Hook Card - Dark Espresso Highlight Card */}
          <div className="bg-[#2b211e] text-[#f7f4ef] rounded-2xl p-8 sm:p-12 max-w-3xl mx-auto border border-[#d8d0c7] text-left mb-14 shadow-md">
            <span className="inline-block px-3 py-1 rounded-full bg-[#f7f4ef] text-[#1c1514] text-[10px] font-bold uppercase tracking-widest mb-4">
              Teaser Assessment
            </span>
            <h3 className="text-2xl sm:text-3xl font-sans font-black uppercase text-[#f7f4ef] mb-3">
              Begin Your Journey
            </h3>
            <p className="text-[#e2dad2] text-xs sm:text-sm leading-relaxed mb-8 max-w-xl font-normal">
              Take a sample test to experience the scientific format and see how our psychologists evaluate core competencies before full registration.
            </p>

            <button
              onClick={handleProceed}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#f7f4ef] hover:bg-white text-[#1c1514] font-bold text-xs uppercase tracking-widest rounded-full transition-all shadow-sm border-none cursor-pointer"
            >
              Try a Sample Test ›
            </button>
          </div>

          {/* Separate Linked Operations */}
          <div className="max-w-3xl mx-auto text-left">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#7c7069] mb-6 text-center">
              Explore Detailed Aptitude & Mentorship Services
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div
                onClick={handleDetailedCdat}
                className="bg-[#eae4dc] p-7 rounded-2xl border border-[#d6cecb] hover:border-[#2b211e] transition-all shadow-xs cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#2b211e] bg-[#f7f4ef] px-3 py-1 rounded-full border border-[#d8d0c7] inline-block mb-4">
                    Full C-DAT Test
                  </span>
                  <h5 className="font-bold uppercase text-[#1c1514] text-base mb-2 font-sans">Detailed Explanation & Pricing</h5>
                  <p className="text-xs text-[#6e635e] leading-relaxed">Complete registration, group codes, and comprehensive psychometric evaluation packages.</p>
                </div>
              </div>

              <div
                onClick={handleCounsellorAssign}
                className="bg-[#eae4dc] p-7 rounded-2xl border border-[#d6cecb] hover:border-[#2b211e] transition-all shadow-xs cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#2b211e] bg-[#f7f4ef] px-3 py-1 rounded-full border border-[#d8d0c7] inline-block mb-4">
                    Expert Assignment
                  </span>
                  <h5 className="font-bold uppercase text-[#1c1514] text-base mb-2 font-sans">Counsellor & Mentor Assignment</h5>
                  <p className="text-xs text-[#6e635e] leading-relaxed">Connect directly with certified career mentors and clinical psychologists for personalized roadmaps.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
        
      </div>
    </div>
  );
}
