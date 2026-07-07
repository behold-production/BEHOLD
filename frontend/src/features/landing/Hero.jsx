import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Hero({ setView, navigateToSection, siteSettings }) {
  const [scrollOpacity, setScrollOpacity] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = window.innerHeight * 0.75;
      const opacity = Math.min(1, Math.max(0, scrollY / maxScroll));
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
    image: 'https://images.unsplash.com/photo-1440688807730-73e4e2169fb8?q=80&w=2070&auto=format&fit=crop',
    title: settings.heroTitle || "Bridging You\nTo Your {True}\n{Growth.}",
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
            {parts[0]}
            <span className="text-[#00E5FF] [text-shadow:0_0_40px_rgba(0,229,255,0.4)]">
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
      className="relative w-full flex flex-col overflow-hidden bg-[#0d1d2e]"
      style={{ minHeight: '100svh' }}
    >
      {/* Background Image or Video */}
      <div className="absolute inset-0 z-0">
        {slide.image && (slide.image.endsWith('.mp4') || slide.image.endsWith('.webm') || slide.image.endsWith('.ogg') || slide.image.includes('video') || slide.image.includes('mp4')) ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={slide.image} />
          </video>
        ) : (
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('${slide.image}')` }}
          />
        )}
      </div>

      {/* Unified dark overlay — heavier in center for text legibility */}
      <div className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(13,29,46,0.55) 0%, rgba(13,29,46,0.72) 40%, rgba(13,29,46,0.72) 60%, rgba(13,29,46,0.55) 100%)'
        }}
      />

      {/* Scroll blur overlay */}
      <div
        className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-300"
        style={{ opacity: scrollOpacity * 0.7, background: 'rgba(13,29,46,0.5)', backdropFilter: scrollOpacity > 0.1 ? `blur(${scrollOpacity * 12}px)` : 'none' }}
      />

      {/* Content — mobile: centered, desktop: bottom-left */}
      <div className="relative z-20 flex-1 flex flex-col justify-center items-center md:justify-end md:items-start w-full px-5 sm:px-8 md:px-16 pt-24 pb-10 md:pt-0 md:pb-16 lg:pb-20">
        <div className="w-full max-w-2xl flex flex-col items-center text-center md:items-start md:text-left">

          {/* Eyebrow label */}
          {settings.heroTopSub && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-[11px] font-bold tracking-[0.22em] text-[#00E5FF] mb-5 drop-shadow"
            >
              {settings.heroTopSub}
            </motion.p>
          )}

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.05 }}
            className="font-extrabold text-white leading-[1.08] tracking-tight drop-shadow-lg mb-5 w-full text-[3.2rem] sm:text-6xl md:text-6xl lg:text-7xl"
          >
            {renderTitle(slide.title)}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
            className="text-white/80 font-normal leading-relaxed mb-8 w-full max-w-md md:max-w-xl text-base"
          >
            {slide.subtitle}
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.25 }}
            className="flex flex-col gap-3 w-full md:flex-row md:w-auto"
          >
            {slide.btn1Text && (
              <button
                onClick={() => handleButtonClick(slide.btn1Link)}
                className="w-full md:w-auto flex items-center justify-center bg-[#00E5FF] hover:bg-[#00d4eb] active:scale-[0.97] text-[#0d1d2e] font-bold rounded-full border-none cursor-pointer transition-all shadow-[0_4px_28px_rgba(0,229,255,0.4)] hover:shadow-[0_6px_36px_rgba(0,229,255,0.55)]"
                style={{ fontSize: 'clamp(0.9rem, 2.2vw, 1rem)', padding: '1rem 2rem', minHeight: '56px' }}
              >
                {slide.btn1Text}
              </button>
            )}
            {slide.btn2Text && (
              <button
                onClick={() => handleButtonClick(slide.btn2Link)}
                className="w-full md:w-auto flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-[0.97] text-white font-semibold rounded-full border border-white/20 hover:border-white/40 cursor-pointer transition-all backdrop-blur-sm"
                style={{ fontSize: 'clamp(0.9rem, 2.2vw, 1rem)', padding: '1rem 2rem', minHeight: '56px' }}
              >
                {slide.btn2Text}
              </button>
            )}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
