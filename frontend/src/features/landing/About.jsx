import React, { useState } from 'react';
import { renderTitleWithFullstopDot } from '../../shared/components/BrandDot';
import jpg3 from '../../assets/jpg3.jpg';

export default function About({ enablePsychology = true, enableCareerMentoring = true, siteSettings }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const settings = siteSettings || {};

  return (
    <section id="about" className="py-20 sm:py-28 bg-[#eae4dc] text-[#1c1514] border-b border-[#d8d0c7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 2-Column Section matching reference image bottom half */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* Left Column: AT BEHOLD & CO. */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#7c7069] block mb-1">AT</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-semibold uppercase text-[#1c1514] tracking-wide leading-none">
                BEHOLD,
              </h2>
            </div>

            <p className="text-sm sm:text-base text-[#4a3f3a] leading-relaxed font-medium max-w-lg">
              {settings.aboutSectionDesc || "We believe psychological care and career mentorship is more than just counseling — it's about creating mental clarity that inspires, functions beautifully, and reflects the true potential of every individual."}
            </p>

            {/* Featured Architectural / Wellness Image Asset */}
            <div className="pt-4">
              <div className="w-full h-64 sm:h-80 rounded-xl overflow-hidden bg-[#2b211e] border border-[#d8d0c7] shadow-sm">
                <img
                  src={jpg3}
                  alt="BEHOLD Mentorship & Care"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Right Column: 2x2 Thin-Border Grid Matrix */}
          <div className="lg:col-span-6 border-t lg:border-t-0 border-[#d6cecb]">
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#d6cecb] border-b border-[#d6cecb]">
              
              {/* Stat Card 1 */}
              <div className="p-6 sm:p-8 flex flex-col justify-between h-44 sm:h-52 border-b border-[#d6cecb]">
                <p className="text-xs text-[#6e635e] font-medium leading-relaxed max-w-[160px]">
                  years into reimagining personal growth — and rewriting the rules of student guidance.
                </p>
                <div className="text-right">
                  <span className="text-4xl sm:text-5xl font-semibold text-[#2b211e] font-sans">10</span>
                </div>
              </div>

              {/* Stat Card 2 */}
              <div className="p-6 sm:p-8 flex flex-col justify-between h-44 sm:h-52 border-b border-[#d6cecb]">
                <p className="text-xs text-[#6e635e] font-medium leading-relaxed max-w-[160px]">
                  certified psychologists & mentors who know their craft inside and out.
                </p>
                <div className="text-right">
                  <span className="text-4xl sm:text-5xl font-semibold text-[#2b211e] font-sans">50</span>
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#d6cecb]">
              
              {/* Stat Card 3 */}
              <div className="p-6 sm:p-8 flex flex-col justify-between h-52 sm:h-60">
                <p className="text-xs text-[#6e635e] font-medium leading-relaxed max-w-[170px]">
                  students guided and countless satisfied families who trust our work.
                </p>
                <div className="text-right">
                  <span className="text-4xl sm:text-5xl font-semibold text-[#2b211e] font-sans">500+</span>
                </div>
              </div>

              {/* Stat Card 4: Dark Espresso Highlight Box matching reference image */}
              <div className="p-6 sm:p-8 bg-[#2b211e] text-[#f7f4ef] flex flex-col justify-between h-52 sm:h-60">
                <p className="text-xs sm:text-sm text-[#e2dad2] font-medium leading-relaxed">
                  Mental wellness isn't just what you see — it's how a space lives with you.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => { window.spaNavigate?.('/booking'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="text-xs font-bold uppercase tracking-widest text-[#f7f4ef] hover:underline bg-transparent border-none p-0 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Learn more</span>
                    <span className="text-xs">›</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
