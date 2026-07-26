import React from 'react';
import luxuryClinicRoom from '../../assets/luxury_clinic_room.png';

export default function WhyChooseUs({ siteSettings }) {
  const handleBook = () => {
    window.spaNavigate?.('/booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section id="why-choose-us" className="py-20 sm:py-28 bg-[#f7f4ef] text-[#1c1514] border-b border-[#e2dad2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Split Matrix Layout - OURA & CO Style */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* Left Column: Image Hero Card with Text Overlay & Opacity */}
          <div className="lg:col-span-6">
            <div className="relative w-full min-h-[460px] sm:min-h-[520px] rounded-3xl overflow-hidden shadow-lg flex flex-col justify-end p-6 sm:p-10 border border-[#d6cecb]">
              {/* Background Image with Dark Luxury Opacity Overlay */}
              <img
                src={luxuryClinicRoom}
                alt="Behold Mentorship & Psychological Care"
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1c1514] via-[#1c1514]/75 to-[#1c1514]/30" />

              {/* Content Overlay Layer */}
              <div className="relative z-10 space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-[#e2dad2] block">
                  UNFOLD WITH BEHOLD
                </span>

                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-sans font-bold uppercase text-[#f7f4ef] tracking-tight leading-[1.02]">
                  Comprehensive Care<br />
                  For Your Mind & Future.
                </h2>

                <p className="text-xs sm:text-sm text-[#e2dad2] leading-relaxed font-normal max-w-lg">
                  True growth happens when emotional peace and career direction align. Behold brings both psychological care and CIGI-certified career mentoring into one cohesive model.
                </p>

                {/* Action Buttons inside Card */}
                <div className="flex flex-wrap items-center gap-3 pt-3">
                  <button
                    onClick={handleBook}
                    className="px-6 py-3 bg-[#f7f4ef] hover:bg-white text-[#1c1514] font-bold text-xs uppercase tracking-widest rounded-full transition-all shadow-sm border-none cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Book a Session</span>
                  </button>
                  <button
                    onClick={() => { window.spaNavigate?.('/services'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-[#f7f4ef] font-bold text-xs uppercase tracking-widest rounded-full transition-all border border-white/30 backdrop-blur-md cursor-pointer"
                  >
                    Explore All Programs
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 2x2 Thin-Border Grid Matrix matching reference image */}
          <div className="lg:col-span-6 border-t lg:border-t-0 border-[#d6cecb]">
            
            {/* Top Row: Cell 1 & Cell 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#d6cecb] border-b border-[#d6cecb]">
              
              {/* Cell 1: Dual Support */}
              <div className="p-6 sm:p-8 flex flex-col justify-between h-48 sm:h-56 border-b border-[#d6cecb]">
                <div>
                  <h3 className="text-sm font-bold text-[#1c1514] uppercase mb-2 font-sans">Dual Support Architecture</h3>
                  <p className="text-xs text-[#6e635e] font-normal leading-relaxed">
                    Transition seamlessly between clinical psychologists and career strategists under one unified roof.
                  </p>
                </div>
                <div className="text-right pt-4">
                  <span className="text-4xl sm:text-5xl font-semibold text-[#2b211e] font-sans">01</span>
                </div>
              </div>

              {/* Cell 2: Safe & Scientific */}
              <div className="p-6 sm:p-8 flex flex-col justify-between h-48 sm:h-56 border-b border-[#d6cecb]">
                <div>
                  <h3 className="text-sm font-bold text-[#1c1514] uppercase mb-2 font-sans">100% Safe & Scientific</h3>
                  <p className="text-xs text-[#6e635e] font-normal leading-relaxed">
                    Backed by CIGI assessment data and strictly private, non-judgmental counseling protocols.
                  </p>
                </div>
                <div className="text-right pt-4">
                  <span className="text-4xl sm:text-5xl font-semibold text-[#2b211e] font-sans">100%</span>
                </div>
              </div>

            </div>

            {/* Bottom Row: Cell 3 & Cell 4 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#d6cecb]">
              
              {/* Cell 3: CIGI-Certified Aptitude */}
              <div className="p-6 sm:p-8 flex flex-col justify-between h-52 sm:h-64">
                <div>
                  <h3 className="text-sm font-bold text-[#1c1514] uppercase mb-2 font-sans">C-DAT Aptitude Assessment</h3>
                  <p className="text-xs text-[#6e635e] font-normal leading-relaxed">
                    Evaluations designed for grades 8–12 to align cognitive strengths with career aspirations.
                  </p>
                </div>
                <div className="text-right pt-4">
                  <span className="text-3xl sm:text-4xl font-semibold text-[#2b211e] font-sans">C-DAT</span>
                </div>
              </div>

              {/* Cell 4: Dark Espresso Statement Highlight Box matching reference image */}
              <div className="p-6 sm:p-8 bg-[#2b211e] text-[#f7f4ef] flex flex-col justify-between h-52 sm:h-64">
                <p className="text-xs sm:text-sm text-[#e2dad2] font-medium leading-relaxed">
                  "True growth happens when emotional peace and career direction align."
                </p>
                <div className="pt-4">
                  <button
                    onClick={handleBook}
                    className="text-xs font-bold uppercase tracking-widest text-[#f7f4ef] hover:underline bg-transparent border-none p-0 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Book a Session</span>
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
