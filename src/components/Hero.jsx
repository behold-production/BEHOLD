import React from 'react';
import { ArrowRight, Sparkles, Compass, ShieldCheck, HeartPulse, CheckCircle2 } from 'lucide-react';

export default function Hero({ setView, navigateToSection }) {
  const handleBookNowClick = () => {
    window.location.hash = '#/booking';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section
      id="home"
      className="relative w-full py-10 lg:py-24 px-4 sm:px-6 text-black text-left grid-bg overflow-hidden flex flex-col items-center justify-center min-h-[60vh] lg:min-h-[90vh] select-none"
    >
      {/* Background Soft Glows */}
      <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-brand/20 rounded-full glow-glow pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-brand/10 rounded-full glow-glow pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">

        {/* Left Column: Heading and CTAs */}
        <div className="lg:col-span-6 space-y-6 fade-in-up text-center lg:text-left flex flex-col items-center lg:items-start">



          {/* Main Title */}
          <div className="space-y-8 mt-16">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-header font-black tracking-tight text-black leading-[1.05] uppercase">
              The <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-dark to-brand">Right Guidance</span>, <br />
              When You <span className="relative inline-block whitespace-nowrap">
                Need It Most.
                <svg className="absolute left-0 -bottom-2 w-full h-[8px] text-brand pointer-events-none" viewBox="0 0 100 10" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 8C35 3 70 3 98 8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="text-black/60 font-sans text-xs sm:text-sm md:text-base font-light max-w-lg leading-relaxed pb-8">
              Guidance, counselling, and mentorship for life’s important decisions — helping individuals move forward with clarity and confidence.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-4 pt-2 w-full">
            <button
              onClick={handleBookNowClick}
              className="px-8 py-4 bg-brand hover:bg-brand-dark hover:scale-[1.02] active:scale-[0.98] text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer rounded-[4px] shadow-md text-black flex items-center justify-center gap-2 border border-black/5 w-full sm:w-auto"
            >
              <span>Book a Session</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateToSection('services')}
              className="px-8 py-4 bg-white/70 hover:bg-white border border-black/10 hover:border-black text-black hover:scale-[1.02] active:scale-[0.98] text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer rounded-[4px] shadow-xs w-full sm:w-auto text-center"
            >
              Explore Services
            </button>
          </div>

          {/* Highlighted Points to Read (Replaced old quick stats) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-6 border-t border-black/[0.05] w-full text-[10px] font-bold uppercase tracking-wider text-black/60">
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Behold Lifetime Mentoring</span>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Online & Offline</span>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>School & Doorstep Service</span>
            </div>
          </div>

        </div>

        {/* Right Column: Cinematic Image with Floating Visuals */}
        <div className="hidden lg:flex lg:col-span-6 relative items-center justify-center fade-in-up group" style={{ animationDelay: '0.2s' }}>

          {/* Main Visual Frame */}
          <div className="w-full aspect-[4/3] md:aspect-[16/11] rounded-[4px] overflow-hidden shadow-2xl border-4 border-white bg-white relative z-10">
            <img
              src="/children-learning.png"
              alt="Immersive mentoring storytelling visual"
              className="w-full h-full object-cover grayscale-15 contrast-105 group-hover:scale-103 transition-transform duration-700"
            />
            {/* Visual Soft Dark Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

            {/* Overlay Text Box Labels */}
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md border border-black/10 px-4 py-2 rounded-[4px] shadow-lg z-20 pointer-events-none">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-black">
                Therapy | Career Counselling | CDAT
              </span>
            </div>
          </div>

          {/* Floating UI Card 1: Counselling */}
          <div className="absolute -top-6 -left-6 bg-white/95 backdrop-blur-md border border-black/[0.04] p-4 rounded-[4px] shadow-xl hidden lg:flex items-center gap-3.5 max-w-[220px] z-20 pointer-events-none float-slow">
            <div className="w-9 h-9 rounded-[4px] bg-brand flex items-center justify-center text-black shadow-inner">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-black">Personal Care</p>
              <p className="text-[9px] font-light text-black/55 mt-0.5">Emotional & stress guidance</p>
            </div>
          </div>

          {/* Floating UI Card 2: Career Mapping */}
          <div className="absolute -bottom-6 -right-6 bg-white/95 backdrop-blur-md border border-black/[0.04] p-4 rounded-[4px] shadow-xl hidden lg:flex items-center gap-3.5 max-w-[220px] z-20 pointer-events-none float-fast">
            <div className="w-9 h-9 rounded-[4px] bg-black flex items-center justify-center text-white shadow-md">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-black">Scientific CDAT</p>
              <p className="text-[9px] font-light text-black/55 mt-0.5">Custom stream roadmaps</p>
            </div>
          </div>

          {/* Floating UI Card 3: Trust Badge */}
          <div className="absolute top-1/2 -right-8 transform -translate-y-1/2 bg-white/95 backdrop-blur-md border border-black/[0.04] px-4 py-2.5 rounded-[4px] shadow-lg hidden lg:flex items-center gap-2 z-20 pointer-events-none float-slow">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-[9px] font-black uppercase tracking-wider text-black">RCI Certified Mentors</span>
          </div>

        </div>

      </div>
    </section>
  );
}
