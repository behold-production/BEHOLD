import React from 'react';
import { motion } from 'framer-motion';
import HeroBackgroundElements from './HeroBackgroundElements';

export default function Hero({ setView, navigateToSection, siteSettings }) {
  const handleBookNowClick = () => {
    window.spaNavigate('/booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const settings = siteSettings || {};
  // Updated to match the specific 3-line layout from the reference design
  const rawTitle = settings.heroTitle || "Bridging You\nTo Your {True}\n{Growth.}";
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
          className="text-[clamp(2.5rem,7vw,5.5rem)] leading-[1.1] sm:leading-[1.05] font-black text-white tracking-tight drop-shadow-lg px-4 sm:px-0 text-balance"
        >
          {renderTitle(rawTitle)}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          className="text-[clamp(1rem,2vw,1.25rem)] text-zinc-300 max-w-3xl font-medium leading-relaxed mt-4 sm:mt-6 px-4 sm:px-0 text-balance"
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
          {(settings.enablePsychology !== false || settings.enableCareerMentoring !== false) && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBookNowClick}
              className="px-8 sm:px-10 py-3.5 sm:py-4 min-h-[50px] bg-brand text-zinc-950 hover:bg-brand-dark text-xs sm:text-sm font-black tracking-widest uppercase border-neon-glow border-neon-glow-hover w-full sm:w-auto transition-all cursor-pointer rounded-[10px]"
            >
              Book a Session
            </motion.button>
          )}
          {settings.enableAptitude !== false && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigateToSection('cdat')}
              className="px-8 sm:px-10 py-3.5 sm:py-4 min-h-[50px] bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-black tracking-widest uppercase backdrop-blur-md border-neon-glow border-neon-glow-hover transition-all w-full sm:w-auto cursor-pointer rounded-[10px]"
            >
              Explore Aptitude
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* Decorative Layered Waves Divider */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-10 translate-y-[1px] pointer-events-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          className="w-full h-[80px] sm:h-[120px] md:h-[180px]"
        >
          {/* Back translucent wave */}
          <path
            fill="var(--color-surface-50, #ffffff)"
            fillOpacity="0.05"
            d="M0,140 C320,140 420,240 720,240 C1020,240 1120,140 1440,140 L1440,320 L0,320 Z"
          ></path>
          {/* Middle translucent wave */}
          <path
            fill="var(--color-surface-50, #ffffff)"
            fillOpacity="0.1"
            d="M0,180 C320,180 420,280 720,280 C1020,280 1120,180 1440,180 L1440,320 L0,320 Z"
          ></path>
          {/* Front solid wave (with softer center bulge) */}
          <path
            fill="var(--color-surface-50, #ffffff)"
            d="M0,260 C320,300 420,180 720,180 C1020,180 1120,300 1440,260 L1440,320 L0,320 Z"
          ></path>
        </svg>
      </div>

    </section>
  );
}
