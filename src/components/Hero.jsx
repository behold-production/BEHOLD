import React from 'react';
import { ArrowRight, Sparkles, Compass, ShieldCheck, HeartPulse } from 'lucide-react';

export default function Hero({ setView, scrollToSection }) {
  const handleBookNowClick = () => {
    setView('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section
      className="relative w-full py-16 md:py-32 px-4 sm:px-6 text-black text-left grid-bg overflow-hidden flex flex-col items-center justify-center min-h-[90vh] select-none"
    >
      {/* Background Soft Glows */}
      <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-brand/20 rounded-full glow-glow pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-brand/10 rounded-full glow-glow pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">

        {/* Left Column: Heading and CTAs */}
        <div className="lg:col-span-6 space-y-8 fade-in-up">

          {/* Subtle Tagline */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-xs border border-black/[0.04] rounded-[4px] text-[10px] font-extrabold uppercase tracking-widest text-black/60 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-black" />
            <span>BEHOLD Mentorship Framework</span>
          </div>

          {/* Main Title */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-header font-black tracking-tight text-black leading-[1.05] uppercase">
              Guiding Students <br />
              Towards <span className="underline decoration-brand decoration-8 underline-offset-4">Clarity</span> & <span className="underline decoration-brand decoration-8 underline-offset-4">Confidence</span>
            </h1>
            <p className="text-black/60 font-sans text-sm md:text-base font-light max-w-lg leading-relaxed">
              Scientific career guidance, emotional support, and personalized doorstep mentorship for every student. Empowering adolescents to grow with direction.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2 w-full">
            <button
              onClick={handleBookNowClick}
              className="px-8 py-4 bg-brand hover:bg-brand-dark hover:scale-[1.02] active:scale-[0.98] text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer rounded-[4px] shadow-md text-black flex items-center justify-center gap-2 border border-black/5 w-full sm:w-auto"
            >
              <span>Book a Session</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollToSection('services')}
              className="px-8 py-4 bg-white/70 hover:bg-white border border-black/10 hover:border-black text-black hover:scale-[1.02] active:scale-[0.98] text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer rounded-[4px] shadow-xs w-full sm:w-auto text-center"
            >
              Explore Services
            </button>
          </div>

          {/* Stats quick view */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-8 border-t border-black/[0.05] max-w-md">
            <div>
              <p className="text-2xl font-black text-black">5k+</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-black/45">Guided</p>
            </div>
            <div className="border-x border-black/[0.05] px-3 sm:px-6">
              <p className="text-2xl font-black text-black">100+</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-black/45">Schools</p>
            </div>
            <div className="px-2">
              <p className="text-2xl font-black text-black">95%</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-black/45">Success</p>
            </div>
          </div>

        </div>

        {/* Right Column: Cinematic Image with Floating Visuals */}
        <div className="lg:col-span-6 relative flex items-center justify-center fade-in-up" style={{ animationDelay: '0.2s' }}>

          {/* Main Visual Frame */}
          <div className="w-full aspect-[4/3] md:aspect-[16/11] rounded-[4px] overflow-hidden shadow-2xl border-4 border-white bg-white relative z-10">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
              alt="Immersive mentoring storytelling visual"
              className="w-full h-full object-cover grayscale-15 contrast-105"
            />
            {/* Visual Soft Dark Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Floating UI Card 1: Counselling */}
          <div className="absolute -top-6 -left-6 bg-white/95 backdrop-blur-md border border-black/[0.04] p-4 rounded-[4px] shadow-xl hidden lg:flex items-center gap-3.5 max-w-[220px] z-20 pointer-events-none">
            <div className="w-9 h-9 rounded-[4px] bg-brand flex items-center justify-center text-black shadow-inner">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-black">Personal Care</p>
              <p className="text-[9px] font-light text-black/55 mt-0.5">Emotional & stress guidance</p>
            </div>
          </div>

          {/* Floating UI Card 2: Career Mapping */}
          <div className="absolute -bottom-6 -right-6 bg-white/95 backdrop-blur-md border border-black/[0.04] p-4 rounded-[4px] shadow-xl hidden lg:flex items-center gap-3.5 max-w-[220px] z-20 pointer-events-none">
            <div className="w-9 h-9 rounded-[4px] bg-black flex items-center justify-center text-white shadow-md">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-black">Scientific Cdac</p>
              <p className="text-[9px] font-light text-black/55 mt-0.5">Custom stream roadmaps</p>
            </div>
          </div>

          {/* Floating UI Card 3: Trust Badge */}
          <div className="absolute top-1/2 -right-8 transform -translate-y-1/2 bg-white/95 backdrop-blur-md border border-black/[0.04] px-4 py-2.5 rounded-[4px] shadow-lg hidden lg:flex items-center gap-2 z-20 pointer-events-none">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-[9px] font-black uppercase tracking-wider text-black">RCI Certified Mentors</span>
          </div>

        </div>

      </div>
    </section>
  );
}
