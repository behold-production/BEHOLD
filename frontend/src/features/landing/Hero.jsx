import React from 'react';
import { motion } from 'framer-motion';
import HeroBackgroundElements from './HeroBackgroundElements';

export default function Hero({ setView, navigateToSection, siteSettings }) {
  const handleBookNowClick = () => {
    window.spaNavigate('/booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const settings = siteSettings || {};
  // Removed hardcoded newline to allow natural text flow on large screens
  const rawTitle = settings.heroTitle || "Bridging You To Your {True Growth.}";
  const heroSub = settings.heroSub || "Professional psychological counseling, aptitude assessment, and career mentorship designed to help individuals thrive with confidence and purpose.";

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
            {parts[0]}<span className="relative text-brand font-black drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
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
      className="relative w-full pt-32 pb-32 sm:pb-36 md:pb-40 lg:pt-36 lg:pb-48 px-4 sm:px-6 flex flex-col items-center justify-center min-h-[100svh] select-none bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden"
    >
      {/* Heavy 3D Background Elements & Particles */}
      <HeroBackgroundElements />

      <div className="max-w-4xl mx-auto w-full flex flex-col items-center justify-center text-center relative z-20 space-y-5 mt-0 lg:mt-0">

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          style={{ fontFamily: "'Poppins', 'Baloo Chettan 2', 'Manjari', 'Noto Sans Malayalam', sans-serif" }}
          className="text-[clamp(1.75rem,8vw,3rem)] leading-[1.25] sm:text-5xl md:text-6xl lg:text-[5rem] lg:leading-[1.1] font-black text-white tracking-tight drop-shadow-lg px-6 sm:px-0 text-pretty"
        >
          {renderTitle(rawTitle)}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          className="text-[clamp(0.875rem,4vw,1rem)] sm:text-base md:text-xl text-zinc-300 max-w-2xl font-medium leading-relaxed mt-4 sm:mt-5 px-6 sm:px-0 text-pretty"
        >
          {heroSub}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center gap-4 mt-8 w-full sm:w-auto px-4 sm:px-0"
        >
          {settings.enablePsychology !== false && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBookNowClick}
              className="px-8 sm:px-10 py-3.5 sm:py-4 min-h-[50px] bg-brand text-zinc-950 hover:bg-brand-dark text-xs sm:text-sm font-black tracking-widest uppercase border-neon-glow border-neon-glow-hover w-full sm:w-auto transition-all cursor-pointer rounded-[10px]"
            >
              Book a Session
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigateToSection('cdat')}
            className="px-8 sm:px-10 py-3.5 sm:py-4 min-h-[50px] bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-black tracking-widest uppercase backdrop-blur-md border-neon-glow border-neon-glow-hover transition-all w-full sm:w-auto cursor-pointer rounded-[10px]"
          >
            Explore Aptitude
          </motion.button>
        </motion.div>
      </div>



    </section>
  );
}
