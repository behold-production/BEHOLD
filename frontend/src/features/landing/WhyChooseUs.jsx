import React from 'react';
import luxuryClinicRoom from '../../assets/luxury_clinic_room.png';
import greenTexture from '../../assets/clarity_bg.png';

export default function WhyChooseUs({ siteSettings }) {
  const handleBook = () => {
    window.spaNavigate?.('/book-session');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section id="why-choose-us" className="py-20 sm:py-28 bg-transparent text-surface-900 border-b border-surface-200"
      style={{
        backgroundImage: `url(${greenTexture})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#89b26b'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Split Matrix Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* Left Column: Image Hero Card with Text Overlay */}
          <div className="lg:col-span-6">
            <div className="relative w-full min-h-[460px] sm:min-h-[520px] rounded-xl overflow-hidden shadow-lg flex flex-col justify-end p-6 sm:p-10 border border-[#00e5ff]/40 group">
              {/* Background Image with Dark Luxury Opacity Overlay */}
              <img
                src={siteSettings?.whyChooseUsImage || siteSettings?.servicesFirstCardImage || luxuryClinicRoom}
                alt="Behold Mentorship & Psychological Care"
                className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/80 to-[#0f172a]/30" />

              {/* Content Overlay Layer */}
              <div className="relative z-10 space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-[#00e5ff] block flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]" />
                  {siteSettings?.servicesSectionSub || 'UNFOLD WITH BEHOLD'}
                </span>

                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-sans font-bold uppercase text-white tracking-tight leading-[1.02]">
                  {siteSettings?.servicesSectionTitle || (
                    <>
                      Comprehensive Care<br />
                      For Your Mind & Future<span className="text-[#00e5ff] drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]">.</span>
                    </>
                  )}
                </h2>

                <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-medium max-w-lg">
                  {siteSettings?.servicesSectionDesc || 'True growth happens when emotional peace and career direction align. Behold brings both psychological care and CIGI-certified career mentoring into one cohesive model.'}
                </p>

                {/* Action Buttons inside Card */}
                <div className="flex flex-wrap items-center gap-3 pt-3">
                  <button
                    onClick={handleBook}
                    className="px-6 py-3 bg-[#00e5ff] hover:bg-[#00cce6] text-[#0f172a] font-bold text-xs uppercase tracking-widest rounded-full transition-all shadow-md border-none cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Book a Session</span>
                  </button>
                  <button
                    onClick={() => { window.spaNavigate?.('/booking'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all border border-white/30 backdrop-blur-md cursor-pointer"
                  >
                    Explore All Services
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 2x2 Feature Grid Matrix */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4 sm:gap-6 pt-6 lg:pt-0">
            
            {/* Cell 1: Dual Support */}
            <div className="p-5 sm:p-7 rounded-xl bg-white border border-surface-200 hover:border-[#00e5ff] transition-all shadow-xs flex flex-col justify-between h-52 sm:h-60 space-y-3 group">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#0f172a] uppercase mb-1.5 font-sans leading-snug group-hover:text-[#00e5ff] transition-colors">Dual Support Architecture</h3>
                <p className="text-[11px] sm:text-xs text-surface-600 font-normal leading-relaxed">
                  Transition seamlessly between clinical psychologists and career strategists under one roof.
                </p>
              </div>
              <div className="text-right pt-2 border-t border-surface-100 flex items-center justify-between">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_6px_#00e5ff]" />
                <span className="text-2xl sm:text-4xl font-bold text-[#0f172a] font-sans">01</span>
              </div>
            </div>

            {/* Cell 2: Safe & Scientific */}
            <div className="p-5 sm:p-7 rounded-xl bg-white border border-surface-200 hover:border-[#00e5ff] transition-all shadow-xs flex flex-col justify-between h-52 sm:h-60 space-y-3 group">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#0f172a] uppercase mb-1.5 font-sans leading-snug group-hover:text-[#00e5ff] transition-colors">100% Safe & Scientific</h3>
                <p className="text-[11px] sm:text-xs text-surface-600 font-normal leading-relaxed">
                  Backed by CIGI assessment data and strictly private, non-judgmental counseling protocols.
                </p>
              </div>
              <div className="text-right pt-2 border-t border-surface-100 flex items-center justify-between">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_6px_#00e5ff]" />
                <span className="text-2xl sm:text-4xl font-bold text-[#0f172a] font-sans">100%</span>
              </div>
            </div>

            {/* Cell 3: Conditional — C-DAT when aptitude enabled, Career Roadmap when disabled */}
            {siteSettings?.enableAptitude !== false ? (
              <div className="p-5 sm:p-7 rounded-xl bg-white border border-surface-200 hover:border-[#00e5ff] transition-all shadow-xs flex flex-col justify-between h-52 sm:h-60 space-y-3 group">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#0f172a] uppercase mb-1.5 font-sans leading-snug group-hover:text-[#00e5ff] transition-colors">C-DAT Aptitude Assessment</h3>
                  <p className="text-[11px] sm:text-xs text-surface-600 font-normal leading-relaxed">
                    Evaluations designed for grades 8–12 to align cognitive strengths with career aspirations.
                  </p>
                </div>
                <div className="text-right pt-2 border-t border-surface-100 flex items-center justify-between">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_6px_#00e5ff]" />
                  <span className="text-base sm:text-2xl font-bold text-[#0f172a] font-sans uppercase">C-DAT</span>
                </div>
              </div>
            ) : (
              <div className="p-5 sm:p-7 rounded-xl bg-white border border-surface-200 hover:border-[#00e5ff] transition-all shadow-xs flex flex-col justify-between h-52 sm:h-60 space-y-3 group">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#0f172a] uppercase mb-1.5 font-sans leading-snug group-hover:text-[#00e5ff] transition-colors">Personalised Career Roadmap</h3>
                  <p className="text-[11px] sm:text-xs text-surface-600 font-normal leading-relaxed">
                    CIGI-certified mentors craft tailored stream & degree roadmaps aligned with each student's strengths.
                  </p>
                </div>
                <div className="text-right pt-2 border-t border-surface-100 flex items-center justify-between">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_6px_#00e5ff]" />
                  <span className="text-base sm:text-2xl font-bold text-[#0f172a] font-sans uppercase">CIGI</span>
                </div>
              </div>
            )}

            {/* Cell 4: Dark Blue Statement Highlight Box */}
            <div className="p-5 sm:p-7 rounded-xl bg-[#0f172a] text-white border border-[#00e5ff]/30 shadow-md flex flex-col justify-between h-52 sm:h-60 space-y-3">
              <p className="text-xs sm:text-sm text-surface-200 font-medium leading-relaxed italic">
                "True growth happens when emotional peace and career direction align<span className="text-[#00e5ff] not-italic font-bold">.</span>"
              </p>
              <div className="pt-2">
                <button
                  onClick={handleBook}
                  className="w-full py-2.5 bg-[#00e5ff] hover:bg-[#00cce6] text-[#0f172a] font-bold text-[10px] sm:text-xs uppercase tracking-widest rounded-full transition-all border-none cursor-pointer shadow-xs text-center"
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
