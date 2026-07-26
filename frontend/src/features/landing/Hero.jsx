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
    <section id="home" className="w-full relative bg-[#1c1514] text-white overflow-hidden min-h-[85vh] flex items-center">
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
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 flex flex-col justify-between min-h-[80vh]">
        
        {/* Top & Statement Headline Box */}
        <div className="max-w-5xl space-y-4">
          <span className="text-base sm:text-xl font-serif italic text-white/95 tracking-wide block">
            Whatever you feel
          </span>
          
          {/* Multi-Line Uppercase Typography */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-['Outfit','Plus_Jakarta_Sans',sans-serif] font-semibold uppercase text-white tracking-tight leading-[0.92] drop-shadow-md">
            {titleLines.map((line, idx) => (
              <React.Fragment key={idx}>
                {line}
                {idx < titleLines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </h1>
        </div>

        {/* Bottom Overlay Subtitle & White Pill Button matching reference image */}
        <div className="pt-16 sm:pt-24 flex justify-end">
          {/* Right Subtitle & White Pill Button matching bottom-right of image */}
          <div className="flex flex-col items-start lg:items-end text-left lg:text-right space-y-4 max-w-sm">
            <p className="text-xs sm:text-sm text-white/90 font-normal leading-relaxed drop-shadow-sm">
              {displaySubtitle}
            </p>
            <button
              onClick={handleBook}
              className="px-8 py-3.5 bg-white hover:bg-[#f7f4ef] text-[#1c1514] font-bold text-xs uppercase tracking-widest rounded-full transition-all shadow-lg border-none cursor-pointer flex items-center gap-2"
            >
              <span>BOOK CONSULTATION</span>
              <span>›</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
