import React from 'react';
import luxuryHeroBg from '../../assets/luxury_hero_bg.png';

export default function Hero({ setView, navigateToSection, siteSettings }) {
  const settings = siteSettings || {};

  const rawTitle = settings.heroTitle || 'WE DESIGN\nTHE CLARITY\nOF YOU';
  // Replace {highlight} syntax if present, or split by line breaks
  const displayTitle = rawTitle.replace(/\{|\}/g, '');
  const titleLines = displayTitle.split('\n');

  const displaySubtitle = settings.heroSub || 'Should guide your new experience, one step at a time, toward your full clarity and peace of mind.';

  const handleBook = () => {
    window.spaNavigate?.('/booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section id="home" className="w-full relative bg-[#1c1514] text-white overflow-hidden min-h-screen flex items-center">
      {/* Background Visual matching reference image */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src={luxuryHeroBg}
          alt="Luxury Editorial Interior"
          className="w-full h-full object-cover opacity-90 filter brightness-90 contrast-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/25 to-black/40" />
      </div>

      {/* Hero Content Overlay */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10 sm:pt-36 sm:pb-16 flex flex-col justify-between min-h-screen">
        
        {/* Top & Statement Headline Box */}
        <div className="max-w-5xl space-y-3 sm:space-y-4 pt-4 sm:pt-0">
          <span className="text-[#e2dad2] font-['Cormorant_Garamond',serif] italic text-2xl xs:text-3xl sm:text-3xl font-medium tracking-wide block mb-1 sm:mb-2">
            Whatever you feel,
          </span>
          
          {/* Multi-Line Uppercase Typography */}
          <h1 className="text-[42px] xs:text-5xl sm:text-6xl md:text-6xl lg:text-7xl xl:text-7xl font-climate uppercase text-white tracking-wide leading-[1.05] drop-shadow-md">
            {titleLines.map((line, idx) => (
              <React.Fragment key={idx}>
                {line}
                {idx < titleLines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </h1>
        </div>

        {/* Subtitle & White Pill Button - Anchored to bottom on mobile & desktop */}
        <div className="pt-8 sm:pt-24 flex justify-start lg:justify-end pb-2 sm:pb-0">
          {/* Right Subtitle & White Pill Button matching bottom-right of image */}
          <div className="flex flex-col items-start lg:items-end text-left lg:text-right space-y-4 max-w-md w-full sm:w-auto">
            <p className="text-xs sm:text-sm text-white/95 font-medium leading-relaxed drop-shadow-sm max-w-xs sm:max-w-sm">
              {displaySubtitle}
            </p>
            <button
              onClick={handleBook}
              className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-[#f7f4ef] text-[#1c1514] font-bold text-xs uppercase tracking-widest rounded-full transition-all shadow-lg border-none cursor-pointer flex items-center justify-center gap-2"
            >
              <span>BOOK CONSULTATION</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
