import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';


export default function Hero({ setView, navigateToSection, siteSettings }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef(null);

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

  // Support multiple slides if configured via admin
  const slides =
    settings.heroSlides && settings.heroSlides.length > 0
      ? settings.heroSlides
      : [defaultSlide];

  const slide = slides[currentSlide] || defaultSlide;

  // Auto-advance carousel (only if multiple slides)
  useEffect(() => {
    if (slides.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(intervalRef.current);
  }, [slides.length]);

  // Render title with {highlighted text} syntax -> neon blue glow + underline
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
            <span className="relative inline-block text-[#00E5FF] font-black [text-shadow:0_0_40px_rgba(0,229,255,0.6),0_0_80px_rgba(0,229,255,0.25)] pb-1 sm:pb-2">
              {mainText}
              {endsWithDot && (
                <span className="text-[#00E5FF] [text-shadow:0_0_20px_#00E5FF,0_0_50px_#00E5FF] inline-block font-black">.</span>
              )}
              {/* Glowing neon curved SVG underline */}
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
                  className="drop-shadow-[0_0_14px_#00E5FF]"
                />
                <path
                  d="M20 16C90 9 185 10 300 15"
                  stroke="#79f2ff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeOpacity="0.75"
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
      className="relative w-full flex flex-col justify-between overflow-hidden bg-[#060b13]"
      style={{ minHeight: '100svh' }}
    >
      {/* ── BACKGROUND IMAGE CAROUSEL (smooth crossfade) ── */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
        {slides.map((s, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-[1400ms] ease-in-out"
            style={{ opacity: i === currentSlide ? 1 : 0 }}
          >
            {s.image && (s.image.endsWith('.mp4') || s.image.endsWith('.webm') || s.image.endsWith('.ogg') || s.image.includes('video')) ? (
              <video autoPlay loop muted playsInline className="w-full h-full object-cover scale-105">
                <source src={s.image} />
              </video>
            ) : (
              <div
                className="w-full h-full bg-cover bg-center bg-no-repeat transform-gpu scale-[1.04]"
                style={{ backgroundImage: `url('${s.image}')` }}
              />
            )}
          </div>
        ))}

        {/* Rich layered dark gradient overlay — keeps text perfectly legible */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(6,11,19,0.52) 0%, rgba(6,11,19,0.70) 50%, rgba(6,11,19,0.93) 100%)',
          }}
        />

        {/* Subtle neon ambient glow at center-bottom */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[280px] rounded-full opacity-18 blur-[90px] pointer-events-none z-10"
          style={{ background: 'radial-gradient(ellipse, #00E5FF 0%, transparent 70%)' }}
        />
      </div>

      {/* ── CSS AMBIENT PARTICLES (compositor thread, zero JS) ── */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden select-none">
        <div className="absolute top-[18%] left-[10%] w-1.5 h-1.5 rounded-full bg-[#00E5FF]/45 blur-[0.5px] animate-[pulse_5s_ease-in-out_infinite]" />
        <div className="absolute top-[64%] right-[16%] w-2 h-2 rounded-full bg-[#00E5FF]/28 blur-[1px] animate-[pulse_8s_ease-in-out_infinite_1.5s]" />
        <div className="absolute top-[38%] right-[7%] w-1 h-1 rounded-full bg-white/55 animate-[pulse_7s_ease-in-out_infinite_0.8s]" />
        <div className="absolute bottom-[30%] left-[5%] w-1.5 h-1.5 rounded-full bg-[#00E5FF]/35 animate-[pulse_6s_ease-in-out_infinite_2s]" />
      </div>

      {/* ── MAIN HERO CONTENT (vertically centered, auto grows) ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 w-full max-w-5xl mx-auto px-5 sm:px-10 text-center flex flex-col items-center my-auto pt-28 pb-16 md:pt-36 md:pb-20 transform-gpu"
      >
        {/* Main H1 Heading */}
        <h1 className="font-black text-white leading-[1.1] sm:leading-[1.06] tracking-tight drop-shadow-2xl mb-5 sm:mb-6 max-w-4xl text-[2.55rem] sm:text-[3.6rem] md:text-[4.5rem] lg:text-[5rem] font-header">
          {renderTitle(slide.title)}
        </h1>

        {/* Subtitle paragraph */}
        <p className="text-white/72 font-normal leading-relaxed mb-9 sm:mb-11 max-w-2xl text-sm sm:text-lg md:text-xl drop-shadow-sm px-2">
          {slide.subtitle}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full max-w-xs sm:max-w-none">
          {slide.btn1Text && (
            <button
              onClick={() => handleButtonClick(slide.btn1Link)}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-[#00E5FF] hover:bg-[#1aebff] active:scale-[0.97] text-[#060b13] font-black rounded-full border-none cursor-pointer transition-all duration-300 shadow-[0_4px_28px_rgba(0,229,255,0.42)] hover:shadow-[0_6px_38px_rgba(0,229,255,0.62)] px-7 py-3.5 sm:px-9 sm:py-4 text-sm sm:text-base"
            >
              <span>{slide.btn1Text}</span>
            </button>
          )}
          {slide.btn2Text && (
            <button
              onClick={() => handleButtonClick(slide.btn2Link)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/8 hover:bg-white/15 active:scale-[0.97] text-white font-semibold rounded-full border border-white/22 hover:border-[#00E5FF]/55 cursor-pointer transition-all duration-300 hover:shadow-[0_0_22px_rgba(0,229,255,0.18)] px-7 py-3.5 sm:px-9 sm:py-4 text-sm sm:text-base"
            >
              <span>{slide.btn2Text}</span>
            </button>
          )}
        </div>

        {/* Slide dots — only when multiple slides are configured */}
        {slides.length > 1 && (
          <div className="flex items-center gap-2 mt-9">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`rounded-full transition-all duration-500 cursor-pointer border-none outline-none ${
                  i === currentSlide
                    ? 'w-6 h-2 bg-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.7)]'
                    : 'w-2 h-2 bg-white/28 hover:bg-white/55'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* ── SCROLL DOWN INDICATOR (pinned to bottom of full-screen) ── */}
      <div className="relative z-20 text-center pb-8 sm:pb-10">
        <button
          onClick={() => navigateToSection('services')}
          className="inline-flex flex-col items-center gap-2.5 text-xs sm:text-sm text-white/45 hover:text-[#00E5FF] transition-colors duration-300 tracking-[0.18em] font-normal cursor-pointer border-none bg-transparent outline-none group"
        >
          <span className="w-7 h-10 rounded-full border-2 border-white/28 group-hover:border-[#00E5FF]/65 flex justify-center pt-1.5 transition-colors duration-300">
            <span className="w-1.5 h-2.5 bg-white/55 group-hover:bg-[#00E5FF] rounded-full animate-bounce transition-colors duration-300" />
          </span>
          <span className="uppercase">Scroll Down</span>
        </button>
      </div>
    </section>
  );
}
