import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Hero({ setView, navigateToSection, siteSettings }) {
  const [scrollOpacity, setScrollOpacity] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = window.innerHeight * 0.75;
      let opacity = Math.min(1, Math.max(0, scrollY / maxScroll));
      setScrollOpacity(opacity);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleButtonClick = (link) => {
    if (!link) return;
    if (link === '/booking') {
      window.spaNavigate?.('/booking');
    } else if (link === '/aptitude-test' || link === '/aptitude' || link === 'cdat') {
      navigateToSection('cdat');
    } else {
      window.spaNavigate?.(link);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const settings = siteSettings || {};

  const defaultSlide = {
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2000&auto=format&fit=crop',
    title: settings.heroTitle || "Find {Clarity}\nin Life's Chaos",
    subtitle: settings.heroSub || "Professional psychological counseling, aptitude assessment, and career mentorship designed to help individuals thrive.",
    btn1Text: 'Book a Session',
    btn1Link: '/booking',
    btn2Text: 'Explore Aptitude',
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
        content = (
          <React.Fragment key={`span-${index}`}>
            {parts[0]}
            <span className="text-[#00E5FF] [text-shadow:0_0_30px_rgba(0,229,255,0.5)]">
              {match[1]}
            </span>
            {parts[1]}
          </React.Fragment>
        );
      } else {
        content = line;
      }
      return (
        <React.Fragment key={index}>
          {index > 0 && <br />}
          {content}
        </React.Fragment>
      );
    });
  };

  return (
    <section
      id="home"
      className="relative w-full min-h-[100svh] flex flex-col overflow-hidden bg-[#0a1a24]"
    >
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full z-0">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${slide.image}')` }}
        />
      </div>

      {/* Mobile: bottom-to-top dark gradient so top of image is visible */}
      <div className="absolute inset-0 z-10 pointer-events-none md:hidden"
        style={{ background: 'linear-gradient(to top, rgba(10,26,36,0.97) 45%, rgba(10,26,36,0.6) 70%, rgba(10,26,36,0.25) 100%)' }}
      />

      {/* Desktop: left-to-right gradient */}
      <div className="absolute inset-0 z-10 pointer-events-none hidden md:block"
        style={{ background: 'linear-gradient(to right, rgba(10,26,36,0.96) 0%, rgba(10,26,36,0.80) 50%, rgba(10,26,36,0.25) 100%)' }}
      />

      {/* Scroll blur overlay */}
      <div
        className="absolute inset-0 z-10 backdrop-blur-xl pointer-events-none transition-opacity duration-300"
        style={{ opacity: scrollOpacity * 0.6, background: 'rgba(10,26,36,0.4)' }}
      />

      {/* Content — mobile: bottom-aligned; desktop: vertically centered */}
      <div className="relative z-20 flex-1 flex flex-col justify-end md:justify-center w-full max-w-[1440px] mx-auto px-6 sm:px-8 md:px-16 pb-16 pt-28 sm:pb-20 md:pb-0 md:pt-0">
        <div className="max-w-2xl w-full">

          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mb-4"
          >
            <span className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-bold tracking-[0.2em] text-[#00E5FF] drop-shadow">
              <span className="w-4 h-px bg-[#00E5FF] opacity-60" />
              {settings.heroTopSub || "Psychological Counseling & Mentorship"}
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
            className="text-[2.4rem] sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-4 leading-[1.08] tracking-tight drop-shadow-lg"
          >
            {renderTitle(slide.title)}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className="text-sm sm:text-base md:text-lg text-white/80 mb-8 max-w-md md:max-w-xl font-light leading-relaxed"
          >
            {slide.subtitle}
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
          >
            {slide.btn1Text && (
              <button
                onClick={() => handleButtonClick(slide.btn1Link)}
                className="flex items-center justify-center bg-[#00E5FF] hover:bg-[#00cce6] active:scale-95 text-[#0a1a24] font-bold text-sm sm:text-base px-7 py-3.5 sm:py-3 rounded-full transition-all shadow-[0_4px_24px_rgba(0,229,255,0.35)] hover:shadow-[0_6px_30px_rgba(0,229,255,0.5)] hover:scale-[1.02] whitespace-nowrap border-none cursor-pointer min-h-[52px] sm:min-h-0"
              >
                {slide.btn1Text}
              </button>
            )}
            {slide.btn2Text && (
              <button
                onClick={() => handleButtonClick(slide.btn2Link)}
                className="flex items-center justify-center border border-white/40 bg-white/10 backdrop-blur-md active:scale-95 text-white hover:bg-white/20 hover:border-white/60 font-semibold text-sm sm:text-base px-7 py-3.5 sm:py-3 rounded-full transition-all whitespace-nowrap cursor-pointer min-h-[52px] sm:min-h-0"
              >
                {slide.btn2Text}
              </button>
            )}
          </motion.div>

          {/* Mobile scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="mt-10 flex md:hidden items-center gap-2 text-white/30 text-xs"
          >
            <svg className="w-3 h-3 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            Scroll to explore
          </motion.div>

        </div>
      </div>
    </section>
  );
}
