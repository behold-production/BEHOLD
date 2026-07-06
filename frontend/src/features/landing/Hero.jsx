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

  const defaultSlide = {
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2000&auto=format&fit=crop',
    title: settings.heroTitle || "Find {Clarity}\nin Life's Chaos",
    subtitle: settings.heroSub || "Professional psychological counseling, aptitude assessment, and career mentorship designed to help individuals thrive with confidence and purpose.",
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
            {parts[0]}<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5ee8d5] to-cyan-300">
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
      className="relative w-full min-h-[100svh] flex flex-col justify-center items-center overflow-hidden bg-[#0a1a24]"
    >
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full z-0">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url('${slide.image}')` }}
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#0a1a24]/95 via-[#0a1a24]/75 to-[#0a1a24]/30 pointer-events-none"></div>

      {/* Scroll Blur Overlay */}
      <div
        className="absolute inset-0 z-10 bg-[#0a1a24]/20 backdrop-blur-xl pointer-events-none"
        style={{ opacity: scrollOpacity }}
      ></div>

      {/* Content */}
      <div className="relative z-20 w-full max-w-[1440px] mx-auto px-6 sm:px-8 md:px-16 pt-28 sm:pt-32 md:pt-0 pb-20 flex justify-start">
        <div className="max-w-3xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {settings.heroTopSub && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-[10px] sm:text-xs tracking-[0.2em] text-cyan-300 font-bold mb-3 drop-shadow"
              >
                {settings.heroTopSub}
              </motion.p>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              className="text-5xl sm:text-5xl md:text-7xl font-extrabold text-white mb-4 leading-[1.1] tracking-tight drop-shadow-lg"
            >
              {renderTitle(slide.title)}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="text-sm sm:text-base md:text-xl text-white/90 mb-6 sm:mb-8 max-w-xl font-light leading-relaxed drop-shadow"
            >
              {slide.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
              className="flex flex-row flex-wrap gap-3 mt-2"
            >
              {slide.btn1Text && (
                <button
                  onClick={() => handleButtonClick(slide.btn1Link)}
                  className="inline-flex items-center justify-center bg-[#206173] hover:bg-[#23949c] text-white px-6 py-3 rounded-full font-bold text-sm transition-all shadow-lg shadow-[#206173]/30 hover:scale-[1.02] whitespace-nowrap border-none cursor-pointer"
                >
                  {slide.btn1Text}
                </button>
              )}
              {slide.btn2Text && (
                <button
                  onClick={() => handleButtonClick(slide.btn2Link)}
                  className="inline-flex items-center justify-center border border-white/60 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 px-6 py-3 rounded-full font-bold text-sm transition-colors whitespace-nowrap cursor-pointer"
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
