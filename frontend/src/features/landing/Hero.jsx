import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Hero({ setView, navigateToSection, siteSettings }) {
  const [scrollOpacity, setScrollOpacity] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = window.innerHeight * 0.75; 
      let opacity = scrollY / maxScroll;
      if (opacity > 1) opacity = 1;
      if (opacity < 0) opacity = 0;
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

  // Default fallback if no slides are configured in admin
  const defaultSlide = {
    image: 'https://images.unsplash.com/photo-1440688807730-73e4e2169fb8?q=80&w=2070&auto=format&fit=crop',
    title: settings.heroTitle || "Bridging You\nTo Your {True}\n{Growth.}",
    subtitle: settings.heroSub || "Professional psychological counseling, aptitude assessment, and career mentorship designed to help individuals thrive with confidence and purpose.",
    btn1Text: 'Book a Session',
    btn1Link: '/booking',
    btn2Text: 'Explore Aptitude',
    btn2Link: '/aptitude-test'
  };

  // Use the first configured slide (admin can change this) or default
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
            {parts[0]}<span className="text-brand [text-shadow:0_0_20px_var(--color-brand)]">
              {match[1]}
            </span>{parts[1]}
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
      className="relative w-full min-h-[100svh] flex flex-col justify-center items-start overflow-hidden bg-slate-900"
    >
      {/* Static Background Image */}
      <div className="absolute inset-0 w-full h-full z-0">
        <div
          className="w-full h-full bg-cover bg-center bg-fixed"
          style={{ backgroundImage: `url('${slide.image}')` }}
        />
      </div>

      {/* Dark Overlay Gradient */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 z-10 bg-black/30 pointer-events-none"></div>

      {/* Frosted Glass Scroll Effect Overlay */}
      <div 
        className="absolute inset-0 z-10 bg-slate-900/20 backdrop-blur-xl pointer-events-none" 
        style={{ opacity: scrollOpacity }}
      ></div>

      {/* Content */}
      <div className="relative z-20 w-full max-w-[1440px] mx-auto px-6 md:px-12 pt-32 pb-32 md:pb-24 flex justify-center text-center">
        <div className="max-w-3xl flex flex-col justify-center items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full flex flex-col justify-center items-center"
          >
            {settings.heroTopSub && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-brand font-bold text-sm tracking-widest uppercase mb-4"
              >
                {settings.heroTopSub}
              </motion.p>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              className="text-[2.75rem] leading-[1.1] sm:text-5xl md:text-6xl lg:text-[4.5rem] lg:leading-[1.05] tracking-tight font-bold text-white drop-shadow-lg mb-6 text-center w-full mx-auto"
            >
              {renderTitle(slide.title)}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl font-medium leading-relaxed mb-10 text-center"
            >
              {slide.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
            >
              {slide.btn1Text && (
                <button
                  onClick={() => handleButtonClick(slide.btn1Link)}
                  className="px-6 py-4 sm:py-5 bg-[#00E5FF] text-black font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center w-full sm:w-auto hover:bg-[#00cce6] hover:scale-105 active:scale-95 text-[15px] cursor-pointer shadow-[0_0_25px_rgba(0,229,255,0.5)] border-none"
                >
                  {slide.btn1Text}
                </button>
              )}
              {slide.btn2Text && (
                <button
                  onClick={() => handleButtonClick(slide.btn2Link)}
                  className="px-6 py-4 sm:py-5 bg-[#2C2E3E] text-white font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center border border-white/10 w-full sm:w-auto hover:bg-[#383a4c] hover:scale-105 active:scale-95 text-[15px] cursor-pointer shadow-lg"
                >
                  {slide.btn2Text}
                </button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
