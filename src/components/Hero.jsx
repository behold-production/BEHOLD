import React from 'react';
import { ArrowRight, Compass, HeartPulse } from 'lucide-react';

export default function Hero({ setView, navigateToSection }) {
  const handleBookNowClick = () => {
    window.location.hash = '#/booking';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section
      id="home"
      className="relative w-full py-8 lg:py-24 px-4 sm:px-6 text-zinc-900 text-left grid-bg overflow-hidden flex flex-col items-center justify-center min-h-[60vh] lg:min-h-[90vh] select-none"
    >
      {/* Background Soft Glows */}
      <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-brand/20 rounded-full glow-glow pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-brand/10 rounded-full glow-glow pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">

        {/* Left Column: Heading and CTAs */}
        <div className="lg:col-span-6 space-y-5 fade-in-up text-center lg:text-left flex flex-col items-center lg:items-start">

          {/* Main Title */}
          <div className="space-y-6 mt-8 sm:mt-16">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-header font-black tracking-tight text-zinc-900 leading-[1.1] uppercase">
              Bridging You <br />
              To Your <span className="relative inline-block whitespace-nowrap">
                True Growth.
                <svg className="absolute left-0 -bottom-2 w-full h-[8px] text-brand pointer-events-none" viewBox="0 0 100 10" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 8C35 3 70 3 98 8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="text-zinc-600 font-sans text-sm md:text-base font-light max-w-lg leading-relaxed pb-4 sm:pb-8">
              Professional psychological counseling, aptitude assessment, and career mentorship designed to help individuals thrive with confidence and purpose.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3.5 sm:gap-4 pt-2 w-full">
            <button
              onClick={handleBookNowClick}
              className="px-8 py-4 bg-brand hover:bg-brand-dark hover:scale-[1.02] active:scale-[0.98] text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer rounded-lg shadow-md text-zinc-900 flex items-center justify-center gap-2 border border-zinc-900/5 w-full sm:w-auto"
            >
              <span>Book a Session</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateToSection('services')}
              className="px-8 py-4 bg-white/70 hover:bg-white border border-zinc-200 hover:border-zinc-900 text-zinc-900 hover:scale-[1.02] active:scale-[0.98] text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer rounded-lg shadow-sm w-full sm:w-auto text-center"
            >
              Explore Services
            </button>
          </div>

          {/* Highlighted Points to Read (Replaced old quick stats) */}
          <div className="flex flex-row flex-wrap items-center justify-center lg:justify-between gap-x-4 sm:gap-x-6 gap-y-2 sm:gap-y-3 pt-4 sm:pt-6 border-t border-zinc-200 w-full max-w-lg text-[11px] font-bold tracking-wider text-zinc-500">
            <span>Professional Support</span>
            <span>Online and offline</span>
            <span>Door step service</span>
          </div>

        </div>

        {/* Right Column: Cinematic Image with Floating Visuals */}
        <div className="flex lg:col-span-6 relative items-center justify-center fade-in-up group w-full px-2 sm:px-4 lg:px-0 mt-6 lg:mt-0" style={{ animationDelay: '0.2s' }}>

          {/* Main Visual Frame */}
          <div className="w-full aspect-[4/3] md:aspect-[16/11] rounded-lg overflow-hidden shadow-2xl border-4 border-white bg-black relative z-10">
            <img
              src="/children-learning.png"
              alt="Immersive mentoring storytelling visual"
              className="w-full h-full object-cover grayscale-15 contrast-105 group-hover:scale-103 transition-transform duration-700"
            />
            {/* Foreground image overlay */}
            <img
              src="/front.png"
              alt="Storytelling visual overlay"
              className="absolute inset-0 w-full h-full object-cover z-20 pointer-events-none"
            />
            {/* Black semi-transparent opacity overlay (now over the foreground image) */}
            <div className="absolute inset-0 bg-black/70 z-30 pointer-events-none" />
            {/* Visual Soft Dark Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none z-35" />
          </div>

          {/* Floating UI Card 1: Counselling */}
          <div className="absolute -top-6 -left-6 bg-white/90 backdrop-blur-md border border-zinc-100 p-4 rounded-lg shadow-xl hidden lg:flex items-center gap-3.5 max-w-[220px] z-20 pointer-events-none float-slow">
            <div className="w-9 h-9 rounded-lg bg-brand flex items-center justify-center text-zinc-900 shadow-inner">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-zinc-900">Personal Care</p>
              <p className="text-[9px] font-light text-zinc-500 mt-0.5">Emotional & stress guidance</p>
            </div>
          </div>

          {/* Floating UI Card 2: Career Mapping */}
          <div className="absolute -bottom-6 -right-6 bg-white/90 backdrop-blur-md border border-zinc-100 p-4 rounded-lg shadow-xl hidden lg:flex items-center gap-3.5 max-w-[220px] z-20 pointer-events-none float-fast">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 flex items-center justify-center text-white shadow-md">
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
