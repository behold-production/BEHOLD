import React, { useState } from 'react';
import { renderTitleWithFullstopDot } from '../../shared/components/BrandDot';
import luxuryClinicRoom from '../../assets/luxury_clinic_room.png';

export default function About({ enablePsychology = true, enableCareerMentoring = true, siteSettings }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const settings = siteSettings || {};

  return (
    <section id="about" className="py-20 sm:py-28 bg-transparent text-surface-900 border-b border-surface-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* Left Column: AT BEHOLD */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#00e5ff] flex items-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]" />
                AT
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-black uppercase text-[#0f172a] tracking-tight leading-none">
                BEHOLD<span className="text-[#00e5ff] drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]">.</span>
              </h2>
            </div>

            <p className="text-sm sm:text-base text-surface-600 leading-relaxed font-normal max-w-lg">
              {settings.aboutSectionDesc || "We believe psychological care and career mentorship is more than just counseling — it's about creating mental clarity that inspires, functions beautifully, and reflects the true potential of every individual."}
            </p>

            {/* Featured Image Asset */}
            <div className="pt-4">
              <div className="w-full h-64 sm:h-80 rounded-xl overflow-hidden bg-[#0f172a] border border-[#00e5ff]/40 shadow-sm relative group">
                <img
                  src={luxuryClinicRoom}
                  alt="BEHOLD Mentorship & Psychological Care"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/60 to-transparent" />
              </div>
            </div>
          </div>

          {/* Right Column: 2x2 Thin-Border Grid Matrix */}
          <div className="lg:col-span-6 border-t lg:border-t-0 border-surface-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-surface-200 border-b border-surface-200">
              
              {/* Stat Card 1 */}
              <div className="p-6 sm:p-8 flex flex-col justify-between h-44 sm:h-52 border-b border-surface-200 group">
                <p className="text-xs text-surface-600 font-normal leading-relaxed max-w-[160px]">
                  years into reimagining personal growth — and rewriting the rules of student guidance.
                </p>
                <div className="text-right flex items-center justify-between">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_6px_#00e5ff]" />
                  <span className="text-4xl sm:text-5xl font-black text-[#0f172a] font-sans group-hover:text-[#00e5ff] transition-colors">10</span>
                </div>
              </div>

              {/* Stat Card 2 */}
              <div className="p-6 sm:p-8 flex flex-col justify-between h-44 sm:h-52 border-b border-surface-200 group">
                <p className="text-xs text-surface-600 font-normal leading-relaxed max-w-[160px]">
                  certified psychologists & mentors who know their craft inside and out.
                </p>
                <div className="text-right flex items-center justify-between">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_6px_#00e5ff]" />
                  <span className="text-4xl sm:text-5xl font-black text-[#0f172a] font-sans group-hover:text-[#00e5ff] transition-colors">50</span>
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-surface-200">
              
              {/* Stat Card 3 */}
              <div className="p-6 sm:p-8 flex flex-col justify-between h-52 sm:h-60 group">
                <p className="text-xs text-surface-600 font-normal leading-relaxed max-w-[170px]">
                  students guided and countless satisfied families who trust our work.
                </p>
                <div className="text-right flex items-center justify-between">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_6px_#00e5ff]" />
                  <span className="text-4xl sm:text-5xl font-black text-[#0f172a] font-sans group-hover:text-[#00e5ff] transition-colors">500+</span>
                </div>
              </div>

              {/* Stat Card 4: Dark Blue Highlight Box */}
              <div className="p-6 sm:p-8 bg-[#0f172a] text-white flex flex-col justify-between h-52 sm:h-60 border border-[#00e5ff]/30 rounded-br-xl shadow-md">
                <p className="text-xs sm:text-sm text-surface-200 font-normal leading-relaxed italic">
                  "Mental wellness isn't just what you see — it's how a space lives with you<span className="text-[#00e5ff] not-italic font-bold">.</span>"
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => { window.spaNavigate?.('/booking'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="text-xs font-bold uppercase tracking-widest text-[#00e5ff] hover:underline bg-transparent border-none p-0 cursor-pointer flex items-center gap-1.5"
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
