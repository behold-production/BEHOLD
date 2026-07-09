import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Hero({ setView, navigateToSection, siteSettings }) {
  const handleButtonClick = (link) => {
    if (!link) return;
    if (link === '/booking') {
      window.spaNavigate?.('/booking');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (link === '/aptitude-test' || link === '/aptitude' || link === 'cdat') {
      navigateToSection('cdat');
    } else {
      window.spaNavigate?.(link);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const settings = siteSettings || {};

  const defaultSlide = {
    image: 'https://images.unsplash.com/photo-1440688807730-73e4e2169fb8?q=80&w=2070&auto=format&fit=crop',
    title: settings.heroTitle || "Bridging You To Your {True Growth.}",
    subtitle: settings.heroSub || "Professional psychological counseling, aptitude assessment, and career mentorship designed to help individuals thrive with confidence and purpose.",
    btn1Text: 'Book a Session',
    btn1Link: '/booking',
    btn2Text: 'Book Aptitude Test',
    btn2Link: '/aptitude-test'
  };

  const slide = (settings.heroSlides && settings.heroSlides.length > 0) ? settings.heroSlides[0] : defaultSlide;

  const renderTitle = (text) => {
    if (!text) return null;
    const lines = text.split(/\r?\n|\\n/g);
    return lines.map((line, index) => {
      const match = line.match(/\{([^}]+)\}/);
      let content;
      if (match) {
        const parts = line.split(match[0]);
        const innerText = match[1];
        const endsWithDot = innerText.endsWith('.');
        const mainText = endsWithDot ? innerText.slice(0, -1) : innerText;

        content = (
          <React.Fragment key={`span-${index}`}>
            {parts[0]}
            <span className="relative inline-block text-[#00E5FF] font-black [text-shadow:0_0_35px_rgba(0,229,255,0.55)] pb-1 sm:pb-2">
              {mainText}
              {endsWithDot && (
                <span className="text-[#00E5FF] [text-shadow:0_0_20px_#00E5FF,0_0_40px_#00E5FF] inline-block font-black">
                  .
                </span>
              )}

              {/* Insanely Stylish Glowing Neon Blue Curved Underline */}
              <svg
                className="absolute left-0 -bottom-1 sm:-bottom-2 w-full h-3 sm:h-4 pointer-events-none overflow-visible"
                viewBox="0 0 320 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 13C65 3 150 2 315 13"
                  stroke="#00E5FF"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_12px_#00E5FF]"
                />
                <path
                  d="M20 16C90 9 185 10 300 15"
                  stroke="#79f2ff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeOpacity="0.8"
                />
              </svg>
            </span>
            {parts[1]}
          </React.Fragment>
        );
      } else {
        content = line;
      }
      return (
        <React.Fragment key={index}>
          {index > 0 && <br className="hidden sm:block" />}
          {content}
        </React.Fragment>
      );
    });
  };

  return (
    <section
      id="home"
      className="relative w-full flex flex-col justify-center overflow-hidden bg-[#0a121e]"
      style={{ minHeight: '100svh' }}
    >
      {/* Hardware-Accelerated Background Image or Video */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        {slide.image && (slide.image.endsWith('.mp4') || slide.image.endsWith('.webm') || slide.image.endsWith('.ogg') || slide.image.includes('video') || slide.image.includes('mp4')) ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover scale-105"
          >
            <source src={slide.image} />
          </video>
        ) : (
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat transform-gpu"
            style={{ backgroundImage: `url('${slide.image}')` }}
          />
        )}
      </div>

      {/* Atmospheric High-Performance Dark Vignette Overlay (Zero Scroll Re-blur Cost) */}
      <div
        className="absolute inset-0 z-10 pointer-events-none transform-gpu"
        style={{
          background: 'radial-gradient(circle at 50% 40%, rgba(10,18,30,0.55) 0%, rgba(10,18,30,0.88) 65%, rgba(6,11,19,0.96) 100%)'
        }}
      />

      {/* Hardware-Accelerated Subtle CSS Ambient Particles (Compositor thread, 0 JS load) */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden select-none">
        <div className="absolute top-1/4 left-1/5 w-2 h-2 rounded-full bg-[#00E5FF]/35 blur-[1px] animate-[pulse_6s_ease-in-out_infinite]" />
        <div className="absolute top-2/3 right-1/4 w-2.5 h-2.5 rounded-full bg-teal-400/30 blur-[1px] animate-[pulse_8s_ease-in-out_infinite]" />
      </div>

      {/* Hero Content Container - Zero JS scroll loops, pure crisp 60fps layout */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-20 w-full max-w-5xl mx-auto px-5 sm:px-10 pt-28 pb-16 md:py-36 flex flex-col items-center text-center transform-gpu"
      >
        {/* Subtle Eyebrow Badge */}
        {settings.heroTopSub && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-5">
            <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span className="text-[11px] font-bold tracking-[0.2em] text-white/90 uppercase">
              {settings.heroTopSub}
            </span>
          </div>
        )}

        {/* Main Heading */}
        <h1 className="font-black text-white leading-[1.12] sm:leading-[1.06] tracking-tight drop-shadow-xl mb-5 sm:mb-6 max-w-4xl text-[2.5rem] sm:text-6xl md:text-7xl font-header">
          {renderTitle(slide.title)}
        </h1>

        {/* Subtitle */}
        <p className="text-white/80 font-normal leading-relaxed mb-8 sm:mb-10 max-w-2xl text-sm sm:text-lg md:text-xl drop-shadow-sm px-2">
          {slide.subtitle}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full max-w-xs sm:max-w-none">
          {slide.btn1Text && (
            <button
              onClick={() => handleButtonClick(slide.btn1Link)}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-[#00E5FF] hover:bg-[#26ebff] active:scale-[0.98] text-[#0a121e] font-black rounded-full border-none cursor-pointer transition-all shadow-[0_4px_25px_rgba(0,229,255,0.35)] px-6 py-3.5 sm:px-8 sm:py-4 text-sm sm:text-base"
            >
              <span>{slide.btn1Text}</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          )}
          {slide.btn2Text && (
            <button
              onClick={() => handleButtonClick(slide.btn2Link)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white font-semibold rounded-full border border-white/25 hover:border-white/50 cursor-pointer transition-all px-6 py-3.5 sm:px-8 sm:py-4 text-sm sm:text-base"
            >
              <span>{slide.btn2Text}</span>
            </button>
          )}
        </div>
      </motion.div>
    </section>
  );
}
