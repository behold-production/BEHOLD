import React from 'react';
import luxuryHeroBg from '../../assets/luxury_hero_bg.png';

export default function Hero({ setView, navigateToSection, siteSettings }) {
  const settings = siteSettings || {};

  const heroBg = settings.heroBgImage || settings.heroSlides?.[0]?.image || luxuryHeroBg;
  const rawTitle = settings.heroTitle || 'WE DESIGN\nTHE CLARITY\nOF YOU';
  const displayEyebrow = settings.heroEyebrow || 'Whatever you feel,';
  const displayBtnText = settings.heroBtnText || 'BOOK CONSULTATION';

  // Replace {highlight} syntax if present, or split by line breaks
  const displayTitle = rawTitle.replace(/\{|\}/g, '');
  const titleLines = displayTitle.split('\n');

  const displaySubtitle = settings.heroSub || 'Should guide your new experience, one step at a time, toward your full clarity and peace of mind.';

  const handleBook = () => {
    window.spaNavigate?.('/booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section id="home" className="w-full relative bg-[#0f172a] text-white overflow-hidden min-h-screen flex items-center">
      {/* Background Visual */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src={heroBg}
          alt="Luxury Editorial Interior"
          className="w-full h-full object-cover opacity-85 filter brightness-90 contrast-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/70 via-[#0f172a]/40 to-[#0f172a]/60" />
      </div>

      {/* Hero Content Overlay */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 sm:pt-32 sm:pb-16 flex flex-col justify-between min-h-dvh sm:min-h-screen">
        
        {/* Top & Statement Headline Box */}
        <div className="max-w-5xl space-y-2 sm:space-y-4 pt-2 sm:pt-0">
          <span className="text-[#00e5ff] font-['Cormorant_Garamond',serif] italic text-xl xs:text-2xl sm:text-3xl font-medium tracking-wide block mb-1 drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]">
            {displayEyebrow}
          </span>
          
          {/* Multi-Line Uppercase Typography */}
          <h1 className="text-[32px] xs:text-[38px] sm:text-5xl md:text-6xl lg:text-6xl xl:text-6xl font-climate uppercase text-white tracking-wide leading-[0.98] sm:leading-[1.05] drop-shadow-lg">
            {titleLines.map((line, idx) => (
              <React.Fragment key={idx}>
                {line}
                {idx < titleLines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </h1>
        </div>

        {/* Subtitle & Action Button */}
        <div className="pt-4 sm:pt-16 flex justify-start lg:justify-end pb-2 sm:pb-0">
          <div className="flex flex-col items-start lg:items-end text-left lg:text-right space-y-3 sm:space-y-4 max-w-md">
            <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed drop-shadow-sm max-w-xs sm:max-w-sm">
              {displaySubtitle}
            </p>
            <button
              onClick={handleBook}
              className="w-auto inline-flex items-center justify-center gap-2 px-7 py-3 bg-[#00e5ff] hover:bg-[#00cce6] text-[#0f172a] font-black text-xs uppercase tracking-widest rounded-full transition-all shadow-lg border-none cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>{displayBtnText}</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
