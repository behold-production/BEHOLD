import React, { useEffect } from 'react';
import greenTexture from '../../../../assets/greygreen.png';
import SEO from '../../../../components/common/SEO';
import { trackViewContent, trackStartTrial } from '../../../../utils/metaPixel';

export default function AptitudeLanding({ setView }) {
  useEffect(() => {
    trackViewContent({
      content_name: 'C-DAT Aptitude Assessment Landing',
      content_type: 'assessment_page'
    });
  }, []);

  const handleProceed = () => {
    trackStartTrial({ test_type: 'C-DAT Sample Assessment' });
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

  const cdatSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalProgram",
    "name": "C-DAT Differential Aptitude Assessment & Career Mapping",
    "description": "Scientific aptitude testing mapped to natural strengths across numerical, verbal, and abstract reasoning for students and professionals.",
    "provider": {
      "@type": "Organization",
      "name": "BEHOLD",
      "url": "https://www.behold.co.in"
    }
  };

  return (
    <div 
      className="w-full min-h-screen pt-28 pb-20 text-[#1c2826] bg-transparent"
    >
      <SEO 
        title="Scientific Aptitude Testing & Career Mapping (C-DAT)" 
        description="Our C-DAT assessment, developed in partnership with CIGI, maps your natural strengths across reasoning, language, and numerical ability."
        keywords="C-DAT, aptitude test, career assessment, CIGI test, career mapping, career guidance India, student aptitude"
        canonicalUrl="https://www.behold.co.in/aptitude"
        schema={cdatSchema}
      />
      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-12 flex flex-col items-center text-center">
        
        <div className="w-full">
          <div className="mb-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#b85438] flex items-center justify-center gap-1.5">

              CIGI DIFFERENTIAL APTITUDE TEST
            </span>
          </div>

          <h1 className="font-serif-hero text-4xl sm:text-6xl font-normal text-[#1c2826] mb-6 leading-[1.05] tracking-tight">
            KNOW YOURSELF<span className="text-[#b85438] drop-shadow-[0_0_8px_rgba(184,84,56,0.8)] font-semibold">.</span>
          </h1>
          
          <p className="text-[#5c6b66] text-base sm:text-lg leading-relaxed mb-12 max-w-2xl mx-auto font-normal">
            Our C-DAT assessment, developed in partnership with CIGI, maps your natural strengths across reasoning, language, and numerical ability. It provides a data-driven foundation to discover the right career path.
          </p>

          {/* Main Teaser Hook Card */}
          <div className="bg-[#1c2826] text-white rounded-xl p-8 sm:p-12 max-w-3xl mx-auto border border-[#b85438]/30 text-left mb-14 shadow-lg">
            <span className="inline-block px-3 py-1 rounded-md bg-[#b85438] text-white text-[10px] font-extrabold uppercase tracking-widest mb-4">
              Teaser Assessment
            </span>
            <h3 className="font-serif-hero text-2xl sm:text-3xl font-normal text-white mb-3">
              Begin Your Journey
            </h3>
            <p className="text-[#e0d8cb] text-xs sm:text-sm leading-relaxed mb-8 max-w-xl font-normal">
              Take a sample test to experience the scientific format and see how our psychologists evaluate core competencies before full registration.
            </p>

            <button
              onClick={handleProceed}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#b85438] hover:bg-[#a0462e] text-white font-semibold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md border-none cursor-pointer"
            >
              Try a Sample Test ›
            </button>
          </div>

          {/* Separate Linked Operations */}
          <div className="max-w-3xl mx-auto text-left">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#8a938f] mb-6 text-center">
              Explore Detailed Aptitude & Mentorship Services
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div
                onClick={handleDetailedCdat}
                className="bg-white p-7 rounded-xl border border-[#ede7de] hover:border-[#b85438] transition-all shadow-xs cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[#1c2826] bg-[#f4eee6] px-2.5 py-1 rounded-md border border-[#ede7de] inline-block mb-4">
                    Full C-DAT Test
                  </span>
                  <h5 className="font-serif-hero font-semibold text-[#1c2826] group-hover:text-[#b85438] transition-colors text-base mb-2">Detailed Explanation &amp; Pricing</h5>
                  <p className="text-xs text-[#5c6b66] leading-relaxed">Complete registration, group codes, and comprehensive psychometric evaluation packages.</p>
                </div>
              </div>

              <div
                onClick={handleCounsellorAssign}
                className="bg-white p-7 rounded-xl border border-[#ede7de] hover:border-[#b85438] transition-all shadow-xs cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[#1c2826] bg-[#f4eee6] px-2.5 py-1 rounded-md border border-[#ede7de] inline-block mb-4">
                    Expert Assignment
                  </span>
                  <h5 className="font-serif-hero font-semibold text-[#1c2826] group-hover:text-[#b85438] transition-colors text-base mb-2">Psychologist &amp; Mentor Assignment</h5>
                  <p className="text-xs text-[#5c6b66] leading-relaxed">Connect directly with certified career mentors and clinical psychologists for personalized roadmaps.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
        
      </div>
    </div>
  );
}
