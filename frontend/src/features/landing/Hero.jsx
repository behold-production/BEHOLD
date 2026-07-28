import React from 'react';
import luxuryHeroBg from '../../assets/luxury_hero_bg.png';
import climateCrisisFont from '../../assets/Climate-Crisis.ttf';

export default function Hero({ setView, navigateToSection, siteSettings }) {
  const settings = siteSettings || {};

  const heroBg = settings.heroBgImage || settings.heroSlides?.[0]?.image || luxuryHeroBg;
  const rawTitle = settings.heroTitle || 'EVERY MIND\nMATTERS';
  const displayEyebrow = settings.heroEyebrow || 'Whatever you feel,';
  const displayBtnText = settings.heroBtnText || 'BOOK CONSULTATION';

  // Parse multi-line title and curly-bracket highlight tags {text}
  const renderTitle = (titleText) => {
    if (!titleText) return null;
    const lines = titleText.split('\n');
    return lines.map((line, lineIdx) => {
      const parts = line.split(/(\{[^}]+\})/g);
      return (
        <React.Fragment key={lineIdx}>
          {parts.map((part, partIdx) => {
            if (part.startsWith('{') && part.endsWith('}')) {
              const innerText = part.slice(1, -1);
              return (
                <span
                  key={partIdx}
                  style={{ fontFamily: "'Climate Crisis', sans-serif" }}
                  className="font-climate text-[#00e5ff] drop-shadow-[0_0_12px_rgba(0,229,255,0.8)]"
                >
                  {innerText.toLowerCase()}
                </span>
              );
            }
            return (
              <span
                key={partIdx}
                style={{ fontFamily: "'Climate Crisis', sans-serif" }}
                className="font-climate"
              >
                {part.toLowerCase()}
              </span>
            );
          })}
          {lineIdx < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  const displaySubtitle = settings.heroSub || 'A personal development and mentoring ecosystem — combining psychological care, self-discovery, and career guidance to help you grow with confidence and peace of mind.';

  const handleBook = () => {
    window.spaNavigate?.('/book-session');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section id="home" className="w-full relative bg-[#0f172a] text-white overflow-hidden min-h-screen flex items-center">
      <style>{`
        @font-face {
          font-family: 'Climate Crisis';
          src: url('${climateCrisisFont}') format('truetype');
          font-weight: 100 900;
          font-style: normal;
          font-display: swap;
        }
      `}</style>
      {/* Background Visual */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src={heroBg}
          alt="Luxury Editorial Interior"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/70 via-[#0f172a]/40 to-[#0f172a]/60" />
      </div>

      {/* Hero Content Overlay */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 sm:pt-32 sm:pb-16 flex flex-col justify-end md:justify-between space-y-6 md:space-y-0 min-h-dvh sm:min-h-screen">

        {/* Top & Statement Headline Box */}
        <div className="max-w-5xl space-y-2 sm:space-y-4 pt-2 sm:pt-0">
          <span className="text-[#00e5ff] font-['Cormorant_Garamond',serif] italic text-xl xs:text-2xl sm:text-3xl font-medium tracking-wide block mb-1 drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]">
            {displayEyebrow}
          </span>

          {/* Multi-Line Uppercase Typography */}
          <h1
            style={{ fontFamily: "'Climate Crisis', sans-serif" }}
            className="text-[39px] xs:text-[38px] sm:text-7xl md:text-8xl lg:text-12xl xl:text-12xl font-climate text-white tracking-wide leading-[0.98] sm:leading-[1.05] drop-shadow-lg lowercase"
          >
            {renderTitle(rawTitle.toLowerCase())}
          </h1>
        </div>

        {/* Subtitle & Action Button */}
        <div className="pt-2 md:pt-16 flex justify-start lg:justify-end pb-2 sm:pb-0">
          <div className="flex flex-col items-start lg:items-end text-left lg:text-right space-y-3 sm:space-y-4 max-w-md">
            <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed drop-shadow-sm max-w-xs sm:max-w-sm">
              {displaySubtitle}
            </p>
            <button
              onClick={handleBook}
              className="w-auto inline-flex items-center justify-center gap-2 px-7 py-3 bg-[#00e5ff] hover:bg-[#00cce6] text-[#0f172a] font-black text-xs tracking-widest rounded-full transition-all shadow-lg border-none cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>{displayBtnText}</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
