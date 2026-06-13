import React from 'react';
import { motion } from 'framer-motion';
import HeroBackgroundElements from './HeroBackgroundElements';

export default function Hero({ setView, navigateToSection, siteSettings }) {
  const handleBookNowClick = () => {
    window.spaNavigate('/booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const settings = siteSettings || {};
  const rawTitle = settings.heroTitle || "Bridging You \nTo Your {True Growth.}";
  const heroSub = settings.heroSub || "Professional psychological counseling, aptitude assessment, and career mentorship designed to help individuals thrive with confidence and purpose.";

  const renderTitle = (text) => {
    const match = text.match(/\{([^}]+)\}/);
    if (match) {
      const parts = text.split(match[0]);
      return (
        <span className="whitespace-pre-line">
          {parts[0]}
          <span className="relative inline-block text-brand">
            {match[1]}
            <svg className="absolute left-0 -bottom-2 w-full h-[8px] text-brand pointer-events-none" viewBox="0 0 100 10" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 8C35 3 70 3 98 8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </span>
          {parts[1]}
        </span>
      );
    }
    return <span className="whitespace-pre-line">{text}</span>;
  };

  return (
    <section
      id="home"
      className="relative w-full pt-20 pb-40 lg:pt-32 lg:pb-56 px-4 sm:px-6 flex flex-col items-center justify-center min-h-[calc(100vh-72px)] select-none bg-gradient-to-b from-slate-900 to-slate-800"
    >
      {/* Heavy 3D Background Elements & Particles */}
      <HeroBackgroundElements />

      <div className="max-w-4xl mx-auto w-full flex flex-col items-center justify-center text-center relative z-20 space-y-6 mt-8 lg:mt-4">

        {/* Top Highlight Label */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-block"
        >
          <span className="text-brand font-bold tracking-widest text-sm sm:text-base drop-shadow-sm uppercase">
            24×7 Professional Support
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-black text-white leading-[1.1] tracking-tight"
        >
          {renderTitle(rawTitle)}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          className="text-base sm:text-lg md:text-xl text-zinc-300 max-w-2xl font-medium leading-relaxed mt-6"
        >
          Professional psychological counseling, aptitude assessment, and career mentorship designed to help individuals thrive with confidence and purpose.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center gap-4 mt-10 w-full sm:w-auto"
        >
          {settings.enablePsychology !== false && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBookNowClick}
              className="px-10 py-4 min-h-[50px] bg-brand text-zinc-950 hover:bg-brand-dark text-xs sm:text-sm font-black tracking-widest uppercase rounded-full shadow-[0_8px_20px_rgba(0,209,209,0.3)] border border-transparent w-full sm:w-auto"
            >
              Book a Session
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigateToSection('services')}
            className="px-10 py-4 min-h-[50px] bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-black tracking-widest uppercase rounded-full backdrop-blur-md border border-white/20 transition-all w-full sm:w-auto"
          >
            Explore Services
          </motion.button>
        </motion.div>
      </div>

      {/* Beautiful Layered Waves to transition to the next section */}
      <div className="absolute -bottom-1 left-0 w-full leading-none z-10 pointer-events-none">
        <motion.svg
          initial={{ y: 50 }}
          animate={{ y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          viewBox="0 0 1440 320"
          className="w-full h-auto text-zinc-50 fill-current opacity-30"
          preserveAspectRatio="none"
        >
          <path d="M0,192L48,197.3C96,203,192,213,288,197.3C384,181,480,139,576,149.3C672,160,768,224,864,240C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </motion.svg>
        <motion.svg
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          viewBox="0 0 1440 320"
          className="absolute bottom-0 w-full h-auto text-zinc-50 fill-current translate-y-[2px]"
          preserveAspectRatio="none"
        >
          <path d="M0,256L60,250.7C120,245,240,235,360,213.3C480,192,600,160,720,170.7C840,181,960,235,1080,245.3C1200,256,1320,224,1380,208L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
        </motion.svg>
      </div>

    </section>
  );
}
