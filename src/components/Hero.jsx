import React from 'react';
import { ArrowRight, Compass, HeartPulse } from 'lucide-react';

export default function Hero({ setView, navigateToSection, siteSettings }) {
  const handleBookNowClick = () => {
    window.spaNavigate('/booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load site settings dynamically
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
          <span className="relative inline-block whitespace-nowrap">
            <span className="text-gradient">{match[1]}</span>
            <svg className="absolute left-0 -bottom-2 w-full h-[8px] text-brand-accent pointer-events-none" viewBox="0 0 100 10" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      className="relative w-full py-10 lg:py-24 px-4 sm:px-6 text-zinc-900 grid-bg overflow-hidden flex flex-col items-center justify-center min-h-[calc(100vh-72px)] select-none"
    >
      {/* Background Soft Glows (Desktop only) */}
      <div className="hidden lg:block absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-brand/20 rounded-full glow-glow pointer-events-none" />
      <div className="hidden lg:block absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-brand-accent/15 rounded-full glow-glow pointer-events-none" />

      {/* Cinematic Background Image (Mobile only) */}
      <div className="absolute inset-0 block lg:hidden pointer-events-none z-0 bg-black">
        {/* Background children-learning image */}
        <img
          src="/children-learning.png"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover grayscale-15 contrast-105 opacity-30"
        />
        {/* Foreground image overlay */}
        <img
          src="/front.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        {/* Dark opacity overlay over the image on mobile */}
        <div className="absolute inset-0 bg-black/75 pointer-events-none" />
        {/* Bottom soft gradient on mobile */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
      </div>

      <div className="max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1680px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 2xl:gap-24 items-center relative z-10">

        {/* Left Column: Heading and CTAs */}
        <div className="lg:col-span-6 flex flex-col justify-between lg:justify-start min-h-0 lg:min-h-[485px] space-y-8 lg:space-y-6 fade-in-up text-center lg:text-left items-center lg:items-start w-full">

          {/* Main Title */}
          <div className="space-y-5 sm:space-y-6 flex-1 flex flex-col justify-center items-center lg:items-start mt-2 lg:mt-8">
            <h1 className="text-[2.8rem] leading-[1.1] sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-header font-black tracking-tight text-white lg:text-zinc-900 uppercase pb-0">
              {renderTitle(rawTitle)}
            </h1>
            <p className="text-zinc-200 lg:text-zinc-600 font-sans text-sm sm:text-base lg:text-base xl:text-lg 2xl:text-xl font-light max-w-lg xl:max-w-xl 2xl:max-w-2xl leading-relaxed pb-2 sm:pb-6">
              {heroSub}
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2 w-full mt-auto">
            <button
              type="button"
              onClick={handleBookNowClick}
              className="px-8 py-4 min-h-[52px] bg-brand hover:bg-brand-dark hover:scale-[1.02] active:scale-[0.98] text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer rounded-lg shadow-md text-zinc-900 flex items-center justify-center gap-2 border border-zinc-900/5 w-full sm:w-auto"
            >
              <span>Book a Session</span>
            </button>
            <button
              type="button"
              onClick={() => navigateToSection('services')}
              className="px-8 py-4 min-h-[52px] bg-white/10 hover:bg-white/20 border border-white/15 hover:border-white text-white lg:bg-white/70 lg:hover:bg-white lg:border-zinc-200 lg:hover:border-brand lg:text-zinc-900 lg:hover:text-brand hover:scale-[1.02] active:scale-[0.98] text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer rounded-lg shadow-sm w-full sm:w-auto text-center"
            >
              Explore Services
            </button>
          </div>

          {/* Highlighted Points to Read (Replaced old quick stats) */}
          <div className="flex flex-row flex-wrap items-center justify-center lg:justify-start gap-x-5 sm:gap-x-6 gap-y-2 sm:gap-y-3 pt-4 sm:pt-6 border-t border-white/10 lg:border-zinc-200 w-full max-w-lg text-[11px] font-bold tracking-wider text-zinc-400 lg:text-zinc-500">
            <span>Professional Support</span>
            <span>Online and offline</span>
            <span>Door step service</span>
          </div>

        </div>

        {/* Right Column: Cinematic Image with Floating Visuals */}
        <div className="hidden lg:flex lg:col-span-6 relative items-center justify-center fade-in-up group w-full px-2 sm:px-4 lg:px-0 mt-6 lg:mt-0" style={{ animationDelay: '0.2s' }}>

          {/* Main Visual Frame */}
          <div className="w-full aspect-[4/3] md:aspect-[16/11] xl:max-w-[640px] 2xl:max-w-[760px] rounded-lg overflow-hidden shadow-2xl border-4 border-white bg-black relative z-10">
            <img
              src="/children-learning.png"
              alt="Mentor guiding students through a learning session"
              className="w-full h-full object-cover grayscale-15 contrast-105 group-hover:scale-103 transition-transform duration-700"
            />
            {/* Foreground image overlay */}
            <img
              src="/front.png"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover z-20 pointer-events-none"
            />
            {/* Black semi-transparent opacity overlay (now over the foreground image) */}
            <div className="absolute inset-0 bg-black/75 lg:bg-black/20 z-30 pointer-events-none" />
            {/* Visual Soft Dark Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 lg:from-black/30 via-transparent to-transparent pointer-events-none z-35" />
          </div>

          {/* Floating UI Card 1: Counselling */}
          <div className="absolute -top-6 -left-6 bg-white/95 backdrop-blur-md border border-zinc-200/60 p-4 rounded-xl shadow-xl hidden lg:flex items-center gap-3.5 max-w-[220px] z-20 pointer-events-none float-slow">
            <div className="w-9 h-9 rounded-lg bg-brand flex items-center justify-center text-zinc-900 shadow-inner shrink-0">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-zinc-900">Personal Care</p>
              <p className="text-[9px] font-light text-zinc-500 mt-0.5">Emotional & stress guidance</p>
            </div>
          </div>

          {/* Floating UI Card 2: Career Mapping */}
          <div className="absolute -bottom-6 -right-6 bg-white/95 backdrop-blur-md border border-zinc-200/60 p-4 rounded-xl shadow-xl hidden lg:flex items-center gap-3.5 max-w-[220px] z-20 pointer-events-none float-fast">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 flex items-center justify-center text-white shadow-md shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-zinc-900">Scientific CDAT</p>
              <p className="text-[9px] font-light text-zinc-500 mt-0.5">Custom stream roadmaps</p>
            </div>
          </div>



        </div>

      </div>
    </section>
  );
}
