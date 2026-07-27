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
                src={siteSettings?.whyChooseUsImage || siteSettings?.servicesFirstCardImage || luxuryClinicRoom}
                alt="Behold Mentorship & Psychological Care"
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1c1514] via-[#1c1514]/75 to-[#1c1514]/30" />

              {/* Content Overlay Layer */}
              <div className="relative z-10 space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-[#e2dad2] block">
                  {siteSettings?.servicesSectionSub || 'UNFOLD WITH BEHOLD'}
                </span>

                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-sans font-bold uppercase text-[#f7f4ef] tracking-tight leading-[1.02]">
                  {siteSettings?.servicesSectionTitle || (
                    <>
                      Comprehensive Care<br />
                      For Your Mind & Future.
                    </>
                  )}
                </h2>

                <p className="text-xs sm:text-sm text-[#e2dad2] leading-relaxed font-normal max-w-lg">
                  {siteSettings?.servicesSectionDesc || 'True growth happens when emotional peace and career direction align. Behold brings both psychological care and CIGI-certified career mentoring into one cohesive model.'}
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

          {/* Right Column: 2x2 Feature Grid Matrix */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4 sm:gap-6 pt-6 lg:pt-0">
            
            {/* Cell 1: Dual Support */}
            <div className="p-5 sm:p-7 rounded-3xl bg-white border border-[#d6cecb] shadow-2xs flex flex-col justify-between h-52 sm:h-60 space-y-3">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#1c1514] uppercase mb-1.5 font-sans leading-snug">Dual Support Architecture</h3>
                <p className="text-[11px] sm:text-xs text-[#6e635e] font-normal leading-relaxed">
                  Transition seamlessly between clinical psychologists and career strategists under one roof.
                </p>
              </div>
              <div className="text-right pt-2 border-t border-[#eae4dc]">
                <span className="text-2xl sm:text-4xl font-bold text-[#2b211e] font-sans">01</span>
              </div>
            </div>

            {/* Cell 2: Safe & Scientific */}
            <div className="p-5 sm:p-7 rounded-3xl bg-white border border-[#d6cecb] shadow-2xs flex flex-col justify-between h-52 sm:h-60 space-y-3">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#1c1514] uppercase mb-1.5 font-sans leading-snug">100% Safe & Scientific</h3>
                <p className="text-[11px] sm:text-xs text-[#6e635e] font-normal leading-relaxed">
                  Backed by CIGI assessment data and strictly private, non-judgmental counseling protocols.
                </p>
              </div>
              <div className="text-right pt-2 border-t border-[#eae4dc]">
                <span className="text-2xl sm:text-4xl font-bold text-[#2b211e] font-sans">100%</span>
              </div>
            </div>

            {/* Cell 3: CIGI-Certified Aptitude */}
            <div className="p-5 sm:p-7 rounded-3xl bg-white border border-[#d6cecb] shadow-2xs flex flex-col justify-between h-52 sm:h-60 space-y-3">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#1c1514] uppercase mb-1.5 font-sans leading-snug">C-DAT Aptitude Assessment</h3>
                <p className="text-[11px] sm:text-xs text-[#6e635e] font-normal leading-relaxed">
                  Evaluations designed for grades 8–12 to align cognitive strengths with career aspirations.
                </p>
              </div>
              <div className="text-right pt-2 border-t border-[#eae4dc]">
                <span className="text-base sm:text-2xl font-bold text-[#2b211e] font-sans uppercase">C-DAT</span>
              </div>
            </div>

            {/* Cell 4: Dark Espresso Statement Highlight Box */}
            <div className="p-5 sm:p-7 rounded-3xl bg-[#2b211e] text-[#f7f4ef] shadow-md flex flex-col justify-between h-52 sm:h-60 space-y-3">
              <p className="text-xs sm:text-sm text-[#e2dad2] font-medium leading-relaxed italic">
                "True growth happens when emotional peace and career direction align."
              </p>
              <div className="pt-2">
                <button
                  onClick={handleBook}
                  className="w-full py-2.5 bg-[#f7f4ef] hover:bg-white text-[#1c1514] font-bold text-[10px] sm:text-xs uppercase tracking-widest rounded-full transition-all border-none cursor-pointer shadow-2xs text-center"
                >
                  Book a Session
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
